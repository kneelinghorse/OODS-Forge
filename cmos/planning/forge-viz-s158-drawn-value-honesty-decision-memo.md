# Sprint-158 — Drawn-Value Honesty (STRUCTURAL close) — Ratified SSOT Decision Memo

**Status:** LOCKED 2026-07-21 (Derek-ratified scope via AskUserQuestion ×2). This memo is the single source of truth; a fresh build session executes m1→m6 from it **without re-grounding**.
**Grounded at:** HEAD `64f4e5c` (branch `Forge-expansion`), planning workflow `wf_81fdca54-d73` (4 ground scouts → 2 designers → 2 adversarial critics AMEND_THEN_LOCK/high → synthesist). Both critics independently confirmed the invariant is **genuinely SUT-independent** (not another mirror-oracle).
**Predecessor:** s157 REVIEW = NOT_GENUINE_CLOSE (session `PS-2026-07-21-006`). This is the corrective.

---

## §0 — Why this sprint exists (the meta-pattern to kill)

Five straight sprints (s150 / s152 / s153 / s155 / s157) have closed a viz-narrative-honesty class, been reviewed, and found to ship a survivor **in the exact class claimed closed**. The unifying root cause is a *generator*, not a bug:

1. **Enumeration, not derivation.** Grouping lives in two hand-maintained allow-lists — `seriesGroupingFields` (`data-analysis.ts:238`, reads only color/detail/size) and the projection key (`projectAggregatedRows:610`, keyed off `[dimensionField, ...projectionGroupingFields]` where `dimensionField` comes from `resolvePrimaryChannels` which hard-codes `dimensionChannel:'x'`, `:429`/`:436`/`:438` — **the second positional dimension `y` is never resolved**). Every sprint enumerates one more channel.
2. **Mirror-oracle.** The test written to "prove" each fix is derived from the same logic it tests, so it blesses the untested direction. s157's own proof — `a11y-multigrouping-projection-properties-s157.spec.ts:337-341` — **asserts** `analysis.max===70` on drawn cells `{10,30,50,90}` whose real max is `90`, with a comment (`:308-311`) that concedes per-cell max is 90 and deliberately picks the marginal.

**s157 survivor (the concrete defect to close):** a color-is-measure heatmap `x=region, y=hour, color=avg(temp)` narrates `High Temp 67.8 (South) / Low Temp 22.6 (North)` — per-region **marginal means over hour, drawn on NO rect** — while the same response's `echartsSpec.visualMap {min:12.5,max:98.7}` and the accessible table list the real drawn cells. The projection key collapses to `[region]` because `y=hour` never enters it.

**The rule this sprint adopts:** *derive from the type, don't enumerate; and check the claim on a path the claim's producer cannot corrupt.*

---

## §1 — Grounded facts (verified in source at HEAD)

- **Root cause chain (confirmed):** `projectAggregatedRows` (`:610`) key `= [dimensionField, ...projectionGroupingFields]`; `projectionGroupingFields` (`~:593`) `= seriesGroupingFields.filter(≠measure,≠dimension)`; `seriesGroupingFields` (`:238`) `= [color, detail, size]` only. `dimensionField` ← `resolvePrimaryChannels` (`:423`), which for a color-is-measure heatmap returns `{measureChannel:'color', dimensionChannel:'x'}` (`:429`) — **`y` is structurally lost.**
- **The independence fact (load-bearing, confirmed by both critics):** the accessible data table already rides a **disjoint** path — `table-generator.ts` → `analysis.rows = input.rows = collectRows` (`:507`, raw `spec.data.values`), reduced via `reduceAggregate` (`:528`). It calls **none** of `projectAggregatedRows` / `projectionGroupingFields` / `resolvePrimaryChannels`-dimension. That is why the table showed real cells while the narrative showed marginals. A guard that recomputes the drawn set on THIS raw path is genuinely independent of the projection bug.
- **Membership, not bounds:** `67.8 ∈ [12.5, 98.7]`, so a range/bounds check does **not** bite. Only **set-membership** (is the narrated value an actual drawn cell?) catches the phantom. This is the design's load-bearing test choice.
- **`EncodingMap` is a CLOSED interface** (`normalized-viz-spec.types.ts`): exactly `{x, y, x2, y2, color, size, shape, detail}` + facet on `spec.layout.rows/columns`. This closedness is what makes a compile-exhaustive role table enforceable.
- **Two same-root LIVE siblings** (both reproduced): (a) `deriveCorrelation` (`:719`), gated at `:403` by `isMarkRectGrid || isStripPlot`, runs a numeric coercion on dotted-version x → a rising release scatter narrates `moderate negative relationship / -0.648`; (b) a **shape**-grouped multi-line narrates a live `-77.4%` phantom cross-series trend because `shape` is excluded from `seriesGroupingFields` (decision #1255's "shape draws one path = harmless" rationale is **false** here).

---

## §2 — The structural close (architecture)

**One compile-exhaustive classification table drives all three derivations.** Introduce a single

```
const CHANNEL_ROLE: Record<keyof EncodingMap, ChannelRole>   // + facet handling
```

exhaustive over the closed 8-channel `EncodingMap` — **adding a 9th channel without a role is a TypeScript ERROR, not a silent under-key.** A pure `role(channel, markType, binding)` resolver mark-gates retinal grouping (shape/size split point/line/area, **NOT** bar/rect) and excludes quantitative color/size from grouping. Roles: `position-primary` / `position-secondary` / `position-range` (x2,y2) / `measure` / `retinal-grouping` (categorical color|detail|shape) / `retinal-magnitude` (quantitative color|size).

This ONE source (m1) is consumed by:
- **m2 the projection key AND the trend gate** — replacing both allow-lists. `drawnGroupingFields = {second positional dim} ∪ {facet fields} ∪ {categorical retinal color(if not measure)|detail|shape} ∪ {nominal size}`, mark-gated, quantitative excluded, minus dim/measure. Fixes the heatmap key `[region,hour]` (→ drawn cells 98.7/12.5), closes faceted+aggregate cross-panel collapse, **and folds the shape-grouped phantom trend for free** (the trend gate now reads the same table `shape` belongs to — same edit, not a per-channel add).
- **m3 the independent guard set** — `drawnMarkValueSet(spec)`, built on the raw `collectRows`+`reduceAggregate` path off the same role table, calling **none** of the projection functions. `enforceDrawnValueInvariant` (module-local, called at the `analyzeVizSpec` tail) nulls **only the offending extreme** by set-membership (float epsilon), nulls Total when `≠ Σ(applicable set)` (relative epsilon). Positive-precondition: active only when `declaredAggregate` present (else byte-identical pass-through). **This guard is the PERMANENT fail-safe of record** (Fork 2 ratified) — the root fix only keeps it quiet; it is what survives the NEXT under-enumeration.

**Why this is not a fifth lap:** the invariant checks against a set the projection code path cannot corrupt (independence proven), the role table is compile-exhaustive (a new channel can't silently slip), and the property oracle is hand-derived importing zero product classification code. The three together — table + guard + independent oracle — structurally end the extrema/Total class; the shared role table also structurally closes the trend class (shape now grouped by derivation).

---

## §3 — Missions (DAG: m0 → m1 → m2 → {m3, m4}; m0 → m5; {m2,m3,m4,m5} → m6)

**m0 — Keystone SSOT memo [S, Completed-at-creation].** This document. No code.

**m1 — Shared channel-role classification table [M].** Introduce `Record<keyof EncodingMap, ChannelRole>` (compile-exhaustive) + pure `role()` resolver in `data-analysis.ts` (or a colocated module). Mark-gate retinal grouping; exclude quantitative color/size. No public-surface change (#525); pure fns (#110/#115). Requires m0.

**m2 — Root fix + shape-trend convergence [L].** Replace `projectionGroupingFields` (`~:593`) AND `seriesGroupingFields` (`:238`) with positive derivations off m1. Resolve and add the **second positional dimension** to the key. Gate stack-total collapse on the mark actually stacking (bar/area), not `isStackTotalAggregate` alone, so a sum/count color-is-measure heatmap keys per `(region,hour)` cell. **Preserve BYTE-IDENTITY** for the s156/s157 corpus (measure-positional charts → geometry term provably `[]`; verify grouped/stacked/simple bar keys are character-identical). Requires m1.

**m3 — Oracle-independent invariant + runtime guard [L].** Add `drawnMarkValueSet(spec)` (raw `collectRows`+`reduceAggregate`, off m1's table, calling none of the projection fns; multi-row-per-cell **re-reduced** so an avg cell 65 ∈ set, finer than the raw table). Export `findNonDrawnNarrativeValues(spec)` (machine predicate); keep `enforceDrawnValueInvariant` module-local at the `analyzeVizSpec` tail. Deliver `a11y-drawn-value-invariant-properties-s158.spec.ts` with a **HAND-DERIVED oracle (zero product classification imports)** enumerating ALL mark-splitting axes in BOTH directions: `yCard∈{1,2,3}`, `facet∈{none,row}`, shape-grouping, nominal-vs-quantitative size, x2/y2 × aggregate × dimCard × cellRows. INV1 extrema-membership (**RED at HEAD** for yCard>1 and sum-heatmap), INV2 `Total==Σ`, INV3 byte-identity-to-HEAD over the s156/s157 corpus. **A3 load-bearing proof:** a test that REVERTS m2's root fix and asserts live `analyzeVizSpec`/`generateNarrativeSummary` on the survivor heatmap is **SILENT** for High/Low (guard bites *independently* of the fix) + a guard-isolation unit injecting a synthetic phantom. Requires m1, m2.

**m4 — RED-first inversion of the s157 tautological oracle [S].** Flip `a11y-multigrouping-projection-properties-s157.spec.ts:338/340` from `max===70`/`min===20` to the DRAWN cells `max===90` (South, hour=10) / `min===10` (North); delete the rationalizing comment `:308-311`. RED against HEAD (proves the mirror-oracle blessed the phantom), GREEN after m2. This is **required de-mirroring under a decision record — NOT a smuggled golden regen** (#564 clean; the independent visualMap already lists 90/10). Requires m2.

**m5 — Correlation dotted-version suppress arm [S] — RATIFIED IN SCOPE (Fork 1 = FOLD-SUPPRESS).** Extend the `:403` correlation gate (`isMarkRectGrid || isStripPlot`) with a **dimension-is-dotted-version** arm reusing `isDottedVersionString` (`:299`), so a version-axis scatter drops correlation at both consumers (the relationship sentence `~:231-233` and the coefficient finding `~:327-328`, both `!==undefined` gated). RED-first live repro: rising release currently `moderate negative relationship / -0.648` → **SILENT** after. Rank-transform/Spearman and the adapter field-typing render-path fix are explicit residuals, NOT this mission. Requires m0.

**m6 — Closeout: full gate + dual-path live-verify + #564 proof [M].** `pnpm install --frozen-lockfile`; ROOT `pnpm typecheck`; **`pnpm --filter @oods/viz-core build` BEFORE the mcp-server suite** (vitest resolves `@oods/viz-core→dist`); viz-core re-export typecheck gate (WITH `@oods/tokens` build); both generators + `docs:api --check` NO-OP (#115); tokens-validate; `-r build`; DIST-SANITY rebuild; full viz-core + full mcp-server + `vitest run --project core` UNFILTERED + `test:scale`. **Dual-path live-verify** on bridge :4466 via `viz_render` (`includeA11y`+`echarts`): (1) survivor heatmap High/Low = real drawn cells == visualMap `{12.5,98.7}`, NOT 67.8/22.6; (2) faceted+aggregate narrates per-panel; (3) shape-grouped multi-line trend SILENT; (4) version scatter correlation SILENT. **#564 proof** (grep-cited, §6). Restart `pm2 oods-forge-bridge` after the dist rebuild. Requires m2, m3, m4, m5.

---

## §4 — Ratified scope + disclosed residuals

**Fork 1 = FOLD-SUPPRESS (Derek 2026-07-21).** The `deriveCorrelation` dotted-version sibling is closed this sprint (m5). Leaving a known-live phantom unmentioned is the exact overclaim that returned s157 NOT_GENUINE.

**Fork 2 = KEEP GUARD PERMANENT (Derek 2026-07-21).** `enforceDrawnValueInvariant` is the documented structural fail-safe of record. A future simplification pass must NOT remove it as "redundant with the root fix" — the root fix alone is an enumeration a new channel can silently defeat.

**DISCLOSED RESIDUALS (recorded, NOT claimed-closed — a closeout must not overclaim geometry-completeness):**
- **Binned/transform-axis honesty** (`x=bin(v)` histograms, 2D-bin heatmaps): BOTH the root-fix key and `drawnMarkValueSet` derive cells from RAW field values with no bin applied → shared blind spot; latent today (no bin fixtures). Scoped OUT.
- **Adapter/field-typing render-path mis-plot**: a version axis typed `quantitative` draws `1.10` at `x=1.1` — same dotted-version root but the render layer (crosses the #110/render boundary). Flag, don't fix here.
- **Rank-transform (Spearman)** correlation enhancement — deferred; recovers the true positive signal but changes the coefficient contract.
- **Multi-mark same-channel collapse** (`resolveBinding` first-mark-only): fail-safe silence, not a phantom; documented edge.

---

## §5 — Acceptance criteria (as machine assertions, not prose)

- **Extrema:** every High/Low value ∈ `drawnMarkValueSet.cells` (SET membership + float epsilon). Guard nulls **only** the offending extreme (never couples max/min).
- **Total:** `Total == Σ(applicable set)` within a **relative** epsilon; else nulled.
- **Independence:** `drawnMarkValueSet` imports/calls none of `projectAggregatedRows`/`projectionGroupingFields`/`resolvePrimaryChannels`-dimension. The property oracle imports zero product classification code.
- **A3:** reverting m2 → the survivor heatmap narrative is SILENT for High/Low (guard alone suffices).
- **Byte-identity (INV3):** the s156/s157 corpus narrative + all owned goldens unchanged.

---

## §6 — #564 zero-owned-golden proof (grep-cited from HEAD)

- `rg -lna 'keyFindings|High Temp|Low Temp'` over viz-core `*.snap` → **NONE** (only golden-profiles / dashboard-layout / echarts-options snaps, all orthogonal to narrative extrema).
- `rg -rln 'keyFindings' --glob '*.json' packages` → **8 SCHEMA files only** (the `ln` abbreviation key in `*.schema.json` shape, not value fixtures).
- `rg -lna 'MarkRect|LayoutFacet'` over mcp-server `*.snap` → **NONE**; `dashboard.render.fidelity` charts use `aggregate:sum` no rect/facet → `drawnGroupingFields()===[]` → key byte-identical (Total Revenue 390 preserved).
- **The ONLY assertion that flips** is the hand-written `a11y-multigrouping-projection-properties-s157.spec.ts:338/340` (70→90, 20→10) — **required de-mirroring under the m0 decision record, not a golden and not smuggled.**

**Net #564 impact: zero owned-golden files regenerated.**

---

## §7 — Standing rules applied (this is why it should close genuine)

- **Derive-from-contract not enumerate:** compile-exhaustive `Record<keyof EncodingMap, ChannelRole>` (a 9th channel is a type error).
- **Per-oracle SUT-independence:** the guard rides the raw path disjoint from the projection; the property oracle is hand-derived; the A3 test proves the guard bites without the fix.
- **Positive-precondition + fail-safe:** active only on `declaredAggregate`; on violation it SUPPRESSES (honest silence), never fabricates.
- **Enumerate BOTH directions:** the harness adds exactly the previously-untested axes (2nd positional dim, facet, shape, nominal-vs-quantitative size, x2/y2).
- **RED-first-reproduced-in-isolation** for every fix + **separate adversarial review session** (never self-certify — the genuine-close review is NOT this session).
- Constraints: #564 zero-owned-golden / #525 MCP-only, tool set unchanged / #110 no scorer (a11y-reader path) / determinism (pure fns) / #115 agent-first. GOTCHA: viz-core src carries a NUL sentinel byte — grep with `rg -na`. Rebuild viz-core dist before the mcp-server suite; `pm2 oods-forge-bridge` restart is mine.

## §8 — Decision records to capture at lock
1. **De-mirror of the s157 oracle (`:338/:340`) is a required correction, not a golden regen** — no owned narrative golden captures 70/20; the independent visualMap already lists 90/10.
2. **Binned/transform-axis honesty is scoped OUT** under this record so the closeout does not overclaim geometry-completeness.
3. **Fork 1 = fold-suppress correlation; Fork 2 = keep the runtime guard permanent** (Derek-ratified).
