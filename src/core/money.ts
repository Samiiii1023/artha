/**
 * Monetary values are integer minor units, NEVER floating point balances.
 * The persistence-friendly representation is a decimal integer string.
 * Example: INR 123.45 = "12345"; KRW 123 = "123".
 */
export type Currency = 'INR' | 'KRW' | 'USD';
export type MinorUnits = string;
export interface Money {
  readonly currency: Currency;
  readonly minor: MinorUnits;
}

export const MINOR_DIGITS: Readonly<Record<Currency, number>> = {
  INR: 2,
  KRW: 0,
  USD: 2,
};

function pow10(n: number): bigint {
  return 10n ** BigInt(n);
}

export function parseMinor(minor: string): bigint {
  if (!/^-?(?:0|[1-9]\d*)$/.test(minor)) {
    throw new Error(`Invalid integer minor units: ${minor}`);
  }
  return BigInt(minor);
}

export function parseMajor(amount: string, currency: Currency): Money {
  const cleaned = amount.trim();
  const match = /^(-?)(\d+)(?:\.(\d+))?$/.exec(cleaned);
  if (!match) throw new Error(`Invalid monetary amount: ${amount}`);
  const [, sign, whole, fraction = ''] = match;
  const digits = MINOR_DIGITS[currency];
  if (fraction.length > digits) {
    throw new Error(`${currency} supports at most ${digits} decimal places`);
  }
  const absMinor = BigInt(whole!) * pow10(digits)
    + BigInt((fraction.padEnd(digits, '0')) || '0');
  return { currency, minor: (sign === '-' ? -absMinor : absMinor).toString() };
}

export function formatMajor(value: Money): string {
  const n = parseMinor(value.minor);
  const sign = n < 0n ? '-' : '';
  const abs = n < 0n ? -n : n;
  const d = MINOR_DIGITS[value.currency];
  if (d === 0) return `${sign}${abs}`;
  const divisor = pow10(d);
  return `${sign}${abs / divisor}.${String(abs % divisor).padStart(d, '0')}`;
}

/** Rate: one whole unit of `base` costs `rate` whole units of `quote`. */
export interface FxQuote {
  readonly base: Currency;
  readonly quote: Currency;
  readonly rate: string; // positive decimal string (not a JS float)
  readonly asOf: string; // YYYY-MM-DD, verified by caller/source
}

function rationalDecimal(input: string): { num: bigint; den: bigint } {
  const match = /^(\d+)(?:\.(\d+))?$/.exec(input);
  if (!match) throw new Error('FX rate must be a positive decimal string');
  const frac = match[2] ?? '';
  const den = pow10(frac.length);
  const num = BigInt(match[1]! + frac);
  if (num <= 0n) throw new Error('FX rate must be positive');
  return { num, den };
}

/** Half-away-from-zero rounding, at the target currency's minor unit. */
function divRound(n: bigint, d: bigint): bigint {
  if (d <= 0n) throw new Error('Invalid divisor');
  const sign = n < 0n ? -1n : 1n;
  const abs = n < 0n ? -n : n;
  return sign * ((2n * abs + d) / (2n * d));
}

export function convertMoney(value: Money, target: Currency, quote?: FxQuote): Money {
  if (value.currency === target) return { ...value };
  if (!quote || quote.base !== value.currency || quote.quote !== target) {
    throw new Error(`Missing explicit FX quote: ${value.currency} -> ${target}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(quote.asOf)) {
    throw new Error('FX quote needs an asOf date (YYYY-MM-DD)');
  }
  const { num, den } = rationalDecimal(quote.rate);
  const numerator = parseMinor(value.minor) * num * pow10(MINOR_DIGITS[target]);
  const denominator = den * pow10(MINOR_DIGITS[value.currency]);
  return { currency: target, minor: divRound(numerator, denominator).toString() };
}
