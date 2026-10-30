import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReconciliationProofSheet } from './ReconciliationProofSheet';
import { demoReconciliationProof, type ReconciliationProofData } from './reconciliation-proof-data';

describe('ReconciliationProofSheet', () => {
  it('renders an accounting working paper with the exact invoice-less-adjustments equation', () => {
    render(<ReconciliationProofSheet />);
    const proof = screen.getByRole('region', { name: 'Exact reconciliation equation' });
    expect(within(proof).getByText('₹18,60,000')).toBeVisible();
    expect(within(proof).getByText('₹20,000')).toBeVisible();
    expect(within(proof).getAllByText('₹18,40,000')).toHaveLength(2);
    expect(within(proof).getByText('₹0')).toBeVisible();
    expect(screen.getByText('Arithmetic balanced')).toBeVisible();
    expect(screen.getByText('3 of 3 checks supported')).toBeVisible();
    expect(screen.getByText('Approval pending')).toBeVisible();
    expect(screen.getByText('Illustrative data')).toBeVisible();
  });

  it('keeps evidence available through native disclosures', () => {
    render(<ReconciliationProofSheet />);
    const evidence = screen.getAllByText('Inspect evidence');
    expect(evidence).toHaveLength(3);
    fireEvent.click(evidence[1]);
    expect(evidence[1].closest('details')).toHaveAttribute('open');
    expect(screen.getByText('INV-DEMO-1042 — ₹8,00,000')).toBeVisible();
  });

  it('requires explicit acknowledgement and records a local review without approving or posting', () => {
    const onReviewNoted = vi.fn();
    render(<ReconciliationProofSheet onReviewNoted={onReviewNoted} />);
    const button = screen.getByRole('button', { name: 'Mark reviewed locally' });
    expect(button).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox', { name: 'I have inspected the sample evidence.' }));
    expect(button).toBeEnabled();
    fireEvent.click(button);
    expect(onReviewNoted).toHaveBeenCalledWith('PAY-DEMO-1840');
    expect(screen.getByText('Review noted locally')).toBeVisible();
    expect(screen.getByText('Approval pending')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Reset local review' }));
    expect(screen.getByRole('button', { name: 'Mark reviewed locally' })).toBeDisabled();
  });

  it('does not carry a local review into changed evidence or customer data', () => {
    const { rerender } = render(<ReconciliationProofSheet />);
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Mark reviewed locally' }));
    rerender(<ReconciliationProofSheet data={{ ...demoReconciliationProof, match: { ...demoReconciliationProof.match, customer: 'Another fictional customer' } }} />);
    expect(screen.getByText('Awaiting controller review')).toBeVisible();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Mark reviewed locally' })).toBeDisabled();
    rerender(<ReconciliationProofSheet />);
    expect(screen.getByText('Awaiting controller review')).toBeVisible();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it.each([
    ['empty invoices', { ...demoReconciliationProof, match: { ...demoReconciliationProof.match, invoices: [] } }],
    ['noninteger receipt', { ...demoReconciliationProof, match: { ...demoReconciliationProof.match, receivedMinor: 1.5 } }],
    ['nonfinite invoice', { ...demoReconciliationProof, match: { ...demoReconciliationProof.match, invoices: [{ reference: 'INVALID-DEMO-1', amountMinor: Infinity }] } }],
    ['duplicate invoices', { ...demoReconciliationProof, match: { ...demoReconciliationProof.match, invoices: [demoReconciliationProof.match.invoices[0], demoReconciliationProof.match.invoices[0]] } }],
  ] satisfies [string, ReconciliationProofData][])('blocks local review for %s', (_, data) => {
    render(<ReconciliationProofSheet data={data} />);
    expect(screen.getByText('Check input data')).toBeVisible();
    expect(screen.getByRole('checkbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Mark reviewed locally' })).toBeDisabled();
    expect(screen.queryByText('Arithmetic balanced')).not.toBeInTheDocument();
  });

  it('separates missing evidence from an arithmetically balanced proposal', () => {
    render(<ReconciliationProofSheet data={{ ...demoReconciliationProof, match: { ...demoReconciliationProof.match, evidence: [] } }} />);
    expect(screen.getByText('Arithmetic balanced')).toBeVisible();
    expect(screen.getByText('0 of 3 checks supported')).toBeVisible();
    expect(screen.queryByText('Supported in sample', { exact: true })).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeDisabled();
    expect(screen.getByText('Resolve the amount, source or evidence checks first.')).toBeVisible();
  });

  it('rejects duplicate and empty supporting evidence references for every evidence check', () => {
    const evidence = [{ ...demoReconciliationProof.match.evidence[0], reference: ' ' }, { ...demoReconciliationProof.match.evidence[0], reference: ' ' }];
    render(<ReconciliationProofSheet data={{ ...demoReconciliationProof, match: { ...demoReconciliationProof.match, evidence } }} />);
    expect(screen.getByText('0 of 3 checks supported')).toBeVisible();
    expect(screen.queryByText('Supported in sample', { exact: true })).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('requires bank/document references and deduction support', () => {
    const data = { ...demoReconciliationProof, bankReference: '', documentReference: '', match: { ...demoReconciliationProof.match, deductions: demoReconciliationProof.match.deductions.map(item => ({ ...item, verified: false })) } };
    render(<ReconciliationProofSheet data={data} />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
    expect(screen.getAllByText('Review required').length).toBeGreaterThan(0);
  });

  it('shows nonzero variance and holds the receipt', () => {
    render(<ReconciliationProofSheet data={{ ...demoReconciliationProof, match: { ...demoReconciliationProof.match, receivedMinor: 183999900 } }} />);
    expect(screen.getByText('Amount variance')).toBeVisible();
    expect(screen.getByText('-₹1')).toBeVisible();
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });
});
