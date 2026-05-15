# Mission Graph

**Status:** Active
**Date:** 2026-05-10
**Companion to:** [overview.md](overview.md)

The full mission graph for OODS-Forge inside the design intelligence platform. Four tracks. Dependencies named. Sequencing recommendation. The unit of progress is the mission, not the calendar week.

---

## Tracks at a Glance

```
FOUNDATION ────► CAPABILITY ────► INTEGRATION
   (sequence)      (parallel)     (gated by partner)
                       │
                       ▼
                    QUALITY (continuous; gates releases)
```

| Track | Purpose | Pacing |
|---|---|---|
| Foundation | Define the central artifacts (catalog spec, contracts, MCP framing) | Sequential, decision-memo-first |
| Capability | Build the surfaces (fidelity emitters, operator workflows, codegen) | Parallel after Foundation lands |
| Integration | Wire to partner organs (concordance, federation, agent-vitals, TraceLab) | Gated by partner readiness |
| Quality | Enforce determinism, drift telemetry, real-data E2E gates | Continuous; gates releases |

---

## Foundation Track

The spine. Get this right or downstream rework cost is high.

### F1 — Object Catalog spec v1.0.0
**Purpose:** Define what an OODS Object Catalog is as a published artifact. JSON Schema + TypeScript types. The artifact A2UI hosts can consume, semantic-federation can govern, fidelity emitters can render from, concordance can canonicalize against.
**Dependencies:** Decision memo D1 (Object Catalog schema shape).
**Success criteria:**
- Stable schema with versioning policy (additive-only fields, semver, deprecation rules)
- Strict SemanticManifest envelope compatibility: no Forge-only fields at manifest root; catalog version `1.0.0` is carried in `source` and entity-level `oods.*`
- Round-trips through `compose → validate → render → codegen → save` without lossy translation
- Fixture set with at least 3 production-shape examples (User, Product, Subscription minimum)
- Reference catalog file consumable by an A2UI-style host (proof of legibility)
- Documented at `technical/object-catalog.md` (spec) + `decisions/D1-object-catalog-schema.md` (rationale)
**Why expensive if wrong:** every downstream consumer keys off this; schema migration is painful.

### F2 — Concordance ingestion contract
**Purpose:** Sister to Stage1's reconciliation contract, but for canonical shape families instead of per-app fingerprints. Forge consumes `semantic-manifest.json` from concordance and translates it into Object Catalog candidates with evidence-refs.
**Dependencies:** F1 (catalog needs a shape to ingest into); Concordance hosted endpoint + wire `1.1.0` are live as of 2026-05-14.
**Success criteria:**
- Vendored Concordance contracts pinned to wire `1.1.0` (`manifest.schema.json`, API schemas, recipes, closed enums)
- AJV-validated input schema for `semantic-manifest.json`, including optional top-level `schema_version`
- Client probes unauthenticated `GET /health` and `GET /version` against the hosted endpoint and enforces warn-on-minor / fail-on-major version policy
- Translator produces Object Catalog deltas with `evidence_ref` chains intact
- Round-trips a real concordance manifest through ingestion → catalog delta → reverse-lookup
- Authenticated integration test path is ready behind `CONCORDANCE_API_KEY`; key issuance remains out-of-band
**Why expensive if wrong:** locks Forge into a translation shape that may not match concordance's emitted reality.

### F3 — Bidirectional MCP framing
**Purpose:** Formalize today's write tools (`map.apply`, `map.create`, `map.update`, `map.delete`) and read tools (`registry.snapshot`, catalog/object tools) as a coherent public claim — a writable Object Catalog MCP with reconciliation semantics. This is positioning work as much as engineering work.
**Dependencies:** F1 (the catalog is what gets written/read); D5 (open-vs-private mechanics — though deferred, the framing draft happens regardless).
**Success criteria:**
- Public-facing tool spec for the bidirectional surface (read tools + write tools + their contracts)
- Idempotency guarantees, conflict semantics, dry-run defaults all named explicitly
- Reference doc that an external integrator could read once and implement against
- Contrast with component-context MCP surfaces is sharp and fair; the claim is catalog/reconciliation writability, not generic canvas mutation
- Documented at `technical/bidirectional-mcp.md`
**Why expensive if wrong:** the public claim is the wedge; sloppy framing dulls it.

---

## Capability Track

After Foundation lands, these run roughly in parallel. Each is a V2 axis or a Position B/C surface.

### C1 — Boxes-and-arrows render
**Purpose:** First non-prescriptive emitter. Proves the multi-fidelity claim that the Object Catalog renders at multiple fidelities, not just code.
**Dependencies:** F1; D2 (multi-fidelity render abstraction).
**Success criteria:** at least 3 Object Catalog examples render as annotated boxes-and-arrows artifacts (SVG or HTML+CSS) with role labels, relationships, and trait annotations preserved.

### C2 — Wireframe render
**Purpose:** Second non-prescriptive emitter. Demonstrates the abstraction generalizes beyond one fidelity.
**Dependencies:** C1 (validates the abstraction shape).
**Success criteria:** wireframe output for the same fixtures C1 covers, with structural fidelity (slots, presentation hints) preserved.

### C3 — Operator review/recovery workflows
**Purpose:** V2 axis #2. Queued/conflicted reconciliation items get accepted/patched/deferred/dismissed without manual JSON editing.
**Dependencies:** F1.
**Success criteria:** 100% of conflict artifacts include machine-readable remediation hints; UI surface in playground or via dedicated tool surface.

### C4 — Playground operator DX upgrade
**Purpose:** V2 axis #3. Switch fixtures, tune thresholds, inspect diffs, export transcripts in one session, ≤2 view changes per task, no bridge restarts.
**Dependencies:** C3 (the review/recovery workflows are part of what playground exposes).
**Success criteria:** session walkthroughs in playground show end-to-end operator flow without context loss.

### C5 — Codegen for evidence-backed flows
**Purpose:** V2 axis #4. Three reconciliation surfaces (review queue, conflict detail, apply summary) generate cleanly across React/Vue/HTML × inline/tokens/tailwind.
**Dependencies:** F1, C3.
**Success criteria:** generated UIs work without manual patch-up; cross-framework parity verified.

### C6 — Registry knowledge model depth
**Purpose:** V2 axis #5. `disambiguation_decisions`, `preferred_term`, `capability`, `projection_variants` round-trip through schemas/tools/`registry.snapshot` without lossy translation.
**Dependencies:** F1; F2 (concordance feeds these shapes).
**Success criteria:** ≥2 end-to-end contract fixtures with the full v1.4.0+ registry shape; bilateral with Stage1 + concordance.

---

## Integration Track

Gated on partner organ readiness. Order is approximate — actual order depends on which signal arrives when.

### I1 — Concordance live integration
**Purpose:** Wire the F2 contract to live concordance manifests. The first time Forge's catalog generation is grounded in real-world evidence at scale.
**Gating signal:** F2 contract gate passes; Bearer key issued out-of-band for authenticated endpoints; CORS allowlist decided if browser-side calls are needed.
**Dependencies:** F2.
**Success criteria:** at least one full pipeline run from hosted Concordance manifest/read endpoint → Forge catalog delta → fidelity emission, with evidence-refs traceable end-to-end and `X-Request-Id` captured in diagnostics.

### I2 — semantic-federation integration
**Purpose:** Cedar policy + federated catalog distribution. Forge emits an Object Catalog; semantic-federation governs who sees what, in what scope.
**Gating signal:** Birch coordination on D4 (integration shape memo).
**Dependencies:** F1; D4 memo.
**Success criteria:** at least one Object Catalog distributed to a second consuming app via semantic-federation, with policy gating verified end-to-end.

### I3 — agent-vitals telemetry hooks
**Purpose:** Generated UI events (compose runs, codegen invocations, reconciliation outcomes) flow back to agent-vitals as observability.
**Dependencies:** F1, F3 (the bidirectional MCP surface is what gets instrumented).
**Success criteria:** at least 5 distinct telemetry event types live; agent-vitals dashboard shows Forge usage; drift markers integrate with Q2.

### I4 — TraceLab evidence loop
**Purpose:** Forge usage data feeds the TraceLab corpus, contributing to meta-research about how the design intelligence platform is being used.
**Dependencies:** I3 (telemetry shape is the data feed).
**Success criteria:** structured Forge usage records ingestable by TraceLab; first research artifact derived from Forge corpus.

---

## Quality Track

Continuous. Gates every release.

### Q1 — Determinism + release confidence
**Purpose:** V2 axis #7. Real artifacts at 100/500/1000 mapping states; full parallel execution without serialized-only fallback.
**Why now:** Position B/C imply external consumers; flaky write-side is unacceptable.
**Success criteria:** parallel test runs green for ≥3 consecutive sprints at scale tiers above; release gate uses real artifacts not synthetic-only.

### Q2 — Drift telemetry
**Purpose:** V2 axis #6. Every write-side run emits latency, bucket counts, schema version, drift markers; ≥3 historical runs comparable without ad-hoc scripting.
**Dependencies:** I3.
**Success criteria:** drift dashboard live; comparable run history queryable; alarms on threshold breach.

### Q3 — Real-data E2E gates per output surface
**Purpose:** Extends the S80 lesson to every new fidelity emitter and every catalog contract surface. Internal scoring drifts from real consumer shape.
**Dependencies:** every new C-track surface (each one carries a real-data gate).
**Success criteria:** every output surface ships with at least one external-shape fixture in its E2E gate.

---

## Sequencing Recommendation

The strict-dependency view:

1. **F1** has no soft dependencies (only D1 memo). **Start here.** Other foundation work is gated behind F1.
2. **F2** depends on F1 (catalog shape). Concordance wire `1.1.0` and hosted endpoint are live, so pre-register the contract gate during F1 work and then move directly to hosted preflight.
3. **F3** can start in parallel with F1 (positioning work doesn't fully block on schema details). Final form locks once F1 stabilizes.
4. **D2 memo** can land in parallel with F1 work (it's about render abstraction, not catalog shape). Then C1, C2 unblocked.
5. **C3, C4, C5, C6** all depend on F1; can run in parallel after F1.
6. **I1** is now Forge-gated (F2 pass + Bearer key); **I2, I3, I4** remain gated on partner/org readiness and local integration depth.
7. **Q1, Q2, Q3** layer continuously over everything.

The **most important first mission is F1** because it's the spine.
The **most important first decision is D1** because it's what F1 hangs on.

A reasonable sprint-96 shape, based on this graph, lives in [roadmap/near.md](roadmap/near.md).

---

## What This Graph Does Not Specify

- The number of missions per sprint or the sprint cadence (descriptive, not prescriptive — we plan in mission graph, not calendar).
- The order of fidelity-ladder rungs beyond C1 (boxes-and-arrows) and C2 (wireframe). Higher-fidelity rungs (annotated mockup, A2UI runtime tree) come after C1+C2 prove the abstraction.
- The break of capability missions into smaller sub-missions during sprint planning (each C-mission may decompose into 2–4 sprint missions).
- The exact integration depth of I2 (semantic-federation) — that's gated on D4 + Birch coordination.

---

*Authored 2026-05-10. Updates land via direct edit + commit on `OODS-pro`.*
