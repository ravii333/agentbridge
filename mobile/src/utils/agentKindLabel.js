import AGENT_KINDS from './agentKinds.js';

function agentKindLabel(kind) {
  return AGENT_KINDS.find((k) => k.id === kind)?.label || null;
}

export default agentKindLabel;
