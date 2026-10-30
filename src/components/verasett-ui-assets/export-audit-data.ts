import { demoProductMatch, demoRun, type ProductEvidence, type ScreenTone } from './product-data';

export interface ClearingExportLine {
  id: string;
  kind: 'receipt' | 'adjustment' | 'invoice';
  reference: string;
  label: string;
  /** Safe integer paise. Exactly one side of a clearing line must be positive. */
  debitMinor: number;
  creditMinor: number;
  evidenceReference: string;
}

export const demoExportBatchId = 'DEMO-CSV-011';
export const demoExportTarget = 'Generic clearing CSV · Illustrative template';
/** Display-only double-entry example. Invoice credits are not additional bank receipts. */
export const demoClearingExportLines: readonly ClearingExportLine[] = [
  { id: 'DEMO-L001', kind: 'receipt', reference: demoProductMatch.reference, label: 'Bank receipt', debitMinor: demoProductMatch.receivedMinor, creditMinor: 0, evidenceReference: `${demoRun.statement} / row 1` },
  ...demoProductMatch.deductions.map((deduction, index): ClearingExportLine => ({
    id: `DEMO-L00${index + 2}`, kind: 'adjustment', reference: deduction.id, label: deduction.label,
    debitMinor: deduction.amountMinor, creditMinor: 0, evidenceReference: deduction.evidenceReference,
  })),
  ...demoProductMatch.invoices.map((invoice, index): ClearingExportLine => ({
    id: `DEMO-L00${index + 5}`, kind: 'invoice', reference: invoice.reference, label: 'Customer AR clearing',
    debitMinor: 0, creditMinor: invoice.amountMinor, evidenceReference: demoRun.openAr,
  })),
];

export interface ReconciliationAuditEvent {
  id: string;
  timestamp: string;
  dateTime: string;
  title: string;
  summary: string;
  status: string;
  tone: ScreenTone;
  actor: string;
  detail: string;
  evidence: readonly ProductEvidence[];
}

/** A later, explicitly approved illustrative snapshot; not the live state of another preview. */
export const demoReconciliationAuditEvents: readonly ReconciliationAuditEvent[] = [
  {
    id: 'AUD-DEMO-001', timestamp: '10:00:00', dateTime: '2026-10-11T10:00:00+05:30',
    title: 'Source evidence received', summary: 'Bank, remittance and open AR inputs linked to run',
    status: 'Recorded', tone: 'neutral', actor: 'Illustrative intake validation',
    detail: 'Uploaded files establish the evidence set for this run. The remittance contains complete references for this receipt; other receipts remain in review.',
    evidence: [
      { reference: demoRun.statement, label: 'Bank statement · INR receipt at row 1', status: 'Validated in sample', tone: 'success' },
      { reference: demoRun.remittance, label: 'Detached remittance · Selected customer and invoice references', status: 'Linked in sample', tone: 'success' },
      { reference: demoRun.openAr, label: 'Open AR ledger · Customer balances at intake', status: 'Validated in sample', tone: 'success' },
    ],
  },
  {
    id: 'AUD-DEMO-002', timestamp: '10:02:14', dateTime: '2026-10-11T10:02:14+05:30',
    title: 'Invoice candidates assessed', summary: '4 considered · 3 eligible references selected',
    status: 'Evidence checked', tone: 'success', actor: 'Illustrative eligibility checks',
    detail: 'Customer, currency, open balance and explicit remittance references were checked separately from amount equality. An invoice absent from the remittance was excluded.',
    evidence: [
      ...demoProductMatch.invoices.map(invoice => ({ reference: invoice.reference, label: 'Same customer · INR · Open balance · Named in remittance', status: 'Eligible in sample', tone: 'success' as const })),
      { reference: 'INV-DEMO-1063', label: 'Candidate excluded: no matching remittance reference', status: 'Excluded', tone: 'neutral' },
    ],
  },
  {
    id: 'AUD-DEMO-003', timestamp: '10:03:02', dateTime: '2026-10-11T10:03:02+05:30',
    title: 'Allocation and rules proposed', summary: '₹18,60,000 face value · ₹20,000 adjustments',
    status: 'Proposed', tone: 'neutral', actor: 'Illustrative configured rule set',
    detail: 'INV-DEMO-1042 ₹8,00,000 + INV-DEMO-1048 ₹6,00,000 + INV-DEMO-1051 ₹4,60,000. TDS ₹14,000 is a tax receivable; approved discount ₹5,000 and bank fee ₹1,000 are separate adjustments.',
    evidence: [
      { reference: 'RULE-DEMO-TDS', label: 'TDS treatment · TDS-EVID-DEMO-01', status: 'Evidence checked', tone: 'success' },
      { reference: 'RULE-DEMO-DISC', label: 'Discount treatment · DISC-AUTH-DEMO-01', status: 'Authorization checked', tone: 'success' },
      { reference: 'RULE-DEMO-FEE', label: 'Bank fee treatment · BANK-DEMO-011 / row 1', status: 'Evidence checked', tone: 'success' },
    ],
  },
  {
    id: 'AUD-DEMO-004', timestamp: '10:03:03', dateTime: '2026-10-11T10:03:03+05:30',
    title: 'Arithmetic invariant checked', summary: '₹18,60,000 − ₹20,000 = ₹18,40,000',
    status: '₹0 variance', tone: 'success', actor: 'Illustrative invariant check',
    detail: '₹18,60,000 − ₹14,000 − ₹5,000 − ₹1,000 = ₹18,40,000. Zero arithmetic variance is separate from customer and invoice eligibility and does not grant approval.',
    evidence: [{ reference: 'CHECK-DEMO-001', label: 'Integer-paise allocation comparison', status: 'Balanced in sample', tone: 'success' }],
  },
  {
    id: 'AUD-DEMO-005', timestamp: '10:18:42', dateTime: '2026-10-11T10:18:42+05:30',
    title: 'Controller approval recorded', summary: 'Proposed allocation and evidence reviewed',
    status: 'Approved in sample', tone: 'success', actor: 'Illustrative controller',
    detail: 'This later illustrative snapshot includes an explicit controller approval of the selected allocation, deduction treatment and supporting evidence. It is independent of the interactive approval preview.',
    evidence: [{ reference: 'APR-DEMO-011', label: 'Illustrative controller review decision', status: 'Approved in sample', tone: 'success' }],
  },
  {
    id: 'AUD-DEMO-006', timestamp: '10:20:06', dateTime: '2026-10-11T10:20:06+05:30',
    title: 'Clearing batch prepared', summary: '7 balanced lines · Generic clearing CSV template',
    status: 'Prepared in sample', tone: 'neutral', actor: 'Illustrative export preparation',
    detail: 'The approved receipt and its adjustments are paired with invoice clearing credits. The recorded outcome ends at batch preparation; there is no ERP posting event or delivery acknowledgement.',
    evidence: [{ reference: demoExportBatchId, label: 'Prepared output reference · No file created by this preview', status: 'Not posted', tone: 'neutral' }],
  },
];
