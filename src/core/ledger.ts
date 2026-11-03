import { convertMoney, parseMinor, type Currency, type FxQuote, type Money } from './money.js';

/** Convention: debits positive, credits negative. */
export type AccountKind = 'asset' | 'liability' | 'equity' | 'income' | 'expense';
export interface Account {
  readonly id: string;
  readonly name: string;
  readonly currency: Currency;
  readonly kind: AccountKind;
}
export interface Posting {
  readonly accountId: string;
  readonly minor: string;
}
export type EntryType = 'opening' | 'income' | 'expense' | 'transfer' | 'payment' | 'trade' | 'adjustment';
export interface JournalEntry {
  readonly id: string;
  readonly date: string;
  readonly description: string;
  readonly type: EntryType;
  readonly postings: readonly Posting[];
}

export function validateEntry(entry: JournalEntry, accounts: readonly Account[]): void {
  if (!entry.id || !entry.description) throw new Error('Entry needs an ID and description');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) throw new Error('Invalid entry date');
  if (entry.postings.length < 2) throw new Error('Entry needs at least two postings');
  const accountById = new Map(accounts.map(a => [a.id, a]));
  if (accountById.size !== accounts.length) throw new Error('Duplicate account IDs');
  let currency: Currency | undefined;
  let sum = 0n;
  const seen = new Set<string>();
  for (const posting of entry.postings) {
    if (seen.has(posting.accountId)) throw new Error('Duplicate account in one journal entry');
    seen.add(posting.accountId);
    const account = accountById.get(posting.accountId);
    if (!account) throw new Error(`Unknown account: ${posting.accountId}`);
    currency ??= account.currency;
    if (account.currency !== currency) {
      throw new Error('Cross-currency entries require an explicit FX transaction (not implemented yet)');
    }
    const amount = parseMinor(posting.minor);
    if (amount === 0n) throw new Error('Zero-value posting');
    sum += amount;
  }
  if (sum !== 0n) throw new Error(`Unbalanced entry ${entry.id}: ${sum}`);
}

export function balances(accounts: readonly Account[], entries: readonly JournalEntry[]): Map<string, bigint> {
  const result = new Map<string, bigint>(accounts.map(a => [a.id, 0n]));
  if (result.size !== accounts.length) throw new Error('Duplicate account IDs');
  const entryIds = new Set<string>();
  for (const entry of entries) {
    if (entryIds.has(entry.id)) throw new Error(`Duplicate journal ID: ${entry.id}`);
    entryIds.add(entry.id);
    validateEntry(entry, accounts);
    for (const posting of entry.postings) {
      result.set(posting.accountId, result.get(posting.accountId)! + parseMinor(posting.minor));
    }
  }
  return result;
}

/** A debit-positive liability balance is negative; negate it to show amount owed. */
export function amountOwed(account: Account, balance: bigint): bigint {
  if (account.kind !== 'liability') throw new Error('Not a liability');
  return -balance;
}

/**
 * Converts assets + signed liability balances to the reporting currency.
 * Explicit FX quotes are mandatory; no invented/current exchange rates.
 */
export function netWorth(
  accounts: readonly Account[],
  entries: readonly JournalEntry[],
  reportingCurrency: Currency,
  fxQuotes: readonly FxQuote[] = [],
): Money {
  const b = balances(accounts, entries);
  let total = 0n;
  for (const account of accounts) {
    if (account.kind !== 'asset' && account.kind !== 'liability') continue;
    const quote = fxQuotes.find(q => q.base === account.currency && q.quote === reportingCurrency);
    const converted = convertMoney(
      { currency: account.currency, minor: b.get(account.id)!.toString() },
      reportingCurrency,
      quote,
    );
    total += parseMinor(converted.minor);
  }
  return { currency: reportingCurrency, minor: total.toString() };
}
