import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, space } from '../theme';

type Props = PropsWithChildren<{
  title: string;
  eyebrow?: string;
  subtitle?: string;
}>;

export function Screen({ title, eyebrow, subtitle, children }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text> : null}
        <Text style={styles.title} accessibilityRole="header">{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.body}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: 36, flexGrow: 1 },
  eyebrow: { color: colors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 12 },
  title: { fontSize: 32, color: colors.text, fontWeight: '800', letterSpacing: -0.8 },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 7 },
  body: { marginTop: 28, gap: 16 },
});
