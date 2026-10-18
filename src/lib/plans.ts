import { addMonths } from './dates';

export type PlanId = 'monthly' | 'yearly';

export type Plan = { id: PlanId; title: string; price: number; currency: string; months: number };

export const PLANS: Plan[] = [
  { id: 'yearly', title: 'Yearly', price: 19.99, currency: 'USD', months: 12 },
  { id: 'monthly', title: 'Monthly', price: 2.99, currency: 'USD', months: 1 },
];

export function getPlan(id: PlanId): Plan {
  const plan = PLANS.find((p) => p.id === id);
  if (!plan) throw new Error(`Unknown plan: ${id}`);
  return plan;
}

/** How much cheaper the plan is than paying monthly for the same time, in whole percent. */
export function savingsPercent(plan: Plan): number {
  const monthly = getPlan('monthly');
  const full = monthly.price * plan.months;
  return Math.max(0, Math.round((1 - plan.price / full) * 100));
}

export function pricePerMonth(plan: Plan): number {
  return Math.round((plan.price / plan.months) * 100) / 100;
}

/** What the user bought. Dates are ISO strings so the object can be saved as JSON. */
export type Entitlement = {
  planId: PlanId;
  startedAt: string;
  expiresAt: string;
  /** Cancelled plans stay active until expiresAt and then stop. */
  cancelled: boolean;
};

export function newEntitlement(planId: PlanId, now: Date): Entitlement {
  return {
    planId,
    startedAt: now.toISOString(),
    expiresAt: addMonths(now, getPlan(planId).months).toISOString(),
    cancelled: false,
  };
}

/** A plan that was not cancelled renews by itself, like a store subscription. */
export function renewIfDue(entitlement: Entitlement, now: Date): Entitlement {
  if (entitlement.cancelled) return entitlement;
  let expires = new Date(entitlement.expiresAt);
  const months = getPlan(entitlement.planId).months;
  while (expires.getTime() <= now.getTime()) expires = addMonths(expires, months);
  return expires.toISOString() === entitlement.expiresAt ? entitlement : { ...entitlement, expiresAt: expires.toISOString() };
}

export function isPro(entitlement: Entitlement | null, now: Date): boolean {
  if (!entitlement) return false;
  return new Date(renewIfDue(entitlement, now).expiresAt).getTime() > now.getTime();
}

export const FREE_ENTRY_LIMIT = 10;

export function canAddEntry(entryCount: number, pro: boolean): boolean {
  return pro || entryCount < FREE_ENTRY_LIMIT;
}
