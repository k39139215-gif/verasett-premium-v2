import type { InvoiceAllocation } from './types';

/** USD display formatter only. Deliberately uses integers, not decimal accounting arithmetic. */
export function formatMoney(amountMinor: number | bigint): string {
  if (typeof amountMinor === 'number' && !Number.isSafeInteger(amountMinor)) throw new RangeError('USD minor units must be a safe integer.');
  const amount = BigInt(amountMinor);
  const absolute = amount < 0n ? -amount : amount;
  const dollars = (absolute / 100n).toLocaleString('en-US');
  const cents = (absolute % 100n).toString().padStart(2, '0');
  return `${amount < 0n ? '-' : ''}$${dollars}.${cents}`;
}
export function isBalancedAllocation(amountMinor: number, invoices: readonly InvoiceAllocation[]): boolean {
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0 || !invoices.length) return false;
  const references = new Set<string>();
  let total = 0n;
  for (const invoice of invoices) {
    if (!Number.isSafeInteger(invoice.amountMinor) || invoice.amountMinor <= 0 || !invoice.reference.trim() || references.has(invoice.reference)) return false;
    references.add(invoice.reference);
    total += BigInt(invoice.amountMinor);
  }
  return total === BigInt(amountMinor);
}
export function getProgress(completed: number, total: number) {
  const safe = (n: number) => Number.isFinite(n) ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(n))) : 0;
  const normalizedTotal = safe(total);
  const normalizedCompleted = Math.min(safe(completed), normalizedTotal);
  return { completed: normalizedCompleted, total: normalizedTotal, percent: normalizedTotal ? normalizedCompleted / normalizedTotal * 100 : 0 };
}
