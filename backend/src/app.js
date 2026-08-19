import express from 'express';
import cors from 'cors';
import agentRoutes from './routes/agentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import agentPairingRoutes from './routes/agentPairingRoutes.js';
import { requireToken } from './utils/auth.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/agent', requireToken, agentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentPairingRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'AgentBridge backend is running' });
});

export default app;
