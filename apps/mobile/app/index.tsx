import { StyleSheet, Text, View } from 'react-native';
import { ActionLink } from '../src/components/ActionLink';
import { Card } from '../src/components/Card';
import { Screen } from '../src/components/Screen';
import { colors } from '../src/theme';

export default function HomeScreen() {
  return (
    <Screen title="Your money, understood." eyebrow="ARTHA  /  PRIVATE FINANCE" subtitle="A clear picture of your entire financial life, without moving your money.">
      <Card tone="accent">
        <Text style={styles.label}>NET WORTH</Text>
        <Text style={styles.value}>Not available yet</Text>
        <Text style={styles.small}>No accounts added · No financial records stored</Text>
      </Card>
      <View style={styles.section}>
        <Text style={styles.heading}>Your financial system</Text>
        <Text style={styles.detail}>Everything starts empty. We'll only show balances you explicitly record or import.</Text>
      </View>
      <ActionLink href="/accounts" label="Accounts & balances" description="Bank accounts, cards, investments and loans" />
      <ActionLink href="/goals" label="Goals & allocations" description="Set aside money for emergencies, travel and more" />
      <ActionLink href="/activity" label="Cash flow" description="Understand income, spending and transfers" />
      <Card title="Tracking only" note="Artha cannot withdraw funds, transfer money, or place trades. Your accounts remain with their existing institutions." />
    </Screen>
  );
}
const styles = StyleSheet.create({
  label: { color: colors.accent, fontSize: 11, letterSpacing: 1.5, fontWeight: '700' },
  value: { color: colors.text, fontSize: 28, fontWeight: '700', marginVertical: 6 },
  small: { color: colors.muted, fontSize: 12 },
  section: { marginTop: 8, gap: 8 },
  heading: { color: colors.text, fontSize: 20, fontWeight: '700' },
  detail: { color: colors.muted, fontSize: 14, lineHeight: 21 },
});
