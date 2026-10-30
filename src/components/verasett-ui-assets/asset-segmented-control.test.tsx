import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AssetSegmentedControl } from './AssetSegmentedControl';

const options = [{ value: 'desktop', label: 'Desktop' }, { value: 'compact', label: 'Compact' }];
describe('AssetSegmentedControl', () => {
  it('exposes a named group and a controlled selected value', () => {
    const change = vi.fn();
    const { rerender } = render(<AssetSegmentedControl label="Preview width" options={options} value="desktop" onValueChange={change} />);
    expect(screen.getByRole('group', { name: 'Preview width' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Desktop' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Compact' }));
    expect(change).toHaveBeenCalledWith('compact');
    rerender(<AssetSegmentedControl label="Preview width" options={options} value="compact" onValueChange={change} />);
    expect(screen.getByRole('button', { name: 'Compact' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Compact' })).toHaveAttribute('tabindex', '0');
  });
  it('moves focus with arrows, Home and End, skipping disabled choices', () => {
    const change = vi.fn();
    render(<AssetSegmentedControl label="Density" options={[options[0], { value: 'blocked', label: 'Unavailable', disabled: true }, options[1]]} value="desktop" onValueChange={change} />);
    const desktop = screen.getByRole('button', { name: 'Desktop' });
    const compact = screen.getByRole('button', { name: 'Compact' });
    act(() => desktop.focus());
    fireEvent.keyDown(desktop, { key: 'ArrowRight' });
    expect(compact).toHaveFocus();
    expect(compact).toHaveAttribute('tabindex', '0');
    expect(desktop).toHaveAttribute('tabindex', '-1');
    expect(change).not.toHaveBeenCalled();
    fireEvent.keyDown(compact, { key: 'Home' });
    expect(desktop).toHaveFocus();
    expect(desktop).toHaveAttribute('tabindex', '0');
    expect(compact).toHaveAttribute('tabindex', '-1');
    fireEvent.keyDown(desktop, { key: 'End' });
    expect(compact).toHaveFocus();
    fireEvent.keyDown(compact, { key: 'ArrowRight' });
    expect(desktop).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Unavailable' }));
    expect(change).not.toHaveBeenCalled();
  });
  it('keeps multiple instances independent and gives unknown values a tab stop', () => {
    render(<><AssetSegmentedControl label="First" options={options} value="missing" onValueChange={() => {}} /><AssetSegmentedControl label="Second" options={options} value="compact" onValueChange={() => {}} /></>);
    const first = within(screen.getByRole('group', { name: 'First' })).getByRole('button', { name: 'Desktop' });
    const second = within(screen.getByRole('group', { name: 'Second' })).getByRole('button', { name: 'Compact' });
    expect(first).toHaveAttribute('tabindex', '0');
    act(() => first.focus());
    fireEvent.keyDown(first, { key: 'ArrowLeft' });
    expect(second).not.toHaveFocus();
  });
});
