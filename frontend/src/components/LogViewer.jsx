function describeLog(log) {
  const data = log.data || {};
  switch (log.kind) {
    case 'text':
      return data.text;
    case 'tool_use':
      return `→ using tool: ${data.tool}`;
    case 'tool_result':
      return `← tool result: ${data.preview || (data.ok ? 'ok' : 'error')}`;
    case 'run_started':
      return `run started (session ${data.sessionId || 'new'})`;
    case 'run_finished':
      return `run finished${data.ok === false ? ' (failed)' : ''}: ${data.summary || ''}`;
    case 'error':
      return `error: ${data.message}`;
    case 'notice':
      return data.message;
    default:
      return log.message || JSON.stringify(data);
  }
}

function LogViewer({ logs }) {
  return (
    <div>
      <h2>Live Logs</h2>
      <div className="log-list">
        {logs.length === 0 && <div>No logs yet</div>}
        {logs.map((log, index) => (
          <div key={index} className={`log-item log-item--${log.kind || 'plain'}`}>
            {new Date(log.timestamp).toLocaleTimeString()} - {describeLog(log)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LogViewer;
