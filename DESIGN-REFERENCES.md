# Reference decisions

The four user-supplied screenshots were viewed individually and compared with the initial rendered preview. They guide structure, not branding or product claims. The working project and original ten components were retained.

| Reference | Observed structure | Applied to Verasett |
| --- | --- | --- |
| 1 — Transaction List | Heading precedes compact summary values; status views sit immediately above a search/filter/export row; the table occupies one continuous surface. | One panel with a short heading, three inline batch totals, status views, search/filter/export toolbar, and four records. No sidebar or multiple detached KPI cards. |
| 2 — Revenue Transactions | Restrained grid, left selection column, low hierarchy column labels, strong numerical alignment and regular rows. | 36px nominal header, 52px body rows, 13px desktop data, 11px headers, right-aligned tabular amounts and compact 22px status pills. Six rendered columns include selection plus five financial fields. |
| 3 — Reconciliation | Summary information remains immediately attached to the detailed reconciliation records; whitespace and dividers establish hierarchy. | Batch sums use the same underlying fictional records. Thin vertical separators divide inline metrics; one lower-contrast table header divides controls from data. |
| 4 — Transaction Management | Search and filter controls align with export, row checkboxes stay in one narrow track, badges have consistent dimensions, footer communicates record position. | Functional search and filter controls, select-all/partial selection, consistent textual badges, local demo CSV, and “4 of 4 payments.” No pretend pagination for four rows. |

## Comparison against initial implementation

- The initial 860px composition had three cards above the table and two large details below it. The refined 960px composition makes the five-column panel primary and places the workflow in one attached footer; secondary details are optional.
- Summary metrics are small inline values, not additional cards. All three are derived from the displayed batch; no performance percentage appears in the new panel.
- Payment references, amounts, customers, invoice allocation and status share fixed column tracks. Amounts in all four rows terminate at the same measured x coordinate.
- Controls perform real local preview actions. Review opens a read-only explanation and never approves or applies a payment.
- On narrow containers, the amount/status columns remain visible; customer/allocation move beneath the reference instead of overflowing horizontally.

## Intentional differences

The user's subsequent direction supersedes the original dark palette: the final library uses self-hosted Geist, white surfaces, a light mineral canvas, graphite text and muted green/amber states. Original Verasett content and eight-pixel corners replace the source products' branding and data. No gradients, glows, sidebars or colorful backdrops are used. Four rows are sufficient for a hero asset. No page settings, unrelated charts, generic navigation or decorative floating cards were imported.

## Additional variations requested October 11

- **PaymentLedger:** keeps the reference tables' continuous surface, 36px column header and aligned amount track. Two text lines share each 64px row, placing customer beneath reference and removing the need for another wide column. One batch total replaces three inline summaries. Search and local export remain real controls.
- **PaymentReviewQueue:** uses a connected list-detail relationship instead of floating exception cards. Selection exposes the candidate amount, exact difference and evidence. Amber remains restricted to the exception and difference. Compact rows bring the selected evidence closer on mobile; unknown invoice amounts stay explicit.
- **PaymentAllocationView:** applies the reconciliation reference's summary-detail relationship to one payment. A narrow bank receipt column anchors the amount beside three 48px invoice rows, selected total and visible difference. Muted green signals exact equality only when allocation validation passes.

These are structural alternatives in one library. All retain Geist, small radii, restrained borders, tabular amounts and original fictional Verasett content. No new dependencies were added. Local Tremor table anatomy and shadcn text/focus conventions were consulted; their implementations were not copied.

## Eight product screens (October 12)

All four original screenshots were inspected again before the expansion. Run Overview applies compact summary metrics directly above payment records (references 1/3); Deduction Breakdown uses precise row/column tracks and a selected detail panel (references 2/4); Match Detail and Controller Approval use invoice tables with adjacent evidence rather than floating cards (reference 3); Export uses a balanced line table and explicit footer controls (reference 2/4); Audit uses a restrained event table with linked evidence; Intake uses a small source-readiness table. The gallery is preview chrome only, not a product sidebar or rebuilt website.

Native local interactions drive each useful control. All eight screens share existing Geist, --va tokens, small border radii, muted text, status geometry and table rules. INR samples and evidence are explicitly illustrative. Existing Incoming Payments and its original preview remain intact.

## Six additional design directions (October 12)

The user explicitly asked for different designs rather than recolors or repetitions. Three independent workers each implemented two structures, using the same Geist and light/mineral tokens:

- Allocation matrix: cross-tab invoice columns, allocation-basis rows, highlighted selection and attached tracing note; narrow containers inspect one column at a time.
- Reconciliation proof: a numbered working paper with a prominent exact equation, numbered evidence disclosures and acknowledgement line.
- Remittance inbox: source correspondence list and an inset reading document; invoice references are source annotations rather than a dashboard result table.
- Close readiness: three connected control stages with small rows and in-place detail, rather than metric cards or a payment queue.
- Settlement journal: a vertical time rail joining full-width receipt records, each with inline evidence disclosure.
- Clearing worksheet: accounting document with receipt/adjustment debit columns, receivable credits and an attached pending-controller-review strip.

Reference-derived principles remain: intentional column tracks and aligned numerals (references 2/4), attached contextual controls (references 1/4), and compact hierarchy between summaries and records (reference 3). No source branding or transaction content is reused. Original inline SVG primitives remain until Figma asset inspection succeeds and source/license are verified. No icon connector/OAuth access was used during this expansion.

## One-page collection

All previews now share one page shell, one main landmark and one review dialog. The order is compositions, small assets, nine product screens, six additional designs, and integration. No asset is hidden behind a gallery switch. Hash links are section anchors and preserve local inspection state. Product screens/designs keep their own width controls. Reusable component code remains independent of the preview architecture.

## BoardUI free-source adaptation — duplicate edition

The user requested that this update move to a new duplicate link while preserving the previous preview. Only this edition at port 5174 contains the adaptations. The original at port 5173 is restored to its previous source/build. Both keep the same continuous-page structure.

Actual public source reviewed: BoardUI Data Table, File Upload, Notification Center and Segmented Control. The repository's MIT license is bundled. Source provenance/hashes live in work/boardui-source-manifest.json; main was retrieved October 13, 2026, without an independently verified immutable commit.

Deliberate adaptations:
- Data Table: directional sort affordances inside existing headers; amount labels remain right-aligned, with chevrons on the left. Density control sits in the footer so the toolbar retains search/filter/export hierarchy. Active filters appear as removable chips. Four records do not need pagination.
- File Upload: compact dashed selector and metadata row. Removed the upstream simulated random progress/completion to preserve accurate local selection semantics. Its selected state is unverified evidence.
- Notification Center: counted All/Unread controls, grouped rows and independent read-state tracking. Replaced avatars and unrelated events with bank input, matching/review and controlled handoff trace disclosures.
- Segmented Control: inset neutral track, white selected segment, native keyboard focus/activation. Replaces repeated preview-width styling and serves table density; no animated floating thumb.

Local shadcn button and Tremor table implementations informed focus/disabled states and semantic table boundaries; their source was inspected, not copied. Existing Geist, surfaces, typography and --va tokens remain the foundation. No black/purple gradients, charts, glow or extra KPI cards were added.

No Figma or Remix icon asset was imported. The current Remix upstream license differs from the Apache label on BoardUI's license page; no unverified SVG source was used. New UI uses original existing icons.
