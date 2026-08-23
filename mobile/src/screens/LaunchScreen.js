import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../components/Logo.js';
import { colors, fonts } from '../theme.js';

function LaunchScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Logo size={72} animated />
        <Text style={styles.title}>agentbridge</Text>
        <Text style={styles.caption}>starting up…</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 2,
  },
  caption: {
    position: 'absolute',
    bottom: 120,
    color: colors.textFaint,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
  },
});

export default LaunchScreen;
