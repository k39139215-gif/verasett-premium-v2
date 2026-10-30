'use client';
import { useId, type ReactNode } from 'react';
import type { AssetProps } from './types';
import type { ProductEvidence, ScreenTone } from './product-data';
import { cx, Icon } from './shared';
import base from './assets.module.css';
import s from './product-screens.module.css';

export function ScreenFrame({ title, eyebrow = 'RECONCILIATION WORKSPACE', description, meta, actions, children, className, style }: AssetProps & { title: string; eyebrow?: string; description?: ReactNode; meta?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  const id = useId();
  return <section className={cx(base.asset, s.screen, className)} style={style} aria-labelledby={id}>
    <header className={s.screenHeader}><div><span className={s.eyebrow}>{eyebrow}</span><h2 id={id}>{title}</h2>{description && <p className={s.description}>{description}</p>}</div><div className={s.headerActions}><span className={s.demoTag}>Illustrative workspace</span>{actions}</div></header>
    {meta && <div className={s.meta}>{meta}</div>}{children}
    <footer className={s.screenFooter}><span>Fictional data · Uploaded-file workflow</span><span>No bank or ERP connection</span></footer>
  </section>;
}
export function ScreenStatus({ label, tone = 'neutral' }: { label: string; tone?: ScreenTone }) {
  return <span className={cx(base.pill, s.status)} data-tone={tone}><Icon name={tone === 'success' ? 'check' : tone === 'review' ? 'review' : tone === 'blocked' ? 'blocked' : 'clock'} />{label}</span>;
}
export function MetricSummary({ items }: { items: readonly { label: string; value: ReactNode; detail?: ReactNode }[] }) {
  return <dl className={s.metrics}>{items.map(item => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd>{item.detail && <p>{item.detail}</p>}</div>)}</dl>;
}
export function EvidenceList({ items }: { items: readonly ProductEvidence[] }) {
  return <ul className={s.evidenceList}>{items.map(item => <li key={item.reference}><div><strong>{item.reference}</strong><p>{item.label}</p></div><ScreenStatus label={item.status} tone={item.tone} /></li>)}</ul>;
}
export interface DataColumn<T> { key: string; label: string; render: (row: T) => ReactNode; numeric?: boolean; width?: string }
export function DataTable<T>({ label, columns, rows, rowKey, emptyMessage = 'No records to display' }: { label: string; columns: readonly DataColumn<T>[]; rows: readonly T[]; rowKey: (row: T) => string; emptyMessage?: string }) {
  return <div className={s.tableWrap}><table className={cx(s.dataTable,columns.length<=3&&s.compactTable)}><caption className={s.srOnly}>{label}</caption><colgroup>{columns.map(c => <col key={c.key} style={c.width ? { width: c.width } : undefined} />)}</colgroup><thead><tr>{columns.map(c => <th scope="col" key={c.key} className={c.numeric ? s.numeric : undefined}>{c.label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={rowKey(row)}>{columns.map((c, index) => index === 0 ? <th scope="row" key={c.key} data-label={c.label}><div className={s.cell}>{c.render(row)}</div></th> : <td key={c.key} data-label={c.label} className={c.numeric ? s.numeric : undefined}><div className={s.cell}>{c.render(row)}</div></td>)}</tr>)}</tbody></table>{!rows.length && <p className={s.empty} role="status">{emptyMessage}</p>}</div>;
}
export function Notice({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'review' }) {
  return <div className={s.notice} data-tone={tone}><Icon name={tone === 'success' ? 'check' : tone === 'review' ? 'review' : 'info'} /><div>{children}</div></div>;
}
