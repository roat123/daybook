import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Entitlement, PlanId } from '@/lib/plans';
import { auth, billing } from '@/services';
import type { User } from '@/services/auth';

import { useEntries } from './entries';
import { storage } from './storage';

type SessionState = {
  user: User | null;
  entitlement: Entitlement | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  deleteAccount: () => Promise<void>;
  purchase: (planId: PlanId) => Promise<void>;
  restore: () => Promise<boolean>;
  cancel: () => Promise<void>;
};

export const useSession = create<SessionState>()(
  persist(
    (set, get) => {
      const requireUser = () => {
        const user = get().user;
        if (!user) throw new Error('Not signed in');
        return user;
      };

      return {
        user: null,
        entitlement: null,

        async signIn(email, password) {
          const user = await auth.signIn(email, password);
          // A purchase belongs to the account, so it comes back after signing in again.
          set({ user, entitlement: await billing.restore(user.id) });
        },

        async signUp(email, password) {
          const user = await auth.signUp(email, password);
          set({ user, entitlement: null });
        },

        signOut: () => set({ user: null, entitlement: null }),

        async deleteAccount() {
          const user = requireUser();
          await billing.forget(user.id);
          await auth.deleteAccount(user.id);
          useEntries.getState().removeAllFor(user.id);
          set({ user: null, entitlement: null });
        },

        async purchase(planId) {
          const user = requireUser();
          set({ entitlement: await billing.purchase(user.id, planId) });
        },

        async restore() {
          const entitlement = await billing.restore(requireUser().id);
          set({ entitlement });
          return entitlement !== null;
        },

        async cancel() {
          set({ entitlement: await billing.cancel(requireUser().id) });
        },
      };
    },
    {
      name: 'session',
      storage: createJSONStorage(() => storage),
      partialize: (s) => ({ user: s.user, entitlement: s.entitlement }),
    },
  ),
);
