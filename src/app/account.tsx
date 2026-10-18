import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, ScrollView, Share, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { formatShortDate } from '@/lib/dates';
import { exportText } from '@/lib/entries';
import { getPlan } from '@/lib/plans';
import { useIsPro, useMyEntries } from '@/store/hooks';
import { useSession } from '@/store/session';
import { radius, space, useTheme } from '@/theme';

/** Asks before a destructive action; on web (previews) there is no native dialog. */
function confirm(title: string, message: string, action: string, onConfirm: () => void) {
  if (Platform.OS === 'web') return onConfirm();
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: action, style: 'destructive', onPress: onConfirm },
  ]);
}

export default function AccountScreen() {
  const colors = useTheme();
  const { user, entitlement, signOut, cancel, deleteAccount } = useSession();
  const pro = useIsPro();
  const entries = useMyEntries();
  const [busy, setBusy] = useState(false);

  const ends = entitlement ? new Date(entitlement.expiresAt) : null;
  const endsText = ends ? `${formatShortDate(ends)} ${ends.getFullYear()}` : '';

  async function exportJournal() {
    await Share.share({ message: exportText(entries) });
  }

  function cancelPlan() {
    confirm('Cancel Pro?', `Pro stays on until ${endsText}.`, 'Cancel plan', async () => {
      setBusy(true);
      await cancel();
      setBusy(false);
    });
  }

  function removeAccount() {
    confirm(
      'Delete account?',
      'Your account, all entries and the purchase on this phone will be deleted. This cannot be undone.',
      'Delete',
      async () => {
        setBusy(true);
        await deleteAccount();
      },
    );
  }

  const card = [styles.card, { backgroundColor: colors.card, borderColor: colors.border }];

  return (
    <ScrollView style={{ backgroundColor: colors.page }} contentContainerStyle={styles.content}>
      <View style={card}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Signed in as</Text>
        <Text style={[styles.value, { color: colors.text }]}>{user?.email}</Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </Text>
      </View>

      <View style={card}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Plan</Text>
        {pro && entitlement ? (
          <>
            <Text style={[styles.value, { color: colors.text }]}>Pro · {getPlan(entitlement.planId).title}</Text>
            <Text style={[styles.label, { color: entitlement.cancelled ? colors.warning : colors.textSecondary }]}>
              {entitlement.cancelled ? `Cancelled, Pro ends on ${endsText}` : `Renews on ${endsText}`}
            </Text>
            <View style={styles.actions}>
              <Button title="Export journal" variant="secondary" onPress={exportJournal} />
              {!entitlement.cancelled && (
                <Button title="Cancel plan" variant="danger" disabled={busy} onPress={cancelPlan} />
              )}
            </View>
          </>
        ) : (
          <>
            <Text style={[styles.value, { color: colors.text }]}>Free</Text>
            <View style={styles.actions}>
              <Button title="Go Pro" onPress={() => router.push('/paywall')} />
            </View>
          </>
        )}
      </View>

      <View style={styles.actions}>
        <Button title="Sign out" variant="secondary" disabled={busy} onPress={signOut} />
        <Button title="Delete account" variant="danger" disabled={busy} onPress={removeAccount} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.md, gap: space.md },
  card: { borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, padding: space.md, gap: space.xs },
  label: { fontSize: 14 },
  value: { fontSize: 18, fontWeight: '600' },
  actions: { gap: space.sm, marginTop: space.sm },
});
