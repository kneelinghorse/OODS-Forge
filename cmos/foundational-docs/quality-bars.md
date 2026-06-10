# Quality Bars

**Status:** Active
**Date:** 2026-05-10
**Companion to:** [overview.md](overview.md)

The conventions enforced continuously across OODS-Forge work. These are non-negotiable — load-bearing because being wrong is the only thing that costs time.

Carried forward from sprints 90–95 plus what Position B/C scope demands. Each convention has a *why* anchored in a specific past failure mode or future requirement.

---

## Test & Validation

### Real-data E2E gates for every output surface
- **Rule:** No surface ships green on synthetic-only fixtures. Every emitter, every catalog contract, every fidelity rung carries at least one external-shape fixture in its E2E gate.
- **Why:** Sprint 80 lesson — internal scoring drifts from real consumer shape. The bridge/config integration bugs that fired only under E2E validation would have stayed hidden under synthetic-only testing.
- **Application:** every C-track mission and every I-track integration ships with an E2E gate using real artifacts (Stage1 reruns, concordance manifests, A2UI catalogs from real consuming hosts).

### Bidirectional integration tests for every Catalog contract surface
- **Rule:** For every contract surface where Forge reads OR writes (concordance manifest ingestion, semantic-federation policy evaluation, Stage1 reconciliation, agent-vitals telemetry), the test suite covers the reverse direction.
- **Why:** the bidirectional MCP claim depends on this. One-way tests prove half the surface.
- **Application:** F2 (concordance ingestion) tests round-trip; I2 (semantic-federation) tests policy evaluation with both grant and deny paths; I3 (agent-vitals) tests both event emission and event consumption.

### Pre-registered schema shapes ahead of partner emitter readiness
- **Rule:** When a partner organ (concordance, semantic-federation, Stage1) is about to emit a new shape, OODS-Forge pre-registers the receiver shape (input schemas, contract tests, regenerated types, contract-doc updates) BEFORE the partner ships. Zero behavior change at our layer until partner flips on.
- **Why:** Sprint 91 v1.4.0 contract-gate pattern. Pre-registering shapes beats retrofitting under pressure.
- **Application:** F2 should land contract gates against Concordance wire `1.1.0` before authenticated writes; future Stage1/Concordance contract bumps follow the same pattern.

---

## Sprint Conventions

### +1 closeout mission every sprint
- **Rule:** Every sprint includes a final mission named "closeout" with concrete deliverables: commit verification, branch push, counterparty ack (if cross-project), session capture+complete, MEMORY.md update, closeout report.
- **Why:** Sprints 90–91 retro-split failure mode. Floating "commit per-mission" policy didn't change behavior; trackable closeout mission did. Validated 4 consecutive sprints (s92–s95) zero retro-splits.
- **Application:** every sprint plan reserves the +1 slot.

### N≤5 mission posture (with N=3 flex)
- **Rule:** Default sprint shape is 4–5 missions including closeout. Flex to N=3 occasionally to validate posture flexibility.
- **Why:** validated through sprints 92–95. Quality-first cadence held; scope inflation remains the named anti-pattern. Sprint 95's N=3 test confirmed the posture is genuinely flexible rather than a fixed shape.
- **Application:** sprint planning starts at N≤5; expansion past 5 requires explicit rationale.

### End-of-sprint commit boundary inside the +1 closeout mission
- **Rule:** Each sprint commits its full set of deliverables inside the closeout mission. The closeout commit message enumerates the mission IDs (`s97-m01, s97-m02, …`) so post-hoc bisection by mission scope is still possible. `git status` must be clean at session.complete time. Per-mission mid-sprint commits are still welcome when they're natural, but they're not required.
- **Why:** The earlier sprint-91 decision #309 ("per-mission commits at mission-complete time") was retired by decision #408 after failing across 5 consecutive sprints (s90–s96) with no enforcement mechanism. Closeout-as-boundary is what actually held; closeout integrity is what matters for foundation/spec/contract sprints, not per-mission integrity. Bisection-by-mission is preserved via the enumerated commit message rather than via per-mission commits.
- **Application:** every sprint's closeout mission has three explicit success criteria: (a) all sprint deliverables committed before session completes, (b) commit message lists mission IDs covered, (c) git status clean at session.complete time. First formal run was sprint-97 m05.
- **Future tightening:** if a code-heavy sprint demands per-mission bisection later, per-mission discipline can be reintroduced with a different rule scoped only to code-producing missions (not foundation/spec/contract work).

### Scale-determinism (Q1) verified green at sprint close
- **Rule:** Every sprint closeout verifies the scale-determinism suite (`pnpm --filter @oods/mcp-server run test:scale`) green at 100/500/1000 — the Q1 mission-graph release gate (V2 axis #7, decision #614). This sprint-close/#408 boundary is the load-bearing gate; the standalone `scale-determinism` CI job runs it per-PR for early signal.
- **Why:** The 3-sprint reproducibility streak (s105=1/3 baseline, s106=2/3, s107=3/3) completed per #614, flipping the gate from "prove it's reproducible" to "keep it reproducible." Determinism regressions in `map.apply` are silent and only surface at scale; the closeout check is what holds the property sprint-over-sprint instead of letting it drift. Resolved at s107-retro (PS-2026-06-10-004) as a closeout criterion rather than a CI aggregator gate job — `ci.yml` has no release-gate job; the #408 closeout boundary is the gate.
- **Application:** the closeout mission's success criteria add (d) `test:scale` green at 100/500/1000 before session.complete. First formal run: the s107-retro pass.

---

## Decision Conventions

### Decision memos before implementation for D1–D5
- **Rule:** For decisions where being wrong costs 5+ sessions of rework, a research-shaped mission produces a 1-page memo before any implementation begins.
- **Why:** Memo costs 1 session; rework costs 5–15. Math is settled.
- **Application:** D1 memo before F1 (Object Catalog spec); D2 memo before C1 (boxes-and-arrows render); D3 memo before I1 (concordance integration); D4 memo before I2 (semantic-federation integration). D5 deferred.

### New decision points get added to the register as they emerge
- **Rule:** If during the work a new fork emerges where being wrong is expensive, it goes in [decision-points.md](decision-points.md) as Dn before the implementation that depends on it.
- **Why:** The current register reflects what was visible at one planning conversation. New visibility surfaces new forks.

---

## Schema & Contract Conventions

### Additive-only versioning for stable contracts
- **Rule:** Once a contract surface (Object Catalog, concordance ingestion, Stage1 reconciliation, semantic-federation policy interface) reaches v1.0, schema changes are additive only. Removals require new version numbers.
- **Why:** External integrators rely on stable shapes. Breaking changes force coordination overhead that compounds across the stack.
- **Application:** F1 (Object Catalog spec) starts at catalog version `1.0.0`; breaking changes after that require a major version.

### Schemas reject unsupported versions gracefully
- **Rule:** If Forge receives a contract version it doesn't support, it returns a clear, machine-readable error. Not a parse failure. Not silent degradation.
- **Why:** lessons from Stage1 v1.4.0 → v1.5.0 → v1.6.0 → v1.7.0 — graceful degradation across version bumps was load-bearing for keeping both sides shippable.
- **Application:** ingestion endpoints (concordance manifests, Stage1 reports) check version field and return structured errors on mismatch.

### Cross-project messaging uses CMOS as the channel
- **Rule:** State updates, contract version announcements, and ack handshakes between aquex organs use `cmos_message` rather than ad-hoc files or external channels.
- **Why:** CMOS is the audit trail. Out-of-band coordination loses provenance.
- **Application:** every cross-project handshake (Stage1 ack, concordance schema announcements, semantic-federation policy publishes) goes through CMOS.

---

## Planning Conventions

### Sessions, not calendar
- **Rule:** Pacing tradeoffs are framed as "this adds N sessions to the path," not "this delays delivery by W weeks." Quality and scalability are the constraints.
- **Why:** Calendar dates don't bind for OODS-Forge. The unit of progress is sessions; quality is what determines whether they're productive.
- **Application:** sprint planning, decision memo authoring, integration coordination — all framed in sessions and dependencies.

### Track sequencing: Foundation → Capability → Integration → Quality
- **Rule:** Foundation missions (F1–F3) get session priority. Capability missions parallel after Foundation. Integration missions gated on partner readiness. Quality missions continuous.
- **Why:** F1 is the spine; everything keys off it. Out-of-order work risks rework when F1 stabilizes.
- **Application:** sprint-96 plans start with F1-supporting missions (D1 memo, F3 framing draft); subsequent sprints layer Capability and Integration.

---

## Communication Conventions

### Decision memos are public artifacts (within the team)
- **Rule:** D1–Dn memos live in [decisions/](decisions/) and are referenced from CMOS missions. Not stuffed in session notes.
- **Why:** future sessions need to discover the rationale; CMOS messages and session notes get pruned.
- **Application:** decision memos commit alongside implementation; missions cite them; CMOS records reference them.

### Public-facing claims (e.g. "writable Object Catalog MCP") are sourced
- **Rule:** Claims that show up in product positioning are anchored in concrete artifacts (a tool spec, a doc, a fixture, a comparable product list).
- **Why:** Position B/C imply external readers; sloppy claims dilute the wedge.
- **Application:** F3 (bidirectional MCP framing) ships with a concrete public-facing doc that an external integrator can read once and implement against, with claims scoped to catalog/reconciliation writability.

---

## What This Document Does Not Specify

- The exact testing framework or CI configuration (lives in repo conventions, not foundational docs).
- Per-language code style rules (lives in linter configs).
- The specific text or format of CMOS messages (covered by CMOS tier guide).

These quality bars apply *across* implementation choices. The implementation choices themselves are a separate layer.

---

*Authored 2026-05-10. Each rule has an antecedent in named past work; new rules require the same grounding before they get added.*
