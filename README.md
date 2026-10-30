New full dashboard: http://127.0.0.1:5175/#dashboard. Reference-inspired dropdowns, cash chart, review queue and payment detail drawer. See [DASHBOARD.md](./DASHBOARD.md).

# Verasett UI — Premium V2

An isolated visual upgrade of the existing BoardUI edition. The original edition and BoardUI edition remain unchanged. Premium V2 owns its source, dependencies, CSS, configuration, build and evidence.

## Preview and compare

From this folder, run:

```sh
npm run dev
```

Open **http://127.0.0.1:5175/#screens/incoming**. The continuous gallery includes 4 compositions, 10 catalog assets, 9 product screens, 6 alternative designs, 2 workflow tools and 43 source icon names. Each section has stable hash links and compact preview controls.

For the preserved originals, run in a separate terminal from this V2 folder:

```sh
npm run preview:originals
```

This serves the existing baseline `dist` folders read-only. It never builds, writes caches, changes source or stops an existing server. Original V1: **http://127.0.0.1:5173/#screens/incoming**. BoardUI V1: **http://127.0.0.1:5174/#screens/incoming**. Links to both also appear in the V2 header. If a port already has a working preview, leave that preview running. If a baseline build is absent, the helper reports it without modifying the baseline.

To install this V2 in a new location, use Node 24 and `npm ci` here, followed by `npm run dev`. V2 has its own dependency directory; it does not use a junction into V1. Keep the three folders as siblings for the read-only comparison helper.

```sh
npm test
npm run lint
npm run build
npm run preview
```

## Upgraded inventory

- Compositions: Workflow, Payment ledger, Review queue, Invoice allocation.
- Product screens: Incoming Payments, Reconciliation Run, Payment-to-Invoice Match, Remittance & Deductions, Exception Review, Controller Approval, ERP Export Preview, Reconciliation Audit Trail, Source Intake.
- Alternative layouts: Allocation matrix, Reconciliation proof, Remittance inbox, Close readiness, Settlement journal, Clearing worksheet.
- Original catalog: IncomingPaymentsTable, BankStatementCard, MatchingProgressCard, ERPExportCard, PaymentMatchCard, ExceptionReviewCard, DeductionDetailCard, MatchMetric, StatusPill, WorkflowConnector.
- Workflow tools: SourceFileDropzone and ReconciliationActivity. All 32 BoardUI public component exports are retained, including every one of the 29 original V1 exports.

All inventory groups received the shared V2 styling. No screen was omitted.

## V2 design system

Self-hosted Geist, neutral canvas, white operational surfaces, graphite text, muted green selection, textual green/amber/blocked states and fine rules. Tokens are in `src/components/verasett-ui-assets/tokens.css`: typography, 4px spacing scale, surfaces, borders, semantic colors, 8px surfaces, 6px controls, 5px badges, subtle shadows, focus and reduced-motion easing.

Shared table, card, status, button, field, filter, tab and detail-panel recipes live in the V2 CSS Modules. Reusable React exports retain their existing names and APIs. `AssetSegmentedControl`, `StatusPill`, `SourceFileDropzone`, `ReconciliationActivity` and the shared Icon module receive the same theme. New local styles apply independently to V2; no refactor was made in either original folder.

Mobile tables preserve customer/allocation detail beneath the reference, with complete wrapped names. Amounts remain tabular and aligned. Touch controls are at least 44px where applicable; search fields use 16px text on phones. Focus and state feedback are immediate, and reduced motion is honored.

## Integration

Copy both `src/components/verasett-ui-assets/` and sibling `src/components/icons/` to the host project, retaining font files, source SVGs and license notices. React and CSS Modules are required. Import the desired public component:

```tsx
import { ReconciliationHeroVisual } from './components/verasett-ui-assets';

<ReconciliationHeroVisual onReview={openReview} />
```

The components import `tokens.css`; CSS-module composition applies the uniquely named `.verasettPremiumTheme` class to asset roots. Every public asset applies this theme at its own root, including SourceFileDropzone and ReconciliationActivity. You can also theme a host region:

```tsx
<div className="verasettPremiumTheme">
  <SourceFileDropzone />
  <ReconciliationActivity />
</div>
```

Existing `--va-*` inline overrides remain supported. Do not import preview entry points, shell reset or Vite configuration into a website. Preserve icons/ATTRIBUTION.md, CC-BY-4.0.txt, BOARDUI-LICENSE.txt and THIRD-PARTY-NOTICES.md. Native form indicators use exact source SVG data images; strict host CSPs need an appropriate image policy or hosted copies.

## Preservation and limits

The audit confirms 441/441 inventoried original delivery files unchanged. V2 financial modules, formatter/type definitions, icon geometry and 27 tests are byte-identical to BoardUI. V2 preserves BoardUI behavior, including pre-existing table controls and source-availability handling. Original V1 has different custom-input intake edge cases; it remains independently accessible.

These are illustrative React UI assets. No backend, authentication, bank connection, approval service or ERP posting was added. Local export/download and file metadata selection keep their existing demonstration boundaries.

See QA.md for current evidence and REFERENCE-REVIEW.md for the 20 supplied references. README-INHERITED-BOARDUI.md and QA-INHERITED-BOARDUI.md contain historical documentation copied from the baseline and do not describe the current V2 validation.


