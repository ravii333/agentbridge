import Command from '../models/commandModel.js';
import Log from '../models/logModel.js';

const LEGACY_AGENT_ID = 'legacy';

let io = null;
const agents = new Map(); // agentId -> { socket, userId, status }

function setIo(serverIo) {
  io = serverIo;
}

function targetRoom(userId) {
  return userId ? `user:${userId}` : 'legacy';
}

function broadcast(userId, event, payload) {
  if (io) io.to(targetRoom(userId)).emit(event, payload);
}

function registerAgent({ agentId, userId, socket }) {
  const status = {
    state: 'idle',
    sessionId: null,
    currentRunId: null,
    queueDepth: 0,
    cwd: null,
    updatedAt: new Date().toISOString(),
  };
  agents.set(agentId, { socket, userId, status });
  broadcast(userId, 'agent:status', status);

  socket.on('disconnect', () => {
    const entry = agents.get(agentId);
    if (entry && entry.socket === socket) {
      entry.status = { ...entry.status, state: 'offline', updatedAt: new Date().toISOString() };
      broadcast(userId, 'agent:status', entry.status);
      agents.delete(agentId);
    }
  });
}

function getAgentEntry(agentId) {
  return agents.get(agentId);
}

function getAgentSocket(agentId) {
  return agents.get(agentId)?.socket || null;
}

// Mobile doesn't expose an agent switcher yet, so a user's frontend
// socket is routed to whichever of their agents is currently connected.
function resolveAgentId(userId) {
  if (!userId) {
    return agents.has(LEGACY_AGENT_ID) ? LEGACY_AGENT_ID : null;
  }
  for (const [agentId, entry] of agents) {
    if (entry.userId === userId) return agentId;
  }
  return null;
}

function getStatus(agentId) {
  return agents.get(agentId)?.status || { state: 'offline' };
}

function updateStatus(agentId, newStatus) {
  const entry = agents.get(agentId);
  if (!entry) return null;
  entry.status = { ...entry.status, ...newStatus, updatedAt: new Date().toISOString() };
  broadcast(entry.userId, 'agent:status', entry.status);
  return entry.status;
}

async function saveLog(agentId, userId, logEvent) {
  const record = new Log({
    message: summarizeLog(logEvent),
    level: logEvent.kind === 'error' ? 'error' : 'info',
    runId: logEvent.runId,
    seq: logEvent.seq,
    kind: logEvent.kind,
    data: logEvent.data,
    userId: userId || null,
    agentId: agentId || null,
  });
  await record.save();
}

function summarizeLog(logEvent) {
  switch (logEvent.kind) {
    case 'text':
      return logEvent.data?.text || '';
    case 'tool_use':
      return `Using tool: ${logEvent.data?.tool}`;
    case 'tool_result':
      return `Tool result: ${logEvent.data?.preview || ''}`;
    case 'run_started':
      return 'Run started';
    case 'run_finished':
      return logEvent.data?.summary || 'Run finished';
    case 'error':
      return logEvent.data?.message || 'Error';
    default:
      return logEvent.data?.message || logEvent.kind;
  }
}

async function forwardCommand(userId, command, runId) {
  const agentId = resolveAgentId(userId);
  const entry = agentId ? agents.get(agentId) : null;

  const record = new Command({ command, userId: userId || null, agentId: agentId || null });
  await record.save();

  if (entry?.socket) {
    entry.socket.emit('agent:command', { runId, command });
    return true;
  }

  broadcast(userId, 'agent:command-failed', { runId, error: 'Agent not connected' });
  return false;
}

function forwardCancel(userId, runId) {
  const agentId = resolveAgentId(userId);
  agents.get(agentId)?.socket?.emit('agent:cancel', { runId });
}

function forwardApprovalResponse(userId, payload) {
  const agentId = resolveAgentId(userId);
  agents.get(agentId)?.socket?.emit('agent:approval-response', payload);
}

async function listRuns(userId, limit = 50) {
  const match = { runId: { $ne: null } };
  if (userId) match.userId = userId;

  const runs = await Log.aggregate([
    { $match: match },
    { $sort: { createdAt: 1, seq: 1 } },
    {
      $group: {
        _id: '$runId',
        startedAt: { $first: '$createdAt' },
        endedAt: { $last: '$createdAt' },
        logCount: { $sum: 1 },
        firstKind: { $first: '$kind' },
        lastKind: { $last: '$kind' },
        lastData: { $last: '$data' },
      },
    },
    { $sort: { startedAt: -1 } },
    { $limit: limit },
  ]);

  return runs.map((run) => ({
    runId: run._id,
    startedAt: run.startedAt,
    endedAt: run.endedAt,
    logCount: run.logCount,
    finished: run.lastKind === 'run_finished',
    ok: run.lastKind === 'run_finished' ? run.lastData?.ok !== false : undefined,
    summary: run.lastKind === 'run_finished' ? run.lastData?.summary : undefined,
  }));
}

async function getRunLogs(userId, runId) {
  const query = { runId };
  if (userId) query.userId = userId;

  const logs = await Log.find(query).sort({ seq: 1, createdAt: 1 }).lean();
  return logs.map((log) => ({
    kind: log.kind,
    data: log.data,
    runId: log.runId,
    seq: log.seq,
    timestamp: log.createdAt,
  }));
}

export {
  LEGACY_AGENT_ID,
  setIo,
  registerAgent,
  getAgentEntry,
  getAgentSocket,
  resolveAgentId,
  targetRoom,
  getStatus,
  saveLog,
  forwardCommand,
  forwardCancel,
  forwardApprovalResponse,
  updateStatus,
  listRuns,
  getRunLogs,
};
