import { useColorScheme } from 'react-native';

const light = {
  page: '#f6f5f8',
  card: '#fdfcfe',
  text: '#0d0b10',
  textSecondary: '#524e59',
  textMuted: '#6d6875',
  border: 'rgba(13,11,16,0.10)',
  accent: '#6b46c1',
  onAccent: '#ffffff',
  danger: '#c62f2f',
  /** Soft tint behind the accent, for chips and badges. */
  accentSoft: 'rgba(107,70,193,0.12)',
  warning: '#9a5b00',
};

const dark: typeof light = {
  page: '#0e0d10',
  card: '#1b191e',
  text: '#f1eff4',
  textSecondary: '#c4bfcb',
  textMuted: '#9c96a4',
  border: 'rgba(255,255,255,0.10)',
  accent: '#a78bfa',
  onAccent: '#1b1033',
  danger: '#e66767',
  accentSoft: 'rgba(167,139,250,0.18)',
  warning: '#e0a23a',
};

export type ThemeColors = typeof light;

export function useTheme(): ThemeColors {
  return useColorScheme() === 'dark' ? dark : light;
}

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const radius = { sm: 8, md: 14 } as const;
