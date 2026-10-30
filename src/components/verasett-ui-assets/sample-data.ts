import type { IncomingPayment, Payment, PaymentMatch } from './types';

/** Illustrative records, not actual bank activity or product performance. */
export const demoPayments: readonly Payment[] = [
  { reference: 'ACH-78421', amountMinor: 1245000, customer: 'Acme Corp', status: 'Matched' },
  { reference: 'WIRE-99302', amountMinor: 875000, customer: 'Global Traders', status: 'Matched' },
  { reference: 'ACH-55231', amountMinor: 432000, customer: 'Westline Ltd', status: 'Review' },
  { reference: 'WIRE-77120', amountMinor: 1592000, customer: 'Orion Supply', status: 'Matched' },
];
export const demoMatch: PaymentMatch = {
  reference: 'ACH-78421', amountMinor: 1245000,
  invoices: [
    { reference: 'INV-1042', amountMinor: 800000 },
    { reference: 'INV-1048', amountMinor: 300000 },
    { reference: 'INV-1051', amountMinor: 145000 },
  ],
};
export const demoDeduction = { deductionType: 'Short payment', claimedAmountMinor: 25000 };
/** Revised five-column example requested after the visual reference review. */
export const demoIncomingPayments: readonly IncomingPayment[] = [
  { reference: 'ACH-78421', amountMinor: 1245000, customer: 'Acme Distribution', invoiceAllocation: '3 invoices', status: 'Matched' },
  { reference: 'WIRE-99302', amountMinor: 875000, customer: 'Global Supply Co.', invoiceAllocation: '2 invoices', status: 'Matched' },
  { reference: 'ACH-55231', amountMinor: 432000, customer: 'Westline Trading', invoiceAllocation: 'Review required', status: 'Needs review' },
  { reference: 'WIRE-77120', amountMinor: 1592000, customer: 'Orion Wholesale', invoiceAllocation: '5 invoices', status: 'Matched' },
];
