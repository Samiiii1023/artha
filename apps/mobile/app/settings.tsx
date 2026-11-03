import { Card } from '../src/components/Card';
import { Screen } from '../src/components/Screen';

export default function SettingsScreen() {
  return (
    <Screen title="About Artha" eyebrow="YOUR DATA, YOUR CONTROL" subtitle="A tracking-only personal finance app being developed in transparent milestones.">
      <Card title="Version 0.1 · Mobile shell" note="This build is for navigation and layout testing with no user financial data. Balances, account entry and encrypted storage are not implemented yet." />
      <Card title="Privacy first" note="No login, cloud sync, bank access, financial credentials, or financial-data storage in this build." />
      <Card title="Coming next" note="Verified encrypted local database, balance entry and import review. We will test backup and recovery before adding real personal records." />
    </Screen>
  );
}
