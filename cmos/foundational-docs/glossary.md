# Glossary

**Status:** Active
**Date:** 2026-05-10
**Companion to:** [overview.md](overview.md)

Defined terms for the OODS-Forge planning canon. New terms get added here as they emerge in technical specs and decision memos.

---

## Strategic / Positioning Terms

### Design Intelligence Platform
The category aquex.ai is defining: **observe → canonicalize → compose → govern → measure**, all addressable through MCP. The umbrella term for the multi-organ stack (Stage1, divergence-inspector + concordance, OODS-Forge, semantic-federation, CMOS, agent-vitals, Aquex-mcp, TraceLab). Currently being narrated; not yet a public-facing term.

### Position A / B / C
The three positionings named in the 2026-05-09 long-term planning conversation:
- **A** = Operator Engine (V2 axes, internal best-in-class tool)
- **B** = Object Catalog (publish the catalog format as a stable artifact A2UI hosts and other tools consume)
- **C** = Reconciliation Engine as Category (define a new category; bidirectional pattern as infrastructure)

A ⊂ B ⊂ C. Strategic bet is B+C with A contained.

### Open Core / Open Eventually
Posture for OODS-Forge: eventually open, currently smart. No premature commitments to public release. Trigger conditions for publishing get sketched in decision memo D5.

---

## Architectural Terms

### Object Catalog
**The central artifact Forge produces.** A versioned, schema-validated, JSON-Schema-typed list of Objects (User, Product, Subscription, Invoice, etc.) with their traits, presentations, evidence-refs, projection variants, and relationships. The contract A2UI hosts consume; the contract semantic-federation governs; the contract fidelity emitters render from. Detailed in F1 mission (see [mission-graph.md](mission-graph.md)) and decision memo D1 (see [decision-points.md](decision-points.md)).

### Fidelity Ladder
The multi-fidelity render model. The same Object Catalog renders across fidelities:
1. **Boxes-and-arrows** — annotated rectangles, IA diagrams, flow boards
2. **Wireframe** — gray-box layouts with structural fidelity
3. **Branded mockup** — full visual via brand overlays (currently shipped)
4. **Production component** — codegen output (currently shipped: React/Vue/HTML × inline/tokens/tailwind)
5. **Runtime composition** — A2UI-style declarative tree the host renders (Position B/C destination)

The render abstraction across fidelities is decision D2.

### Bidirectional Object Catalog MCP
The framing for Forge as a writable Object Catalog MCP with reconciliation semantics. *Reads*: catalog, schemas, mappings. *Writes*: accept evidence (Stage1 reconciliation reports, concordance manifests, agent-vitals telemetry), emit reconciled deltas. Today's write seeds are `map.apply`, `map.create`, `map.update`, and `map.delete`; `registry.snapshot` and catalog/object tools are read surfaces. F3 mission productizes the public claim.

### Shape Family
A set of related Object schemas with discriminators, backed by evidence-refs from concordance. Replaces single-canonical-shape thinking. Already implicit in the existing `projection_variants[]` pattern; D1 makes it explicit in the Object Catalog.

### Reconciliation
The process of consuming external usage signals (Stage1 fingerprints, concordance manifests, agent-vitals telemetry) and emitting structured deltas to the Object Catalog with confidence scoring. Bidirectional by design — observation → schema delta → reflective improvement. The differentiator vs. observability tools that measure adoption only.

### Contract Surface
A versioned, AJV-validated, fixture-tested boundary between two organs. Each integration in the stack has at least one. Examples: `reconciliation_report.json` (Stage1 → Forge), `semantic-manifest.json` (concordance → Forge), Object Catalog (Forge → A2UI hosts), Cedar policy interface (Forge ↔ semantic-federation).

### Evidence Ref
A pointer back to the original observation that produced a particular schema element. Threaded through ORCA candidates, projection variants, concordance manifests, and (planned) Object Catalog entries. The audit trail that makes the bidirectional reconciliation pattern legible.

### Confidence Decomposition
Stage1 v1.6.0+ shape that breaks a single confidence score into named contributing signals (with hints), surfaced in `capability_rollup` and downstream. Forge's normalizer unwraps these into scalar `.total` while preserving signal detail. Pattern generalizes for evidence-aware composition.

### Projection Variants
The shape, on Stage1 mappings, that holds per-surface (desktop/mobile/etc.) variant presentations. Currently a Stage1 contract feature; structurally the precedent for shape families in the Object Catalog.

### ORCA
**O**bjects, **R**elationships, **C**alls-to-action, **A**ttributes. The Stage1 inference framework (and OOUX's framing). Forge consumes ORCA-shaped artifacts via the reconciliation contract.

---

## Process Terms

### Mission Graph
The dependency-driven view of OODS-Forge work, organized into four tracks: Foundation, Capability, Integration, Quality. The unit of planning. See [mission-graph.md](mission-graph.md).

### Decision Memo
A 1-page research-shaped artifact that resolves a fork before implementation begins. Lives in [decisions/](decisions/). Format defined in [decision-points.md](decision-points.md). Costs 1 session; saves 5–15 from rework.

### +1 Closeout
The standing convention since sprint-92: every sprint includes a final mission named "closeout" with concrete deliverables (commit verification, branch push, counterparty ack, session capture+complete, MEMORY.md update, closeout report). Validated 4 consecutive sprints zero retro-splits.

### N=3 / N=5 Posture
The mission-count posture for sprints. Default 4–5 missions including closeout (N=5), with occasional N=3 to validate posture flexibility. Validated in sprint-95.

### Per-Mission Commit
Each mission commits its deliverables at mission-complete time. Not at sprint-end. Not in batch. Failure mode named in past learnings; +1 closeout convention exists to prevent.

### Pre-Registered Schema (Contract Gate Pattern)
The pattern of landing receiver-side schema shapes (input schemas, contract tests, regenerated types, contract-doc updates) BEFORE the partner emitter ships. Zero behavior change at receiver layer until partner flips on. Sprint-91 v1.4.0 origin; now evergreen rule.

### Real-Data E2E Gate
A test gate that uses external production-shape fixtures (Stage1 reruns, concordance manifests, A2UI catalogs from real consuming hosts) rather than synthetic-only fixtures. S80 lesson; required for every output surface.

---

## Stack / Organ Terms

### Stage1
The per-app evidence capture organ. ORCA inference, design fingerprinting MCP. Lives at `/Design-Tools/Stage1`. Wire contract v1.7.0 live.

### divergence-inspector + concordance
The canonical-shape-mining services. Mine canonical shape families from sampled sites; resolve queries across syntactic/semantic/pragmatic/relational protocols. Lives on Mac Studio under user `Darryl`. End-to-end testing as of 2026-05-09. Renamed from "Cannon Compass."

### OODS-Forge
This repo. The synthesis/composition organ. `github.com/kneelinghorse/OODS-Forge` (private).

### semantic-federation
Birch's domain. Cedar policy + federated schema composition. Reference implementation at `/Design-Tools/OODS-subscriptions-main`. Production integration with Forge gated on D4 + Birch coordination.

### CMOS
Mission + decision graph; cross-project messaging; project memory. Lives at `/cmos-mcp` (server) and `/cmos-dashboard` (web). Published at `cmos.aquex.ai` and `cmos-mcp.com`.

### agent-vitals
Public pip package v1.12 — agent observability. The downstream sink for Forge telemetry once I3 lands.

### Aquex-mcp
MCP tool router/aggregator. Production v1.0. Forge's tool surface routes through it.

### TraceLab + DeepSearch
Cohort intelligence + research substrate. TraceLab live at `tracelab.aquex.ai`. DeepSearch is the backend worker.

### aquex.ai
Umbrella marketing site. Front door for the consultancy and product hub. Astro 5 SSR + Tailwind v3 + OODS-Foundry Brand A.

---

## CMOS / Identity Terms

### Darryl (Mac Studio identity)
Derek's CMOS user identity on the Mac Studio. Some projects (divergence-inspector, concordance) live there. Cross-machine coordination is via `cmos_message` to `cmos://darryl/<project>`. **Same human as Derek**, different machine identity.

### Three address shapes that resolve to Derek
- `cmos://derek/...` (this machine)
- `cmos://darryl/...` (Mac Studio)
- `cmos://kneelinghorse/...` (Stage1's senderProject identity, plus GitHub username)

All resolve to Derek. Don't conflate; do reconcile.

### Decision Register
The list of D1–D5 (and future Dn) tracked in [decision-points.md](decision-points.md). Status: 🔴 needs memo / 🟡 paced on upstream signal / ⚪ deferred.

---

*New terms get added when they emerge. Authored 2026-05-10.*
