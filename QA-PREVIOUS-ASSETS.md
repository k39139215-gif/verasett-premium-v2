# Verification record

Updated October 11, 2026 (Asia/Calcutta).

## Delivered scope

Fifteen independently exported components: the original ten assets, VerasettIncomingPayments, ReconciliationHeroVisual, PaymentLedger, PaymentReviewQueue and PaymentAllocationView. The isolated preview has four selectable layouts and the original component catalog. All use self-hosted Geist, white/light-mineral surfaces, restrained green/amber and CSS Modules. No gradients or glows were introduced. The existing website was unavailable and was not modified.

## Automated checks on the final source

- `npm test`: **49 tests passed in 4 files**.
- `npm run lint`: **passed**, zero warnings allowed.
- `npm run build`: **passed**, TypeScript validation and Vite production build.
- The final build was served separately using `npm run preview -- --port 4173 --strictPort` and checked in the in-app browser.
- Production assets: Geist-Latin-Variable-BgDaEnEv.woff2 (29,400 bytes), index-DnPloD8G.css (39,325 bytes), index-CgW6TXoP.js (263,487 bytes). These include the preview/catalog, not a per-component size claim.

Tests cover the original assets and composition, search/filter/selection/export, exact amounts with BigInt totals, invalid and duplicate invoice allocations, progress boundaries, long names, empty data, review callbacks, all four preview choices, changing exception selection and dataset replacement, unknown candidate amounts, and read-only dialog wording. Three earlier review findings have regression coverage: totals beyond safe-number aggregation, compact clear-selection, and hero progress derived from supplied records.

## Current rendered layout

The flow under test: preview loads → choose a variation → inspect or filter records → read the corresponding result without approving or posting a payment.

Browser: Codex in-app browser only. No physical mouse or keyboard takeover, external browser, or Playwright fallback was used. Development URL: `http://127.0.0.1:5173/`. Production URL: `http://127.0.0.1:4173/`.

| Check | Result and evidence |
| --- | --- |
| Page identity / meaningful content | Correct Verasett title and all four layouts render in development and production. |
| Framework overlay | None in the final rendered pages. |
| Console health | Clean production tab reports no warnings/errors after search, variation switching and keyboard exception selection. |
| Desktop visual inspection | All four layouts inspected; original five-column table is 52px per row, ledger is 64px with two text lines, allocation rows are 48px. |
| Amount alignment | Ledger amount-cell right edges are all 779.475px at 1440px. Original panel previously measured identical 636.725px right edges and 52px rows. |
| Mobile visual inspection | Three new layouts inspected at 320px with long names. Review list rows were compacted to bring evidence closer; detail panel inspected separately. Original layout also inspected at 320/390px. |
| Status readability | Textual status labels remain visible on narrow layouts; green/amber is supplemental. |
| Reduced motion | With Motion enabled and prefers-reduced-motion: reduce, all workflow animation names are none. Override was reset afterward. |

Every variation was measured at all five widths with long names enabled; **20/20 combinations had no horizontal page overflow**. Detailed results are saved in `evidence/responsive-checks.json`.

| CSS viewport width | Page scroll width | Layouts tested |
| ---: | ---: | --- |
| 320 | 305 | Workflow, ledger, review, allocation |
| 390 | 375 | Workflow, ledger, review, allocation |
| 768 | 753 | Workflow, ledger, review, allocation |
| 1024 | 1009 | Workflow, ledger, review, allocation |
| 1440 | 1425 | Workflow, ledger, review, allocation |

Viewport overrides were reset after testing. These widths establish measured layout containment, not a full accessibility or cross-browser audit.

## Interaction checks

- Current original panel: searching Westline returns its single record; Needs review opens the correct read-only review; Escape closes it and returns focus. Select ACH-78421 → Compact → Clear selection removes the selection.
- Ledger: searching Westline returns exactly one row with $4,320.00. Clearing search restores four records. Export demo CSV was invoked locally. Visible-record payload, CSV quoting and formula guarding have automated coverage; saved download bytes were not inspected in the browser.
- Review queue: keyboard Enter on ACH-66204 selects Cedar Industrial, $2,175 received, $2,325 candidate amount and -$150 difference. Review match opens the matching reason. Escape closes the dialog and returns focus to Review match.
- WIRE-88019 displays “Amount not established” and omits a computed difference when candidate invoice amounts are missing.
- Allocation: $8,000 + $3,000 + $1,450 = $12,450, with $0 difference. Unit tests confirm invalid or unbalanced inputs show Needs review and hold export.
- Production smoke check repeated ledger search and keyboard exception selection successfully with a clean console.

## Screenshot evidence

- `ledger-asset.jpg`, `review-asset.jpg`, `allocation-asset.jpg`: final isolated desktop component captures for comparison.
- `ledger-desktop.jpg`, `review-desktop.jpg`, `allocation-desktop.jpg`: desktop preview context.
- `ledger-mobile-320.jpg`, `allocation-mobile-320.jpg`, `review-mobile-320.jpg`, `review-mobile-detail-320.jpg`: mobile layouts and evidence panel.
- `desktop-geist.jpg`, `mobile-320-geist.jpg`, `mobile-390-geist.jpg`: final light/Geist original composition captured before the variation switcher was added. The underlying original asset remains unchanged; these do not show the new switcher.

## Typography and historical checks

Earlier October 11 CDP platform-font inspection identified the bundled Geist font (Geist-SemiBold, custom font) for the heading, rather than a fallback. The same WOFF2 and font-face remain in this build. Earlier token contrast calculations: primary text 15.32:1, muted text on white 4.94:1 / raised surface 4.55:1, Matched 5.46:1, Review 5.08:1, Pending 5.11:1, Export ready 5.10:1 and Blocked 5.67:1. These are token calculations, not a full rendered accessibility audit.

Earlier automatic approval-review token limits delayed some checks; final layout, interaction and reduced-motion checks subsequently completed using the same IAB route. A development-tab console retained a Vite hot-reload error from the interval while new files were being written. The completed build passed and the fresh production tab had no warnings/errors; this was not a production runtime fault.

## Practical limits

Integration with the actual website's routes, tokens and framework remains untested because its repository is unavailable. Only the installed React/Vite stack and the in-app browser were run. Screen-reader software and other browser engines were not exercised. This is fictional UI data and local display/export behavior, not a bank connection, reconciliation engine, deduction approval system or ERP integration. Values supplied to ledger/review components must use safe integer USD cents and unique references. Geist's bundled subset is Latin. The three-record review fixture is separate from the four-record incoming batch.
