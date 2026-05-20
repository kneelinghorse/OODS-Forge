# Object Catalog v1.0.0

**Status:** Spec (sprint-96 m01; implementation lands in sprint-97 F1)
**Date:** 2026-05-15
**Implements:** [D1 — Object Catalog Schema Shape](../decisions/D1-object-catalog-schema.md)
**Informs:** [D2 — Multi-Fidelity Render Abstraction](../decisions/D2-multi-fidelity-render.md), [D3 — Forge ↔ Concordance Relationship](../decisions/D3-forge-concordance-relationship.md)
**Gating mission:** F1 (this spec); F2/F3/C1 consume what it defines
**Companion to:** [../mission-graph.md](../mission-graph.md), [../quality-bars.md](../quality-bars.md)

---

## Purpose

The Object Catalog is the central artifact OODS-Forge produces. It is the **declared/canonical** side of the design intelligence loop: A2UI hosts consume it as objects-with-presentations, semantic-federation governs distribution against it, fidelity emitters render from it (D2), and Concordance canonicalizes against it (D3).

D1 settled the shape. This doc translates that decision into a writable spec at version `1.0.0`: the envelope rule, the kernel each entry conforms to, the `oods.*` extension layer Forge authoring tools produce, and the test gates a v1.0.0 catalog must pass.

This is a build-time / authoring-time artifact. Runtime concerns consume *projections* of the Object Catalog, not the full catalog itself.

---

## Contract Surfaces Defined

| Surface | Direction | Consumed by | Producer in Forge |
|---|---|---|---|
| Object Catalog envelope (this spec) | Forge writes | Concordance `/manifests`, A2UI hosts, fidelity emitters, semantic-federation | `design.compose`, `map.apply` outputs, catalog-publish tools (future) |
| `oods.*` entity extension | Forge writes; Concordance ignores | Forge fidelity emitters, `runPreEmit()`, brand overlay resolver | `design.compose`, `code.generate` |
| Catalog version triple (`oods_catalog_version`, `manifest_version`, `schema_version`) | Producer pins all three | Concordance ingest validator, Forge version-policy guard | Pipeline emit |

The catalog is **publishable**. Its shape is positioned for eventual openness from day one (D5 governs *when*).

---

## Envelope (Strict SemanticManifest)

A Forge-emitted Object Catalog is a strict SemanticManifest envelope. The top-level shape conforms to Concordance's published `contracts/manifest.schema.json` and admits **no Forge-only fields at the root**:

| Root property | Required | Source | Notes |
|---|---|---|---|
| `manifest_version` | yes | Concordance SemanticManifest protocol version | Pinned to `"4.0"` for catalog v1.0.0 |
| `schema_version` | optional | Concordance wire-contract version | Pinned to `"1.1.0"` after Concordance sprint-13 |
| `source` | yes | Producer attribution (object) | Carries `oods_catalog_version` (see below) |
| `entities` | yes | Array of SemanticEntity | Where the catalog content lives |
| `relationships` | optional | Array of top-level TypedRelationship | Cross-entity edges that don't live inside an entity |

The Concordance schema declares `additionalProperties: false` at the SemanticManifest root. Adding a Forge-only key at the root (e.g., `oods_catalog_version` next to `manifest_version`) would fail Concordance validation and forfeit the zero-translation property. **This is non-negotiable.**

### Where catalog metadata lives instead

Catalog version `1.0.0` is carried in two places, both inside fields that admit extension:

1. **`source.oods_catalog_version`** — the producer-attribution object, which Concordance schemas declare with `additionalProperties: true`. This is the load-bearing pin: a single Forge-emitted catalog stamps its version once at the source level so consumers can read it without entity-level iteration.
2. **`entities[].oods.catalog.version`** — entity-level repetition for catalogs that mix entries from multiple OODS catalog versions (rare, but possible for staged migrations or cross-workspace assemblies).

The only new top-level field after concordance sprint-13 is Concordance's own optional `schema_version`. Forge does not introduce additional root-level fields.

---

## Entity Kernel

Each `entities[i]` is a `SemanticEntity` per `contracts/manifest.schema.json` v1.0.0 (wire 1.1.0). The kernel shape is mandatory; Forge contributes content but does not redefine fields. Required and notable optional fields:

| Field | Required | Notes |
|---|---|---|
| `urn` | yes | `urn:proto:semantic:<id>@<version>` — pinned by URN regex in the kernel |
| `element.type` | yes | Dotted kind (e.g. `ui.surface.card`, `ui.control.button`) |
| `element.name` | yes | Human-legible name |
| `element.object` | conditional | Required when `pragmatic_role` is an action role |
| `element.action` | conditional | Same conditional as `element.object` |
| `semantics.purpose` | yes | Verb-form short label |
| `semantics.human_meaning` | yes | Sentence-form description |
| `pragmatic_role` | optional | From the closed enum (`pragmatic-roles.json`) |
| `states`, `preconditions`, `effects` | optional | String arrays; deferred state-reference resolution at ingest time |
| `traits` | optional | OODS trait identifiers |
| `context` | optional | `additionalProperties: true` — domain/surface/role discriminators live here |
| `locations` | optional | Concordance-style code/docs/test/figma locators |
| `evidence_refs` | optional | EvidenceRef objects with `provenance: declared` for Forge-canonical contributions |
| `relationships.edges` | optional | Per-entity TypedRelationships |

`SemanticEntity`, `TypedRelationship`, and `EvidenceRef` all declare `additionalProperties: true` in the kernel schema. The `oods.*` extension takes that affordance.

---

## The `oods.*` Extension Layer

Forge contributes a single namespaced object `oods` on each entity. The five sub-objects below cover D1's named extension surface. **Each is additive: removal at v1.x requires a v2.0 major bump.**

### `oods.catalog`

```jsonc
{
  "version": "1.0.0"           // entity-level repetition of source.oods_catalog_version
}
```

Used for cross-version catalog assemblies; usually matches `source.oods_catalog_version`. A v1 fixture omitting this falls back to the source-level pin.

### `oods.render` — load-bearing for runPreEmit() (D2)

The render annotation layer is the input contract for D2's `runPreEmit()` pass. Every fidelity emitter (boxes, wireframe, branded, React/Vue/HTML codegen, A2UI runtime) consumes a `PreEmitContext` produced from these fields plus the kernel's pragmatic/semantic/relational annotations.

```jsonc
{
  "ui_schema_ref": "compose-abc123",   // Forge UiSchema persistence ref (.oods/schemas/)
  "slots": [
    { "name": "avatar",   "binding": { "field": "user.photo_url" } },
    { "name": "title",    "binding": { "field": "user.display_name" } },
    { "name": "subtitle", "binding": { "field": "user.email" } }
  ],
  "brand_overlay": "brand-a"           // brand identifier resolved at pre-emit time
}
```

**Load-bearing fields for `runPreEmit()` (D2):**

- `ui_schema_ref` — the persisted UiSchema this render annotation projects from. `runPreEmit()` resolves the ref and walks the tree.
- `slots[].name`, `slots[].binding.field` — slot resolution feeds `binding-utils.ts` outputs into the PreEmitContext. The slot list is the canonical shape every renderer sees, not the raw UiSchema tree.
- `brand_overlay` — resolved by `runPreEmit()` to a concrete token map once per emit (D2 open sub-question 1). Emitters consume tokens, not brand identifiers.

Anything else under `oods.render` (future hints like `density`, `mode`, `a11y_overlays`) is renderer-discretionary and may be ignored by `runPreEmit()` without breaking the contract.

### `oods.projection_variants[]` — load-bearing for runPreEmit() (D2)

Surface/brand/role/density variants of the same canonical concept. Each variant is a render projection, not a separate URN.

```jsonc
[
  {
    "surface": "desktop",
    "ui_schema_ref": "compose-abc123",
    "slots": [ /* same shape as oods.render.slots */ ],
    "brand_overlay": "brand-a"
  },
  {
    "surface": "mobile",
    "ui_schema_ref": "compose-def456",
    "slots": [ /* mobile-specific bindings */ ],
    "brand_overlay": "brand-a"
  }
]
```

**Load-bearing fields for `runPreEmit()` (D2):**

- `surface` — the closed-enum discriminator v1 ships with. Per D2 open sub-question 2, variant resolution happens *before* `runPreEmit()` by default: the caller picks one variant and the pass operates on a single tree. Emitters that want side-by-side multi-variant projection call `runPreEmit()` multiple times.
- `ui_schema_ref`, `slots`, `brand_overlay` — same contract as `oods.render`.

Closed-enum extensions to the discriminator axis (`role`, `density`, `mode`) are tracked as follow-on decisions; v1.0.0 ships `surface` only and the field is `additionalProperties: true` so future axes do not require a major bump.

### `oods.confidence_decomposition` — matches Stage1 v1.6.0 shape

Carries the Stage1 ConfidenceDecomposition unwrap pattern verbatim. The catalog re-emits this when a CatalogObject was synthesized from Stage1 reconciliation evidence; Forge's `unwrapConfidenceTotal()` helper produces a scalar `total` and preserves the signal list.

```jsonc
{
  "total": 0.92,
  "signals": [
    { "name": "trait_membership", "score": 0.91, "hint": "Identifiable" },
    { "name": "evidence_chain",   "score": 0.95, "hint": "Stage1 run a0300dc0" }
  ]
}
```

This field is consumed by review/recovery workflows (C3) and is **not** an input to `runPreEmit()`. It travels with the entity for downstream observability and operator review.

### `oods.evidence_chain` — declared/inspected provenance

Cross-source evidence trail that complements the kernel's `evidence_refs[]`. The kernel ref carries one observation at a time; the chain carries the per-source rollup for fast operator review.

```jsonc
[
  { "source": "stage1",      "run_id": "a0300dc0", "match_score": 0.88 },
  { "source": "concordance", "urn": "urn:proto:semantic:user-profile-card@1.0.0",
    "context_pack_recipe": "semantic_location" }
]
```

`oods.evidence_chain` summarizes; `entity.evidence_refs[]` carries the canonical per-observation record. Forge-declared canonical contributions still land in `evidence_refs[]` with `provenance: "declared"`.

### Brand overlay references

`oods.render.brand_overlay` and each `oods.projection_variants[].brand_overlay` carry the brand identifier as a string (e.g. `"brand-a"`). D1 open sub-question 1 deferred resolve-at-emit vs. resolve-at-read; v1.0.0 ships resolve-at-pre-emit per D2 (one PreEmitContext per emit pass; emitters consume resolved tokens).

When Forge runs against multiple brand families simultaneously (post-1.0), the same canonical URN may appear with multiple `projection_variants[]` discriminated by `brand_overlay` rather than `surface`. This is structurally available in v1.0.0 but not exercised by initial fixtures.

---

## Versioning Policy

| Version field | Pin at v1.0.0 | Bump policy |
|---|---|---|
| `source.oods_catalog_version` (+ entity `oods.catalog.version`) | `"1.0.0"` | Additive within minor (`1.x`); breaking requires `2.0.0` |
| `manifest_version` | `"4.0"` | Tracks Concordance SemanticManifest protocol version |
| `schema_version` | `"1.1.0"` (optional emission) | Tracks Concordance wire-contract version; **warn-and-continue** on minor mismatch, **fail-loud** on major mismatch |
| Per-URN versions (`urn:proto:semantic:foo@1.0.0`) | per-concept | `@1.x` for additive presentation; `@2.x` for breaking redesigns |

**Quality-bar alignment** ([../quality-bars.md](../quality-bars.md)): additive-only stable contracts; graceful version rejection for unsupported versions; cross-project bumps coordinated via `cmos_message`.

**Coordination with Concordance:** any `manifest_version` or `schema_version` bump is pre-registered through F2's contract-gate before Forge's emitter starts producing the new shape. The pattern carries forward from sprints 91–94.

---

## Fixture Targets (v1.0.0)

At least three production-shape fixtures land alongside this spec in F1 implementation. They are chosen to exercise the kernel's conditional fields, the projection_variants axis, and the evidence_chain summary.

| Fixture | URN | Why this entry |
|---|---|---|
| **User** | `urn:proto:semantic:user-profile-card@1.0.0` | Exercises `oods.render` slots + `projection_variants[]` (desktop/mobile). Informational pragmatic_role. |
| **Product** | `urn:proto:semantic:product-detail-card@1.0.0` | Exercises action-shaped entities (`element.object: "Product"`, `element.action: "add_to_cart"`), plus `pragmatic_role: "primary_action"`. Forces the SEMANTIC §6 conditional. |
| **Subscription** | `urn:proto:semantic:subscription-summary-row@1.0.0` | Exercises `relationships.edges[]` (`renews_to`, `bills_from`) and a non-trivial state list (`active`, `paused`, `cancelled`). |

Fixture additions in sprint-97 (F1 implementation) may add an Account or Order shape; v1.0.0 ships with the three above as the minimum.

### Schema.org alignment for content domain pack (sprint-102 m01 — landed)

The content/publishing domain pack added in sprint-102 m01 (Article / Author / Comment, plus a multi-entity content-pack manifest) carries Schema.org URIs in each entity's `context.schemaorg` field, so Concordance can canonicalize against this pack when real evidence accrues.

| Entity URN | Schema.org URI |
|---|---|
| `urn:proto:semantic:article-detail@1.0.0` | [`https://schema.org/Article`](https://schema.org/Article) |
| `urn:proto:semantic:author-profile@1.0.0` | [`https://schema.org/Person`](https://schema.org/Person) |
| `urn:proto:semantic:comment-threaded@1.0.0` | [`https://schema.org/Comment`](https://schema.org/Comment) |

`context.schemaorg` is a renderer-discretionary field — it does not affect runPreEmit() output or any current emitter behavior. It exists as a future grounding pointer for canonical-shape mining: when Concordance evidence accrues against these URNs, the Schema.org URI provides a canonical external referent for shape reconciliation. The field rides on `context.additionalProperties: true` and is safe to add without a major version bump.

### Fixture and schema file locations (sprint-97 F1 — landed)

| Artifact | Path |
|---|---|
| JSON Schema for the SemanticManifest envelope + `oods.*` extension (Forge-authored) | [`packages/mcp-server/src/object-catalog/schema.json`](../../../packages/mcp-server/src/object-catalog/schema.json) |
| Vendored Concordance `manifest.schema.json` (for G1 byte-parity) | `packages/mcp-server/src/concordance/contracts/manifest.schema.json` *(lands in sprint-97 F2 via `diverge-and-concord/bin/sync-contracts.sh`)* |
| TypeScript types (mirror of `schema.json`) | [`packages/mcp-server/src/object-catalog/types.ts`](../../../packages/mcp-server/src/object-catalog/types.ts) |
| Production-shape fixtures | [`packages/mcp-server/src/object-catalog/fixtures/user.json`](../../../packages/mcp-server/src/object-catalog/fixtures/user.json), [`product.json`](../../../packages/mcp-server/src/object-catalog/fixtures/product.json), [`subscription.json`](../../../packages/mcp-server/src/object-catalog/fixtures/subscription.json) |
| Gate tests (G1/G2/G3 in one file) | [`packages/mcp-server/src/object-catalog/gates.test.ts`](../../../packages/mcp-server/src/object-catalog/gates.test.ts) |

The fixtures live under `src/object-catalog/fixtures/` rather than `test/fixtures/catalog/` because the schema, types, fixtures, and gate tests form a single co-located authoring artifact. The E2E gate (G3 round-trip against local Concordance) lands in sprint-97 F2/F3 and discovers fixtures via this directory, not by `test/fixtures/` pattern.

#### Minimal at-a-glance fixture shape

The shape below is taken from [`fixtures/user.json`](../../../packages/mcp-server/src/object-catalog/fixtures/user.json) (`pragmatic_role: informational`, no SEMANTIC §6 conditional fired). See the file for the full shape; this snippet is the inline reading aid.

```jsonc
{
  "manifest_version": "4.0",
  "schema_version": "1.1.0",
  "source": {
    "agent": "oods-forge",
    "stage": "compose",
    "captured_at": "2026-05-15T00:00:00.000Z",
    "oods_catalog_version": "1.0.0"   // load-bearing pin (D1)
  },
  "entities": [
    {
      "urn": "urn:proto:semantic:user-profile-card@1.0.0",
      "element": { "type": "ui.surface.card", "name": "User profile card" },
      "semantics": { "purpose": "show profile", "human_meaning": "..." },
      "pragmatic_role": "informational",
      // ... kernel fields (states/preconditions/effects/traits/context/locations/evidence_refs)
      "oods": {                       // additionalProperties:true on SemanticEntity makes this legal
        "catalog": { "version": "1.0.0" },
        "render": {                   // load-bearing for runPreEmit() — D2
          "ui_schema_ref": "compose-user-profile-desktop",
          "slots": [
            { "name": "avatar",   "binding": { "field": "user.photo_url" } },
            { "name": "title",    "binding": { "field": "user.display_name" } },
            { "name": "subtitle", "binding": { "field": "user.email" } }
          ],
          "brand_overlay": "brand-a"
        },
        "projection_variants": [      // load-bearing for runPreEmit() — D2
          { "surface": "desktop", "ui_schema_ref": "compose-user-profile-desktop", "slots": [/*…*/], "brand_overlay": "brand-a" },
          { "surface": "mobile",  "ui_schema_ref": "compose-user-profile-mobile",  "slots": [/*…*/], "brand_overlay": "brand-a" }
        ]
      }
    }
  ]
}
```

The Product fixture exercises action-shaped entities (`element.object` + `element.action` + `pragmatic_role: primary_action` — fires SEMANTIC §6 in `schema.json`'s `allOf`). The Subscription fixture exercises `relationships.edges[]` (`renews_to`, `depends_on`) and the multi-state list (`active`, `paused`, `cancelled`).

---

## Test Gates (named before code)

Quality-bars rule: real-data E2E gates for every output surface; pre-registered shapes ahead of partner emitter readiness. The v1.0.0 catalog ships with three gates spanning unit, contract, and E2E layers.

### G1 — Concordance manifest validation (contract)

**What:** A Forge-emitted Object Catalog fixture passes Concordance's `manifest.schema.json` v1.0.0 (wire 1.1.0) under strict validation with `additionalProperties: false` at the root enforced.

**Why:** This is the load-bearing root rule. If any test passes with a Forge-only key at the root, the zero-translation property is dead.

**How:** AJV against the vendored `manifest.schema.json`. Negative case: a fixture with a root-level `catalog_version` field MUST fail with a clear `additionalProperties` error.

### G2 — Forge extension validation (contract)

**What:** The `oods.*` extension on each entity passes Forge's own `oods-extension.schema.json` with severity-tagged validators (`error` for missing required sub-objects, `warn` for renderer-discretionary fields).

**Why:** D1 names additive-only discipline on the extension layer. A separate validator catches drift before Concordance does (which would ignore `oods.*` silently — failing here is the only way to catch malformed extension content).

**How:** AJV against Forge-authored schema. Required: `oods.render.ui_schema_ref` + `oods.render.slots[]` for any entity with `oods.render`. Required: `oods.projection_variants[].surface` for any variant entry. Severity-tagged so future fields can be `warn` until they stabilize.

### G3 — Round-trip fixture hash stability (E2E)

**What:** A Forge-emitted Object Catalog fixture POSTs to local Concordance `/manifests`; the response reports `ingested_entities === entities.length`; a follow-up `GET /entities/{urn}` for each entity returns a hash-stable canonical declaration that matches the input kernel byte-for-byte (excluding `oods.*`, which Concordance does not echo).

**Why:** Locks in the bidirectional discipline named in [../quality-bars.md](../quality-bars.md). One-way ingest tests prove half the surface. Round-trip catches lossy translation immediately.

**How:** Bootstrap recipe in D3 (`concordance serve --port 8787` from a checkout of `diverge-and-concord`). The test runs against local Concordance for sprint-97 F1; the hosted preflight (sprint-96 m03) adds unauthenticated probes on top, and authenticated round-trip lands in I1 once the Bearer key is issued.

### Negative gates (also named)

- Any fixture with a Forge-only key at the manifest root MUST fail G1.
- Any fixture omitting `entities[].oods.render.ui_schema_ref` when `oods.render` is present MUST fail G2.
- Any round-trip where Concordance's `/entities/{urn}` returns drift from the canonical-input kernel (post-`oods.*` strip) MUST fail G3.

---

## What This Spec Does NOT Cover

- **The `runPreEmit()` implementation.** This spec names the load-bearing fields runPreEmit() consumes; the pass itself is a D2/C1 deliverable.
- **The Concordance HTTP client + version policy enforcement.** Lives in F2 / [concordance-integration.md](./concordance-integration.md) (sprint-96 m02).
- **The bidirectional MCP read/write surface contracts.** Lives in F3 / [bidirectional-mcp.md](./bidirectional-mcp.md) (sprint-96 m04). This spec names the catalog's writability shape; the tool surface is named there.
- **Brand overlay token resolution.** Resolved at `runPreEmit()` per D2; the catalog only carries the `brand_overlay` identifier string.
- **Cross-corpus queries or catalog snapshots vs. streaming ingest.** Deferred per D3 open sub-questions 2 and 3.
- **Non-UI entity types (api/data/event/workflow).** Structurally available in the kernel; Forge's v1.0.0 fixtures ship UI-first per D1 open sub-question 5.

---

## Open Sub-Questions Carried Forward

These were not closed in this spec because they require more implementation evidence or live integration data. Each one is named so it does not get re-opened from scratch later.

1. **Projection variant discriminator axes beyond `surface`.** D1 open sub-question 3. v1.0.0 ships `surface` only; `role`, `density`, `mode` are tracked but require closed-enum lists before adoption.
2. **Brand overlay representation: per-CatalogObject vs. per-variant.** D1 open sub-question 1. v1.0.0 supports both; the choice point only matters once ≥2 brand families exist in Forge.
3. **CatalogObject grouping by domain.** D1 open sub-question 2. Likely belongs in `registry.snapshot` indexing rather than a catalog-side `domain_groups[]`.
4. **PreEmitContext persistence.** D2 open sub-question 5. Not in v1.0.0; revisit when emit-time becomes a measurable bottleneck.
5. **CatalogObject for non-UI entities.** D1 open sub-question 5. Hold until semantic-federation or agent-vitals surfaces the need.

---

## References

**Decision memos (spine):**
- [D1 — Object Catalog Schema Shape](../decisions/D1-object-catalog-schema.md) — the decision this spec implements
- [D2 — Multi-Fidelity Render Abstraction](../decisions/D2-multi-fidelity-render.md) — names `oods.render` and `oods.projection_variants` as runPreEmit() inputs
- [D3 — Forge ↔ Concordance Relationship](../decisions/D3-forge-concordance-relationship.md) — confirms wire 1.1.0 + zero-translation property, externally ratified 2026-05-12
- [D4 — Forge ↔ Federation Integration](../decisions/D4-forge-federation-integration.md) — write-side gates apply at mutation boundaries on this catalog shape

**Concordance contracts (vendoring targets):**
- [contracts/manifest.schema.json](file:///Users/systemsystems/portfolio/Design-Tools/diverge-and-concord/contracts/manifest.schema.json) — SemanticManifest envelope, additionalProperties=false at root
- [contracts/pragmatic-roles.json](file:///Users/systemsystems/portfolio/Design-Tools/diverge-and-concord/contracts/pragmatic-roles.json) — closed enum
- [contracts/edge-types.json](file:///Users/systemsystems/portfolio/Design-Tools/diverge-and-concord/contracts/edge-types.json) — relationship taxonomy
- [contracts/task-types.json](file:///Users/systemsystems/portfolio/Design-Tools/diverge-and-concord/contracts/task-types.json) — resolver weight defaults
- [contracts/recipes/*.json](file:///Users/systemsystems/portfolio/Design-Tools/diverge-and-concord/contracts/recipes/) — 4 context-pack recipes
- [contracts/api/*.schema.json](file:///Users/systemsystems/portfolio/Design-Tools/diverge-and-concord/contracts/api/) — 7 read-endpoint request/response schemas

**Concordance ratification:**
- [2026-05-12 inbound message](../../messages/inbound/2026-05-12-concordance-response.md) — D1+D3 absorbed; SemanticEntity-extension verified on the wire

**Planning canon:**
- [../overview.md](../overview.md), [../mission-graph.md](../mission-graph.md), [../quality-bars.md](../quality-bars.md), [../decision-points.md](../decision-points.md), [../strategic-position.md](../strategic-position.md), [../stack-map.md](../stack-map.md), [../glossary.md](../glossary.md)

**Roadmap:**
- [../roadmap/near.md](../roadmap/near.md) — sprint-96 mission shape

---

*Authored 2026-05-15 (sprint-96 m01). Spec only — no implementation code lands in this sprint. F1 implementation pass (JSON Schema authoring, TypeScript types, fixture creation, G1/G2/G3 test wiring) lands in sprint-97. Updates after F1 close if implementation surfaces edge cases.*
