import type { StateStorage } from 'zustand/middleware';

// The app is made for phones; on web (used for previews) localStorage is enough.
// It is missing during server rendering, so every call checks for it.
const hasStorage = () => typeof localStorage !== 'undefined';

export const storage: StateStorage = {
  getItem: (key) => (hasStorage() ? localStorage.getItem(key) : null),
  setItem: (key, value) => {
    if (hasStorage()) localStorage.setItem(key, value);
  },
  removeItem: (key) => {
    if (hasStorage()) localStorage.removeItem(key);
  },
};
