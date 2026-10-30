'use client';
import { useId, useRef, useState } from 'react';
import type { AssetProps, IncomingPayment } from './types';
import { demoIncomingPayments } from './sample-data';
import { formatMoney } from './format';
import { downloadDemoCsv } from './demo-export';
import { IncomingPaymentRows, SelectionCheckbox } from './IncomingPaymentRows';
import { AssetSegmentedControl } from './AssetSegmentedControl';
import { cx, Icon } from './shared';
import base from './assets.module.css';
import s from './incoming.module.css';

// Sorting and footer density patterns adapted from BoardUI's MIT data-table example.
// https://github.com/BoardUI/boardui/blob/main/components/application/data-table/data-table.tsx
// Native React/CSS implementation; source retrieved 2026-10-13. See THIRD-PARTY-NOTICES.md.
type SortKey = 'reference' | 'amountMinor';
type SortState = { key: SortKey; direction: 'ascending' | 'descending' } | null;
type PaymentTableDensity = 'compact' | 'comfortable';

function SortIndicator({ direction }: { direction?: 'ascending' | 'descending' }) {
  return <span className={s.sortIndicator} data-direction={direction}><Icon name={direction === 'ascending' ? 'chevron-up' : direction === 'descending' ? 'chevron-down' : 'arrow-up-down'} /></span>;
}

export interface VerasettIncomingPaymentsProps extends AssetProps {
  payments?: readonly IncomingPayment[];
  title?: string;
  onReview?: (reference: string) => void;
  /** Optional host callback. Default downloads clearly labeled fictional CSV locally. */
  onExport?: (payments: readonly IncomingPayment[]) => void;
  showSummary?: boolean;
  /** Initial row spacing. Compact remains readable without scaling the type. */
  defaultDensity?: PaymentTableDensity;
  /** Hide the local density switch when the host determines presentation. */
  showDensityControl?: boolean;
}
export function VerasettIncomingPayments({ payments = demoIncomingPayments, title = 'Incoming Payments', onReview, onExport = downloadDemoCsv, showSummary = true, defaultDensity = 'compact', showDensityControl = true, className, style }: VerasettIncomingPaymentsProps) {
  const id = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [notice, setNotice] = useState('');
  const [sort, setSort] = useState<SortState>(null);
  const [density, setDensity] = useState<PaymentTableDensity>(defaultDensity);
  const isReview = (p: IncomingPayment) => p.status === 'Needs review' || p.status === 'Review';
  const matched = payments.filter(p => p.status === 'Matched');
  const reviews = payments.filter(isReview);
  const visible = payments.filter(p => (filter === 'All' || (filter === 'Needs review' ? isReview(p) : p.status === filter)) && `${p.reference} ${p.customer} ${p.invoiceAllocation}`.toLowerCase().includes(query.trim().toLowerCase()));
  if (sort) visible.sort((a, b) => {
    const comparison = sort.key === 'reference'
      ? a.reference.localeCompare(b.reference, 'en', { numeric: true })
      : a.amountMinor < b.amountMinor ? -1 : a.amountMinor > b.amountMinor ? 1 : 0;
    return sort.direction === 'ascending' ? comparison : -comparison;
  });
  const changeSort = (key: SortKey) => setSort(old => old?.key !== key ? { key, direction: 'ascending' } : old.direction === 'ascending' ? { key, direction: 'descending' } : null);
  const sortLabel = (key: SortKey, label: string) => sort?.key === key && sort.direction === 'descending' ? `Clear ${label} sorting` : `Sort by ${label} ${sort?.key === key ? 'descending' : 'ascending'}`;
  const hasFilters = filter !== 'All' || query.trim().length > 0;
  const clearFilters = () => { setQuery(''); setFilter('All'); searchRef.current?.focus(); };
  const selectedVisible = visible.filter(p => selected.has(p.reference));
  const allSelected = visible.length > 0 && selectedVisible.length === visible.length;
  const sum = (rows: readonly IncomingPayment[]) => formatMoney(rows.reduce((total, row) => {
    if (!Number.isSafeInteger(row.amountMinor)) throw new RangeError('USD minor units must be a safe integer.');
    return total + BigInt(row.amountMinor);
  }, 0n));
  const toggle = (reference: string) => setSelected(old => { const next = new Set(old); if (next.has(reference)) next.delete(reference); else next.add(reference); return next; });
  const toggleAll = () => setSelected(old => { const next = new Set(old); for (const p of visible) { if (allSelected) next.delete(p.reference); else next.add(p.reference); } return next; });
  const exportRows = () => { const rows = selectedVisible.length ? selectedVisible : visible; onExport(rows); setNotice(`${rows.length} illustrative payment${rows.length === 1 ? '' : 's'} sent to demo CSV export. No ERP posting.`); };
  return <section className={cx(base.asset, s.panel, className)} style={style} aria-labelledby={`${id}-title`}>
    <header className={s.header}><div><h3 id={`${id}-title`}>{title}</h3><p>Bank payments reconciled against customer invoices</p></div><span className={s.demoTag}>Illustrative data</span></header>
    {showSummary && <dl className={s.summary} aria-label="Illustrative batch totals">
      <div><dt>Total received <span>{payments.length} payments</span></dt><dd>{sum(payments)}</dd></div>
      <div><dt><span className={cx(s.dot, s.green)} />Matched <span>{matched.length} payments</span></dt><dd>{sum(matched)}</dd></div>
      <div><dt><span className={cx(s.dot, s.amber)} />Needs review <span>{reviews.length} payment{reviews.length === 1 ? '' : 's'}</span></dt><dd>{sum(reviews)}</dd></div>
    </dl>}
    <div className={s.tabs} role="group" aria-label="Payment status views">
      {[['All', 'All payments', payments.length], ['Matched', 'Matched', matched.length], ['Needs review', 'Needs review', reviews.length]].map(([value, label, count]) => <button type="button" key={value} aria-label={`${label} ${count}`} aria-pressed={filter === value} onClick={() => setFilter(String(value))}>{label}<span>{count}</span></button>)}
    </div>
    <div className={s.toolbar}>
      <label className={s.search}><Icon name="search" /><input ref={searchRef} type="search" aria-label="Search payments" placeholder="Search payments…" value={query} onChange={e => setQuery(e.target.value)} /></label>
      <span className={s.selectControl}><select ref={statusRef} aria-label="Filter by status" value={filter} onChange={e => setFilter(e.target.value)}><option value="All">All statuses</option><option>Matched</option><option>Needs review</option><option>Pending</option><option>Evidence pending</option><option>Export ready</option><option>Blocked</option></select></span>
      <button type="button" className={s.export} disabled={!visible.length} onClick={exportRows}><Icon name="export" />Export demo CSV</button>
    </div>
    {hasFilters && <div className={s.activeFilters} role="group" aria-label="Active payment filters">
      <span className={s.filterLabel}>Filtered by</span>
      {filter !== 'All' && <button type="button" className={s.filterChip} aria-label={`Remove ${filter} status filter`} onClick={() => { setFilter('All'); statusRef.current?.focus(); }}><span>Status: {filter}</span><Icon name="close" /></button>}
      {query.trim() && <button type="button" className={s.filterChip} aria-label="Remove search filter" onClick={() => { setQuery(''); searchRef.current?.focus(); }}><span title={query.trim()}>Search: {query.trim()}</span><Icon name="close" /></button>}
      <button type="button" className={s.resetFilters} onClick={clearFilters}>Clear filters</button>
    </div>}
    <table className={s.table} data-density={density}>
      <caption className={base.srOnly}>Incoming bank payments and invoice allocations. Illustrative USD records.</caption>
      <thead><tr><th scope="col" className={s.selectionCell}><SelectionCheckbox checked={allSelected} mixed={selectedVisible.length > 0 && !allSelected} disabled={!visible.length} label="Select all visible payments" onChange={toggleAll} /></th><th scope="col" className={s.referenceCell} aria-sort={sort?.key === 'reference' ? sort.direction : 'none'}><button type="button" className={s.sortButton} aria-label={sortLabel('reference', 'payment reference')} onClick={() => changeSort('reference')}><span>Payment Reference</span><SortIndicator direction={sort?.key === 'reference' ? sort.direction : undefined} /></button></th><th scope="col" className={s.amount} aria-sort={sort?.key === 'amountMinor' ? sort.direction : 'none'}><button type="button" className={s.sortButton} aria-label={sortLabel('amountMinor', 'amount')} onClick={() => changeSort('amountMinor')}><span>Amount</span><SortIndicator direction={sort?.key === 'amountMinor' ? sort.direction : undefined} /></button></th><th scope="col" className={s.customerCell}>Customer</th><th scope="col" className={s.allocationCell}>Invoice Allocation</th><th scope="col" className={s.statusCell}>Status</th></tr></thead>
      <tbody><IncomingPaymentRows payments={visible} selected={selected} onToggle={toggle} onReview={onReview} /></tbody>
    </table>
    {!visible.length && <div className={s.empty}>{payments.length ? 'No payments match your filters' : 'No incoming payments'}</div>}
    <footer className={s.footer}>
      <div className={s.footerSummary}><span aria-live="polite">{visible.length} of {payments.length} payments{selectedVisible.length > 0 && <strong>{selectedVisible.length} selected</strong>}</span>{selected.size > 0 && <button type="button" className={s.clearSelection} onClick={() => setSelected(new Set())}>Clear selection</button>}</div>
      {showDensityControl && <AssetSegmentedControl className={s.densityControl} label="Payment row density" value={density} onValueChange={value => setDensity(value as PaymentTableDensity)} options={[{ value: 'compact', label: 'Compact' }, { value: 'comfortable', label: 'Comfortable' }]} />}
      <span className={s.exportBoundary}>USD<span className={s.footerDot}>·</span>Review before ERP export</span>
    </footer>
    <p role="status" className={notice ? s.exportNotice : base.srOnly}>{notice}</p>
  </section>;
}
