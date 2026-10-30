'use client';
import { useId, useState } from 'react';
import type { AssetProps } from './types';
import { cx, Icon } from './shared';
import { demoRun } from './product-data';
import { demoCloseControls, type CloseControl, type CloseStage } from './close-readiness-data';
import base from './assets.module.css';
import s from './close-readiness-board.module.css';

export interface CloseReadinessBoardProps extends AssetProps {
  controls?: readonly CloseControl[];
  runId?: string;
  initialExpandedControlId?: string;
}
const stages: readonly { id: CloseStage; name: string; description: string }[] = [
  { id: 'evidence', name: 'Evidence', description: 'Establish the source' },
  { id: 'allocation', name: 'Allocation', description: 'Account for each receipt' },
  { id: 'release', name: 'Release', description: 'Obtain independent review' },
];
function controlValid(control: CloseControl, controls: readonly CloseControl[]) {
  return Boolean(control.id.trim() && control.title.trim() && control.owner.trim())
    && controls.filter(item => item.id.trim() === control.id.trim()).length === 1
    && stages.some(stage => stage.id === control.stage)
    && ['satisfied', 'review', 'pending'].includes(control.status)
    && (control.status !== 'satisfied' || (control.references.length > 0 && control.references.every(reference => reference.trim())
      && new Set(control.references.map(reference => reference.trim())).size === control.references.length));
}
function ControlRow({ control, valid, expanded, onToggle, panelId }: { control: CloseControl; valid: boolean; expanded: boolean; onToggle: () => void; panelId: string }) {
  const state = valid ? control.status : 'review';
  const label = valid ? state === 'satisfied' ? 'Satisfied' : state === 'review' ? 'Needs review' : 'Pending' : 'Definition incomplete';
  return <li className={s.control} data-state={state}>
    <button type="button" className={s.controlButton} onClick={onToggle} aria-expanded={expanded} aria-controls={panelId}>
      <span className={s.controlMark}><Icon name={state === 'satisfied' ? 'check' : state === 'review' ? 'review' : 'clock'} /></span>
      <span className={s.controlText}><strong>{control.title || 'Untitled control'}</strong><span>{control.summary}</span><span className={s.stateLabel}>{label}</span></span>
      <span className={s.disclosure}><Icon name={expanded ? 'minus' : 'plus'} /></span>
    </button>
    <div id={panelId} className={s.controlDetail} hidden={!expanded}>
      <p>{control.detail}</p>
      {!valid && <p className={s.invalid}>A unique control ID, owner and supporting references are required before a control can count as satisfied.</p>}
      <dl><div><dt>Owner</dt><dd>{control.owner || 'Unassigned'}</dd></div><div><dt>Evidence trail</dt><dd>{control.references.length ? control.references.map((reference, index) => <span key={`${reference}-${index}`}>{reference || 'Missing evidence reference'}</span>) : 'No evidence references supplied'}</dd></div></dl>
    </div>
  </li>;
}

/** Read-only control states with local disclosures. Expanding a control never approves or releases a run. */
export function CloseReadinessBoard({ controls = demoCloseControls, runId = demoRun.id, initialExpandedControlId, className, style }: CloseReadinessBoardProps) {
  const id = useId();
  const [expanded, setExpanded] = useState<string | undefined>(initialExpandedControlId);
  const satisfied = controls.filter(control => controlValid(control, controls) && control.status === 'satisfied').length;
  const reviews = controls.filter(control => !controlValid(control, controls) || control.status === 'review').length;
  const pending = controls.filter(control => controlValid(control, controls) && control.status === 'pending').length;
  const missingStages = stages.filter(stage => !controls.some(control => control.stage === stage.id));
  const validRun = Boolean(runId.trim());
  const suppliedComplete = controls.length > 0 && satisfied === controls.length && missingStages.length === 0 && validRun;
  const unknownStages = controls.filter(control => !stages.some(stage => stage.id === control.stage)).length;
  return <section className={cx(base.asset, s.board, className)} style={style} aria-labelledby={`${id}-title`}>
    <header className={s.header}><div><div className={s.overline}>RUN CONTROL VIEW<span>{runId || 'Run reference missing'}</span></div><h2 id={`${id}-title`}>Close readiness</h2><p>A connected record of evidence, allocation and release controls.</p></div><span className={s.demoTag}>Illustrative run</span></header>
    <div className={s.readiness}><div className={s.readinessCount}><strong>{satisfied}<span> / {controls.length}</span></strong><span>controls satisfied</span></div><div className={s.progressSummary}><div><span>{suppliedComplete ? 'Supplied controls satisfied' : controls.length ? 'Run release held' : 'No controls supplied'}</span><span>{reviews} to review · {pending} pending</span></div><progress aria-label="Supplied controls satisfied" value={satisfied} max={Math.max(1, controls.length)} /></div></div>
    {!validRun && <p className={s.warning}>A run reference is required to establish the control scope.</p>}
    {unknownStages > 0 && <p className={s.warning}>{unknownStages} control definition has an unsupported stage and cannot establish readiness.</p>}
    <div className={s.stages}>{stages.map((stage, stageIndex) => {
      const stageControls = controls.filter(control => control.stage === stage.id);
      const passed = stageControls.filter(control => controlValid(control, controls) && control.status === 'satisfied').length;
      return <section className={s.stage} key={stage.id} aria-labelledby={`${id}-${stage.id}`}><header className={s.stageHeader}><div className={s.stageRail}><span>{String(stageIndex + 1).padStart(2, '0')}</span><span className={s.railLine} />{stageIndex < stages.length - 1 && <Icon name="arrow" />}</div><div className={s.stageTitle}><h3 id={`${id}-${stage.id}`}>{stage.name}</h3><span>{passed} / {stageControls.length}</span></div><p>{stage.description}</p></header><ul className={s.controlList}>{stageControls.map((control, index) => {
        const key = `${stage.id}-${index}-${control.id}`;
        return <ControlRow key={key} control={control} valid={controlValid(control, controls)} expanded={expanded === key || expanded === control.id} onToggle={() => setExpanded(expanded === key || expanded === control.id ? undefined : key)} panelId={`${id}-${stage.id}-${index}`} />;
      })}</ul>{!stageControls.length && <p className={s.empty}>No controls supplied for this stage.</p>}</section>;
    })}</div>
    <div className={s.decision} data-ready={suppliedComplete}><Icon name={suppliedComplete ? 'check' : 'review'} /><div><strong>{suppliedComplete ? 'Control evidence is complete in this preview' : 'Unresolved controls prevent a run-wide release'}</strong><p>{suppliedComplete ? 'A separate authorized release workflow must determine the next action. No export or posting has occurred.' : 'Resolve exceptions and record independent review before preparing a release. A balanced receipt does not clear the whole run.'}</p></div><span className={s.readOnly}>Read only</span></div>
    <footer className={s.footer}><span>Fictional control states · Expand a row to inspect evidence</span><span>No approval, export or ERP posting</span></footer>
  </section>;
}
