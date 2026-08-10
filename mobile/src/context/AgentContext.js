import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createSocket } from '../api/socket.js';
import latestActivity from '../utils/latestActivity.js';

const REJECT_REASONS = {
  not_ready: 'Agent is not ready — try again once it reconnects.',
  queue_full: 'Too many commands already queued — try again once some finish.',
};

const AgentContext = createContext(null);

export function AgentProvider({ children }) {
  const [status, setStatus] = useState({ state: 'connecting', sessionId: null, currentRunId: null, updatedAt: null });
  const [logs, setLogs] = useState([]);
  const [socket, setSocket] = useState(null);
  const [commandError, setCommandError] = useState(null);
  const [recentCommands, setRecentCommands] = useState([]);

  useEffect(() => {
    const client = createSocket();
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
      setLogs((current) => [
        ...current,
        { ...logEvent, timestamp: logEvent.ts || new Date().toISOString() },
      ]);
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
  }, []);

  const activity = useMemo(() => latestActivity(logs), [logs]);

  const sendCommand = (command) => {
    if (!socket) return;
    setCommandError(null);
    socket.emit('frontend:command', command);
    setRecentCommands((current) => [command, ...current.filter((c) => c !== command)].slice(0, 3));
  };

  const value = {
    status,
    logs,
    activity,
    commandError,
    recentCommands,
    sendCommand,
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
