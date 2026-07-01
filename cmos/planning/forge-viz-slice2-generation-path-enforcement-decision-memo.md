# Forge Viz — Slice 2: generation-path enforcement — "accessible by construction" made TRUE on `viz.render` + `dashboard.render` Decision Memo

**Sprint:** 135 · **Status:** keystone (m01, NO CODE) · **Locked:** decision #990 (Derek-ratified 2026-06-30 via AskUserQuestion = "Gen-path enforcement, defer certify"; grounded + critic-verified via `wf_53736459-815` — 5 live-repo scouts → synthesist → 2 adversarial critics, BOTH verdict AMEND-THEN-LOCK, ZERO blockers, all amendments folded) · **North-star:** decision #977 · **Predecessor:** Slice 1 memo `cmos/planning/forge-viz-slice1-certify-at-emission-decision-memo.md` (its §8 froze this slice's hand-off)

This memo pins Slice 2 so m02–m05 execute **without re-grounding**. It is the contract a fresh build session reads. Every file:line anchor below was **re-verified against live source this session** (`wf_c663f1fb-eee`, 8 parallel scouts). Read §2 (the builder synthesis spec) before touching m02 and §5 (the gate) before m04. **Read §3 first — the one semantic correction (humanize is sentence-case, reuse verbatim).**

---

## 0. What this sprint adds (the thesis)

Slice 1 (s134) made the claim **measurable**: it wired the dormant 16-rule equivalence engine as a default-OFF SOFT-WARN and proved the claim was FALSE — **A11Y-R-05 (error, axis titles) fires on ~100% of default cartesian emissions** because the builder never synthesizes axis titles. Slice 1 also made determinism TRUE-by-construction (`contentHash` default-ON on both tools).

Slice 2's only job: make **"accessible by construction" literally TRUE** on `viz.render` + `dashboard.render` for the cartesian chart types, then **lock it with a gate.**

The ratified mechanism (Derek on-board) is **CONFORMANT-BY-CONSTRUCTION IN THE BUILDER**, not check-and-warn:

1. **The builder synthesizes the a11y features so DEFAULT output PASSES** every error-severity rule (m02 — the long pole). This is what makes the claim true.
2. **The gate is the cheap regression LOCK** after synthesis — flip the s134 forced-`warning` to error-severity **BLOCKING**, reading severity from the rule table (m04).
3. **Default-ON rides in WITH the synthesis** as ONE coherent golden regen (m03), gate-flip immediately after (m04).

Slice 2 adds **NO new MCP tool** — everything rides the existing `viz.render` / `dashboard.render` tools. The standalone `artifact.certify` tool is **re-sliced to s136** (§8 — this re-partitions the s134 memo §8, which named certify as "Slice 2").

---

## 1. The pinned calls (Derek-ratified 2026-06-30, #990)

| # | Call | Rationale |
|---|------|-----------|
| C1 | **Conformant-by-construction in the builder, THEN gate** | The builder synthesizes titles/description/ariaLabel/column-order so default output passes; the gate is the regression lock, not the fix. A gate without synthesis would reject ~all valid output (Slice 1 proved this). |
| C2 | **Severity from the RULE TABLE, never the warn namespace** | m04 reads `RuleDefinition.severity` (`equivalence-rules.ts:27`, surfaced on `VizA11yRuleResult` at `:12`/`:48`), NOT the s134 forced-`'warning'` at `viz.render.ts:201`. The s134 soft-warn FORCES `severity:'warning'` on every failing rule — deriving the gate from that namespace would treat error rules as warnings. |
| C3 | **Do NOT call `assertVizEquivalence`** | It throws (`equivalence-rules.ts:64`) → caught at `viz.render.ts:300` → coerced to `OODS-V129`, **losing per-rule codes**. m04 partitions `validateVizEquivalenceRules(...)` results by `rule.severity` and preserves each `OODS-A11Y-<rule.id>` code. |
| C4 | **Default-ON opt-OUT** | Flip the `a11yEquivalence` default `false`→`true` on both inputs; `set false` to opt out for agent-supplied non-conformant specs. |
| C5 | **No scorer-term change** (#110) | No change to `suggestPatterns`/`scorePattern`/`toSchemaIntent`; `autoAssignEncodings` field-selection untouched (m02 only ADDS titles to bindings it already produces). Recommender goldens stay green. |
| C6 | **No new tool; rides existing tools** | `registry.json` auto/onDemand unchanged. `artifact.certify` remains a **s136** candidate. |
| C7 | **Cartesian-only holds automatically** | `isEChartsPrimaryType` short-circuits at `viz.render.ts:79` before the Vega equivalence check — the 8 ECharts-primary types (treemap, sunburst, sankey, force_graph, choropleth, bubble_map, flow_map, chord) are never gated. Carried forward from s134. |

**Spine (strict `Requires` m01→m02→m03→m04→m05):** memo → builder synthesis → flag-flip + golden regen → gate-flip + parity tests → closeout.

---

## 2. m02 — builder synthesis in viz-core (the long pole) — default cartesian specs PASS every error-severity rule

**Goal:** make every DEFAULT cartesian emission from `assembleSpec` (`packages/viz-core/src/builder/spec-builder.ts:797`) PASS all error-severity equivalence rules. `assembleSpec` is the SINGLE injection site — `buildExplicit` (call at `:649`), `buildSuggested` (`:718`), `buildFromIntent` (`:406`) ALL funnel through it. In all three modes `encoding` is a freshly-built object (`normalizeEncodings` for explicit; `autoAssignEncodings` for suggest/intent), so **mutating bindings in place is safe.** Do NOT edit `binding()` (`:771`, never sets title) or `normalizeEncodings` (def `:841`; the caller-title-copy is `:862` — `...(value.title ? { title: value.title } : {})`).

Today `assembleSpec` (spec object literal at `:806-814`) sets only `name: input.name ?? CHART_TYPE_LABEL[chartType]` (`:809`) and `a11y: { description }` (`:813`) — **no `ariaLabel`, no `portability`** (grep-confirmed zero occurrences in the file). The description is picked at `:802-804` (`input.description?.trim()` else `synthesizeDescription`). `assertNormalizedVizSpec(spec)` runs at `:818`.

**LOAD-BEARING SAFETY (verified):** `assertNormalizedVizSpec` validates against the **runtime JSON schema** `packages/viz-core/src/spec/normalized-viz-spec.schema.json` via AJV (`strict:false`), NOT the TS type. That schema **already permits** every field m02 synthesizes:
- `TraitBinding.title` → schema `:221` (`"title": {"type":"string"}`); TS type `normalized-viz-spec.types.ts:152`.
- `AccessibilitySpec.ariaLabel` → schema `:438`; TS type `:341`.
- top-level `portability` → schema `:56` → `PortabilitySpec.tableColumnOrder` schema `:473` (`array` of `string`); TS type `:356`.

So m02's synthesis keeps `assertNormalizedVizSpec` **green**.

### STEP 1 — ADD `humanize` to the EXISTING shared helper (⚠️ critic amendment (a))

`packages/viz-core/src/a11y/format.ts` **ALREADY EXISTS** (exports `formatNumeric`, `formatPercent`, `formatValue`, `formatDimension`; imported by `table-generator.ts:4` and `narrative-generator.ts:8`). It has **no** `humanize`. **ADD** `humanize` to it (an `export function`); **do NOT Write a new file** — a Write clobbers the four format helpers the a11y engine depends on.

The two existing `humanize` copies — `narrative-generator.ts:314-321` and `table-generator.ts:215-222` — are **BYTE-IDENTICAL** (diff-verified). Move the transform verbatim into `format.ts`, delete both copies, and re-import from `format.ts` in BOTH files so **axis title == narrative label == table column label** (any drift = screen-reader mismatch).

⚠️ **SEMANTIC PIN (see §3): the existing `humanize` is SENTENCE-CASE, not Title Case.** It replaces `_`/`-` with spaces, inserts a space at camelCase boundaries, collapses whitespace, trims, then uppercases **only the first character** — e.g. `total_revenue → 'Total revenue'`, `grossMargin → 'Gross margin'`. **Reuse it verbatim.** Do NOT "upgrade" it to full Title Case — that would re-byte narrative/table output beyond the a11y-key additions and break the byte-identical dedup contract.

### STEP 2 — R-05 axis titles (error; `equivalence-rules.ts:146-158`)

R-05 passes only when, for each PRESENT x/y binding, `binding.title` is a non-empty trimmed string. In `assembleSpec`, BEFORE building the spec literal (or before `assertNormalizedVizSpec` at `:818`), walk encoding channels **x, y, and color** (color for legend/table label parity) and for each present binding whose `title` is absent or empty-trimmed, set `binding.title = humanize(binding.field)`. This covers all three modes and fixes both the auto paths (`binding()` never sets title) AND explicit specs the caller under-specified.

### STEP 3 — R-08 description ≥ 25 chars (error; `equivalence-rules.ts:192-199`)

R-08 reads `spec.a11y.description.trim().length >= 25`. `synthesizeDescription` (`:821-839`) is byte-deterministic but undershoots on short field names — e.g. scatter with `x='a'`, `y='b'` yields `'Scatter plot of b by a.'` = **23 chars** (verified). AFTER the resolved-description pick (`:802-804`, so it covers BOTH the synthesized branch AND a sub-25 caller override): if the resolved description trims to `<25`, append a deterministic clause (e.g. `' Showing ' + humanize(x) + ' against ' + humanize(y) + '.'`, or an accessible-table availability sentence). Pure function of chartType + field names — **no Date, no random.**

**Reconcile with the below-envelope test** `packages/viz-core/test/spec-builder.spec.ts` (path: `test/`, NOT `src/builder/`): `:106` `.toBe`-asserts the exact caller override `'Quarterly revenue per region.'` (`:104`) = **29 chars ≥ 25**, so it is NOT padded and stays green. `:50` asserts `description.length > 0`; `:95-96` `.toContain('revenue')`/`.toContain('region')` — all stay green. Update the test ONLY if a genuine sub-25-override case exists (none today).

### STEP 4 — R-09 aria-label (error; `equivalence-rules.ts:201-214`)

R-09 passes via `spec.a11y.ariaLabel?.trim()` OR `spec.name?.trim()`. It passes TODAY via `name` (`:809` sets `name = input.name ?? CHART_TYPE_LABEL[chartType]`), but a caller passing `name:''` breaks it. Belt-and-suspenders: set `a11y.ariaLabel` deterministically in the spec literal — e.g. `` `${CHART_TYPE_LABEL[chartType]} of ${humanize(y)} by ${humanize(x)}` `` with graceful fallback when x/y absent. `AccessibilitySpec.ariaLabel` is schema-valid (schema `:438`, type `:341`).

### STEP 5 — R-14 `tableColumnOrder` (WARN — non-blocking; `equivalence-rules.ts:276-293`, id at `:277`, severity `:279`)

R-14 fails when a `>2`-column table has no `portability.tableColumnOrder`. In-scope as cheap conformance polish (the memory banner names "builder R-05/R-14 synthesis"). Set `spec.portability.tableColumnOrder` = encoding fields in `[x, y, color, size, shape, detail]` order (present, deduped) followed by remaining `Object.keys(firstRow)` in encounter order. This matches `deriveColumns` (`table-generator.ts:153`, called `:126`, columnOrder read at `:100`): it puts columnOrder-listed fields first, then remaining discovered keys in encounter order. **Guard: only when `portability` is absent (caller override wins) AND the first row has `>2` keys.**

⚠️ **EXPECTED SIDE-EFFECT (critic amendment, not a data bug):** setting `portability.tableColumnOrder` feeds `deriveColumns`, so the accessible-TABLE column order **re-orders** for cartesian specs whose encoding-channel order differs from row-key encounter order (e.g. rows `[{revenue, region}]` with `x=region, y=revenue` → table columns flip from `[revenue, region]` to `[region, revenue]`). This is the point of R-14; the m03 fidelity diff will show table-column reordering — expected.

### Determinism contract & scope fence

Every synthesized value is a pure function of `chartType` + field names + row keys — **no Date, no random, no UUID.** No change to `suggestPatterns`/`scorePattern`/`toSchemaIntent` (#110); `autoAssignEncodings` field-selection untouched. Confirm the adapters honor synthesized titles without double-labeling: `vega-lite-adapter.ts:243` (`if (binding.title) definition.title = binding.title`) and `echarts-adapter.ts:452` (`name: binding.title`). Verify against BUILT dist: `pnpm --filter @oods/viz-core run build`, then probe `validateVizEquivalenceRules(buildVizSpecFromRows(...).spec)` for bar/line/area/scatter/heatmap in BOTH suggest and intent modes → ZERO error-severity failures (R-14 warn should also pass). **Do NOT regenerate goldens here — that is m03** (kept coherent).

---

## 3. ⚠️ The one semantic correction m02 MUST read — `humanize` is SENTENCE-CASE

The mission text (m01/m02 objectives) loosely says "snake/camel → **Title Case** `humanize` transform." **The existing `humanize` we are deduping is SENTENCE-CASE** (uppercases only the first character): `total_revenue → 'Total revenue'` (NOT `'Total Revenue'`). Since m02 MOVES the byte-identical existing function into `format.ts` and re-imports it (so narrative/table/axis all agree), the synthesized axis titles and ariaLabels are **sentence-case**. Do NOT write a new Title-Case transform: it would (a) break the byte-identical dedup and (b) re-byte narrative + table snapshots beyond the intended a11y-key additions. Every "humanize" in this memo means the existing sentence-case function.

---

## 4. Severity source & the wire code (pin for m04)

- **Severity source = the rule table.** `RuleDefinition.severity` (`equivalence-rules.ts:27`) is surfaced on `VizA11yRuleResult` (`:12`, and set at `:48`). Error-severity rule ids (11): **A11Y-R-01, -02, -03, -04, -05, -06, -08, -09, -10, -12, -15**. Warn-severity ids (5): **A11Y-R-07, -11, -13, -14, -16**. (Enumerated + confirmed against the `RULES` array this session.)
- **Rule id prefix is `A11Y-R-NN`** (all 16 carry the `A11Y-R-` prefix). The handler formats `` `OODS-A11Y-${rule.id}` `` → the code is the **DOUBLED literal `OODS-A11Y-A11Y-R-05`** (verified at `viz.render.ts:199`). This is intentional and reversible-to-the-rule — neither the builder nor a test author should "correct" it.

---

## 5. m04 — the gate (error-severity BLOCKING) + dashboard filter + coverage-parity tests

### viz.render gate (`packages/mcp-server/src/tools/viz.render.ts:195-216`)

Today (s134): a soft-warn block (`:195-203`) maps every failing rule to `{code: `OODS-A11Y-${rule.id}`, message: rule.message ?? rule.summary, severity: 'warning' as const}` (forced `'warning'` at `:201`), merged into `warnings` at `:216`. m04 replaces the forced map with a **partition by `rule.severity`**: warn-severity → `warnings[]` as today; error-severity → **BLOCK**. Because `errorOut` (`:802`) takes a SINGLE code, add a small helper returning `{status:'error', spec:{}, warnings:[...fieldWarnings, ...a11yWarnings], errors: a11yErrors.map(r => ({code: `OODS-A11Y-${r.id}`, message: r.message ?? r.summary, severity:'error'})), output}` to **PRESERVE per-rule codes** (do not collapse to one; do NOT call `assertVizEquivalence` — it coerces to `OODS-V129`). The output schema already permits `OODS-A11Y-*` in `errors[]` (`viz.render.output.json` `$defs.issue`: `code` type `string` no-pattern at `:244`, `severity` enum `['error','warning']` at `:248`; no registry entry needed). Cartesian-only holds via the `:79` short-circuit.

### dashboard.render gate (`packages/mcp-server/src/tools/dashboard.render.ts`)

The `status !== 'ok'` seam at `:579` AUTOMATICALLY blocks a per-panel equivalence error (per-panel `viz.render` now returns `status:'error'` with an `OODS-A11Y` code) → it builds a `kind:'error'` panel reading `out.errors?.[0]` (`:580`), incrementing `errorPanelCount`. Verify it surfaces the `OODS-A11Y` code, not `V129`.

The fold at `:606-614` runs ONLY on `status:'ok'` panels (after the `:579` diversion). ⚠️ **critic amendment (a):** today the loop (`:607` `for (const w of out.warnings)`) folds ALL per-panel `out.warnings` **unfiltered** — it is a11y-only only BY CONSTRUCTION (the comment at `:602-604`: `buildPanelVizInput` forwards the flag but never `strictFields`). m04 must **partition by code prefix** (`w.code.startsWith('OODS-A11Y-')`) and **PRESERVE `w.severity`** (stop forcing `'warning'` at `:611`), **folding a11y IN ADDITION TO — not INSTEAD OF — the existing pass-through** so no non-a11y per-panel field warning is dropped (avoids a #564 fold-path regression). Since error-severity now diverts at the panel level, the surviving folded warnings are warn-severity and stay in `warnings[]`. Confirm `buildPanelVizInput` (`:893`) forwards `a11yEquivalence` under the new default. **NEVER parse severity from the prefixed message** — read `w.severity` from the per-panel output.

**ACCEPTABLE single-code limitation (state it so it is not mistaken for a lost-code bug):** the dashboard per-panel error placeholder reads only `out.errors?.[0]` (`:580`), so a panel tripping MULTIPLE error rules shows just the first `OODS-A11Y` code (viz.render's own `errors[]` still carries all). Matches existing single-code panel behavior.

### Coverage-parity tests

Add `packages/mcp-server/test/tools/dashboard-a11y-equivalence-emission.spec.ts` (mirror the viz sibling `test/tools/viz-a11y-equivalence-emission.spec.ts`; root-included via `packages/mcp-server/vitest.config.ts:5` `include: ['test/**/*.spec.ts', ...]` — **NOT** colocated, so NO `ci.yml`/guard touch; do not use `test/scale/` or a `_probe` prefix). Cover:
1. **dashboard contentHash parity** — same input → identical `contentHash`; one-field mutation → different `contentHash`; and the **ERROR-PATH ASYMMETRY**: `dashboard.render.handle` never returns `status:'error'` (always `status:'ok'` at `:663`) and STILL sets `contentHash` (`:728`) — assert an error-panel dashboard is `status:'ok'` AND carries a `contentHash`, the **opposite** of viz's omit-on-error (`viz-a11y-equivalence-emission.spec.ts:159`). Comment the asymmetry so it is not "fixed."
2. **a11y fold** — flag ON over ≥2 cartesian panels surfaces `OODS-A11Y-*` prefixed `panel "<id>": `; an ECharts/geo panel no-ops even with flag ON; flag OFF keeps `warnings[]` AND `contentHash` byte-identical (#564 additive floor).
3. **GATE regressions** — default cartesian emission (post-m02) passes ALL error-severity rules (reuse `ERROR_RULE_IDS` from the viz sibling); an agent-supplied non-conformant spec (explicit encodings with a title-less axis + `name:''`) returns `status:'error'` with the `OODS-A11Y-A11Y-R-05` code; `a11yEquivalence:false` opts out (byte-identical pre-gate); warn-severity rules never block.

Also **INVERT** the existing viz sibling's R-05-FIRES-on-default regressions (`viz-a11y-equivalence-emission.spec.ts:49-66`) to **R-05-PASSES** now that the builder is conformant, and add same-input/mutation `contentHash` assertions. Run `pnpm --filter @oods/mcp-server exec vitest run` → both specs green.

---

## 6. m03 — flip `a11yEquivalence` default-ON + regenerate the golden inventory (coherent with m02)

### Flag flip (default-ON opt-OUT)

- `packages/mcp-server/src/schemas/viz.render.input.json` — the `a11yEquivalence` KEY is at `:307`, its `"default": false` at **`:309`**, description at `:310`. Flip `:309` `false`→`true`; rewrite the description (drop `'SOFT-WARN ONLY'`/`'never gates'`; state "error-severity equivalence rules BLOCK (`status:'error'`); set `false` to opt out for agent-supplied non-conformant specs").
- `packages/mcp-server/src/schemas/dashboard.render.input.json` — KEY at `:81`, `"default": false` at **`:83`**, description at `:84`. Same flip + rewrite (error panel; set `false` to opt out).
- Runtime defaults that read the flag: `dashboard.render.ts:69` (`wantA11yEquivalence = input.a11yEquivalence ?? false` → `?? true`) + `buildPanelVizInput` forwarding (`:893`); confirm `viz.render.ts` relies on the schema default / `?? true` consistently.
- ⚠️ **`json-schema-to-typescript` IGNORES `'default'`** — a bare default flip does NOT change `generated.ts` (`generate:check` will NOT drift, no regen). It IS an **advertised-schema change** requiring a bridge rebuild + reconnect (m05). If a NEW property were added, `generated.ts` would need regen — none is planned.

### Golden regen (the #564 boundary intentionally crossed)

⚠️ **critic amendment (a):** the fidelity-snap re-byte is driven by the **UNCONDITIONAL m02 builder synthesis** (title/ariaLabel/description/tableColumnOrder are ALWAYS emitted regardless of the `a11yEquivalence` flag), NOT by the flag flip — goldens change even for `handle()` calls that never set the flag. Do not attribute the diff to the gate.

**REGEN PROCEDURE (no dedicated script):** goldens import BUILT `@oods/viz-core` dist (resolved via viz-core's own `package.json` `exports`/`main` → `./dist/...`; `@oods/viz-core` dep in mcp-server `package.json` `:35`), so **build first**:
```
pnpm run build:tokens && pnpm run build:packages
pnpm --filter @oods/mcp-server exec vitest run -u src/tools/viz.render.fidelity.test.ts src/tools/dashboard.render.fidelity.test.ts
```
(`build:tokens` = root `package.json:70`; `build:packages` = `:79`.)

**RE-BYTES:**
- `packages/mcp-server/src/tools/__snapshots__/viz.render.fidelity.test.ts.snap` — **ALL 6 exports** (area `:3`, bar `:77`, heatmap `:151`, line `:234`, scatter `:312`, suggest-mode pick `:392`) — each gains `encoding.x/y.title` + `portability.tableColumnOrder` + enriched a11y + shifted `contentHash`.
- `packages/mcp-server/src/tools/__snapshots__/dashboard.render.fidelity.test.ts.snap` — **3 of 4 exports**: metric-overview payload (`:43`), period-axis payload (`:414`), and the `output.html` SVG export (`:12`, re-lays-out on new explicit axis titles). The **a11yContrast export (`:3`) must NOT re-byte** (regen BY FILE so all exports catch at once).

**NOT re-byted (confirm untouched):** `packages/viz-core/test/__snapshots__/golden-echarts-options.spec.ts.snap` (8 exports), `.../golden-profiles.spec.ts.snap` (5), `packages/mcp-server/src/tools/__snapshots__/viz.render.geo-fidelity.test.ts.snap` (3), `.../viz.render.network-fidelity.test.ts.snap` (5), `packages/viz-core/test/__snapshots__/dashboard-layout.spec.ts.snap` (3), `packages/viz-render/test/__snapshots__/emitter.spec.ts.snap` (1).

**REVIEW the diff:** confirm it is ONLY the new a11y keys (title/ariaLabel/tableColumnOrder/description) + SVG relayout + shifted `contentHash` — NOT accidental data changes. `contentHash` (s134, `viz.render.ts:297`/`:514`; `dashboard.render.ts:728`) legitimately shifts because emitted bytes changed. Then run the FULL colocated golden step WITHOUT `-u` (`ci.yml:614-615` verbatim) so the other 10 files + `ci-golden-list.guard` pass. Run `pnpm --filter @oods/mcp-server run test:scale` (viz/dashboard-determinism are self-relative `a===b`, pass without regen).

⚠️ **critic amendment (b):** the default-ON flip NEWLY subjects ALL DIRECT-`handle()` colocated tests to the gate (handle() bypasses AJV `useDefaults`, so the runtime fallback becomes `?? true`) — in particular `dashboard.render.test.ts:38-39` (line + bar chart panels) and the `errorPanelCount==0` assertions (`dashboard.render.test.ts:389`/`:461`) now depend on m02 conformance holding for BOTH line AND bar panels. Call these out as **must-stay-green** (verify, don't merely assume "the golden step passes").

---

## 7. m05 — closeout (full cross-package gate + two-layer reconnect)

Per the `forge-closeout-gate-sweep` memory, from repo root:
1. `pnpm install --frozen-lockfile` (lockfile-drift guard).
2. ROOT `pnpm typecheck` (`tsc --noEmit`) — catches `src/viz` `ChartType` consumers via the shim that per-package tsc misses.
3. `pnpm --filter @oods/schemas-tools generate:check` — MUST be clean; a bare default flip does NOT drift `generated.ts` (no-op confirmation, not a regen).
4. Full build: `pnpm -r build` (or at minimum `@oods/viz-core` then `@oods/mcp-server`) so the `src/viz` shim + built dist are consistent.
5. Default suite: `pnpm --filter @oods/mcp-server exec vitest run` (new dashboard parity spec + inverted viz regressions) AND the colocated golden step (`ci.yml:614-615` verbatim).
6. `pnpm --filter @oods/mcp-server run test:scale` (self-relative determinism, stays green).
7. `docs:api` ONLY if a tool set / input-output schema DESCRIPTION changed — the `a11yEquivalence` description DID change in m03 → regenerate the API reference (root `docs:api`).

**Two-layer reconnect (mine, per `pm2-bridge-restart-is-mine` + `aquex-hub-runtime`):** m03 changed the ADVERTISED input-schema default (agents read it at connect-time from dist). After building: `pm2 restart oods-forge-bridge`, confirm the advertised default via the `:4466` bridge (POST /run or the manifest) and an aquex reconnect. Confirm **NO NEW TOOL**: `registry.json` auto/onDemand unchanged; `ls packages/mcp-server/src/tools | grep certify` empty; `artifact.certify` remains a s136 candidate.

Record sprint close with completion rate + the s136 hand-off (§8). Dated commit + lockfile/dist commits are Derek's domain.

---

## 8. The RE-SLICE record + s136 hand-off (FROZEN here)

⚠️ **RE-SLICE (critic amendment (c)) — state it so a fresh session reading BOTH memos does not treat certify as an s135 deliverable:** the s134 memo §8 (`:109-114`) named `artifact.certify` AS "Slice 2" with "ONE new `artifact.certify` tool." **s135 re-partitions:** s135 IS "Slice 2 (generation-path enforcement)" — builder synthesis + gate + default-ON. `artifact.certify` is pushed to **s136.**

**s136 starting contract (by reference to the s134 memo §8 + this memo):**
- **IR-first `artifact.certify`** — certify a Forge `UiSchema` / typed viz spec (NOT free-text React/HTML — that is parser-back-to-IR, OUT until the IR path is proven).
- **Reuse `validateVizEquivalenceRules` verbatim** — NO throw; returns `conformant: boolean` (+ the per-rule results). Reuse `contrastRatio` / `canonicalize`+`sha256`.
- **Sequencing win:** `conformant:true` is now REACHABLE on default builder output because m02 made defaults conformant — certify over a Forge-generated spec passes by construction.

The NL→viz free-text + dimension-registry carry-forwards remain **stashed/reverted** (`stash@{0}`); NOT s135/s136 scope unless re-ratified. `purity.audit` + `vrt.run` stubs remain OUT (deprecate-in-place).

---

## 9. Held constraints (every mission)

- **#564** additive floor: `a11yEquivalence` default-ON but error rules only BLOCK genuinely non-conformant specs (default builder output is conformant post-m02); flag OFF keeps `warnings[]` + `contentHash` byte-identical; the below-envelope determinism goldens stay byte-identical (they call the builder/adapters directly, never the handler).
- **#110 / no scorer change:** no `suggestPatterns`/`scorePattern`/`toSchemaIntent` edit; `autoAssignEncodings` field-selection untouched.
- **#525 MCP-only consumer:** no Workbench/external-pull/hosted assumptions.
- **Determinism:** no Date/random/UUID in synthesized values.
- **Two-layer + full cross-package closeout** (m05).
- **Per-mission native-learning HARD capture** via single-string `cmos_session` capture (NOT the stripped `cmos_mission_transition` `decisions[]`).
- **pm2/bridge restart is mine** (m05), never handed to Derek.

---

## 10. Verified anchors (live source, this session — `wf_c663f1fb-eee`)

| Anchor | File:line | Note |
|---|---|---|
| Rule engine entry (non-throwing) | `packages/viz-core/src/a11y/equivalence-rules.ts:36` | ✓ |
| `assertVizEquivalence` (throws on error-sev) | `equivalence-rules.ts:64` | ✓ do NOT use |
| `RuleDefinition.severity` / result severity | `equivalence-rules.ts:27` / `:12`,`:48` | ✓ severity source |
| R-05 axis titles (error) | `equivalence-rules.ts:146-158` | ✓ |
| R-08 description ≥25 (error) | `equivalence-rules.ts:192-199` | ✓ reads `spec.a11y.description` |
| R-09 aria-label (error) | `equivalence-rules.ts:201-214` | ✓ (id `:202`, sev `:204`) — was pinned 202-209 |
| R-14 tableColumnOrder (warn) | `equivalence-rules.ts:276-293` | ✓ id `:277`, sev `:279` — was pinned `:276` |
| Rule id prefix = `A11Y-R-NN` → doubled `OODS-A11Y-A11Y-R-05` | `viz.render.ts:199` | ✓ intentional |
| `assembleSpec` (single injection site) | `spec-builder.ts:797` | ✓ |
| assembleSpec call sites (3 modes) | `spec-builder.ts:649` / `:718` / `:406` | ✓ defs 638/685/314 |
| Spec object literal (name `:809`, a11y `:813`, no ariaLabel/portability) | `spec-builder.ts:806-814` | ✓ |
| Description pick | `spec-builder.ts:802-804` | ✓ |
| `assertNormalizedVizSpec` call | `spec-builder.ts:818` | ✓ AJV vs `.schema.json` |
| `synthesizeDescription` (23-char scatter undershoot) | `spec-builder.ts:821-839` | ✓ |
| `CHART_TYPE_LABEL` map | `spec-builder.ts:233-247` | ✓ |
| `binding()` never sets title / `normalizeEncodings` title-copy | `spec-builder.ts:771` / def `:841`, copy `:862` | ✓ do NOT edit |
| Runtime schema permits title/ariaLabel/tableColumnOrder | `normalized-viz-spec.schema.json:221`,`:438`,`:56`→`:473` | ✓ **load-bearing** |
| TS types: title/ariaLabel/tableColumnOrder | `spec/normalized-viz-spec.types.ts:152`/`:341`/`:356` | ✓ path is `src/spec/` |
| `format.ts` exists (4 format fns, NO humanize) | `packages/viz-core/src/a11y/format.ts` | ✓ ADD humanize here |
| humanize copies (BYTE-IDENTICAL, sentence-case) | `narrative-generator.ts:314-321`, `table-generator.ts:215-222` | ✓ §3 |
| format.ts imports | `table-generator.ts:4`, `narrative-generator.ts:8` | ✓ |
| `deriveColumns` (column order) | `table-generator.ts:153` (call `:126`, order `:100`) | ✓ R-14 parity |
| viz.render soft-warn region / forced `'warning'` | `viz.render.ts:195-216` / `:201` | ✓ m04 partition here |
| `errorOut` (single code) | `viz.render.ts:802` | ✓ add multi-code helper |
| cartesian-only short-circuit | `viz.render.ts:79` | ✓ |
| contentHash (Vega / ECharts) | `viz.render.ts:297` / `:514` | ✓ shifts legitimately |
| dashboard fold (raw code `:609`, msg prefix `:610`, forced sev `:611`) | `dashboard.render.ts:606-614` | ✓ filter-by-code + preserve sev |
| dashboard status≠ok seam / reads `out.errors?.[0]` | `dashboard.render.ts:579` / `:580` | ✓ single-code limit |
| `wantA11yEquivalence ?? false` | `dashboard.render.ts:69` | ✓ flip to `?? true` |
| `buildPanelVizInput` forwards flag | `dashboard.render.ts:893` | ✓ |
| handle always `status:'ok'` / contentHash | `dashboard.render.ts:663` / `:728` | ✓ error-path asymmetry |
| `a11yEquivalence` flag (viz) key/default/desc | `viz.render.input.json:307`/`:309`/`:310` | ✓ flip `:309` |
| `a11yEquivalence` flag (dashboard) key/default/desc | `dashboard.render.input.json:81`/`:83`/`:84` | ✓ flip `:83` |
| output issue: code (no pattern) / severity enum | `viz.render.output.json` `$defs.issue:244`/`:248` | ✓ permits OODS-A11Y |
| viz sibling test: R-05 FIRES / error omits contentHash | `test/tools/viz-a11y-equivalence-emission.spec.ts:49-66` / `:159` | ✓ invert to PASSES |
| below-envelope builder test (override 29 chars) | `packages/viz-core/test/spec-builder.spec.ts:50,95-96,99-106` | ✓ path is `test/` |
| root-included non-colocated glob | `packages/mcp-server/vitest.config.ts:5` | ✓ new parity spec |
| adapters honor synthesized title | `vega-lite-adapter.ts:243`, `echarts-adapter.ts:452` | ✓ no double-label |
| fidelity snaps (viz 6 / dashboard 3-of-4) | `.../viz.render.fidelity.test.ts.snap` / `.../dashboard.render.fidelity.test.ts.snap` | ✓ §6 |
| colocated golden CI step | `.github/workflows/ci.yml:614-615` | ✓ |
| regen build scripts | root `package.json:70` (`build:tokens`), `:79` (`build:packages`) | ✓ |
