# Sprint-157 — Honesty-Fold (B1 aggregate-projection + B2 diverging-center) — SSOT Decision Memo

**Status:** LOCKED 2026-07-21 (Derek-ratified via AskUserQuestion: direction = honesty-fold; scope = **Core only**).
**Grounded at HEAD `3aa2873`** (s156 shipped + reviewed GENUINE_CLOSE) by workflow `wf_ccdc8acc-634` (5 scouts + synthesist + adversarial critic, 7 agents / 0 errors). Every candidate reproduced live against the shipped dist + bridge `:4466`.
**Baselines to carry:** viz-core **670** / mcp-server **3978** / root core **4631** / scale **62**.
**Theme (standing rule #1080):** single-themed — honest agent-facing narrative + render claims. **This is a ZERO-OWNED-GOLDEN sprint (#564 held);** viz-core count rises ONLY by new additive colocated tests.

---

## §1 — Scope (Derek-ratified: Core only)

The honesty-fold arc **right-sized under grounding**: 2 of the 5 candidates are **already closed at HEAD by s155**, so only two fixes are live-compelled.

| Candidate | Status at HEAD `3aa2873` | Disposition |
|---|---|---|
| **B1** m06 multi-grouping phantom | **LIVE** regression (s156 m06 introduced it) | **m02 — INCLUDE** |
| **B2** ECharts diverging center | **LIVE** cross-renderer disagreement (s156 m04) | **m03 — INCLUDE** |
| **fork-4** #948 multi-series trend | **already closed** by s155 `isMultiSeriesComposition` | verify-only guard, folds into m02 |
| **fork-3** #947 "Total Id max" | **harm already closed** by s155 `NON_ADDITIVE_QUALIFIERS`; only contrived `id_sum` residual | **DEFERRED** (see §6) |
| **under-total** #965/#974 | LIVE false-negatives (profit/orders/votes…) | **DEFERRED** value-fork (see §6) |

**s155-FOLD (added 2026-07-21, Derek-ratified).** The s155 dedicated review (PS-2026-07-21-004, verdict NOT_GENUINE_CLOSE) surfaced 2 live chartered-break defects + 1 adjacent, all narrative-honesty in the SAME files this arc touches — folded here (see §3B): **V1** sort-by-X dotted-decimal version misorder, **V2** distinct/unique false-Total + de-mirror the harness oracle, **A1** size-grouping phantom trend.

**Mission spine (6 missions):** m01 memo (Completed-at-creation) → {m02 B1, m03 B2, m06 V2} (parallel; disjoint files) → m05 (V1+A1, after m02 — same `data-analysis.ts`) → m04 closeout.
**DAG:** `m01 → {m02, m03, m06}; m02 → m05; {m03, m05, m06} → m04`. FILE MAP (serialize same-file): m02 + m05 both edit `data-analysis.ts` (m02 = projectAggregatedRows/seriesGroupingFields; m05 = compareCells + a size-add to seriesGroupingFields) → **m05 Requires m02**. m03 (`echarts-visualmap-generator.ts`) ⊥ m06 (`field-name-hints.ts` + the s155 harness) ⊥ the data-analysis chain — all parallel after m01.

**LESSON (carry into every grep):** viz-core src files carry a **NUL sentinel byte** (the `distinctGroupCount` / `projectAggregatedRows` null-bucket sentinel `\0null`), so plain `grep` treats `data-analysis.ts` as binary and silently drops matches — **use `grep -a` / `rg -na`.**

---

## §2 — m02: B1 — per-drawn-cell aggregate projection under a color/detail sub-grouping [M]

**Live regression (reproduced at HEAD, shipped dist).** `analyzeVizSpec` → `projectAggregatedRows` keys by `dimensionField` ONLY, collapsing a coexisting color/detail grouping. Grouped bar, `y aggregate:'average'`, `color:product`, rows N/A=100 N/B=100 S/A=10 S/B=200:
```
max: {label:South, value:105}   keyFindings: ["High Value: Value 105 (South)", "Low Value: Value 100 (North)", ...]
```
`105 = (10+200)/2` is a region-only mean drawn on **NO mark** (real drawn cells are 100/100/10/200). It is a **narrow regression vs parent** `7ef5f96` (no projection → raw extrema 200/10 coincided with real marks; s156 m06 introduced the 105 phantom).

**Fix site:** `packages/viz-core/src/a11y/data-analysis.ts` — `projectAggregatedRows` (fn `:549-580`, key built `:559`), call site `:337-340`. **Reuse** the s155 helper `seriesGroupingFields(spec)` (`:234`) — the same discrete color+detail channels the chart splits marks by — so the projection and the s155 trend gate agree on "secondary grouping."

**Design — Option A (per-drawn-cell; ratified, Option B rejected).** Extend the projection group key to the set of discrete channels the chart actually draws by, then reduce per drawn cell so extrema/total/keyFindings name a real mark. Positive precondition + fail-safe:
- **No secondary grouping** → key is `[dimensionField]` = **byte-identical to today** (the no-color 105 is a real single bar — preserving it is correct).
- **`color == dimension`** (redundant recolor, e.g. the `viz.render` V14x tests x=region/color=region) → composite key dedups to the dimension, so the **s156 m06 redundant-recolor fix STAYS fixed**.
- **Fires only** when a DECLARED aggregate + dimension exist (unchanged gate). No-aggregate path untouched.

**AMENDMENT A1 (required) — prove the measure-channel exclusion.** The grouping set MUST **exclude the measure / color-is-measure channel** (a continuous-color MarkRect heatmap must not shatter its own group key). This is a load-bearing guard — **prove it, don't prose it**: add a color-is-measure / continuous-color MarkRect cell to the enumerated space, OR an explicit unit test asserting the group key excludes the measure channel (`heatmapColorIsMeasure` / the color-is-measure predicate).

**AMENDMENT A2 (required) — stacked vs grouped semantics.** Reduce to the **drawn quantity**, which depends on whether the mark stacks:
- **Non-stacking aggregates** (average/min/max/median/distinct — Vega does not stack these) → per-(dimension×color[×detail]) **cell** reduction (this is the 105 fix).
- **Stacking aggregates** (sum/count — Vega stacks a nominal-color quantitative bar by default) → the salient drawn quantity is the **per-dimension stack total** (the stack height), which is what s156 already reports correctly → keep dimension-level for these.
The build session **MUST verify the adapter's actual stack behavior per aggregate** (`toVegaLiteSpec` stack resolution) and reduce to match; **record the decision in the mission notes**. Add a **stacked-bar + sum + color cell** to the enumerated space and prove P5 no-phantom on it (so the oracle is not the only witness of correctness).

**AMENDMENT A3 (minor) — bidirectional coverage machine-closed.** Fold **detail-as-subgroup** into the enumerated cartesian (not a single hand-added leg), so color-AND-detail coverage is machine-proven (`seriesGroupingFields` returns both).

**Property test (extend `packages/viz-core/test/a11y-aggregate-projection-properties-s156.spec.ts`, or sibling `…-multigrouping-properties-s157.spec.ts`).** Machine-enumerated cartesian: aggregate{sum,count,average,min,max,median,distinct} × dimCard{1,2,3} × colorCard{none, sameAsDim, sub} × measureKind{numeric,nonNumeric} × cellRows{1,2} + (A1) a color-is-measure cell + (A2) a stacked+sum cell + (A3) a detail-subgroup axis. **Standalone test-side oracle** reduces per drawn cell WITHOUT calling the SUT. Properties:
- **P4 per-cell parity** — `analysis.max/min/label/total` == the oracle's per-drawn-cell reductions.
- **P5 NO-PHANTOM** (load-bearing) — every reported extremum value ∈ the set of drawn-cell reductions (the 105 case violates this; Option B would fail it — so P5 genuinely discriminates).
- **P6 undefined-cell-drop** — avg/min/max/median over a non-numeric cell drops out (honest silence, not phantom 0).
- **Regression guard** — `colorCard=sameAsDim` ⇒ byte-identical to the dimension-only projection (s156 m06 held); `no-color` ⇒ byte-identical to today.

**fork-4 (#948) folds in as VERIFY-ONLY.** Already closed at HEAD by `isMultiSeriesComposition` (verified live: multi-series-line trend `undefined`; single-series `increasing`). m02 reuses `seriesGroupingFields` but must **not** re-broaden/re-narrow `distinctGroupCount`/`seriesGroupingFields` out from under fork-4's closed anchor. Re-run the s155 property (i) 40-cell loop + the fork-4 anchor (`a11y-narrative-honesty-properties-s155.spec.ts:342`) and assert unchanged.

**Golden: ZERO owned golden moved.** Grep-verified (`rg -na`): the `High/<Measure>` keyFinding family is asserted in 5 specs — `non-cartesian-a11y.spec.ts:159`, `spatial-a11y.spec.ts:60`, `measure-narrative.spec.ts:28`, `data-analysis-faceted-and-unknown-mark-trend-s154.spec.ts:215`, `data-analysis-heatmap-f6d.spec.ts:104` — but **none declares an aggregate** (`grep aggregate` in all 5 = empty), so the projection (declaredAggregate-gated) never touches them. New colocated property tests only.

---

## §3 — m03: B2 — diverging visualMap symmetric-center [M]

**Live cross-renderer disagreement (reproduced at HEAD).** `createVisualMapForScale` distributes the 11-color diverging palette EVENLY across `[min,max]`, so the array-center neutral (`#C0C4CB`, idx 5) lands at `(min+max)/2`. On the shipped `correlation-matrix.spec.json`: ECharts visualMap center = **0.34** while Vega bakes `color.scale.domainMid = 0`. The two shipped renderers contradict each other on the semantic center of every asymmetric diverging scale (value 0 paints a cool hue in ECharts, neutral in Vega).

**Fix site (single, centralized):** `packages/viz-core/src/adapters/spatial/echarts-visualmap-generator.ts` — the `scale === 'diverging'` branch of `createVisualMapForScale` (`:118-121`), domain from `fallbackDomain` (`:111`). This is the choke point for all three visualMap producers (`buildHeatmapVisualMap` cartesian heatmap `echarts-adapter.ts:470`, choropleth `:132`, bubble `:233`) — one edit fixes all three. **No** separate `buildHeatmapVisualMap` edit needed.

**Design (positive precondition, fail-safe).** When `scale === 'diverging'` AND the domain is finite AND `M = max(|min|,|max|) > 0`: replace the domain with `[-M, +M]` before `createContinuousVisualMap`. Because the palette's neutral is at its exact array center and ECharts distributes evenly, a symmetric domain forces neutral to render at data 0 == Vega `domainMid`, while the larger-magnitude extreme still reaches a palette endpoint. **NO-OP** on every non-diverging scale / degenerate `M===0` / non-finite domain — the anchor never leaks to a scale we can't prove is diverging.

- **Certify unaffected:** `certify-contrast.ts` / `artifact.certify.ts` read `inRange.color` (the gradient), never `visualMap.min/max`. Symmetrize moves only the two numbers, leaving the palette byte-identical → the WCAG-1.4.11 gradient contrast check round-trips unchanged.
- **Deferred (noted, not this sprint):** the higher-fidelity alternative — resample the palette so neutral sits at data-fraction `(0-min)/(max-min)` while keeping true extremes — is heavier (color-interpolation math + determinism surface). Symmetrize is the minimal provably-centered fix.

**Property test (NEW `packages/viz-core/test/echarts-visualmap-diverging-center.spec.ts`) + an `it` in `echarts-adapter.spec.ts` at the existing describe `:246`.** Machine-enumerate `{scale} × {min} × {max}`: scale ∈ {diverging, linear, undefined, quantize, quantile}; (min,max) crosses negatives/zero/positives incl. degenerate min===max. Assert:
- **P1 CENTER** — diverging + `M>0` ⇒ `(vm.min+vm.max)/2 === 0`, `vm.min===-M`, `vm.max===+M`.
- **P2 EXTREME-COVERAGE** — `max(|vm.min|,|vm.max|) === M` (larger extreme still hits an endpoint).
- **P3 GATE-ISOLATION** (fail-safe) — every non-diverging scale ⇒ `vm.min/vm.max` == raw data extent (NO symmetrize leak).
- **P4 CROSS-RENDERER AGREEMENT** (independent oracle) — for the diverging fixtures, ECharts center === `toVegaLiteSpec(spec).encoding.color.scale.domainMid` (both 0).
- **P5 DEGENERATE** — `min===max` (incl. 0,0) is a no-op, no throw, finite output.
- **P6 DETERMINISM** — same input → byte-identical visualMap.

**Golden: ZERO owned golden moved.** Grep-verified: the only committed ECharts visualMap goldens are geo **sequential positive-only** ramps — `golden-echarts-options.spec.ts.snap:164` (bubble_map) & `:443` (choropleth), `viz.render.geo-fidelity.test.ts.snap:164/341/536`, `dashboard.render.fidelity.test.ts.snap:481` — none diverging, so the `scale==='diverging'` branch cannot fire on any of them. (`golden-profiles.spec.ts.snap:138` `"min": -118.24` is an unrelated `lon` data-profile stat, NOT a visualMap.) New colocated tests only.

---

## §3B — s155-fold: V1 sort-by-X · V2 distinct-Total · A1 size-grouping [from the s155 NOT_GENUINE review]

Source: s155 review PS-2026-07-21-004 (`wf_59da8ae2-feb`), all reproduced live at HEAD `3aa2873`; all three are narrative-honesty defects live in the shipped dist.

### m05 — V1 (sort-by-X dotted-decimal) + A1 (size-grouping trend gate) [S] — `data-analysis.ts`, Requires m02

**V1 — dotted-decimal version misorder.** `compareCells` (`data-analysis.ts ~:286`) takes a `Number()` numeric fast-path BEFORE `naturalCompare`, so `Number("1.10")=1.1 < 1.11 < Number("1.9")=1.9` → a rising release series `1.9→1.10→1.11` (100→200→300) narrates "declines… −50%"; `naturalCompare` (the chunkwise version-aware branch) is never reached. FIX (positive precondition): do NOT take the numeric fast-path for a multi-part dotted string — gate the fast-path on "≤1 dot" (a plain integer/decimal), else route to `naturalCompare`. Add dotted-decimal versions (1.9/1.10/1.11, 3.9/3.10/3.11) to the property-(vi) label banks in `a11y-narrative-honesty-properties-s155.spec.ts`. Reproduce-RED: the rel-line spec narrates −50% at HEAD.

**A1 — size-grouping phantom trend.** `seriesGroupingFields` (`data-analysis.ts:234`) reads only `color`+`detail`, so a size-grouped multi-series line (size on a nominal field DOES facet to multiple lines — Vega-Lite cross-check) evades `isMultiSeriesComposition` → phantom "declines −21.9%" on 3 rising series. FIX: add `resolveBinding(spec,'size')?.field` to `seriesGroupingFields` (size, like detail, only ever suppresses). **Do NOT add `shape`** — shape draws one path + symbol overlay (NOT multi-series; it is the known dup-X residual), so adding it would over-suppress a legit single line. Reproduce-RED: the size-grouped rising line narrates the phantom decline at HEAD. Extend the s155 property (i) series-multiplicity harness with a size-grouping cell.

**Golden: ZERO owned** (internal analysis derivations; new/extended property tests only — grep-verify no `*.snap` asserts the affected narrative). NUL-sentinel: grep `data-analysis.ts` with `rg -na`.

### m06 — V2 (distinct/unique false-Total + DE-MIRROR the oracle) [S] — `field-name-hints.ts` + the s155 harness, Requires m01

**V2 — distinct/unique-count false Total.** `distinct_count`/`unique_count` emit "Total Distinct count: 6,006" — a dishonest sum of non-additive counts. Root cause: `'distinct'` is in `NON_ADDITIVE_AGGREGATES` (blocks a DECLARED `aggregate:'distinct'`) but MISSING from `NON_ADDITIVE_QUALIFIERS` (`:92-97`), and head `count` is additive → `isProvablyAdditive('distinct_count')=true`. FIX (positive precondition, fail-safe to silence): add `distinct, unique, uniq, nunique, cardinality, distinctcount` to `NON_ADDITIVE_QUALIFIERS` so a distinct/unique NAME token suppresses the Total (mirroring the existing `NON_ADDITIVE_AGGREGATES` membership). Reproduce-RED: distinct_count/unique_count emit "Total …" at HEAD.

**V2b — DE-MIRROR the harness oracle (the process-critical half).** The s155 harness oracle (`a11y-narrative-honesty-properties-s155.spec.ts:129-171`) is a byte-identical COPY of the runtime `isProvablyAdditive`, so property (ii)/(iii) prove `runtime == copy` (drift detection), NOT honesty — blind to any bug in BOTH (`distinct_count` passed both). REPLACE the mirror with an INDEPENDENT truth: a hand-authored expected PRESENT/ABSENT verdict map per NAME_BANK name, OR a structurally-different additivity check — never a re-implementation of the runtime predicate. Add distinct/unique names to NAME_BANK with ABSENT expected. This makes the §5 standing-rule amendment concrete.

**Golden: ZERO owned** (claim-layer name-hint + test-only; grep-verify the additive-Total LABEL is asserted only in the s155 harness, updated in lockstep here).

---

## §4 — m04: Closeout — gate sweep + DIST-SANITY + dual-path live-verify [S]

No new behavior. Per the standing closeout protocol:
- `pnpm install --frozen-lockfile` · ROOT `pnpm typecheck` · viz-core re-export typecheck gate **WITH the `@oods/tokens` build** · both generators + `docs:api --check` **NO-OP** (#115 — s157 touches no schema/type/generator, so all three are pure NO-OP) · `tokens-validate` · `pnpm -r build` · **DIST-SANITY rebuild** (`rm -rf packages/viz-core/dist`) BEFORE the mcp-server suite (verify dist carries `projectAggregatedRows` + the diverging symmetrize + the `compareCells` dotted-version guard + the `size` grouping-field + the distinct/unique qualifier) · full viz-core + full mcp-server + `vitest run --project core` **UNFILTERED** · `test:scale`.
- **Reconcile counts:** mcp-server **3978** / root core **4631** / scale **62** EXACT (#564 held); viz-core **670 + only the new colocated tests** (B1 per-cell block + B2 P1-P6 + adapter `it` + V1/A1 property cells + V2 NAME_BANK/de-mirrored oracle). ZERO owned golden moved.
- **AMENDMENT A5 (mirror-sync) — now ACTIVE via m06/V2:** V2b DE-MIRRORS the s155 harness oracle (property ii/iii must use an INDEPENDENT truth, not a byte-copy of the runtime). Closeout gate: plant a deliberate runtime bug (flip one expected verdict) and confirm the de-mirrored harness goes RED — proving it no longer shares the runtime's blind spots.
- **Adversarial dual-path live-verify** (bridge `:4466` envelope key `input`, shipped dist): **B1** — grouped-bar/`dashboard_render` keyFinding names a **DRAWN** value (no phantom); **B2** — diverging MarkRect `(vm.min+vm.max)/2 === 0`; **V1** — a rising `1.9→1.10→1.11` rel-line narrates a RISE, not a decline; **V2** — a `distinct_count` bar emits NO "Total"; **A1** — a size-grouped rising multi-series line emits NO directional-decline trend.
- Restart pm2 `oods-forge-bridge` (mine).
- **Do NOT self-declare a genuine-streak** — the s157 adversarial review is a SEPARATE session.

---

## §5 — Constraints

- **#564** — zero owned golden moved (every predicted golden grep-verified in §2/§3; only additive new colocated tests).
- **#525** — MCP set stays **25** (no new tool). **#110** — no scorer. **#115** — agent-first; no advertised-schema/prose change (all edits are internal claim/render derivations). **Determinism** — every fix is a pure fn (`projectAggregatedRows`, `createVisualMapForScale`).
- **Standing rule (s155/s156/s157):** every claim gates on a POSITIVE precondition (fail-safe to silence) + closure proven by a machine-enumerated property test **whose oracle is INDEPENDENT of the system under test** (NEW amendment from the s155 review — a byte-copy oracle proves drift, not honesty, and is blind to shared bugs; `distinct_count` passed both the runtime and its mirror) + separately adversarial-verified at review (the mandatory backstop that catches the shared-blind-spot cells the harness misses). B1/B2 comply; the critic's A1-A3 close the B1 harness gaps; **m06/V2 de-mirrors the s155 oracle**.
- **Build discipline:** reproduce-RED-in-isolation each fix at HEAD before the change; assert the human-readable LABEL string; m02 is a behavior-mover → clean-rebuilt FULL viz-core before Complete; DIST-SANITY before the mcp-server suite.

---

## §6 — Deferred residuals (documented, NOT this sprint)

- **under-total #965/#974** [Derek value-fork, deferred] — broaden `ADDITIVE_MEASURE_HEADS` to FLOW nouns (profit/orders/votes/units_sold/clicks/impressions/transactions/…) + a claim-local currency-strip (`revenue_usd`→`revenue`), **excluding STOCKS** (population/headcount/inventory/balance double-count over time). Fail-safe false-negative (§5 "less rich"), not a correctness bug. If un-deferred: requires **amendment A4** — machine-enumerate prefix×head×position + qualifier compounds + a stock-vs-flow boundary invariant (broadening an allowlist is the false-positive-risking direction; do NOT ride it in on a hand-list). Fix site `field-name-hints.ts:80` + claim-local currency-strip in `isProvablyAdditive:116` (do NOT touch the shared `headToken:29` — spec-builder `inferFieldType:1060` uses it → would move `golden-profiles.snap`). Zero-golden if scoped per A4.
- **fork-3 #947 `id_sum`/`zip_sum`** [deferred, low-value polish] — the "Total Id max" harm is already closed (s155 `NON_ADDITIVE_QUALIFIERS`; `id_max` silent). Only the contrived `id_sum`/`zip_sum`/`uuid_sum` residual survives, and it is semantically ambiguous (a precomputed per-group sum re-summed is defensibly a real grand total). If closed: **CLAIM layer only** (`isProvablyAdditive`), NOT the TYPE layer — the candidate's `AGGREGATE_HEADS`/`inferFieldType` narrowing is **REJECTED** (breaks ratified s154 `data-analysis-predicates.spec.ts:485-493` + s155 `postal_revenue` NAME_BANK goldens).
- **fork-2 concat-structural** — a multi-series LayoutConcat with NO color/detail field and NO facet (`distinctGroupCount===1`) still slips the single-series trend gate. Separate deferred item; NOT the fork-4 color-grouped shape (which IS closed).
- **A2 stacked-semantics** — recorded in m02; the build session's stack-vs-group decision per aggregate is captured in the mission notes.
- Legacy: camelCase tokenization, zip-stat typing, per-series honest trend (Design B enrichment).

---

## §7 — Handoff

A fresh build session executes **m02 → m04** from this memo without re-grounding. m01 (this memo) is Completed-at-creation. Reproduce-RED-in-isolation each fix; assert LABEL strings; DIST-SANITY before mcp-server; dual-path live-verify at m04. Grounding provenance: `wf_ccdc8acc-634` (scouts + synthesist + critic AMEND-THEN-LOCK with A1-A5). Review is a SEPARATE adversarial session.
