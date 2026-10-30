import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Icon,
  SearchIcon,
  FilterIcon,
  DownloadIcon,
  ExportIcon,
  CheckIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
  ArrowUpDownIcon,
  RefreshCwIcon,
  CalendarIcon,
  DollarSignIcon,
  CurrencyIcon,
  CreditCardIcon,
  BuildingIcon,
  BankIcon,
  FileTextIcon,
  UserIcon,
  LockIcon,
  SlidersIcon,
  ExternalLinkIcon,
  CloseIcon,
  ClockIcon,
  LayersIcon,
  FolderIcon,
  type CanonicalIconName,
  type IconName,
} from './icons';
import { figmaPaths, figmaSources } from './figma-paths';

const canonicalIcons: CanonicalIconName[] = [
  'search',
  'filter',
  'download',
  'export',
  'check',
  'check-circle',
  'alert-circle',
  'alert-triangle',
  'info',
  'chevron-down',
  'chevron-right',
  'chevron-left',
  'chevron-up',
  'arrow-up-down',
  'refresh-cw',
  'calendar',
  'dollar-sign',
  'currency',
  'credit-card',
  'building',
  'bank',
  'file-text',
  'user',
  'lock',
  'sliders',
  'external-link',
  'close',
  'clock',
  'layers',
  'folder',
  'arrow-right',
  'circle-slash',
];

describe('modular icon system', () => {
  it('rejects unknown runtime tokens rather than drawing a substitute icon', () => {
    expect(() => render(<Icon name={'unverified' as IconName} />)).toThrow('Unsupported icon: unverified');
  });
  it('renders all supported canonical icons without errors', () => {
    for (const name of canonicalIcons) {
      const { container, unmount } = render(<Icon name={name} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      unmount();
    }
  });

  it('supports legacy alias icon names', () => {
    const legacy = ['file', 'review', 'blocked', 'arrow'] as const;
    for (const name of legacy) {
      const { container, unmount } = render(<Icon name={name} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      unmount();
    }
  });

  it('renders with accessible title when provided', () => {
    render(<SearchIcon title="Search records" />);
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute('role', 'img');
    expect(svg).not.toHaveAttribute('aria-hidden');
    expect(screen.getByText('Search records')).toBeInTheDocument();
  });

  it('accepts custom size, strokeWidth, and className', () => {
    const { container } = render(
      <FilterIcon size={20} strokeWidth={2} className="custom-filter-class" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '20');
    expect(svg).toHaveAttribute('height', '20');
    expect(svg).toHaveAttribute('stroke-width', '2');
    expect(svg).toHaveClass('custom-filter-class');
  });

  it('defaults to a non-focusable 24 pixel decorative icon', () => {
    const { container } = render(<SearchIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).not.toHaveAttribute('role');
  });

  it('supports an accessible name supplied with aria-label', () => {
    render(<SearchIcon aria-label="Find payment records" />);
    const svg = screen.getByRole('img', { name: 'Find payment records' });
    expect(svg).not.toHaveAttribute('aria-hidden');
  });

  it('treats blank labels and titles as decorative', () => {
    const { container } = render(<SearchIcon title="  " aria-label=" " />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('title')).not.toBeInTheDocument();
  });

  it('allows a titled icon to be explicitly decorative', () => {
    const { container } = render(<SearchIcon title="Search" aria-hidden="true" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('svg')).not.toHaveAttribute('role');
  });

  it('uses a sourced Money glyph for the dollar-sign compatibility name', () => {
    const { container } = render(<Icon name="dollar-sign" />);
    expect(container.querySelector('svg')).toHaveAttribute('data-icon-source', 'figma:lets-icons:2165-7763');
    expect(container.querySelector('svg')).toHaveAttribute('stroke-width', '2');
  });

  it('resolves legacy arrow and blocked tokens to the exact imported icons', () => {
    for (const [alias, canonical] of [['arrow', 'arrow-right'], ['blocked', 'circle-slash']] as const) {
      const actual = render(<Icon name={alias} />);
      const expected = render(<Icon name={canonical} />);
      expect(actual.container.innerHTML).toBe(expected.container.innerHTML);
      expect(actual.container.querySelector('svg')?.getAttribute('data-icon-source')).toMatch(/^figma:/);
      actual.unmount(); expected.unmount();
    }
  });

  it('renders imported geometry with the recorded source for every exported key', () => {
    expect(Object.keys(figmaPaths).length).toBeGreaterThan(0);
    for (const [name, paths] of Object.entries(figmaPaths)) {
      const expected = render(<svg>{paths}</svg>);
      const actual = render(<Icon name={name as IconName} />);
      expect(actual.container.querySelector('svg')?.innerHTML).toBe(expected.container.querySelector('svg')?.innerHTML);
      expect(figmaSources[name as CanonicalIconName]).toBeTruthy();
      expect(actual.container.querySelector('svg')).toHaveAttribute('data-icon-source', figmaSources[name as CanonicalIconName]);
      actual.unmount();
      expected.unmount();
    }
  });

  it('resolves legacy file and review tokens to their canonical imported geometry', () => {
    for (const [alias, canonical] of [['file', 'file-text'], ['review', 'alert-circle']] as const) {
      const expected = render(<Icon name={canonical} />);
      const actual = render(<Icon name={alias} />);
      expect(actual.container.innerHTML).toBe(expected.container.innerHTML);
      actual.unmount();
      expected.unmount();
    }
  });

  it('supports accessible names supplied by another element', () => {
    render(<><span id="icon-label">Bank statement file</span><FolderIcon aria-labelledby="icon-label" /></>);
    expect(screen.getByRole('img', { name: 'Bank statement file' })).not.toHaveAttribute('aria-hidden');
  });

  it('preserves a standalone title as the accessible name', () => {
    render(<FolderIcon title="Source folder" />);
    expect(screen.getByRole('img', { name: 'Source folder' })).toHaveAttribute('width', '24');
  });

  it('allows explicit dimensions while retaining a custom size as the default', () => {
    const { container } = render(<Icon name="file" size={20} width={32} />);
    expect(container.querySelector('svg')).toHaveAttribute('width', '32');
    expect(container.querySelector('svg')).toHaveAttribute('height', '20');
  });

  it('renders all individual icon components without errors', () => {
    const components = [
      SearchIcon,
      FilterIcon,
      DownloadIcon,
      ExportIcon,
      CheckIcon,
      CheckCircleIcon,
      AlertCircleIcon,
      AlertTriangleIcon,
      InfoIcon,
      ChevronDownIcon,
      ChevronRightIcon,
      ChevronLeftIcon,
      ChevronUpIcon,
      ArrowUpDownIcon,
      RefreshCwIcon,
      CalendarIcon,
      DollarSignIcon,
      CurrencyIcon,
      CreditCardIcon,
      BuildingIcon,
      BankIcon,
      FileTextIcon,
      UserIcon,
      LockIcon,
      SlidersIcon,
      ExternalLinkIcon,
      CloseIcon,
      ClockIcon,
      LayersIcon,
      FolderIcon,
    ];

    for (const Component of components) {
      const { container, unmount } = render(<Component />);
      expect(container.querySelector('svg')).toBeInTheDocument();
      unmount();
    }
  });
});
