import { randomUUID } from 'node:crypto';
import { getStatus as getAgentStatus, forwardCommand } from '../services/agentService.js';

const getStatus = (req, res) => {
  const status = getAgentStatus();
  res.json({ status });
};

const sendCommand = async (req, res) => {
  const { command } = req.body;

  if (!command) {
    return res.status(400).json({ error: 'Command is required' });
  }

  const runId = randomUUID();
  const forwarded = await forwardCommand(command, runId);
  res.json({ success: true, forwarded, runId });
};

export { getStatus, sendCommand };
