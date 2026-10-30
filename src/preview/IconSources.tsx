import { Icon, type IconName } from '../components/icons';
import { figmaProvenance } from '../components/icons/figma-paths';
import g from './screen-gallery.module.css';
import s from './icon-sources.module.css';

interface IconUsage { label: string; href?: string }
const previewUsage: Record<string, IconUsage> = {
  search: { label: 'Payment search', href: '#composition/workflow' },
  export: { label: 'ERP export and CSV actions', href: '#composition/workflow' },
  check: { label: 'Matched and uploaded states', href: '#components' },
  'check-circle': { label: 'Close readiness navigation', href: '#designs' },
  'alert-circle': { label: 'Payment review states', href: '#composition/review' },
  info: { label: 'Demo and control notices', href: '#components' },
  'chevron-down': { label: 'Select and evidence controls', href: '#screens/run' },
  'external-link': { label: 'Preview and source links', href: '#collection-top' },
  close: { label: 'Review dialog close control', href: '#components' },
  clock: { label: 'Pending states and journal navigation', href: '#designs/journal' },
  layers: { label: 'Clearing worksheet navigation', href: '#designs' },
  folder: { label: 'Source intake', href: '#screens/intake' },
  'file-text': { label: 'Bank statements and invoice evidence', href: '#components' },
  'arrow-right': { label: 'Workflow connectors and review actions', href: '#composition/workflow' },
  'circle-slash': { label: 'Blocked statuses', href: '#components' },
  'arrow-up': { label: 'Back-to-index links', href: '#screens' },
  plus: { label: 'Collapsed evidence controls', href: '#designs/gates' },
  minus: { label: 'Expanded evidence controls', href: '#designs/gates' },
  square: { label: 'Unchecked form controls', href: '#composition/workflow' },
  'check-square': { label: 'Checked form controls', href: '#composition/workflow' },
  'minus-square': { label: 'Partially selected payment rows', href: '#composition/workflow' },
  grid: { label: 'Allocation matrix navigation', href: '#designs' },
  inbox: { label: 'Remittance inbox navigation', href: '#designs' },
};

export const importedIconCount = figmaProvenance.length;

export function IconSources({ sectionNumber = '05', boardui = false }: { sectionNumber?: string; boardui?: boolean }) {
  const editionUsage: Record<string, IconUsage> = boardui ? {
    layers: { label: 'Allocation activity and worksheet navigation', href: '#workflow-tools' },
    close: { label: 'Filter chips and review dialog', href: '#composition/workflow' },
    'arrow-up-down': { label: 'Unsorted payment columns', href: '#composition/workflow' },
    'chevron-up': { label: 'Ascending payment sort', href: '#composition/workflow' },
  } : {};
  return <section id="icons" tabIndex={-1} className={g.collection} aria-labelledby="icons-title">
    <div className={g.collectionHeading}><div><p className={g.kicker}>{sectionNumber} / ICON PROVENANCE</p><h2 id="icons-title">Figma icons, traced to their source.</h2><p>The exact icon component used by this preview, with its Figma name and placement.</p></div><a href="#collection-top">Back to index <Icon name="arrow-up" size={14} /></a></div>
    <div className={s.panel}>
      <header className={s.header}><div><strong>{importedIconCount} imported icon keys</strong><span>Selected SVGs from the supplied Figma libraries</span></div><span className={s.badge}>Source-linked</span></header>
      <ul className={s.grid} aria-label="Imported Figma icons">
        {figmaProvenance.map(icon => {
          const usage = editionUsage[icon.name] ?? previewUsage[icon.name];
          return <li key={icon.name} className={s.item} data-icon-key={icon.name}>
            <div className={s.symbol}><Icon name={icon.name as IconName} size={24} /></div>
            <div className={s.details}><strong>{icon.name}</strong><a className={s.source} href={icon.sourceUrl} title={`Open source for ${icon.component} in Figma`}>{icon.component}<Icon name="external-link" size={11} /></a><span className={s.family}>{icon.family}</span>{'nodeScope' in icon && <span className={s.sourceScope}>Batch export · link opens source page</span>}{'compatibilityNote' in icon && <span className={s.compatibility}>{icon.compatibilityNote}</span>}{usage?.href ? <a className={s.usage} href={usage.href}>{usage.label}</a> : <span className={s.available}>Reusable API · shown in this source sheet</span>}</div>
          </li>;
        })}
      </ul>
      <footer className={s.footer}>Geometry comes from the exported source SVGs. Color follows the interface. Icons marked “Reusable API” are available to host components; they are not claimed as product placements.</footer>
    </div>
  </section>;
}
