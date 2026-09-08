import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import 'express-async-errors';
import agentRoutes from './routes/agentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import agentPairingRoutes from './routes/agentPairingRoutes.js';

const app = express();

// CORS_ORIGIN unset means "reflect any origin" (cors' default `origin: true`)
// which is fine for local/dev use but should be a comma-separated allowlist
// in production since the API carries bearer tokens.
const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : true;
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// Auth is applied per-route inside agentRoutes.js: legacy shared-secret
// endpoints vs. JWT-scoped per-user run history.
app.use('/api/agent', agentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentPairingRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'AgentBridge backend is running' });
});

app.get('/healthz', (req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? 'up' : 'down';
  res.status(dbState === 'up' ? 200 : 503).json({ status: dbState === 'up' ? 'ok' : 'degraded', db: dbState });
});

// Catches errors thrown/rejected by async route handlers (Express 4 doesn't
// do this automatically), so a transient DB error returns a 500 instead of
// crashing the process.
app.use((err, req, res, next) => {
  console.error('Unhandled request error:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
