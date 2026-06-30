# Forge Viz — Slice 1: certify + content-address the a11y/determinism guarantee at emission ("make the claim true") Decision Memo

**Sprint:** 134 · **Status:** keystone (m01, NO CODE) · **Locked:** decision #978 (Derek-ratified 2026-06-30, planning PS-2026-06-29-004; grounded + critic-verified via `wf_6afb186d-3c9`, verdict AMEND-THEN-LOCK — both blockers folded) · **North-star:** decision #977

This memo pins Slice 1 so m02–m05 execute **without re-grounding**. It is the contract a fresh build session reads. Read §3 (the one corrected truth) before touching m04.

---

## 0. What this sprint adds (the thesis)

Forge's locked north-star (#977): **the engine that GENERATES AND CERTIFIES accessible, deterministic, governed output for agents.** Today the "by construction" half of that claim is **FALSE at emission**, and Slice 1's only job is to make it **TRUE — measurably — before we productize it.** Two concrete, additive emission-scope wins:

1. **Determinism identity** — emit a deterministic `contentHash` over the canonicalized primary payload on `viz.render` + `dashboard.render`. Default-ON. Today output identity is only `specRef` — a `randomUUID` cache handle (~30-min TTL), not a content identity. (m02)
2. **A11y certify-at-emission, in WARN MODE** — wire the dormant 16-rule equivalence engine (`validateVizEquivalenceRules`) into the production emit path as **soft-warn** (failures → `warnings[]`, never thrown, never gating), behind a new default-FALSE flag. This is the **instrument that measures how false the a11y claim currently is** before any gate exists. (m03) + the first builder-path test coverage (m04).

Slice 1 adds **NO new MCP tool** — both features ride the existing `viz.render` / `dashboard.render` tools. The standalone `artifact.certify` tool is **Slice 2** (§8).

---

## 1. The pinned calls (Derek-ratified 2026-06-30, #978)

| # | Call | Rationale |
|---|------|-----------|
| C1 | **Warn-only, no gate, this slice** | Call `validateVizEquivalenceRules` (never throws); **NEVER** `assertVizEquivalence` (throws on error-severity). The gate-flip is Slice 2. See §3 for why a gate today rejects ~all valid output. |
| C2 | **`contentHash` default-ON; `a11yEquivalence` flag default-OFF** | contentHash is a stable deterministic function of the emitted payload (additive — see §4 #564 framing). The a11y warn flag is default-off so `warnings[]` stays byte-identical when unused. |
| C3 | **Cartesian-only warn wire-in** | The ECharts-primary path builds an empty-data scaffold that spuriously trips R-03/R-15. Warn-mode runs ONLY on the cartesian (`buildVizSpecFromRows`/`buildFromIntent`) branch. |
| C4 | **No scorer-term change** (#110) | The intent path stays mode `'suggest'`; the recommender goldens are untouched. |
| C5 | **No new tool; rides existing tools** | No new advertised tool surface — only a rebuilt dist (the bridge/aquex schema is connect-time cached; see m05 / §7). |
| C6 | **Do-less freeze** | The NL→viz + dimension-registry carry-forwards stay **reverted/stashed** (`stash@{0}` — "s133 dimension-registry WIP — cut per Derek 2026-06-29"). Do NOT inherit them. `purity.audit` + `vrt.run` cleanup is OUT (deprecate-in-place only). |

**Spine (strict `Requires` m01→m02→m03→m04→m05):** memo → contentHash → a11y warn wire-in → first tests → closeout.

---

## 2. The truth being corrected (the headline, VERIFIED against HEAD `7649da4`)

> **The "accessible + deterministic by construction" claim is currently FALSE at emission.**

Three verified facts:

1. **The 16-rule equivalence engine has ZERO production callers.** `validateVizEquivalenceRules` / `assertVizEquivalence` (`packages/viz-core/src/a11y/equivalence-rules.ts:36,64`) are wired to **nothing** in any tool/handler. a11y today is **synthesized** (accessible-table + narrative on the `includeA11y` path) and **emitted UNCHECKED / UNGATED** — no rule ever runs against what we ship. Verified: `grep -rn "assertVizEquivalence\|validateVizEquivalenceRules"` over `*.ts` (excl. node_modules/dist) returns only the definition + one test file (next point) — **no handler, no tool, no builder**.
2. **Output identity is a random cache handle, not a content identity.** `specRef` is `createValueRef(...).ref` (a `randomUUID`, ~30-min TTL) at `viz.render.ts:270-272` (Vega path) and `:482-484` (ECharts path). It says nothing about *what* was emitted.
3. **R-05 (error) fires on ~100% of builder-default cartesian emissions; R-14 (warn) on every >2-col table** — both because of defaults the **builder never synthesizes**. VERIFIED: R-05 (`equivalence-rules.ts:146-159`) passes only when both x/y bindings carry a non-empty `.title`; the builder emits a title **only if the input value already has one** (`spec-builder.ts:862`: `...(value.title ? { title: value.title } : {})`), and `buildVizSpecFromRows` does not synthesize axis titles. R-14 (`:276-293`) fails when a >2-col table has no `portability.tableColumnOrder`, which the builder also does not set.

This is precisely why **warn-not-gate**: a gate today would reject nearly all valid output, and *fixing* R-05/R-14 means the builder synthesizing axis titles + column order, which **re-bytes the 231 determinism goldens + fidelity snaps** — Slice 2 work with golden regen + a decision record. Warn-mode lets us *measure* the failure rate against real emissions first.

---

## 3. ⚠️ CORRECTION the executing agent (m04) MUST read — "zero tests" is INACCURATE

The locked mission text says the engine has "ZERO production AND zero test callers" and m04 says "the engine has ZERO existing tests." **The production claim is true; the test claim is NOT.** Verified at HEAD:

- **An existing test exercises the engine:** `tests/viz/a11y-equivalence.test.ts` imports `validateVizEquivalenceRules` (via the `src/viz/a11y` re-export shim → `packages/viz-core`) and asserts, among others, *"passes all 15 equivalence rules for the reference spec"* and *"flags A11Y-R-03 when the table fallback is disabled."* It runs in the default vitest `tests/**/*.test.ts` glob.
- **But that test proves nothing about production emissions.** It runs over a **hand-authored fixture** (`createBarChartSpec()`, `tests/components/viz/__fixtures__/barChartSpec.ts`) that **deliberately satisfies every rule** — it sets `x.title:'Region'`, `y.title:'Revenue (USD)'` (R-05 ✓) and `portability.tableColumnOrder` (R-14 ✓). That is exactly why it can claim "all 15 pass" while §2#3 says R-05/R-14 fire on real output: **the fixture has what the builder omits.**

**Therefore the accurate framing for m04 is: there is ZERO coverage over the production BUILDER path** (`buildVizSpecFromRows` / `buildFromIntent` — specs built the way `viz.render` actually builds them). m04:
- **ADDS** builder-path coverage (assert R-05 *fires* error-severity on a default cartesian emission, R-14 *fires* on a >2-col table — encoding "the claim is currently false" as a regression), plus a fully-conformant green-target spec that passes all error-severity rules (set BOTH x.title AND y.title for R-05; `a11y.description` ≥25 chars for R-08; ariaLabel-or-name for R-09; `portability.tableColumnOrder` for R-14 — or it trips a *different* error rule and the future-gate assertion is misleading).
- **MUST NOT** delete, rewrite, or duplicate `tests/viz/a11y-equivalence.test.ts` (the fixture suite stays — it's a valid "rich spec passes" assertion). New builder-path coverage goes in the mcp-server test tree alongside `viz.render.test.ts`.
- Sprint-close language: say "first coverage over the production builder path," NOT "first tests for the engine." (Rule 12: fail loud — don't restate a false claim.)

---

## 4. m02 — `contentHash` (the determinism half) — the cheap additive win, ship FIRST

**Goal:** a deterministic content identity beside the random `specRef`.

1. **Re-export the audited primitives.** Add `export { canonicalize, sha256 } from './utils.js';` to `packages/artifacts/src/index.ts` (today it re-exports only writer/verify/types symbols — VERIFIED). Both tools then `import { canonicalize, sha256 } from '@oods/artifacts'` (mcp-server already depends on `@oods/artifacts`). **NO** local hash helper, **NO** private-util deep import.
2. **Schema first (load-bearing — output is AJV-validated AFTER return).** Add a top-level OPTIONAL `contentHash:{type:'string'}` to BOTH `viz.render.output.json` AND `dashboard.render.output.json` — top-level (NOT inside the `output` sub-object), NOT in `required` (error-path outputs that omit it stay valid under top-level `additionalProperties:false`). Then `pnpm generate:schema-types` — **never hand-edit `generated.ts`.**
3. **Wire the handler** — `sha256(canonicalize(payload))` over the DETERMINISTIC, JSON-SAFE primary payload already on each output, beside the specRef trio:
   - `viz.render` Vega path → hash `out.spec` (the compiled Vega-Lite spec).
   - `viz.render` ECharts-primary path → hash the **JSON-projected** `echartsOption` (`JSON.parse(JSON.stringify(option))` at `viz.render.ts:407`, post-`__joinDiagnostics`-strip — NOT the raw adapter option with the dropped formatter closure).
   - `dashboard.render` → hash the SAME `{panels:panelResults, layout}` object that already feeds the dashboard specRef (`dashboard.render.ts:697-701`).
   - Default-ON.
4. **Not redundant with specRef (critic-pinned):** `specRef`'s cached VALUE already *is* `out.spec` / `echartsOption`. `contentHash` = the content identity of exactly what `specRef` caches — intentional, not redundant.
5. **Confirm no `NaN`/`Infinity` reaches `canonicalize`** (viz-core already rounds via `stats.round`).

**#564 framing (airtight):** the 231 viz-determinism goldens run BELOW the tool envelope (they call `buildVizSpecFromRows`/`suggestPatterns`/adapters directly, never instantiate the handler) → UNTOUCHED by construction. Only `dashboard-determinism.spec.ts:21` redacts `{specRef,...rest}` and keeps `contentHash` in the compared `rest` (stable same-seed, divergent different-seed → **strengthens** the tripwire).

---

## 5. m03 — `a11yEquivalence` soft-warn wire-in (the a11y half) — engine finally exercised by production

**Goal:** make "a11y by construction" TESTABLE at emission via warn-mode — no gate, no throw.

1. **New default-FALSE input flag `a11yEquivalence`** on `viz.render.input.json` (mirror `strictFields` at `:302`) **AND on `dashboard.render.input.json`** as a top-level optional field beside `strictFields`/`strictDatasets` (`:71/:76`). ⚠️ CRITIC FIX #2: `dashboard.render.input.json` is top-level `additionalProperties:false` (`:14`) — **without this edit AJV REJECTS the flag on dashboard calls.** Regenerate types (covers `DashboardRenderInput` too).
2. **viz.render — cartesian branch only** (`~viz.render.ts:181`, immediately after `const built = ...`; NOT the ECharts-primary path — its scaffold has empty data → spurious R-03/R-15). When the flag is on: call `validateVizEquivalenceRules(built.spec)` (**NEVER** `assertVizEquivalence`), filter `!passed`, map each to `{code:'OODS-A11Y-'+rule.id, message: rule.message ?? rule.summary, severity:'warning'}` — **FORCE `severity:'warning'`** regardless of the rule's intrinsic severity (the rule field is `'error'|'warn'`; the output issue enum value is `'warning'` — see §6), and concat into the existing `fieldWarnings` BEFORE the assembly at `:196` (assembly point unchanged).
3. ⚠️ CRITIC FIX #1 — **dashboard.render has NO existing per-panel `out.warnings` propagation to ride.** `buildChartResult` (`dashboard.render.ts:802+`) copies `id/spec/echartsSpec/a11yDescription/a11y` from each per-panel `viz.render` output and **SILENTLY DROPS `out.warnings`**; `:570-576` is the error/omit branch, not a warnings fold. So **ADD a new fold:** when the flag is on, map each per-panel `out.warnings` entry to a panel-id-prefixed dashboard warning (`code` stays `OODS-A11Y-<rule.id>`, message prefixed with the panel id, `severity:'warning'`) and push into the dashboard `warnings[]` (`:97`). **Strictly gated on the flag** — `dashboard-determinism.spec.ts:21` keeps `warnings[]` in the compared `rest`, so an UNCONDITIONAL fold would break #564.
4. **No output-schema change** — reuses the existing issue `$def`; the `severity` enum already includes `'warning'`.
5. **Flag OFF ⇒ `warnings[]` byte-identical to today on BOTH tools.** (R-05/R-14 fire on valid builder defaults — default-off is the #564-protecting choice.)

---

## 6. The `OODS-A11Y-<rule.id>` warn-code namespace (one-way wire decision)

Warn codes are `OODS-A11Y-` + the rule's own id, e.g. `OODS-A11Y-A11Y-R-05`. (The rule ids already carry the `A11Y-R-` prefix in `equivalence-rules.ts`; do not double-process — concatenate literally so the wire is reversible to the rule.) **Severity is always forced to the output enum value `'warning'`**, even though the rule's intrinsic `severity` field is `'error' | 'warn'` — the rule's intrinsic severity is *recorded conceptually* (R-05 is "really" an error) but **emitted as a warning this slice** because the gate is deferred. Slice 2 reads this namespace when it flips error-severity rules to gating.

---

## 7. m05 — closeout (the project's full gate)

1. **Cross-package:** `pnpm install --frozen-lockfile` + ROOT `pnpm typecheck` (per `forge-closeout-gate-sweep` — per-package tsc misses `src/` ChartType consumers via the `src/viz` shim + catches lockfile drift) + per-package build + the `test:scale` lane (231 goldens byte-unchanged with BOTH features present).
2. **Schema/codegen:** confirm `generated.ts` was **regenerated** (not hand-edited) and AJV accepts the new top-level `contentHash` on BOTH OUTPUTs and the new `a11yEquivalence` flag on BOTH INPUTs (input-schema field changes need a dist rebuild for AJV to accept them).
3. **Two-layer (mine, never handed to Derek):** `contentHash` is a NEW served OUTPUT field and `a11yEquivalence` a NEW INPUT flag — both cached in the **advertised** shape at connect-time → rebuild the bridge/aquex dist + `pm2 restart oods-forge-bridge` + RECONNECT so the agent sees `contentHash` and AJV accepts the input flag (execution is fresh-per-call, but the advertised schema is connect-time cached — `aquex-hub-runtime` memory). Confirm **NO new tool** was added → no new advertised tool surface, only the rebuilt dist.
4. **Deprecate-in-place only:** note `purity.audit` + `vrt.run` remain hardcoded `{violations:0}`/`{diffs:0}` stubs — OUT of this slice, no surface change.
5. **Record sprint close** with completion rate + the Slice-2 hand-off (§8). Dated commit + lockfile/dist commits are Derek's domain.

---

## 8. Slice-2 hand-off (FROZEN here, frozen at m05)

The follow-on sprint owns, **IR-first**:
1. **Gate-flip** — flip error-severity equivalence rules from warn to gating (call `assertVizEquivalence` or equivalent), reading the `OODS-A11Y-<rule.id>` namespace this slice established.
2. **Builder R-05/R-14 synthesis + golden regen** — the builder synthesizes axis titles (R-05) + `portability.tableColumnOrder` (R-14) so default emissions PASS; regenerate the 231 determinism goldens + fidelity snaps under a decision record (this re-bytes them — that's why it's Slice 2, not Slice 1).
3. **ONE new artifact.certify tool** — "generate AND certify" an agent-supplied artifact. **IR-FIRST**: certify a Forge `UiSchema` / typed spec. **DEFER** free-text React/HTML certify (= parser-back-to-IR — out of scope until the IR path is proven).

The NL→viz free-text + dimension-registry carry-forwards remain **stashed/reverted** (do-less freeze, C6); they are NOT Slice-2 scope unless re-ratified.

---

## 9. Held constraints (every mission)

- **#564** additive default-off floor: `a11yEquivalence` default-OFF (warnings[] byte-identical when off); `contentHash` default-ON but a STABLE deterministic function of the emitted payload; the 231 determinism goldens byte-identical.
- **#110 / no scorer change:** intent path stays mode `'suggest'`.
- **#525 MCP-only consumer:** no Workbench/external-pull/hosted assumptions.
- **Two-layer + full cross-package closeout** (m05).
- **Per-mission native-learning HARD capture** via single-string `cmos_session` capture (NOT the stripped `cmos_mission_transition` `decisions[]`).
- **pm2/bridge restart is mine** (m05), never handed to Derek.

---

## 10. Verified anchors (HEAD `7649da4`, this session)

| Anchor | File:line | Verified |
|---|---|---|
| Engine entry + assert | `packages/viz-core/src/a11y/equivalence-rules.ts:36,64-71` | ✓ |
| Zero production callers | `grep` over `*.ts` → def + 1 test only | ✓ |
| Existing fixture test (the §3 correction) | `tests/viz/a11y-equivalence.test.ts:4,45,61` | ✓ |
| Fixture sets x/y title + tableColumnOrder | `tests/components/viz/__fixtures__/barChartSpec.ts:20-21,27,61` | ✓ |
| R-05 (axis titles, error) | `equivalence-rules.ts:146-159` | ✓ |
| R-14 (column order, warn) | `equivalence-rules.ts:276-293` | ✓ |
| Builder emits title only if present | `spec-builder.ts:862` | ✓ |
| `sha256` / `canonicalize` (not re-exported) | `packages/artifacts/src/utils.ts:5,30`; `index.ts` (writer/verify/types only) | ✓ |
| specRef trio (Vega / ECharts) | `viz.render.ts:270-272 / 482-484` | ✓ |
| ECharts JSON projection (hash target) | `viz.render.ts:407` | ✓ |
| a11y barrel exports the engine | `packages/viz-core/src/a11y/index.ts:4` | ✓ |
| Do-less freeze: dimension-registry WIP stashed | `git stash@{0}` | ✓ |

*Anchors to re-verify at each mission's own start (m02–m05 carry their own line refs): `viz.render.output.json` + `dashboard.render.output.json` top-level `additionalProperties:false`; `dashboard.render.ts:97,571,697-701,802+`; `viz.render.input.json:302`; `dashboard.render.input.json:14,71,76`; `dashboard-determinism.spec.ts:21`.*
