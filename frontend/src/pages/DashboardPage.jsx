import { useEffect, useState } from 'react';
import { createSocket } from '../api/socket.js';
import Dashboard from '../components/Dashboard.jsx';

function DashboardPage() {
  const [status, setStatus] = useState({ state: 'offline', sessionId: null, currentRunId: null, updatedAt: null });
  const [logs, setLogs] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const client = createSocket();
    setSocket(client);

    client.on('connect', () => {
      client.emit('frontend:ready');
      client.emit('agent:sync');
    });

    client.on('agent:log', (logEvent) => {
      setLogs((current) => [
        { ...logEvent, timestamp: logEvent.ts || new Date().toISOString() },
        ...current,
      ]);
    });

    client.on('agent:status', (agentStatus) => {
      setStatus(agentStatus);
    });

    return () => {
      client.disconnect();
    };
  }, []);

  const handleSendCommand = (command) => {
    if (socket) {
      socket.emit('frontend:command', command);
    }
  };

  return <Dashboard status={status} logs={logs} onSendCommand={handleSendCommand} />;
}

export default DashboardPage;
