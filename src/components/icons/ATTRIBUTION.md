# Imported icon attribution

All 43 supported icon keys resolve to SVG geometry exported from the two supplied Figma files through IAB on October 14, 2026 (41 unique sources). No generated/local icon fallback remains. No connector, OAuth or runtime API is needed.

- **coolicons by Kryston Schwarze**: https://github.com/krystonschwarze/coolicons and https://www.figma.com/community/file/800815864899415771.
- **Lets Icons / Free Icon Pack by Leonid Tsvetkov**: https://www.figma.com/community/file/886554014393250663/free-icon-pack-1800-icons.

Both use **CC BY 4.0**, https://creativecommons.org/licenses/by/4.0/. Full legal text is in CC-BY-4.0.txt. Retain creator credit, source links, license and modification notices in redistributed code and website credits. No creator endorsement is implied. The prior CC0 attribution was incorrect.

Raw source files are retained in source-svg/. provenance.json records SHA256, exact component name, source URL and capture method. The Coolicons batch contains 442 exports; only the required subset is bundled. Batch entries record exact ZIP member and archive hash. Their source URLs point to the verified free page; individual node IDs are not claimed. Selected exports retain individually inspected nodes.

Adaptation: React syntax, currentColor, configurable outline width (source default 2px), and no inherited outline for the filled folder. Exact shape coordinates and fill rules are preserved. Checkbox/select/disclosure indicators use unmodified SVGs as CSS masks, retaining native semantics.

Compatibility: bank/BankIcon uses Building_04; dollar-sign/DollarSignIcon uses Lets Icons Money, not a dollar glyph. currency shares Money; building shares Building_04. Legacy file/review/arrow/blocked aliases resolve to imported icons.
