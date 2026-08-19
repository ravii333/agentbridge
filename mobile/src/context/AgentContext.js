import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createSocket } from '../api/socket.js';
import { useAuth } from './AuthContext.js';
import latestActivity from '../utils/latestActivity.js';

const REJECT_REASONS = {
  not_ready: 'Agent is not ready — try again once it reconnects.',
  queue_full: 'Too many commands already queued — try again once some finish.',
};

const AgentContext = createContext(null);

export function AgentProvider({ children }) {
  const { token } = useAuth();
  const [status, setStatus] = useState({ state: 'connecting', sessionId: null, currentRunId: null, updatedAt: null });
  const [logs, setLogs] = useState([]);
  const [socket, setSocket] = useState(null);
  const [commandError, setCommandError] = useState(null);
  const [recentCommands, setRecentCommands] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);

  useEffect(() => {
    if (!token) {
      setSocket(null);
      setStatus((current) => ({ ...current, state: 'offline' }));
      return undefined;
    }

    const client = createSocket(token);
    setSocket(client);

    client.on('connect', () => {
      client.emit('frontend:ready');
      client.emit('agent:sync');
    });

    client.on('disconnect', () => {
      setStatus((current) => ({ ...current, state: 'offline' }));
    });

    client.on('agent:log', (logEvent) => {
      setCommandError(null);
      if (logEvent.kind === 'run_started') {
        setPendingApprovals([]);
      }
      setLogs((current) => [
        ...current,
        { ...logEvent, timestamp: logEvent.ts || new Date().toISOString() },
      ]);
    });

    client.on('agent:approval-request', (request) => {
      setPendingApprovals((current) => [...current, request]);
    });

    client.on('agent:status', (agentStatus) => {
      setStatus(agentStatus);
    });

    client.on('agent:ack', (ack) => {
      if (ack && ack.accepted === false) {
        setCommandError(REJECT_REASONS[ack.reason] || 'Command was not accepted.');
      }
    });

    client.on('agent:command-failed', ({ error } = {}) => {
      setCommandError(error || 'Agent not connected.');
    });

    return () => {
      client.disconnect();
    };
  }, [token]);

  const activity = useMemo(() => latestActivity(logs), [logs]);

  const sendCommand = (command) => {
    if (!socket) return;
    setCommandError(null);
    socket.emit('frontend:command', command);
    setRecentCommands((current) => [command, ...current.filter((c) => c !== command)].slice(0, 3));
  };

  const respondApproval = (approvalId, approved) => {
    if (!socket) return;
    socket.emit('frontend:approval-response', { approvalId, approved });
    setPendingApprovals((current) => current.filter((item) => item.approvalId !== approvalId));
  };

  const browseWorkspace = (path) =>
    new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Not connected'));
        return;
      }
      socket.emit('frontend:workspace-browse', { path }, (result) => {
        if (result?.error) {
          reject(new Error(result.error));
        } else {
          resolve(result);
        }
      });
    });

  const setWorkspace = (path) =>
    new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Not connected'));
        return;
      }
      socket.emit('frontend:workspace-set', { path }, (result) => {
        if (result?.error) {
          reject(new Error(result.error));
        } else {
          resolve(result);
        }
      });
    });

  const value = {
    status,
    logs,
    activity,
    commandError,
    recentCommands,
    pendingApprovals,
    sendCommand,
    respondApproval,
    browseWorkspace,
    setWorkspace,
  };

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>;
}

export function useAgent() {
  const ctx = useContext(AgentContext);
  if (!ctx) {
    throw new Error('useAgent must be used inside an AgentProvider');
  }
  return ctx;
}
