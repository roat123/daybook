import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Entry } from '@/lib/entries';

import { storage } from './storage';

type EntriesState = {
  /** Entries of every account on this phone; screens filter by the signed-in user. */
  entries: Entry[];
  add: (entry: Entry) => void;
  update: (id: string, patch: Pick<Entry, 'text' | 'mood'>) => void;
  remove: (id: string) => void;
  removeAllFor: (userId: string) => void;
};

export const useEntries = create<EntriesState>()(
  persist(
    (set) => ({
      entries: [],
      add: (entry) => set((s) => ({ entries: [entry, ...s.entries] })),
      update: (id, patch) =>
        set((s) => ({
          entries: s.entries.map((e) => (e.id === id ? { ...e, ...patch, updatedAt: new Date().toISOString() } : e)),
        })),
      remove: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
      removeAllFor: (userId) => set((s) => ({ entries: s.entries.filter((e) => e.userId !== userId) })),
    }),
    {
      name: 'entries',
      storage: createJSONStorage(() => storage),
      partialize: (s) => ({ entries: s.entries }),
    },
  ),
);
