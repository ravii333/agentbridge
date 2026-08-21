import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createSocket } from '../api/socket.js';
import { useAuth } from './AuthContext.js';
import { listAgents } from '../api/authApi.js';
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
  const [agents, setAgents] = useState([]);
  const [activeAgentId, setActiveAgentId] = useState(null);
  const activeAgentIdRef = useRef(null);

  function applySelection(client, agentId) {
    activeAgentIdRef.current = agentId;
    setActiveAgentId(agentId);
    setLogs([]);
    setPendingApprovals([]);
    setStatus({ state: 'connecting', sessionId: null, currentRunId: null, updatedAt: null });
    client.emit('frontend:select-agent', agentId, (result) => {
      if (result?.error) {
        setCommandError(result.error);
      }
    });
  }

  const refreshAgents = () => {
    if (!token) return Promise.resolve([]);
    return listAgents(token)
      .then((list) => {
        setAgents(list);
        return list;
      })
      .catch(() => []);
  };

  useEffect(() => {
    if (!token) {
      setSocket(null);
      setStatus((current) => ({ ...current, state: 'offline' }));
      setAgents([]);
      setActiveAgentId(null);
      activeAgentIdRef.current = null;
      return undefined;
    }

    const client = createSocket(token);
    setSocket(client);

    client.on('connect', () => {
      client.emit('frontend:ready');
      refreshAgents().then((list) => {
        const preferred =
          list.find((a) => a.id === activeAgentIdRef.current) || list.find((a) => a.connected) || list[0];
        if (preferred) {
          applySelection(client, preferred.id);
        } else {
          client.emit('agent:sync');
        }
      });
    });

    client.on('disconnect', () => {
      setStatus((current) => ({ ...current, state: 'offline' }));
    });

    client.on('agent:log', (logEvent) => {
      if (activeAgentIdRef.current && logEvent.agentId && logEvent.agentId !== activeAgentIdRef.current) return;
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
      if (activeAgentIdRef.current && request.agentId && request.agentId !== activeAgentIdRef.current) return;
      setPendingApprovals((current) => [...current, request]);
    });

    client.on('agent:status', (agentStatus) => {
      if (activeAgentIdRef.current && agentStatus.agentId && agentStatus.agentId !== activeAgentIdRef.current) return;
      setStatus(agentStatus);
      setAgents((current) =>
        current.map((a) => (a.id === agentStatus.agentId ? { ...a, connected: agentStatus.state !== 'offline' } : a)),
      );
    });

    client.on('agent:ack', (ack) => {
      if (activeAgentIdRef.current && ack?.agentId && ack.agentId !== activeAgentIdRef.current) return;
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

  const selectAgent = (agentId) => {
    if (!socket || agentId === activeAgentIdRef.current) return;
    applySelection(socket, agentId);
  };

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
    agents,
    activeAgentId,
    selectAgent,
    refreshAgents,
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
