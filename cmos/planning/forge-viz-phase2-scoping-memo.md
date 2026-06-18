# Forge Viz — Phase 2 (Dashboards) Scoping Memo

**Status:** Decision memo (memo-only; no code)
**Date:** 2026-06-17
**Author:** s112-m05 (Sprint-112 build session)
**Companion to:** [forge-viz-flagship-strategy.md](forge-viz-flagship-strategy.md) §2/§4/§5 · [forge-viz-phase0-scoping-memo.md](forge-viz-phase0-scoping-memo.md)
**Purpose:** De-risk Phase 2 so s113 (the first dashboard build sprint) opens clean. Resolve the two open forks, give an HONEST expose-vs-build inventory grounded in the live tree, and draft a realistic s113 mission slate sized as **BUILD**.

---

## 0. TL;DR

- **Phase 2 is mostly BUILD, not "expose + compose."** The strategy's optimism (DSV-045 §10b(i): "the §7 dashboard layout/interaction primitives already exist in `src/viz`") does not survive a live grep. The *only* cross-filter/dashboard substrate that exists is **spatial-only**, React-bound, and not in the headless engine. There is **no** generic dashboard spec, **no** multi-chart auto-layout, **no** chart-agnostic linked selection, and **no** KPI/anomaly layer.
- **Fork A (BI beachhead) → decision-centric analytics dashboards.** The embedded-chart-API beachhead is already effectively covered by single-chart `viz.render`; the exploratory tool is Phase-4-shaped. Decision-centric linked dashboards are the thesis's actual wedge. *(Open question for Derek: confirm the first concrete template — see §3.)*
- **Fork B (envelope) → keep (A) bare chart specs at the chart level; add a NEW declarative `DashboardSpec` that COMPOSES them; defer the UiSchema wrapper (B) until a Forge-view embedding actually needs it.** Don't retrofit charts into UiSchema slots to get dashboards.
- **s113 is a meaty multi-mission BUILD sprint** (dashboard IR + headless auto-layout + `dashboard.render` MCP surface + headless linked-selection/KPI + determinism goldens + closeout), additive on the `@oods/viz-core` beachhead, holding the depth-not-breadth posture.

---

## 1. Where Phase 1 left us (the launchpad)

After s109–s112, the headless `@oods/viz-core` + `viz.render` surface is real and strong **at the single-chart level**:

- **11 reachable chart types** through `viz.render`: 5 tabular (bar/line/area/scatter/heatmap) + 4 network/hierarchy (treemap/sunburst/sankey/force_graph, s111) + 2 geo (choropleth/bubble_map, s112). Each returns a renderable, AJV-valid, **deterministic** spec.
- A **data-aware recommender** (suggest mode) that picks a chart from real field profiles.
- **Determinism** as an enforced property (golden options + run-twice byte-identity + scale-tier synth at 100/500/1000, wired into CI).
- **Tokens + a11y** synthesized per chart.

Everything above is **per-chart**. Phase 2 is the jump from *a chart* to *a coherent, linked, decision-centric dashboard*.

---

## 2. Honest expose-vs-build inventory (grounded against the live tree, 2026-06-17)

### 2a. What EXISTS and can be exposed/reused

| Capability | Where | Reusable for Phase 2? |
|---|---|---|
| 11 chart types as deterministic specs | `@oods/viz-core` + `viz.render` | **Yes** — panels are these specs. |
| Data-aware recommender | `viz-core/src/patterns/*`, `builder/spec-builder.ts` | **Yes** — per-panel chart selection. |
| GoG **chart-internal** layout traits (`LayoutFacet`/`LayoutLayer`/`LayoutConcat`) | `viz-core/src/spec/normalized-viz-spec.*` | **Partially** — these compose marks *within one chart spec* (small multiples / layered / concat). They are **NOT** a multi-chart dashboard layout. Do not over-claim them. |
| Spatial cross-filter substrate | `src/viz/interactions/spatial-filter-reducer.ts` (821 B), `spatial-filter-actions.ts` (6 KB), `src/viz/contexts/dashboard-spatial-context.tsx` (3.4 KB) | **As a MODEL only** — a React reducer for *spatial region* selection. Not generic, not headless, not in viz-core. It is the design template for the generic linked-selection reducer, not a thing to expose as-is. |
| Determinism / tokens / a11y discipline | viz-core + CI | **Yes** — extend the same gates to the dashboard surface. |

### 2b. What must be BUILT (does NOT exist today)

A live grep for `dashboard-spec | auto-layout | linked-selection | cross-chart | kpi | anomaly` across `src/viz`, `src/types/viz`, and `packages/viz-core/src` returns **nothing** except the *chart-pattern name* "KPI Sparkline Grid" in the pattern registry (a chart, not a KPI tile). Concretely missing:

1. **A declarative `DashboardSpec` IR** — panels (each referencing a chart spec / data branch) + a layout block + a links block. *None.*
2. **Multi-chart auto-layout** — deterministic grid/responsive placement of N panels. `src/viz/layout/` contains exactly one file: `keyboard-nav.ts`. There is no dashboard layout engine.
3. **Chart-agnostic linked selection / cross-filter** — selection on panel A filtering panel B's data, across heterogeneous chart types. Only the **spatial-only** reducer exists, and it is React-bound (`*.tsx` + context), not headless.
4. **A decision-centric KPI / metric / anomaly layer** — KPI tiles (value + delta + spark), threshold/anomaly flags. *None.*
5. **A headless dashboard adapter** — `DashboardSpec` → a composed multi-panel renderable payload (per-panel options + layout). *None.*
6. **A `dashboard.render` MCP surface** — the agent-facing tool that takes a `DashboardSpec` and returns the composed payload. *None* (only single-chart `viz.render`).

**Verdict:** Phase 2 is **~80% build, ~20% expose**. The expose part is "panels are existing chart specs"; everything that makes it a *dashboard* (spec, layout, linking, KPIs, the headless adapter, the MCP tool) is greenfield. Plan and size it as BUILD.

---

## 3. Fork A — BI beachhead scope (§5.4)

The strategy lists three candidate beachheads. Grounded assessment:

- **Embedded chart API** (charts other apps embed) — **already effectively shipped.** `viz.render` returns a single renderable chart spec the consumer embeds. This is not a new beachhead; it's the Phase-0/1 surface.
- **Exploratory tool** (Voyager-style faceted exploration) — **Phase-4 shaped.** Needs agentic exploration + interaction loops + an eval harness. Too far for the next beachhead.
- **Decision-centric analytics dashboards** (a small set of linked charts + KPIs that answer a specific question) — **the right first beachhead.** It is the thesis verbatim ("an agent composes a coherent linked multi-chart dashboard, not one chart"), it consumes the 11 unlocked types + the recommender + the determinism moat, and it is the natural next rung above single-chart `viz.render`.

**Recommendation (default):** **Decision-centric analytics dashboards.** Build the smallest end-to-end vertical: an agent supplies data + a goal, gets back a composed, linked, branded, deterministic multi-panel dashboard payload.

**Open question for Derek (resolve at s113 planning, not blocking this memo):** which **concrete first template**?
- (i) a fixed **"metric overview"** shape — a KPI row + a trend + a breakdown + (optionally) a geo panel — opinionated, fast to ship, easy to golden; **recommended first**; or
- (ii) a **general dashboard composer** — the agent declares arbitrary panels + links — more powerful, larger blast radius, harder to make deterministic/legible.

Default: ship (i) as the s113 vertical (it exercises every new primitive — spec, layout, linking, KPI — on a bounded shape), then generalize toward (ii) in a follow-on sprint.

---

## 4. Fork B — output envelope (spec-as-payload A vs UiSchema-wrapper B)

The phase0 memo chose **(A) spec-as-payload** for Phase 0 and explicitly deferred the **(B) UiSchema wrapper** until "Phase 2 dashboard composition actually needs it." We are now at that decision point.

**Resolution:** the fork is a false binary at the dashboard level. The right shape is a **third option (C): a dedicated declarative `DashboardSpec` that COMPOSES bare (A) chart specs as panels.**

- **Keep (A) at the chart level.** Individual charts stay bare, deterministic specs — the contract `viz.render` already ships. Do not regress it.
- **Add a dashboard envelope** — `DashboardSpec` references chart specs/data branches as panels and adds `layout` + `links` + KPI metadata. The composed `dashboard.render` payload carries per-panel renderable options + the layout. This is what Phase 2 needs and it sits *above* the chart contract, not inside it.
- **Defer (B) the UiSchema wrapper** until a real Forge-**view** embedding needs it — i.e. when `design.compose` must slot a whole dashboard into a Forge UI alongside non-chart components (a Workbench concern). Building the UiSchema wrapper now would pay for component-system parity before there is a consumer; YAGNI per the phase0 reasoning, still valid.

**Open question for Derek (non-blocking):** should `DashboardSpec` *also* be emittable as a UiSchema for `design.compose` parity from day one? Default: **no** — keep the dashboard spec native and headless-first; add a UiSchema projection when the Workbench view path materializes (Phase 2.5/3).

---

## 5. Candidate s113 mission slate (BUILD, additive on `@oods/viz-core`)

Holds the depth-not-breadth posture (the sprint-101 over-scope guard): build ONE end-to-end decision-centric vertical, not the whole dashboard surface. Additive on the beachhead (zero src/ rewire — the ~137-site consumer rewire stays deferred). Mirrors the s109–s112 cadence (headless engine → MCP surface → determinism gates → closeout).

- **s113-m01 — Dashboard IR (BUILD, L).** A declarative `DashboardSpec` in `viz-core/src/spec/` (panels[] referencing chart data branches + a `layout` block + a `links` block + optional KPI panels), with an AJV schema + validator + unit tests. Headless, deterministic, decoupled (panels carry the existing per-type data branches).
- **s113-m02 — Headless auto-layout (BUILD, M).** A deterministic grid/responsive layout resolver (panel → {x,y,w,h}) in viz-core — code-point-ordered, seeded, no `Date.now`/`Math.random`. Goldenable option output.
- **s113-m03 — `dashboard.render` MCP surface (BUILD, M).** A new tool: `DashboardSpec` (panels = the 11 existing chart-type branches) → a composed multi-panel payload (per-panel `echartsSpec`/Vega + resolved layout), AJV-valid, deterministic. Reuses `viz.render` per panel (compose, don't fork). Schema + `generated.ts` regen + handler + live proof, exactly the s112-m02 pattern.
- **s113-m04 — Headless linked-selection + KPI (BUILD, L).** Generalize the spatial-filter reducer into a chart-agnostic, headless `links` resolver (a selection on panel A produces a deterministic filtered state for panel B) + a decision-centric **KPI panel** primitive (value + delta + sparkline + optional threshold/anomaly flag). This is the "decision-centric" half of the thesis.
- **s113-m05 — Determinism + fidelity goldens for the dashboard surface (M).** Composed-option goldens (run-twice byte-identity), a seeded multi-panel synth at scale, render-fidelity goldens at the `dashboard.render` boundary, CI wiring — the s110/s111/s112 determinism cadence.
- **s113-m06 — Closeout** (commit boundary + the #740 frozen-lockfile install + root typecheck + test:scale + changed-package dist rebuild + link the build session).

**Sizing:** this is a full, code-heavy sprint (one L mission + several M/L). It is **not** "mostly expose." Reuse is real (panels are existing specs; the spatial reducer is a design model; the determinism harness is established), but the dashboard spec, layout engine, linked-selection model, KPI layer, headless adapter, and MCP tool are all greenfield.

### Deferred boundary for s113 (hold the line)
- The general dashboard composer (Fork A option ii) — after the fixed-template vertical lands.
- The UiSchema dashboard wrapper (Fork B option B) — until a Forge-view embedding needs it.
- NL→viz + semantic-layer (metrics) grounding — **Phase 3.**
- Agentic exploration / insight / uncertainty / eval harness — **Phase 4.**
- Server-side SSR rendering — still deferred (consumer renders the composed payload).
- The ~137-site/46-file consumer shim rewire + `src/viz` shim deletion — still deferred (the sprint-101 trap).

---

## 6. Decisions this memo asks Derek to ratify at s113 planning

1. **BI beachhead = decision-centric analytics dashboards** (default; §3). Confirm.
2. **First template = fixed "metric overview"** (KPI row + trend + breakdown + optional geo), generalize later (§3 open question).
3. **Envelope = bare (A) charts composed by a new `DashboardSpec` (option C); defer the UiSchema wrapper (B)** (§4). Confirm, incl. the "no UiSchema projection yet" default.
4. **s113 is sized as a full BUILD sprint** (§5), additive on `@oods/viz-core`, deferred boundary held.
