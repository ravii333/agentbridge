import './env.js';

import http from 'node:http';
import mongoose from 'mongoose';
import app from './app.js';
import connectDB from './config/db.js';
import { attach } from './sockets/socketManager.js';

const PORT = process.env.PORT || 4000;

async function startServer() {
  await connectDB();
  const server = http.createServer(app);
  attach(server);

  server.listen(PORT, () => {
    console.log(`AgentBridge backend listening on http://localhost:${PORT}`);
  });

  async function shutdown(signal) {
    console.log(`${signal} received, shutting down`);
    server.close(() => {
      console.log('HTTP server closed');
    });
    try {
      await mongoose.disconnect();
    } catch {
      // already disconnecting/disconnected
    }
    process.exit(0);
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

startServer();
