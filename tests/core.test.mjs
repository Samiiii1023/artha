import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseMajor, formatMajor, convertMoney,
  validateEntry, balances, amountOwed, netWorth,
  calculateGoalProgress, unassignedValue,
} from '../dist/core/index.js';

test('money uses exact integer minor units across INR, KRW and USD', () => {
  assert.deepEqual(parseMajor('1234.50', 'INR'), { currency: 'INR', minor: '123450' });
  assert.deepEqual(parseMajor('1234', 'KRW'), { currency: 'KRW', minor: '1234' });
  assert.equal(formatMajor({ currency: 'USD', minor: '-5' }), '-0.05');
  assert.throws(() => parseMajor('10.25', 'KRW'), /at most 0/);
  assert.throws(() => parseMajor('10.999', 'INR'), /at most 2/);
});

test('FX conversion requires a dated explicit quote and rounds to target precision', () => {
  const quote = { base: 'USD', quote: 'KRW', rate: '1350.51', asOf: '2026-11-03' };
  assert.deepEqual(convertMoney(parseMajor('2.20', 'USD'), 'KRW', quote), { currency: 'KRW', minor: '2971' });
  assert.throws(() => convertMoney(parseMajor('1', 'USD'), 'INR'), /Missing explicit FX quote/);
});

const accounts = [
  { id: 'cash', name: 'Bank', kind: 'asset', currency: 'INR' },
  { id: 'card', name: 'Card', kind: 'liability', currency: 'INR' },
  { id: 'equity', name: 'Opening equity', kind: 'equity', currency: 'INR' },
  { id: 'groceries', name: 'Groceries', kind: 'expense', currency: 'INR' },
];
const entry = (id, type, postings) => ({ id, type, date: '2026-11-03', description: id, postings });
const sampleEntries = [
  entry('open', 'opening', [{ accountId: 'cash', minor: '100000' }, { accountId: 'equity', minor: '-100000' }]),
  entry('purchase', 'expense', [{ accountId: 'groceries', minor: '15000' }, { accountId: 'card', minor: '-15000' }]),
  entry('pay-card', 'payment', [{ accountId: 'card', minor: '10000' }, { accountId: 'cash', minor: '-10000' }]),
];

test('every journal entry must balance and use only one currency', () => {
  for (const e of sampleEntries) assert.doesNotThrow(() => validateEntry(e, accounts));
  assert.throws(() => validateEntry(entry('bad', 'transfer', [
    { accountId: 'cash', minor: '-100' }, { accountId: 'card', minor: '99' },
  ]), accounts), /Unbalanced/);
});

test('a credit card payment reduces both cash and debt, without creating a second expense', () => {
  const b = balances(accounts, sampleEntries);
  assert.equal(b.get('cash'), 90000n);
  assert.equal(amountOwed(accounts[1], b.get('card')), 5000n);
  assert.equal(b.get('groceries'), 15000n);
  assert.deepEqual(netWorth(accounts, sampleEntries, 'INR'), { currency: 'INR', minor: '85000' });
});

test('goals can share a single asset without counting it twice', () => {
  const goals = [
    { id: 'emergency', name: 'Emergency', target: parseMajor('100000', 'INR') },
    { id: 'travel', name: 'Travel', target: parseMajor('50000', 'INR') },
  ];
  const assets = [{ sourceId: 'bank-a', currentValue: parseMajor('60000', 'INR') }];
  const allocations = [
    { sourceId: 'bank-a', goalId: 'emergency', mode: 'fixed', minor: '4700000' },
    { sourceId: 'bank-a', goalId: 'travel', mode: 'percent', basisPoints: 2000 },
  ];
  const result = calculateGoalProgress(goals, assets, allocations);
  assert.equal(result[0].funded.minor, '4700000');
  assert.equal(result[1].funded.minor, '1200000');
  assert.equal(unassignedValue(assets[0], allocations).minor, '100000');
});

test('goal allocation cannot silently exceed asset value', () => {
  const goals = [
    { id: 'emergency', name: 'Emergency', target: parseMajor('100000', 'INR') },
    { id: 'travel', name: 'Travel', target: parseMajor('50000', 'INR') },
  ];
  const assets = [{ sourceId: 'a', currentValue: parseMajor('50000', 'INR') }];
  assert.throws(() => calculateGoalProgress(goals, assets, [
    { sourceId: 'a', goalId: 'emergency', mode: 'fixed', minor: '4700000' },
    { sourceId: 'a', goalId: 'travel', mode: 'percent', basisPoints: 2000 },
  ]), /Over-allocated/);
});

test('cross-currency goal conversion uses explicit rate', () => {
  const goals = [{ id: 'trip', name: 'Travel', target: parseMajor('50000', 'INR') }];
  const assets = [{ sourceId: 'usd', currentValue: parseMajor('100', 'USD') }];
  const allocations = [{ sourceId: 'usd', goalId: 'trip', mode: 'percent', basisPoints: 5000 }];
  const fx = [{ base: 'USD', quote: 'INR', rate: '90.125', asOf: '2026-11-03' }]; // fixture, not a market quote
  assert.equal(calculateGoalProgress(goals, assets, allocations, fx)[0].funded.minor, '450625');
  assert.throws(() => calculateGoalProgress(goals, assets, allocations), /Missing explicit FX quote/);
});
