'use client';
import { useState } from 'react';
import type { AssetProps } from './types';
import { demoProductMatch, type ProductMatch } from './product-data';
import { summarizeMatch } from './product-format';
import { Notice, ScreenFrame, ScreenStatus } from './product-shared';
import { MatchAllocationSections, MatchEvidencePanel, MatchSummary } from './PaymentMatchDetailScreen';
import s from './product-screens.module.css';

export interface ControllerApprovalScreenProps extends AssetProps { match?: ProductMatch }
type ApprovalState = 'pending' | 'approved' | 'held';

function ApprovalReview({ match }: { match: ProductMatch }) {
  const [state, setState] = useState<ApprovalState>('pending');
  const [evidenceChecked, setEvidenceChecked] = useState(false);
  const [allocationChecked, setAllocationChecked] = useState(false);
  const summary = summarizeMatch(match);
  const ready = summary.canApprove && evidenceChecked && allocationChecked && state === 'pending';
  const stateLabel = state === 'approved' ? 'Approved in preview' : state === 'held' ? 'Held for review' : 'Pending approval';
  const message = state === 'approved' ? 'Approval simulated locally. No export or ERP posting occurred.'
    : state === 'held' ? 'Hold simulated locally. The proposal remains outside the export boundary.'
    : 'Review the evidence and proposed treatment before approving this illustrative allocation.';

  function resetPreview() {
    setState('pending');
    setEvidenceChecked(false);
    setAllocationChecked(false);
  }

  return <>
    <div className={s.split}>
      <MatchAllocationSections match={match} />
      <aside className={s.sidebar}>
        <section className={s.section} aria-label="Controller decision">
          <div className={s.toolbar}><h3 className={s.sectionTitle}>Controller decision</h3><ScreenStatus label={stateLabel} tone={state === 'approved' ? 'success' : state === 'held' ? 'review' : 'neutral'} /></div>
          <p className={s.muted}>Approval permits a later, controlled preparation step. It does not post a payment.</p>
          {!summary.canApprove && <Notice tone="review"><strong>Approval requirements not met</strong><p>Confirm valid allocations, zero variance, customer attribution and supporting evidence before proceeding.</p></Notice>}
          <div className={s.checkList}>
            <label><input type="checkbox" checked={evidenceChecked} disabled={state !== 'pending'} onChange={event => setEvidenceChecked(event.target.checked)} /><span>I checked the customer and invoice evidence</span></label>
            <label><input type="checkbox" checked={allocationChecked} disabled={state !== 'pending'} onChange={event => setAllocationChecked(event.target.checked)} /><span>I reviewed the allocation and deduction treatment</span></label>
          </div>
          <div className={s.actionBar}>
            <button type="button" className={s.primaryButton} disabled={!ready} onClick={() => { if (ready) setState('approved'); }}>Approve</button>
            <button type="button" className={s.button} disabled={state !== 'pending'} onClick={() => setState('held')}>Hold for Review</button>
            {state !== 'pending' && <button type="button" className={s.button} onClick={resetPreview}>Reset preview</button>}
          </div>
          <p role="status" aria-live="polite" className={s.muted}>{message}</p>
          <p className={s.muted}>Preview controls only · No connected approval system</p>
        </section>
        <MatchEvidencePanel match={match} />
      </aside>
    </div>
  </>;
}

/** Approval controls simulate local state only; no callbacks, network calls or real operations. */
export function ControllerApprovalScreen({ match = demoProductMatch, className, style }: ControllerApprovalScreenProps) {
  // A changed financial proposal starts a fresh review, including changes under the same reference.
  const proposalKey = JSON.stringify(match);
  return <ScreenFrame title="Controller Approval" eyebrow="MATCH REVIEW" description="Review a proposed allocation before allowing an ERP-ready handoff." className={className} style={style}
    meta={<><strong>{match.reference || 'Missing payment reference'}</strong><span>{match.customer}</span><span>{match.customerId || 'Customer ID missing'}</span></>}
    actions={<ScreenStatus label="Local simulation" />}>
    <MatchSummary match={match} />
    <ApprovalReview key={proposalKey} match={match} />
  </ScreenFrame>;
}
