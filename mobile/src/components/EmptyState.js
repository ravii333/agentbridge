import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme.js';
import Button from './Button.js';

function EmptyState({ title, message, actionLabel, onAction }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.mark}>{'{ }'}</Text>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {actionLabel && onAction && (
        <View style={styles.action}>
          <Button label={actionLabel} onPress={onAction} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  mark: {
    color: colors.textFaint,
    fontFamily: fonts.mono,
    fontSize: 22,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontWeight: '600',
    fontSize: 14,
  },
  message: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 280,
  },
  action: {
    marginTop: 8,
    alignSelf: 'stretch',
  },
});

export default EmptyState;
