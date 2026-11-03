# Architecture — initial decisions

## Stack

- Mobile: React Native + Expo + Expo Router + TypeScript (to be scaffolded at Milestone 1).
- Financial core: framework-independent TypeScript in `src/core`; test in Node before integrating UI.
- Storage: native local SQLite; encrypted SQLCipher via a custom build for real financial data (never assume Expo Go has encryption).
- Secrets: platform secure key storage; never commit secrets, account credentials or passphrases.
- Future sync: optional, consent-based and end-to-end encrypted; do not require an account to use the app.
- Read-only data integrations only when supported through authorized provider APIs or user-provided statements.

## Ledger conventions

- Account kinds: asset, liability, equity, income, expense.
- Journal postings are debit-positive / credit-negative, equal zero for each transaction.
- An asset increase is positive; a liability increase is negative. Liability displayed as amount owed = -signed balance.
- A card purchase increases expense and liability; a card payment reduces bank cash and debt. Card principal repayment is NOT a second expense.
- A bank transfer moves value between asset accounts; it is NOT spending.
- Investments must not be included twice when account balances already include marked-to-market holdings.
- FX conversion requires a quoted rate, direction and as-of date. Cross-currency journal transactions are deliberately unsupported until a correct FX exchange design is implemented.

## Currency rules

- Store exact signed integer minor units serialized as decimal strings, not JS floats.
- INR and USD have 2 decimal minor units, KRW has 0.
- FX is calculated with rational BigInt arithmetic and rounded at target minor precision.
- Every aggregated amount must name its reporting currency and conversion date.

## Goal allocations

- A goal allocation only earmarks an existing asset; it never moves funds.
- Source identifiers point to one economic asset (cash *or* holding value, not both).
- Both fixed minor-unit amounts and basis point percentages are supported.
- Source value changes can cause fixed allocations to exceed source value. Surface a visible reconciliation issue; never silently create money or silently shrink the intended allocation.
- Reserved values cannot exceed current source value.

## Future model components

`Account`, `JournalEntry`, `Posting`, `Holding`, `ValuationSnapshot`, `PriceQuote`, `FxQuote`, `Goal`, `GoalAllocation`, `RecurringRule`, `ImportBatch`, `SourceRecord`, `ReconciliationEvent`, `BackupManifest`.

## Important design boundary

Financial core tests in this milestone do **not** imply the complete phone app is ready or safe for real data. Encryption-at-rest, migrations, imports, UI, auth, and secure backups each need separate review and implementation.
