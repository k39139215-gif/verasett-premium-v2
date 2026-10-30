import { demoProductMatch } from './product-data';

export interface RemittanceLine {
  reference: string;
  faceMinor: number;
  sourceLocation: string;
  evidence: 'located' | 'incomplete';
}
export interface RemittanceDocument {
  id: string;
  customer: string;
  receivedAt: string;
  paymentReference: string;
  receivedMinor: number;
  sourceLabel: string;
  sourceFormat: string;
  status: 'linked' | 'review' | 'pending';
  message: string;
  lines: readonly RemittanceLine[];
  adjustments: readonly { label: string; amountMinor: number; evidence: string }[];
  note: string;
}

/** Fictional document transcripts. Reading a reference does not verify an invoice or approve a deduction. */
export const demoRemittanceDocuments: readonly RemittanceDocument[] = [
  {
    id: 'REM-DEMO-041', customer: demoProductMatch.customer, receivedAt: '11 Oct · 10:02 IST',
    paymentReference: demoProductMatch.reference, receivedMinor: demoProductMatch.receivedMinor,
    sourceLabel: 'Remittance advice', sourceFormat: 'PDF · 1 page', status: 'linked',
    message: 'Please apply this remittance to the three invoice references listed below. Tax, discount and bank fee details accompany the advice.',
    lines: demoProductMatch.invoices.map((invoice, index) => ({ reference: invoice.reference, faceMinor: invoice.amountMinor, sourceLocation: `Page 1 · line ${index + 4}`, evidence: 'located' })),
    adjustments: demoProductMatch.deductions.map(deduction => ({ label: deduction.label, amountMinor: deduction.amountMinor, evidence: deduction.evidenceReference })),
    note: 'References are located in this sample document. Open balances and adjustment evidence require separate review.',
  },
  {
    id: 'REM-DEMO-042', customer: 'Illustrative customer B', receivedAt: '11 Oct · 10:04 IST',
    paymentReference: 'PAY-DEMO-0432', receivedMinor: 43200000,
    sourceLabel: 'Payment advice', sourceFormat: 'PDF · 1 page', status: 'review',
    message: 'Payment relates to the invoice below. A short-payment adjustment has been claimed; supporting documentation has not been provided.',
    lines: [{ reference: 'INV-DEMO-2011', faceMinor: 45700000, sourceLocation: 'Page 1 · line 3', evidence: 'located' }],
    adjustments: [{ label: 'Claimed short payment', amountMinor: 2500000, evidence: 'Evidence pending' }],
    note: 'The claimed deduction is unsupported. This document does not authorize an adjustment or close an invoice.',
  },
  {
    id: 'REM-DEMO-044', customer: 'Illustrative customer C', receivedAt: '11 Oct · 10:07 IST',
    paymentReference: 'PAY-DEMO-0680', receivedMinor: 68000000,
    sourceLabel: 'Remittance note', sourceFormat: 'Text · 1 page', status: 'pending',
    message: 'Payment for the current open account. The advice does not specify invoice numbers; request a complete allocation from the customer.',
    lines: [], adjustments: [], note: 'Invoice references are missing. A payment amount alone does not establish the intended allocation.',
  },
];
