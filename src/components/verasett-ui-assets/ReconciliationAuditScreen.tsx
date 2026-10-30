'use client';
import { useState } from 'react';
import type { AssetProps } from './types';
import { demoProductMatch, demoRun } from './product-data';
import { DataTable, EvidenceList, Notice, ScreenFrame, ScreenStatus, type DataColumn } from './product-shared';
import { demoExportBatchId, demoReconciliationAuditEvents, type ReconciliationAuditEvent } from './export-audit-data';
import s from './product-screens.module.css';

export interface ReconciliationAuditScreenProps extends AssetProps {
  events?: readonly ReconciliationAuditEvent[];
  runId?: string;
  paymentReference?: string;
  batchId?: string;
  customer?: string;
  dateLabel?: string;
}

/** An inspectable provenance snapshot; selection only changes local evidence details. */
export function ReconciliationAuditScreen({ events = demoReconciliationAuditEvents, runId = demoRun.id,
  paymentReference = demoProductMatch.reference, batchId = demoExportBatchId,
  customer = demoProductMatch.customer, dateLabel = '11 Oct 2026 · IST', className, style,
}: ReconciliationAuditScreenProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = events.find(event => event.id === selectedId) ?? events[0];
  const columns: readonly DataColumn<ReconciliationAuditEvent>[] = [
    { key: 'time', label: 'Time · IST', width: '16%', render: event => <time dateTime={event.dateTime}>{event.timestamp}</time> },
    { key: 'event', label: 'Reconciliation event', width: '53%', render: event => <><button type="button" className={s.eventButton} aria-label={`Inspect ${event.title}`} aria-pressed={selected?.id === event.id} onClick={() => setSelectedId(event.id)}>{event.title}</button><p className={s.muted}>{event.summary}</p></> },
    { key: 'result', label: 'Recorded result', width: '31%', render: event => <ScreenStatus label={event.status} tone={event.tone} /> },
  ];
  return <ScreenFrame title="Reconciliation Audit Trail" eyebrow="DECISION PROVENANCE" description="Follow the evidence, allocation and control decisions for one illustrative receipt." className={className} style={style}
    actions={<ScreenStatus label="Illustrative snapshot" />}
    meta={<><span>Run <strong>{runId}</strong></span><span>{paymentReference}</span><span>{dateLabel}</span></>}>
    <div className={s.toolbar}><div><strong className={s.strong}>{customer}</strong><p className={s.muted}>{events.length} recorded events · {batchId}</p></div><span className={s.muted}>Select an event to inspect its evidence</span></div>
    <DataTable label="Illustrative reconciliation audit events" columns={columns} rows={events} rowKey={event => event.id} emptyMessage="No audit events supplied. No approval or export state can be inferred." />
    {selected ? <section className={s.split} aria-label="Selected audit evidence">
      <div className={s.section}><span className={s.eyebrow}>{selected.id} · {selected.timestamp} IST</span><h3 className={s.sectionTitle}>{selected.title}</h3><p className={s.muted}>{selected.detail}</p><dl className={s.facts}><div><dt>Recorded by</dt><dd>{selected.actor}</dd></div><div><dt>Recorded state</dt><dd>{selected.status}</dd></div></dl></div>
      <aside className={s.sidebar}><h3 className={s.sectionTitle}>Linked evidence</h3>{selected.evidence.length ? <EvidenceList items={selected.evidence} /> : <p className={s.muted}>No supporting references attached to this event.</p>}</aside>
    </section> : null}
    <div className={s.body}><Notice>{events === demoReconciliationAuditEvents ? 'Later approved illustrative snapshot. The sequence ends at batch preparation; it contains no live ERP posting event.' : 'Supplied illustrative event history. Recorded events are display data and do not execute reconciliation, approval or ERP posting.'}</Notice></div>
  </ScreenFrame>;
}
