import { formatShortDate } from './dates';

export const MOODS = ['😞', '😕', '😐', '🙂', '😄'] as const;
export type Mood = 1 | 2 | 3 | 4 | 5;
export const MOOD_LABELS: Record<Mood, string> = { 1: 'Bad', 2: 'Low', 3: 'Okay', 4: 'Good', 5: 'Great' };

export type Entry = {
  id: string;
  userId: string;
  text: string;
  mood: Mood;
  createdAt: string;
  updatedAt: string;
};

export const MAX_ENTRY_LENGTH = 5000;

/** Newest first. */
export function sortEntries(entries: Entry[]): Entry[] {
  return [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Case-insensitive search; every word of the query must appear in the entry. */
export function searchEntries(entries: Entry[], query: string): Entry[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return entries;
  return entries.filter((e) => {
    const text = e.text.toLowerCase();
    return words.every((w) => text.includes(w));
  });
}

/** Plain text that can be pasted anywhere: date, mood, text. */
export function exportText(entries: Entry[]): string {
  return sortEntries(entries)
    .map((e) => {
      const date = new Date(e.createdAt);
      return `${formatShortDate(date)} ${date.getFullYear()} · ${MOOD_LABELS[e.mood]}\n${e.text.trim()}`;
    })
    .join('\n\n---\n\n');
}

export function preview(text: string, max = 120): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
}
