# Forge Viz — FD#10 (Non-Cartesian a11y "Same Source") Decision Memo

| | |
|---|---|
| **Decision** | #619 |
| **Sprint** | sprint-128 |
| **Root mission** | s128-m01 |
| **Date** | 2026-06-25 |
| **Status** | **RATIFIED** — Derek-locked at planning PS-2026-06-25-004 (decision #940); grounded by `wf_ce36480b-328` |
| **Origin** | Forge-Demos inbound CMOS message `bb87e56f` (info_push, 2026-06-22) — accepted, scheduled in reply (`8991afa6`) |

**Companion docs:** `forge-viz-flagship-strategy.md` §1 (thesis) + §4 (roadmap); `forge-viz-phase3-scoping-memo.md` (the additivity discipline this memo mirrors).

---

## 0. The ask, verbatim

Forge-Demos shipped Demo 01 ("Follow your breakfast around the planet") against the Sprint-125 engine and reported two engine sharp-edges. Item **#10** is the one this sprint closes. Quoted **verbatim** from CMOS inbox message `bb87e56f` (`.payload.body`):

> **#10 — a11y helpers are CARTESIAN-ONLY.** generateAccessibleTable(spec) / generateNarrativeSummary(spec) read spec.data + spec.encoding, but the non-cartesian adapters take their data via a SEPARATE input the spec never carries: adaptSankeyToECharts(spec, SankeyInput); adaptTreemap/SunburstToECharts(spec, HierarchyInput); the spatial adapters via adaptToECharts({ spec: SpatialSpec, geoData, data }). So every sankey/treemap/sunburst/geo hero builds a THROWAWAY cartesian bar spec over the same rows (corridors / leaves / shaded countries) purely to obtain the table + narrative — hit on 4 chart families this sprint. A helper deriving a11y directly from SankeyInput / HierarchyInput / SpatialSpec would keep "a11y from the same source" true for all 13 types, not just the 5 cartesian ones.

The moat pillar at stake (strategy §1): **"on-brand + accessible BY CONSTRUCTION."** Under the MCP-only consumer model (#525), "accessible viz" = a STRUCTURED two-part text alternative (accessible data table + narrative summary) an agent reads to verify/iterate its own dashboard — NOT browser-DOM. That pillar is TRUE for the 5 cartesian types and FALSE for the 8 non-cartesian ones, because the data never reaches the analyzer.

**Root cause (confirmed live):** `packages/viz-core/src/a11y/data-analysis.ts` `collectRows:142` reads ONLY `spec.data.values`; `normalizeMark:122` is cartesian-only; both generators run `analyzeVizSpec`, so the non-cartesian inputs (`HierarchyInput`/`SankeyInput`/`NetworkInput` at `network-flow.ts:43/79/62`; `SpatialSpec` at `spatial.ts:284`) never flow through.

---

## 1. The exact type set landing in s128

`ChartType` (`packages/viz-core/src/patterns/index.ts:12`) is a 13-value enum: **5 cartesian** + **8 non-cartesian**.

- **Cartesian (5, already covered):** `bar`, `line`, `area`, `scatter`, `heatmap`.
- **Non-cartesian (8, the FD#10 gap):** `treemap`, `sunburst`, `sankey`, `chord`, `force_graph`, `choropleth`, `bubble_map`, `flow_map`.

s128 closes **all 8**, split by the data contract each family carries:

| Mission | Types | Analyzer | Input contract |
|---|---|---|---|
| **m01** (this root) | `treemap`, `sunburst` | `analyzeHierarchy` | `HierarchyInput` (`network-flow.ts:43`) |
| **m01** | `sankey`, `chord` | `analyzeSankey` | `SankeyInput` (`network-flow.ts:79`) — **chord reuses `SankeyInput`** |
| **m01** | `force_graph` | `analyzeNetwork` | `NetworkInput` (`network-flow.ts:62`) |
| **m02** | `choropleth`, `bubble_map`, `flow_map` | `analyzeSpatial` | `SpatialSpec` (`spatial.ts:284`) |
| **m03** | — (all 8) | — | wire analyzers through `viz.render` + `dashboard.render` (additive output) |

So m01 lands **5 types via 3 analyzers** (chord rides `analyzeSankey`, not a 5th analyzer); m02 lands the remaining 3 spatial types via one analyzer reusing `AccessibleMapFallback`'s rows (no duplication).

---

## 2. Decision: NO `a11y` ErrorCategory — route equivalence failures through a `validation` V-code

A non-cartesian a11y-equivalence failure (table/narrative missing or inconsistent with the rendered data) is a validation finding and must surface under an existing category. We **do NOT add an `'a11y'` ErrorCategory**, because the registry enforces **prefix = category**: `packages/mcp-server/src/errors/registry.test.ts:20` asserts every code matches `/^OODS-[VNCSRR]\d{3}$/`. There is no `A` in that character class, so an `OODS-A###` code (or an `a11y` category) would fail the registry test. The category letters are fixed: **V**alidation, **N**, **C**, **S**, **R**, **R**.

**Routing:** non-cartesian a11y-equivalence failures route through a **`validation` V-code** (e.g. `OODS-V###`), exactly as the s118 contrast finding did (`OODS-V135`, a V-code NOT `OODS-A001`). This is a standing invariant, not a fresh call. The widen of `#546`/`#571` is **NOT** a #10 dependency — #10 needs no new category, only the source-unification.

**Allocation note for m03:** the highest registered code today is `OODS-V140` (`registry.ts`), so the next free validation code is **`OODS-V141`**. m01 does NOT register a code — the equivalence tests + their failure code land in **m03** (which adds `tests/viz/a11y-equivalence.test.ts` non-cartesian fixtures). m01 ships the analyzer/source layer only.

---

## 3. Decision: additive / default-off gating (#564 floor)

The fix is **purely additive**; the cartesian path stays **byte-identical**:

- The shared core `buildVizDataAnalysis` (`data-analysis.ts`) is extracted from `analyzeVizSpec`; `analyzeVizSpec` becomes a thin cartesian wrapper passing `computeTrend: true` + the Pearson correlation, so its output is unchanged.
- `generateAccessibleTable` / `generateNarrativeSummary` gain a **second accepted input** — a pre-built `{ analysis, … }` bundle — discriminated by the presence of an `analysis` field (`NormalizedVizSpec` has none). The spec branch resolves the same analysis, column order, labels, caption, id, author-override, and fallback it always did.
- `deriveColumns` is generalized to `(rows, columnOrder, resolveLabel)` — one column-derivation implementation, reused by both branches (no fork).
- The narrative override stays on the **single** `applyNarrativeOverride` precedence path shared with `deriveDashboardNarrative` (`dashboard-narrative.ts:38`) — author summary/findings win identically across all consumers.
- Non-cartesian analyzers set `mark: 'unknown'` and leave `trend`/`correlation` off (those rows have no inherent ordering), so no spurious trend/correlation finding is emitted.

**MCP surfacing (m03) is the only place new OUTPUT appears**, and it is **default-off**: optional additive `a11y.table` / `a11y.narrative` on `viz.render.output.json` and a per-panel additive extension to `DashboardRenderOutput` — byte-identical wire output when the flag is off, `additionalProperties`-clean. Byte-identical checklist for m03: `viz.render.test.ts:232+` (treemap/sankey ECharts options) AND `test/scale/dashboard-determinism.spec.ts`.

---

## 4. What m01 shipped (this mission)

- **3 analyzers** in `packages/viz-core/src/a11y/non-cartesian-analysis.ts`: `analyzeHierarchy` (leaves-only, no parent/child double-count), `analyzeSankey` (each link a flow; total = total flow; serves chord), `analyzeNetwork` (node degree; total = 2 × edges; groups → color categories). All emit the existing `VizDataAnalysis` row/extrema shape via `buildVizDataAnalysis`.
- **Generator refactor**: both generators accept a spec OR a pre-built analysis; cartesian output byte-identical (full viz-core suite unchanged at 263 → 275 with the 12 new tests).
- **Tests**: `packages/viz-core/test/non-cartesian-a11y.spec.ts` — the analyzers, the pre-built-analysis overloads, author-override precedence parity, and an FD#10 **"same source" equivalence** test pinning that the input-shaped table yields the same total/extrema/value-cells an agent would have gotten from the throwaway cartesian spec.

**Held constraints:** #525 (MCP-only; never write missions in Forge-Demos' repo); #564 (additive floor); NO `a11y` ErrorCategory; do NOT touch spatial (m02); reuse `applyNarrativeOverride`; depth-not-breadth (unify the a11y SOURCE only — no NL→viz / narrative-over-measures, the still-unbuilt Phase-3 differentiator for which FD#10 is the substrate predecessor).
