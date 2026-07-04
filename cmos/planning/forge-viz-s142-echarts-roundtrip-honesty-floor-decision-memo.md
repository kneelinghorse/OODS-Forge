# Keystone Decision Memo — Sprint-142 · ECharts Round-Trip Honesty Floor (certify stops rejecting its own producer's ECharts IR)

**Arc.** Close the s141-review **#1 honesty floor**: make certify accept the `encoding:{}` ECharts IR that `viz.render` actually emits (so the advertised render→certify round-trip is reachable for all 8 ECharts-primary types), and carve honest the tool's `contentHash`-parity over-claim. The FIRST genuine *close-not-relocate* in this sub-arc since s140. HEAD `cab623a`.

**Grounding.** `wf_36e36585-f15` (5 scouts → synthesist → 2 adversarial critics → lock-prep, vs HEAD). Premise **PASS / clean anti-circularity**; both critics **AMEND-THEN-LOCK**, zero blockers; all amendments folded + code-verified.

**Derek decisions (AskUserQuestion, planning `PS-2026-07-04-005`):**
- **Fork-1 = A — 1a floor ONLY.** DEFER the bubble-ordinal **#2 teeth** (a real, reachable-today defect, but it breaches certify's leaf/additive posture — public IR-schema widening + a producer emit-change — to grade a path with no proven live consumer; captured for a future arc when a puller appears). See §7 OOS.
- **Fork-2 = A — cartesian-SCOPED empty-encoding guard**, not a blanket `minProperties` drop (matches certify's positive-allowlist discipline; certify is a hand-authored-IR intake so an adversarial empty-encoding cartesian input is a real, if untested, surface).

---

### 1. Premise — PASS, clean anti-circularity

The round-trip is unreachable for all 8 ECharts-primary types, and the gap sits **between two live tools on the existing path** (not a to-be-built consumer — the anti-thesis of the NL→viz / dark-theme drift trap):

- **Producer emits it.** `buildEChartsPrimarySpec` (`packages/mcp-server/src/tools/viz.render.ts:520-537`) returns every ECharts-primary `normalizedSpec` with `encoding: {}` (`:534`), as a bare `as NormalizedVizSpec` cast (`:536`, no self-validation), and it IS returned to the agent as `out.normalizedSpec` when `output.includeNormalizedSpec:true` (`:483`; default off, `:64`).
- **certify rejects it.** certify's input schema requires `encoding` (`normalized-viz-spec.schema.json:60`) → `$ref` EncodingMap (`:37-39`) which carries `minProperties:1` (`:145`). `assertNormalizedVizSpec(input.spec)` runs FIRST in `handle()` (`packages/mcp-server/src/tools/artifact.certify.ts:207`), and its catch returns `errorVerdict('OODS-V126')` (`:209`) — **before** the trait read (`:216`) and the trait-only ECharts routing (`:222-236`) that would emit the verdict. Empirically reproduced by the grounding: the emitted treemap shape fails AJV at `/encoding` `minProperties`.
- **The advertisement is already false.** `tool-descriptions.json:20` says "an agent can round-trip render → certify" with no ECharts exception. certify errors on its own producer's output.

**`encoding:{}` is SEMANTICALLY CORRECT for ECharts-primary** (grounding-confirmed against `buildEChartsPrimarySpec`'s own header, `viz.render.ts:517-519`): the categorical color is baked by the adapter from `getVizScaleTokens('categorical')`, the geo color lives in the SpatialSpec built from the geo DATA branch — neither is an `encoding.color` binding. So the DEFECT is that the **shared schema over-constrains `encoding` for ECharts traits**, NOT that viz.render should populate a (fictional) encoding. Making viz.render fabricate an encoding would launder the exact semantic fiction every s141 test relies on — rejected.

---

### 2. The fix — cartesian-scoped schema relaxation (INVERTED mechanism; critic-corrected)

Once past `assertNormalizedVizSpec`, the ECharts routing ALREADY produces the correct verdict: `evaluateEChartsCategoricalContrast()` takes **no args** (`certify-contrast.ts:406`) and geo is a flat `'exempt'` — the routing reads only `spec.marks[0].trait` (`artifact.certify.ts:216`). **The encoding gate is the SOLE blocker.**

**Critic correction (load-bearing — do NOT take the naive "add an if/then that loosens" recipe):** `encoding` is `$ref`→EncodingMap with `minProperties:1`; AJV AND-composition means an `if/then` CANNOT *loosen* a base constraint. The mechanism must:
1. **Remove `minProperties:1` from the EncodingMap base** (`normalized-viz-spec.schema.json:145`).
2. **Re-impose it via `allOf`/`if-then` keyed on the CARTESIAN mark-trait allowlist** — so a cartesian IR (`marks[0].trait` ∈ the cartesian set) with empty encoding stays INVALID, and an ECharts-primary IR with empty encoding VALIDATES. Mirror certify's existing positive allowlist `CARTESIAN_VEGA_TRAITS` (`artifact.certify.ts:98`) — same philosophy, cartesian is the named set.
3. **Keep `required:[…,"encoding",…]` intact** (`:60`) — `encoding:{}` already satisfies the key's presence; only the `minProperties` cardinality is wrong.

**Both twins.** The schema exists as two byte-identical copies (grounding: `packages/viz-core/src/spec/normalized-viz-spec.schema.json` + `schemas/viz/…`, both 20346 bytes). Edit BOTH; regen types via `pnpm generate:schema-types` (the TS type in `normalized-viz-spec.types.ts` is hand-maintained, and the existing `as` cast already tolerates `{}`); the twin-parity test guards byte-identity. **Verify the exact twin path at build time** (locate both, confirm byte-identity before + after).

**#564: SAFE.** Validation-WIDENING only, MONOTONIC (only previously-rejected inputs now pass). No builder byte moves (the cartesian `spec-builder` always emits x+y and validates its own output, `spec-builder.ts:856`, so it can't emit empty encoding); no `echartsOption`; no `contentHash`; no golden. This CLOSES the hollow — producer output, shared schema, and certify input become mutually consistent — it does not relocate it.

---

### 3. Mandatory companion — carve the `contentHash` over-claim honest (the grounding's under-counted correction)

**1a alone does NOT make the whole round-trip claim true.** certify's ECharts path emits **NO `contentHash`** — `echartsContrastVerdict` (`artifact.certify.ts:149-163`) returns `determinism:'unchecked'` and no hash — whereas viz.render's `contentHash` is `sha256(canonicalize(echartsOption))` (`viz.render.ts:499`), computed over the ECharts option, NOT the `normalizedSpec`. So the `tool-descriptions.json:20` clause *"The contentHash matches viz.render's for the same IR, so an agent can round-trip render → certify"* stays **FALSE for all 8 ECharts types even after 1a**.

**Carve required, on all three surfaces that carry the claim:** `tool-descriptions.json:20`, `docs/api/artifact-certify.md`, `docs/api/README.md` — scope the `contentHash`-parity / round-trip clause to **cartesian-only**. 1a makes the *reachability* claim true (certify returns a verdict, not an error); this carve makes the *contentHash-parity* claim honest. **Both ship in m02** — the honesty floor is not discharged by reachability alone.

**Fold in the deferred s141-review #3b precision** into the same carve: the 8 ECharts `pillars.contrast` verdicts are **palette-level CONSTANTS** (invariant to the specific chart), distinct from the per-chart, override-aware cartesian grade. Distinguish "input-invariant palette-conformance constant" (8 ECharts) from "per-chart graded verdict" (5 cartesian) so "real verdict" is not over-read.

---

### 4. Honest framing — CLOSE, eyes-open

**m02 genuinely CLOSES the reachability hollow.** The emitted ECharts IR that errors today will validate and route to its real verdict; the `contentHash` over-claim gets carved honest. First structural close in the sub-arc that removes the wall rather than relocating the hollow.

**Eyes-open caveat (ratify in m01):** what 1a makes reachable is a **CONSTANT**. Closing the *reachability* hollow does not manufacture *signal* — certify stops erroring on its own output; it does not start discriminating (the 8 verdicts stay 5×`'pass'` / 3×`'exempt'`, none can vary or fail on a real chart). **Frame the win as "certify stops rejecting its producer's IR + stops lying about `contentHash` parity," NEVER "13/13 real coverage."** Sold as the former it is a legitimate honesty close; sold as the latter it is busywork. The real can-FAIL teeth (bubble-ordinal #2) are deferred, captured for a future arc (§7).

---

### 5. Mission spine (3 missions, strict Requires)

**m01 — Keystone decision memo (NO CODE) — Completed at sprint creation.** THIS file. Ratifies: the premise corrections (H3 was false — bubble color is the SpatialSpec/data branch, `viz.render.ts:678-680`, NOT the IR; `encoding:{}` is semantically correct for ECharts, so the schema is over-constrained); the INVERTED cartesian-scoped schema mechanism (§2); the MANDATORY `contentHash` carve + the constant-vs-per-chart precision (§3); the "1a surfaces a CONSTANT, not signal" framing (§4); #564-SAFE; Fork-1 = A (defer #2 teeth), Fork-2 = A (cartesian-scoped guard). Requires: none.

**m02 — 1a schema relaxation + mandatory contract carve + end-to-end honesty test.** Requires: m01.
- **Schema (both twins):** remove `minProperties:1` from the EncodingMap base (`:145`); re-impose via `allOf`/`if-then` on the cartesian mark-trait allowlist so cartesian empty-encoding stays invalid, ECharts empty-encoding validates; keep `required` intact. Regen types via `pnpm generate:schema-types`; twin-parity test green.
- **Contract carve (MANDATORY):** scope the `contentHash`/round-trip clause to cartesian-only on `tool-descriptions.json:20` + `docs/api/artifact-certify.md` + `docs/api/README.md`; fold in the constant-vs-per-chart precision. Regen `generated.ts` via `@oods/schemas-tools` + `generate:check` clean + `docs:api` clean.
- **Honesty test (the proof the s141 suite structurally lacks — every s141 certify test hand-authors a non-empty encoding, e.g. `artifact.certify.spec.ts:229-231,405-407,556-558`):** render a REAL sankey (categorical) + a REAL geo type via viz.render, feed the ACTUAL emitted `encoding:{}` `normalizedSpec` into certify, assert `contrast:'pass'` (sankey) / `'exempt'` (geo) + `status` is NOT error (no V126). Add a cartesian-empty-encoding → still-V126 test to lock the Fork-2 guard (the guard is currently untested — the sole empty-encoding→V126 path is the upstream builder, `viz-a11y-equivalence-emission.spec.ts:175`).
- **#564: SAFE** (validation-widening; no golden/hash/builder byte). Requires: m01.

**m03 — Closeout + two-layer reconnect live-verify.** Requires: m02.
- Full gate: `pnpm install --frozen-lockfile` (no dep), ROOT `pnpm typecheck` (the ChartType/schema-shim cross-package gate), `pnpm -r build`, full mcp-server vitest + colocated goldens (prove **byte-untouched** — no golden moved), `test:scale`, viz-core + viz-render, `generated.ts` regen + `generate:check`, `docs:api`. Confirm advertised set STILL **25**.
- Rebuild dist + `pm2 restart oods-forge-bridge` (mine) + `pkill -f packages/mcp-server/dist/index.js` so aquex respawns fresh (the s140/s141 two-layer gotcha; `:4466` is the authoritative fresh-dist probe). **Advertised-description reconnect IS required** — the `tool-descriptions.json:20` text moves (the carve).
- LIVE-VERIFY on BOTH `:4466` AND aquex: (a) render a real ECharts chart (sankey/treemap) with `includeNormalizedSpec`, feed the EMITTED `normalizedSpec` to certify → `contrast:'pass'` (**was OODS-V126 at HEAD** — the round-trip now reachable, live-reproduced); (b) a geo type emitted IR → `'exempt'`; (c) a cartesian emitted IR still validates + certifies unchanged (no regression); (d) confirm the advertised description now scopes the `contentHash`/round-trip claim to cartesian-only. Requires: m02.

---

### 6. Constraints

- **#525 (MCP-only):** no new tool; certify input stays permissive `{spec}`; advertised set STAYS **25**.
- **#110 (no scorer):** goldens byte-IDENTICAL, no regen; the honesty test feeds the REAL emitted IR.
- **#564 (additive):** validation-WIDENING only, monotonic; no rendered/golden/hash byte. certify is a LEAF; m02 touches the shared viz-core IR schema but **validation-only** (no output byte), so the leaf posture holds in spirit.
- **Determinism:** pure — no `Date`/random; the ECharts verdict is a compile-time constant of the palette.

---

### 7. Out of scope (frozen, with reasons)

1. **The bubble-ordinal #2 teeth (SEVERED — Derek Fork-1 A).** The arc's first can-FAIL ECharts verdict is real and reachable-today (`colorScale:'ordinal'` is an agent-pickable enum, `viz.render.input.json:235-236`; the bubble adapter cycles `DEFAULT_COLOR_RANGE` 3 sequential blues categorically → role-A + role-C fail, `echarts-bubble-adapter.ts:22-25,136,195`). BUT it needs a public IR-schema widening (color-scoped `scale:'ordinal'` + `range[]`, NOT the shared `TraitBinding` which `$ref`s all 6 channels `:138-143`) + a viz.render emit-change + grading the RESOLVED `resolveColor(range)` hexes (the coverage-inversion coupling hazard) — beyond the certify-leaf additive floor, with no proven consumer. Its own arc when a puller appears. Grounding: Scout C ships, Scout D defers; Derek deferred.
2. **Re-routing the geo adapter to read color from the IR** (true single-source emit-then-read) — moves rendered bytes/goldens.
3. **certify emitting a real ECharts `contentHash`** (actual round-trip contentHash-parity) — needs the geo data-branch input-schema change; s142 only carves the CLAIM honest.
4. **choropleth/flow_map teeth** — legitimately sequential → `'exempt'` is already correct, zero teeth.
5. **The s140-review `'unchecked'` disambiguation + 2 carry-notes; dark-theme (decision #1046); touching-mark adjacency; facet/concat builder-path fixtures; categorical-on-gradient mistype lint.**

Records: grounding `wf_36e36585-f15`; s141 review `PS-2026-07-04-004` (carry-forwards #1/#2); Derek forks (planning `PS-2026-07-04-005`).
