import { exportText, preview, searchEntries, sortEntries, type Entry } from '@/lib/entries';
import {
  canAddEntry,
  FREE_ENTRY_LIMIT,
  getPlan,
  isPro,
  newEntitlement,
  pricePerMonth,
  renewIfDue,
  savingsPercent,
} from '@/lib/plans';
import { isValidEmail, normalizeEmail, passwordProblem } from '@/lib/validation';
import { AuthError, createDemoAuth } from '@/services/auth';
import { createDemoBilling } from '@/services/billing';

const now = new Date(2026, 9, 18, 12, 0);

describe('validation', () => {
  it('checks emails', () => {
    expect(isValidEmail('anna@example.com')).toBe(true);
    expect(isValidEmail('  Anna@Example.COM ')).toBe(true);
    expect(isValidEmail('anna@example')).toBe(false);
    expect(isValidEmail('anna example.com')).toBe(false);
    expect(normalizeEmail('  Anna@Example.COM ')).toBe('anna@example.com');
  });

  it('asks for a long password with letters and numbers', () => {
    expect(passwordProblem('short1')).toMatch(/at least 8/);
    expect(passwordProblem('onlyletters')).toMatch(/letters and numbers/);
    expect(passwordProblem('12345678')).toMatch(/letters and numbers/);
    expect(passwordProblem('daybook2026')).toBeNull();
  });
});

describe('plans', () => {
  it('shows the yearly saving and the price per month', () => {
    expect(savingsPercent(getPlan('yearly'))).toBe(44);
    expect(savingsPercent(getPlan('monthly'))).toBe(0);
    expect(pricePerMonth(getPlan('yearly'))).toBe(1.67);
  });

  it('gives Pro until the plan ends', () => {
    const e = newEntitlement('monthly', now);
    expect(isPro(e, now)).toBe(true);
    expect(isPro(null, now)).toBe(false);
    expect(new Date(e.expiresAt).getMonth()).toBe(10);
  });

  it('renews a plan that was not cancelled', () => {
    const e = newEntitlement('monthly', now);
    const later = new Date(2027, 0, 20);
    const renewed = renewIfDue(e, later);
    expect(new Date(renewed.expiresAt).getTime()).toBeGreaterThan(later.getTime());
    expect(isPro(e, later)).toBe(true);
    expect(renewIfDue(e, now)).toBe(e);
  });

  it('stops a cancelled plan at the end of the paid time', () => {
    const e = { ...newEntitlement('monthly', now), cancelled: true };
    expect(isPro(e, new Date(2026, 10, 1))).toBe(true);
    expect(isPro(e, new Date(2026, 10, 19))).toBe(false);
  });

  it('limits free accounts', () => {
    expect(canAddEntry(FREE_ENTRY_LIMIT - 1, false)).toBe(true);
    expect(canAddEntry(FREE_ENTRY_LIMIT, false)).toBe(false);
    expect(canAddEntry(500, true)).toBe(true);
  });
});

describe('entries', () => {
  const entry = (id: string, text: string, createdAt: string): Entry => ({
    id,
    userId: 'u1',
    text,
    mood: 4,
    createdAt,
    updatedAt: createdAt,
  });
  const list = [
    entry('a', 'Walked by the river, felt calm', '2026-10-16T08:00:00.000Z'),
    entry('b', 'Busy day at work. River of emails', '2026-10-18T08:00:00.000Z'),
    entry('c', 'Cooked soup', '2026-10-17T08:00:00.000Z'),
  ];

  it('sorts newest first', () => {
    expect(sortEntries(list).map((e) => e.id)).toEqual(['b', 'c', 'a']);
  });

  it('finds entries that contain every word, ignoring case', () => {
    expect(searchEntries(list, 'river').map((e) => e.id)).toEqual(['a', 'b']);
    expect(searchEntries(list, 'RIVER calm').map((e) => e.id)).toEqual(['a']);
    expect(searchEntries(list, '   ')).toHaveLength(3);
  });

  it('exports plain text, newest first', () => {
    const text = exportText(list);
    expect(text.indexOf('Busy day')).toBeLessThan(text.indexOf('Cooked soup'));
    expect(text).toContain('Good');
    expect(text.split('---')).toHaveLength(3);
  });

  it('shortens long text for the list', () => {
    expect(preview('a  b\n\nc')).toBe('a b c');
    expect(preview('x'.repeat(200), 10)).toBe(`${'x'.repeat(9)}…`);
  });
});

describe('demo auth', () => {
  function setup() {
    let saved: string | null = null;
    let n = 0;
    const auth = createDemoAuth({
      read: () => saved,
      write: (v) => {
        saved = v;
      },
      hash: async (p, s) => `${s}|${p.split('').reverse().join('')}`,
      newSalt: () => `salt${n}`,
      newId: () => `user${n++}`,
    });
    return { auth, stored: () => saved ?? '' };
  }

  it('signs up and signs in with the same email in any case', async () => {
    const { auth } = setup();
    const user = await auth.signUp(' Anna@Example.com ', 'daybook2026');
    expect(user.email).toBe('anna@example.com');
    await expect(auth.signIn('ANNA@example.com', 'daybook2026')).resolves.toEqual(user);
  });

  it('never stores the password itself', async () => {
    const { auth, stored } = setup();
    await auth.signUp('anna@example.com', 'daybook2026');
    expect(stored()).not.toContain('daybook2026');
  });

  it('gives the same error for a wrong password and an unknown email', async () => {
    const { auth } = setup();
    await auth.signUp('anna@example.com', 'daybook2026');
    await expect(auth.signIn('anna@example.com', 'wrong2026')).rejects.toMatchObject({ code: 'wrong-credentials' });
    await expect(auth.signIn('nobody@example.com', 'daybook2026')).rejects.toMatchObject({
      code: 'wrong-credentials',
    });
  });

  it('rejects a taken email, a bad email and a weak password', async () => {
    const { auth } = setup();
    await auth.signUp('anna@example.com', 'daybook2026');
    await expect(auth.signUp('anna@example.com', 'other2026x')).rejects.toBeInstanceOf(AuthError);
    await expect(auth.signUp('anna', 'daybook2026')).rejects.toMatchObject({ code: 'invalid-email' });
    await expect(auth.signUp('bob@example.com', 'short')).rejects.toMatchObject({ code: 'weak-password' });
  });

  it('deletes an account', async () => {
    const { auth } = setup();
    const user = await auth.signUp('anna@example.com', 'daybook2026');
    await auth.deleteAccount(user.id);
    await expect(auth.signIn('anna@example.com', 'daybook2026')).rejects.toMatchObject({ code: 'wrong-credentials' });
  });
});

describe('demo billing', () => {
  function setup(at: () => Date) {
    const db = new Map<string, string>();
    return createDemoBilling({
      read: (k) => db.get(k) ?? null,
      write: (k, v) => void db.set(k, v),
      remove: (k) => void db.delete(k),
      now: at,
    });
  }

  it('buys, restores and cancels a plan per account', async () => {
    let clock = now;
    const billing = setup(() => clock);
    await billing.purchase('u1', 'yearly');
    expect(await billing.restore('u2')).toBeNull();

    const restored = await billing.restore('u1');
    expect(restored?.planId).toBe('yearly');

    const cancelled = await billing.cancel('u1');
    expect(cancelled?.cancelled).toBe(true);
    expect(isPro(cancelled, clock)).toBe(true);

    clock = new Date(2027, 11, 1);
    expect(isPro(await billing.restore('u1'), clock)).toBe(false);

    await billing.forget('u1');
    expect(await billing.restore('u1')).toBeNull();
  });
});
