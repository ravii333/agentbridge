function relativeTime(iso) {
  if (!iso) return '—';
  const diffSec = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (diffSec < 5) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  return `${Math.round(diffMin / 60)}h ago`;
}

function StatusIndicator({ status, activity }) {
  const state = status?.state || 'offline';

  return (
    <div>
      <div className={`status-card__headline status-card__headline--${state}`}>{state}</div>

      {state === 'error' && status?.lastError?.message && (
        <div className="status-card__error">{status.lastError.message}</div>
      )}

      {state === 'running' && activity && (
        <div className="status-card__activity">&gt; {activity}</div>
      )}

      <div className="ledger">
        <div className="ledger__row">
          <span className="ledger__label">session</span>
          <span className="ledger__value">
            {status?.sessionId ? status.sessionId.slice(0, 8) : 'n/a'}
          </span>
        </div>
        <div className="ledger__row">
          <span className="ledger__label">queued</span>
          <span className={`ledger__value ${status?.queueDepth ? 'ledger__value--queued' : 'ledger__value--dim'}`}>
            {status?.queueDepth ?? 0}
          </span>
        </div>
        <div className="ledger__row">
          <span className="ledger__label">updated</span>
          <span className="ledger__value ledger__value--dim">{relativeTime(status?.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}

export default StatusIndicator;
