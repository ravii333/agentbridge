import { config as loadEnv } from 'dotenv';
import os from 'node:os';

loadEnv();

const AGENT_CWD = process.env.AGENT_CWD || os.homedir();
const CLAUDE_BIN = process.env.CLAUDE_BIN || 'claude';
const AGENT_TOKEN = process.env.AGENT_TOKEN || '';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || '';
const MAX_QUEUE = Number(process.env.MAX_QUEUE || 10);
const PERMISSION_MODE = process.env.PERMISSION_MODE || 'default';
const HOOK_SERVER_PORT = Number(process.env.HOOK_SERVER_PORT || 8787);

export default {
  AGENT_CWD,
  CLAUDE_BIN,
  AGENT_TOKEN,
  BACKEND_URL,
  CLAUDE_MODEL,
  MAX_QUEUE,
  PERMISSION_MODE,
  HOOK_SERVER_PORT,
};
