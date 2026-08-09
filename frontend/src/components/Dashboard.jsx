import { useState } from 'react';
import TopBar from './TopBar.jsx';
import LogViewer from './LogViewer.jsx';
import StatusIndicator from './StatusIndicator.jsx';
import CommandInput from './CommandInput.jsx';
import RunHistory from './RunHistory.jsx';

function Dashboard({ status, logs, activity, commandError, recentCommands, onSendCommand }) {
  const [tab, setTab] = useState('live');

  return (
    <div className="dashboard">
      <TopBar state={status?.state} />

      <div className="panel">
        <StatusIndicator status={status} activity={activity} />
      </div>

      <div className="tabs">
        <button
          type="button"
          className={`tab ${tab === 'live' ? 'tab--active' : ''}`}
          onClick={() => setTab('live')}
        >
          live
        </button>
        <button
          type="button"
          className={`tab ${tab === 'history' ? 'tab--active' : ''}`}
          onClick={() => setTab('history')}
        >
          history
        </button>
      </div>

      {tab === 'live' ? (
        <>
          <div className="panel">
            <LogViewer logs={logs} />
          </div>
          <div className="panel">
            <CommandInput onSendCommand={onSendCommand} error={commandError} recent={recentCommands} />
          </div>
        </>
      ) : (
        <div className="panel">
          <RunHistory onGoLive={() => setTab('live')} />
        </div>
      )}
    </div>
  );
}

export default Dashboard;
