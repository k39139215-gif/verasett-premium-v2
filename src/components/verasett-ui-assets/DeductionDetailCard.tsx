'use client';
import type { AssetProps } from './types';
import { demoDeduction } from './sample-data';
import { formatMoney } from './format';
import { StatusPill } from './StatusPill';
import { cx, DemoNote } from './shared';
import s from './assets.module.css';

export interface DeductionDetailCardProps extends AssetProps { deductionType?: string; claimedAmountMinor?: number; evidenceStatus?: 'Evidence pending' | 'Review' | 'Blocked'; resolution?: string }
export function DeductionDetailCard({ deductionType = demoDeduction.deductionType, claimedAmountMinor = demoDeduction.claimedAmountMinor, evidenceStatus = 'Evidence pending', resolution = 'Human review required', className, style }: DeductionDetailCardProps) {
  return <section className={cx(s.asset, s.card, s.padded, className)} style={style} aria-label="Deduction detail">
    <h3 className={s.title}>Deduction detail</h3><dl className={s.deductionRows}>
      <div><dt>Deduction type</dt><dd>{deductionType}</dd></div>
      <div><dt>Claimed amount</dt><dd>{formatMoney(claimedAmountMinor)}</dd></div>
      <div><dt>Evidence status</dt><dd><StatusPill status={evidenceStatus} /></dd></div>
      <div className={s.resolution}><dt>Resolution</dt><dd className={s.amber}>{resolution}</dd></div>
    </dl><div className={s.detailFoot}><DemoNote>Unverified claim · Illustrative</DemoNote></div>
  </section>;
}
