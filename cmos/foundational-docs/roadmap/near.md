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

## Sprint-100 Outcomes (closed 2026-05-18)

Sprint-100 ran the first post-pure-capability sprint after sprint-99. 5/5 missions delivered. Quality track expanded to 2 missions to absorb infra debt; m04 converted from implementation to formal re-defer with alternate promotion.

- **m01 Q1 Infra hygiene + project env loading** — three CI failure root causes fixed (`--labels ""` parser at `tools/tokens-governance/index.ts:257-265`; adapter fresh-install workspace-package build ordering at `.github/workflows/adapter-fresh-install.yml`; vr-test step-output guard with `continue-on-error: true` at `.github/workflows/ci.yml`). Node 20→24 across all 7 workflows. Dotenv wired end-to-end: `dotenv@17.4.2` in mcp-server + mcp-bridge deps; new `packages/mcp-server/test/setup-env.ts` + `vitest.config.ts` setupFiles; new `packages/mcp-server/src/load-env.ts` + `packages/mcp-bridge/src/load-env.ts` imported FIRST at the top of `src/index.ts` and `src/server.ts`; new `.env.example` with 8 variables; agents.md gained "Environment setup" section. End-state verified: `RUN_HOSTED_SMOKE=1 npx vitest run test/integration/concordance-i1-smoke.spec.ts` from a fresh shell ran 7 live tests against Railway in 4.65s with zero manual env exports. The CONCORDANCE_API_KEY false-deferral pattern recurring across s98/s99/review is now closed.
- **m02 Q2 Bridge E2E green + coverage gate restored** — single 1-line build-script change at `packages/artifacts/package.json:14` fixed all 7 affected CI suites. Root cause: `@oods/artifacts` build was `tsc -p tsconfig.json` only and never copied `src/schemas/*.json` to `dist/schemas/`. Locally the directory existed from leftover builds; CI on fresh clones never had `transcript.schema.json`, so the MCP-server child spawned by the bridge crashed at import-time (validation.ts line 14), surfacing as `400 RUN_ERROR` on every `/run`. Fix mirrors the mcp-server pattern. 22/22 bridge-dependent tests pass locally after rebuild. Scope-growth contingency NOT triggered; no m02a/m02b split. Antipattern named for institutional memory: "fragile-build-chain-with-silent-fallback-masked-by-dev-machine-leftovers."
- **m03 D2 v2 variant-aware CatalogAnnotations.slots** — approach (a) picked at mission-start: extend `buildCatalogAnnotations()` in `packages/mcp-server/src/codegen/pre-emit.ts` to use `selectVariant()` for slots + brand_overlay. 2-line change; all three C-track emitters unchanged. `runPreEmit(entity, { variant: 'mobile' })` on user.json now correctly returns 2 slots (mobile projection) vs `variant: 'desktop'` returning 3 slots; variant-omitted falls back to canonical `oods.render.slots` (byte-identical to pre-fix). 12 new Q3 E2E variant tests (4 per emitter × 3 emitters); 1 wireframe unit test updated from documenting-the-finding to asserting variant-correctness. **Decision #451 (D2 generalization finding from s99-m01) resolved.**
- **m04 concordance.validate pipeline auto-integration: formal re-defer + alternate promoted** — usage-signal audit found ZERO production callers in three days since the tool shipped (s98-m03 2026-05-16). Re-deferred with three named next-trigger conditions: (a) 5+ tool invocations across 2+ workflows in one session, (b) real-world compose-time manifest error from outside the test suite, (c) downstream consumer explicit ask for `pipeline.handle({ validate: true })`. Alternate promoted: C-track shared HTML+escape util at `packages/mcp-server/src/codegen/html-utils.ts` — extracted from byte-identical copies in `boxes-arrows-emitter.ts`, `wireframe-emitter.ts`, `review-emitter.ts`. -66 lines of duplication, +12 new unit tests. **Decision #460 (rule-of-three fired, deferred for scope in s99-m04) resolved.**
- **m05 closeout** — fourth formal run of decision #408. Single closeout commit enumerates s100-m01..m05. Decision #449 (rollup-regate hard contingency, source-fixed in s99-m05) did NOT recur; the deterministic timestamp from s99-m05 held.

Test posture at sprint-100 close: **152 files / 2606 active pass / 10 skipped** (+25 active vs sprint-99 baseline; +12 from m03 Q3 E2E variant tests, +12 from m04 html-utils unit tests, +1 from m01 dependency-update test discovery). tsc --noEmit clean for both mcp-server and mcp-bridge. With m01+m02 fixes landed, the full CI matrix is expected to exit green on the next Forge-expansion push — the first time in several sprints.

---

## Sprint-101 Outcomes (closed 2026-05-19)

Sprint-101 closed 2026-05-19 with all 5 missions delivered. Closeout report at [cmos/reports/s101-m05-closeout-2026-05-19.md](../../reports/s101-m05-closeout-2026-05-19.md). First heavy-code Capability sprint after the infra-heavy s100; closed the C3 review *workflow* loop that the s99-m04 *renderer* set up.

**Highlights:**
- **m01 ships `review.triage` MCP tool** at `packages/mcp-server/src/tools/review.triage.ts` (~360 LOC) with full path-safety + idempotency invariants + atomicity rule (item stays 'open' on map.* failure) + additive conflict-artifact schema extension (`remediation_hints[]` 1–3 confidence-desc, `resolution_status`, `resolved_at`, `resolved_by`, `operator_reason`). Registered in all 5 mcp-server places; 22 unit tests + 3 round-trip contract tests; auto-regenerated `docs/api/review-triage.md`.
- **m02 ships C5a Review Queue codegen surface** with ZERO emitter modifications — fixture-authoring-only pattern confirmed: 5 items spanning all 4 confidence tiers + 4 distinct remediation_hint kinds; 62-test Q3 gate across the 9-output matrix (react/vue/html × inline/tokens/tailwind).
- **m03 ships C5b Conflict Detail codegen surface** — second zero-emitter-mods mission: 7 regions (header + candidate-summary + existing-mapping + alternate-interpretations + remediation-hints + trait-diff added/removed/unchanged + verdict-actions); 72-test Q3 gate. Helper-extraction NOT done (~12% overlap with m02 spec vs ≥40% threshold).
- **m04 ships C4 Playground operator DX upgrade** — ~580 LOC across 10 files: URL-param-backed fixture + minConfidence with 400ms-debounced re-runs, sessionStorage cache keyed `<fixtureId>|<minConfidence>`, new DiffInspector + GeneratedReviewQueue components, transcript export to `transcript.schema.json`. UI verification of 8 browser-interaction behaviors pending user interactive session (per user-directed split). Mcp-server additive surface: `MapApplyQueued` + `MapApplyConflict` now carry optional `remediation_hints?[]` so playground doesn't re-read the artifact.
- **m05 fifth formal run of decision #408** — closeout-as-commit-boundary convention now spans all sprint shapes (Foundation, Capability-only, mixed-track, infra-heavy mixed-track, heavy-Capability mixed-track).

**Test posture at closeout:** 414 test files / 3986 active pass / 7 skipped in workspace `pnpm test`; mcp-server only 156 files / 2765 active pass / 10 skipped; +159 new tests across m01–m03 (22 unit + 3 contract + 62 m02 Q3 + 72 m03 Q3); tsc clean across mcp-server + mcp-bridge + playground; all builds clean.

**Closeout commit:** staged but not yet made — pending user signal alongside m04 UI verification.

---

## Sprint-102 Candidate Shape (pre-draft 2026-05-19)

Carried from sprint-101 closeout. Re-confirm gating basis at planning rather than autoselecting.

1. **C5c apply-summary codegen surface** — third reconciliation surface; reuses m02/m03 pattern; helper-extraction re-evaluation when 3 surfaces exist together. Schema diverges from queue/detail (summary/dashboard layout) so spec helpers may finally exceed the ≥40% threshold.
2. **C6 v1.4.0 registry round-trip (Proposal A)** — accept all 4 fields in map.apply from Stage1 input (`disambiguation_decisions`, `preferred_term`, `capability`, `projection_variants` already done); store first three as top-level arrays in `component-mappings.json`; surface via `registry.snapshot` under new keys. Files locked at s101 planning: `component-mapping.schema.json`, `map.shared.ts`, `map.apply.ts`, `registry.snapshot.ts`, `types.ts`, `stage1-v14-stubs.spec.ts`.
3. **Pre-generated React+tokens output for the C5a review-queue UiSchema** — commit `apps/playground/src/components/__generated__/ReviewQueueGenerated.tsx` from `code.generate({framework:'react', schema: review-queue.ui-schema.json, options:{typescript:true, styling:'tokens'}})`; wire as drop-in replacement under `GeneratedReviewQueue.tsx` (the leading-comment-documented alternate path).
4. **Decision-register review hygiene** — confirm closure of s101 decisions (~15 mission decisions logged this sprint) and run a stale-decisions review across the register.
5. **Stale-learnings triage** — chore carried from s100 planning (23 stale at threshold 20); low-cost moment.
6. **"Fresh-state verification" quality bar paragraph** — add to `cmos/foundational-docs/quality-bars.md`; one paragraph, would have caught all three s100 m01/m02 friction items.

**Default N=5 mixed-track** unless an Integration / Foundation candidate surfaces at planning. **C5c + C6 + 2-3 chore-sized items** is the natural shape. Watch for: Stage1 v1.7.0 drift contract integration (info_push 2026-04-18, additive); A2UI emitter if a downstream consumer signal arrives; I2 semantic-federation evaluator if Birch surfaces.

---

## Sprint-101 Locked Shape (locked 2026-05-19) — superseded by Outcomes section above

Sprint-101 ships the first end-to-end operator review workflow. The C3 review *renderer* landed in s99-m04 (REVIEW NEEDED banners + flagged entities); the C3 review *workflow* — accept / patch / defer / dismiss for conflicted reconciliation items — did not. This sprint closes that loop in four code missions plus closeout. Apply-summary surface (third C5 reconciliation surface) and C6 v1.4.0 round-trip are s102 candidates.

Theme: **operator review workflow stack.** N=5, four Capability missions + closeout. First heavy-code Capability sprint after the infra-heavy s100; a successful green-suite closeout re-confirms s100 m01+m02 fixes (dotenv + bridge artifact build) hold under real capability workload.

Dependency graph:
- m02, m03 independent of m01 (codegen against authored fixtures, not the runtime tool)
- m04 consumes m01 (the `review.triage` tool) AND m02 (the generated review-queue component)
- m05 closeout final

Sprint-101 candidate alternates considered and dropped at planning:
- **concordance.validate auto-integration** — second deferral in s100; usage-signal still zero at s101 planning. Per s100-m04 decision, the third deferral must be implement-or-drop. **Dropped from candidate list.**
- **A2UI emitter prototype** — Google A2UI v0.9 spec is stable (Dec 2025); the "readiness signal" framing from s100 planning was wrong — the question is whether a downstream consumer exists to receive the output, not whether the spec is ready. **Deferred to s102 or beyond, contingent on a real downstream surface.**
- **I2 semantic-federation evaluator** — still needs Birch coordination + standalone planning artifact. **Deferred.**
- **C6 v1.4.0 registry round-trip** — investigated during s101 planning; concrete proposal scoped (Proposal A: read-only round-trip via additive component-mappings extension). **Not in s101 because sprint theme is operator-UX-focused; s102 candidate.**
- **C5c apply-summary surface** — third reconciliation surface; reuses m02/m03 pattern. **s102 candidate.**
- **Stale-learnings triage** — chore-sized, will run at any low-cost planning moment.

### s101-m01 — C3 operator workflow tool surface (`review.triage`)

**Track:** Capability
**Objective:** Ship the operator triage workflow C3 needs to be complete. Conflict artifacts written by [map.apply.ts](../../packages/mcp-server/src/tools/map.apply.ts) at `.oods/conflicts/{timestamp}-{target-id}.json` today carry `conflicts[]` + `belowConfidence[]` with full Stage1 candidate context but NO machine-readable remediation hints, NO resolution status, NO tool surface for operator decisions. This mission ships a new `review.triage` MCP tool that loads a conflict artifact, accepts operator decisions, mutates the artifact additively, and calls map.create / map.update for accepted+patched verdicts.

**Success criteria:**
- New tool `review.triage` registered in all five places (registry.json + registry.ts FALLBACK + index.ts toolSpecs + security/policy.json + adapter tool-descriptions.json)
- Input schema: `conflictArtifactPath`, `decisions[]` (each: `{objectId, verdict: 'accept'|'patch'|'defer'|'dismiss', reason?, patchOverrides?}`)
- Output: `summary` ({accepted, patched, deferred, dismissed counts}), `artifact` (path), `mapsCreated[]`, `mapsUpdated[]`, `mapsRemoved[]`, `errors[]` (non-fatal per-decision)
- Verdict semantics: `accept` → map.create with recommended traits; `patch` → map.update with operator overrides merged; `defer` → resolution_status='deferred' (no map.* call); `dismiss` → resolution_status='dismissed' (no map.* call)
- Conflict-artifact schema additively extended: new optional `remediation_hints[]` per item (populated by map.apply.ts), `resolution_status`, `resolved_at`, `resolved_by`, `operator_reason` (populated by review.triage)
- `remediation_hints[]` shape: `{kind: 'use_alternate_interpretation'|'merge_with_existing'|'reject_low_confidence'|'manual_patch'|'split', confidence, reasoning, refs?}` — 1–3 hints per conflict, ordered by confidence desc
- Idempotency: re-running with same payload no-ops; already-resolved items surface as `errors[]` with `kind: 'already_resolved'`
- Path safety mirrors concordance.validate.ts (absolute / parent-traversal / project-escape / missing / corrupt-JSON all rejected)
- tsc clean; ≥18 unit tests; ≥3 contract tests (full map.apply → review.triage round-trip); 273 emitter + 2606 active suite all pass

**Deliverables:**
- `packages/mcp-server/src/tools/review.triage.ts` (new)
- `packages/mcp-server/src/tools/review.triage.test.ts` (new)
- `packages/mcp-server/src/tools/map.apply.ts` (extend writeConflictArtifact)
- `packages/mcp-server/src/tools/types.ts` (extend ReviewTriageInput/Output, ConflictArtifact)
- 5-place registration (registry.json, registry.ts, index.ts, policy.json, tool-descriptions.json)
- `test/fixtures/conflict-artifacts/*.json` (1-2 new fixtures)

### s101-m02 — C5a Review Queue codegen surface

**Track:** Capability
**Objective:** Ship the first of three C5 reconciliation surfaces: codegen for the **review queue** UI — a list view of queued/conflicted items with confidence badges, top-1 remediation-hint summary, and inline verdict controls calling the m01 `review.triage` tool. Existing codegen pipeline ([code.generate.ts](../../packages/mcp-server/src/tools/code.generate.ts) + react/vue/html emitters) handles framework × styling fan-out with zero new vocabulary needed; the load-bearing work is UiSchema authoring. Validates D2's multi-fidelity claim spans BOTH non-prescriptive (s99-m04 review-emitter) AND prescriptive (this mission) projections of the same conflict-artifact data.

**Success criteria:**
- New UiSchema fixture `test/fixtures/ui/review-queue.ui-schema.json`: header (target name + status badges), filters (by confidence tier + status), item list (entity name, confidence badge, top-1 hint summary, verdict buttons), pagination
- Fixture uses existing UiSchema vocabulary in `packages/mcp-server/src/schemas/generated.ts:3051` — no new schema vocabulary
- Codegen produces 9 outputs: React/Vue/HTML × inline/tokens/tailwind
- React = functional + hooks; Vue = SFC `<script setup>`; HTML = semantic markup with `data-action` attrs (agent-callable, no JS handler)
- Tailwind = CVA per existing tailwind-mapper convention; tokens = brand-overlay token refs; inline = style attrs
- Q3 E2E gate at `test/e2e/c5-review-queue-q3.e2e.spec.ts`: for each of 9 outputs, parse + assert (a) entity-row count matches input, (b) confidence-tier badges with data-* mirror review-emitter contract, (c) action buttons match m01 verdict enum, (d) remediation-hint summary renders when present
- New fixture `test/fixtures/conflict-artifacts/review-queue-mixed.json`: ≥5 items spanning all 4 confidence tiers + ≥3 remediation_hint kinds
- tsc clean; 273 emitter + Q3 gates remain green

**Deliverables:**
- `test/fixtures/ui/review-queue.ui-schema.json` (new)
- `test/fixtures/conflict-artifacts/review-queue-mixed.json` (new)
- `test/e2e/c5-review-queue-q3.e2e.spec.ts` (new)
- Reference notes for s101-m03 to reuse the m02 pattern

### s101-m03 — C5b Conflict Detail codegen surface

**Track:** Capability
**Objective:** Ship the second C5 reconciliation surface: codegen for the **conflict detail** UI — detail view of a single conflicted item showing full Stage1 candidate (inferred_role, alternate_interpretations, confidence breakdown), all remediation_hints[] from m01, the conflicting existing mapping (via existingMapId), a side-by-side trait diff, and verdict controls. Reuses m02 pattern; ships faster because codegen plumbing is identical. Mission captures decision on whether c5-q3 spec helpers can be DRY'd to `test/e2e/_helpers/c5-shared.ts` for the eventual s102 apply-summary surface.

**Success criteria:**
- New UiSchema fixture `test/fixtures/ui/conflict-detail.ui-schema.json`: header (entity + URN), candidate-summary card (inferred_role + confidence breakdown), existing-mapping card (input as fixture payload — codegen does NOT call map.list at emit time), alternate_interpretations[] list, remediation_hints[] list with confidence + reasoning, trait-diff section (added/removed/unchanged categories with `data-trait-diff-kind` + `data-trait-name`), verdict action bar
- Same UiSchema-vocabulary constraint as m02
- 9 codegen outputs
- Q3 E2E gate `test/e2e/c5-conflict-detail-q3.e2e.spec.ts`: per output, assert (a) candidate-summary, (b) existing-mapping when present, (c) trait-diff rows with correct data-* attrs, (d) all remediation_hints in confidence-desc order with `data-hint-kind`, (e) verdict action bar matches m02 contract
- Shared assertion helpers extracted to `test/e2e/_helpers/c5-shared.ts` IF ≥40% code-path overlap with m02 spec — captured as decision at mission-complete
- New or extended `test/fixtures/conflict-artifacts/conflict-detail-sample.json`: 1 conflict with full Stage1 candidate + ≥3 remediation_hints
- tsc clean; existing emitter behavior unchanged

**Deliverables:**
- `test/fixtures/ui/conflict-detail.ui-schema.json` (new)
- `test/fixtures/conflict-artifacts/conflict-detail-sample.json` (new or extended)
- `test/e2e/c5-conflict-detail-q3.e2e.spec.ts` (new)
- `test/e2e/_helpers/c5-shared.ts` (conditional)
- Reference notes for s102 apply-summary scoping

### s101-m04 — C4 Playground operator DX upgrade

**Track:** Capability
**Objective:** Upgrade [apps/playground/src/](../../apps/playground/src/) to expose the complete operator review workflow shipped in m01+m02+m03. Today the Stage1 view in [Stage1DemoPanel.tsx](../../apps/playground/src/components/Stage1DemoPanel.tsx) shows review queue cards with trait pills but fixture selection is not URL-persistent, minConfidence is hard-coded to 0.75 with no UI control, conflict diffs render only as trait pills (no field-level diff), and there is no transcript export. Mission delivers four DX upgrades targeting C4 success criteria: URL-persistent fixture+threshold state, live minConfidence slider, real diff inspector consuming the m01 schema extension, transcript export.

**Success criteria:**
- URL params drive state: `?view=stage1&fixture=linear-v15&minConfidence=0.6` reproduces selection on reload; back/forward works
- minConfidence slider (0.5–0.95 step 0.05) in Stage1 view; debounced 400ms re-runs map.apply
- Diff inspector: per-item expandable section with field-level `changed_fields[]` table (field | from | to | change-kind); remediation_hints[] as ranked list below diff (confidence + reasoning)
- Action buttons (accept/patch/defer/dismiss) per review queue card; call new `bridge-client.runReviewTriage()`; result updates local state without fixture reload
- New `runReviewTriage(input)` in bridge-client.ts calling the m01 tool via `/api/run`
- Transcript export button in StatusBar.tsx → JSON conforming to `packages/artifacts/schemas/transcript.schema.json` (current fixture id, current minConfidence, full mapApplyResult, session's triage decisions); filename `oods-transcript-<fixtureId>-<isoTimestamp>.json`
- sessionStorage cache keyed `(fixtureId, minConfidence)` → cached mapApplyResult to skip redundant bridge calls
- s101-m02's React+tokens output imports correctly as a playground component (canonical integration); import path documented in code comment
- No bridge restart required for any operator action (verified manually + brief note)
- Full repo `pnpm test` passes; `pnpm --filter @oods/playground build` clean
- Empirical verification: load fixture → adjust threshold → triage one item per verdict → export transcript → reload via URL → state restored — captured as bullet-list or screenshots in closeout

**Deliverables:**
- `apps/playground/src/App.tsx` (URL params, threshold lift)
- `apps/playground/src/bridge-client.ts` (`runReviewTriage` method)
- `apps/playground/src/components/Stage1DemoPanel.tsx` (diff inspector, verdict actions, generated-component integration)
- `apps/playground/src/components/StatusBar.tsx` (transcript export button)
- `apps/playground/src/hooks.ts` (`useUrlParam`, `useSessionCache` if extracted)
- `apps/playground/src/components/GeneratedReviewQueue.tsx` (new wrapper around s101-m02 React+tokens output)
- `apps/playground/src/components/DiffInspector.tsx` (new)

### s101-m05 — Closeout

**Track:** Quality
**Objective:** Fifth formal run of decision #408. First Capability-heavy sprint after infra-heavy s100; green closeout re-confirms s100 m01+m02 fixes (dotenv + bridge artifact build) hold under capability workload.

**Success criteria:**
- Single closeout commit enumerating s101-m01..m05; tree clean at session.complete
- tsc --noEmit clean for mcp-server + mcp-bridge + mcp-adapter + playground
- Full repo `pnpm test` green including new c5-review-queue + c5-conflict-detail Q3 gates
- Bridge E2E suite green (s100-m02 re-confirmation)
- CMOS session.complete with decisions + learnings + next-steps
- MEMORY.md updated (canonical 8th-paragraph form, latest-sprint memory)
- near.md "Locked Shape" converted to "Outcomes (closed YYYY-MM-DD)"; sprint-102 candidate shape drafted (likely: C5c apply-summary + C6 v1.4.0 read-only round-trip + 1-2 others)
- Closeout report `cmos/reports/s101-m05-closeout-<date>.md`
- Decision-register hygiene: confirm #451 + #460 resolved-by-s100 status in register (low-cost carry from s100 review)

**Deliverables:**
- Single closeout commit
- Closeout report
- MEMORY.md update
- near.md update
- CMOS session.complete

---

### Alternates considered and deferred (sprint-101 planning, 2026-05-19)

- **C5c apply-summary surface** — third reconciliation surface; reuses m02/m03 pattern; s102 candidate.
- **C6 v1.4.0 registry round-trip** — investigation during planning produced Proposal A (additive read-only via component-mappings extension): accept all 4 fields in map.apply from Stage1 input, store as top-level arrays in component-mappings.json, return via registry.snapshot under new keys. Files: `packages/mcp-server/src/schemas/component-mapping.schema.json`, `packages/mcp-server/src/tools/map.shared.ts`, `packages/mcp-server/src/tools/map.apply.ts`, `packages/mcp-server/src/tools/registry.snapshot.ts`, `packages/mcp-server/src/tools/types.ts`. **s102 candidate.**
- **concordance.validate auto-integration** — third candidate window; usage signal still zero; per s100-m04 decision, **dropped from the candidate list entirely**.
- **A2UI emitter prototype** — spec is stable (Dec 2025); real blocker is absence of a downstream consumer to receive emitter output. **Deferred until a real surface lands.**
- **I2 semantic-federation evaluator** — still needs Birch coordination + planning artifact.
- **Production blocking-timeout decision** — no incident driver.
- **CMOS bug-report follow-up** — inbox watch; no SLA.
- **Stale-learnings triage** — chore; runs at any planning low-cost moment.
- **"Fresh-state verification" quality bar** — single-paragraph add to quality-bars.md; runs at any low-cost closeout moment.

---

## Sprint-100 Locked Shape (locked 2026-05-18) — superseded by Outcomes section above

Sprint-100 pivots from pure capability/integration work to address two named infrastructure surfaces that have accumulated: CI failure debt (visible to anyone watching the repo, blocking honest signal from automated checks) and project env-loading (the CONCORDANCE_API_KEY false-deferral pattern across s98/s99/review revealed `.env` exists at root but no consumer loads it). The mixed-track shape from sprint-99 continues but Quality track expands to 2 missions to absorb the infra debt. N=5 with closeout.

**CI failure scope confirmed (run 26049745235, 2026-05-18):**
- 9 of 12 CI jobs pass; correctness-critical jobs (build/lint/typecheck/tenancy/tokens-validate/diagnostics-schema/a11y-contract/guardrails) all green
- 4 failing jobs cluster into 4 root causes:
  1. `--labels ""` empty-value bug in `tokens-governance` job invocation — affects 3 jobs across 2 workflows (CI's `tokens-governance (A)` + `(B)`, plus standalone `Token Governance Gate / enforce`)
  2. Stale param assertions in `adapter-fresh-install` smoke test (`structuredData_fetch.dataset`, `tokens_build.brand`)
  3. `vr-test` missing `CHROMATIC_PROJECT_TOKEN` secret — operational, not code
  4. `coverage` job — 13 E2E tests across 7 suites fail with `Bridge /run 400 RUN_ERROR`; one underlying `ENOENT transcript.schema.json` artifact-ordering issue
- Plus: Node 20 → Node 24 forced runner switch on 2026-06-02 affects all 7 workflows

### s100-m01 — Q1 Infra hygiene + project env loading

**Track:** Quality
**Objective:** Eliminate the three mechanical CI failure modes, upgrade workflows to Node 24 ahead of the runner deadline, and wire dotenv so project env vars (`CONCORDANCE_API_KEY` and siblings) are automatically available to vitest, the MCP server, and any tool-spawned subshell. This closes the "false deferral" pattern that recurred across s98/s99/review.

**Success criteria:**
- `--labels` invocation in `ci.yml` (tokens-governance matrix) and `token-governance.yml` (enforce) handles empty PR-label sets without exit 1 — either omit the flag when value is empty or have the consumer accept empty string
- Adapter fresh-install smoke test reconciled with current adapter contract: `structuredData_fetch` and `tokens_build` either expose `dataset`/`brand` params (if intentional) OR assertions updated to match current contract (whichever reflects the design decision)
- `vr-test` no longer blocks CI: `continue-on-error: true` + skip-when-token-unset guard so absence of `CHROMATIC_PROJECT_TOKEN` is a clean skip rather than a hard failure; reversible to "enforce + provision" later by setting the secret and flipping the flag
- All 7 workflows (`adapter-fresh-install.yml`, `ci.yml`, `deploy-storybook.yml`, `perf-harness.yml`, `pkg-compat.yml`, `refresh-structured-data.yml`, `token-governance.yml`) upgraded to actions running on Node 24 ahead of 2026-06-02 deadline
- `dotenv` added as workspace devDep; `packages/mcp-server/test/setup-env.ts` resolves project-root `.env` and loads via `dotenv/config`; wired into `vitest.config.ts` via `setupFiles`
- `import 'dotenv/config'` (with explicit project-root path) added to the top of `packages/mcp-server/src/index.ts` and any other long-running entry points (bridge, playground server if spawned outside an interactive shell)
- `.env.example` committed at repo root listing all expected vars (`CONCORDANCE_API_KEY`, `CONCORDANCE_BASE_URL`, `CONCORDANCE_TIMEOUT_MS_BLOCKING`, `CONCORDANCE_TIMEOUT_MS_ADVISORY`, `CONCORDANCE_WORKSPACE`, `CONCORDANCE_SCHEMA_VERSION_OVERRIDE`, `CONCORDANCE_SKIP_INTEGRATION`, `CHROMATIC_PROJECT_TOKEN`) — `.gitignore` already allowlists this file
- `agents.md` gains a setup paragraph: "Copy `.env.example` to `.env`, fill in `CONCORDANCE_API_KEY`. All test runners and entry points in this repo load `.env` automatically — no manual `export` needed."
- **End-state verification:** `pnpm test test/integration/concordance-i1-smoke.spec.ts` with `RUN_HOSTED_SMOKE=1` runs against live concordance without any manual env exports, from a fresh shell or agent-spawned subshell

**Deliverables:**
- `.github/workflows/*.yml` updates (label-flag fix, Node 24 bump, vr-test guard)
- `packages/mcp-server/test/setup-env.ts`
- `packages/mcp-server/vitest.config.ts` `setupFiles` wiring
- `packages/mcp-server/src/index.ts` dotenv import (+ other entry points as needed)
- `scripts/mcp-adapter-fresh-install.mjs` and/or adapter param contract reconciliation
- `.env.example` at repo root
- `agents.md` env-setup paragraph
- `pnpm-lock.yaml` (dotenv install)

### s100-m02 — Q2 Bridge E2E green + coverage gate restored

**Track:** Quality
**Objective:** Root-cause the `Bridge /run 400 RUN_ERROR` pattern affecting ~13 E2E tests across 7 suites in CI, fix the underlying issue, restore the coverage CI job to green. This is the highest-risk mission of the sprint — scope could grow if root cause is non-trivial.

**Success criteria:**
- Mission-start audit answers: do these failures reproduce locally? (likely no, since sprint-99 closed with `tsc clean` + 2581 active pass); is the regression env-only (CI-spawn-time difference), config-only (policy.json or env), build-only (missing artifact), or product (real bug)?
- The `ENOENT: transcript.schema.json` issue at `packages/artifacts/dist/schemas/` resolved — either build-step ordering ensures the file exists before bridge specs run, or the bridge spec gracefully handles absence, or the schema is copied/built earlier
- All 7 affected suites pass in CI: `mapping-versioning.e2e`, `registry-gaps.e2e`, `fragment-integration.e2e`, `a11y-pipeline.e2e`, `design-compose.e2e`, `bridge/fragment-parity`, plus the remaining suites from the "7 failed suites" tally
- Coverage CI job exits 0 with full coverage artifact upload
- If root cause is a product regression rather than infra: fix is in scope, captured as a sprint-99 → sprint-100 regression note for memory
- Mission notes document the root cause for future memory (especially valuable since "bridge E2E flakiness" was already named pre-sprint as a known-issue — this mission converts it from "flakiness" to "named cause + fix")
- **Scope-growth contingency:** if mission-start investigation reveals the root cause requires architectural work (not config / build / small product fix), split mid-mission into m02a (root-cause + fix) and m02b (re-test + coverage gate). Decision rule: if the fix exceeds 2-3 hours of focused work, split. Alternate from sprint-99 candidate list promotes if split happens.

**Deliverables:**
- Whatever code/config/build change closes the root cause
- Coverage job passing in CI
- Mission notes (in CMOS decisions + closeout report) documenting the root cause for institutional memory

### s100-m03 — D2 v2 variant-aware CatalogAnnotations.slots

**Track:** Capability
**Objective:** Close the s99-m01 finding by making `CatalogAnnotations.slots` honor variant selection end-to-end across all three C-track emitters. The finding (decision #451) is that the variant param synthesizes a variant-aware tree at `ctx.schema.screens` but `ctx.catalog.slots` remains canonical render-slots — meaning emitters render render-slots regardless of variant. This becomes load-bearing the moment a multi-variant projection use case (desktop vs mobile wireframe gallery) is needed; doing it now while the surface is fresh is cheaper than retrofitting later.

**Success criteria:**
- Approach picked at mission-start with brief rationale captured as a decision: either (a) extend `CatalogAnnotations.slots` to be variant-driven via `selectVariant()` inside `runPreEmit()`, OR (b) refactor C1/C2/C3 emitters to walk `ctx.schema.screens` instead of `ctx.catalog.slots`. (a) keeps emitters simple; (b) makes the data dependency explicit and removes a duplicated surface — likely (a) wins on emitter-side simplicity, but defer to mission-start
- All three C-track emitters (boxes-arrows, wireframe, review) honor the `variant` emit option end-to-end: passing `variant: "mobile"` produces mobile-variant slot tree, `variant: "desktop"` produces desktop variant, omitting it falls back to canonical render-slots
- At least one fixture exercises 2+ projection variants (either extend an existing fixture or add a new variant-bearing fixture); Q3 E2E gate proves variant-correctness per fidelity
- All existing C-track Q3 E2E gates remain green for canonical-variant rendering (no behavior change for variant-unspecified calls)
- Decision #451 (D2 v2 generalization finding) updated to "resolved by s100-m03 (approach X)" in the CMOS register

**Deliverables:**
- `packages/mcp-server/src/codegen/pre-emit.ts` (or emitter files, per approach choice)
- New or extended fixture under `test/fixtures/object-catalog/`
- Q3 E2E gate extension exercising variant-correctness across all 3 emitters

### s100-m04 — concordance.validate pipeline auto-integration

**Track:** Integration
**Objective:** Re-evaluate the s98-m03 deferral basis ("until tool surface accrues real usage") now that the surface has had two sprints to accumulate, then either auto-bake into the compose/render pipeline or formally re-defer with a named trigger. This mission may end as implementation OR as a formal defer with alternate-mission promotion.

**Success criteria:**
- Mission-start: explicit usage-signal audit captured in a decision — how many tool invocations of `concordance.validate` since s98-m03? Any production gating need? Any agent or human caller actually using it? If signal is zero, mission converts to "explicit re-defer with named trigger + alternate mission promoted" and the alternate (A2UI prototype OR C-track shared util OR I2 evaluator planning artifact) lands in this slot.
- If implementing: `pipeline.handle()` gains optional `validate: true` (default `false`; opt-in for this sprint to avoid breaking existing callers); when true, runs `concordance.validate` as a step between compose and render; surfaces validation errors as pipeline-level errors preserving the full AJV `errors[]` shape
- Retry surface v0.2 (from s99-m02) is exercised on the auto-integration path — auto-bake leans on the same hardened endpoints
- Tests cover: `validate: true` happy path; `validate: true` with manifest validation error (pipeline aborts cleanly with the AJV error context surfaced); `validate: false` is no-op (no behavior change for existing callers); 429/503 retry path on the auto-integration call site
- If re-defer: clean decision memo names the next trigger condition (e.g., "first authenticated production caller of `concordance.validate` from outside the test suite," or "if compose-time manifest errors are reported by a real consumer") + alternate mission spec ready to fold into this slot

**Deliverables:**
- Either: `packages/mcp-server/src/tools/pipeline.ts` (or equivalent) handler update + tests
- Or: defer-decision memo + alternate mission spec for this slot

### s100-m05 — Closeout

**Track:** Quality
**Objective:** Fourth formal run of decision #408 (closeout-as-commit-boundary).

**Success criteria:**
- All sprint-100 deliverables committed in a single closeout commit enumerating mission IDs `s100-m01..m05`; tree clean at `cmos_session(action="complete")`
- `tsc --noEmit` clean
- Full test suite green — this is achievable for the first time in several sprints because s100-m02 fixes the bridge E2E surface that was previously skipping/failing
- CMOS session-complete with decisions + learnings + next-steps captured
- MEMORY.md updated with sprint-100 outcomes (canonical 8th-paragraph form)
- `near.md` "Locked Shape" converted to "Outcomes (closed YYYY-MM-DD)" section
- Closeout report at `cmos/reports/s100-m05-closeout-<date>.md`
- Sprint-101 candidate shape drafted in `near.md`, informed by what landed in s100 and any new findings

**Deliverables:**
- Single closeout commit
- Closeout report
- MEMORY.md + near.md updates
- CMOS session.complete

---

### Alternates considered and deferred (sprint-100 planning, 2026-05-18)

- **C-track shared HTML+escape util** — rule-of-three triggered with C3 joining C1+C2 (decision #460). Real duplication but not load-bearing; defer until either (a) a fourth C-track emitter forces formalization or (b) someone is in the area for another reason. Promotable to s100-m04 slot if concordance.validate re-defers.
- **A2UI emitter prototype** — natural D2 v2 IR-memo trigger (decision #450 names this as the trigger case for formal IR work). Stage1 v1.7.0 cadence is low-load on OODS side; capacity is available IF A2UI itself is ready to land. Deferred unless that readiness signal lands; promotable to s100-m04 slot.
- **I2 semantic-federation evaluator (D4 implementation)** — still needs Birch involvement + standalone planning artifact before implementation. Not promotable to s100-m04 without that prework; alternate-of-alternates only.
- **Production blocking-timeout decision** — no incident driving the 5s → wider question; defer.
- **CMOS bug-report follow-up** — sticky `onboard.currentSprint` + PG mirror drift open since sprint-97 m05; no SLA expected, watch inbox.

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

