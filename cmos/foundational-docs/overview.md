# OODS-Forge — Overall Plan

**Status:** Active — canonical planning entry point
**Date:** 2026-05-10
**Repository:** [github.com/kneelinghorse/OODS-Forge](https://github.com/kneelinghorse/OODS-Forge) (private)
**Public predecessor:** [github.com/kneelinghorse/OODS-Foundry-mcp](https://github.com/kneelinghorse/OODS-Foundry-mcp) (frozen as v1)

---

## TL;DR

OODS-Forge is the **synthesis/composition organ** in the aquex.ai design intelligence stack — the part where evidence-backed shape families become composable, agent-operable, multi-fidelity design systems with reconciliation back into the evidence corpus. The strategic bet is that the layer *above* components is a real and currently underclaimed category, and the aquex portfolio (Stage1, divergence-inspector + concordance, OODS-Forge, semantic-federation, CMOS, agent-vitals, Aquex-mcp, TraceLab) collectively ships the first **Design Intelligence Platform**: observe → canonicalize → compose → govern → measure, all addressable through MCP.

Forge's job inside that platform is to publish an **Object Catalog** spec, render it across a **fidelity ladder** (boxes-and-arrows → wireframe → branded mockup → production code → runtime composition), expose itself as the field's first **bidirectional MCP** for design systems, and consume canonical shape families from concordance to ground its schemas in real-world evidence rather than theory.

The plan is captured as a mission graph with four tracks, five named decision points, a set of quality bars carried forward from sprints 90–95, and no calendar. The unit of progress is sessions; quality and scalability are the constraints.

---

## Strategic Position

We are **all-in on Position B+C** as named in the long-term planning conversation 2026-05-09:

- **Position B:** Publish the OODS Object Catalog as a stable artifact format that A2UI hosts, MCP servers, and other design tools can consume. Forge becomes the reference implementation for the layer above components.
- **Position C:** Ship the Design Intelligence Platform — define a category. The Stage1 → OODS reconciliation pattern (observed evidence + ConfidenceDecomposition + candidate mappings + variant reconciliation) generalized into infrastructure that any team with usage telemetry can feed.

These compose. A (operator engine, V2 axes) is contained in B is contained in C. Each step makes the next legible.

**Open vs. proprietary posture:** Eventually open. Currently smart. We don't pre-commit to a public-vs-private boundary or a publish trigger; we get it working, prove it works, and make sensible publication choices once we know what's load-bearing. Decision deferred (see [decision-points.md → D5](decision-points.md)).

---

## Forge's Role in the aquex.ai Stack

aquex.ai is the umbrella brand for an AI consultancy + product company (founders: Derek + Birch Rankin). The portfolio collectively builds the design intelligence platform. Each project is one organ:

| Layer | Project | Role |
|---|---|---|
| Observe (per-app) | Stage1 | Capture evidence from running apps; ORCA inference; design fingerprinting MCP |
| Observe (canonical) | divergence-inspector + concordance | Mine canonical shape families from thousands of sites; divergence analysis; semantic protocol service |
| **Compose / emit** | **OODS-Forge (this repo)** | **Schema-driven composition → multi-fidelity emission → reconciliation back to evidence** |
| Govern / distribute | semantic-federation (Birch) | Cedar policy + federated schema composition |
| Coordinate / remember | CMOS | Mission + decision graph; cross-project messaging |
| Measure | agent-vitals | Public pip package; agent observability |
| Route | Aquex-mcp | MCP tool router/aggregator |
| Research substrate | TraceLab + DeepSearch | Cohort intelligence; evidence corpus |
| Front door | aquex.ai | Consultancy + product hub |

Forge **depends on** concordance (shape families, divergence-driver tagging). Forge **feeds** CMOS (review-queue next-actions), agent-vitals (telemetry events), TraceLab (usage corpus). Forge **integrates with** semantic-federation when Object Catalogs need governance/distribution. Forge **surfaces through** Aquex-mcp.

See [stack-map.md](stack-map.md) for the integration shapes per organ and the contract surfaces between them.

---

## The Canonical-vs-Families Question, Resolved

The architectural fork between "one canonical shape per concept" and "shape families with discriminators" is **resolved empirically by concordance.** The Cannon Compass research (now `divergence-inspector` + `concordance`, in end-to-end testing) mines thousands of sampled sites and lets shape families emerge from data, with divergence drivers tagged per stratum. Forge's existing `projection_variants[]` + `ConfidenceDecomposition` shape on the Stage1 reconciliation side is structurally aligned with this; the integration just hasn't been wired yet.

**Architectural call:** Forge plans assume **shape families with discriminators, backed by evidence-refs that trace to concordance manifests.** No theoretical canon. No flat single-shape schemas. Variant + evidence + confidence is the spine.

See [technical/concordance-integration.md](technical/concordance-integration.md) (forthcoming) for the consumer-side contract direction.

---

## The Four Mission Tracks

The work falls into four tracks with dependencies. Full graph in [mission-graph.md](mission-graph.md).

### Foundation (must come first; in dependency order)
- **F1 — Object Catalog spec v0.1** — *the central artifact.* What a published Object Catalog looks like as JSON Schema + TypeScript types. Consumed by A2UI hosts, semantic-federation, fidelity emitters, concordance ingestion. Spine.
- **F2 — Concordance ingestion contract** — sister to Stage1's reconciliation contract. Forge consumes `semantic-manifest.json` from concordance to ground catalog generation in evidence.
- **F3 — Bidirectional MCP framing** — formalize today's `map.apply` / `map.create` / `registry.snapshot` as a coherent public claim: the field's first writable design-system MCP server.

### Capability (parallel after Foundation)
- **C1 — Boxes-and-arrows render** (first non-prescriptive emitter; proves the multi-fidelity claim)
- **C2 — Wireframe render** (second non-prescriptive emitter)
- **C3 — Operator review/recovery workflows** (V2 axis #2)
- **C4 — Playground operator DX upgrade** (V2 axis #3)
- **C5 — Codegen for evidence-backed flows** (V2 axis #4 — review queue / conflict detail / apply summary surfaces)
- **C6 — Registry knowledge model depth** (V2 axis #5 — `disambiguation_decisions`, `preferred_term`, `capability`, `projection_variants` round-trip)

### Integration (gated on partner readiness)
- **I1 — Concordance live integration** (when v0.1 schema stabilizes; ~currently testing end-to-end on Mac Studio)
- **I2 — semantic-federation integration** (Cedar policy + federated catalog distribution; reference: `/Design-Tools/OODS-subscriptions-main`; Birch coordination)
- **I3 — agent-vitals telemetry hooks** (generated UI events flow back to observability)
- **I4 — TraceLab evidence loop** (Forge usage data feeds corpus)

### Quality (continuous; gates releases)
- **Q1 — Determinism + release confidence** (V2 axis #7 — real artifacts at 100/500/1000 mapping states; full parallel execution)
- **Q2 — Drift telemetry** (V2 axis #6 — every write run emits latency, bucket counts, schema version, drift markers; ≥3 historical runs comparable)
- **Q3 — Real-data E2E gates per output surface** — extends the S80 lesson to every new fidelity emitter and every catalog contract surface

---

## Decision Register

Five named forks where being wrong is expensive enough to warrant a research-shaped mission *before* an implementation-shaped one. Status tracked in [decision-points.md](decision-points.md); individual memos land in [decisions/](decisions/).

| # | Decision | Why expensive if wrong | Status |
|---|---|---|---|
| **D1** | Object Catalog schema shape | Every downstream consumer keys off this; migration cost is high | Needs memo |
| **D2** | Multi-fidelity render abstraction | Per-fidelity emitter duplicates logic; shared "presentation graph" pays off across all fidelities but is harder to design | Needs memo |
| **D3** | Forge ↔ concordance relationship (consumer / peer / embedded) | Each option has different deployment, versioning, scaling implications; lock-in risk | Needs memo |
| **D4** | Forge ↔ semantic-federation integration shape (Cedar at write-side / catalog-distribution / both) | Wrong choice = governance leaks or governance everywhere | Pending Birch coordination |
| **D5** | Public-vs-private spec boundary mechanics | What's open OODS spec, what's proprietary Forge engine, what's aquex platform; dual-license? open spec + closed reference impl? | Deferred until working system + named milestone |

---

## Quality Bars (continuous, evergreen)

Carrying forward what worked across sprints 90–95, plus what the new scope demands. These are non-negotiable conventions.

- **Real-data E2E gates** for every output surface. No surface ships green on synthetic-only fixtures. (S80 lesson.)
- **Per-mission commits** at mission-complete time, not sprint-end. The retro-split failure mode is named in MEMORY.md and the +1 closeout convention exists to prevent it.
- **+1 closeout mission** every sprint with concrete deliverables (commit verification, branch push, counterparty ack if cross-project, session capture+complete, MEMORY.md update, closeout report). Standing convention since sprint-92.
- **N≤5 mission posture** as default; flex to N=3 occasionally to test posture flexibility (validated in sprint-95).
- **Bidirectional integration tests** for every Catalog contract surface. The writable-MCP claim depends on this.
- **Decision memos before implementation** for D1–D5. Memo costs 1 session; rework from a wrong call costs 5–15.
- **Pre-register schema shapes** ahead of partner emitter readiness. The contract-gate pattern (sprint-91) is now an evergreen rule.
- **External E2E validation** before declaring scores. Internal scoring drifts from real consumer shape. Always validate against external production-shape fixtures.

Full list in [quality-bars.md](quality-bars.md) (forthcoming break-out).

---

## Planning Cadence

**Sessions, not calendar.** The unit of progress is how many sessions we run and how good the plans guiding them are. Calendar dates don't bind. Quality and scalability are the constraints.

Implications:
- Pacing tradeoffs are framed as *"this adds N sessions to the path"*, not *"this delays delivery by W weeks."*
- Decision memos are research-shaped missions; they cost sessions but save many more.
- Sprint cadence numbers are descriptive (orientation), not prescriptive (commitment).
- Being wrong is the only thing that costs time. Quality bars are load-bearing because they prevent rework.

This is captured as a feedback memory; future sessions inherit it.

---

## Document Index

This folder is the planning canon. Read in this order:

| Doc | Scope |
|---|---|
| **overview.md** (this doc) | Strategic frame; mission graph summary; pointers |
| [strategic-position.md](strategic-position.md) | The B+C bet; field reading; what we're NOT building |
| [stack-map.md](stack-map.md) | aquex stack organs; integration shapes; contract surfaces |
| [mission-graph.md](mission-graph.md) | Full mission graph with dependencies; track-by-track detail |
| [decision-points.md](decision-points.md) | D1–D5 register; status; memo links |
| [quality-bars.md](quality-bars.md) | Conventions enforced continuously |
| [glossary.md](glossary.md) | Defined terms (Object Catalog, Fidelity Ladder, etc.) |
| [decisions/](decisions/) | Individual decision memos as they land |
| [technical/](technical/) | Technical specs (object-catalog, fidelity-ladder, bidirectional-mcp, concordance-integration, federation-integration) |
| [roadmap/](roadmap/) | Near / mid / far horizon mission graphs and sprint sketches |

---

## Open Questions / Deferred

Captured here so they don't get lost; resolved as planning progresses or as upstream context clarifies.

1. **Concordance schema stabilization timing** — currently in end-to-end testing, ~2 weeks from a stable shareable schema. Forge's concordance integration (I1) paces to this signal. CMOS message to user `Darryl` (Mac Studio) is the canonical channel for state intel.
2. **Birch coordination on D4** — semantic-federation integration shape is ultimately a two-founder decision. Forge drives the integration solo for now, getting feedback as we go. Reference repo for shape: `/Users/systemsystems/portfolio/Design-Tools/OODS-subscriptions-main`.
3. **aquex.ai narrative for design intelligence** — the public positioning frame for "Design Intelligence Platform" doesn't exist yet on aquex.ai's site. Currently being defined inside Forge planning. May need a parallel aquex-side sprint to land the public story alongside Forge's first publishable artifact.
4. **The runtime engine question** — when do we cross from build-time codegen to runtime composition? A2UI's host-renders pattern is runtime. Forge's emit-then-deploy pattern is build-time. The fidelity ladder accommodates both, but there's an architectural call about where the *primary* surface lives. Resolved implicitly via D2 (render abstraction) once that memo lands.
5. **Lower-fidelity tooling depth** — boxes-and-arrows, wireframes, IA diagrams, user flows are all fidelity-ladder candidates. Order and depth of which to ship first is a Capability-track planning call once D1 lands.

---

## Glossary (key terms)

Full glossary in [glossary.md](glossary.md). Critical terms named here for orientation:

- **Object Catalog** — Forge's published artifact. Lists Objects (User, Product, Subscription, etc.) with traits, presentations, evidence-refs, projection-variants. The contract A2UI hosts and semantic-federation consume.
- **Fidelity Ladder** — Multi-fidelity render model. The same Object Catalog renders as boxes-and-arrows, wireframes, branded mockups, production code, or runtime composition.
- **Bidirectional MCP** — Read+write MCP surface. Read: catalog, schemas, mappings. Write: accept evidence, emit reconciled deltas. Today's `map.apply`/`map.create`/`registry.snapshot` are the seed.
- **Shape Family** — A set of related Object schemas with discriminators, backed by evidence from concordance. Replaces canonical-single-shape thinking.
- **Reconciliation** — The process of consuming external usage signals (Stage1 fingerprints, concordance manifests, agent-vitals telemetry) and emitting structured deltas to the Object Catalog with confidence scoring.
- **Design Intelligence Platform** — The category aquex.ai is defining: observe → canonicalize → compose → govern → measure, all addressable through MCP.

---

## What This Document Is Not

- Not a sprint plan. Sprint-96 missions are derived from this in [roadmap/near.md](roadmap/near.md).
- Not a marketing positioning document. The public narrative is downstream of this; this is internal canon.
- Not a commitment to specific calendar dates. Pace is sessions; this doc evolves as sessions land.
- Not a frozen artifact. Update via direct edit + commit on `OODS-pro`. Decision memo updates land separately under `decisions/`.

---

*Last updated: 2026-05-10. Authored from the long-term roadmap planning conversation 2026-05-09 → 2026-05-10. Supersedes all previously archived foundational docs in `_archive/`.*
