import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { colors, fonts, radii } from '../theme.js';
import DiffView from './DiffView.js';
import isDiffable from '../utils/isDiffableTool.js';

function formatBlock(value) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

const STATUS_COLOR = {
  ok: colors.success,
  error: colors.error,
  running: colors.queued,
};

function ToolUseCard({ tool, input, result }) {
  const [open, setOpen] = useState(false);
  const status = !result ? 'running' : result.ok ? 'ok' : 'error';
  const icon = status === 'ok' ? '✓' : status === 'error' ? '✕' : '…';
  const detail = input?.file_path || input?.path || input?.command || input?.pattern;
  const borderColor = status === 'ok' ? '#1f3a29' : status === 'error' ? '#5c2323' : colors.border;

  return (
    <View style={[styles.card, { borderColor }]}>
      <Pressable style={styles.header} onPress={() => setOpen((v) => !v)}>
        <Text style={styles.chevron}>{open ? '›' : '›'}</Text>
        <Text style={styles.name} numberOfLines={1}>
          <Text style={styles.nameStrong}>{tool}</Text>
          {detail ? <Text style={styles.nameDetail}> {String(detail)}</Text> : null}
        </Text>
        <Text style={[styles.icon, { color: STATUS_COLOR[status] }]}>{icon}</Text>
      </Pressable>

      {open && (
        <View style={styles.body}>
          <View>
            <Text style={styles.label}>{isDiffable(tool, input) ? 'changes:' : 'input:'}</Text>
            {isDiffable(tool, input) ? (
              <DiffView input={input} />
            ) : (
              <ScrollView horizontal style={styles.pre}>
                <Text style={styles.preText}>{formatBlock(input)}</Text>
              </ScrollView>
            )}
          </View>

          {result && (
            <View>
              <Text style={[styles.label, status === 'error' && { color: colors.error }]}>
                {status === 'error' ? 'error:' : 'output:'}
              </Text>
              <ScrollView
                horizontal
                style={[styles.pre, status === 'error' && { backgroundColor: colors.errorDim }]}
              >
                <Text style={[styles.preText, status === 'error' && { color: colors.error }]}>
                  {formatBlock(result.preview)}
                </Text>
              </ScrollView>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  chevron: {
    color: colors.textFaint,
    fontFamily: fonts.mono,
  },
  name: {
    flex: 1,
    fontFamily: fonts.mono,
    fontSize: 13,
  },
  nameStrong: {
    color: colors.text,
    fontWeight: '600',
  },
  nameDetail: {
    color: colors.textDim,
  },
  icon: {
    fontFamily: fonts.mono,
    fontSize: 13,
  },
  body: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 12,
    gap: 10,
  },
  label: {
    color: colors.textFaint,
    fontFamily: fonts.mono,
    fontSize: 11,
    marginBottom: 4,
  },
  pre: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    maxHeight: 200,
  },
  preText: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: 12,
    padding: 8,
  },
});

export default ToolUseCard;
