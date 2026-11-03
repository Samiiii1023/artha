/**
 * No SQLite or keychain imports here. Web is a synthetic-data preview only.
 */
export async function runStorageDiagnostic(): Promise<string> {
  throw new Error('Encrypted local storage requires a native development build; web preview is demo-only.');
}
