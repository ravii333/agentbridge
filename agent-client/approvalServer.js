import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import config from './config.js';

const APPROVAL_TIMEOUT_MS = 170_000;

const secret = randomUUID();
const pending = new Map();

let socket = null;
let server = null;
let settingsPath = null;
let getCurrentRunId = () => null;

function init({ socket: socketRef, getCurrentRunId: runIdGetter }) {
  socket = socketRef;
  getCurrentRunId = runIdGetter;
}

function handleApprovalResponse({ approvalId, approved, reason } = {}) {
  const entry = pending.get(approvalId);
  if (!entry) return;
  clearTimeout(entry.timer);
  pending.delete(approvalId);
  entry.resolve({ approved: !!approved, reason });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

async function handleRequest(req, res) {
  if (req.method !== 'POST' || req.url !== '/hooks/pre-tool-use') {
    res.writeHead(404).end();
    return;
  }

  if (req.headers['x-hook-secret'] !== secret) {
    res.writeHead(403).end();
    return;
  }

  let event;
  try {
    event = JSON.parse(await readBody(req));
  } catch {
    res.writeHead(400).end();
    return;
  }

  const approvalId = event.tool_use_id || randomUUID();

  const decision = await new Promise((resolve) => {
    const timer = setTimeout(() => {
      pending.delete(approvalId);
      resolve({ approved: false, reason: 'Timed out waiting for approval' });
    }, APPROVAL_TIMEOUT_MS);

    pending.set(approvalId, { resolve, timer });

    if (socket) {
      socket.emit('agent:approval-request', {
        runId: getCurrentRunId(),
        approvalId,
        tool: event.tool_name,
        input: event.tool_input,
      });
    } else {
      clearTimeout(timer);
      pending.delete(approvalId);
      resolve({ approved: false, reason: 'Agent is not connected to backend' });
    }
  });

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: decision.approved ? 'allow' : 'deny',
        permissionDecisionReason: decision.reason,
      },
    }),
  );
}

function writeSettingsFile(port) {
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

function start() {
  return new Promise((resolve, reject) => {
    server = http.createServer((req, res) => {
      handleRequest(req, res).catch(() => {
        res.writeHead(500).end();
      });
    });

    server.on('error', reject);

    server.listen(config.HOOK_SERVER_PORT, '127.0.0.1', () => {
      const { port } = server.address();
      settingsPath = writeSettingsFile(port);
      resolve({ port, settingsPath });
    });
  });
}

function getSettingsPath() {
  return settingsPath;
}

export { init, start, getSettingsPath, handleApprovalResponse };
