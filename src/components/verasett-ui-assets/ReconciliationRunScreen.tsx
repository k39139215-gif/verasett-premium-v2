'use client';
import { useState } from 'react';
import type { AssetProps } from './types';
import { demoRun, type ReconciliationRun } from './product-data';
import { formatINR } from './product-format';
import { DataTable, MetricSummary, Notice, ScreenFrame, ScreenStatus } from './product-shared';
import s from './product-screens.module.css';

export interface ReconciliationRunScreenProps extends AssetProps { run?: ReconciliationRun }
export function ReconciliationRunScreen({run = demoRun, className, style}: ReconciliationRunScreenProps) {
  const [filter,setFilter] = useState('All');
  const safeAmount = (amount:number)=>Number.isSafeInteger(amount)&&amount>=0;
  const amountsValid=run.payments.every(p=>safeAmount(p.amountMinor));
  const sourcesReady=Boolean(run.statement.trim()&&run.remittance.trim()&&run.openAr.trim());
  const matched = run.payments.filter(p=>p.status==='Matched');
  const review = run.payments.filter(p=>p.status==='Needs review');
  const sum = (rows: typeof run.payments) => rows.every(p=>safeAmount(p.amountMinor))?formatINR(rows.reduce((total,p)=>total+BigInt(p.amountMinor),0n)):'Unavailable';
  const visible = run.payments.filter(p=>filter==='All'||p.status===filter);
  return <ScreenFrame title="Reconciliation Run" eyebrow="BATCH OVERVIEW" description="A payment-level view of evidence, matching and unresolved work." className={className} style={style}
    actions={<ScreenStatus label={!run.payments.length?'No payments':!amountsValid?'Check payment data':!sourcesReady?'Source references missing':review.length?'Review in progress':'Ready for controller review'} tone={review.length||!sourcesReady||!amountsValid?'review':'neutral'} />}
    meta={<><strong>{run.id}</strong><span>Uploaded statement · {run.statement}</span><span>Updated {run.updatedAt}</span></>}>
    <MetricSummary items={[{label:'Payments received',value:sum(run.payments),detail:`${run.payments.length} bank receipts`},{label:'Matched payments',value:matched.length,detail:'Proposed · Approval separate'},{label:'Items requiring review',value:review.length,detail:'Explicit human decision'},{label:'Unmatched amount',value:sum(review),detail:'Received value held for review'}]} />
    <div className={s.section}><div className={s.inputStrip}><div><strong>Bank statement</strong><span>{run.statement||'Not supplied'}</span><ScreenStatus label={run.statement.trim()?'Reference supplied':'Missing reference'} tone={run.statement.trim()?'neutral':'review'} /></div><div><strong>Detached remittance</strong><span>{run.remittance||'Not supplied'}</span><ScreenStatus label={run.remittance.trim()?'Reference supplied':'Missing reference'} tone={run.remittance.trim()?'neutral':'review'} /></div><div><strong>Open AR ledger</strong><span>{run.openAr||'Not supplied'}</span><ScreenStatus label={run.openAr.trim()?'Reference supplied':'Missing reference'} tone={run.openAr.trim()?'neutral':'review'} /></div></div></div>
    <div className={s.toolbar}><h3 className={s.sectionTitle}>Payment results</h3><label>View<span className={s.selectControl}><select aria-label="Result filter" value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option><option>Matched</option><option>Needs review</option></select></span></label></div>
    <DataTable label="Reconciliation run payment results in INR" rows={visible} rowKey={p=>p.reference} emptyMessage={run.payments.length?'No results in this view':'No payments in this run'} columns={[
      {key:'ref',label:'Payment / Customer',width:'24%',render:p=><><span>{p.reference}</span><p className={s.muted}>{p.customer}</p></>},
      {key:'amount',label:'Received',numeric:true,width:'17%',render:p=>safeAmount(p.amountMinor)?formatINR(p.amountMinor):'Invalid amount'},
      {key:'allocation',label:'Invoice allocation',width:'21%',render:p=>p.allocation},
      {key:'status',label:'Result',width:'17%',render:p=><ScreenStatus label={p.status} tone={p.status==='Matched'?'success':'review'} />},
      {key:'detail',label:'Control / Next step',width:'21%',render:p=><span className={s.muted}>{p.detail}</span>},
    ]} />
    <div className={s.body}><Notice>Matched describes the proposed allocation. Controller approval and ERP batch preparation remain separate steps. Unmatched amount is received value held for review, not a calculated accounting variance.</Notice></div>
  </ScreenFrame>;
}
