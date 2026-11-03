import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, space } from '../theme';

type Props = PropsWithChildren<{ title?: string; note?: string; tone?: 'normal' | 'accent' }>;
export function Card({ title, note, tone = 'normal', children }: Props) {
  return (
    <View style={[styles.card, tone === 'accent' && styles.accentCard]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {note ? <Text style={styles.note}>{note}</Text> : null}
      {children}
    </View>
  );
}
const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: space.xl, gap: space.sm },
  accentCard: { borderColor: '#3B6B5B', backgroundColor: colors.accentDim },
  title: { color: colors.text, fontSize: 17, fontWeight: '700', lineHeight: 23 },
  note: { color: colors.muted, fontSize: 14, lineHeight: 21 },
});
