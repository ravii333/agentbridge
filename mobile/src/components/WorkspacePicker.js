import { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii } from '../theme.js';
import Button from './Button.js';

function WorkspacePicker({ visible, onClose, currentPath, onBrowse, onSelect }) {
  const [listing, setListing] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (visible) {
      load(currentPath);
    }
  }, [visible]);

  const load = (path) => {
    setError(null);
    onBrowse(path)
      .then(setListing)
      .catch((err) => setError(err.message));
  };

  const confirm = async () => {
    if (!listing?.path) return;
    try {
      await onSelect(listing.path);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.heading}>Select workspace</Text>
          <Text style={styles.path} numberOfLines={2}>
            {listing?.path || currentPath || 'This PC'}
          </Text>

          {error && <Text style={styles.error}>{error}</Text>}

          <FlatList
            style={styles.list}
            data={listing?.entries || []}
            keyExtractor={(item) => item.name}
            ListHeaderComponent={
              listing?.parent !== undefined && listing?.parent !== null ? (
                <Pressable style={styles.row} onPress={() => load(listing.parent)}>
                  <Text style={styles.rowText}>.. (up)</Text>
                </Pressable>
              ) : null
            }
            renderItem={({ item }) => (
              <Pressable style={styles.row} onPress={() => load(item.path)}>
                <Text style={styles.rowText}>{item.name}</Text>
              </Pressable>
            )}
          />

          <View style={styles.actions}>
            <Button label="Cancel" variant="secondary" onPress={onClose} />
            <Button label="Select this folder" onPress={confirm} disabled={!listing?.path} />
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
    marginBottom: 4,
  },
  path: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: 12,
    marginBottom: 10,
  },
  error: {
    color: colors.error,
    fontFamily: fonts.mono,
    fontSize: 12,
    marginBottom: 10,
  },
  list: {
    marginBottom: 12,
  },
  row: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowText: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
});

export default WorkspacePicker;
