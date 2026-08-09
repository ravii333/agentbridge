import Command from '../models/commandModel.js';
import Log from '../models/logModel.js';

let io = null;
let agentSocket = null;
let status = {
  state: 'offline',
  sessionId: null,
  currentRunId: null,
  queueDepth: 0,
  cwd: null,
  updatedAt: new Date().toISOString(),
};

function setIo(serverIo) {
  io = serverIo;
}

function setAgentSocket(socket) {
  agentSocket = socket;
  status = { ...status, state: status.state === 'offline' ? 'idle' : status.state, updatedAt: new Date().toISOString() };

  socket.on('disconnect', () => {
    if (agentSocket === socket) {
      agentSocket = null;
      status = { ...status, state: 'offline', updatedAt: new Date().toISOString() };
      if (io) {
        io.emit('agent:status', status);
      }
    }
  });
}

function getStatus() {
  return status;
}

async function saveLog(logEvent) {
  const record = new Log({
    message: summarizeLog(logEvent),
    level: logEvent.kind === 'error' ? 'error' : 'info',
    runId: logEvent.runId,
    seq: logEvent.seq,
    kind: logEvent.kind,
    data: logEvent.data,
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

async function forwardCommand(command, runId) {
  const record = new Command({ command });
  await record.save();

  if (agentSocket) {
    agentSocket.emit('agent:command', { runId, command });
    return true;
  }

  if (io) {
    io.emit('agent:command-failed', { runId, error: 'Agent not connected' });
  }

  return false;
}

function forwardCancel(runId) {
  if (agentSocket) {
    agentSocket.emit('agent:cancel', { runId });
  }
}

function updateStatus(newStatus) {
  status = { ...status, ...newStatus, updatedAt: new Date().toISOString() };
}

export {
  setIo,
  setAgentSocket,
  getStatus,
  saveLog,
  forwardCommand,
  forwardCancel,
  updateStatus,
};
