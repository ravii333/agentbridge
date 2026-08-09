import LogFeed from './LogFeed.jsx';

function LogViewer({ logs }) {
  return <LogFeed logs={logs} title="Live Logs" autoScroll />;
}

export default LogViewer;
