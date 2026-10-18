import { StyleSheet, Text, View } from 'react-native';

import { DEMO_MODE } from '@/services';
import { radius, space, useTheme } from '@/theme';

/** A small honest note: in demo mode nothing leaves the phone and no money is charged. */
export function DemoNote({ children }: { children: string }) {
  const colors = useTheme();
  if (!DEMO_MODE) return null;
  return (
    <View style={[styles.box, { backgroundColor: colors.accentSoft }]}>
      <Text style={[styles.text, { color: colors.text }]}>
        <Text style={styles.bold}>Demo mode. </Text>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: radius.md, padding: space.md },
  text: { fontSize: 14, lineHeight: 20 },
  bold: { fontWeight: '700' },
});
