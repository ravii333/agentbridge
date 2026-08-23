import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button.js';
import Logo from '../components/Logo.js';
import { colors, fonts } from '../theme.js';

const FEATURES = [
  { mark: '⌁', label: 'Pair in one command' },
  { mark: '✓', label: 'Approve before it touches anything' },
  { mark: '▤', label: 'Watch it work, live' },
];

function WelcomeScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.markWrap}>
            <Logo size={30} />
          </View>
          <Text style={styles.eyebrow}>agentbridge</Text>
          <Text style={styles.title}>Your coding agent.{'\n'}Right in your pocket.</Text>
          <Text style={styles.subtitle}>
            Pair the AI agent running on your PC with this app — watch it work and approve every
            tool call, from anywhere.
          </Text>
        </View>

        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.label} style={styles.featureRow}>
              <Text style={styles.featureMark}>{f.mark}</Text>
              <Text style={styles.featureLabel}>{f.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Button label="Get started" onPress={() => navigation.navigate('Login')} />
        </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  hero: {
    marginTop: 40,
  },
  markWrap: {
    marginBottom: 10,
  },
  eyebrow: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    marginBottom: 16,
  },
  subtitle: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: 14,
    lineHeight: 21,
  },
  features: {
    gap: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureMark: {
    color: colors.accent,
    fontFamily: fonts.mono,
    fontSize: 15,
    width: 20,
  },
  featureLabel: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: 13,
    flex: 1,
  },
  actions: {
    marginTop: 24,
  },
});

export default WelcomeScreen;
