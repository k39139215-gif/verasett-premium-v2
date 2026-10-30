'use client';
import { useEffect, useRef } from 'react';
import type { IncomingPayment } from './types';
import { StatusPill } from './StatusPill';
import { formatMoney } from './format';
import { cx } from './shared';
import s from './incoming.module.css';

interface SelectionProps { checked: boolean; mixed?: boolean; label: string; onChange: () => void; disabled?: boolean }
export function SelectionCheckbox({ checked, mixed = false, label, onChange, disabled }: SelectionProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = mixed; }, [mixed]);
  return <label className={s.checkTarget}><input ref={ref} type="checkbox" checked={checked} disabled={disabled} onChange={onChange} aria-label={label} /></label>;
}
export function IncomingPaymentRows({ payments, selected, onToggle, onReview }: {
  payments: readonly IncomingPayment[]; selected: ReadonlySet<string>;
  onToggle: (reference: string) => void; onReview?: (reference: string) => void;
}) {
  return <>{payments.map(payment => {
    const review = payment.status === 'Needs review' || payment.status === 'Review';
    return <tr key={payment.reference} data-selected={selected.has(payment.reference)}>
      <td className={s.selectionCell}><SelectionCheckbox checked={selected.has(payment.reference)} label={`Select ${payment.reference}`} onChange={() => onToggle(payment.reference)} /></td>
      <th scope="row" className={s.referenceCell}>
        <span className={s.ellipsis} title={payment.reference}>{payment.reference}</span>
        <span className={cx(s.mobileDetail, s.ellipsis)} title={payment.customer}>{payment.customer}</span>
        <span className={cx(s.mobileDetail, review && s.reviewText)}>{payment.invoiceAllocation}</span>
      </th>
      <td className={s.amount}>{formatMoney(payment.amountMinor)}</td>
      <td className={s.customerCell}><span className={s.ellipsis} title={payment.customer}>{payment.customer}</span></td>
      <td className={cx(s.allocationCell, review && s.reviewText)}>{payment.invoiceAllocation}</td>
      <td className={s.statusCell}>{review && onReview ? <button className={s.statusButton} type="button" aria-label={`Review match ${payment.reference}`} onClick={() => onReview(payment.reference)}><StatusPill status="Needs review" /></button> : <StatusPill status={payment.status} />}</td>
    </tr>;
  })}</>;
}
