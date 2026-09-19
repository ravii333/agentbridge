import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/mongo-adapter';
import { randomUUID } from 'node:crypto';
import { getAdapterCollection } from '../config/db.js';
import {
  LEGACY_AGENT_ID,
  setIo,
  registerAgent,
  resolveAgentId,
  agentRoom,
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

// Keep the Socket.IO origin policy aligned with the HTTP API. Native mobile
// clients do not send/enforce a browser Origin, while browser clients are
// restricted once CORS_ORIGIN is configured for production.
const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : true;

// Mirrors the REST /api/agent/command limiter (30/min) for the socket path,
// which had no throttling at all - a leaked/compromised token could
// otherwise flood command execution on the paired PC with no limit.
const COMMAND_WINDOW_MS = 60 * 1000;
const COMMAND_LIMIT = 30;

function commandRateLimited(socket) {
  const now = Date.now();
  const windowStart = socket.data.commandWindowStart || now;
  if (now - windowStart > COMMAND_WINDOW_MS) {
    socket.data.commandWindowStart = now;
    socket.data.commandCount = 1;
    return false;
  }
  socket.data.commandCount = (socket.data.commandCount || 0) + 1;
  return socket.data.commandCount > COMMAND_LIMIT;
}

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

async function attach(server) {
  io = new Server(server, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
    },
  });

  // Falls back to socket.io's default in-process adapter when MONGO_URI
  // isn't a replica set (typical for local dev) - see getAdapterCollection.
  // With the fallback, forwardCommand/broadcast only reach sockets connected
  // to this same process, which is fine for a single instance but silently
  // wrong if you scale to more than one without also pointing MONGO_URI at
  // a replica set (see docker-compose.yml).
  const adapterCollection = await getAdapterCollection();
  if (adapterCollection) {
    io.adapter(createAdapter(adapterCollection));
  } else {
    console.warn(
      'Socket.IO mongo-adapter disabled: MONGO_URI is not a replica set. Broadcasts will only reach sockets on this process - fine for a single backend instance, but required (see docker-compose.yml) if you run more than one.'
    );
  }

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

    socket.on('agent:ready', async (agentInfo = {}) => {
      if (!agentId) return;
      await registerAgent({ agentId, userId, socket });
      if (agentId !== LEGACY_AGENT_ID) {
        const update = { lastSeenAt: new Date() };
        if (typeof agentInfo.name === 'string' && agentInfo.name.trim()) {
          update.name = agentInfo.name.trim().slice(0, 100);
        }
        if (typeof agentInfo.agentKind === 'string') {
          update.kind = agentInfo.agentKind;
        }
        Agent.updateOne({ _id: agentId }, update).catch(() => {});
      }
      info('Agent client registered', { agentId, userId, ...agentInfo });
    });

    // Mobile can have several agents paired; this picks which one the
    // socket's subsequent commands/approvals/workspace actions target.
    socket.on('frontend:select-agent', async (targetId, ack) => {
      if (!userId || !targetId) {
        ack?.({ error: 'Invalid agent' });
        return;
      }
      const owned = await Agent.findOne({ _id: targetId, userId, status: 'claimed' }).lean();
      if (!owned) {
        ack?.({ error: 'Agent not found' });
        return;
      }
      socket.data.activeAgentId = targetId;
      socket.emit('agent:status', await getStatus(targetId));
      ack?.({ ok: true });
    });

    socket.on('frontend:ready', () => {
      info('Frontend client connected', { userId });
    });

    socket.on('agent:log', async (logEvent) => {
      if (!agentId) return;
      await saveLog(agentId, userId, logEvent);
      io.to(userId ? `user:${userId}` : 'legacy').emit('agent:log', { ...logEvent, agentId });
    });

    socket.on('agent:status', async (status) => {
      if (!agentId) return;
      const previous = await getStatus(agentId);
      await updateStatus(agentId, status);
      if (status.agentKind && status.agentKind !== previous?.agentKind && agentId !== LEGACY_AGENT_ID) {
        Agent.updateOne({ _id: agentId }, { kind: status.agentKind }).catch(() => {});
      }
    });

    socket.on('agent:ack', (ack) => {
      io.to(userId ? `user:${userId}` : 'legacy').emit('agent:ack', { ...ack, agentId });
    });

    socket.on('frontend:command', (command) => {
      if (commandRateLimited(socket)) {
        socket.emit('agent:ack', { error: 'Too many commands, please slow down' });
        return;
      }
      const runId = randomUUID();
      info('Frontend command received', { command, runId, userId });
      forwardCommand(userId, command, runId, socket.data.activeAgentId);
    });

    socket.on('frontend:cancel', async ({ runId } = {}) => {
      await forwardCancel(userId, runId, socket.data.activeAgentId);
    });

    socket.on('agent:sync', async () => {
      const targetAgentId = socket.data.activeAgentId || (await resolveAgentId(userId));
      if (targetAgentId) io.to(agentRoom(targetAgentId)).emit('agent:sync');
      socket.emit('agent:status', await getStatus(targetAgentId));
    });

    // Routed by room + emitWithAck rather than a direct socket reference, so
    // this reaches the agent (and gets its response back) regardless of
    // which backend instance the agent's socket is connected to.
    socket.on('frontend:workspace-browse', async (payload, ack) => {
      const targetAgentId = socket.data.activeAgentId || (await resolveAgentId(userId));
      if (!targetAgentId) {
        ack?.({ error: 'Agent not connected' });
        return;
      }
      try {
        const responses = await io.to(agentRoom(targetAgentId)).timeout(15000).emitWithAck('frontend:workspace-browse', payload);
        ack?.(responses[0] || { error: 'Agent not connected' });
      } catch {
        ack?.({ error: 'Agent not connected' });
      }
    });

    socket.on('frontend:workspace-set', async (payload, ack) => {
      const targetAgentId = socket.data.activeAgentId || (await resolveAgentId(userId));
      if (!targetAgentId) {
        ack?.({ error: 'Agent not connected' });
        return;
      }
      try {
        const responses = await io.to(agentRoom(targetAgentId)).timeout(15000).emitWithAck('frontend:workspace-set', payload);
        ack?.(responses[0] || { error: 'Agent not connected' });
      } catch {
        ack?.({ error: 'Agent not connected' });
      }
    });

    socket.on('agent:approval-request', (payload) => {
      if (!agentId) return;
      io.to(userId ? `user:${userId}` : 'legacy').emit('agent:approval-request', { ...payload, agentId });
    });

    socket.on('frontend:approval-response', async (payload) => {
      await forwardApprovalResponse(userId, payload, socket.data.activeAgentId);
    });

    socket.on('disconnect', (reason) => {
      info('Socket disconnected', { id: socket.id, reason });
    });
  });
}

function close() {
  return new Promise((resolve) => {
    if (!io) return resolve();
    io.close(() => resolve());
  });
}

export { attach, close };
