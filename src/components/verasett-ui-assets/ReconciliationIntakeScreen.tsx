'use client';
import { useState } from 'react';
import type { AssetProps } from './types';
import { demoIntakeInputs, demoRun, type IntakeInput } from './product-data';
import { DataTable, MetricSummary, Notice, ScreenFrame, ScreenStatus } from './product-shared';
import { SourceFileDropzone, type SourceFileMetadata } from './SourceFileDropzone';
import s from './product-screens.module.css';
import { Icon } from './shared';

export interface ReconciliationIntakeScreenProps extends AssetProps { inputs?: readonly IntakeInput[]; runId?: string; onLocalFileSelection?: (file: SourceFileMetadata | null) => void }
const isSourceAvailable = (input: IntakeInput) => input.available !== false && input.status !== 'Missing input';
export function ReconciliationIntakeScreen({inputs=demoIntakeInputs, runId=demoRun.id, onLocalFileSelection, className,style}:ReconciliationIntakeScreenProps) {
  const [missingAr,setMissingAr] = useState(false);
  const hasAr = inputs.some(input=>input.kind==='open-ar' && isSourceAvailable(input));
  const missing = missingAr && hasAr;
  const displayed = inputs.map(input=>missing&&input.kind==='open-ar'?{...input,available:false,status:'Missing input',validation:'Required input unavailable',detail:'Eligible invoice balances cannot be established',tone:'review' as const}:input);
  const required = [{kind:'bank',label:'Bank statement'},{kind:'remittance',label:'Remittance advice'},{kind:'open-ar',label:'Open AR ledger'}];
  const absent = required.filter(type=>!displayed.some(input=>input.kind===type.kind && isSourceAvailable(input)));
  const unavailable = displayed.filter(input=>!isSourceAvailable(input));
  const received = displayed.filter(isSourceAvailable);
  const unspecified = required.filter(type=>!displayed.some(input=>input.kind===type.kind));
  const incompatible = received.some(input=>input.tone==='blocked');
  const blocked = absent.length>0 || unavailable.length>0 || incompatible;
  return <ScreenFrame title="Source Files / Intake" eyebrow="INPUT EVIDENCE" description="Three source types, one traceable reconciliation run." className={className} style={style} meta={<><strong>{runId}</strong><span>Illustrative intake · 11 Oct 2026, 10:00 IST</span></>} actions={<ScreenStatus label={!inputs.length?'No inputs':blocked?'Run blocked':'Inputs received'} tone={blocked?'review':'neutral'} />}>
    <MetricSummary items={[{label:'Source inputs',value:received.length,detail:'Received bank · Remittance · Open AR'},{label:'Validated',value:received.filter(i=>i.tone==='success').length,detail:'Format and required fields'},{label:'Needs attention',value:displayed.filter(i=>!isSourceAvailable(i)||i.tone==='review'||i.tone==='blocked').length+unspecified.length,detail:'Missing sources and evidence gaps'}]} />
    <div className={s.section}><SourceFileDropzone onSelectionChange={onLocalFileSelection} /></div>
    <div className={s.toolbar}><h3 className={s.sectionTitle}><Icon name="folder" />Illustrative uploaded sources</h3><button type="button" className={s.button} disabled={!hasAr} onClick={()=>setMissingAr(!missingAr)}>{missing?'Restore sample AR':'Simulate missing AR'}</button></div>
    <DataTable label="Source intake readiness and validation" rows={displayed} rowKey={i=>i.id} emptyMessage="No source inputs supplied" columns={[
      {key:'file',label:'Input / File reference',width:'26%',render:i=><><strong>{i.label}</strong><p className={s.muted}>{i.id}</p></>},
      {key:'format',label:'Source format',width:'16%',render:i=>isSourceAvailable(i)?i.format:'Awaiting source'},
      {key:'status',label:'Readiness',width:'18%',render:i=><ScreenStatus label={isSourceAvailable(i)?i.status:'Missing input'} tone={isSourceAvailable(i)?i.tone:'review'} />},
      {key:'validation',label:'Validation result',width:'18%',render:i=>isSourceAvailable(i)?i.validation:'Required input unavailable'},
      {key:'detail',label:'Control note',width:'22%',render:i=><span className={s.muted}>{isSourceAvailable(i)?i.detail:'Source must be supplied and validated before matching'}</span>},
    ]} />
    <div className={s.section}><Notice tone={blocked?'review':'neutral'}>{missing?'Run cannot proceed without the open AR ledger. Restore the illustrative input to inspect eligible invoice balances.':absent.length?`Required inputs missing: ${absent.map(input=>input.label).join(', ')}. Supply and validate these sources before matching.`:unavailable.length?'A supplied source record is unavailable. Resolve the missing source before this run can proceed.':incompatible?'An input is incompatible or blocked. Resolve its validation result before this run can proceed.':'Uploaded files, not direct bank access. Missing remittance references are routed to review rather than inferred or silently applied.'}</Notice></div>
    <div className={s.footer}><span>Input evidence → Candidate eligibility → Reconciliation run</span><span>Simulation controls do not read or upload files</span></div>
  </ScreenFrame>;
}
