import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SourceFileDropzone } from './SourceFileDropzone';
import { ReconciliationIntakeScreen } from './ReconciliationIntakeScreen';
import { demoIntakeInputs } from './product-data';

function choose(file: File | readonly File[]) {
  fireEvent.change(screen.getByLabelText('Select a source file', { selector: 'input' }), {
    target: { files: Array.isArray(file) ? file : [file] },
  });
}

function drop(files: readonly File[]) {
  fireEvent.drop(screen.getByText('Drop one source file here').parentElement!.parentElement!, {
    dataTransfer: { files },
  });
}

describe('SourceFileDropzone', () => {
  it('uses a native file chooser with explicit local-only semantics', () => {
    render(<SourceFileDropzone />);
    const input = screen.getByLabelText('Select a source file', { selector: 'input' });
    const click = vi.spyOn(input, 'click');
    const button = screen.getByRole('button', { name: 'Choose file' });
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('accept', '.csv,.xlsx,.pdf');
    expect(input).not.toHaveAttribute('multiple');
    fireEvent.click(button);
    expect(click).toHaveBeenCalledOnce();
    expect(screen.getByText(/contents are never read or uploaded/)).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('No source file selected.');
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('retains only metadata without reading contents, validates extension case, and resets input', () => {
    const onSelectionChange = vi.fn();
    render(<SourceFileDropzone onSelectionChange={onSelectionChange} />);
    const file = new File(['fictional'], 'statement.CSV', { type: 'text/csv', lastModified: 123 });
    const read = vi.fn();
    Object.defineProperty(file, 'text', { value: read });
    Object.defineProperty(file, 'arrayBuffer', { value: read });
    choose(file);
    expect(screen.getByText('statement.CSV')).toBeVisible();
    expect(screen.getByText('CSV · 9 B · Selected locally')).toBeVisible();
    expect(screen.getByText('Evidence unverified')).toBeVisible();
    expect(read).not.toHaveBeenCalled();
    const metadata = onSelectionChange.mock.calls[0][0];
    expect(metadata).toEqual({ name: 'statement.CSV', extension: 'csv', sizeBytes: 9, lastModified: 123 });
    expect(metadata).not.toBeInstanceOf(File);
    expect(Object.isFrozen(metadata)).toBe(true);
    expect(screen.getByLabelText('Select a source file', { selector: 'input' })).toHaveValue('');
    expect(screen.queryByText(/Uploaded successfully/)).not.toBeInTheDocument();
  });

  it('selects dropped files and clears drag styling', () => {
    const callback = vi.fn();
    render(<SourceFileDropzone onSelectionChange={callback} />);
    const zone = screen.getByText('Drop one source file here').parentElement!.parentElement!;
    fireEvent.dragOver(zone);
    expect(zone).toHaveAttribute('data-drag-over', 'true');
    drop([new File(['x'.repeat(2048)], 'ledger.xlsx')]);
    expect(zone).toHaveAttribute('data-drag-over', 'false');
    expect(screen.getByText('XLSX · 2 KB · Selected locally')).toBeVisible();
    expect(callback).toHaveBeenCalledOnce();
  });

  it('rejects a dropped batch rather than silently selecting its first item', () => {
    const callback = vi.fn();
    render(<SourceFileDropzone onSelectionChange={callback} />);
    drop([new File(['a'], 'bank.csv'), new File(['b'], 'ar.csv')]);
    expect(screen.getByRole('alert')).toHaveTextContent('Select one file at a time. No files were added.');
    expect(screen.queryByText('bank.csv')).not.toBeInTheDocument();
    expect(callback).not.toHaveBeenCalled();
  });

  it('rejects multiple input files as well as empty drops and zero-byte files', () => {
    const callback = vi.fn();
    render(<SourceFileDropzone onSelectionChange={callback} />);
    choose([new File(['a'], 'bank.csv'), new File(['b'], 'ar.csv')]);
    expect(screen.getByRole('alert')).toHaveTextContent('Select one file at a time.');
    drop([]);
    expect(screen.getByRole('alert')).toHaveTextContent('No file detected.');
    choose(new File([], 'empty.csv'));
    expect(screen.getByRole('alert')).toHaveTextContent('This file is empty.');
    expect(callback).not.toHaveBeenCalled();
  });

  it('does not treat a cancelled chooser as a rejected file', () => {
    render(<SourceFileDropzone />);
    choose([]);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('No source file selected.');
  });

  it('rejects unsupported and extensionless files without discarding the previous selection', () => {
    const callback = vi.fn();
    render(<SourceFileDropzone onSelectionChange={callback} />);
    choose(new File(['sample'], 'bank.csv'));
    for (const name of ['bank.exe', 'csv', '.csv']) {
      choose(new File(['sample'], name));
      expect(screen.getByRole('alert')).toHaveTextContent('Only CSV, XLSX, PDF files are supported.');
      expect(screen.getByText('bank.csv')).toBeVisible();
    }
    expect(callback).toHaveBeenCalledOnce();
  });

  it('uses configurable extensions and an inclusive size limit', () => {
    const callback = vi.fn();
    render(<SourceFileDropzone allowedExtensions={['.PDF', 'pdf', ' CSV ']} maxBytes={1024} onSelectionChange={callback} />);
    expect(screen.getByLabelText('Select a source file', { selector: 'input' })).toHaveAttribute('accept', '.pdf,.csv');
    expect(screen.getByText('PDF, CSV · Up to 1 KB')).toBeVisible();
    choose(new File(['x'.repeat(1025)], 'receipt.pdf'));
    expect(screen.getByRole('alert')).toHaveTextContent('This file exceeds the 1 KB limit.');
    expect(callback).not.toHaveBeenCalled();
    choose(new File(['x'.repeat(1024)], 'receipt.pdf'));
    expect(callback).toHaveBeenCalledOnce();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('PDF · 1 KB · Selected locally')).toBeVisible();
  });

  it('replaces and removes a selection, returning focus to the chooser', () => {
    const callback = vi.fn();
    render(<SourceFileDropzone onSelectionChange={callback} />);
    choose(new File(['first'], 'bank.csv'));
    expect(screen.getByRole('button', { name: 'Replace file' })).toBeVisible();
    choose(new File(['next'], 'remittance.pdf'));
    expect(screen.queryByText('bank.csv')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Remove remittance.pdf' }));
    expect(callback).toHaveBeenLastCalledWith(null);
    expect(screen.getByRole('button', { name: 'Choose file' })).toHaveFocus();
    expect(screen.queryByText('Evidence unverified')).not.toBeInTheDocument();
  });

  it('disables invalid configuration and disabled selectors without handling drops', () => {
    const callback = vi.fn();
    const { rerender } = render(<SourceFileDropzone maxBytes={NaN} onSelectionChange={callback} />);
    expect(screen.getByRole('button', { name: 'Choose file' })).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent('Configure accepted file extensions');
    drop([new File(['bank'], 'bank.csv')]);
    expect(callback).not.toHaveBeenCalled();
    rerender(<SourceFileDropzone allowedExtensions={[]} onSelectionChange={callback} />);
    expect(screen.getByRole('button', { name: 'Choose file' })).toBeDisabled();
    rerender(<SourceFileDropzone disabled onSelectionChange={callback} />);
    expect(screen.getByLabelText('Select a source file', { selector: 'input' })).toBeDisabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    drop([new File(['bank'], 'bank.csv')]);
    expect(callback).not.toHaveBeenCalled();
  });

  it('uses distinct labels and descriptions across reusable instances', () => {
    render(<><SourceFileDropzone /><SourceFileDropzone label="Select remittance evidence" /></>);
    const inputs = screen.getAllByLabelText(/Select .*file|Select remittance evidence/, { selector: 'input' });
    expect(inputs).toHaveLength(2);
    expect(inputs[0].getAttribute('aria-describedby')).not.toEqual(inputs[1].getAttribute('aria-describedby'));
  });
});

describe('intake local selection boundary', () => {
  const metricValue = (label: string) => screen.getByText(label, {selector:'dt'}).parentElement!.querySelector('dd');

  it('blocks a supplied legacy missing-input record and excludes it from received and validated counts', () => {
    const inputs = demoIntakeInputs.map(input => input.kind === 'open-ar' ? {...input, available:undefined, status:'Missing input'} : input);
    render(<ReconciliationIntakeScreen inputs={inputs} />);
    expect(screen.getByText('Run blocked')).toBeVisible();
    expect(screen.getByText(/Required inputs missing: Open AR ledger/)).toBeVisible();
    expect(metricValue('Source inputs')).toHaveTextContent('2');
    expect(metricValue('Validated')).toHaveTextContent('1');
    expect(metricValue('Needs attention')).toHaveTextContent('2');
    expect(screen.getByRole('button', {name:'Simulate missing AR'})).toBeDisabled();
    choose(new File(['fictional'], 'restored-ar.csv'));
    expect(screen.getByText('Run blocked')).toBeVisible();
    expect(within(screen.getByRole('table')).getByText('Missing input')).toBeVisible();
  });

  it('honors explicit unavailable sources with arbitrary host labels and optimistic validation text', () => {
    const inputs = demoIntakeInputs.map(input => input.kind === 'bank' ? {...input, available:false, label:'Awaiting treasury file', status:'Awaiting delivery'} : input);
    render(<ReconciliationIntakeScreen inputs={inputs} />);
    expect(screen.getByText('Awaiting treasury file')).toBeVisible();
    expect(screen.getByText(/Required inputs missing: Bank statement/)).toBeVisible();
    expect(within(screen.getByRole('table')).getByText('Missing input')).toBeVisible();
    expect(screen.queryByText('4 receipts · INR')).not.toBeInTheDocument();
    expect(metricValue('Source inputs')).toHaveTextContent('2');
    expect(metricValue('Validated')).toHaveTextContent('1');
    choose(new File(['fictional'], 'bank.csv'));
    expect(screen.getByText('Run blocked')).toBeVisible();
  });

  it('keeps a present remittance with review gaps distinct from a missing source', () => {
    render(<ReconciliationIntakeScreen />);
    expect(screen.getByText('Inputs received')).toBeVisible();
    expect(within(screen.getByRole('table')).getByText('Review required')).toBeVisible();
    expect(within(screen.getByRole('table')).getByText('Parsed · Reference gaps')).toBeVisible();
    expect(screen.queryByText('Run blocked')).not.toBeInTheDocument();
    expect(metricValue('Source inputs')).toHaveTextContent('3');
    expect(metricValue('Validated')).toHaveTextContent('2');
    expect(metricValue('Needs attention')).toHaveTextContent('1');
  });

  it('keeps missing AR and sample validation unchanged after a file is selected', () => {
    const callback = vi.fn();
    render(<ReconciliationIntakeScreen onLocalFileSelection={callback} />);
    fireEvent.click(screen.getByRole('button', { name: 'Simulate missing AR' }));
    const table = screen.getByRole('table');
    const before = table.textContent;
    choose(new File(['fictional'], 'open-ar.csv'));
    expect(table.textContent).toBe(before);
    expect(within(table).getByText('Missing input')).toBeVisible();
    expect(screen.getByText('Run blocked')).toBeVisible();
    expect(screen.getByText('Evidence unverified')).toBeVisible();
    expect(callback).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Restore sample AR' }));
    expect(within(table).queryByText('Missing input')).not.toBeInTheDocument();
    expect(screen.getByText('open-ar.csv')).toBeVisible();
  });

  it('does not make an empty input run ready', () => {
    render(<ReconciliationIntakeScreen inputs={[]} />);
    choose(new File(['test'], 'bank.csv'));
    expect(screen.getByText('No inputs')).toBeVisible();
    expect(screen.getByText('No source inputs supplied')).toBeVisible();
    expect(screen.getByText(/Required inputs missing:/)).toBeVisible();
    expect(screen.queryByText('Inputs received')).not.toBeInTheDocument();
  });
});
