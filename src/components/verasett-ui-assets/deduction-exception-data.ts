import type { ProductEvidence } from './product-data';

export interface DeductionClaim {
  id: string; type: string; paymentReference: string; remittanceReference: string;
  customer: string; invoiceReferences: readonly string[]; amountMinor: number;
  evidenceReference?: string; evidenceVerified: boolean; evidenceDetail: string;
  configuredTreatment: string; proposedOutcome: string;
}

/** All references are fictional. Amounts are integer paise; treatment is illustrative, not tax advice. */
export const demoDeductionClaims: readonly DeductionClaim[] = [
  {
    id: 'TDS-DEMO-01', type: 'TDS', paymentReference: 'PAY-DEMO-1840', remittanceReference: 'REM-DEMO-041',
    customer: 'Illustrative customer A', invoiceReferences: ['INV-DEMO-1042', 'INV-DEMO-1048', 'INV-DEMO-1051'], amountMinor: 1400000,
    evidenceReference: 'TDS-EVID-DEMO-01', evidenceVerified: true, evidenceDetail: 'Deduction evidence linked to the remittance in this sample.',
    configuredTreatment: 'Require evidence and a customer-linked tax deduction category.', proposedOutcome: 'Separate tax receivable of ₹14,000, subject to controller approval.',
  },
  {
    id: 'DISC-DEMO-01', type: 'Early-payment discount', paymentReference: 'PAY-DEMO-1840', remittanceReference: 'REM-DEMO-041',
    customer: 'Illustrative customer A', invoiceReferences: ['INV-DEMO-1042', 'INV-DEMO-1048', 'INV-DEMO-1051'], amountMinor: 500000,
    evidenceReference: 'DISC-AUTH-DEMO-01', evidenceVerified: true, evidenceDetail: 'Discount authorization is approved in the illustrative evidence.',
    configuredTreatment: 'Use an authorized discount adjustment for eligible invoices.', proposedOutcome: 'Proposed discount adjustment of ₹5,000; payment allocation still awaits controller approval.',
  },
  {
    id: 'FEE-DEMO-01', type: 'Bank fee', paymentReference: 'PAY-DEMO-1840', remittanceReference: 'REM-DEMO-041',
    customer: 'Illustrative customer A', invoiceReferences: ['INV-DEMO-1042', 'INV-DEMO-1048', 'INV-DEMO-1051'], amountMinor: 100000,
    evidenceReference: 'BANK-DEMO-011 / row 1', evidenceVerified: true, evidenceDetail: 'A separate fee line is present in the uploaded sample statement.',
    configuredTreatment: 'Separate the documented bank fee from the received amount.', proposedOutcome: 'Proposed bank fee expense of ₹1,000, subject to controller approval.',
  },
  {
    id: 'WHT-DEMO-02', type: 'Withholding tax', paymentReference: 'PAY-DEMO-0217', remittanceReference: 'REM-DEMO-043',
    customer: 'Illustrative customer D', invoiceReferences: [], amountMinor: 1500000,
    evidenceVerified: false, evidenceDetail: 'Tax evidence and invoice attribution have not been established.',
    configuredTreatment: 'Hold the claim until evidence and invoice attribution are reviewed.', proposedOutcome: 'No adjustment proposed. Keep the claimed ₹15,000 unresolved.',
  },
  {
    id: 'SHORT-DEMO-02', type: 'Short payment', paymentReference: 'PAY-DEMO-0432', remittanceReference: 'REM-DEMO-042',
    customer: 'Illustrative customer B', invoiceReferences: ['INV-DEMO-2011'], amountMinor: 2500000,
    evidenceVerified: false, evidenceDetail: 'The claimed deduction has no supporting evidence attached.',
    configuredTreatment: 'Require human review; exclude the unsupported claim from clearing.', proposedOutcome: 'No adjustment proposed. Keep the claimed ₹25,000 unresolved.',
  },
];

export interface ReviewException {
  reference: string; customer: string; receivedMinor: number; candidateMinor?: number;
  reason: string; evidenceGap: string; nextAction: string; reviewer: string;
  claimedDeductionMinor?: number; evidence: readonly ProductEvidence[];
}

export const demoReviewExceptions: readonly ReviewException[] = [
  {
    reference: 'PAY-DEMO-0432', customer: 'Illustrative customer B', receivedMinor: 43200000, candidateMinor: 45700000,
    reason: 'Deduction evidence missing', evidenceGap: 'Received amount differs from eligible invoice balances; the claimed ₹25,000 deduction is unsupported.',
    nextAction: 'Inspect the remittance and obtain deduction evidence before reviewing the allocation.', reviewer: 'Unassigned · Human review required', claimedDeductionMinor: 2500000,
    evidence: [
      { reference: 'BANK-DEMO-011 / row 2', label: 'Receipt recorded in the uploaded bank statement', status: 'Available', tone: 'neutral' },
      { reference: 'REM-DEMO-042', label: 'Short-payment claim; supporting evidence not attached', status: 'Evidence pending', tone: 'review' },
      { reference: 'INV-DEMO-2011', label: 'Eligible invoice balance ₹4,57,000', status: 'Candidate only', tone: 'neutral' },
    ],
  },
  {
    reference: 'PAY-DEMO-0680', customer: 'Illustrative customer C', receivedMinor: 68000000,
    reason: 'Invoice references incomplete', evidenceGap: 'The remittance does not identify a complete invoice bundle. An eligible balance cannot yet be established.',
    nextAction: 'Obtain the complete invoice references and confirm the customer account.', reviewer: 'Unassigned · Human review required',
    evidence: [
      { reference: 'BANK-DEMO-011 / row 3', label: 'Receipt recorded in the uploaded bank statement', status: 'Available', tone: 'neutral' },
      { reference: 'REM-DEMO-044', label: 'Invoice reference field incomplete', status: 'Incomplete', tone: 'review' },
      { reference: 'AR-DEMO-011', label: 'Invoice attribution not established', status: 'Needs review', tone: 'review' },
    ],
  },
  {
    reference: 'PAY-DEMO-0217', customer: 'Illustrative customer D', receivedMinor: 21750000, candidateMinor: 23250000,
    reason: 'Multiple possible invoice bundles', evidenceGap: 'Two candidate bundles share the same total; withholding evidence and invoice attribution are unresolved.',
    nextAction: 'Compare the candidate references and request the missing withholding evidence.', reviewer: 'Unassigned · Human review required', claimedDeductionMinor: 1500000,
    evidence: [
      { reference: 'BANK-DEMO-011 / row 4', label: 'Receipt recorded in the uploaded bank statement', status: 'Available', tone: 'neutral' },
      { reference: 'REM-DEMO-043', label: 'Withholding claim lacks evidence', status: 'Evidence pending', tone: 'review' },
      { reference: 'AR-DEMO-011 / candidates', label: 'Two possible bundles; neither selected', status: 'Attribution unresolved', tone: 'review' },
    ],
  },
];
