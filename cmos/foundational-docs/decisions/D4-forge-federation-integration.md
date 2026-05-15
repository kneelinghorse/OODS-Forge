# D4 — Forge ↔ Semantic-Federation Integration

**Status:** Decided (first-pass; second-pass pending Birch coordination)
**Date:** 2026-05-10
**Authors:** Derek (with Birch coordination pending)
**Depends on:** [D1 — Object Catalog Schema Shape](D1-object-catalog-schema.md)

---

## Context

Semantic-federation is Birch Rankin's domain in the aquex.ai portfolio. The reference implementation lives at `/Users/systemsystems/portfolio/Design-Tools/OODS-subscriptions-main/` and demonstrates the integration pattern for **capability-based authorization** that sits between canonical state and consumer UI/operations. The pattern was implemented for a Stripe subscriptions demo but is the same shape that would govern Object Catalog distribution and Forge writes.

### What I found in the reference repo

The pattern is documented in three docs:
- [docs/architecture.md](file:///Users/systemsystems/portfolio/Design-Tools/OODS-subscriptions-main/docs/architecture.md) — four-layer flow (UI Projection / Capability Evaluation / Enforcement + Canonical Translation / Provider Backend)
- [docs/capability-evaluation.md](file:///Users/systemsystems/portfolio/Design-Tools/OODS-subscriptions-main/docs/capability-evaluation.md) — pure-function evaluator contract
- [docs/capability-rules.md](file:///Users/systemsystems/portfolio/Design-Tools/OODS-subscriptions-main/docs/capability-rules.md) — JSON rule shape
- [docs/extending-contexts.md](file:///Users/systemsystems/portfolio/Design-Tools/OODS-subscriptions-main/docs/extending-contexts.md) — adding new contexts

The core contract:

```ts
function evaluateCapability(state, context, action) => {
  allowed: boolean;
  action: string;
  context: string;
  reason?: string;
  rule_id?: string;
}
```

Key invariants the architecture asserts:
- **Capability evaluation is a pure function** — no I/O, no Stripe (or backend) calls
- **Enforcement blocks forbidden actions before any backend call**
- **UI never computes capabilities; it only renders capability results**
- **Canonical models prevent provider leakage outside adapters**
- **Every blocked action returns a reason and rule_id**

Rules: JSON files per-context (`customer_portal.json`, `support_agent.json`, `automation.json`), with predicate operators (`equals`, `in`, `not_in`, `exists`, `truthy`, `falsy`, `gte/lte/gt/lt`) over dot-path fields into canonical state.

### Important nuance

The user's [strategic-position.md](../strategic-position.md) characterizes semantic-federation as "Cedar policy + federated schema composition." The OODS-subscriptions-main reference repo uses a **simpler JSON-predicate pattern**, not Cedar's policy DSL. Either:
- semantic-federation is the broader concept (Cedar + federation are the destination), and OODS-subscriptions is the ABAC-half demonstration shipped first, OR
- The Cedar framing is the architectural vocabulary; the implementation uses pragmatic JSON predicates

This memo treats the current reference implementation as the v1 contract pattern. The eventual choice between continuing JSON predicates and migrating to Cedar's policy DSL is a sub-decision below the D-fork threshold (it doesn't change Forge's integration shape, only the rule expressivity). One implementation caveat: the current OODS-subscriptions evaluator is billing-specific (`subscription`/`invoice` states and billing actions), so Forge I2 must extract or adapt the generic evaluator core before wrapping Forge tools.

---

## What's at Stake

Three failure modes from getting D4 wrong:

1. **Governance leaks** — Forge writes that bypass the evaluator. Silent failures: an unauthorized agent or context emits a `map.apply` that mutates the catalog without policy check. The whole "design intelligence platform with governance" claim collapses.

2. **Governance everywhere** — every Forge tool call routes through policy evaluation regardless of whether the operation needs it. Performance tax compounds; read paths (catalog snapshots, fidelity emissions) become latency-bound on policy lookup.

3. **Wrong layer** — policy applies to the wrong abstraction (e.g., gating individual `Emitter` calls instead of write-side mutations). Re-architecture cost is high once the wrong wiring is in place.

---

## Options

### Option A — Write-side gating (recommended for v1)

Forge's writable tools call into `evaluateCapability(catalogState, context, action)` *before* mutating state. Reads (catalog snapshots, fidelity emissions, render calls) are unfiltered in v1.

**Specifically:**
- `map.apply` evaluates against `{state: currentCatalogState, context: callerContext, action: "map.apply"}` before writing
- `map.create`, `map.update`, `map.delete` follow the same pattern
- Future catalog publish or snapshot-write operations check capability. Current `registry.snapshot` is read-only.
- Future Object Catalog write operations (publish, ingest concordance manifest, accept Stage1 reconciliation report) all check capability at the mutation boundary

**Pros:**
- Mirrors OODS-subscriptions' existing pattern verbatim — the enforcement wrapper sits at the write boundary, evaluator is pure, no I/O leaks
- Simple to reason about: every catalog mutation has exactly one enforcement gate
- Performance: read paths stay unencumbered; writes take a single capability evaluation (<10ms per OODS-subscriptions perf target)
- Failure mode is loud and obvious: a denied write returns `{allowed: false, reason, rule_id}` in the tool response

**Cons:**
- Doesn't control *who sees what* in catalog reads. A reader who can call `registry.snapshot` reads the entire catalog. Distribution-side filtering is deferred to Option B as a later evolution.
- Context-passing discipline required: every Forge write tool has to know about contexts (likely via MCP request headers or call signature parameters)

### Option B — Distribution-side views

semantic-federation produces filtered VIEWS of the Object Catalog per context. Forge writes are unrestricted (whoever can call writes them); reads route through the view layer that hides what the context shouldn't see.

**Specifically:**
- View materialization: for each `(context, catalog)` pair, produce a filtered subset (CatalogObjects + projection_variants that policy allows reading)
- Forge tools' read endpoints (`catalog.list`, `object.show`, `map.list`, `registry.snapshot`'s read side) query views
- Views can be cached (materialized at policy-change time, not read time)

**Pros:**
- Clean separation: Forge tools are context-agnostic; semantic-federation owns view production
- Read-time performance is constant (view is pre-materialized)
- A2UI hosts get a "context-shaped" catalog when consuming Forge's published artifact

**Cons:**
- Doesn't gate writes — anyone with write access can mutate the canonical catalog
- View materialization infrastructure has to handle invalidation (when does a view refresh? On policy change? On catalog change? On both?)
- Adds complexity before the catalog is even stable enough to need view filtering

### Option C — Both (defer to v2)

Combines A and B. Recommended *later* — once v1's write-side gating ships, view materialization can be layered on top without changing the gating contract.

---

## Recommendation

**Option A for v1: write-side gating via the OODS-subscriptions enforcement wrapper pattern.**

**Plan for Option B as a v2 evolution** — design v1 such that adding distribution-side views later does not require re-architecting the write-side gates.

### Specifically

1. **Vendor semantic-federation's evaluator into Forge** (or import as a package once it exists). The interface Forge consumes:

```ts
import { evaluateCapability, type CapabilityContext, type CapabilityAction } from '@aquex/semantic-federation';

const result: CapabilityResult = evaluateCapability(
  catalogState,
  callerContext,
  'map.apply'
);

if (!result.allowed) {
  return {
    status: 'error',
    error: {
      code: 'CAPABILITY_DENIED',
      message: result.reason ?? 'Capability check failed',
      rule_id: result.rule_id,
    },
  };
}

// proceed with the write
```

2. **Caller context is determined by MCP auth.** Three contexts to start (mirroring OODS-subscriptions):
   - `customer_portal` — a Forge-using application invoking on behalf of an end-user
   - `support_agent` — an internal operator using Forge through a workflow UI
   - `automation` — an agent (Claude, GPT, custom) invoking Forge programmatically

   The context is resolved from the MCP request headers or the Aquex-mcp routing layer. Forge tools accept it as a parameter; if unset, default to the most restrictive (`automation` initially; tunable per deployment).

3. **Forge rule files live in `packages/mcp-server/src/capabilities/rules/`** mirroring OODS-subscriptions structure:
   - `customer_portal.json` — rules for end-user contexts
   - `support_agent.json` — rules for internal operator contexts
   - `automation.json` — rules for agent contexts
   - Schema: `packages/mcp-server/src/schemas/capability-rule.schema.json`

4. **The first rule set is small and tight.** Don't over-engineer. Initial rules cover:
   - Block writes from `customer_portal` to canonical catalog objects (only `support_agent` and `automation` write; `customer_portal` reads)
   - Allow `support_agent` to write any catalog object
   - Allow `automation` to write only via reconciliation paths (accepts Stage1/concordance manifests but not direct `map.create`)
   - Default-deny for unmatched (rule_id: `rules.unmatched`)

5. **Forge's writable tools wrap the evaluator at the boundary.** Per tool:
   - `map.apply` — gate at entry; evaluate against current map state + caller context + `'map.apply'`
   - `map.create` — same pattern with `'map.create'`
   - `map.update`, `map.delete` — same pattern
   - Future Object Catalog write tools (`catalog.publish`, `registry.snapshot.write`, etc.) — same pattern with their action names

6. **Read operations are unfiltered in v1.** No capability checks on `catalog.list`, `object.show`, `repl.render`, `code.generate`, fidelity emitters. This is the explicit v1 boundary; Option B addition is the explicit v2 work.

7. **All denials return structured errors.** `{code: 'CAPABILITY_DENIED', rule_id, reason}` is part of the public tool error contract. Consumers can render UI surfaces around `rule_id` (matching the OODS-subscriptions Truth Panel pattern).

### Where the policy layer lives at deployment time

Three deployment topologies to support (in priority order):

1. **Forge embeds the evaluator.** Default path. semantic-federation ships as a TypeScript package; Forge imports it. Rules are co-located with Forge configuration. Simplest to reason about; matches OODS-subscriptions's in-repo pattern.

2. **Forge calls a hosted semantic-federation service.** Optional path. semantic-federation is a remote evaluator (HTTP or MCP); Forge calls it on each write. Used when rules need to be centrally managed across multiple Forge installations or when policies are dynamic.

3. **Forge as one consumer of a federated capability layer.** Future path. Multiple aquex organs (Forge, agent-vitals, future tools) share a federated capability layer. semantic-federation produces context-scoped policy views; Forge consumes its slice.

v1 implements (1). (2) and (3) are layerable extensions.

---

## Implementation Implications

### What this unblocks

- **I2 (semantic-federation integration)** — concrete path. I2 mission ships:
  - Generic semantic-federation evaluator core extracted/adapted from the billing-specific reference (or package import if Birch publishes one)
  - First rule set (3 contexts, ~10-15 rules across the writable tools)
  - Enforcement wrappers on `map.apply`, `map.create`, `map.update`, `map.delete`, plus scaffolding for future catalog publish/snapshot-write tools
  - Structured error contract published in tool docs
  - Unit tests on the evaluator + integration tests confirming denials propagate through the MCP layer

- **F1 (Object Catalog spec)** — the `oods.render.brand_overlay` field's context-awareness story now has a frame. Brand selection can be capability-gated (e.g., `customer_portal` only sees a specific brand subset). Mechanics deferred to a future memo when the multi-brand-per-tenant case arrives.

- **F3 (Bidirectional MCP framing)** — the public claim sharpens further. Forge is a writable Object Catalog MCP with capability-based governance.

### What this constrains

- **Every Forge write tool from this point forward** must call the evaluator at entry. Quality bar: a code review checklist item.
- **Context resolution must work at MCP layer** — Aquex-mcp's routing needs to surface context to Forge tools. Sub-coordination with Aquex-mcp.
- **Rule changes have audit trail.** Rule sets are versioned files in the Forge repo; changes go through commit history. Production deployments pin a rule-set version per release.

### Cost estimate

- Extract/adapt evaluator core + rule files + schema: **~2-3 sessions**
- Wrap current write tools (`map.apply`, `map.create`, `map.update`, `map.delete`) and scaffold future publish/snapshot-write actions: **~3-4 sessions**
- Unit + integration tests: **~2 sessions**
- Total for I2 v1: **~7-8 sessions**

Birch coordination second-pass: separate planning conversation, after I2 v1 ships.

---

## Open Sub-Questions (some require Birch input)

1. **Cedar adoption timeline.** The strategic-position framing says "Cedar policy"; the reference repo uses JSON predicates. Is Cedar a target or a positioning shorthand? **Needs Birch input.** Forge v1 integration uses whatever evaluator semantic-federation ships (currently JSON predicates); migration to Cedar is a follow-on if/when semantic-federation publishes a Cedar interface.

2. **Federated schema composition.** "Federation" in semantic-federation implies multiple sources of schema/rules combined per consumer. OODS-subscriptions is a single-tenant demo; the federation half hasn't been demonstrated in the reference repo. **Needs Birch input.** Forge v1 assumes single-tenant policy; federation adds when (a) multiple Forge installations need cross-coordination, OR (b) capabilities from agent-vitals / Stage1 / TraceLab need to compose with Forge's.

3. **Rule authoring tooling.** OODS-subscriptions has hand-authored JSON files. As Forge's writable surface grows, hand-authoring becomes painful. Eventually we want a UI surface or a DSL. Deferred — surface as a Capability-track mission when rule count crosses ~50.

4. **Multi-brand contexts.** If `customer_portal` should see different brands depending on tenant, the context model needs to extend with tenant identity. Defer until the multi-brand-per-tenant case is real.

5. **View materialization for Option B.** When does distribution-side filtering land? Not in v1. Likely after multi-tenant + multi-brand use cases force it. Surface as a v2 memo if/when the trigger fires.

6. **Capability check for read operations in special cases.** Some read operations might legitimately need gating (e.g., `registry.snapshot` read could expose proprietary catalog content). v1 explicitly defers; the design accommodates adding read gates without restructuring the write-side pattern.

7. **The Cedar-vs-JSON-predicates choice itself.** Not a D-fork — both shapes work for Forge's integration needs. The choice is internal to semantic-federation and propagates downstream as a vendor-side decision. Forge consumes the evaluator's function signature; the rule expressivity is below the integration surface.

---

## What This Memo Is NOT

- **Not a Cedar specification.** Forge's integration is shape-agnostic at the policy-DSL level. We consume `evaluateCapability(state, context, action) => result` regardless of how rules are expressed underneath.
- **Not a multi-tenant design.** v1 is single-tenant per Forge installation. Multi-tenant patterns add when use case demands.
- **Not a final word.** Birch coordination second-pass will refine. This memo's job is to give Forge a coherent v1 path and surface the questions that need Birch input.

---

## References

**Semantic-federation reference implementation:**
- [OODS-subscriptions-main/docs/architecture.md](file:///Users/systemsystems/portfolio/Design-Tools/OODS-subscriptions-main/docs/architecture.md) — four-layer flow + core invariants
- [OODS-subscriptions-main/docs/capability-evaluation.md](file:///Users/systemsystems/portfolio/Design-Tools/OODS-subscriptions-main/docs/capability-evaluation.md) — pure-function evaluator contract
- [OODS-subscriptions-main/docs/capability-rules.md](file:///Users/systemsystems/portfolio/Design-Tools/OODS-subscriptions-main/docs/capability-rules.md) — JSON rule shape + predicate operators
- [OODS-subscriptions-main/docs/extending-contexts.md](file:///Users/systemsystems/portfolio/Design-Tools/OODS-subscriptions-main/docs/extending-contexts.md) — pattern for adding new contexts
- `src/capabilities/rules/customer-portal.json`, `support-agent.json`, `automation.json` — the canonical rule files
- `schemas/capability-rule.schema.json` — rule JSON schema

**Forge codebase (the write surface to gate):**
- [packages/mcp-server/src/tools/map.apply.ts](packages/mcp-server/src/tools/map.apply.ts) — primary write-side tool
- [packages/mcp-server/src/tools/map.create.ts](packages/mcp-server/src/tools/map.create.ts)
- [packages/mcp-server/src/tools/map.update.ts](packages/mcp-server/src/tools/map.update.ts)
- [packages/mcp-server/src/tools/map.delete.ts](packages/mcp-server/src/tools/map.delete.ts)
- [packages/mcp-server/src/tools/registry.snapshot.ts](packages/mcp-server/src/tools/registry.snapshot.ts)

**Prior decisions:**
- [D1-object-catalog-schema.md](D1-object-catalog-schema.md) — Object Catalog as the artifact policy gates against
- [D3-forge-concordance-relationship.md](D3-forge-concordance-relationship.md) — concordance ingest is *post-write*, so policy gating happens Forge-side before the `/manifests` POST

**Planning canon:**
- [../strategic-position.md](../strategic-position.md) — "Cedar policy + federated schema composition" framing for semantic-federation
- [../stack-map.md](../stack-map.md) — semantic-federation's role in the loop
- [../mission-graph.md](../mission-graph.md) — I2 mission

---

*Authored 2026-05-10. Second-pass memo after Birch coordination conversation. Specific topics for that conversation: (1) Cedar vs. JSON-predicates timeline, (2) federation pattern beyond single-tenant, (3) MCP/HTTP transport choice for hosted evaluator deployment if/when that path is taken.*
