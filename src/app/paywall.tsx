import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { DemoNote } from '@/components/DemoNote';
import { formatMoney } from '@/lib/money';
import { PLANS, pricePerMonth, savingsPercent, type PlanId } from '@/lib/plans';
import { useIsPro } from '@/store/hooks';
import { useSession } from '@/store/session';
import { radius, space, useTheme } from '@/theme';

const BENEFITS = ['Unlimited entries', 'Search all your entries', 'Export the whole journal as text'];

export default function PaywallScreen() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const pro = useIsPro();
  const purchase = useSession((s) => s.purchase);
  const restore = useSession((s) => s.restore);

  const [planId, setPlanId] = useState<PlanId>('yearly');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function buy() {
    setBusy(true);
    setMessage(null);
    try {
      await purchase(planId);
      router.back();
    } catch {
      setMessage('The payment did not go through. Nothing was charged. Try again.');
      setBusy(false);
    }
  }

  async function restorePurchases() {
    setBusy(true);
    const found = await restore().catch(() => false);
    setBusy(false);
    if (found) router.back();
    else setMessage('No earlier purchase was found for this account.');
  }

  if (pro) {
    return (
      <View style={[styles.done, { backgroundColor: colors.page }]}>
        <Text style={[styles.title, { color: colors.text }]}>You have Pro</Text>
        <Button title="Close" variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.page }}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.xl }]}>
      <Text style={[styles.title, { color: colors.text }]}>Write without limits</Text>
      <View style={styles.benefits}>
        {BENEFITS.map((b) => (
          <Text key={b} style={[styles.benefit, { color: colors.text }]}>
            <Text style={{ color: colors.accent }}>✓ </Text>
            {b}
          </Text>
        ))}
      </View>

      <View style={styles.plans} accessibilityRole="radiogroup">
        {PLANS.map((plan) => {
          const selected = plan.id === planId;
          const saving = savingsPercent(plan);
          return (
            <Pressable
              key={plan.id}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setPlanId(plan.id)}
              style={[
                styles.plan,
                {
                  backgroundColor: colors.card,
                  borderColor: selected ? colors.accent : colors.border,
                  borderWidth: selected ? 2 : StyleSheet.hairlineWidth,
                },
              ]}>
              <View style={styles.planMain}>
                <Text style={[styles.planTitle, { color: colors.text }]}>{plan.title}</Text>
                <Text style={[styles.planSub, { color: colors.textSecondary }]}>
                  {plan.months > 1
                    ? `${formatMoney(pricePerMonth(plan), plan.currency)} / month, billed yearly`
                    : 'Billed every month'}
                </Text>
              </View>
              <View style={styles.planRight}>
                {saving > 0 && (
                  <Text style={[styles.badge, { backgroundColor: colors.accent, color: colors.onAccent }]}>
                    Save {saving}%
                  </Text>
                )}
                <Text style={[styles.planPrice, { color: colors.text }]}>{formatMoney(plan.price, plan.currency)}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <DemoNote>No money is charged. The purchase is saved to this account on this phone.</DemoNote>

      {message && (
        <Text accessibilityLiveRegion="polite" style={[styles.message, { color: colors.danger }]}>
          {message}
        </Text>
      )}

      <Button title={busy ? 'Processing…' : 'Continue'} disabled={busy} onPress={buy} />
      <Pressable accessibilityRole="button" disabled={busy} onPress={restorePurchases} hitSlop={8}>
        <Text style={[styles.restore, { color: colors.accent }]}>Restore purchases</Text>
      </Pressable>
      <Text style={[styles.fine, { color: colors.textMuted }]}>
        The plan renews automatically until you cancel it in Account. After cancelling, Pro stays on until the end
        of the paid period.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.md, gap: space.md },
  done: { flex: 1, padding: space.md, gap: space.lg, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center' },
  benefits: { gap: space.sm, alignSelf: 'center' },
  benefit: { fontSize: 17 },
  plans: { gap: space.sm },
  plan: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.md },
  planMain: { flex: 1 },
  planTitle: { fontSize: 17, fontWeight: '700' },
  planSub: { fontSize: 14, marginTop: 2 },
  planRight: { alignItems: 'flex-end', gap: space.xs },
  badge: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  planPrice: { fontSize: 17, fontWeight: '700' },
  message: { fontSize: 15 },
  restore: { fontSize: 16, fontWeight: '500', textAlign: 'center' },
  fine: { fontSize: 12, lineHeight: 17, textAlign: 'center' },
});
