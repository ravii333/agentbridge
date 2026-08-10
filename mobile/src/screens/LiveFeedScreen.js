import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAgent } from '../context/AgentContext.js';
import TopBar from '../components/TopBar.js';
import LogFeed from '../components/LogFeed.js';
import Composer from '../components/Composer.js';
import { colors } from '../theme.js';

function LiveFeedScreen() {
  const { status, logs, commandError, recentCommands, sendCommand } = useAgent();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TopBar state={status?.state} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.feed}>
          <LogFeed logs={logs} autoScroll />
        </View>

        <View style={styles.composer}>
          <Composer onSend={sendCommand} error={commandError} recent={recentCommands} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  feed: {
    flex: 1,
    paddingHorizontal: 16,
  },
  composer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

export default LiveFeedScreen;
