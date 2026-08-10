import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme.js';
import StatusChip from './StatusChip.js';

function TopBar({ state }) {
  return (
    <View style={styles.bar}>
      <Text style={styles.mark}>{'{ }'}</Text>
      <Text style={styles.title}>agentbridge</Text>
      <StatusChip state={state} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  mark: {
    color: colors.success,
    fontFamily: fonts.mono,
    fontWeight: '700',
  },
  title: {
    flex: 1,
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export default TopBar;
