# Sprint-152 Decision Memo — #16 library-consumer contract + four cheap carries (F2/F3/F4/F7)

**Status:** SSOT. A fresh build session executes m02→m07 from this memo **without re-grounding**.
**Planned:** 2026-07-12 (planning session PS-2026-07-12-004). **HEAD at grounding:** `011ecac` (clean).
**Grounding:** wf_f0e02eba-177 (5 reproduce-first item-grounders + cross-cutting + synthesis) + a re-run F1 grounder (the workflow's F1 agent hit a StructuredOutput cap). All anchors verified live at HEAD.
**Provenance:** discharges the s151 review (PS-2026-07-12-003, verdict GENUINE_CLOSE_WITH_CARRIES) F1 premise + carries F2/F3/F4/F7.

---

## 1. Sprint frame & LOCKED scope

Derek locked two forks via AskUserQuestion (2026-07-12):

- **#16 consumer model = FORMALIZE THE LIBRARY-CONSUMER CONTRACT** (not expose-via-MCP, not fence-deferred). Sanction `@oods/viz-core`'s typed IR (`NormalizedVizSpec` incl. the top-level `datasets` slot + `Mark.from`) as a first-class **public library API** for build-time importers. **Named puller:** Forge-Demos "Demo 03 — The Design DNA of the Web", **Hero B**, which sets `marks[1].from='gov_median'` over a 2-row `{site,median}` median-rule layer.
- **Scope = F1 + ALL cheap carries:** F2 (#895 numeric-string heatmap honesty, MED — the a11y substance), F3 (scatter/nominal-bar phantom row-order Trend, unified with pre-existing #910), F4 (diverging-bar cardinality cap), F7 (generated-file git hygiene).

Two residual forks surfaced at synthesis, both **resolved by Derek 2026-07-12**:
- **F4 no-fit zone → Option 1 (honest-fail lowConfidence).** Ship only the cap; a >12-category all-positive comparison returns `layered-line-area` flagged `lowConfidence=true` rather than a confidently-wrong diverging-bar. No `buildSuggested` coherence fallback.
- **F2 sparse-null table → keep separate LOW.** The `table-generator` null-intolerance micro-fix is **out of s152 scope** — a distinct LOW carry with its own reproduce+golden pass.

**Headline:** the whole sprint is additive and #564-safe. Grounding predicts **ZERO owned goldens move** across all five items; every behavior change is covered by NEW colocated tests, each golden prediction citing its grep-verified asserting file.

---

## 2. Constraints ledger

- **#564 (byte-identical when unused / owned-regen only):** HELD every mission. F1 sanctions an already-shipped emission (barrel re-exports + doc + example, no owned golden). F2: verified **no id/code/sku-named numeric fixture exists** anywhere in viz-core/mcp-server tests — the `store_id` output change **is the feature**, not smuggled. F3: default output byte-identical (narrative only emitted when `includeA11y=true`; `contentHash` is over `canonicalize(spec)`/`echartsOption`, not the a11y block). F4: recommender-only; no fixture >12 cats. F7: test/script/git only. **Every golden `willMove:false` with a cited asserting file.**
- **#525 (≤25 tools / 19 raw; no new tool):** HELD. F1 exposes **zero** MCP surface (library-only); F2/F3 are internal viz-core; F4 is a scorer heuristic; F7 is test+script+git.
- **#110 (certify stays a reader; no scorer; no certify edits):** HELD. No mission touches certify. Downstream honesty gain only (F2: an id-named color that baked a gradient now bakes a categorical palette → certify's contrast pillar reads a real categorical verdict, not a gradient-exempt one).
- **determinism (no Date/Math.random; stable ordering):** HELD. `inferFieldType`/`deriveTrend`/pearson/`resolveMark`/`scorePattern` are pure; the F2 name-token classification, F3 mark allowlist, and F4 cap introduce no new top-of-ranking ties (all-positive 5.4 vs 2.4; signed 9.4 vs 8.0). F7 REMOVES persisted nondeterministic timestamps from git (already isolated to scripts/tokens + schema-store metadata, never product paths).
- **#115 (agent-visible advertising for MCP capabilities):** HELD + RECORDED. F1 is library-only → **intentionally does NOT gate on MCP prose**; it advertises via public TS types + `docs/viz/normalized-viz-spec.md` + the committed Hero-B example (see §4/§5 statement). F2 **vindicates** the existing `includeA11y` prose (makes "categorical color falls back to Y" true for numeric-string identifiers). F3/F4 add no agent-visible capability.
- **a11y-bar (must ADVANCE never lower):** ADVANCES. F2 trades 3 confident-but-false summed-ID findings for one honest A11Y-R-11 warn + a discrete legend that matches the narrative (text≡render honesty gain). F3 removes a self-contradictory, row-order-dependent Trend (R-11 still passes: bar keeps High/Low/Total, scatter keeps High/Low/Correlation). No mission lowers the bar.

---

## 3. Mission spine (linear strict-Requires)

```
m01 SSOT memo (Completed-at-creation)
  └─ m02 F1  #16 library-consumer contract (barrel re-exports + doc + Hero-B example)   [byteMover: build-only, zero golden]
       └─ m03 F2  #895 numeric-string-ID heatmap honesty (Option B, profiler root)       [behavior-mover: full suites]
            └─ m04 F3  phantom row-order Trend suppression (sequence-mark allowlist)      [behavior-mover: full suites]
                 └─ m05 F4  diverging-bar cardinality cap (Option 1 honest-fail)          [recommender-only]
                      └─ m06 F7  generated-file git hygiene (hermetic test + --no-diagnostics)  [test/script/git]
                           └─ m07 Closeout (gate sweep + DIST-SANITY + dual-path live-verify)
```

*CMOS mission IDs are `s152-m01` … `s152-m07` (i.e. `s152-mNN` ≡ the `mNN` labels used throughout this memo; bare `mNN` were already occupied project-wide by sprint-151).*

**Sequencing notes (grounding-verified):**
- **F2 (m03) and F3 (m04) are file-disjoint under the recommended forks** — F2 lives entirely in `spec-builder.ts` (inferFieldType), F3 is a one-line change to `data-analysis.ts:188`. They do **not** co-edit `data-analysis.ts` or `narrative-generator.ts` and share **no function** — this is NOT the s151 m05/m05b shared-`resolvePrimaryChannels` situation. They are adjacent only because they share a **verification surface** (the a11y narrative + the mcp-server a11y-equivalence 3978 suite).
- **F7 (m06) last** so the final full clean-rebuilt mcp-server run doubles as F7's git-status-clean hermeticity proof.
- **Behavior-movers (F2, F3, F4) each require a clean `@oods/viz-core` DIST rebuild before the mcp-server suite** (mcp-server vitest resolves `@oods/viz-core`→DIST — the s150/s151 DIST-SANITY landmine), and F2/F3 must run the **FULL** mcp-server suite before Complete (the s149 F6d learning: narrative-semantic changes surface in a11y-equivalence specs only at the full suite, not the surfaces reasoned about).

---

## 4. m02 — F1: #16 library-consumer contract

**Objective:** formalize `@oods/viz-core`'s `NormalizedVizSpec` typed IR (incl. `datasets` + `Mark.from`) as a first-class **public** API for build-time library importers. NOT MCP-exposed, NOT fenced.

**Ground truth (verified):** the package has a single root export (`package.json` `exports."."` → `dist/index.*`; `dist` is gitignored, 0 files committed). `NormalizedVizSpec` **is** exported (so a whole-spec object literal — incl. `marks[n].from` and `datasets` — **already type-checks today** via structural typing). **GAPS:** the `Mark` interface (`.from` at `normalized-viz-spec.types.ts:113`) and a **named** `datasets` map type are NOT in the barrel's named re-export — reachable only via indexed access `NormalizedVizSpec['datasets']`. `#16` resolution already ships: ECharts `convertLinkedDatasets` (`echarts-adapter.ts:176`/`:236`, `datasetId = mark.from ?? …` `:309`); Vega-Lite `datasets: spec.datasets` (`vega-lite-adapter.ts:147`, `data: mark.from ? {name…}` `:194`). *(Note: the s151-era comments cite `:291`/`:185`; actual HEAD lines are `:309`/`:194` — line drift, not a behavior change.)*

**Fix (three additive parts; FORK-1 resolved technical-builder-call = add the explicit re-exports):**
1. **Barrel re-export (1 file):** add `Mark` (and, for a complete IR contract, `DataSource`, `EncodingMap`, `Transform`) to the named `export type { … }` list at `packages/viz-core/src/spec/normalized-viz-spec.ts:6-21`. Collision-free (`Mark` is not currently exported anywhere). Keep the single `.` root export — do **NOT** add a `@oods/viz-core/ir` sub-path entrypoint.
2. **Doc:** add a "Layered datasets & `Mark.from` (library-consumer contract)" section to `docs/viz/normalized-viz-spec.md` (the existing hand-authored, un-gated IR home; no package README exists) — add the missing `datasets` row to the structure table + a Hero-B `toVegaLiteSpec`/`toEChartsOption` sample + the §5 #115 non-applicability note.
3. **Committed Hero-B example test (new, co-located):** a canonical median-rule spec — primary inline bar layer (`marks[0]`, no `from`, resolves against `data.values`) + a second median-rule layer (`marks[1]`, MarkLine/MarkRule, `from:'gov_median'`) + top-level `datasets:{ gov_median:[{site,median}×2] }` + mandatory `a11y.description`. Author the median-rule layer as a **named** `const medianRule: Mark = …` and the map as `const govMedian: NormalizedVizSpec['datasets'] = …` (this line requires the new re-exports and witnesses the contract). Assert resolve+render in **both** adapters (model on the existing s151 specs: `echarts-adapter.spec.ts:73-128`, `vega-lite-adapter.spec.ts:205-291`). Place at `packages/viz-core/src/adapters/median-rule-layer.example.spec.ts` (or appended describe blocks in each adapter spec).

**Golden inventory (cited):**
- `packages/viz-core/test/__snapshots__/golden-profiles.spec.ts.snap` — **willMove:false** — IR emission shipped in s151; F1 adds exports+docs+a new test.
- `packages/mcp-server/test/tools/viz-a11y-equivalence-emission.spec.ts` — **willMove:false** — no datasets/from fixture in the set; F1 changes no output shape.
- **Zero `--check`-gated generators:** `generated.ts` derives from `packages/mcp-server/src/schemas/*` (`generate-types.ts:19`), NOT the viz-core barrel; the mcp-server IR boundary is the permissive `{ spec: object }` (`generated.ts:240`). Re-exporting a type rebuilds only the gitignored `dist`; there is no api-extractor report or export-surface snapshot test in viz-core. `generate:schema-types --check`, `docs:api --check`, `tokens-validate` are all no-ops.

**New tests:** the Hero-B example (both adapters resolve `marks[1].from='gov_median'`, materialize the 2-row dataset) + a public-export assertion (`Mark`/`datasets` nameable from the package root, no deep import).

**Reproduce-RED:** N/A as a defect (resolution shipped s151). The example is the teeth: it goes RED if the IR types are NOT publicly re-exported (deep import required) or if either adapter fails to resolve `from='gov_median'`.

**#564:** byte-identical (additive re-export + hand-doc + new test). viz-core test count +N; mcp-server/test:scale UNCHANGED.

---

## 5. #115 statement to record (F1)

Record verbatim in this memo AND in the new `docs/viz/normalized-viz-spec.md` section:

> **#115 non-applicability for #16 (library-only capability).** The top-level `datasets` slot and `Mark.from` layered-dataset resolution are a **build-time library contract of `@oods/viz-core`**, consumed by importers of the typed IR (Forge-Demos "Demo 03", Hero B, `marks[1].from='gov_median'` over a 2-row `{site,median}` median-rule layer). It is advertised through its **public TypeScript types** (`NormalizedVizSpec` incl. `datasets` + a first-class `Mark`), a **hand-authored contract doc** (`docs/viz/normalized-viz-spec.md`), and a **committed, co-located example test** resolving+rendering in both adapters. It is deliberately **NOT** advertised via MCP tool prose because #16 adds **ZERO agent-reachable MCP surface** (no viz.render/dashboard.render/certify tool accepts or emits the NormalizedVizSpec `datasets` map; the only MCP-visible `datasets` is the separate DashboardSpec `Dataset[]` seam). #115 therefore **intentionally does not gate F1** — there is no agent-facing prose to move, and none should be added.

---

## 6. m03 — F2: #895 numeric-string-ID heatmap honesty (Option B, profiler root)

**Objective:** close the residual live #895 gap. A heatmap colored by a **bare numeric-string ID** field (e.g. `store_id` `'1001'..'1006'`, <8 rows, distinctRatio ≥ 0.5) currently produces a **three-way disagreement** — narrative SUMS the IDs (`"…totaling 6,021 Store id"`, `"Total Store id: 6,021"`), render draws a **CONTINUOUS gradient** (`encoding.color.type='quantitative'`), a11y table `isNumeric=false`.

**Root cause (single upstream, source-confirmed):** `inferFieldType` rule-5 quantitative fallback (`spec-builder.ts:1053`) types numeric-string IDs quantitative (`toNumber("1001")` parses; rule-4 ordinal branch skipped: <8 rows so `ORDINAL_MIN_ROWS` unmet, distinctRatio 1.0 ≥ `ORDINAL_MAX_DISTINCT_RATIO` 0.5). `applyDataAwareTypes` (`spec-builder.ts:673`) stamps that onto the binding, feeding **both** render (adapter short-circuits on `binding.type`) AND narrative (`heatmapColorIsMeasure`→`bindingIsQuantitative` reads `binding.type==='quantitative'`, `data-analysis.ts:147`/`:127`). **The render is itself wrong** — so an a11y-layer-only fix would make the narrative agree with the table but NEWLY diverge from the rendered legend (an a11y-equivalence regression). Only a profiler-layer fix achieves render+narrative+table agreement.

**Why s151 m05 didn't close it:** its test `numericStringColorHeatmap()` (`data-analysis-predicates.spec.ts:111-122`) **hand-declares** `color:{scale:'band'}`, which wins over the profiler — it never exercised the bare-field→profiler-infers-quantitative path. m05 DID close the low-cardinality bare case (rule-4 ordinal). The residual open gap is precisely the **high-distinct / <8-row / id-named numeric-string** color.

**Fix = Option B (name-gated identifier guard in the profiler):** add `nameHintsIdentifier(name)` inside `inferFieldType` rule-3 at `spec-builder.ts:1031-1034` (alongside the existing `nameHintsZip`/`nameHintsCurrencyCode` → `'nominal'` guards, defs near `:1082`): identifier tokens `{id, ids, code, sku, uuid, guid}` → return `'nominal'` **before** rule-3b (measure) and rule-5. Chain: `store_id` → `'nominal'` → binding stamped nominal → (a) adapter emits a **discrete** color scale (gradient gone), (b) `heatmapColorIsMeasure`→`bindingIsQuantitative` false → narrative **falls back to Y** (no sum), (c) table `isNumeric` already false → **full three-way agreement**, and the `includeA11y` #115 prose becomes TRUE. **Touch NO a11y predicate** (`heatmapColorIsMeasure`/`bindingIsQuantitative` already honor the stamped type — the s150-carry-A guidance). **HARD CONSTRAINT:** do NOT reintroduce any coercive `.some()`/`.every()` probe; preserve sparse-null tolerance. **Do NOT fold** the separate `table-generator` null-intolerance micro-fix (Derek fork → keep separate LOW, §10).

**Anchors:** `spec-builder.ts` — rule-5 `:1053`, rule-3 guards `:1031-1034`, `applyDataAwareTypes` `:673`, ORDINAL constants `:261`, `nameHintsZip`/`nameHintsCurrencyCode` `:1082`. `data-analysis.ts` — `heatmapColorIsMeasure:147`, `bindingIsQuantitative:127` (module-local, unexported), `isMarkRectGrid:107`. `narrative-generator.ts` — default sum `:230`, `Total` keyFinding `:297`. #115 prose mirror: `viz.render.input.json:334` / `generated.ts:6962` / `docs/api/viz-render.md:59` (F2 makes it true; optional sharpen triggers the schemas-tools generate + docs:api regen chain, both `--check`-gated).

**Golden inventory (cited, all no-move):**
- `golden-profiles.spec.ts.snap` — **willMove:false** — `golden-profiles.spec.ts:61` `toMatchSnapshot`; no id/code/sku-named numeric fixture (zip→nominal, year→temporal, currency→nominal, sales→measure).
- `packages/mcp-server/src/tools/__snapshots__/viz.render.fidelity.test.ts.snap` — **willMove:false** — `viz.render.fidelity.test.ts:42,73`; heatmap fixture colors by `revenue` (genuine, measure-named) → stays quantitative.
- `viz-a11y-equivalence-emission.spec.ts` — **willMove:false** — `:49` (HEATMAP color field `val`, genuine numeric 5/8/3/6 → stays quantitative) + `:149` (s149-F6d R-11 assertion still passes). **The s151 #1 build-risk suite — STILL requires clean DIST rebuild + full run.**
- `data-analysis-predicates.spec.ts` — **willMove:false** — `:148`; existing s151 m05 tests hand-declare `scale:'band'/'linear'` independent of `inferFieldType`. This file GAINS the new tests.

**New tests:** (a) END-TO-END bare-field id heatmap via the real builder — `heatmapColorIsMeasure(spec)===false` AND narrative summary/keyFindings contain **NO** `Total`/`totaling` for the id field (**assert the human-readable LABEL string**, not just the predicate boolean — s149 F6d root-cause). (b) BOTH-direction boundary: numeric-string-ID → NOT measure/falls back; genuine quantitative → STILL measure (sums); **genuine sparse quantitative with null cells → STILL measure** (reds if a coercive/`.every()` probe is reintroduced). (c) `inferFieldType` profiler fixture: id-named numeric-string → `type:'nominal' role:'dimension'`; measure-named numeric-string → `'quantitative'`. (d) render-layer: bare id heatmap `spec.encoding.color.type` is NOT `'quantitative'` (pins gradient-over-IDs gone).

**Reproduce-RED:** LIVE via bridge (`POST http://localhost:4466/run`, tool `viz_render`, **envelope key `input` NOT `args`**): store_id heatmap `x=region/y=quarter/color=store_id`, `output.includeA11y:true` → `result.spec.encoding.color.type='quantitative'`, `a11y.narrative.summary "…totaling 6,021 Store id"`, table `store_id isNumeric=false`. Baseline GREEN: `npx vitest run test/data-analysis-predicates.spec.ts test/data-analysis-heatmap-f6d.spec.ts` (15 pass). The new end-to-end test is RED at HEAD without the guard; contrast the low-card 9-row/3-distinct case (rule-4 ordinal, already correct) to prove the residual gap is the high-distinct/<8-row/id-named case only.

**Highest build risk (see §11).** The Option-B reclassification propagates to THREE consumers (adapters, a11y narrative incl. a **new** A11Y-R-11 warn on the now measure-less categorical heatmap, and the recommender). Frame the new R-11 warn as an **a11y ADVANCE**, not a regression to silence. Full clean-rebuilt suites mandatory before Complete.

---

## 7. m04 — F3: phantom row-order Trend suppression (bar + scatter)

**Objective:** finish the phantom-row-order-Trend class (already closed for KPIs/F6b, heatmaps/F6d-s150, strips/s151-m05b) for the two remaining cartesian marks — **bar** and **true scatter**. Both emit a first-row-vs-last-row `"Trend …"` keyFinding that FLIPS sign on a mere row reversal and, for scatter, contradicts the order-invariant correlation in the same narrative.

**Fix (one line):** at `packages/viz-core/src/a11y/data-analysis.ts:188`, change the `computeTrend` gate from `!isMarkRectGrid(spec) && !isStripPlot(spec)` to a **sequence-mark allowlist** using the already-resolved `bindings.mark`: `computeTrend: bindings.mark === 'line' || bindings.mark === 'area'`. The allowlist subsumes both existing guards (heatmap→`'unknown'`, strip→`'point'`) and preserves the line/area summary path (`narrative-generator.ts:186-201`, which hard-depends on `analysis.trend`). Leave the correlation gate (`data-analysis.ts:189`), the `Total` gate (`narrative-generator.ts:297`, `mark!=='point'`), and the line-summary path UNCHANGED. **Scatter honest replacement = pure-suppress** — the order-invariant Correlation coefficient already ships; do NOT add an OLS slope (out of scope).

**Per-mark disposition:** nominal BAR → suppress TREND, **KEEP** `Total <measure>` (a sum of categories is legit) + High/Low. True SCATTER → suppress trend (and positional Total already gated by `mark!=='point'`), KEEP Correlation. Line/area → trend PRESERVED.

**Golden inventory (cited, all no-move):**
- `golden-profiles.spec.ts.snap` — **willMove:false** — narrative trend not serialized; `grep 'Trend increasing|decreasing'` over all `*.snap` is EMPTY.
- `viz-a11y-equivalence-emission.spec.ts` — **willMove:false** — asserts rule pass/fail + R-11 warn presence (`:72/81/86/145/156`), **no** `'Trend'` assertion; HEATMAP mark→`'unknown'` already excluded.
- `data-analysis-strip-plot.spec.ts` — **willMove:false** — `:77-89` (strip no Trend/Total, mark point stays suppressed) + `:102-110` (scatter asserts correlation-present, never trend-presence) → EXTEND, no assertion moves.
- `data-analysis-heatmap-f6d.spec.ts` — **willMove:false** — `:143-151` (heatmap no Trend/Correlation).
- `non-cartesian-a11y.spec.ts` — **willMove:false** — `:82`.
- `viz-determinism.spec.ts` — **willMove:false** — contentHash excludes the a11y block.

**New tests:** scatter-no-phantom-trend (`keyFindings.some(startsWith 'Trend ')===false` AND Correlation present AND row-reversal invariance); nominal-bar-no-phantom-trend (no Trend, KEEPS Total + High/Low, row-reversal invariance); line-trend-preserved CONTROL (temporal line still emits `Trend …` + `Overall change of N% across the period` — the over-suppression guard).

**Reproduce-RED:** LIVE bridge (`input`, `includeA11y:true`): scatter FORWARD `[120/40,100/48,150/30,70/62]` → `"Trend increasing: 55%"` beside `"Correlation coefficient: -0.996"`; REVERSED → `"Trend decreasing: -35.5%"` with IDENTICAL -0.996. nominal-bar FORWARD `[Chrome63,Safari20,Edge5,Firefox3]` → `"Trend decreasing: -95.2%" + "Total Share: 91"`; REVERSED → `"Trend increasing: 2,000%" + Total 91`. CONTROL line (temporal x) → `"Trend increasing: 80%"` (must stay). Baseline: `npx vitest run test/data-analysis-strip-plot.spec.ts test/data-analysis-heatmap-f6d.spec.ts` (14 pass; exit-1 is coverage-threshold only). The 3 new fixtures are RED at HEAD without the allowlist.

**Behavior-mover:** clean DIST rebuild + FULL viz-core + FULL mcp-server (3978) before Complete (s149 F6d learning).

---

## 8. m05 — F4: diverging-bar cardinality cap (Option 1, honest-fail)

**Objective:** close the >12-category slice of the s151 self-contradictory "diverging-on-positive-signal" defect. `diverging-bar` (`packages/viz-core/src/patterns/index.ts:454-461`) is the ONLY bar pattern with **no** `maxSeriesCardinality`, so at >12 categories it escapes the `CARDINALITY_OVERFLOW_PENALTY` (-8) every other bar takes and out-ranks simple-bar as the confident pick, carrying the self-contradictory "needs positive AND negative" signal on all-positive data.

**Fix (one line):** add `maxSeriesCardinality: 12,` to the diverging-bar heuristics (value 12, matching simple-bar + `HIGH_CARDINALITY_DIMENSION`).

**Derek fork RESOLVED = Option 1 (honest-fail lowConfidence).** Ship ONLY the cap. A >12-cat all-positive comparison demotes diverging-bar 10.4→2.4 (below simple-bar 5.4); the top pick becomes `layered-line-area` (score 7) flagged `lowConfidence=true` — honestly "no confident pick" vs HEAD's confidently-wrong diverging-bar. **Do NOT** add a `buildSuggested` coherence fallback. **Load-bearing regression (LIVE-verified):** signed >12-cat diverging-bar STAYS top (9.4 > layered 8.0 > simple-bar 6.4) — the fix does not steal signed cases.

**Golden inventory (cited, all no-move):**
- `golden-profiles.spec.ts.snap` — **willMove:false** — `golden-profiles.spec.ts:61`; the only diverging-bearing fixture is geo (`snap:163`) with maxNominalCardinality=4 ≤ 12; all fixtures ≤4 → cap (>12) never fires.
- `spec-builder.spec.ts` — **willMove:false** — `:890/:891` (signed diverging, 4 cats) + `:869` (all-positive simple-bar, 4 cats) + `:459` (revives-diverging, 4 cats); all ≤12.
- `spec-builder.spec.ts` (s110) — **willMove:false** — `:598` `chartType==='line'` / `:600` groupedHigh>0; diverging-bar drops 9.4→1.4 but all three assertions survive.
- `viz-determinism.spec.ts` — **willMove:false** — `:44` asserts determinism, not a pinned ranking (needs the DIST rebuild).

**New tests:** (a) **LOAD-BEARING REGRESSION** (spec-builder.spec.ts): 15-cat (>12) **signed** 1M/1D still elects diverging-bar — `suggestPatterns(...)[0].pattern.id==='diverging-bar'` AND `diverging.score > simpleBar.score` (9.4>6.4); teeth via a cap-removal mutation. (b) **CORRECTNESS Option 1 (honest-fail):** 15-cat all-positive → `diverging.score < simpleBar.score` AND `buildVizSpecFromRows(...).lowConfidence===true` AND top `suggestion.signals` does NOT contain `/positive AND negative/`. **Do NOT assert `patternId==='simple-bar'`** (top is layered-line-area under Option 1). (c) determinism N-run byte-identical full-ranking for the 15-cat all-positive intent.

**Reproduce-RED:** viz-core vitest (`@oods/viz-core`→src). Repro without a source edit by cloning diverging-bar with `maxSeriesCardinality:12` injected and re-ranking: 15-cat all-positive HEAD → diverging-bar 10.4 top, `lowConfidence=FALSE`; POST-cap → 2.4, top becomes layered-line-area 7.0 `lowConfidence=true`. 15-cat signed HEAD → 17.4; POST-cap → 9.4 STILL top. Boundary at exactly 12 → cap does not fire. Baseline: `npx vitest run test/spec-builder.spec.ts test/golden-profiles.spec.ts` (78 pass). The all-positive correctness test is RED at HEAD; the signed regression test is vacuously green (teeth via cap-removal mutation).

---

## 9. m06 — F7: generated-file git hygiene

**Objective:** stop two generated files churning on every local closeout.

1. **Schema files:** make `packages/mcp-server/test/contracts/contract-alignment.spec.ts` test `'pipeline save accepts { name, tags } object'` (`:198-204`) **hermetic** — wrap its body in the SAME `mkdtemp` + `process.env.MCP_SCHEMA_STORE_ROOT` + `try/finally` (delete env + `fs.rm`) pattern its sibling at `:206-228` already uses. It is the SOLE test hitting the default `process.cwd()` store, dirtying tracked `.oods/schemas/_index.json` + `test-tagged-schema.json` when run from repo-root. Keep the existing `expect(result.saved?.name).toBe('test-tagged-schema')` assertion (zero golden). Extend it to load/list from the temp root (mirror sibling `:206`) as the regression teeth.
2. **Diagnostics:** change `package.json:77` `pnpm run tokens:guardrails -- --quiet` → append `--no-diagnostics` (already parsed at `color-guardrails.ts:158`; the guardrail-failure exitCode is separate, so the closeout gate still fails on real violations). **`diagnostics.json` STAYS tracked** — the CI diagnostics-schema job (`ci.yml:188`) `readFileSync`-validates the committed file; untracking would ENOENT-fail CI.
3. **Derek-domain (git, not a build action):** `git rm --cached .oods/schemas/_index.json .oods/schemas/test-tagged-schema.json` (`.gitignore:48` `**/.oods/` already matches → they become ignored-untracked; **no** gitignore edit). Surface as a next-step; the builder does not run it.

**Golden inventory:** `.oods/schemas/_index.json`, `test-tagged-schema.json`, `diagnostics.json` — all **willMove:false** (not snapshot fixtures; no test asserts their content beyond the scalar `result.saved.name`). `contract-alignment.spec.ts` asserts scalars only.

**Reproduce-RED:** running the test from cwd=repo-root dirties the tracked root files (`git status` → ` M .oods/schemas/_index.json` + ` M test-tagged-schema.json`); from cwd=`packages/mcp-server` it lands in the gitignored `packages/mcp-server/.oods` (clean) — proving cwd-dependence. `pnpm run tokens:guardrails -- --quiet` bumps `diagnostics.json`'s `lastRun.evaluatedAt`. After the fixes both leave the tree clean.

**#564:** no `@oods/*` src touched; no render/adapter/certify/schema-generation change; zero golden. Not a viz-core-DIST mover.

---

## 10. Residual forks (both RESOLVED by Derek 2026-07-12)

- **F4 no-fit zone → Option 1 (honest-fail lowConfidence).** Cap only; `>12`-cat all-positive returns `layered-line-area` `lowConfidence=true`. No `buildSuggested` coherence fallback. m05 correctness test asserts `lowConfidence===true` + no "positive AND negative" signal (NOT `patternId==='simple-bar'`).
- **F2 sparse-null table → keep separate LOW.** The `table-generator.ts:180` null-intolerance (`typeof null==='object'` → sparse measure reads `isNumeric=false`) is **out of s152 scope**; flag as a distinct LOW carry with its own reproduce+golden pass. Do NOT silently fold.

No other Derek-premise fork remains. All other item forks resolved as technical-builder-calls on #564/a11y grounds (F1 barrel re-exports; F2 Option B over rejected Option A; F3 pure-suppress over OLS slope; F4 Option 1 over rejected Option 2 global-penalty change).

---

## 11. Closeout gate sweep (m07) + highest build risk

**Standing sweep (run in order):**
1. `pnpm install --frozen-lockfile` (lockfile drift).
2. root `pnpm typecheck` (catches `src/` ChartType consumers via the `src/viz` shim per-package tsc misses).
3. Generator `--check` gates (s150 B0 landmine) — REQUIRED only if F2 sharpens the `includeA11y` prose (`viz.render.input.json:334`): `@oods/schemas-tools generate` → `generated.ts` + `docs:api` → `viz-render.md`, both `--check`. F1 needs **no** regen (§4). **Run `--check` anyway to prove no-op.** Record #115 does NOT gate the F1 library capability.
4. `pnpm run tokens-validate` (F7: `diagnostics.json` stays SHAPE-valid, clean after run).
5. `pnpm -r build`.
6. **DIST-SANITY:** `rm -rf packages/viz-core/dist && pnpm --filter @oods/viz-core build` **BEFORE** the mcp-server suite (mcp-server vitest resolves `@oods/viz-core`→DIST; the s150 `isHeatmapRectSpec`-prototype landmine, s151-reinforced).
7. viz-core FULL suite (393 baseline + new F2 end-to-end + F3 scatter/bar/line + F4 >12-cat cases); confirm `golden-profiles.spec.ts.snap` did NOT move (F2+F4 joint no-move).
8. viz-render suite (11).
9. mcp-server FULL suite (3978) from cwd=repo-root — the a11y-equivalence gate for F2/F3 **AND** F7's hermeticity proof. Do NOT settle for the targeted a11y-equivalence file (s149 learning).
10. `test:scale` (62) incl `viz-determinism` (F4; needs step-6 DIST rebuild).
11. root core suite (4631).
12. vendored-parity (2).
13. **F7 git-hygiene VERIFY:** `git status --porcelain` clean for `.oods/schemas/*.json` + `diagnostics.json` after steps 4+9; Derek-domain next-step: `git rm --cached` the two `.oods/schemas` files (`diagnostics.json` STAYS tracked).
14. **DUAL-PATH live-verify** (bridge `:4466` POST `/run` **envelope key `input` NOT `args`**, + aquex, + shipped dist): F2 id-named numeric-string heatmap renders DISCRETE color + narrative falls back to Y + honest A11Y-R-11 warn; F3 bar/scatter emit NO phantom Trend while line/area KEEP trend; F4 >12-cat all-positive no longer confidently elects diverging-bar (honest lowConfidence); F1 Hero-B `marks[1].from='gov_median'` 2-row dataset resolves+renders in both adapters.
15. `pm2 restart oods-forge-bridge` after the dist rebuild (mine, not Derek's) so `:4466` serves the shipped dist.

**Highest build risk = F2 (m03),** on two compounding banked landmines: (1) the Option-B reclassification propagates to THREE consumers (adapters / a11y narrative incl. a new R-11 warn / recommender) — the s149 F6d learning is that such changes surface in a11y-equivalence-emission specs ONLY at the FULL clean-rebuilt mcp-server suite, so the targeted "zero 3978 movement" prediction MUST NOT be trusted; (2) the s150/s151 DIST-SANITY landmine silently masks a viz-core src change behind a stale dist. Mitigation baked into the closeout. **Assert the human-readable narrative LABEL string, not just the predicate boolean** (the s149 F6d root cause).

---

## 12. Provenance & records

- Review that surfaced the carries: PS-2026-07-12-003 (s151 review, wf_045cb0af-4be), decisions #1180/#1181/#1182.
- Scope lock: PS-2026-07-12-004, decision #1183 (Derek AskUserQuestion) + the two fork resolutions (F4=Option 1, F2-null=keep-separate).
- Grounding: wf_f0e02eba-177 + F1 re-grounder.
- Pre-existing companion: #910 (nominal-bar phantom trend) is subsumed by F3/m04.
