# Forge Viz — Measure-Narrative DEPTH (comparison-basis "vs target" + explicit chart-panel measures) Decision Memo

| | |
|---|---|
| **Decision** | s130-m01 keystone (captured at mission close; grounding `wf_d110b671-a78`) |
| **Sprint** | sprint-130 |
| **Root mission** | s130-m01 |
| **Date** | 2026-06-25 |
| **Status** | **RATIFIED** — Derek-locked at planning (decision #957); Derek-endorsed the s129-review recommended path verbatim, then ratified 3 forks via AskUserQuestion; grounded by `wf_d110b671-a78` (6 live-repo scopes + synthesis + adversarial critic, verdict AMEND/high — all amendments + 2 critic blockers baked in) |
| **Origin** | Phase-3 DEPTH continuation. Predecessor: `forge-viz-measure-narrative-decision-memo.md` (s129, decision #944) shipped measure-CONTEXT verbalization (`displayName`/`unit`/`format`/`threshold.value`) over the cross-panel `a11y.narrative` and **struck** the "vs target" clause. **This memo lifts that strike** — it threads comparison-basis "vs target N" into the narrative and generalizes the measure-narrative seam to EXPLICIT chart panels. |

**Companion docs:** `forge-viz-measure-narrative-decision-memo.md` (the s129 predecessor — Calls A–E this memo extends); `forge-viz-flagship-strategy.md` §1 (moat thesis) + §5.1 (next frontier); `forge-viz-phase3-scoping-memo.md` §4; `near.md`.

---

## 0. What this sprint adds (the thesis)

s129 made the deterministic narrative speak the **measure CONTEXT** the registry governs — `displayName` / `unit` / `format` / `threshold.value` — over the cross-panel `a11y.narrative`. It deliberately **struck** the comparison-basis clause: a narrative could say *"Total Revenue: 390 USD … threshold 350 breached"* but not what the delta was measured **against**.

s130 is **DEPTH along the SAME proven spine** (`applyNarrativeOverride` / `measureProjections` / the `wantHtml || wantA11y` gate-lift) — **NOT** a greenfield NL→viz pivot. Two things land:

1. **Comparison-basis "vs target N"** — when a KPI's resolved comparison is a `target`, the narrative names the target value the delta was computed against (e.g. *"…, delta 90 vs target 300"*). This closes the s129 strike.
2. **EXPLICIT chart-panel measures** — a chart panel may carry an optional `measureRef`; its resolved measure context decorates the chart's narrative. The measure-narrative seam stops being KPI-only.

The moat pillar at stake (strategy §1): **"governed + explainable BY CONSTRUCTION."** Under the MCP-only consumer model (#525), an agent reads the JSON narrative to verify/iterate its own dashboard. *"delta 90"* is not self-explaining about its baseline; *"delta 90 vs target 300"* is — and it is **narratively truthful** only if the clause names the comparison the delta was ACTUALLY computed against (Call A).

**Depth-not-breadth held.** No NL→viz, no measure business-intent inference, no structured per-KPI `panels[].a11y`, no recommender-visible/chartType-inferred chart measures, no `~137-site` `src/viz` consumer rewire. See §8 deferrals.

---

## 1. The five pinned calls (Derek-ratified 2026-06-25)

| Call | Decision | Where |
|---|---|---|
| **A — comparison source = RESOLVED/effective; LIFT the s129 "vs target" strike** | The "vs target N" clause reads `kpiPanel.comparison` (the comparison AFTER `resolveMeasurePanel`, author-override-wins per s117 D4) so it names what `computeKpi` ACTUALLY compared against (`kpi.ts:152-153`), not a governed default an override superseded. **Ordering consequence pinned here:** `measureContext` is built at `dashboard.render.ts:210-215` BEFORE `kpiPanel` is assigned at `:216`, so the comparison read MUST move to AFTER `:216` and the `comparisonBasis`/`comparisonValue` projection RELOCATES into a post-216 augmentation keyed by the same `panel.id`. | §2 |
| **B — verbalization surface = CROSS-PANEL `a11y.narrative` ONLY** | The "vs target N" clause lands on the dashboard-level `a11y.narrative` (and, for chart panels, their narrative via Call/§4), **NOT** the per-panel `kpiA11y` `a11yDescription` string. This keeps frozen seam (h): `periodBasisLabel` returns `''` for basis `'target'` (`dashboard.render.ts:660-671`), so the per-panel string stays bare. | §3 |
| **C — ONE phrasing in TWO genuine emit sites (no fork)** | `deriveDashboardNarrative` (`dashboard-narrative.ts:63-80`) inlines its OWN keyFinding template and does **not** call `describeMeasureContext` — so the single-chart `describeMeasureContext` (`narrative-generator.ts:217-233`) and the cross-panel `deriveDashboardNarrative:63-80` are **two separate emit sites**. The no-fork rule requires the **IDENTICAL** `vs target N` literal in both. Exact literal pinned below. | §4 |
| **D — `OODS-V142`, a NEW `validation` code (NOT a V141 rename)** | Allocate `OODS-V142` (V141 highest at `registry.ts:161`; V142 free) as a `validation`/`retryable:true` code scoped to **`threshold.direction`** equivalence — broadening V141's `threshold.value`-only check. Registered in **m04**, not m01. The unit/format/displayName broadening is TAUTOLOGICAL and DEMOTED to the m04 frozen golden. | §5 |
| **E — UNKNOWN chart-panel `measureRef` = HARD-ERROR mirroring V130** | When m03 generalizes the seam to chart panels, an unknown chart `measureRef` HARD-ERRORS through the same seam V130 uses for KPI panels (governance consistency across panel kinds) — **NOT** a silent degrade. | §6 |

---

## 2. Call A — comparison source = RESOLVED/effective; the "vs target" strike is lifted

**What lands textually:** when a KPI's resolved comparison basis is `'target'` and a target value is present, the narrative names it — `vs target N`. The s129 memo §2 struck this clause; s130 reinstates it.

**Source = the RESOLVED/effective comparison (`kpiPanel.comparison`), NOT the registry default.** `resolveMeasurePanel` fills the panel's comparison/threshold from the registry by `??` (author wins — s117 D4). `computeKpi` reads `panel.comparison` and, for basis `'target'`, returns `comparison.value` as the baseline (`kpi.ts:148-153`). So the value the delta was computed against is `kpiPanel.comparison.value` — **after** resolution. Verbalizing the registry default instead would misstate the baseline whenever an author override superseded it. **Narratively truthful = read the resolved comparison.**

**The ordering consequence (pin the FINAL shape here; do NOT defer to m02).** At `dashboard.render.ts:210-215` the base `measureContext` (`unit`/`format`/`thresholdValue`) is built from the registry `entry` and stashed in `measureProjections` keyed by `panel.id` — and the comment at `:206-208` explicitly notes comparison.basis is "struck per m01 fix A". Then `kpiPanel = resolveMeasurePanel(panel, registry)` at `:216`. Because the resolved comparison lives on `kpiPanel` (line 216 output), the `comparisonBasis`/`comparisonValue` read **cannot** happen in the 210-215 block (where only the registry `entry` is in scope and `kpiPanel` does not yet exist). m02 RELOCATES the comparison projection into a **post-216 augmentation** that re-reads `measureProjections.get(panel.id)` (or stashes after 216) and adds `comparisonBasis: kpiPanel.comparison?.basis`, `comparisonValue: kpiPanel.comparison?.value`. The base `unit`/`format`/`thresholdValue` projection MAY stay at 210-215 (registry-sourced) or move; the comparison fields MUST be post-216.

**Foundational engine edit (m01, this mission — the type only):** add two optional readonly fields to `MeasureNarrativeContext` (`narrative-generator.ts:34-41`):

```ts
readonly comparisonBasis?: 'prior_period' | 'target' | 'window';
readonly comparisonValue?: number;
```

The enum mirrors `KpiComparison.basis` (`dashboard.types.ts:343`) verbatim; `comparisonValue` mirrors `KpiComparison.value?: number` (`:351`, the explicit target for basis `'target'`). The doc comment at `narrative-generator.ts:29-31` is updated to lift the "vs target" strike. **`MeasureNarrativeContext` is INTERNAL-ONLY** — VERIFIED never named in any `*.schema.json` or `generated.ts` — so the type edit is **ZERO codegen churn**. No schema change; the type-only edit ships via the m02+ rebuild cycle.

**CRITIC BLOCKER baked in (do NOT repeat the grounding's false claim).** `MeasureNarrativeContext` is reused by **THREE** live consumers:

1. `AnalysisNarrativeInput` (`narrative-generator.ts:65`),
2. `AnalysisTableInput` (`table-generator.ts:68`, consumed by `withMeasureUnit` at `table-generator.ts:236` to annotate the accessible-table caption),
3. `DashboardKpiSummary` (`dashboard-narrative.ts:32`).

The doc comment at `narrative-generator.ts:31` naming `AnalysisTableInput` is **CORRECT** — do **NOT** "correct" or drop it (the grounding's claim that AnalysisTableInput does not use the type is FALSE; `table-generator.ts:5/68/236` prove it). Both new fields stay **optional + absent-safe across ALL THREE paths** including the table caption. They are purely additive: each consumer reads only the specific fields it needs (`unit`/`format`/`thresholdValue`), so two new unread-until-m02 optional fields cannot change any existing output.

---

## 3. Call B — verbalization surface = the CROSS-PANEL `a11y.narrative` ONLY

The "vs target N" clause lands on the dashboard-level `a11y.narrative` (and, in m03, the chart panel's narrative), **NOT** the per-panel `kpiA11y` `a11yDescription` string.

**Why.** The per-panel KPI a11y string already has a frozen comparison-basis seam (h): `periodBasisLabel` (`dashboard.render.ts:660-671`) emits `'vs prior period'` / `'over the last N periods'` for the period bases and **`''` for `'target'`**, and it is applied **only** under an explicit `periodField` (`:652`). The golden at `dashboard.render.test.ts:193-209` ("adds NO period phrase for a target basis even when periodField is set") pins the bare string:

```
'Rev: 200 (increasing, delta 50).'        // comparison { basis:'target', value:150 } → NO clause on the per-panel string
```

If the "vs target" clause were added to `kpiA11y`, this golden would break. Keeping the clause on the cross-panel `a11y.narrative` preserves it byte-for-byte. The per-panel string stays the terse signal; the cross-panel narrative carries the richer governed frame (the same split s129 §3.2 pinned: `kpiA11y` = unit-only; `a11y.narrative` = unit + threshold + now the target).

---

## 4. Call C — ONE phrasing, TWO genuine emit sites; the exact literal

**Two emit sites, verified separate.** `deriveDashboardNarrative` (`dashboard-narrative.ts:63-80`) builds its keyFinding inline (`${k.label}: ${formatted} (${k.trendDirection}${deltaPhrase})${flagPhrase}`) and does **not** call `describeMeasureContext`. The single-chart path's `describeMeasureContext` (`narrative-generator.ts:217-233`) is a separate function emitting a `'; '`-joined `Measure: …` finding. The no-fork constraint (ONE phrasing) therefore requires the **identical clause substring** in both.

**PINNED EXACT LITERAL.** The clause is, in BOTH sites:

```
vs target ${formatNumeric(comparisonValue)}
```

emitted **only when** `comparisonBasis === 'target' && comparisonValue !== undefined`. Both sites format the value via `formatNumeric` (from `a11y/format.js`) so the emitted token sequence is byte-identical (`deriveDashboardNarrative` must add the `formatNumeric` import in m02). The surrounding punctuation differs per site (it is a `'; '`-joined `parts` element in `describeMeasureContext`; a clause appended to the delta phrase in `deriveDashboardNarrative`), but the `vs target N` token sequence is identical.

**Worked examples** (gm.revenue.total: resolved `comparison { basis:'target', value:300 }`, `defaultThreshold { direction:'above', value:350 }`, format `currency`, NO unit; computed value 390 / delta 90):

- Cross-panel `a11y.narrative` keyFinding:
  > `Total Revenue: 390 (increasing, delta 90 vs target 300) — threshold 350 breached`
- Single-chart `describeMeasureContext` finding (chart panel resolving the same measure, m03):
  > `Measure: Total Revenue; format currency; threshold 350; vs target 300`

**Non-target bases.** `comparisonBasis` carries all three enum values (type mirrors the source), but **only the `'target'` case is verbalized this sprint** — `prior_period` / `window` have no static value (the baseline is computed per-series in `kpi.ts:155-157`), so there is no `vs target N` analog to emit. Their phrasing is DEFERRED (depth-not-breadth). The clause renders ONLY for the target basis with a present value.

---

## 5. Call D — `OODS-V142`, a NEW `validation` code (threshold.DIRECTION), registered in m04

The highest registered code today is **`OODS-V141`** (`registry.ts:161`, the s129 measure-narrative equivalence code). The next free code is **`OODS-V142`**, registered AFTER `:161` and BEFORE the `// ── Validation: Brand/Map` comment at `:163`. It is a **`validation`** code (`registry.test.ts` enforces prefix=category via `/^OODS-[VNCSRR]\d{3}$/` — there is no `A`/`'narrative'` class), `retryable:true`.

**V142 is a NEW code, NOT a V141 rename** (registry no-rename commitment). V141 checks `threshold.value` equivalence; **V142 broadens it to `threshold.direction`** — the only field-class V141 leaves uncovered. This is **non-tautological and reachable**: an author can override `threshold.direction` only (e.g. flip `above`→`below`) so `computeKpi`'s breach flag flips while the verbalized narrative still says *"threshold 350 breached"* against the governed direction — a registry-vs-rendered drift the narrative would misrepresent. (`gm.revenue.total` governed `direction:'above', value:350`.)

**The unit/format/displayName broadening is DEMOTED — DO NOT register a V14x for it.** `resolveMeasurePanel` copies only `field`/`aggregate`/`comparison`/`threshold` onto the panel — there is no second source for `unit`/`format`/`displayName`, so a verbalized-vs-resolved equivalence check on those is a same-source `value == value` **tautology**. It is covered instead by the m04 **frozen verbalization-correctness golden** (a byte-exact UNIT-bearing `a11yDescription` test on `gm.export.value.total`, `unit '1000 USD'`).

**Registered in m04, not m01.** m01 pins the allocation; m04 registers V142 + lands its golden.

---

## 6. Call E — UNKNOWN chart-panel `measureRef` = HARD-ERROR mirroring V130 (m03)

m03 generalizes the measure-narrative seam to EXPLICIT chart panels: an additive `ChartPanel.measureRef` schema field (+ vendored re-copy + `dashboard.types.ts`), with the narrative decoration **contained to mcp-server** (path (b)). **`resolveMeasurePanel` is UNTOUCHED** — chart context is **narrative-only** (it decorates the chart's a11y narrative; it does NOT expand the chart's encoding/field). When a chart panel names an **unknown** `measureRef`, it HARD-ERRORS through the same seam KPI panels use for V130 (Derek-ratified: governance consistency across panel kinds — NOT a silent degrade). EXPLICIT/caller-supplied measures ONLY this sprint; recommender-visible / chartType-inferred chart measures are DEFERRED (§8); `built.suggestion` untouched.

---

## 7. Process gates (s129-review #950-956; baked into this keystone)

1. **MECHANICAL grep-sweep BEFORE each feature lock (m02/m03/m04).** Grep **four token classes** — `'a11yDescription'`, `'.narrative'`/`'a11y.narrative'`, `'Measure:'`, and the delta/threshold/`'vs '` clause — across the **exhaustive** set, so the re-bake audit is exhaustive by construction, not author recall:
   - viz-core: `test/{dashboard-narrative,measure-narrative,non-cartesian-a11y,spatial-a11y}.spec.ts` + **any accessible-table caption spec** (the table-path consumer — critic blocker B1);
   - mcp-server: `src/tools/{dashboard.render,dashboard.render.measure-depth,dashboard.render.fidelity,viz.render}.test.ts` + `__snapshots__/dashboard.render.fidelity.test.ts.snap`.
2. **VALIDATE every cited registry value against the real file** — **DONE this mission** (`measure-registry.json`): `gm.revenue.total` `defaultComparison {basis:'target',value:300}`, `defaultThreshold {direction:'above',value:350}`, format `currency`, **NO unit** (lines 5-15); `gm.export.value.total` `unit '1000 USD'`, format `currency`, **NO defaultThreshold** (lines 33-43). The `300` (target) and `350` (threshold) are distinct — the s129 review caught a `300`-vs-`350` confusion; both are pinned here.
3. **Reframe "zero-rebake"** to distinguish **OUTPUT-INVARIANT** (flag-OFF byte-identical — the goldens must not move) from **COVERAGE-GAP** (new assertions for genuinely new behavior — those are additive, expected, and NOT a violation of the additive floor).
4. **Cache posture is DOC-ONLY.** `resetMeasureRegistryCache` (`measure-registry.ts:148-154`) is test-only with ZERO prod callers; a registry edit rides the existing rebuild + `pm2 oods-forge-bridge` restart cycle. No new reset wiring this sprint.
5. **Flagship-feature-mission counter audited against consumer-observable MCP-output deltas, NOT mission titles.** s130 = 4 feature (m01–m04 each change agent-observable JSON) + 1 closeout.
6. **ci.yml golden file LIST** is the vitest-run args under the "Run colocated viz.render + dashboard.render goldens" step (~line 620 — the test-header comment near `:582` is STALE), guarded by `ci-golden-list.guard.test.ts`. The list already includes `dashboard.render.measure-depth.test.ts`.

---

## 8. What m01 ships + deferrals

**m01 ships (this mission):**

- **This memo** — pins Calls A–E + the process gates before m02/m03/m04 build.
- **`MeasureNarrativeContext`** (`narrative-generator.ts:34-41`) gains `comparisonBasis?: 'prior_period'|'target'|'window'` + `comparisonValue?: number`, both optional/readonly; the doc comment at `:29-31` lifts the "vs target" strike while KEEPING the (correct) `AnalysisTableInput` reference. Zero codegen churn (internal-only type). Absent-safe across all three consumers.
- **Native-learning capture** (HARD gate) — single-string `cmos_session` capture of the memo ratification + each pinned call.

m01 makes **no behavioral change** — the two new fields are unread until m02 relocates the comparison projection and threads the literal. The type-only edit ships via the m02+ rebuild cycle.

**Held constraints (every mission):** #525 (sole consumer is an agent over MCP/JSON — the `wantHtml || wantA11y` gate-lift is load-bearing); #564 additive default-off floor (measureContext built ONLY inside the `resolveMeasures && panel.measureRef` guard; flag-OFF byte-identical: `viz.render.test.ts` treemap/sankey + `test/scale/dashboard-determinism.spec.ts` + `dashboard.render.test.ts` KPI golden + the fidelity HTML snap); NO `'a11y'`/`'narrative'` `ErrorCategory` (V142 is `'validation'`, `/^OODS-[VNCSRR]\d{3}$/`); ONE `applyNarrativeOverride` precedence path (the new clause enters via the DERIVED side, never `applyNarrativeOverride`); per-mission native-learning HARD capture gate (single-string `cmos_session` capture, NOT `cmos_mission_transition` `decisions[]` which gets stripped); two-layer + full cross-package closeout (`pnpm install --frozen-lockfile` + ROOT `pnpm typecheck` + two-layer build); bridge rebuild + `pm2 oods-forge-bridge` restart (`dashboard.render.ts` consumed src changes).

**DEFERRED (explicit carry-forwards):**

- **NL→viz** — HARD HAND-OFF: s131 opens the NL→viz scoping/decision memo on the now-complete measure-narrative substrate once m02+m03 ship (Phase-0 §5.1 data/intent contract still unresolved).
- **Measure business-intent inference**; **structured per-KPI `panels[].a11y`**.
- **The V14x unit/format/displayName equivalence** — DEMOTED (tautological; covered by the m04 frozen verbalization-correctness golden).
- **registry-cache posture** — DOC-ONLY (gate 4).
- **Recommender-visible / chartType-inferred chart-panel measures** — s130 = EXPLICIT/caller-supplied only; `built.suggestion` untouched.
- **`~137-site` `src/viz` consumer rewire**; **full agentic eval harness** (Phase 4 — only the s118 FAOSTAT seed exists).

**Refs:** grounding `wf_d110b671-a78`; s129 review PS-2026-06-25-010 (decisions #950-956); decision #957 (s130 lock); `forge-viz-measure-narrative-decision-memo.md` (s129 predecessor); `forge-viz-flagship-strategy.md` §5.1; `near.md`.
