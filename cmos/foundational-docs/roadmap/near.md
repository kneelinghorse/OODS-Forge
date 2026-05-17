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

## Sprint-99 Outcomes (closed 2026-05-17)

Sprint-99 ran the first mixed-track sprint after sprint-98 (Capability + Integration + Quality balance). 5/5 missions delivered.

- **m01 C2 wireframe render — second emitter consuming runPreEmit()** — `packages/mcp-server/src/codegen/wireframe-emitter.ts` ships HTML/CSS gray-box rendering for the same 4 Object Catalog fixtures C1 covers. Visual language: light-gray solid-border entity boxes, dashed slot placeholders, no role color / no trait chips / no relationship arrows (those are C1's job per derek 2026-05-16). data-* contract preserved verbatim from C1 (data-entity-urn, data-element-type, data-role, data-slot-name, data-slot-field) so a future interactive editor / canvas tool can consume either fidelity. Empirical test of D2 abstraction generalization: both C1 boxes-and-arrows AND C2 wireframe consume the same PreEmitContext shape unchanged — function-shaped abstraction (decision #435) holds, IR-memo deferral remains correct. m01 also surfaced a finding (NOT silently fixed): `CatalogAnnotations.slots` is hardcoded to `entity.oods.render.slots` in pre-emit.ts; the variant param synthesizes a variant-aware tree at `ctx.schema.screens` but `ctx.catalog.slots` remains canonical render-slots. Both C1 and C2 render render-slots regardless of variant. Two clean resolutions documented for a future D2 v2 (extend CatalogAnnotations.slots semantics OR have emitters walk ctx.schema.screens) — not load-bearing for current emitters, becomes load-bearing only when multi-variant projection (desktop vs mobile wireframe gallery) becomes a real use case.
- **m02 I3 client retry logic — bounded exp-backoff on 429/5xx** — `packages/mcp-server/src/concordance/retry.ts` ships RetryPolicy (default: maxRetries=3, baseDelay=500ms, maxDelayPerRetry=4000ms, totalWaitCap=8000ms) with full-jitter exp-backoff (Brooker-style), Retry-After header parser handling both RFC 7231 forms (delta-seconds AND HTTP-date; rejects non-alpha numerics like "12.5" that Date.parse would otherwise coerce), pluggable RetryClock + RetryLogger interfaces for test injection, and a budget guard that aborts when planned delay would push past `CONCORDANCE_TIMEOUT_MS_BLOCKING` or cumulative-sleep cap. Wired into `client.executeRequest()` as opt-in via `RequestOptions.retry`. Per-retry logging emits `{attempt, delayMs, status, requestId, retryAfterUsed}` via injectable retryLogger. 20 helper unit tests + 11 client integration tests (429-success, 429-max-retries-exhausted, 503-success, 500-max-retries-exhausted, Retry-After: 2 → 2000ms wait, 5× non-retry-4xx (400/401/403/404/422), budget-guard, per-attempt logging shape, success-path transparency). Live-smoke (RUN_HOSTED_SMOKE=1) not exercised in-session — CONCORDANCE_API_KEY not in env; user to re-run at convenience.
- **m03 G3 hosted canonical-kernel extension — 4-fixture round-trip** — `test/integration/concordance-i1-smoke.spec.ts` now runs a table-driven G3 block across all 4 Object Catalog fixtures: user (informational), product (action-shaped), subscription (relationships.edges with internal targets), and the multi-entity billing fixture (3 cross-linked entities: BillingAccount → PaymentMethod → Invoice; one submitManifest POST creates them, then 3 separate getEntity GETs each diffKernel-checked independently). `diffKernel()` helper from s98-m04 reused unchanged per decision #440 — D1 canonical-kernel contract held across the full 4-fixture surface in mechanism; live verification deferred to user. Retry surface promoted from v0.1 (validateManifestRemote only) to v0.2 (validateManifestRemote + submitManifest + getEntity) IN m03 — the G3 multi-fixture round-trip IS the real burst-load usage signal that m02 documented as the broader-rollout gate. m02 tests for "submitManifest does NOT retry / getEntity does NOT retry" rewritten as "retry covers hot-path endpoints (sprint-99 m03)" with submitManifest 503→200, getEntity 429→200, getEntity persistent-503 exhausts, and health() (unauthenticated probe) remains single-shot.
- **m04 C3 review/recovery renderer — first emitter consuming oods.confidence_decomposition** — `packages/mcp-server/src/codegen/review-emitter.ts` is the third C-track emitter alongside C1 + C2, and the FIRST renderer that USES the confidence_decomposition field sprint-97 F1 shipped. Visual language: cards with confidence badge in 4 tiers (high ≥0.8 green / medium 0.5–0.8 yellow / low <0.5 red / unknown gray for missing confidence_decomposition); entities below configurable reviewThreshold (default 0.7) OR with unknown tier get visible REVIEW NEEDED banner + top-3 lowest-confidence signal breakdown (data-breakdown="ranked", score-ascending order, stable sort for ties). data-* contract mirrors C1/C2: data-entity-urn, data-confidence-score, data-confidence-tier, data-flagged-for-review, plus per-signal data-signal-name + data-signal-score for downstream triage-tool consumption. Body declares data-fidelity="review", data-review-threshold, data-entities-flagged for dashboard consumers. Threshold configurable via emit options. New synthetic fixture at `test/fixtures/object-catalog/subscription-low-confidence.json` (total=0.4, 4 signals ranging 0.32–0.55) because production fixtures are all high or unknown by construction — the LOW tier path needs synthetic coverage to be exercisable. 43 unit tests + 58 Q3 E2E gate tests via jsdom; sanity check confirms no production fixture surfaces a LOW tier.
- **m05 closeout** — Third formal run of decision #408. Rollup-regate `generatedAt` test-output-dirties-tree friction recurred for the third consecutive sprint (s97 reverted, s98 reverted) — per decision #449, source-fixed in-mission: `test/e2e/stage1-rollups.e2e.spec.ts` line 341 changed from `new Date().toISOString()` to deterministic `'2026-04-17T00:00:00.000Z'` (the s94 closeout date already encoded in the filename), preserving the regate's documentation value while ending the recurrence pattern. Single closeout commit covers s99-m01..m05.

Test posture at sprint-99 close: **151 files / 2581 active pass / 8 skipped** (T2 local Concordance + 7 I1 live tests including the new 4-fixture G3 block + the original 3 step tests — all clean skips with visible `[I1 smoke] skipped:` reason). tsc --noEmit clean. Bridge-dependent E2E tests in the full suite intermittently hit a 180s spawn timeout when the bridge subprocess startup blocks; pre-existing infra friction unrelated to this sprint, captured in known-issues for a future cleanup mission.

---

## Sprint-100 Candidate Shape

Sprint-99 left the C-track at 3-of-N emitters and the Integration-track with retry coverage on the three hot-path Concordance endpoints. Natural next moves spread back across all four tracks. Recommended N=5 with closeout.

Candidate missions (drafted; lock at sprint-100 planning):

- **(Integration) concordance.validate pipeline auto-integration** — bake validation into compose/render as an optional `validate: true` step. The concordance.validate MCP tool has now shipped (s98-m03), retry on the validate path is hardened (s99-m02), and the multi-fixture round-trip is gated (s99-m03). The deferral basis ("until tool surface accrues real usage") needs an explicit re-evaluation in planning — if there's still no usage signal, defer again; if there is, this is the natural next mission.
- **(Capability) D2 abstraction v2 — variant-aware CatalogAnnotations.slots** — addresses the s99-m01 finding cleanly. Either extend `CatalogAnnotations.slots` to be variant-driven (selectVariant-aware) OR refactor C1/C2 emitters to walk `ctx.schema.screens`. Becomes load-bearing the moment a multi-variant projection use case shows up (desktop vs mobile wireframe gallery, for example).
- **(Capability) C-track refactor: shared HTML/escape util** — three emitters now duplicate `escapeHtml` + `attr` + `dataAttr` helpers (rule-of-three triggered with C3). Extract to `src/codegen/html-util.ts`; gate with byte-equal output for all three Q3 E2E suites.
- **(Quality) Bridge E2E flakiness** — `test/e2e/*.e2e.spec.ts` files that spawn `mcp-bridge` subprocess can hit 180s timeout. Investigate startup ordering / port reuse / build-cache invalidation. Goal: re-establish full-suite green-on-CI without the bridge tests running serially.
- **(Integration) I2 semantic-federation evaluator (D4 implementation)** — needs Birch involvement + adaptation from the billing-specific reference evaluator. Standalone planning artifact still required before implementation; tracking as alternate.
- **(Capability) A2UI emitter prototype** — if A2UI is ready to land as the fourth C-track emitter, this is the natural trigger for a formal D2 v2 IR memo (two emitters needing the SAME structured output projection — A2UI runtime + structured-data export). Stage1 v1.7.0 drift contract being mostly additive means OODS-side load is low; capacity available.

Alternates that didn't make the shortlist but are queueable:

- **Production blocking-timeout decision** — should the production codegen default of 5000ms be widened to absorb Railway cold-starts? Currently 5s for codegen-blocking with smoke spec carrying its own 15s override. Real incidents would force the decision; in their absence, the current split is correct. No change since sprint-98.
- **CMOS bug-report follow-up** — sticky onboard.currentSprint pointer + PG mirror drift remain open since sprint-97 m05 filing. No SLA expected; watch inbox.

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

