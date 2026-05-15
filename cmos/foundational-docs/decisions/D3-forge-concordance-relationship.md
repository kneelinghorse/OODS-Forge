# D3 — Forge ↔ Concordance Relationship

**Status:** Decided (first-pass **externally ratified by concordance 2026-05-12**; sprint-13 production update received 2026-05-14)
**Date:** 2026-05-10 (ratified 2026-05-12; production update 2026-05-14)
**Authors:** Derek
**Depends on:** [D1 — Object Catalog Schema Shape](D1-object-catalog-schema.md)

---

## Context

D1 settled *what* OODS-Forge and concordance say to each other (SemanticManifest-shaped payloads, with Forge contributing `oods.*` extension layers). D3 settles *how* they say it: deployment topology, versioning relationship, failure modes, and answers to the 5 open questions concordance's `oods-foundry-integration.md` raised for the planning conversation.

### What we know now (much more than the 2026-05-09 framing suggested)

- Concordance shipped wire contract **v1.0.0** with 7 stable read endpoints, 4 stable context-pack recipes, and 5 sprints of byte-identical zero-drift scoring; sprint-13 bumped the canonical wire to **1.1.0** via an additive optional top-level `schema_version`.
- The producer side (`divergent-inspector` / Stage1) emits SemanticManifests as a default-on output.
- Concordance sprint-13 shipped hosted endpoint URL, Bearer authentication, per-workspace Postgres-schema tenancy, Postgres+pgvector production storage, and schema-evolution policy. MCP adapter remains longer horizon.
- D1's catalog design means a Forge-emitted Object Catalog *is* a SemanticManifest — POSTs cleanly to concordance `/manifests` without translation.

The integration shape question is no longer "what shape will it take" (D1 answered that) but "how do the deployed systems talk."

---

## Options

### Option A — Forge as concordance consumer

Forge calls concordance over HTTP (eventually MCP). Concordance hosts the corpus. Forge contributes canonical declarations via `POST /manifests` and queries the read endpoints (`/resolve`, `/context-pack`, `/explain`, `/trace`, `/neighbors`, `/entities/{urn}`) when codegen or audit time needs them.

**Concordance is structurally upstream** of Forge in the design intelligence stack (per [../stack-map.md](../stack-map.md)). It's also structurally **above** Forge in the dependency graph — concordance doesn't import Forge, but Forge imports concordance's wire contract. Consumer relationship matches this gravity.

### Option B — Forge as concordance peer

Both expose MCP surfaces; Aquex-mcp routes; both are independently versioned and deployed. Forge can call concordance and vice versa.

Rejected for v1 because:
- Concordance never *needs* to call Forge tools — it ingests canonical declarations from any source. The bidirectional MCP claim (mission F3) is about Forge accepting writes from many sources (Stage1 reconciliation reports, divergent-inspector manifests, etc.), not about peer-to-peer Forge ↔ concordance.
- Peer status implies symmetric coordination overhead that doesn't pay off until both organs have native operations to expose to each other.

### Option C — Forge embeds concordance

Concordance code + indexes live inside Forge; Forge calls evaluation functions in-process.

Rejected because:
- Concordance's runtime (Python + FastAPI + SQLite/FTS5/sentence-transformers) is heavy and orthogonal to Forge's TypeScript/Node MCP server runtime.
- Forge does not need the resolver indexes at codegen time. It needs to *contribute* canonical declarations and *occasionally* resolve queries — both are HTTP-shaped, not in-process-call-shaped.
- Cross-machine reality: concordance's primary deployment will be hosted (s13+ on concordance's roadmap); Forge embedding the service runtime would force every Forge installation to provision Python + vector indexes.

---

## Recommendation

**Option A — Forge as concordance consumer.** Forge calls concordance over HTTP for ingestion and query; concordance owns the corpus.

### Specifically

1. **Forge ships a vendored copy of concordance's wire contract** (`contracts/manifest.schema.json`, the closed enums, the API schemas under `contracts/api/`). Refresh via `bin/sync-contracts.sh` (in diverge-and-concord) when concordance bumps. This mirrors the pattern concordance already uses for the contracts repo as canonical source.

2. **Forge calls concordance's HTTP endpoints** at three lifecycle moments (per concordance's `oods-foundry-integration.md` integration-points sketch):
   - **At codegen time:** `POST /context-pack` with `recipe: "action_eligibility"` to verify a generated UI surface has coherent server-side capabilities in the catalog before committing artifact.
   - **At brand-apply / design-compose time:** `POST /resolve` with `task_type: "semantic_location"` to confirm an object's canonical name + traits before generating copy that asserts them.
   - **At a11y / VRT audit time:** `POST /context-pack` with `recipe: "modify_ui_copy"` for slot-shaped context, or `POST /explain` for per-axis evidence breakdown.
   - **At write-side reconciliation time:** `POST /manifests` to contribute Forge-declared canonical SemanticEntities to the corpus (so concordance sees both sides — declared by Forge, inspected by divergent-inspector).

3. **Forge holds a concordance client** in `packages/mcp-server/src/concordance/` (new directory). The client:
   - Pins `Concordance-Schema-Version: 1.1.0` at startup via `GET /version`
   - Fails loud on major-version mismatch
   - Warns and continues on minor-version mismatch (additive; per concordance's semver semantics)
   - Surfaces per-call latency and error-rate metrics to agent-vitals (via mission I3)

4. **Concordance unreachability is non-fatal at codegen time.** Forge degrades gracefully:
   - Codegen proceeds without concordance verification; emit a `warnings[]` entry on the `CodegenResult` flagging "concordance verification skipped (unreachable)"
   - Reconciliation writes (`map.apply`, etc.) proceed unchanged; concordance ingest is best-effort and async-queueable
   - The graceful-degradation pattern is the same one Stage1 already uses (`manifest.inputs.oods_registry_fetch: "empty-fallback"`)

5. **Hosted endpoint is now available.** Concordance sprint-13 published `https://concordance-production.up.railway.app` with unauthenticated probes (`/health`, `/version`, `/docs`, `/openapi.json`, `/redoc`) and Bearer-gated read/write endpoints. Forge development still uses local concordance or the ephemeral-tunnel pattern for isolated tests; production wiring uses the hosted URL once a Bearer key is issued out-of-band.

### Answers to concordance's 5 open questions

From `concordance/docs/oods-foundry-integration.md` "What we'd need from OODS to scope production integration":

| # | Question | Forge's answer |
|---|---|---|
| 1 | **Auth scheme** | API key per OODS-Forge instance for v1. Shipped by Concordance sprint-13 as `Authorization: Bearer <key>` on every non-probe call. Keys are generated and delivered out-of-band; they never live in CMOS or git. OAuth/JWT is a follow-on once multi-tenant patterns emerge. |
| 2 | **Multi-tenant boundary** | **One concordance corpus per OODS-Forge workspace** for v1. Shipped by Concordance sprint-13 as one Postgres schema per workspace (`concordance_<workspace>`). Shared corpus with tenant-scoped reads is a later evolution if Forge users explicitly want cross-tenant queries. |
| 3 | **Expected QPS at peak** | **Low (<10 QPS sustained, <50 burst).** Forge calls concordance at codegen / audit lifecycle moments — not on every render, not on user input. Concordance's current SQLite + FTS5 + embeddings handles this comfortably. Postgres + pgvector is concordance's own roadmap and not gated on Forge demand. |
| 4 | **Latency budget per call-site** | **p99 ≤ 500ms** for codegen-blocking calls (verification before artifact commit); **p99 ≤ 100ms** for advisory calls in playground/operator workflows. Concordance's current numbers (`/context-pack` <50ms, `/trace` <100ms, `/resolve` <100ms) are well under. No latency pressure on concordance from Forge. |
| 5 | **Preferred deploy target** | **Concordance-hosted as canonical.** Forge calls the public hosted URL. Forge-hosted/local fallback remains for offline development. |

---

## Implementation Implications

### What this unblocks

- **F2 (concordance ingestion contract)** — concrete shape locked. F2 mission ships:
  - Vendored concordance contracts (`contracts/manifest.schema.json` + API schemas + closed enums) under `packages/mcp-server/src/concordance/contracts/`
  - TypeScript types generated from contracts (mirrors the AJV-validated input pattern already used for Stage1 v1.x)
  - Reverse direction (Forge as ingest source): a contract test that POSTs a fixture Object Catalog to a live concordance and asserts `ingested_entities` matches `entities.length`

- **I1 (concordance live integration)** — pacing now explicit. Three phases:
  1. **Local contract phase:** Forge integration tests run against locally-cloned concordance via `cloudflared` or local service.
  2. **Hosted integration phase:** Forge probes the public URL unauthenticated, then uses `CONCORDANCE_API_KEY` for authenticated read/write tests once the key is issued.
  3. **MCP adapter phase** (concordance roadmap longer-horizon): Forge's concordance client switches from HTTP to MCP routing through Aquex-mcp.

- **F3 (bidirectional MCP framing)** — sharper claim. Forge is a writable Object Catalog MCP with reconciliation semantics in a stack where concordance is the semantic resolution service. Together they make the design intelligence platform's read/write surfaces complete. The framing scales beyond Forge ↔ concordance: the same catalog writability extends to Stage1, divergent-inspector, agent-vitals, and future evidence sources.

### What this constrains

- **D4 (semantic-federation integration)** — Cedar policy gates Forge writes; concordance ingest is *post-write*, so policy evaluation happens on the Forge side before the `/manifests` POST. D4's "write-side capability check" option lines up cleanly with this.

- **Q-track (drift telemetry, observability)** — Forge's concordance-client metrics (request latency, error-rate, schema-version mismatches) feed agent-vitals via I3. Schema-version-mismatch counts become a drift signal.

- **Versioning coordination** — concordance bumps SemanticManifest version (post-v4.0); Forge pre-registers the new shape per the sprint-91 contract-gate pattern. Cross-project handshake via `cmos_message` between `cmos://derek/oods-foundry-mcp` and `cmos://darryl/concordance` (or whatever concordance's primary address resolves to in production).

### Cost estimate

- F2 implementation (contract gates + types + client skeleton): **~2-3 sessions**
- Local integration tests with cloned concordance: **~1-2 sessions**
- First end-to-end demo (POST Forge catalog → query result back): **~1 session**
- Total to "F2 done; integration testable locally": **~4-6 sessions**

I1 mission proper (live wiring to hosted endpoint) is gated on concordance shipping s13+ work; no Forge-side blocker.

---

## External Ratification (concordance response 2026-05-12)

Concordance team replied to the OODS-Forge planning canon handshake on 2026-05-12. Full message archived at [`cmos/messages/inbound/2026-05-12-concordance-response.md`](../../messages/inbound/2026-05-12-concordance-response.md). Key receipts that sharpen this memo:

### D1 verified structurally on the concordance wire

Concordance confirmed the SemanticEntity-extension approach is structurally compatible by reading their own `contracts/manifest.schema.json` v1.0.0:

- `SemanticEntity` carries `additionalProperties: true` (line 116) — accepts `oods.*` extension fields without translation
- `TypedRelationship` (line 94) and `EvidenceRef` (line 70) likewise carry `additionalProperties: true`
- Top-level `SemanticManifest` is `additionalProperties: false` (line 9) — `oods.*` lives at the entity level, not manifest level. **This is the exact architectural shape D1 assumed.** Our bet is externally verified.

Concordance: "A Forge-emitted Object Catalog POSTs to `/manifests` with zero translation layer." The v0 round-trip gate (`ingested_entities == entities.length` + hash-stable `GET /entities/{urn}` round-trip) is testable today against `tests/test_v0_round_trip.py` extended with a Forge-emitted fixture.

### D3 first-pass answers concretized concordance's s13 mission slate

Each of our 5 first-pass answers maps to a specific concordance s13 mission they're queuing:

| # | Forge first-pass | Concordance s13 mission consequence |
|---|---|---|
| 1 | API key per Forge instance | s13-m02 ships Bearer-token middleware + per-key request logging. `/version` stays unauthenticated (probe before handshake). |
| 2 | One corpus per Forge workspace | s13-m02 picks corpus-per-workspace isolation. Shared-corpus deferred. |
| 3 | <10 QPS sustained / <50 burst | Postgres+pgvector flip stays gated on actual QPS evidence; SQLite+FTS5+embeddings suffices for v1. |
| 4 | p99 ≤500ms blocking / ≤100ms advisory | s13-m03 (observability) instruments p50/p95/p99 + per-endpoint QPS to prove against the budget continuously. |
| 5 | Concordance-hosted canonical / Forge-hosted fallback | s13-m01 ships Dockerfile + hosted endpoint (Fly.io / Railway / Cloud Run candidates, picked at s13 entry). |

### F2 pin-point file targets (canonical sources for Forge vendoring)

Concordance named the exact files Forge should vendor for F2 pre-registration:

- `contracts/manifest.schema.json` (manifest_version 4.0, wire v1.0.0) — the core SemanticManifest envelope schema
- `contracts/recipes/*.json` (4 recipes, all v1.0.0) — `semantic_location`, `debug_or_explain`, `modify_ui_copy`, `action_eligibility`
- `contracts/api/*.schema.json` — request/response wire shapes for the 7 read endpoints. `version-response.schema.json` is freshest (s12-m02)
- `contracts/pragmatic-roles.json`, `contracts/edge-types.json`, `contracts/task-types.json` — closed enums

Sync mechanism: `bin/sync-contracts.sh` (in diverge-and-concord). Same script divergent-inspector uses. F2 can either vendor via the same path or copy directly into `packages/mcp-server/src/concordance/contracts/`.

### F1 bootstrap recipe (local integration test path)

Concordance pinned the bootstrap recipe for F1 round-trip testing:

```bash
# In a checkout of diverge-and-concord
cd concordance
python3 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
concordance serve --port 8787 &

# For ephemeral remote testing (optional)
cloudflared tunnel --url http://localhost:8787   # s11-m01 #267 pattern
```

F1's round-trip test POSTs a Forge-emitted Object Catalog fixture against this local concordance and asserts:
- HTTP 200 with `ingested_entities` matching `entities.length`
- `GET /entities/{urn}` returns the canonical declaration with hash-stable round-trip

### F3 framing — no overlap

Concordance confirmed the writable-catalog positioning does not overlap with their semantic resolution service framing: Forge writes the catalog; Concordance resolves intent against it. The two organs compose cleanly rather than competing.

### Concordance sprint-13 production update (2026-05-14)

Concordance followed through on the three info_push commitments in `cmos/planning/info-push-to-oods-foundry-mcp.md`:

- Hosted endpoint is live at `https://concordance-production.up.railway.app` on Railway us-east.
- Probe endpoints are unauthenticated: `GET /health`, `GET /version`, `GET /docs`, `GET /openapi.json`, `GET /redoc`.
- `Concordance-Schema-Version: 1.1.0` and `X-Request-Id: <uuid4>` ride on responses.
- Every non-probe endpoint requires `Authorization: Bearer <key>`.
- Per-workspace tenancy is implemented through Postgres schemas (`concordance_<workspace>`).
- Canonical wire contract bumped `1.0.0 -> 1.1.0` with an additive optional top-level `schema_version` field.
- Open Forge asks: send CORS dev-domain allowlist when ready; ping Concordance to issue the Bearer key when I1 starts; confirm whether Forge wants info_push on every minor wire bump or majors only.

### Concordance's original three info_push commitments

To watch for in the Forge inbox:

1. **s13 hosted endpoint live:** fulfilled 2026-05-14.
2. **s13 auth + multi-tenant boundary:** fulfilled 2026-05-14.
3. **Any wire-contract version bump:** fulfilled for `Concordance-Schema-Version` `1.0.0 -> 1.1.0`; continue watching for future bumps.

### Concordance's pacing pattern (signal for Forge planning)

Concordance operates with a **SHIPPED-pattern**: one continuous build session per sprint. Sprints 9, 10, 11, 12 each closed end-to-end in one session. They don't pre-commit to dates on s13 close; info_push arrives within hours of close.

Forge implication: F2 pre-registration (vendored contracts + AJV-validated input schemas + types + tests) now lands against live wire `1.1.0`, then I1 can start with hosted preflight and authenticated calls once the Bearer key is issued. This is the sprint-91 contract-gate pattern applied to a live Concordance endpoint.

### Current concordance state (Sprint 13 SHIPPED 2026-05-14)

For F2 context:
- Wire contract `1.1.0` (`1.0.0 -> 1.1.0` additive optional top-level `schema_version`)
- `GET /version` live (returns `service_version`, `schema_version`, `recipe_versions`, `current_sprint_id`, `build_hash`)
- `Concordance-Schema-Version: 1.1.0` header on every response (via `SchemaVersionHeaderMiddleware`)
- Hosted endpoint live at `https://concordance-production.up.railway.app`
- Bearer auth + per-workspace Postgres-schema tenancy live
- Schema-drift CI gate enforces 13 byte-equal vendored↔canonical parity assertions
- Recipe-quartet closed (4 recipes shipped)
- Test posture: 659 passed + 17 skipped
- Schema-evolution policy doc shipped at Concordance `docs/schema-evolution-policy.md`

---

## Open Sub-Questions

1. **MCP adapter for concordance is on concordance's longer-horizon roadmap.** Once shipped, Forge's concordance client moves from HTTP to MCP. This is mostly mechanical (the wire contract is the same). The interesting question is *when* — likely a separate planning conversation between concordance and Forge teams. No action required from Forge side until concordance signals.

2. **Catalog snapshot vs. streaming ingest.** Today's `POST /manifests` accepts a batch of entities. If Forge wants to push catalog deltas in real-time (every `map.apply` triggers an ingest), the batch-vs-stream choice matters. v1 = batch only (Forge collects a delta and POSTs periodically); streaming is a later optimization if codegen-time concordance freshness becomes important.

3. **Cross-corpus queries.** If a Forge workspace wants to query across multiple concordance corpora (e.g., compare the canonical catalog vs. a competitor's inspected manifest), the single-corpus-per-workspace boundary needs to relax. Defer — surface the question if/when divergence-analysis pipelines (concordance's longer-horizon roadmap) become a Forge use case.

4. **Auth handshake for MCP adapter.** When concordance's MCP adapter ships, the API-key auth scheme has to be reconciled with whatever MCP-level auth Aquex-mcp adopts. Not a D3 question; will get its own micro-decision when MCP adapter design lands.

5. **Operational preferences for live wiring.** Forge still needs to decide the CORS dev-domain allowlist, when to request the Bearer key, and whether Concordance should send info_push on every minor wire bump or only majors. These are operational, not architectural.

---

## What This Memo Is NOT

- **Not a v2 plan.** This memo locks v1 shape (consumer relationship + HTTP + vendored contracts + graceful degradation). When concordance ships MCP adapter, divergence-analysis pipeline, or multi-tenant cross-corpus features, those revisit-points get their own memos.

- **Not a substitute for the actual planning conversation with concordance.** Concordance's integration doc explicitly frames their position as "a starting position for a planning conversation, not a finalized contract." This memo is *Forge's* corresponding position. The actual planning conversation (via `cmos_message` to `cmos://darryl/concordance` or similar) ratifies, modifies, or supersedes these answers.

- **Not a commitment to a specific MCP path.** Forge will adopt concordance's MCP adapter when concordance ships it. Until then, HTTP. The transport layer is orthogonal to the wire contract.

---

## References

**Concordance side (the spine of this decision):**
- [concordance/docs/oods-foundry-integration.md](file:///Users/systemsystems/portfolio/Design-Tools/diverge-and-concord/concordance/docs/oods-foundry-integration.md) — the integration-points sketch + 5 open questions
- [concordance/docs/concordance-integrator-brief.md](file:///Users/systemsystems/portfolio/Design-Tools/diverge-and-concord/concordance/docs/concordance-integrator-brief.md) — 7 stable endpoints, 4 recipes, demoable bootstrap, version pinning protocol
- [contracts/manifest.schema.json](file:///Users/systemsystems/portfolio/Design-Tools/diverge-and-concord/contracts/manifest.schema.json) — v4.0 SemanticManifest schema
- Concordance bootstrap paths: `cloudflared tunnel` (ephemeral live) + local offline (`pytest` + `concordance.eval.cli`)

**Prior decisions:**
- [D1-object-catalog-schema.md](D1-object-catalog-schema.md) — Object Catalog as SemanticEntity-extended kernel (makes consumer relationship possible)
- [D2-multi-fidelity-render.md](D2-multi-fidelity-render.md) — render abstraction doesn't depend on concordance, but verification calls land in renderer pipelines

**Planning canon:**
- [../stack-map.md](../stack-map.md) — concordance's role in the loop; canonical/declared vs. actual/inspected framing
- [../mission-graph.md](../mission-graph.md) — F2, I1 missions
- [../quality-bars.md](../quality-bars.md) — pre-registered schema pattern, real-data E2E gates

---

*Authored 2026-05-10. Updated after Concordance sprint-13 production update on 2026-05-14. Second-pass memo only if live wiring changes the five first-pass answers above.*
