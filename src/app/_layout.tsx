import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { useSession } from '@/store/session';
import { useTheme } from '@/theme';

export default function RootLayout() {
  const scheme = useColorScheme();
  const colors = useTheme();
  const signedIn = useSession((s) => s.user !== null);

  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = {
    ...base,
    colors: {
      ...base.colors,
      background: colors.page,
      card: colors.page,
      text: colors.text,
      primary: colors.accent,
      border: colors.border,
    },
  };

  return (
    <ThemeProvider value={theme}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShadowVisible: false }}>
        {/* Signed-out users can only reach these two screens, signed-in users only the rest. */}
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="sign-in" options={{ title: 'Sign in', headerShown: false }} />
          <Stack.Screen name="sign-up" options={{ title: 'Create account' }} />
        </Stack.Protected>
        <Stack.Protected guard={signedIn}>
          <Stack.Screen name="index" options={{ title: 'Daybook' }} />
          <Stack.Screen name="entry" options={{ title: 'Entry', presentation: 'modal' }} />
          <Stack.Screen name="paywall" options={{ title: 'Daybook Pro', presentation: 'modal' }} />
          <Stack.Screen name="account" options={{ title: 'Account' }} />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}
