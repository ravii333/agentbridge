import { Server } from 'socket.io';
import { randomUUID } from 'node:crypto';
import {
  setIo,
  setAgentSocket,
  getAgentSocket,
  saveLog,
  updateStatus,
  forwardCommand,
  forwardCancel,
  forwardApprovalResponse,
} from '../services/agentService.js';
import { isValidSocketToken } from '../utils/auth.js';
import { hashToken } from '../controllers/agentPairingController.js';
import Agent from '../models/agentModel.js';
import { info } from '../utils/logger.js';

async function resolvePairedAgent(token) {
  if (!token) return null;
  const agent = await Agent.findOne({ tokenHash: hashToken(token), status: 'claimed' });
  return agent;
}

let io;

function attach(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  setIo(io);

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;

    if (isValidSocketToken(token)) {
      return next();
    }

    try {
      const agent = await resolvePairedAgent(token);
      if (agent) {
        socket.data.agentId = agent._id.toString();
        socket.data.userId = agent.userId ? agent.userId.toString() : null;
        return next();
      }
    } catch (error) {
      return next(new Error('Unauthorized'));
    }

    next(new Error('Unauthorized'));
  });

  io.on('connection', (socket) => {
    info('Socket connected', { id: socket.id });

    socket.on('agent:ready', (agentInfo) => {
      setAgentSocket(socket);
      info('Agent client registered', agentInfo);
    });

    socket.on('frontend:ready', () => {
      info('Frontend client connected');
    });

    socket.on('agent:log', async (logEvent) => {
      await saveLog(logEvent);
      io.emit('agent:log', logEvent);
    });

    socket.on('agent:status', (status) => {
      updateStatus(status);
      io.emit('agent:status', status);
    });

    socket.on('agent:ack', (ack) => {
      io.emit('agent:ack', ack);
    });

    socket.on('frontend:command', (command) => {
      const runId = randomUUID();
      info('Frontend command received', { command, runId });
      forwardCommand(command, runId);
    });

    socket.on('frontend:cancel', ({ runId } = {}) => {
      forwardCancel(runId);
    });

    socket.on('frontend:workspace-browse', (payload, ack) => {
      const agentSocket = getAgentSocket();
      if (!agentSocket) {
        ack?.({ error: 'Agent not connected' });
        return;
      }
      agentSocket.emit('frontend:workspace-browse', payload, (result) => ack?.(result));
    });

    socket.on('frontend:workspace-set', (payload, ack) => {
      const agentSocket = getAgentSocket();
      if (!agentSocket) {
        ack?.({ error: 'Agent not connected' });
        return;
      }
      agentSocket.emit('frontend:workspace-set', payload, (result) => ack?.(result));
    });

    socket.on('agent:approval-request', (payload) => {
      io.emit('agent:approval-request', payload);
    });

    socket.on('frontend:approval-response', (payload) => {
      forwardApprovalResponse(payload);
    });

    socket.on('disconnect', (reason) => {
      info('Socket disconnected', { id: socket.id, reason });
    });
  });
}

export { attach };
