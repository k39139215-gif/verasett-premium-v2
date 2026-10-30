import { useRef, useState } from 'react';
import { Icon } from '../components/icons';
import {
  IncomingPaymentsTable, BankStatementCard,
  MatchingProgressCard, ERPExportCard, PaymentMatchCard, ExceptionReviewCard,
  DeductionDetailCard, MatchMetric, StatusPill, WorkflowConnector,
} from '../components/verasett-ui-assets';
import { demoIncomingPayments } from '../components/verasett-ui-assets/sample-data';
import p from './preview.module.css';
import { VariationPreview } from './VariationPreview';
import { ScreenGallery } from './ScreenGallery';
import { DesignGallery } from './DesignGallery';
import { IconSources, importedIconCount } from './IconSources';
import { WorkflowTools } from './WorkflowTools';
import { AssetSegmentedControl } from '../components/verasett-ui-assets/AssetSegmentedControl';
import { demoReviewPayments } from '../components/verasett-ui-assets/variation-data';

export function Preview() {
  const [compact, setCompact] = useState(false);
  const [longNames, setLongNames] = useState(false);
  const [motion, setMotion] = useState(false);
  const [review, setReview] = useState('ACH-55231');
  const dialog = useRef<HTMLDialogElement>(null);
  const openReview = (reference: string) => { setReview(reference); dialog.current?.showModal(); };
  const reviewReason = demoReviewPayments.find(payment => payment.reference === review)?.reason ?? 'Remittance amount differs from open invoices';
  const payments = longNames ? demoIncomingPayments.map((payment, i) => ({ ...payment, customer: i === 0 ? 'Northwestern International Distribution and Logistics Corporation' : payment.customer })) : demoIncomingPayments;
  return <div className={`${p.preview} verasettPremiumTheme`}>
    <header className={p.topbar}><a className={p.brand} href="#composition"><span className={p.brandMark} aria-hidden="true">v</span>verasett<span className={p.brandDivider} /> <span className={p.libraryLabel}>Premium V2</span></a><div className={p.compareLinks}><a className={p.version} href="#dashboard">Full dashboard <Icon name="grid" size={12} /></a><a className={p.version} href="http://127.0.0.1:5173/#collection-top" target="_blank" rel="noreferrer">Original V1 <Icon name="external-link" size={12} /></a><a className={p.version} href="http://127.0.0.1:5174/#collection-top" target="_blank" rel="noreferrer">BoardUI V1 <Icon name="external-link" size={12} /></a></div></header>
    <main id="collection-top" tabIndex={-1} className={p.main}>
      <div className={p.intro}><div><h1>Reconciliation UI assets</h1><p>Verasett UI — Premium V2. The complete collection, refined from your references.</p></div><span className={p.note}>Independent V2 preview<br />All financial data is illustrative</span></div>
      <nav className={p.navigation} aria-label="Preview sections"><a href="#composition">Compositions <span>04</span></a><a href="#components">Components <span>10</span></a><a href="#screens">Product screens <span>09</span></a><a href="#designs">New designs <span>06</span></a><a href="#workflow-tools">Workflow tools <span>02</span></a><a href="#icons">Figma icons <span>{importedIconCount}</span></a><a href="#integration">Integration <Icon name="external-link" size={12} /></a></nav>
      <section id="composition" tabIndex={-1} className={p.section} aria-labelledby="composition-title">
        <div className={p.sectionHeading}><div><span className={p.sectionNumber}>01 / COMPOSITION</span><h2 id="composition-title">Four reconciliation compositions</h2></div><div className={p.toolbar}><AssetSegmentedControl label="Preview width" value={compact ? 'compact' : 'desktop'} onValueChange={value => setCompact(value === 'compact')} options={[{ value: 'desktop', label: 'Desktop' }, { value: 'compact', label: 'Compact' }]} /><label><input type="checkbox" checked={longNames} onChange={e => setLongNames(e.target.checked)} />Long names</label><label><input type="checkbox" checked={motion} onChange={e => setMotion(e.target.checked)} />Motion</label></div></div>
        <VariationPreview compact={compact} longNames={longNames} motion={motion} payments={payments} onReview={openReview} />
      </section>
      <section id="components" tabIndex={-1} className={p.section} aria-labelledby="components-title"><div className={p.sectionHeading}><div><span className={p.sectionNumber}>02 / COMPONENTS</span><h2 id="components-title">Individual assets</h2></div><p>Use together. Use independently.</p></div>
        <div className={p.catalog}>
          <article className={p.wide}><div className={p.assetLabel}>01 <span>IncomingPaymentsTable</span></div><IncomingPaymentsTable autoMatchLabel="Auto-matched 98.7%" /></article>
          <article><div className={p.assetLabel}>02 <span>BankStatementCard</span></div><BankStatementCard /></article>
          <article><div className={p.assetLabel}>03 <span>MatchingProgressCard</span></div><MatchingProgressCard /></article>
          <article><div className={p.assetLabel}>04 <span>ERPExportCard</span></div><ERPExportCard /></article>
          <article><div className={p.assetLabel}>05 <span>PaymentMatchCard</span></div><PaymentMatchCard /></article>
          <article><div className={p.assetLabel}>06 <span>ExceptionReviewCard</span></div><ExceptionReviewCard onReview={openReview} /></article>
          <article><div className={p.assetLabel}>07 <span>DeductionDetailCard</span></div><DeductionDetailCard /></article>
          <article><div className={p.assetLabel}>08 <span>MatchMetric</span></div><MatchMetric /></article>
          <article><div className={p.assetLabel}>09 <span>StatusPill</span></div><div className={p.pillBoard}>{(['Matched', 'Review', 'Pending', 'Evidence pending', 'Export ready', 'Blocked'] as const).map(status => <StatusPill key={status} status={status} />)}</div></article>
          <article><div className={p.assetLabel}>10 <span>WorkflowConnector</span></div><div className={p.connectorBoard}><span>Bank input</span><WorkflowConnector /><span>Reconciliation</span><WorkflowConnector /><span>ERP export</span></div></article>
        </div>
      </section>
      <ScreenGallery />
      <DesignGallery />
      <WorkflowTools />
      <IconSources sectionNumber="06" boardui />
      <section id="integration" tabIndex={-1} className={p.integration} aria-labelledby="integration-title"><div><span className={p.sectionNumber}>07 / INTEGRATION</span><h2 id="integration-title">Ready for your existing website</h2><p>Copy both component folders. Import the composition.<br />Map the scoped tokens to your design system.</p><span className={p.note}>Scoped V2 theme. No additional UI dependencies.</span></div><pre><code>{`import { ReconciliationHeroVisual }\n  from './components/verasett-ui-assets';\n\n<ReconciliationHeroVisual\n  onReview={openReview}\n/>`}</code></pre></section>
    </main>
    <footer className={p.footer}><span>verasett / Product UI assets</span><span>Fictional records. Explicit review. Controlled handoff.</span><span>Icons: <a href="https://github.com/krystonschwarze/coolicons">coolicons / Kryston Schwarze</a> · <a href="https://www.figma.com/community/file/886554014393250663/free-icon-pack-1800-icons">Lets Icons / Leonid Tsvetkov</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> · Adapted for Verasett</span></footer>
    <dialog ref={dialog} className={p.dialog} aria-labelledby="review-title"><div className={p.dialogHead}><span className={p.sectionNumber}>ILLUSTRATIVE REVIEW</span><button type="button" onClick={() => dialog.current?.close()} aria-label="Close review"><Icon name="close" size={20} /></button></div><h2 id="review-title">Review payment</h2><p className={p.reviewReference}>{review}</p><StatusPill status="Review" /><p>{reviewReason}.</p><div className={p.reviewNotice}>No payment has been applied. A controller must verify the remittance and invoice allocation before this record can proceed.</div><p className={p.note}>This is a read-only example. No bank or ERP is connected.</p></dialog>
  </div>;
}

