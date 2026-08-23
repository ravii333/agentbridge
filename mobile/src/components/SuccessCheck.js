import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme.js';

function SuccessCheck({ size = 64 }) {
  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: colors.success,
        },
      ]}
    >
      <Text style={[styles.check, { fontSize: size * 0.4, color: colors.success }]}>✓</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: 'rgba(74, 222, 128, 0.13)',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  check: {
    fontWeight: '700',
  },
});

export default SuccessCheck;
