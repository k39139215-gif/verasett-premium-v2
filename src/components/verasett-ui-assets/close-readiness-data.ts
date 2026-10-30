import { demoProductMatch, demoRun } from './product-data';

export type CloseStage = 'evidence' | 'allocation' | 'release';
export interface CloseControl {
  id: string;
  stage: CloseStage;
  title: string;
  status: 'satisfied' | 'review' | 'pending';
  summary: string;
  detail: string;
  owner: string;
  references: readonly string[];
}
/** Run-wide illustrative gates. A balanced individual receipt does not resolve the other exceptions. */
export const demoCloseControls: readonly CloseControl[] = [
  { id: 'CTL-SOURCE', stage: 'evidence', title: 'Source integrity', status: 'satisfied', summary: 'Statement and open AR supplied', detail: 'The uploaded sample statement and open AR contain the required identifiers. No bank or ERP connection is represented.', owner: 'Reconciliation analyst', references: [demoRun.statement, demoRun.openAr] },
  { id: 'CTL-IDENTITY', stage: 'evidence', title: 'Selected receipt attribution', status: 'satisfied', summary: 'Customer and invoice references traced', detail: 'The selected receipt is attributable to illustrative customer A and three explicitly referenced invoices. This check applies only to the selected receipt.', owner: 'Reconciliation analyst', references: [demoRun.remittance, demoProductMatch.reference] },
  { id: 'CTL-SUPPORT', stage: 'evidence', title: 'Deduction support', status: 'review', summary: 'One claimed adjustment lacks evidence', detail: 'Customer B claims a short payment on PAY-DEMO-0432. Supporting evidence is absent, so the claimed deduction remains unverified.', owner: 'AR specialist', references: ['PAY-DEMO-0432', 'REM-DEMO-042'] },
  { id: 'CTL-BALANCE', stage: 'allocation', title: 'Selected allocation balances', status: 'satisfied', summary: 'Net ₹18,40,000 equals receipt', detail: 'Invoice faces of ₹18,60,000 less ₹20,000 in separately supported adjustments equal the selected ₹18,40,000 receipt. This is illustrative arithmetic, not an approval.', owner: 'Reconciliation analyst', references: [demoProductMatch.reference, ...demoProductMatch.invoices.map(invoice => invoice.reference)] },
  { id: 'CTL-ELIGIBILITY', stage: 'allocation', title: 'Open-invoice eligibility', status: 'satisfied', summary: 'Selected invoices belong to one customer', detail: 'The selected sample invoices have compatible customer, currency and open balances. Eligibility for unresolved receipts is not inferred from this check.', owner: 'AR specialist', references: [demoRun.openAr, demoProductMatch.customerId] },
  { id: 'CTL-EXCEPTIONS', stage: 'allocation', title: 'Run exceptions resolved', status: 'review', summary: 'Three receipts remain held', detail: 'Evidence, incomplete invoice references and ambiguous bundle attribution remain unresolved across three receipts. Held received value is ₹13,29,500; it is not an accounting variance.', owner: 'Exception reviewer', references: ['PAY-DEMO-0432', 'PAY-DEMO-0680', 'PAY-DEMO-0217'] },
  { id: 'CTL-JOURNAL', stage: 'release', title: 'Selected journal balances', status: 'satisfied', summary: 'Debit and credit proposals agree', detail: 'The illustrative journal for the selected receipt has ₹18,60,000 on each side. A balanced journal does not establish approval or ERP posting.', owner: 'Controller', references: [demoProductMatch.reference, 'JRN-DEMO-1840'] },
  { id: 'CTL-REVIEW', stage: 'release', title: 'Independent controller review', status: 'pending', summary: 'Explicit reviewer decision required', detail: 'No independent approval has been recorded for this run. Reading or expanding these controls does not approve an allocation, generate an export or post to an ERP.', owner: 'Independent controller', references: [demoRun.id] },
];
