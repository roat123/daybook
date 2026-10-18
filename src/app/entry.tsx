import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Chips } from '@/components/Chips';
import { MAX_ENTRY_LENGTH, MOOD_LABELS, MOODS, type Mood } from '@/lib/entries';
import { newId } from '@/lib/id';
import { canAddEntry } from '@/lib/plans';
import { useEntries } from '@/store/entries';
import { useIsPro, useMyEntries } from '@/store/hooks';
import { useSession } from '@/store/session';
import { radius, space, useTheme } from '@/theme';

const MOOD_VALUES: readonly Mood[] = [1, 2, 3, 4, 5];

export default function EntryScreen() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const userId = useSession((s) => s.user?.id);
  const mine = useMyEntries();
  const pro = useIsPro();
  const existing = mine.find((e) => e.id === id);
  const { add, update, remove } = useEntries.getState();

  const [text, setText] = useState(existing?.text ?? '');
  const [mood, setMood] = useState<Mood>(existing?.mood ?? 4);
  const [error, setError] = useState<string | null>(null);

  function save() {
    if (!userId) return;
    if (!text.trim()) return setError('Write at least a few words');
    if (existing) {
      update(existing.id, { text: text.trim(), mood });
    } else {
      // Checked again here, not only on the list screen: the limit must hold whatever path led here.
      if (!canAddEntry(mine.length, pro)) return router.replace('/paywall');
      const now = new Date().toISOString();
      add({ id: newId(), userId, text: text.trim(), mood, createdAt: now, updatedAt: now });
    }
    router.back();
  }

  function confirmDelete() {
    if (!existing) return;
    const doRemove = () => {
      remove(existing.id);
      router.back();
    };
    if (Platform.OS === 'web') return doRemove();
    Alert.alert('Delete this entry?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: doRemove },
    ]);
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.page }}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.xl }]}
      keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: existing ? 'Edit entry' : 'New entry' }} />

      <Text style={[styles.label, { color: colors.textSecondary }]}>How do you feel?</Text>
      <Chips
        options={MOOD_VALUES}
        value={mood}
        onChange={setMood}
        label={(m) => `${MOODS[m - 1]} ${MOOD_LABELS[m]}`}
      />

      <Text style={[styles.label, { color: colors.textSecondary }]}>What happened today?</Text>
      <TextInput
        value={text}
        onChangeText={(t) => {
          setText(t);
          setError(null);
        }}
        multiline
        maxLength={MAX_ENTRY_LENGTH}
        placeholder="A few lines are enough…"
        placeholderTextColor={colors.textMuted}
        accessibilityLabel="Entry text"
        textAlignVertical="top"
        style={[styles.text, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
      />
      <Text style={[styles.counter, { color: colors.textMuted }]}>
        {text.length} / {MAX_ENTRY_LENGTH}
      </Text>

      {error && (
        <Text accessibilityLiveRegion="polite" style={[styles.error, { color: colors.danger }]}>
          {error}
        </Text>
      )}

      <Button title="Save" onPress={save} />
      {existing && <Button title="Delete entry" variant="danger" onPress={confirmDelete} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.md, gap: space.sm },
  label: { fontSize: 14, marginTop: space.sm },
  text: {
    minHeight: 200,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.md,
    fontSize: 17,
    lineHeight: 24,
  },
  counter: { fontSize: 13, textAlign: 'right' },
  error: { fontSize: 15 },
});
