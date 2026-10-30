'use client';
import { useId, useState } from 'react';
import type { AssetProps } from './types';
import { demoReconciliationProof, type ReconciliationProofData } from './reconciliation-proof-data';
import { formatINR, summarizeMatch } from './product-format';
import base from './assets.module.css';
import s from './reconciliation-proof-sheet.module.css';

export interface ReconciliationProofSheetProps extends AssetProps {
  data?: ReconciliationProofData;
  onReviewNoted?: (paymentReference: string) => void;
}

function ProofDocument({ data = demoReconciliationProof, onReviewNoted, className, style }: ReconciliationProofSheetProps) {
  const titleId = useId();
  const consentId = useId();
  const { match } = data;
  const summary = summarizeMatch(match);
  const [acknowledged, setAcknowledgement] = useState(false);
  const [reviewedHere, setReviewed] = useState(false);
  const sourcesPresent = Boolean(data.bankReference.trim()) && Boolean(data.documentReference.trim());
  const canReview = summary.canApprove && sourcesPresent;
  const amountValid = Number.isSafeInteger(match.receivedMinor) && match.receivedMinor > 0;
  const evidenceReferences = match.evidence.map(item => item.reference.trim());
  const evidenceSupported = evidenceReferences.length > 0 && evidenceReferences.every(Boolean)
    && new Set(evidenceReferences).size === evidenceReferences.length && match.evidence.every(item => item.tone === 'success');
  const checks = [
    { title: 'Receipt belongs to the customer', passed: summary.valid && evidenceSupported && match.eligibility.customerConfirmed && Boolean(match.customerId.trim()) && sourcesPresent,
      description: 'Bank and remittance identities resolve to the same customer.',
      evidence: [`Customer: ${match.customerId || 'Missing customer ID'}`, `Bank: ${data.bankReference || 'Missing bank reference'}`, ...match.evidence.filter(item => item.label.toLowerCase().includes('customer')).map(item => `${item.reference || 'Missing evidence reference'} — ${item.status}`)] },
    { title: 'Selected invoices remain eligible', passed: summary.valid && evidenceSupported && match.eligibility.invoiceReferencesConfirmed && match.eligibility.invoicesOpen,
      description: 'The proposed bundle uses explicit references and eligible open balances.',
      evidence: match.invoices.map(invoice => `${invoice.reference || 'Missing invoice reference'} — ${Number.isSafeInteger(invoice.amountMinor) && invoice.amountMinor > 0 ? formatINR(invoice.amountMinor) : 'Invalid amount'}`) },
    { title: 'Adjustments have their own evidence', passed: summary.valid && match.deductions.every(deduction => deduction.verified && Boolean(deduction.evidenceReference.trim())) && summary.eligible,
      description: 'Tax, discount and fee amounts stay separate from cash received.',
      evidence: match.deductions.map(deduction => `${deduction.label} — ${deduction.evidenceReference || 'Evidence missing'} · ${deduction.verified && deduction.evidenceReference.trim() ? 'Supported in sample' : 'Claimed; unverified'}`) },
  ];
  const recordReview = () => {
    if (!canReview || !acknowledged) return;
    setReviewed(true);
    onReviewNoted?.(match.reference);
  };

  return <article className={`${base.asset} ${s.sheet} ${className ?? ''}`} style={style} aria-labelledby={titleId}>
    <div className={s.folio}><span>VERASETT / WORKING PAPER</span><span>{data.documentReference || 'Document reference missing'}</span></div>
    <header className={s.heading}><div><p className={s.kicker}>RECEIPT RECONCILIATION</p><h2 id={titleId}>The match, explained.</h2><p>A traceable proposal, prepared for a controller’s review.</p></div><span className={s.demo}>Illustrative data</span></header>
    <dl className={s.identity}><div><dt>PAYMENT REFERENCE</dt><dd>{match.reference || 'Missing payment reference'}</dd></div><div><dt>CUSTOMER</dt><dd>{match.customer || 'Customer not supplied'}</dd></div><div><dt>PREPARED</dt><dd>{data.preparedLabel || 'Preparation label not supplied'}</dd></div></dl>
    <section className={s.arithmetic} aria-label="Exact reconciliation equation">
      <div className={s.sectionLabel}><span>01 / AMOUNT PROOF</span><span className={s.check} data-pass={summary.valid && summary.variance === 0n}>{!summary.valid ? 'Check input data' : summary.variance === 0n ? 'Arithmetic balanced' : 'Amount variance'}</span></div>
      {summary.valid ? <div className={s.equation}><div><span>Open invoice value</span><strong>{formatINR(summary.face)}</strong></div><span className={s.operator} aria-label="minus">−</span><div><span>Separate adjustments</span><strong>{formatINR(summary.deductions)}</strong></div><span className={s.operator} aria-label="equals">=</span><div className={s.net}><span>Net invoice value</span><strong>{formatINR(summary.net)}</strong></div></div> : <div className={s.invalid}>The amount proof is unavailable. Supply positive integer-paise values and unique invoice references.</div>}
      <div className={s.amountNote}><span>Bank receipt <strong>{amountValid ? formatINR(match.receivedMinor) : 'Invalid amount'}</strong></span><span>Receipt − net <strong>{summary.valid ? formatINR(summary.variance) : 'Unavailable'}</strong></span></div>
      <p className={s.warning}>A zero variance establishes arithmetic equality. Attribution and evidence are checked below.</p>
    </section>
    <section className={s.evidence} aria-label="Numbered evidence checks"><div className={s.sectionLabel}><span>02 / EVIDENCE RECORD</span><span>{checks.filter(check => check.passed).length} of {checks.length} checks supported</span></div><ol className={s.checks}>{checks.map((check, index) => <li key={check.title}><span className={s.number} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><div className={s.checkBody}><div className={s.checkHeading}><h3>{check.title}</h3><span className={s.check} data-pass={check.passed}>{check.passed ? 'Supported in sample' : 'Review required'}</span></div><p>{check.description}</p><details><summary>Inspect evidence</summary>{check.evidence.length ? <ul>{check.evidence.map((evidence, itemIndex) => <li key={`${evidence}-${itemIndex}`}>{evidence}</li>)}</ul> : <p>No supporting records supplied.</p>}</details></div></li>)}</ol></section>
    <section className={s.signoff} aria-label="Controlled review acknowledgement"><div><p className={s.kicker}>03 / CONTROLLER HANDOFF</p><h3>{reviewedHere ? 'Review noted locally' : 'Awaiting controller review'}</h3><p>{reviewedHere ? 'This acknowledgement is held in this preview only. Approval remains pending.' : 'Reviewing this working paper does not approve adjustments, close invoices or post to an ERP.'}</p></div><div className={s.signoffControls}><label htmlFor={consentId}><input id={consentId} type="checkbox" checked={acknowledged} disabled={!canReview || reviewedHere} onChange={event => setAcknowledgement(event.target.checked)} /><span>I have inspected the sample evidence.</span></label><button type="button" disabled={!canReview || !acknowledged || reviewedHere} onClick={recordReview}>{reviewedHere ? 'Review recorded in preview' : 'Mark reviewed locally'}</button>{!canReview && <p className={s.pending}>Resolve the amount, source or evidence checks first.</p>}{reviewedHere && <button type="button" className={s.reset} onClick={() => { setReviewed(false); setAcknowledgement(false); }}>Reset local review</button>}</div></section>
    <footer className={s.footer}><span>Fictional working paper · No accounting action</span><span>Approval pending</span></footer>
  </article>;
}

/** Document-style review of a supplied proposal. Local acknowledgement never approves or posts the receipt. */
export function ReconciliationProofSheet({ data = demoReconciliationProof, ...props }: ReconciliationProofSheetProps) {
  // A changed working paper always starts a fresh review, even if an earlier proposal is restored later.
  return <ProofDocument key={JSON.stringify(data)} data={data} {...props} />;
}
