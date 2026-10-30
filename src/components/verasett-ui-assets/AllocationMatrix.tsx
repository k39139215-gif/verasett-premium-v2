'use client';
import { useId, useState } from 'react';
import type { AssetProps } from './types';
import { demoAllocationMatrix, summarizeAllocationMatrix, type AllocationMatrixData, type MatrixAmountKey } from './allocation-matrix-data';
import { formatINR } from './product-format';
import base from './assets.module.css';
import s from './allocation-matrix.module.css';

export interface AllocationMatrixProps extends AssetProps {
  data?: AllocationMatrixData;
  initialInvoiceReference?: string;
  onSelectInvoice?: (reference: string) => void;
}

const rows: readonly { key: MatrixAmountKey; label: string; detail: string }[] = [
  { key: 'faceMinor', label: 'Open invoice', detail: 'Face value' },
  { key: 'cashMinor', label: 'Bank receipt', detail: 'Cash allocated' },
  { key: 'taxMinor', label: 'TDS', detail: 'Tax receivable' },
  { key: 'discountMinor', label: 'Discount', detail: 'Separate adjustment' },
  { key: 'bankFeeMinor', label: 'Bank fee', detail: 'Separate expense' },
];
const display = (value: number) => Number.isSafeInteger(value) && value >= 0 ? formatINR(value) : 'Invalid amount';

/** A selectable cross-tab of a supplied allocation. Selection changes the inspection focus only. */
export function AllocationMatrix({ data = demoAllocationMatrix, initialInvoiceReference, onSelectInvoice, className, style }: AllocationMatrixProps) {
  const titleId = useId();
  const [selection, setSelection] = useState(initialInvoiceReference ?? data.invoices[0]?.reference ?? '');
  const selected = data.invoices.find(invoice => invoice.reference === selection) ?? data.invoices[0];
  const summary = summarizeAllocationMatrix(data);
  const select = (reference: string) => { setSelection(reference); onSelectInvoice?.(reference); };
  const state = !summary.valid ? 'Check input data' : !summary.balanced ? 'Allocation differs' : !summary.evidenceReady ? 'Evidence pending' : 'Allocation balanced';

  return <section className={`${base.asset} ${s.matrix} ${className ?? ''}`} style={style} aria-labelledby={titleId}>
    <header className={s.heading}>
      <div><p className={s.kicker}>ALLOCATION WORKSHEET <span>/ INR</span></p><h2 id={titleId}>One receipt. Every allocation.</h2><p className={s.subheading}>Trace cash and adjustments across the selected invoices.</p></div>
      <span className={s.demo}>Illustrative data</span>
    </header>
    <div className={s.receipt}>
      <div className={s.identity}><span className={s.label}>BANK RECEIPT</span><strong>{data.paymentReference || 'Missing payment reference'}</strong><span>{data.customer || 'Customer not supplied'}</span></div>
      <div className={s.receiptAmount}><span className={s.label}>Received</span><strong>{display(data.receivedMinor)}</strong><span>{data.statementReference || 'Statement reference missing'}</span></div>
    </div>
    {data.invoices.length > 0 ? <>
      <div className={s.matrixLabel}><span>Select an invoice to trace its allocation</span><span>{data.invoices.length} invoice columns</span></div>
      <label className={s.mobilePicker}>Inspect invoice<span className={s.selectControl}><select aria-label="Inspect invoice column" value={selected?.reference ?? ''} onChange={event => select(event.target.value)}>{data.invoices.map((invoice, index) => <option key={`${invoice.reference}-${index}`} value={invoice.reference}>{invoice.reference || 'Missing reference'}</option>)}</select></span></label>
      <table className={s.table} aria-label="Receipt allocation matrix">
        <thead><tr><th scope="col" className={s.rowHeading}>Allocation basis</th>{data.invoices.map((invoice, index) => <th scope="col" key={`${invoice.reference}-${index}`} className={s.invoiceColumn} data-selected={invoice === selected}><button type="button" aria-label={`Inspect ${invoice.reference || 'unnamed invoice'}`} aria-pressed={invoice === selected} onClick={() => select(invoice.reference)}><span className={s.columnNumber} aria-hidden="true">0{index + 1}</span><span>{invoice.reference || 'Missing reference'}</span></button></th>)}<th scope="col" className={s.totalColumn}>Receipt total</th></tr></thead>
        <tbody>{rows.map(row => <tr key={row.key} data-cash={row.key === 'cashMinor'}><th scope="row"><strong>{row.label}</strong>{' '}<span>{row.detail}</span></th>{data.invoices.map((invoice, index) => <td key={`${invoice.reference}-${index}`} className={s.invoiceColumn} data-selected={invoice === selected}>{display(invoice[row.key])}</td>)}<td className={s.totalColumn}>{summary.valid ? formatINR(summary.totals[row.key]) : 'Unavailable'}</td></tr>)}</tbody>
        <tfoot><tr><th scope="row"><strong>Unallocated</strong><span>Face − cash − adjustments</span></th>{data.invoices.map((invoice, index) => <td key={`${invoice.reference}-${index}`} className={s.invoiceColumn} data-selected={invoice === selected}>{summary.valid ? formatINR(BigInt(invoice.faceMinor) - BigInt(invoice.cashMinor) - BigInt(invoice.taxMinor) - BigInt(invoice.discountMinor) - BigInt(invoice.bankFeeMinor)) : 'Unavailable'}</td>)}<td className={s.totalColumn}>{summary.valid ? formatINR(summary.totals.faceMinor - summary.totals.cashMinor - summary.totals.taxMinor - summary.totals.discountMinor - summary.totals.bankFeeMinor) : 'Unavailable'}</td></tr></tfoot>
      </table>
      {selected && <div className={s.trace} aria-live="polite"><span className={s.traceLine} aria-hidden="true" /><div><p className={s.traceTitle}>Tracing {selected.reference || 'unnamed invoice'}</p><p>{summary.valid ? `${formatINR(selected.cashMinor)} cash + ${formatINR(BigInt(selected.taxMinor) + BigInt(selected.discountMinor) + BigInt(selected.bankFeeMinor))} adjustments against ${formatINR(selected.faceMinor)} open value.` : 'Supply valid integer-paise amounts and unique invoice references to inspect the allocation.'}</p><span>{summary.valid && data.customerId.trim() && data.statementReference.trim() && selected.evidenceConfirmed && selected.eligible && selected.evidenceReference.trim() ? 'Evidence supported in sample' : 'Human review required'} · {selected.evidenceReference || 'Evidence reference missing'}</span></div></div>}
    </> : <div className={s.empty}><h3>No invoice allocations supplied</h3><p>Add a proposed allocation to inspect cash, adjustments and supporting evidence.</p></div>}
    <footer className={s.footer}><span className={s.state} data-ready={summary.balanced && summary.evidenceReady}>{state}</span><span>Approval pending · No ERP posting</span></footer>
  </section>;
}
