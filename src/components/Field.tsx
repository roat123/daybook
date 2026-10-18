import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { radius, space, useTheme } from '@/theme';

type Props = TextInputProps & { label: string };

export function Field({ label, style, ...input }: Props) {
  const colors = useTheme();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }, style]}
        {...input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xs },
  label: { fontSize: 14 },
  input: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: space.md,
    fontSize: 17,
  },
});
