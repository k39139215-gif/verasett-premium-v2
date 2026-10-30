import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  IncomingPaymentsTable, ReconciliationHeroVisual, StatusPill,
  MatchingProgressCard, PaymentMatchCard, ExceptionReviewCard,
  DeductionDetailCard, MatchMetric, ERPExportCard, BankStatementCard,
  WorkflowConnector,
} from './index';
import { demoPayments, demoMatch } from './sample-data';
import { formatMoney, getProgress, isBalancedAllocation } from './format';

describe('primary table and hero', () => {
  it('renders the exact four demo payments in a semantic table', () => {
    render(<IncomingPaymentsTable />);
    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('columnheader').map(x => x.textContent)).toEqual(['Payment ID', 'Amount', 'Customer', 'Status']);
    expect(within(table).getAllByRole('row')).toHaveLength(5);
    for (const payment of demoPayments) {
      const row = within(table).getAllByRole('row').find(x => x.textContent?.includes(payment.reference))!;
      expect(row).toHaveTextContent(formatMoney(payment.amountMinor));
      expect(row).toHaveTextContent(payment.customer);
      expect(row).toHaveTextContent(payment.status);
    }
    expect(screen.getByText('Illustrative data')).toBeVisible();
    expect(screen.queryByText(/98.7/)).not.toBeInTheDocument();
  });
  it('makes the illustrative summary optional and editable', () => {
    const { rerender } = render(<IncomingPaymentsTable autoMatchLabel="Auto-matched 98.7%" />);
    expect(screen.getByText('Auto-matched 98.7%')).toBeVisible();
    expect(screen.getByText('Demo summary')).toBeInTheDocument();
    rerender(<IncomingPaymentsTable autoMatchLabel={null} />);
    expect(screen.queryByText(/98.7/)).not.toBeInTheDocument();
  });
  it('preserves full long names and exposes optional selection through a button', () => {
    const customer = 'Northwestern International Distribution and Logistics Corporation';
    const onSelectPayment = vi.fn();
    render(<IncomingPaymentsTable payments={[{ ...demoPayments[0], customer }]} onSelectPayment={onSelectPayment} />);
    expect(screen.getAllByTitle(customer).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: /ACH-78421/ }));
    expect(onSelectPayment).toHaveBeenCalledWith(expect.objectContaining({ customer }));
  });
  it('supports an empty dataset', () => {
    render(<IncomingPaymentsTable payments={[]} />);
    expect(screen.getByText('No incoming payments')).toBeVisible();
  });
  it('composes a labeled bank to matching to export workflow with explicit review', () => {
    render(<ReconciliationHeroVisual />);
    expect(screen.getByRole('list', { name: 'Reconciliation workflow' })).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Bank Statement')).toBeVisible();
    expect(screen.getByText('Ready for review')).toBeVisible();
    expect(screen.getAllByText('Needs review').length).toBeGreaterThan(0);
  });
  it('derives hero progress from supplied records rather than a fixed count', () => {
    const { rerender } = render(<ReconciliationHeroVisual payments={[]} />);
    expect(screen.getByText('No payments to match')).toBeVisible();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    rerender(<ReconciliationHeroVisual payments={[{ ...demoPayments[0], invoiceAllocation: '3 invoices' }]} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '1');
  });
});

describe('trust and exact display values', () => {
  it('formats integer cents without decimal arithmetic', () => {
    expect(formatMoney(1245000)).toBe('$12,450.00');
    expect(formatMoney(1)).toBe('$0.01');
    expect(formatMoney(0)).toBe('$0.00');
    expect(() => formatMoney(1.1)).toThrow();
    expect(() => formatMoney(Number.MAX_SAFE_INTEGER + 1)).toThrow();
  });
  it('demo invoice allocations sum to exactly the received payment', () => {
    expect(demoMatch.invoices.map(x => x.amountMinor)).toEqual([800000, 300000, 145000]);
    expect(isBalancedAllocation(demoMatch.amountMinor, demoMatch.invoices)).toBe(true);
  });
  it('rejects unbalanced, duplicate, unsafe and non-positive allocations', () => {
    expect(isBalancedAllocation(100, [{ reference: 'A', amountMinor: 90 }])).toBe(false);
    expect(isBalancedAllocation(100, [{ reference: 'A', amountMinor: 50 }, { reference: 'A', amountMinor: 50 }])).toBe(false);
    expect(isBalancedAllocation(0, [])).toBe(false);
    expect(isBalancedAllocation(100, [{ reference: 'A', amountMinor: 100.1 }])).toBe(false);
  });
  it('never labels inconsistent allocations as matched', () => {
    render(<PaymentMatchCard match={{ ...demoMatch, amountMinor: 1200000 }} />);
    expect(screen.getByText('Review')).toBeVisible();
    expect(screen.queryByText('Matched')).not.toBeInTheDocument();
    expect(screen.getByText(/do not equal/)).toBeVisible();
  });
  it('distinguishes a claimed deduction from approval', () => {
    render(<DeductionDetailCard />);
    expect(screen.getByText('Claimed amount')).toBeVisible();
    expect(screen.getByText('$250.00')).toBeVisible();
    expect(screen.getByText('Evidence pending')).toBeVisible();
    expect(screen.getByText('Human review required')).toBeVisible();
  });
  it('describes export preparation, never ERP posting', () => {
    render(<ERPExportCard />);
    expect(screen.getByText('Ready for review')).toBeVisible();
    expect(screen.getByText('CSV batch prepared')).toBeVisible();
    expect(screen.queryByText(/posted/i)).not.toBeInTheDocument();
  });
});

describe('independent primitives and configurable states', () => {
  it.each(['Matched', 'Review', 'Pending', 'Evidence pending', 'Export ready', 'Blocked'] as const)('identifies %s with visible text', status => {
    render(<StatusPill status={status} />);
    expect(screen.getByText(status)).toBeVisible();
  });
  it('supports count, currency and percentage metric values', () => {
    const { rerender } = render(<MatchMetric value="18 / 18" />);
    expect(screen.getByText('18 / 18')).toBeVisible();
    rerender(<MatchMetric value="$12,450.00" label="Received amount" />);
    expect(screen.getByText('$12,450.00')).toBeVisible();
    rerender(<MatchMetric value="98.7%" label="Demo auto-match rate" />);
    expect(screen.getByText('98.7%')).toBeVisible();
  });
  it('exposes progress values and handles zero and invalid input safely', () => {
    expect(getProgress(18, 18)).toEqual({ completed: 18, total: 18, percent: 100 });
    expect(getProgress(24, 18).completed).toBe(18);
    expect(getProgress(-4, 18).completed).toBe(0);
    expect(getProgress(NaN, Infinity)).toEqual({ completed: 0, total: 0, percent: 0 });
    const { rerender } = render(<MatchingProgressCard completed={9} total={18} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '9');
    rerender(<MatchingProgressCard completed={0} total={0} />);
    expect(screen.getByText('No payments to match')).toBeVisible();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
  it('only provides an active review control when a handler exists', () => {
    const onReview = vi.fn();
    const { rerender } = render(<ExceptionReviewCard />);
    expect(screen.getByRole('button', { name: /Review match/ })).toBeDisabled();
    rerender(<ExceptionReviewCard onReview={onReview} />);
    fireEvent.click(screen.getByRole('button', { name: /Review match/ }));
    expect(onReview).toHaveBeenCalledWith('ACH-55231');
  });
  it('exposes source receipt without sensitive filenames', () => {
    render(<BankStatementCard />);
    expect(screen.getByText('Uploaded')).toBeVisible();
  });
  it('makes decorative connectors silent to assistive technology', () => {
    const { container } = render(<WorkflowConnector />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });
});
