function StatusIndicator({ status }) {
  const connected = status?.connected;
  return (
    <div>
      <h2>Agent Status</h2>
      <div>
        <strong>Connected:</strong> {connected ? 'Yes' : 'No'}
      </div>
      <div>
        <strong>Last Command:</strong> {status?.lastCommand || 'n/a'}
      </div>
      <div>
        <strong>Updated:</strong> {new Date(status?.updatedAt || Date.now()).toLocaleTimeString()}
      </div>
    </div>
  );
}

export default StatusIndicator;
