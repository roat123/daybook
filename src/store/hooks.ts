import { useMemo } from 'react';

import { sortEntries } from '@/lib/entries';
import { isPro } from '@/lib/plans';

import { useEntries } from './entries';
import { useSession } from './session';

/** Entries of the signed-in user, newest first. */
export function useMyEntries() {
  const userId = useSession((s) => s.user?.id);
  const all = useEntries((s) => s.entries);
  return useMemo(() => sortEntries(all.filter((e) => e.userId === userId)), [all, userId]);
}

export function useIsPro() {
  const entitlement = useSession((s) => s.entitlement);
  return isPro(entitlement, new Date());
}
