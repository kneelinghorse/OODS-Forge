# D2 — Multi-Fidelity Render Abstraction

**Status:** Decided (first-pass; revisit when A2UI runtime emission lands)
**Date:** 2026-05-10
**Authors:** Derek
**Depends on:** [D1 — Object Catalog Schema Shape](D1-object-catalog-schema.md)

---

## Context

The fidelity ladder is a major Position B/C lever (see [../strategic-position.md](../strategic-position.md)). The same Object Catalog should render at multiple fidelities:

1. **Boxes-and-arrows** — annotated rectangles, IA diagrams, flow boards
2. **Wireframe** — gray-box layouts with structural fidelity
3. **Branded mockup** — full visual via brand overlays (currently shipped)
4. **Production code** — codegen output (currently shipped: React/Vue/HTML × inline/tokens/tailwind)
5. **Runtime composition** — A2UI-style declarative tree the host renders (Position B/C destination)

Each rung needs to render the *same* Object Catalog. The abstraction across rungs determines whether adding a new fidelity costs **N** sessions or **N²**.

### Current state

OODS-Forge today has three emitters with a clean unified signature:

```typescript
export type Emitter = (schema: UiSchema, options: CodegenOptions) => CodegenResult;
```

Found in [packages/mcp-server/src/codegen/types.ts](packages/mcp-server/src/codegen/types.ts:30). The emitters (`react-emitter.ts`, `vue-emitter.ts`, `html-emitter.ts`) share:
- A common input shape (`UiSchema` — `UiElement | UiLayout | UiStyle | FieldSchemaEntry`)
- A common slot-resolution surface ([packages/mcp-server/src/codegen/binding-utils.ts](packages/mcp-server/src/codegen/binding-utils.ts))
- A common Tailwind-codegen utility chain (`tailwind-codegen-utils.ts`)
- Roughly parallel structure for token resolution, layout mapping, and tree walking

What each emitter owns *uniquely* is the output syntax: JSX (React), template syntax (Vue), HTML+inline styles (HTML).

### Why this is decision-worthy

Adding three more fidelities (boxes-and-arrows, wireframe, A2UI runtime) without an explicit abstraction policy produces one of two failure modes:

1. **Over-engineered IR landed early** — a presentation graph layer designed before we have evidence of where shared logic actually accumulates. Locks in the wrong abstractions; subsequent fidelities work around it.

2. **N parallel emitters that drift apart** — each new fidelity duplicates 60-80% of the structural pass logic; bugs fix in one emitter and don't propagate; the catalog's role/meaning/relational annotations get re-interpreted per-emitter.

The trick is finding the path where we get the lower-bound-of-N additions while staying ready for the formal IR when it pays off.

---

## Options

### Option A — Per-fidelity emitter (today's pattern, extended)

Add new emitters as functions of the same `Emitter` shape, taking either `UiSchema` (for code emitters) or a wider input (for boxes-and-arrows / wireframe / A2UI). Each emitter walks the tree and emits its target format.

**Pros:**
- Zero abstraction cost upfront
- Each fidelity stays maximally idiomatic
- Bug-fix isolation (a fix in React's JSX emission doesn't risk Vue or HTML)
- Easy to ship (start a new emitter file; copy the slot-binding pattern; emit)

**Cons:**
- Real duplication: layout style resolution, token mapping, slot binding, role/intent inference will all repeat in low-fidelity emitters
- Catalog protocol-axis annotations (pragmatic_role, traits, evidence_refs, relationships) — these are uniform inputs but each emitter will reinterpret them
- A2UI runtime emission is fundamentally different (declarative tree, not source code); shoehorning into the `(UiSchema, CodegenOptions) => CodegenResult` shape forces awkward output schemas

### Option B — Shared presentation graph IR

Land an intermediate **presentation graph IR** between the Object Catalog and the per-fidelity renderers:

```
CatalogObject (oods.render extension)
        │
        ▼
   Presentation Graph IR     ← shared pre-emit pass
        │
        ├──► boxes renderer  → SVG / HTML
        ├──► wireframe renderer → HTML / SVG
        ├──► branded renderer → HTML / framework component
        ├──► React emitter → JSX source
        ├──► Vue emitter → SFC source
        ├──► HTML emitter → HTML+CSS source
        └──► A2UI emitter → declarative tree JSON
```

The IR captures: the tree shape, slot bindings, pragmatic-role annotations, semantic meaning (purpose/human_meaning), state references, relational edges. Per-fidelity renderers project subsets of the IR onto their target format.

**Pros:**
- Single point of truth for tree structure + binding + annotations
- New fidelities are *renderers*, not emitters — they get a fully-annotated IR to project from
- A2UI emission becomes natural (the IR IS a declarative tree; A2UI is one projection)
- Protocol-axis annotations from the Object Catalog (from D1) flow uniformly to all renderers
- Quality bar: a single contract test against the IR shape catches whole classes of bugs

**Cons:**
- Design cost upfront — getting the IR right requires either (a) good guesses or (b) waiting until 2-3 fidelities reveal the shape
- Risk of premature abstraction — if the IR locks in the wrong shape, every renderer pays the tax forever
- Migration cost — today's three emitters refactor to consume IR

### Option C — Hybrid (recommended)

Keep the per-fidelity emitter pattern. **Factor out a shared "structural pre-emit pass" that every emitter calls** before format-specific emission. The pre-emit pass is the IR-in-disguise: it doesn't have its own type or persistence layer yet, but it does have:

- A canonical tree-walk function with slot resolution
- Protocol-axis annotation enrichment (pull `pragmatic_role`, `traits`, `evidence_refs` from the Object Catalog into walkable node metadata)
- Fidelity-axis flags (which annotations *this* renderer cares about)
- Common helpers for state-reference resolution, brand resolution, accessibility hints

```
CatalogObject
        │
        ▼
   PreEmitContext   ← shared pass: tree walk + annotation enrichment
        │
        ▼
   ┌──── per-emitter format-specific render ────┐
   │ react │ vue │ html │ boxes │ wireframe │ A2UI │
   └────────────────────────────────────────────┘
```

The "PreEmitContext" is what would become a formal IR if/when the shape stabilizes. Today it's a shared function call. Tomorrow it could be a typed intermediate artifact.

**Pros:**
- Captures real shared work (the structural pass is happening regardless)
- Doesn't lock in a premature IR shape — emitters still own their output
- Incrementally evolvable: as patterns emerge across emitters, lift them into the pre-emit pass
- A2UI emission is "just another emitter" (with a JSON output schema) on top of the pre-emit pass
- Quality bar: contract tests on the pre-emit pass catch shared bugs; per-emitter tests catch format-specific bugs

**Cons:**
- Less crisp than a fully-formalized IR — boundary between "pre-emit shared" and "emitter-specific" requires ongoing discipline
- Some fidelities (e.g., A2UI) want a *typed declarative tree* as output, which feels like an IR by another name

### Option D — Defer the call

Don't decide D2 in this memo. Ship the first new fidelity (boxes-and-arrows) per Option A; ship the second (wireframe) per Option A; reassess when patterns reveal themselves.

**Rejected because:** Option C is *also* an incremental path — it just commits to lifting shared logic earlier. The risk of Option D is that the third emitter is the one that surfaces the right abstraction, and by that point the divergence cost is real. Option C lets us start the lift on emitter #2 instead of #4.

---

## Recommendation

**Option C — Hybrid. Per-fidelity emitter pattern preserved; shared structural pre-emit pass formalized.**

### Specifically

1. **Today's three emitters refactor to call a shared `runPreEmit(catalog: CatalogObject, options)` function** that produces a `PreEmitContext` containing:
   - The walked tree (mirroring today's UiSchema tree walks)
   - Resolved slot bindings (today's `binding-utils.ts` outputs)
   - Pragmatic role annotations from `pragmatic_role` (from D1's CatalogObject SemanticEntity kernel)
   - Trait annotations from `traits[]`
   - Evidence-ref summary (which protocol axes have evidence — useful for renderer dispatch decisions)
   - State-reference resolution (preconditions/effects mapped to their declaring entities)
   - Brand overlay resolution (which brand tokens apply at this node)
   - Relational summary (incoming/outgoing edges per node)

2. **New emitters** (boxes-and-arrows, wireframe, A2UI) consume the `PreEmitContext` and project onto their output format. They do not re-walk the catalog tree from scratch.

3. **Output shape stays flexible per emitter:**
   - Code emitters (React/Vue/HTML): same `CodegenResult` shape as today
   - Boxes/wireframe emitters: `RenderResult { framework: 'svg' | 'html', code: string, ... }` or similar
   - A2UI emitter: `A2UIResult { tree: JsonValue, version: '0.9', ... }`
   
   The unification happens at the *input* (PreEmitContext), not the output. This sidesteps Option B's premature output unification.

4. **Formal IR formalization is deferred to a future memo** — specifically, when A2UI runtime emission is wired up (mission post-C5/C6). The trigger is: when two emitters need the *same structured output projection* (e.g., both A2UI and a CMS-style structured-data export need a declarative tree), the IR earns its keep. Until then, the PreEmitContext function is the IR.

### Fidelity ↔ Protocol-axis mapping (architectural anchor for the pre-emit pass)

The four protocols from [SEMANTIC_PROTOCOL.md](file:///Users/systemsystems/portfolio/Design-Tools/diverge-and-concord/protocols/SEMANTIC_PROTOCOL.md) give us a natural mapping between fidelity and which CatalogObject annotations dominate at each rung:

| Fidelity | Dominant protocols | What renderer projects |
|---|---|---|
| Boxes-and-arrows | **Pragmatic + Relational** | role labels, edges between objects, action affordances |
| Wireframe | + **Semantic** | + meaning labels, slot structure, hierarchy |
| Branded mockup | + **Brand overlay** (Forge ext) | + tokens, copy, full visual |
| Production code | + **Syntactic** | + literal identifiers, framework idioms, prop typing |
| A2UI runtime | + **Pragmatic** (action handlers) | + event bindings, host-render directives |

This isn't dogma — it's the orientation that lets new fidelity authors know what annotations to read first. The pre-emit pass enriches all annotations; the renderer chooses what to emit.

### Trigger to formalize the IR

The PreEmitContext gets promoted to a formal typed intermediate (with its own schema, persistence, contract tests, public publication) when **either**:

- Two emitters need the *same structured output projection* (forces a shared output IR — A2UI + structured-data export is the most likely first trigger), **OR**
- A non-Forge consumer wants to author a custom renderer against the shared pass (the OODS Object Catalog community emerges; we publish the IR so they can extend without forking Forge)

Until one of those triggers fires, the PreEmitContext stays a function-shaped abstraction. **This is deliberate** — premature IR formalization is the named anti-pattern; deferred formalization lets the shape emerge from real usage.

---

## Implementation Implications

### What this unblocks

- **C1 mission (Boxes-and-arrows render)** — implementation path is clear:
  1. Land `runPreEmit()` and refactor the existing three emitters to consume `PreEmitContext`
  2. Implement `boxes-emitter.ts` against PreEmitContext (output: SVG with annotated rectangles + edges)
  3. Real-data E2E gate: a Forge-emitted Object Catalog renders as boxes that round-trip the pragmatic_role + relational edges

- **C2 mission (Wireframe render)** — second renderer against the same pass. Tests whether the abstraction generalizes (the named success criterion in [../mission-graph.md](../mission-graph.md#c2)).

- **A2UI runtime emission (post-C5/C6)** — natural fit. A2UI's wire format is roughly "declarative tree of components from a catalog"; the pre-emit pass already produces an annotated tree.

### What this constrains

- **Existing emitter implementations** refactor in the F1+C1 work. Mostly cosmetic — the tree walk pattern stays the same, just wrapped in `runPreEmit`. Quality bar: every existing E2E gate still passes after the refactor (no behavior change for current React/Vue/HTML codegen).

- **Per-emitter idioms stay flexible.** The pre-emit pass does NOT impose a specific JSX style or a Vue template style; it only normalizes the tree walk + annotations.

- **Output schema diversification.** `CodegenResult` was sized for source-code output. New emitters (boxes/wireframe/A2UI) likely need new result shapes. Plan: keep `CodegenResult` for source-code emitters; introduce `RenderResult` / `A2UIResult` for non-code emitters, sharing a `RenderBase` interface with `status`, `warnings`, `errors`, `meta`.

### Cost estimate (sessions)

- Refactor existing 3 emitters to consume PreEmitContext: ~1 session per emitter = **3 sessions**
- Implement `runPreEmit()` with annotation enrichment: **1-2 sessions**
- C1 (boxes-and-arrows) first impl + E2E gate: **2-3 sessions**
- C2 (wireframe) second impl + E2E gate: **2 sessions**
- Total to "two new fidelities live, abstraction validated": **~8-10 sessions**

The alternative (Option B — full IR upfront): unknown upfront cost (probably 5+ sessions of design + 5+ of migration) before any new fidelity ships. The hybrid path ships faster *and* keeps the IR option open.

---

## Open Sub-Questions

1. **Where does the brand overlay resolution happen?** The pre-emit pass could resolve `oods.render.brand_overlay` (from D1) to a concrete token map, OR it could pass the brand identifier through and let each emitter resolve. Likely the former (resolve once, emitters consume tokens), but the implementation memo for `runPreEmit()` should pin this.

2. **Are projection_variants resolved in the pre-emit pass or before it?** The Object Catalog (from D1) has `projection_variants[]` discriminated by surface/brand/role/etc. Options:
   - **Resolve before pre-emit:** caller picks one variant; pass operates on a single tree
   - **Resolve inside pre-emit:** pass takes a discriminator (`{surface: 'desktop'}`) and selects internally
   - **Resolve in emitter:** some emitters might want to render multiple variants side-by-side (boxes-and-arrows view of "desktop AND mobile")
   
   Recommendation: variant resolution happens *before* pre-emit by default (single tree in, single render out); the emitter can call the pre-emit pass multiple times for multi-variant projections.

3. **Server-side render vs. client-side render for A2UI emission?** A2UI's wire format is server-side (the agent emits, the host renders). But Forge could *also* serialize a pre-emitted tree for inspection in playground (client-side). Both paths use the same A2UI emitter; the only difference is the consumer. Decision deferred until A2UI emission lands (post-C5/C6).

4. **Tailwind support across new fidelities.** Today's emitters share tailwind helpers. For boxes-and-arrows (SVG-based), Tailwind doesn't directly apply. For wireframe (HTML-based), it does. The pre-emit pass should expose token-resolved styles in a *renderer-agnostic* form, and emitters that target Tailwind class strings derive them; emitters that target inline styles or SVG attributes derive those instead.

5. **Persistence of PreEmitContext.** Today's UiSchema is persisted (`compose-{hash}` refs in `.oods/schemas/`). Should the PreEmitContext also persist as an artifact, for re-emission without re-walking? Probably yes for performance, but not in v0.1. Defer to a Q-track quality mission when emit-time becomes a bottleneck.

---

## References

**Forge codegen surface (today's pattern):**
- [packages/mcp-server/src/codegen/types.ts](packages/mcp-server/src/codegen/types.ts) — `Emitter` type signature
- [packages/mcp-server/src/codegen/react-emitter.ts](packages/mcp-server/src/codegen/react-emitter.ts) — reference emitter implementation
- [packages/mcp-server/src/codegen/vue-emitter.ts](packages/mcp-server/src/codegen/vue-emitter.ts)
- [packages/mcp-server/src/codegen/html-emitter.ts](packages/mcp-server/src/codegen/html-emitter.ts)
- [packages/mcp-server/src/codegen/binding-utils.ts](packages/mcp-server/src/codegen/binding-utils.ts) — slot binding helpers (the seed of the pre-emit pass)
- [packages/mcp-server/src/codegen/tailwind-codegen-utils.ts](packages/mcp-server/src/codegen/tailwind-codegen-utils.ts) — Tailwind-specific helpers (the second shared pass candidate)
- [packages/mcp-server/src/tools/pipeline.ts](packages/mcp-server/src/tools/pipeline.ts) — pipeline orchestration

**Object Catalog spec (the input):**
- [D1-object-catalog-schema.md](D1-object-catalog-schema.md) — Object Catalog as SemanticEntity-extended kernel with `oods.render` extension

**External pattern reference (the destination):**
- A2UI v0.9 wire format (Google, Dec 2025) — the runtime declarative-tree target. Reference: web research conducted 2026-05-09 ([../strategic-position.md](../strategic-position.md#where-the-field-is-heading)).
- Storybook Component Manifest format (Storybook MCP, Q4 2025) — Component manifest pattern for agent-readable component descriptions.

**Prior architectural decisions:**
- Stage1 v1.6.0 ConfidenceDecomposition normalizer at [packages/mcp-server/src/stage1/capability-normalizer.ts](packages/mcp-server/src/stage1/capability-normalizer.ts) — pattern for unwrapping nested structured data while preserving optional fields. The pre-emit pass borrows this pattern for annotation enrichment.

**Planning canon:**
- [../overview.md](../overview.md), [../strategic-position.md](../strategic-position.md), [../mission-graph.md](../mission-graph.md), [../decision-points.md](../decision-points.md), [../quality-bars.md](../quality-bars.md)

---

*Authored 2026-05-10. First implementation pass: refactor existing emitters to consume `runPreEmit()` in F1+C1. Revisit when A2UI runtime emission triggers IR formalization.*
