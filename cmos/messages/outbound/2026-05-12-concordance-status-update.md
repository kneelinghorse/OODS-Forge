---
status: pending_delivery
intended_target: cmos://darryl/concordance
sender: cmos://derek/oods-foundry-mcp
message_type: status_update
date_drafted: 2026-05-12
blocked_by: cross-user CMOS messaging is invite-only on current dashboard tier
delivery_paths:
  - enable cross-user messaging on cmos.aquex.ai dashboard, then resend via cmos_message
  - switch to local cmos-mcp checkout pointed at concordance and send from that context
  - manual delivery (paste into concordance session, scp to Mac Studio, etc.)
---

# OODS-Forge → Concordance: planning canon complete; you can continue your s13+ work

**Summary (inbox-visible line):** OODS-Forge planning canon complete — Forge committing to SemanticManifest v4.0 compatibility (D1 decided); first-pass answers to your 5 integration questions (D3 decided). You can continue your s13+ work; we're unblocked from this side.

---

Hello concordance team —

OODS-Forge completed its long-term roadmap planning across 2026-05-09 → 2026-05-11. Four decision memos landed (D1–D4 first-pass), all committed to `OODS-pro` on `github.com/kneelinghorse/OODS-Forge` (the private fork; public predecessor `OODS-Foundry-mcp` is frozen as v1). The two that affect your pacing are D1 (Object Catalog schema) and D3 (Forge↔concordance relationship).

## D1 outcome — what this means for you

OODS Object Catalog v0.1 is designed as a **SemanticEntity-extended kernel**. Every CatalogObject Forge emits is a valid SemanticEntity per your `contracts/manifest.schema.json` (manifest_version `4.0`). Forge layers a namespaced `oods.*` extension (render slots, projection_variants, brand_overlay, confidence_decomposition, evidence_chain) using the `additionalProperties: true` affordance on SemanticEntity. Your ingestion validation should see only the SemanticEntity shape; the `oods.*` extension is invisible to concordance.

**Implication:** a Forge-emitted Object Catalog can POST to `/manifests` without translation. The bilateral framing in your `oods-foundry-integration.md` — Forge as canonical/declared side, divergent-inspector as actual/inspected side, concordance ingesting both — is the architectural anchor for our planning.

Once your s13+ hosted endpoint ships, the round-trip test we want to gate on:
- POST a Forge-emitted Object Catalog → `ingested_entities` matches `entities.length`
- GET `/entities/{urn}` returns the canonical declaration with hash-stable round-trip

That's the v0 acceptance gate from our side. No translation layer required.

## D3 first-pass — answers to your 5 open questions

From your `docs/oods-foundry-integration.md` "What we'd need from OODS":

| # | Question | Forge's first-pass answer |
|---|---|---|
| 1 | Auth scheme | API key per OODS-Forge instance for v1 (`Authorization: Bearer <key>`). OAuth/JWT is a follow-on once multi-tenant patterns emerge. |
| 2 | Multi-tenant boundary | One concordance corpus per OODS-Forge workspace for v1. Shared-corpus-with-tenant-scoped-reads deferred until divergence-analysis cross-installation use cases emerge. |
| 3 | Expected QPS at peak | Low: <10 QPS sustained, <50 burst. Forge calls concordance at codegen/audit/brand-apply lifecycle moments — not on every render. Your current SQLite + FTS5 + embeddings handles this comfortably; no QPS pressure on your Postgres+pgvector decision from us. |
| 4 | Latency budget | p99 ≤500ms for codegen-blocking calls; p99 ≤100ms for advisory calls in playground/operator workflows. Your current numbers (`/context-pack` <50ms, `/trace` <100ms, `/resolve` <100ms) are well under — no latency pressure on you from us either. |
| 5 | Preferred deploy target | Concordance-hosted as canonical. Forge calls a public concordance URL once you ship the s13+ hosted endpoint. Forge-hosted fallback for offline development; we'll run a vendored local concordance via your `cloudflared tunnel` bootstrap path during the local-integration phase. |

Full reasoning lives in our D3 memo: `cmos/foundational-docs/decisions/D3-forge-concordance-relationship.md`. Treat these as starting answers for the cross-team planning conversation, not finalized commitments — the same posture your integration doc takes.

## Forge-side roadmap

You can continue your s13+ work at your own pacing. Forge's near-horizon plan (sprint-96 onward, after Derek reviews the canon) is:

- **F1** — implement Object Catalog spec v0.1 (TypeScript types + JSON Schema + fixtures + round-trip test against your manifest.schema.json v4.0)
- **F2** — pre-register the Forge-side consumer of concordance's contract (vendored manifest schema + API schemas + client skeleton). This is the sprint-91 contract-gate pattern applied to concordance: receiver-side ready before the wire goes live.
- **F3** — formalize Forge's public framing as the first writable design-system MCP (positioning work alongside the engineering)

We do **not** need anything from you to start F1/F2/F3. Live integration tests use the ephemeral-tunnel pattern against a locally-cloned concordance. Production wiring is the I1 integration mission, which gates on your s13+ hosted endpoint shipping.

## What we'd appreciate, but no pressure

When you're ready: a heads-up info_push when (a) the s13+ hosted endpoint is online, (b) any of the wire contract version bumps (e.g., v4.0 → v4.1 manifest_version, or `Concordance-Schema-Version: 1.0.0` → `1.1.0` semantic). The schema-version-mismatch path is well-defined on our side (warn + continue on minor, fail loud on major) — we just want to track when bumps land so we can pre-register if needed.

## Pointer to full canon

Our planning canon is at `cmos/foundational-docs/` in the OODS-Forge repo, accessible to you via filesystem (it's a Derek repo on a Derek machine). Entry point: `overview.md`. Decision memos D1 and D3 are the load-bearing ones for our coordination.

— OODS-Forge (Derek)
2026-05-12
