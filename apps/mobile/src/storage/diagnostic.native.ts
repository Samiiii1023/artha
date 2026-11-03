import Constants from 'expo-constants';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import * as SQLite from 'expo-sqlite';

import { encodeKeyHex, rawKeyPragma, unlockCipherDb } from './cipherGate';

const DB_NAME = 'artha-m2a-synthetic-only.db';
const KEY_NAME = 'artha.m2a.synthetic-key.v1';
const KEY_OPTIONS = {
  keychainService: 'artha.m2a.synthetic-diagnostic',
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

/**
 * Proof-of-concept only. Never call with financial records.
 * Creates a synthetic canary in a separate encrypted test database.
 * All connections are independent; every access explicitly supplies the key.
 */
export async function runStorageDiagnostic(): Promise<string> {
  if (Constants.appOwnership === 'expo') {
    throw new Error('Expo Go cannot use SQLCipher. Install a custom development build to run this test.');
  }
  if (!(await SecureStore.isAvailableAsync())) {
    throw new Error('Device secure storage is unavailable. Encrypted storage is disabled.');
  }

  let keyHex = await SecureStore.getItemAsync(KEY_NAME, KEY_OPTIONS);
  const initial = await SQLite.openDatabaseAsync(DB_NAME, { useNewConnection: true });
  let cipherVersion: string;
  try {
    // Check capability before creating/storing a key or writing any data.
    const cipher = await initial.getFirstAsync<{ cipher_version: string }>('PRAGMA cipher_version');
    if (!cipher?.cipher_version) {
      throw new Error('SQLCipher is unavailable in this build. Financial storage is disabled.');
    }
    if (!keyHex) {
      keyHex = encodeKeyHex(await Crypto.getRandomBytesAsync(32));
      await SecureStore.setItemAsync(KEY_NAME, keyHex, KEY_OPTIONS);
    }
    cipherVersion = await unlockCipherDb(initial, keyHex);
    await initial.execAsync(
      'CREATE TABLE IF NOT EXISTS m2a_canary (id INTEGER PRIMARY KEY NOT NULL, value TEXT NOT NULL)'
    );
    await initial.runAsync(
      'INSERT OR REPLACE INTO m2a_canary (id, value) VALUES (?, ?)',
      1,
      'synthetic-test-only'
    );
  } finally {
    await initial.closeAsync();
  }

  const reopened = await SQLite.openDatabaseAsync(DB_NAME, { useNewConnection: true });
  try {
    await unlockCipherDb(reopened, keyHex);
    const row = await reopened.getFirstAsync<{ value: string }>(
      'SELECT value FROM m2a_canary WHERE id = 1'
    );
    if (row?.value !== 'synthetic-test-only') {
      throw new Error('Encrypted database reopen check failed.');
    }
  } finally {
    await reopened.closeAsync();
  }

  // An unkeyed or wrong-key connection must not read the synthetic database.
  const wrong = await SQLite.openDatabaseAsync(DB_NAME, { useNewConnection: true });
  let rejectedWrongKey = false;
  try {
    await wrong.execAsync(rawKeyPragma('00'.repeat(32)));
    try {
      await wrong.getFirstAsync<{ value: string }>(
        'SELECT value FROM m2a_canary WHERE id = 1'
      );
    } catch {
      rejectedWrongKey = true;
    }
  } finally {
    await wrong.closeAsync();
  }
  if (!rejectedWrongKey) {
    throw new Error('Wrong-key connection was able to read a test record. Encryption test failed.');
  }
  return `SQLCipher ${cipherVersion} verified: test record persisted, reopened, and rejected the wrong key. Synthetic data only.`;
}
