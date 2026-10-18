import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';

import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { MIN_PASSWORD_LENGTH } from '@/lib/validation';
import { authErrorMessage } from '@/services/auth';
import { useSession } from '@/store/session';
import { space, useTheme } from '@/theme';

export default function SignUpScreen() {
  const colors = useTheme();
  const signUp = useSession((s) => s.signUp);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (password !== repeat) return setError('The passwords do not match');
    setBusy(true);
    setError(null);
    try {
      await signUp(email, password);
      // The guard in _layout switches to the journal by itself.
    } catch (e) {
      setError(authErrorMessage(e));
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={{ backgroundColor: colors.page }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
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
          placeholder={`At least ${MIN_PASSWORD_LENGTH} characters, letters and numbers`}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <Field
          label="Repeat password"
          value={repeat}
          onChangeText={setRepeat}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          onSubmitEditing={submit}
        />
        {error && (
          <Text accessibilityLiveRegion="polite" style={[styles.error, { color: colors.danger }]}>
            {error}
          </Text>
        )}
        <Button title={busy ? 'Creating account…' : 'Create account'} disabled={busy} onPress={submit} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.md, gap: space.md },
  error: { fontSize: 15 },
});
