import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ControllerApprovalScreen } from './ControllerApprovalScreen';
import { PaymentMatchDetailScreen } from './PaymentMatchDetailScreen';
import { demoProductMatch, type ProductMatch } from './product-data';
import { formatINR, summarizeMatch } from './product-format';

function confirmReview() {
  fireEvent.click(screen.getByRole('checkbox', { name: 'I checked the customer and invoice evidence' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'I reviewed the allocation and deduction treatment' }));
}

describe('payment match detail and controller approval', () => {
  it('shows the exact INR invariant and keeps attribution separate', () => {
    render(<PaymentMatchDetailScreen />);
    const summary = summarizeMatch(demoProductMatch);
    expect(summary.face).toBe(186000000n);
    expect(summary.deductions).toBe(2000000n);
    expect(summary.net).toBe(184000000n);
    expect(summary.variance).toBe(0n);
    expect(screen.getByRole('table', { name: 'Selected invoice face values' }).querySelectorAll('tbody tr')).toHaveLength(3);
    expect(screen.getByRole('table', { name: 'Deduction and adjustment breakdown' }).querySelectorAll('tbody tr')).toHaveLength(3);
    expect(screen.getByText('Attribution and eligibility')).toBeVisible();
    expect(screen.getByText('Arithmetic equality does not establish customer or invoice attribution.')).toBeVisible();
    expect(screen.getByText('Proposed match', { exact: true })).toBeVisible();
  });

  it('starts pending and requires both explicit review confirmations', () => {
    render(<ControllerApprovalScreen />);
    const approve = screen.getByRole('button', { name: 'Approve' });
    expect(screen.getByText('Pending approval', { exact: true })).toBeVisible();
    expect(approve).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox', { name: 'I checked the customer and invoice evidence' }));
    expect(approve).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox', { name: 'I reviewed the allocation and deduction treatment' }));
    expect(approve).toBeEnabled();
    fireEvent.click(approve);
    expect(screen.getByText('Approved in preview', { exact: true })).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('Approval simulated locally. No export or ERP posting occurred.');
    expect(screen.getAllByRole('checkbox').every(input => input.hasAttribute('disabled'))).toBe(true);
  });

  it('simulates a hold and resets only when requested', () => {
    render(<ControllerApprovalScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Hold for Review' }));
    expect(screen.getByText('Held for review', { exact: true })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Reset preview' }));
    expect(screen.getByText('Pending approval', { exact: true })).toBeVisible();
    expect(screen.getAllByRole('checkbox').every(input => !(input as HTMLInputElement).checked)).toBe(true);
  });

  it.each([
    ['wrong customer', { ...demoProductMatch, eligibility: { ...demoProductMatch.eligibility, customerConfirmed: false } }],
    ['unconfirmed invoices', { ...demoProductMatch, eligibility: { ...demoProductMatch.eligibility, invoiceReferencesConfirmed: false } }],
    ['closed invoices', { ...demoProductMatch, eligibility: { ...demoProductMatch.eligibility, invoicesOpen: false } }],
    ['unverified deduction', { ...demoProductMatch, deductions: demoProductMatch.deductions.map((item, index) => ({ ...item, verified: index !== 0 })) }],
    ['missing evidence', { ...demoProductMatch, evidence: [] }],
  ] satisfies [string, ProductMatch][])('blocks a balanced proposal with %s', (_, match) => {
    render(<ControllerApprovalScreen match={match} />);
    expect(summarizeMatch(match).variance).toBe(0n);
    confirmReview();
    expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
    expect(screen.getByText('Approval requirements not met')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Hold for Review' })).toBeEnabled();
  });

  it.each([
    ['fractional minor units', { ...demoProductMatch, receivedMinor: 184000000.5 }],
    ['negative invoice', { ...demoProductMatch, invoices: [{ reference: 'INV-NEGATIVE', amountMinor: -100 }] }],
    ['duplicate invoices', { ...demoProductMatch, invoices: [demoProductMatch.invoices[0], demoProductMatch.invoices[0]] }],
    ['duplicate deductions', { ...demoProductMatch, deductions: [demoProductMatch.deductions[0], demoProductMatch.deductions[0]] }],
    ['missing invoice bundle', { ...demoProductMatch, invoices: [] }],
  ] satisfies [string, ProductMatch][])('rejects invalid proposal data: %s', (_, match) => {
    render(<ControllerApprovalScreen match={match} />);
    confirmReview();
    expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
    expect(screen.getByText('Check input data')).toBeVisible();
  });

  it('shows nonzero variance without marking the match proposed', () => {
    render(<PaymentMatchDetailScreen match={{ ...demoProductMatch, receivedMinor: 183990000 }} />);
    expect(screen.getByText('Needs review', { exact: true })).toBeVisible();
    expect(screen.queryByText('Proposed match', { exact: true })).not.toBeInTheDocument();
    expect(screen.getByText(formatINR(-10000))).toBeVisible();
  });

  it('never carries approval into changed payment data', () => {
    const { rerender } = render(<ControllerApprovalScreen />);
    confirmReview();
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
    rerender(<ControllerApprovalScreen match={{ ...demoProductMatch, customer: 'Another illustrative billing entity' }} />);
    expect(screen.getByText('Pending approval', { exact: true })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
    expect(screen.getAllByRole('checkbox').every(input => !(input as HTMLInputElement).checked)).toBe(true);
  });

  it('preserves supplied evidence references and claimed deduction state', () => {
    const match = { ...demoProductMatch, deductions: demoProductMatch.deductions.map(item => ({ ...item, verified: false })) };
    render(<PaymentMatchDetailScreen match={match} />);
    const table = screen.getByRole('table', { name: 'Deduction and adjustment breakdown' });
    expect(within(table).getAllByText('Claimed · unverified')).toHaveLength(3);
    expect(screen.getByText('Evidence pending', { exact: true })).toBeVisible();
  });
});
