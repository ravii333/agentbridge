function TerminalMockup() {
  return (
    <div className="mock-window mock-terminal" role="img" aria-label="Terminal showing the agent-client pairing flow">
      <div className="mock-titlebar">
        <span className="mock-dot mock-dot--red" />
        <span className="mock-dot mock-dot--yellow" />
        <span className="mock-dot mock-dot--green" />
        <span className="mock-titlebar-label">agent-client</span>
      </div>
      <div className="mock-term-body">
        <p><span className="mock-prompt">$</span> npx agentbridge</p>
        <p className="mock-dim">Detected: Claude Code (claude)</p>
        <p className="mock-dim">&nbsp;</p>
        <p className="mock-rule">=========================================</p>
        <p>&nbsp;&nbsp;Open the AgentBridge app → Add agent</p>
        <p>&nbsp;&nbsp;and enter this code: <span className="mock-code">RQ7X-9F2K</span></p>
        <p className="mock-rule">=========================================</p>
        <p className="mock-dim">&nbsp;</p>
        <p className="mock-accent">✓ Agent paired. Waiting for commands…</p>
        <p className="mock-caret">_</p>
      </div>
    </div>
  );
}

export default TerminalMockup;
