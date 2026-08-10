import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAgent } from '../context/AgentContext.js';
import TopBar from '../components/TopBar.js';
import LedgerRow from '../components/LedgerRow.js';
import Button from '../components/Button.js';
import { colors, fonts, stateColor } from '../theme.js';

function relativeTime(iso) {
  if (!iso) return '—';
  const diffSec = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (diffSec < 5) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  return `${Math.round(diffMin / 60)}h ago`;
}

function StatusScreen() {
  const navigation = useNavigation();
  const { status, activity } = useAgent();
  const state = status?.state || 'offline';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TopBar state={state} />

      <ScrollView contentContainerStyle={styles.content}>
        {state === 'offline' ? (
          <View style={styles.offlineBlock}>
            <Text style={styles.offlineTitle}>Agent client isn't running</Text>
            <Text style={styles.offlineMessage}>
              Start AgentBridge on your computer to reconnect.
            </Text>
          </View>
        ) : (
          <>
            <Text style={[styles.headline, { color: stateColor[state] || colors.text }]}>{state}</Text>

            {state === 'error' && status?.lastError?.message && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{status.lastError.message}</Text>
              </View>
            )}

            {state === 'running' && activity && <Text style={styles.activity}>&gt; {activity}</Text>}

            <View style={styles.ledger}>
              <LedgerRow label="session" value={status?.sessionId ? status.sessionId.slice(0, 8) : 'n/a'} />
              <LedgerRow
                label="queued"
                value={status?.queueDepth ?? 0}
                tone={status?.queueDepth ? 'queued' : 'dim'}
              />
              <LedgerRow label="updated" value={relativeTime(status?.updatedAt)} tone="dim" />
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.actions}>
        <Button label="Open live feed" onPress={() => navigation.navigate('LiveFeed')} />
        <View style={{ height: 10 }} />
        <Button label="History" variant="secondary" onPress={() => navigation.navigate('History')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  headline: {
    fontFamily: fonts.mono,
    fontSize: 30,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  activity: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: 13,
    marginBottom: 18,
  },
  errorBox: {
    backgroundColor: colors.errorDim,
    borderWidth: 1,
    borderColor: '#5c2323',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
  ledger: {
    marginTop: 4,
  },
  offlineBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 60,
  },
  offlineTitle: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: 15,
    fontWeight: '600',
  },
  offlineMessage: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: 12,
    textAlign: 'center',
  },
  actions: {
    padding: 20,
  },
});

export default StatusScreen;
