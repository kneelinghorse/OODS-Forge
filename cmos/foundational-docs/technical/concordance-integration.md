# Concordance Integration — Wire 1.1.0 Vendoring & Consumer Contract

**Status:** Spec (sprint-96 m02; vendoring + AJV gates land in sprint-97 F2)
**Date:** 2026-05-15
**Implements:** [D3 — Forge ↔ Concordance Relationship](../decisions/D3-forge-concordance-relationship.md)
**Companion to:** [object-catalog.md](./object-catalog.md) (the catalog shape this client ingests + emits)
**Gating mission:** F2 (this spec + vendoring); I1 unblocks once F2 contract code lands + Bearer key issued

---

## Purpose

This spec locks the **vendoring plan** and **consumer contract** for Concordance wire `1.1.0` before any authenticated writes leave Forge. It is the F2 mission's planning surface; sprint-97 implementation consumes it verbatim.

Forge is a Concordance **consumer** (D3, Option A). The relationship is HTTP-over-the-wire for v1 (MCP adapter is on Concordance's longer-horizon roadmap). The reverse direction — Forge POSTing Object Catalog manifests to `/manifests` — uses the same vendored shape; the catalog spec at [object-catalog.md](./object-catalog.md) defines what Forge emits.

D3 was externally ratified by Concordance on 2026-05-12 and updated 2026-05-14 with sprint-13 production facts. This spec consumes those facts directly.

---

## Concordance Anchor State (as of 2026-05-14)

The frozen reference for sprint-96 m02 planning. Sprint-97 F2 implementation re-reads this section against any newer info_push before vendoring.

| Surface | Value |
|---|---|
| Hosted base URL | `https://concordance-production.up.railway.app` |
| Region / host | Railway us-east |
| Wire contract version | `1.1.0` (additive optional top-level `schema_version` added 2026-05-14) |
| SemanticManifest protocol version (`manifest_version`) | `"4.0"` |
| Probe endpoints (unauthenticated) | `GET /health`, `GET /version`, `GET /docs`, `GET /openapi.json`, `GET /redoc` |
| Non-probe endpoints | `Authorization: Bearer <key>` required |
| Multi-tenancy boundary | One Postgres schema per workspace (`concordance_<workspace>`) |
| Response headers (every response) | `Concordance-Schema-Version: 1.1.0`, `X-Request-Id: <uuid4>` |
| Wire-bump notification policy (Forge preference, sent to Concordance) | Majors require pre-coordinated `info_push`; minors best-effort |
| Test posture upstream | 659 passed + 17 skipped (sprint-13 close) |
| Schema-drift CI gate upstream | 13 byte-equal vendored↔canonical parity assertions |

---

## Vendoring Plan

The locked v1.0.0 vendoring list — six file categories. **Authoritative.** Anything outside this list requires a follow-on decision before adding.

| # | Concordance source path | Forge vendored target | Sync trigger |
|---|---|---|---|
| 1 | `contracts/manifest.schema.json` | `packages/mcp-server/src/concordance/contracts/manifest.schema.json` | Concordance `info_push` on wire bump |
| 2 | `contracts/api/*.schema.json` (3 files today) | `packages/mcp-server/src/concordance/contracts/api/` | Same |
| 3 | `contracts/recipes/*.json` (4 closed v1.0.0 recipes) | `packages/mcp-server/src/concordance/contracts/recipes/` | Same |
| 4 | `contracts/pragmatic-roles.json` (closed enum) | `packages/mcp-server/src/concordance/contracts/pragmatic-roles.json` | Same |
| 5 | `contracts/edge-types.json` (closed enum) | `packages/mcp-server/src/concordance/contracts/edge-types.json` | Same |
| 6 | `contracts/task-types.json` (closed enum) | `packages/mcp-server/src/concordance/contracts/task-types.json` | Same |

**Counts today (2026-05-15 against the local diverge-and-concord checkout):**
- `api/`: 3 schemas — `trace-request.schema.json`, `trace-response.schema.json`, `version-response.schema.json` (only `version-response` is sprint-12 fresh; trace-request/response are sprint-11)
- `recipes/`: 4 schemas — `action-eligibility.json`, `debug-or-explain.json`, `modify-ui-copy.json`, `semantic-location.json` (recipe-quartet closed at Concordance sprint-12)

### Files discovered upstream but NOT vendored in v1.0.0

| File | Reason for deferral |
|---|---|
| `contracts/relational-traversal.json` | Discovered upstream but no Forge call-site consumes it today. Vendor only when a real Forge use case names it. |
| `contracts/task-role-affinity.json` | Same — appears in upstream contracts but outside D3-named vendoring scope. Vendor when called for. |
| `contracts/fixtures/*` | Concordance test fixtures, not contract definitions. Forge maintains its own fixtures under `packages/mcp-server/test/fixtures/catalog/` per [object-catalog.md](./object-catalog.md). |
| `contracts/README.md` | Documentation; Forge writes its own integrator notes here. |

### Sync mechanism

| Step | Command / Action |
|---|---|
| Canonical sync entry point | `diverge-and-concord/bin/sync-contracts.sh` (the same script `divergent-inspector` uses) |
| Forge invocation | Sprint-97 ships a thin wrapper at `packages/mcp-server/scripts/sync-concordance-contracts.sh` that calls the canonical script with Forge's target path |
| Verification (CI) | After sync, `tools/check-vendored-contracts.ts` diff-checks each vendored file byte-for-byte against the source. Drift = CI failure (T1 gates below). |
| Frequency | On-demand, triggered by Concordance `info_push` on wire bump (Forge preference: majors mandatory, minors best-effort) |

Forge does NOT auto-sync on a schedule. The pull is human-initiated after notification; this preserves the contract-gate pre-registration discipline (quality-bars pattern from sprint-91).

---

## Optional Top-Level `schema_version` Support

Concordance sprint-13 added `schema_version` as an **optional** top-level field on the SemanticManifest envelope. Forge consumer contract:

| Direction | Behavior |
|---|---|
| **Ingesting** a Concordance-emitted SemanticManifest | If `schema_version` is present, validate it matches the Forge pin (`"1.1.0"`) per the version policy below. If absent, fall back to the `Concordance-Schema-Version` response header. If both absent, log warning (probe failure) and apply default `"1.0.0"`. |
| **Emitting** a Forge Object Catalog to `/manifests` | Always emit `schema_version: "1.1.0"` — pin is explicit on every outbound payload so receivers can verify quickly without header dependency. |
| **Probing** `GET /version` | Read `schema_version` from response body. Use that value as the authoritative remote pin for the version-policy check. |

The Forge AJV input schema treats `schema_version` as an optional string matching `^[0-9]+\.[0-9]+\.[0-9]+$`. Schema-level rejection is structural; the version-policy logic is application-level.

---

## Version Policy

Three-tier policy applied at client startup (after `GET /version` probe) and per non-probe call:

| Match category | Severity | Behavior | Telemetry |
|---|---|---|---|
| Exact match (pin == remote) | OK | Normal operation | None |
| Patch mismatch (e.g. pin `1.1.0` vs remote `1.1.1`) | OK | Normal operation; log INFO once at startup | Single startup event |
| Minor mismatch (e.g. pin `1.1.0` vs remote `1.2.0`) | warn | Continue; log WARN; surface to caller via `warnings[]` on response | Per-call telemetry event |
| Major mismatch (e.g. pin `1.1.0` vs remote `2.0.0`) | **fail-loud** | Client refuses to start; structured `ConcordanceVersionError` raised; non-probe calls all fail | Per-call telemetry event |
| Probe-only mismatch (`/version` reachable but mismatched) | warn → fail-loud per above | Same as above; probes still succeed structurally | Same |

**Rationale:**
- Additive minors are non-breaking by Concordance's stated semver. Warn so the operator sees drift; continue so Forge stays productive.
- Majors are explicit breaking changes. Fail-loud so silent corruption never happens.
- The fail-loud path raises a structured error that the bridge surfaces to callers as a `502` with body `{ error: "concordance_version_mismatch", expected, observed }`.

D3 graceful degradation still applies: if `GET /version` itself is unreachable, the client logs `concordance verification skipped (unreachable)` and codegen continues without verification calls (no fail-loud). Reachability and version-policy are separate axes.

---

## Client Configuration

Environment variables and their semantics. Lives in `packages/mcp-server/src/concordance/config.ts` (sprint-97 creates).

| Env var | Required | Default | Notes |
|---|---|---|---|
| `CONCORDANCE_BASE_URL` | yes (for non-degraded operation) | unset | Full URL with scheme. Production: `https://concordance-production.up.railway.app`. Local dev: `http://localhost:8787` per D3 bootstrap recipe. Unset = graceful-degradation mode (all verification calls skipped, warnings emitted). |
| `CONCORDANCE_API_KEY` | yes (for non-probe endpoints) | unset | Bearer token. **NEVER** committed to git, written to CMOS, or logged. Sourced from env at startup. Unset = probes only; any authenticated call returns `ConcordanceAuthError` before the network. |
| `CONCORDANCE_TIMEOUT_MS_BLOCKING` | no | `5000` | Per-call timeout for codegen-blocking calls (`/context-pack`, `/resolve` at verification time). Matches D3 p99 ≤500ms budget × 10. |
| `CONCORDANCE_TIMEOUT_MS_ADVISORY` | no | `2000` | Per-call timeout for advisory calls (playground operator workflows). Matches D3 p99 ≤100ms × 20. |
| `CONCORDANCE_WORKSPACE` | no | inferred | Workspace identifier for multi-tenancy. When unset, the Bearer key's workspace is used implicitly. |
| `CONCORDANCE_SCHEMA_VERSION_OVERRIDE` | no | unset | **Test-only.** Forces a different remote schema_version for version-policy testing. Never set in production; presence triggers a startup warning. |

**Auth hygiene:**
- The key is read once at startup; subsequent rotation requires a server restart.
- The key value never enters log lines or telemetry payloads. The client logs only `keyId` derived from a one-way hash of the key.
- Failure to read `CONCORDANCE_API_KEY` does NOT fail-loud at startup (probes still work); it only fails when an authenticated call is attempted.

---

## Auth Error Mapping

HTTP-status to Forge error class mapping for non-probe endpoints. Locked here; sprint-97 wires the error classes.

| HTTP status | Forge error class | Meaning | Retry? | Caller surface |
|---|---|---|---|---|
| `401` (Authorization header missing) | `ConcordanceAuthError(reason="missing")` | `Authorization` header absent | **No** | Surfaced as `502` to callers with body `{ error: "concordance_auth_missing" }` |
| `401` (Bearer token unrecognized) | `ConcordanceAuthError(reason="invalid")` | Token absent or doesn't decode to any known key | **No** | Surfaced as `502` with body `{ error: "concordance_auth_invalid" }` |
| `403` (Token recognized, lacks permission) | `ConcordancePermissionError(reason="forbidden")` | Token is valid but lacks permission for the target workspace/resource | **No** | Surfaced as `502` with body `{ error: "concordance_auth_forbidden", workspace }` |
| `404` (Entity not found) | `ConcordanceNotFoundError` | Distinct from auth — entity-level resolution miss | **No** | Surfaced as `404` to callers (entity-shaped, not auth-shaped) |
| `409` (Conflict, version mismatch on POST) | `ConcordanceConflictError` | Version conflict on `/manifests` ingest | Conditional (D3 streaming/batch sub-q) | Surfaced as `409` |
| `429` (Rate-limited) | `ConcordanceRateLimitError` | Concordance throttling | **Yes** with exponential backoff | Surfaced as `503` after retry exhaustion |
| `5xx` | `ConcordanceServiceError` | Upstream failure | **Yes** with exponential backoff (max 3); graceful degradation applies | Surfaced as `502` after exhaustion |

**Auth-error retry rule:** `ConcordanceAuthError` and `ConcordancePermissionError` are NEVER retried. They indicate a config or permissions issue — retry would amplify the failure and consume rate-limit budget unnecessarily.

**Bearer-key rotation:** Out of scope for v1; manual rotation by operator (env update + restart).

---

## Contract Test Matrix

Three tiers run in CI / integration; T4 is planned but deferred to I1.

### T1 — Vendored-schema parity (CI, no network)

Runs in every CI job. No external dependencies. Reproduces Concordance's own 13-byte-equal CI gate on the Forge side.

| ID | Test | Tooling | Fails on |
|---|---|---|---|
| T1a | `manifest.schema.json` byte-equals upstream after sync | `tools/check-vendored-contracts.ts` diff | Any byte drift |
| T1b | Each `api/*.schema.json` byte-equals upstream | Same | Same |
| T1c | Each `recipes/*.json` byte-equals upstream | Same | Same |
| T1d | Closed enums (`pragmatic-roles.json`, `edge-types.json`, `task-types.json`) byte-equal upstream | Same | Same |
| T1e | Vendored target paths exist and are git-committed | File-existence check | Missing file |

### T2 — Local Concordance contract (integration; requires local `concordance serve`)

Bootstrap per D3:
```bash
cd /Users/systemsystems/portfolio/Design-Tools/diverge-and-concord/concordance
python3 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
concordance serve --port 8787
```

| ID | Test | Expected | Negative |
|---|---|---|---|
| T2a | AJV-validate Forge fixture against vendored `manifest.schema.json` | PASS for valid catalog | — |
| T2b | AJV reject fixture with root-level Forge-only key | FAIL with `additionalProperties` error | Mirrors object-catalog G1 negative |
| T2c | AJV accept fixture with optional `schema_version: "1.1.0"` | PASS | Absent field also PASS |
| T2d | AJV reject fixture with `manifest_version ≠ "4.0"` | FAIL with `const` error | — |
| T2e | `GET http://localhost:8787/version` | 200; body has `service_version`, `schema_version`, `recipe_versions`, `current_sprint_id`, `build_hash` | Missing field = FAIL |
| T2f | `POST /manifests` with Forge fixture | 200; response `ingested_entities == entities.length` | Lossy translation = FAIL |
| T2g | Version-policy: emit fixture with `schema_version: "1.0.0"` vs local pin `"1.1.0"` | WARN + continue | log captured |
| T2h | Version-policy: emit fixture with `schema_version: "2.0.0"` vs local pin `"1.1.0"` | `ConcordanceVersionError` raised | structured error caught |

### T3 — Hosted Concordance unauthenticated probes (integration; requires hosted URL reachable)

| ID | Test | Expected |
|---|---|---|
| T3a | `GET https://concordance-production.up.railway.app/health` | 200; body shape per Concordance integrator brief |
| T3b | `GET .../version` | 200; `schema_version: "1.1.0"`, `service_version` present, `current_sprint_id` >= `"sprint-13"` |
| T3c | Response carries `Concordance-Schema-Version: 1.1.0` header | Header present and exact match |
| T3d | Response carries `X-Request-Id: <uuid4>` header | Header present and matches UUIDv4 regex |
| T3e | `GET .../openapi.json` | 200; parseable JSON; contains `info.version` field |
| T3f | Probe budget: each call completes <2s p99 | Latency captured into diagnostics |

**T3 explicitly excludes authenticated endpoints.** Bearer key issuance is gated on F2 contract code landing (sprint-97), per s96-m03 success criteria. The hosted preflight in sprint-96 m03 documents the T3 expectations; T3 implementation lands in sprint-97 F2.

### T4 — Authenticated hosted integration (deferred to I1; planned but not implemented in sprint-96 or sprint-97 F2)

Named here so the test surface is visible end-to-end.

| ID | Test | Expected |
|---|---|---|
| T4a | Missing Bearer → 401 | `ConcordanceAuthError(reason="missing")` |
| T4b | Bad Bearer → 401 | `ConcordanceAuthError(reason="invalid")` |
| T4c | Wrong-workspace Bearer → 403 | `ConcordancePermissionError` |
| T4d | Valid Bearer + `POST /manifests` → 200 | `ingested_entities == entities.length` |
| T4e | Valid Bearer + `GET /entities/{urn}` for each ingested URN | Hash-stable canonical kernel returned (closes object-catalog G3 against hosted) |

I1 unblocks T4 when (a) F2 contract code lands and (b) Bearer key is issued out-of-band.

---

## Translator: SemanticManifest → Object Catalog Delta

Sprint-96 m02 names the translator shape; sprint-97 F2 implements.

### Inputs

| Input | Source | Notes |
|---|---|---|
| `SemanticManifest` | Concordance read endpoints (`/entities/{urn}` rollup) or local file | Vendor-validated against `manifest.schema.json` before translation |
| Current Object Catalog state | Forge in-memory or persisted `.oods/schemas/` | Optional; used for delta computation. Absent = full ADD-only delta. |

### Outputs

| Output | Shape | Notes |
|---|---|---|
| `Delta.add[]` | New Object Catalog entries | URNs not present in current state |
| `Delta.update[]` | `{ urn, fieldDiff }` | Field-level diff (Concordance kernel + `oods.*` separately) |
| `Delta.mark_obsolete[]` | URNs to deprecate | Present in current state, absent from new manifest |

### Evidence preservation rule

`evidence_refs[]` IDs and provenance from the input SemanticManifest survive translation **byte-identical** for any ref with `provenance != "declared"`. Forge attaches additional `provenance: "declared"` refs to mark canonical declarations; it never modifies inbound `inferred`/`candidate`/`verified` refs.

`oods.evidence_chain` is regenerated per entity by Forge from the per-source rollup; the underlying refs remain untouched.

**Test acceptance:** for any round-trip ingest, the count of non-declared refs in `delta.update[].fieldDiff` is zero. Drift in any non-declared ref is a translation bug, not a content change.

---

## Reverse Direction: Forge Object Catalog → `/manifests`

The reverse path uses the same vendored shape. Test surface is owned by [object-catalog.md](./object-catalog.md) G3 (round-trip fixture hash stability). F2 adds:

- **T4c (authenticated POST `/manifests`)**: closes the half of G3 that runs against hosted Concordance, once Bearer is issued.
- **T4d (authenticated `GET /entities/{urn}`)**: closes the canonical-kernel-byte-equal half of G3 against hosted.

The catalog spec is the **source of truth for catalog shape**; this integration spec is the **source of truth for the wire**. They share the vendored schema as the common contract surface.

---

## What This Spec Does NOT Cover

- **Bearer key issuance flow.** Sprint-96 m03 (hosted preflight) drafts the CMOS-ready ask; the key gets *requested* only when F2 contract code lands in sprint-97. Key issuance, storage, and rotation hygiene live in [object-catalog.md](./object-catalog.md) and the m03 preflight notes.
- **CORS dev-domain allowlist.** Deferred per s96-m03 success criteria — no browser-side Concordance caller exists in sprint-96 scope.
- **MCP adapter for Concordance.** D3 open sub-question 1; not on Forge's critical path.
- **Streaming ingest vs. batch.** D3 open sub-question 2; v1 = batch.
- **Cross-corpus queries.** D3 open sub-question 3.
- **Where `runPreEmit()` calls Concordance.** The pre-emit pass owns the call site; the contract surfaces are named in [object-catalog.md](./object-catalog.md). This spec defines the client semantics; D2/C1 defines when it's called.
- **`agent-vitals` telemetry event taxonomy.** Concrete event names locked in I3, not F2.

---

## Open Sub-Questions Carried Forward

1. **`sync-contracts.sh` invocation cadence.** v1: on-demand, triggered by Concordance `info_push`. Revisit if Concordance bumps faster than Forge ingest cycle can absorb.
2. **`relational-traversal.json` + `task-role-affinity.json` vendoring.** Skip for v1; revisit if a real Forge use case (likely resolver-side queries) names them.
3. **AJV strictness modes.** Recommendation: `strict: true` in T1/T2 CI tests; `strict: false` in production graceful-degradation path so concordance-additive minor bumps don't immediately break. Pin in sprint-97 F2 implementation.
4. **Telemetry event names for version-mismatch + auth-error paths.** Wait until I3 names the event taxonomy; placeholder names in F2 implementation are local to `packages/mcp-server/src/concordance/`.
5. **Workspace identifier convention.** Concordance uses Postgres schema names (`concordance_<workspace>`). Forge's natural workspace identifier is the local CMOS project slug (`oods-foundry-mcp`). Confirm the mapping at I1 key-issuance time.

---

## References

**Decision memos:**
- [D3 — Forge ↔ Concordance Relationship](../decisions/D3-forge-concordance-relationship.md) — externally ratified 2026-05-12 + production update 2026-05-14
- [D1 — Object Catalog Schema Shape](../decisions/D1-object-catalog-schema.md) — the catalog shape this client emits

**Companion technical spec:**
- [object-catalog.md](./object-catalog.md) — Object Catalog v1.0.0 (the writable shape); G1/G2/G3 test gates ties the catalog to the wire

**Concordance contracts (vendoring sources):**
- [contracts/manifest.schema.json](file:///Users/systemsystems/portfolio/Design-Tools/diverge-and-concord/contracts/manifest.schema.json)
- [contracts/api/](file:///Users/systemsystems/portfolio/Design-Tools/diverge-and-concord/contracts/api/) — `trace-request.schema.json`, `trace-response.schema.json`, `version-response.schema.json`
- [contracts/recipes/](file:///Users/systemsystems/portfolio/Design-Tools/diverge-and-concord/contracts/recipes/) — `action-eligibility.json`, `debug-or-explain.json`, `modify-ui-copy.json`, `semantic-location.json`
- [contracts/pragmatic-roles.json](file:///Users/systemsystems/portfolio/Design-Tools/diverge-and-concord/contracts/pragmatic-roles.json)
- [contracts/edge-types.json](file:///Users/systemsystems/portfolio/Design-Tools/diverge-and-concord/contracts/edge-types.json)
- [contracts/task-types.json](file:///Users/systemsystems/portfolio/Design-Tools/diverge-and-concord/contracts/task-types.json)
- [bin/sync-contracts.sh](file:///Users/systemsystems/portfolio/Design-Tools/diverge-and-concord/bin/sync-contracts.sh) — canonical sync entry point

**Concordance ratification + production:**
- [2026-05-12 inbound message](../../messages/inbound/2026-05-12-concordance-response.md) — D1+D3 absorbed; SemanticEntity-extension verified on wire
- [cmos/planning/info-push-to-oods-foundry-mcp.md](../../planning/info-push-to-oods-foundry-mcp.md) — sprint-13 production update

**Concordance integration framing:**
- [concordance/docs/oods-foundry-integration.md](file:///Users/systemsystems/portfolio/Design-Tools/diverge-and-concord/concordance/docs/oods-foundry-integration.md)
- [concordance/docs/concordance-integrator-brief.md](file:///Users/systemsystems/portfolio/Design-Tools/diverge-and-concord/concordance/docs/concordance-integrator-brief.md)

**Planning canon:**
- [../mission-graph.md](../mission-graph.md) — F2 mission scope
- [../quality-bars.md](../quality-bars.md) — pre-registered schemas, additive-only versioning, real-data E2E gates
- [../roadmap/near.md](../roadmap/near.md) — sprint-96 m02

---

*Authored 2026-05-15 (sprint-96 m02). Spec only — no implementation code lands in this sprint. F2 implementation (vendoring + AJV + client skeleton + T1/T2/T3 wiring) lands in sprint-97. T4 (authenticated hosted integration) lands in I1 when the Bearer key is issued. Updates if Concordance ships another wire bump or if sprint-97 implementation surfaces edge cases.*

---

# Hosted Preflight Notes (sprint-96 m03)

**Probe session:** 2026-05-15
**Endpoint:** `https://concordance-production.up.railway.app`
**Authentication:** Bearer key issued out-of-band 2026-05-15; verified working (see authenticated probe below). **Key text is not stored in any file, commit, CMOS message, or log per the v1.0.0 auth-hygiene rule.** Sprint-97 F2 implementation reads it from `CONCORDANCE_API_KEY` env at startup.

This section captures the *observed* hosted-endpoint behavior as of the probe session. It supersedes any spec text earlier in the doc where the observed shape differs from the anchor table.

## Probe results — `GET /health`

```
HTTP/2 200
concordance-schema-version: 1.1.0
content-type: application/json
x-request-id: <uuidv4>
x-railway-request-id: <opaque>
x-railway-edge: railway/us-east4-eqdc4a

{"status":"ok","version":"0.0.1","entities":0,"relationships":0}
```

Observations:
- `concordance-schema-version: 1.1.0` rides on every response (header lowercased per HTTP/2 normalization — adjust diagnostics parsing accordingly).
- `x-request-id` is a UUIDv4 as the spec calls for. **An additional `x-railway-request-id` rides from Railway's edge** — opaque to Concordance, but useful for cross-correlating with Railway logs when Concordance and Railway both need to be queried during incident response.
- `status: "ok"` indicates service liveness.
- `entities: 0, relationships: 0` confirms the hosted corpus is **empty** as of the probe session — no production data yet ingested. This is expected for sprint-13 close; corpus fills as Forge, divergent-inspector, and other producers begin POSTing canonical declarations.

## Probe results — `GET /version`

```
HTTP/2 200
concordance-schema-version: 1.1.0
content-type: application/json
x-request-id: <uuidv4>

{
  "service_version": "0.0.1",
  "schema_version": "1.1.0",
  "recipe_versions": {
    "semantic_location":   "1.0.0",
    "debug_or_explain":    "1.0.0",
    "modify_ui_copy":      "1.0.0",
    "action_eligibility":  "1.0.0"
  },
  "current_sprint_id": "sprint-13",
  "build_hash": null
}
```

Observations:
- `schema_version: "1.1.0"` matches the Forge pin exactly. Version policy at startup will be in the **exact-match** branch (OK, no warnings).
- `service_version: "0.0.1"` — Concordance is pre-1.0 on the service layer. Forge's version policy only checks `schema_version` (wire contract); `service_version` is informational.
- All 4 closed recipes report `"1.0.0"` — matches the vendored set.
- `current_sprint_id: "sprint-13"` — informational; useful for diagnostics correlation.
- `build_hash: null` — present but unpopulated. Document the field as nullable in the Forge `version-response.schema.json` ingest. Treat absence as a diagnostics-only quirk, not an error.

## Probe results — `GET /openapi.json`

```
HTTP/2 200
content-type: application/json

info: { "title": "concordance", "description": "Semantic protocol service. v0 surface only.", "version": "0.0.1" }
paths: ["/health", "/version", "/manifests", "/manifests/validate", "/resolve",
        "/catalog/refresh", "/entities/{urn}", "/neighbors", "/context-pack",
        "/trace", "/explain"]
```

Observations:
- **11 paths exposed** — wider than the "7 stable read endpoints" Concordance brief mentions. The extras: `/manifests` and `/manifests/validate` (write/validate path), `/catalog/refresh` (likely operational), plus `/openapi.json` itself.
- `/manifests/validate` is the **safest authenticated probe target** for key-resolution verification — it is read-only (validates a manifest body without ingesting it) and returns structured validation feedback.

## Probe results — authenticated key verification via `POST /manifests/validate`

Two contrasting calls captured the auth boundary cleanly.

### Without auth (negative control)

```
HTTP/2 401
concordance-schema-version: 1.1.0
x-request-id: <uuidv4>

{"detail":{"code":"missing_authorization","message":"Authorization header required"}}
```

Observations:
- Concordance returns a **structured detail object** with `code` + `message`, more specific than the spec assumed. Forge's auth-error mapping should match against `detail.code` (not just status code) for richer error surfacing.
- Diagnostics headers (`concordance-schema-version`, `x-request-id`) are present **even on auth failure** — consistent across success and failure paths. Good news for telemetry: every call produces a correlatable request-id.

### With auth (positive control)

Body intentionally empty (`{}`) to verify auth passes without contributing real data.

```
HTTP/2 422
concordance-schema-version: 1.1.0
x-request-id: <uuidv4>

{
  "detail": {
    "errors": [
      { "entity_urn": null, "field_path": "SemanticManifest.manifest_version",
        "code": "schema.parse", "severity": "error",
        "message": "Field required",
        "details": { "pydantic_type": "missing", "loc": ["body","SemanticManifest","manifest_version"] } },
      { "entity_urn": null, "field_path": "SemanticManifest.source", "code": "schema.parse", "severity": "error", ... },
      { "entity_urn": null, "field_path": "SemanticManifest.entities", "code": "schema.parse", "severity": "error", ... },
      { "entity_urn": null, "field_path": "list[SemanticManifest]", "code": "schema.parse", "severity": "error",
        "message": "Input should be a valid list", ... }
    ],
    "warnings": [],
    "message": "request body failed schema validation"
  }
}
```

Observations:
- **Auth resolved successfully** — the response is `422` (validation failure), not `401`/`403`. The Bearer key works against the hosted endpoint.
- `/manifests/validate` accepts **either** a single `SemanticManifest` **or** a `list[SemanticManifest]` (the fourth error reflects the list-shape alternative). F2 vendoring + F2 client should support both.
- Error shape: `{ detail: { errors: [{ entity_urn, field_path, code, severity, message, details }], warnings: [], message } }`. This is a **richer shape than AJV's default error output**. The Forge concordance client should preserve `detail.errors[]` in its `ConcordanceValidationError` class so callers see the same per-field feedback Concordance gives.
- `pydantic_type` and `loc` (Pydantic-side metadata) leak into `details` — harmless but worth knowing for diagnostics. Forge does not depend on these fields; they may be stripped in a future Concordance version.

## Diagnostics expectations locked

Updates to the in-spec Anchor State table based on observed reality:

| Spec field | Observed | Action |
|---|---|---|
| `Concordance-Schema-Version: 1.1.0` header | Confirmed (lowercased to `concordance-schema-version: 1.1.0`) | Diagnostics parser must use case-insensitive header lookup |
| `X-Request-Id: <uuid4>` header | Confirmed (lowercased `x-request-id`); UUIDv4 format | Capture per call for correlation; pair with `x-railway-request-id` when present |
| `/version` response shape | Confirmed; `build_hash` may be `null` | Treat `build_hash` as nullable; don't fail on absence |
| `service_version` | Pre-1.0 (`0.0.1`) | Informational only; do not version-gate on this |
| Auth error 401 body | `detail.code = "missing_authorization"` | Map `ConcordanceAuthError(reason="missing")` on `detail.code == "missing_authorization"` |
| Auth error 401 body (bad token, expected) | Not probed (would have required a malformed-key probe — out of scope for key-resolution test) | Sprint-97 F2 implementation adds this negative case to T4b |
| Validation error 422 body | `detail.errors[]` with per-field codes | Forge `ConcordanceValidationError` should preserve `detail.errors[]` end-to-end |

## CORS allowlist — explicitly deferred

Per s96-m03 success criterion: no browser-side Concordance caller exists in sprint-96 scope. The CORS allowlist recommendation is **deferred**. Revisit when:
- A browser-side dev tool wants to probe `/version` or `/health` from a non-server origin.
- The Forge playground reaches a state where direct Concordance verification calls would benefit from in-browser execution (today, all verification is server-side via the bridge).

Until then, no allowlist ask is sent to Concordance. The CMOS-ready outbound at [cmos/messages/outbound/2026-05-15-concordance-preflight-ack.md](../../messages/outbound/2026-05-15-concordance-preflight-ack.md) confirms this deferral on Forge's side.

## Bearer key state at sprint-96 m03 close

**Key issued out-of-band on 2026-05-15 by user direct hand-off.** The key:
- Is held in session-scope only for the duration of this probe (never written to any file, commit, CMOS message, or log).
- Will be reissued or rotated for sprint-97 F2 implementation; the implementation reads from `CONCORDANCE_API_KEY` env at startup per the spec.
- Materially unblocks I1 on the Forge side: F2 contract code is now the **sole** remaining prerequisite for authenticated hosted integration.

## I1 prerequisite state at sprint-96 m03 close

| Prerequisite | State |
|---|---|
| F2 contract code (vendoring + AJV + client skeleton + T1/T2/T3 wiring) | Pending — sprint-97 |
| Bearer key issuance | **Unblocked** — issued 2026-05-15 |
| CORS allowlist | Deferred — no browser-side caller in v1 |
| Hosted endpoint reachable | **Confirmed** — `/health`, `/version`, `/openapi.json` probes 200 OK |
| Hosted endpoint auth working | **Confirmed** — `/manifests/validate` returns 422 with valid auth (not 401) |
| Wire `1.1.0` observed on the wire | **Confirmed** — `schema_version: "1.1.0"` in `/version` + `concordance-schema-version: 1.1.0` header |

**I1 is now blocked solely on Forge-side F2 implementation.** No outstanding asks from Concordance.

---

*Preflight authored 2026-05-15 (sprint-96 m03). The CMOS-ready outbound at `cmos/messages/outbound/2026-05-15-concordance-preflight-ack.md` is staged but held until user signals send.*
