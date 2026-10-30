import { PreviewAsset } from './PreviewAsset';
import { Icon } from '../components/icons';
import { VerasettIncomingPayments } from '../components/verasett-ui-assets/VerasettIncomingPayments';
import { ReconciliationRunScreen } from '../components/verasett-ui-assets/ReconciliationRunScreen';
import { PaymentMatchDetailScreen } from '../components/verasett-ui-assets/PaymentMatchDetailScreen';
import { DeductionBreakdownScreen } from '../components/verasett-ui-assets/DeductionBreakdownScreen';
import { ExceptionReviewScreen } from '../components/verasett-ui-assets/ExceptionReviewScreen';
import { ControllerApprovalScreen } from '../components/verasett-ui-assets/ControllerApprovalScreen';
import { ERPExportPreviewScreen } from '../components/verasett-ui-assets/ERPExportPreviewScreen';
import { ReconciliationAuditScreen } from '../components/verasett-ui-assets/ReconciliationAuditScreen';
import { ReconciliationIntakeScreen } from '../components/verasett-ui-assets/ReconciliationIntakeScreen';
import g from './screen-gallery.module.css';

export const galleryScreens = [
  {id:'incoming',label:'Incoming Payments',component:'VerasettIncomingPayments',stage:'Bank receipts',description:'The original incoming-payment asset, retained with its separate USD sample.'},
  {id:'run',label:'Reconciliation Run',component:'ReconciliationRunScreen',stage:'Batch overview',description:'Input readiness, matched proposals and the received value held for review.'},
  {id:'match',label:'Match Detail',component:'PaymentMatchDetailScreen',stage:'Deterministic allocation',description:'One INR receipt, three invoices and explicit evidence behind the selected allocation.'},
  {id:'deductions',label:'Deduction Breakdown',component:'DeductionBreakdownScreen',stage:'Accounting treatment',description:'Separate claimed deductions from verified evidence and proposed accounting outcomes.'},
  {id:'exceptions',label:'Exception Review',component:'ExceptionReviewScreen',stage:'Human review',description:'Unresolved attribution and missing evidence stop automatic application.'},
  {id:'approval',label:'Controller Approval',component:'ControllerApprovalScreen',stage:'Approval boundary',description:'Explicit checks and local approval/hold simulations. No production operations.'},
  {id:'export',label:'ERP Export Preview',component:'ERPExportPreviewScreen',stage:'Controlled handoff',description:'Inspect balanced clearing lines, controller approval and simulated batch preparation.'},
  {id:'audit',label:'Audit Trail',component:'ReconciliationAuditScreen',stage:'Decision provenance',description:'A later illustrative snapshot tracing source evidence through an approved export preview.'},
  {id:'intake',label:'Source Intake',component:'ReconciliationIntakeScreen',stage:'Input evidence',description:'Uploaded statements, detached remittance and open AR, with validation gaps kept visible.'},
] as const;
const components = {incoming:VerasettIncomingPayments,run:ReconciliationRunScreen,match:PaymentMatchDetailScreen,deductions:DeductionBreakdownScreen,exceptions:ExceptionReviewScreen,approval:ControllerApprovalScreen,export:ERPExportPreviewScreen,audit:ReconciliationAuditScreen,intake:ReconciliationIntakeScreen};

export function ScreenGallery() {
  return <section id="screens" tabIndex={-1} className={g.collection} aria-labelledby="screens-title">
    <div className={g.collectionHeading}><div><p className={g.kicker}>03 / PRODUCT SCREENS</p><h2 id="screens-title">Reconciliation, end to end.</h2><p>Nine screens in one continuous collection. Each simulation keeps its own local state.</p></div><a href="#collection-top">Back to index <Icon name="arrow-up" size={14} /></a></div>
    <nav className={g.navigation} aria-label="Product screen gallery">{galleryScreens.map((screen,index)=><a key={screen.id} href={`#screens/${screen.id}`}><span>{String(index+1).padStart(2,'0')}</span>{screen.label}</a>)}</nav>
    {galleryScreens.map((screen, index) => {
      const Screen = components[screen.id];
      return <PreviewAsset key={screen.id} id={screen.id} kind="screen" label={screen.label} eyebrow={`${String(index + 1).padStart(2, '0')} / ${screen.stage}`} description={screen.description} component={screen.component}><Screen /></PreviewAsset>;
    })}
  </section>;
}
