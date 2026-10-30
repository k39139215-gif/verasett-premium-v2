'use client';
import type { AssetProps } from './types';
import { demoProductMatch, type ProductMatch } from './product-data';
import { formatINR, summarizeMatch } from './product-format';
import { DataTable, EvidenceList, MetricSummary, Notice, ScreenFrame, ScreenStatus } from './product-shared';
import s from './product-screens.module.css';

export interface PaymentMatchDetailScreenProps extends AssetProps { match?: ProductMatch }

function displayAmount(amount: number) {
  return Number.isSafeInteger(amount) && amount >= 0 ? formatINR(amount) : 'Invalid amount';
}

/** Shared display only: summarizes the supplied fictional proposal without executing a match. */
export function MatchAllocationSections({ match }: { match: ProductMatch }) {
  const summary = summarizeMatch(match);
  const invoices = match.invoices.map((invoice, index) => ({ ...invoice, key: `${invoice.reference}-${index}` }));
  const deductions = match.deductions.map((deduction, index) => ({ ...deduction, key: `${deduction.id}-${index}` }));
  const equation = summary.valid
    ? `${formatINR(summary.face)}${match.deductions.map(d => ` − ${formatINR(d.amountMinor)}`).join('')} = ${formatINR(summary.net)}`
    : null;

  return <div className={s.stack}>
    <section className={s.section} aria-label="Proposed allocation">
      <div className={s.toolbar}><h3 className={s.sectionTitle}>Selected invoices</h3><span className={s.muted}>{invoices.length} candidates · INR</span></div>
      <DataTable label="Selected invoice face values" rows={invoices} rowKey={row => row.key} emptyMessage="No candidate invoices supplied" columns={[
        { key: 'reference', label: 'Invoice reference', render: row => <strong>{row.reference || 'Missing reference'}</strong> },
        { key: 'amount', label: 'Face value', numeric: true, width: '37%', render: row => displayAmount(row.amountMinor) },
      ]} />
      <dl className={s.facts}><div><dt>Invoice face value</dt><dd className={s.numeric}>{summary.valid ? formatINR(summary.face) : 'Unavailable'}</dd></div></dl>
    </section>

    <section className={s.section} aria-label="Proposed deductions">
      <div className={s.toolbar}><h3 className={s.sectionTitle}>Deductions and adjustments</h3><span className={s.muted}>Separate treatment</span></div>
      <DataTable label="Deduction and adjustment breakdown" rows={deductions} rowKey={row => row.key} emptyMessage="No deductions supplied" columns={[
        { key: 'type', label: 'Deduction / evidence', width: '39%', render: row => <><strong>{row.label}</strong><span className={s.muted}>{row.evidenceReference || 'No evidence reference'}</span></> },
        { key: 'amount', label: 'Amount', numeric: true, width: '22%', render: row => displayAmount(row.amountMinor) },
        { key: 'treatment', label: 'Proposed treatment', render: row => <><span>{row.treatment}</span><span className={s.muted}>{row.verified ? 'Verified in sample' : 'Claimed · unverified'}</span></> },
      ]} />
    </section>

    <section className={s.section} aria-label="Reconciliation check">
      <h3 className={s.sectionTitle}>Reconciliation check</h3>
      <Notice tone={summary.valid && summary.variance === 0n ? 'success' : 'review'}>
        <strong>{!summary.valid ? 'Check input data' : summary.variance === 0n ? 'Arithmetic balanced' : 'Amount variance requires review'}</strong>
        <p className={s.numeric}>{equation ?? 'Supply positive integer-paise amounts and unique invoice and deduction references.'}</p>
        <p>{summary.valid && summary.variance === 0n ? 'Net invoice value equals the bank receipt.' : 'A valid balanced proposal is required before approval.'}</p>
      </Notice>
    </section>
  </div>;
}

/** Eligibility is displayed independently of arithmetic equality. */
export function MatchEvidencePanel({ match }: { match: ProductMatch }) {
  const deductionEvidenceReady = match.deductions.every(d => d.verified && d.evidenceReference.trim());
  const eligible = summarizeMatch(match).eligible;
  const evidence = match.evidence.filter((item, index, items) => items.findIndex(candidate => candidate.reference === item.reference) === index);
  return <div className={s.stack}>
    <section className={s.section} aria-label="Attribution and eligibility">
      <h3 className={s.sectionTitle}>Attribution and eligibility</h3>
      <p className={s.muted}>Arithmetic equality does not establish customer or invoice attribution.</p>
      <dl className={s.facts}>
        <div><dt>Customer identity</dt><dd>{match.eligibility.customerConfirmed && match.customerId.trim() ? 'Confirmed in sample' : 'Not confirmed'}</dd></div>
        <div><dt>Invoice references</dt><dd>{match.eligibility.invoiceReferencesConfirmed ? 'Confirmed in sample' : 'Not confirmed'}</dd></div>
        <div><dt>Open invoice balances</dt><dd>{match.eligibility.invoicesOpen ? 'Eligible in sample' : 'Not confirmed'}</dd></div>
        <div><dt>Deduction evidence</dt><dd>{deductionEvidenceReady ? 'Verified in sample' : 'Evidence pending'}</dd></div>
      </dl>
      <ScreenStatus label={eligible ? 'Eligibility confirmed in sample' : 'Eligibility requires review'} tone={eligible ? 'success' : 'review'} />
    </section>
    <section className={s.section} aria-label="Supporting evidence">
      <h3 className={s.sectionTitle}>Supporting evidence</h3>
      {evidence.length ? <EvidenceList items={evidence} /> : <Notice tone="review">No supporting evidence supplied. Attribution remains unconfirmed.</Notice>}
      <p className={s.muted}>References and verification states are fictional.</p>
    </section>
  </div>;
}

export function MatchSummary({ match }: { match: ProductMatch }) {
  const summary = summarizeMatch(match);
  return <MetricSummary items={[
    { label: 'Bank receipt', value: displayAmount(match.receivedMinor), detail: 'Uploaded statement · INR' },
    { label: 'Invoice face value', value: summary.valid ? formatINR(summary.face) : 'Unavailable', detail: `${match.invoices.length} selected invoices` },
    { label: 'Deductions', value: summary.valid ? formatINR(summary.deductions) : 'Unavailable', detail: 'Recorded separately' },
    { label: 'Receipt − net invoices', value: summary.valid ? formatINR(summary.variance) : 'Unavailable', detail: summary.valid && summary.variance === 0n ? 'Zero arithmetic variance' : 'Review required' },
  ]} />;
}

/** Reusable, disconnected example of a bank receipt and its proposed invoice bundle. */
export function PaymentMatchDetailScreen({ match = demoProductMatch, className, style }: PaymentMatchDetailScreenProps) {
  const summary = summarizeMatch(match);
  return <ScreenFrame title="Payment-to-Invoice Match" eyebrow="MATCH DETAIL" description="Trace the receipt through invoice selection, deductions and evidence." className={className} style={style}
    meta={<><strong>{match.reference || 'Missing payment reference'}</strong><span>{match.customer}</span><span>{match.customerId || 'Customer ID missing'}</span></>}
    actions={<ScreenStatus label={summary.canApprove ? 'Proposed match' : 'Needs review'} tone={summary.canApprove ? 'success' : 'review'} />}>
    <MatchSummary match={match} />
    <div className={s.split}><MatchAllocationSections match={match} /><aside className={s.sidebar}><MatchEvidencePanel match={match} /></aside></div>
    <div className={s.body}><Notice>Controller approval is a separate step. This proposal has not been exported or posted.</Notice></div>
  </ScreenFrame>;
}
