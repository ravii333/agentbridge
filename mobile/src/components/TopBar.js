import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme.js';
import StatusChip from './StatusChip.js';
import Logo from './Logo.js';
import agentKindLabel from '../utils/agentKindLabel.js';

function shortenPath(cwd) {
  if (!cwd) return null;
  const parts = cwd.split(/[\\/]/).filter(Boolean);
  return parts.length > 2 ? `…/${parts.slice(-2).join('/')}` : cwd;
}

function TopBar({ state, cwd, agentName, agentKind, onPressWorkspace, onPressAddAgent, onPressAgents }) {
  const label = shortenPath(cwd);
  const kindLabel = agentKindLabel(agentKind);

  return (
    <View>
      <View style={styles.bar}>
        <Logo size={16} />
        <Text style={styles.title}>agentbridge</Text>
        {onPressAddAgent && (
          <Pressable onPress={onPressAddAgent} hitSlop={8}>
            <Text style={styles.addAgent}>+ agent</Text>
          </Pressable>
        )}
        <StatusChip state={state} />
      </View>

      {onPressAgents && (
        <Pressable style={styles.workspaceRow} onPress={onPressAgents}>
          <Text style={styles.workspaceLabel} numberOfLines={1}>
            {agentName || 'select agent'}
            {kindLabel ? ` · ${kindLabel}` : ''}
          </Text>
        </Pressable>
      )}

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
