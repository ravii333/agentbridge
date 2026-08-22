import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAgent } from '../context/AgentContext.js';
import TopBar from '../components/TopBar.js';
import LogFeed from '../components/LogFeed.js';
import Composer from '../components/Composer.js';
import ApprovalPrompt from '../components/ApprovalPrompt.js';
import ApprovalModeNotice from '../components/ApprovalModeNotice.js';
import WorkspacePicker from '../components/WorkspacePicker.js';
import AgentPicker from '../components/AgentPicker.js';
import { colors } from '../theme.js';

function LiveFeedScreen() {
  const navigation = useNavigation();
  const {
    status,
    logs,
    commandError,
    recentCommands,
    sendCommand,
    pendingApprovals,
    respondApproval,
    browseWorkspace,
    setWorkspace,
    agents,
    activeAgentId,
    selectAgent,
    refreshAgents,
  } = useAgent();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [agentPickerVisible, setAgentPickerVisible] = useState(false);
  const activeAgent = agents.find((a) => a.id === activeAgentId);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TopBar
        state={status?.state}
        cwd={status?.cwd}
        agentName={activeAgent?.name}
        onPressAgents={() => setAgentPickerVisible(true)}
        onPressWorkspace={() => setPickerVisible(true)}
        onPressAddAgent={() => navigation.navigate('AddAgent')}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View style={styles.feed}>
          <LogFeed logs={logs} autoScroll />
        </View>

        <View style={styles.composer}>
          {status?.approvalMode === 'policy' ? (
            <ApprovalModeNotice agentKind={status?.agentKind} />
          ) : (
            <ApprovalPrompt
              approval={pendingApprovals[0]}
              onApprove={(id) => respondApproval(id, true)}
              onDeny={(id) => respondApproval(id, false)}
            />
          )}
          <Composer onSend={sendCommand} error={commandError} recent={recentCommands} />
        </View>
      </KeyboardAvoidingView>

      <WorkspacePicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        currentPath={status?.cwd}
        onBrowse={browseWorkspace}
        onSelect={setWorkspace}
      />

      <AgentPicker
        visible={agentPickerVisible}
        onClose={() => setAgentPickerVisible(false)}
        agents={agents}
        activeAgentId={activeAgentId}
        onRefresh={refreshAgents}
        onSelect={selectAgent}
      />
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
