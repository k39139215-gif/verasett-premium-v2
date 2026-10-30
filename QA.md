# Premium V2 verification — October 29, 2026

## Preservation

The read-only SHA256 audit checked all 441 pre-recorded baseline delivery files: 211 original and 230 BoardUI. All are unchanged. Every original export remains, including IncomingPaymentsTable: 29 original exports and 32 BoardUI exports are in V2. Financial/type/format modules (16), icon files (51), and tests (27) are byte-identical to BoardUI. No V1 build/test/cache writes or resets were used. Manifest exclusions for generated dependencies, caches and build output remain explicit.

V2 is a visual refinement of BoardUI. Original V1 differs in pre-existing table and custom-input intake edge cases; the original is independently available. See work/premium-v2-2026-10-28/preservation-audit.json and audit-preservation.ps1.

## Automated checks

- Final full suite: **285 tests across 27 files passed**. This covers values, financial arithmetic, source availability, status/approval/export boundaries, allocation evidence, sorting/filter controls, source metadata, activity read state, icon accessibility and exact SVG sources.
- Final ESLint: passed with zero warnings. The read-only comparison helper is included.
- TypeScript and Vite production build: passed. V2's dist was built independently.
- Logs: work/premium-v2-2026-10-28/v2-tests.log, v2-lint.log and v2-build.log.

## Browser checks and screenshots

Codex IAB reviewed all 9 product screens, all 6 alternative layouts, all 4 compositions, the original catalog and both workflow tools. Final screenshots are in evidence/premium-v2. Dense payment/match/exception/export/matrix/proof/worksheet layouts also have phone screenshots. The mobile table shows complete customer names by wrapping below the payment reference.

The requested browser viewport was 1440×1000 for desktop, 390×900 and 320×900 for mobile. IAB reported document innerWidths of 1454, 394 and 323 respectively; the client/content widths were 1439, 379 and 308. These measured dimensions are recorded rather than claiming exact pixel equality. Browser viewport changes stopped applying to the existing tab during final QA; documented tab CDP emulation restored the intended dimensions. Both overrides are cleared at handoff.

All 21 composition/product/design/utility stages had zero outer horizontal overflow at all three measured sizes. Reports: layout-desktop.json, layout-mobile390.json, layout-mobile320.json. Rendered SVGs: 266, zero without data-icon-source. Actual SVG sources and masks retain exact Figma geometry.

Browser smoke checks:

- Search Westline: one ACH-55231 result, $4,320.00, Needs review; batch totals remain $41,440 received and $37,120 matched.
- Status view filter and clear filters: working.
- Composition review dialog: shows ACH-55231 unresolved, no payment applied, controller verification required; close restores the table.
- Final captured browser console: no warnings/errors.
- All three localhost previews returned HTTP 200 with the expected edition title. Originals are served from existing builds through V2's read-only helper or the already running original preview.

Screenshots show illustrative UI only. No bank, posting or approval integration was tested or added.

## Design audit scope

Hallmark static audit across all 20 CSS files: **0 FAIL, 0 REFLEX, 0 WARN**. A short empty-state prose measure was reviewed and dismissed; shared surface/control recipes were answered as deliberate enterprise component consistency. JSON: work/premium-v2-2026-10-28/hallmark-all-css-static.json.

The broad source sweep separately reports 53 findings: 23 inherited eyebrow labels, 24 uppercase-label detections, 4 inherited metadata punctuation strings and 2 SVG strings in tests. User instructions explicitly require preserved labels/information and test expectations; those source-content findings were retained and documented. The rendered labels use restrained, untracked type. This is not a claim of a clean whole-source Hallmark sweep. Hallmark's separate renderer was not run; actual rendered inspection occurred through IAB, with measurements and screenshots recorded here.

Emil design engineering findings and Before/After/Why review are in REFERENCE-REVIEW.md. User reference and preservation instructions supersede removal of existing information for a stylistic gate.

## Limits

All requested screens were upgraded. Existing mockup interactions remain mockup interactions. The original icon API's bank/building and dollar-sign/Money aliases retain their disclosed geometry. Host integration, strict CSP and production data handling need verification in the real host app. The standalone gallery is deliberately long and dense because it preserves every asset on one continuous page.
