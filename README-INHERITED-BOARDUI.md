# Verasett UI assets — BoardUI edition

An isolated React component library and preview for a deterministic AR reconciliation marketing visual. It uses self-hosted Geist, white surfaces, a light mineral canvas, graphite text, and restrained green/amber states. There are no gradients or glows. This project does not contain or modify the Verasett website. All financial records are fictional. The components do not connect to banks, reconcile ledgers, approve deductions, or post to an ERP.

## Run the preview

Use Node.js 24 LTS (Node 24.18.0 verified). From this folder:

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:5174/#collection-top`. All 4 compositions, 10 small assets, 9 product screens 6 additional designs and 2 workflow tools are displayed in sections on this one page. Top links and section indexes scroll within the document. Controls let you check long names, motion, and a 320px embedded container. Review actions open a local, read-only example. No bank, ERP or accounting actions occur.

The composition section shows **all four variations together**: Workflow, Payment ledger, Review queue, and Invoice allocation. Each remains a reusable component. The ten original small assets remain in the catalog below.

```sh
npm test
npm run lint
npm run build
npm run preview -- --port 4173
```

Only React and ReactDOM are runtime dependencies. Vite, TypeScript, ESLint, Vitest and Testing Library are development tooling. Versions are pinned in the lockfile. Live npm metadata was checked on October 10, 2026: TypeScript 7.0.2 was latest, while typescript-eslint 8.71.1 required `>=4.8.4 <6.1.0`. TypeScript 6.0.3 was selected as the newest compatible release instead of overriding peer checks.

## Integrate into the existing website later

1. Copy both `src/components/verasett-ui-assets/` (including `fonts/`, `BOARDUI-LICENSE.txt` and `THIRD-PARTY-NOTICES.md`) **and** its sibling `src/components/icons/` into your website's component directory. Keep their sibling relationship because the assets import the shared icons. Preserve `icons/ATTRIBUTION.md`, `icons/CC-BY-4.0.txt`, and source provenance, and provide creator/license credit with the shipped site or documentation. Colocated tests are optional if the host uses different test tooling.
2. Your host needs React 18+ and CSS Modules support (Vite and Next.js support this). Keep the existing site's router, dependencies, entry point, and global CSS. Do not copy this project's `src/main.tsx`, `src/preview/`, HTML shell, or build configuration into the website.
3. Import a composition or an individual component from the directory's `index.ts`. The components import their own CSS Module; no global stylesheet or provider is required.

```tsx
import { ReconciliationHeroVisual } from './components/verasett-ui-assets';

export function ExistingHeroMedia() {
  return <ReconciliationHeroVisual />;
}
```

`ReconciliationHeroVisual` accepts `payments`, `match`, `completed`, `total`, `showDetails`, `onReview`, `motion`, `className`, and `style`. The default hero uses the new five-column `VerasettIncomingPayments` and an integrated workflow footer. The original ten assets remain available independently. Set `showDetails` to opt into the match/exception details below the main panel. Motion is off by default. Pass `onReview(reference)` to connect the review action to a host workflow; without it the table status remains a static label and the standalone exception button is disabled. Do not turn the demonstration into a silent approval flow.

```tsx
import { VerasettIncomingPayments } from './components/verasett-ui-assets';

// Use just the primary panel, without the workflow footer.
<VerasettIncomingPayments onReview={openReview} />
```

`VerasettIncomingPayments` accepts `payments: readonly IncomingPayment[]`, `title`, `showSummary`, `onReview`, `onExport`, `className`, and `style`. `IncomingPayment` extends `Payment` with `invoiceAllocation: string`; references must be unique. Search matches reference, customer and allocation. Tabs and the status selector share one filter. Totals describe the entire supplied batch, while the footer reports the visible subset. Selection/export apply only to visible records; hidden selections are excluded. A Clear selection action remains available at compact widths. `onExport(records)` overrides the default local CSV download. The built-in CSV explicitly marks each row Illustrative, quotes cells, and neutralizes formula-like text. It is an inspection export, not a posting file or an approval action.

For Next.js, components are client-compatible. Their files declare `use client`; callbacks must be supplied from another client component. A static composition can be rendered from a server page without callbacks.

## Additional layout variations

```tsx
import {
  PaymentLedger, PaymentReviewQueue, PaymentAllocationView,
} from './components/verasett-ui-assets';

// Dense ledger with search and a local illustrative CSV export.
<PaymentLedger onReview={openReview} />

// Selecting a record reveals its exception and evidence; it never approves it.
<PaymentReviewQueue onReview={openReview} />

// Exact allocation example: $8,000 + $3,000 + $1,450 = $12,450.
<PaymentAllocationView />
```

| Import | Props | Layout and behavior |
| --- | --- | --- |
| `PaymentLedger` | `payments?: readonly IncomingPayment[]`, `onReview?`, `onExport?`, `className?`, `style?` | Four-column ledger, customer under reference, batch total, functional search and export of visible records. Allocation moves beneath the reference on narrow containers. |
| `PaymentReviewQueue` | `payments?: readonly ReviewPayment[]`, `onReview?`, `className?`, `style?` | Connected exception list and selected evidence panel. Native buttons support keyboard selection. Review is disabled without a callback. |
| `PaymentAllocationView` | `match?: PaymentMatch`, `customer?`, `className?`, `style?` | Bank receipt and invoice table, exact total and difference. Invalid, duplicate or unbalanced allocations show Needs review; none of these views post to an ERP. |

`ReviewPayment` is exported. It includes reference, customer, integer-cent `amountMinor`, status (`Needs review`, `Evidence pending`, or `Blocked`), reason, evidence, optional `candidateAmountMinor`, and optional `claimedDeductionMinor`. Missing candidate amounts display “Amount not established”; no difference is invented. A claimed deduction is always labeled unverified. The separate fictional fixtures are in `variation-data.ts`. The preview's three-record exception queue is a separate illustrative dataset from the four-record incoming batch.

All variations share the same `--va-*` tokens and bundled Geist. They use container queries at 640px, so they adapt to their host slot instead of depending on page-wide positioning. At narrow widths the review list stacks above the evidence panel and the bank receipt stacks above invoice allocation.

## Independent components

All components below are named exports. Their TypeScript prop types are also exported. Every root accepts `className` and `style`.

| Import | Main configurable properties | Purpose |
| --- | --- | --- |
| `VerasettIncomingPayments` | `payments`, `title`, `showSummary`, `onReview`, `onExport` | Reference-informed five-column table with inline batch totals, search, filters, selection and local illustrative export. |
| `IncomingPaymentsTable` | `payments`, `title`, `subtitle`, `autoMatchLabel`, `onSelectPayment` | Semantic table, optional reference buttons, empty state. Default summary is omitted. Passing a summary adds a visible “Demo summary” label. |
| `BankStatementCard` | `label`, `secondaryLabel` | Source receipt, no filenames. |
| `MatchingProgressCard` | `completed`, `total`, `label`, `status` | Accessible determinate progress. Counts are normalized to finite, safe, nonnegative integers and completion is clamped to total. Zero total has an explicit empty state. |
| `ERPExportCard` | `label`, `secondaryLabel`, `supportingLabel` | Prepared output awaiting review. |
| `PaymentMatchCard` | `match` | Exact integer-cent invoice allocation; inconsistent examples show Review instead of Matched. |
| `ExceptionReviewCard` | `reference`, `reason`, `onReview`, `actionLabel` | Explicit human handoff; no auto-application. |
| `DeductionDetailCard` | `deductionType`, `claimedAmountMinor`, `evidenceStatus`, `resolution` | Claimed deduction remains distinct from verified evidence. |
| `MatchMetric` | `value`, `label`, `supportingLabel` | Counts, formatted currency, or percentages as display values. |
| `StatusPill` | `status` | Matched, Review, Needs review, Pending, Evidence pending, Export ready, Blocked. Text is always visible. |
| `WorkflowConnector` | `direction`, `showNode` | Decorative horizontal/vertical directional connector; hidden from screen readers. |

```tsx
import {
  IncomingPaymentsTable, MatchingProgressCard, MatchMetric,
  PaymentMatchCard, StatusPill, type Payment,
} from './components/verasett-ui-assets';

const rows: Payment[] = [{
  reference: 'DEMO-1001', amountMinor: 1245000,
  customer: 'Example Company', status: 'Matched',
}];

// Explicitly illustrative: $8,000.00 + $3,000.00 + $1,450.00 = $12,450.00.
const match = {
  reference: 'DEMO-1001', amountMinor: 1245000,
  invoices: [
    { reference: 'DEMO-INV-1', amountMinor: 800000 },
    { reference: 'DEMO-INV-2', amountMinor: 300000 },
    { reference: 'DEMO-INV-3', amountMinor: 145000 },
  ],
};

export function Examples() {
  return <>
    <IncomingPaymentsTable payments={rows} autoMatchLabel={null} />
    <MatchingProgressCard completed={9} total={18} />
    <PaymentMatchCard match={match} />
    <MatchMetric value="$12,450.00" label="Received amount" />
    <StatusPill status="Evidence pending" />
  </>;
}
```

## Theme and sizing

These are standalone library defaults, **not** recovered website tokens. CSS Modules scope every component selector. The only shared CSS declaration is the uniquely named `Verasett Geist` font face. No global reset, remote font request, page-wide positioning, icon package, or animation package ships with the assets. Map the public custom properties to your site's verified tokens on an ancestor:

```css
.existingHeroMedia {
  --va-font: "Verasett Geist", sans-serif;
  --va-surface: #ffffff;
  --va-surface-raised: #f4f6f5;
  --va-border: #dfe4e2;
  --va-text: #202629;
  --va-muted: #677277;
  --va-blue: #486c69;
  --va-green: #356d52;
  --va-amber: #88611c;
  --va-radius: 8px;
}
```

The legacy token name `--va-blue` now controls the restrained slate-green process/focus accent. Geist's Latin variable WOFF2 is bundled from `@fontsource-variable/geist` 5.3.0 (live metadata checked October 10, 2026), under SIL OFL 1.1. The included `fonts/OFL.txt` carries attribution and license terms. There is no font CDN dependency. To use a licensed Suisse Intl installation later, override `--va-font` with your host's existing font face; no Suisse font files are included.

The hero has a natural maximum width of 960px and fills available space. Container queries also handle narrow embeds on wide pages. Below 620px, the new table places customer and allocation under the reference, keeping amounts and statuses visible; nonessential bulk selection is hidden. Below 560px, workflow cards stack and connectors turn vertical. The original four-column table collapses at 560px. Full customer text stays available to assistive technology and in the cell title. Do not scale the whole component down with CSS transforms; give it its actual layout width.

## Semantics and motion

- Every financial table and financial detail panel identifies illustrative data. Workflow cards carry explicit illustrative accessible labels and appear within the labeled demo composition. The default hero shows only totals derived from its four fictional rows: $41,440.00 received, $37,120.00 matched, $4,320.00 requiring review. The optional 98.7% label belongs only to the original `IncomingPaymentsTable`, which labels it as a demo summary.
- The revised ACH-78421 row specifies three invoices. Its matching detail is $8,000.00 + $3,000.00 + $1,450.00 = $12,450.00. The hero's “Payments checked” count deliberately differs from “payments matched”: a checked record can still require review. The independently reusable progress card retains the requested 18 / 18 sample.
- `sample-data.ts` owns the sample records. Individual amounts use safe integer USD cents. Batch totals accumulate with BigInt and are formatted without floating-point loss, even when the aggregate exceeds the safe-number boundary. `formatMoney` rejects fractional or unsafe number inputs; it is formatting, not accounting software. No currency conversion or live accounting is implemented.
- Invoice allocations are exact display checks only. Duplicate invoice references, unsafe numbers, non-positive allocations, and mismatches cannot produce a Matched label.
- Pending evidence, claimed deduction, and human review remain explicit. ERP output is always preparation/review wording; CSV preparation does not establish posting.
- Native table, caption, scoped headers, text status labels, accessible progress and visible focus indicators are included. Icon-only decoration is hidden from assistive technology.
- `motion={true}` opts the hero into one short workflow entrance. No loop, spinner, row animation or fake live activity. `prefers-reduced-motion: reduce` disables transitions and animation, including press transforms.

See `QA.md` for completed verification and `FILES.md` for exact delivered source paths.

## Product screens and isolated gallery

Open `http://127.0.0.1:5174/#screens/run` for the new nine-screen gallery. The original asset library remains at `#composition`; its four variations and ten small assets remain available. Gallery links are stable, independently accessible hash routes. No router package or backend was added.

| Gallery destination | Import | Main configurable props | Purpose |
| --- | --- | --- | --- |
| `#screens/incoming` | `VerasettIncomingPayments` | Existing props | Retained USD payment table with its separate original illustrative records. |
| `#screens/run` | `ReconciliationRunScreen` | `run` | Source readiness, payment-level results, matched count and received amount held for review. |
| `#screens/match` | `PaymentMatchDetailScreen` | `match` | INR invoice bundle, deductions, arithmetic and separately visible attribution evidence. |
| `#screens/deductions` | `DeductionBreakdownScreen` | `claims` | Inspect TDS, discount, fee, withholding and short-payment claims; unsupported claims stay held. |
| `#screens/exceptions` | `ExceptionReviewScreen` | `exceptions` | Select an exception and inspect missing evidence, balance difference and next action. |
| `#screens/approval` | `ControllerApprovalScreen` | `match` | Simulate pending/approved/held state after explicit controller checks. |
| `#screens/export` | `ERPExportPreviewScreen` | `lines`, `batchId`, `runId`, `paymentReference`, `customer`, `customerReference`, `targetLabel`, `controllerApproval`, `evidenceConfirmed`, `allowSimulation` | Balanced debit/credit clearing preview with separate approval and preparation states. |
| `#screens/audit` | `ReconciliationAuditScreen` | `events`, `runId`, `paymentReference`, `batchId`, `customer`, `dateLabel` | Select a timestamped provenance event and inspect linked evidence. |
| `#screens/intake` | `ReconciliationIntakeScreen` | `inputs`, `runId` | Uploaded source readiness and a missing-AR simulation. |

All eight new screen roots accept `className` and `style`. Their prop types and financial data types are exported from the library. Copy the entire existing component directory as described above; no gallery files are required for website integration.

```tsx
import {
  PaymentMatchDetailScreen, ControllerApprovalScreen,
  ReconciliationRunScreen, ERPExportPreviewScreen,
} from './components/verasett-ui-assets';

<PaymentMatchDetailScreen />
<ControllerApprovalScreen />
<ReconciliationRunScreen />
<ERPExportPreviewScreen allowSimulation={false} />
```

### Shared screen primitives

`product-shared.tsx` provides ScreenFrame, ScreenStatus, MetricSummary, DataTable, EvidenceList and Notice. They extend the existing Geist/--va-* system with consistent status geometry, 36px table headers, aligned amounts and compact data rows. Full-width tables become labeled records on narrow containers; invoice tables keep columns until their own narrow breakpoint. No details are dropped merely to hide overflow.

`product-data.ts` owns the common illustrative run and match, `deduction-exception-data.ts` owns review/deduction fixtures, and `export-audit-data.ts` owns clearing lines and provenance. Generic labels such as “Illustrative customer A” are intentional, not real customer identities. The original USD examples remain a separate dataset.

### Financial and approval boundaries

The shared INR example uses **integer paise**: receipt 184000000, invoice face value 186000000, TDS 1400000, approved sample discount 500000 and bank fee 100000. Thus ₹18,60,000 − ₹14,000 − ₹5,000 − ₹1,000 = ₹18,40,000. Three invoice face values are ₹8,00,000, ₹6,00,000 and ₹4,60,000. These are fixed illustrative categories, not tax rules or live calculations.

`formatINR` formats integers safely; `summarizeMatch` separately checks exact equality, valid/unique allocation references, configured eligibility flags and supplied evidence. UI checks do not prove real attribution. Zero variance alone cannot enable approval. Controller Approval requires both local checkboxes and eligible data; changed proposals reset the simulated approval.

The run total is ₹31,69,500 across four receipts; ₹13,29,500 is held for review. This held amount is not labeled an accounting variance. Matched and controller-approved remain different states.

ERP Export Preview shows receipt and adjustment **debits** equal to invoice **credits**, avoiding a doubled payment total. It starts with approval pending. “Use approved sample” and “Prepare demo export” only change local UI state: no files, downloads, bank calls or ERP writes occur. The target is a generic CSV template, not a claimed integration. Custom export lines or customer/payment identities need explicit `evidenceConfirmed` before preparation is available. The single receipt reference must match the displayed payment.

Audit Trail is explicitly a **later approved illustrative snapshot**, so it is not synchronized to the pending Controller Approval example. The events end at preparation, with no live posting event. In-page navigation preserves each screen's local simulation; use its explicit reset control when needed. Intake simulation changes only displayed readiness and does not read/upload files.

### Modular icons and verified Figma exports

Both editions use the same source-only icon module at `src/components/icons/`: **43 canonical names backed by 41 unique Figma SVG sources**. Every supported icon resolves to an exported source; there is no local or generated-geometry fallback. These files were exported through Figma's SVG download UI in IAB on October 14, 2026, without a connector or OAuth tool. The Coolicons batch archive contained 442 SVGs; only the required subset is included in the reusable library. The Lets Icons exports provide the folder and Money shapes.

Inspect all 43 keys in the same-page [Figma icon source sheet](http://127.0.0.1:5174/#icons). It renders the actual `Icon` component beside its exact Figma component name, creator family, source link and placement. Links identify search, matched/review/pending/blocked states, document and export cards, source intake, control disclosures, workflow arrows and the six design-navigation icons. The BoardUI edition also identifies sorting, removable filters and reconciliation activity. Unused public keys are explicitly labeled “Reusable API · shown in this source sheet”; the sheet does not claim they appear elsewhere in the product.

`source-svg/` retains source exports, `figma-paths.tsx` adapts them to React, and `provenance.json` records hashes, archive members, source scope and rendering changes. Batch-export links open the inspected Figma source page: those individual component nodes were not inspected, so no invented per-icon node links are provided. Individually selected exports retain their verified node links.

Two names remain compatibility aliases and are disclosed beside their previews:
- `bank` renders Coolicons `Navigation / Building_04`; a bank-specific source glyph was not verified.
- `dollar-sign` renders Lets Icons `Money`, a banknote rather than a literal dollar-sign shape.

Both inspected source licenses are **CC BY 4.0**: [Coolicons repository](https://github.com/krystonschwarze/coolicons) and [Free Icon Pack Community page](https://www.figma.com/community/file/886554014393250663/free-icon-pack-1800-icons). The earlier Coolicons CC0 description was incorrect. Preserve `ATTRIBUTION.md`, `CC-BY-4.0.txt` and source links, and give appropriate creator/license credit with the shipped site or documentation. The attribution file identifies rendering adaptations; no creator endorsement is implied.

`Icon` / `VerasettIcon` supports typed `name`, `size`, `title` and `strokeWidth` props on a 24×24 grid. The default outline width is **2px**, matching the source. Shapes use `currentColor`; filled shapes keep their fills instead of inheriting an extra outline. `<Icon name="folder" size={18} />` and `<FolderIcon size={18} />` are equivalent. Legacy names `file`, `review`, `arrow` and `blocked` resolve to the corresponding verified exports. Icons are decorative by default; pass `title` or an accessible label when an icon needs a name. Text still identifies every financial state.

Checkboxes, select arrows and native detail disclosure markers use inline masks of the same exact Figma SVGs; the native controls retain keyboard and accessibility behavior. Search controls suppress browser-specific decorative search/cancel glyphs. Connector lines, status dots and arithmetic operators remain functional layout/data elements rather than icon replacements. No new runtime dependency or network request is required.

Intake inputs use a `kind` field (`bank`, `remittance`, or `open-ar`). Missing required kinds or a blocked validation status prevent run readiness; simulation uses the kind rather than a hardcoded filename.

## Six structurally distinct design directions

The six designs appear below the product screens in the same continuous preview at `http://127.0.0.1:5174/#designs`. The earlier `#designs/matrix` and `#screens/run` URLs now scroll directly to those sections without replacing the page. These are independent layouts with different reading and inspection patterns, not theme/color variants.

| Route | Component | Structure and interaction | Configurable props beyond `className` / `style` |
| --- | --- | --- | --- |
| `#designs/matrix` | `AllocationMatrix` | Invoice-column allocation matrix; choose a column to trace cash and adjustments. Narrow containers show the selected invoice with a native selector. | `data`, `initialInvoiceReference`, `onSelectInvoice` |
| `#designs/proof` | `ReconciliationProofSheet` | Numbered financial working paper with a typeset equation, evidence disclosures and local acknowledgement. | `data`, `onReviewNoted` |
| `#designs/inbox` | `RemittanceInbox` | Source correspondence list with a document reading pane and transcribed invoice references. | `documents`, `initialDocumentId`, `onDocumentSelect` |
| `#designs/gates` | `CloseReadinessBoard` | Connected Evidence / Allocation / Release control gates, expandable rows and an explicit unresolved run state. | `controls`, `runId`, `initialExpandedControlId` |
| `#designs/journal` | `SettlementJournal` | Chronological receipt rail; evidence expands within each receipt entry. | `entries`, `title`, `dateLabel`, `runId`, `defaultExpandedIds` |
| `#designs/worksheet` | `ClearingWorksheet` | Accounting document with receipt debit, adjustment debit and AR credit columns; line-reference toggle and pending-review strip. | `lines`, `worksheetId`, `paymentReference`, `customer`, `customerReference`, `defaultShowReferences` |

```tsx
import {
  AllocationMatrix, ReconciliationProofSheet,
  RemittanceInbox, CloseReadinessBoard,
  SettlementJournal, ClearingWorksheet,
} from './components/verasett-ui-assets';

// Use one design inside an existing hero slot or product section.
<AllocationMatrix onSelectInvoice={setInspectedInvoice} />
<ReconciliationProofSheet />
<RemittanceInbox />
<CloseReadinessBoard />
<SettlementJournal />
<ClearingWorksheet defaultShowReferences />
```

All six prop interfaces and their input types are exported from the library barrel. Fixtures live beside each component in a separate `*-data.ts` file. Money values are integer paise. The matrix's illustrative invoice allocations split cash as ₹7,90,000 + ₹5,93,000 + ₹4,57,000 = ₹18,40,000; TDS, discount and fee allocations remain separate and reconcile each invoice exactly. This extra allocation detail is fictional display data, not a live reconciliation calculation.

The proof-sheet acknowledgement is a local reading record; it does not grant controller approval. The control board reports the supplied control set and has no release button. Journal disclosure changes visibility only. Worksheet balance never implies evidence approval or an ERP posting. Custom props must supply coherent identity/evidence records; validate real data in your host application.

Copy the existing component directory as described above; no extra dependencies, font, global stylesheet, backend, router or build configuration is required. The new designs use the same self-hosted Geist and scoped tokens. Each can be embedded independently. Every product screen and new design has its own Desktop / Compact control; original compositions share their width and long-name controls.

Current verification is recorded in `QA.md`; screenshots prefixed `screens-` cover the preceding nine-screen collection. Do not use those images as evidence for the six newer layouts.


## This edition and the preserved original

This is the requested duplicate preview. Updated local link: http://127.0.0.1:5174/#collection-top (workflow tools: #workflow-tools). Original link: http://127.0.0.1:5173/#collection-top.

All BoardUI adaptations live in `outputs/verasett-ui-assets-boardui`. The original `outputs/verasett-ui-assets` source and production build were restored against the previously SHA256-verified archive; that archive is unchanged. After restoration, an independent icon integration changed the original shared.tsx/index.ts and added src/components/icons. Those later edits were preserved. On October 14 the user explicitly authorized the verified Figma icon integration in both editions; both now share the icon module while their layouts and BoardUI-only features remain separate. The BoardUI changes remain only in this duplicate. The duplicate uses its own Vite cache and port. For this workspace only, node_modules is a junction to the original installed dependencies; source, build, configuration, documentation and screenshots are separate. Packaged delivery omits that junction. Run npm ci after extracting it elsewhere.

The duplicate's run-permanent.cmd / run-silent.vbs point only at this folder and start Vite on 127.0.0.1:5174. These local preview helpers do not deploy the project.

## BoardUI-derived controls and workflow tools

BoardUI's actual free GitHub source and MIT license were inspected on October 13, 2026. The following source/patterns were adapted to the existing light Geist styling, native React and CSS Modules. No Pro source, global Tailwind tokens, React Aria, TanStack Table, backend, extra fonts or runtime dependencies were imported. Complete attribution travels inside the reusable folder in THIRD-PARTY-NOTICES.md and BOARDUI-LICENSE.txt.

| Component | Reuse / new props | Behavior |
| --- | --- | --- |
| VerasettIncomingPayments | Existing API plus defaultDensity: 'compact' or 'comfortable', showDensityControl | Sort amount/reference ascending, descending, then source order; aria-sort; active search/status chips; focus recovery; filtered and selected CSV export. Density affects rows only. |
| AssetSegmentedControl | label, options: {value,label,disabled?}[], value, onValueChange | Controlled native toggle buttons with a single tab stop, arrow/Home/End focus movement, Space/Enter activation. Used for existing preview widths and table density. |
| SourceFileDropzone | allowedExtensions, maxBytes, disabled, label, onSelectionChange | Choose/drop one file; extension/byte/empty/multiple validation; replace/remove; callback returns metadata or null. Never reads contents, uploads files or verifies financial evidence. |
| ReconciliationActivity | events, title, snapshotLabel, initialFilter, initialExpandedEventId, onOpenRecord, onReadChange | All/unread counts, individual/bulk read actions, grouped operational events and expandable traces. Reading never approves, resolves or posts anything. |
| ReconciliationIntakeScreen | Existing API plus onLocalFileSelection; IntakeInput.available?: boolean | Existing intake includes the local selector. available: false and legacy 'Missing input' block readiness. Present remittance with reference gaps is received but remains in review. |

```tsx
import {
  AssetSegmentedControl, SourceFileDropzone, ReconciliationActivity,
  VerasettIncomingPayments, type SourceFileMetadata,
} from './components/verasett-ui-assets';

// Display only: integrate your host's evidence validation separately.
<SourceFileDropzone
  allowedExtensions={['csv', 'pdf']}
  maxBytes={4 * 1024 * 1024}
  onSelectionChange={(metadata: SourceFileMetadata | null) => setLocalMetadata(metadata)}
/>
<ReconciliationActivity events={yourIllustrativeEvents} />
<VerasettIncomingPayments defaultDensity="compact" showDensityControl />
<AssetSegmentedControl
  label="Preview width"
  options={[{ value: 'desktop', label: 'Desktop' }, { value: 'compact', label: 'Compact' }]}
  value={width}
  onValueChange={setWidth}
/>
```

Source metadata includes name, extension, sizeBytes and lastModified; no File/Blob is retained or supplied. Extension/size validation is UI convenience, not security validation. For production uploads, build a separate authorized storage and server validation flow.

Activity fixtures are in reconciliation-activity-data.ts. ACH-78421 remains a candidate awaiting approval; ACH-55231 remains unresolved. The prepared export concerns the separately reviewed WIRE-99302 receipt. Stable unique event IDs identify reading state only; callbacks do not mutate supplied financial statuses. Supply new IDs for genuinely new events.

IAB access recovered on October 14. Both supplied Figma files opened, and the duplicate preview passed an initial smoke check of its allocation disclosure and event read state. The screenshots in evidence/iab-retry-2026-10-14/ document that earlier retry. Current full-icon evidence is in evidence/all-icons-2026-10-14/; consult QA.md for the exact desktop/mobile verification boundary. The subsequent October 14 source-only integration provides 43 names from 41 unique Figma exports in both editions. All interface icons and form indicators use the supplied Figma sources; see the #icons section and QA.md for current verification. Remix icons were not imported.

### Embedded control icon delivery

Checkbox, select and native disclosure indicators embed the exact supplied source SVG as CSS data images. This avoids relative URL resolution problems in injected dev CSS. A host with a strict Content Security Policy must permit data: in its image policy or adapt these URLs to hosted copies and verify again.
