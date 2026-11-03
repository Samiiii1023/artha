/**
 * Test-only SQLCipher guard shared by the native diagnostic and Node tests.
 * Never import a key from source control or print the generated PRAGMA text.
 */
export interface CipherProbeDb {
  getFirstAsync<T>(sql: string): Promise<T | null>;
  execAsync(sql: string): Promise<void>;
}

export class SqlCipherUnavailableError extends Error {
  constructor() {
    super('This build does not provide SQLCipher. Financial storage is disabled.');
    this.name = 'SqlCipherUnavailableError';
  }
}

export class InvalidCipherKeyError extends Error {
  constructor() {
    super('Invalid encryption key format. Financial storage is disabled.');
    this.name = 'InvalidCipherKeyError';
  }
}

export function encodeKeyHex(bytes: Uint8Array): string {
  if (bytes.length !== 32) throw new InvalidCipherKeyError();
  return Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
}

/** SQLCipher raw 256-bit key literal. Strictly validated to prevent SQL injection. */
export function rawKeyPragma(keyHex: string): string {
  if (!/^[0-9a-f]{64}$/.test(keyHex)) throw new InvalidCipherKeyError();
  return `PRAGMA key = "x'${keyHex}'"`;
}

/**
 * Verify encryption support BEFORE setting the key (unknown pragmas can be
 * silently ignored by normal SQLite), then force a schema read to reject
 * invalid keys before any app-level write is attempted.
 */
export async function unlockCipherDb(db: CipherProbeDb, keyHex: string): Promise<string> {
  const pragma = rawKeyPragma(keyHex);
  const row = await db.getFirstAsync<{ cipher_version: string }>('PRAGMA cipher_version');
  if (!row || typeof row.cipher_version !== 'string' || !row.cipher_version.trim()) {
    throw new SqlCipherUnavailableError();
  }
  await db.execAsync(pragma);
  await db.getFirstAsync<{ count: number }>('SELECT count(*) AS count FROM sqlite_master');
  return row.cipher_version;
}
