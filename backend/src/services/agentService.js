import mongoose from 'mongoose';
import Command from '../models/commandModel.js';
import Log from '../models/logModel.js';
import Agent from '../models/agentModel.js';

const LEGACY_AGENT_ID = 'legacy';

let io = null;

// The legacy shared-secret agent is a single global dev/dashboard identity
// (see utils/auth.js) with no per-agent Mongo document, so it stays local-
// process-only rather than persisted for cross-instance lookup. It is not
// recommended for production/multi-instance use (see backend/.env.example).
const legacyAgent = { socket: null, status: null };

// Per-instance cache of locally-connected real agents: { socket, status,
// userId }. Cross-instance presence/status for real agents lives on the
// Agent document (connected/liveStatus fields below) instead - this cache
// is just a fast path + ownership check for this process's own sockets.
const localAgents = new Map();

function setIo(serverIo) {
  io = serverIo;
}

function targetRoom(userId) {
  return userId ? `user:${userId}` : 'legacy';
}

function agentRoom(agentId) {
  return `agent:${agentId}`;
}

function broadcast(userId, event, payload) {
  if (io) io.to(targetRoom(userId)).emit(event, payload);
}

function initialStatus(agentId) {
  return {
    agentId,
    state: 'idle',
    sessionId: null,
    currentRunId: null,
    queueDepth: 0,
    cwd: null,
    updatedAt: new Date().toISOString(),
  };
}

async function registerAgent({ agentId, userId, socket }) {
  const status = initialStatus(agentId);

  if (agentId === LEGACY_AGENT_ID) {
    legacyAgent.socket = socket;
    legacyAgent.status = status;
  } else {
    localAgents.set(agentId, { socket, status, userId });
    await Agent.updateOne({ _id: agentId }, { connected: true, liveStatus: status }).catch(() => {});
  }

  broadcast(userId, 'agent:status', status);

  socket.on('disconnect', async () => {
    if (agentId === LEGACY_AGENT_ID) {
      if (legacyAgent.socket !== socket) return;
      legacyAgent.socket = null;
      legacyAgent.status = { ...legacyAgent.status, state: 'offline', updatedAt: new Date().toISOString() };
      broadcast(userId, 'agent:status', legacyAgent.status);
      return;
    }

    const entry = localAgents.get(agentId);
    if (!entry || entry.socket !== socket) return;
    localAgents.delete(agentId);
    const offlineStatus = { ...entry.status, state: 'offline', updatedAt: new Date().toISOString() };
    await Agent.updateOne({ _id: agentId }, { connected: false, liveStatus: offlineStatus }).catch(() => {});
    broadcast(userId, 'agent:status', offlineStatus);
  });
}

// Fallback for sockets that haven't called frontend:select-agent yet: if the
// user has exactly one connected agent, route to it. With more than one,
// guessing risks silently sending a command to the wrong device, so return
// null and let the caller surface "select an agent".
async function resolveAgentId(userId) {
  if (!userId) {
    return legacyAgent.socket ? LEGACY_AGENT_ID : null;
  }
  const connected = await Agent.find({ userId, connected: true }).select('_id').lean();
  if (connected.length !== 1) return null;
  return connected[0]._id.toString();
}

async function isConnected(agentId) {
  if (!agentId) return false;
  if (agentId === LEGACY_AGENT_ID) return Boolean(legacyAgent.socket);
  if (localAgents.has(agentId)) return true;
  const agent = await Agent.findById(agentId).select('connected').lean();
  return Boolean(agent?.connected);
}

async function getStatus(agentId) {
  if (!agentId) return { state: 'offline' };
  if (agentId === LEGACY_AGENT_ID) {
    return legacyAgent.status || { state: 'offline' };
  }
  const local = localAgents.get(agentId);
  if (local) return local.status;
  const agent = await Agent.findById(agentId).select('liveStatus connected').lean();
  if (!agent) return { state: 'offline' };
  return agent.liveStatus || { state: agent.connected ? 'idle' : 'offline' };
}

async function updateStatus(agentId, newStatus) {
  if (agentId === LEGACY_AGENT_ID) {
    if (!legacyAgent.socket) return null;
    legacyAgent.status = { ...legacyAgent.status, ...newStatus, agentId, updatedAt: new Date().toISOString() };
    broadcast(null, 'agent:status', legacyAgent.status);
    return legacyAgent.status;
  }

  const local = localAgents.get(agentId);
  const merged = { ...(local?.status || {}), ...newStatus, agentId, updatedAt: new Date().toISOString() };
  if (local) local.status = merged;

  const agent = await Agent.findByIdAndUpdate(agentId, { liveStatus: merged }, { new: true }).select('userId').lean();
  if (!agent) return null;

  broadcast(agent.userId ? agent.userId.toString() : local?.userId || null, 'agent:status', merged);
  return merged;
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

// Routed via the agent's room rather than a direct socket reference, so it
// reaches the agent regardless of which backend instance its socket is
// connected to (the mongo-adapter fans room emits out across instances).
async function forwardCommand(userId, command, runId, explicitAgentId) {
  const agentId = explicitAgentId || (await resolveAgentId(userId));

  const record = new Command({ command, userId: userId || null, agentId: agentId || null });
  await record.save();

  if (agentId && (await isConnected(agentId))) {
    io?.to(agentRoom(agentId)).emit('agent:command', { runId, command });
    return true;
  }

  broadcast(userId, 'agent:command-failed', { runId, error: 'Agent not connected' });
  return false;
}

async function forwardCancel(userId, runId, explicitAgentId) {
  const agentId = explicitAgentId || (await resolveAgentId(userId));
  if (agentId) io?.to(agentRoom(agentId)).emit('agent:cancel', { runId });
}

async function forwardApprovalResponse(userId, payload, explicitAgentId) {
  const agentId = explicitAgentId || (await resolveAgentId(userId));
  if (agentId) io?.to(agentRoom(agentId)).emit('agent:approval-response', payload);
}

async function listRuns(userId, limit = 50) {
  const match = { runId: { $ne: null } };
  // aggregate() bypasses Mongoose's automatic query casting, so a plain
  // userId string here would silently never match the stored ObjectId.
  if (userId) match.userId = new mongoose.Types.ObjectId(userId);

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
  isConnected,
  resolveAgentId,
  targetRoom,
  agentRoom,
  getStatus,
  saveLog,
  forwardCommand,
  forwardCancel,
  forwardApprovalResponse,
  updateStatus,
  listRuns,
  getRunLogs,
};
