import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Preview } from './Preview';

describe('workflow tools in the unified preview', () => {
  it('adds the two reusable tools without hiding earlier screens or designs', () => {
    const { container } = render(<Preview />);
    const navigation = screen.getByRole('navigation', { name: 'Preview sections' });
    expect(within(navigation).getByRole('link', { name: /Workflow tools/ })).toHaveAttribute('href', '#workflow-tools');
    expect(container.querySelectorAll('[data-utility-stage]')).toHaveLength(2);
    expect(container.querySelectorAll('[data-screen-stage]')).toHaveLength(9);
    expect(container.querySelectorAll('[data-design-stage]')).toHaveLength(6);
    expect(screen.getAllByRole('main')).toHaveLength(1);
    const ids = Array.from(container.querySelectorAll('[id]')).map(element => element.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('keeps independent widths and native selection controls', () => {
    render(<Preview />);
    const source = within(document.getElementById('workflow-tools/source')!);
    const activity = within(document.getElementById('workflow-tools/activity')!);
    fireEvent.click(source.getByRole('button', { name: 'Compact' }));
    expect(source.getByRole('button', { name: 'Compact' })).toHaveAttribute('aria-pressed', 'true');
    expect(activity.getByRole('button', { name: 'Desktop' })).toHaveAttribute('aria-pressed', 'true');
    expect(source.getByRole('button', { name: 'Choose file' })).toBeVisible();
    expect(activity.getByRole('heading', { name: 'Reconciliation activity' })).toBeVisible();
  });
});
