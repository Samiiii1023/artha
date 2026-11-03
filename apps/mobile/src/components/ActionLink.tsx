import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space } from '../theme';

export function ActionLink({ label, description, href }: { label: string; description?: string; href: Href }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => router.push(href)}
      style={({ pressed }) => [styles.link, pressed && styles.pressed]}
    >
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  link: { borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: space.lg, flexDirection: 'row', alignItems: 'center', minHeight: 74 },
  pressed: { opacity: 0.7 },
  copy: { flex: 1, gap: 4 },
  label: { color: colors.text, fontSize: 15, fontWeight: '700' },
  description: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  chevron: { color: colors.accent, fontSize: 28, paddingLeft: space.sm },
});
