import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, radii } from '../theme.js';

function Composer({ onSend, error, recent = [] }) {
  const [command, setCommand] = useState('');
  const [focused, setFocused] = useState(false);

  const send = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setCommand('');
  };

  return (
    <View>
      {recent.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recent}>
          {recent.map((item, index) => (
            <Pressable key={`${item}-${index}`} style={styles.chip} onPress={() => send(item)}>
              <Text style={styles.chipText} numberOfLines={1}>
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <View style={[styles.bar, focused && styles.barFocused]}>
        <Text style={styles.prompt}>&gt;</Text>
        <TextInput
          style={styles.input}
          value={command}
          onChangeText={setCommand}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="send a command"
          placeholderTextColor={colors.textFaint}
        />
        <Pressable
          style={[styles.send, !command.trim() && styles.sendDisabled]}
          onPress={() => send(command)}
          disabled={!command.trim()}
        >
          <Text style={styles.sendIcon}>&uarr;</Text>
        </Pressable>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  barFocused: {
    borderColor: colors.accent,
  },
  prompt: {
    color: colors.textFaint,
    fontFamily: fonts.mono,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.mono,
    paddingVertical: 8,
  },
  send: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    backgroundColor: colors.surfaceRaised,
  },
  sendIcon: {
    color: colors.bg,
    fontFamily: fonts.mono,
    fontWeight: '700',
  },
  errorBox: {
    marginTop: 8,
    backgroundColor: colors.errorDim,
    borderWidth: 1,
    borderColor: '#5c2323',
    borderRadius: 8,
    padding: 10,
  },
  errorText: {
    color: colors.error,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
  recent: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  chip: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginRight: 6,
    maxWidth: 220,
  },
  chipText: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
});

export default Composer;
