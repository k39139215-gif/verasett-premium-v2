import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SelectionCheckbox } from './IncomingPaymentRows';
import { VerasettIncomingPayments } from './VerasettIncomingPayments';
import { AllocationMatrix } from './AllocationMatrix';
import { ReconciliationRunScreen } from './ReconciliationRunScreen';
import { ReconciliationProofSheet } from './ReconciliationProofSheet';

const source = (path: string) => readFileSync(resolve(process.cwd(), 'src', path), 'utf8');

function assertEmbeddedMasks(css: string, expectedNames: string[]) {
  const declarations = [...css.matchAll(/(?:-webkit-)?mask(?:-image)?\s*:\s*\/\* Figma source: source-svg\/([\w-]+)\.svg \*\/\s*url\("data:image\/svg\+xml,([^"]+)"\)/g)];
  expect(declarations).toHaveLength(expectedNames.length);
  expect(declarations.map(match => match[1]).sort()).toEqual([...expectedNames].sort());
  for (const [, name, encoded] of declarations) {
    const decoded = decodeURIComponent(encoded);
    // Byte-identical UTF-8 includes all SVG geometry, dimensions and stroke widths.
    expect(Buffer.from(decoded, 'utf8')).toEqual(Buffer.from(source(`components/icons/source-svg/${name}.svg`), 'utf8'));
    const svg = new DOMParser().parseFromString(decoded, 'image/svg+xml');
    expect(svg.querySelector('parsererror')).toBeNull();
    expect(svg.documentElement.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg.querySelector('path')).not.toBeNull();
  }
  expect(css).not.toMatch(/url\(["']?(?:\.\.\/|\/)[^)]*source-svg/);
}

describe('Figma form indicators', () => {
  it('uses exported square states for every library and preview checkbox', () => {
    for (const file of ['components/verasett-ui-assets/assets.module.css', 'preview/preview.module.css']) {
      const css = source(file);
      const expected = ['square', 'square', 'check-square', 'check-square', 'minus-square', 'minus-square'];
      if (file.endsWith('assets.module.css')) expected.push('chevron-down', 'chevron-down');
      assertEmbeddedMasks(css, expected);
      expect(css).toContain('input[type="checkbox"]:indeterminate::before');
      expect(css).toContain('input[type="checkbox"]:focus-visible');
      expect(css).toContain('@media (forced-colors: active)');
    }
  });

  it('keeps checkbox native focus, mixed state, disabled state and change callbacks', () => {
    const onChange = vi.fn();
    const { rerender } = render(<SelectionCheckbox label="Select payment example" checked={false} mixed onChange={onChange} />);
    const checkbox = screen.getByRole('checkbox', { name: 'Select payment example' });
    expect(checkbox.tagName).toBe('INPUT');
    expect(checkbox).toBePartiallyChecked();
    checkbox.focus();
    expect(checkbox).toHaveFocus();
    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledOnce();
    rerender(<SelectionCheckbox label="Select payment example" checked mixed={false} disabled onChange={onChange} />);
    expect(checkbox).toBeChecked();
    expect(checkbox).not.toBePartiallyChecked();
    expect(checkbox).toBeDisabled();
  });

  it('uses the supplied caret in all select styles without changing native options', () => {
    for (const file of ['incoming.module.css', 'product-screens.module.css', 'allocation-matrix.module.css']) {
      const css = source(`components/verasett-ui-assets/${file}`);
      assertEmbeddedMasks(css, ['chevron-down', 'chevron-down']);
      expect(css).toContain('.selectControl select { appearance: none;');
      expect(css).toContain('pointer-events: none;');
    }
  });

  it('retains an accessible and functional incoming-status select', () => {
    render(<VerasettIncomingPayments />);
    const select = screen.getByRole('combobox', { name: 'Filter by status' });
    expect(select.tagName).toBe('SELECT');
    expect(select.parentElement?.className).toContain('selectControl');
    fireEvent.change(select, { target: { value: 'Needs review' } });
    expect(select).toHaveValue('Needs review');
    expect(screen.getByRole('table').querySelectorAll('tbody tr')).toHaveLength(1);
  });

  it('keeps the run filter and mobile invoice selector controlled', () => {
    const run = render(<ReconciliationRunScreen />);
    const filter = screen.getByRole('combobox', { name: 'Result filter' });
    expect(filter.parentElement?.className).toContain('selectControl');
    fireEvent.change(filter, { target: { value: 'Matched' } });
    expect(screen.getByRole('table').querySelectorAll('tbody tr')).toHaveLength(1);
    run.unmount();
    render(<AllocationMatrix />);
    const invoice = screen.getByRole('combobox', { name: 'Inspect invoice column' });
    expect(invoice.parentElement?.className).toContain('selectControl');
    fireEvent.change(invoice, { target: { value: 'INV-DEMO-1048' } });
    expect(screen.getByText('Tracing INV-DEMO-1048')).toBeVisible();
  });

  it('suppresses platform-specific search glyphs inside the asset library only', () => {
    const css = source('components/verasett-ui-assets/assets.module.css');
    expect(css).toContain('.asset input[type="search"]::-webkit-search-decoration');
    expect(css).toContain('.asset input[type="search"]::-webkit-search-cancel-button');
  });

  it('replaces the browser details marker while retaining native disclosure behavior', () => {
    const css = source('components/verasett-ui-assets/assets.module.css');
    expect(css).toContain('.asset summary::-webkit-details-marker { display: none; }');
    expect(css).toContain('.asset details[open] > summary::before { transform: rotate(0deg); }');
    render(<ReconciliationProofSheet />);
    const summary = screen.getAllByText('Inspect evidence')[0];
    const details = summary.parentElement;
    expect(summary.tagName).toBe('SUMMARY');
    expect(details?.tagName).toBe('DETAILS');
    expect(details).not.toHaveAttribute('open');
    fireEvent.click(summary);
    expect(details).toHaveAttribute('open');
  });
});
