import { randomUUID } from 'node:crypto';
import { LEGACY_AGENT_ID, getStatus as getAgentStatus, forwardCommand, listRuns, getRunLogs } from '../services/agentService.js';

const getStatus = (req, res) => {
  const status = getAgentStatus(LEGACY_AGENT_ID);
  res.json({ status });
};

const sendCommand = async (req, res) => {
  const { command } = req.body;

  if (!command) {
    return res.status(400).json({ error: 'Command is required' });
  }

  const runId = randomUUID();
  const forwarded = await forwardCommand(null, command, runId);
  res.json({ success: true, forwarded, runId });
};

const getRuns = async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const runs = await listRuns(req.userId, limit);
  res.json({ runs });
};

const getRun = async (req, res) => {
  const { runId } = req.params;
  const logs = await getRunLogs(req.userId, runId);
  res.json({ runId, logs });
};

export { getStatus, sendCommand, getRuns, getRun };
