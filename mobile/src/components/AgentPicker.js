import { useEffect } from 'react';
import { FlatList, Modal, Pressable, Text, View, StyleSheet } from 'react-native';
import { colors, fonts, radii } from '../theme.js';
import Button from './Button.js';

function AgentPicker({ visible, onClose, agents, activeAgentId, onRefresh, onSelect }) {
  useEffect(() => {
    if (visible) onRefresh();
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.heading}>Your agents</Text>

          {agents.length === 0 ? (
            <Text style={styles.empty}>No agents paired yet. Add one from the button in the top bar.</Text>
          ) : (
            <FlatList
              style={styles.list}
              data={agents}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.row, item.id === activeAgentId && styles.rowActive]}
                  onPress={() => {
                    onSelect(item.id);
                    onClose();
                  }}
                >
                  <View style={[styles.dot, { backgroundColor: item.connected ? colors.success : colors.offline }]} />
                  <Text style={styles.rowText}>{item.name || 'My agent'}</Text>
                  <Text style={styles.rowStatus}>{item.connected ? 'connected' : 'offline'}</Text>
                </Pressable>
              )}
            />
          )}

          <View style={styles.actions}>
            <Button label="Close" variant="secondary" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: 16,
    maxHeight: '75%',
  },
  heading: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  empty: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: 12,
    marginBottom: 16,
  },
  list: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowActive: {
    opacity: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  rowText: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: 13,
  },
  rowStatus: {
    color: colors.textFaint,
    fontFamily: fonts.mono,
    fontSize: 11,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

export default AgentPicker;
