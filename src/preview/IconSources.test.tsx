import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { figmaProvenance } from '../components/icons/figma-paths';
import { IconSources, importedIconCount } from './IconSources';

describe('same-page Figma source sheet', () => {
  it('renders every imported public key with the actual icon and exact source link', () => {
    const { container } = render(<IconSources />);
    expect(document.getElementById('icons')).toHaveAttribute('tabindex', '-1');
    expect(screen.getByText(`${importedIconCount} imported icon keys`)).toBeVisible();
    const items = container.querySelectorAll('li[data-icon-key]');
    expect(items).toHaveLength(figmaProvenance.length);
    for (const icon of figmaProvenance) {
      const item = Array.from(items).find(row => row.getAttribute('data-icon-key') === icon.name)!;
      expect(item.querySelector('svg')?.getAttribute('data-icon-source')).toMatch(/^figma:/);
      expect(item.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
      const source = item.querySelector<HTMLAnchorElement>('a[title]')!;
      expect(source.getAttribute('href')).toBe(icon.sourceUrl);
      expect(source).toHaveTextContent(icon.component);
      if ('compatibilityNote' in icon) expect(item).toHaveTextContent(icon.compatibilityNote);
      if ('nodeScope' in icon) expect(item).toHaveTextContent('Batch export · link opens source page');
    }
  });

  it('separates actual preview placement from unused reusable API entries', () => {
    render(<IconSources />);
    expect(screen.getByRole('link', { name: 'Payment search' })).toHaveAttribute('href', '#composition/workflow');
    expect(screen.getAllByText('Reusable API · shown in this source sheet').length).toBeGreaterThan(0);
    expect(screen.queryByText('Ascending payment sort')).not.toBeInTheDocument();
  });

  it('shows BoardUI-specific placements without a separate application or route', () => {
    render(<IconSources sectionNumber="06" boardui />);
    expect(screen.getByText('06 / ICON PROVENANCE')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Unsorted payment columns' })).toHaveAttribute('href', '#composition/workflow');
    expect(screen.getByRole('link', { name: 'Filter chips and review dialog' })).toBeVisible();
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });
});
