import type { InvoiceAllocation } from './types';

export type ScreenTone = 'neutral' | 'success' | 'review' | 'blocked';
export interface ProductEvidence { reference: string; label: string; status: string; tone?: ScreenTone }
export interface ProductMatch {
  reference: string; customer: string; customerId: string; receivedMinor: number;
  invoices: readonly InvoiceAllocation[];
  deductions: readonly { id: string; label: string; amountMinor: number; evidenceReference: string; treatment: string; verified: boolean }[];
  evidence: readonly ProductEvidence[];
  eligibility: { customerConfirmed: boolean; invoiceReferencesConfirmed: boolean; invoicesOpen: boolean };
}
/** Fictional Indian-rupee sample. All amounts are integer paise, all evidence is illustrative. */
export const demoProductMatch: ProductMatch = {
  reference: 'PAY-DEMO-1840', customer: 'Illustrative customer A', customerId: 'CUST-DEMO-A', receivedMinor: 184000000,
  invoices: [
    { reference: 'INV-DEMO-1042', amountMinor: 80000000 },
    { reference: 'INV-DEMO-1048', amountMinor: 60000000 },
    { reference: 'INV-DEMO-1051', amountMinor: 46000000 },
  ],
  deductions: [
    { id: 'TDS-DEMO-01', label: 'TDS', amountMinor: 1400000, evidenceReference: 'TDS-EVID-DEMO-01', treatment: 'Separate tax receivable', verified: true },
    { id: 'DISC-DEMO-01', label: 'Approved discount', amountMinor: 500000, evidenceReference: 'DISC-AUTH-DEMO-01', treatment: 'Configured discount adjustment', verified: true },
    { id: 'FEE-DEMO-01', label: 'Bank fee', amountMinor: 100000, evidenceReference: 'BANK-DEMO-011 / row 1', treatment: 'Separate bank fee expense', verified: true },
  ],
  evidence: [
    { reference: 'REM-DEMO-041', label: 'Customer identity and all three invoice references', status: 'Confirmed in sample', tone: 'success' },
    { reference: 'AR-DEMO-011', label: 'Same customer, currency and eligible open balances', status: 'Eligible in sample', tone: 'success' },
    { reference: 'TDS-EVID-DEMO-01', label: 'Tax deduction evidence attached to remittance', status: 'Verified in sample', tone: 'success' },
    { reference: 'DISC-AUTH-DEMO-01', label: 'Discount authorization for the selected invoices', status: 'Approved in sample', tone: 'success' },
  ],
  eligibility: { customerConfirmed: true, invoiceReferencesConfirmed: true, invoicesOpen: true },
};

export interface RunPayment { reference: string; customer: string; amountMinor: number; allocation: string; status: 'Matched' | 'Needs review'; detail: string }
export interface ReconciliationRun {
  id: string; statement: string; remittance: string; openAr: string; updatedAt: string;
  payments: readonly RunPayment[];
}
export const demoRun: ReconciliationRun = {
  id: 'RCN-DEMO-1011', statement: 'BANK-DEMO-011', remittance: 'REM-DEMO-041', openAr: 'AR-DEMO-011', updatedAt: '11 Oct 2026 · 10:12 IST',
  payments: [
    { reference: 'PAY-DEMO-1840', customer: 'Illustrative customer A', amountMinor: 184000000, allocation: '3 eligible invoices', status: 'Matched', detail: 'Evidence confirmed · Approval pending' },
    { reference: 'PAY-DEMO-0432', customer: 'Illustrative customer B', amountMinor: 43200000, allocation: 'Candidate invoices', status: 'Needs review', detail: 'Deduction evidence missing' },
    { reference: 'PAY-DEMO-0680', customer: 'Illustrative customer C', amountMinor: 68000000, allocation: 'Not established', status: 'Needs review', detail: 'Invoice references incomplete' },
    { reference: 'PAY-DEMO-0217', customer: 'Illustrative customer D', amountMinor: 21750000, allocation: 'Multiple candidates', status: 'Needs review', detail: 'Bundle attribution unresolved' },
  ],
};

export interface IntakeInput { id: string; kind: 'bank' | 'remittance' | 'open-ar'; label: string; format: string; status: string; validation: string; detail: string; tone: ScreenTone; /** Source presence is separate from evidence validation. Omitted defaults to present except legacy status "Missing input". */ available?: boolean }
export const demoIntakeInputs: readonly IntakeInput[] = [
  { id: 'BANK-DEMO-011', kind: 'bank', label: 'Bank statement', format: 'Uploaded CSV', status: 'Validated', validation: '4 receipts · INR', detail: 'Required columns present; payment references unique', tone: 'success', available: true },
  { id: 'REM-DEMO-041', kind: 'remittance', label: 'Detached remittance advice', format: 'Uploaded PDF', status: 'Review required', validation: 'Parsed · Reference gaps', detail: 'One receipt has incomplete invoice references; held for human review', tone: 'review', available: true },
  { id: 'AR-DEMO-011', kind: 'open-ar', label: 'Open AR ledger', format: 'Uploaded CSV', status: 'Validated', validation: 'Open balances · INR', detail: 'Customer and invoice identifiers available for eligibility checks', tone: 'success', available: true },
];
