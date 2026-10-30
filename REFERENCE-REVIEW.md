# Supplied-reference review — Premium V2

All 20 supplied references were reviewed through the five numbered contact sheets in work/premium-v2-2026-10-28/reference-sheets. The numbering follows the supplied image order. The notes below distinguish the focused component references from the combined dashboard direction; they do not claim the reference products' metrics, logos or functionality belong to Verasett.

## Reference observations

| Supplied references | Observed design principle | Applied to V2 |
| --- | --- | --- |
| 1 | A compact filter popup groups labels and choices with a clearly separated action area. | Search/status controls, legible selected state, bounded spacing and explicit clear-filter control. Existing native interactions remain. |
| 2 and 3 | Activity/event feeds use consistent rows, subdued metadata and a stronger event title. | ReconciliationActivity groups source, matching/review and handoff events; status and read state remain distinct. |
| 4 | A notification card separates counted views through an inset segmented control. | AssetSegmentedControl uses a neutral track, white selected segment, immediate focus and native pressed state. |
| 5 | A notification overlay uses constrained width, row dividers and explicit dismiss/read actions. | Consistent review-dialog surfaces and event disclosure controls. No notification backend was introduced. |
| 6, 7, 8, 9 and 10 | The desktop application references collectively favor white working surfaces, neutral surroundings, quiet borders and aligned toolbars. | One scoped neutral theme replaces warm tinted chrome across every product screen and gallery. The transaction records retain the strongest hierarchy. |
| 11, 12, 13, 14 and 15 | The reference set establishes compact operational density, clear text hierarchy and disciplined alignment of summary and detail. | 13px operational body text, readable 11–12px support text, larger headings/totals, tabular amounts and shared table/detail spacing. |
| 16, 17, 18, 19 and 20 | The remaining application references support restrained semantic color, repeatable controls and structured supporting panels within a larger workspace. | Green is reserved for selection/matched states and amber for review; reusable button, field, badge, table and detail-panel recipes apply across all layouts. |

The individual component observations for references 1–5 inform their corresponding controls. References 6–20 are recorded as a combined visual direction, rather than assigning unsupported product-specific details to individual images. Their source branding, sidebars, charts, photography and business claims were not imported. Verasett's supplied records, labels, evidence and financial boundaries remain the source of product content.

## Emil design engineering review

| Before | After | Why |
| --- | --- | --- |
| Warm tinted chrome and competing surface treatments | Neutral canvas, white records and fine consistent rules | Makes the financial working area easier to scan. |
| Small supporting text with inconsistent spacing | Shared Geist hierarchy and 4px spacing scale | Improves legibility and alignment across the full inventory. |
| Repeated preview-control styling | Shared AssetSegmentedControl styling | Keeps selected, focus, touch and disabled states consistent. |
| Disabled controls relying primarily on opacity | Explicit disabled text, fill, border and cursor | Communicates availability without fading an entire financial panel. |
| Narrow table customer names truncated | Complete wrapped customer and allocation details below the reference | Preserves useful information on phones. |
| Mixed card/status/button treatments | Shared scoped token system and CSS-module recipes | Gives all 9 screens, 6 designs, 4 compositions and catalog assets a coherent finish. |
| State-color transitions in frequent controls | Immediate state/focus feedback and restrained press motion | Frequent operational actions respond promptly; reduced motion is respected. |

## Verification boundary

Hallmark's static CSS sweep passed with 0 FAIL, 0 REFLEX and 0 WARN across 20 files. Rendered inspection and viewport measurements used Codex IAB. The broader source sweep retains inherited labels and test strings under the user's preservation requirement, as disclosed in QA.md. Existing Figma icon geometry and licensing remain intact.
