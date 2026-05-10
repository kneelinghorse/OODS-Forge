# Decision Points

**Status:** Active
**Date:** 2026-05-10
**Companion to:** [overview.md](overview.md)

The five named forks where being wrong is expensive enough to warrant a research-shaped mission *before* an implementation-shaped one. This document tracks the register; individual memos land in [decisions/](decisions/).

**Operating principle:** A planning mission that produces a 1-page decision memo with named tradeoffs costs **1 session**. Rework from a wrong call costs **5–15 sessions**. The math is settled.

---

## Register

| # | Decision | Status | Memo |
|---|---|---|---|
| **D1** | Object Catalog schema shape | 🔴 Needs memo | — |
| **D2** | Multi-fidelity render abstraction | 🔴 Needs memo | — |
| **D3** | Forge ↔ concordance relationship | 🟡 Needs memo (paced to concordance v0.1) | — |
| **D4** | Forge ↔ semantic-federation integration shape | 🟡 Needs memo (Birch coordination) | — |
| **D5** | Public-vs-private spec boundary | ⚪ Deferred (working system + named milestone first) | — |

🔴 active blocker — should be addressed before related implementation begins
🟡 paced — needs upstream signal before memo can be authored
⚪ deferred — explicitly held until trigger

---

## D1 — Object Catalog Schema Shape

**Why this matters:** The Object Catalog is the central artifact. A2UI hosts consume it. semantic-federation governs it. Fidelity emitters render from it. Concordance canonicalizes against it. Schema migration is painful and visible to every external integrator.

**The fork:**
- **Option A — Single canonical shape per Object** (User has one schema; Subscription has one schema). Simple, easy to validate, clear governance. But contradicts the "shape families with discriminators" architectural call already implicit in `projection_variants[]` and the concordance research.
- **Option B — Shape family with discriminators** (User has a base shape + N variant shapes selected by context: surface, brand, role, evidence). Aligns with concordance reality. More complex to validate, more powerful to render. The architectural call already implicit.
- **Option C — Hybrid** (canonical "core" + opt-in variant family layer). Defers the call. Probably the wrong default — defers the actual question.

**What the memo needs to address:**
1. The schema shape itself (JSON Schema + TypeScript types, draft).
2. Versioning policy: additive-only fields, semver, deprecation rules.
3. Round-trip behavior through `compose → validate → render → codegen → save`.
4. Relationship to existing `projection_variants[]`, `ConfidenceDecomposition`, `evidence_ref` shapes already in the codebase.
5. Compatibility with A2UI's catalog format (legibility constraint).
6. Compatibility with concordance's `semantic-manifest.json` (ingestion constraint).
7. Recommendation + rationale.

**Inputs to gather before authoring:**
- The V2 draft's "registry knowledge model depth" axis (sprint-94 V2 doc)
- The concordance manifest schema (currently in testing on Mac Studio)
- A2UI v0.9 catalog format spec
- The ORCA contract bilateral spec (Stage1 v1.x)
- Storybook MCP Component Manifest format (for legibility comparison)

**Why expensive if wrong:** every downstream consumer keys off this; schema migration is painful for external integrators.

---

## D2 — Multi-Fidelity Render Abstraction

**Why this matters:** The fidelity ladder (boxes-and-arrows → wireframe → branded mockup → production code → runtime composition) is a major Position B/C lever. Each rung needs to render the *same* Object Catalog. The abstraction across rungs is what determines whether new fidelity rungs cost N or N² to add.

**The fork:**
- **Option A — Per-fidelity emitter** (today's pattern: react-emitter.ts, vue-emitter.ts, html-emitter.ts; add boxes-emitter.ts, wireframe-emitter.ts, etc.). Simple, parallel, easy to start. But duplicates a lot of logic across emitters and tightly couples emitter implementation to fidelity choice.
- **Option B — Shared "presentation graph" abstraction** (Object Catalog → presentation graph IR → fidelity-specific renderer). Higher upfront cost. Pays off across all fidelities + future runtime composition. Closer to A2UI's pattern of "structured intent → host renders."
- **Option C — Hybrid** (presentation graph for lower fidelities; per-emitter for production code). Probably the right answer; the memo should pin where the line is.

**What the memo needs to address:**
1. The presentation graph IR shape (if Option B or C).
2. How current React/Vue/HTML emitters refactor (or don't) under the chosen abstraction.
3. Where the runtime/build-time line falls (A2UI is runtime; current Forge is build-time; the ladder accommodates both).
4. Concrete render examples at 3+ fidelities for a User object.
5. Migration path: how does today's codegen evolve under the new abstraction?

**Inputs to gather before authoring:**
- A2UI v0.9 wire format (the runtime-side reference)
- Current emitter implementations (`packages/mcp-server/src/codegen/`)
- Storybook MCP Component Manifest (the static-render reference)
- Visual outputs at each fidelity to anchor the abstraction in real artifacts

**Why expensive if wrong:** wrong choice = 5× duplication across emitters or 1× bad abstraction that locks fidelity options.

---

## D3 — Forge ↔ Concordance Relationship

**Why this matters:** Concordance is structurally upstream of Forge in the design intelligence stack. *How* upstream determines deployment topology, versioning model, scaling implications.

**The fork:**
- **Option A — Forge as concordance consumer** (Forge calls concordance over MCP/HTTP; concordance is a separate service Forge depends on). Clean boundary. Looser coupling. But Forge degrades if concordance is unreachable.
- **Option B — Forge embeds concordance** (concordance code + indices live inside Forge; Forge calls them as in-process functions). Tightest coupling. No external dependency. But Forge inherits concordance's complexity (vector indices, FTS5, embeddings).
- **Option C — Forge as peer of concordance** (both expose MCP surfaces; aquex-mcp routes; both are independently versioned). Most flexible. Most coordination overhead.

**What the memo needs to address:**
1. The runtime relationship (consumer/embedded/peer).
2. The build-time relationship (where the manifest schema lives — separate repo? `schemas/`? as part of Forge?).
3. Versioning compatibility: Forge v0.1 must work with concordance vN — what are the rules?
4. Failure modes: what happens when concordance is unreachable or returns stale data?
5. Cross-machine reality: concordance currently lives on Mac Studio; how does that affect the choice?

**Inputs to gather before authoring:**
- Concordance v0.1 deployment shape (in testing; pace-dependent)
- aquex-mcp routing capabilities (current state)
- Stage1's deployment shape as a precedent (also adjacent service Forge consumes)

**Why expensive if wrong:** lock-in risk; deployment topology is hard to change once external integrators rely on it.

**Pacing:** memo can be authored in two passes — first pass (now, based on architecture doc + assumptions), second pass once concordance v0.1 schema/deployment stabilize. Don't wait for full readiness.

---

## D4 — Forge ↔ Semantic-Federation Integration Shape

**Why this matters:** Cedar policy gating happens at *some* layer. Wrong layer choice = governance leaks (Forge writes that bypass policy) or governance everywhere (every Forge tool call routes through policy evaluation, with the cost that implies).

**The fork:**
- **Option A — Cedar at write-side only** (`map.apply`, `map.create`, etc. evaluate policy before writes; reads are unrestricted). Simple. Aligns with current write-side reconciliation thinking.
- **Option B — Cedar at catalog-distribution layer** (the Object Catalog is a versioned artifact; semantic-federation produces *views* of it filtered by policy; Forge tools work against views). Cleanest from Forge's perspective; pushes complexity into federation.
- **Option C — Both** (write-side + distribution-side). Most secure. Most complex.

**What the memo needs to address:**
1. The integration layer (write-side / distribution / both).
2. The Cedar policy shape — what entities/actions/resources Forge exposes to policy evaluation.
3. How federated catalog views materialize (views computed at distribution time? at read time? cached?).
4. Performance budget for policy evaluation per Forge call.
5. How OODS-subscriptions-main's reference patterns map onto Forge's tool surface.

**Inputs to gather before authoring:**
- OODS-subscriptions-main `docs/architecture.md`, `capability-rules.md`, `capability-evaluation.md`
- Cedar policy language reference (AWS docs)
- Birch's input on what semantic-federation v0.x actually expects from consumers

**Why expensive if wrong:** governance leaks are silent failures; governance everywhere is a performance tax that compounds.

**Pacing:** Birch coordination required before final form. Forge drives the integration solo; first pass of the memo can be authored without him; second pass with his feedback.

---

## D5 — Public-vs-Private Spec Boundary Mechanics

**Why this matters:** The strategic intent is "open eventually, smart now." The mechanics — *how* something becomes open, *what* the boundary is between OODS-the-spec and Forge-the-engine and aquex-the-platform — need to be sketched before they get tangled in shipped code.

**The fork:**
- **Option A — Open spec, closed reference impl, closed platform.** Object Catalog spec + bidirectional MCP contract are public; Forge engine is private; aquex platform is commercial.
- **Option B — Dual-license open core** (spec public; Forge engine source-available with commercial use restrictions; aquex platform commercial).
- **Option C — Fully open** (everything except commercial platform features). Riskiest near-term; best for adoption long-term.
- **Option D — Stay closed until milestone X**, then re-evaluate.

**What the memo needs to address:**
1. The boundary lines: what's spec, what's engine, what's platform.
2. The license posture for each layer.
3. The trigger conditions: under what circumstances do we publish?
4. The risks of opening too early (competitor ramps on spec) vs. closing too long (irrelevance).
5. The IP fence: what concrete competitive advantage stays inside Forge regardless of what gets published?

**Inputs to gather before authoring:**
- Comparable open-core trajectories (Supabase, Strapi, Plasmic, Knapsack)
- Comparable open-spec-closed-engine patterns (Storybook?, OOUX?, A2UI itself — Google open spec)
- Birch's perspective (this is a two-founder decision)

**Why expensive if wrong:** strategic confusion that bleeds into product decisions. Not a fast-rework decision once trajectory is set.

**Status: deferred.** The trigger to author this memo is: *(a)* a working bidirectional system end-to-end, *(b)* a named milestone we're publishing toward, OR *(c)* an external event (competitor publishes their version, partner asks for spec access, etc.). Until then, hold the question explicitly so it doesn't get answered by accident through accumulating private decisions.

---

## How Decision Memos Should Be Structured

When authoring a memo for D1–D5 (or future Dn), use this structure:

```markdown
# D[N] — [Decision name]

**Status:** [Drafting / Open / Decided / Superseded]
**Date:** YYYY-MM-DD
**Authors:** [Derek / Derek + Birch / etc.]

## Context
[Why this decision exists. What's at stake. What changes if we get it wrong.]

## Options
[Each option with concrete tradeoffs, not abstract pros/cons.]

## Recommendation
[The chosen option, with rationale tied to the strategic position
documented in strategic-position.md.]

## Implementation implications
[What this decision unblocks; what missions it enables; what other
decisions it constrains.]

## Open sub-questions
[Things the memo deliberately doesn't resolve and why.]

## References
[Inputs gathered: research artifacts, repo files, external docs,
prior decisions.]
```

Memos live in [decisions/](decisions/) with filenames `D[N]-[short-slug].md` (e.g., `D1-object-catalog-schema.md`).

---

## When New Decision Points Get Added

If during the work a new fork emerges where being wrong is expensive (5+ session rework), it gets added to this register as **D6, D7, etc.**, and a memo gets queued before the implementation that depends on it.

The current register reflects what was visible at the 2026-05-09 → 2026-05-10 planning conversation. It is not exhaustive; it is the starting set.

---

*Authored 2026-05-10. Updates land via direct edit + commit on `OODS-pro`.*
