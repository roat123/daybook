import { newId } from '@/lib/id';
import { hashPassword, newSalt } from '@/lib/password';
import { storage } from '@/store/storage';

import { createDemoAuth, type AuthProvider } from './auth';
import { createDemoBilling, type BillingProvider } from './billing';

// The one place that decides which services the app uses. To go live, swap the demo
// providers for real ones here; screens and stores do not change.
export const DEMO_MODE = true;

const read = (key: string) => storage.getItem(key) as string | null;

export const auth: AuthProvider = createDemoAuth({
  read: () => read('demo-users'),
  write: (value) => storage.setItem('demo-users', value),
  hash: hashPassword,
  newSalt,
  newId,
  delayMs: 400,
});

export const billing: BillingProvider = createDemoBilling({
  read,
  write: (key, value) => storage.setItem(key, value),
  remove: (key) => storage.removeItem(key),
  now: () => new Date(),
  delayMs: 800,
});
