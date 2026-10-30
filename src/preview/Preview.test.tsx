import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Preview } from './Preview';

describe('isolated asset preview', () => {
  it('provides composition, catalog and integration without website routes', () => {
    render(<Preview />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Reconciliation UI assets');
    expect(screen.getByRole('navigation', { name: 'Preview sections' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Individual assets' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Ready for your existing website' })).toBeVisible();
  });
  it('supports compact sizing and long-name stress mode', () => {
    render(<Preview />);
    fireEvent.click(within(screen.getByRole('group', { name: 'Preview width' })).getByRole('button', { name: 'Compact' }));
    expect(within(screen.getByRole('group', { name: 'Preview width' })).getByRole('button', { name: 'Compact' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('checkbox', { name: 'Long names' }));
    expect(screen.getAllByTitle('Northwestern International Distribution and Logistics Corporation').length).toBeGreaterThan(0);
  });
  it('opens a read-only review example rather than approving a transaction', () => {
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) { this.setAttribute('open', ''); });
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) { this.removeAttribute('open'); });
    render(<Preview />);
    fireEvent.click(screen.getAllByRole('button', { name: /Review match/ })[0]);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('ACH-55231')).toBeVisible();
    expect(within(dialog).getByText(/No payment has been applied/)).toBeVisible();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close review' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('shows four independent compositions together and preserves the original catalog', () => {
    render(<Preview />);
    const choices = within(screen.getByRole('navigation', { name: 'Asset variations' }));
    expect(choices.getAllByRole('link')).toHaveLength(4);
    expect(screen.getByRole('table', { name: /Incoming payment ledger/ })).toBeVisible();
    expect(screen.getByRole('table', { name: /Illustrative invoice allocation amounts/ })).toBeVisible();
    expect(screen.getByRole('list', { name: 'Reconciliation workflow' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Individual assets' })).toBeVisible();
  });
  it('uses the selected exception reason in the read-only review dialog', () => {
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) { this.setAttribute('open', ''); });
    render(<Preview />);
    fireEvent.click(screen.getByRole('button', { name: 'Inspect WIRE-88019' }));
    fireEvent.click(within(within(document.getElementById('composition/review')!).getByRole('region', { name: 'Selected exception' })).getByRole('button', { name: 'Review match' }));
    expect(within(screen.getByRole('dialog')).getByText('Invoice references missing from remittance.')).toBeVisible();
  });
});

