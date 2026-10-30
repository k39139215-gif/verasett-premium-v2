'use client';
import type { AssetProps, PaymentMatch } from './types';
import { demoMatch } from './sample-data';
import { formatMoney, isBalancedAllocation } from './format';
import { StatusPill } from './StatusPill';
import { cx, DemoNote, Icon } from './shared';
import s from './assets.module.css';

export interface PaymentMatchCardProps extends AssetProps { match?: PaymentMatch }
export function PaymentMatchCard({ match = demoMatch, className, style }: PaymentMatchCardProps) {
  const balanced = isBalancedAllocation(match.amountMinor, match.invoices);
  const displayAmount = (n: number) => Number.isSafeInteger(n) ? formatMoney(n) : 'Invalid amount';
  return <section className={cx(s.asset, s.card, s.padded, className)} style={style} aria-label="Payment match result">
    <div className={s.detailHead}><h3 className={s.reference}>{match.reference}</h3><StatusPill status={balanced ? 'Matched' : 'Review'} /></div>
    <p className={s.subtitle}>Received amount</p><p className={s.money}>{displayAmount(match.amountMinor)}</p>
    <dl className={s.invoiceList} aria-label={balanced ? 'Matched invoices' : 'Selected invoices'}>{match.invoices.map((invoice, index) => <div className={s.invoice} key={`${invoice.reference}-${index}`}><dt><Icon name="file" />{invoice.reference}</dt><dd>{displayAmount(invoice.amountMinor)}</dd></div>)}</dl>
    <p className={cx(s.explanation, !balanced && s.amber)}>{balanced ? 'Payment total equals selected open invoices' : 'Selected invoice allocations are invalid or do not equal the payment total'}</p>
    <div className={s.detailFoot}><DemoNote /></div>
  </section>;
}
