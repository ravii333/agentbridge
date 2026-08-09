import { useEffect, useMemo, useState } from 'react';
import { createSocket } from '../api/socket.js';
import Dashboard from '../components/Dashboard.jsx';
import latestActivity from '../utils/latestActivity.js';

const REJECT_REASONS = {
  not_ready: 'Agent is not ready — try again once it reconnects.',
  queue_full: 'Too many commands already queued — try again once some finish.',
};

function DashboardPage() {
  const [status, setStatus] = useState({ state: 'offline', sessionId: null, currentRunId: null, updatedAt: null });
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

  const handleSendCommand = (command) => {
    if (!socket) return;
    setCommandError(null);
    socket.emit('frontend:command', command);
    setRecentCommands((current) => [command, ...current.filter((c) => c !== command)].slice(0, 3));
  };

  return (
    <Dashboard
      status={status}
      logs={logs}
      activity={activity}
      commandError={commandError}
      recentCommands={recentCommands}
      onSendCommand={handleSendCommand}
    />
  );
}

export default DashboardPage;
