import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchRuns } from '../api/rest.js';
import { useAgent } from '../context/AgentContext.js';
import { useAuth } from '../context/AuthContext.js';
import TopBar from '../components/TopBar.js';
import EmptyState from '../components/EmptyState.js';
import { colors, fonts } from '../theme.js';

function runStatus(run) {
  if (!run.finished) return 'incomplete';
  return run.ok === false ? 'failed' : 'ok';
}

const STATUS_COLOR = { ok: colors.success, failed: colors.error, incomplete: colors.queued };

function HistoryScreen() {
  const navigation = useNavigation();
  const { status } = useAgent();
  const { token } = useAuth();
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchRuns(token)
      .then(({ runs: fetched }) => {
        if (!cancelled) setRuns(fetched);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TopBar state={status?.state} />

      <View style={styles.content}>
        <Text style={styles.heading}>history</Text>

        {loading && <Text style={styles.loading}>Loading…</Text>}
        {error && <Text style={styles.error}>{error}</Text>}

        {!loading && runs.length === 0 ? (
          <EmptyState
            title="No runs yet"
            message="Send a command from the live feed to start your first run."
            actionLabel="Go to live feed"
            onAction={() => navigation.navigate('LiveFeed')}
          />
        ) : (
          <FlatList
            data={runs}
            keyExtractor={(run) => run.runId}
            renderItem={({ item }) => {
              const s = runStatus(item);
              return (
                <Pressable
                  style={styles.row}
                  onPress={() => navigation.navigate('RunDetail', { runId: item.runId })}
                >
                  <View style={styles.rowTop}>
                    <Text style={[styles.status, { color: STATUS_COLOR[s] }]}>{s}</Text>
                    <Text style={styles.meta}>{item.logCount} events</Text>
                  </View>
                  <Text style={styles.started}>{new Date(item.startedAt).toLocaleString()}</Text>
                </Pressable>
              );
            }}
          />
        )}
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
    flex: 1,
    paddingHorizontal: 16,
  },
  heading: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  loading: {
    color: colors.textFaint,
    fontFamily: fonts.mono,
    fontSize: 13,
  },
  error: {
    color: colors.error,
    fontFamily: fonts.mono,
    fontSize: 13,
  },
  row: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  status: {
    fontFamily: fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  meta: {
    color: colors.textFaint,
    fontFamily: fonts.mono,
    fontSize: 11,
  },
  started: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
});

export default HistoryScreen;
