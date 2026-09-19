import test from 'node:test';
import assert from 'node:assert/strict';
import claudeCode from '../adapters/claudeCodeAdapter.js';

test('Claude stream events preserve text, tool calls, and final status', () => {
  const state = { sessionId: null };
  const text = claudeCode.parseLine(JSON.stringify({
    type: 'assistant', message: { content: [{ type: 'text', text: 'Working' }] },
  }), state);
  assert.deepEqual(text.events, [{ kind: 'text', data: { text: 'Working' } }]);

  const result = claudeCode.parseLine(JSON.stringify({
    type: 'result', session_id: 'session-1', is_error: false, result: 'Done', num_turns: 2,
    duration_ms: 10, total_cost_usd: 0.01,
  }), state);
  assert.equal(result.done, true);
  assert.equal(result.events[0].kind, 'run_finished');
  assert.equal(result.events[0].data.sessionId, 'session-1');
});
