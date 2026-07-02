# OODS Forge — Data Visualization as Flagship

> ⚠️ **2026-06-29 UPDATE — the 'NL→viz' hand-off in Phase 3 below was REVERTED.** `viz.fromText` + the `@anthropic-ai/sdk` Claude parser + the `nlviz/` module + the report-only `nlviz-accuracy` gate were removed (commit `a0e876e`) — a circular LLM-parsing-English-for-an-LLM-caller dependency with no consuming surface (decision #973). KEPT & live: the deterministic `viz.render` structured-`intent` mode (s131), the 13-type chart matrix, governed measures (s116/s117), dashboards (s113), the measure-narrative substrate (s129/s130). The s133 dimension registry was stashed, never committed. The flagship GOAL is being revisited (decision #974); treat the Phase-3 NL→viz framing below as historical.

**Status:** Strategy draft (planning, not building)
**Date:** 2026-06-15 · session PS-2026-06-15-001
**Grounded in:** live capability assessment (6-agent workflow + live `viz.compose` run, 2026-06-15) · TraceLab "Data Science & Visualization" corpus (44 missions, 40 docs) · TraceLab **DSV-045 frontier SOTA — landed 2026-06-16** → [`cmos/research/DSV-045-results(1).md`](../research/DSV-045-results(1).md) (verified working draft; citations fixed, Forge-mapping claims reconciled against code in its **§10b**)

**SOTA validation note (2026-06-16):** DSV-045 confirms the spine here — its headline rec ("deterministic core + LLM copilot; LLM *refines* a candidate set, never generates specs from scratch") matches Forge's shape. Its Forge-specific claims are inference; §10b corrections that affect this plan: (i) the §7 dashboard layout/interaction primitives **already exist** in `src/viz` → Phase 2 is mostly *expose + compose*, not build; (ii) the proposed §4 MCP tool signatures don't exist yet (only the placeholder `viz.compose`) → reinforces Phase 0; (iii) "semantic catalog" ≠ "metrics layer" — the Object Catalog is entity/trait *typing*, not governed measures/dimensions → that gap **is** Phase 3 (a Cube/Malloy/dbt/LookML importer is a route).

---

## 1. The thesis (the wedge)

Forge's flagship differentiator is **not "another chart library."** It is:

> **An agent turns semantically-typed data into a meaningful, linked, branded, accessible dashboard — deterministically, via MCP.**

Everyone can draw a bar chart. The SOTA generative-BI tools (LIDA, Tableau Pulse, ThoughtSpot, ChatBI-style) generate charts from *raw columns* with LLM guesswork — non-deterministic, ungrounded, off-brand. Forge uniquely holds **four assets that compose into something they don't have**:

1. A real **grammar-of-graphics engine** (normalized spec → **both** Vega-Lite + ECharts).
2. A **semantic Object Catalog** — data with *meaning* (typed entities, traits, roles, relationships), not bare columns.
3. **Agent-native MCP composition** — generation is a tool call, not a UI.
4. **Design-system tokens + multi-brand theming + WCAG-AA a11y** — output is on-brand and accessible by construction.

The boundary-push: **grounded, semantic, deterministic, agent-native generative visualization.** That is a defensible, differentiated offering on top of everything Forge already is.

---

## 2. Honest capability baseline (where we actually are, 2026-06-15)

The single most important finding: **we already built a strong viz engine — but it's dormant *and* unplugged from the agent surface.**

**① The engine — repo-root `src/viz/` (built Sprints 20–23; dormant since 2026-03-06):**
- Real GoG **normalized spec** (JSON-Schema-validated IR) → compiles to Vega-Lite **and** ECharts.
- **14 chart types** with passing tests: bar/line/area/scatter/heatmap + sankey/treemap/sunburst/force-graph + choropleth/bubble maps.
- A **25-pattern chart-suggestion engine** (`suggest-chart`): data-shape + intent → scored, ranked chart recommendations with human-readable rationale + layout/interaction/responsive recipes + scaffold codegen.
- Partial **dashboard cross-filtering** (linked-selection reducers, spatial/network widgets), WCAG-2.2-AA a11y, token theming, dual-renderer selection logic.
- ~36 test files, 100% pass. **This is SOTA-adjacent and real, not a toy.**

**② The agent surface — `packages/mcp-server/.../viz.compose` (what an agent gets today):**
- Verified by live run through the `:4466` bridge. It returns a **placeholder component scaffold** (`VizMarkPreview` + `VizMarkControls` with `xField/yField/colorField`, `data-chart-type:"bar"`).
- **6 chart types**, takes **field names but no data**, **renders nothing**, and **does not import `src/viz/` at all** (uses a separate thin `compose/viz-trait-resolver`).

**→ The powerful engine is completely disconnected from the MCP tool agents/consumers call.** Today an agent asking Forge for a chart gets a *placeholder*, not a chart.

| Capability | State |
|---|---|
| GoG spec → Vega-Lite + ECharts | ✅ Real, tested — in `src/viz`, **not agent-reachable** |
| 14 chart types incl. network/geo/hierarchy | ✅ Built/tested · ⚠️ hierarchy charts hit **unfixed B40** render blocker |
| Data-aware chart *recommendation* | 🟡 Real 25-pattern scorer, but keys off **schema shape only** (no cardinality/stats/semantic types) |
| Multi-chart **dashboard** + cross-filter | 🟡 Reducers/actions exist; **manual glue per dashboard**, no composition layer |
| **Agent/MCP surface** (`viz.compose`) | 🔴 Placeholder; **disconnected from the engine** |
| Data-connected / deployed | 🔴 None — dormant 3mo, no data-ingestion path |

**Implication:** the distance to the vision is mostly **integration + activation + a few new layers**, not greenfield. The expensive part (a credible engine) exists. That is a strong starting position.

---

## 3. SOTA landscape (frontier the strategy must reach toward)

Full cited backing in **TraceLab DSV-045** (in-flight). Working map of the frontier:

- **Automatic / data-aware recommendation:** Voyager/CompassQL (faceted recommendation), **Draco** (constraint-based, perceptual-effectiveness encoded as weighted constraints), perceptual-effectiveness models. *Gap vs us:* these are **data-aware** (profile types, cardinality, distributions, correlations) — our scorer is schema-shape-only.
- **LLM / agentic NL→viz & insight:** LIDA (data→goals→viz via LLM), NL2VIS (nvBench benchmarks), chart/insight/narrative generation, agentic exploration. *Lesson:* LLM-direct viz is fast but **non-deterministic and error-prone**; the winning pattern is **LLM proposes intent → deterministic engine renders** (exactly Forge's natural shape).
- **Semantic / metrics layers (headless BI):** Cube, Malloy, dbt MetricFlow, LookML. Generation grounded in a **semantic model** (defined metrics/dimensions/joins) is *trustworthy*; generation from raw columns is guesswork. *This is the Object-Catalog-as-semantic-layer play.*
- **Dashboard composition + decision-centric design:** declarative linked-interaction frameworks; "decision-centric" dashboards (KPIs + anomalies + actions, not chart dumps) — already in our DSV-020 corpus.

**Achievable-today vs frontier:** reconnect + data-aware recommendation + linked dashboards + semantic grounding are **achievable**. Autonomous agentic exploration, robust insight/anomaly narration, and rigorous "did the viz answer the question?" evaluation are **frontier** — real but harder.

---

## 4. Strategy — start with reach, build, polish, push as far as it goes

Sequenced per Derek's directive ("start with the things in our reach… build and polish and push it as far as it will go"). Each phase is independently valuable and unlocks the next.

**Phase 0 — Reconnect & reactivate (highest leverage, in reach).**
Wire `src/viz` engine → MCP. A real `viz.compose`/`viz.render` that takes **data + intent → suggestion engine → normalized spec → Vega-Lite/ECharts → returns a genuinely renderable spec (+ HTML)**. Fix **B40**. Close the spec→component gap. *Outcome: agents generate real charts via Forge for the first time.* This is the unlock; everything else builds on it.

**Phase 1 — Data-aware intelligence (where SOTA lives).**
Add real **data profiling** (types, cardinality, distributions, temporal/geo detection, correlation/skew/outliers) feeding the recommender → move from schema-shape heuristics toward **Voyager/Draco-class data-aware recommendation**. *Outcome: Forge picks the* right *chart from the actual data, defensibly.*

**Phase 2 — Dashboard composition + linking (the BI surface).**
Promote the cross-filter primitives into a **declarative, agent-composable dashboard spec** + auto-layout + linked selection/brushing + **decision-centric** patterns (KPIs, anomalies). *Outcome: an agent composes a coherent linked multi-chart dashboard, not one chart.*

**Phase 3 — Semantic grounding + NL (the differentiator).**
Treat the **Object Catalog as a semantic layer** (metrics, dimensions, relationships) so generation is grounded in *meaning*, not guessed columns; add **NL→viz** (agent/user asks in language → grounded chart/dashboard) + narrative/insight summaries. *Outcome: "a new kind of BI" — semantically grounded, deterministic, agent-native.*

**Phase 4 — Push the boundary (SOTA+).**
Agentic exploration (agent autonomously profiles data → proposes a dashboard), insight/anomaly detection, uncertainty viz (DSV-023), data-story narration, and an **evaluation harness** (does the generated viz actually answer the question?).

**Cross-cutting moat (already strong — keep as first-class):**
- **Determinism** — Forge's Q1 discipline applied to viz generation = *reproducible* dashboards. A real differentiator vs flaky LLM viz.
- **Brand + tokens + a11y** — on-brand, accessible output by construction.

---

## 5. Open questions / decisions to resolve before building

1. **Where does data come from?** `viz.compose` currently takes field *names*, not rows. The agent path needs a data-ingestion contract (inline rows? a data ref? a Stage1/catalog-backed dataset?). **This is the critical Phase-0 design decision.**
2. **One engine or two?** Reconcile repo-root `src/viz` (React/TS, design-system) with `packages/mcp-server` (headless MCP). Does the MCP tool import `src/viz` directly, or do we extract a headless core? (Forge is headless-first — likely extract the spec+adapters+recommender as a server-usable core.)
3. **Output contract:** does the agent get a Vega-Lite/ECharts spec, rendered HTML/SVG, or both (à la the `repl.render` compact/full pattern)?
4. **Scope of "BI":** decision-centric analytics dashboards vs embedded chart API vs exploratory tool — pick the first beachhead.
5. **B40 + dormancy debt:** confirm the actual current state of the B40 blocker and the spec→component gap before estimating Phase 0.

---

## 6. Sizing note

This is **multi-sprint**, not one. Phase 0 alone (reconnect + B40 + data contract) is a meaty sprint. Recommend: a scoping/decision-memo mission first (resolve §5.1–5.3), then Phase 0 as the first build sprint. DSV-045 SOTA + the existing DSV corpus feed the design.
