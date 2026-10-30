import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PreviewRouter } from './PreviewRouter';
import { galleryScreens } from './ScreenGallery';
import { galleryDesigns } from './DesignGallery';

describe('one unified asset collection', () => {
  it('shows all compositions, assets, screens and designs in one document', () => {
    const { container } = render(<PreviewRouter />);
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(container.querySelectorAll('[data-variation-stage]')).toHaveLength(4);
    expect(container.querySelectorAll('[data-screen-stage]')).toHaveLength(9);
    expect(container.querySelectorAll('[data-design-stage]')).toHaveLength(6);
    expect(screen.getByRole('heading', { name: 'Individual assets' })).toBeVisible();
    for (const item of galleryScreens) expect(document.getElementById(`screens/${item.id}`)).toBeInTheDocument();
    for (const item of galleryDesigns) expect(document.getElementById(`designs/${item.id}`)).toBeInTheDocument();
    const ids = Array.from(container.querySelectorAll('[id]')).map(node => node.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('keeps a reviewed scenario mounted when navigating to another section', () => {
    render(<PreviewRouter />);
    const approval = within(document.getElementById('screens/approval')!);
    fireEvent.click(approval.getByRole('checkbox', { name: 'I checked the customer and invoice evidence' }));
    fireEvent.click(approval.getByRole('checkbox', { name: 'I reviewed the allocation and deduction treatment' }));
    fireEvent.click(approval.getByRole('button', { name: 'Approve' }));
    act(() => { window.location.hash = '#designs/inbox'; window.dispatchEvent(new HashChangeEvent('hashchange')); });
    expect(approval.getByText('Approved in preview', { exact: true })).toBeVisible();
    expect(document.getElementById('designs/inbox')).toBeInTheDocument();
    window.location.hash = '';
  });
  it('resolves old deep links to a section in the full document', () => {
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    window.location.hash = '#designs/worksheet';
    render(<PreviewRouter />);
    expect(scroll).toHaveBeenCalled();
    expect(document.activeElement).toBe(document.getElementById('designs/worksheet'));
    expect(screen.getByRole('heading', { name: 'Reconciliation UI assets' })).toBeVisible();
    expect(document.getElementById('screens/run')).toBeInTheDocument();
    window.location.hash = '';
  });
  it('keeps the workflow search when changing preview motion', () => {
    render(<PreviewRouter />);
    const workflow = within(document.getElementById('composition/workflow')!);
    const search = workflow.getByRole('searchbox', { name: 'Search payments' });
    fireEvent.change(search, { target: { value: 'Acme' } });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Motion' }));
    expect(search).toHaveValue('Acme');
  });
});
