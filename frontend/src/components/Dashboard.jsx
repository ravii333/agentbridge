import LogViewer from './LogViewer.jsx';
import StatusIndicator from './StatusIndicator.jsx';
import CommandInput from './CommandInput.jsx';

function Dashboard({ status, logs, onSendCommand }) {
  return (
    <div className="dashboard">
      <div className="panel">
        <h1>AgentBridge Dashboard</h1>
        <StatusIndicator status={status} />
      </div>

      <div className="panel">
        <CommandInput onSendCommand={onSendCommand} />
      </div>

      <div className="panel">
        <LogViewer logs={logs} />
      </div>
    </div>
  );
}

export default Dashboard;
