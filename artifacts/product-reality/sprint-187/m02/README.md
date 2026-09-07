# s187-m02 naming and classification ports

Build branch: `codex/sprint-187-fresh-composition`, starting from m01 `4878d3f1`.
Builder evidence only; Sprint 187 remains Active and `builderSelfCertified:false`.

The five families are LabelCell, InlineLabel, FormLabelGroup, ClassificationBadge and ClassificationEditor. Both framework roots have real implementations, contracts, shared scenarios, public declarations and independently resolved readiness references. Label children retain the HTML override semantics; bound label data uses a real label prop so truncation and supporting description survive. FormLabelGroup retains native `for` association and hint precedence. ClassificationEditor has labelled native controls and prevents submission, with no classification-change or save contract.

Verified result: `fresh-final.json` records **49/66 schemas, 98/132 generation cells and 55 governed IDs**. `live-attempt-3/report.json` records **6/6 cells, 48 passed gates, zero failures, zero skips and zero N/A**. All ten scoped export mutations discriminate and restore. Every remaining generation failure names an m03/m04 family.

The existing baseline-fold writer/checker now uses a sprint-187 record root and the actual green fresh-cohort report. `baseline-fold-write.log` and `baseline-fold-check.log` verify 123 surface cells across 41 existing baseline identities (the earlier waves plus these five), all **109 identities unchanged**, and 492 resolved readiness references. Frozen s185/s186 records remain intact. The old runtime-census approval remains null; no accessibility, interaction or theme maturity cell is promoted by generation.

## Binding repairs exposed by authentic fresh input

- `fresh-before-binding-repair.json`: 44/66 schemas, 88/132 cells, 55 governed IDs. Product/list rejected `FilterPanel.maxActiveParameter`; Product/form rejected an invented `ClassificationEditor.onChange`; Product/inline assigned boolean searchActive to query text.
- `fresh-after-binding-repair.json`: 49/66 schemas, 98/132 cells, 55 governed IDs. Every remaining failure contains families assigned to m03/m04. SearchInput auto-binding now requires string data. The boolean searchActive remains in the object shape. FilterPanel's maxActiveParameter is explicitly consumed unbound, matching HTML. ClassificationEditor's selected description field binds its visible subtitle, and the producer no longer invents a generic edit binding for it (CMOS #1794).
- `live-attempt-1`: Product/list passed both targets; Product/form React failed strict TypeScript because StatusSelector and Input share a field handler typed only for the first select source. Both node bindings and the field are retained. The emitter now types the actual native event union (CMOS #1795). Failed input/source, package hashes and gate reports are preserved; subsequent cells were not reached.
- `live-attempt-2`: four list/form cells passed, with visible family data and bidirectional shared status state. React inline reached hydration, retained all server nodes and had no runtime errors, but failed its required search interaction: the bound query was controlled with no local update. Newly composed SearchInputs now use their existing semantic update event to drive generated local query state and clear (CMOS #1796); no application search/filtering or historical schema rewrite is claimed.
- ClassificationBadge's authored `mode="{classification_mode}"` placeholder is retained as authored, as in HTML. This port does not claim to resolve that trait parameter. Naming/classification parameter directives consumed without runtime values are enumerated in the contracts.

## Verification commands and evidence

```sh
pnpm --filter @oods/components-react exec vitest run --config vitest.config.ts --maxWorkers=2
pnpm --filter @oods/components-vue exec vitest run --config vitest.config.ts --maxWorkers=2
pnpm --filter @oods/component-contracts exec vitest run --config vitest.config.ts --maxWorkers=2
pnpm --filter @oods/component-styles exec vitest run --config vitest.config.ts --maxWorkers=2
pnpm --filter @oods/mcp-server exec vitest run test/product-reality/breadth-export-cells.s187.spec.ts test/product-reality/parity.s185.spec.ts test/product-reality/fresh-composition.s187.spec.ts src/compose/object-slot-filler.test.ts test/codegen/ --maxWorkers=2
pnpm exec tsx scripts/product-reality/s185-m04-live-consumers.ts --mission s187-m02 --fresh Product/list,Product/form,Product/inline --output artifacts/product-reality/sprint-187/m02/live-attempt-3
node scripts/product-reality/s185-m03-export-mutations.mjs --components LabelCell,InlineLabel,FormLabelGroup,ClassificationBadge,ClassificationEditor --spec test/product-reality/breadth-export-cells.s187.spec.ts --output artifacts/product-reality/sprint-187/m02/mutation-attempt-1 --mission s187-m02
```

- React `react-tests-attempt-3.log`: 15 files / 188 passed. Vue `vue-tests-attempt-3.log`: 14 files / 140 passed. Includes alias precedence, truncation edges, authored override, label association, native form values/updates, prevented submit, shared scenarios, SSR and existing accessibility checks. React/Vue typechecks passed in `*-typecheck-attempt-2.log`.
- `styles-tests-final.log`: 3 files / 33 passed, including each new family's declared color roles resolved through real token sources in A/B × light/dark/hc. This is token-cascade evidence, not new visual review or accessibility-maturity promotion.
- `server-tests-attempt-2.log`: 14 files / 320 passed, including computed React/Vue parity and fresh Product regressions. After the search update repair, `server-tests-attempt-3.log` passes all 267 affected codegen/fresh tests across 12 files. `server-build-attempt-4.log` and strict CLI/dependency-closure `harness-typecheck-final.log` pass. No skips.
- `contracts-tests-final.log`: all 8 files / 92 tests pass, including the current readiness-derived capability fold and its denial checks.
- Final browser receipts observe all five families' data directly, the Product form's shared native status writers in both directions and its numeric 7→0 update, plus inline query typing and Escape clear in both frameworks. These are local component/state claims only.
- `mutation-attempt-1/mutation-manifest.json`: all ten root-export deletions discriminate in package SSR and independent readiness. Each deletion affects exactly its selected cell, 90 other cells remain green, and all 100 restored cell executions pass. Exports restore byte-identically.

## Retained intermediate failures

All attempt logs are retained. The initial contract order mismatch and missing Vue SSR showcase entries were corrected. Initial package tests overlapped unfinished builds and observed missing declarations; Vue's initial axe run timed out under that concurrent load. `*-tests-attempt-2.log` captures rejected pnpm argument forwarding, before the corrected explicit vitest invocations. The initial strict harness typecheck likewise overlapped a contracts build; its later sequential run passes. The badge color-role test caught an icon-role claim on an iconless badge; its contract now matches the existing badge families' three actual roles. Contract fold checks initially rejected the missing current live evidence; they remain fail-closed until the new cohort receipt is folded. No frozen prior-sprint evidence is overwritten.

No per-mission four-suite capture, shared-service restart, deployment or shared-store adoption is performed.
