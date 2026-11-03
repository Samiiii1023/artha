# Artha

**A tracking-only personal financial operating system.** Artha will not hold, transfer, trade or invest money. Accounts and investments stay at their original institutions. This project is being developed collaboratively, milestone by milestone.

## Status

**Milestone 1: Expo SDK 58 mobile shell and financial core (prototype, not ready for financial records).**

Included:
- TypeScript financial domain engine with integer minor units for INR, KRW, USD.
- Journal-entry validation for transaction integrity.
- Net worth excluding income/expense/equity accounts and using explicit dated FX rates.
- Goal allocations with fixed amounts or percentages and checks against double allocation.
- Node automated tests and GitHub Actions CI.
- Expo Router iPhone prototype with Home, Accounts, Goals, Activity and More; physical iPhone launch/navigation confirmed.
- Locked Expo SDK 58 mobile dependencies and CI checks for native/web JS bundles.
- Architecture, privacy rules and a phased delivery roadmap.

Not yet included: encrypted database, financial record entry, authentication, backups, read-only broker/bank imports, custom native development build, and account synchronization. **The iPhone shell uses Expo Go and must never store real financial data.** We will build these in subsequent milestones, review them together and test them before using real personal financial records.

## Run the mobile shell (demo only)

Node.js 22, Expo Go supporting SDK 58:

```bash
cd apps/mobile
npm ci
npx expo start --go --tunnel --clear
```

See [docs/MOBILE_M1.md](docs/MOBILE_M1.md). The production-dependency audit has moderate-severity advisories under [security review issue #3](https://github.com/Samiiii1023/artha/issues/3).

## Run the core tests

Requirements: Node.js 22 or later; npm.

```bash
npm install
npm run typecheck
npm test
```

The test fixtures use fictional values. Nothing currently connects to any bank or broker.

## GitHub setup

See [docs/GITHUB_SETUP.md](docs/GITHUB_SETUP.md). **Create a PRIVATE repo.** Do not commit real account statements, identifiers, screenshots, CSVs or secrets.

## Product, architecture and security

- [Product scope](docs/PRODUCT.md)
- [Architecture and data design](docs/ARCHITECTURE.md)
- [Security decisions](docs/SECURITY.md)
- [Roadmap](docs/ROADMAP.md)

## Technical direction

React Native + Expo + TypeScript for a genuine iPhone app, with this framework-independent financial core. Development will start with Expo Go for *synthetic data only*. Native encrypted persistence will require a custom development/production build and verification that SQLCipher is actually enabled. No production credentials will be stored in source code.
