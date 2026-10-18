import { newEntitlement, renewIfDue, type Entitlement, type PlanId } from '@/lib/plans';

/**
 * What the screens need from a payment service. The demo provider charges nothing and keeps the
 * purchase on the phone; a real one (RevenueCat, App Store / Google Play billing) implements the same calls.
 */
export interface BillingProvider {
  purchase(userId: string, planId: PlanId): Promise<Entitlement>;
  /** Finds an earlier purchase, for example after reinstalling or signing in on a new phone. */
  restore(userId: string): Promise<Entitlement | null>;
  cancel(userId: string): Promise<Entitlement | null>;
  forget(userId: string): Promise<void>;
}

export type DemoBillingDeps = {
  read: (key: string) => string | null;
  write: (key: string, value: string) => void;
  remove: (key: string) => void;
  now: () => Date;
  delayMs?: number;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function createDemoBilling(deps: DemoBillingDeps): BillingProvider {
  const key = (userId: string) => `entitlement:${userId}`;
  const pause = () => wait(deps.delayMs ?? 0);

  const load = (userId: string): Entitlement | null => {
    try {
      const raw = deps.read(key(userId));
      return raw ? (JSON.parse(raw) as Entitlement) : null;
    } catch {
      return null;
    }
  };
  const save = (userId: string, entitlement: Entitlement) => deps.write(key(userId), JSON.stringify(entitlement));

  return {
    async purchase(userId, planId) {
      await pause();
      const entitlement = newEntitlement(planId, deps.now());
      save(userId, entitlement);
      return entitlement;
    },

    async restore(userId) {
      await pause();
      const saved = load(userId);
      if (!saved) return null;
      const current = renewIfDue(saved, deps.now());
      if (current !== saved) save(userId, current);
      return current;
    },

    async cancel(userId) {
      await pause();
      const saved = load(userId);
      if (!saved) return null;
      const cancelled = { ...renewIfDue(saved, deps.now()), cancelled: true };
      save(userId, cancelled);
      return cancelled;
    },

    async forget(userId) {
      deps.remove(key(userId));
    },
  };
}
