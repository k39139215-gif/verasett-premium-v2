'use client';
import { useId, useState } from 'react';
import type { AssetProps } from './types';
import { cx } from './shared';
import { formatINR } from './product-format';
import { demoClearingWorksheetLines, type ClearingWorksheetLine } from './clearing-worksheet-data';
import base from './assets.module.css';
import s from './clearing-worksheet.module.css';

export interface ClearingWorksheetProps extends AssetProps {
  lines?: readonly ClearingWorksheetLine[];
  worksheetId?: string;
  paymentReference?: string;
  customer?: string;
  customerReference?: string;
  defaultShowReferences?: boolean;
}

const validAmount = (amount: number) => Number.isSafeInteger(amount) && amount > 0;

/** A proposed clearing document. Reference disclosure never prepares files or grants approval. */
export function ClearingWorksheet({ lines = demoClearingWorksheetLines, worksheetId = 'WS-DEMO-011', paymentReference = 'PAY-DEMO-1840', customer = 'Illustrative customer A', customerReference = 'CUST-DEMO-A', defaultShowReferences = false, className, style }: ClearingWorksheetProps) {
  const id = useId();
  const [showReferences, setShowReferences] = useState(defaultShowReferences);
  const receiptLines = lines.filter(line => line.side === 'receipt');
  const unique = (values: readonly string[]) => values.every(value => value.trim()) && new Set(values).size === values.length;
  const valid = lines.length > 0 && lines.every(line => validAmount(line.amountMinor) && line.evidenceReference.trim()
    && ['receipt', 'adjustment', 'receivable'].includes(line.side))
    && unique(lines.map(line => line.id)) && unique(lines.map(line => line.reference))
    && receiptLines.length === 1 && receiptLines[0].reference === paymentReference
    && lines.some(line => line.side === 'receivable') && Boolean(worksheetId.trim() && customerReference.trim());
  const totalFor = (side: ClearingWorksheetLine['side']) => lines.reduce((total, line) => total + (line.side === side && validAmount(line.amountMinor) ? BigInt(line.amountMinor) : 0n), 0n);
  const received = totalFor('receipt'), adjustments = totalFor('adjustment'), receivables = totalFor('receivable');
  const variance = received + adjustments - receivables;
  const balanced = valid && variance === 0n;
  const columnValue = (line: ClearingWorksheetLine, side: ClearingWorksheetLine['side']) => line.side !== side ? '—' : validAmount(line.amountMinor) ? formatINR(line.amountMinor) : 'Invalid amount';

  return <section className={cx(base.asset, s.worksheet, className)} style={style} aria-labelledby={`${id}-title`}>
    <header className={s.header}><div><span className={s.overline}>PROPOSED CLEARING DOCUMENT</span><h2 id={`${id}-title`}>Clearing worksheet</h2><p>{worksheetId} <span>·</span> Illustrative document</p></div><span className={s.documentMark} aria-label="Worksheet state: draft">DRAFT</span></header>
    <div className={s.documentInfo}><dl><div><dt>Customer account</dt><dd>{customer}<span>{customerReference}</span></dd></div><div><dt>Bank receipt</dt><dd>{paymentReference}<span>INR · Uploaded evidence</span></dd></div></dl><label className={s.referenceToggle}><input type="checkbox" checked={showReferences} onChange={event => setShowReferences(event.target.checked)} />Show line references</label></div>
    <div className={s.tableWrap}><table className={s.table}><caption className={s.srOnly}>Illustrative clearing worksheet in INR. Receipt and adjustment debits offset receivable credits.</caption><colgroup><col className={s.descriptionColumn} /><col /><col /><col /></colgroup><thead><tr><th scope="col">Proposed treatment</th><th scope="col">Receipt <span>Debit · INR</span></th><th scope="col">Adjustment <span>Debit · INR</span></th><th scope="col">Receivable <span>Credit · INR</span></th></tr></thead><tbody>{lines.map((line, index) => <tr key={`${line.id}-${index}`} data-side={line.side}>
      <th scope="row" data-label="Treatment"><div className={s.lineTitle}><span className={s.lineNumber}>{String(index + 1).padStart(2, '0')}</span><div><strong>{line.treatment}</strong><span className={s.primaryReference}>{line.reference}</span>{showReferences && <span className={s.lineEvidence}>{line.id} · {line.evidenceReference}</span>}</div></div></th>
      <td data-label="Receipt debit"><span>{columnValue(line, 'receipt')}</span></td><td data-label="Adjustment debit"><span>{columnValue(line, 'adjustment')}</span></td><td data-label="AR credit"><span>{columnValue(line, 'receivable')}</span></td>
    </tr>)}</tbody><tfoot><tr><th scope="row">Column totals</th><td data-label="Receipt debit">{valid ? formatINR(received) : 'Unavailable'}</td><td data-label="Adjustment debit">{valid ? formatINR(adjustments) : 'Unavailable'}</td><td data-label="AR credit">{valid ? formatINR(receivables) : 'Unavailable'}</td></tr></tfoot></table></div>
    {!lines.length && <p className={s.empty} role="status">No clearing lines supplied</p>}
    <div className={s.reconciliation}><div><span className={s.overline}>DEBITS − CREDITS</span><strong>{valid ? formatINR(variance) : 'Check worksheet data'}</strong></div><p>{balanced ? 'Receipt + adjustments = open AR clearing' : valid ? 'The proposed entry is out of balance.' : 'A single identified receipt and valid, distinct clearing lines are required.'}</p><span className={s.check} data-balanced={balanced}>{balanced ? 'Arithmetic balanced' : 'Review required'}</span></div>
    <footer className={s.approvalStrip}><div className={s.stamp}><span>CONTROLLER REVIEW</span><strong>Approval pending</strong></div><div><p>Balance is a check, not an approval.</p><span>Evidence and allocation must be reviewed before any authorized handoff.</span></div><span className={s.notPosted}>No export · Not posted</span></footer>
  </section>;
}
