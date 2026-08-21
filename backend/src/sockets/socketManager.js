import { Server } from 'socket.io';
import { randomUUID } from 'node:crypto';
import {
  LEGACY_AGENT_ID,
  setIo,
  registerAgent,
  getAgentSocket,
  resolveAgentId,
  getStatus,
  saveLog,
  updateStatus,
  forwardCommand,
  forwardCancel,
  forwardApprovalResponse,
} from '../services/agentService.js';
import { isValidSocketToken } from '../utils/auth.js';
import { hashToken } from '../controllers/agentPairingController.js';
import { verify } from '../utils/jwt.js';
import Agent from '../models/agentModel.js';
import { info } from '../utils/logger.js';

let io;

async function resolvePairedAgent(token) {
  if (!token) return null;
  return Agent.findOne({ tokenHash: hashToken(token), status: 'claimed' });
}

async function authenticate(socket) {
  const { token, clientType } = socket.handshake.auth || {};

  if (clientType === 'agent') {
    if (isValidSocketToken(token)) {
      return { agentId: LEGACY_AGENT_ID, userId: null };
    }
    const agent = await resolvePairedAgent(token);
    if (agent) {
      return { agentId: agent._id.toString(), userId: agent.userId ? agent.userId.toString() : null };
    }
    return null;
  }

  // frontend/mobile client
  try {
    const payload = verify(token);
    return { agentId: null, userId: payload.sub };
  } catch {
    if (isValidSocketToken(token)) {
      return { agentId: null, userId: null };
    }
    return null;
  }
}

function attach(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  setIo(io);

  io.use((socket, next) => {
    authenticate(socket)
      .then((identity) => {
        if (!identity) return next(new Error('Unauthorized'));
        socket.data.agentId = identity.agentId;
        socket.data.userId = identity.userId;
        next();
      })
      .catch(() => next(new Error('Unauthorized')));
  });

  io.on('connection', (socket) => {
    const { agentId, userId } = socket.data;
    socket.join(userId ? `user:${userId}` : 'legacy');
    if (agentId) socket.join(`agent:${agentId}`);

    info('Socket connected', { id: socket.id, agentId, userId });

    socket.on('agent:ready', (agentInfo) => {
      if (!agentId) return;
      registerAgent({ agentId, userId, socket });
      info('Agent client registered', { agentId, userId, ...agentInfo });
    });

    socket.on('frontend:ready', () => {
      info('Frontend client connected', { userId });
    });

    socket.on('agent:log', async (logEvent) => {
      if (!agentId) return;
      await saveLog(agentId, userId, logEvent);
      io.to(userId ? `user:${userId}` : 'legacy').emit('agent:log', logEvent);
    });

    socket.on('agent:status', (status) => {
      if (!agentId) return;
      updateStatus(agentId, status);
    });

    socket.on('agent:ack', (ack) => {
      io.to(userId ? `user:${userId}` : 'legacy').emit('agent:ack', ack);
    });

    socket.on('frontend:command', (command) => {
      const runId = randomUUID();
      info('Frontend command received', { command, runId, userId });
      forwardCommand(userId, command, runId);
    });

    socket.on('frontend:cancel', ({ runId } = {}) => {
      forwardCancel(userId, runId);
    });

    socket.on('agent:sync', () => {
      const targetAgentId = resolveAgentId(userId);
      const agentSocket = targetAgentId && getAgentSocket(targetAgentId);
      if (agentSocket) {
        agentSocket.emit('agent:sync');
      } else {
        socket.emit('agent:status', getStatus(targetAgentId));
      }
    });

    socket.on('frontend:workspace-browse', (payload, ack) => {
      const targetAgentId = resolveAgentId(userId);
      const agentSocket = targetAgentId && getAgentSocket(targetAgentId);
      if (!agentSocket) {
        ack?.({ error: 'Agent not connected' });
        return;
      }
      agentSocket.emit('frontend:workspace-browse', payload, (result) => ack?.(result));
    });

    socket.on('frontend:workspace-set', (payload, ack) => {
      const targetAgentId = resolveAgentId(userId);
      const agentSocket = targetAgentId && getAgentSocket(targetAgentId);
      if (!agentSocket) {
        ack?.({ error: 'Agent not connected' });
        return;
      }
      agentSocket.emit('frontend:workspace-set', payload, (result) => ack?.(result));
    });

    socket.on('agent:approval-request', (payload) => {
      if (!agentId) return;
      io.to(userId ? `user:${userId}` : 'legacy').emit('agent:approval-request', payload);
    });

    socket.on('frontend:approval-response', (payload) => {
      forwardApprovalResponse(userId, payload);
    });

    socket.on('disconnect', (reason) => {
      info('Socket disconnected', { id: socket.id, reason });
    });
  });
}

export { attach };
