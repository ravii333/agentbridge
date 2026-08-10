import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii } from '../theme.js';
import Button from './Button.js';

function summarizeInput(tool, input) {
  if (!input) return '';
  if (tool === 'Bash' && input.command) return input.command;
  if (input.file_path) return input.file_path;
  try {
    const json = JSON.stringify(input);
    return json.length > 160 ? `${json.slice(0, 160)}…` : json;
  } catch {
    return '';
  }
}

function ApprovalPrompt({ approval, onApprove, onDeny }) {
  if (!approval) return null;

  return (
    <View style={styles.box}>
      <Text style={styles.heading}>Claude wants to use {approval.tool}</Text>
      <Text style={styles.detail} numberOfLines={4}>
        {summarizeInput(approval.tool, approval.input)}
      </Text>
      <View style={styles.actions}>
        <Button label="Deny" variant="secondary" onPress={() => onDeny(approval.approvalId)} />
        <Button label="Approve" onPress={() => onApprove(approval.approvalId)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.accentDim,
    borderRadius: radii.lg,
    padding: 12,
    marginBottom: 10,
    gap: 8,
  },
  heading: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: 13,
    fontWeight: '700',
  },
  detail: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
});

export default ApprovalPrompt;
