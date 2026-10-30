'use client';
import { useId, useState } from 'react';
import type { AssetProps, IncomingPayment } from './types';
import { demoIncomingPayments } from './sample-data';
import { downloadDemoCsv } from './demo-export';
import { formatMoney } from './format';
import { StatusPill } from './StatusPill';
import { cx, Icon } from './shared';
import base from './assets.module.css';
import s from './variations.module.css';

export interface PaymentLedgerProps extends AssetProps {
  payments?: readonly IncomingPayment[];
  onExport?: (payments: readonly IncomingPayment[]) => void;
  onReview?: (reference: string) => void;
}
/** Compact, table-first variation with customer context beneath the reference. */
export function PaymentLedger({ payments = demoIncomingPayments, onExport = downloadDemoCsv, onReview, className, style }: PaymentLedgerProps) {
  const id = useId();
  const [query, setQuery] = useState('');
  const needle = query.trim().toLowerCase();
  const visible = payments.filter(p => `${p.reference} ${p.customer} ${p.invoiceAllocation}`.toLowerCase().includes(needle));
  const total = payments.reduce((sum, p) => sum + BigInt(p.amountMinor), 0n);
  return <section className={cx(base.asset, s.surface, className)} style={style} aria-labelledby={id}>
    <header className={s.header}><div><span className={s.eyebrow}>CASH APPLICATION</span><h3 id={id}>Incoming payments</h3><p className={s.muted}>Illustrative bank records</p></div><div className={s.batchTotal}><span>Received in batch</span><strong>{formatMoney(total)}</strong><span>{payments.length} payments · USD</span></div></header>
    <div className={s.toolbar}><label className={s.search}><input type="search" aria-label="Search ledger payments" placeholder="Find a payment or customer" value={query} onChange={e => setQuery(e.target.value)} /></label><button type="button" className={s.button} disabled={!visible.length} onClick={() => onExport(visible)}><Icon name="export" />Export demo CSV</button></div>
    <table className={cx(s.table, s.ledgerTable)}><caption className={s.srOnly}>Incoming payment ledger. Fictional USD records.</caption><thead><tr><th scope="col">Payment / Customer</th><th scope="col" className={s.numeric}>Received</th><th scope="col" className={s.allocationColumn}>Allocation</th><th scope="col">Status</th></tr></thead><tbody>{visible.map(payment => <tr key={payment.reference}>
      <th scope="row"><span className={s.reference} title={payment.reference}>{payment.reference}</span><span className={s.customer} title={payment.customer}>{payment.customer}</span><span className={s.mobileAllocation}>{payment.invoiceAllocation}</span></th>
      <td className={s.numeric}>{formatMoney(payment.amountMinor)}</td><td className={cx(s.allocationColumn, s.muted)}>{payment.invoiceAllocation}</td><td>{onReview && (payment.status === 'Needs review' || payment.status === 'Review') ? <button type="button" className={s.statusAction} onClick={() => onReview(payment.reference)} aria-label={`Review match ${payment.reference}`}><StatusPill status="Needs review" /></button> : <StatusPill status={payment.status} />}</td>
    </tr>)}</tbody></table>
    {!visible.length && <p className={s.empty} role="status">{payments.length ? 'No payments match your search' : 'No incoming payments'}</p>}
    <footer className={s.footer}><span>{visible.length} of {payments.length} payments</span><span>Review exceptions before export</span></footer>
  </section>;
}
