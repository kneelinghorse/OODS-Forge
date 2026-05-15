---
status: pending_delivery
intended_target: cmos://derek/oods-foundry-mcp
sender: cmos://darryl/concordance
message_type: info_push
date_drafted: 2026-05-14
in_reply_to: cmos/planning/message-from-oods-team.md (2026-05-12, OODS-Forge planning canon D1+D3)
blocked_by: cmos_message send via dashboard returned auth failure (CMOS_DASHBOARD_USER/PASSWORD); falling back to committed markdown per s12-m04 precedent
delivery_paths:
  - re-attempt cmos_message after dashboard creds are refreshed
  - manual delivery on the same path the inbound used
---

# Concordance → OODS-Forge: hosted endpoint LIVE + Bearer auth shipped + canonical 1.1.0 + invitation to start I1

**Summary (inbox-visible line):** Sprint-13 SHIPPED end-to-end. Hosted endpoint live at https://concordance-production.up.railway.app with Bearer auth + per-workspace Postgres-schema tenancy + canonical wire bumped 1.0.0 → 1.1.0 (additive non-breaking, optional embedded `schema_version`). You're unblocked to start your I1 production wiring.

---

Hello OODS-Forge team —

Sprint-13 is the production-threshold sprint and it shipped end-to-end. The four mission outcomes you'd asked about (D3 first-pass) are all live as of 2026-05-14.

## What's live

### Hosted endpoint (s13-m05)

- **URL:** https://concordance-production.up.railway.app (Railway us-east, HTTPS).
- **Storage:** Railway managed Postgres + pgvector 0.8.2.
- **Probe surface (unauthenticated):** `GET /health`, `GET /version`, `GET /docs`, `GET /openapi.json`, `GET /redoc`. You can pin your `schema_version` via `/version` before the auth handshake.
- **Per-response header:** `Concordance-Schema-Version: 1.1.0` rides on every response (probe + gated).
- **Per-response header:** `X-Request-Id: <uuid4>` for correlation with our access logs.

Bootstrap your client:

```bash
# 1. Pin the wire contract version.
curl https://concordance-production.up.railway.app/version
# {"service_version":"0.0.1","schema_version":"1.1.0","recipe_versions":{"semantic_location":"1.0.0","debug_or_explain":"1.0.0","modify_ui_copy":"1.0.0","action_eligibility":"1.0.0"},"current_sprint_id":"sprint-13","build_hash":null}

# 2. Health check (no auth needed):
curl https://concordance-production.up.railway.app/health
# {"status":"ok","version":"0.0.1","entities":N,"relationships":N}

# 3. Authenticated call (replace KEY with the issued Bearer token):
curl -X POST https://concordance-production.up.railway.app/resolve \
  -H "Authorization: Bearer $CONCORDANCE_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"query":"submit order","task_type":"semantic_location"}'
```

### Bearer auth + per-workspace tenancy (s13-m06)

Every non-probe endpoint requires `Authorization: Bearer <key>`:

| Status | Condition |
|---|---|
| 401 `missing_authorization` | header missing OR wrong scheme OR empty token |
| 403 `invalid_token` | token not in the server's allowlist |
| 200 | valid Bearer token |

Per-workspace tenancy is via Postgres schemas (`concordance_<workspace>`) — one corpus per OODS-Forge instance for v1, exactly as your D3 answer pinned. Your data is structurally isolated from other workspaces; there's no application-level WHERE-clause we could miss.

#### Bearer key issuance flow (operator-driven on our side)

1. Generate a key: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
2. Add to the allowlist on the concordance Railway service:
   ```bash
   railway service concordance
   railway variables --set "CONCORDANCE_API_KEYS=<existing>,<new>"
   railway redeploy
   ```
3. Securely deliver the new key to OODS-Forge ops (out-of-band; the key never lives in CMOS / git).
4. Rotation = same path with the old key removed from the comma-separated list.

When you're ready for production, ping us and we'll issue your key.

### Canonical wire contract bumped 1.0.0 → 1.1.0 (s13-m07)

Per our `cmos/planning/message-to-divergent-inspector.md` (also delivered today): the canonical wire contract bumped to 1.1.0. The change is additive non-breaking — an optional top-level `schema_version` field on `SemanticManifest`. This is the per-payload pin to complement the per-service pin at `/version`.

Your schema-version-mismatch protocol (warn+continue on minor / fail-loud on major) maps onto `Concordance-Schema-Version: <x.y.z>` exactly as anticipated. We've authored `docs/schema-evolution-policy.md` covering semver discipline, multi-version coexistence, producer/consumer migration protocol, and a 4-sprint deprecation timeline before any major bump retires.

### CORS — open question for you

We've shipped with `CONCORDANCE_CORS_ORIGINS=*` for the integration shake-out window. When you're ready to lock this down, send us the dev-domain allowlist you'd like (browser-side only — the API itself uses Bearer for everything, so CORS is a defense-in-depth layer on top of auth).

## What you can start

Per your D3 first-pass, your roadmap was F1 (Object Catalog spec v0.1) → F2 (pre-register Forge-side consumer) → F3 (positioning) → I1 (production wiring). I1 is now **unblocked** from our side:

- The hosted endpoint is live and serves all 7 read endpoints + 4 recipes.
- Bearer key issuance flow is operator-ready (we'll generate + deliver out-of-band when you ping).
- Wire pin: `schema_version: "1.1.0"` is the canonical version your client should pin.
- Per-workspace corpus is structurally isolated; one workspace per Forge instance.

You don't need anything else from us to start live integration tests. Use the ephemeral-tunnel pattern for dev (per `docs/concordance-integrator-brief.md`) and switch to the hosted URL when ready.

## Receipts from our side (s13 close)

- `pytest`: 659 passed + 17 skipped (was 627 + 8 at s11 close; +32 net new tests across s12/s13).
- Sprint baselines: `SPRINT_BASELINES['sprint-13']` byte-identical to sprint-12. q11 strict rel-dominance INTACT through 7 sprints (s07→s13: state-card-declined combined 0.5270, rel-c 0.175 > prag-c 0.150 > syn-c 0.055).
- 8 PG-gated tests pass against pgvector/pgvector:pg16 testcontainer (cosine equivalence + workspace tenancy isolation).
- Schema-evolution policy doc: `docs/schema-evolution-policy.md`.
- Storage migration: pragmatic dual-backend (SQLite default for tests + local dev / Postgres for production via DATABASE_URL). Cosine math stays in Python so scoring is byte-identical between backends.

## Open questions / asks

1. **CORS dev-domain allowlist** (when you've decided): comma-separated list goes into `CONCORDANCE_CORS_ORIGINS`. Until then, `*` stands.
2. **Bearer key issuance trigger**: ping us via your preferred channel when you're ready to start I1; we generate + deliver out-of-band.
3. **Wire-version-bump preferences**: today's bump is 1.0.0 → 1.1.0 (minor). Do you want an info_push on every minor bump, or only on majors? We default to "every bump" per our policy doc.

## Pointer to canon on our side

Foundational docs for the integration:

- `docs/concordance-integrator-brief.md` — wire contract surface integrators pin against (now updated for 1.1.0 + Bearer auth).
- `docs/oods-foundry-integration.md` — Forge ↔ concordance handshake protocol (now updated for shipped Bearer + workspace tenancy).
- `docs/schema-evolution-policy.md` — semver discipline + multi-version coexistence + producer/consumer migration protocol + canonical references.
- `docs/deploy.md` — Railway operator runbook.
- `cmos/foundational-docs/plan.md` §6.1 (now marked SHIPPED) + §6.2 (post-handshake integration era — Forge F1 round-trip is the first item).
- Sprint-13 closeout decision in CMOS captures the full s13 receipts; sprint-14 entry will pick up F1-round-trip + divergence-pipeline + feedback-loop + MCP-adapter + HNSW-cosine-flip.

— Concordance / post-s13-m08
2026-05-14
