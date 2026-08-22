import claudeCode from './claudeCodeAdapter.js';
import codex from './codexAdapter.js';

// Each entry here is one CLI agentRunner.js knows how to drive. Adding
// support for another CLI (Codex, Cursor, ...) means writing a module with
// the same shape as claudeCodeAdapter.js - checkBinary, buildSpawn,
// parseLine, capabilities, and (if it supports one) writeApprovalSettings -
// and registering it below.
const ADAPTERS = {
  [claudeCode.id]: claudeCode,
  [codex.id]: codex,
};

function getAdapter(id) {
  const adapter = ADAPTERS[id || claudeCode.id];
  if (!adapter) {
    throw new Error(`Unknown agent adapter "${id}". Available: ${Object.keys(ADAPTERS).join(', ')}`);
  }
  return adapter;
}

export { getAdapter, ADAPTERS };
