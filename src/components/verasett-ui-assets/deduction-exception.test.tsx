import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DeductionBreakdownScreen } from './DeductionBreakdownScreen';
import { ExceptionReviewScreen } from './ExceptionReviewScreen';
import { demoDeductionClaims, demoReviewExceptions } from './deduction-exception-data';

describe('deduction treatment screen', () => {
  it('requires real invoice references and never totals unknown claims as zero',()=>{
    const {rerender}=render(<DeductionBreakdownScreen claims={[{...demoDeductionClaims[0],invoiceReferences:['']}]} />);
    expect(screen.getByText('Unverified claim',{exact:true})).toBeVisible();
    expect(screen.queryByText('Supported in sample',{exact:true})).not.toBeInTheDocument();
    rerender(<DeductionBreakdownScreen claims={[{...demoDeductionClaims[0],amountMinor:NaN}]} />);
    expect(screen.getByText('Unavailable')).toBeVisible();
    expect(screen.getAllByText('Invalid claim amount')).toHaveLength(2);
  });
  it('separates the exact supported and held claim totals', () => {
    render(<DeductionBreakdownScreen />);
    expect(screen.getByRole('table').querySelectorAll('tbody tr')).toHaveLength(5);
    expect(screen.getByText('₹20,000')).toBeVisible();
    expect(screen.getByText('₹40,000')).toBeVisible();
    expect(screen.getByRole('region', { name: 'Selected deduction' })).toHaveTextContent('REM-DEMO-041');
    expect(screen.getByText('Controller review pending')).toBeVisible();
  });
  it('inspects a pending claim without showing an approved or closed outcome', () => {
    render(<DeductionBreakdownScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Inspect Short payment claim' }));
    const detail = screen.getByRole('region', { name: 'Selected deduction' });
    expect(detail).toHaveTextContent('PAY-DEMO-0432');
    expect(detail).toHaveTextContent('Unverified claim');
    expect(detail).toHaveTextContent('No evidence attached');
    expect(detail).toHaveTextContent('No adjustment proposed');
    expect(detail).toHaveTextContent('does not close an invoice');
    expect(within(detail).queryByText('Verified in sample')).not.toBeInTheDocument();
  });
  it('holds evidence flags lacking a reference or valid amount', () => {
    render(<DeductionBreakdownScreen claims={[{ ...demoDeductionClaims[0], evidenceReference: undefined, amountMinor: NaN }]} />);
    expect(screen.getByRole('region', { name: 'Selected deduction' })).toHaveTextContent('Unverified claim');
    expect(screen.getAllByText('Invalid claim amount')).toHaveLength(2);
  });
  it('uses exact integer totals beyond Number.MAX_SAFE_INTEGER', () => {
    render(<DeductionBreakdownScreen claims={[{ ...demoDeductionClaims[0], amountMinor: Number.MAX_SAFE_INTEGER }, { ...demoDeductionClaims[1], amountMinor: 2 }]} />);
    expect(screen.getByText('₹9,00,71,99,25,47,409.93')).toBeVisible();
  });
  it('handles replacement and empty claim datasets', () => {
    const { rerender } = render(<DeductionBreakdownScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Inspect Withholding tax claim' }));
    rerender(<DeductionBreakdownScreen claims={[demoDeductionClaims[0]]} />);
    expect(screen.getByRole('region', { name: 'Selected deduction' })).toHaveTextContent('TDS-DEMO-01');
    rerender(<DeductionBreakdownScreen claims={[]} />);
    expect(screen.getByText('No deduction claims to inspect')).toBeVisible();
    expect(screen.queryByRole('region', { name: 'Selected deduction' })).not.toBeInTheDocument();
  });
});

describe('exception review screen', () => {
  it('shows the exact receipt-to-candidate variance with an explicit unverified claim', () => {
    render(<ExceptionReviewScreen />);
    const detail = screen.getByRole('region', { name: 'Selected exception' });
    expect(detail).toHaveTextContent('PAY-DEMO-0432');
    expect(detail).toHaveTextContent('-₹25,000');
    expect(detail).toHaveTextContent('Claimed deduction · unverified');
    expect(detail).toHaveTextContent('Not applied');
  });
  it('selects another exception and expands only its local evidence', () => {
    render(<ExceptionReviewScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Inspect PAY-DEMO-0217' }));
    expect(screen.getByRole('button', { name: 'Inspect PAY-DEMO-0217' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('region', { name: 'Selected exception' })).toHaveTextContent('-₹15,000');
    const evidence = screen.getByRole('button', { name: 'Inspect evidence' });
    fireEvent.click(evidence);
    expect(evidence).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Two possible bundles; neither selected')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Hide evidence' }));
    expect(screen.getByText('Two possible bundles; neither selected')).not.toBeVisible();
  });
  it('does not invent zero variance when invoice references are incomplete', () => {
    render(<ExceptionReviewScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Inspect PAY-DEMO-0680' }));
    const detail = screen.getByRole('region', { name: 'Selected exception' });
    expect(detail).toHaveTextContent('Not established');
    expect(detail).toHaveTextContent('Cannot calculate yet');
    expect(detail).not.toHaveTextContent('₹0');
    expect(screen.queryByRole('button', { name: /approve/i })).not.toBeInTheDocument();
  });
  it('handles exact paise and invalid candidate data safely', () => {
    const { rerender } = render(<ExceptionReviewScreen exceptions={[{ ...demoReviewExceptions[0], receivedMinor: 10001, candidateMinor: 10002 }]} />);
    expect(screen.getByText('-₹0.01')).toBeVisible();
    rerender(<ExceptionReviewScreen exceptions={[{ ...demoReviewExceptions[0], candidateMinor: NaN }]} />);
    expect(screen.getByText('Cannot calculate yet')).toBeVisible();
  });
  it('falls back on replacement data and supports an empty queue', () => {
    const { rerender } = render(<ExceptionReviewScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Inspect PAY-DEMO-0217' }));
    rerender(<ExceptionReviewScreen exceptions={[demoReviewExceptions[0]]} />);
    expect(screen.getByRole('region', { name: 'Selected exception' })).toHaveTextContent('PAY-DEMO-0432');
    rerender(<ExceptionReviewScreen exceptions={[]} />);
    expect(screen.getByText('No exceptions to review')).toBeVisible();
  });
});
