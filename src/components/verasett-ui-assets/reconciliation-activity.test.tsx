import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReconciliationActivity } from './ReconciliationActivity';
import { demoReconciliationActivity } from './reconciliation-activity-data';

describe('ReconciliationActivity', () => {
  it('groups four fictional operational events and shows truthful read counts', () => {
    render(<ReconciliationActivity />);
    expect(screen.getByRole('heading', { name: 'Reconciliation activity' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'All 4' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Unread 3' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByRole('heading', { name: 'Bank input 1' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Matching & review 2' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Controlled handoff 1' })).toBeVisible();
    expect(screen.getByText('Read state ≠ approval')).toBeVisible();
  });

  it('filters unread events and does not mutate supplied financial status or data', () => {
    const supplied = structuredClone(demoReconciliationActivity);
    const before = JSON.stringify(supplied);
    const onReadChange = vi.fn();
    render(<ReconciliationActivity events={supplied} onReadChange={onReadChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Unread 3' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.queryByText('Bank statement received')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mark EVENT-DEMO-103 as read' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Unread 2' })).toHaveFocus();
    expect(onReadChange).toHaveBeenCalledWith(['EVENT-DEMO-103']);
    expect(screen.getByRole('status')).toHaveTextContent('1 event marked as read. Financial statuses are unchanged.');
    fireEvent.click(screen.getByRole('button', { name: 'All 4' }));
    const exception = screen.getByRole('button', { name: /Remittance difference unresolved/ }).closest('li')!;
    expect(exception).toHaveAttribute('data-status', 'Needs review');
    expect(within(exception).getByText('Read')).toBeVisible();
    expect(within(exception).getByText('Needs review')).toBeVisible();
    expect(JSON.stringify(supplied)).toBe(before);
  });

  it('marks all events read while preserving exceptions and export controls', () => {
    const onReadChange = vi.fn();
    render(<ReconciliationActivity onReadChange={onReadChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Mark all read' }));
    expect(onReadChange).toHaveBeenCalledWith(['EVENT-DEMO-102', 'EVENT-DEMO-103', 'EVENT-DEMO-104']);
    expect(screen.getByRole('button', { name: 'Mark all read' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Unread 0' })).toBeVisible();
    expect(screen.getByText('Needs review')).toBeVisible();
    expect(screen.getByText('Export prepared')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('3 events marked as read. Financial statuses are unchanged.');
    fireEvent.click(screen.getByRole('button', { name: 'Unread 0' }));
    expect(screen.getByText('No unread events')).toBeVisible();
    expect(screen.getByText('All events have been read. Review and export controls are unchanged.')).toBeVisible();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('exposes trace details through native focusable disclosure buttons', () => {
    render(<ReconciliationActivity />);
    const disclosure = screen.getByRole('button', { name: /Deterministic allocation found/ });
    expect(disclosure.tagName).toBe('BUTTON');
    expect(disclosure).toHaveAttribute('type', 'button');
    expect(disclosure).toHaveAttribute('aria-expanded', 'false');
    const panel = document.getElementById(disclosure.getAttribute('aria-controls')!)!;
    expect(panel).not.toBeVisible();
    disclosure.focus();
    expect(disclosure).toHaveFocus();
    fireEvent.click(disclosure);
    expect(disclosure).toHaveAttribute('aria-expanded', 'true');
    expect(panel).toBeVisible();
    expect(within(panel).getByText('Approval pending · excluded from the prepared export')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Unread 3' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Mark EVENT-DEMO-102 as read' })).toBeVisible();
    fireEvent.click(disclosure);
    expect(panel).not.toBeVisible();
    expect(disclosure).toHaveFocus();
  });

  it('provides record actions only when a host callback exists and never marks them read implicitly', () => {
    const { unmount } = render(<ReconciliationActivity initialExpandedEventId="EVENT-DEMO-103" />);
    expect(screen.queryByRole('button', { name: 'Open record' })).not.toBeInTheDocument();
    unmount();
    const onOpenRecord = vi.fn();
    const onReadChange = vi.fn();
    render(<ReconciliationActivity initialExpandedEventId="EVENT-DEMO-103" onOpenRecord={onOpenRecord} onReadChange={onReadChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Open record' }));
    expect(onOpenRecord).toHaveBeenCalledWith(demoReconciliationActivity[2]);
    expect(onReadChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Unread 3' })).toBeVisible();
    expect(screen.getByText('Needs review')).toBeVisible();
  });

  it('distinguishes the pending candidate from the separately reviewed export', () => {
    render(<ReconciliationActivity />);
    fireEvent.click(screen.getByRole('button', { name: /Deterministic allocation found/ }));
    fireEvent.click(screen.getByRole('button', { name: /Reviewed receipt prepared for export/ }));
    expect(screen.getByText(/The \$12,450.00 receipt equals/)).toBeVisible();
    expect(screen.getByText('ALLOC-DEMO-101 · 3 candidate invoices · $12,450.00 total')).toBeVisible();
    expect(screen.getByText('REVIEW-DEMO-104 · recorded approval for WIRE-99302 only')).toBeVisible();
    expect(screen.getByText('CSV-DEMO-104 · 1 receipt · 2 invoice allocations')).toBeVisible();
    expect(screen.getByText('Prepared only · not posted to ERP')).toBeVisible();
  });

  it('retains local read state through filtering and refreshed event objects', () => {
    const { rerender } = render(<ReconciliationActivity />);
    fireEvent.click(screen.getByRole('button', { name: 'Mark EVENT-DEMO-102 as read' }));
    expect(screen.getByRole('button', { name: /Deterministic allocation found/ })).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Unread 2' }));
    rerender(<ReconciliationActivity events={structuredClone(demoReconciliationActivity)} />);
    expect(screen.getByRole('button', { name: 'Unread 2' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByText('Deterministic allocation found')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'All 4' }));
    expect(screen.getByText('Deterministic allocation found')).toBeVisible();
  });

  it('keeps separate instances independent with unique disclosure and heading IDs', () => {
    const { container } = render(<><ReconciliationActivity title="Activity A" /><ReconciliationActivity title="Activity B" /></>);
    const first = screen.getByRole('region', { name: 'Activity A' });
    const second = screen.getByRole('region', { name: 'Activity B' });
    fireEvent.click(within(first).getByRole('button', { name: 'Mark all read' }));
    expect(within(first).getByRole('button', { name: 'Unread 0' })).toBeVisible();
    expect(within(second).getByRole('button', { name: 'Unread 3' })).toBeVisible();
    const ids = [...container.querySelectorAll('[id]')].map(element => element.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const element of container.querySelectorAll('[aria-controls]')) expect(container.querySelectorAll(`[id="${element.getAttribute('aria-controls')}"]`)).toHaveLength(1);
  });

  it('supports empty/custom content and a configured initial unread view', () => {
    const { unmount } = render(<ReconciliationActivity events={[]} title="Custom activity" snapshotLabel="Isolated example" />);
    expect(screen.getByRole('heading', { name: 'Custom activity' })).toBeVisible();
    expect(screen.getByText('Isolated example')).toBeVisible();
    expect(screen.getByText('No activity supplied')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Mark all read' })).toBeDisabled();
    unmount();
    render(<ReconciliationActivity initialFilter="unread" />);
    expect(screen.getByRole('button', { name: 'Unread 3' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('retains long references and event content in accessible text', () => {
    const reference = 'PAYMENT-DEMO-LONG-REFERENCE-FOR-AN-ILLUSTRATIVE-REGIONAL-ENTITY-0123456789';
    render(<ReconciliationActivity events={[{ ...demoReconciliationActivity[1], reference }]} />);
    expect(screen.getByText(reference)).toBeVisible();
    expect(screen.getByRole('button', { name: `Deterministic allocation found, ${reference}, Allocation found` })).toBeVisible();
  });
});
