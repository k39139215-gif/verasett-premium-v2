import { PreviewAsset } from './PreviewAsset';
import { Icon } from '../components/icons';
import { AllocationMatrix } from '../components/verasett-ui-assets/AllocationMatrix';
import { ReconciliationProofSheet } from '../components/verasett-ui-assets/ReconciliationProofSheet';
import { RemittanceInbox } from '../components/verasett-ui-assets/RemittanceInbox';
import { CloseReadinessBoard } from '../components/verasett-ui-assets/CloseReadinessBoard';
import { SettlementJournal } from '../components/verasett-ui-assets/SettlementJournal';
import { ClearingWorksheet } from '../components/verasett-ui-assets/ClearingWorksheet';
import g from './screen-gallery.module.css';
import d from './design-gallery.module.css';

export const galleryDesigns = [
  { id: 'matrix', label: 'Allocation matrix', component: 'AllocationMatrix', structure: 'Cross-reference matrix', description: 'Trace each invoice across receipt allocations and separate adjustments.', icon: 'grid' },
  { id: 'proof', label: 'Reconciliation proof', component: 'ReconciliationProofSheet', structure: 'Numbered proof document', description: 'An exact arithmetic statement with a numbered, inspectable evidence record.', icon: 'file-text' },
  { id: 'inbox', label: 'Remittance inbox', component: 'RemittanceInbox', structure: 'Correspondence & document pane', description: 'Read source remittances alongside their extracted references and evidence gaps.', icon: 'inbox' },
  { id: 'gates', label: 'Close readiness', component: 'CloseReadinessBoard', structure: 'Connected control gates', description: 'See which evidence, allocation and release controls are still unresolved.', icon: 'check-circle' },
  { id: 'journal', label: 'Settlement journal', component: 'SettlementJournal', structure: 'Chronological receipt rail', description: 'Follow incoming receipts over time and unfold evidence within each entry.', icon: 'clock' },
  { id: 'worksheet', label: 'Clearing worksheet', component: 'ClearingWorksheet', structure: 'Balanced accounting worksheet', description: 'A document-style debit and credit worksheet with a separate approval boundary.', icon: 'layers' },
] as const;

const components = { matrix: AllocationMatrix, proof: ReconciliationProofSheet, inbox: RemittanceInbox, gates: CloseReadinessBoard, journal: SettlementJournal, worksheet: ClearingWorksheet };

export function DesignGallery() {
  return <section id="designs" tabIndex={-1} className={g.collection} aria-labelledby="designs-title">
    <div className={g.collectionHeading}><div><p className={g.kicker}>04 / DESIGN DIRECTIONS</p><h2 id="designs-title">Six different ways to see the work.</h2><p>Every layout is displayed below. Jump to one without leaving this page.</p></div><a href="#collection-top">Back to index <Icon name="arrow-up" size={14} /></a></div>
    <nav className={d.navigation} aria-label="Design directions">{galleryDesigns.map((design,index)=><a key={design.id} href={`#designs/${design.id}`}><span className={d.number}>{String(index+1).padStart(2,'0')}</span><span className={d.label}>{design.label}<span>{design.structure}</span></span><Icon className={d.diagram} name={design.icon} size={24} /></a>)}</nav>
    {galleryDesigns.map((design,index)=> {
      const Design = components[design.id];
      return <PreviewAsset key={design.id} id={design.id} kind="design" label={design.label} eyebrow={`${String(index+1).padStart(2,'0')} / ${design.structure}`} description={design.description} component={design.component}><Design /></PreviewAsset>;
    })}
  </section>;
}
