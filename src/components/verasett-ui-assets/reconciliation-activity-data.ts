export type ReconciliationActivityStage = 'source' | 'matching' | 'handoff';
export type ReconciliationActivityStatus = 'Source received' | 'Allocation found' | 'Needs review' | 'Export prepared';

/** Stable event IDs identify read state only; financial status is supplied, never inferred. */
export interface ReconciliationActivityEvent {
  id: string;
  stage: ReconciliationActivityStage;
  title: string;
  reference: string;
  status: ReconciliationActivityStatus;
  occurredAt: string;
  timeLabel: string;
  unread: boolean;
  detail: string;
  trace: readonly { label: string; value: string }[];
}

/** Fictional USD events. The reviewed export and pending candidate concern different receipts. */
export const demoReconciliationActivity: readonly ReconciliationActivityEvent[] = [
  {
    id: 'EVENT-DEMO-101', stage: 'source', title: 'Bank statement received', reference: 'STMT-DEMO-041',
    status: 'Source received', occurredAt: '2026-10-12T09:10:00Z', timeLabel: '09:10 UTC', unread: false,
    detail: 'Four illustrative bank receipts are available for reconciliation. Receiving a source does not approve an allocation.',
    trace: [
      { label: 'Source record', value: 'STMT-DEMO-041 · 4 receipts' },
      { label: 'Payment references', value: 'ACH-78421, WIRE-99302, ACH-55231, WIRE-77120' },
      { label: 'Control state', value: 'Source received · allocations evaluated separately' },
    ],
  },
  {
    id: 'EVENT-DEMO-102', stage: 'matching', title: 'Deterministic allocation found', reference: 'ACH-78421',
    status: 'Allocation found', occurredAt: '2026-10-12T09:11:00Z', timeLabel: '09:11 UTC', unread: true,
    detail: 'The $12,450.00 receipt equals the selected open invoices. This candidate has not received controller approval.',
    trace: [
      { label: 'Customer', value: 'Acme Distribution' },
      { label: 'Payment received', value: '$12,450.00' },
      { label: 'Allocation trace', value: 'ALLOC-DEMO-101 · 3 candidate invoices · $12,450.00 total' },
      { label: 'Control state', value: 'Approval pending · excluded from the prepared export' },
    ],
  },
  {
    id: 'EVENT-DEMO-103', stage: 'matching', title: 'Remittance difference unresolved', reference: 'ACH-55231',
    status: 'Needs review', occurredAt: '2026-10-12T09:12:00Z', timeLabel: '09:12 UTC', unread: true,
    detail: 'Remittance amount differs from open invoices. Human review is required; the receipt has not been applied or included in an export.',
    trace: [
      { label: 'Customer', value: 'Westline Trading' },
      { label: 'Payment received', value: '$4,320.00' },
      { label: 'Exception record', value: 'EXC-DEMO-103 · remittance difference' },
      { label: 'Control state', value: 'Unresolved · no automatic application' },
    ],
  },
  {
    id: 'EVENT-DEMO-104', stage: 'handoff', title: 'Reviewed receipt prepared for export', reference: 'WIRE-99302',
    status: 'Export prepared', occurredAt: '2026-10-12T09:18:00Z', timeLabel: '09:18 UTC', unread: true,
    detail: 'A separate fictional approval record covers this $8,750.00 receipt. Its CSV batch is prepared for a controlled handoff; no ERP posting has occurred.',
    trace: [
      { label: 'Customer', value: 'Global Supply Co.' },
      { label: 'Payment received', value: '$8,750.00' },
      { label: 'Review reference', value: 'REVIEW-DEMO-104 · recorded approval for WIRE-99302 only' },
      { label: 'Prepared batch', value: 'CSV-DEMO-104 · 1 receipt · 2 invoice allocations' },
      { label: 'Control state', value: 'Prepared only · not posted to ERP' },
    ],
  },
];
