'use client';
import type { AssetProps } from './types';
import { cx, Icon } from './shared';
import s from './assets.module.css';

export interface BankStatementCardProps extends AssetProps { label?: string; secondaryLabel?: string }
export function BankStatementCard({ label = 'Bank Statement', secondaryLabel = 'Uploaded', className, style }: BankStatementCardProps) {
  return <section className={cx(s.asset, s.card, s.workflowCard, className)} style={style} aria-label={`${label}: ${secondaryLabel}. Illustrative state.`}>
    <div className={s.row}><span className={s.iconBox}><Icon name="file" /></span><div className={s.workflowText}><h3 className={s.title}>{label}</h3><p className={cx(s.workflowSecondary, s.green)}><Icon name="check" />{secondaryLabel}</p></div></div>
  </section>;
}
