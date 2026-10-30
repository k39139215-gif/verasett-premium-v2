import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { VerasettIncomingPayments } from './VerasettIncomingPayments';
import { demoIncomingPayments } from './sample-data';
import { createDemoCsv } from './demo-export';

describe('reference-informed incoming payments', () => {
  it('renders five financial columns and the requested revised data', () => {
    render(<VerasettIncomingPayments />);
    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('columnheader').slice(1).map(x => x.textContent)).toEqual(['Payment Reference', 'Amount', 'Customer', 'Invoice Allocation', 'Status']);
    expect(within(table).getAllByRole('row')).toHaveLength(5);
    expect(within(table).getAllByText('Acme Distribution').length).toBeGreaterThan(0);
    expect(within(table).getAllByText('3 invoices').length).toBeGreaterThan(0);
    expect(within(table).getAllByText('Review required').length).toBeGreaterThan(0);
    expect(within(table).getByText('Needs review')).toBeVisible();
    expect(screen.getByText('$41,440.00')).toBeVisible();
    expect(screen.getByText('$37,120.00')).toBeVisible();
    expect(screen.queryByText(/98.7/)).not.toBeInTheDocument();
  });
  it('searches reference, customer and allocation without changing batch totals', () => {
    render(<VerasettIncomingPayments />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'westline' } });
    expect(screen.getByRole('table').querySelectorAll('tbody tr')).toHaveLength(1);
    expect(screen.getByText('$41,440.00')).toBeVisible();
    expect(screen.getByText('1 of 4 payments')).toBeVisible();
  });
  it('filters review records and resets to all payments', () => {
    render(<VerasettIncomingPayments />);
    fireEvent.click(screen.getByRole('button', { name: /Needs review 1/ }));
    expect(screen.getByRole('table').querySelectorAll('tbody tr')).toHaveLength(1);
    expect(screen.getAllByText('Westline Trading').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: /All payments 4/ }));
    expect(screen.getByRole('table').querySelectorAll('tbody tr')).toHaveLength(4);
    fireEvent.change(screen.getByRole('combobox', { name: 'Filter by status' }), { target: { value: 'Matched' } });
    expect(screen.getByRole('table').querySelectorAll('tbody tr')).toHaveLength(3);
  });
  it('supports select all, partial selection and export of visible selected records only', () => {
    const onExport = vi.fn();
    render(<VerasettIncomingPayments onExport={onExport} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select all visible payments' }));
    expect(screen.getByText('4 selected')).toBeVisible();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select ACH-55231' }));
    expect(screen.getByRole('checkbox', { name: 'Select all visible payments' })).toBePartiallyChecked();
    fireEvent.click(screen.getByRole('button', { name: /Export demo CSV/ }));
    expect(onExport.mock.calls[0][0]).toHaveLength(3);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Westline' } });
    fireEvent.click(screen.getByRole('button', { name: /Export demo CSV/ }));
    expect(onExport.mock.calls[1][0]).toEqual([demoIncomingPayments[2]]);
  });
  it('renders empty search and data states and disables empty export', () => {
    const { rerender } = render(<VerasettIncomingPayments />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'missing' } });
    expect(screen.getByText('No payments match your filters')).toBeVisible();
    expect(screen.getByRole('button', { name: /Export demo CSV/ })).toBeDisabled();
    rerender(<VerasettIncomingPayments payments={[]} />);
    expect(screen.getByText('No incoming payments')).toBeVisible();
  });
  it('opens only explicit review actions', () => {
    const onReview = vi.fn();
    render(<VerasettIncomingPayments onReview={onReview} />);
    fireEvent.click(screen.getByRole('button', { name: 'Review match ACH-55231' }));
    expect(onReview).toHaveBeenCalledWith('ACH-55231');
  });
  it('exports quoted fictional CSV and guards spreadsheet formula injection', () => {
    const csv = createDemoCsv([{ ...demoIncomingPayments[0], customer: '=HYPERLINK("bad")' }]);
    expect(csv).toContain('Illustrative');
    expect(csv).toContain('"12450.00"');
    expect(csv).toContain('"\'=HYPERLINK(""bad"")"');
  });
  it('keeps aggregate totals exact beyond the safe number boundary', () => {
    render(<VerasettIncomingPayments payments={[
      { ...demoIncomingPayments[0], amountMinor: Number.MAX_SAFE_INTEGER },
      { ...demoIncomingPayments[1], amountMinor: 2 },
    ]} />);
    expect(screen.getAllByText('$90,071,992,547,409.93')).toHaveLength(2);
  });
  it('offers a clear-selection action usable after switching to compact view', () => {
    render(<VerasettIncomingPayments />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select ACH-78421' }));
    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(screen.getByRole('checkbox', { name: 'Select ACH-78421' })).not.toBeChecked();
    expect(screen.queryByText('1 selected')).not.toBeInTheDocument();
  });
});
