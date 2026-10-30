import { demoProductMatch, type ProductMatch } from './product-data';

export interface ReconciliationProofData {
  documentReference: string;
  bankReference: string;
  preparedLabel: string;
  match: ProductMatch;
}

/** A fictional working paper. It records no real approval, bank connection or ERP transaction. */
export const demoReconciliationProof: ReconciliationProofData = {
  documentReference: 'WP-DEMO-014',
  bankReference: 'BANK-DEMO-011 / row 1',
  preparedLabel: '11 October 2026 · 10:12 IST',
  match: demoProductMatch,
};
