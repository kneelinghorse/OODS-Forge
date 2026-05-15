# Bidirectional Object Catalog MCP — F3 Framing

**Status:** Spec (sprint-96 m04; implementation hardening lands across sprint-97+ F-track and C-track missions)
**Date:** 2026-05-15
**Implements:** [D1 — Object Catalog Schema Shape](../decisions/D1-object-catalog-schema.md), [D4 — Forge ↔ Federation Integration](../decisions/D4-forge-federation-integration.md)
**Companion to:** [object-catalog.md](./object-catalog.md), [concordance-integration.md](./concordance-integration.md)
**Gating mission:** F3 (this spec); informs every C-track write surface

---

## Purpose

Make the public/internal framing of Forge's bidirectional MCP **precise enough that implementation and future publication do not overclaim**. This is positioning work anchored in concrete tool inventory — not a slogan.

The claim Forge is comfortable defending in public:

> **A writable Object Catalog MCP with reconciliation semantics and capability-based write-side governance.**

What follows is what that claim means operationally, what tools sit behind it, and what it explicitly does NOT mean.

[object-catalog.md](./object-catalog.md) (F1 sprint-96 m01) is complete; this spec anchors against the finalized catalog kernel. No F1-dependent assumptions need to be marked TBD here (m04 success criterion 6 honored — F1 stabilized before this spec landed).

---

## The Claim — Anatomy

| Phrase | Operational meaning |
|---|---|
| **writable** | Forge exposes mutating tools, not just reads. Persistent catalog/schema/mapping state changes through MCP tool calls. |
| **Object Catalog** | The mutations target the v1.0.0 Object Catalog envelope per [object-catalog.md](./object-catalog.md) — SemanticEntity-extended kernel with `oods.*` namespaced extensions. Not a generic resource graph. |
| **MCP** | The surface is exposed over the Model Context Protocol; tools self-describe via `packages/mcp-adapter/tool-descriptions.json`. Today: local bridge. Future: remote bridge when external integrators arrive. |
| **reconciliation semantics** | Mutations happen primarily via reconciliation — Stage1 inspections drive multi-entity, evidence-backed writes. `map.apply` is the canonical reconciliation write; future catalog publish tools follow the same semantics. |
| **capability-based write-side governance** | Every write tool passes through `evaluateCapability(state, context, action)` per D4 before mutating. Reads remain unfiltered in v1. |

## What the Claim Is NOT

The success criterion explicitly requires scoping. Avoid these adjacent claims even when they would simplify positioning:

| Adjacent claim | Why we don't use it |
|---|---|
| "first writable design-system MCP" | Too broad. Not sourced. Position B/C deliberately scopes to *Object Catalog* writability; "first writable design-system MCP" invites comparison against component-manifest MCPs and canvas mutators that we explicitly aren't. |
| "writable design canvas MCP" | Wrong frame. Forge does not mutate a canvas — it mutates catalog state. |
| "generic catalog MCP" | Wrong scope. Forge specifically targets the OODS Object Catalog kernel; generic catalog framing dilutes the wedge. |
| "CMS-style MCP" | Wrong frame. CMS implies content authoring + delivery; Forge is build/authoring-time only. |
| "agent-controlled Storybook" | Wrong organ. Storybook ships read-only manifests; Forge is not a Storybook successor. |
| "replacement for Concordance" | Wrong relationship. Concordance owns semantic resolution; Forge owns catalog write/read. They compose; they do not overlap (D3 ratified). |

The full strategic positioning lives in [../strategic-position.md](../strategic-position.md); this section is the **wording lock** for technical communications and public-facing copy.

---

## Read Surfaces (inventoried)

Drawn from `packages/mcp-server/src/tools/registry.json` (auto-registered set as of 2026-05-15). Each read tool returns content shaped per the catalog kernel where catalog content is in scope; transform tools return their own well-typed shapes.

### Canonical catalog reads

| Tool | Purpose | Catalog-shaped output? |
|---|---|---|
| `registry.snapshot` | Point-in-time snapshot of the OODS registry including catalog entries — **the canonical read surface for catalog inspection** | Yes (CatalogObject array + indices) |
| `catalog.list` | Enumerate catalog entries with filter/paging | Yes |
| `object.list` | Enumerate objects (catalog kernels) | Yes |
| `object.show` | Return a single object by URN/identifier | Yes |

### Schema reads (companion surface)

| Tool | Purpose |
|---|---|
| `schema.list` | List persisted UiSchemas (`compose-{hash}` refs) |
| `schema.load` | Load a UiSchema by ref |

### Mapping reads

| Tool | Purpose |
|---|---|
| `map.list` | List reconciliation mappings (Stage1 + ad-hoc) |
| `map.resolve` | Resolve a mapping reference to its concrete shape |

### Structured-data reads

| Tool | Purpose |
|---|---|
| `structuredData.fetch` | Read structured data registry — Stage1 rollups, identity graphs, capability data |

### Transform reads (no persistent state change)

| Tool | Purpose | Notes |
|---|---|---|
| `repl.validate` | Validate a UiSchema | Pure function over input |
| `repl.render` | Preview-render a UiSchema | Pure function over input |
| `design.compose` | Compose a UiSchema from object + slot intent | Returns UiSchema; persists only if explicitly saved via `schema.save` |
| `viz.compose` | Compose visualization specs | Same |
| `tokens.build` | Build token artifacts | Produces files in `.oods/` workspace when artifact mode is on; the read variant just returns the artifact shape |
| `code.generate` | Codegen (React/Vue/HTML × inline/tokens/tailwind) | Returns `CodegenResult` — does not write files unless explicitly piped |
| `pipeline` | Orchestrator across compose → validate → render → codegen → save | Composes the above; mutating only if `save: true` chains into `schema.save` |
| `health` | Server health check | Pure read |

### Read-surface contract

| Property | v1 commitment |
|---|---|
| Output shape | Catalog content returns SemanticEntity-shaped payloads per [object-catalog.md](./object-catalog.md) envelope rules |
| Workspace boundary | All reads workspace-scoped via per-workspace Concordance tenancy (`concordance_<workspace>`) |
| Capability filtering | **None in v1.** Reads are unfiltered within a workspace per D4. Future read-side filtering is a V2 axis. |
| Authentication | Local bridge auth (no remote auth in v1); remote-bridge auth lands when external integrators arrive |

---

## Write Surfaces (inventoried)

Drawn from the same registry. Each write tool is a mutation boundary; every write tool MUST honor the five attributes named below (dry-run, idempotency, conflict, queued, capability).

### Reconciliation writes — the canonical writable surface

| Tool | Mutates | Idempotency key (sprint-97 lock) |
|---|---|---|
| `map.apply` | Applies a Stage1-derived mapping; mutates Object Catalog entries and projection_variants | `(mappingId, target_state_hash)` |
| `map.create` | Creates a new mapping definition | `mappingId` (caller-provided or generated) |
| `map.update` | Updates an existing mapping definition | `(mappingId, expected_revision)` |
| `map.delete` | Deletes a mapping | `mappingId` |

### Schema writes

| Tool | Mutates |
|---|---|
| `schema.save` | Persists a UiSchema and returns a `compose-{hash}` ref |
| `schema.delete` | Removes a persisted UiSchema (refs become unresolvable) |

### Brand writes

| Tool | Mutates |
|---|---|
| `brand.apply` | Applies a brand overlay; produces token artifacts under the workspace's brand path |

### Future writes (named, NOT implemented in v1)

| Tool | Purpose | Gating |
|---|---|---|
| `catalog.publish` / `catalog.write` | Direct CatalogObject creation/update outside the map.* reconciliation path | Lands when an authoring workflow explicitly creates CatalogObjects without going through Stage1 |
| `catalog.delta_apply` | Apply a Concordance-derived catalog delta (F2 translator output) | Lands with F2 implementation (sprint-97) |
| `registry.snapshot.write` | Operator-initiated snapshot promotion (snapshot a moment in time as a new revision) | Lands when versioning workflow demands it; D4 wraps it |

### Write-surface contract attributes

Every write tool MUST honor all five attributes below. This is the F3 surface contract.

---

## Dry-Run Defaults

| Tool | v1 default | Rationale |
|---|---|---|
| `map.apply` | `dryRun: true` (apply-on-confirm) | High blast radius; default to preview |
| `map.create` | `dryRun: false` | Pure creation; explicit-by-call |
| `map.update` | `dryRun: false` | Same |
| `map.delete` | `dryRun: false` | Same; tool name itself is the confirmation |
| `schema.save` | `dryRun: false` | Save is the intent |
| `schema.delete` | `dryRun: false` | Same as map.delete |
| `brand.apply` | `dryRun: true` (preview overlay diff) | Brand changes touch all tokens; default to preview |

All tools expose `dryRun: true|false` regardless of default. Sprint-97 alignment pass re-validates per-tool defaults against this table.

**Dry-run response contract:** when `dryRun: true`, the response carries the same shape as the real write but with `status: "dry_run"`, populated `would_mutate: {...}` describing the would-be changes, and zero persisted state mutation. Idempotency-key generation runs even in dry-run so the caller can see what the real key would be.

---

## Idempotency

Every write tool MUST guarantee:

| Property | Behavior |
|---|---|
| Replay safety | Re-running with identical input + identical target state produces no additional mutation; returns `status: "already_applied"` with original `applied_run_id` |
| Correlator | Each mutation carries an `applied_run_id` returned to the caller; consumers dedupe by this |
| Key derivation | Per-tool idempotency keys (table above); sprint-97 locks the exact derivation |
| Cross-session | Idempotency persists across server restarts (key is derived from input + target state, not in-memory state) |

**Specifically for `map.apply`:** re-applying the same mapping to the same target state produces zero diff. This is the load-bearing guarantee for Stage1 reruns — a Stage1 sprint-46 rerun (`a0300dc0` linear, `7adc1d79` stripe) replayed against an already-reconciled catalog returns `already_applied` without churn.

---

## Conflict Semantics

When a write targets a state inconsistent with its preconditions, or when concurrent writes race against the same URN:

```jsonc
{
  "status": "conflict",
  "conflict_kind": "precondition_failure" | "concurrent_write" | "state_drift",
  "current_state": { /* snapshot of the actual state */ },
  "expected_state": { /* what the write assumed */ },
  "suggested_remediation": "<machine-readable hint>",
  "applied_run_id": null
}
```

| Conflict kind | When it fires |
|---|---|
| `precondition_failure` | The write's stated preconditions (target URN exists, target revision matches, etc.) do not hold |
| `concurrent_write` | Another write is in flight against the same URN; lock acquisition failed |
| `state_drift` | The target state changed between when the write was prepared and when it executed |

**v1:** conflicts surface; client decides retry/remediation. The C3 review/recovery workflow (V2 axis #2) consumes `suggested_remediation` to drive operator UI. **v2:** catalog-side conflict queue + auto-merge in named cases (e.g., commutative `oods.evidence_chain` appends).

---

## Queued States

For writes that depend on partner-organ state not yet available (e.g. `map.apply` where the Stage1 emission hasn't arrived):

```jsonc
{
  "status": "queued",
  "queued_reason": "stage1_emission_not_present" | "concordance_unreachable" | "evaluator_dependency_pending",
  "expected_resolution_path": "<machine-readable hint>",
  "queue_position": <int>,
  "applied_run_id": null
}
```

| v1 storage | v2 storage |
|---|---|
| In-memory queue per server instance | Persistent queue when C3 review/recovery workflows demand it |

Queued state is observable via `map.list` (mappings in `queued` status are listed alongside applied/conflicted ones).

---

## Capability Denials (D4 boundary)

Every write tool passes through `evaluateCapability(state, context, action)` before mutating per D4. On deny:

```jsonc
{
  "status": "denied",
  "denial_code": "capability_forbidden" | "tenant_boundary_violated" | "policy_not_satisfied",
  "evaluator_trace": {
    "policy": "<policy_id>",
    "context": { "role": "...", "workspace": "..." },
    "action": "map.apply"
  },
  "applied_run_id": null
}
```

| Denial code | Meaning |
|---|---|
| `capability_forbidden` | Caller's capability set does not include the action |
| `tenant_boundary_violated` | Write targets a workspace the caller cannot mutate |
| `policy_not_satisfied` | A specific policy predicate (e.g., "requires approval flag") not met |

`evaluator_trace` is sufficient detail for operators to understand WHY a denial happened. Tracing data does **not** leak policy internals beyond what the caller needs to diagnose.

### D4 governance boundary — explicit

**Write-side gates apply at mutation boundaries; reads remain unfiltered in v1.**

This is the v1 governance shape per D4. The `evaluateCapability` wrapper sits in front of every write tool above. Reads do NOT pass through the evaluator today. If two roles need different views of the same catalog within a workspace, v1 ships both views unfiltered and the caller filters client-side.

Three contexts ship with v1 per D4: `customer_portal`, `support_agent`, `automation`. Sprint-97+ F4 mission implements the evaluator wrapper adapted from the OODS-subscriptions billing-specific reference; F3 (this spec) names the contract, not the implementation.

---

## Contrast With Adjacent Writable Surfaces

Sharpens the wedge without making unfair claims.

| Surface | What it does | What Forge does differently |
|---|---|---|
| **Storybook Component Manifest** (Q4 2025) | Ships a read-only component manifest readable by agents | Forge ships a *writable* Object Catalog with reconciliation semantics. Storybook describes; Forge mutates. |
| **A2UI runtime emission** (Google, Dec 2025) | Server-side agent emits declarative UI tree the host renders | Forge produces the *catalog* that A2UI hosts consume. Forge is upstream of A2UI runtime; A2UI is one consumer of Forge's catalog. |
| **Generic resource-mutation MCP servers** | One resource mutation at a time, typically REST-shaped | Forge mutates Object Catalog *state* through reconciliation — multi-entity, evidence-backed, idempotent writes driven by Stage1 inspections. |
| **Concordance** | Owns semantic resolution against a canonical catalog corpus | Forge owns the catalog write/read surface. They compose: Forge writes the catalog; Concordance resolves intent against it. No surface overlap (D3 ratified). |
| **Stage1 / divergent-inspector** | Inspects running apps, emits SemanticManifests (actual/inspected side) | Forge is the canonical/declared side. Stage1 feeds reconciliation evidence into Forge's `map.apply`; Forge mutates the catalog accordingly. |

---

## F3 Public-Facing Reference Surface

What an external integrator needs to read to implement against Forge:

1. **This spec** — what tools exist, what they do, what their contracts are
2. **[object-catalog.md](./object-catalog.md)** — the v1.0.0 envelope and entity shape they will read and write
3. **[concordance-integration.md](./concordance-integration.md)** — the upstream wire if they also want to round-trip through Concordance
4. **Per-tool wire schemas** — at `packages/mcp-adapter/tool-descriptions.json` (the MCP self-description surface)
5. **Auth boundary** — local-bridge in v1; remote-bridge auth lands when external integrators arrive

An integrator should be able to read 1–3 once and implement a non-trivial Forge consumer without further explanation. Sprint-97+ work tightens 1–3 with each emerged use case.

---

## What This Spec Does NOT Cover

- **Per-tool wire schemas in full detail.** Those live in `packages/mcp-adapter/tool-descriptions.json`. This spec references them by name + the per-tool contract attributes (dry-run / idempotency / conflict / queued / capability).
- **The `evaluateCapability` implementation.** D4 names the pattern (OODS-subscriptions enforcement-wrapper adapted for Forge actions); sprint-97+ F4 implements. This spec only names where the wrapper sits.
- **Remote-bridge MCP auth.** Local-bridge only in v1.
- **Read-side capability filtering.** V2 axis when a real use case names it.
- **Catalog publish/write tools (`catalog.publish` / `catalog.delta_apply`).** Named as future writes; not implemented in v1.
- **Telemetry and drift markers.** Q2 / I3 tracks; this spec only names that write tools emit `applied_run_id` for correlation.
- **Persistent queue mechanics.** v1 = in-memory queue; persistent queue lands with C3 review/recovery workflows.

---

## Open Sub-Questions (carried forward)

1. **Idempotency-key generation scheme.** Per-tool natural keys vs. central correlator. Recommendation in this spec: per-tool natural keys (table above) for human-readable diagnostics; sprint-97 locks the exact derivation.
2. **Persistent vs. in-memory queue.** v1 = in-memory; persistent when C3 review/recovery names it (most likely sprint-97+ when V2 axis #2 work begins).
3. **Read-side capability filtering shape.** Defer until a V2 use case names it; v1 ships unfiltered reads per D4.
4. **Remote-bridge auth.** Defer until the first external integrator arrives. Likely tied to D5 public-vs-private decision (currently deferred).
5. **`catalog.publish` API shape.** Defer until an authoring workflow needs CatalogObject creation outside `map.apply`. Likely emerges from C3 (operator review/recovery workflows).

---

## References

**Decision memos:**
- [D1 — Object Catalog Schema Shape](../decisions/D1-object-catalog-schema.md) — the kernel that gets read and written
- [D4 — Forge ↔ Federation Integration](../decisions/D4-forge-federation-integration.md) — write-side gating evaluator pattern

**Companion technical specs:**
- [object-catalog.md](./object-catalog.md) — Object Catalog v1.0.0 envelope (the shape of read and write payloads)
- [concordance-integration.md](./concordance-integration.md) — upstream wire boundary; F2 vendoring plan

**Tool registry (the source of truth for what tools exist today):**
- [packages/mcp-server/src/tools/registry.json](../../../packages/mcp-server/src/tools/registry.json) — auto vs. on-demand registration sets
- `packages/mcp-adapter/tool-descriptions.json` — per-tool wire schemas

**Strategic framing:**
- [../strategic-position.md](../strategic-position.md) — Position B+C wording lock
- [../glossary.md](../glossary.md) — "Bidirectional MCP" definition
- [../stack-map.md](../stack-map.md) — Forge's place in the aquex.ai design intelligence stack

**Planning canon:**
- [../mission-graph.md](../mission-graph.md) — F3 mission criteria
- [../quality-bars.md](../quality-bars.md) — public-claim sourcing discipline
- [../roadmap/near.md](../roadmap/near.md) — sprint-96 m04

---

*Authored 2026-05-15 (sprint-96 m04). Spec only — no implementation code lands in this sprint. F1 (object-catalog.md) is complete; this spec anchors against it with no TBD markers. F3 implementation (per-tool dry-run defaults alignment, idempotency-key locking, conflict response shape, evaluator wrapper integration) layers across sprint-97+ F4/C3 missions. Updates if external integrators surface real-world contract gaps.*
