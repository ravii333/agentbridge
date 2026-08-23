import { config as loadEnv } from 'dotenv';
import os from 'node:os';

loadEnv();

const AGENT_CWD = process.env.AGENT_CWD || os.homedir();
// AGENT_KIND selects which adapter in ./adapters drives this agent (see
// adapters/index.js). CLAUDE_BIN/CLAUDE_MODEL are kept as the historical env
// var names since Claude Code is still the only adapter; AGENT_BIN/
// AGENT_MODEL are the generic aliases new adapters (and users running a
// non-Claude CLI) should use going forward.
const AGENT_KIND = process.env.AGENT_KIND || 'claude-code';
// No hardcoded fallback here - a bare "claude" default would be wrong for
// AGENT_KIND=codex. Falls through to the selected adapter's own defaultBin
// in agentRunner.js when unset.
const CLAUDE_BIN = process.env.AGENT_BIN || process.env.CLAUDE_BIN || '';
const AGENT_TOKEN = process.env.AGENT_TOKEN || '';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
const CLAUDE_MODEL = process.env.AGENT_MODEL || process.env.CLAUDE_MODEL || '';
const MAX_QUEUE = Number(process.env.MAX_QUEUE || 10);
const PERMISSION_MODE = process.env.PERMISSION_MODE || 'default';
const HOOK_SERVER_PORT = Number(process.env.HOOK_SERVER_PORT || 8787);

export default {
  AGENT_CWD,
  AGENT_KIND,
  CLAUDE_BIN,
  AGENT_TOKEN,
  BACKEND_URL,
  CLAUDE_MODEL,
  MAX_QUEUE,
  PERMISSION_MODE,
  HOOK_SERVER_PORT,
};
