import { spawn, execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import config from './config.js';
import * as workspace from './workspace.js';
import * as approvalServer from './approvalServer.js';
import { getAdapter } from './adapters/index.js';

const adapter = getAdapter(config.AGENT_KIND);

let logCallback = () => {};
let statusCallback = () => {};

let sessionId = null;
let currentChild = null;
let currentRunId = null;
let seqCounter = 0;
let settingsPath = null;

const queue = [];
let draining = false;

let state = 'offline';
let lastError = null;

function onLog(callback) {
  logCallback = callback;
}

function onStatus(callback) {
  statusCallback = callback;
}

function emitLog(runId, kind, data) {
  logCallback({
    runId,
    seq: seqCounter++,
    ts: new Date().toISOString(),
    kind,
    data,
  });
}

function emitStatus() {
  statusCallback(getStatus());
}

function getStatus() {
  return {
    state,
    agentKind: adapter.id,
    approvalMode: adapter.capabilities.approval,
    sessionId,
    currentRunId,
    queueDepth: queue.length,
    cwd: workspace.getWorkspace(),
    model: config.CLAUDE_MODEL || undefined,
    lastError: lastError || undefined,
    updatedAt: new Date().toISOString(),
  };
}

function setState(next) {
  state = next;
  emitStatus();
}

async function start() {
  if (!existsSync(workspace.getWorkspace())) {
    lastError = { message: `Workspace does not exist: ${workspace.getWorkspace()}`, at: new Date().toISOString() };
    setState('error');
    throw new Error(lastError.message);
  }

  try {
    await adapter.checkBinary(config.CLAUDE_BIN);
  } catch (error) {
    lastError = { message: error.message, at: new Date().toISOString() };
    setState('error');
    throw error;
  }

  if (adapter.writeApprovalSettings && approvalServer.getPort()) {
    settingsPath = adapter.writeApprovalSettings(approvalServer.getPort(), approvalServer.getSecret());
  }

  lastError = null;
  setState('idle');
}

function sendCommand(command, meta = {}) {
  if (state === 'offline' || state === 'error') {
    return Promise.resolve({ accepted: false, runId: meta.runId || null, reason: 'not_ready' });
  }

  if (queue.length >= config.MAX_QUEUE) {
    return Promise.resolve({ accepted: false, runId: meta.runId || null, reason: 'queue_full' });
  }

  const runId = meta.runId || randomUUID();
  queue.push({ runId, command });
  emitStatus();
  drainQueue();

  return Promise.resolve({ accepted: true, runId });
}

function drainQueue() {
  if (draining || queue.length === 0 || state === 'running') {
    return;
  }

  draining = true;
  const job = queue.shift();
  runJob(job).finally(() => {
    draining = false;
    if (queue.length > 0) {
      drainQueue();
    }
  });
}

function runJob({ runId, command }) {
  return new Promise((resolve) => {
    currentRunId = runId;
    setState('running');

    const spawnSpec = adapter.buildSpawn({
      bin: config.CLAUDE_BIN,
      cwd: workspace.getWorkspace(),
      command,
      sessionId,
      model: config.CLAUDE_MODEL,
      permissionMode: config.PERMISSION_MODE,
      settingsPath,
    });

    // On Windows, spawn() needs shell:true to resolve .cmd-shimmed binaries
    // (npm-installed CLIs) - but shell:true just concatenates args with a
    // space, unquoted. Any arg containing a space (a prompt, a --settings
    // path under a "Users\Some Name" home dir, ...) would silently split
    // into multiple arguments. Quote everything ourselves and pass one
    // command string instead of relying on Node's raw concatenation.
    const useShell = process.platform === 'win32';
    const commandLine = useShell
      ? [spawnSpec.cmd, ...spawnSpec.args]
          .map((part) => (/[\s"]/.test(part) ? `"${part.replace(/"/g, '\\"')}"` : part))
          .join(' ')
      : spawnSpec.cmd;

    const child = spawn(commandLine, useShell ? [] : spawnSpec.args, {
      cwd: spawnSpec.cwd || workspace.getWorkspace(),
      shell: useShell,
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, ...(spawnSpec.env || {}) },
    });

    currentChild = child;

    let sawResult = false;
    let stdoutBuf = '';
    let stderrBuf = '';
    const parserState = { sessionId };

    child.stdout.on('data', (chunk) => {
      stdoutBuf += chunk.toString('utf8');
      let newlineIndex;
      while ((newlineIndex = stdoutBuf.indexOf('\n')) >= 0) {
        const line = stdoutBuf.slice(0, newlineIndex).replace(/\r$/, '').trim();
        stdoutBuf = stdoutBuf.slice(newlineIndex + 1);
        if (line) {
          const { events, done } = adapter.parseLine(line, parserState);
          for (const evt of events) {
            emitLog(runId, evt.kind, evt.data);
          }
          sawResult = sawResult || done;
        }
      }
    });

    child.stderr.on('data', (chunk) => {
      stderrBuf += chunk.toString('utf8');
    });

    child.on('error', (error) => {
      emitLog(runId, 'error', { message: error.message, fatal: true });
    });

    child.on('close', (code) => {
      sessionId = parserState.sessionId || sessionId;

      const meaningfulStderr = (adapter.stripBenignStderr ? adapter.stripBenignStderr(stderrBuf) : stderrBuf).trim();
      if (meaningfulStderr) {
        emitLog(runId, 'error', { message: meaningfulStderr, fatal: !sawResult });
      }

      if (!sawResult) {
        emitLog(runId, 'run_finished', {
          ok: false,
          summary: `Agent process exited with code ${code} before completing`,
          numTurns: 0,
          durationMs: null,
          costUsd: null,
          sessionId,
        });
      }

      currentChild = null;
      currentRunId = null;
      setState('idle');
      resolve();
    });

    child.stdin.write(spawnSpec.stdin ?? command);
    child.stdin.end();
  });
}

async function cancel(runId) {
  if (!currentChild || (runId && runId !== currentRunId)) {
    return false;
  }

  const pid = currentChild.pid;

  if (process.platform === 'win32') {
    await new Promise((resolve) => {
      execFile('taskkill', ['/pid', String(pid), '/T', '/F'], () => resolve());
    });
  } else {
    currentChild.kill('SIGKILL');
  }

  emitLog(currentRunId, 'notice', { message: 'Run cancelled by user' });
  return true;
}

async function shutdown() {
  queue.length = 0;
  if (currentChild) {
    await cancel(currentRunId);
  }
  setState('offline');
}

function resetSession() {
  sessionId = null;
  emitStatus();
}

export {
  start,
  sendCommand,
  cancel,
  getStatus,
  onLog,
  onStatus,
  shutdown,
  resetSession,
};
