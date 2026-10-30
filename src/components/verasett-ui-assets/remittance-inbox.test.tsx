import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RemittanceInbox } from './RemittanceInbox';
import { demoRemittanceDocuments } from './remittance-inbox-data';

describe('RemittanceInbox', () => {
  it('shows a source list and a traceable document reading pane', () => {
    render(<RemittanceInbox />);
    expect(screen.getByRole('heading', { name: 'Remittance inbox' })).toBeVisible();
    expect(within(screen.getByRole('navigation', { name: 'Remittance documents' })).getAllByRole('button')).toHaveLength(3);
    const document = screen.getByRole('table').closest('article')!;
    expect(document).toHaveAccessibleName();
    expect(within(document).getByText('PAY-DEMO-1840')).toBeVisible();
    expect(within(document).getAllByText('Reference located')).toHaveLength(3);
    expect(within(document).getByText('Page 1 · line 4')).toBeVisible();
    expect(screen.getByText('Document references available')).toBeVisible();
    expect(screen.getByText('Evidence reading ≠ approval')).toBeVisible();
  });
  it('keeps the fictional primary document arithmetic exact in integer paise', () => {
    const document = demoRemittanceDocuments[0];
    const face = document.lines.reduce((sum, line) => sum + BigInt(line.faceMinor), 0n);
    const adjustments = document.adjustments.reduce((sum, adjustment) => sum + BigInt(adjustment.amountMinor), 0n);
    expect(face - adjustments).toBe(BigInt(document.receivedMinor));
  });
  it('selects advice locally and distinguishes unsupported claims', () => {
    const onDocumentSelect = vi.fn();
    render(<RemittanceInbox onDocumentSelect={onDocumentSelect} />);
    const next = screen.getByRole('button', { name: /REM-DEMO-042/ });
    fireEvent.click(next);
    expect(next).toHaveAttribute('aria-pressed', 'true');
    expect(onDocumentSelect).toHaveBeenCalledWith('REM-DEMO-042');
    expect(screen.getByText('Claimed short payment')).toBeVisible();
    expect(screen.getByText('Evidence pending')).toBeVisible();
    expect(screen.getByText('Further evidence required')).toBeVisible();
    expect(screen.getByText(/does not authorize an adjustment or close an invoice/)).toBeVisible();
  });
  it('supports initial selection and missing invoice references', () => {
    render(<RemittanceInbox initialDocumentId="REM-DEMO-044" />);
    expect(screen.getByRole('button', { name: /REM-DEMO-044/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('No invoice references supplied. Allocation remains unresolved.')).toBeVisible();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
  it('renders an honest empty state and fallback for an unavailable initial ID', () => {
    const { unmount } = render(<RemittanceInbox documents={[]} />);
    expect(screen.getByRole('status')).toHaveTextContent('No remittance documents');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    unmount();
    render(<RemittanceInbox initialDocumentId="MISSING" />);
    expect(screen.getByRole('button', { name: /REM-DEMO-041/ })).toHaveAttribute('aria-pressed', 'true');
  });
  it('does not imply ready evidence for invalid amounts or missing references', () => {
    render(<RemittanceInbox documents={[{ ...demoRemittanceDocuments[0], id: '', paymentReference: '', receivedMinor: NaN, lines: [{ reference: '', faceMinor: Infinity, sourceLocation: '', evidence: 'located' }] }]} />);
    expect(screen.getAllByText('Amount unavailable')).toHaveLength(3);
    expect(screen.getByText('Missing payment reference')).toBeVisible();
    expect(screen.getByText('Reference incomplete')).toBeVisible();
    expect(screen.getByText('Further evidence required')).toBeVisible();
    expect(screen.queryByText('Document references available')).not.toBeInTheDocument();
  });
  it('rejects duplicate invoice references as complete document evidence', () => {
    render(<RemittanceInbox documents={[{ ...demoRemittanceDocuments[0], lines: [demoRemittanceDocuments[0].lines[0], demoRemittanceDocuments[0].lines[0]] }]} />);
    expect(screen.getByText('Further evidence required')).toBeVisible();
  });
  it('retains long source identities as text instead of truncating data', () => {
    const customer = 'Illustrative customer with a deliberately long legal entity name and regional division';
    render(<RemittanceInbox documents={[{ ...demoRemittanceDocuments[0], customer }]} />);
    expect(screen.getAllByText(customer)).toHaveLength(2);
  });
});
