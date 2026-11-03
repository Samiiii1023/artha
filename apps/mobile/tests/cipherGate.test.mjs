import assert from 'node:assert/strict';
import test from 'node:test';

import {
  encodeKeyHex,
  InvalidCipherKeyError,
  rawKeyPragma,
  SqlCipherUnavailableError,
  unlockCipherDb,
} from '../src/storage/cipherGate.ts';

const key = 'ab'.repeat(32);

test('32 random bytes encode as fixed-width raw key material', () => {
  const bytes = new Uint8Array(32);
  bytes.fill(171);
  assert.equal(encodeKeyHex(bytes), key);
  assert.throws(() => encodeKeyHex(new Uint8Array(31)), InvalidCipherKeyError);
});

test('raw key SQL accepts only exactly 64 lowercase hex digits', () => {
  assert.equal(rawKeyPragma(key), `PRAGMA key = "x'${key}'"`);
  for (const invalid of ['', 'x'.repeat(64), 'a'.repeat(63), key + "'; DROP TABLE x;--', 'AB'.repeat(32)]) {
    assert.throws(() => rawKeyPragma(invalid), InvalidCipherKeyError);
  }
});

test('refuses to set a key when SQLCipher capability is absent', async () => {
  const calls = [];
  const db = {
    async getFirstAsync(sql) { calls.push(sql); return null; },
    async execAsync(sql) { calls.push(sql); },
  };
  await assert.rejects(unlockCipherDb(db, key), SqlCipherUnavailableError);
  assert.deepEqual(calls, ['PRAGMA cipher_version']);
});

test('refuses to set a key when SQLCipher version is blank', async () => {
  const db = {
    async getFirstAsync() { return { cipher_version: '' }; },
    async execAsync() { assert.fail('must not use plaintext database'); },
  };
  await assert.rejects(unlockCipherDb(db, key), SqlCipherUnavailableError);
});

test('sets a validated key only after SQLCipher probe and forces a schema read', async () => {
  const calls = [];
  const db = {
    async getFirstAsync(sql) {
      calls.push(sql);
      return sql === 'PRAGMA cipher_version' ? { cipher_version: '4.6.0' } : { count: 0 };
    },
    async execAsync(sql) { calls.push(sql); },
  };
  assert.equal(await unlockCipherDb(db, key), '4.6.0');
  assert.deepEqual(calls, [
    'PRAGMA cipher_version',
    `PRAGMA key = "x'${key}'"`,
    'SELECT count(*) AS count FROM sqlite_master',
  ]);
});

test('incorrect key is rejected before returning unlocked connection', async () => {
  const db = {
    async getFirstAsync(sql) {
      if (sql === 'PRAGMA cipher_version') return { cipher_version: '4.6.0' };
      throw new Error('file is not a database');
    },
    async execAsync() {},
  };
  await assert.rejects(unlockCipherDb(db, key), /file is not a database/);
});
