'use client';
import { useId, useState } from 'react';
import type { AssetProps } from './types';
import { cx } from './shared';
import { demoDeductionClaims, type DeductionClaim } from './deduction-exception-data';
import { formatINR } from './product-format';
import { DataTable, EvidenceList, MetricSummary, Notice, ScreenFrame, ScreenStatus, type DataColumn } from './product-shared';
import s from './product-screens.module.css';

export interface DeductionBreakdownScreenProps extends AssetProps { claims?: readonly DeductionClaim[] }
const hasAmount = (claim: DeductionClaim) => Number.isSafeInteger(claim.amountMinor) && claim.amountMinor >= 0;
const supported = (claim: DeductionClaim) => hasAmount(claim) && claim.evidenceVerified && Boolean(claim.evidenceReference?.trim()) && Boolean(claim.paymentReference.trim()&&claim.remittanceReference.trim()) && claim.invoiceReferences.length > 0 && claim.invoiceReferences.every(ref=>Boolean(ref.trim())) && new Set(claim.invoiceReferences).size===claim.invoiceReferences.length;

/** Claim inspection is local and read-only. Evidence support does not approve a clearing batch. */
export function DeductionBreakdownScreen({ claims = demoDeductionClaims, className, style }: DeductionBreakdownScreenProps) {
  const [selectedId, setSelectedId] = useState(claims[0]?.id);
  const selected = claims.find(claim => claim.id === selectedId) ?? claims[0];
  const detailId = useId();
  const supportedClaims = claims.filter(supported);
  const heldClaims = claims.filter(claim => !supported(claim));
  const sum = (rows: readonly DeductionClaim[]) => rows.every(hasAmount)?formatINR(rows.reduce((total, claim) => total + BigInt(claim.amountMinor), 0n)):'Unavailable';
  const amount = (claim: DeductionClaim) => hasAmount(claim) ? formatINR(claim.amountMinor) : 'Invalid claim amount';
  const columns: readonly DataColumn<DeductionClaim>[] = [
    { key: 'type', label: 'Deduction', width: '24%', render: claim => <><button type="button" className={cx(s.button, selected?.id === claim.id && s.selected)} aria-label={`Inspect ${claim.type} claim`} aria-pressed={selected?.id === claim.id} aria-controls={detailId} onClick={() => setSelectedId(claim.id)}>{claim.type}</button><span className={s.muted}>{claim.id}</span></> },
    { key: 'payment', label: 'Payment / customer', width: '26%', render: claim => <><strong>{claim.paymentReference}</strong><span className={s.muted}>{claim.customer}</span></> },
    { key: 'amount', label: 'Claimed amount', width: '16%', numeric: true, render: amount },
    { key: 'evidence', label: 'Evidence', width: '19%', render: claim => <ScreenStatus label={supported(claim) ? 'Verified in sample' : 'Evidence pending'} tone={supported(claim) ? 'success' : 'review'} /> },
    { key: 'review', label: 'Review', width: '15%', render: claim => <span>{supported(claim) ? 'Controller review' : 'Held for review'}</span> },
  ];
  return <ScreenFrame title="Remittance & Deductions" eyebrow="DEDUCTION TREATMENT" description="Separate every claim from its supporting evidence and proposed treatment." meta={<><span>RCN-DEMO-1011</span><span>{claims.length} illustrative claims</span><ScreenStatus label="Controller review pending" tone="review" /></>} className={className} style={style}>
    <MetricSummary items={[
      { label: 'Supported claims', value: sum(supportedClaims), detail: `${supportedClaims.length} with evidence in sample` },
      { label: 'Unverified claims', value: sum(heldClaims), detail: `${heldClaims.length} held outside clearing` },
      { label: 'Approval boundary', value: 'Review pending', detail: 'No invoices closed or batch posted' },
    ]} />
    <DataTable label="Illustrative deduction claims" columns={columns} rows={claims} rowKey={claim => claim.id} emptyMessage="No deduction claims to inspect" />
    {selected && <section id={detailId} className={s.section} aria-label="Selected deduction">
      <div className={s.toolbar}><h3 className={s.sectionTitle}>{selected.type} · {selected.id}</h3><ScreenStatus label={supported(selected) ? 'Supported in sample' : 'Unverified claim'} tone={supported(selected) ? 'success' : 'review'} /></div>
      <div className={s.equalSplit}>
        <div className={s.stack}><dl className={s.facts}>
          <div><dt>Remittance</dt><dd>{selected.remittanceReference}</dd></div>
          <div><dt>Payment / customer</dt><dd>{selected.paymentReference}<br />{selected.customer}</dd></div>
          <div><dt>Invoice references</dt><dd>{selected.invoiceReferences.length ? selected.invoiceReferences.join(' · ') : 'Not established'}</dd></div>
          <div><dt>Claimed amount</dt><dd className={s.numeric}>{amount(selected)}</dd></div>
        </dl><EvidenceList items={[{ reference: selected.evidenceReference || 'No evidence attached', label: selected.evidenceDetail, status: supported(selected) ? 'Verified in sample' : 'Evidence pending', tone: supported(selected) ? 'success' : 'review' }]} /></div>
        <div className={s.stack}><div><h4 className={s.sectionTitle}>Configured treatment</h4><p className={s.body}>{selected.configuredTreatment}</p></div><div><h4 className={s.sectionTitle}>Proposed accounting outcome</h4><p className={s.body}>{supported(selected) ? selected.proposedOutcome : 'No adjustment proposed. Claim remains unresolved until evidence and attribution are reviewed.'}</p></div><Notice tone={supported(selected) ? 'neutral' : 'review'}>{supported(selected) ? 'Evidence supports this illustrative treatment. Controller approval of the allocation remains pending.' : 'Human review required. This claim is excluded from proposed clearing and does not close an invoice.'}</Notice></div>
      </div>
    </section>}
    <div className={s.section}><p className={s.muted}>Illustrative categories and configured treatments; not tax or legal guidance. Totals cover distinct payment claims.</p></div>
  </ScreenFrame>;
}
