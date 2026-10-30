'use client';
import type { AssetProps, Payment } from './types';
import { demoPayments } from './sample-data';
import { formatMoney } from './format';
import { StatusPill } from './StatusPill';
import { cx, DemoNote } from './shared';
import s from './assets.module.css';

export interface IncomingPaymentsTableProps extends AssetProps {
  payments?: readonly Payment[];
  title?: string;
  subtitle?: string;
  /** Optional illustrative summary, independent of the displayed row subset. */
  autoMatchLabel?: string | null;
  onSelectPayment?: (payment: Payment) => void;
}
export function IncomingPaymentsTable({
  payments = demoPayments, title = 'Incoming Payments', subtitle = 'Bank settlement activity',
  autoMatchLabel = null, onSelectPayment, className, style,
}: IncomingPaymentsTableProps) {
  return <section className={cx(s.asset, s.card, s.tableCard, className)} style={style} aria-label={title}>
    <div className={s.tableHeader}>
      <div><h3 className={s.title}>{title}</h3>{subtitle && <p className={s.subtitle}>{subtitle}</p>}</div>
      {autoMatchLabel && <div className={s.summary}><span className={s.summaryValue}><span className={s.smallDot} />{autoMatchLabel}</span><span className={s.summaryNote}>Demo summary</span></div>}
    </div>
    <table className={s.table}>
      <caption className={s.srOnly}>{title}. Fictional USD payments for illustration.</caption>
      <thead><tr><th scope="col">Payment ID</th><th scope="col" className={s.amount}>Amount</th><th scope="col" className={s.customerColumn}>Customer</th><th scope="col">Status</th></tr></thead>
      <tbody>{payments.map((payment) => <tr key={payment.reference}>
        <td>{onSelectPayment ? <button type="button" className={s.referenceButton} onClick={() => onSelectPayment(payment)} aria-label={`Inspect ${payment.reference}`}><span className={s.truncate} title={payment.reference}>{payment.reference}</span><span className={cx(s.mobileCustomer, s.truncate)} title={payment.customer}>{payment.customer}</span></button> : <><span className={s.truncate} title={payment.reference}>{payment.reference}</span><span className={cx(s.mobileCustomer, s.truncate)} title={payment.customer}>{payment.customer}</span></>}</td>
        <td className={s.amount}>{formatMoney(payment.amountMinor)}</td>
        <td className={s.customerColumn}><span className={s.truncate} title={payment.customer}>{payment.customer}</span></td>
        <td><StatusPill status={payment.status} /></td>
      </tr>)}</tbody>
    </table>
    {!payments.length && <p className={s.empty}>No incoming payments</p>}
    <footer className={s.tableFoot}><DemoNote /><span>{payments.length} payment{payments.length === 1 ? '' : 's'} · USD</span></footer>
  </section>;
}
