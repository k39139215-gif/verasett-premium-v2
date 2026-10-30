import { demoClearingExportLines } from './export-audit-data';

export interface ClearingWorksheetLine {
  id: string;
  reference: string;
  treatment: string;
  side: 'receipt' | 'adjustment' | 'receivable';
  /** Safe integer paise. The side determines debit or credit presentation. */
  amountMinor: number;
  evidenceReference: string;
}

/** A display worksheet; the source double-entry fixture is never posted or exported. */
export const demoClearingWorksheetLines: readonly ClearingWorksheetLine[] = demoClearingExportLines.map(line => ({
  id: line.id, reference: line.reference, treatment: line.label,
  side: line.kind === 'receipt' ? 'receipt' : line.kind === 'invoice' ? 'receivable' : 'adjustment',
  amountMinor: line.kind === 'invoice' ? line.creditMinor : line.debitMinor, evidenceReference: line.evidenceReference,
}));
