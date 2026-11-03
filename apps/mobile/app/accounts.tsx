import { Card } from '../src/components/Card';
import { Screen } from '../src/components/Screen';

export default function AccountsScreen() {
  return (
    <Screen title="Accounts" eyebrow="WHERE YOUR MONEY LIVES" subtitle="One inventory of your assets and liabilities across institutions and countries.">
      <Card title="No accounts yet" note="Your real balances are not connected or stored. Account creation, reconciliation and local encryption will be built and tested in later milestones." />
      <Card title="Designed for all your accounts" note="Checking and savings · Mutual funds · Stocks and ETFs · Fixed deposits · Credit cards · Loans · Cash" />
      <Card title="Three currencies" note="INR, KRW and USD will be recorded natively. Cross-currency totals will require an explicit dated exchange rate." />
    </Screen>
  );
}
