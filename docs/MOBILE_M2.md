# Milestone 2 — encrypted native storage design

**Status:** Design and security gates only. This document does **not** mean
Artha can safely hold real financial records yet. M1's Expo Go shell remains
synthetic/empty-state only.

## Goal

Create an offline-first, local, portable and verifiably encrypted financial
record store on an iPhone. Artha never holds money or initiates banking/trading
operations. Do not introduce bank-connection APIs during M2.

## Required native build boundary

- Pin SDK 58-compatible `expo-sqlite` and `expo-secure-store` using
  `npx expo install` and commit the updated npm lockfile.
- Use an Expo custom native development build with the `expo-sqlite`
  config plugin setting `useSQLCipher: true`. Rebuild the binary after
  changing the plugin configuration.
- **Never rely on Expo Go or web to provide encrypted SQLite.** Leave
  their finance-data write paths disabled; keep a demo UI.
- On every database open, explicitly verify that `PRAGMA cipher_version`
  returns a value. If not, fail closed before writing any record. In a
  standard SQLite binary, unrecognized `PRAGMA key` may silently do nothing.
- Apply SQLCipher key before querying schema or running migrations. Treat
  every database connection as requiring secure key initialization.
- Avoid an unkeyed connection opened by utility APIs or separate
  transaction modes. Test transaction semantics using the actual encrypted
  native binary.

## Key management

1. Generate a cryptographically random per-installation database key from
   native secure randomness. Do not hardcode keys or derive them from an
   account identifier or predictable timestamp.
2. Store key material in OS-protected secure storage. Apply a documented
   accessibility class appropriate for an app that manages financial data.
   Never print keys, SQL PRAGMAs containing keys, statements, transaction
   content, or complete backup payloads in logs.
3. Protect initialization from concurrent opens, corruption, cancellation,
   and partial writes. Reuse a single initialized connection where possible.
4. Data and key deletion must be designed as separate operations: key loss
   without a recoverable encrypted backup can permanently lose all records.
5. Create a **separate backup key derivation** using a user-supplied recovery
   secret, established KDF and authenticated encryption. Don't treat a copy
   of the device Keychain key as portable recovery by default.
6. Do not claim biometric protection, restore portability or key rotation
   until each is implemented and tested on device.

## First schema (subject to review)

| Logical table | Purpose | Core rules |
| --- | --- | --- |
| `schema_migrations` | Applied version, checksum, timestamp | Transactionally apply migration |
| `accounts` | Bank, card, loan, brokerage metadata | Explicit currency, account kind, inactive state |
| `journal_entries` | Event metadata and provenance | Stable ID, timestamp, source identifier, no duplicate ingestion |
| `postings` | Double-entry movements | Exact integer minor units as strings, balanced per entry |
| `goals` | Intended uses of existing assets | Never counted as separate assets |
| `goal_allocations` | Fixed/basis-point earmarks | Prevent reserve > source economic asset |
| `fx_quotes` | Reporting conversion observations | Rate/direction/source/as-of date required |
| `backup_manifests` | Versioned recovery snapshots | Integrity, KDF parameters, metadata, restore verification |

All amounts follow the `src/core` BigInt/minor-unit financial model. INR
and USD have 2 decimal minor digits; KRW has 0. Never persist floating-point
amounts. **Do not duplicate brokerage cash and marked-to-market holdings**
in net worth. Account transfers are not expenses; credit-card principal
repayments are not spending.

Implement migrations with version IDs and test failure/rollback behavior.
Never use data-destructive automatic migrations without an encrypted backup
and an explicit recovery path.

## Verification gates before real data

- [ ] Native custom dev build can open an encrypted DB; `cipher_version` is
      nonempty and proven in the **installed iPhone binary**.
- [ ] Wrong key cannot open or read records; plaintext SQLite readers cannot
      interpret the DB header/schema.
- [ ] Kill/restart app and verify records remain intact and journal stays
      balanced.
- [ ] Test versioned migrations, interruption, duplicate IDs and rollback.
- [ ] Test no sensitive information is written to unencrypted logs, app
      telemetry or public GitHub.
- [ ] Encrypted backup can be restored on a **different test device** using
      documented recovery credentials; test corrupt and wrong-password
      backups.
- [ ] Audit Expo/React Native dependency advisories before live use:
      see [security review issue #3](https://github.com/Samiiii1023/artha/issues/3).
- [ ] Complete physical iPhone smoke and accessibility checks.
- [ ] Enable actual account-entry UI **only after all encryption and recovery
      gates pass**.

## Review sequencing

1. **M2a** — SDK-compatible dependencies + native SQLCipher build,
   no real record input. Fail-closed encryption detection and synthetic
   encryption smoke test.
2. **M2b** — Versioned schema/migrations + test fixtures and double-entry
   invariants integrated with the financial core.
3. **M2c** — Secure key lifecycle, encrypted backup, cross-device restore,
   error recovery, and independent verification.
4. **M2d** — Controlled financial record entry, after security gates are
   satisfied and explicitly accepted.

The Artha web preview and Expo Go remain demonstration surfaces throughout
M2; neither should persist sensitive records.

## References

- Expo SDK 58 SQLite: https://docs.expo.dev/versions/v58.0.0/sdk/sqlite/
- Expo SDK 58 SecureStore: https://docs.expo.dev/versions/v58.0.0/sdk/securestore/
- Product invariants: [ARCHITECTURE.md](ARCHITECTURE.md)
- Security policy: [SECURITY.md](SECURITY.md)
- Tracking: [GitHub issue #2](https://github.com/Samiiii1023/artha/issues/2)

## M2a implementation checkpoint (prototype)

The `apps/mobile` package contains the first **synthetic-data-only** native
SQLCipher diagnostic, not a finance database. `expo-sqlite` is configured with
`useSQLCipher: true` and `expo-crypto`, `expo-secure-store`, and
`expo-dev-client` are installed for Expo SDK 58.

- The More tab has a `Run encryption diagnostic` action.
- Expo Go and web stay demo-only: the diagnostic reports that a separate native
  build is required; neither stores financial records.
- The native diagnostic checks `PRAGMA cipher_version` *before applying a key*,
  generates a 32-byte random test key using native randomness, and saves it to
  device secure storage (Keychain accessibility while unlocked, this device only).
- It creates a **synthetic canary only**, reopens the DB with the key, and
  confirms a new connection with the wrong key cannot read the canary.
- The app never displays or logs the actual key. Raw key PRAGMA construction
  rejects anything except 64 lowercase hexadecimal digits.
- Node unit tests mock the database to verify the no-SQLCipher fail-closed
  path, key validation, and schema-read order. These mocks **do not prove**
  actual iOS SQLCipher behavior.

### Running the smoke checks

On your Arch Linux laptop:

```bash
cd ~/Projects/artha
git switch feat/secure-storage-m2
git pull --ff-only origin feat/secure-storage-m2
cd apps/mobile
fnm use 22
npm ci
npm run typecheck
npm run test:storage
npx expo install --check
```

For the ordinary demo **without encryption** (Expo Go), use:
`npx expo start --go --tunnel --clear`. The diagnostic should say that a
native development build is required; do not interpret Expo Go as encrypted.

For a **physical iPhone custom development build**, Expo's cloud EAS build
requires Apple Developer Program signing credentials. From Linux, follow:
<https://docs.expo.dev/tutorial/eas/ios-development-build-for-devices/>.

```bash
cd ~/Projects/artha/apps/mobile
npx eas-cli@latest build:configure
npx eas-cli@latest device:create
npx eas-cli@latest build --platform ios --profile development
```

Install the signed build on the registered iPhone using Expo's install link,
enable Developer Mode if needed, then start the JavaScript server:

```bash
npx expo start --dev-client --tunnel --clear
```

Open the installed **Artha development app** (not Expo Go), select the
development server and go to More → Run encryption diagnostic. Record
only whether it passed and the SQLCipher version; never share actual keys,
raw database files or finance records.

**Important:** A Mac with Xcode can provide different local-development
options, but a Linux machine cannot directly build/sign an iOS app locally
with Xcode. We have not issued a native iOS binary or verified this diagnostic
on an installed custom build yet.

### What this does not accomplish

No financial records, ledger schema migrations, backups, cross-device restore,
key rotation, crash recovery, durable key-loss recovery or secure data entry
are implemented. The test database contains only the literal
`synthetic-test-only` canary. Do not use this proof-of-concept as a production
encrypted store. See the verification gates above and dependency issue #3.
