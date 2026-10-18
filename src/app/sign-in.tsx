import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { DemoNote } from '@/components/DemoNote';
import { Field } from '@/components/Field';
import { AuthError, authErrorMessage } from '@/services/auth';
import { useSession } from '@/store/session';
import { space, useTheme } from '@/theme';

// A ready account for people who only want to look around.
const DEMO_EMAIL = 'demo@daybook.app';
const DEMO_PASSWORD = 'demo2026';

export default function SignInScreen() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const signIn = useSession((s) => s.signIn);
  const signUp = useSession((s) => s.signUp);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(authErrorMessage(e));
      setBusy(false);
    }
  }

  const signInDemo = () =>
    run(async () => {
      try {
        await signIn(DEMO_EMAIL, DEMO_PASSWORD);
      } catch (e) {
        if (e instanceof AuthError && e.code === 'wrong-credentials') await signUp(DEMO_EMAIL, DEMO_PASSWORD);
        else throw e;
      }
    });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={{ backgroundColor: colors.page }}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + space.lg }]}
        keyboardShouldPersistTaps="handled">
        <Text style={[styles.logo, { color: colors.accent }]}>Daybook</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>A few lines a day. Private, simple, yours.</Text>

        <View style={styles.form}>
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            secureTextEntry
            autoComplete="current-password"
            textContentType="password"
            onSubmitEditing={() => run(() => signIn(email, password))}
          />
          {error && (
            <Text accessibilityLiveRegion="polite" style={[styles.error, { color: colors.danger }]}>
              {error}
            </Text>
          )}
          <Button title={busy ? 'Signing in…' : 'Sign in'} disabled={busy} onPress={() => run(() => signIn(email, password))} />
          <Link href="/sign-up" style={[styles.link, { color: colors.accent }]}>
            No account? Create one
          </Link>
        </View>

        <View style={styles.demo}>
          <DemoNote>Accounts and purchases are stored on this phone only. No email is sent and no money is charged.</DemoNote>
          <Button title="Continue with a demo account" variant="secondary" disabled={busy} onPress={signInDemo} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: space.md, gap: space.sm },
  logo: { fontSize: 40, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center' },
  form: { gap: space.md, marginTop: space.xl },
  error: { fontSize: 15 },
  link: { fontSize: 16, fontWeight: '500', textAlign: 'center', paddingVertical: space.sm },
  demo: { gap: space.md, marginTop: space.lg },
});
