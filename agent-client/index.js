import os from 'node:os';
import * as socketClient from './socketClient.js';
import * as agentRunner from './agentRunner.js';
import config from './config.js';

const agentId = `${os.hostname()}-${process.pid}`;

async function startAgentClient() {
  const socket = socketClient.connect();

  socket.on('connect', async () => {
    console.log('Connected to AgentBridge backend via socket');

    try {
      await agentRunner.start();
    } catch (error) {
      console.error('Agent runner failed to start:', error.message);
    }

    socket.emit('agent:ready', {
      agentId,
      cwd: config.AGENT_CWD,
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
