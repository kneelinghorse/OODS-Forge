# Compatibility alias assessment

**Retain all three paths.** The one-sprint notice horizon in #1382/#1385 is a review trigger, not evidence that adopters migrated. No external migration acknowledgement is present in this build.

`alias-readers.txt` is the actual bounded repository search over packages, scripts and tests (excluding generated dist, node_modules and evidence archives). It distinguishes:

- Real import/resolve consumers: `scripts/product-reality/s184-m04-packed-consumers.mjs:124–125,190,216` generates consumers with `/ported`, `/readiness-ported` and `/css-ported`; both framework packed-import scripts import/require the compatibility runtime, resolve readiness/CSS and typecheck compatibility types. These paths still execute in supported compatibility checks.
- Compatibility support: `packages/mcp-server/src/codegen/artifact-envelope.ts` accepts historical package subpaths; the legacy live-consumer runner recognizes `css-ported`. Removing these would break retained historical artifacts even though new generation uses roots.
- Negative migration guards: `tests/e2e/schema-ref-pipeline.test.ts:45–46` prevents new generation from producing legacy runtime/CSS imports. This proves new output policy, not migration of saved or external code.
- Internal files and historical closeout tools: relative `./ported.js` implementation imports and old notice/assertion strings are not external migration evidence. They are retained separately in the search receipt and not counted as active adopters.

`alias-targets.json` records the exact current export maps. React/Vue `/ported` resolves to the same runtime/type targets as the root; `/readiness-ported` points to the same readiness file; `/css-ported` points to the root component CSS. No second governed union is introduced. Existing packed import evidence is retained and final sprint proof rechecks the governed root.

Retirement requires a separately reviewed compatibility change with an inventory of delivered consumers, explicit adoption acknowledgements or replacement artifacts, a disposition for the supported historical corpus and fresh packed-import negative/positive migration checks. No elapsed-date argument substitutes for those facts. #1382/#1385's assessment is performed here; actual retirement is not authorized or completed.
