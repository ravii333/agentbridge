import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext.js';
import { useAgent } from '../context/AgentContext.js';
import { claimAgent } from '../api/authApi.js';
import Button from '../components/Button.js';
import CodeInput from '../components/CodeInput.js';
import SuccessCheck from '../components/SuccessCheck.js';
import AGENT_KINDS from '../utils/agentKinds.js';
import { colors, fonts, radii } from '../theme.js';

function stepsFor(kind) {
  const steps = [
    {
      n: '1',
      title: 'Open a terminal on that computer',
      body: `The one running ${kind.label}.`,
    },
    {
      n: '2',
      title: 'Run the agent',
      body: kind.command,
      mono: true,
      note: kind.envNote,
    },
    {
      n: '3',
      title: 'Copy the code it prints',
      body: 'A short code like WXYZ-1234 — it expires after 10 minutes.',
    },
  ];
  return steps;
}

function AddAgentScreen() {
  const navigation = useNavigation();
  const { token } = useAuth();
  const { refreshAgents } = useAgent();
  const [stage, setStage] = useState('instructions'); // instructions -> code -> success
  const [kind, setKind] = useState(AGENT_KINDS[0]);
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const steps = stepsFor(kind);

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const formatted = code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : code;
      await claimAgent(token, formatted);
      await refreshAgents();
      setStage('success');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {stage === 'instructions' && (
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>Connect a new agent</Text>
            <Text style={styles.body}>Get your agent talking to this phone in three steps.</Text>

            <Text style={styles.kindLabel}>Which are you setting up?</Text>
            <View style={styles.kindRow}>
              {AGENT_KINDS.map((k) => (
                <Pressable
                  key={k.id}
                  style={[styles.kindChip, k.id === kind.id && styles.kindChipActive]}
                  onPress={() => setKind(k)}
                >
                  <Text style={[styles.kindChipText, k.id === kind.id && styles.kindChipTextActive]}>{k.label}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.steps}>
              {steps.map((step) => (
                <View key={step.n} style={styles.stepRow}>
                  <View style={styles.stepN}>
                    <Text style={styles.stepNText}>{step.n}</Text>
                  </View>
                  <View style={styles.stepText}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={[styles.stepBody, step.mono && styles.stepMono]}>{step.body}</Text>
                    {step.note && <Text style={styles.stepNote}>{step.note}</Text>}
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.actions}>
              <Button label="I've got my code" onPress={() => setStage('code')} />
              <Button label="Cancel" variant="secondary" onPress={() => navigation.goBack()} />
            </View>
          </ScrollView>
        )}

        {stage === 'code' && (
          <View style={styles.content}>
            <Text style={styles.title}>Enter the code</Text>
            <Text style={styles.body}>
              Enter the code your agent printed, like <Text style={styles.codeHighlight}>WXYZ-1234</Text>.
            </Text>

            <CodeInput value={code} onChangeText={setCode} autoFocus />

            {error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.actions}>
              <Button
                label={submitting ? '…' : 'Link agent'}
                onPress={submit}
                disabled={submitting || code.length < 8}
              />
              <Button label="Back" variant="secondary" onPress={() => setStage('instructions')} />
            </View>
          </View>
        )}

        {stage === 'success' && (
          <View style={styles.content}>
            <SuccessCheck />
            <Text style={[styles.title, styles.centered]}>Agent linked</Text>
            <Text style={[styles.success, styles.centered]}>
              Your agent is now enabled on your phone. It should connect shortly.
            </Text>
            <View style={styles.actions}>
              <Button label="Done" onPress={() => navigation.goBack()} />
            </View>
          </View>
        )}
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
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 12,
  },
  centered: {
    textAlign: 'center',
  },
  title: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  body: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  codeHighlight: {
    color: colors.accent,
  },
  kindLabel: {
    color: colors.textFaint,
    fontFamily: fonts.mono,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  kindRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  kindChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  kindChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentDim,
  },
  kindChipText: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
  kindChipTextActive: {
    color: colors.accent,
    fontWeight: '700',
  },
  steps: {
    gap: 18,
    marginBottom: 20,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 14,
  },
  stepN: {
    width: 26,
    height: 26,
    borderRadius: radii.sm,
    backgroundColor: colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNText: {
    color: colors.accent,
    fontFamily: fonts.mono,
    fontWeight: '700',
    fontSize: 12,
  },
  stepText: {
    flex: 1,
  },
  stepTitle: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
  },
  stepBody: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: 12,
    lineHeight: 17,
  },
  stepMono: {
    color: colors.accent,
  },
  stepNote: {
    color: colors.queued,
    fontFamily: fonts.mono,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  error: {
    color: colors.error,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
  success: {
    color: colors.success,
    fontFamily: fonts.mono,
    fontSize: 14,
    marginBottom: 8,
  },
  actions: {
    gap: 10,
    marginTop: 8,
  },
});

export default AddAgentScreen;
