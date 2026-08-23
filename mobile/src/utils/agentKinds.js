// Single source of truth for the CLIs AgentBridge knows how to pair with,
// matching agent-client's adapters/index.js registry. Mobile can't actually
// choose which CLI a PC-side agent-client runs (that's decided by the
// AGENT_KIND env var over there) - this only drives which instructions/
// command we show, so the person pairing sees the right one for what
// they're actually running.
const AGENT_KINDS = [
  {
    id: 'claude-code',
    label: 'Claude Code',
    command: 'npx agentbridge',
  },
  {
    id: 'codex',
    label: 'Codex CLI',
    command: 'npx agentbridge',
    envNote: 'First, create a .env file (in the folder you run this from) with AGENT_KIND=codex.',
  },
];

export default AGENT_KINDS;
