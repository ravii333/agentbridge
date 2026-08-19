import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme.js';
import StatusChip from './StatusChip.js';

function shortenPath(cwd) {
  if (!cwd) return null;
  const parts = cwd.split(/[\\/]/).filter(Boolean);
  return parts.length > 2 ? `…/${parts.slice(-2).join('/')}` : cwd;
}

function TopBar({ state, cwd, onPressWorkspace, onPressAddAgent }) {
  const label = shortenPath(cwd);

  return (
    <View>
      <View style={styles.bar}>
        <Text style={styles.mark}>{'{ }'}</Text>
        <Text style={styles.title}>agentbridge</Text>
        {onPressAddAgent && (
          <Pressable onPress={onPressAddAgent} hitSlop={8}>
            <Text style={styles.addAgent}>+ agent</Text>
          </Pressable>
        )}
        <StatusChip state={state} />
      </View>

      {onPressWorkspace && (
        <Pressable style={styles.workspaceRow} onPress={onPressWorkspace}>
          <Text style={styles.workspaceLabel} numberOfLines={1}>
            {label || 'select workspace'}
          </Text>
        </Pressable>
      )}
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
  addAgent: {
    color: colors.accent,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
  workspaceRow: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  workspaceLabel: {
    color: colors.accent,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
});

export default TopBar;
