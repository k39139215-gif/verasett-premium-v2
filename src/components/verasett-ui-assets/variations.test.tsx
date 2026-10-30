import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PaymentLedger } from './PaymentLedger';
import { PaymentReviewQueue } from './PaymentReviewQueue';
import { PaymentAllocationView } from './PaymentAllocationView';
import { demoIncomingPayments, demoMatch } from './sample-data';
import { demoReviewPayments } from './variation-data';

describe('additional reconciliation variations', () => {
  it('renders the compact ledger with four records and exact totals', () => {
    render(<PaymentLedger />);
    expect(screen.getByRole('table').querySelectorAll('tbody tr')).toHaveLength(4);
    expect(screen.getByText('$41,440.00')).toBeVisible();
    expect(screen.getByText('Acme Distribution')).toBeVisible();
    expect(screen.getByText('Illustrative bank records')).toBeVisible();
  });
  it('searches the ledger and exports only the visible fictional records', () => {
    const onExport = vi.fn();
    render(<PaymentLedger onExport={onExport} />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Westline' } });
    expect(screen.getByRole('table').querySelectorAll('tbody tr')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Export demo CSV' }));
    expect(onExport).toHaveBeenCalledWith([demoIncomingPayments[2]]);
  });
  it('handles empty and unmatched ledger searches', () => {
    const { rerender } = render(<PaymentLedger />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'unseen' } });
    expect(screen.getByText('No payments match your search')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Export demo CSV' })).toBeDisabled();
    rerender(<PaymentLedger payments={[]} />);
    expect(screen.getByText('No incoming payments')).toBeVisible();
  });
  it('keeps ledger totals exact above the safe-number boundary', () => {
    render(<PaymentLedger payments={[{ ...demoIncomingPayments[0], amountMinor: Number.MAX_SAFE_INTEGER }, { ...demoIncomingPayments[1], amountMinor: 2 }]} />);
    expect(screen.getByText('$90,071,992,547,409.93')).toBeVisible();
  });
  it('shows the selected exception and explicitly unverified deduction', () => {
    render(<PaymentReviewQueue />);
    expect(screen.getByRole('region', { name: 'Selected exception' })).toHaveTextContent('ACH-55231');
    expect(screen.getByText('-$250.00')).toBeVisible();
    expect(screen.getByText('Claimed deduction · unverified')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Review match' })).toBeDisabled();
  });
  it('changes the selected exception and forwards only its reference', () => {
    const onReview = vi.fn();
    render(<PaymentReviewQueue onReview={onReview} />);
    fireEvent.click(screen.getByRole('button', { name: 'Inspect ACH-66204' }));
    expect(screen.getByText('-$150.00')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Inspect ACH-66204' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Review match' }));
    expect(onReview).toHaveBeenCalledWith('ACH-66204');
  });
  it('does not invent a difference when open invoice amounts are unknown', () => {
    render(<PaymentReviewQueue />);
    fireEvent.click(screen.getByRole('button', { name: 'Inspect WIRE-88019' }));
    expect(screen.getByText('Amount not established')).toBeVisible();
    expect(screen.queryByText('-$250.00')).not.toBeInTheDocument();
  });
  it('handles empty and replaced review datasets without stale selection', () => {
    const { rerender } = render(<PaymentReviewQueue />);
    fireEvent.click(screen.getByRole('button', { name: 'Inspect ACH-66204' }));
    rerender(<PaymentReviewQueue payments={[demoReviewPayments[0]]} />);
    expect(screen.getByRole('region', { name: 'Selected exception' })).toHaveTextContent('ACH-55231');
    rerender(<PaymentReviewQueue payments={[]} />);
    expect(screen.getByText('No exceptions to review')).toBeVisible();
  });
  it('shows three exact invoice allocations and a zero difference', () => {
    render(<PaymentAllocationView />);
    expect(screen.getByRole('table').querySelectorAll('tbody tr')).toHaveLength(3);
    expect(screen.getByText('Matched', { exact: true })).toBeVisible();
    expect(screen.getByText('$0.00')).toBeVisible();
    expect(screen.getByText('Ready for review · Not posted')).toBeVisible();
    expect(screen.getByText('Illustrative allocation')).toBeVisible();
  });
  it('requires review for an imbalanced allocation', () => {
    render(<PaymentAllocationView match={{ ...demoMatch, amountMinor: 1244000 }} />);
    expect(screen.getByText('Needs review', { exact: true })).toBeVisible();
    expect(screen.getByText('-$10.00')).toBeVisible();
    expect(screen.queryByText('Ready for review · Not posted')).not.toBeInTheDocument();
  });
  it('rejects duplicate and invalid invoice allocations without false success', () => {
    const { rerender } = render(<PaymentAllocationView match={{ ...demoMatch, invoices: [demoMatch.invoices[0], demoMatch.invoices[0]] }} />);
    expect(screen.getByText('Needs review', { exact: true })).toBeVisible();
    rerender(<PaymentAllocationView match={{ ...demoMatch, invoices: [{ reference: 'INV-X', amountMinor: NaN }] }} />);
    expect(screen.getByText('Check allocation data')).toBeVisible();
    expect(within(screen.getByRole('table')).getByText('Invalid amount')).toBeVisible();
  });
  it('shows an explicit state when no candidate invoices are supplied', () => {
    render(<PaymentAllocationView match={{ ...demoMatch, invoices: [] }} />);
    expect(screen.getByText('No candidate invoices')).toBeVisible();
    expect(screen.getByText('Needs review', { exact: true })).toBeVisible();
  });
});
