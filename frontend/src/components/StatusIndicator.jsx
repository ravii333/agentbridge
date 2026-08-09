function StatusIndicator({ status }) {
  const state = status?.state || 'offline';

  return (
    <div>
      <h2>Agent Status</h2>
      <div>
        <strong>State:</strong> {state}
      </div>
      <div>
        <strong>Session:</strong> {status?.sessionId || 'n/a'}
      </div>
      <div>
        <strong>Queue depth:</strong> {status?.queueDepth ?? 0}
      </div>
      <div>
        <strong>Updated:</strong> {new Date(status?.updatedAt || Date.now()).toLocaleTimeString()}
      </div>
    </div>
  );
}

export default StatusIndicator;
