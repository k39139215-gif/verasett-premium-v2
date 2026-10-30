import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SettlementJournal } from './SettlementJournal';
import { demoSettlementJournalEntries } from './settlement-journal-data';

describe('settlement journal design', () => {
  it('shows four chronological receipts with exact total and explicit controls', () => {
    render(<SettlementJournal />);
    expect(screen.getAllByRole('button', { name: /evidence for/ })).toHaveLength(4);
    expect(screen.getByText('₹31,69,500')).toBeVisible();
    expect(screen.getByText('Proposed match')).toBeVisible();
    expect(screen.getAllByText('Needs review', { selector: '[data-state="review"]' })).toHaveLength(3);
    expect(screen.getByText('No approval or ERP posting occurs in this journal.')).toBeVisible();
    expect(demoSettlementJournalEntries.every((entry, index, rows) => !index || Date.parse(rows[index - 1].dateTime) < Date.parse(entry.dateTime))).toBe(true);
  });

  it('opens evidence inline and supports independent disclosures', () => {
    render(<SettlementJournal defaultExpandedIds={[]} />);
    const first = screen.getByRole('button', { name: 'Show evidence for PAY-DEMO-1840' });
    expect(first).toHaveAttribute('aria-expanded', 'false');
    const region = document.getElementById(first.getAttribute('aria-controls')!)!;
    expect(region).not.toBeVisible();
    fireEvent.click(first);
    expect(first).toHaveAttribute('aria-expanded', 'true');
    expect(region).toBeVisible();
    expect(within(region).getByText('REM-DEMO-041')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Show evidence for PAY-DEMO-0432' }));
    expect(first).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(first);
    expect(region).not.toBeVisible();
  });

  it('does not invent totals for invalid values and supports empty evidence', () => {
    render(<SettlementJournal entries={[{ ...demoSettlementJournalEntries[0], amountMinor: NaN, evidence: [] }]} />);
    expect(screen.getByText('Total unavailable')).toBeVisible();
    expect(screen.getByText('Invalid receipt amount')).toBeVisible();
    expect(screen.getByText('No supporting evidence supplied. The decision remains a display-only record.')).toBeVisible();
  });

  it('handles an empty journal without suggesting settlement completion', () => {
    render(<SettlementJournal entries={[]} />);
    expect(screen.getByText('No receipt decisions recorded')).toBeVisible();
    expect(screen.queryByText('Proposed match')).not.toBeInTheDocument();
  });

  it('uses exact integer arithmetic across large receipts', () => {
    render(<SettlementJournal entries={[
      { ...demoSettlementJournalEntries[0], amountMinor: Number.MAX_SAFE_INTEGER },
      { ...demoSettlementJournalEntries[1], amountMinor: 2 },
    ]} />);
    expect(screen.getByText('₹9,00,71,99,25,47,409.93')).toBeVisible();
  });

  it('rejects missing and duplicate receipt identifiers without coupling disclosures', () => {
    const first = demoSettlementJournalEntries[0];
    const { rerender } = render(<SettlementJournal entries={[{ ...first, id: '', paymentReference: '' }]} />);
    expect(screen.getByText('Data requires review')).toBeVisible();
    expect(screen.queryByText('Proposed match')).not.toBeInTheDocument();
    rerender(<SettlementJournal defaultExpandedIds={[]} entries={[first, { ...first, paymentReference: 'PAY-ANOTHER' }]} />);
    expect(screen.getAllByText('Data requires review')).toHaveLength(2);
    expect(screen.getByText('Total unavailable')).toBeVisible();
    const firstButton = screen.getByRole('button', { name: /evidence for PAY-DEMO-1840/ });
    const secondButton = screen.getByRole('button', { name: /evidence for PAY-ANOTHER/ });
    const initialSecond = secondButton.getAttribute('aria-expanded');
    fireEvent.click(firstButton);
    expect(secondButton).toHaveAttribute('aria-expanded', initialSecond);
    rerender(<SettlementJournal entries={[first, { ...first, id: 'ANOTHER-ID' }]} />);
    expect(screen.queryByText('Proposed match')).not.toBeInTheDocument();
    expect(screen.getAllByText('Data requires review')).toHaveLength(2);
  });
});
