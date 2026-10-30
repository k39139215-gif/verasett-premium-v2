import { SourceFileDropzone } from '../components/verasett-ui-assets/SourceFileDropzone';
import { ReconciliationActivity } from '../components/verasett-ui-assets/ReconciliationActivity';
import { PreviewAsset } from './PreviewAsset';
import { Icon } from '../components/icons';
import g from './screen-gallery.module.css';

export function WorkflowTools() {
  return <section id="workflow-tools" tabIndex={-1} className={g.collection} aria-labelledby="workflow-tools-title">
    <div className={g.collectionHeading}><div><span className={g.kicker}>05 / WORKFLOW TOOLS</span><h2 id="workflow-tools-title">Source evidence & review activity</h2><p>BoardUI free-source patterns, adapted to the Verasett workflow.</p></div><a href="#collection-top">Back to collection <Icon name="arrow-up" size={14} /></a></div>
    <PreviewAsset kind="utility" id="source" label="Local source selection" eyebrow="EVIDENCE INTAKE" description="Select and inspect file metadata. Evidence validation remains a separate control." component="SourceFileDropzone"><SourceFileDropzone /></PreviewAsset>
    <PreviewAsset kind="utility" id="activity" label="Review activity" eyebrow="TRACEABLE HANDOFF" description="Inspect source, matching and export events. Reading an event keeps its financial status intact." component="ReconciliationActivity"><ReconciliationActivity /></PreviewAsset>
  </section>;
}
