import { Text, View, StyleSheet } from 'react-native';
import { colors, fonts, radii } from '../theme.js';
import agentKindLabel from '../utils/agentKindLabel.js';

// Shown instead of ApprovalPrompt for agents whose CLI has no per-tool
// interactive approval (capabilities.approval === 'policy', e.g. Codex's
// `codex exec` isn't interactive at all) - so the absence of prompts reads
// as "this agent doesn't work that way," not as a broken feature.
function ApprovalModeNotice({ agentKind }) {
  const label = agentKindLabel(agentKind) || 'This agent';

  return (
    <View style={styles.box}>
      <Text style={styles.text}>{label} runs tool calls automatically under its sandbox policy — there's no per-action approval to review here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 12,
    marginBottom: 10,
  },
  text: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: 11.5,
    lineHeight: 17,
  },
});

export default ApprovalModeNotice;
