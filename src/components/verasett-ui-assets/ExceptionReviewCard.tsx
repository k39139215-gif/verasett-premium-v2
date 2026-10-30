'use client';
import type { AssetProps } from './types';
import { cx, DemoNote, Icon } from './shared';
import s from './assets.module.css';

export interface ExceptionReviewCardProps extends AssetProps { reference?: string; reason?: string; actionLabel?: string; onReview?: (reference: string) => void }
export function ExceptionReviewCard({ reference = 'ACH-55231', reason = 'Remittance amount differs from open invoices', actionLabel = 'Review match', onReview, className, style }: ExceptionReviewCardProps) {
  return <section className={cx(s.asset, s.card, s.padded, s.exception, className)} style={style} aria-label="Payment exception">
    <div className={s.detailHead}><h3 className={cx(s.title, s.row, s.amber)}><Icon name="review" />Needs review</h3><span className={s.subtitle}>Human decision</span></div>
    <p className={s.reference}>{reference}</p><p className={s.reason}>{reason}</p>
    <button type="button" className={s.button} disabled={!onReview} title={!onReview ? 'Connect onReview to enable this action' : undefined} onClick={() => onReview?.(reference)}>{actionLabel}<Icon name="arrow" /></button>
    <div className={s.detailFoot}><DemoNote>No payment applied · Illustrative</DemoNote></div>
  </section>;
}
