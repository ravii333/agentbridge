import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext.js';
import { claimAgent } from '../api/authApi.js';
import Button from '../components/Button.js';
import CodeInput from '../components/CodeInput.js';
import { colors, fonts } from '../theme.js';

function AddAgentScreen() {
  const navigation = useNavigation();
  const { token } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const formatted = code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : code;
      await claimAgent(token, formatted);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.content}>
          <Text style={styles.title}>Add agent</Text>
          <Text style={styles.body}>
            Start agent-client on your computer. It will print a code like{' '}
            <Text style={styles.code}>WXYZ-1234</Text>. Enter it below to link that machine to your
            account. Codes expire after 10 minutes.
          </Text>

          {success ? (
            <>
              <Text style={styles.success}>Agent linked! It should connect shortly.</Text>
              <Button label="Done" onPress={() => navigation.goBack()} />
            </>
          ) : (
            <>
              <CodeInput value={code} onChangeText={setCode} autoFocus />

              {error && <Text style={styles.error}>{error}</Text>}

              <Button
                label={submitting ? '…' : 'Link agent'}
                onPress={submit}
                disabled={submitting || code.length < 8}
              />
              <Button label="Cancel" variant="secondary" onPress={() => navigation.goBack()} />
            </>
          )}
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
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
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
  code: {
    color: colors.accent,
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
});

export default AddAgentScreen;
