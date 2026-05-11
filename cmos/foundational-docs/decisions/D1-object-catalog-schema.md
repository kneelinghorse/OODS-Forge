# D1 — Object Catalog Schema Shape

**Status:** Decided (subject to first-pass implementation validation in F1 mission)
**Date:** 2026-05-10
**Authors:** Derek
**Supersedes:** the abstract A/B/C framing in [../decision-points.md](../decision-points.md#d1)

---

## Context

The Object Catalog is the central artifact OODS-Forge produces. Every downstream consumer keys off it:
- A2UI hosts consume it as a catalog of objects-with-presentations
- semantic-federation governs distribution against it
- Fidelity emitters render from it (decision [D2](D2-multi-fidelity-render.md))
- Concordance canonicalizes against it as the **declared/canonical side of the loop** (per [`concordance/docs/oods-foundry-integration.md`](file:///Users/systemsystems/portfolio/Design-Tools/diverge-and-concord/concordance/docs/oods-foundry-integration.md))
- divergent-inspector emits SemanticEntities for the **actual/inspected side** of the loop

What this decision was missing — and now isn't — is that **concordance has already published a stable v1.0.0 wire contract with a structurally complete schema** (`contracts/manifest.schema.json`, manifest_version `4.0`). The schema was tagged in concordance's Sprint 12 m02 after 5 sprints of byte-identical zero-drift scoring and four shipped recipes (`semantic_location`, `debug_or_explain`, `modify_ui_copy`, `action_eligibility`).

That changes the decision. We are not designing the Object Catalog schema from scratch. We are deciding **how OODS-Forge's Object Catalog relates to the SemanticEntity schema that concordance ingests**.

---

## What's at stake if we get it wrong

Three failure modes, increasing in cost:

1. **Parallel schemas that don't round-trip** — Forge emits an Object Catalog in one shape; concordance ingests SemanticManifests in another shape; integration requires translation that loses fidelity. Costs: lossy translation, double-validation, divergent vocabularies, sclerotic versioning.

2. **Forge's schema as a thin wrapper around SemanticEntity** — solves round-trip but inherits concordance's resolver semantics into Forge's authoring tools whether we want them or not. Costs: less flexibility on rendering hints, codegen bindings, brand overlays, projection_variants.

3. **Forge's schema explicitly extends SemanticEntity with declared additions** — best of both. Costs: discipline cost of maintaining the contract — additive only, validators on both sides.

---

## Options

### Option A — Single canonical shape per Object (original framing)

One schema per concept (User has one schema; Subscription has one schema). Simple to validate, clear governance.

**Rejected because:**
- The architectural reality already implicit in `projection_variants[]` and the Stage1 v1.6.0 ConfidenceDecomposition normalizer is that the *same* concept renders differently per surface (desktop/mobile), brand (acme/dark/light), role (admin/customer), and confidence-decomposed evidence path. Forcing one shape per concept breaks this.
- Concordance's manifest model already permits multiple entities per concept distinguished by URN (`urn:proto:semantic:user-checkout-button@4.0.0` vs `urn:proto:semantic:user-profile-button@4.0.0`). A single-shape Object Catalog would lose this expressivity.
- The user's own TraceLab research surfaces the "Taxonomizable vs Taggable" microcosm — the field has *families with discriminators*, not single canonical types. Concordance was built that way.

### Option B — Shape family with discriminators (recommended)

The base shape is concordance's `SemanticEntity`. OODS-Forge extends with declared additions for rendering, codegen, and brand. Shape families emerge as either (a) multiple URNs distinguished by `element.object`/`element.action`/`context`, or (b) `variants[]` arrays on a single entity discriminated by `surface`/`brand`/`role`.

**This is the recommended option.** Detail below.

### Option C — Hybrid (canonical core + opt-in variant layer)

Defer the call: ship a "canonical core" schema and let variants be optional extensions. This was rejected in [../decision-points.md](../decision-points.md#d1) for defaulting away from the actual question, and the concordance evidence reinforces that rejection — concordance already shipped with first-class variant support via URN versioning + entity multiplicity.

---

## Recommendation

**Option B — Object Catalog as a SemanticEntity-extended kernel with shape families implemented via URN multiplicity + a Forge extension layer.**

### Specifically

The OODS Object Catalog is a versioned collection of **CatalogObject** entries. Each CatalogObject is a SemanticEntity-compatible payload (passes `manifest.schema.json` v4.0 validation) plus a Forge-specific **render** annotation layer that's invisible to concordance ingestion.

```jsonc
{
  "catalog_version": "1.0.0",   // OODS Object Catalog spec version
  "manifest_version": "4.0",    // concordance SemanticManifest version we conform to
  "source": {
    "agent": "oods-forge",
    "stage": "compose",
    "captured_at": "2026-05-10T..."
  },
  "entities": [
    {
      // SemanticEntity-shaped — passes concordance ingestion validation
      "urn": "urn:proto:semantic:user-profile-card@1.0.0",
      "element": { "type": "ui.surface.card", "name": "User profile card", "object": "User" },
      "semantics": { "purpose": "show profile", "human_meaning": "..." },
      "pragmatic_role": "informational",
      "states": ["enabled", "loading", "error"],
      "preconditions": ["user.authenticated"],
      "effects": [],
      "traits": ["Identifiable", "Avatarable"],
      "context": { "domain": "account", "surface": "desktop" },
      "locations": [],
      "evidence_refs": [
        { "id": "ev_1", "protocol": "pragmatic", "kind": "manifest_declaration",
          "locator": "self", "weight": 1.0, "provenance": "declared", ... }
      ],
      "relationships": { "edges": [...] },

      // OODS-Forge extension layer (Forge-specific, additionalProperties: true allows this)
      "oods": {
        "render": {
          "ui_schema_ref": "compose-abc123",         // Forge's existing UiSchema persistence
          "slots": [
            { "name": "avatar", "binding": { "field": "user.photo_url" } },
            { "name": "title", "binding": { "field": "user.display_name" } },
            { "name": "subtitle", "binding": { "field": "user.email" } }
          ],
          "brand_overlay": "brand-a"                  // brand identifier
        },
        "projection_variants": [
          { "surface": "desktop", "ui_schema_ref": "compose-abc123", ... },
          { "surface": "mobile",  "ui_schema_ref": "compose-def456", ... }
        ],
        "confidence_decomposition": {                 // matches Stage1 v1.6.0 shape
          "total": 0.92,
          "signals": [...]
        },
        "evidence_chain": [                           // ties back to Stage1 / divergent-inspector observations
          { "source": "stage1", "run_id": "...", "match_score": 0.88 },
          { "source": "concordance", "urn": "urn:proto:semantic:...", "context_pack_recipe": "semantic_location" }
        ]
      }
    }
  ]
}
```

### Why this shape

1. **Reuses an already-validated schema design.** SemanticEntity has been pressure-tested through 5 sprints of zero-drift scoring and 7 stable read endpoints. Building a parallel schema would forfeit that work.

2. **Speaks concordance's URN system natively.** A Forge-emitted Object Catalog is a valid `SemanticManifest`. We can POST it to concordance's `/manifests` endpoint without translation, getting OODS-Forge's canonical declarations into concordance's corpus for free.

3. **Honors the canonical/inspected bilateral.** The `evidence_refs[]` shape already distinguishes `declared` (Forge's canonical contribution) from `inferred`/`candidate`/`verified` (divergent-inspector/Stage1's evidence). When concordance ingests both sides, the provenance is preserved.

4. **Implements shape families cleanly via three layers:**
   - **URN multiplicity** for fundamentally different concepts (different `element.object` or `element.action`)
   - **`projection_variants[]` array** for surface/brand/role variants within the same concept (extends what Stage1 v1.6.0 already gives us)
   - **`context` field discriminators** for situational variation (domain, flow, step)

5. **Preserves Forge's rendering hints in a namespaced extension.** The `oods` key is "additional property" from concordance's view (the schema explicitly allows `additionalProperties: true` on SemanticEntity). Concordance ingests SemanticEntity validity without caring about `oods`; Forge's pipeline consumes `oods` to drive codegen. **No translation cost. No fidelity loss.**

6. **Supports the bidirectional-MCP claim.** A Forge Object Catalog entry IS a SemanticEntity. Forge can READ entities from concordance (canonical declarations come from us; inspections come back enriched with evidence). Forge can WRITE entities to concordance (every `map.apply` produces a SemanticEntity-shaped delta). The "first writable design-system MCP" framing (mission F3) lands cleanly on top of this design.

7. **Inherits concordance's validator discipline.** SemanticEntity has hard validators (`element.object_action_present`, `pragmatic_role.in_enum`, `state.references_resolve` with deferred-queue semantics, `evidence.shape`, etc.). Forge reuses these for free at ingestion time. We add Forge-specific validators on the `oods` extension only.

### Versioning policy

- **`catalog_version`** is the OODS Object Catalog spec version. Starts at `1.0.0`. Additive minor bumps for new optional fields under `oods.*`. Major bumps for any breaking change to the extension layer.
- **`manifest_version`** tracks concordance's SemanticManifest version. We adopt v4.0 at v1.0.0 of our catalog. Coordinated bumps via the cross-project plan.md protocol when concordance bumps.
- **`urn` versions** track per-concept evolution (e.g., `urn:proto:semantic:user-profile-card@1.0.0` → `@1.1.0` for additive presentation changes; `@2.0.0` for breaking redesigns).
- **Validators on the `oods` extension** ship with the schema and emit `severity: error | warn` (matching concordance's pattern).

### What this is NOT

- **NOT a thin wrapper around SemanticManifest.** It's a co-equal artifact with its own spec version and validators on the extension layer.
- **NOT a parallel competing format.** It's strictly additive: every Object Catalog entry is a valid SemanticEntity.
- **NOT a runtime contract.** It's a build-time / authoring-time artifact. Runtime concerns (A2UI host rendering, agent-vitals telemetry) consume *projections* of the Object Catalog, not the full catalog itself.
- **NOT proprietary.** The shape is publishable. Decision [D5](../decision-points.md#d5) (public-vs-private boundary mechanics) governs *when*; the design itself is positioned for eventual openness from day one.

---

## Implementation Implications

### What this unblocks

- **F1 mission (Object Catalog spec v0.1)** — implementation can now start. F1 ships:
  - JSON Schema + TypeScript types for CatalogObject + the `oods` extension layer
  - At least 3 production-shape fixtures (User, Product, Subscription)
  - Validators on the extension layer
  - Test gate: a Forge-emitted Object Catalog passes concordance's `manifest.schema.json` validation
  - Test gate: a concordance `/manifests` POST round-trips a Forge-emitted catalog with `ingested_entities: N` matching catalog `entities.length`

- **F2 mission (concordance ingestion contract)** — sister mission to F1. Pre-registers a Forge-side `semantic-manifest.json` consumer (validator + types + tests) before concordance v1.0.0 is wired to live integration. Sprint-91 contract-gate pattern.

- **F3 mission (bidirectional MCP framing)** — the public claim sharpens. "Forge is the first writable design-system MCP" becomes concrete: Forge's `map.apply` / `map.create` / `registry.snapshot` tools all read and write SemanticEntity-compatible payloads. External integrators can target the SemanticEntity shape and get OODS-Forge legibility for free.

- **C6 (Registry knowledge model depth, V2 axis #5)** — `disambiguation_decisions`, `preferred_term`, `capability`, `projection_variants` all have a clean home in the existing extension scheme.

- **I1 (concordance live integration)** — pacing eased. F1+F2 land *before* concordance v0.1 is wired live, so the moment concordance's hosted endpoint comes online (their s13+), Forge is already integrated by contract.

### What this constrains

- **D2 (multi-fidelity render abstraction)** — the render abstraction is now bounded: it consumes the `oods.render` slot (and `oods.projection_variants`) from a CatalogObject. The IR question becomes "what does the per-fidelity renderer take as input?" and the answer can keep using `UiSchema` for production code emitters while introducing a wider input for lower fidelities.

- **D3 (Forge ↔ concordance relationship)** — significantly informed but not closed. The schema choice makes "Forge as concordance consumer" or "Forge as concordance peer" both viable; "Forge embeds concordance" becomes less attractive (concordance's indexes are heavy and Forge doesn't need them at codegen time). D3 memo addresses *how* the two talk; D1 ensures *what* they say is compatible.

- **D4 (semantic-federation integration)** — Cedar policy now has a concrete artifact to gate (CatalogObject + projections of it). The view-materialization question (apply policy at distribution time vs. at read time) becomes scoped to projection-by-policy on a known schema.

### What this requires from us going forward

- **Coordination message to concordance** announcing Object Catalog v1.0.0 design intent and confirming SemanticManifest v4.0 compatibility. Sent via `cmos_message` to user `darryl` (see [reference_cross_machine_workflow.md](file:///Users/systemsystems/.claude/projects/-Users-systemsystems-portfolio-Design-Tools-OODS-Foundry-mcp/memory/reference_cross_machine_workflow.md)).
- **Vendoring the contracts** — `bin/sync-contracts.sh` (in diverge-and-concord) is the canonical sync pattern. OODS-Forge keeps its own vendored copy of `manifest.schema.json` + closed enums (`pragmatic-roles.json`, `edge-types.json`, `task-types.json`). When concordance bumps the canonical, we sync.
- **Decision discipline** — every Forge extension to the catalog (anything under `oods.*`) is additive. Removals require a catalog `catalog_version` major bump. Quality-bar already named.

---

## Open Sub-Questions (deferred, not resolved by this memo)

1. **Brand overlay representation in the catalog.** The `oods.render.brand_overlay` field is currently a string identifier ("brand-a"). Should brands resolve at catalog-emit time (one CatalogObject per brand variant) or at read time (one CatalogObject with brand resolution happening downstream)? Decision deferred until we have ≥2 brand families in Forge; today's "Brand A" is the only live brand and the question is academic.

2. **CatalogObject grouping by domain.** Today's Object Catalog is a flat `entities[]` array. Concordance handles cross-entity grouping via URN prefixes and the `context.domain` field. Do we need a Forge-specific `domain_groups[]` for fast lookup at codegen time, or does that belong in `registry.snapshot` indexing? Likely the latter; revisit if codegen time becomes a bottleneck.

3. **Projection_variants discrimination keys.** Today we have `surface` (desktop/mobile/tablet/etc.). Should we also have `role` (admin/customer), `density` (compact/comfortable/spacious), `mode` (light/dark)? Probably yes, but the closed-enum set for each axis is a follow-on decision. F1 ships with `surface` only; adds others as fidelity emitters demand them.

4. **Locations vs. ui_schema_ref.** Concordance's `locations[]` is for documenting where the entity lives across the codebase (code/docs/test/etc.). Forge's `ui_schema_ref` points to a stored UiSchema. These are distinct concerns but can overlap (a `code` location pointing to the rendered output). The relationship gets formalized in the F1 spec, not here.

5. **CatalogObject for non-UI entities.** Concordance's SemanticEntity covers UI, API, data, event, workflow concepts (via the `element.type` namespace). Forge's primary use case is UI, but the schema accommodates API/data/event entities for free. Do we use this affordance now or hold? Hold — F1 ships UI-first, then API entities when an integration with semantic-federation or agent-vitals reveals the need.

---

## References

**Concordance contracts (the spine of this decision):**
- [contracts/manifest.schema.json](file:///Users/systemsystems/portfolio/Design-Tools/diverge-and-concord/contracts/manifest.schema.json) — JSON Schema for SemanticManifest v4.0 (180 lines)
- [contracts/README.md](file:///Users/systemsystems/portfolio/Design-Tools/diverge-and-concord/contracts/README.md) — canonical contract location, sync pattern
- [contracts/fixtures/v0-acceptance.manifest.json](file:///Users/systemsystems/portfolio/Design-Tools/diverge-and-concord/contracts/fixtures/v0-acceptance.manifest.json) — production-shape SemanticManifest example
- [contracts/pragmatic-roles.json](file:///Users/systemsystems/portfolio/Design-Tools/diverge-and-concord/contracts/pragmatic-roles.json) — closed enum (6 values)
- [contracts/edge-types.json](file:///Users/systemsystems/portfolio/Design-Tools/diverge-and-concord/contracts/edge-types.json) — closed relationship taxonomy (17 semantic + 22 operational)
- [contracts/task-types.json](file:///Users/systemsystems/portfolio/Design-Tools/diverge-and-concord/contracts/task-types.json) — resolver weight defaults
- [protocols/SEMANTIC_PROTOCOL.md](file:///Users/systemsystems/portfolio/Design-Tools/diverge-and-concord/protocols/SEMANTIC_PROTOCOL.md) — protocol v4.0 spec, including state-reference deferred resolution semantics

**Concordance integration framing:**
- [concordance/docs/oods-foundry-integration.md](file:///Users/systemsystems/portfolio/Design-Tools/diverge-and-concord/concordance/docs/oods-foundry-integration.md) — concordance's starting position for OODS integration; the canonical/declared vs. actual/inspected framing
- [concordance/docs/concordance-integrator-brief.md](file:///Users/systemsystems/portfolio/Design-Tools/diverge-and-concord/concordance/docs/concordance-integrator-brief.md) — 7 stable endpoints, 4 context-pack recipes, demoable bootstrap

**Forge codebase (the target shape):**
- [packages/mcp-server/src/codegen/types.ts](packages/mcp-server/src/codegen/types.ts) — current `CodegenOptions`, `CodegenResult`, `Emitter` shapes
- [packages/mcp-server/src/codegen/react-emitter.ts](packages/mcp-server/src/codegen/react-emitter.ts) — reference emitter implementation
- [packages/mcp-server/src/tools/pipeline.ts](packages/mcp-server/src/tools/pipeline.ts) — orchestration of compose→validate→render→codegen→save
- Existing Stage1 reconciliation shape in `packages/mcp-server/src/stage1/capability-normalizer.ts` — `ConfidenceDecomposition` unwrap pattern

**Prior planning context:**
- [../overview.md](../overview.md), [../strategic-position.md](../strategic-position.md), [../mission-graph.md](../mission-graph.md) — the planning canon this memo sits inside
- [../decision-points.md](../decision-points.md) — the register where D1 was originally framed (A/B/C options); this memo supersedes the abstract framing with the concrete SemanticEntity-extension recommendation

---

*Authored 2026-05-10. First implementation pass lands in mission F1 of sprint-96 or sprint-97. Memo updates as F1 surfaces edge cases.*
