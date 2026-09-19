#!/usr/bin/env node
import os from 'node:os';
import * as socketClient from './socketClient.js';
import * as agentRunner from './agentRunner.js';
import * as workspace from './workspace.js';
import * as approvalServer from './approvalServer.js';
import * as pairing from './pairing.js';
import { getAdapter } from './adapters/index.js';
import config from './config.js';

const agentId = `${os.hostname()}-${process.pid}`;

async function startAgentClient() {
  const adapter = getAdapter(config.AGENT_KIND);
  const agentBin = config.CLAUDE_BIN || adapter.defaultBin;
  console.log(`Using ${adapter.label} (${agentBin})`);

  const { agentToken } = await pairing.getCredentials();
  const socket = socketClient.connect(agentToken);

  approvalServer.init({ socket, getCurrentRunId: () => agentRunner.getStatus().currentRunId });
  if (adapter.capabilities.approval === 'hook') {
    // Claude Code's per-tool approval depends entirely on this server: if it
    // fails to bind (e.g. HOOK_SERVER_PORT already in use), Claude Code would
    // otherwise launch with no PreToolUse hook configured at all and run
    // unguarded. Fail startup instead of degrading silently.
    await approvalServer.start();
  }

  socket.on('connect', async () => {
    console.log('Connected to AgentBridge backend via socket');

    // Register before start() emits its first status. Otherwise a quick
    // successful start is emitted while the server has no agent registration
    // and the mobile app only receives a generic status.
    socket.emit('agent:ready', {
      agentId,
      name: os.hostname(),
      cwd: workspace.getWorkspace(),
      agentKind: adapter.id,
      model: config.CLAUDE_MODEL || undefined,
    });

    try {
      await agentRunner.start();
    } catch (error) {
      console.error('Agent runner failed to start:', error.message);
    }

    socket.emit('agent:status', agentRunner.getStatus());
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection failed:', error.message);
  });

  socket.on('agent:command', async ({ runId, command }) => {
    console.log('Received command from backend:', command);
    const result = await agentRunner.sendCommand(command, { runId });
    socket.emit('agent:ack', result);
  });

  socket.on('agent:cancel', async ({ runId }) => {
    await agentRunner.cancel(runId);
  });

  socket.on('agent:sync', () => {
    socket.emit('agent:status', agentRunner.getStatus());
  });

  socket.on('frontend:workspace-browse', (payload, ack) => {
    try {
      ack(workspace.listDir(payload?.path));
    } catch (error) {
      ack({ error: error.message });
    }
  });

  socket.on('frontend:workspace-set', (payload, ack) => {
    try {
      const cwd = workspace.setWorkspace(payload?.path);
      agentRunner.resetSession();
      socket.emit('agent:status', agentRunner.getStatus());
      ack({ ok: true, cwd });
    } catch (error) {
      ack({ error: error.message });
    }
  });

  socket.on('agent:approval-response', (payload) => {
    approvalServer.handleApprovalResponse(payload);
  });

  agentRunner.onLog((event) => {
    socket.emit('agent:log', event);
  });

  agentRunner.onStatus((status) => {
    socket.emit('agent:status', status);
  });
}

startAgentClient().catch((error) => {
  console.error('Failed to start agentbridge:', error.message);
  process.exit(1);
});

async function shutdownAndExit() {
  await agentRunner.shutdown();
  process.exit(0);
}

process.on('SIGINT', shutdownAndExit);
process.on('SIGTERM', shutdownAndExit);
