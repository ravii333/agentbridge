import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, stateColor } from '../theme.js';

function StatusChip({ state }) {
  const s = state || 'offline';
  const color = stateColor[s] || colors.textDim;
  const isRunning = s === 'running';
  const isError = s === 'error';

  return (
    <View
      style={[
        styles.chip,
        { borderColor: isRunning || isError ? color : colors.border },
        isRunning && { backgroundColor: colors.accentDim },
        isError && { backgroundColor: colors.errorDim },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{s}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export default StatusChip;
