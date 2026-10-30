import type { ProductMatch } from './product-data';

/** Indian grouping with exact integer paise. This formats demo data, not tax or accounting rules. */
export function formatINR(minor: number | bigint): string {
  if (typeof minor === 'number' && !Number.isSafeInteger(minor)) throw new RangeError('INR values must be safe integer paise.');
  const value = BigInt(minor), abs = value < 0n ? -value : value;
  const paise = abs % 100n;
  return `${value < 0n ? '-' : ''}₹${(abs / 100n).toLocaleString('en-IN')}${paise ? `.${paise.toString().padStart(2, '0')}` : ''}`;
}
export function summarizeMatch(match: ProductMatch) {
  const unique = (refs: readonly string[]) => refs.every(ref => ref.trim().length > 0) && new Set(refs).size === refs.length;
  const amountsValid = Number.isSafeInteger(match.receivedMinor) && match.receivedMinor > 0
    && match.invoices.every(i => Number.isSafeInteger(i.amountMinor) && i.amountMinor > 0)
    && match.deductions.every(d => Number.isSafeInteger(d.amountMinor) && d.amountMinor >= 0);
  const face = match.invoices.reduce((sum, i) => sum + (Number.isSafeInteger(i.amountMinor) ? BigInt(i.amountMinor) : 0n), 0n);
  const deductions = match.deductions.reduce((sum, d) => sum + (Number.isSafeInteger(d.amountMinor) ? BigInt(d.amountMinor) : 0n), 0n);
  const net = face - deductions;
  const variance = (Number.isSafeInteger(match.receivedMinor) ? BigInt(match.receivedMinor) : 0n) - net;
  const valid = amountsValid && Boolean(match.reference.trim()) && match.invoices.length > 0 && unique(match.invoices.map(i => i.reference)) && unique(match.deductions.map(d => d.id)) && deductions <= face;
  const eligible = Boolean(match.customerId.trim()) && Object.values(match.eligibility).every(Boolean)
    && match.evidence.length > 0 && unique(match.evidence.map(e => e.reference)) && match.evidence.every(e => e.tone === 'success')
    && match.deductions.every(d => d.verified && d.evidenceReference.trim().length > 0);
  return { valid, face, deductions, net, variance, eligible, canApprove: valid && eligible && variance === 0n };
}
