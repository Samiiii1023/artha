# Security and privacy policy (development)

Artha is designed to be tracking-only. Do not enter real account credentials, government IDs, card numbers, OTPs or PINs. This repository contains NO real user financial data.

## Repo

- Use a **private GitHub repository**.
- `.gitignore` excludes common financial exports, SQLite files, local backups and environment files. A gitignore is only a guardrail: verify `git status` before pushing.
- Never commit private keys, financial statements, transaction exports, screenshots containing personal information, bank credentials or actual balances.
- Protect `main`, review changes via pull requests, and run CI on every commit.

## Local app release gates

- Expo Go cannot be treated as a SQLCipher-encrypted database build. Use a custom native build and verify `PRAGMA cipher_version` before accepting real personal financial data.
- Protect encryption keys via secure OS storage; do not embed passphrases or static keys in source.
- Automatic backup must be encrypted, versioned, and restore-tested; backup exports must not be uploaded to GitHub.
- Keep third-party analytics and telemetry **off by default**.
- Require explicit consent before accessing any external financial account.
- Read-only integrations; no execution/trading/banking privileges.
- Threat-model lost/stolen device, malicious import, compromised repository, outdated sync, and backup failure.

## Scope for Milestone 0

Core accounting code only. **No secure financial storage exists yet. Do not use this scaffold to record real personal data.**
