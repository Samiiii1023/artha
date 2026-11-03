# M1 — Native mobile shell (first review)

The first mobile milestone is intentionally **not** a finance-data entry app. It is a navigable, native React Native shell with five screens and clear empty states. M0 financial calculations remain in `src/core` and are not yet wired to persistence or the UI.

## Run on iPhone (synthetic/empty data only)

1. Install Node.js 22+ and the current Expo Go app on your iPhone.
2. From repository root run `cd apps/mobile && npm install`.
3. Run `npx expo start --tunnel` (requires network; tunnel service availability varies) or `npx expo start` on the same Wi-Fi network as the phone.
4. Open Expo Go and scan the terminal QR code.
5. Check each tab, safe-area layout, scrolling, and accessibility labels.

Expo documentation (November 2026): during SDK 58 transition, Expo Go on physical iPhones remains compatible with SDK 57; this milestone uses SDK 57 accordingly. When Expo Go moves to SDK 58, update with the official Expo migration instructions.

## Acceptance checklist

- [ ] Launches in Expo Go on a physical iPhone.
- [ ] Home, Accounts, Goals, Activity and More tabs navigate.
- [ ] No fabricated balances, goals or transactions appear as real data.
- [ ] Screens respect safe areas and remain scrollable at large text sizes.
- [ ] `npm run typecheck` in `apps/mobile` passes after dependencies install.
- [ ] Root financial core tests continue to pass.

## Security boundary

Do not enter actual financial information into this build. There is no persistent store or encryption. The architecture intends to add encrypted native SQLite in a custom development build, with independent encryption verification and backup-restore testing before real use.

## Implementation decisions

- Expo Router provides 5-tab native navigation with React Native UI components.
- Design tokens shared across screens (`apps/mobile/src/theme`).
- No fake connection buttons or feature claims: empty states clearly identify what is not yet implemented.
- Independent mobile package allows M0 core CI to continue unchanged while Expo-specific dependencies are reviewed and locked separately.
