import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { galleryScreens, ScreenGallery } from './ScreenGallery';

describe('product screens in the unified collection', () => {
  it('renders all nine screens together with in-page links', () => {
    const { container } = render(<ScreenGallery />);
    expect(screen.getByRole('navigation', { name: 'Product screen gallery' }).querySelectorAll('a')).toHaveLength(9);
    expect(container.querySelectorAll('[data-screen-stage]')).toHaveLength(9);
    for (const item of galleryScreens) {
      expect(document.getElementById(`screens/${item.id}`)).toBeInTheDocument();
      expect(screen.getByText(item.component, { exact: true })).toBeVisible();
    }
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });
  it('keeps compact sizing independent for each screen', () => {
    render(<ScreenGallery />);
    const match = within(screen.getByRole('group', { name: 'Match Detail preview width' }));
    const run = within(screen.getByRole('group', { name: 'Reconciliation Run preview width' }));
    fireEvent.click(match.getByRole('button', { name: 'Compact' }));
    expect(match.getByRole('button', { name: 'Compact' })).toHaveAttribute('aria-pressed', 'true');
    expect(run.getByRole('button', { name: 'Desktop' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('heading', { name: 'Payment-to-Invoice Match' })).toBeVisible();
  });
});
