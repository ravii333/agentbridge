import { execFile } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

function checkBinary(bin) {
  return new Promise((resolve, reject) => {
    execFile(bin, ['--version'], { shell: process.platform === 'win32' }, (error) => {
      if (error) {
        reject(new Error(`claude CLI not found or failed to run (${bin}): ${error.message}`));
        return;
      }
      resolve();
    });
  });
}

function buildSpawn({ bin, command, sessionId, model, permissionMode, settingsPath }) {
  const args = ['-p', '--output-format', 'stream-json', '--verbose', '--permission-mode', permissionMode];

  if (settingsPath) {
    args.push('--settings', settingsPath);
  }
  if (sessionId) {
    args.push('--resume', sessionId);
  }
  if (model) {
    args.push('--model', model);
  }

  return {
    cmd: bin,
    args,
    env: { FORCE_COLOR: '0' },
    stdin: command,
  };
}

// Parses one line of Claude Code's `--output-format stream-json` output into
// AgentBridge's canonical event kinds (text / tool_use / tool_result /
// run_started / run_finished / error). `state` is a per-run object the
// runner owns; adapters may read/write state.sessionId across calls.
function parseLine(line, state) {
  let event;
  try {
    event = JSON.parse(line);
  } catch {
    return {
      events: [{ kind: 'error', data: { message: `Failed to parse agent output: ${line.slice(0, 200)}`, fatal: false } }],
      done: false,
    };
  }

  if (event.type === 'system' && event.subtype === 'init') {
    state.sessionId = event.session_id || state.sessionId;
    return {
      events: [{ kind: 'run_started', data: { sessionId: state.sessionId, cwd: event.cwd, tools: event.tools, model: event.model } }],
      done: false,
    };
  }

  if (event.type === 'assistant' && event.message?.content) {
    const events = [];
    for (const block of event.message.content) {
      if (block.type === 'text') {
        events.push({ kind: 'text', data: { text: block.text } });
      } else if (block.type === 'tool_use') {
        events.push({ kind: 'tool_use', data: { toolUseId: block.id, tool: block.name, input: block.input } });
      }
    }
    return { events, done: false };
  }

  if (event.type === 'user' && event.message?.content) {
    const events = [];
    for (const block of event.message.content) {
      if (block.type === 'tool_result') {
        const preview = typeof block.content === 'string'
          ? block.content.slice(0, 2000)
          : JSON.stringify(block.content).slice(0, 2000);
        events.push({ kind: 'tool_result', data: { toolUseId: block.tool_use_id, ok: !block.is_error, preview } });
      }
    }
    return { events, done: false };
  }

  if (event.type === 'result') {
    state.sessionId = event.session_id || state.sessionId;
    return {
      events: [{
        kind: 'run_finished',
        data: {
          ok: !event.is_error,
          summary: event.result,
          numTurns: event.num_turns,
          durationMs: event.duration_ms,
          costUsd: event.total_cost_usd,
          sessionId: state.sessionId,
        },
      }],
      done: true,
    };
  }

  return { events: [], done: false };
}

// Claude Code approves tool use via a PreToolUse hook, wired up through a
// generated settings.json that points at AgentBridge's local approval
// server. Other CLIs authorize tool use differently (a sandbox/policy flag,
// a stdio protocol, ...) - each adapter owns translating its own mechanism
// into a call against that same local server.
function writeApprovalSettings(port, secret) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'agentbridge-'));
  const file = path.join(dir, 'settings.json');
  writeFileSync(
    file,
    JSON.stringify({
      hooks: {
        PreToolUse: [
          {
            hooks: [
              {
                type: 'http',
                url: `http://127.0.0.1:${port}/hooks/pre-tool-use`,
                headers: { 'x-hook-secret': secret },
                timeout: 180,
              },
            ],
          },
        ],
      },
    }),
  );
  return file;
}

export default {
  id: 'claude-code',
  label: 'Claude Code',
  defaultBin: 'claude',
  capabilities: { resume: 'flag', approval: 'hook', streaming: 'ndjson' },
  checkBinary,
  buildSpawn,
  parseLine,
  writeApprovalSettings,
};
