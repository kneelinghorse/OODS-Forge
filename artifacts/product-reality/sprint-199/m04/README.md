# Sprint 199 m04 — bubble area and ECharts band implementation

Status: implementation and bounded proofs are complete. User-approved CMOS decision #2052 transfers the shared golden migration and final chart gate to m05 so each pin moves once. No m04 golden pins have been moved. Builder self-certification: false.

## Implemented

- The public bubble builder explicitly selects `area`: diameter is maxSize × sqrt(value / maxValue), anchored at zero without a minimum floor. Singleton positive values use maxSize; an all-zero domain draws zero magnitude. Legacy linear/sqrt/log scales and the `src/viz` browser twin remain unchanged.
- V169 receives the already-built projected option from artifact.certify. It checks actual per-item scalar circular diameters against magnitude ratios, verifies row correspondence, and treats missing options, rows or diameters as unresolved. It does not call the adapter's size factory.
- Cartesian area/bar intervals use the encoding keys x2/y2, a collision-safe hidden difference column and a transparent base plus visible difference series with stackStrategy all. Linked datasets retain their own bounds. Tooltips retain the two authored fields. Facet/concat filters use ECharts dimension and relational expressions; each panel has its own stack ID.
- The keystone test checks all 34 canonical examples through the selected renderer, retaining the 30-example minimum. Every mark's channel bindings must survive in drawing operands, and ECharts band values must preserve the second bound. The six facet/concat preferences were already corrected under m03 / CMOS #2051 before their normalized hashes were pinned.

## Verified

- `band-fidelity-base-red.log`: immutable b7a96ab0f example bytes fail on facet-target-band y2; all four x2/y2 area/bar negative-bound tests fail before implementation. No historical files were edited for this proof.
- `public-area-proof.log`: 69/69 MCP tests passed. `area/area.json`, `area/linear.json` and `area/sqrt.json` retain both public JSON boundaries and SVGs. The actual adapter's area selection conforms; reverting its selected scale to linear or minimum-anchored sqrt fires V169 and makes conformance false.
- `focused-green.log`: 130/130 focused tests passed before the additional engine-level band assertion. `band-engine-final.log`: 65/65 pass with actual ECharts stack-result checks, including negative bounds and facet isolation. `typecheck-final.log` and `mcp-build.log` passed.
- `census/viz-observations.json`: 13 types / 78 scopes, 60 rendered and 18 HC typed-deferred. All four light/dark bubble scopes conform with 3 accuracy rules and 0 failures. All 60 rendered type scopes conform. HC remains m05 work; the census log retains the existing illegal-color warnings.
- `qualification-check.log`: the owning matrix generator verifies all eight families against an isolated candidate matrix. Only bubble_map changes. Its candidate epoch is retained in `qualification/packages/viz-render/certified-matrix.json`; the tracked matrix is untouched. The unmodified generator's default receipt subdirectory/reason says m05 inside this isolated probe root; this is an m04 candidate measurement, not an m05 completion claim.
- `index.html` is an 11-image gallery: four public bubble scopes, three actual scale choices, and four direct ECharts band renders. Chromium is pinned at 141.0.7390.37. The direct band SVGs are uncertified adapter proofs; public Cartesian ECharts remains spec-only/uncertified.

## Corrections retained

The initial V169 unit test tried to structuredClone a raw option containing tooltip callbacks; the corrected test uses the projected JSON form. Both results are retained.

The first band screenshot probe used the public SSR worker and was rejected for unsupported Cartesian line series, as intended (`bands-public-ssr-limit.log`). Direct ECharts 6.0.0 then exposed two defects invisible in option-shape assertions: it rejects `==` (requires eq), and it groups stacks across panels unless stack IDs differ. `bands-equality-red.log`, `band-engine-proof.log`, `bands-before-stack-isolation/` and `gallery-before-stack-isolation/` retain these failures. Final tests read the real ECharts stack result and prove the wholly negative interval ends at -2, not the erroneous +1 from cross-panel accumulation.

## Pending boundary

`gate-before-migration/report.json` is intentionally retained as failed, not called green: core has 1,533 passing tests and three failures against the unmigrated bubble option snapshot and two assertions sharing its old render hash. Seven later gate steps were not run. Builds and typecheck passed. The MCP geo snapshot, registry, legacy operand matrix, certified matrix and remaining hash/count pins still need their one-time migration, followed by the full chart gate.

The handoff required both m04 and m05 to update the shared certified-matrix epoch while also requiring every pin to move at most once. The user explicitly approved deferring the shared migration to m05 (CMOS #2052). m04 closes on the implemented behavior, independent mutation/engine proofs and isolated qualification; m05 must perform the atomic migration and pass the full chart gate before it completes. The failed gate above remains a failed pre-migration result. Docs checks pass in docs-check-final.log; CMOS learning #634 records the real-engine facet/stack lesson.

## Deferred migration closed by m05

The approved #2052 shared migration is now complete in [m05](../m05/README.md). The final eight-family matrix, current registry, snapshots, hand literals and consumer expectations were migrated once, with producer-specific attribution in the [sprint golden ledger](../golden-ledger.json). The [m05 full chart gate](../m05/gate-final/report.json) passed all 11 steps; the earlier red m04 gate remains retained as pre-migration evidence.
