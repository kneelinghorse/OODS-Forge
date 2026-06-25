# Forge Viz — Measure-Narrative ("narrative speaks over governed measures") Decision Memo

| | |
|---|---|
| **Decision** | s129-m01 keystone (captured at mission close; grounding `wf_2627fa05-fae`) |
| **Sprint** | sprint-129 |
| **Root mission** | s129-m01 |
| **Date** | 2026-06-25 |
| **Status** | **RATIFIED** — Derek-locked at planning PS-2026-06-25-008 (decision #944); grounded by `wf_2627fa05-fae` (6 live-repo scopes + synthesis + adversarial critic, verdict AMEND/high — all 5 amendments baked in) |
| **Origin** | Phase-3 differentiator named in `forge-viz-phase3-scoping-memo.md` §4 + `forge-viz-flagship-strategy.md` §4; the FD#10 a11y-source unification (`forge-viz-fd10-decision-memo.md`, #619, s128) is the substrate predecessor this builds on |

**Companion docs:** `forge-viz-fd10-decision-memo.md` (the additivity + V-code discipline this memo mirrors); `forge-viz-flagship-strategy.md` §1 (moat thesis) + §4 (Phase-3 roadmap); `forge-viz-phase3-scoping-memo.md` §4.

---

## 0. What "narrative speaks over governed measures" means (the thesis)

Phase-3's differentiator is that the deterministic insight **narrative** speaks over the **governed-measure registry** (the s116/s117 substrate — `measure-registry.json` + `resolveMeasurePanel`), not just over raw rows. Concretely: when a KPI panel resolves a `measureRef`, the resolved registry entry carries `displayName` / `unit` / `format` and a governed `threshold` (`measure-registry.ts` `MeasureEntry`: `displayName?`, `format?`, `unit?`, `defaultThreshold?: {direction, value}`). Today that governed context is **invisible** to the agent-readable narrative — the narrative reads the computed value/trend/delta but never the unit the value is in or the threshold it is governed against.

This sprint threads that **measure-CONTEXT** into the narrative surface. It is **measure-context verbalization** — naming the displayName/unit/format/threshold the registry governs — and explicitly **NOT** measure business-intent inference (DEFERRED). Depth-not-breadth: KPI measures only; one deep seam, reusing the s128 unified narrative SOURCE + the ONE `applyNarrativeOverride` precedence path.

The moat pillar at stake (strategy §1): **"governed + explainable BY CONSTRUCTION."** Under the MCP-only consumer model (#525), an agent reads the JSON narrative to verify/iterate its own dashboard. A narrative that says *"Total Revenue: 390 (increasing)"* without the unit or the governed threshold is not self-explaining; one that says *"Total Revenue: 390 USD … threshold 350"* is.

---

## 1. The five pinned calls

| Call | Decision | Where |
|---|---|---|
| **A — measure-CONTEXT, not business-intent; STRIKE "vs target"** | Thread `displayName`/`unit`/`format` + `threshold.value` from the resolved registry entry. **NO** `comparison.basis` — it is not threaded into `DashboardKpiSummary` today and "comparison-basis full transparency" is DEFERRED, so **no "vs target" clause** appears in any worked example. | §2 |
| **B — the GATE lift + re-bake audit** | The cross-panel dashboard narrative compute is gated on `wantHtml` only; LIFT it to `(wantHtml \|\| wantA11y)` so the measure narrative reaches the JSON `a11y.narrative` when `includeA11y=true`. Enumerate the re-bake audit. | §3 |
| **C — the KPI-surface routing** | KPI panels have **no** structured `panels[].a11y` surface; route the measure narrative through the two surfaces they DO have — the dashboard-level `a11y.narrative` (now JSON-reachable via B) + the existing `kpiA11y` `a11yDescription` string. **NO** structured KPI `panels[].a11y` this sprint. | §4 |
| **D — the V-code** | Allocate **`OODS-V141`** (next free; `registry.ts` V140 highest) as a `validation` code for measure-narrative equivalence, **registered in m03** (not m01). Repurposed from the FD#10 non-cartesian earmark. | §5 |
| **E — additive gating** | Reuse the `includeA11y` default-off floor (#564); **no new top-level flag**; default path byte-identical. | §6 |

---

## 2. Call A — measure-CONTEXT verbalization; the basis clause is struck

**What lands textually:** the measure's `displayName` (mapped to the existing `measureLabel`), `unit`, `format`, and the governed `threshold.value`. These are the fields a resolved `MeasureEntry` carries that an agent needs to *read the number correctly* and *know what it is governed against*.

**What is struck:** any **"vs target"** / comparison-basis clause. `comparison.basis` is **not** carried into `DashboardKpiSummary` (`dashboard-narrative.ts:16-26` has `delta` but no basis), and "comparison-basis full transparency" is on the DEFERRED list. The KPI a11y string's *existing* `periodBasisLabel` ("vs prior period" / "over the last N periods") is **period-basis** wording gated on an explicit `periodField` (`dashboard.render.ts:580-595) — that is the pre-existing s122 seam and is **not** part of this sprint's measure-context; `'target'` already adds no phrase there. This sprint adds **no** new basis wording.

**Pinned example phrasing (unit / displayName / threshold.value ONLY, no basis label):**

> `Total Revenue: 390 USD (increasing, delta 90) — threshold 350 breached`

(The breach flag is the *existing* `thresholdBreached` KPI signal; the measure-context contribution is the `USD` unit and the governed `threshold 350` value. The illustrative "390/90" are the computed KPI value/delta, unchanged.)

**Engine-layer shape (m01):** a single shared, optional `MeasureNarrativeContext { unit?, format?, thresholdValue? }` (`displayName` is the already-present `measureLabel`; NO `comparisonBasis` field). It is **carried alongside** the existing `VizDataAnalysis` on `AnalysisNarrativeInput` / `AnalysisTableInput` — **not** a parallel `MeasureAnalysisMetadata` type. The same shape is reused by `DashboardKpiSummary` in m02 (one type, no fork).

---

## 3. Call B — the GATE lift (critic Finding 1, dominant risk) + the re-bake audit

**The defect (confirmed live).** `dashboard.render.ts:429-433`:

```ts
const narrative = wantHtml
  ? toNarrativeOutput(resolveDashboardNarrative(input.a11y.narrative, collectKpiSummaries(panelResults), input.a11y.description))
  : input.a11y.narrative;
```

The cross-panel narrative (the KPI-derived, soon measure-enriched, summary) is computed **only** under `wantHtml`. The sole consumer is an agent over JSON/MCP (#525) — it does not read the HTML export — so as-was the measure narrative is **invisible** to the only consumer.

**Ratified resolution (Derek chose the gate-lift over an HTML-only narrative).** LIFT the compute to fire under `(wantHtml || wantA11y)` so the measure-aware summary reaches the JSON `a11y.narrative` when `includeA11y=true`. The gate-lift is justified *precisely because* the agent consumes JSON not HTML — it is the additive `includeA11y` surface (#564) extended to the cross-panel narrative, not a new flag.

**Why this is safe for the flag-OFF path.** When neither `wantHtml` nor `wantA11y` is set, both disjuncts are false → `narrative = input.a11y.narrative` (the author echo, `undefined` when absent) — **byte-identical** to today. The flag-OFF determinism golden (`test/scale/dashboard-determinism.spec.ts:25-39`) is unaffected.

### 3.1 The `includeA11y` re-bake audit (enumerated for m02)

`includeA11y` / `output.includeA11y` appears in **exactly two** test files: `viz.render.test.ts` and `dashboard.render.test.ts`. `viz.render` is single-chart and has **no** cross-panel narrative gate (the gate-lift is in `dashboard.render.ts` only), so it is **out of scope**. The dashboard audit surface:

| Call site | Sets `includeA11y` on a KPI dashboard? | Asserts dashboard-level `a11y.narrative`? | Gate-lift impact | m02 action |
|---|---|---|---|---|
| `dashboard.render.test.ts:613-628` "attaches a11y.table+narrative to every chart panel" | **Yes** (`metricOverview({ output:{ includeA11y:true }})`, no html) | **No** — asserts **per-panel** `panel.a11y.narrative/table` (624-626) + `validateOutput` (616) | `out.a11y.narrative` flips from **absent → present (computed)**; the test does not pin its absence, so it **stays green**; `validateOutput` stays true (`a11y.narrative` is an already-valid optional property exercised on the html path) | **Add a positive assertion** that `out.a11y.narrative` is now the computed (measure-enriched) value reaching JSON |
| `dashboard.render.test.ts:630-639` "omits panel a11y when flag off" | No (no flags) | No | none (both disjuncts false → unchanged) | none |
| `dashboard.render.test.ts:641-643` "(input) schema accepts output.includeA11y" | input-only | No | none | none |
| `dashboard.render.test.ts:268-276` "byte-identical composed payload" | No (html path) | `base` (no flags) narrative `undefined`; `withHtml` defined | none — `base` is the flags-OFF default (stays `undefined`); `withHtml` is the html path (already computes) | none |
| `dashboard.render.test.ts:305-324` "COMPUTES / author wins" | No (html path) | Yes (html path) | none — html already computes | none |

**Audit conclusion.** No existing test pins author-echo (or absence) of the **dashboard-level** `a11y.narrative` under `includeA11y=true` **without** html, so the gate-lift breaks **no** existing assertion. The required m02 work is **additive**: a positive test that the computed narrative now reaches the JSON `a11y.narrative` when `includeA11y=true` (added as a `dashboard.render.test.ts` `m02` describe block reusing the `metricOverview` + `gm.revenue.total` fixtures). The flag-OFF goldens are untouched. This audit is enumerated here so m02/m03 do **not** discover the surface at build time.

### 3.2 The SECOND re-bake surface — the `kpiA11y` a11yDescription string (surfaced + resolved in m02)

m01's audit (§3.1) covered the cross-panel `a11y.narrative`. **m02 found a second surface the §3.1 audit did not name:** the per-panel `kpiA11y` a11yDescription **string** (`dashboard.render.ts:567-578`). Tests (a)/(c)/(d) at `dashboard.render.test.ts:360/411/430/436` assert the **exact** resolved-measure a11yDescription (`'Total Revenue: 390 (increasing, delta 90).'`) under `resolveMeasures:true`. **Resolution that re-bakes ZERO existing tests:** `kpiA11y` appends **only the unit** (not the threshold). Confirmed live that **every** a11yDescription string assertion across mcp-server is either an inline-field KPI (`resolveMeasures` off → no measure-context) or a `gm.revenue.*` measure — and `gm.revenue.*` carry **no `unit`** in `measure-registry.json` (only `gm.export.*` do). No test asserts a unit-bearing measure's a11yDescription, so unit-only `kpiA11y` is byte-identical for all existing assertions. The richer threshold framing lives in the cross-panel `a11y.narrative` (the mission's example phrasing), not the terse per-panel string. **C-call refinement (KPI surface, §4):** of the two KPI surfaces, the `a11yDescription` string carries the **unit only**; the dashboard-level `a11y.narrative` carries **unit + governed threshold value**.

---

## 4. Call C — the KPI-surface routing (critic Finding 2, false-surface fix)

**The defect.** `buildKpiResult` (`dashboard.render.ts:549-565`) returns only an `a11yDescription` string (via `kpiA11y:567-578`); it **never** returns a structured `panels[].a11y` block. Only `buildChartResult` (`:619-621`) propagates `result.a11y`, and **chart panels have no `measureRef`**. So a structured `panels[].a11y.narrative` surface **does not exist for `kind=kpi`** — the measure narrative cannot land there.

**Ratified routing.** Route the measure narrative through the **two surfaces KPI panels actually have**:

1. **The dashboard-level `a11y.narrative`** — now JSON-reachable via the gate-lift (§3). The KPI signals (incl. measure-context in m02) flow `collectKpiSummaries:529-540 → DashboardKpiSummary → deriveDashboardNarrative:38-72`.
2. **The KPI panel's existing `a11yDescription` string** — extend `kpiA11y:567-578` to append measure-context (unit/threshold) when present; **byte-identical when absent**.

**Explicitly out of scope:** a structured per-panel `panels[].a11y` block for `kind=kpi`. That is **new additive schema work** (a `DashboardRenderOutput` per-panel-KPI a11y property + golden re-bake) and is **DEFERRED**. This sprint claims **no** structured KPI `panels[].a11y.narrative`.

---

## 5. Call D — `OODS-V141`, a `validation` code, registered in m03

The highest registered code today is **`OODS-V140`** (`registry.ts:152`), so the next free validation code is **`OODS-V141`**. The registry enforces **prefix = category**: `registry.test.ts:20` asserts `/^OODS-[VNCSRR]\d{3}$/` — there is **no `A`** in that class, so an `OODS-A###` code or an `'a11y'`/`'narrative'` `ErrorCategory` would fail the registry test. V141 is therefore a **`validation`** code (the same standing invariant the FD#10 memo §2 pinned, and the s118 contrast finding `OODS-V135` followed).

**Repurpose note.** The FD#10 memo (§2 allocation note) earmarked `V141` for **non-cartesian** a11y-equivalence. That earmark is **superseded**: V141 is now the **measure-narrative** equivalence code (KPI-only). Confirmed: the non-cartesian equivalence gate (`equivalence-rules.ts` / `non-cartesian-a11y.spec.ts`) does **not** separately register a V141 — it routes through its existing N/C/S codes — so there is no collision.

**Registered in m03, not m01.** m01 ships the engine source layer only (the measure-aware analysis input). m03 registers V141 with a **NON-TAUTOLOGICAL** failure: the **verbalized** unit/threshold compared against the **resolved registry entry** (a registry-vs-rendered drift), **NOT** a same-source `value == value` tautology. Routed via `onPanelError` after V130/V132/V133/V137/V138/V139.

---

## 6. Call E — additive / default-off gating (#564 floor)

The fix is **purely additive**; the default path stays **byte-identical**:

- **No new top-level flag.** Measure-context surfacing rides the existing `includeA11y` default-off floor (the cross-panel `a11y.narrative` reach in §3) and the always-present `a11yDescription` string (byte-identical when measure-context absent).
- **Engine layer (m01):** the new `measureContext` is **optional** on `AnalysisNarrativeInput` / `AnalysisTableInput`. The cartesian spec-path (`analyzeVizSpec`) is **untouched** and the spec branch of `resolveNarrativeInputs` / `resolveTableInputs` supplies **no** measure-context — so **absent === the s128 narrative output byte-for-byte**. The author-override precedence stays on the **single** `applyNarrativeOverride` path (`narrative-generator.ts:108-123`): an author-supplied narrative still wins identically, so measure-context enriches only the *derived* findings.
- **Byte-identical checklist (m05):** `viz.render.test.ts:232-300` + `test/scale/dashboard-determinism.spec.ts:25-39` + the flag-OFF KPI golden `dashboard.render.test.ts:336-437`, all with flags OFF. (NOT `viz-determinism.spec.ts`.)

---

## 7. What m01 ships (this mission)

- **This memo** — pins calls A–E before m02/m03 build.
- **`MeasureNarrativeContext`** (`narrative-generator.ts`) — one shared optional `{ unit?, format?, thresholdValue? }`, exported on the viz-core barrel for m02 reuse.
- **`AnalysisNarrativeInput` + `AnalysisTableInput`** gain an optional `measureContext` — carried alongside `VizDataAnalysis`, NO parallel metadata type, reusing the s128 `'analysis' in input` polymorphism seam.
- **Narrative surfacing:** when `measureContext` carries governed content, a leading measure-context key finding verbalizes `measureLabel` / `unit` / `format` / `threshold` (via the ONE `applyNarrativeOverride` path — author override still wins). Absent === s128 output.
- **Table surfacing:** the resolved caption carries the unit when present (byte-identical when absent).
- **VITEST** (`packages/viz-core`) proving the measure-context fields surface in `keyFindings` AND that the absent-field input is byte-identical to s128 narrative output.

**Held constraints:** #525 (MCP-only consumer; the gate-lift is justified because the agent consumes JSON not HTML; never write missions in another team's repo); #564 (additive floor, default-off, byte-identical existing wire + goldens); **NO** `'a11y'`/`'narrative'` `ErrorCategory` (V141 is `validation`, registered in m03); reuse `applyNarrativeOverride` (ONE precedence path); reuse the s128 polymorphism seam (no parallel metadata type); **depth-not-breadth** — measure-context verbalization over KPI measures ONLY (no NL→viz, general composer, template registry, role-binding, business-intent inference, the "vs target" basis clause, structured KPI `panels[].a11y`, or chart-panel measure resolution).
