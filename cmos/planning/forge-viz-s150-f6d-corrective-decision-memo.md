# forge-viz-s150-f6d-corrective — DECISION MEMO (SSOT)

**Sprint:** 150 · **Base:** HEAD `485d488` (s149 ship) · **Trigger:** s149 review PS-2026-07-07-005 (adversarial wf_02248687-f37 — HIGH, 0/3 refuted, reproduced live on :4466 + aquex).
**Planning session:** PS-2026-07-08-001. **Grounding:** wf_439e298e-e00 (5 design lenses → synthesist → adversarial critic; verdict AMEND_THEN_LOCK, lockReadyAfterAmendments=true). **Derek forks ratified (AskUserQuestion 2026-07-08):** (1) approach = FIX-FORWARD; (2) #115 = ADVERTISE DIRECTLY.

Build session executes **m02→m07 from this memo without re-grounding.**

---

## 1) Reproduction verdict — all four F6d defects confirmed at HEAD

| # | Sev | Defect | Site(s) at HEAD |
|---|-----|--------|-----------------|
| 1 | HIGH | **measure-mislabel** — binding reads measure from COLOR, label still reads Y | rebind `data-analysis.ts:140` vs label `narrative-generator.ts:121` (`resolveFieldLabel(input,'y')`) — two sites decide independently and disagree |
| 2 | MED | **unconditional COLOR-as-measure** — gate is marks-only | `data-analysis.ts:137` (`isHeatmapRect = marks.every(trait==='MarkRect')`), used `:140`/`:144`; categorical/absent-color heatmap empties `buildDataPoints` (`:218` early-return, `:225` drops non-numeric) → newly trips A11Y-R-11 (`equivalence-rules.ts:230-240`) |
| 3 | MED | **phantom row-order trend/correlation** | `data-analysis.ts:115` `computeTrend:true` + `:116` `deriveCorrelation(...)` unconditional → `"Trend increasing: 232.5%"` (+ Pearson finding for numeric-x heatmaps) |
| 4 | LOW | **colorField-drop has zero test teeth** | `data-analysis.ts:144` — reverting it alone passes the whole suite |

**Live narrative at HEAD** (canonical 3×4 fixture; revenue Σ=1,038, max East/Q4=133, min North/Q1=40):
```
SUMMARY : "Heatmap covers 12 data points totaling 1,038 Quarter."   ← 1,038 is revenue, "Quarter" is the Y name
FINDINGS: ["High Quarter: Quarter 133 (East)", "Low Quarter: Quarter 40 (North)",
           "Trend increasing: 232.5%", "Total Quarter: 1,038"]
```
Verified baseline: viz-core own suite = **361 passed / 30 files** at HEAD.

---

## 2) Approach (Derek-ratified) — FIX-FORWARD, revert is its fallback branch

**Option A — FIX-FORWARD (LOCKED).** Narrate the COLOR measure *only when color is a real quantitative measure*; fall back to Y otherwise. Fixes the HIGH mislabel, kills the phantom trend, and closes the new numeric-Y self-warn class in one design.

Why A subsumes B: the quantitative-color gate makes full-revert a *branch of* A — where color is not a real measure, measure falls back to Y (pre-F6d), which is the correct measure for a numeric-Y heatmap **and** restores A11Y-R-11. So we advance the a11y pillar instead of swapping one honest gap for the original Meridian gap.

**HARD STOP (the anti-F6d rule).** The binding decision and the label decision MUST be unified through ONE shared predicate. If the build session cannot cleanly route both call-sites through that single predicate, it **falls back to full-revert (Option B) rather than ship a second half-fix.** Do not repeat F6d. (Critic confirmed the hard-stop will not trigger: both sites can trivially call the predicate.)

---

## 3) Fix design — exact edits (Option A)

### Predicate architecture (the core — resolves the label/binding/trend reconciliation)

**TWO predicates in `data-analysis.ts`; the measure/label decision and the order-freeness decision have different truth conditions.**

- **P1 `heatmapColorIsMeasure(spec)`** — all-MarkRect **AND** color binding exists **AND** color is numeric (raw-cell probe). Gates the measure rebind (`:140`), the colorField drop (`:144`), **and** the measureLabel channel (`narrative-generator.ts:121`). False for a heatmap (categorical/absent color) → measure=Y (pre-F6d) → restores R-11.
- **P2 `isMarkRectGrid(spec)`** — all-MarkRect only. Gates `computeTrend`/`correlation` (`:115-116`). Keyed on RAW marks, **not** P1: a rect grid's melt order is arbitrary regardless of which channel is the measure, so a numeric-Y fallback heatmap must be suppressed too.

**Quantitative detection = raw `toNumber` `.some()` probe, NOT the `type` marker.** `applyDataAwareTypes` (`spec-builder.ts:680`) short-circuits on any binding carrying `scale`/`aggregate`/`timeUnit`/`type`, so a pinned color binding (the F6d fixture uses `color:{field:'revenue',scale:'linear'}`) has `type` **undefined** — a `type==='quantitative'` gate would fail to rebind it and break the shipped F6d test. Use what `buildDataPoints` actually consumes downstream:

```ts
// MODULE-LOCAL — do NOT export (the a11y barrel is `export * from './data-analysis.js'`;
// exporting this would leak it into @oods/viz-core's public API). [critic amendment 2]
function isQuantitativeField(rows: readonly Record<string, unknown>[], field: string): boolean {
  return rows.some((row) => toNumber(row[field as keyof typeof row]) !== null);
}
```
`.some()` is load-bearing and correct: `.every()` would flip P1 false on a single null/missing cell and re-break genuine heatmaps (critic regression-risk 2). `toNumber` already imported (`data-analysis.ts:2`).

**Exports (insert before `analyzeVizSpec` ~`:103`) — export ONLY these two:**
```ts
/** s150: a MarkRect grid (heatmap) — X and Y are BOTH dimensions, the melt order is arbitrary. */
export function isMarkRectGrid(spec: NormalizedVizSpec): boolean {
  return spec.marks.length > 0 && spec.marks.every((m) => m.trait === 'MarkRect');
}

/**
 * s150 (fixes s149 F6d): a heatmap binds its MEASURE to COLOR only when color is a REAL
 * quantitative measure. Missing/categorical color → false → measure falls back to Y (pre-F6d),
 * the correct measure for a numeric-Y heatmap, which restores A11Y-R-11. ONE predicate,
 * evaluated on the SAME spec at BOTH the binding site (resolvePrimaryBindings) and the label
 * site (narrative-generator.resolveNarrativeInputs), so measure-values and measure-label can
 * never diverge again (the root cause of the s149 mislabel). Pure: marks + color raw-cell probe.
 */
export function heatmapColorIsMeasure(spec: NormalizedVizSpec): boolean {
  if (!isMarkRectGrid(spec)) return false;
  const color = getEncodingBinding(spec, 'color');
  if (!color) return false;
  return isQuantitativeField(collectRows(spec), color.field);
}
```
(`getEncodingBinding` exported `:156`; `collectRows` module-local `:197`; add `isQuantitativeField` near `extractCategories` `:258`.)

### Defect 2 — binding site (`data-analysis.ts:137-144`)
```ts
  // s150: measure=COLOR only for a real quantitative-color heatmap; else fall back to Y (pre-F6d).
  const useColorMeasure = heatmapColorIsMeasure(spec);
  const dimensionBinding = resolveBinding(spec, 'x');
  const measureBinding = useColorMeasure ? resolveBinding(spec, 'color') : resolveBinding(spec, 'y');
  // COLOR IS the measure on a real heatmap — drop colorField so its values aren't listed as
  // "color category" findings. When color is categorical/absent we keep it as a normal series.
  const colorBinding = useColorMeasure ? undefined : resolveBinding(spec, 'color');
```

### Defect 1 — label site (`narrative-generator.ts:117-127`)
Import `heatmapColorIsMeasure` (add to the `./data-analysis.js` import block `:2-7`). Replace the spec-branch return:
```ts
  const colorIsMeasure = heatmapColorIsMeasure(input);
  return {
    analysis: analyzeVizSpec(input),
    labels: {
      chartLabel: input.name ?? input.a11y.ariaLabel ?? input.id ?? 'This visualization',
      // s150: name the SAME channel the binding read as the measure (color for a real heatmap),
      // else Y — via the shared predicate so label and values can't diverge (s149 F6d root cause).
      measureLabel: resolveFieldLabel(input, colorIsMeasure ? 'color' : 'y'),
      dimensionLabel: resolveFieldLabel(input, 'x'),
      colorLabel: colorIsMeasure ? undefined : resolveFieldLabel(input, 'color'),
    },
    narrative: input.a11y.narrative,
    fallbackSummary: input.a11y.description,
  };
```
> The label site MUST use P1 (`heatmapColorIsMeasure`), NOT a marks-only predicate — a marks-only label predicate would re-mislabel classes (b)/(c) (categorical/absent color → binding falls back to Y but a marks-only label still reads color). `resolveFieldLabel(input,'color')` returns the author's color `title` (`:305`) falling to `humanize('revenue')` — do NOT read `analysis.measureField` (loses an author title).

### Defect 3 — trend/correlation guard (`data-analysis.ts:115-116`)
```ts
    // s150: a MarkRect grid has NO inherent first→last order (arbitrary row-major melt) and X/Y
    // are both dimensions, so a first→last trend and an x-vs-measure Pearson r are both spurious
    // (same phantom class F6b killed for KPIs). Keyed on the RAW grid predicate — order-freeness
    // is independent of the measure channel, so a numeric-Y fallback heatmap is suppressed too.
    computeTrend: !isMarkRectGrid(spec),
    correlation: isMarkRectGrid(spec) ? undefined : deriveCorrelation(rows, bindings),
```
Extend the `computeTrend` JSDoc (`:50-54`) to name the rect-grid case (developer contract). Flows through `buildVizDataAnalysis:77` → emission `narrative-generator.ts:273`/`:285` skips with no change there.

### Defect 4 — teeth only (no source change)
The `:144` drop is now gated on `useColorMeasure`; teeth are the mutation-catching test in §4/m05.

**After the full fix, the canonical fixture emits:**
```
SUMMARY : "Heatmap covers 12 data points totaling 1,038 Revenue."
FINDINGS: ["High Revenue: Revenue 133 (East)", "Low Revenue: Revenue 40 (North)", "Total Revenue: 1,038"]
```

---

## 4) Test + golden plan (memo-authoring rule: every churn cites its asserting file, else zero-golden + new LABEL-asserting test)

**Committed-golden verdict = ZERO regen for defects 1–4.** Grep-verified: no `__snapshots__` asserts heatmap narrative text. `viz.render.fidelity.test.ts.snap` snapshots `out.spec` only (a11y block = `ariaLabel`+`description`, no `narrative`/`keyFindings`/`summary`); `dashboard.render.fidelity.test.ts.snap` has KPI narrative but **no heatmap panel**. contentHash derives from `out.spec` → stable. **#564 no code-golden movement.**

**Existing tests — behavior + required change:**

| File:line | Current | Change | Lock/RED |
|---|---|---|---|
| `viz-core/test/data-analysis-heatmap-f6d.spec.ts:39,42-43` | `keyFindings.length>=2`, `some(startsWith('High'/'Low'))` — **shape-only; this is what let the mislabel ship** | **Strengthen to label-strings** | HEAD emits "High **Quarter**…" → RED |
| `mcp-server/test/tools/viz-a11y-equivalence-emission.spec.ts:149-157` | heatmap (quant color) R-11 warning ABSENT | **No change — lock** | green at HEAD & post-fix |
| `mcp-server/test/tools/viz-a11y-equivalence-emission.spec.ts:140-147` | non-numeric **bar** → R-11 present | **No change — lock** | s149-m10 warn vehicle intact |
| `mcp-server/test/tools/dashboard-a11y-equivalence-emission.spec.ts:89-101` | non-numeric **bar** panel → folded R-11 | **No change — lock** | warn vehicle intact |

**New colocated LABEL-asserting tests in `data-analysis-heatmap-f6d.spec.ts`** (add `analyzeVizSpec` + `generateNarrativeSummary` to the `@oods/viz-core` import). **Each defect gets its OWN independently-RED-at-HEAD assert** [critic amendment 3] — not only the combined array:

- **D1 exact label golden:**
  ```ts
  const n = generateNarrativeSummary(heatmapSpec());
  expect(n.summary).toBe('Heatmap covers 12 data points totaling 1,038 Revenue.');
  expect(n.keyFindings).toEqual([
    'High Revenue: Revenue 133 (East)',
    'Low Revenue: Revenue 40 (North)',
    'Total Revenue: 1,038',
  ]);                                   // pins label (D1), no-trend (D3), no color-category (D4) together
  expect(n.analysis.measureField).toBe('revenue');   // binding-repoint regression guard
  ```
- **D1 isolated (label alone RED at HEAD):** `expect(n.summary).toContain('Revenue')` + `expect(n.summary).not.toContain('Quarter')`.
- **D2a numeric-Y + categorical color** (`x:cat, y:{field:'amount',scale:'linear'}, color:{field:'series'}`): `analysis.measureField==='amount'`; `r11.passed===true`; `n.summary` contains `Amount` (falls back to Y, not the categorical color).
- **D2b numeric-Y + absent color:** `measureField==='amount'`; `r11.passed===true`.
- **D3b numeric-x heatmap (isolated):** no finding `startsWith('Correlation coefficient:')`; `analysis.correlation===undefined`; no `startsWith('Trend ')`.
- **D4 teeth (isolated):** `expect(analysis.colorField).toBeUndefined()` AND `expect(n.keyFindings.some(f=>/^Revenue: \d/.test(f))).toBe(false)` — reverting `:144` alone re-binds colorField=revenue → 12-value "Revenue: 40, 51, …" finding → flips RED.

Each new assert verified **RED at HEAD, GREEN post-fix**, per-defect in isolation (m05 mutation discipline). Final viz-core count = **361 + N** (N recomputed at closeout, not asserted).

> **Scope boundary:** point labels stay `(East)` (X only), not `(East / Q4)` — a combined cell label is a `buildDataPoints:228-231` change that moves every heatmap finding → **OOS (§7).**

**#115 prose — declared owned regens (Derek: ADVERTISE DIRECTLY):**
- **B0 (the direct advertise — the honest #115 discharge):** add a one-clause note to the `viz.render` input-schema prose (`packages/mcp-server/src/schemas/viz.render.input.json` color-encoding / chart-type description, anchor ~`:334` "for every chart type") — e.g. *"For heatmaps the accessible narrative describes the COLOR-channel measure."* Regen `generated.ts` via `pnpm --filter @oods/schemas-tools run generate`; **declare under #564** (description-only, no type-shape change, s147 precedent). This is what makes #115 honest for the *actual* behavior change (not comments-only, the s149 finding).
- **A1** `packages/mcp-server/src/schemas/dashboard.render.input.json:434` (now-false periodField prose) → regen `generated.ts:1541` (`schemas-tools generate`; CI `generate:check`). Replace the false final sentence with: *"Absent keeps the sparkline, aggregate 'latest', and the 'window'/'prior_period' bases on dataset row order (as in v0.1); the KPI trendDirection is reported 'flat' unless a comparison baseline resolves, because a first-vs-last read of arbitrary row order is not a real trend (sprint-149 F6b)."*
- **A2** `schemas/viz/dashboard-spec.schema.json:186` **and** vendored `packages/viz-core/src/spec/dashboard-spec.schema.json:186` → regen `dashboard.types.ts` (root `generate:schema-types`). Parity asserted by `packages/viz-core/test/vendored-schema-parity.spec.ts:29-31` — edit BOTH copies identically.
- **A3** `$comment` at `dashboard-spec.schema.json:7` (both copies) — `$comment` is codegen-stripped → **zero generated bytes**; parity test forces both edited.

---

## 5) Hard-constraint proofs

- **#564:** code fix moves ZERO committed goldens (grep-verified — narrative not snapshotted). Declared regens only: `generated.ts` (B0 + A1, owned `schemas-tools generate`, `generate:check` gated) + `dashboard.types.ts` (A2, owned root `generate:schema-types`, `--check` gated) — all JSDoc/description-only, no type-shape change. New tests additive. **s149 lesson enforced:** m07 runs the FULL viz-core + mcp-server suites (F6d's real regen surfaced only at the full suite).
- **#110:** no edit to `artifact.certify.ts`/`certify-contrast.ts`. Fix changes the *content* the a11y-equivalence result carries; certify keeps reading it (mirrors s149 #853c). A heatmap verdict may legitimately flip self-warn→pass — a read of a corrected producer, not a scorer edit.
- **#525:** all edits are internal viz-core logic + prose on **existing** fields; no new field/file/enum/tool. Set stays 25.
- **determinism:** added lines are pure boolean predicates + ternaries over `marks.every`/`getEncodingBinding`/`toNumber`/`deriveTrend`; no `Date.now`/`Math.random`/env; prose is static.
- **#115 (ADVERTISE DIRECTLY, Derek):** B0 reaches `generated.ts` and advertises the actual behavior change; A1 removes the now-false "byte-identical to v0.1" promise. Both agent-visible — closes the s149 comments-only gap.

---

## 6) Mission spine — strict `Requires` chain (build executes without re-grounding)

**m01 — Keystone decision memo (NO-CODE).** Requires: none. Completed-at-creation = this file. Records the ratified forks, the two-predicate architecture, all §3 edits, §4 test plan, §5 proofs, this spine, §7 OOS.

**m02 — Predicate foundation (additive, zero behavior change).** Requires: m01. Add module-local `isQuantitativeField` (near `:258`) + export `isMarkRectGrid` (P2) and `heatmapColorIsMeasure` (P1) before `:103`. **No call-site changes.** Export ONLY the two predicates (keep `isQuantitativeField` unexported — barrel-leak guard). Accept: `pnpm --filter @oods/viz-core build`; **all 361 existing green + N new predicate unit tests** (P1 true for quant-color fixture; false for categorical-color / absent-color / bar).

**m03 — Binding + label unification (defects 1+2, ATOMIC).** Requires: m02. Rewire `data-analysis.ts:137-144` (via P1) **and** `narrative-generator.ts:2-7`+`117-127` (label + colorLabel via P1) in ONE mission so the two channel decisions land together and cannot diverge. Accept: rebuild viz-core; `generateNarrativeSummary` on the F6d fixture says "Revenue" not "Quarter".

**m04 — Trend/correlation guard (defect 3).** Requires: m02. Edit `data-analysis.ts:115-116` (gate on P2) + extend JSDoc `:50-54`. Accept: rebuild; fixture emits no `"Trend "`/`"Correlation coefficient:"` finding; `analysis.trend`/`correlation` undefined.

**m05 — Test teeth (defects 1–4).** Requires: m03, m04. Strengthen `data-analysis-heatmap-f6d.spec.ts:39,42-43` to label-strings + add the §4 cases (D1 exact-array + D1-isolated, D2a, D2b, D3b, D4-teeth). Add `analyzeVizSpec`+`generateNarrativeSummary` to its import. Accept: viz-core green at 361+N; each new assert verified RED-at-HEAD **in isolation** before the fix.

**m06 — #115 advertise + prose truth (defect 5).** Requires: m01 (orthogonal to m02-m05). Apply B0 (`viz.render.input.json` heatmap-narrative clause), A1 (`dashboard.render.input.json:434`), A2 (`dashboard-spec.schema.json:186` × both), A3 (`$comment:7` × both); run `schemas-tools generate` **and** root `generate:schema-types`; commit regenerated `generated.ts` + `dashboard.types.ts`. Accept: `generate:check` + root `--check` green; `vendored-schema-parity.spec.ts` green; grep `generated.ts` shows B0 clause + corrected A1 sentence.

**m07 — Closeout gate + live-verify.** Requires: m05, m06. **DIST-SANITY GATE FIRST** [critic regression-risk 1]: the working `packages/viz-core/dist` currently contains a stale marks-only `isHeatmapRectSpec` prototype at both sites — a clean rebuild is mandatory before the mcp-server suite (which resolves `@oods/viz-core`→dist), else it green-lights the naive broken version. After `pnpm -r build`, assert `dist/index.js` NO LONGER exports/uses `isHeatmapRectSpec` and DOES export `heatmapColorIsMeasure` before running the mcp-server suite. Full gate in order: `pnpm install --frozen-lockfile`; root `pnpm typecheck`; `schemas-tools generate:check`; root `generate:schema-types --check`; `docs:api --check`; `pnpm -r build`; **dist-sanity gate**; viz-core (361+N); mcp-server; `test:scale`; `vendored-schema-parity`; root `core` project. Then `pm2 restart oods-forge-bridge` + dual-path live-verify (:4466 POST /run + aquex — NOTE aquex was disconnected at planning; confirm it's back) on a default heatmap: narrative "…totaling 1,038 Revenue" (not "Quarter"), no phantom trend, R-11 passes; and on a numeric-Y absent-color heatmap: R-11 passes. Accept: all gates green + both live paths confirm.

---

## 7) Out of scope / deferred

- **Combined cell label `(East / Q4)`** — needs `buildDataPoints:228-231` change; moves every heatmap finding, new-regression risk. Minimal fix yields `(East)`. Deferred.
- **Mixed-type color column summary-count quirk** — a color field with ≥1 numeric among categorical/null cells: P1 true → `buildDataPoints` drops non-numeric cells but `rowCount` stays full, so "covers N … totaling X" counts all rows while X sums the numeric subset. **NOT introduced by this fix** (HEAD already does measure=color for all heatmaps; the fix is strictly stricter). `.some()` stays (`.every()` would regress genuine heatmaps). Deferred.
- **Full-revert (Option B) mechanics** — only if the m03 unification can't be done cleanly (the §2 hard stop).
- **Defect 6 — SQLite sidecars (git-domain, Derek's call — NOT a build mission).** `.gitignore:56` (`cmos/db/*.sqlite`) misses `-shm`/`-wal`; both tracked (added 485d488), deleted in working tree, churn every diff. Suggested (Derek executes): `git rm --cached cmos/db/cmos.sqlite-shm cmos/db/cmos.sqlite-wal` + append `.gitignore` line `cmos/db/*.sqlite-*`. Zero functional impact.

## 8) Build-hygiene landmine (must-do)

The local `packages/viz-core/dist/` is **divergent and ahead of HEAD source** — it contains an uncommitted marks-only `isHeatmapRectSpec` prototype at both the binding (`dist/index.js:41263`) and label (`:41560`) sites. Any dist-consuming probe masks the real bug and would mask a broken fix. m02/m03/m04 rebuild viz-core from s150 source; m07's dist-sanity gate is the backstop that makes the naive prototype physically unable to ship.
