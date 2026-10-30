'use client';
import { useState } from 'react';
import type { AssetProps } from './types';
import { demoProductMatch, demoRun } from './product-data';
import { formatINR } from './product-format';
import { DataTable, MetricSummary, Notice, ScreenFrame, ScreenStatus, type DataColumn } from './product-shared';
import { demoClearingExportLines, demoExportBatchId, demoExportTarget, type ClearingExportLine } from './export-audit-data';
import s from './product-screens.module.css';

export interface ERPExportPreviewScreenProps extends AssetProps {
  lines?: readonly ClearingExportLine[];
  batchId?: string;
  runId?: string;
  paymentReference?: string;
  customer?: string;
  customerReference?: string;
  targetLabel?: string;
  controllerApproval?: 'pending' | 'approved' | 'held';
  /** Custom records must explicitly provide their eligibility/evidence state. */
  evidenceConfirmed?: boolean;
  allowSimulation?: boolean;
}

const safeAmount = (value: number) => Number.isSafeInteger(value) && value >= 0;
const amountCell = (value: number) => !safeAmount(value) ? 'Invalid amount' : value === 0 ? '—' : formatINR(value);
const columns: readonly DataColumn<ClearingExportLine>[] = [
  { key: 'reference', label: 'Line / reference', width: '27%', render: line => <><strong className={s.strong}>{line.reference}</strong><p className={s.muted}>{line.id}</p></> },
  { key: 'account', label: 'Clearing treatment', width: '27%', render: line => <>{line.label}<p className={s.muted}>{line.kind === 'invoice' ? 'Invoice balance' : line.kind === 'receipt' ? 'Cash received' : 'Separate adjustment'}</p></> },
  { key: 'debit', label: 'Debit · INR', width: '23%', numeric: true, render: line => amountCell(line.debitMinor) },
  { key: 'credit', label: 'Credit · INR', width: '23%', numeric: true, render: line => amountCell(line.creditMinor) },
];

/** Preview-only preparation state. No download, bank call or ERP operation is performed. */
export function ERPExportPreviewScreen({
  lines = demoClearingExportLines, batchId = demoExportBatchId, runId = demoRun.id,
  paymentReference = demoProductMatch.reference, customer = demoProductMatch.customer,
  customerReference = demoProductMatch.customerId, targetLabel = demoExportTarget,
  controllerApproval = 'pending', evidenceConfirmed = lines === demoClearingExportLines
    && paymentReference === demoProductMatch.reference && customer === demoProductMatch.customer
    && customerReference === demoProductMatch.customerId,
  allowSimulation = true, className, style,
}: ERPExportPreviewScreenProps) {
  const [simulation, setSimulation] = useState<{ snapshot: string; approved: boolean; prepared: boolean } | null>(null);
  const snapshot = JSON.stringify({ lines, batchId, runId, paymentReference, customer, customerReference, targetLabel, controllerApproval, evidenceConfirmed, allowSimulation });
  if (simulation && simulation.snapshot !== snapshot) setSimulation(null);
  const currentSimulation = simulation?.snapshot === snapshot ? simulation : null;
  const receipts = lines.filter(line => line.kind === 'receipt');
  const singleReceipt = receipts.length === 1;
  const receiptMatchesPayment = singleReceipt && receipts[0].reference === paymentReference;
  const valid = lines.length > 0 && new Set(lines.map(line => line.id)).size === lines.length
    && new Set(lines.map(line => line.reference)).size === lines.length
    && lines.every(line => line.id.trim() && line.reference.trim() && line.evidenceReference.trim()
      && safeAmount(line.debitMinor) && safeAmount(line.creditMinor)
      && (line.kind === 'invoice' ? line.debitMinor === 0 && line.creditMinor > 0 : line.debitMinor > 0 && line.creditMinor === 0))
    && singleReceipt && lines.some(line => line.kind === 'invoice');
  const sum = (field: 'debitMinor' | 'creditMinor', predicate: (line: ClearingExportLine) => boolean = () => true) => lines.reduce((total, line) => total + (predicate(line) && safeAmount(line[field]) ? BigInt(line[field]) : 0n), 0n);
  const debit = sum('debitMinor'), credit = sum('creditMinor'), variance = debit - credit;
  const balanced = valid && variance === 0n;
  const referencesReady = Boolean(batchId.trim() && runId.trim() && paymentReference.trim() && customerReference.trim() && targetLabel.trim());
  const eligible = balanced && referencesReady && receiptMatchesPayment && evidenceConfirmed;
  const approved = currentSimulation?.approved || controllerApproval === 'approved';
  const prepared = Boolean(currentSimulation?.prepared && approved && eligible);
  const approvalLabel = approved ? 'Approved in sample' : controllerApproval === 'held' ? 'Held for review' : 'Approval pending';
  const statusLabel = prepared ? 'CSV batch prepared' : approved && eligible ? 'Export ready' : 'Ready for review';
  const validationLabel = !lines.length ? 'No clearing lines' : !singleReceipt ? 'Exactly one receipt required' : !valid ? 'Check clearing data' : variance !== 0n ? 'Variance requires review' : !referencesReady ? 'Missing batch references' : !receiptMatchesPayment ? 'Receipt reference mismatch' : !evidenceConfirmed ? 'Evidence review required' : 'Balanced and eligible';

  return <ScreenFrame title="ERP Export Preview" eyebrow="CONTROLLED HANDOFF" description="Review clearing lines and approval before preparing an illustrative output." className={className} style={style}
    actions={<ScreenStatus label={statusLabel} tone={prepared || (approved && eligible) ? 'success' : 'review'} />}
    meta={<><span>Batch <strong>{batchId || 'Not assigned'}</strong></span><span>Run {runId || 'Not assigned'}</span><span>{targetLabel || 'No template selected'}</span></>}>
    <MetricSummary items={[
      { label: 'Bank receipt', value: valid ? formatINR(sum('debitMinor', line => line.kind === 'receipt')) : 'Unavailable', detail: paymentReference },
      { label: 'Invoice face value', value: valid ? formatINR(credit) : 'Unavailable', detail: `${lines.filter(line => line.kind === 'invoice').length} clearing credits` },
      { label: 'Clearing variance', value: valid ? formatINR(variance) : 'Unavailable', detail: 'Debit total minus credit total' },
    ]} />
    <div className={s.toolbar}><div><strong className={s.strong}>{customer}</strong><p className={s.muted}>{customerReference} · INR</p></div><ScreenStatus label={validationLabel} tone={eligible ? 'success' : 'review'} /></div>
    <DataTable label="Illustrative ERP clearing lines" columns={columns} rows={lines} rowKey={line => line.id} emptyMessage="No clearing lines supplied. Preparation is unavailable." />
    <div className={s.footer}><span>{lines.length} lines · Receipt and adjustments debit; invoices credit</span><span>Total debit {valid ? formatINR(debit) : 'unavailable'} · Total credit {valid ? formatINR(credit) : 'unavailable'}</span></div>
    <div className={s.section}>
      <div className={s.equalSplit}>
        <section><h3 className={s.sectionTitle}>Approval boundary</h3><ScreenStatus label={approvalLabel} tone={approved ? 'success' : 'review'} /><p className={s.muted}>Balance and eligibility checks do not grant controller approval.</p></section>
        <section><h3 className={s.sectionTitle}>Output boundary</h3><p className={s.muted}>Preparation produces a reviewable batch state. Any subsequent ERP import or posting requires a separate authorized action.</p></section>
      </div>
    </div>
    <div className={s.actionBar}>
      <span className={s.muted}>Local simulation</span>
      {allowSimulation && <button type="button" className={s.button} disabled={!eligible || approved} onClick={() => setSimulation({ snapshot, approved: true, prepared: false })}>Use approved sample</button>}
      {currentSimulation && <button type="button" className={s.button} onClick={() => setSimulation(null)}>Reset simulation</button>}
      <button type="button" className={s.primaryButton} disabled={!allowSimulation || !eligible || !approved || prepared} onClick={() => setSimulation({ snapshot, approved: true, prepared: true })}>Prepare demo export</button>
    </div>
    <div className={s.body} role="status" aria-live="polite"><Notice tone={prepared ? 'success' : 'neutral'}>{prepared ? `Local simulation: ${batchId} is prepared. No file was created, downloaded or posted.` : 'Local simulation only. “Use approved sample” changes the displayed scenario; “Prepare demo export” changes preview state without creating a file.'}</Notice></div>
  </ScreenFrame>;
}
