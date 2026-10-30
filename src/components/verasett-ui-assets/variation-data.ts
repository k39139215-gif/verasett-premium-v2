import type { Payment } from './types';

/** Illustrative review data. Candidate totals and claimed deductions are not verified. */
export interface ReviewPayment extends Omit<Payment, 'status'> {
  status: 'Needs review' | 'Evidence pending' | 'Blocked';
  reason: string;
  candidateAmountMinor?: number;
  evidence: string;
  claimedDeductionMinor?: number;
}
export const demoReviewPayments: readonly ReviewPayment[] = [
  { reference: 'ACH-55231', customer: 'Westline Trading', amountMinor: 432000, status: 'Needs review',
    reason: 'Remittance amount differs from open invoices', candidateAmountMinor: 457000,
    evidence: 'Evidence pending', claimedDeductionMinor: 25000 },
  { reference: 'WIRE-88019', customer: 'Harbor Parts', amountMinor: 680000, status: 'Evidence pending',
    reason: 'Invoice references missing from remittance', evidence: 'Remittance requested' },
  { reference: 'ACH-66204', customer: 'Cedar Industrial', amountMinor: 217500, status: 'Needs review',
    reason: 'Payment total differs from candidate invoice', candidateAmountMinor: 232500,
    evidence: 'Invoice allocation requires confirmation' },
];
