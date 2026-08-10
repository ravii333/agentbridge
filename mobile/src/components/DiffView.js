import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme.js';
import diffLines from '../utils/diffLines.js';

const MAX_LINES = 300;

const MARKER = { add: '+', remove: '-', context: ' ' };

function editsToRows(edits) {
  const rows = [];
  edits.forEach((edit, index) => {
    if (index > 0) {
      rows.push({ type: 'divider' });
    }
    rows.push(...diffLines(edit.old_string, edit.new_string));
  });
  return rows;
}

function DiffView({ input }) {
  let rows;

  if (Array.isArray(input?.edits)) {
    rows = editsToRows(input.edits);
  } else if (typeof input?.old_string === 'string' || typeof input?.new_string === 'string') {
    rows = diffLines(input.old_string, input.new_string);
  } else if (typeof input?.content === 'string') {
    rows = input.content.split('\n').map((text) => ({ type: 'add', text }));
  } else {
    rows = [];
  }

  const truncated = rows.length > MAX_LINES;
  const visible = truncated ? rows.slice(0, MAX_LINES) : rows;

  return (
    <ScrollView horizontal style={styles.wrap}>
      <View>
        {visible.map((row, index) =>
          row.type === 'divider' ? (
            <View key={index} style={styles.divider} />
          ) : (
            <View key={index} style={[styles.row, row.type === 'add' && styles.add, row.type === 'remove' && styles.remove]}>
              <Text
                style={[
                  styles.marker,
                  row.type === 'add' && styles.addText,
                  row.type === 'remove' && styles.removeText,
                ]}
              >
                {MARKER[row.type]}
              </Text>
              <Text
                style={[
                  styles.line,
                  row.type === 'add' && styles.addText,
                  row.type === 'remove' && styles.removeText,
                ]}
              >
                {row.text || ' '}
              </Text>
            </View>
          ),
        )}
        {truncated && <Text style={styles.more}>… {rows.length - MAX_LINES} more lines</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    maxHeight: 260,
  },
  row: {
    flexDirection: 'row',
  },
  add: {
    backgroundColor: colors.successDim,
  },
  remove: {
    backgroundColor: colors.errorDim,
  },
  marker: {
    width: 16,
    textAlign: 'center',
    color: colors.textFaint,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
  line: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: 12,
    paddingVertical: 1,
    paddingRight: 12,
  },
  addText: {
    color: colors.success,
  },
  removeText: {
    color: colors.error,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  more: {
    color: colors.textFaint,
    fontFamily: fonts.mono,
    fontSize: 11,
    padding: 6,
  },
});

export default DiffView;
