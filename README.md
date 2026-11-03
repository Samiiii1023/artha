# Artha

**A tracking-only personal financial operating system.** Artha will not hold, transfer, trade or invest money. Accounts and investments stay at their original institutions. This project is being developed collaboratively, milestone by milestone.

## Status

**Milestone 0: financial core foundation (not yet an installable phone app).**

Included:
- TypeScript financial domain engine with integer minor units for INR, KRW, USD.
- Journal-entry validation for transaction integrity.
- Net worth excluding income/expense/equity accounts and using explicit dated FX rates.
- Goal allocations with fixed amounts or percentages and checks against double allocation.
- Node automated tests and GitHub Actions CI.
- Architecture, privacy rules and a phased delivery roadmap.

Not yet included: iPhone UI, database, authentication, backups, read-only broker/bank imports, native build, and account synchronization. We will build these in subsequent milestones, review them together and test them before using real personal financial records.

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
