'use client';
import type { AssetProps, PaymentStatus } from './types';
import { cx, Icon, type IconName } from './shared';
import s from './assets.module.css';

export interface StatusPillProps extends AssetProps { status: PaymentStatus }
const variants: Record<PaymentStatus, { tone: string; icon: IconName }> = {
  Matched: { tone: 'green', icon: 'check' },
  Review: { tone: 'amber', icon: 'review' },
  'Needs review': { tone: 'amber', icon: 'review' },
  Pending: { tone: 'neutral', icon: 'clock' },
  'Evidence pending': { tone: 'amber', icon: 'clock' },
  'Export ready': { tone: 'blue', icon: 'export' },
  Blocked: { tone: 'blocked', icon: 'blocked' },
};
export function StatusPill({ status, className, style }: StatusPillProps) {
  const { tone, icon } = variants[status];
  return <span className={cx(s.asset, s.pill, className)} style={style} data-tone={tone}><Icon name={icon} />{status}</span>;
}
