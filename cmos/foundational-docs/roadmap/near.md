# Near Roadmap

**Status:** Active draft
**Date:** 2026-05-15
**Scope:** Next 1-3 sprints
**Companion to:** [../mission-graph.md](../mission-graph.md)

This doc translates the foundational mission graph into near-term sprint shape. It does not use calendar commitments. Progress is measured by dependency clearance, tested contract surfaces, and sprint closeout quality.

---

## Current Inputs

- D1 is decided: Object Catalog is a SemanticEntity-compatible manifest with entity-level `oods.*` extensions. Catalog version is `1.0.0`.
- D2 is decided first-pass: new fidelities consume a shared `runPreEmit()` structural pass before per-fidelity emission.
- D3 is externally ratified and now production-updated: Concordance sprint-13 shipped hosted endpoint, Bearer auth, per-workspace tenancy, and wire `1.1.0`.
- D4 is decided first-pass: Forge v1 gates writes through a semantic-federation-style `evaluateCapability(state, context, action)` wrapper; the current reference evaluator is billing-specific and must be adapted before I2 implementation.
- D5 remains deferred until a working bidirectional system, named publication milestone, or external trigger.

Concordance production facts from `cmos/planning/info-push-to-oods-foundry-mcp.md`:

- Hosted URL: `https://concordance-production.up.railway.app`
- Probe endpoints are unauthenticated: `/health`, `/version`, `/docs`, `/openapi.json`, `/redoc`
- Current wire pin: `Concordance-Schema-Version: 1.1.0`
- Payload-level optional pin: `schema_version: "1.1.0"`
- Non-probe endpoints require `Authorization: Bearer <key>`
- Per-workspace tenancy is one Postgres schema per Forge workspace
- Open asks from Concordance: CORS dev-domain allowlist, Bearer key issuance trigger, wire-bump notification preference

---

## Sprint-96 Recommended Shape

Sprint-96 should be a Foundation sprint with one live-integration preflight. Keep N=5 including closeout.

### s96-m01 - Object Catalog v1.0.0 Spec

**Track:** F1
**Objective:** Author `technical/object-catalog.md` and the first schema/fixture plan for the Object Catalog.

**Success criteria:**
- Spec defines the strict SemanticManifest envelope: `manifest_version`, optional `schema_version`, `source`, `entities`, optional `relationships`
- No Forge-only fields are allowed at manifest root
- Catalog version `1.0.0` is represented through `source.oods_catalog_version` and entity-level `oods.catalog.version`
- Entity-level `oods.*` extension shape covers render slots, projection variants, confidence decomposition, evidence chain, and brand overlay references
- At least three fixture targets are named: User, Product, Subscription
- Tests to add are named before code starts: Concordance manifest validation, Forge extension validation, round-trip fixture hash stability

**Deliverables:**
- `cmos/foundational-docs/technical/object-catalog.md`
- Draft schema location and fixture inventory

### s96-m02 - Concordance Contract Gate

**Track:** F2
**Objective:** Vendor/pin Concordance wire `1.1.0` and define Forge's consumer contract before authenticated writes.

**Success criteria:**
- Vendored file list is finalized: `manifest.schema.json`, `contracts/api/*.schema.json`, `contracts/recipes/*.json`, `pragmatic-roles.json`, `edge-types.json`, `task-types.json`
- `schema_version` optional top-level field is supported
- Version policy is explicit: warn+continue on minor; fail-loud on major
- Client configuration is named: `CONCORDANCE_BASE_URL`, `CONCORDANCE_API_KEY`
- Auth errors are mapped: 401 missing/wrong auth, 403 invalid token
- Contract tests are planned against local Concordance and hosted unauthenticated probes

**Deliverables:**
- `cmos/foundational-docs/technical/concordance-integration.md`
- Vendoring plan and test matrix

### s96-m03 - Hosted Concordance Preflight

**Track:** F2/I1 preflight
**Objective:** Prove Forge can observe the live Concordance service before requesting or using a Bearer key.

**Success criteria:**
- `GET /version` and `GET /health` behavior is documented against hosted Concordance
- `Concordance-Schema-Version: 1.1.0` and `X-Request-Id` capture requirements are written into diagnostics expectations
- CORS allowlist recommendation is drafted for browser-side dev use
- Bearer key request is prepared but not stored in git/CMOS
- Authenticated I1 remains blocked only on key issuance and F2 contract code

**Deliverables:**
- Hosted preflight notes in `technical/concordance-integration.md`
- CMOS-ready ask to Concordance for key issuance and CORS allowlist when implementation starts

### s96-m04 - Bidirectional Object Catalog MCP Framing

**Track:** F3
**Objective:** Make the public/internal framing precise enough that implementation and future publication do not overclaim.

**Success criteria:**
- Read surfaces are inventoried: `registry.snapshot`, catalog/object tools, schema tools where relevant
- Write surfaces are inventoried: `map.apply`, `map.create`, `map.update`, `map.delete`, future catalog publish/write tools
- Dry-run defaults, idempotency, conflict semantics, queued states, and capability denials are named
- Claim wording is scoped to "writable Object Catalog MCP with reconciliation semantics"
- D4 governance boundary is referenced: write-side gates apply at mutation boundaries; reads remain unfiltered in v1

**Deliverables:**
- `cmos/foundational-docs/technical/bidirectional-mcp.md`
- Write-surface inventory for future implementation review

### s96-m05 - Closeout

**Track:** Quality
**Objective:** Close the sprint without planning drift or git hygiene debt.

**Success criteria:**
- Per-mission commits verified
- Foundational docs consistency checked with `rg`
- Concordance next action recorded: key request, CORS allowlist, and wire-bump notification preference
- CMOS session captures decisions/learnings/next steps
- Closeout report summarizes what is implementation-ready and what remains blocked

**Deliverables:**
- Closeout report under the sprint reports path chosen during sprint setup
- CMOS session complete with next steps

---

## Sprint-97 Candidate Shape

Sprint-97 should only start after s96-m01 and s96-m02 have produced enough concrete spec surface to avoid implementing against placeholders.

Candidate missions:

- **F1 implementation pass:** JSON Schema, generated TypeScript types, and first Object Catalog fixtures.
- **F2 local round-trip:** POST a Forge-emitted Object Catalog manifest to local Concordance and assert `ingested_entities == entities.length` plus hash-stable `GET /entities/{urn}`.
- **I1 authenticated hosted smoke:** use out-of-band Bearer key to call hosted read endpoints and one controlled `/manifests` ingest path.
- **D2/C1 preparation:** implement or design `runPreEmit()` only after F1 fixtures exist.
- **Closeout:** first formal run of the new end-of-sprint commit-boundary convention (decision #408 retired #309). Closeout commit enumerates mission IDs; clean tree at session.complete.

---

## Sprint-98 Outcomes (closed 2026-05-16)

Sprint-98 ran first Capability-track sprint after sprint-96 Foundation + sprint-97 implementation. 5/5 missions delivered.

- **m01 D2 runPreEmit() implementation** — `packages/mcp-server/src/codegen/pre-emit.ts` ships `runPreEmit(input, options): PreEmitContext` with UiSchema + SemanticEntity overloads. React/Vue/HTML emitters now consume PreEmitContext; the duplicate `collectComponents()` previously living in both react and vue emitters is now a single canonical implementation in `pre-emit.ts`. Byte-identical output for existing emitters (every pre-existing codegen test passes without modification). For SemanticEntity input, runPreEmit synthesizes a minimal walkable UiSchema (root with `data-entity-urn`, slot children with `data-slot-name` + `data-field`); per D2 sub-question #2, variant resolution happens BEFORE tree synthesis. 18 unit/contract tests against the 3 sprint-97 fixtures.
- **m02 C1 boxes-and-arrows emitter + Q3 real-data E2E gate** — `packages/mcp-server/src/codegen/boxes-arrows-emitter.ts` projects the Object Catalog onto a self-contained HTML file. Entities render as bordered articles with role-colored chips + traits + slots + semantics + states/preconditions/effects + confidence; relationships render as dashed-border rows with →/←/↔ glyphs + via + reason; cross-manifest target URNs highlighted via `data-relationship-target-external="true"`. HTML/CSS (not SVG) per derek 2026-05-16. Q3 gate at `test/e2e/boxes-arrows-q3.e2e.spec.ts` against 3 internal fixtures + new external `test/fixtures/object-catalog/billing-multi-entity.json` (3 cross-linked entities, all-internal URN refs). 62 new tests (22 unit + 40 E2E). The multi-fidelity claim from D2 is now empirically validated: the same Object Catalog renders as boxes-and-arrows via PreEmitContext projection without any change to the existing code emitters.
- **m03 concordance.validate MCP tool** — Input/output JSON schemas + handler wrapping sprint-97 F2 `validateManifest()`. Path-safety guards reject absolute / parent-traversal / project-escape / missing / corrupt-JSON. Output exposes `valid`, `errors[]` (AJV-native shape preserving instancePath/keyword/params for Pydantic `detail.errors[]` parity), `warnings[]`, `schemaVersion`, `versionPolicy` (exact|patch|minor|major|absent), and diagnostics. Registered in all 5 places (registry.json + registry.ts FALLBACK + index.ts toolSpecs + security/policy.json + adapter tool-descriptions.json). 22 tests (16 unit + 6 MCP-harness round-trip via getAjv input/output validation). **Agent-callable only — manifest validation is NOT auto-baked into the compose/render pipeline yet** per derek 2026-05-16; pipeline auto-integration is a sprint-99+ candidate once tool surface accumulates real usage.
- **m04 I1 first formal live exercise + G3 hosted canonical-kernel** — All 4 live tests passed against `https://concordance-production.up.railway.app`: validate 631ms (200, schema_version=1.1.0, UUIDv4 x-request-id), submit 276ms (ingested_entities=1), GET ×2 55+55ms (hash-stable), G3 canonical-kernel 54ms (zero diffs). Two findings surfaced and fixed in-mission: (a) Railway cold-start can exceed the 5s production blocking timeout — smoke-spec-only `beforeAll()` override sets `CONCORDANCE_TIMEOUT_MS_BLOCKING=15000`, production codegen default unchanged; (b) strict byte-equal G3 was over-strict because concordance's Pydantic GET response materializes optional fields with null/empty defaults (element.object/action, semantics.synonyms, edge confidence/via/reason/evidence_refs/captured_at/metadata). Replaced with new `diffKernel()` deep-subset semantic: every Forge-declared value must appear unchanged in concordance's response; concordance MAY add keys but only if the value is an optional-default sentinel. G3 test renamed to "every Forge-declared value preserved verbatim". D1's "concordance preserves the kernel verbatim" claim is now executable against the live service. 6 console.info diagnostic prints capture per-step x-request-id / schema_version / status / duration_ms.
- **m05 closeout** — Second formal run of decision #408. MEMORY.md updated; near.md converted to actuals + sprint-99 candidate; closeout report at `cmos/reports/s98-m05-closeout-2026-05-16.md`; single closeout commit enumerates s98-m01..m05.

Test posture at sprint-98 close: **146 files / 2381 active pass / 5 skipped** (T2 local Concordance + 4 I1 live — all clean skips with visible `[I1 smoke] skipped:` reason). tsc --noEmit clean throughout.

---

## Sprint-99 Candidate Shape

The Capability track is now open — D2 abstraction is in code, C1 ships, the multi-fidelity claim is testable. The natural next moves spread across Capability, Integration, and Quality tracks. Recommended N=5 with closeout.

Candidate missions (locked at sprint-99 planning):

- **(Capability) C2 wireframe render** — second emitter consuming `runPreEmit()`. Tests whether the D2 abstraction generalizes; the named success criterion in [../mission-graph.md](../mission-graph.md#c2). Output: gray-box layouts with structural fidelity, HTML/CSS like C1. New emitter file + unit tests + Q3-style E2E gate against the same 4 fixtures C1 uses.
- **(Quality) G3 hosted canonical-kernel extension** — extend the s98-m04 G3 deep-subset gate from the subscription fixture to the user + product fixtures, and to the external multi-entity billing fixture. Multi-entity round-trip exercises whether concordance preserves cross-entity relationships byte-faithful when re-emitted as separate `GET /entities/{urn}` calls.
- **(Integration) I3 client retry logic for 429/5xx** — `packages/mcp-server/src/concordance/client.ts` currently has no retry surface (sprint-97 m03 explicitly deferred this to "F2/I3"). A bounded exponential-backoff retry on 429 + 5xx is a precondition for trusting the validator and submission paths under real load. Carry-forward from sprint-97.
- **(Capability) C3 review/recovery consuming `oods.confidence_decomposition`** — first emitter that USES the confidence layer the Object Catalog exposes (sprint-97 F1 shipped the field; nothing consumes it yet). Surfaces low-confidence entities for human review. Could be a renderer fidelity or a new MCP tool; scope at planning.
- **(Quality) Closeout** — third formal run of decision #408.

Alternates that didn't make the shortlist but are queueable:

- **concordance.validate pipeline auto-integration** — bake validation into compose/render as an optional `validate: true` step. Defer until concordance.validate accrues real-world usage (sprint-99 may be too early; sprint-100 more likely).
- **D2 second-pass formal IR memo** — only triggered when a second emitter needs the SAME structured output projection (most likely first trigger: A2UI runtime emission + a structured-data export feeding a CMS-style consumer). Not yet.
- **I2 semantic-federation evaluator (D4 implementation)** — needs Birch involvement + adaptation from the billing-specific reference evaluator. Standalone planning artifact required before implementation.
- **Production blocking-timeout decision** — should the production codegen default of 5000ms be widened to absorb Railway cold-starts? Currently 5s for codegen-blocking with smoke spec carrying its own 15s override. Real incidents would force the decision; in their absence, the current split is correct.

---

## Known Risks

- ~~Concordance local contracts in this repo may still be at wire `1.0.0`; sprint-96 must vendor or sync `1.1.0` before implementation tests claim parity.~~ **Resolved 2026-05-15 (sprint-97 m02):** local `diverge-and-concord/contracts/manifest.schema.json` IS at wire 1.0.0 (lacks `schema_version` root property). Forge bridges this with strip-then-AJV pathway + warn/throw version policy. Vendored copy stays byte-faithful to upstream (T1 byte-parity); G1 validates fixtures cleanly via version-policy strip. When upstream bumps the checkout to 1.1.0, the strip becomes a no-op; policy logic remains durable.
- The strict SemanticManifest root means Object Catalog metadata placement is load-bearing. Root-level `catalog_version` would break zero-translation ingestion.
- Bearer keys must never be committed, captured in CMOS, or written into planning docs.
- D4 implementation is not copy-paste from OODS-subscriptions. The evaluator pattern is reusable; the billing-specific action/state model is not.
- F3 wording must stay scoped to catalog/reconciliation writability. Avoid broad "first writable MCP" claims unless sourced and narrowed.

---

## Success State For This Horizon

At the end of the near horizon:

- Object Catalog v1.0.0 has a written spec, schema, and production-shaped fixtures.
- Concordance wire `1.1.0` is vendored, version-gated, and exercised locally.
- Hosted Concordance integration has passed unauthenticated probes and at least one authenticated smoke when the key is issued.
- The bidirectional MCP claim has a precise tool contract rather than a slogan.
- The first capability mission (C1 or C3) can start without re-opening F1.

