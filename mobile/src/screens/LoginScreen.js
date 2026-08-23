import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext.js';
import Button from '../components/Button.js';
import Logo from '../components/Logo.js';
import { colors, fonts, radii } from '../theme.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function PasswordField({ value, onChangeText, placeholder }) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.passwordRow}>
      <TextInput
        style={[styles.input, styles.passwordInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        secureTextEntry={!visible}
        autoCapitalize="none"
      />
      <Pressable style={styles.reveal} onPress={() => setVisible((v) => !v)} hitSlop={8}>
        <Text style={styles.revealText}>{visible ? 'hide' : 'show'}</Text>
      </Pressable>
    </View>
  );
}

function LoginScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === 'register';

  const validate = () => {
    if (!EMAIL_RE.test(email.trim())) return 'Enter a valid email address';
    if (isRegister && password.length < 8) return 'Password must be at least 8 characters';
    if (isRegister && password !== confirmPassword) return 'Passwords do not match';
    return null;
  };

  const submit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = email.trim() && password && (!isRegister || confirmPassword);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.markWrap}>
            <Logo size={26} />
          </View>
          <Text style={styles.title}>agentbridge</Text>
          <Text style={styles.subtitle}>{isRegister ? 'Create an account' : 'Log in'}</Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="email"
            placeholderTextColor={colors.textFaint}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />

          <PasswordField value={password} onChangeText={setPassword} placeholder="password" />
          {isRegister && <Text style={styles.hint}>At least 8 characters</Text>}

          {isRegister && (
            <PasswordField
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="confirm password"
            />
          )}

          {error && <Text style={styles.error}>{error}</Text>}

          <Button
            label={submitting ? '…' : isRegister ? 'Create account' : 'Log in'}
            onPress={submit}
            disabled={submitting || !canSubmit}
          />

          <Text
            style={styles.toggle}
            onPress={() => {
              setError(null);
              setPassword('');
              setConfirmPassword('');
              setMode((m) => (m === 'login' ? 'register' : 'login'));
            }}
          >
            {isRegister ? 'Already have an account? Log in' : "Don't have an account? Create one"}
          </Text>
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
  markWrap: {
    alignItems: 'center',
  },
  title: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontFamily: fonts.mono,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  reveal: {
    position: 'absolute',
    right: 14,
  },
  revealText: {
    color: colors.accent,
    fontFamily: fonts.mono,
    fontSize: 11,
  },
  hint: {
    color: colors.textFaint,
    fontFamily: fonts.mono,
    fontSize: 11,
    marginTop: -6,
  },
  error: {
    color: colors.error,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
  toggle: {
    color: colors.accent,
    fontFamily: fonts.mono,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default LoginScreen;
