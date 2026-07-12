# Forge Sprint-151 — Decision Memo (SSOT)
## Demo-03 completeness: `datasets` slot + recommender bar + narrative honesty + tokens ESM + map-rendering scoping

**Status:** LOCKED (Derek, 2026-07-11 — AskUserQuestion: "Full 4-item" build + "Scoping memo mission" for maps).
**Puller:** Forge-Demos **"Demo 03 — The Design DNA of the Web"** (GO, pilot week) — the *first real consumer build* on the s126–s150 viz arc (buildFromIntent, native non-cartesian/spatial a11y, generateNarrativeSummary + MeasureNarrativeContext, baked categorical palette / ECharts chrome).
**Arc:** GENERATE-side viz-craft **completeness** (the anti-circular antidote; Meridian's viz-craft pull is discharged, Forge-Demos Demo 03 is now the named puller).
**Grounding:** every item reproduced vs HEAD `31332a3` by workflow `wf_019b8fc2-c57` (8 parallel reproduce-first agents + roadmap survey + synthesis); load-bearing structural facts re-verified live for this memo (two schema copies byte-identical @ 22779 bytes; `additionalProperties:false` @ line 61; both adapter dangles present; no plain 1M/1D bar in the registry; the stray-space + coercive `isQuantitativeField`; the `assert` literal @ build-entry.mjs:56; all closeout gate scripts present).

**Origin messages (Forge-Demos → Forge, 2026-07-11):**
- `d4ce443e` (Demo 03 GO + certify-on-layered-spec question)
- `a2910d91` (s150 re-verification: FD#10/#11 RESOLVED; FD#12/#13 open; **certify-on-layered-spec PASSES**; NEW #14–#17 + doc-drift)

FD-numbered items live **only in the CMOS inbox** (no repo footprint). This memo + m07's `cmos_feedback` refile are the durable record — do not let them fall off.

---

## 1. Verdict

| Group | Item | Effort | #564 byte-mover | Verdict |
|---|---|---|---|---|
| **(a) Demo-03 critical** | **#16** — top-level `datasets` slot resolving `Mark.from` | M | **YES** (schema-change) | **BUILD** (m02+m03) |
| **(a) Demo-03 critical** | **#15** — plain `bar` recommender pattern | S | **YES** (1 golden block) | **BUILD** (m04) |
| **(a) Demo-03 critical** | **Hero A** — MarkPoint strip-plot narrative (measure-channel + phantom guard + nominal summary) | M | zero-golden (verify at fix time) | **BUILD** (m05b — added 2026-07-12 post-grounding) |
| **(c) Carry/hygiene** | cluster-narrative A/B/C (stray-space + profiler-honoring predicate) | S | **ZERO** | **BUILD** (m05 — closes s150 carries #895/#896) |
| **(c) Carry/hygiene** | **#14** — tokens ESM `assert`→`with` | S | ZERO (dist gitignored) | **FIX** (m06) |
| **(map) scoping** | Roadmap-A geo-SVG-export design memo + refile FD#12/#13/stubs | S (no build) | — | **SCOPE** (m07) |
| **(deferred)** | FD#13 per-layer spatial `from` scoping | M | zero-golden | DEFER — §5 |
| **(deferred)** | FD#12 antimeridian split | M | — | DEFER — §5 |
| **(deferred)** | #17 MarkText/MarkRule annotation marks | L | — | DEFER — §5 |

**Constraint set honored every mission:** #564 (additive/zero-churn where possible) · #525 (no new MCP tool) · #110 (never edit certify to make something pass; honest-fail is a feature) · determinism (byte-identical contentHash on repeat) · #115 (agent-visible prose must be truthful).

**Discipline (s149/s150 learnings, non-negotiable):**
- Every behavior-mover **reproduces RED-in-isolation before the fix**.
- Every predicted golden/assertion churn **cites a grep-verified asserting file**, or declares **zero-golden + new colocated tests**. Never blind-`-u`.
- **Run the FULL package suite before completing any behavior-mover** — F6d-class regens surfaced only at the full cross-package suite, not the edited surface.
- **DIST-SANITY:** mcp-server vitest resolves `@oods/viz-core`→**dist** — rebuild viz-core clean before the mcp-server suite.

Sprint size: **m01 memo + m02–m08 (incl. m05b) = 9 missions** (inside the 6–10 band). Two data-dependencies (m02→m03 for the type; m05→m05b for the shared `resolvePrimaryBindings`/`narrative-generator.ts` files); the rest are sequenced strict-Requires for a clean linear fresh-session handoff. Chain: **m01→m02→m03→m04→m05→m05b→m06→m07→m08.**

**Added 2026-07-12 (Derek scope-expansion):** m05b was inserted after the two un-probed Demo-03 heroes were verified at HEAD — **Hero C (MarkRect continuous-color heatmap) is CLEAN** (reads "…totaling 102 Violation Count", R-11 passes, no phantom trend, distinct from the numeric-string-categorical edge m05 fixes), but **Hero A (MarkPoint strip-plot) has real gaps** → m05b. See §2 m05b.

---

## 2. Mission spine (strict `Requires`, linear)

### m01 — SSOT decision memo (this file). **Completed-at-creation.**

### m02 — [Item #16 · schema + type regen]. Requires: m01.
Add an optional top-level `datasets` map to **BOTH** schema copies **in lockstep** (verified byte-identical today, 22779 bytes, no auto-sync found):
- `schemas/viz/normalized-viz-spec.schema.json` — generator SSOT
- `packages/viz-core/src/spec/normalized-viz-spec.schema.json` — runtime-AJV vendored copy

Under top-level `properties`, add:
```json
"datasets": {
  "type": "object",
  "additionalProperties": { "type": "array", "items": { "type": "object", "additionalProperties": true } },
  "description": "Named row-arrays that layered marks reference via Mark.from; resolved into Vega-Lite top-level datasets / ECharts dataset entries at adapt time."
}
```
- **NOT** added to `required`.
- **Must be declared** — top-level `additionalProperties:false` (line 61) rejects an undeclared key. (This is the one non-transparent piece; hence "schema-change" not "transparent-additive".)
- Regen types: `pnpm generate:schema-types` (`scripts/types/generate.ts`; routes viz/normalized-viz-spec → `packages/viz-core/src/spec/normalized-viz-spec.types.ts`) → yields `datasets?: { [name:string]: {[k:string]:unknown}[] }` on `NormalizedVizSpecV01`.
- **VERIFY both schema copies still byte-identical after edit** (`diff -q`). Gate: `generate:schema-types --check` green.

### m03 — [Item #16 · adapter resolution + tests]. Requires: m02 **(STRICT — the `datasets?` field must exist on the type before adapters read `spec.datasets`).**
- **ECharts** (`packages/viz-core/src/adapters/echarts-adapter.ts` ~line 187, `convert`): build a dataset **array** instead of `[dataset]`:
  `[primaryDataset, ...Object.entries(spec.datasets ?? {}).map(([id, rows]) => ({ id, source: rows, dimensions: inferDimensions(rows) }))]`
  so the existing `datasetId = mark.from ?? fallbackDatasetId` (line 291) resolves.
- **Vega-Lite** (`packages/viz-core/src/adapters/vega-lite-adapter.ts` `baseSpec` ~line 134): add `datasets: spec.datasets` via `removeUndefined` — Vega-Lite's native top-level `datasets` map — so the existing layer `data:{ name: mark.from }` (line 185) resolves natively.
- **GATE the emission on `spec.datasets` presence, and OMIT the key (not `datasets: undefined`, not empty `{}`) when absent** → specs without `datasets` are byte-identical. This is the #1 misprediction risk (§6).
- **CONSUMER CONTRACT (Forge-Demos Hero B, confirmed 2026-07-12, msg 67d8a849):** the datasets-slot shape `{ [name]: Row[] }` resolved via `Mark.from` is confirmed to match Hero B as built (median layer = `marks[1].from='gov_median'`, 2 rows `{site, median}`). Two contract requirements the build MUST honor:
  1. **Primary layer stays INLINE.** The primary bar layer keeps `data:{name:'ladder', values}` (MarkBar, no `from`) — it resolves via `spec.data` / the VL top-level `data` / the primary ECharts dataset. **Only `from`-referenced layers resolve against `datasets`.** m03 must include a MIXED spec test (primary MarkBar inline + secondary MarkLine `from`-referenced) asserting the primary's data path is byte-UNCHANGED vs a no-datasets baseline.
  2. **Bind by FIELD NAME, not column order.** A `from`-referenced series binds its rows by the mark's own encoding field names (e.g. `x:'median', y:'site'`), NOT positionally. ECharts: `dimensions` preserve field names + series `encode` references dimension NAMES; assert a row-object with a different key order still binds. Vega-Lite: named-dataset fields are referenced by encoding field name natively.
  - **Consumer contentHash heads-up (informational, not our action):** a spec that ADOPTS the slot changes its own compiled bytes → new `contentHash`; Forge-Demos will re-certify + re-pin Hero B's `receipt.json` on re-vendor (expected on their side, NOT drift on ours — a Forge spec WITHOUT `datasets` stays byte-identical via the gate, so none of our goldens move).
- **Reproduce-RED first (both fail at HEAD = dangle, pass after):**
  - add a layered-`datasets` case to `packages/viz-core/src/adapters/vega-lite-adapter.spec.ts` asserting top-level `datasets` emission + layer-name resolution;
  - **CREATE** `packages/viz-core/src/adapters/echarts-adapter.spec.ts` (does not exist) asserting the multi-dataset array + series `datasetId` resolution;
  - add a **from-absent byte-identical assertion** (guards the gate leak).
- **Certify stays out of scope.** The fix *resolves* the reference; a honest-fail WARN-on-unresolved-`from` is a **separate future item — do NOT bundle** (#110).
- **Run full viz-core + (clean-rebuilt) mcp-server suites before completing m03** — do not wait for m08. A leaked gate moves an mcp-server a11y-equivalence snapshot only at the full cross-package suite.

### m04 — [Item #15 · plain `bar` pattern]. Requires: m03 (ordering; files disjoint).
- Add a plain `bar` ChartPattern to `packages/viz-core/src/patterns/index.ts` (**Approach A**):
  `{ measures:{min:1,max:1}, dimensions:{min:1,max:1}, goal:['comparison'], density:'flex', maxSeriesCardinality:12, perceptualRank:1 }`.
  (Probe-verified scoring: all-positive 1M/1D → new bar **13.4** > diverging **10.4** (bar wins, clean signals, `lowConfidence:false`); signed 1M/1D → diverging **17.4** > bar **14.4** (s110 diverging-revival preserved, `spec-builder.spec.ts:459`).)
  - id `bar` is fine (id ≠ chartType), `simple-bar` is clearer — builder's call; `perceptualRank:1` shared with diverging/grouped-bar is fine (not unique-constrained).
- **Reject Approach B** (only tightening diverging-bar's guard): leaves the 1M/1D gap → shape falls to `layered-line-area` (area, 7.0 → `lowConfidence` flips TRUE) = strictly worse.
- **Reproduce-RED:** new `packages/viz-core/test/spec-builder.spec.ts` case — 1M/1D all-positive comparison → `patternId:'bar'`, `chartType:'bar'`, `lowConfidence:false`, **no** "positive AND negative" signal — fails at HEAD (returns `diverging-bar`, 10.4, self-contradictory signals).
- **Golden (grep-verified — exactly ONE block):** re-snap the `geo` `ranking` array in `packages/viz-core/test/__snapshots__/golden-profiles.spec.ts.snap` (~line 163). **Inspect, do NOT `-u` blind:** confirm geo's TOP stays `diverging-bar` (~line 166); only lower slots shift (new bar enters top-5 ~rank 4 @ score 7.4). The other 4 fixtures do NOT move (probe: bar 5.4 sales / −2.6 timeseries / −9.6 two-measure / −0.6 categorical-codes — below their top-5 mins). Full viz-core run is the gate on a second block moving.
- Add a `Bar` row to `docs/viz/pattern-library-v2.md`. `patternId` is free `string` (viz.render.output.json:108 / generated.ts:7091 — NOT enum-advertised), so no schema/#115 obligation.

### m05 — [cluster-narrative A/B/C · narrative honesty]. Requires: m04 (ordering). **Closes s150-review carries #895 (MED) + #896 (LOW) + the Forge-Demos stray-space nit.**
- **(A) stray space** — `packages/viz-core/src/a11y/narrative-generator.ts:222`: make the space conditional:
  `...totaling ${formatNumeric(analysis.total)}${labels.measureLabel ? ` ${labels.measureLabel}` : ''}.`
  (with-label output byte-identical; empty label no longer leaves `" ."`).
- **(B) profiler-honoring predicate** — `packages/viz-core/src/a11y/data-analysis.ts` `heatmapColorIsMeasure` (~lines 119–124): replace the coercive `isQuantitativeField(collectRows(spec), color.field)` (`rows.some(r => toNumber(r[field]) !== null)`, ~lines 305–307) with a check mirroring `inferFieldType`'s color branch:
  color is a measure iff `color.type === 'quantitative' || (color.scale && QUANT_COLOR_SCALES.has(color.scale))`, `QUANT_COLOR_SCALES = {'linear','log','sqrt'}` (cross-ref `vega-lite-adapter.ts:12/440`; inline the 3-set with a comment, or export+import `QUANT_SCALE_TYPES`).
  - **Drop the `collectRows` call; DELETE the now-unused module-local `isQuantitativeField`** (data-analysis.ts:305 — grep-confirm sole caller is this predicate at fix time; it is NOT exported).
  - **MUST check `type` OR `scale`, not scale-alone** — scale-alone breaks the cross-package `viz-a11y-equivalence-emission.spec.ts:53` (unscaled `'val'` relies on the builder-stamped `type:'quantitative'`).
  - **HARD CONSTRAINT: no `.some()`→`.every()`** — the cell probe is *removed entirely*, so null cells no longer affect the decision (null-tolerance strengthened, not weakened; a sparse `scale:'linear'` heatmap stays quantitative).
- **(C) Reproduce-RED + 3 new colocated fixtures:**
  - numeric-string categorical color (profiler→ordinal): mislabels `"Total Store Id: 18"` at HEAD (sums the codes) → falls back to Y after (`data-analysis-predicates.spec.ts`);
  - sparse `scale:'linear'` + null cell → stays quantitative + measureLabel = color name (null-tolerance guard);
  - no-measureLabel summary reads `"...totaling 4."` — no trailing space (`measure-narrative.spec.ts`).
- **#115: ZERO churn — advertised prose already correct** (verified live: `docs/api/viz-render.md:59` + `generated.ts:6962` both say "when color is a real quantitative measure … categorical or absent falls back to the Y measure"). The fix makes code honest to shipped prose.
- **Golden: ZERO existing movement** (grep-verified): all 3 "totaling" asserters carry non-empty labels (`measure-narrative.spec.ts:39/:54`, `data-analysis-heatmap-f6d.spec.ts:102`); every existing `heatmapColorIsMeasure` fixture stays green via `type||scale` (`data-analysis-predicates.spec.ts:79/83/87/91`; `heatmap-f6d:100/122/133`; emission-spec:53 rides the TYPE branch).
- **DIST-SANITY + full mcp-server suite mandatory** (viz-core→mcp-server dist dependency).

### m05b — [MarkPoint strip-plot narrative correctness · Hero A]. Requires: m05 **(files overlap — same `resolvePrimaryBindings` + `narrative-generator.ts` m05 edits).**
Grounded 2026-07-12 (agent probe vs HEAD; concrete live repro). Forge-Demos Hero A ("type-scale fingerprints") is an EXPLICIT `chartType:'scatter'` MarkPoint strip plot (1 measure + 1 nominal dimension). Three gaps, all the F6b/F6d text-vs-render family never applied to `point`:
- **GAP 1 (hard) — horizontal strip (measure=X, category=Y):** `resolvePrimaryBindings` (`data-analysis.ts:168-169`) binds `dimensionField=x`, `measureField=y` BLINDLY — never checks which channel is quantitative → measure resolves to the nominal field, `toNumber` drops every point → analysis empties (`min/max/total` undefined, summary degrades to the raw description) → **A11Y-R-11 [warn] FAILS** (`equivalence-rules.ts:230`).
- **GAP 2 (phantom) — vertical strip (category=X, measure=Y):** renders + certifies GREEN but the narrative asserts a phantom **"Trend increasing: X%"** (`computeTrend: !isMarkRectGrid(spec)` at `data-analysis.ts:142` — never guarded for `point`; first→last-by-row-order, reorder changes the claim) and a phantom **"Total <measure>: N"** (`narrative-generator.ts:283` — meaningless aggregation of a positional strip-plot measure).
- **GAP 3 — nominal-dim summary:** the narrative `case 'point'` (`narrative-generator.ts:211-218`) only emits when `correlation !== undefined` (numeric-numeric scatter) → a nominal-x strip plot gets no data-derived summary, silently falls back to the static `a11y.description`.
- **FIX (do NOT lower any a11y rule — R-11 passes by producing REAL findings):** (1) measure-channel detection in `resolvePrimaryBindings` — bind the QUANTITATIVE channel as measure by HONORING the profiler's stamped type (mirror m05's approach, do NOT re-derive coercively), integrate coherently with m05's heatmap-color special case (same function); (2) extend the phantom trend/total guard to `point` for a one-measure/one-NOMINAL-dimension strip plot, but **PRESERVE trend/correlation for a TRUE numeric-numeric scatter** (reproduce a genuine scatter → still correct, do NOT over-suppress); (3) a real distribution/spread data-derived summary for the nominal-dim point.
- **Reproduce-RED each gap in isolation** (horizontal→R-11 warn + empty analysis; vertical→"Trend increasing"/"Total"; nominal-x→no data summary). **Golden/test story:** grep-verify the point-narrative asserting specs at fix time (declare zero-golden + new colocated tests OR cite movers); tests assert the rendered narrative STRING (per s149/s150 — no phantom Trend/Total, correct extrema, non-empty summary). Full viz-core + clean-rebuilt mcp-server suites green before completing.

### m06 — [Item #14 · tokens ESM build-fix]. Requires: m05b (ordering).
- `packages/tokens/scripts/build-entry.mjs` `buildEsmModule()` line 56: `assert { type: 'json' }` → `with { type: 'json' }` (import attributes; supported ≥ Node 18.20/20.10; engines require ≥20.11.1). `buildCjsModule()` (require) untouched; exports map / `main`/`module` / .d.ts untouched. **Reject inline-JSON** (heavier, re-churns entry bytes per token change).
- **Reproduce-RED:** `node --input-type=module -e "import('<abs>/packages/tokens/dist/index.js').then(m=>console.log(Object.keys(m)))"` throws `SyntaxError: Unexpected identifier 'assert'` at HEAD; prints `tokens,flatTokens,cssVariables,meta,prefix,default` after `pnpm --filter @oods/tokens build`.
- **Golden:** zero (dist gitignored + untracked; sole grep hit for the literal is the emitter). Optional: a colocated build+dynamic-import probe spec (new test, not a golden).

### m07 — [Map-rendering scoping memo + refile]. Requires: m06 (ordering; no code). **Honors Derek's "don't lose the map asks" flag.**
Two deliverables, **no product-code changes**:
1. **Geo-SVG-export scoping memo** → `cmos/planning/forge-viz-geo-svg-export-scoping-memo.md`. Scope the real "map rendering we requested" (Roadmap-A): geo panels (choropleth/bubble_map/flow_map) currently render as an **a11y-described PLACEHOLDER**, not real SVG, in `output.html` (fenced since s115 — `cmos/planning/forge-viz-phase2.6-export-frozen-seams.md:48-58`; `forge-viz-phase2.6-export-scoping-memo.md:51,90`). Memo must: name the single-renderer VL→SVG constraint; propose the seam (where a geo SVG renderer plugs into the export pipeline); size it honestly (L); note there is **no active map puller** today (Demo 02 parked, Demo 03 is cartesian) — so this is roadmap-seating, not a scheduled build. Cite `output.html` placeholder path.
2. **Refile the FD-numbered + stubbed map asks into the durable record** (they live only in the CMOS inbox today):
   - **FD#13** per-layer spatial `from` scoping — latent bug (phantom scatter/arcs); **not MCP-reachable**; needs a referent-design pick (named-datasets map vs discriminator column) + a multi-layer geo MCP input schema before `from` is load-bearing. When built, MIRROR item #16's `datasets`-map shape but keep self-contained in `echarts-spatial-adapter.ts + spatial.ts` (shared *pattern*, never shared *code* — §4).
   - **FD#12** antimeridian split — opt-in `options.splitAntimeridian` on `registerGeoJson`'s existing options bag, crossing-guarded early-return (#564 zero-churn); correct general split (MultiPolygon/holes/re-closing/winding) is the M-L risk. Add ONE sentence to the geo-branch schema description noting antimeridian is currently consumer-side + the split is a future opt-in (so the next consumer doesn't re-probe guessed names).
   - **Roadmap-D/E honesty exposure:** `heatmap`/`contour` LayeredOverlay layers + `tile` basemap are **advertised in the public trait schema but stubbed** (`docs/traits/layered-overlay.md:37-40,71,77`) → a #115/#110 latent no-op (the class Meridian catches). Flag a "reject-loud or implement" decision for when a map consumer unparks.
   - **#17** MarkText/MarkRule annotation marks (see §5).
   - Record all via `cmos_feedback` and/or a roadmap addendum so nothing depends on inbox memory.

### m08 — [Closeout · full-suite + live]. Requires: m07.
- `pnpm install --frozen-lockfile`, root `pnpm typecheck`.
- **Both generators `--check`:** `generate:schema-types` (item #16 types) + the `generated.ts` generator (confirms #16 non-move) + `docs:api --check` (catches any docs/api movement from the item-#16 schema `description` regen — the **s150 landmine**).
- `tokens-validate`, `pnpm -r build`.
- **DIST-SANITY:** clean viz-core rebuild **before** the mcp-server suite.
- Full **viz-core** suite, **viz-render**, full **mcp-server** suite, `test:scale`, vendored-parity, root **core**.
- **Live-verify** via pm2 `oods-forge-bridge` :4466 + aquex (reconnect first if dropped): item #16 `Mark.from` resolves (non-empty layered render), #15 1M/1D→`bar`, cluster-narrative labels honest (numeric-string color falls back to Y; no stray space), item #14 ESM import loads.

---

## 3. #16 ↔ FD#13 — KEEP SEPARATE (decision)

They share a *naming concept* only; unifying into one code path is wrong.

| | Item #16 `Mark.from` | FD#13 `SpatialLayer.from` |
|---|---|---|
| IR | `NormalizedVizSpec` | `SpatialSpec` — "predates and sits beside the IR" (spatial.ts header) |
| Consumed | cartesian adapters, **already wired** (echarts:291, vega:185) | echarts-spatial dispatcher, **never wired** |
| MCP-reachable | **YES** (demo03-critical) | **NO** (single-layer geo branches gate it) |

**Build #16 now; defer FD#13.** Do not drag `SpatialSpec` into the IR to share a map — large refactor, no puller. When FD#13 is built, **mirror #16's `datasets`-map shape** (consumer consistency) but keep it self-contained in `echarts-spatial-adapter.ts + spatial.ts`.

---

## 4. Highest-risk missions + the one most-likely misprediction

**Top 3 risk:**
1. **m03 (item #16 adapters) — HIGHEST.** Two-schema-lockstep drift (runtime AJV rejects valid specs OR generator `--check` fails); ECharts dataset-id collision (`Mark.from`==auto-derived primary id → benign resolve-to-primary; two named keys sharing an id → last-wins, must be deterministic + documented); a `from` naming a missing key still dangles (leave as consumer error — do NOT bundle a certify WARN); net-new `echarts-adapter.spec.ts` must be picked up by vitest; **the gated emission must OMIT (not `undefined`, not `{}`) `datasets` when absent.**
2. **m04 (item #15 golden re-snap).** Inspect, don't `-u`: verify geo TOP stays `diverging-bar` and the signed diverging-revival case still wins (17.4>14.4). A blind re-snap that flips the TOP ships a recommender regression.
3. **m05 (cluster-narrative predicate).** `type||scale` (not scale-alone) is load-bearing across packages — scale-alone breaks `viz-a11y-equivalence-emission.spec.ts:53`. viz-core→mcp-server dist dependency → **DIST-SANITY rebuild + full mcp-server suite mandatory.**

**The one thing most likely mispredicted:** item #16's *supposedly-gated, byte-identical* adapter emission moving an **existing mcp-server viz.render / a11y-equivalence snapshot** if the gate leaks (`datasets:undefined` not stripped by `removeUndefined`, or Vega-Lite emitting empty `datasets:{}`). Per s149/s150 this surfaces **only at the full cross-package suite after a clean dist rebuild**. **Mitigation:** the from-absent byte-identical assertion in m03 **and** run the full viz-core + mcp-server suites post-rebuild **before completing m03** (not m08). Secondary watch: item #15's new `bar` score crossing an unpredicted top-5 threshold on one of the other 4 golden-profile fixtures.

---

## 5. Deferred parks (re-listed so they survive — m07 makes them durable)

- **FD#13** (per-layer spatial scoping) — genuine latent bug, not MCP-reachable, needs referent-design pick + multi-layer geo MCP schema; no puller. Gating decision (Derek): does a multi-layer geo MCP input schema get roadmapped? FD#13 rides on that.
- **FD#12** (antimeridian split) — cheap plumbing, but a correct general split is M-L with ship-a-broken-map risk (worse than the consumer's working `stripAntimeridianRings`); no puller; Demo 02 parked.
- **#17** (MarkText/MarkRule annotations) — consumer flagged nice-to-have + **off critical path** (ships annotations as adjacent HTML chrome). Honest scope is **L**: (A) vega-lite `MARK_TRAIT_MAP` + `text` channel; (B) ECharts `markPoint`/`markLine` **component** branch (no series equivalent — component-not-series divergence); (C) the **load-bearing** a11y-equivalence surfacing of annotation text (gates any #115 "annotations in the certified plane" claim — advertising after only (A) ships a hollow-certified annotation = the text-vs-render divergence family that cost s149/s150); (D) certify untouched (#110 holds — annotation-secondary specs route on their cartesian primary). Park as ONE entry with (C) as the advertising gate.
- **Roadmap-A** — geo SVG export (the actual "map rendering we requested"). m07 produces its scoping memo. Large; not s151.
- **Roadmap-D/E** — `heatmap`/`contour` LayeredOverlay + `tile` basemap advertised-but-stubbed. #115/#110 honesty exposure. m07 flags "reject-loud or implement" for when a map consumer unparks.
- **Standing parks** (near.md): governed-measure storage backend; Phase-4 eval harness; src/viz ~137-site rewire + shim deletion; SSR; dark-mode `resolveTokenToColor`; Meridian PT/HCM "D1 strain ledger". s149 chrome deferrals (tooltip chrome A/B; border-strong token).
- **STALE — flag for removal, not action:** Concordance asks (CORS allowlist / Bearer issuance / wire-bump notify) — Concordance is sunset.

---

## 6. Doc-drift (the one grounding item that didn't return structured — handle in m07's refile or as a doc note)

Forge-Demos FYI (verify, then correct in docs/#115 prose if confirmed): circulating capability names are **source-module paths**, not public exports. Actual exports: `resolveCategoricalPalette`/`resolveOodsEchartsChrome`/`resolveOodsVegaConfig`, `analyzeSankey`/`analyzeHierarchy`/`analyzeNetwork`/`analyzeSpatial` (with `AnalysisTableInput`/`AnalysisNarrativeInput` overloads). `MeasureNarrativeContext` uses `thresholdValue` (not `threshold`). `VIZ_CATEGORICAL_SCALE` is declared in the `.d.ts` but **not exported**. Low-risk doc-only; fold into m07 refile or defer to a docs sweep.

---

**Provenance:** grounding `wf_019b8fc2-c57` (transcript + journal under the session subagents dir). Scope locked by Derek 2026-07-11. This memo is the SSOT — the build session executes m02→m08 from here **without re-grounding**.
