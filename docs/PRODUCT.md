# Product scope — Artha

## North star

A private, personally controlled system that accurately explains **where my money is, what it is for, what I owe, where it goes, and what my choices will cost in the future**.

## Principles

1. Tracking-only: Artha never holds money, places trades or initiates bank transfers.
2. One balance sheet: INR, KRW and USD, with exchange rate/source/date visible.
3. No double counting: a brokerage balance and its underlying holdings are not counted twice; allocating an asset to goals changes its purpose, not its ownership or valuation.
4. Every number has provenance and an as-of time: manual, statement-imported, market price, or connected.
5. Income and spending are separate from transfers and principal repayment; interest/fees count as expenses.
6. Forecasts and targets are clearly labeled and never mixed with actual balances.
7. No synthetic balances shown as real data. Onboarding starts empty.

## Modules

- Overview: net worth, liquidity, cash flow, next bills, milestones.
- Accounts: bank/cash, credit cards, loans, brokerage cash, deposits, currencies.
- Portfolio: holding-level units, cost basis, valuation, dividends, fees, realized/unrealized returns.
- Goals: emergency, travel, tuition, future home, long-term wealth; fixed/percent allocation by source.
- Activity: income, expenses, internal transfers, account reconciliation, categories.
- Planning: monthly budgets, recurring SIPs, EMIs, bill calendars, funding forecasts.
- Reports: category trends, concentration, time-weighted/money-weighted returns with correct method labels.
- Imports: user-approved statements and CSVs, dedupe review, sync status.
- Settings: privacy, backup, currency, valuation timestamps, manual adjustments audit log.

## Minimum acceptance criteria for a trustworthy release

- Mathematically balanced journal entries and no duplicate transfers.
- Net worth tests for debt, FX and holdings; missing quotes produce missing-data warnings, not guessed rates.
- Goals never reserve more than the actual source's current value.
- Restore encrypted backup on a second device, verified before storing real data.
- Offline operation, accessible controls, and working navigation on iPhone.
- Clearly documented data deletion, backup recovery and import limitations.
