'use client';
import { useId, useState } from 'react';
import type { AssetProps } from './types';
import { cx, Icon } from './shared';
import { formatINR } from './product-format';
import { demoRemittanceDocuments, type RemittanceDocument } from './remittance-inbox-data';
import base from './assets.module.css';
import s from './remittance-inbox.module.css';

export interface RemittanceInboxProps extends AssetProps {
  documents?: readonly RemittanceDocument[];
  initialDocumentId?: string;
  onDocumentSelect?: (documentId: string) => void;
}
const validAmount = (value: number) => Number.isSafeInteger(value) && value >= 0;
const amount = (value: number) => validAmount(value) ? formatINR(value) : 'Amount unavailable';
function documentValid(document: RemittanceDocument) {
  const references = document.lines.map(line => line.reference.trim());
  return Boolean(document.id.trim() && document.paymentReference.trim()) && validAmount(document.receivedMinor)
    && document.receivedMinor > 0 && references.length > 0 && references.every(Boolean)
    && new Set(references).size === references.length
    && document.lines.every(line => validAmount(line.faceMinor) && line.faceMinor > 0 && line.evidence === 'located' && line.sourceLocation.trim())
    && document.adjustments.every(adjustment => validAmount(adjustment.amountMinor));
}
function DocumentPane({ document }: { document: RemittanceDocument }) {
  const valid = documentValid(document);
  const located = document.lines.filter(line => line.evidence === 'located' && line.reference.trim() && line.sourceLocation.trim()).length;
  return <>
    <div className={s.paneToolbar}><span><Icon name="file" />{document.sourceLabel}</span><span>{document.sourceFormat}</span></div>
    <article className={s.paper} aria-label="Selected remittance transcript">
      <div className={s.documentTop}><span className={s.overline}>DOCUMENT TRANSCRIPT</span><span className={s.page}>01 / 01</span></div>
      <h3>Remittance advice</h3>
      <dl className={s.documentMeta}><div><dt>From</dt><dd>{document.customer || 'Customer not identified'}</dd></div><div><dt>Reference</dt><dd>{document.id || 'Missing document reference'}</dd></div><div><dt>Payment</dt><dd>{document.paymentReference || 'Missing payment reference'}</dd></div></dl>
      <p className={s.message}>{document.message}</p>
      <div className={s.extractionHeading}><strong>Invoice references in document</strong><span>{located} located</span></div>
      {document.lines.length > 0 ? <table className={s.invoiceTable}><caption className={s.srOnly}>Invoice references transcribed from the selected remittance</caption><thead><tr><th scope="col">Invoice reference</th><th scope="col">Face amount</th><th scope="col">Source evidence</th></tr></thead><tbody>{document.lines.map((line, index) => <tr key={`${line.reference}-${index}`}><th scope="row" data-label="Invoice reference"><span className={s.lineNumber}>{String(index + 1).padStart(2, '0')}</span><span className={s.reference}>{line.reference || 'Reference missing'}</span></th><td data-label="Face amount" className={s.numeric}>{amount(line.faceMinor)}</td><td data-label="Source evidence"><span className={s.evidenceText} data-state={line.evidence}>{line.evidence === 'located' && line.reference.trim() && line.sourceLocation.trim() ? 'Reference located' : 'Reference incomplete'}</span><small>{line.sourceLocation || 'Source location missing'}</small></td></tr>)}</tbody></table> : <p className={s.emptyReferences}>No invoice references supplied. Allocation remains unresolved.</p>}
      {document.adjustments.length > 0 && <section className={s.adjustments} aria-label="Document adjustment claims"><div className={s.extractionHeading}><strong>Adjustment details supplied</strong><span>Separate evidence</span></div><dl>{document.adjustments.map((adjustment, index) => <div key={`${adjustment.label}-${index}`}><dt>{adjustment.label}<small>{adjustment.evidence || 'Evidence not supplied'}</small></dt><dd>{amount(adjustment.amountMinor)}</dd></div>)}</dl></section>}
      <div className={s.received}><span>Remitted amount<span>Stated in this advice</span></span><strong>{amount(document.receivedMinor)}</strong></div>
      <p className={s.documentNote}>{document.note}</p>
    </article>
    <div className={s.evidenceFooter} data-state={valid && document.status === 'linked' ? 'linked' : 'review'}><Icon name={valid && document.status === 'linked' ? 'check' : 'review'} /><div><strong>{valid && document.status === 'linked' ? 'Document references available' : 'Further evidence required'}</strong><p>{valid && document.status === 'linked' ? 'Document reading is complete; eligibility and approval remain separate controls.' : 'Hold the proposed allocation until missing or inconsistent evidence is resolved.'}</p></div></div>
  </>;
}

/** A local document selection view; no file access, extraction service or approval operation. */
export function RemittanceInbox({ documents = demoRemittanceDocuments, initialDocumentId, onDocumentSelect, className, style }: RemittanceInboxProps) {
  const id = useId();
  const [selectedIndex, setSelectedIndex] = useState(() => Math.max(0, documents.findIndex(document => document.id === initialDocumentId)));
  const selected = documents[selectedIndex] ?? documents[0];
  const select = (index: number) => { setSelectedIndex(index); onDocumentSelect?.(documents[index].id); };
  return <section className={cx(base.asset, s.inbox, className)} style={style} aria-labelledby={`${id}-title`}>
    <header className={s.header}><div><span className={s.overline}>SOURCE CORRESPONDENCE</span><h2 id={`${id}-title`}>Remittance inbox</h2><p>Read the advice. Trace every reference.</p></div><span className={s.demoTag}>Illustrative documents</span></header>
    <div className={s.workspace}>
      <nav className={s.sourceList} aria-label="Remittance documents"><div className={s.listHeading}><h3>Received advice</h3><span>{documents.length}</span></div><ol>{documents.map((document, index) => <li key={`${document.id}-${index}`}><button type="button" aria-pressed={selected === document} aria-controls={`${id}-document`} onClick={() => select(index)} className={s.sourceButton}><span className={s.sourceTop}><span>{document.id || 'Unreferenced advice'}</span><span className={s.statusDot} data-state={document.status} /></span><strong>{document.customer || 'Unidentified customer'}</strong><span className={s.sourceAmount}>{amount(document.receivedMinor)}</span><span className={s.sourceBottom}><span>{document.status === 'linked' && documentValid(document) ? 'References located' : document.status === 'pending' ? 'References missing' : 'Evidence review'}</span><span>{document.receivedAt}</span></span></button></li>)}</ol><p className={s.listFoot}>Uploaded sample files<br />No connected mailbox</p></nav>
      <div id={`${id}-document`} className={s.readingPane}>{selected ? <DocumentPane document={selected} /> : <div className={s.empty} role="status"><Icon name="file" /><h3>No remittance documents</h3><p>Add illustrative records through the documents property to preview the reading workflow.</p></div>}</div>
    </div>
    <footer className={s.footer}><span>Fictional source material · Local preview</span><span>Evidence reading ≠ approval</span></footer>
  </section>;
}
