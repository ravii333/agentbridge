import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext.js';
import { useAgent } from '../context/AgentContext.js';
import Button from '../components/Button.js';
import agentKindLabel from '../utils/agentKindLabel.js';
import { colors, fonts } from '../theme.js';

function AgentsHomeScreen() {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const { agents, activeAgentId, selectAgent, refreshAgents } = useAgent();

  useEffect(() => {
    refreshAgents();
  }, []);

  const openAgent = (agentId) => {
    selectAgent(agentId);
    navigation.navigate('Status');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.mark}>{'{ }'}</Text>
        <Text style={styles.title}>agentbridge</Text>
        <Pressable onPress={logout} hitSlop={8}>
          <Text style={styles.logout}>sign out</Text>
        </Pressable>
      </View>

      <Text style={styles.heading}>Your agents</Text>

      {agents.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No agents connected yet</Text>
          <Text style={styles.emptyBody}>
            Connect a computer running your coding CLI to control it from here — approve tool
            calls, watch it work, and pick up where you left off from anywhere.
          </Text>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={agents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => openAgent(item.id)}>
              <View
                style={[styles.dot, { backgroundColor: item.connected ? colors.success : colors.offline }]}
              />
              <View style={styles.rowText}>
                <Text style={styles.rowName}>{item.name || 'My agent'}</Text>
                <Text style={styles.rowStatus}>
                  {item.connected ? 'Connected' : 'Offline'}
                  {agentKindLabel(item.kind) ? ` · ${agentKindLabel(item.kind)}` : ''}
                </Text>
              </View>
              {item.id === activeAgentId && <Text style={styles.rowActive}>active</Text>}
            </Pressable>
          )}
        />
      )}

      <View style={styles.actions}>
        <Button label="+ Connect new agent" onPress={() => navigation.navigate('AddAgent')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
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
  logout: {
    color: colors.textFaint,
    fontFamily: fonts.mono,
    fontSize: 11,
  },
  heading: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: 22,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  rowText: {
    flex: 1,
  },
  rowName: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: 14,
    fontWeight: '600',
  },
  rowStatus: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: 11,
    marginTop: 2,
  },
  rowActive: {
    color: colors.accent,
    fontFamily: fonts.mono,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  empty: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 8,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyBody: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: 13,
    lineHeight: 20,
  },
  actions: {
    padding: 20,
  },
});

export default AgentsHomeScreen;
