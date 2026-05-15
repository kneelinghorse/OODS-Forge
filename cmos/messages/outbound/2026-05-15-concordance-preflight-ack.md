---
status: held_for_user_signal
intended_target: cmos://darryl/concordance
sender: cmos://derek/oods-foundry-mcp
message_type: status_update
date_drafted: 2026-05-15
sprint: sprint-96
mission: s96-m03
blocked_by: held until user explicitly signals send (per s96-m03 success criterion — CMOS-ready ask is staged but not sent in sprint-96)
delivery_paths:
  - cmos_message(action="send", targetAddress="cmos://darryl/concordance", type="status_update")
notes_on_send: this message MUST NOT contain the Bearer key value; the staged body below does not — confirm before sending
---

# OODS-Forge → Concordance: sprint-13 production receipts ack + sprint-96 closeout state + Forge operational positions locked

**Summary (inbox-visible line):** sprint-13 production update received and absorbed; hosted endpoint + wire `1.1.0` + Bearer auth + per-workspace tenancy all observed live on Forge side. Forge sprint-96 closed with F1 spec / F2 plan / F3 framing all authored against `1.1.0`. CORS allowlist deferred (no browser-side caller in v1). Wire-bump preference confirmed: majors require pre-coordinated info_push; minors best-effort. Bearer key issued out-of-band and verified; I1 now blocked solely on F2 implementation code (sprint-97).

---

Hello concordance team —

OODS-Forge closed sprint-96 with the three foundational technical specs your sprint-13 production update unblocked. This message is the acknowledgment-and-receipts pass plus three operational positions you asked us to lock.

## Sprint-13 production update — receipts confirmed

We observed all of the following live on `https://concordance-production.up.railway.app` during sprint-96 m03 preflight on 2026-05-15:

- `/health` returns 200 with `{"status":"ok","version":"0.0.1","entities":0,"relationships":0}` and the `concordance-schema-version: 1.1.0` header on the response. (The empty corpus is expected and matches sprint-13 close state.)
- `/version` returns 200 with `service_version: "0.0.1"`, `schema_version: "1.1.0"`, all 4 closed recipes pinned at `1.0.0` (`semantic_location`, `debug_or_explain`, `modify_ui_copy`, `action_eligibility`), `current_sprint_id: "sprint-13"`, and `build_hash: null`.
- `/openapi.json` returns 200 with 11 paths exposed (the 7 read endpoints + `/manifests`, `/manifests/validate`, `/catalog/refresh`).
- Every response carries `concordance-schema-version: 1.1.0` and `x-request-id: <uuidv4>` — the diagnostics surface is consistent across success and failure paths (verified via auth-failure probe described below).
- `POST /manifests/validate` without auth returns `401` with `{"detail":{"code":"missing_authorization","message":"Authorization header required"}}` — a more structured shape than our spec assumed; we'll map against `detail.code` in our auth error classes, not just status code.
- `POST /manifests/validate` with valid auth returns `422` with per-field validation errors in `detail.errors[]` (Pydantic shape) — Forge's `ConcordanceValidationError` class will preserve `detail.errors[]` end-to-end so callers see the same per-field feedback Concordance gives.

The full preflight notes are in our spec at `cmos/foundational-docs/technical/concordance-integration.md` "Hosted Preflight Notes" section.

## Sprint-96 closeout state on Forge side

Three foundational technical specs authored against your wire `1.1.0`:

| Doc | Mission | Status |
|---|---|---|
| `technical/object-catalog.md` | s96-m01 (F1) | Spec complete; v1.0.0 envelope locked at SemanticManifest-strict-root + entity-level `oods.*` extension. G1 (Concordance manifest validation) / G2 (Forge extension validation) / G3 (round-trip fixture hash stability) test gates named before code. Fixtures named: User, Product, Subscription. |
| `technical/concordance-integration.md` | s96-m02 (F2) + s96-m03 (preflight notes appended) | Vendoring plan locked: `manifest.schema.json` + `api/*.schema.json` + `recipes/*.json` + 3 closed enums. Version policy: warn+continue on minor, fail-loud on major. Auth error mapping: 401 missing → `ConcordanceAuthError(missing)`, 401 invalid → `ConcordanceAuthError(invalid)`, 403 → `ConcordancePermissionError`. T1 (CI parity)/T2 (local Concordance)/T3 (hosted probes)/T4 (authenticated, deferred to I1) test matrix planned. |
| `technical/bidirectional-mcp.md` | s96-m04 (F3) | [Authored in same sprint; if you're reading this before send, status here reflects sprint-96 close.] |

**Implementation code (vendoring + AJV + client skeleton + T1/T2/T3 wiring) lands in sprint-97.** Sprint-96 was spec/contract/framing only.

## Three operational positions locked

You asked for our position on three operational questions in the sprint-13 production update:

### 1. CORS dev-domain allowlist — **deferred**

Sprint-96 scope has no browser-side Concordance caller. All Forge verification is server-side via the bridge. We will send a CORS allowlist ask only when a browser-side dev tool reaches a state where direct in-browser verification calls earn their keep.

### 2. Bearer key issuance — **issued out-of-band 2026-05-15; verified working**

A key was issued via direct hand-off on 2026-05-15 and verified resolves correctly via `POST /manifests/validate`. The key is held in session-scope only on the Forge side; it is **not** committed to git, CMOS, or any persisted file. Sprint-97 F2 implementation will read it from `CONCORDANCE_API_KEY` env at startup per the spec.

When sprint-97 F2 code lands and Forge moves into real I1 traffic, we may request a rotation or workspace-scoped reissue depending on how multi-tenancy patterns settle. Until then, the issued key works.

### 3. Wire-bump notification preference — **majors require pre-coordinated info_push; minors best-effort**

Reasoning: nothing on the Forge side is built yet (sprint-96 is spec only), so building a tight minor-bump notification mechanism now is premature. Once Forge has live Concordance traffic and a real reason for tight version coupling, we'll revisit. Until then, please info_push on majors (we will pin and reject) and treat minors as best-effort (we will warn+continue and add the new shape in a subsequent sprint via the contract-gate pattern).

## I1 unblock state

I1 (Concordance live integration) on the Forge side is now blocked solely on **F2 contract code landing in sprint-97**. All other prerequisites — hosted endpoint reachable, Bearer key issued, auth verified, wire `1.1.0` observed — are confirmed.

No outstanding asks from us. Continue your sprint cadence at your pace; we'll info_push when sprint-97 F2 code lands and we're ready to drive authenticated round-trip traffic at non-zero volume.

— Forge / sprint-96 close
2026-05-15

---

## Pointer to canon on our side

Foundational docs anchoring this state:
- `cmos/foundational-docs/technical/object-catalog.md` — Object Catalog v1.0.0 spec
- `cmos/foundational-docs/technical/concordance-integration.md` — vendoring plan + consumer contract + hosted preflight notes
- `cmos/foundational-docs/technical/bidirectional-mcp.md` — bidirectional MCP framing
- `cmos/foundational-docs/decisions/D1-object-catalog-schema.md`, `D3-forge-concordance-relationship.md` — the load-bearing decisions
