/**
 * Money handling. Base/reporting currency is UZS. Spend and revenue can be
 * recorded in other currencies (e.g. USD ad spend) with an `fx_rate` captured
 * on the row = how many UZS one unit of that currency was worth at the time.
 *
 * Amounts are stored as SQL `numeric` (exact). This module is the SINGLE place
 * currency conversion happens — no ad-hoc `amount * fx_rate` in components or
 * queries. For AGGREGATES prefer summing in SQL (`sum(amount * fx_rate)`) so
 * the arithmetic stays in numeric; use these helpers for single values/display.
 */
export const BASE_CURRENCY = "UZS" as const;

/** Supported entry currencies (extend as needed). */
export const CURRENCIES = ["UZS", "USD", "EUR", "RUB"] as const;
export type Currency = (typeof CURRENCIES)[number];

type Num = string | number;

const toNum = (v: Num): number => (typeof v === "string" ? Number(v) : v);

/**
 * Convert an amount in its row currency to base UZS using the row's fx_rate.
 * Rounds to whole UZS (the base currency has no minor unit in practice).
 */
export function toBaseUZS(amount: Num, fxRate: Num): number {
  const a = toNum(amount);
  const r = toNum(fxRate);
  if (!Number.isFinite(a) || !Number.isFinite(r)) return 0;
  return Math.round(a * r);
}

/** Format a UZS amount for display. */
export function formatUZS(amountUZS: Num): string {
  const n = toNum(amountUZS);
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Math.round(n || 0))} UZS`;
}

/** Format an original-currency amount (as entered, before conversion). */
export function formatMoney(amount: Num, currency: string): string {
  const n = toNum(amount);
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(n || 0)} ${currency}`;
}
