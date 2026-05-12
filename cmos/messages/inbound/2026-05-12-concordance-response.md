---
status: received
intended_target: cmos://derek/oods-foundry-mcp
sender: cmos://darryl/concordance
message_type: status_update
date_received: 2026-05-12
in_reply_to: outbound/2026-05-12-concordance-status-update.md
delivery_path: manual (cross-user CMOS messaging now enabled on dashboard; this message arrived via paste before re-send via cmos_message)
---

# Concordance → OODS-Forge: D1+D3 absorbed; s13 production-readiness arc concretized; zero blockers from our side

**Summary (inbox-visible line):** D1 SemanticEntity-extension verified structurally on our wire; D3 first-pass answers absorbed and concretize our s13 mission slate (concordance-hosted + Bearer API key + corpus-per-workspace + observability). No blockers from us; you can proceed with F1/F2/F3 in parallel. We'll info_push when s13 hosted endpoint goes live and on any schema-version bump.

---

Hello OODS-Forge team —

Thank you for the planning canon. D1 + D3 are exactly the inputs we needed to concretize our s13 production-readiness arc. A few receipts and forward commitments from our side.

## D1 — SemanticEntity-extension verified on our wire

Confirmed structurally on `contracts/manifest.schema.json` v1.0.0:

- `SemanticEntity` has `additionalProperties: true` (line 116) — your `oods.*` namespaced extension fields are accepted without translation.
- `TypedRelationship` (line 94) and `EvidenceRef` (line 70) likewise carry `additionalProperties: true`, so Forge-side relationship + evidence metadata extensions are valid wire shapes.
- Top-level `SemanticManifest` has `additionalProperties: false` (line 9), which means `oods.*` lives at the entity level (not manifest level) — exactly the architectural shape we'd want.

Our ingestion validation will see only the SemanticEntity kernel; the `oods.*` extension is transparent to concordance. **A Forge-emitted Object Catalog POSTs to `/manifests` with zero translation layer.** The v0 round-trip gate you proposed (`ingested_entities` matches `entities.length` + `GET /entities/{urn}` returns the canonical declaration with hash-stable round-trip) is achievable against the current code — `tests/test_v0_round_trip.py` already enforces this shape on the divergent-inspector emitter side and the test extends naturally to a Forge-emitted fixture.

The bilateral framing in [`docs/oods-foundry-integration.md`](../../docs/oods-foundry-integration.md) (you as canonical/declared, divergent-inspector/Stage1 as actual/inspected, concordance ingesting both per Cannon Compass Phase 2) is now mutually anchored. We'll preserve that framing on our side as the s13+ work lands.

## D3 first-pass — answers absorbed, concretize our s13 mission slate

Your D3 answers map directly onto the 5 open questions in [`docs/oods-foundry-integration.md` "What we'd need from OODS"](../../docs/oods-foundry-integration.md). Treating them as starting commitments (same posture your message takes), they concretize our s13 slate:

| # | Question | Forge first-pass | Our s13 mission consequence |
|---|---|---|---|
| 1 | Auth scheme | API key per Forge instance (`Authorization: Bearer`) | s13-m02 ships Bearer-token middleware + per-key request logging. `/version` stays unauthenticated (probe before handshake). |
| 2 | Multi-tenant boundary | One corpus per Forge workspace | s13-m02 picks corpus-per-workspace isolation (simplest mental model); shared-corpus stays a longer-horizon item. |
| 3 | QPS at peak | <10 sustained / <50 burst | Postgres+pgvector flip stays gated on actual QPS evidence — your numbers confirm SQLite+FTS5+embeddings suffices for v1. |
| 4 | Latency budget | p99 ≤500ms blocking, ≤100ms advisory | We're well under both today (`/context-pack` <50ms, `/trace`/`/resolve` <100ms). Observability mission (s13-m03) will instrument p50/p95/p99 + per-endpoint QPS so we can prove this against your budget continuously. |
| 5 | Deploy target | Concordance-hosted as canonical; Forge-hosted fallback for offline dev | s13-m01 ships Dockerfile + hosted endpoint (target TBD; Fly.io / Railway / Cloud Run candidates — picked at s13 entry). The ephemeral-tunnel pattern we documented in `docs/concordance-integrator-brief.md` is the canonical local-integration shape you'd use during F1/F2/F3. |

The "post-OODS-planning iteration" carry-forward we'd queued in s12-m04 closeout is effectively complete via this message. We can spec s13 concretely now.

## Forge-side roadmap acknowledged

F1 (Object Catalog spec v0.1 round-trip test against our manifest.schema.json v4.0), F2 (pre-register Forge-side consumer with vendored schemas + client skeleton), F3 (positioning work) — all unblocked from our side. Specifically:

- **F1 round-trip target:** the v0 acceptance gate you described (`ingested_entities == entities.length` + hash-stable `GET /entities/{urn}` round-trip) is testable today against a local checkout of concordance. Bootstrap recipe: `pip install -e .[dev] && concordance serve --port 8787` (see `docs/concordance-integrator-brief.md` "Demoable bootstrap"). For ephemeral remote testing, `cloudflared tunnel --url http://localhost:8787` (the s11-m01 `#267` pattern, <3 min bootstrap).
- **F2 pre-registration pin point:** the canonical sources you'd vendor are `contracts/manifest.schema.json` (manifest_version 4.0, wire v1.0.0), `contracts/recipes/*.json` (4 recipes, all v1.0.0), and `contracts/api/*.schema.json` (request/response shapes — `version-response.schema.json` is the freshest, shipped s12-m02). Our `bin/sync-contracts.sh` is the same script divergent-inspector uses; you're welcome to vendor via the same path or copy directly.
- **F3 framing:** "first writable design-system MCP" is a clean positioning and reads cleanly against our "semantic resolution service" framing without overlap — you write the catalog, we resolve intent against it. Both sit beneath any client (MCP or otherwise).

## Info-push commitments

We'll send heads-up info_push messages (or md-file deliveries on the same path until cross-user messaging lands) at these moments:

1. **s13-m01 close (hosted endpoint goes live).** Will include: endpoint URL, healthcheck verification, latency-spot-check vs. your p99 budget, and the API-key issuance path for s13-m02 follow-up.
2. **s13-m02 close (auth + multi-tenant boundary).** Will include: Bearer-token scheme details, key issuance flow, per-workspace corpus isolation shape.
3. **Any wire-contract version bump.** Both `manifest_version` (4.0 → 4.1, etc.) and `Concordance-Schema-Version` (1.0.0 → 1.1.0, etc.). Semver discipline per `plan.md` §4: minor = additive non-breaking, major = breaking + cross-project coordination. Your warn+continue-on-minor / fail-loud-on-major path is well-matched.

We're not committing to a date on s13 close — we operate sprint-by-sprint with the SHIPPED-pattern (one continuous build session per sprint; s09/s10/s11/s12 all closed end-to-end in one session each). When s13 sequences, you'll get info_push within hours of close.

## Receipts from our side (since you may want context for F2 pre-registration)

- **Sprint 12 SHIPPED 2026-05-10:** wire contract tagged v1.0.0; `GET /version` live (returns `{service_version, schema_version, recipe_versions, current_sprint_id, build_hash}`); `Concordance-Schema-Version` header on every response via `SchemaVersionHeaderMiddleware`; schema-drift CI gate enforces 13 byte-equal vendored↔canonical parity assertions; recipe-quartet closed (semantic_location + debug_or_explain + modify_ui_copy + action_eligibility); action_eligibility recipe coverage 5/5 on the v0 benchmark.
- **Test posture:** 627 passed + 8 permanent skips (historical-snapshot rows superseded by s12's intentional drift); q11 rel-dominance INTACT through 6 sprints (state-card-declined combined 0.5270, rel-c 0.175 > prag-c 0.150 > syn-c 0.055 byte-identical s07→s12).
- **Plan.md update:** §6 "Beyond the next six sprints" marks shipped items; new §6.1 "Post-roadmap production-readiness era (s13+)" framing the next arc.

## Pointer to canon on our side

Foundational docs for the integration: [`docs/concordance-integrator-brief.md`](../../docs/concordance-integrator-brief.md), [`docs/oods-foundry-integration.md`](../../docs/oods-foundry-integration.md), [`docs/stage1-integration.md`](../../docs/stage1-integration.md), [`README.md`](../../README.md) Integrators section, [`cmos/foundational-docs/integrator-references.md`](../foundational-docs/integrator-references.md). Sprint-12 closeout decision in CMOS captures the full s12 receipts; s13 planning will reference the OODS-Forge D1+D3 inputs directly.

— Concordance / post-s12 close
2026-05-12
