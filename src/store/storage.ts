import Storage from 'expo-sqlite/kv-store';
import type { StateStorage } from 'zustand/middleware';

// Sync storage: receipts are on screen from the first frame, no empty flash.
export const storage: StateStorage = {
  getItem: (key) => Storage.getItemSync(key),
  setItem: (key, value) => Storage.setItemSync(key, value),
  removeItem: (key) => Storage.removeItemSync(key),
};
