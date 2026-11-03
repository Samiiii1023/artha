import { Card } from '../src/components/Card';
import { Screen } from '../src/components/Screen';

export default function GoalsScreen() {
  return (
    <Screen title="Goals" eyebrow="GIVE EVERY AMOUNT A PURPOSE" subtitle="Earmark your existing money without opening new accounts or moving funds.">
      <Card title="No goals yet" note="Goals have not been created. We'll add targets, deadlines and allocation rules when the goal storage engine is ready." />
      <Card title="Emergency fund" note="Example category only — not an active goal. Keep essential expenses covered with low-risk, accessible savings." />
      <Card title="Travel and experiences" note="Example category only — not an active goal. Plan trips without counting money already reserved elsewhere." />
      <Card title="Education and long-term wealth" note="Example categories only — not active goals. Track both near-term obligations and long-term investments." />
    </Screen>
  );
}
