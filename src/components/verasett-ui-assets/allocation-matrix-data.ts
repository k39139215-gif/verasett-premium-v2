export interface MatrixInvoiceAllocation {
  reference: string;
  faceMinor: number;
  cashMinor: number;
  taxMinor: number;
  discountMinor: number;
  bankFeeMinor: number;
  evidenceReference: string;
  evidenceConfirmed: boolean;
  eligible: boolean;
}

export interface AllocationMatrixData {
  paymentReference: string;
  customer: string;
  customerId: string;
  statementReference: string;
  receivedMinor: number;
  invoices: readonly MatrixInvoiceAllocation[];
}

/** Fictional INR allocation. Values are integer paise; this is a supplied proposal, not a matching engine. */
export const demoAllocationMatrix: AllocationMatrixData = {
  paymentReference: 'PAY-DEMO-1840',
  customer: 'Illustrative customer A',
  customerId: 'CUST-DEMO-A',
  statementReference: 'BANK-DEMO-011 / row 1',
  receivedMinor: 184000000,
  invoices: [
    { reference: 'INV-DEMO-1042', faceMinor: 80000000, cashMinor: 79000000, taxMinor: 600000, discountMinor: 300000, bankFeeMinor: 100000, evidenceReference: 'REM-DEMO-041 / allocation 1', evidenceConfirmed: true, eligible: true },
    { reference: 'INV-DEMO-1048', faceMinor: 60000000, cashMinor: 59300000, taxMinor: 500000, discountMinor: 200000, bankFeeMinor: 0, evidenceReference: 'REM-DEMO-041 / allocation 2', evidenceConfirmed: true, eligible: true },
    { reference: 'INV-DEMO-1051', faceMinor: 46000000, cashMinor: 45700000, taxMinor: 300000, discountMinor: 0, bankFeeMinor: 0, evidenceReference: 'REM-DEMO-041 / allocation 3', evidenceConfirmed: true, eligible: true },
  ],
};

const amountKeys = ['faceMinor', 'cashMinor', 'taxMinor', 'discountMinor', 'bankFeeMinor'] as const;
export type MatrixAmountKey = typeof amountKeys[number];

/** Exact display checks only. Evidence remains independent from numerical equality. */
export function summarizeAllocationMatrix(data: AllocationMatrixData) {
  const references = data.invoices.map(invoice => invoice.reference.trim());
  const amountsValid = Number.isSafeInteger(data.receivedMinor) && data.receivedMinor > 0
    && data.invoices.every(invoice => amountKeys.every(key => Number.isSafeInteger(invoice[key]) && invoice[key] >= 0) && invoice.faceMinor > 0);
  const valid = amountsValid && data.invoices.length > 0 && references.every(Boolean)
    && new Set(references).size === references.length && Boolean(data.paymentReference.trim());
  const totals = Object.fromEntries(amountKeys.map(key => [key, data.invoices.reduce((sum, invoice) => sum + (Number.isSafeInteger(invoice[key]) ? BigInt(invoice[key]) : 0n), 0n)])) as Record<MatrixAmountKey, bigint>;
  const balanced = valid && totals.cashMinor === BigInt(data.receivedMinor)
    && data.invoices.every(invoice => BigInt(invoice.faceMinor) === BigInt(invoice.cashMinor) + BigInt(invoice.taxMinor) + BigInt(invoice.discountMinor) + BigInt(invoice.bankFeeMinor));
  const evidenceReady = valid && Boolean(data.customerId.trim()) && Boolean(data.statementReference.trim())
    && data.invoices.every(invoice => invoice.eligible && invoice.evidenceConfirmed && Boolean(invoice.evidenceReference.trim()));
  return { valid, totals, balanced, evidenceReady };
}
