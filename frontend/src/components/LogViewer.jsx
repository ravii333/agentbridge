function LogViewer({ logs }) {
  return (
    <div>
      <h2>Live Logs</h2>
      <div className="log-list">
        {logs.length === 0 && <div>No logs yet</div>}
        {logs.map((log, index) => (
          <div key={index} className="log-item">
            {new Date(log.timestamp).toLocaleTimeString()} - {log.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LogViewer;
