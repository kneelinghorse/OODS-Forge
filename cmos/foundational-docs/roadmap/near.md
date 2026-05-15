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

## Sprint-98 Candidate Shape

Sprint-98 depends on the shape of sprint-97 results.

Likely paths:

- If F1/F2/I1 are green: start C1 boxes-and-arrows render against Object Catalog fixtures.
- If Concordance live wiring exposes drift: queue a D3 second-pass memo and contract adjustment before C-track work.
- If semantic-federation becomes urgent: queue I2 planning with Birch, starting from evaluator extraction/adaptation rather than direct vendoring.
- If public artifact pressure emerges: trigger D5 memo before any publication mechanics are chosen.

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

