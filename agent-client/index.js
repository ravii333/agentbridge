import os from 'node:os';
import * as socketClient from './socketClient.js';
import * as agentRunner from './agentRunner.js';
import * as workspace from './workspace.js';
import * as approvalServer from './approvalServer.js';
import config from './config.js';

const agentId = `${os.hostname()}-${process.pid}`;

async function startAgentClient() {
  const socket = socketClient.connect();

  approvalServer.init({ socket, getCurrentRunId: () => agentRunner.getStatus().currentRunId });
  try {
    await approvalServer.start();
  } catch (error) {
    console.error('Approval hook server failed to start:', error.message);
  }

  socket.on('connect', async () => {
    console.log('Connected to AgentBridge backend via socket');

    try {
      await agentRunner.start();
    } catch (error) {
      console.error('Agent runner failed to start:', error.message);
    }

    socket.emit('agent:ready', {
      agentId,
      cwd: workspace.getWorkspace(),
      model: config.CLAUDE_MODEL || undefined,
    });
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

startAgentClient();

process.on('SIGINT', async () => {
  await agentRunner.shutdown();
  process.exit(0);
});
