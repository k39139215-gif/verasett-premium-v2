# Premium V2 delivery

Current implementation: outputs/verasett-premium-v2. All new design work and its build/configuration/evidence are isolated here.

- README.md: preview, comparison, integration, full inventory, preservation limits.
- DESIGN.md and REFERENCE-REVIEW.md: design system and supplied-reference observations.
- QA.md: current V2 verification; inherited QA files are historical.
- src/components/verasett-ui-assets/: all 32 retained exports, V2 tokens and CSS Modules, financial fixtures, self-hosted fonts, existing tests.
- src/components/icons/: exact retained Figma icon module, 43 names from 41 source exports, provenance, attribution and licenses.
- src/preview/: complete gallery, stable hash navigation, V2 comparison links and local review example.
- scripts/preview-originals.mjs: read-only comparison server for existing baseline builds.
- dist/: independently generated V2 production build.
- evidence/premium-v2/: final screenshots, measured viewport/overflow reports and server logs.
- work/premium-v2-2026-10-28/: initial baseline manifest, reproducible preservation audit, behavior/build/lint logs and static design-audit outputs.

The original outputs/verasett-ui-assets and outputs/verasett-ui-assets-boardui folders were kept unchanged. The 441-entry baseline SHA256 comparison certifies delivery files; excluded generated caches/dependencies/build outputs are outside that manifest.

Keep BOARDUI-LICENSE.txt, THIRD-PARTY-NOTICES.md, icons/ATTRIBUTION.md and icons/CC-BY-4.0.txt when integrating. README-INHERITED-BOARDUI.md, QA-INHERITED-BOARDUI.md and FILES-INHERITED-BOARDUI.md retain historical baseline documentation; their old dates and paths are not V2 claims.
