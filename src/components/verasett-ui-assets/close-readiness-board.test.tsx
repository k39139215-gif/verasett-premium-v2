import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CloseReadinessBoard } from './CloseReadinessBoard';
import { demoCloseControls, type CloseControl } from './close-readiness-data';

describe('CloseReadinessBoard', () => {
  it('presents three connected control stages with five of eight satisfied', () => {
    render(<CloseReadinessBoard />);
    for (const name of ['Evidence', 'Allocation', 'Release']) expect(screen.getByRole('heading', { name })).toBeVisible();
    expect(screen.getByRole('progressbar', { name: 'Supplied controls satisfied' })).toHaveAttribute('value', '5');
    expect(screen.getByRole('progressbar')).toHaveAttribute('max', '8');
    expect(screen.getByText('2 to review · 1 pending')).toBeVisible();
    expect(screen.getByText('Run release held')).toBeVisible();
    expect(screen.getByText('No approval, export or ERP posting')).toBeVisible();
  });
  it('opens evidence details with an accessible local disclosure and no state approval', () => {
    render(<CloseReadinessBoard />);
    const trigger = screen.getByRole('button', { name: /Run exceptions resolved/ });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/Held received value is ₹13,29,500; it is not an accounting variance/)).toBeVisible();
    const panel = document.getElementById(trigger.getAttribute('aria-controls')!);
    expect(within(panel!).getByText('Exception reviewer')).toBeVisible();
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '5');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(panel).not.toBeVisible();
  });
  it('allows an initially expanded independent review control', () => {
    render(<CloseReadinessBoard initialExpandedControlId="CTL-REVIEW" />);
    expect(screen.getByRole('button', { name: /Independent controller review/ })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/No independent approval has been recorded/)).toBeVisible();
  });
  it('does not imply readiness for an empty set or missing stages', () => {
    const { rerender } = render(<CloseReadinessBoard controls={[]} />);
    expect(screen.getByText('No controls supplied')).toBeVisible();
    expect(screen.getAllByText('No controls supplied for this stage.')).toHaveLength(3);
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0');
    rerender(<CloseReadinessBoard controls={[demoCloseControls[0]]} />);
    expect(screen.getByText('Run release held')).toBeVisible();
    expect(screen.queryByText('Supplied controls satisfied')).not.toBeInTheDocument();
  });
  it('requires unique IDs and supporting references before counting satisfied controls', () => {
    const invalid = [demoCloseControls[0], demoCloseControls[0], { ...demoCloseControls[1], references: [] }, { ...demoCloseControls[3], owner: '' }];
    render(<CloseReadinessBoard controls={invalid} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0');
    expect(screen.getAllByText('Definition incomplete')).toHaveLength(4);
    expect(screen.getByText('4 to review · 0 pending')).toBeVisible();
  });
  it('rejects an unsupported stage and missing run scope', () => {
    const invalid = { ...demoCloseControls[0], stage: 'unknown' } as unknown as CloseControl;
    render(<CloseReadinessBoard controls={[invalid]} runId="" />);
    expect(screen.getByText('Run reference missing')).toBeVisible();
    expect(screen.getByText(/unsupported stage/)).toBeVisible();
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0');
  });
  it('treats unsupported runtime statuses as incomplete control definitions', () => {
    const invalid = { ...demoCloseControls[0], status: 'approved' } as unknown as CloseControl;
    render(<CloseReadinessBoard controls={[invalid]} />);
    expect(screen.getByText('Definition incomplete')).toBeVisible();
    expect(screen.getByText('1 to review · 0 pending')).toBeVisible();
    expect(screen.getByText('Run release held')).toBeVisible();
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0');
  });
  it('qualifies complete custom control evidence without claiming release or posting', () => {
    render(<CloseReadinessBoard controls={demoCloseControls.map(control => ({ ...control, status: 'satisfied' }))} />);
    expect(screen.getByText('Supplied controls satisfied')).toBeVisible();
    expect(screen.getByText(/A separate authorized release workflow must determine the next action/)).toBeVisible();
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '8');
    expect(screen.queryByRole('button', { name: /Approve|Export|Release run/ })).not.toBeInTheDocument();
  });
});
