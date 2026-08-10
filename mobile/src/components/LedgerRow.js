import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme.js';

function LedgerRow({ label, value, tone = 'default' }) {
  const toneColor = {
    default: colors.text,
    dim: colors.textDim,
    queued: colors.queued,
    success: colors.success,
    error: colors.error,
  }[tone];

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: toneColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  label: {
    color: colors.textFaint,
    fontFamily: fonts.mono,
    fontSize: 13,
  },
  value: {
    fontFamily: fonts.mono,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default LedgerRow;
