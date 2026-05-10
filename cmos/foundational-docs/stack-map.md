# Stack Map — Forge Inside aquex.ai

**Status:** Active
**Date:** 2026-05-10
**Companion to:** [overview.md](overview.md)

This document maps OODS-Forge's role inside the aquex.ai design intelligence stack. Per-organ identity, current state, role, and contract surfaces with Forge.

---

## The Stack at a Glance

```
                        ┌─────────────────────────────┐
                        │     aquex.ai (front door)   │
                        │  consultancy + product hub  │
                        └─────────────┬───────────────┘
                                      │ markets
                                      ▼
   ┌────────────────────────────────────────────────────────────┐
   │                Design Intelligence Platform                │
   │                                                            │
   │   OBSERVE              CANONICALIZE         COMPOSE/EMIT   │
   │   ┌──────────┐         ┌──────────┐         ┌──────────┐   │
   │   │ Stage1   │ ──────► │ divergence-       │ │ OODS-     │   │
   │   │          │         │ inspector +       │ │ Forge     │   │
   │   │          │         │ concordance       │ │ (us)      │   │
   │   └──────────┘         └──────────┘         └────┬─────┘   │
   │                                                  │          │
   │                                       │          ▼          │
   │   GOVERN/DISTRIBUTE  ◄─────────────  ─┤          │          │
   │   ┌──────────────┐                    ▼          │          │
   │   │ semantic-    │              ┌──────────┐     │          │
   │   │ federation   │              │ MEASURE  │     │          │
   │   │ (Birch)      │              │ agent-   │ ◄───┤          │
   │   └──────────────┘              │ vitals   │     │          │
   │                                 └──────────┘     │          │
   │                                                  │          │
   │   COORDINATE/REMEMBER          ROUTE             │          │
   │   ┌──────────────┐              ┌──────────┐    │          │
   │   │ CMOS         │ ◄────────────┤ Aquex-   │ ◄──┘          │
   │   │              │              │ mcp      │                │
   │   └──────────────┘              └──────────┘                │
   │                                                            │
   │   RESEARCH SUBSTRATE                                       │
   │   ┌──────────────┐                                          │
   │   │ TraceLab +   │                                          │
   │   │ DeepSearch   │                                          │
   │   └──────────────┘                                          │
   └────────────────────────────────────────────────────────────┘
```

Forge sits at the synthesis point: evidence comes in (from observe + canonicalize), composition flows out (to govern + measure + route). The stack name being defined: **Design Intelligence Platform.**

---

## Per-Organ Detail

### OBSERVE: Stage1
- **Path:** `/Users/systemsystems/portfolio/Design-Tools/Stage1`
- **Identity:** `cmos://kneelinghorse/stage1` (also surfaces as `cmos://derek/stage1` historically)
- **Role:** Per-app evidence capture. DOM, computed styles, accessibility tree, network traces, API surface. ORCA inference produces objects/traits/actions/relationships.
- **Current state:** Wire contract v1.7.0 live (info_push 2026-04-18, additive drift_report). Bilateral with OODS at v1.2.4.
- **Contract with Forge:**
  - **Outgoing to Forge:** `reconciliation_report.json` (write-side feed for `map.apply`); rollup artifacts (`identity_graph.json`, `capability_rollup.json`, `object_rollup.json`); `action_mappings.json` flat verb-keyed array; `drift_report.json` (read-side, additive).
  - **Incoming from Forge:** registry snapshot for graceful degradation. `manifest.inputs.oods_registry_fetch` shape consumed as `pre-supplied | transport | empty-fallback`.
- **Key reference:** `Stage1/docs/contracts/stage1-oods-contract.md`

### CANONICALIZE: divergence-inspector + concordance
- **Path:** `/Users/systemsystems/portfolio/diverge-and-concord/` (lives on Mac Studio under user `Darryl`; can migrate or query via CMOS messages)
- **Identity:** services TBD (in testing); concordance is the online query service, divergence-inspector is the Stage1-clone batch pipeline.
- **Role:** Mine canonical shape families from thousands of sampled sites. Four-protocol resolution (syntactic/semantic/pragmatic/relational) preserves explainability. Divergence analysis surfaces drivers per stratum.
- **Current state:** End-to-end testing of first integrated runs (~2 weeks from stable shareable schema as of 2026-05-09). Renamed from "Cannon Compass."
- **Contract with Forge:**
  - **Outgoing to Forge:** versioned `semantic-manifest.json` per site (entities, typed relationships, syntactic aliases, pragmatic roles, evidence refs). Eventually shape families + divergence drivers as queryable artifacts.
  - **Incoming from Forge:** none in v0.1; later, possibly Forge's emitted Object Catalogs as canonical templates the divergence pipeline aligns against.
- **Forge integration:** mission **I1** (gated on schema stabilization). The most important integration mission once v0.1 ships.
- **Key reference:** `/Users/systemsystems/portfolio/diverge-and-concord/Cannon Compass (concordance) + Stage1+semantic-service.md`

### COMPOSE/EMIT: OODS-Forge (us)
- **Path:** `/Users/systemsystems/portfolio/Design-Tools/OODS-Foundry-mcp` (this repo)
- **Identity:** `cmos://derek/oods-foundry-mcp`
- **Role:** Schema-driven composition (`compose → validate → render → codegen → save`); multi-fidelity emission; reconciliation back to evidence corpus.
- **Current state:** V1 shipped at 100/100 (sprint-91); write-side reconciliation loop live (sprints 90–95). Now planning V2 + Position B/C work.
- **Outputs (today):** React/Vue/HTML codegen (× inline/tokens/tailwind); brand overlays; token artifacts; structured-data exports; reconciliation conflict artifacts.
- **Outputs (planned per fidelity ladder):** boxes-and-arrows render, wireframe render, A2UI-compatible runtime composition, plus future fidelity rungs.
- **Identity claim being formalized:** "first writable design-system MCP" (mission F3).

### GOVERN/DISTRIBUTE: semantic-federation
- **Path (reference):** `/Users/systemsystems/portfolio/Design-Tools/OODS-subscriptions-main`
- **Owner:** Birch Rankin
- **Role:** Cedar policy + federated schema composition. Capability-based access control over schemas/objects/operations.
- **Current state:** Reference implementation exists in OODS-subscriptions-main (Stripe subscriptions test fixtures). Production integration with Forge not yet wired.
- **Contract with Forge:**
  - **Forge → semantic-federation:** Object Catalog as the artifact governance is applied to. Capability surface from Forge tools is what Cedar policies gate.
  - **semantic-federation → Forge:** policy evaluation results, capability rule decisions, federated catalog views (Object Catalogs filtered/combined by policy).
- **Forge integration:** mission **I2** (Birch coordination). Decision **D4** open.
- **Key reference:** `OODS-subscriptions-main/docs/capability-rules.md`, `capability-evaluation.md`, `extending-contexts.md`, `architecture.md`

### COORDINATE/REMEMBER: CMOS
- **Paths:** `/Users/systemsystems/portfolio/cmos-mcp` (server), `/Users/systemsystems/portfolio/cmos-dashboard` (web)
- **Identity:** Available across all aquex projects; surfaced via `cmos_*` MCP tools.
- **Role:** Mission + decision graph. Cross-project messaging. Project memory. Sprint lifecycle.
- **Current state:** Live at `cmos.aquex.ai` (alongside `cmos-mcp.com`). Postgres + SQLite mirror (currently has sync drift; manual browser upload required to reconcile).
- **Contract with Forge:**
  - **Forge → CMOS:** sprint state, mission state, decisions, learnings, next-steps. CMOS messages cross-project (Stage1 acks, agent-vitals notifications, etc.).
  - **CMOS → Forge:** at session-start, full context payload (current sprint, pending missions, decisions, messages). Drives planning.
- **Forge integration:** built-in (CMOS is the planning fabric, not a separate integration).

### MEASURE: agent-vitals
- **Path:** `/Users/systemsystems/portfolio/metrics-protocols/agent-vitals`
- **Role:** Public pip package v1.12 — agent observability (latency, success/failure, drift detection at the agent layer).
- **Current state:** Public on PyPI. Used internally; external adoption growing.
- **Contract with Forge:**
  - **Forge → agent-vitals:** telemetry events from generated UIs in production; reconciliation run metrics; catalog drift signals.
  - **agent-vitals → Forge:** none direct. agent-vitals is a sink for Forge events, not a producer.
- **Forge integration:** mission **I3** (telemetry hooks). Quality-track adjacent (Q2 drift telemetry uses agent-vitals shape).
- **Companion:** `agent-vitals-bench` (internal benchmark harness), `metrics_and_protocols` (background IP / research credibility).

### ROUTE: Aquex-mcp
- **Path:** `/Users/systemsystems/portfolio/Aquex-mcp`
- **Role:** MCP tool router/aggregator. Production v1.0. Unifies tool surfaces from all aquex organs into one MCP endpoint.
- **Current state:** Production, in use.
- **Contract with Forge:**
  - **Forge → Aquex-mcp:** registers tool surfaces (`compose`, `validate`, `render`, `codegen`, `save`, `map.apply`, `map.create`, `registry.snapshot`, `tokens.build`, `brand.apply`, `pipeline`, `viz.compose`, etc.).
  - **Aquex-mcp → Forge:** routes external agent calls to Forge tools; provides consolidated capability surface.
- **Forge integration:** existing. Forge MCP server registers via Aquex-mcp.

### RESEARCH SUBSTRATE: TraceLab + DeepSearch
- **Path:** `/Users/systemsystems/portfolio/TraceLab` (UI), `/Users/systemsystems/portfolio/DeepSearch.alpha` (backend)
- **Role:** Cohort intelligence. Evidence corpus. Research projects (e.g., the OODS design research project `c20393d7-f0b8-4318-b0e6-e87cbd6d6375` and the Design Systems research project `ee394f56-8546-45af-9328-c178673511c7`).
- **Current state:** TraceLab live at `tracelab.aquex.ai`. DeepSearch.alpha is the backend worker.
- **Contract with Forge:**
  - **Forge → TraceLab:** Forge usage data (compose runs, codegen invocations, reconciliation outcomes) flows into the corpus over time as evidence for *meta*-research about how the design intelligence platform is being used.
  - **TraceLab → Forge:** research artifacts that ground positioning, roadmap, and architectural decisions (already used during the 2026-05-09 planning conversation).
- **Forge integration:** mission **I4** (evidence loop). Lower priority than I1/I2/I3 but cumulative.

### FRONT DOOR: aquex.ai
- **Path:** `/Users/systemsystems/portfolio/aquex.ai`
- **Identity:** `cmos://derek/aquex-ai`
- **Role:** Umbrella marketing site, consultancy front door, product hub. Currently markets TraceLab, CMOS, agent-vitals as flagship products.
- **Current state:** Astro 5 SSR + Tailwind v3 + OODS-Foundry Brand A. Sprint S9 (Cleanup + Performance) closing.
- **Contract with Forge:**
  - **Forge → aquex.ai:** Brand A tokens consumed by the site; Object Catalog (when published) becomes one of the named products.
  - **aquex.ai → Forge:** narrative positioning (the "Design Intelligence Platform" framing being defined now), ICP/positioning briefs that anchor public messaging.
- **Forge integration:** indirect — narrative downstream. Parallel "tell the story" work needed once first publishable Forge artifact is ready.

---

## Cross-Cutting Patterns

### MCP as the wire
Every organ either is an MCP server, exposes an MCP surface, or routes through Aquex-mcp. The platform is **MCP-native by default**. This is not a coincidence — it's the architectural commitment that makes the stack legible to agents.

### Bidirectional flow as the spine
The stack has an **observe → canonicalize → compose → govern → measure** flow, but it's also a **loop**: agent-vitals telemetry feeds back into TraceLab, TraceLab artifacts inform Forge planning, Forge usage feeds CMOS, Stage1/concordance evidence feeds Forge composition. **No organ is purely upstream or purely downstream.** Position C ("Reconciliation Engine as Category") is structurally a claim that this loop *is* the product.

### Cross-machine reality
Some organs (divergence-inspector, concordance) live on Mac Studio under user `Darryl`. Coordination across machines is via CMOS messages (`cmos_message` action). Three CMOS address shapes can appear in inboxes: `cmos://derek/...`, `cmos://darryl/...`, `cmos://kneelinghorse/...` — all resolve to Derek; they're machine/project identities not separate humans.

### Contract surfaces are the integration unit
For every organ-pair where Forge has an integration, there is (or will be) a named contract surface — versioned, AJV-validated, fixture-tested. This is the discipline that makes the stack hold together under change. Sprint-91's contract-gate pattern (pre-register schema shapes ahead of partner emitter readiness) is now an evergreen rule.

---

## What This Map Does Not Specify

- The exact API of each contract surface (lives in `technical/` break-out docs as those land).
- The order of integration missions I1–I4 (lives in [mission-graph.md](mission-graph.md)).
- The Cedar policy shape semantic-federation will impose on the Object Catalog (decision **D4**, pending Birch coordination).
- The runtime vs. build-time split (decision **D2** via render-abstraction memo).

---

*Authored 2026-05-10. Source: long-term roadmap planning conversation 2026-05-09 → 2026-05-10 + aquex.ai foundational docs scan.*
