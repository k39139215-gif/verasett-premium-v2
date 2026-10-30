'use client';
import type { AssetProps } from './types';
import { cx, DemoNote } from './shared';
import s from './assets.module.css';

export interface MatchMetricProps extends AssetProps { value?: string | number; label?: string; supportingLabel?: string }
export function MatchMetric({ value = '18 / 18', label = 'Candidate invoices matched', supportingLabel = 'Selected candidate set', className, style }: MatchMetricProps) {
  return <section className={cx(s.asset, s.card, s.padded, s.metric, className)} style={style} aria-label={label}><p className={s.metricValue}>{value}</p><h3 className={s.metricLabel}>{label}</h3>{supportingLabel && <p className={s.subtitle}>{supportingLabel}</p>}<DemoNote /></section>;
}
