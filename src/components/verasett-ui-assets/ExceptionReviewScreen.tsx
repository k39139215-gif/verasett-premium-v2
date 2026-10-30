'use client';
import { useId, useState } from 'react';
import type { AssetProps } from './types';
import { cx } from './shared';
import { demoReviewExceptions, type ReviewException } from './deduction-exception-data';
import { formatINR } from './product-format';
import { EvidenceList, Notice, ScreenFrame, ScreenStatus } from './product-shared';
import s from './product-screens.module.css';

export interface ExceptionReviewScreenProps extends AssetProps { exceptions?: readonly ReviewException[] }
const validMinor = (value: number | undefined): value is number => value !== undefined && Number.isSafeInteger(value) && value >= 0;
const displayAmount = (value: number) => validMinor(value) ? formatINR(value) : 'Invalid amount';

/** Selection and evidence expansion only; no approval, payment application or ERP actions. */
export function ExceptionReviewScreen({ exceptions = demoReviewExceptions, className, style }: ExceptionReviewScreenProps) {
  const [selectedReference, setSelectedReference] = useState(exceptions[0]?.reference);
  const [evidenceFor, setEvidenceFor] = useState<string>();
  const selected = exceptions.find(item => item.reference === selectedReference) ?? exceptions[0];
  const detailId = useId(), evidenceId = useId();
  const amountKnown = selected && validMinor(selected.candidateMinor) && validMinor(selected.receivedMinor);
  const showEvidence = selected && evidenceFor === selected.reference;
  return <ScreenFrame title="Needs Review" eyebrow="EXCEPTION QUEUE" description="Resolve evidence and attribution before a payment can proceed." meta={<><span>RCN-DEMO-1011</span><span>{exceptions.length} open exceptions</span><ScreenStatus label="Auto-application held" tone="review" /></>} className={className} style={style}>
    {selected ? <div className={s.equalSplit}>
      <aside className={s.sidebar} aria-label="Exception queue"><div className={s.toolbar}><h3 className={s.sectionTitle}>Payments on hold</h3><span className={s.muted}>{exceptions.length} records</span></div>
        <div className={s.stack}>{exceptions.map(item => <button key={item.reference} type="button" className={cx(s.queueButton, selected.reference === item.reference && s.selected)} aria-label={`Inspect ${item.reference}`} aria-pressed={selected.reference === item.reference} aria-controls={detailId} onClick={() => { setSelectedReference(item.reference); setEvidenceFor(undefined); }}>
          <span className={s.toolbar}><strong>{item.reference}</strong><strong className={s.numeric}>{displayAmount(item.receivedMinor)}</strong></span><span className={s.muted}>{item.customer}</span><span>{item.reason}</span><ScreenStatus label="Needs review" tone="review" />
        </button>)}</div>
        <p className={s.muted}>Selecting a record opens its evidence context. No allocation is applied.</p>
      </aside>
      <section id={detailId} className={s.section} aria-label="Selected exception"><div className={s.toolbar}><span className={s.eyebrow}>SELECTED PAYMENT</span><ScreenStatus label="Not applied" tone="review" /></div><h3 className={s.sectionTitle}>{selected.reference}</h3><p className={s.muted}>{selected.customer}</p>
        <Notice tone="review"><strong>{selected.reason}</strong><p className={s.body}>{selected.evidenceGap}</p></Notice>
        <dl className={s.facts}>
          <div><dt>Bank receipt</dt><dd className={s.numeric}>{displayAmount(selected.receivedMinor)}</dd></div>
          <div><dt>Candidate invoice balance</dt><dd className={s.numeric}>{validMinor(selected.candidateMinor) ? formatINR(selected.candidateMinor) : 'Not established'}</dd></div>
          <div><dt>Receipt less candidate balance</dt><dd className={s.numeric}>{amountKnown ? formatINR(BigInt(selected.receivedMinor) - BigInt(selected.candidateMinor!)) : 'Cannot calculate yet'}</dd></div>
          {selected.claimedDeductionMinor !== undefined && <div><dt>Claimed deduction · unverified</dt><dd className={s.numeric}>{displayAmount(selected.claimedDeductionMinor)}</dd></div>}
          <div><dt>Review status</dt><dd>{selected.reviewer}</dd></div>
        </dl>
        <div className={s.stack}><div><h4 className={s.sectionTitle}>Suggested next action</h4><p className={s.body}>{selected.nextAction}</p></div><button type="button" className={s.button} aria-expanded={Boolean(showEvidence)} aria-controls={evidenceId} onClick={() => setEvidenceFor(showEvidence ? undefined : selected.reference)}>{showEvidence ? 'Hide evidence' : 'Inspect evidence'}</button><div id={evidenceId} hidden={!showEvidence}><EvidenceList items={selected.evidence} /></div><p className={s.muted}>Preview inspection only. Missing evidence remains unresolved; no deduction is approved.</p></div>
      </section>
    </div> : <div className={s.section}><Notice>No exceptions to review</Notice></div>}
  </ScreenFrame>;
}
