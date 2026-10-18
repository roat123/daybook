import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { formatShortDate } from '@/lib/dates';
import { MOODS, preview, searchEntries, type Entry } from '@/lib/entries';
import { canAddEntry, FREE_ENTRY_LIMIT } from '@/lib/plans';
import { useIsPro, useMyEntries } from '@/store/hooks';
import { radius, space, useTheme } from '@/theme';

function EntryRow({ entry }: { entry: Entry }) {
  const colors = useTheme();
  const date = new Date(entry.createdAt);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/entry', params: { id: entry.id } })}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.75 : 1 },
      ]}>
      <Text style={styles.mood}>{MOODS[entry.mood - 1]}</Text>
      <View style={styles.rowMain}>
        <Text style={[styles.rowDate, { color: colors.textSecondary }]}>
          {formatShortDate(date)} · {String(date.getHours()).padStart(2, '0')}:
          {String(date.getMinutes()).padStart(2, '0')}
        </Text>
        <Text style={[styles.rowText, { color: colors.text }]} numberOfLines={2}>
          {preview(entry.text)}
        </Text>
      </View>
    </Pressable>
  );
}

export default function JournalScreen() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const entries = useMyEntries();
  const pro = useIsPro();
  const [query, setQuery] = useState('');

  const visible = pro ? searchEntries(entries, query) : entries;
  const left = FREE_ENTRY_LIMIT - entries.length;

  function newEntry() {
    if (canAddEntry(entries.length, pro)) router.push('/entry');
    else router.push('/paywall');
  }

  const header = (
    <View style={styles.header}>
      {pro ? (
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search your entries"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Search your entries"
          clearButtonMode="while-editing"
          style={[styles.search, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
        />
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/paywall')}
          style={[styles.banner, { backgroundColor: colors.accentSoft }]}>
          <View style={styles.bannerText}>
            <Text style={[styles.bannerTitle, { color: colors.text }]}>
              {left > 0 ? `${left} of ${FREE_ENTRY_LIMIT} free entries left` : 'You used all free entries'}
            </Text>
            <Text style={[styles.bannerSub, { color: colors.textSecondary }]}>
              Pro: unlimited entries, search and export
            </Text>
          </View>
          <Text style={[styles.bannerCta, { color: colors.accent }]}>Go Pro</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.page }]}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable accessibilityRole="button" hitSlop={12} onPress={() => router.push('/account')}>
              <Text style={[styles.headerLink, { color: colors.accent }]}>Account</Text>
            </Pressable>
          ),
        }}
      />
      <FlatList
        data={visible}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => <EntryRow entry={item} />}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {entries.length === 0 ? 'Write your first entry' : 'Nothing found'}
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {entries.length === 0
                ? 'How was your day? A few lines are enough. Only you can see them.'
                : 'Try other words.'}
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: space.sm }} />}
        contentContainerStyle={[styles.content, { paddingBottom: 96 + insets.bottom }]}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      />
      <View style={[styles.bottom, { paddingBottom: insets.bottom + space.sm, backgroundColor: colors.page }]}>
        <Button title="New entry" onPress={newEntry} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: space.md },
  header: { paddingBottom: space.md },
  headerLink: { fontSize: 17, fontWeight: '500' },
  search: {
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: space.md,
    fontSize: 16,
  },
  banner: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.md },
  bannerText: { flex: 1 },
  bannerTitle: { fontSize: 16, fontWeight: '600' },
  bannerSub: { fontSize: 14, marginTop: 2 },
  bannerCta: { fontSize: 16, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  mood: { fontSize: 28 },
  rowMain: { flex: 1 },
  rowDate: { fontSize: 13 },
  rowText: { fontSize: 16, lineHeight: 22, marginTop: 2 },
  empty: { paddingTop: space.lg, alignItems: 'center', paddingHorizontal: space.md },
  emptyTitle: { fontSize: 20, fontWeight: '600', marginBottom: space.sm },
  emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 21 },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: space.md, paddingTop: space.sm },
});
