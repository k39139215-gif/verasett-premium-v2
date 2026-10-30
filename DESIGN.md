# Verasett UI — Premium V2

An isolated visual refinement of the BoardUI edition. The two existing editions are permanent, read-only baselines. This folder owns its source, dependencies, CSS, Vite configuration, build output, and evidence. No files in either baseline may be written.

## Design decisions

The supplied references favor white operational surfaces, neutral page backgrounds, understated green selection, compact toolbars, fine horizontal rules, and structured detail panels. The transaction table leads. Summary values sit above it without becoming a wall of cards. The reference dashboards' sidebars, photography, charts, logos, revenue claims, and unrelated product features are excluded.

Use the retained, self-hosted Geist variable font across all screens. Source Figma icons, their geometry, attribution, and SVG masks remain intact. No substitute generated icons. Suisse Intl is not installed or supplied as a licensed asset, so it is not introduced.

## Shared system

- Background `#f5f6f7`, white surfaces, supporting surface `#fafbfc`.
- Ink `#20262d`, muted text `#68727d`, rules `#e5e8ec`.
- Primary action `#34665a`; matched `#2d7052`; review `#8b641d`.
- Body 13px, supporting text 12px, labels and table headers 11–12px. Operational headings 22px. Counts and monetary summaries 24–26px.
- Spacing: 4, 8, 12, 16, 20, 24, 32, 48px.
- Surface radius 8px, controls 6px, badges 5px. No oversized pill styling.
- Tables: 40px headers, roughly 52px data rows, right-aligned tabular monetary values. Existing compact/comfortable controls and mobile record layouts stay functional.
- Desktop controls 36px minimum; touch/coarse pointer 44px minimum. Immediate focus rings and press feedback. Hover effects only on fine pointers. Reduced motion honored; financial amounts and review status changes remain instant.

Every color/font decision is declared in `src/components/verasett-ui-assets/tokens.css`. All component modules use those tokens. The `--va-*` aliases retain the existing configurable styling API. These tokens apply to the V2 component scope and gallery, not to V1.

## Preservation contract

Do not change transactions, allocations, arithmetic, statuses, evidence, export content, handlers, component props, labels, accessibility names, or test expectations for aesthetics. Preserve all 9 product screens, 6 alternate layouts, 4 compositions, 10 original assets, 2 BoardUI workflow tools, and the 43-name source icon sheet.

The original edition's differing density/filter implementations remain available for comparison in their own folder. BoardUI has the same product screen inventory and extends controls and workflow tools; V2 carries these extensions forward.

## Skill application

Hallmark is used for reference-led design and anti-template auditing; Emil design engineering for optical type, precise controls, focus, and motion restraint. User preservation and copy requirements take precedence over skill rules that would remove information or require rewriting the original tree. Hallmark's external renderer is not used: browser verification must run through Codex IAB. The static sweep and IAB screenshot audit are recorded separately and are not presented as the same check.
