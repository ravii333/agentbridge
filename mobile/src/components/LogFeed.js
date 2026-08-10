import { useEffect, useRef } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme.js';
import groupLogs from '../utils/groupLogs.js';
import ToolUseCard from './ToolUseCard.js';

function timeLabel(timestamp) {
  return timestamp ? new Date(timestamp).toLocaleTimeString() : '';
}

function RunMarker({ item }) {
  if (item.type === 'run_started') {
    const sessionId = item.data.sessionId;
    return (
      <Text style={styles.marker}>
        RUN STARTED{sessionId ? ` · ${sessionId.slice(0, 8)}` : ''}
      </Text>
    );
  }

  const failed = item.data.ok === false;
  return (
    <Text style={[styles.marker, { color: failed ? colors.error : colors.success }]}>
      RUN {failed ? 'FAILED' : 'FINISHED'}{item.data.summary ? ` · ${item.data.summary}` : ''}
    </Text>
  );
}

function LogItem({ item }) {
  switch (item.type) {
    case 'text':
      return (
        <View>
          <Text style={styles.assistantText}>{item.data.text}</Text>
          <Text style={styles.time}>{timeLabel(item.timestamp)}</Text>
        </View>
      );
    case 'tool':
      return <ToolUseCard tool={item.tool} input={item.input} result={item.result} />;
    case 'run_started':
    case 'run_finished':
      return <RunMarker item={item} />;
    case 'error':
      return <Text style={styles.errorBubble}>{item.data.message}</Text>;
    case 'notice':
      return <Text style={styles.noticeBubble}>{item.data.message}</Text>;
    default:
      return <Text style={styles.assistantText}>{item.data?.message || JSON.stringify(item.data)}</Text>;
  }
}

function LogFeed({ logs, autoScroll = false }) {
  const items = groupLogs(logs);
  const listRef = useRef(null);

  useEffect(() => {
    if (autoScroll && items.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [items.length, autoScroll]);

  if (items.length === 0) {
    return <Text style={styles.empty}>No logs yet</Text>;
  }

  return (
    <FlatList
      ref={listRef}
      data={items}
      keyExtractor={(item, index) => item.toolUseId || `${item.type}-${index}`}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <LogItem item={item} />
        </View>
      )}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
    paddingBottom: 8,
  },
  item: {
    marginBottom: 10,
  },
  empty: {
    color: colors.textFaint,
    fontFamily: fonts.mono,
    fontStyle: 'italic',
    fontSize: 13,
  },
  assistantText: {
    color: colors.text,
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 22,
  },
  time: {
    color: colors.textFaint,
    fontFamily: fonts.mono,
    fontSize: 11,
    marginTop: 4,
  },
  marker: {
    alignSelf: 'center',
    color: colors.textFaint,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.5,
    paddingVertical: 6,
    textAlign: 'center',
  },
  errorBubble: {
    backgroundColor: colors.errorDim,
    color: colors.error,
    fontFamily: fonts.mono,
    fontSize: 13,
    padding: 10,
    borderRadius: 8,
  },
  noticeBubble: {
    backgroundColor: colors.surfaceRaised,
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: 12,
    padding: 10,
    borderRadius: 8,
  },
});

export default LogFeed;
