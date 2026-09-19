import test from 'node:test';
import assert from 'node:assert/strict';
import codex from '../adapters/codexAdapter.js';

test('Codex starts a new sandboxed execution for each remote command', () => {
  const spawn = codex.buildSpawn({
    bin: 'codex',
    command: 'inspect this repository',
    sessionId: null,
    model: 'gpt-5-codex',
    permissionMode: 'acceptEdits',
  });

  assert.equal(spawn.cmd, 'codex');
  assert.deepEqual(spawn.args, [
    'exec', '--json', '--skip-git-repo-check', '--sandbox', 'workspace-write',
    '--model', 'gpt-5-codex', 'inspect this repository',
  ]);
  assert.equal(codex.capabilities.resume, 'none');
});

test('Codex JSON events are normalized for the mobile live feed', () => {
  const state = { sessionId: null };
  const started = codex.parseLine(JSON.stringify({ type: 'thread.started', thread_id: 'thread-1' }), state);
  assert.equal(state.sessionId, 'thread-1');
  assert.deepEqual(started.events[0], { kind: 'run_started', data: { sessionId: 'thread-1' } });

  const tool = codex.parseLine(JSON.stringify({
    type: 'item.completed',
    item: { type: 'command_execution', id: 'tool-1', exit_code: 0, aggregated_output: 'ok' },
  }), state);
  assert.deepEqual(tool.events[0], {
    kind: 'tool_result', data: { toolUseId: 'tool-1', ok: true, preview: 'ok' },
  });
});
