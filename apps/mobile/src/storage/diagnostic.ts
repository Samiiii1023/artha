/**
 * TypeScript declaration/runtime fallback. Metro chooses diagnostic.native.ts
 * for iOS/Android and diagnostic.web.ts for the browser.
 */
export async function runStorageDiagnostic(): Promise<string> {
  throw new Error('Native encrypted storage is unavailable in this runtime.');
}
