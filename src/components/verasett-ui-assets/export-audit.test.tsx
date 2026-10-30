import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ERPExportPreviewScreen } from './ERPExportPreviewScreen';
import { ReconciliationAuditScreen } from './ReconciliationAuditScreen';
import { demoClearingExportLines, demoReconciliationAuditEvents } from './export-audit-data';

describe('controlled ERP export preview', () => {
  it('keeps cash, deductions and invoice clearing on distinct balanced sides', () => {
    render(<ERPExportPreviewScreen />);
    expect(screen.getByRole('table', { name: 'Illustrative ERP clearing lines' }).querySelectorAll('tbody tr')).toHaveLength(7);
    expect(screen.getByText('₹18,40,000', { selector: 'dd' })).toBeVisible();
    expect(screen.getByText('₹18,60,000', { selector: 'dd' })).toBeVisible();
    expect(screen.getByText('₹0', { selector: 'dd' })).toBeVisible();
    expect(screen.getByText('Approval pending')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Prepare demo export' })).toBeDisabled();
    expect(demoClearingExportLines.reduce((sum, line) => sum + BigInt(line.debitMinor) - BigInt(line.creditMinor), 0n)).toBe(0n);
  });

  it('simulates approval and preparation without any file download', () => {
    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, 'click');
    render(<ERPExportPreviewScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Use approved sample' }));
    expect(screen.getByText('Approved in sample')).toBeVisible();
    expect(screen.getByText('Export ready')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Prepare demo export' }));
    expect(screen.getByText('CSV batch prepared')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('No file was created, downloaded or posted');
    expect(anchorClick).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Reset simulation' }));
    expect(screen.getByText('Approval pending')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Prepare demo export' })).toBeDisabled();
    anchorClick.mockRestore();
  });

  it('invalidates a prepared simulation when supplied data changes', () => {
    const { rerender } = render(<ERPExportPreviewScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Use approved sample' }));
    fireEvent.click(screen.getByRole('button', { name: 'Prepare demo export' }));
    rerender(<ERPExportPreviewScreen batchId="DIFFERENT-SAMPLE" />);
    expect(screen.queryByText('CSV batch prepared')).not.toBeInTheDocument();
    expect(screen.getByText('Approval pending')).toBeVisible();
    rerender(<ERPExportPreviewScreen />);
    expect(screen.queryByText('CSV batch prepared')).not.toBeInTheDocument();
    expect(screen.getByText('Approval pending')).toBeVisible();
  });

  it('requires evidence independently of arithmetic equality for custom lines', () => {
    render(<ERPExportPreviewScreen lines={[...demoClearingExportLines]} controllerApproval="approved" />);
    expect(screen.getByText('Evidence review required')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Prepare demo export' })).toBeDisabled();
  });

  it('blocks a receipt reference that does not identify the displayed payment', () => {
    render(<ERPExportPreviewScreen paymentReference="PAY-CUSTOM-000" controllerApproval="approved" evidenceConfirmed />);
    expect(screen.getByText('Receipt reference mismatch')).toBeVisible();
    expect(screen.queryByText('Export ready')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Prepare demo export' })).toBeDisabled();
  });

  it('requires exactly one receipt even when multiple receipts balance', () => {
    const receipt = demoClearingExportLines[0];
    const lines = [
      { ...receipt, debitMinor: receipt.debitMinor - 100 },
      { ...receipt, id: 'SECOND-RECEIPT-LINE', reference: 'PAY-CUSTOM-SECOND', debitMinor: 100 },
      ...demoClearingExportLines.slice(1),
    ];
    render(<ERPExportPreviewScreen lines={lines} controllerApproval="approved" evidenceConfirmed />);
    expect(screen.getByText('Exactly one receipt required')).toBeVisible();
    expect(screen.queryByText('Export ready')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Prepare demo export' })).toBeDisabled();
  });

  it.each([
    { customer: 'Another illustrative customer' },
    { customerReference: 'CUST-CUSTOM-01' },
  ])('does not inherit demo evidence for changed customer identity: %j', identity => {
    render(<ERPExportPreviewScreen {...identity} controllerApproval="approved" />);
    expect(screen.getByText('Evidence review required')).toBeVisible();
    expect(screen.queryByText('Export ready')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Prepare demo export' })).toBeDisabled();
  });

  it('accepts a consistent custom receipt only with explicit evidence confirmation', () => {
    const lines = demoClearingExportLines.map(line => line.kind === 'receipt' ? { ...line, reference: 'PAY-CUSTOM-000' } : line);
    const props = { lines, paymentReference: 'PAY-CUSTOM-000', customer: 'Illustrative custom customer', customerReference: 'CUST-CUSTOM-01', controllerApproval: 'approved' as const };
    const { rerender } = render(<ERPExportPreviewScreen {...props} />);
    expect(screen.getByText('Evidence review required')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Prepare demo export' })).toBeDisabled();
    rerender(<ERPExportPreviewScreen {...props} evidenceConfirmed />);
    expect(screen.getByText('Export ready')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Prepare demo export' })).toBeEnabled();
  });

  it('blocks empty, invalid, unbalanced and duplicate lines', () => {
    const { rerender } = render(<ERPExportPreviewScreen lines={[]} />);
    expect(screen.getByText('No clearing lines supplied. Preparation is unavailable.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Use approved sample' })).toBeDisabled();
    rerender(<ERPExportPreviewScreen lines={demoClearingExportLines.map((line, index) => index === 0 ? { ...line, debitMinor: NaN } : line)} evidenceConfirmed />);
    expect(screen.getByText('Check clearing data')).toBeVisible();
    expect(screen.getByText('Invalid amount')).toBeVisible();
    rerender(<ERPExportPreviewScreen lines={demoClearingExportLines.map((line, index) => index === 0 ? { ...line, debitMinor: line.debitMinor + 100 } : line)} evidenceConfirmed />);
    expect(screen.getByText('Variance requires review')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Use approved sample' })).toBeDisabled();
    rerender(<ERPExportPreviewScreen lines={demoClearingExportLines.map((line, index) => index === 1 ? { ...line, id: demoClearingExportLines[0].id } : line)} evidenceConfirmed />);
    expect(screen.getByText('Check clearing data')).toBeVisible();
  });

  it('supports explicit approved, held and read-only preview states', () => {
    const { rerender } = render(<ERPExportPreviewScreen controllerApproval="approved" />);
    expect(screen.getByRole('button', { name: 'Prepare demo export' })).toBeEnabled();
    rerender(<ERPExportPreviewScreen controllerApproval="held" />);
    expect(screen.getByText('Held for review')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Prepare demo export' })).toBeDisabled();
    rerender(<ERPExportPreviewScreen controllerApproval="approved" allowSimulation={false} />);
    expect(screen.queryByRole('button', { name: 'Use approved sample' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Prepare demo export' })).toBeDisabled();
  });

  it('rejects missing references, duplicate allocations and mixed debit-credit lines', () => {
    const { rerender } = render(<ERPExportPreviewScreen customerReference="" controllerApproval="approved" />);
    expect(screen.getByText('Missing batch references')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Prepare demo export' })).toBeDisabled();
    rerender(<ERPExportPreviewScreen lines={demoClearingExportLines.map((line, index) => index === 6 ? { ...line, reference: demoClearingExportLines[5].reference } : line)} evidenceConfirmed />);
    expect(screen.getByText('Check clearing data')).toBeVisible();
    rerender(<ERPExportPreviewScreen lines={demoClearingExportLines.map((line, index) => index === 0 ? { ...line, creditMinor: 100 } : line)} evidenceConfirmed />);
    expect(screen.getByText('Check clearing data')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Use approved sample' })).toBeDisabled();
  });

  it('keeps aggregate clearing totals exact above the safe-number boundary', () => {
    const huge = Number.MAX_SAFE_INTEGER;
    render(<ERPExportPreviewScreen lines={[
      { ...demoClearingExportLines[0], debitMinor: huge },
      { ...demoClearingExportLines[1], debitMinor: 2 },
      { ...demoClearingExportLines[4], creditMinor: huge },
      { ...demoClearingExportLines[5], creditMinor: 2 },
    ]} evidenceConfirmed />);
    expect(screen.getByText('₹9,00,71,99,25,47,409.93', { selector: 'dd' })).toBeVisible();
    expect(screen.getByText('₹0', { selector: 'dd' })).toBeVisible();
  });
});

describe('reconciliation audit provenance', () => {
  it('shows ordered illustrative events and input evidence', () => {
    render(<ReconciliationAuditScreen />);
    expect(screen.getByRole('table', { name: 'Illustrative reconciliation audit events' }).querySelectorAll('tbody tr')).toHaveLength(6);
    expect(screen.getByText('11 Oct 2026 · IST')).toBeVisible();
    expect(within(screen.getByRole('region', { name: 'Selected audit evidence' })).getByText('BANK-DEMO-011')).toBeVisible();
    expect(demoReconciliationAuditEvents.every((event, index, events) => index === 0 || Date.parse(event.dateTime) > Date.parse(events[index - 1].dateTime))).toBe(true);
  });

  it('selects candidate evidence and explains exclusions independently of arithmetic', () => {
    render(<ReconciliationAuditScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Inspect Invoice candidates assessed' }));
    expect(screen.getByRole('button', { name: 'Inspect Invoice candidates assessed' })).toHaveAttribute('aria-pressed', 'true');
    const details = screen.getByRole('region', { name: 'Selected audit evidence' });
    expect(within(details).getByText('INV-DEMO-1063')).toBeVisible();
    expect(details).toHaveTextContent('separately from amount equality');
    fireEvent.click(screen.getByRole('button', { name: 'Inspect Clearing batch prepared' }));
    expect(details).toHaveTextContent('no ERP posting event');
    expect(within(details).getByText('DEMO-CSV-011')).toBeVisible();
  });

  it('handles supplied empty histories and missing event evidence honestly', () => {
    const { rerender } = render(<ReconciliationAuditScreen events={[]} />);
    expect(screen.getByText('No audit events supplied. No approval or export state can be inferred.')).toBeVisible();
    expect(screen.queryByRole('region', { name: 'Selected audit evidence' })).not.toBeInTheDocument();
    expect(screen.queryByText('Approved in sample')).not.toBeInTheDocument();
    rerender(<ReconciliationAuditScreen events={[{ ...demoReconciliationAuditEvents[0], evidence: [] }]} />);
    expect(screen.getByText('No supporting references attached to this event.')).toBeVisible();
  });
});
