# Third-party sources

Verified on October 13, 2026. These notices live inside the reusable directory so they travel with website integration.

## BoardUI free source — MIT

Copyright (c) 2026 Mertcan Dundar Esmergul (BoardUI).

Upstream: https://github.com/BoardUI/boardui
License: https://github.com/BoardUI/boardui/blob/main/LICENSE
The complete MIT notice is retained in BOARDUI-LICENSE.txt.

| Verasett file | Upstream path | Use and modifications |
| --- | --- | --- |
| SourceFileDropzone.tsx | components/base/file-upload/file-upload.tsx | Adapted file-size formatter, extension/size validation and file-input/drop patterns. Retains metadata only. Removed simulated upload timers, random progress and completion claims; added explicit evidence boundaries, configuration validation and remove/replace. |
| VerasettIncomingPayments.tsx + incoming.module.css | components/application/data-table/data-table.tsx | Interaction/layout adaptation: sortable headers with directional indicators, independent visible selection, density control below the table. Existing native table/filter/export implementation retained instead of importing TanStack Table. No fabricated pagination. |
| ReconciliationActivity.tsx + reconciliation-activity.module.css | components/application/notification-center/notification-center.tsx | Adapted counted filters, read-ID tracking, individual/bulk read actions and feed structure. Replaced social notifications and avatars with original finance events and expandable trace details. |
| AssetSegmentedControl.tsx + asset-segmented-control.module.css | components/base/segmented-control/segmented-control.tsx | Adapted inset selection track and keyboard navigation pattern. Uses native controlled buttons instead of React Aria or measured animated thumbs. |

These are scoped React/CSS Modules adaptations, not unmodified BoardUI components. BoardUI's global Tailwind tokens, fonts, paid templates, app scaffold, branding, and unrelated data were not copied. The optional external dependencies in upstream source were not added.

The verified repository license grants MIT use of its free source. BoardUI's license page also explicitly identifies that free repository as MIT. No Pro license, Pro source or Pro asset is included.

Source snapshots and SHA256 hashes are recorded in the workspace's work/boardui-source and work/boardui-source-manifest.json. They were retrieved through the authorized public web reader; main is a moving branch, and an immutable upstream commit was not verified.

## Fonts and icons

The bundled Geist font retains its original license in fonts/OFL.txt. Existing inline SVG UI primitives remain original project code. No Figma canvas icons or Remix Icon SVG assets were imported in this update.

Remix Icon's current upstream license reads “Remix Icon License v1.0” (January 2026), despite BoardUI's page listing Apache 2.0. No Remix artwork is bundled, so this discrepancy does not change the delivered code's dependencies. Check the specific source license before any future icon import.
