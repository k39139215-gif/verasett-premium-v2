'use client';
import type { AssetProps, IncomingPayment, PaymentMatch } from './types';
import { VerasettIncomingPayments } from './VerasettIncomingPayments';
import { BankStatementCard } from './BankStatementCard';
import { MatchingProgressCard } from './MatchingProgressCard';
import { ERPExportCard } from './ERPExportCard';
import { PaymentMatchCard } from './PaymentMatchCard';
import { ExceptionReviewCard } from './ExceptionReviewCard';
import { WorkflowConnector } from './WorkflowConnector';
import { cx } from './shared';
import { demoIncomingPayments } from './sample-data';
import s from './assets.module.css';

export interface ReconciliationHeroVisualProps extends AssetProps {
  payments?: readonly IncomingPayment[]; match?: PaymentMatch;
  completed?: number; total?: number;
  showDetails?: boolean;
  onReview?: (reference: string) => void;
  /** Static by default; optional entrance respects prefers-reduced-motion. */
  motion?: boolean;
}
export function ReconciliationHeroVisual({ payments = demoIncomingPayments, match, completed, total, showDetails = false, onReview, motion = false, className, style }: ReconciliationHeroVisualProps) {
  const recordTotal = total ?? payments.length;
  const recordCompleted = completed ?? payments.filter(payment => payment.status !== 'Pending').length;
  return <div className={cx(s.asset, s.hero, className)} style={style} data-motion={motion}>
    <VerasettIncomingPayments payments={payments} onReview={onReview} />
    <ol className={cx(s.workflow, s.integratedWorkflow)} aria-label="Reconciliation workflow">
      <li><BankStatementCard /><WorkflowConnector /></li>
      <li><MatchingProgressCard completed={recordCompleted} total={recordTotal} status="Payments checked" /><WorkflowConnector /></li>
      <li><ERPExportCard /></li>
    </ol>
    {showDetails && <div className={s.heroDetails}><PaymentMatchCard match={match} /><ExceptionReviewCard onReview={onReview} /></div>}
    <div className={s.heroFooter}><span>Bank input → deterministic matching → controlled handoff</span><span>Fictional records · No live connections</span></div>
  </div>;
}
