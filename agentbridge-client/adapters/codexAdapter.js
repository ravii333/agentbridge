import { execFile } from 'node:child_process';

function checkBinary(bin) {
  return new Promise((resolve, reject) => {
    execFile(bin, ['--version'], { shell: process.platform === 'win32' }, (error) => {
      if (error) {
        reject(new Error(`codex CLI not found or failed to run (${bin}): ${error.message}`));
        return;
      }
      resolve();
    });
  });
}

// Codex has no per-tool-call interactive approval like Claude Code's
// PreToolUse hook - `codex exec` isn't interactive at all. Its risk control
// is an upfront sandbox policy chosen for the whole invocation. This maps
// AgentBridge's permission-mode knob onto that, escalating in the same
// direction as Claude Code's modes (most cautious -> least):
//   default -> read-only, acceptEdits -> workspace-write,
//   bypassPermissions -> danger-full-access.
const SANDBOX_BY_PERMISSION_MODE = {
  default: 'read-only',
  acceptEdits: 'workspace-write',
  bypassPermissions: 'danger-full-access',
};

function buildSpawn({ bin, command, sessionId, model, permissionMode }) {
  const args = ['exec', '--json', '--skip-git-repo-check'];

  if (sessionId) {
    args.push('resume', sessionId);
  } else {
    args.push('--sandbox', SANDBOX_BY_PERMISSION_MODE[permissionMode] || 'read-only');
  }

  if (model) {
    args.push('--model', model);
  }

  args.push(command);

  return {
    cmd: bin,
    // codex exec takes the prompt as a positional arg (pushed above), not stdin.
    args,
    env: {},
    stdin: '',
  };
}

// Normalizes Codex's `codex exec --json` event stream (thread.started /
// turn.started / item.started / item.completed / turn.completed) into
// AgentBridge's canonical event kinds. Verified against a real Codex CLI
// (v0.149.0) run, including a resumed session and a failed shell command -
// not written from documentation alone.
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

  if (event.type === 'thread.started') {
    state.sessionId = event.thread_id || state.sessionId;
    return {
      events: [{ kind: 'run_started', data: { sessionId: state.sessionId } }],
      done: false,
    };
  }

  if (event.type === 'item.completed' && event.item?.type === 'agent_message') {
    return {
      events: [{ kind: 'text', data: { text: event.item.text } }],
      done: false,
    };
  }

  if (event.type === 'item.started' && event.item?.type === 'command_execution') {
    return {
      events: [{ kind: 'tool_use', data: { toolUseId: event.item.id, tool: 'shell', input: { command: event.item.command } } }],
      done: false,
    };
  }

  if (event.type === 'item.completed' && event.item?.type === 'command_execution') {
    const preview = (event.item.aggregated_output || '').slice(0, 2000);
    return {
      events: [{ kind: 'tool_result', data: { toolUseId: event.item.id, ok: event.item.exit_code === 0, preview } }],
      done: false,
    };
  }

  if (event.type === 'turn.completed') {
    return {
      events: [{
        kind: 'run_finished',
        // turn.completed carries token usage but no explicit success flag -
        // a failed shell command surfaces as a failed tool_result, not a
        // failed turn, so a completed turn is treated as ok.
        data: {
          ok: true,
          summary: undefined,
          numTurns: undefined,
          durationMs: undefined,
          costUsd: undefined,
          sessionId: state.sessionId,
        },
      }],
      done: true,
    };
  }

  // turn.started and any other/future item types are silently ignored
  // rather than guessed at.
  return { events: [], done: false };
}

// `codex exec` always prints this notice to stderr (verified: it appears on
// every invocation, prompt-as-arg or not), even though we close stdin
// immediately since the prompt is passed as a CLI arg, not piped in. Without
// filtering it, every successful run would surface a spurious 'error' log.
const BENIGN_STDERR = /^Reading additional input from stdin\.\.\.\s*$/;

function stripBenignStderr(text) {
  return text
    .split('\n')
    .filter((line) => !BENIGN_STDERR.test(line.trim()))
    .join('\n');
}

export default {
  id: 'codex',
  label: 'Codex CLI',
  defaultBin: 'codex',
  capabilities: { resume: 'flag', approval: 'policy', streaming: 'ndjson' },
  checkBinary,
  buildSpawn,
  parseLine,
  stripBenignStderr,
};
