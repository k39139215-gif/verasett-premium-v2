import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { VerasettIncomingPayments } from './VerasettIncomingPayments';
import { demoIncomingPayments } from './sample-data';
import type { IncomingPayment } from './types';

const rowReferences = () => Array.from(screen.getByRole('table').querySelectorAll('tbody th[scope="row"] > span:first-child')).map(node => node.textContent);
const amountHeader = () => screen.getByRole('button', { name: /^(Sort by amount|Clear amount sorting)/ }).closest('th');
const referenceHeader = () => screen.getByRole('button', { name: /^(Sort by payment reference|Clear payment reference sorting)/ }).closest('th');

describe('BoardUI-adapted incoming-payment controls', () => {
  it('cycles amount sorting ascending, descending and back to source order without mutating data', () => {
    const payments = Object.freeze(demoIncomingPayments.map(payment => Object.freeze({ ...payment })));
    render(<VerasettIncomingPayments payments={payments} />);
    const original = payments.map(payment => payment.reference);
    expect(amountHeader()).toHaveAttribute('aria-sort', 'none');
    fireEvent.click(screen.getByRole('button', { name: 'Sort by amount ascending' }));
    expect(rowReferences()).toEqual(['ACH-55231', 'WIRE-99302', 'ACH-78421', 'WIRE-77120']);
    expect(amountHeader()).toHaveAttribute('aria-sort', 'ascending');
    fireEvent.click(screen.getByRole('button', { name: 'Sort by amount descending' }));
    expect(rowReferences()).toEqual(['WIRE-77120', 'ACH-78421', 'WIRE-99302', 'ACH-55231']);
    expect(amountHeader()).toHaveAttribute('aria-sort', 'descending');
    fireEvent.click(screen.getByRole('button', { name: 'Clear amount sorting' }));
    expect(rowReferences()).toEqual(original);
    expect(amountHeader()).toHaveAttribute('aria-sort', 'none');
    expect(payments.map(payment => payment.reference)).toEqual(original);
  });

  it('sorts references naturally and clears the previous column sort', () => {
    const payments = ['ACH-10', 'WIRE-2', 'ACH-2'].map((reference, index) => ({ ...demoIncomingPayments[index], reference }));
    render(<VerasettIncomingPayments payments={payments} />);
    fireEvent.click(screen.getByRole('button', { name: 'Sort by amount ascending' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sort by payment reference ascending' }));
    expect(rowReferences()).toEqual(['ACH-2', 'ACH-10', 'WIRE-2']);
    expect(referenceHeader()).toHaveAttribute('aria-sort', 'ascending');
    expect(amountHeader()).toHaveAttribute('aria-sort', 'none');
    fireEvent.click(screen.getByRole('button', { name: 'Sort by payment reference descending' }));
    expect(rowReferences()).toEqual(['WIRE-2', 'ACH-10', 'ACH-2']);
    expect(referenceHeader()).toHaveAttribute('aria-sort', 'descending');
  });

  it('compares safe integer amounts directly and preserves ties in source order', () => {
    const payments: IncomingPayment[] = [
      { ...demoIncomingPayments[0], amountMinor: Number.MAX_SAFE_INTEGER },
      { ...demoIncomingPayments[1], amountMinor: Number.MAX_SAFE_INTEGER - 1 },
      { ...demoIncomingPayments[2], amountMinor: Number.MAX_SAFE_INTEGER - 1 },
    ];
    render(<VerasettIncomingPayments payments={payments} />);
    fireEvent.click(screen.getByRole('button', { name: 'Sort by amount ascending' }));
    expect(rowReferences()).toEqual(['WIRE-99302', 'ACH-55231', 'ACH-78421']);
    fireEvent.click(screen.getByRole('button', { name: 'Sort by amount descending' }));
    expect(rowReferences()).toEqual(['ACH-78421', 'WIRE-99302', 'ACH-55231']);
  });

  it('exports filtered rows in their visible sort order while excluding hidden selections', () => {
    const onExport = vi.fn();
    render(<VerasettIncomingPayments onExport={onExport} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select ACH-55231' }));
    fireEvent.click(screen.getByRole('button', { name: 'Matched 3' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sort by amount ascending' }));
    fireEvent.click(screen.getByRole('button', { name: 'Export demo CSV' }));
    expect(onExport).toHaveBeenLastCalledWith([demoIncomingPayments[1], demoIncomingPayments[0], demoIncomingPayments[3]]);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select WIRE-77120' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select WIRE-99302' }));
    fireEvent.click(screen.getByRole('button', { name: 'Export demo CSV' }));
    expect(onExport).toHaveBeenLastCalledWith([demoIncomingPayments[1], demoIncomingPayments[3]]);
    expect(screen.getByRole('status')).toHaveTextContent('2 illustrative payments');
    expect(screen.getByRole('status')).toHaveTextContent('No ERP posting');
  });

  it('clears active filters without losing selections, sort order, density or batch totals', () => {
    render(<VerasettIncomingPayments />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select ACH-78421' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sort by amount ascending' }));
    fireEvent.click(within(screen.getByRole('group', { name: 'Payment row density' })).getByRole('button', { name: 'Comfortable' }));
    fireEvent.click(screen.getByRole('button', { name: 'Needs review 1' }));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Westline' } });
    expect(rowReferences()).toEqual(['ACH-55231']);
    expect(screen.getByRole('group', { name: 'Active payment filters' })).toHaveTextContent('Status: Needs review');
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.queryByRole('group', { name: 'Active payment filters' })).not.toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(screen.getByRole('combobox', { name: 'Filter by status' })).toHaveValue('All');
    expect(screen.getByRole('checkbox', { name: 'Select ACH-78421' })).toBeChecked();
    expect(rowReferences()).toEqual(['ACH-55231', 'WIRE-99302', 'ACH-78421', 'WIRE-77120']);
    expect(screen.getByRole('table')).toHaveAttribute('data-density', 'comfortable');
    expect(screen.getByText('$41,440.00')).toBeVisible();
  });

  it('removes status and search chips independently and restores empty results', () => {
    render(<VerasettIncomingPayments />);
    fireEvent.click(screen.getByRole('button', { name: 'Matched 3' }));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Westline' } });
    expect(screen.getByText('No payments match your filters')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Export demo CSV' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Remove Matched status filter' }));
    expect(screen.getByRole('searchbox')).toHaveValue('Westline');
    expect(rowReferences()).toEqual(['ACH-55231']);
    fireEvent.click(screen.getByRole('button', { name: 'Remove search filter' }));
    expect(rowReferences()).toHaveLength(4);
    expect(screen.queryByRole('group', { name: 'Active payment filters' })).not.toBeInTheDocument();
  });

  it('supports both density settings without changing the dataset or selected rows', () => {
    render(<VerasettIncomingPayments />);
    const density = within(screen.getByRole('group', { name: 'Payment row density' }));
    expect(screen.getByRole('table')).toHaveAttribute('data-density', 'compact');
    expect(density.getByRole('button', { name: 'Compact' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select ACH-78421' }));
    fireEvent.click(density.getByRole('button', { name: 'Comfortable' }));
    expect(screen.getByRole('table')).toHaveAttribute('data-density', 'comfortable');
    expect(density.getByRole('button', { name: 'Comfortable' })).toHaveAttribute('aria-pressed', 'true');
    expect(rowReferences()).toHaveLength(4);
    expect(screen.getByRole('checkbox', { name: 'Select ACH-78421' })).toBeChecked();
    fireEvent.click(density.getByRole('button', { name: 'Compact' }));
    expect(screen.getByRole('table')).toHaveAttribute('data-density', 'compact');
  });

  it('returns focus to the status select after removing a focused status chip', () => {
    render(<VerasettIncomingPayments />);
    fireEvent.click(screen.getByRole('button', { name: 'Matched 3' }));
    const chip = screen.getByRole('button', { name: 'Remove Matched status filter' });
    chip.focus();
    expect(chip).toHaveFocus();
    fireEvent.click(chip);
    expect(screen.getByRole('combobox', { name: 'Filter by status' })).toHaveFocus();
    expect(screen.queryByRole('group', { name: 'Active payment filters' })).not.toBeInTheDocument();
  });

  it('returns focus to search after removing a focused search chip', () => {
    render(<VerasettIncomingPayments />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Acme' } });
    const chip = screen.getByRole('button', { name: 'Remove search filter' });
    chip.focus();
    expect(chip).toHaveFocus();
    fireEvent.click(chip);
    expect(screen.getByRole('searchbox')).toHaveFocus();
    expect(screen.queryByRole('group', { name: 'Active payment filters' })).not.toBeInTheDocument();
  });

  it('returns focus to search after activating the disappearing clear-filters control', () => {
    render(<VerasettIncomingPayments />);
    fireEvent.click(screen.getByRole('button', { name: 'Matched 3' }));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Acme' } });
    const clear = screen.getByRole('button', { name: 'Clear filters' });
    clear.focus();
    expect(clear).toHaveFocus();
    fireEvent.click(clear);
    expect(screen.getByRole('searchbox')).toHaveFocus();
    expect(screen.queryByRole('group', { name: 'Active payment filters' })).not.toBeInTheDocument();
    expect(rowReferences()).toHaveLength(4);
  });

  it('lets an embedding host choose comfortable spacing and hide the density switch', () => {
    render(<VerasettIncomingPayments defaultDensity="comfortable" showDensityControl={false} />);
    expect(screen.getByRole('table')).toHaveAttribute('data-density', 'comfortable');
    expect(screen.queryByRole('group', { name: 'Payment row density' })).not.toBeInTheDocument();
    expect(rowReferences()).toHaveLength(4);
  });
});
