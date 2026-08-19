import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, radii } from '../theme.js';

const LENGTH = 8;
const GROUP_SIZE = 4;

function CodeInput({ value, onChangeText, autoFocus }) {
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);

  const clean = value.replace(/[^A-Z0-9]/g, '').slice(0, LENGTH);
  const cursorIndex = clean.length;

  return (
    <Pressable style={styles.row} onPress={() => inputRef.current?.focus()}>
      {Array.from({ length: LENGTH }, (_, i) => (
        <View
          key={i}
          style={[
            styles.box,
            i === GROUP_SIZE && styles.groupGap,
            focused && i === cursorIndex && styles.boxActive,
            i < clean.length && styles.boxFilled,
          ]}
        >
          <Text style={styles.char}>{clean[i] || ''}</Text>
        </View>
      ))}

      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={clean}
        onChangeText={(v) => onChangeText(v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, LENGTH))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={LENGTH}
      />
    </Pressable>
  );
}

const BOX_SIZE = 36;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    marginHorizontal: 3,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupGap: {
    marginLeft: 12,
  },
  boxFilled: {
    borderColor: colors.textFaint,
  },
  boxActive: {
    borderColor: colors.accent,
  },
  char: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: 18,
    fontWeight: '700',
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
  },
});

export default CodeInput;
