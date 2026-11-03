# M1 — Native mobile shell (first review)

The first mobile milestone is intentionally **not** a finance-data entry app. It is a navigable, native React Native shell with five screens and clear empty states. M0 financial calculations remain in `src/core` and are not yet wired to persistence or the UI.

## Run on iPhone (synthetic/empty data only)

1. Install Node.js 22+ and the current Expo Go app on your iPhone.
2. From repository root run `cd apps/mobile && npm install`.
3. Run `npx expo start --tunnel` (requires network; tunnel service availability varies) or `npx expo start` on the same Wi-Fi network as the phone.
4. Open Expo Go and scan the terminal QR code.
5. Check each tab, safe-area layout, scrolling, and accessibility labels.

Artha uses Expo SDK 58, matching the Expo Go 58.0.5 iOS app (supported SDK 58). If Expo Go supports a different SDK later, update this project using the official Expo upgrade guide, and verify the entire package set.

## Acceptance checklist

- [x] Launches in Expo Go 58.0.5 on a physical iPhone (developer confirmed).
- [x] Home, Accounts, Goals, Activity and More tabs navigate (developer confirmed).
- [x] No fabricated balances, goals or transactions appear as real data (empty-state implementation).
- [ ] Screens respect safe areas and remain scrollable at large text sizes.
- [x] `npm run typecheck` in `apps/mobile` passes after dependencies install (GitHub CI).
- [x] Root financial core tests continue to pass (GitHub CI).

## Security boundary

Do not enter actual financial information into this build. There is no persistent store or encryption. The architecture intends to add encrypted native SQLite in a custom development build, with independent encryption verification and backup-restore testing before real use.

## Implementation decisions

- Expo Router provides 5-tab native navigation with React Native UI components.
- Design tokens shared across screens (`apps/mobile/src/theme`).
- No fake connection buttons or feature claims: empty states clearly identify what is not yet implemented.
- Independent mobile package allows M0 core CI to continue unchanged while Expo-specific dependencies are reviewed and locked separately.


## Troubleshooting — native Expo Go version mismatch / app closes

Artha now targets **SDK 58** (React Native 0.88, React 19.3). Older Artha
SDK 57 bundles were incompatible with Expo Go 58.0.5.

On your development laptop:

```bash
cd ~/Projects/artha
git switch feat/mobile-shell-m1
git pull --ff-only origin feat/mobile-shell-m1
cd apps/mobile
rm -rf node_modules package-lock.json .expo
npm install
npx expo install --check
npm run typecheck
npx expo start --clear
```

The Expo CLI should report SDK 58. On your iPhone open Expo Go 58.0.5,
scan the current QR code and inspect all tabs. If Wi-Fi blocks device-to-device
connections, use `npx expo start --tunnel --clear` after installing/configuring
the tunnel dependency.

If Expo Go still exits, capture the device model, iOS version, and any
terminal Metro errors. A successful web build or JS export does **not**
guarantee that a native binary can launch.

Do not manually edit internal Metro files or pin SDK 57's Metro 0.84 in SDK 58.

## Troubleshooting — white page at localhost:8081

A blank Chrome page with `Unable to resolve "react-native-web/dist/index"`
means the Expo *web* bundle could not be compiled. It does not indicate a Node
or iPhone problem. Expo Router's web target needs `react-dom`, `react-native-web`,
and `@expo/metro-runtime`. They are now direct dependencies in
`apps/mobile/package.json`.

From the mobile directory, after pulling the updated feature branch:

```bash
npm install
npm run typecheck
npx expo start --clear --web
```

For web bundle verification independently of the live server:

```bash
npx expo export --platform web
```

Use `npx expo install react-dom react-native-web @expo/metro-runtime` when
introducing or updating web support so Expo selects SDK-compatible versions.
Do not force incompatible dependency trees with `--legacy-peer-deps`.

## Reproducible install and security audit

The mobile package lockfile is committed and mobile CI uses `npm ci` to prevent unreviewed transitive version drift. The GitHub workflow verifies Expo SDK alignment, TypeScript, development-server startup, and the iOS/web JavaScript exports.

The latest production dependency audit reported **12 moderate, 0 high, 0 critical** advisories. Review [issue #3](https://github.com/Samiiii1023/artha/issues/3) before enabling real financial records. This shell is synthetic-data-only; on-device launch/navigation validation does not verify encryption or database security.

Large-text/safe-area accessibility testing remains an outstanding polish item and should be documented during subsequent on-device reviews.
