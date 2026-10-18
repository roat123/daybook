import { Pressable, StyleSheet, Text } from 'react-native';

import { radius, space, useTheme } from '@/theme';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
};

export function Button({ title, onPress, variant = 'primary', disabled = false }: Props) {
  const colors = useTheme();
  const filled = variant === 'primary';
  const textColor = filled ? colors.onAccent : variant === 'danger' ? colors.danger : colors.accent;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        filled
          ? { backgroundColor: colors.accent }
          : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth },
        { opacity: disabled ? 0.5 : pressed ? 0.75 : 1 },
      ]}>
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 17, fontWeight: '600' },
});
