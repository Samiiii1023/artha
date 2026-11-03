import { Card } from '../src/components/Card';
import { Screen } from '../src/components/Screen';

export default function ActivityScreen() {
  return (
    <Screen title="Activity" eyebrow="FOLLOW THE FLOW" subtitle="Every transaction will have a category, account, date and clear audit trail.">
      <Card title="No transactions yet" note="We won't invent spending history or silently import data. Transaction entry and statement review are upcoming milestones." />
      <Card title="No double-counted payments" note="A credit-card payment reduces your bank balance and card debt; it does not count as a second expense." />
      <Card title="Transfers are not spending" note="Moving money from one bank to another will not be classified as income or an expense." />
    </Screen>
  );
}
