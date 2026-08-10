import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radii } from '../theme.js';

function Button({ label, onPress, variant = 'primary', disabled = false }) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.label, isPrimary ? styles.primaryLabel : styles.secondaryLabel, disabled && styles.disabledLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.surfaceRaised,
  },
  label: {
    fontFamily: fonts.mono,
    fontWeight: '600',
    fontSize: 13,
  },
  primaryLabel: {
    color: colors.bg,
  },
  secondaryLabel: {
    color: colors.text,
  },
  disabledLabel: {
    color: colors.textFaint,
  },
});

export default Button;
