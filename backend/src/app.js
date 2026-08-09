import express from 'express';
import cors from 'cors';
import agentRoutes from './routes/agentRoutes.js';
import { requireToken } from './utils/auth.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/agent', requireToken, agentRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'AgentBridge backend is running' });
});

export default app;
