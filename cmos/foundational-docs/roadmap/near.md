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

## Viz Flagship Arc — current horizon (s108–s113)

**This is the live horizon. The dated sprint shapes below (s96–s100, s101–s104 candidates) are historical record, retained for point-in-time integrity (decision #679) — NOT the current plan.**

Data-viz is the Forge flagship (decision #680; [forge-viz-flagship-strategy.md](../../planning/forge-viz-flagship-strategy.md)). The arc since the pivot:

- **s108–s109 — Phase 0 (reconnect):** extracted the headless engine as `@oods/viz-core` and wired `src/viz` → MCP via the new `viz.render` (replacing the field-names-only `viz.compose` placeholder).
- **s110 — Phase 1 (data-aware intelligence):** real data profiling → a Draco-class recommender (smarter SELECTION among the beachhead types), plus the `viz-determinism` + `scale-determinism` CI gates.
- **s111 — hierarchy/network unlock:** treemap / sunburst / sankey / force_graph reachable through `viz.render` (additive EChartsPrimary port).
- **s112 — geo unlock + debt + Phase-2 scoping:** choropleth / bubble_map reachable (now **11 chart types**); #681 generated-type retarget done; viz-core coverage gate added; closeout criteria hardened (#740 frozen-lockfile + root typecheck); this memo.
- **s113 (candidate) — Phase 2 (dashboards), BUILD:** a decision-centric linked multi-chart dashboard — `DashboardSpec` IR + headless auto-layout + a `dashboard.render` MCP surface + headless linked-selection/KPI + determinism goldens. Scoped + sized in [forge-viz-phase2-scoping-memo.md](../../planning/forge-viz-phase2-scoping-memo.md). Phase 2 is **mostly BUILD, not expose** — the live tree carries only a spatial-only cross-filter substrate, no generic dashboard spec / auto-layout / linked selection / KPI layer.

Deferred across the arc (the sprint-101 over-scope guard): the ~137-site `src/viz` consumer rewire + shim deletion; NL→viz + semantic-layer (metrics) grounding (Phase 3); agentic exploration / eval harness (Phase 4); server-side SSR rendering.

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

## Sprint-102 Outcomes (closed 2026-05-20)

Sprint-102 ran first sprint after sprint-101 was discarded as a planning failure on 2026-05-19. Scope intentionally smaller-than-default (3 work + 1 closeout, N=4) per post-failure-recovery posture. Framed against the 14 Hard Operating Rules in agents.md. 4/4 missions delivered.

- **m01 Content Domain Pack (Article / Author / Comment)** — three SemanticEntity fixtures at `packages/mcp-server/src/object-catalog/fixtures/content/` plus a multi-entity manifest at `test/fixtures/object-catalog/content-pack.json`. Schema.org alignment carried in `entity.context.schemaorg` (pointing to https://schema.org/Article, /Person, /Comment) as an additionalProperties-friendly extension point; renderer-discretionary, does not affect runPreEmit(). 3+ projection_variants per entity exercising view-mode discriminators (detail/list-card/hero-feature for Article, profile/byline/mini for Author, threaded/flat/nested for Comment). View-mode names used directly as `projection_variants[].surface` values — schema permits any string and selectVariant() matches by string equality, so no new axis discriminator was needed. Cross-entity URN edges (`authored_by`, `has_comments`, `reply_to`) preserved. Gate tests at `src/object-catalog/content-pack.test.ts` mirror G1/G2/G3 structure + add cross-ref + variant-selection assertions.
- **m02 Branded Mockup Emitter (third runPreEmit() consumer)** — `packages/mcp-server/src/codegen/branded-mockup-emitter.ts` ships self-contained HTML+CSS with CSS custom properties scoped via `:root` for default brand-a and `[data-resolved-brand="X"]` for non-default brands actually used. Brand-overlay resolution chain: `options.brandOverlay` (per-emit override) → catalog entity brand_overlay → DEFAULT_BRAND=brand-a; unknown overlay names emit OODS-BM-002 warning + brand-a fallback per Rule 12 (fail loud) so the render still succeeds. Slot-kind visual dispatch (image/heading/subheading/body/meta/price/status/action/generic) drives presentation only — data-slot-name + data-slot-field emit verbatim regardless of kind; data-slot-kind added as a non-contract attr. Kind inference name-based, inline (n=1 consumer per Rule 2). Cross-emitter data-* contract parity test at `test/contracts/emitter-data-attr-parity.spec.ts` confirms C1/C2/branded-mockup all preserve the same anchors. 237 unit + 229 Q3 E2E tests via jsdom. **Decision #525 (D2 third-validated cleanly): runPreEmit() consumed unchanged; PreEmitContext / CatalogAnnotations shape required zero modifications even on the visual-polish dimension.**
- **m03 A2UI Runtime Composition Prototype (fourth runPreEmit() consumer)** — mission-start A2UI-spec audit captured as decision #529 BEFORE any emitter code per Rule 1, finding A2UI v0.9 at github.com/google/A2UI status "closed" (frozen; contributions redirected to v0.10), Google ADK + Lit web renderer + Flutter GenUI SDK target v0.9, no live host endpoint accessible for Forge → IMPLEMENTATION path (memo-only NOT triggered). Vendored real-world v0.9 schemas at `packages/mcp-server/src/a2ui/contracts/v0_9/{server_to_client.json,common_types.json,catalogs/minimal/catalog.json}` byte-identical to upstream per sprint-97 m02 vendoring discipline. Emitter at `packages/mcp-server/src/codegen/a2ui-runtime-emitter.ts` projects entity.oods.render.slots[] → flat A2UI components[] with id+children refs, slot.binding.field → DataBinding `{path}` via dot-path → JSON Pointer translation (RFC-6901 escaping + array-index handling), projection_variants[].surface → A2UI surfaceId, entity.urn → catalogId `oods-forge:<urn>`, brand_overlay → theme.primaryColor via brand-hex map. Targets A2UI minimal catalog (Text/Row/Column/Button/TextField); image slots fall back to Text via DataBinding URL with per-occurrence OODS-A2UI-IMAGE-FALLBACK warning per Rule 12 (fail loud, not silent fix). Image-component extension named as future work (custom catalog declaring Image atop minimal via `acceptsInlineCatalogs:true`, OR target A2UI basic catalog) — neither sprint-102 scope. 26 unit + 98 Q3 E2E AJV-validated tests against all 8 fixtures (user, product, subscription, billing-multi-entity, content-article/author/comment, content-pack). Cross-emitter HTML-only parity test NOT extended to A2UI (decision #531): JSON output doesn't fit the DOM-query-shaped contract; A2UI's structural contract asserted inside its own Q3 gate. **Decision #530 (D2 abstraction FOURTH-validated cleanly across an output-format axis change HTML → JSON message stream; IR-memo trigger from decision #450 did NOT fire).** Zero modifications to pre-emit.ts / CatalogAnnotations / PreEmitOptions / runPreEmit() signature. Per-variant emission still uses the s100-m03 selectVariant() pathway unchanged.
- **m04 closeout — fifth formal run of decision #408.** m01 and m02 received per-mission "handoff checkpoint" commits (`2bd6c9d`, `ebd2ee6`) for cross-machine work continuity; m04 makes the formal sprint closeout commit on Forge-expansion enumerating s102-m01..m04 in the message body for bisection. Closeout report at `cmos/reports/s102-m04-closeout-2026-05-20.md`.

Test posture at sprint-102 close: **158 files / 2855 active pass / 10 skipped** (+6 files / +249 active vs sprint-100 baseline). tsc --noEmit clean for both mcp-server and mcp-bridge.

Position B claim ("A2UI hosts can consume Object Catalogs") **proven at the emitter side**: Forge emits v0.9-conformant runtime composition trees end-to-end, AJV-validated against real Google schemas across all 8 fixtures. Live host conformance testing remains future work pending an accessible A2UI host endpoint.

Sprint-101 failure mode (planning on a hallucinated user) did not recur. Rule 1 + Rule 3 + Rule 12 were actively applied throughout (mission-start audit before any A2UI code; no silent fix for the A2UI image-component gap; no premature abstraction extraction at n=2 for slot-kind inference).

---

## Sprint-103 Outcomes (closed 2026-05-21)

Sprint-103 ran N=4 (3 work + 1 closeout) — second consecutive lean sprint as a confidence pass after the sprint-101 recovery. 4/4 missions delivered. Test posture: 163 files / 2962 active pass / 10 skipped (+1 file / +107 active vs sprint-102 close 158/2855). tsc --noEmit clean for both mcp-server and mcp-bridge. Full closeout report at `cmos/reports/s103-m04-closeout-2026-05-21.md`.

- **s103-m01 — Reframed C3 `review.resolve` agent-callable policy tool.** First MCP tool in the post-`db3b3b0` C3 reframing. Pure-function evaluator (D4 pattern, ordered first-match-wins) at `packages/mcp-server/src/codegen/review-policy.ts` with 3 predicate kinds: confidence_threshold / signal_type_floor / entity_urn_match (glob with `*` and `?`; URN punctuation escaped literally). Handler at `packages/mcp-server/src/tools/review.resolve.ts` mirroring `concordance.validate`'s two-way manifest|manifestPath input. AJV input + output schemas under `packages/mcp-server/src/schemas/review.resolve.{input,output}.json` with embedded policy-bundle `$defs`. 5-surface registration (registry.json + registry.ts FALLBACK + index.ts toolSpecs + security/policy.json + adapter tool-descriptions.json). Mission-start audit captured as CMOS decision BEFORE code per Rule 1; convergence: IMPLEMENTATION path, no D-memo fork. 70 new tests (25 evaluator unit + 20 handler unit + 25 Q3 E2E AJV-validated). Default action `defer` (unmatched items surface). Agent-callable; no playground UI.
- **s103-m02 — C6 v1.4.0 registry round-trip via Proposal A (top-level, not per-mapping).** Decision #484 from sprint-101 carry-forward salvaged. `component-mapping.schema.json` adds top-level optional `disambiguation_decisions[]` / `preferred_terms[]` / `capabilities[]` with inlined Stage1 entity $defs. `map.create` handler appends to top-level arrays on `apply=true` (additive only). `registry.snapshot` output schema + handler surface them losslessly when present, omitted entirely otherwise (byte-equivalent for legacy callers). 2 contract fixtures (`test/fixtures/object-catalog/registry-v14-{synthetic,stage1-shape}.json`). 13 round-trip tests covering G1 fixture validation, G2 bilateral non-regression (production doc still validates), G3 round-trip (5: persists on apply=true, on-disk validates, dry-run skips, omission keeps doc clean, multiple calls APPEND), G4 `projection_variants` round-trip via `runPreEmit` (4: mobile/desktop/canonical/production-user). selectVariant() pathway (s100-m03) confirmed survives JSON serialization.
- **s103-m03 — A2UI Image custom-catalog extension.** Closed OODS-A2UI-IMAGE-FALLBACK from s102-m03 (decision #533). New Forge custom catalog at `packages/mcp-server/src/a2ui/contracts/v0_9/catalogs/forge/catalog.json` — strict superset of minimal (Text/Row/Column/Button/TextField) plus Image (url=DynamicString required, alt optional, fit optional). Canonical catalogId `oods-forge:catalog/v1` exported as `FORGE_CATALOG_ID`. Emitter emits Image components for image-kind slots with `url=DataBinding`, `alt=slot.name`, `accessibility.label=slot.name`; OODS-A2UI-IMAGE-FALLBACK warning retired by changing the surface (Rule 12 preserved — warning fired BECAUSE of real gap; closing the gap retires the warning). `meta.catalogProfile` flipped 'minimal' → 'forge'. **Rule 12 + Rule 1 application:** A2UI v0.9 vendored schemas have NO `acceptsInlineCatalogs:true` field that the mission spec referenced; rather than fake the extension, spec-compliant alternative chosen (separate catalog file referenced by ID). Captured as a CMOS decision. Existing 98 Q3 cases preserved in count (AJV setup switched to Forge catalog, behavior assertion inverted for image fallback). New focused 24-test image-specific E2E gate at `test/e2e/a2ui-image-q3.e2e.spec.ts`.
- **s103-m04 — Closeout (6th formal #408 run).** Single closeout commit enumerates s103-m01..m04. NO janitorial per `feedback_hygiene_in_planning_not_missions.md` (hygiene was executed in the 2026-05-20 planning session).

Sprint-101 failure-mode regression check: no recurrence. Rule 1 + Rule 3 + Rule 12 actively applied throughout. **Two consecutive lean sprints (s102 + s103) shipped clean post-recovery — sprint-104 can restore to N=5.**

---

## Sprint-104 Outcomes (closed 2026-05-21)

Sprint-104 restored default cadence **N=5 (4 work + 1 closeout)** after two consecutive lean confidence-pass sprints (s102 + s103) shipped clean post-s101 recovery. **5/5 missions delivered.** Theme realized: reached the A2UI host conformance rung that the s102-m03 closeout named as future work, and **closed C5 fully** in one sprint by shipping all three agent-readable structured-artifact surfaces named in the mission-graph success criterion.

Sprint title: **"A2UI Host Conformance (Lit local) + C5 Full Close."**

Full closeout report at `cmos/reports/s104-m05-closeout-2026-05-21.md`. End-of-sprint posture: **5 of 6 C-axes closed** (C1/C2/C3/C5/C6 ✓; only C4 remains and per db3b3b0 may not survive as a separate axis). Test posture: 173 files / 3406 active / 10 skipped (+444 active vs s103 close). Rule 1 mission-start audit pattern n=7 clean runs.

Mission slate locked from the s103 closeout candidate shape (decision #562):

### s104-m01 — A2UI host conformance harness (Lit local)

**Track:** Integration / Capstone
**Objective:** Ship the first A2UI host conformance harness via a Lit local renderer. Closes the "Position B claim proven at the emitter side" caveat from the s102-m03 closeout. Validates beyond AJV: wire-shape conformance does not prove that a real host instantiates the component tree (DataBinding paths resolve, component references don't dangle, render order is consistent).

**Lit-vs-ADK choice locked in this planning session (PS-2026-05-21-003):** Lit local renderer chosen. Reasoning: cheap-and-deterministic-first pattern (mirrors s97-m04 → s98-m04 concordance smoke evolution). ADK `A2uiSchemaManager` becomes a future env-gated upgrade.

**Mission-start audit (mandatory per Rule 1):** five axes captured as a CMOS decision BEFORE harness code:
- (a) AJV-vs-host gate boundary — what does host conformance catch that AJV doesn't? Answer with at least one concrete test case.
- (b) Host adapter shape — a2ui-message → Lit component tree mapping pattern. Single function? Per-component dispatch? Where does `oods-forge:catalog/v1` registration happen?
- (c) First conformance fixture set — all 98 Q3 cases? a focused subset? new fixtures?
- (d) Failure-mode contract — emitter regression vs harness drift, distinguished how in CI output?
- (e) CI shape — `@lit-labs/ssr` vs happy-dom vs jsdom?

Convergence to IMPLEMENTATION path is default; divergence (5+ session rework on any one axis) triggers memo-only fork and promotes default alternate (a fourth C5 surface variant OR a real concordance ingest probe).

### s104-m02 — C5 review-queue agent-readable artifact

**Track:** Capability
**Objective:** First of three C5 surfaces. Ship a structured machine-readable JSON emitter producing a "review queue" artifact — the list of entities needing review with their confidence tier + lowest-signal breakdown — as input agents pass to `review.resolve` (s103-m01). NOT a human UI; an agent-consumed JSON artifact composable with the C3 policy tool. Reuses the s103-m01 + s99-m04 patterns (emitter, AJV schema, PreEmitContext consumer, unit + Q3 tests).

### s104-m03 — C5 conflict-detail agent-readable artifact

**Track:** Capability
**Objective:** Second C5 surface, pattern reuse from m02. Per-entity deep breakdown of WHY a single low-confidence entity needs review — full signal list, evidence gaps, entity context. Consumable by orchestrating agents reasoning about a specific conflict before invoking `review.resolve`.

### s104-m04 — C5 apply-summary agent-readable artifact

**Track:** Capability
**Objective:** Third and final C5 surface. **Closes C5 fully** — mission-graph success criterion ("three reconciliation surfaces") satisfied. Structured delta after `review.resolve` decisions are applied, with full audit trail. Transcript artifact agents can persist for replay/audit/handoff. Q3 gate composes m02 → `review.resolve` → m04 end-to-end.

### s104-m05 — Closeout (7th formal run of decision #408)

**Track:** Quality
**Objective:** Seventh formal #408 run. Single closeout commit enumerating s104-m01..m05. No janitorial — planning-session hygiene was executed in this session (PS-2026-05-21-003) per the addendum to `feedback_hygiene_in_planning_not_missions.md`. Closeout report verifies C5 full closure + Position B host-side conformance milestone.

### Standing alternates (deferred from s104 planning)

- **`review.resolve` real-world usage signal watch** — passive planning-session checkpoint for s105, not a build mission. Promotion candidates: pipeline auto-integration, policy-bundle persistence as registry artifact, `review.batch` for throughput.
- **Concordance grounding of content-pack** — schema.org alignment already landed in s102-m01 (object-catalog.md line 215; the stale carry-forward next-step is dropped). Real concordance ingest of the publishing domain remains a partner-side prerequisite; no Forge-side work to do until then.
- **I2 semantic-federation evaluator (D4 implementation)** — still gated on Birch coordination. Same posture as s101/s102/s103.
- **A2UI ADK `A2uiSchemaManager` env-gated upgrade** — future capstone after Lit local lands; promotes when partner integration calls for it.

### C-track status after s104

Closed by end of s104: C1 (s98-m02), C2 (s99-m02), C3 (s99-m04 emitter + s103-m01 `review.resolve`), C5 (s104-m02..m04 this sprint), C6 (s103-m02). **Five of six C-axes closed.** Only C4 remains, and per the db3b3b0 reframing C4 may not survive as a separate axis.

---

---

## Sprint-107 Locked Shape (locked 2026-06-09 in PS-2026-06-09-004)

N=4 (3 work + 1 closeout). Drafted directly from the s106 review (session PS-2026-06-09-003). Theme: **MCP tool-surface consolidation + LayoutType single-source + Q1 determinism close.** With the C-track closed (5/6, C4 dropped) and the I/Q frontier mostly gated (I2 Birch, I3 agent-vitals dashboard, dashboard re-slug), s107 anchors on consumer-facing hardening rather than a new capability axis. Full build-ready specs live in CMOS missions `s107-m01..m04` (`cmos_mission show`); summary:

- **s107-m01 — MCP tool consolidation (scoping-first, Rule 1).** `registry.json` `auto` exposes 27 tools; group the 5 CRUD-shaped families into action-parameter tools (the `cmos_*` pattern) — map (6→1), schema (4→1), object (2→1), repl (2→1), review (2→1) — exposed surface **27→16**, zero functionality loss. Generation verbs (design.compose, viz.compose, code.generate, fidelity.preview, pipeline, brand.apply, tokens.build) stay separate. Mission-start audit settles the consumer-migration path (deprecated aliases vs demote-to-onDemand vs hard-rename) and whether to fold catalog.list+registry.snapshot+object into an inspection group, BEFORE code. Touches all 5 registration sites + both policy layers (#622) + the adapter (restart required). Splits m01/m01b → N=5 if the migration sizes past one mission.
- **s107-m02 — Single-source LayoutType + close the landing/pipeline gap** (review #660 / next-step #363). `landing` was added to design.compose in s106-m04 but never reached `pipeline.ts:18` / `pipeline.input.json:30` / `generated.ts`, so `pipeline(layout='landing')` is AJV-rejected while `design.compose(landing)` works. Export ONE shared `LayoutType`, consume it across design.compose + slot-expander + pipeline, derive the AJV enums from it (or a parity test that fails CI on drift). Independent of m01.
- **s107-m03 — Q1 determinism sustain, sprint 3 of 3** (V2 axis #7). Keep `test:scale` green at 100/500/1000 (s105=1/3, s106=2/3); re-verify after m01. Release-gate flip is s108 / s107-retro per #614 — not this sprint.
- **s107-m04 — Closeout (10th formal #408).** Single closeout enumerating s107-m01..m04; verify the surface reduction, the LayoutType parity, and Q1 3/3; record the operator adapter-restart note. No janitorial.

Mission-start audit (Rule 1) required on m01–m03. **Parked / NOT in slate:** I2 semantic-federation (Birch), I3 dashboard hookup (agent-vitals), OODS-Forge dashboard re-slug (dashboard team), the 9 Vite URL-transform instances (trigger-gated), playground taste-judgment signal (passive). **Consumer hand-offs pending:** Synthesis-Workbench (fragment-anchor contract hardened — `docs/integration/fragment-anchor-contract.md`) and The Academy (landing layout + page/IA roles, live via design.compose). Refs: s106 review decisions #658/#660; `registry.json`; #622 (two-policy-layer); #614 (Q1 gate-flip).

---

## Sprint-106 Outcomes (closed 2026-06-09)

Sprint-106 held default cadence **N=5 (4 work + 1 closeout)** for the fifth consecutive sprint post-s101 recovery. **5/5 missions delivered.** Theme realized: first sprint scoped by real consumer usage (Synthesis-Workbench comment-layer + The Academy IA/landing-page). Test posture (default suite): **170 files / 3396 active / 0 skipped** (−6 files vs s105 close — the Concordance teardown removed 9 test files net of 3 new contract specs; 0 skips because all prior env-gated skips lived in deleted Concordance live tests). Scale suite (opt-in): 2 files / 14 active / 0 skipped. **Rule 1 mission-start audit pattern: n=15 clean IMPLEMENTATION-path runs** (m01–m04 all IMPLEMENTATION). **Rule 12 spec-discrepancy callout fired on three of four work missions** (m01 named test-file targets the wrong attribute family; m02 pragmatic-roles.json is NOT consumed by the $def + the audit agent mis-dispositioned all refs as "keep"; m03 SEMANTIC_PROTOCOL.md source lives only in the sunset diverge-and-concord repo) — each named and scoped before wasted work.

### s106-m01 — Harden the fragment-anchor contract

Contract + tests + docs only, **no renderer change** (anchors already at `component-map.ts:120,122`). Declared `data-oods-label` the durable structure-independent anchor and `data-oods-node-id` best-effort (per-compose-run `uid()` counter). New `test/contracts/fragment-anchor-contract.spec.ts` (presence + determinism + a 3→5-tab structural re-compose proving label-stable / node-id-shifts). Hand-authored `docs/integration/fragment-anchor-contract.md`. SPEC-DISCREPANCY: the named `emitter-data-attr-parity.spec.ts` covers a different attribute family → took the criterion's "OR a focused test" path. Also: `docs/api/` is generator-owned, so the contract doc went to `docs/integration/`.

### s106-m02 — Concordance teardown + re-home

Deleted `src/concordance/` (2,766 LOC), the `concordance.validate` tool + 2 schemas + all 5 registration sites, the integration/live tests + `auth-hygiene.spec.ts` (subject gone), and the sync script. RELOCATED the Forge-owned protocol vocab (pragmatic-roles/edge-types/task-types + the frozen `manifest.schema.json`) to `src/object-catalog/protocol/`; DELETED the Concordance-integration-only contracts (api schemas, recipes). RE-HOMED Object Catalog G1 onto a de-branded `manifest-validator.ts` (40 catalog tests green, zero coverage loss). grep-clean of `../concordance/` imports; agents.md/.env.example/docs updated.

### s106-m03 — pragmatic_role page/IA roles

Additively expanded the Forge-owned enum with 4 non-action page/IA roles — `page`, `landing`, `section`, `index` (dropped the redundant `hub` candidate). The action-shaped validator is an allowlist `if-then`, so new roles needed no validator change. All live-enum sites kept in sync (schema.json $def, types.ts union, frozen manifest.schema.json, both ROLE_LABEL maps + boxes-arrows CSS). New `test/contracts/pragmatic-role-ia.spec.ts` (G1 + non-action + render round-trip via the inline-manifest path).

### s106-m04 — design.compose content-page support

IMPLEMENTATION path (5-agent scoping audit sized it SMALL). New `src/compose/templates/landing.ts` (hero + section-stack + CTA + footer, intent-only, existing components). Fixed the `page`→detail collision by moving `page` to the `landing` keyword set (ties with strong data-view keywords resolve to the data-view layout via stable sort). `landing` made a first-class layout (intent + explicit param). Found/fixed a second narrower `LayoutType` union in `slot-expander.ts`. 10 tests; `docs/api/design-compose.md` regenerated.

### s106-m05 — Closeout (this mission)

Ninth formal run of decision #408. Single closeout commit enumerating s106-m01..m05. **Q1 determinism scale suite green = sprint 2 of 3** toward the V2-axis-7 release-gate flip (s105=1/3; s107=3/3; gate flips at s108 / s107-retro). Two-policy-layer convention (#622) landed in agents.md. Build-freshness gate resolved via root build.

---

## Sprint-105 Outcomes (closed 2026-05-21)

Sprint-105 held default cadence **N=5 (4 work + 1 closeout)** for the fourth consecutive sprint post-s101 recovery. **5/5 missions delivered.** Theme realized: first sprint to push the **I** and **Q** tracks since their introduction in the mission graph — C-track effectively closed at 5/5 axes shipped (C4 was dropped in this sprint's planning session).

Sprint title: **"I3 Telemetry + Playground Catch-up + Q1 Determinism."**

Full closeout report at `cmos/reports/s105-m05-closeout-2026-05-21.md`. End-of-sprint posture: **5 of 6 C-axes closed** (C1/C2/C3/C5/C6 ✓; C4 DROPPED — replacement watch = "playground taste-judgment usage signal"). Test posture (default suite): 176 files / 3492 active / 10 skipped (+86 vs s104 close). Scale suite (opt-in): 2 files / 14 active / 0 skipped. **Rule 1 mission-start audit pattern n=11 clean runs.** Rule 12 spec-discrepancy callout fired on THREE of four missions (m02 framework-vs-fidelity / m03 pipeline-doesn't-have-N-cardinality / m04 no-MCP-tool-wraps-C5-emitters) — exactly the failure mode the post-s101 rule set was designed to catch.

### s105-m01 — I3 telemetry scaffolding (OTLP)

**OPENS I3.** Env-var-gated lazy OTel SDK + OTLP HTTP exporter; zero runtime overhead when unset. Dispatcher span at `src/index.ts` wraps every MCP tool call with `forge.tool.<name>` + `SpanKind.SERVER` + `rpc.*` semconv + `oods.*` custom attrs. SIGTERM/SIGINT drain. 16 unit tests via InMemorySpanExporter. Dashboard hookup deferred (agent-vitals dashboard is WIP).

### s105-m02 — Playground HTML emitter coverage (fidelity.preview)

Closes the playground demo gap that was open since s98 (C1) + s99 (C2) + s99 (C3-emitter) + s102 (branded-mockup). Rule 12 SPEC DISCREPANCY callout caught the framework-vs-fidelity structural error BEFORE code: emitters consume ObjectCatalogManifest not UiSchema. Audit pivoted to a new MCP tool `fidelity.preview` rather than extending the framework enum. Separate Fidelity selector orthogonal to Framework. Server-resident FIXTURE_PATHS allow-list (9 Q3 fixtures, eliminates path traversal). 26 unit tests including path-traversal rejection.

### s105-m03 — Q1 determinism baseline

**OPENS Q1 (not closes).** 1 of 3 sprints in the V2 axis #7 success-criterion streak. Rule 12 SPEC DISCREPANCY callout scoped the mission to map.apply-only (pipeline has no N-cardinality input). Seeded mulberry32 ReconciliationReport synthesizer + companion MappingsDoc seed helper. 9 determinism tests + 5 map.apply scale tests across the 100/500/1000 tier grid. Opt-in `pnpm test:scale` + separate `scale-determinism` CI job (not on the release gate yet). Reproducibility evidence: 3 consecutive local runs green at ~2.4s. Parallel-test isolation via per-test temp dirs + `MCP_MAPPINGS_PATH`.

### s105-m04 — Playground JSON-artifact wave (C5 chain + review.resolve invocation)

Closes the playground demo gap for the most strategically significant work since sprint-100 (C5 chain shipped in s104 with zero demo path). Rule 12 SPEC DISCREPANCY callout: no MCP tool wraps the three C5 emitters; only review.resolve from s103-m01 is a tool. Audit chose ONE composite tool `review.chain` over three separate emitter-tools per Rule 2. New "Reconcile" view (third top-level tab #reconcile) with step-through state machine (queue → resolve → summary), structured panels with raw-JSON toggle per panel, fixture picker, 2-option policy radio (flag-below-0.5 / dismiss-all bundles inlined from s104-m04 Q3 e2e). 18 unit tests + live-bridge smoke trio × 2 bundles = 6/6 green. Two-policy-layer convention captured (bridge `configs/agent/policy.json` + server `src/security/policy.json` both required).

### s105-m05 — Closeout (this mission)

Eighth formal run of decision #408. Single closeout commit enumerating s105-m01..m05. NO janitorial per `feedback_hygiene_in_planning_not_missions.md` — planning-session hygiene was executed in PS-2026-05-21-006 with its own commit per the addendum rule. Closeout report verifies I3 + Q1 honest framing (OPENED, not CLOSED) and the C-track final disposition (5/5 + C4 dropped).

### C-track status after s105

**End-of-sprint posture: 5 of 6 axes shipped.** C1 (s98-m02), C2 (s99-m02), C3 (s99-m04 emitter + s103-m01 tool), C5 (s104-m02..m04), C6 (s103-m02). **C4 DROPPED** as a separate axis in PS-2026-05-21-006 — replacement watch item is "playground taste-judgment usage signal" (passive, promotes only on signal). The natural C-track close was visualized at planning lock.

### Sprint-106 candidate shape (drafted at s105 close)

- **Q1 SUSTAIN — sprint 2 of 3.** Scale-determinism CI job needs to stay green for the full sprint to count toward the 3-sprint streak. Could be a single tiny mission or absorbed into the closeout.
- **I3 dashboard hookup IF agent-vitals dashboard lands.** Gated on dashboard availability.
- **`review.resolve` real-world usage signal watch** — passive; the C5 chain now has both agent-callable and inspection surfaces.
- **A2UI ADK `A2uiSchemaManager` env-gated upgrade** — natural progression after Lit local; partner-gated.
- **I2 semantic-federation evaluator (D4 implementation)** — Birch-gated.
- **9 known Vite URL transform instances** — trigger-gated on happy-dom env requirement.
- **Concordance grounding of content domain pack** — partner-gated.
- **Playground taste-judgment usage signal** — passive watch (promoted from former C4).
- **Two-policy-layer convention** — small hygiene addition to CLAUDE.md / agents.md surfaced from m04 debugging.

Sprint shape recommendation: **N=4 or N=5 with closeout** depending on whether the agent-vitals dashboard or Birch signal materializes.

---

### Sprint-106 Locked Shape (locked 2026-06-09 in PS-2026-06-09-001) — supersedes the candidate above

N=5 (4 work + 1 closeout). Theme: **consumer-driven hardening + Concordance teardown** — first sprint scoped by real consumer usage (Synthesis-Workbench comment-layer + The Academy IA/landing-page work). Full build-ready specs live in CMOS missions `s106-m01..m05` (`cmos_mission show`); summary:

- **s106-m01 — Harden the fragment-anchor contract.** Declare `data-oods-label` the durable, structure-independent anchor and `data-oods-node-id` best-effort (it's a per-compose-run `uid()` counter, so it shifts on structural change); extend the parity contract test to the `repl.render` format:fragments path. Unblocks Workbench's comment layer. Q1/Q2 reply already sent (msg 188672a7); their "add anchors" request (3e8a67fb) withdrawn.
- **s106-m02 — Concordance teardown.** Remove the sunset integration (decision #633); RELOCATE the protocol contracts Forge owns (`pragmatic-roles.json` etc., currently under `concordance/contracts/`) to a Forge-owned path; re-home Object Catalog G1 validation onto a Forge-owned schema.
- **s106-m03 — pragmatic_role page/IA roles.** *Requires m02* (protocol re-home). Expand the Forge-owned enum with page/IA roles so site-map pages aren't forced into navigation/informational. Additive.
- **s106-m04 — design.compose content-page support (scoping-first).** Audit + scoping decision for content/marketing-page layouts ("landing page" currently routes to detail/Tabs because "page" is a detail keyword); first template OR memo-fork if > 1 mission.
- **s106-m05 — Closeout (9th #408) + Q1 determinism sustain (sprint 2 of 3).** Single closeout commit; verify the scale suite green; land the two-policy-layer doc (#622); resolve the build-freshness gate.

Mission-start audit (Rule 1) required on m01–m04. Parked / NOT in slate: OODS Forge dashboard re-slug (dashboard team, DB-upload timeout); I3 dashboard hookup (agent-vitals gated); I2 semantic-federation (Birch-gated); React Flow IA canvas (lives in Workbench, not Forge); the standing passive watches.

---

---

## Sprint-105 Locked Shape (locked 2026-05-21 in PS-2026-05-21-006) — superseded by Outcomes above

N=5 (4 work + 1 closeout). Title: "I3 Telemetry + Playground Catch-up + Q1 Determinism." First sprint to push the I and Q tracks since their introduction in the mission graph — C-track effectively closed (C4 dropped this planning session, 5/5 axes shipped).

- **s105-m01 — I3 telemetry scaffolding (OTLP).** Env-var-gated lazy OTel SDK + OTLP HTTP exporter; 5 trace span kinds (compose, validate, render, codegen, map.apply) + 2 metrics; minimum dep set (api + sdk-trace-node + exporter-trace-otlp-http; no auto-instrumentations); InMemorySpanExporter for tests; no dashboard hookup (agent-vitals dashboard is WIP). Mission-start audit on 5 axes per Rule 1.
- **s105-m02 — Playground HTML emitter coverage.** Wire C1 boxes-arrows + C2 wireframe + C3 review-emitter + branded mockup into the compose-view selector. Mechanical; closes the playground demo gap audited in this planning session.
- **s105-m03 — Q1 determinism baseline.** Real artifacts at 100/500/1000 mapping states; parallel test execution; pipeline + map.apply paths exercised at scale. Honest framing: opens Q1, does NOT close it (mission-graph criterion requires 3-sprint streak; s105 is sprint 1 of 3).
- **s105-m04 — Playground JSON-artifact wave.** Wire C5 chain (review-queue + conflict-detail + apply-summary) + review.resolve invocation button. Step-through chain UX; structured panels + raw-JSON toggle; default policy bundle hard-wired (no policy-editor UI per post-C4-drop discipline). Depends on m02.
- **s105-m05 — Closeout (8th formal #408 run).** Single closeout commit enumerating s105-m01..m05; closeout report verifies I3/Q1 honest framing + C-track final disposition.

**Standing alternates (deferred from s105 to passive watch):** review.resolve real-world usage signal, A2UI ADK A2uiSchemaManager, I2 semantic-federation (Birch-gated), 9 Vite URL transform instances (trigger-gated), concordance grounding of content-pack (partner-gated), **playground taste-judgment usage signal** (new watch — promoted from former C4 after disposition).

**C4 disposition (this planning session):** DROPPED as a separate axis. The reframed "playground as taste-judgment surface" still carried human-UI framing — the same shape that caused the s101 failure mode. Documentation drift fixed in same hygiene commit (mission-graph.md C3/C4/C5 stanzas + overview.md C-track list + human-audit paragraph).

---

## Sprint-105 Candidate Shape (drafted 2026-05-21 at s104 close) — superseded by Locked Shape above

(Original candidate shape preserved for traceability — slate selection reasoning at decisions #601 + #602 + PS-2026-05-21-006.)

- **C4 reframing decision** — only C4 remains on the C-track and per the db3b3b0 reframing C4 may not survive as a separate axis. A planning-session decision is needed: drop C4 entirely, OR redefine it explicitly (currently "playground as taste-judgment surface"), OR fold its scope into the I-track. Recommended planning-session item, NOT a build mission.
- **`review.resolve` real-world usage signal watch** — still passive after s104. With the C5 chain now complete, usage may begin materializing. Promotion candidates if signal surfaces: pipeline auto-integration (auto-bake `review.resolve` into the compose pipeline), policy-bundle persistence as registry artifact (so policy bundles can be named + reused), `review.batch` for high-throughput batches.
- **A2UI ADK `A2uiSchemaManager` env-gated upgrade** — natural progression after Lit local harness lands. Same pattern as concordance smoke s97-m04 → s98-m04 (local env-gated harness shipped first, live partner exercise came later). Gated on partner integration calling for it.
- **I2 semantic-federation evaluator (D4 implementation)** — still gated on Birch coordination. Same posture as s101 through s104.
- **9 known instances of the Vite URL transform incompatibility** in `src/tools/*` and `src/index.ts` (learning captured in s104-m01 implementation). NOT s105-blocking; the trigger is "any test that needs happy-dom env on those modules." Surface for any future sprint that wants happy-dom coverage of the MCP-tool side.
- **Concordance grounding of content domain pack** — schema.org alignment landed in s102-m01 already; full concordance ingest remains a partner-side prerequisite. Same posture as s103 + s104.
- **C-track completion?** Depending on the C4 reframing decision, sprint-105 or sprint-106 may close the C-track entirely. After that the natural sprint shape returns to a Foundation/Integration mix.

Sprint shape recommendation: **N=5 (4 work + 1 closeout)** — default cadence holds. Three consecutive successful sprints post-recovery (s102 + s103 + s104).

---

## Sprint-104 Candidate Shape (drafted 2026-05-21) — superseded by Outcomes above

(Original candidate shape preserved for traceability — slate selection reasoning at decision #562 + PS-2026-05-21-003.)

- **A2UI host conformance test harness** → locked as m01 (Lit local).
- **C5 evidence-backed agent-readable artifacts** → locked as m02 + m03 + m04 (three surfaces, full C5 closure).
- **`review.resolve` real-world usage signal watch** → standing alternate (passive checkpoint, not a build mission).
- **Concordance grounding of content-pack** → standing alternate (schema.org alignment already landed s102-m01; concordance ingest gated partner-side).
- **I2 semantic-federation evaluator (D4 implementation)** → standing alternate (Birch coordination still pending).

---

## Sprint-103 Locked Shape (locked 2026-05-20) — superseded by Outcomes section above

Sprint-103 locked at N=4 (3 work + 1 closeout) — second consecutive lean sprint as a confidence pass after the sprint-101 recovery. Theme: execute the post-s101 **C3/C4/C5 reframing** that landed in `db3b3b0 docs(foundational): reframe C3/C4/C5 to drop human-operator framing` by shipping the reframed C3 surface (agent-callable, policy-based; not a human UI); then deepen the registry knowledge model via C6 round-trip; then close the OODS-A2UI-IMAGE-FALLBACK gap from s102-m03. Hygiene work executed in s103 planning session (this session) per `feedback_hygiene_in_planning_not_missions.md` — not folded into any build mission. Standing alternates dropped from candidate-watch: `concordance.validate` auto-integration trigger-watch (zero usage signal in 2+ sprints) is closed unless a downstream consumer surfaces.

### s103-m01 — Reframed C3: Agent-callable policy-based conflict-resolution MCP tool

**Track:** Capability
**Objective:** Ship the first agent-callable MCP tool that takes a low-confidence reconciliation conflict artifact + a policy bundle as input, applies the policy, and produces a resolved-delta (accept / patch / defer / dismiss) with an audit trail. This is the **decision-logic** surface for the C3 reframing — explicitly NOT a human UI, NOT a renderer. The s99-m04 review-emitter renders confidence tiers; this tool *resolves* the flagged items by policy.

**Mission-start audit (mandatory per Rule 1, captured as CMOS decision BEFORE any code):** answer (a) what policy axes exist (confidence threshold? signal-type? entity URN match? brand_overlay?), (b) input shape (conflict artifact + policy bundle as separate args? merged? per-workspace policy at registry?), (c) output shape (resolved-delta schema + audit-trail schema), (d) relationship to existing `oods.confidence_decomposition` field shipped in s97-F1 and consumed by s99-m04 review-emitter, (e) policy-evaluator pattern adopted (D4 OODS-subscriptions evaluator wrapper? bespoke? new D-memo needed?). If audit surfaces 5+ session rework — e.g., the policy shape forks into a real D-memo — convert to memo-only path and promote alternate (default alternate: A2UI host conformance testing).

**Success criteria:**
- MCP tool registered in all 5 places (registry.json + registry.ts FALLBACK + index.ts toolSpecs + security/policy.json + adapter tool-descriptions.json)
- Input + output JSON schemas defined; AJV-validated
- Policy bundle shape captured as a TypeScript type + JSON schema; at least 3 policy types named (e.g., `confidence_threshold`, `signal_type_block`, `entity_urn_match`)
- Resolved-delta and audit-trail shapes captured similarly
- Unit tests cover: each policy type's evaluator; ambiguous-policy precedence; no-matching-policy default behavior; malformed-policy rejection
- Q3 E2E gate: at least one real-data scenario using the s99-m04 `subscription-low-confidence.json` synthetic fixture (the only LOW-tier surface in the fixture set) — the tool produces a resolved-delta + audit-trail for that entity
- Agent-callable: the tool docstring + tool-descriptions.json entry explicitly state "consumed by orchestrating agents; no playground UI required"

**Deliverables:**
- `packages/mcp-server/src/tools/review-resolve.ts` (or similarly-named) with handler
- `packages/mcp-server/src/codegen/review-policy.ts` (policy evaluator)
- New JSON schemas under `packages/mcp-server/src/contracts/review-policy/`
- Mission-start audit decision in CMOS
- Unit + Q3 E2E test files

### s103-m02 — C6 Registry knowledge-model depth round-trip

**Track:** Capability
**Objective:** Implement the OODS-side round-trip for the v1.4.0 schema stubs (`disambiguation_decisions`, `preferred_term`, `capability`, `projection_variants`) that have been opt-in pending Stage1 emitter work. The round-trip is the OODS-side implementation gap; Stage1 producing real instances of these fields is a separate concern. Closes the largest remaining gap in the canonical mission-graph C-track.

**Success criteria:**
- All four v1.4.0 schema stubs round-trip cleanly through `compose → validate → save → load`
- `registry.snapshot` returns each field's contents losslessly
- `map.create` accepts each field's input shape
- At least 2 end-to-end contract fixtures exercise the full v1.4.0 registry shape (one synthetic, one mirroring Stage1's expected emission shape)
- Bilateral tests: existing Stage1 v1.6.0 fixtures continue to validate (no regression)
- `projection_variants` round-trip in particular: the existing `selectVariant()` pathway (s100-m03) is exercised in a round-trip context, not just at render-time

**Deliverables:**
- Schema updates under `packages/mcp-server/src/object-catalog/` and `packages/mcp-server/src/contracts/`
- Tool-handler updates for `registry.snapshot`, `map.create` (and any others touched)
- 2 new contract fixtures under `test/fixtures/object-catalog/`
- Unit + contract tests

### s103-m03 — A2UI Image custom-catalog extension

**Track:** Capability
**Objective:** Close the OODS-A2UI-IMAGE-FALLBACK warning surface from s102-m03 by extending Forge's A2UI emit with an inline custom catalog that declares an Image component atop the minimal catalog (`acceptsInlineCatalogs:true` pattern). Image slots in the Object Catalog (slot.kind='image') emit as A2UI `Image` components with the URL bound via DataBinding instead of falling back to Text.

**Success criteria:**
- A2UI emit detects `slot.kind === 'image'` and emits `Image` components instead of `Text` with the fail-loud warning
- Custom catalog declared inline in the A2UI message stream using A2UI's `acceptsInlineCatalogs:true` extension point
- Existing 98 Q3 E2E AJV-validated tests still pass (custom catalog is additive)
- New Q3 tests assert: image slots emit Image components; non-image slots unchanged; OODS-A2UI-IMAGE-FALLBACK warning no longer fires for image-bearing fixtures
- Content-pack fixture (s102-m01) used as primary test surface (article/author/comment have image slots: heroImage, avatar, etc.)
- All emitted messages AJV-validated against vendored A2UI v0.9 schemas; custom catalog validates against the A2UI catalog-extension contract

**Deliverables:**
- `packages/mcp-server/src/codegen/a2ui-runtime-emitter.ts` updates
- Possibly: new `packages/mcp-server/src/a2ui/catalogs/forge-image-extension.ts` (inline custom catalog declaration)
- New + extended Q3 E2E tests

### s103-m04 — Closeout (6th formal run of decision #408)

**Track:** Quality
**Objective:** Sixth formal run of decision #408 closeout-as-commit-boundary. Single closeout commit on Forge-expansion enumerating `s103-m01..m04` in commit body for bisection. Standard MEMORY.md + near.md + CMOS session-complete + closeout report. **No janitorial work** — per `feedback_hygiene_in_planning_not_missions.md`, hygiene was done in the s103 planning session (this session), not in m04.

**Success criteria:**
- All sprint-103 deliverables committed in a single closeout commit
- `tsc --noEmit` clean for both mcp-server and mcp-bridge
- Full test suite green; new tests from m01/m02/m03 all pass
- CMOS session.complete with decisions + learnings + next-steps captured
- MEMORY.md updated with sprint-103 outcomes (one-line under "Latest complete sprint")
- near.md "Sprint-103 Locked Shape" converted to "Sprint-103 Outcomes (closed YYYY-MM-DD)"
- Closeout report at `cmos/reports/s103-m04-closeout-<date>.md`
- Sprint-104 candidate shape drafted

**Deliverables:**
- Single closeout commit
- Closeout report
- MEMORY.md + near.md updates
- CMOS session.complete

---

### Standing alternates (deferred from sprint-103 planning, 2026-05-20)

- **A2UI host conformance test harness** — exercise the emitted v0.9 stream against an actual host (Lit web renderer or Google ADK A2uiSchemaManager). Sprint-104 natural capstone after s103-m03 closes the Image gap. Promotable as s103-m01 alternate if reframed C3 audit forces memo-only.
- **A2UI v0.10 migration** — passive watch; v0.10 has no published schemas yet. Concrete migration work when schemas ship; tracked by the sprint-97 m02 strip-then-AJV version-policy pattern.
- **Concordance grounding of content-pack** — passive carry-forward; concordance has to have reason to ingest the publishing domain first.
- **I2 semantic-federation evaluator (D4 implementation)** — still needs Birch involvement + standalone planning artifact before implementation. Same posture as sprint-101/102.
- **Production blocking-timeout decision** — no incident driver. Stays deferred.
- **CMOS onboard sticky-pointer + PG mirror drift** — passive watch; no SLA expected. 3rd recurrence amended into the 2026-05-15 bug report in s103 planning session.

### Closed candidates (no longer on the watch list)

- **`concordance.validate` auto-integration trigger watch** — closed in s103 planning. Zero usage signal across 2+ sprints since the tool shipped at s98-m03; repeated passive defer is anti-pattern. Re-opens only if a downstream consumer explicitly asks for `pipeline.handle({ validate: true })`.

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

