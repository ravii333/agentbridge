import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// expo-secure-store has no real web implementation (its web module is an
// empty stub), so fall back to localStorage there. Native platforms keep
// using the OS keychain/keystore via SecureStore as before.
const webStorage = {
  getItemAsync: async (key) => window.localStorage.getItem(key),
  setItemAsync: async (key, value) => window.localStorage.setItem(key, value),
  deleteItemAsync: async (key) => window.localStorage.removeItem(key),
};

export const { getItemAsync, setItemAsync, deleteItemAsync } =
  Platform.OS === 'web' ? webStorage : SecureStore;
