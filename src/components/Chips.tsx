import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, space, useTheme } from '@/theme';

type Props<T extends string | number> = {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  label: (value: T) => string;
};

/** A row of options where exactly one is selected. */
export function Chips<T extends string | number>({ options, value, onChange, label }: Props<T>) {
  const colors = useTheme();
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(option)}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? colors.accent : colors.card,
                borderColor: selected ? colors.accent : colors.border,
              },
            ]}>
            <Text style={[styles.text, { color: selected ? colors.onAccent : colors.text }]}>{label(option)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    minHeight: 44,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontSize: 16, fontWeight: '600' },
});
