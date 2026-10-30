'use client';
import { useId, useState } from 'react';
import type { AssetProps } from './types';
import { demoReviewPayments, type ReviewPayment } from './variation-data';
import { formatMoney } from './format';
import { StatusPill } from './StatusPill';
import { cx, Icon } from './shared';
import base from './assets.module.css';
import s from './variations.module.css';

export interface PaymentReviewQueueProps extends AssetProps {
  payments?: readonly ReviewPayment[];
  onReview?: (reference: string) => void;
}
/** A local selection changes the visible evidence, never the payment's disposition. */
export function PaymentReviewQueue({ payments = demoReviewPayments, onReview, className, style }: PaymentReviewQueueProps) {
  const id = useId();
  const detailId = useId();
  const [reference, setReference] = useState(payments[0]?.reference);
  const selected = payments.find(p => p.reference === reference) ?? payments[0];
  return <section className={cx(base.asset, s.surface, className)} style={style} aria-labelledby={id}>
    <header className={s.header}><div><span className={s.eyebrow}>EXCEPTION HANDLING</span><h3 id={id}>Payments requiring review</h3><p className={s.muted}>An explicit decision for every exception</p></div><span className={s.count}>{payments.length} open</span></header>
    {selected ? <div className={s.reviewSplit}>
      <div className={s.queue} role="group" aria-label="Choose an exception">{payments.map(payment => <button type="button" key={payment.reference} className={s.queueItem} aria-label={`Inspect ${payment.reference}`} aria-pressed={payment.reference === selected.reference} aria-controls={detailId} onClick={() => setReference(payment.reference)}>
        <span className={s.queueLine}><strong>{payment.reference}</strong><span>{formatMoney(payment.amountMinor)}</span></span><span className={s.customer} title={payment.customer}>{payment.customer}</span><span className={s.queueReason}>{payment.reason}</span><StatusPill status={payment.status} />
      </button>)}</div>
      <section className={s.reviewDetail} id={detailId} aria-label="Selected exception">
        <div className={s.detailHeading}><span className={s.eyebrow}>SELECTED PAYMENT</span><span className={s.muted}>Not applied</span></div><h4 className={s.detailReference}>{selected.reference}</h4><p className={s.detailCustomer}>{selected.customer}</p>
        <div className={s.reason}><Icon name="review" /><p>{selected.reason}</p></div>
        <dl className={s.facts}><div><dt>Bank amount</dt><dd>{formatMoney(selected.amountMinor)}</dd></div><div><dt>Candidate open invoices</dt><dd>{selected.candidateAmountMinor === undefined ? 'Amount not established' : formatMoney(selected.candidateAmountMinor)}</dd></div>{selected.candidateAmountMinor !== undefined && <div className={s.difference}><dt>Difference</dt><dd>{formatMoney(BigInt(selected.amountMinor) - BigInt(selected.candidateAmountMinor))}</dd></div>}</dl>
        <div className={s.evidence}><span className={s.eyebrow}>EVIDENCE & RESOLUTION</span>{selected.claimedDeductionMinor !== undefined && <p className={s.claim}><span>Claimed deduction · unverified</span><strong>{formatMoney(selected.claimedDeductionMinor)}</strong></p>}<p>{selected.evidence}</p><p className={s.muted}>Human review required</p></div>
        <button type="button" className={cx(s.button, s.reviewButton)} disabled={!onReview} onClick={() => onReview?.(selected.reference)}>Review match<Icon name="arrow" /></button>
      </section>
    </div> : <p className={s.empty} role="status">No exceptions to review</p>}
    <footer className={s.footer}><span>Illustrative review queue</span><span>No payment applied · No deduction approved</span></footer>
  </section>;
}
