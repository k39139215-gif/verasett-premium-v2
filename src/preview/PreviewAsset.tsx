import { useState, type ReactNode } from 'react';
import { AssetSegmentedControl } from '../components/verasett-ui-assets/AssetSegmentedControl';
import g from './screen-gallery.module.css';

export function PreviewAsset({ id, label, eyebrow, description, component, kind, children }: {
  id: string; label: string; eyebrow: string; description: string; component: string;
  kind: 'screen' | 'design' | 'utility'; children: ReactNode;
}) {
  const [compact, setCompact] = useState(false);
  return <section id={`${kind === 'screen' ? 'screens' : kind === 'design' ? 'designs' : 'workflow-tools'}/${id}`} tabIndex={-1} className={g.previewItem} aria-label={`${label} preview`}>
    <div className={g.screenHeading}>
      <div><span className={g.kicker}>{eyebrow}</span><h3>{label}</h3><p>{description}</p></div>
      <AssetSegmentedControl label={`${label} preview width`} value={compact ? 'compact' : 'desktop'} onValueChange={value => setCompact(value === 'compact')} options={[{ value: 'desktop', label: 'Desktop' }, { value: 'compact', label: 'Compact' }]} />
    </div>
    <div className={g.stage}><div className={compact ? g.compact : g.full} {...(kind === 'screen' ? { 'data-screen-stage': id } : kind === 'design' ? { 'data-design-stage': id } : { 'data-utility-stage': id })}>{children}</div></div>
    <div className={g.caption}><span>{component}</span><span>Reusable component · Editable illustrative data</span></div>
  </section>;
}
