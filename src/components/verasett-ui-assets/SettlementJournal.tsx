'use client';
import { useId, useState } from 'react';
import type { AssetProps } from './types';
import { cx, Icon } from './shared';
import { formatINR } from './product-format';
import { demoSettlementJournalEntries, type SettlementJournalEntry } from './settlement-journal-data';
import base from './assets.module.css';
import s from './settlement-journal.module.css';

export interface SettlementJournalProps extends AssetProps {
  entries?: readonly SettlementJournalEntry[];
  title?: string;
  dateLabel?: string;
  runId?: string;
  defaultExpandedIds?: readonly string[];
}

const validAmount = (value: number) => Number.isSafeInteger(value) && value > 0;

/** A receipt-decision journal. Disclosures reveal supplied evidence without changing accounting state. */
export function SettlementJournal({ entries = demoSettlementJournalEntries, title = 'Settlement journal', dateLabel = '11 OCT 2026 · IST', runId = 'RCN-DEMO-1011', defaultExpandedIds, className, style }: SettlementJournalProps) {
  const id = useId();
  const [expanded, setExpanded] = useState<ReadonlySet<number>>(() => new Set(entries.flatMap((entry, index) => (defaultExpandedIds ? defaultExpandedIds.includes(entry.id) : index === 0) ? [index] : [])));
  const identifiersValid = (entry: SettlementJournalEntry) => Boolean(entry.id.trim() && entry.paymentReference.trim())
    && entries.filter(candidate => candidate.id.trim() === entry.id.trim()).length === 1
    && entries.filter(candidate => candidate.paymentReference.trim() === entry.paymentReference.trim()).length === 1;
  const validTotal = entries.every(entry => validAmount(entry.amountMinor) && identifiersValid(entry));
  const total = entries.reduce((sum, entry) => sum + (validAmount(entry.amountMinor) ? BigInt(entry.amountMinor) : 0n), 0n);
  function toggle(index: number) { setExpanded(current => { const next = new Set(current); if (next.has(index)) next.delete(index); else next.add(index); return next; }); }

  return <section className={cx(base.asset, s.journal, className)} style={style} aria-labelledby={`${id}-title`}>
    <header className={s.header}><div><span className={s.overline}>RECEIPT DECISION LOG</span><h2 id={`${id}-title`}>{title}</h2><p>{runId} · Illustrative workspace</p></div><div className={s.total}><span>Receipts in this journal</span><strong>{validTotal ? formatINR(total) : 'Total unavailable'}</strong></div></header>
    <div className={s.dateBar}><span>{dateLabel}</span><span>{entries.length} recorded receipt{entries.length === 1 ? '' : 's'}</span></div>
    {entries.length ? <ol className={s.entries} aria-label="Receipt decisions in supplied chronological order">{entries.map((entry, index) => {
      const open = expanded.has(index);
      const detailId = `${id}-evidence-${index}`;
      const validEntry = validAmount(entry.amountMinor) && identifiersValid(entry) && ['proposal', 'review', 'pending'].includes(entry.state);
      const label = !validEntry ? 'Data requires review' : entry.state === 'proposal' ? 'Proposed match' : entry.state === 'review' ? 'Needs review' : 'Pending evidence';
      return <li key={`${entry.id}-${index}`} className={s.entry} data-state={entry.state}>
        <div className={s.timeRail}><time dateTime={entry.dateTime}>{entry.timestamp}</time><span className={s.node} aria-hidden="true" /></div>
        <article className={s.record} aria-label={`Receipt decision ${entry.paymentReference}`}>
          <div className={s.recordTop}><div><h3>{entry.paymentReference || 'Missing payment reference'}</h3><p className={s.customer}>{entry.customer}</p></div><strong className={s.amount}>{validAmount(entry.amountMinor) ? formatINR(entry.amountMinor) : 'Invalid receipt amount'}</strong></div>
          <div className={s.recordBottom}><div><span className={s.state} data-state={validEntry ? entry.state : 'review'}>{label}</span><span className={s.summary}>{entry.summary}</span></div><button type="button" className={s.disclosure} aria-expanded={open} aria-controls={detailId} aria-label={`${open ? 'Hide' : 'Show'} evidence for ${entry.paymentReference || `unidentified receipt ${index + 1}`}`} onClick={() => toggle(index)}>Evidence <Icon name={open ? 'minus' : 'plus'} /></button></div>
          <div id={detailId} className={s.evidence} hidden={!open}>{!validEntry && <p className={s.detail}>This record requires valid amounts and unique receipt identifiers. Its supplied narrative does not establish a valid proposal.</p>}<p className={s.detail}>{entry.detail}</p>{entry.evidence.length ? <ul className={s.evidenceList}>{entry.evidence.map((item, evidenceIndex) => <li key={`${item.reference}-${evidenceIndex}`}><div><strong>{item.reference}</strong><span>{item.label}</span></div><span className={s.evidenceState} data-tone={item.tone}>{item.status}</span></li>)}</ul> : <p className={s.detail}>No supporting evidence supplied. The decision remains a display-only record.</p>}<p className={s.evidenceFoot}>{entry.id} · Evidence inspection only</p></div>
        </article>
      </li>;
    })}</ol> : <p className={s.empty} role="status">No receipt decisions recorded</p>}
    <footer className={s.footer}><span>Fictional receipt decisions · Uploaded-file workflow</span><span>No approval or ERP posting occurs in this journal.</span></footer>
  </section>;
}
