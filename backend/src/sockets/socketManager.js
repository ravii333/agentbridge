import { Server } from 'socket.io';
import { randomUUID } from 'node:crypto';
import {
  setIo,
  setAgentSocket,
  saveLog,
  updateStatus,
  forwardCommand,
  forwardCancel,
} from '../services/agentService.js';
import { isValidSocketToken } from '../utils/auth.js';
import { info } from '../utils/logger.js';

let io;

function attach(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  setIo(io);

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!isValidSocketToken(token)) {
      return next(new Error('Unauthorized'));
    }
    next();
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

    socket.on('disconnect', (reason) => {
      info('Socket disconnected', { id: socket.id, reason });
    });
  });
}

export { attach };
