import { config as loadEnv } from 'dotenv';
loadEnv();

import http from 'node:http';
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
}

startServer();
