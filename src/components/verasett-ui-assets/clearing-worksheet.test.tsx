import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ClearingWorksheet } from './ClearingWorksheet';
import { demoClearingWorksheetLines } from './clearing-worksheet-data';
import type { ClearingWorksheetLine } from './clearing-worksheet-data';

describe('clearing worksheet design', () => {
  it('separates receipt, adjustment and AR columns with exact totals', () => {
    render(<ClearingWorksheet />);
    const table = screen.getByRole('table');
    expect(table.querySelectorAll('tbody tr')).toHaveLength(7);
    const total = within(table.querySelector('tfoot')!);
    expect(total.getByText('₹18,40,000')).toBeVisible();
    expect(total.getByText('₹20,000')).toBeVisible();
    expect(total.getByText('₹18,60,000')).toBeVisible();
    expect(screen.getByText('Arithmetic balanced')).toBeVisible();
    expect(screen.getByText('Approval pending')).toBeVisible();
    expect(screen.getByText('No export · Not posted')).toBeVisible();
    expect(screen.queryByRole('button', { name: /approve|export/i })).not.toBeInTheDocument();
  });

  it('toggles source line references without changing approval', () => {
    render(<ClearingWorksheet />);
    expect(screen.queryByText('DEMO-L001 · BANK-DEMO-011 / row 1')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Show line references' }));
    expect(screen.getByText('DEMO-L001 · BANK-DEMO-011 / row 1')).toBeVisible();
    expect(screen.getByText('Approval pending')).toBeVisible();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Show line references' }));
    expect(screen.queryByText('DEMO-L001 · BANK-DEMO-011 / row 1')).not.toBeInTheDocument();
  });

  it('does not imply balance when values are invalid, missing or inconsistent', () => {
    const { rerender } = render(<ClearingWorksheet lines={[]} />);
    expect(screen.getByText('No clearing lines supplied')).toBeVisible();
    expect(screen.queryByText('Arithmetic balanced')).not.toBeInTheDocument();
    rerender(<ClearingWorksheet lines={demoClearingWorksheetLines.map((line, index) => index === 0 ? { ...line, amountMinor: NaN } : line)} />);
    expect(screen.getByText('Invalid amount')).toBeVisible();
    expect(screen.getByText('Check worksheet data')).toBeVisible();
    rerender(<ClearingWorksheet lines={demoClearingWorksheetLines.map((line, index) => index === 0 ? { ...line, amountMinor: line.amountMinor - 100 } : line)} />);
    expect(screen.getByText('-₹1')).toBeVisible();
    expect(screen.getByText('The proposed entry is out of balance.')).toBeVisible();
  });

  it('checks receipt attribution and duplicate allocation references', () => {
    const { rerender } = render(<ClearingWorksheet paymentReference="PAY-OTHER" />);
    expect(screen.getByText('Check worksheet data')).toBeVisible();
    rerender(<ClearingWorksheet lines={demoClearingWorksheetLines.map((line, index) => index === 6 ? { ...line, reference: demoClearingWorksheetLines[5].reference } : line)} />);
    expect(screen.getByText('Check worksheet data')).toBeVisible();
    expect(screen.queryByText('Arithmetic balanced')).not.toBeInTheDocument();
  });

  it('does not ignore a runtime line with an unknown accounting side', () => {
    const unknown = { id: 'UNKNOWN-LINE', reference: 'UNKNOWN-REF', treatment: 'Unsupported line', side: 'unknown', amountMinor: 10000, evidenceReference: 'EVID-UNKNOWN' } as unknown as ClearingWorksheetLine;
    render(<ClearingWorksheet lines={[...demoClearingWorksheetLines, unknown]} />);
    expect(screen.getByText('Check worksheet data')).toBeVisible();
    expect(screen.queryByText('Arithmetic balanced')).not.toBeInTheDocument();
  });

  it('keeps changed customer display independent of approval or attribution claims', () => {
    render(<ClearingWorksheet customer="Different illustrative entity" customerReference="CUST-OTHER" />);
    expect(screen.getByText('Different illustrative entity')).toBeVisible();
    expect(screen.getByText('Approval pending')).toBeVisible();
    expect(screen.getByText('Balance is a check, not an approval.')).toBeVisible();
    expect(screen.queryByText(/identity confirmed|attribution confirmed|eligible in sample/i)).not.toBeInTheDocument();
  });
});
