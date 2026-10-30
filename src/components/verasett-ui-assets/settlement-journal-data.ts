import { demoRun, type ProductEvidence } from './product-data';

export interface SettlementJournalEntry {
  id: string;
  timestamp: string;
  dateTime: string;
  paymentReference: string;
  customer: string;
  amountMinor: number;
  state: 'proposal' | 'review' | 'pending';
  summary: string;
  detail: string;
  evidence: readonly ProductEvidence[];
}

const journalDetails = [
  { timestamp: '10:03', state: 'proposal' as const, summary: 'Three invoices proposed for allocation', detail: '₹18,60,000 invoice face value less ₹20,000 evidenced deductions equals the receipt. Attribution is supported in this sample; controller approval remains pending.', evidence: [{ reference: 'REM-DEMO-041', label: 'Customer and three invoice references confirmed', status: 'Evidence linked', tone: 'success' as const }, { reference: 'AR-DEMO-011', label: 'Eligible open balances · INR · Same customer', status: 'Eligible in sample', tone: 'success' as const }] },
  { timestamp: '10:06', state: 'review' as const, summary: 'Short-payment claim held for evidence', detail: 'The ₹4,32,000 receipt is ₹25,000 below the ₹4,57,000 candidate invoice. The claim remains unverified and excluded from clearing.', evidence: [{ reference: 'REM-DEMO-042', label: '₹25,000 short-payment claim lacks support', status: 'Evidence pending', tone: 'review' as const }, { reference: 'INV-DEMO-2011', label: 'Candidate balance ₹4,57,000', status: 'Not applied', tone: 'neutral' as const }] },
  { timestamp: '10:09', state: 'review' as const, summary: 'Invoice references need clarification', detail: 'A complete invoice bundle cannot be established from the remittance. No allocation or zero-variance claim has been inferred.', evidence: [{ reference: 'REM-DEMO-044', label: 'Incomplete invoice references', status: 'Needs review', tone: 'review' as const }] },
  { timestamp: '10:12', state: 'review' as const, summary: 'Multiple candidate bundles remain unresolved', detail: 'Two candidate bundles share ₹2,32,500 face value. The ₹15,000 withholding claim and invoice attribution require evidence before a bundle can be selected.', evidence: [{ reference: 'REM-DEMO-043', label: 'Withholding evidence not attached', status: 'Evidence pending', tone: 'review' as const }, { reference: 'AR-DEMO-011', label: 'Two candidate bundles · Neither selected', status: 'Attribution open', tone: 'review' as const }] },
];

/** Fictional receipt decisions recorded within one illustrative run. Amounts are integer paise. */
export const demoSettlementJournalEntries: readonly SettlementJournalEntry[] = demoRun.payments.map((payment, index) => ({
  id: `JRN-DEMO-00${index + 1}`, paymentReference: payment.reference, customer: payment.customer, amountMinor: payment.amountMinor,
  ...journalDetails[index], dateTime: `2026-10-11T${journalDetails[index].timestamp}:00+05:30`,
}));
