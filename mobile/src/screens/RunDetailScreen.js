import { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchRunLogs } from '../api/rest.js';
import LogFeed from '../components/LogFeed.js';
import { colors, fonts } from '../theme.js';

function RunDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { runId } = route.params;
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchRunLogs(runId)
      .then(({ logs: fetched }) => {
        if (!cancelled) setLogs(fetched);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [runId]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.back}>&lt; back</Text>
        </Pressable>
        <Text style={styles.title}>{runId.slice(0, 8)}</Text>
      </View>

      <View style={styles.content}>
        {error && <Text style={styles.error}>{error}</Text>}
        <LogFeed logs={logs} />
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
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  back: {
    color: colors.accent,
    fontFamily: fonts.mono,
    fontSize: 13,
  },
  title: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: 13,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  error: {
    color: colors.error,
    fontFamily: fonts.mono,
    fontSize: 13,
    marginBottom: 10,
  },
});

export default RunDetailScreen;
