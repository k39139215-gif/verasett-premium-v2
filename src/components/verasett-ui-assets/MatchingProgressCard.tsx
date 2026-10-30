'use client';
import type { AssetProps } from './types';
import { getProgress } from './format';
import { cx } from './shared';
import s from './assets.module.css';

export interface MatchingProgressCardProps extends AssetProps { completed?: number; total?: number; label?: string; status?: string }
export function MatchingProgressCard({ completed = 18, total = 18, label = 'Reconciliation', status = 'Matching payments', className, style }: MatchingProgressCardProps) {
  const progress = getProgress(completed, total);
  return <section className={cx(s.asset, s.card, s.workflowCard, className)} style={style} aria-label={`${label}. Illustrative progress.`}>
    <div className={s.stack}><h3 className={s.title}>{label}</h3><div className={s.progressRow}><span className={s.muted}>{progress.total ? status : 'No payments to match'}</span><span className={s.blue}>{progress.completed} / {progress.total}</span></div></div>
    {progress.total > 0 && <progress className={s.progress} value={progress.completed} max={progress.total} aria-label={status} aria-valuenow={progress.completed} aria-valuemin={0} aria-valuemax={progress.total} aria-valuetext={`${progress.completed} of ${progress.total} payments evaluated`} />}
  </section>;
}
