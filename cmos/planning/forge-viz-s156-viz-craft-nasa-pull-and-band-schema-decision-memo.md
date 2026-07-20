# Sprint-156 decision memo — viz-craft: NASA-pull + band-schema (merged)

**Status:** RATIFIED + LOCKED 2026-07-19 (Derek AskUserQuestion — merge; de-advertise; build diverging; cohort-scatter rename; wide diverging scope; ratify & lock).
**Focus:** One merged viz-craft sprint on the color/chrome/fidelity arc (#1071) that discharges the live Forge-Demos NASA-pilot backlog_request (`a811bdd1`, 4 FIT-visible gaps) **and** the pre-scoped band-schema fork (fork-1), folding their overlaps (linked-brush-scatter; continuous/diverging color) into single missions.
**SSOT:** this file. 8 missions m01(memo, Completed-at-creation)→m08(closeout).
**Baselines (from s155 close, reconcile at m08):** viz-core 566 · mcp-server 3978 · root core `vitest run --project core` 4631 · test:scale 62.

---

## §1 Standing rules applied (from the s155 upgrade)

- **CLAIM-ON-POSITIVE-EVIDENCE.** Any narrative/label claim gates on a POSITIVE precondition (fail-safe to silence). Applies to **m06** (aggregate projection) — see §3.
- **Machine-enumerated property proof** of class closure + a **SEPARATE adversarial-verify-the-closure** pass. m06 ships a bounded-exhaustive property test; the sprint's genuine-close review is a separate session (do NOT self-declare).
- **#564 zero-owned-golden** except the enumerated intended moves in §4; **#110/#525/#115/determinism** untouched.
- **Reproduce-RED-in-isolation** each mission at HEAD before the fix; **assert the human-readable LABEL string**; **dual-path live-verify** at close (bridge :4466 envelope key `input`, shipped dist).

## §2 Grounding provenance

Grounded at HEAD `7ef5f96` (post-s155, NOT the s153 commit `1342ab2` Demos tested) by workflow `wf_985d8538-d66` — 6 parallel agents, 0 errors. Every predicted golden below is grep-verified to a real asserting file. Key deviations from the Demos framing are recorded per-mission as ⚠.

---

## §3 Per-mission

### m01 — SSOT decision memo (Completed-at-creation)
This file. m02→m08 execute from it without re-grounding.

### m02 — Log-scale precedence [S, FIRST] — NASA #1
**Objective.** Let an explicit `scale:'log'` win over a co-declared `type:'quantitative'` in the ECharts adapter, so a log axis is not silently rendered linear.
**Grounded mechanism.** [echarts-adapter.ts](../../packages/viz-core/src/adapters/echarts-adapter.ts) `inferAxisType` consults `binding.type` BEFORE `binding.scale`: `if (binding.type === 'quantitative') return 'value';` (~:490) returns before the `if (binding.scale === 'log') return 'log';` branch (~:498), which is therefore unreachable when a type is present. Vega ([vega-lite-adapter.ts:437-438,500-502](../../packages/viz-core/src/adapters/vega-lite-adapter.ts)) emits `scale.type:'log'` orthogonally to field type → the two adapters DISAGREE (Vega log, ECharts linear).
**⚠ Mechanism narrower than reported.** Demos' claim "the builder always stamps the type, making the log branch unreachable" is FALSE: `applyDataAwareTypes` ([spec-builder.ts:691](../../packages/viz-core/src/builder/spec-builder.ts)) SKIPS any binding that already declares a scale, and suggest-mode `scaleForType` never emits `'log'`. A **scale-only** log spec already renders correctly. Silent loss fires ONLY when the caller **co-declares both `type:'quantitative'` AND `scale:'log'`** (valid-but-redundant explicit spec).
**Fix.** Minimal in-branch guard: `if (binding.type === 'quantitative') return binding.scale === 'log' ? 'log' : 'value';`. Single file; no builder change. (Reject the hoist-above alternative — it would also override temporal/nominal types.)
**RED-first.** [echarts-adapter.spec.ts](../../packages/viz-core/src/adapters/echarts-adapter.spec.ts) test MUST supply BOTH `type` and `scale` to reproduce; assert emitted axis `type:'log'` (and Vega parity).
**Golden:** zero.

### m03 — y2/x2 band schema + fixture conformance [M] — band-fork M1
**Objective.** Accept `y2`/`x2` encoding channels in the normalized-viz-spec schema so band/range specs validate. Adapter already renders them.
**Grounded mechanism.** [normalized-viz-spec.schema.json:168-176](../../packages/viz-core/src/spec/normalized-viz-spec.schema.json) `EncodingMap` lists only x/y/color/size/shape/detail with `additionalProperties:false`; `TraitBinding.channel` enum (:192) has no y2/x2. Vega adapter already supports them (`CHANNEL_ORDER` includes x2/y2 at :11; convertBinding normalizes x2→x/y2→y at :270) — ONLY the schema lags.
**⚠ "6 failing fixtures" is split, not all y2/x2.** Of the 6 patterns-v2 fixtures failing `assertNormalizedVizSpec`: **2 fail on y2/x2** (`facet-target-band`, `target-band-line`) → this mission; 2 fail on `scale:"diverging"` → m04; 2 on malformed interactions → m05.
**Fix.** Add `y2`/`x2` to `EncodingMap.properties` and `"x2","y2"` to the `TraitBinding.channel` enum in **BOTH** schema copies — `schemas/viz/normalized-viz-spec.schema.json` (Generator-B type-gen source) and `packages/viz-core/src/spec/normalized-viz-spec.schema.json` (runtime AJV copy) — then `generate:schema-types`. No adapter change.
**Golden:** `normalized-viz-spec.types.ts` regen (gated by `generate:schema-types --check`, ci.yml:57 + `schema-types.contract.test.ts`) — intended, §4. The 2 fixtures flip INVALID→VALID (not snapshot goldens; exercised once m07's gate lands).

### m04 — Continuous-color rendering [M] — NASA #4 + band-fork M2
**Objective.** (a) Cartesian MarkRect heatmap emits an ECharts `visualMap` (continuous color). (b) Build a diverging color scale end-to-end. Share ONE generator.
**Grounded mechanism.** (a) [echarts-adapter.ts:420-436](../../packages/viz-core/src/adapters/echarts-adapter.ts) `applyHeatmapEncoding` sets only `encode.value`; the assembled option has NO `visualMap` key. The continuous generator `createVisualMapForScale`/`createContinuousVisualMap` ([spatial/echarts-visualmap-generator.ts](../../packages/viz-core/src/adapters/spatial/echarts-visualmap-generator.ts)) is wired only to spatial choropleth/bubble, never cartesian. Vega side is NOT broken (auto-legend) → ECharts-only divergence, confirms FD#18. (b) Diverging exists as static assets only — tokens FULLY built (`viz-scales.json:51-107`), trait declares it (`encoding-color.trait.ts:18,27`), `getVizScaleTokens('diverging')` works but has **zero production callers**; `correlation-matrix` specs already ship `scale:"diverging"` (INVALID today). `vega-lite-adapter.mapScaleType` returns undefined for 'diverging'; `spatial.ts:37 ColorScaleType` has no 'diverging' member.
**Fix.** (a) In echarts-adapter, when `isMarkRectGrid` + `heatmapColorIsMeasure` (reuse from [a11y/data-analysis.ts:122,162](../../packages/viz-core/src/a11y/data-analysis.ts)), compute continuous domain from the color field, color range from `getVizScaleTokens('sequential')`, build a `visualMap` via the existing generator, bake the tick label onto chrome, add the `visualMap` key. (b) Add `'diverging'` to the color `scale` enum in both schema copies + regen (`normalized-viz-spec.types.ts` + mcp-server `generated.ts`); diverging branch in vega-lite-adapter baking `scale.range` from `getVizScaleTokens('diverging')` +`domainMid:0`; add `'diverging'` to `spatial.ts ColorScaleType` + a diverging palette branch in the shared visualmap-generator.
**Ratified scope = WIDE.** Add `'diverging'` to the cartesian color scale AND the geo/dashboard `colorScale` unions (`dashboard-spec.schema.json:417`, `dashboard.types.ts:302`) for consistency. Note: this is ADDITIVE (new allowed enum member) — no existing geo fixture switches to diverging, so geo visualMap OUTPUT goldens (`golden-echarts-options.spec.ts.snap:164,443`; `viz.render.geo-fidelity.test.ts.snap:164,341`) DO NOT move; only schema/types/generated regen moves (§4).
**Coupling.** Extend the ONE generator — do not fork. The `visualMap` (a) and diverging (b) share `echarts-visualmap-generator` + `scale-token-mapper`.
**RED-first.** New colocated test asserting `visualMap` emission (min/max + `inRange.color` + baked label) for a MarkRect measure spec; a diverging-scale adapter test asserting the baked diverging range + domainMid 0.
**Golden:** schema(×2)+types+`generated.ts` regen (intended, §4); a heatmap fidelity snapshot may move IF the heatmap fixture is switched to carry a visualMap assertion — prefer a NEW test over editing the Vega fidelity snap.

### m05 — cohort-scatter (de-advertise) + fixture [M] — NASA #2 + band-fork M3
**Objective.** Stop the catalog from promising an interaction it never materializes. Honesty-first — rename, do NOT build brush/dataZoom (deferred to its own interaction sprint).
**Grounded mechanism.** The `linked-brush-scatter` registry entry ([patterns/index.ts:1123-1180](../../packages/viz-core/src/patterns/index.ts)) advertises brush across id/summary/derived/composition/rationale, but the scatter branch of `autoAssignEncodings` ([spec-builder.ts:760-766](../../packages/viz-core/src/builder/spec-builder.ts)) emits only x/y/color and no `interactions[]`.
**⚠ Only the id STRING reaches output.** The interaction prose never surfaces; the sole consumer-visible token is `suggestion.patternId` at [viz.render.ts:498](../../packages/mcp-server/src/tools/viz.render.ts) (fed by buildSuggested/buildFromIntent). A second dormant advert (`chart-patterns-v2.ts deriveInteractionProfile 'useBrush'`) has no output consumer.
**Fix (ratified id = `cohort-scatter`).** Rename the registry id `linked-brush-scatter`→`cohort-scatter` (`ChartPatternId` type updates) and strip the interaction promises from summary/derived/composition/rationale (honesty hygiene, zero output effect). Separately (band-fork M3) fix the fixture: [linked-brush-scatter.spec.json](../../examples/viz/patterns-v2/linked-brush-scatter.spec.json) interval select `fields:[...]`→`encodings:['x','y']`; and the `drilldown-stacked-bar.spec.json` stray `else`.
**Golden (INTENDED re-baseline, declare per #564).** The rename moves 2 owned snapshot lines — `golden-profiles.spec.ts.snap:176` (geo), `:395` (two-measure) — plus hard-coded string asserts in `spec-builder.spec.ts:574,584,1062`. Hand-edit the string asserts; inspect-and-rebaseline the 2 snap lines (never blind `-u`). Fixture fix moves zero golden today (no test validates it yet — turns GREEN under m07).

### m06 — Dashboard aggregate-panel a11y [M] — NASA #3
**Objective.** Make the a11y/narrative path describe the AGGREGATED values the chart draws, not the raw pre-aggregation rows — killing the false A11Y-R-11 and a latent honesty bug.
**Grounded mechanism.** Dashboard forwards raw (cross-filtered only) rows + aggregate encodings ([dashboard.render.ts:908-910](../../packages/mcp-server/src/tools/dashboard.render.ts)). Vega turns the aggregate into a declarative transform (visual side aggregates) but there is NO shared JS projection. `analyzeVizSpec` ([data-analysis.ts:468,485-505](../../packages/viz-core/src/a11y/data-analysis.ts)) reads the SAME raw `spec.data.values`, ignoring the aggregate. count/distinct over a non-numeric field → 0 dataPoints → <2 keyFindings → A11Y-R-11 fails.
**⚠ Latent honesty bug.** The existing "conformant" fixtures pass R-11 only because sum-over-numeric-revenue yields ≥2 raw extrema — but those numbers are WRONG (raw West=120 vs grouped West=220). The fix corrects it.
**Fix (viz-core-only).** In `analyzeVizSpec`, POSITIVE precondition: when the measure-channel binding carries a declared `aggregate` (already resolved at :343) AND a dimension field is present, replace raw per-row dataPoints with one point per distinct dimension value = the declared reduction (count/sum/average→mean/min/max/median/distinct, mirroring `vega-lite-adapter.mapAggregate`). Feed into buildDataPoints so max/min/total/trend + keyFindings reflect the chart's values. No dashboard.render/viz.render wiring change.
**Property test (s155 rule).** Bounded-exhaustive over aggregate∈{count,sum,average,min,max,median,distinct} × dimension cardinality{1,2,3} × measure{numeric,non-numeric}: **P1 parity** (dataPoints == group-by reduction), **P2 closure** (≥2 categories → keyFindings≥2 → R-11 passes incl. count/distinct over non-numeric), **P3 fail-safe/#564** (no declared aggregate → byte-identical to current raw output).
**Golden:** zero (no *.snap captures analyzeVizSpec narrative — verified). New colocated property + label tests.

### m07 — Keystone CI example-validation gate [S] — band-fork M4
**Objective.** Anti-rot: every `examples/viz/**/*.spec.json` validates against the live schema, and the two schema copies stay identical.
**Fix.** Colocated `packages/viz-core/test` spec globbing `examples/viz/**/*.spec.json` through `assertNormalizedVizSpec` + a schema-copy identity assert (readFileSync both, expect equal), wired into the viz-determinism job (ci.yml:593) or schema-freshness lane (ci.yml:54-58).
**⚠ MUST RUN LAST among feature missions.** The example fixtures are INVALID until their fixes land — `correlation-matrix`/`diverging-bar` need m04's `diverging` enum; the band fixtures need m03's y2/x2; the interaction fixtures need m05. Gating earlier REDs the build.
**Golden:** zero (new gate).

### m08 — Closeout [S]
Standing gate sweep + DIST-SANITY + dual-path live-verify. See §6.

---

## §4 Intended golden-move set (#564 declarations)

| Mission | Move | Kind |
|---|---|---|
| m03 | `normalized-viz-spec.types.ts` (EncodingMap +x2/y2; channel union +'x2'/'y2') | regen, gated by `generate:schema-types --check` |
| m04 | schema `scale` enum +'diverging' (×2 copies) → `normalized-viz-spec.types.ts` + mcp-server `generated.ts:1232,6591,6613` + geo/dashboard colorScale unions | regen, gated |
| m05 | `golden-profiles.spec.ts.snap:176,395` (id string) + `spec-builder.spec.ts:574,584,1062` (string asserts) | INTENDED re-baseline (id rename); inspect, never blind `-u` |

**Everything else is zero-owned-golden with NEW colocated tests** (m02, m04-heatmap-visualMap, m06). Geo visualMap OUTPUT snapshots do NOT move (diverging is additive; no geo fixture switches).

## §5 Ratified build decisions

1. **Merge** NASA-pull + band-fork into one sprint (Derek).
2. **m02** = in-branch guard (minimal, Vega-matching), not the hoist alternative.
3. **m05** = de-advertise (honesty-first), id → **`cohort-scatter`**; brush materialization DEFERRED to its own interaction sprint.
4. **m04 diverging = WIDE scope** — cartesian + geo/dashboard colorScale unions (additive, geo output goldens unaffected).
5. **m06** narrative change gates on a POSITIVE precondition + a machine-enumerated property test (s155 rule).

## §6 Closeout protocol (m08)

frozen-lockfile install · root typecheck · viz-core re-export typecheck gate WITH the @oods/tokens build · both generators + `docs:api --check` NO-OP (#115) · tokens-validate · `-r build` · **DIST-SANITY rebuild (rm -rf packages/viz-core/dist) BEFORE the mcp-server suite** · full viz-core (reconciled from 566) + mcp-server (3978) + `vitest run --project core` UNFILTERED (4631, #564) + test:scale (62) · m06 property test GREEN across the whole enumerated space · **dual-path live-verify** (bridge :4466 key `input`, shipped dist): a co-declared type+log scatter → log axis; a MarkRect measure heatmap → visualMap present; a count/distinct-over-non-numeric dashboard panel → ≥2 findings, no false A11Y-R-11; `cohort-scatter` surfaced (no 'brush' token). Restart pm2 `oods-forge-bridge` (mine). Do NOT self-declare a genuine-streak — review is a separate adversarial session.

## §7 Deferred residuals (carry beyond s156)

- Full **brush/dataZoom interaction materialization** for scatter (its own interaction sprint) — m05 only de-advertises.
- s155 under-total allowlist enrichment (Derek value-call, #965) — unrelated, still open.
- fork-3 F2 aggregate-head refinement (#947) — separate; may be partly discharged by the s155 Total gate, confirm at its own planning.
- camelCase tokenization, zip-stat typing, per-series honest trend (Design B) — long-standing deferrals.
