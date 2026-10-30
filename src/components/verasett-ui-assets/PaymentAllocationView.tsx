'use client';
import { useId } from 'react';
import type { AssetProps, PaymentMatch } from './types';
import { demoMatch } from './sample-data';
import { formatMoney, isBalancedAllocation } from './format';
import { StatusPill } from './StatusPill';
import { cx, Icon } from './shared';
import base from './assets.module.css';
import s from './variations.module.css';

export interface PaymentAllocationViewProps extends AssetProps {
  match?: PaymentMatch;
  customer?: string;
}
/** Illustrates a supplied allocation; the view does not execute reconciliation or posting. */
export function PaymentAllocationView({ match = demoMatch, customer = 'Acme Distribution', className, style }: PaymentAllocationViewProps) {
  const id = useId();
  const balanced = isBalancedAllocation(match.amountMinor, match.invoices);
  const validAmounts = Number.isSafeInteger(match.amountMinor) && match.invoices.every(i => Number.isSafeInteger(i.amountMinor));
  const allocated = validAmounts ? match.invoices.reduce((sum, invoice) => sum + BigInt(invoice.amountMinor), 0n) : null;
  const difference = allocated === null ? null : BigInt(match.amountMinor) - allocated;
  return <section className={cx(base.asset, s.surface, className)} style={style} aria-labelledby={id}>
    <header className={s.header}><div><span className={s.eyebrow}>ALLOCATION DETAIL</span><h3 id={id}>One payment. Traceable allocation.</h3><p className={s.muted}>Illustrative allocation</p></div><StatusPill status={balanced ? 'Matched' : 'Needs review'} /></header>
    <div className={s.allocationSplit}>
      <aside className={s.receipt} aria-label="Received payment"><span className={s.eyebrow}>BANK INPUT</span><Icon name="file" className={s.receiptIcon} /><h4>{match.reference}</h4><p className={s.detailCustomer}>{customer}</p><span className={s.muted}>Received amount</span><strong className={s.receivedAmount}>{Number.isSafeInteger(match.amountMinor) ? formatMoney(match.amountMinor) : 'Invalid amount'}</strong><div className={s.receiptFoot}><Icon name="arrow" /><span>Compare with selected<br />open invoices</span></div></aside>
      <div className={s.invoiceDetail}><div className={s.invoiceHeading}><h4>Selected open invoices</h4><span className={s.muted}>{match.invoices.length} candidates · USD</span></div>
        <table className={cx(s.table, s.invoiceTable)}><caption className={s.srOnly}>Illustrative invoice allocation amounts in USD</caption><thead><tr><th scope="col">Invoice reference</th><th scope="col" className={s.numeric}>Allocated amount</th></tr></thead><tbody>{match.invoices.map((invoice, index) => <tr key={`${invoice.reference}-${index}`}><th scope="row">{invoice.reference}</th><td className={s.numeric}>{Number.isSafeInteger(invoice.amountMinor) ? formatMoney(invoice.amountMinor) : 'Invalid amount'}</td></tr>)}</tbody><tfoot><tr><th scope="row">Selected total</th><td className={s.numeric}>{allocated === null ? 'Check allocation data' : formatMoney(allocated)}</td></tr></tfoot></table>
        {!match.invoices.length && <p className={s.empty}>No candidate invoices</p>}
        <div className={s.balance} data-balanced={balanced}><span><Icon name={balanced ? 'check' : 'review'} />Difference</span><strong>{difference === null ? 'Unavailable' : formatMoney(difference)}</strong></div>
        <p className={s.rule}>{balanced ? 'Payment total equals selected open invoices' : 'Allocation requires review before export'}</p>
      </div>
    </div>
    <footer className={s.footer}><span>Rule example · Exact amount equality</span><span>{balanced ? 'Ready for review · Not posted' : 'Export held for review'}</span></footer>
  </section>;
}
