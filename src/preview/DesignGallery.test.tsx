import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DesignGallery, galleryDesigns } from './DesignGallery';

describe('six designs in the same document', () => {
  it('renders every design with an anchor instead of a separate page', () => {
    const { container } = render(<DesignGallery />);
    expect(screen.getByRole('navigation', { name: 'Design directions' }).querySelectorAll('a')).toHaveLength(6);
    expect(container.querySelectorAll('[data-design-stage]')).toHaveLength(6);
    for (const design of galleryDesigns) {
      expect(screen.getByText(design.component, { exact: true })).toBeVisible();
      expect(document.getElementById(`designs/${design.id}`)).toBeInTheDocument();
    }
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
    expect(new Set(galleryDesigns.map(design => design.structure)).size).toBe(6);
  });
  it('changes one design width while retaining all six designs', () => {
    render(<DesignGallery />);
    const journal = within(screen.getByRole('group', { name: 'Settlement journal preview width' }));
    fireEvent.click(journal.getByRole('button', { name: 'Compact' }));
    expect(journal.getByRole('button', { name: 'Compact' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(screen.getByRole('group', { name: 'Allocation matrix preview width' })).getByRole('button', { name: 'Desktop' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('ClearingWorksheet', { exact: true })).toBeVisible();
  });
});
