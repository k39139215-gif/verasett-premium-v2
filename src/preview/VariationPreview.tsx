import { PaymentLedger, PaymentReviewQueue, PaymentAllocationView, ReconciliationHeroVisual, type IncomingPayment } from '../components/verasett-ui-assets';
import { demoReviewPayments } from '../components/verasett-ui-assets/variation-data';
import p from './preview.module.css';

const variations = [
  { id: 'workflow', label: '01 Workflow', component: 'ReconciliationHeroVisual', description: 'The full bank-input-to-export story, anchored by the incoming payments table.' },
  { id: 'ledger', label: '02 Payment ledger', component: 'PaymentLedger', description: 'A quieter, denser ledger with customer context tucked beneath each payment reference.' },
  { id: 'review', label: '03 Review queue', component: 'PaymentReviewQueue', description: 'A connected exception list and evidence panel. Select a payment to inspect its difference.' },
  { id: 'allocation', label: '04 Invoice allocation', component: 'PaymentAllocationView', description: 'A single bank receipt beside its selected invoices, with an exact and visible amount check.' },
] as const;

export function VariationPreview({ compact, longNames, motion, payments, onReview }: { compact: boolean; longNames: boolean; motion: boolean; payments: readonly IncomingPayment[]; onReview: (reference: string) => void }) {
  const reviewPayments = longNames ? demoReviewPayments.map((payment, i) => ({ ...payment, customer: i === 0 ? payments[0]?.customer ?? payment.customer : payment.customer })) : demoReviewPayments;
  return <>
    <nav className={p.variationPicker} aria-label="Asset variations">{variations.map(variation => <a key={variation.id} href={`#composition/${variation.id}`}>{variation.label}</a>)}</nav>
    {variations.map(variation => <section key={variation.id} id={`composition/${variation.id}`} tabIndex={-1} className={p.compositionItem} aria-label={`${variation.component} composition`}>
      <h3>{variation.label}</h3><p className={p.variationDescription}>{variation.description}</p>
      <div className={p.stage}><div className={compact ? p.compact : p.full} data-variation-stage={variation.id}>
        {variation.id === 'workflow' && <ReconciliationHeroVisual payments={payments} onReview={onReview} motion={motion} />}
        {variation.id === 'ledger' && <PaymentLedger payments={payments} onReview={onReview} />}
        {variation.id === 'review' && <PaymentReviewQueue payments={reviewPayments} onReview={onReview} />}
        {variation.id === 'allocation' && <PaymentAllocationView customer={payments[0]?.customer} />}
      </div></div>
      <div className={p.stageCaption}><span>{variation.component}</span><span>Responsive · Scoped styles · Illustrative data</span></div>
    </section>)}
  </>;
}
