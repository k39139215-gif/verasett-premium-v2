import { useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardPopover } from './DashboardPopover';
import { VerasettDashboard } from './VerasettDashboard';
import { dashboardTransactions } from './dashboard-data';

const paymentRows = () => Array.from(screen.getByRole('table').querySelectorAll('tbody tr'));
const references = () => paymentRows().map(row => row.querySelector('th small')?.textContent);
const totals = () => screen.getByLabelText('Cash application totals');
const dialogMethods = ['showModal', 'close'] as const;
const originalDialogMethods = dialogMethods.map(method => Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, method));
const openFilters = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Filter payments' }));
  return screen.getByRole('dialog', { name: 'Filter payments' });
};

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: vi.fn(function (this: HTMLDialogElement) { this.setAttribute('open', ''); }) });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: vi.fn(function (this: HTMLDialogElement) { this.removeAttribute('open'); }) });
});

afterEach(() => {
  vi.restoreAllMocks();
  dialogMethods.forEach((method, index) => {
    const descriptor = originalDialogMethods[index];
    if (descriptor) Object.defineProperty(HTMLDialogElement.prototype, method, descriptor);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, method);
  });
});

describe('Reference-led dashboard interactions', () => {
  it('stages combined filters, applies them together and discards subsequent canceled edits', () => {
    render(<VerasettDashboard />);
    let filter = openFilters();
    fireEvent.click(within(filter).getByRole('checkbox', { name: /Needs review/ }));
    fireEvent.click(within(filter).getByRole('checkbox', { name: /^ACH/ }));
    expect(paymentRows()).toHaveLength(10);
    fireEvent.click(within(filter).getByRole('button', { name: 'Apply filters' }));
    expect(references()).toEqual(['ACH-55231', 'ACH-43819']);
    expect(screen.getByRole('button', { name: 'Remove Needs review filter' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Remove ACH filter' })).toBeVisible();

    filter = openFilters();
    fireEvent.click(within(filter).getByRole('button', { name: 'Reset' }));
    fireEvent.click(within(filter).getByRole('checkbox', { name: /^Matched/ }));
    fireEvent.click(within(filter).getByRole('button', { name: 'Cancel' }));
    expect(references()).toEqual(['ACH-55231', 'ACH-43819']);
    filter = openFilters();
    expect(within(filter).getByRole('checkbox', { name: /Needs review/ })).toBeChecked();
    expect(within(filter).getByRole('checkbox', { name: /^ACH/ })).toBeChecked();
    expect(within(filter).getByRole('checkbox', { name: /^Matched/ })).not.toBeChecked();
  });

  it('searches invoice identifiers while preserving period-wide financial totals and chart data', () => {
    render(<VerasettDashboard />);
    const originalTotals = totals().textContent;
    const chart = screen.getByRole('img', { name: 'Cash received and matched by day, October 23 to 29' });
    const originalChart = chart.innerHTML;
    expect(totals()).toHaveTextContent('$73,660.00');
    expect(totals()).toHaveTextContent('$60,365.00');
    expect(totals()).toHaveTextContent('$13,295.00');
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search dashboard payments' }), { target: { value: 'INV-3056' } });
    expect(references()).toEqual(['ACH-55231']);
    expect(totals().textContent).toBe(originalTotals);
    expect(chart.innerHTML).toBe(originalChart);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'no matching fictional customer' } });
    expect(screen.getByText('No payments found')).toBeVisible();
    expect(totals().textContent).toBe(originalTotals);
    fireEvent.click(screen.getByRole('button', { name: 'Clear search and filters' }));
    expect(paymentRows()).toHaveLength(10);
  });

  it('updates period and bank scopes, clears prior selections and retains unresolved evidence', () => {
    render(<VerasettDashboard />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select ACH-78421' }));
    fireEvent.click(screen.getByRole('button', { name: 'Date range' }));
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Date range' })).getByRole('button', { name: /All records/ }));
    expect(paymentRows()).toHaveLength(12);
    expect(totals()).toHaveTextContent('$84,390.00');
    expect(screen.getByRole('checkbox', { name: 'Select ACH-78421' })).not.toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Bank account scope' }));
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Bank account scope' })).getByRole('button', { name: /Operating account/ }));
    expect(references()).toEqual(['ACH-78421', 'ACH-55231', 'ACH-62108', 'ACH-81642', 'ACH-90533', 'ACH-26754']);
    expect(totals()).toHaveTextContent('$40,395.00');
    expect(totals()).toHaveTextContent('$11,120.00');
    expect(screen.getByRole('table')).toHaveTextContent('Evidence pending');
  });

  it('sorts monetary amounts numerically in both directions and computes selected receipts exactly', () => {
    render(<VerasettDashboard />);
    const amountSort = within(screen.getByRole('table')).getByRole('button', { name: 'Amount' });
    fireEvent.click(amountSort);
    expect(amountSort.closest('th')).toHaveAttribute('aria-sort', 'descending');
    expect(references()[0]).toBe('WIRE-77120');
    expect(references().at(-1)).toBe('ACH-43819');
    fireEvent.click(amountSort);
    expect(amountSort.closest('th')).toHaveAttribute('aria-sort', 'ascending');
    expect(references()[0]).toBe('ACH-43819');
    expect(references().at(-1)).toBe('WIRE-77120');
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select ACH-78421' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select WIRE-99302' }));
    expect(screen.getByText('$21,200.00 selected')).toBeVisible();
    expect(screen.getByRole('checkbox', { name: 'Select all dashboard payments' })).toBePartiallyChecked();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select all dashboard payments' }));
    expect(screen.getByText('$73,660.00 selected')).toBeVisible();
    expect(screen.getByRole('checkbox', { name: 'Select all dashboard payments' })).toBeChecked();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select all dashboard payments' }));
    expect(screen.queryByText(/\$[\d,]+\.\d{2} selected/)).not.toBeInTheDocument();
  });

  it('marks activity read without changing payment statuses or financial totals', () => {
    const dataBefore = JSON.stringify(dashboardTransactions);
    render(<VerasettDashboard />);
    const rowsBefore = paymentRows().map(row => row.textContent);
    const summaryBefore = totals().textContent;
    fireEvent.click(screen.getByRole('button', { name: 'Activity notifications' }));
    const activity = screen.getByRole('dialog', { name: 'Activity notifications' });
    expect(within(activity).getByRole('button', { name: 'Unread (3)' })).toBeVisible();
    fireEvent.click(within(activity).getByRole('button', { name: 'Mark all read' }));
    fireEvent.click(within(activity).getByRole('button', { name: 'Unread (0)' }));
    expect(within(activity).getByText("You're all caught up.")).toBeVisible();
    expect(paymentRows().map(row => row.textContent)).toEqual(rowsBefore);
    expect(totals().textContent).toBe(summaryBefore);
    expect(JSON.stringify(dashboardTransactions)).toBe(dataBefore);
  });

  it('shows the unresolved invoice difference in details and closes without approving a deduction', () => {
    render(<VerasettDashboard />);
    fireEvent.click(screen.getByRole('button', { name: 'View ACH-55231' }));
    const detail = screen.getByRole('dialog', { name: 'Westline Trading' });
    expect(within(detail).getByText('Needs review')).toBeVisible();
    expect(within(detail).getByRole('heading', { name: 'Candidate invoices' })).toBeVisible();
    expect(within(detail).getByText('$4,320.00')).toBeVisible();
    expect(within(detail).getByText('$3,000.00')).toBeVisible();
    expect(within(detail).getByText('$1,570.00')).toBeVisible();
    expect(within(detail).getByText('$4,570.00')).toBeVisible();
    expect(within(detail).getByText('-$250.00')).toBeVisible();
    expect(within(detail).getByText('No payment or deduction is approved from this view.')).toBeVisible();
    expect(within(detail).queryByRole('button', { name: /approve|apply|post/i })).not.toBeInTheDocument();
    fireEvent.click(within(detail).getByRole('button', { name: 'Done' }));
    expect(screen.queryByRole('dialog', { name: 'Westline Trading' })).not.toBeInTheDocument();
    const westline = paymentRows().find(row => row.textContent?.includes('ACH-55231'))!;
    expect(westline).toHaveTextContent('Needs review');
  });

  it('opens dropdowns with keyboard focus, supports arrow navigation, restores Escape focus and closes outside', () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return <><DashboardPopover label="Test options" open={open} onOpenChange={setOpen} trigger="Options"><button type="button">First</button><button type="button">Second</button></DashboardPopover><button type="button">Outside</button></>;
    }
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Test options' });
    fireEvent.click(trigger);
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('button', { name: 'First' }), { key: 'ArrowDown' });
    expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Outside' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
