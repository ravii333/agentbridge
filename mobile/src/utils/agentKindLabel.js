const LABELS = {
  'claude-code': 'Claude Code',
  codex: 'Codex',
};

function agentKindLabel(kind) {
  return LABELS[kind] || null;
}

export default agentKindLabel;
