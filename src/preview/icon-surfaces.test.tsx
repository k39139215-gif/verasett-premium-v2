import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WorkflowConnector } from '../components/verasett-ui-assets/WorkflowConnector';
import { CloseReadinessBoard } from '../components/verasett-ui-assets/CloseReadinessBoard';
import { SettlementJournal } from '../components/verasett-ui-assets/SettlementJournal';
import { VerasettIncomingPayments } from '../components/verasett-ui-assets/VerasettIncomingPayments';
import { ReconciliationActivity } from '../components/verasett-ui-assets/ReconciliationActivity';
import { DesignGallery } from './DesignGallery';

function expectFigmaIcon(icon: Element | null) {
  expect(icon).not.toBeNull();
  expect(icon?.getAttribute('data-icon-source')).toMatch(/^figma:/);
  expect(icon).toHaveAttribute('aria-hidden', 'true');
  expect(icon?.querySelector('path, rect, circle, polygon, polyline, line')).not.toBeNull();
}

describe('Figma icons on standalone interface surfaces', () => {
  it('keeps a native-size Figma arrow within a structural connector line', () => {
    const { container, rerender } = render(<WorkflowConnector showNode />);
    const connector = container.firstElementChild!;
    expect(connector).toHaveAttribute('aria-hidden', 'true');
    expect(connector).toHaveAttribute('data-direction', 'horizontal');
    expect(connector.querySelectorAll('svg')).toHaveLength(1);
    expectFigmaIcon(connector.querySelector('svg'));
    expect(connector.querySelector('svg')).toHaveAttribute('viewBox', '0 0 24 24');
    expect(connector.querySelector('svg')).not.toHaveAttribute('preserveAspectRatio', 'none');
    expect(connector.children).toHaveLength(3);
    rerender(<WorkflowConnector direction="vertical" />);
    expect(connector).toHaveAttribute('data-direction', 'vertical');
    expect(connector.children).toHaveLength(2);
  });

  it('uses exported icons for all six design navigation thumbnails', () => {
    render(<DesignGallery />);
    const nav = screen.getByRole('navigation', { name: 'Design directions' });
    expect(nav.querySelectorAll('svg')).toHaveLength(6);
    expect(nav.querySelector('i')).toBeNull();
    nav.querySelectorAll('svg').forEach(expectFigmaIcon);
    expect(screen.getByRole('link', { name: 'Back to index' })).toHaveAccessibleName('Back to index');
    expectFigmaIcon(screen.getByRole('link', { name: 'Back to index' }).querySelector('svg'));
  });

  it('changes the Figma disclosure icon without changing the control label', () => {
    render(<CloseReadinessBoard />);
    const trigger = screen.getByRole('button', { name: /Run exceptions resolved/ });
    const name = trigger.textContent;
    const before = trigger.lastElementChild?.querySelector('svg') ?? null;
    expectFigmaIcon(before);
    expect(trigger.textContent).not.toMatch(/[+−]/);
    const geometry = trigger.lastElementChild?.innerHTML;
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger.textContent).toBe(name);
    expect(trigger.lastElementChild?.innerHTML).not.toBe(geometry);
    expectFigmaIcon(trigger.lastElementChild?.querySelector('svg') ?? null);
  });

  it('keeps journal evidence actions named while replacing their text symbols', () => {
    render(<SettlementJournal defaultExpandedIds={[]} />);
    const trigger = screen.getByRole('button', { name: 'Show evidence for PAY-DEMO-1840' });
    expect(trigger.textContent?.trim()).toBe('Evidence');
    expectFigmaIcon(trigger.querySelector('svg'));
    const geometry = trigger.querySelector('svg')?.innerHTML;
    fireEvent.click(trigger);
    expect(trigger).toHaveAccessibleName('Hide evidence for PAY-DEMO-1840');
    expect(trigger.querySelector('svg')?.innerHTML).not.toBe(geometry);
    expectFigmaIcon(trigger.querySelector('svg'));
  });

  it('uses Figma sort states and removable-filter icons in the payment toolbar', () => {
    render(<VerasettIncomingPayments />);
    const sort = screen.getByRole('button', { name: 'Sort by amount ascending' });
    expectFigmaIcon(sort.querySelector('svg'));
    const initialGeometry = sort.querySelector('svg')?.innerHTML;
    fireEvent.click(sort);
    expect(sort.closest('th')).toHaveAttribute('aria-sort', 'ascending');
    expect(sort.querySelector('svg')?.innerHTML).not.toBe(initialGeometry);
    expectFigmaIcon(sort.querySelector('svg'));
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search payments' }), { target: { value: 'Acme' } });
    const remove = screen.getByRole('button', { name: 'Remove search filter' });
    expectFigmaIcon(remove.querySelector('svg'));
    expect(remove.textContent).not.toContain('×');
    fireEvent.click(remove);
    expect(screen.getByRole('searchbox', { name: 'Search payments' })).toHaveValue('');
  });

  it('uses exported allocation and disclosure icons in reconciliation activity', () => {
    render(<ReconciliationActivity />);
    const trigger = screen.getByRole('button', { name: /Deterministic allocation found/ });
    expect(trigger.querySelectorAll('svg')).toHaveLength(2);
    trigger.querySelectorAll('svg').forEach(expectFigmaIcon);
    const geometry = trigger.lastElementChild?.innerHTML;
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger.lastElementChild?.innerHTML).not.toBe(geometry);
    expectFigmaIcon(trigger.lastElementChild?.querySelector('svg') ?? null);
    expect(screen.getByText('Read state ≠ approval')).toBeVisible();
  });
});
