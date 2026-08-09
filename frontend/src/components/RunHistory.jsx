import { useEffect, useState } from 'react';
import { fetchRuns, fetchRunLogs } from '../api/rest.js';
import LogFeed from './LogFeed.jsx';

function runStatus(run) {
  if (!run.finished) return 'incomplete';
  return run.ok === false ? 'failed' : 'ok';
}

function RunHistory({ onGoLive }) {
  const [runs, setRuns] = useState([]);
  const [selectedRunId, setSelectedRunId] = useState(null);
  const [runLogs, setRunLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchRuns()
      .then(({ runs: fetchedRuns }) => {
        if (!cancelled) setRuns(fetchedRuns);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const selectRun = (runId) => {
    setSelectedRunId(runId);
    setRunLogs([]);
    setError(null);

    fetchRunLogs(runId)
      .then(({ logs }) => setRunLogs(logs))
      .catch((err) => setError(err.message));
  };

  return (
    <div className="run-history">
      <div className="run-history__list">
        <h2>Run History</h2>
        {loading && <div className="log-feed__empty">Loading…</div>}
        {error && <div className="chat-bubble chat-bubble--error">{error}</div>}
        {!loading && runs.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__mark">{'{ }'}</div>
            <div className="empty-state__title">No runs yet</div>
            <div className="empty-state__message">
              Send a command from the live feed to start your first run.
            </div>
            {onGoLive && (
              <button type="button" onClick={onGoLive}>
                Go to live feed
              </button>
            )}
          </div>
        )}
        {runs.map((run) => (
          <button
            key={run.runId}
            type="button"
            className={`run-history__item ${run.runId === selectedRunId ? 'run-history__item--active' : ''}`}
            onClick={() => selectRun(run.runId)}
          >
            <span className={`run-history__status run-history__status--${runStatus(run)}`}>
              {runStatus(run)}
            </span>
            <span className="run-history__started">{new Date(run.startedAt).toLocaleString()}</span>
            <span className="run-history__meta">{run.logCount} events</span>
          </button>
        ))}
      </div>

      <div className="run-history__detail">
        {selectedRunId ? (
          <LogFeed logs={runLogs} title={`Run ${selectedRunId.slice(0, 8)}`} />
        ) : (
          <div className="log-feed__empty">Select a run to view its logs</div>
        )}
      </div>
    </div>
  );
}

export default RunHistory;
