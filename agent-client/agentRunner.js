import { spawn, execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import config from './config.js';

let logCallback = () => {};
let statusCallback = () => {};

let sessionId = null;
let currentChild = null;
let currentRunId = null;
let seqCounter = 0;

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
    sessionId,
    currentRunId,
    queueDepth: queue.length,
    cwd: config.AGENT_CWD,
    model: config.CLAUDE_MODEL || undefined,
    lastError: lastError || undefined,
    updatedAt: new Date().toISOString(),
  };
}

function setState(next) {
  state = next;
  emitStatus();
}

function checkClaudeBinary() {
  return new Promise((resolve, reject) => {
    execFile(config.CLAUDE_BIN, ['--version'], { shell: process.platform === 'win32' }, (error) => {
      if (error) {
        reject(new Error(`claude CLI not found or failed to run (${config.CLAUDE_BIN}): ${error.message}`));
        return;
      }
      resolve();
    });
  });
}

async function start() {
  if (!config.AGENT_CWD) {
    lastError = { message: 'AGENT_CWD is not set', at: new Date().toISOString() };
    setState('error');
    throw new Error('AGENT_CWD env var is required');
  }

  if (!existsSync(config.AGENT_CWD)) {
    lastError = { message: `AGENT_CWD does not exist: ${config.AGENT_CWD}`, at: new Date().toISOString() };
    setState('error');
    throw new Error(lastError.message);
  }

  try {
    await checkClaudeBinary();
  } catch (error) {
    lastError = { message: error.message, at: new Date().toISOString() };
    setState('error');
    throw error;
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

    const args = [
      '-p',
      '--output-format', 'stream-json',
      '--verbose',
      '--permission-mode', config.PERMISSION_MODE,
    ];

    if (sessionId) {
      args.push('--resume', sessionId);
    }

    if (config.CLAUDE_MODEL) {
      args.push('--model', config.CLAUDE_MODEL);
    }

    const child = spawn(config.CLAUDE_BIN, args, {
      cwd: config.AGENT_CWD,
      shell: process.platform === 'win32',
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '0' },
    });

    currentChild = child;

    let sawResult = false;
    let stdoutBuf = '';
    let stderrBuf = '';

    child.stdout.on('data', (chunk) => {
      stdoutBuf += chunk.toString('utf8');
      let newlineIndex;
      while ((newlineIndex = stdoutBuf.indexOf('\n')) >= 0) {
        const line = stdoutBuf.slice(0, newlineIndex).replace(/\r$/, '').trim();
        stdoutBuf = stdoutBuf.slice(newlineIndex + 1);
        if (line) {
          sawResult = handleStreamLine(runId, line) || sawResult;
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
      if (stderrBuf.trim()) {
        emitLog(runId, 'error', { message: stderrBuf.trim(), fatal: !sawResult });
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

    child.stdin.write(command);
    child.stdin.end();
  });
}

function handleStreamLine(runId, line) {
  let event;
  try {
    event = JSON.parse(line);
  } catch (error) {
    emitLog(runId, 'error', { message: `Failed to parse agent output: ${line.slice(0, 200)}`, fatal: false });
    return false;
  }

  if (event.type === 'system' && event.subtype === 'init') {
    sessionId = event.session_id || sessionId;
    emitLog(runId, 'run_started', {
      sessionId,
      cwd: event.cwd,
      tools: event.tools,
      model: event.model,
    });
    return false;
  }

  if (event.type === 'assistant' && event.message?.content) {
    for (const block of event.message.content) {
      if (block.type === 'text') {
        emitLog(runId, 'text', { text: block.text });
      } else if (block.type === 'tool_use') {
        emitLog(runId, 'tool_use', { toolUseId: block.id, tool: block.name, input: block.input });
      }
    }
    return false;
  }

  if (event.type === 'user' && event.message?.content) {
    for (const block of event.message.content) {
      if (block.type === 'tool_result') {
        const preview = typeof block.content === 'string'
          ? block.content.slice(0, 2000)
          : JSON.stringify(block.content).slice(0, 2000);
        emitLog(runId, 'tool_result', { toolUseId: block.tool_use_id, ok: !block.is_error, preview });
      }
    }
    return false;
  }

  if (event.type === 'result') {
    sessionId = event.session_id || sessionId;
    emitLog(runId, 'run_finished', {
      ok: !event.is_error,
      summary: event.result,
      numTurns: event.num_turns,
      durationMs: event.duration_ms,
      costUsd: event.total_cost_usd,
      sessionId,
    });
    return true;
  }

  return false;
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

export {
  start,
  sendCommand,
  cancel,
  getStatus,
  onLog,
  onStatus,
  shutdown,
};
