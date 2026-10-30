import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AllocationMatrix } from './AllocationMatrix';
import { demoAllocationMatrix, summarizeAllocationMatrix, type AllocationMatrixData } from './allocation-matrix-data';

describe('AllocationMatrix', () => {
  it('presents a cross-tab with invoice columns and exact integer-paise totals', () => {
    render(<AllocationMatrix />);
    const table = screen.getByRole('table', { name: 'Receipt allocation matrix' });
    expect(within(table).getAllByRole('columnheader')).toHaveLength(5);
    expect(within(table).getByRole('rowheader', { name: 'Bank receipt Cash allocated' })).toBeVisible();
    expect(within(table).getByText('₹18,40,000')).toBeVisible();
    expect(summarizeAllocationMatrix(demoAllocationMatrix)).toMatchObject({ valid: true, balanced: true, evidenceReady: true });
    expect(screen.getByText('Allocation balanced')).toBeVisible();
    expect(screen.getByText('Approval pending · No ERP posting')).toBeVisible();
    expect(screen.getByText('Illustrative data')).toBeVisible();
  });

  it('changes selected invoice focus and its supporting explanation', () => {
    const onSelectInvoice = vi.fn();
    render(<AllocationMatrix onSelectInvoice={onSelectInvoice} />);
    const button = screen.getByRole('button', { name: 'Inspect INV-DEMO-1048' });
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Tracing INV-DEMO-1048')).toBeVisible();
    expect(screen.getByText('₹5,93,000 cash + ₹7,000 adjustments against ₹6,00,000 open value.')).toBeVisible();
    expect(onSelectInvoice).toHaveBeenCalledWith('INV-DEMO-1048');
  });

  it('supports an initial selection and the narrow-layout selector', () => {
    render(<AllocationMatrix initialInvoiceReference="INV-DEMO-1051" />);
    expect(screen.getByText('Tracing INV-DEMO-1051')).toBeVisible();
    fireEvent.change(screen.getByLabelText('Inspect invoice column'), { target: { value: 'INV-DEMO-1042' } });
    expect(screen.getByText('Tracing INV-DEMO-1042')).toBeVisible();
  });

  it('falls back safely when a selected invoice disappears', () => {
    const { rerender } = render(<AllocationMatrix initialInvoiceReference="INV-DEMO-1051" />);
    rerender(<AllocationMatrix data={{ ...demoAllocationMatrix, invoices: demoAllocationMatrix.invoices.slice(0, 2) }} />);
    expect(screen.getByText('Tracing INV-DEMO-1042')).toBeVisible();
  });

  it('shows an explicit empty state without a balanced claim', () => {
    render(<AllocationMatrix data={{ ...demoAllocationMatrix, invoices: [] }} />);
    expect(screen.getByText('No invoice allocations supplied')).toBeVisible();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText('Check input data')).toBeVisible();
  });

  it.each([
    ['fractional receipt', { ...demoAllocationMatrix, receivedMinor: 18.4 }],
    ['missing payment', { ...demoAllocationMatrix, paymentReference: ' ' }],
    ['negative allocation', { ...demoAllocationMatrix, invoices: [{ ...demoAllocationMatrix.invoices[0], cashMinor: -1 }] }],
    ['nonfinite allocation', { ...demoAllocationMatrix, invoices: [{ ...demoAllocationMatrix.invoices[0], taxMinor: NaN }] }],
    ['duplicate references', { ...demoAllocationMatrix, invoices: [demoAllocationMatrix.invoices[0], demoAllocationMatrix.invoices[0]] }],
    ['missing invoice reference', { ...demoAllocationMatrix, invoices: [{ ...demoAllocationMatrix.invoices[0], reference: '' }] }],
  ] satisfies [string, AllocationMatrixData][])('rejects %s without crashing or claiming a supported allocation', (_, data) => {
    render(<AllocationMatrix data={data} />);
    expect(screen.getByText('Check input data')).toBeVisible();
    expect(screen.queryByText('Allocation balanced')).not.toBeInTheDocument();
    expect(screen.queryByText(/Evidence supported in sample/)).not.toBeInTheDocument();
  });

  it('does not confuse equality with supporting evidence', () => {
    const data = { ...demoAllocationMatrix, invoices: demoAllocationMatrix.invoices.map(invoice => ({ ...invoice, evidenceConfirmed: false })) };
    expect(summarizeAllocationMatrix(data)).toMatchObject({ balanced: true, evidenceReady: false });
    render(<AllocationMatrix data={data} />);
    expect(screen.getByText('Evidence pending')).toBeVisible();
    expect(screen.getByText(/Human review required/)).toBeVisible();
  });

  it('requires customer and bank identity before the allocation is supported', () => {
    render(<AllocationMatrix data={{ ...demoAllocationMatrix, customerId: '', statementReference: '' }} />);
    expect(screen.getByText('Evidence pending')).toBeVisible();
    expect(screen.queryByText(/Evidence supported in sample/)).not.toBeInTheDocument();
  });

  it('detects per-invoice variance even if cash totals equal the bank receipt', () => {
    const data = { ...demoAllocationMatrix, invoices: demoAllocationMatrix.invoices.map((invoice, index) => ({ ...invoice, taxMinor: invoice.taxMinor + (index === 0 ? 100 : index === 1 ? -100 : 0) })) };
    render(<AllocationMatrix data={data} />);
    expect(screen.getByText('Allocation differs')).toBeVisible();
    expect(screen.queryByText('Allocation balanced')).not.toBeInTheDocument();
  });
});
