# Forge Viz — NL→viz hand-off: deterministic structured-intent slice (Phase-3 differentiator, second half) Decision Memo

> ⚠️ **PARTIALLY SUPERSEDED 2026-06-29.** The deterministic `intent` core this memo authorized is **LIVE / KEPT** (the `intent` mode on `viz.render` — verified in `viz.render.input.json` lines 334-383). Only the downstream free-text / LLM hand-off this memo points to (s132: `viz.fromText` + the Claude parser + the `nlviz-accuracy` gate) was **REVERTED** (commit `a0e876e`, decision #973). The s133 dimension registry was stashed, never committed.

| | |
|---|---|
| **Decision** | s131-m01 keystone (captured at mission close) |
| **Sprint** | sprint-131 |
| **Root mission** | s131-m01 |
| **Date** | 2026-06-26 |
| **Status** | **RATIFIED** — Derek-locked at planning (decision #961, via AskUserQuestion); grounded by `wf_e8bc8b9f-8ff` (6 live-repo scopes + synthesis + adversarial critic, verdict AMEND/high — all 7 amendments + 2 blockers baked in). **RE-GROUNDED at m01 build by `wf_869e52f1-718`** (6 live-repo scopes + adversarial readiness critic, verdict **READY_WITH_CORRECTIONS**, 0 blockers — **12 plan-vs-repo divergences corrected**; this memo carries the corrected contract, §6). |
| **Origin** | Phase-3 DEPTH → DIFFERENTIATOR. Predecessor: `forge-viz-measure-narrative-depth-decision-memo.md` (s130, decision #957) completed the measure-narrative substrate (governed narrative speaks "vs target N" over KPI + explicit chart panels). **This memo opens the deferred SECOND HALF of the Phase-3 differentiator** — the NL→viz hand-off — by shipping its **deterministic core** and deferring ONLY the free-text/LLM half to s132. |

**Companion docs:** `forge-viz-measure-narrative-depth-decision-memo.md` (s130 — the measure-narrative substrate this rides); `forge-viz-flagship-strategy.md` §3/§4/§5/§6 (moat thesis + next frontier); `forge-viz-phase3-scoping-memo.md` §4; `cmos/research/DSV-045-results(1).md` ("LLM emits structured intent, never a raw spec; render stays deterministic"); `near.md`:49-57.

---

## 0. What this sprint adds (the thesis)

s130 completed the **measure-narrative substrate**: the deterministic narrative now speaks the governed-measure frame ("unit 1000 USD", "vs target 300") over both KPI and explicit chart panels. That was the LAST piece of the Phase-3 differentiator's FIRST half.

s131 opens the **SECOND half — the NL→viz hand-off — but ships ONLY its deterministic core** (the split DSV-045 prescribes: *"LLM emits structured intent, never a raw spec; render stays deterministic"*). The slice:

> An agent calls `viz.render` with a **STRUCTURED** (typed, NOT free-text) `intent` object — `{ goal, measures[], dimensions[], chartFamily?, measureRef? }` — alongside `rows`. A new deterministic `buildFromIntent` maps the intent into a `SchemaIntent` (counts for ranking) + selected `FieldProfile`s (named fields for encoding), reuses the **unchanged** recommender + encoder + assembler, post-filters by `chartFamily`, and — when `measureRef` is set + `includeA11y=true` — lights the s129/s130 governed narrative over the chart. Returns the existing `BuildVizSpecResult` shape through `viz.render`'s existing channels. **ZERO output-schema change.**

The moat pillar at stake (strategy §1): **"governed + explainable BY CONSTRUCTION, deterministic by default."** The structured-intent object is the EXACT shape s132's NL parser must emit — it is the stable contract, **NOT** a throwaway. The deterministic tool validates + renders; the LLM (s132) sits ABOVE the tool boundary doing NL→intent only.

**Depth-not-breadth held.** No free-text parsing, no LLM provider, no dimension registry, no synonym/utterance matching, no scorer-term change, no new tool. See §8 deferrals.

---

## 1. The pinned calls (Derek-ratified 2026-06-26)

| Call | Decision | Where |
|---|---|---|
| **SHAPE = Option B (deterministic core ships; LLM half deferred)** | Ship the structured-intent → recommender-chosen-spec + governed-narrative **deterministic CORE** this sprint (m01 memo + a thin build slice m02–m04 that ships a real, byte-deterministic, consumer-observable MCP delta). NOT Option A (pure paper — rejected for the #956 no-ship risk + the s123-127 paper-drift the flagship-reanchor memory warns against). | §0, §3, §4 |
| **CARRIER = EXTEND `viz.render` with one optional default-off `intent` object** | NOT a new tool. Cheapest: 1 schema edit + Generator A/docs:api rebake, zero new registration sites, rides #564. Default-absent ⇒ byte-identical to today. | §4 |
| **v0.1 INTENT CONTRACT** | `StructuredIntent { goal: IntentGoal; measures: {name; type?}[]; dimensions: {name; type?}[]; chartFamily?: 5-tabular-mark; measureRef?: ^gm\. }`. Amendments A (7-value goal) + E (5-mark family) + the `^gm\.` measureRef constraint pinned in §2. | §2 |
| **FAMILY PREFERENCE = POST-FILTER ranked\[\] by `pattern.chartType`** | NOT a scorer term (protects the s110 recommender goldens + confidence floors). The recommender scores unchanged; `buildFromIntent` selects within the ranking. | §3 |
| **GOVERNED-MEASURE-FIRST** | The named `measures`/`dimensions` drive ENCODING (raw fields, x/y); the optional `measureRef` is the GOVERNED overlay that lights the narrative. `buildFromIntent` is **measure-agnostic** — `measureRef` is read by `viz.render`, NOT by the builder. | §3, §4 |
| **AMBIGUITY POSTURE = SINGLE-CALL DETERMINISTIC** | Pick top-ranked, surface `alternatives[]` — matching Forge's single-call determinism discipline. Multi-turn stepwise (nvBench-2.0 style) is DEFERRED entirely (s132). | §1 |

---

## 2. The v0.1 `StructuredIntent` contract

**The exact TypeScript shape** (exported from `packages/viz-core/src/builder/spec-builder.ts` — there is **no** `builder/index.ts` barrel; it surfaces via `export * from './builder/spec-builder.js'` at `src/index.ts:58`, §6 correction #2):

```ts
export interface StructuredIntent {
  readonly goal: IntentGoal;                                          // the LIVE 7-value union
  readonly measures: ReadonlyArray<{ readonly name: string; readonly type?: FieldType }>;
  readonly dimensions: ReadonlyArray<{ readonly name: string; readonly type?: FieldType }>;
  readonly chartFamily?: 'bar' | 'line' | 'area' | 'scatter' | 'heatmap';  // 5 tabular marks ONLY
  readonly measureRef?: string;                                       // ^gm\. (governed overlay)
}

export interface BuildFromIntentInput {
  readonly intent: StructuredIntent;
  readonly rows: ReadonlyArray<Record<string, unknown>>;              // REQUIRED for v0.1
  readonly id?: string;
  readonly name?: string;
  readonly description?: string;
}
```

**AMENDMENT A — `intent.goal` is the LIVE 7-value `IntentGoal` union** (VERIFIED `packages/viz-core/src/patterns/index.ts:26-33`):

```ts
comparison | trend | composition | part-to-whole | relationship | intensity | distribution
```

The planning grounding's 5-value list was STALE — it dropped `part-to-whole` + `intensity`, both scorer-read. **7 values, not 5.** (`IntentGoal` is its own type; do NOT confuse it with the 13-value `ChartType` union directly above it at `index.ts:12-25`.)

**AMENDMENT E — `chartFamily` is constrained to the 5 TABULAR marks** `{bar,line,area,scatter,heatmap}`. The recommender pool (`chartPatterns`) ranks ZERO of the 8 explicit-only types (`treemap/sunburst/sankey/force_graph/choropleth/bubble_map/flow_map/chord`) — so an explicit-only family must be **schema-rejected at the AJV boundary**, never confidently mis-rendered. `buildFromIntent` ALSO defensively asserts this and throws (defense-in-depth, §3).

**`measureRef` constrained to `^gm\.`** — the governed measures. **VERIFIED there are FIVE, not four** (§6 correction #4): `gm.revenue.total`, `gm.revenue.latest`, `gm.revenue.distinct`, `gm.export.value.total`, **`gm.export.unit_price`**. The fixture-bearing entries:

| measure | format | unit | defaultComparison | defaultThreshold | verbalizes |
|---|---|---|---|---|---|
| `gm.revenue.total` | currency | — | `{basis:target, value:300}` | `{direction:above, value:350}` | `vs target 300`, `threshold 350` |
| `gm.export.value.total` | currency | `1000 USD` | — | — | `unit 1000 USD` |
| `gm.revenue.distinct` | **(none)** | — | — | — | (measureRole `dimension`; no `format` key) |

**Type hint is RESERVED in v0.1.** `measures[].type` / `dimensions[].type` are accepted in the schema (forward-compat — the s132 parser may emit them) but **v0.1 infers field types from the data** via `inferFieldProfile` (the inert-field precedent: `periodField` s114, `measureRef` s116). Documented, not silently dropped.

---

## 3. `buildFromIntent` — the deterministic core (m02), in `viz-core`

A NEW **exported** `buildFromIntent` in `spec-builder.ts`, sibling to the module-private `buildSuggested` (VERIFIED `:489-534`). Pure deterministic reuse of the existing recommender — **NO LLM, NO scorer-term change.** The reusable pieces `buildSuggested`/`autoAssignEncodings`/`assembleSpec` are module-private but same-file callable; `inferFieldProfile`/`toSchemaIntent`/`suggestPatterns` are imported/exported.

**The flow (mirrors `buildSuggested`, with the intent merge + post-filter):**

1. **Rows REQUIRED (Amendment B).** Throw `VizSpecBuilderError` on an empty/absent rows array — `assembleSpec` embeds `data.values` from `input.rows` (`:614`), so a rows-less intent would emit a syntactically-valid but EMPTY-data chart. Rows-less "shape-only" intent is s132 (OOS).
2. **GEO / explicit-only guard (Amendment E, defense-in-depth).** Assert `intent.chartFamily ∈ {bar,line,area,scatter,heatmap}` at the top; throw on an explicit-only family even though the schema (m03) already rejects it.
3. **Named-field selection (fail-loud, Rule 12).** `profiles = inferFieldProfile(rows)`; every `intent.measures[].name` and `intent.dimensions[].name` MUST exist among the profiled names — else throw naming the missing field(s). `selectedProfiles` = the named subset.
4. **The merge (Amendment C — the count/named-field consistency INVARIANT).** Build the `SchemaIntent` from `toSchemaIntent(selectedProfiles, rows)` and spread-override ONLY the goal:

   ```ts
   const base = toSchemaIntent(selectedProfiles, rows);   // counts + data-aware carriers from the SELECTED named subset
   const schemaIntent: SchemaIntent = { ...base, goal: intent.goal };  // caller's goal wins; spread preserves carriers
   ```

   **Why over the SELECTED subset (a refinement on the plan's "merge over the full base"):** `toSchemaIntent` buckets fields by their INFERRED type — `measures = #quantitative`, `temporals = #temporal`, `dimensions = #nominal|ordinal`. Deriving counts from the selected profiles' real types keeps the scorer's counts **automatically consistent** with what `autoAssignEncodings(selectedProfiles, …)` can encode — the exact invariant Amendment C demands (the scorer reads counts `suggest-chart.ts:105-106`; the encoder keys off named profiles `:536`; a mismatch hits the x/y throw at `:497-501`). It also handles a temporal field named in `dimensions[]` correctly (it counts as a temporal, drives the x-axis), which the plan's blind `intent.dimensions.length` count would miscount. Spread semantics preserve `correlationStrength`/`density`/`maxNominalCardinality`/`hasHighCardinalityDim`/`partToWhole`/`matrix`/`allowNegative` (emitted via conditional spread at `:431-436` — absent keys, not `undefined`) — do NOT rebuild field-by-field (critic guard).
5. **Rank + POST-FILTER by family.** `ranked = suggestPatterns(schemaIntent, { limit: chartPatterns.length })` — the FULL ranking (the recommender's scoring is **unchanged**; calling it with a wide limit inside `buildFromIntent` does NOT touch the s110 goldens, which test `suggestPatterns` directly with their own limits). Then:
   - `chartFamily` set → `chosen = ranked.find(r => r.pattern.chartType === chartFamily)`. Every tabular family has ≥1 pattern, so this resolves; the defensive fallback (family-as-`chartType` + `lowConfidence` + a signal, mirroring the geo-honesty pattern at `:503-512`) is kept for robustness.
   - `chartFamily` unset → `chosen = ranked[0]` (exactly `buildSuggested`).
6. **Encode + assemble.** `encoding = autoAssignEncodings(selectedProfiles, chartType)`; keep the `!encoding.x || !encoding.y` throw (`:497-501`); `spec = assembleSpec(input, chartType, encoding)`.
7. **Return** `BuildVizSpecResult { spec, chartType, mode: 'intent', suggestion, inferredFields: selectedProfiles, lowConfidence, alternatives }` — `mode: 'intent'` is a NEW discriminant added to the `.mode` union (`:115-142`); the `suggestion`/`alternatives` are derived from the ranking EXACTLY as `buildSuggested` does (`PatternSuggestion` is `{ pattern, score, signals }` — there is NO `rationale`/`confidence`/`alternatives` field on it; those are derived downstream, §6 correction #3). Update the "suggest mode only" JSDoc on the optional fields to "suggest/intent mode".

`buildFromIntent` does **NOT** touch `measureRef` (m03's `viz.render`-level wiring). Export `StructuredIntent` + `BuildFromIntentInput` + `buildFromIntent` from `spec-builder.ts` (verify no name collision under the `export *` at `index.ts:58` — none currently). Unit-test the invariant (each goal → a consistent chartType+encodings, no x/y throw), named-field-missing → fail-loud, chartFamily post-filter picks the family, explicit-only family → throw. Rebuild viz-core dist (mcp-server consumes `@oods/viz-core` via dist, no src alias).

---

## 4. `viz.render` `intent` surface + `measureRef` narrative WIRING (m03) — the long pole

### 4.1 Schema (additive, default-off)

Add one optional top-level `intent` object to `packages/mcp-server/src/schemas/viz.render.input.json` in the **properties block** (`:7-334`). The real admit-gate is `additionalProperties: false` at **`:454`** (§6 correction #11 — NOT the `oneOf` at `:335`, which is an exactly-one *required-branch* guard; `intent` adds NO `oneOf` branch, and an `intent`+`rows` call is admitted by the existing `{required:[rows]}` branch). Shape: `goal` enum = the 7 `IntentGoal` values; `measures`/`dimensions` = arrays of `{name (string, required), type? (enum quantitative|temporal|nominal|ordinal)}`; `chartFamily?` enum = the 5 tabular marks ONLY; `measureRef?` string `pattern ^gm\.`; `intent` `additionalProperties:false`. Default-absent ⇒ byte-identical (#564).

### 4.2 Handler dispatch (NET-NEW — no intent path exists today, §6 correction #7)

`buildVizSpecFromRows` is called **UNCONDITIONALLY** at `viz.render.ts:105`. Branch it:

```ts
const built = input.intent
  ? buildFromIntent({ intent: input.intent, rows, id: input.id, name: input.name, description: input.description })
  : buildVizSpecFromRows({ rows, chartType: input.chartType, encodings, id: input.id, name: input.name, description: input.description });
```

`intent`-absent ⇒ the existing call is **byte-identical untouched**. The `isEChartsPrimaryType(input.chartType)` early-return (`:49`) does NOT fire for an intent-only call (no top-level `chartType`). **Guard (fail-loud):** `intent` + top-level `chartType` are mutually exclusive (intent carries `chartFamily`, not the explicit-render `chartType`) — throw a clear error at the top of `handle()` if both are present. The pick maps through the EXISTING `suggestion{patternId,score,rationale,confidence,alternatives}`+`lowConfidence` channel (`:145-161`, which already maps `signals→rationale`, `normalizeConfidence(score)→confidence`, `alternatives` from `built.alternatives`) — **NO output-schema change.**

### 4.3 Amendment D — `measureRef` narrative WIRING (the CORRECTED net-new part)

**The plan said "EXTEND `generateNarrativeSummary` to accept an optional `measureContext` arg." That is WRONG against the live repo** (§6 correction #8): `generateNarrativeSummary` **already** accepts `measureContext` via its `AnalysisNarrativeInput` overload (`narrative-generator.ts:85`, threaded `:114→:133→:224→describeMeasureContext`). **No signature change.** The real work is the `viz.render`-side resolution + verbalization, mirroring the **dashboard.render CHART path** (`dashboard.render.ts:496-567` + `:826-843`) — the established s130 governance pattern:

1. **Resolve + hard-error (always, fail-loud).** When `input.intent.measureRef` is set: `loadMeasureRegistry()` (catch `MalformedMeasureRegistryError` → the V132 family) then `registry.get(ref)`; **`if (!entry)` → OODS-V130 hard-error.** `resolveMeasure(ref)` returns `undefined` on a miss — it does **NOT throw** (§6 correction #9), so calling it and expecting a throw would silently render narrative-less. Replicate the `get + if(!entry)` hard-error directly. Resolution + the bad-ref hard-error fire **whenever `measureRef` is present**, independent of `includeA11y` (a bad ref is a caller error regardless — Rule 12); only the VERBALIZATION is `includeA11y`-gated.
2. **Build the context** mirroring the CHART path (`:496-567`): `{ unit, format, thresholdValue, comparisonBasis, comparisonValue }` from the resolved `MeasureEntry`, each conditionally spread. **OMIT `thresholdDirection`** — the chart path omits it; `describeMeasureContext` does not verbalize it (§6 correction #10). Read `entry.defaultComparison` directly (charts have no author-override comparison — do NOT call `resolveMeasurePanel`, which is `KpiPanel`-typed).
3. **Verbalize (`includeA11y`-gated only).** In the a11y branch (`:171-175`), after `out.a11y = toWireA11y(generateAccessibleTable(built.spec), generateNarrativeSummary(built.spec))`, prepend the measure clause to the narrative's `keyFindings` EXACTLY as `dashboard.render.ts:826-843` does:

   ```ts
   const measureFinding = entry ? describeMeasureContext(entry.displayName, ctx) : undefined;
   if (measureFinding && out.a11y.narrative) {
     out.a11y = { ...out.a11y, narrative: { ...out.a11y.narrative, keyFindings: [measureFinding, ...out.a11y.narrative.keyFindings] } };
   }
   ```

   This keeps the `intent`-absent / `measureRef`-absent a11y call **byte-identical** (the `generateNarrativeSummary(built.spec)` call is unchanged) — strictly safer for #564 than switching the cartesian call to the `AnalysisNarrativeInput` form. `describeMeasureContext` emits `unit`/`format` RAW but `threshold`/`vs target` through `formatNumeric` (§6 correction #12), so `vs target 300` / `unit 1000 USD` match only for `gm.revenue.total` / `gm.export.value.total` respectively.

   **DECISION pinned:** `measureRef` narrative requires `includeA11y=true` — do NOT auto-imply `includeA11y` from `measureRef`. `includeA11y` stays the single a11y switch (documented in code).

### 4.4 Codegen + docs

Re-run Generator A (`pnpm --filter @oods/schemas-tools run generate` → regenerates `generated.ts`'s `VizRenderInput` with the `intent` type; the 88/88 count STAYS 88 — no new schema FILE, §6 correction); `docs:api`; update `packages/mcp-adapter/tool-descriptions.json`'s `viz.render` prose to mention the `intent` input. NO viz-core IR schema change (the vendored `dashboard-spec.schema.json` parity test is UNTOUCHED — this is a tool-INPUT schema only). `generate:check` + `generate:schema-types --check` + `docs:api --check` all green.

After landing: rebuild viz-core + mcp-server dist two-layer, restart `pm2 oods-forge-bridge`. **AQUEX gotcha (bit s130-m03):** the new `intent` property is invisible to the aquex advertised-schema cache until RECONNECT — verify the new field live via DIRECT dist invocation or `:4466` POST `/run`, NOT the connect-time-cached aquex tool.

---

## 5. Determinism goldens + acceptance fixtures (m04)

Template = `test/scale/dashboard-determinism.spec.ts` (`JSON.stringify` + `expect(a).toBe(b)`). `viz.render` has NO intent golden today — ADD one.

1. **Amendment F — BOTH directions:** (a) intent-PRESENT — same `{intent, rows}` rendered twice → byte-identical; (b) intent-ABSENT — a `viz.render` call with no `intent` is byte-identical to the pre-s131 baseline (#564 floor).
2. **Governed-measure fixture:** `intent {goal:'trend', measures:[{name:'revenue'}], dimensions:[{name:'month'}], chartFamily:'line', measureRef:'gm.revenue.total'}` + `output:{includeA11y:true}` → recommender-chosen spec under the goal/family AND `vs target 300` in `a11y.narrative`. **PAIR assertion:** the same call with `includeA11y:false` → `vs target 300` is ABSENT. Unit-bearing variant on `gm.export.value.total` → `unit 1000 USD` under `includeA11y`.
3. **Raw-field fixture (no measureRef):** `intent {goal:'comparison', measures:[{name:'sales'}], dimensions:[{name:'region'}], chartFamily:'bar'}` → real data-bound spec + recommender pick; the governed clause is ABSENT (graceful degradation).
4. **Negative fixtures:** explicit-only `chartFamily` → AJV-REJECTED (5-mark enum); named field absent from rows → fail-loud; unknown `measureRef` → V130 hard-error.

**Scope fixture strings to the right measures** (§6 corrections #4/#12): comparison/threshold strings ONLY on `gm.revenue.total`; unit on `gm.export.value.total`; do NOT iterate the registry with a hardcoded 4-element list (there are 5). Seed these as the s132 nvBench-style NL→viz accuracy skeleton (utterance → expected intent → expected chartType).

---

## 6. Ground-truth corrections (the 12 plan-vs-repo divergences — `wf_869e52f1-718`, READY_WITH_CORRECTIONS / 0 blockers)

The planning plan text was written against several stale/wrong facts. **m02–m05 follow THIS table, not the raw plan text.**

| # | Plan said | Live repo (USE THIS) |
|---|---|---|
| 1 | recommender at `src/recommender/suggest-chart.ts` | `src/patterns/suggest-chart.ts` (no `recommender/` dir; line numbers match) |
| 2 | add exports to `builder/index.ts` | **No barrel.** Export from `builder/spec-builder.ts`; surfaces via `export * from './builder/spec-builder.js'` at `src/index.ts:58` |
| 3 | `suggestPatterns` element has `.rationale/.confidence/.alternatives` | `PatternSuggestion = { pattern: ChartPattern; score; signals: string[] }`. Derive the rest (alternatives from `ranked.slice(1)`; `viz.render` maps `signals→rationale`, `normalizeConfidence(score)→confidence`) |
| 4 | "exactly these 4 measures" | **FIVE** — plan omits `gm.export.unit_price` (format `number`, unit `1000 USD/t`, additive:false). Do NOT hardcode a 4-element assertion |
| 5 | options `{ limit }` | `{ limit?, minScore? }` (limit default 3, minScore default 0) |
| 6 | type `Pattern` | only `ChartPattern` exists |
| 7 | "add `buildFromIntent` dispatch alongside the existing one" | NET-NEW — `viz.render` has NO `intent`/`buildFromIntent` today; `buildVizSpecFromRows` is unconditional at `:105` |
| 8 | "EXTEND `generateNarrativeSummary` to accept `measureContext`" | Already accepts it via `AnalysisNarrativeInput` (`:85`). Real work = the `viz.render` resolution + the post-hoc `keyFindings` prepend (mirror dashboard CHART path) |
| 9 | `resolveMeasure` hard-errors on miss | Returns `undefined`. The V130 hard-error lives in the HANDLER (`dashboard.render.ts:528 if(!entry)`) — replicate `get + if(!entry)` in `viz.render` |
| 10 | `MeasureNarrativeContext` has 5 fields | 6 (adds `thresholdDirection`, narrative-generator.ts:49). Mirror the chart path which OMITS it |
| 11 | guard is `anyOf/oneOf`; intent admitted there | It is `oneOf` (`:335`, exactly-one). The real admit-gate is `additionalProperties:false` (`:454`). Put `intent` in `properties`, NOT in `oneOf` |
| 12 | fixture strings `1000 USD` / `300` are registry strings | `describeMeasureContext` formats: `unit`/`format` RAW, `threshold`/`vs target` via `formatNumeric`. `vs target 300` requires `formatNumeric(300)==='300'`; `unit 1000 USD` is the raw literal. Scope comparison/threshold to `gm.revenue.total` only |

---

## 7. Process gates + held constraints (every mission)

- **#525** — sole consumer is an agent over MCP/JSON: the `intent` input + the `includeA11y`-gated narrative serve that consumer.
- **#564 additive default-off floor** — `intent` absent ⇒ byte-identical to today. Flag-OFF goldens: `viz.render` network-fidelity (treemap/sankey/…) + `test/scale/dashboard-determinism.spec.ts` + the `dashboard.render` KPI golden + the fidelity HTML snap, all byte-identical.
- **NO scorer-term change** — post-filter only (protects the s110 recommender goldens + confidence floors).
- **DEPTH-NOT-BREADTH** — no dimension registry, no measure-business-intent/synonym inference, no free-text parsing, no LLM provider (all s132).
- **Registry values VALIDATED against the real file** (§2 table — 5 measures).
- **Per-mission native-learning HARD capture** — single-string `cmos_session` capture (NOT `cmos_mission_transition` `decisions[]`, which gets stripped).
- **Two-layer + full cross-package closeout** — `pnpm install --frozen-lockfile` + ROOT `pnpm typecheck` + two-layer build + Generator A/B + docs:api + a11y-contract green.
- **Bridge rebuild + `pm2 oods-forge-bridge` restart + RECONNECT** — the new `intent` property is invisible to the aquex advertised-schema cache until reconnect; verify via direct dist / `:4466`, NOT the cached aquex tool (the s130-m03 gotcha).

---

## 8. What m01 ships + OOS (Amendment G) + the s132 hand-off

**m01 ships (this mission):**

- **This memo** — pins the SHAPE/CARRIER/CONTRACT + the 12 ground-truth corrections before m02–m04 build.
- **Native-learning capture** (HARD gate) — single-string `cmos_session` capture of the memo ratification + each pinned call + the corrected Amendment-D/D-#8 finding.

**m01 makes NO code change** — the type/schema edits land in m02/m03.

**OUT OF SCOPE this sprint (Amendment G — frozen here, wired into m05 success criteria so it is not author-recall-dependent):**

- (a) the **dimension `by Y` grouping registry** — there is NO dimension registry; `measureRole:'dimension'` is a governance classifier, `measureRef` is narrative-only and does NOT drive encodings; `by quarter` grounds ONLY as a caller-supplied NAMED FIELD with zero governed vocabulary this sprint;
- (b) the utterance→`measureRef` / measure-synonym matcher;
- (c) free-text NL parsing;
- (d) an LLM provider in mcp-server;
- (e) the nvBench-style accuracy/eval gate;
- (f) rows-less "shape-only" intent (v0.1 REQUIRES rows).

**S132 HARD HAND-OFF** (the genuinely greenfield half, recorded at m05 closeout): the free-text-NL → structured-intent **PARSER** + an **LLM provider** wired into mcp-server (agent does NL→intent ABOVE the tool boundary; the deterministic tool validates+renders) + an **nvBench-style NL→viz accuracy/eval gate** (extends the m04 fixture skeleton; only the s118 FAOSTAT seed exists) + a minimal **DIMENSION REGISTRY** (`id/displayName/field/grain/synonyms`) so `X by Y` grouping becomes governable (bolts on additively — a parallel `dimensionRef` channel BESIDE the named-field channel, NOT a redesign; the structured-intent contract SURVIVES s132) + the single-call ambiguity posture already ratified here.

**Refs:** grounding `wf_e8bc8b9f-8ff` (planning) + `wf_869e52f1-718` (m01 re-grounding, the §6 corrections); decision #961 (s131 lock); `forge-viz-measure-narrative-depth-decision-memo.md` (s130 predecessor); `forge-viz-flagship-strategy.md` §3/§4/§5/§6; `cmos/research/DSV-045-results(1).md`; `near.md`:49-57.
