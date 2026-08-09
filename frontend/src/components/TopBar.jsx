function TopBar({ state }) {
  const s = state || 'offline';

  return (
    <div className="topbar">
      <span className="topbar__mark">{'{ }'}</span>
      <span className="topbar__title">agentbridge</span>
      <span className={`status-chip status-chip--${s}`}>
        <span className="status-chip__dot" />
        {s}
      </span>
    </div>
  );
}

export default TopBar;
