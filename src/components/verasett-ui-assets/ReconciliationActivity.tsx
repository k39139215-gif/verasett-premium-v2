'use client';
import { useId, useRef, useState } from 'react';
import type { AssetProps } from './types';
import { cx, Icon, type IconName } from './shared';
import { demoReconciliationActivity, type ReconciliationActivityEvent, type ReconciliationActivityStage, type ReconciliationActivityStatus } from './reconciliation-activity-data';
import base from './assets.module.css';
import s from './reconciliation-activity.module.css';

export interface ReconciliationActivityProps extends AssetProps {
  events?: readonly ReconciliationActivityEvent[];
  title?: string;
  snapshotLabel?: string;
  initialFilter?: 'all' | 'unread';
  initialExpandedEventId?: string;
  /** Optional host navigation. Reading or opening an event never approves it. */
  onOpenRecord?: (event: ReconciliationActivityEvent) => void;
  /** Reports only newly read event IDs; persist them in the host if needed. */
  onReadChange?: (eventIds: readonly string[]) => void;
}

const stages: readonly { id: ReconciliationActivityStage; label: string }[] = [
  { id: 'source', label: 'Bank input' }, { id: 'matching', label: 'Matching & review' }, { id: 'handoff', label: 'Controlled handoff' },
];
const statusPresentation: Record<ReconciliationActivityStatus, { icon: IconName; tone: string }> = {
  'Source received': { icon: 'file', tone: 'neutral' },
  'Allocation found': { icon: 'layers', tone: 'green' },
  'Needs review': { icon: 'review', tone: 'amber' },
  'Export prepared': { icon: 'export', tone: 'blue' },
};

/** Adapted from BoardUI's MIT Notification Center; see THIRD-PARTY-NOTICES.md.
 * Local read-state tracking is intentionally independent from supplied accounting states.
 */
export function ReconciliationActivity({ events = demoReconciliationActivity, title = 'Reconciliation activity', snapshotLabel = 'Illustrative snapshot · 12 Oct 2026', initialFilter = 'all', initialExpandedEventId, onOpenRecord, onReadChange, className, style }: ReconciliationActivityProps) {
  const id = useId();
  const [filter, setFilter] = useState(initialFilter);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(initialExpandedEventId ? [initialExpandedEventId] : []));
  const unreadFilterRef = useRef<HTMLButtonElement>(null);
  const [announcement, setAnnouncement] = useState('');
  const isUnread = (event: ReconciliationActivityEvent) => event.unread && !readIds.has(event.id);
  const unreadEvents = events.filter(isUnread);
  const visibleEvents = filter === 'all' ? events : unreadEvents;
  function markRead(eventIds: readonly string[]) {
    setReadIds(current => new Set([...current, ...eventIds]));
    onReadChange?.(eventIds);
    setAnnouncement(`${eventIds.length} ${eventIds.length === 1 ? 'event marked' : 'events marked'} as read. Financial statuses are unchanged.`);
  }
  function toggleDetails(eventId: string) {
    setExpandedIds(current => {
      const next = new Set(current);
      if (next.has(eventId)) next.delete(eventId); else next.add(eventId);
      return next;
    });
  }
  return <section className={cx(base.asset, s.activity, className)} style={style} aria-labelledby={`${id}-title`}>
    <header className={s.header}>
      <div><p className={s.eyebrow}>RECONCILIATION RECORD</p><h2 id={`${id}-title`}>{title}</h2><p className={s.snapshot}>{snapshotLabel}</p></div>
      <button type="button" className={s.markAll} disabled={!unreadEvents.length} onClick={() => markRead(unreadEvents.map(event => event.id))}>Mark all read</button>
    </header>
    <div className={s.toolbar}>
      <div role="group" aria-label="Activity filter" className={s.filters}>
        <button type="button" aria-pressed={filter === 'all'} aria-controls={`${id}-events`} onClick={() => setFilter('all')}>All{' '}<span>{events.length}</span></button>
        <button type="button" ref={unreadFilterRef} aria-pressed={filter === 'unread'} aria-controls={`${id}-events`} onClick={() => setFilter('unread')}>Unread{' '}<span>{unreadEvents.length}</span></button>
      </div>
      <span className={s.readNote}>Read state ≠ approval</span>
    </div>
    <div id={`${id}-events`} className={s.events}>
      {!visibleEvents.length ? <div className={s.empty}><Icon name="check" /><strong>{events.length ? 'No unread events' : 'No activity supplied'}</strong><p>{events.length ? 'All events have been read. Review and export controls are unchanged.' : 'Supply event records to show the reconciliation trail.'}</p></div> : stages.map(stage => {
        const group = visibleEvents.filter(event => event.stage === stage.id);
        if (!group.length) return null;
        return <section className={s.group} key={stage.id} aria-labelledby={`${id}-${stage.id}`}>
          <h3 id={`${id}-${stage.id}`} className={s.groupTitle}>{stage.label}{' '}<span>{group.length}</span></h3>
          <ul className={s.list}>{group.map(event => {
            const index = events.indexOf(event);
            const detailId = `${id}-detail-${index}`;
            const expanded = expandedIds.has(event.id);
            const unread = isUnread(event);
            const presentation = statusPresentation[event.status];
            return <li key={event.id} className={s.event} data-unread={unread} data-status={event.status}>
              <div className={s.eventRow}>
                <button className={s.eventDisclosure} type="button" onClick={() => toggleDetails(event.id)} aria-expanded={expanded} aria-controls={detailId} aria-label={`${event.title}, ${event.reference}, ${event.status}`}>
                  <span className={s.eventIcon} data-tone={presentation.tone}><Icon name={presentation.icon} /></span>
                  <span className={s.eventText}><strong>{event.title}</strong><span className={s.eventMeta}><span>{event.reference}</span><time dateTime={event.occurredAt}>{event.timeLabel}</time></span></span>
                  <span className={s.eventState} data-tone={presentation.tone}>{event.status}</span>
                  <span className={s.chevron}><Icon name={expanded ? 'minus' : 'plus'} /></span>
                </button>
                {unread ? <button type="button" className={s.readButton} aria-label={`Mark ${event.id} as read`} title="Mark as read" onClick={click => {
                  const disclosure = click.currentTarget.parentElement?.querySelector<HTMLButtonElement>('button[aria-expanded]');
                  markRead([event.id]);
                  if (filter === 'unread') unreadFilterRef.current?.focus(); else disclosure?.focus();
                }}><span className={s.unreadDot} /><span>Unread</span><Icon name="check" /></button> : <span className={s.readLabel}>Read</span>}
              </div>
              <div id={detailId} className={s.detail} hidden={!expanded}>
                <p>{event.detail}</p>
                <dl>{event.trace.map((field, fieldIndex) => <div key={`${field.label}-${fieldIndex}`}><dt>{field.label}</dt><dd>{field.value}</dd></div>)}</dl>
                <div className={s.detailFooter}><span>{event.id}</span>{onOpenRecord && <button type="button" onClick={() => onOpenRecord(event)}>Open record<Icon name="arrow" /></button>}</div>
              </div>
            </li>;
          })}</ul>
        </section>;
      })}
    </div>
    <footer className={s.footer}><Icon name="info" /><p>Reading an event does not resolve an exception, approve an allocation or post to an ERP.</p></footer>
    <span className={s.srOnly} role="status" aria-live="polite" aria-atomic="true">{announcement}</span>
  </section>;
}
