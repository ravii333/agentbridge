import { randomUUID } from 'node:crypto';
import { getStatus as getAgentStatus, forwardCommand, listRuns, getRunLogs } from '../services/agentService.js';

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

const getRuns = async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const runs = await listRuns(limit);
  res.json({ runs });
};

const getRun = async (req, res) => {
  const { runId } = req.params;
  const logs = await getRunLogs(runId);
  res.json({ runId, logs });
};

export { getStatus, sendCommand, getRuns, getRun };
