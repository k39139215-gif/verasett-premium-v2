'use client';
import type { AssetProps } from './types';
import { cx, Icon } from './shared';
import s from './assets.module.css';

export interface ERPExportCardProps extends AssetProps { label?: string; secondaryLabel?: string; supportingLabel?: string }
export function ERPExportCard({ label = 'ERP Export', secondaryLabel = 'Ready for review', supportingLabel = 'CSV batch prepared', className, style }: ERPExportCardProps) {
  return <section className={cx(s.asset, s.card, s.workflowCard, className)} style={style} aria-label={`${label}: ${secondaryLabel}. Illustrative state.`}>
    <div className={s.row}><span className={cx(s.iconBox, s.blue)}><Icon name="export" /></span><div className={s.workflowText}><h3 className={s.title}>{label}</h3><p className={cx(s.workflowSecondary, s.blue)}>{secondaryLabel}</p></div></div>
    {supportingLabel && <p className={s.subtitle}>{supportingLabel}</p>}
  </section>;
}
