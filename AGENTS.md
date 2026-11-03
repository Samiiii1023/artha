# Artha development conventions

- Security and numerical accuracy outrank visual polish.
- No financial account credentials, personal statements, real balances or secrets in the repository.
- Keep business rules independent from React Native/UI components.
- Use integer minor units encoded as strings, never float for financial balances.
- User-visible FX rates have provenance and as-of timestamps.
- Transfers are not expenses. Debt payments distinguish principal vs interest.
- No action initiating transfers or investments; app is tracking-only.
- Add unit tests for financial calculations and regressions before UI work.
- Never claim features are implemented until their tests and on-device checks pass.
