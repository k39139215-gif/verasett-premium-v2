import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReconciliationRunScreen } from './ReconciliationRunScreen';
import { ReconciliationIntakeScreen } from './ReconciliationIntakeScreen';
import { demoIntakeInputs, demoProductMatch, demoRun } from './product-data';
import { formatINR, summarizeMatch } from './product-format';

describe('product-run financial model', () => {
  it('formats exact paise and Indian grouping including negative and big totals', () => {
    expect(formatINR(184000000)).toBe('₹18,40,000');
    expect(formatINR(123456789)).toBe('₹12,34,567.89');
    expect(formatINR(-250050)).toBe('-₹2,500.50');
    expect(formatINR(9007199254740993n)).toBe('₹9,00,71,99,25,47,409.93');
    expect(() => formatINR(1.2)).toThrow(RangeError);
  });
  it('keeps arithmetic and eligibility independent', () => {
    const result = summarizeMatch(demoProductMatch);
    expect(result).toMatchObject({ face:186000000n, deductions:2000000n, net:184000000n, variance:0n, canApprove:true });
    expect(summarizeMatch({ ...demoProductMatch, eligibility: { ...demoProductMatch.eligibility, customerConfirmed:false } })).toMatchObject({ variance:0n, eligible:false, canApprove:false });
    expect(summarizeMatch({ ...demoProductMatch, evidence:[] }).canApprove).toBe(false);
    expect(summarizeMatch({ ...demoProductMatch, deductions:[{...demoProductMatch.deductions[0],verified:false}] }).canApprove).toBe(false);
  });
  it('rejects duplicate invoices and unsafe amounts', () => {
    expect(summarizeMatch({ ...demoProductMatch, invoices:[demoProductMatch.invoices[0],demoProductMatch.invoices[0]] }).valid).toBe(false);
    expect(summarizeMatch({ ...demoProductMatch, receivedMinor:NaN }).canApprove).toBe(false);
  });
});

describe('run overview and source intake', () => {
  it('shows input references, four records, exact batch sums and review boundary', () => {
    render(<ReconciliationRunScreen />);
    expect(screen.getByRole('heading',{name:'Reconciliation Run'})).toBeVisible();
    expect(screen.getByText('₹31,69,500')).toBeVisible();
    expect(screen.getByText('₹13,29,500')).toBeVisible();
    expect(screen.getByText('BANK-DEMO-011')).toBeVisible();
    expect(screen.getByRole('table').querySelectorAll('tbody tr')).toHaveLength(4);
    expect(screen.getByText('Review in progress')).toBeVisible();
  });
  it('filters records without changing the batch summaries', () => {
    render(<ReconciliationRunScreen />);
    fireEvent.change(screen.getByRole('combobox',{name:'Result filter'}),{target:{value:'Matched'}});
    expect(screen.getByRole('table').querySelectorAll('tbody tr')).toHaveLength(1);
    expect(screen.getByText('₹31,69,500')).toBeVisible();
  });
  it('handles invalid amounts and missing source references without false readiness',()=>{
    const {rerender}=render(<ReconciliationRunScreen run={{...demoRun,payments:[{...demoRun.payments[0],amountMinor:NaN}]}} />);
    expect(screen.getByText('Invalid amount')).toBeVisible();
    expect(screen.getByText('Unavailable')).toBeVisible();
    expect(screen.getByText('Check payment data')).toBeVisible();
    rerender(<ReconciliationRunScreen run={{...demoRun,statement:'',remittance:'',openAr:'',payments:[demoRun.payments[0]]}} />);
    expect(screen.getByText('Source references missing')).toBeVisible();
    expect(screen.queryByText('Ready for controller review')).not.toBeInTheDocument();
    expect(screen.getAllByText('Missing reference')).toHaveLength(3);
  });
  it('handles empty runs and never invents an active processing state', () => {
    render(<ReconciliationRunScreen run={{...demoRun,payments:[]}} />);
    expect(screen.getByText('No payments in this run')).toBeVisible();
    expect(screen.getByText('No payments')).toBeVisible();
  });
  it('shows source readiness and validation without live upload controls', () => {
    render(<ReconciliationIntakeScreen />);
    expect(screen.getByRole('table').querySelectorAll('tbody tr')).toHaveLength(3);
    expect(screen.getByText('Detached remittance advice')).toBeVisible();
    expect(screen.getByText('Open AR ledger')).toBeVisible();
    expect(screen.getByText(/Uploaded files, not direct bank access/)).toBeVisible();
  });
  it('simulates missing input and restores it without data access', () => {
    render(<ReconciliationIntakeScreen />);
    fireEvent.click(screen.getByRole('button',{name:'Simulate missing AR'}));
    expect(within(screen.getByRole('table')).getByText('Missing input')).toBeVisible();
    expect(screen.getByText(/Run cannot proceed/)).toBeVisible();
    fireEvent.click(screen.getByRole('button',{name:'Restore sample AR'}));
    expect(screen.queryByText('Missing input')).not.toBeInTheDocument();
  });
  it('shows empty intake honestly', () => {
    render(<ReconciliationIntakeScreen inputs={[]} />);
    expect(screen.getByText('No source inputs supplied')).toBeVisible();
    expect(screen.getByRole('button',{name:'Simulate missing AR'})).toBeDisabled();
  });
  it('detects missing and incompatible custom inputs',()=>{
    const {rerender}=render(<ReconciliationIntakeScreen inputs={demoIntakeInputs.filter(i=>i.kind!=='bank')} />);
    expect(screen.getByText(/Required inputs missing: Bank statement/)).toBeVisible();
    expect(screen.getByText('Run blocked')).toBeVisible();
    rerender(<ReconciliationIntakeScreen inputs={demoIntakeInputs.map(i=>i.kind==='bank'?{...i,tone:'blocked',status:'Invalid schema'}:i)} />);
    expect(screen.getByText(/An input is incompatible or blocked/)).toBeVisible();
  });
});
