# Forge Viz — Sprint-149 Decision Memo (SSOT)

## Meridian F6a–d export/theme seams + banked viz-craft cleanups

**Status:** LOCKED 2026-07-07 · **Planning session:** PS-2026-07-07-003 · **Grounded by:** wf_1ada70d0-8f8 (5 scouts vs HEAD → synthesist → adversarial critic; verdict **AMEND-THEN-LOCK, 0 blockers**, 5 amendments folded, all findings verified to reproduce at HEAD 19b7625 with **no s144–s148 no-ops**). **HEAD at grounding:** 19b7625.

This memo is the single source of truth. A build session executes m02→m10 from here **without re-grounding**. m01 is completed-at-creation (freeze-before-compute, decision #790).

Derek-ratified this session (AskUserQuestion): direction+scope = **F6a–d + fold banked cleanups**; **F6a = span-derived dimensions (Approach B)**; **F6b = suppress the phantom trend (reverse s113 seam (i))**; **F6d = reproduce-first, fix the COLOR-channel binding if real (never lower the a11y bar)**. Minor #832 fork defaulted to the **annotate** option (safer).

Constraints every mission holds: **#564** (rendered bytes / goldens / contentHash move only under a declared OWNED regen), **#525** (MCP-only, tool set stays 25 / 19-raw, NO new tool, NO schema field), **#110** (artifact.certify stays a pure reader — no scorer), **determinism** (pure fns, byte-stable), **#115** (agent-use-first, advertised via JSDoc prose since there is no schema change).

---

## §1 — The #564 split (load-bearing)

**Byte-movers (declared OWNED regen, disjoint surfaces — critic-verified):**
- **F6c** → `viz.render.fidelity.test.ts.snap`, the **heatmap export ONLY** (axisY.grid true→false).
- **F6a** → `dashboard.render.fidelity.test.ts.snap`, the **`output.html export (sprint-115 m05)` export ONLY** (the two chart-panel `<svg>` blocks). The `sprint-113 m06` composed-payload JSON exports and the contrastScan export are `{panels,layout}` with NO SVG and MUST NOT be regenerated.
- **F6b** → the `trendDirection` **assertions** in `dashboard.render.faostat-e2e.test.ts` + `dashboard.render.strict-fields.test.ts` (behavior reversal; the `.snap` does NOT churn — those KPIs carry a comparison basis).
- **F6d fork-C (CONDITIONAL)** → IF it reproduces, fixing `resolvePrimaryBindings` moves the heatmap narrative bytes = an OWNED narrative-golden regen. Default is a does-not-reproduce record in OOS.

**Everything else is zero-golden** (proven, not asserted): `#853a`'s `range:[]` path is AJV-unreachable via MCP (schema `minItems:2`) so no fidelity golden exercises it; V145 (#853b) is a warning NOT in contentHash (hashes are over the compiled spec at **viz.render.ts:537 `canonicalize(spec)` / :756 `canonicalize(echartsOption)`** — NOT the warnings array, and NOT line 385 which is only the spec assignment); `#853c`/`#864·869`/`#822` are test-only; `#842`/`#832` are CI/test-config. **contentHash/specRef never move** for any mission (dashboard hashes `{panels,layout}` at dashboard.render.ts:726/734 NOT `result.html`).

---

## §2 — Findings (all reproduce at HEAD 19b7625; critic-verified)

### F6c — baked theme stripes MarkRect heatmaps with axisY gridlines (byte-mover)
`resolveOodsVegaConfig(spec)` returns a hardcoded `axisY:{grid:true}` (oods-vega-config.ts:65-66 interface, :168 return) mark-agnostically; toVegaLiteSpec spreads it into the top-level `config` (vega-lite-adapter.ts:110, :129-132), so a MarkRect heatmap over a band y-scale draws horizontal rules (#E9ECEF, `--oods-sys-border-subtle`) through the cells. heatmap == MarkRect (spec-builder.ts:229; vega-lite-adapter.ts:19). Golden proof: viz.render.fidelity.test.ts.snap heatmap export has `mark:{type:'rect'}` + `axisY:{grid:true}`. s144 created this AFTER the 2026-07-05 finding; **no incidental fix**.
**Seam:** in resolveOodsVegaConfig (it already receives the full spec), add `const rectOnly = spec.marks.length > 0 && spec.marks.every(m => m.trait === 'MarkRect');` and emit `axisY:{grid: rectOnly ? false : true}`. Widen ONLY `axisY.grid` literal `true`→`boolean` (axisX stays `false`). Use `.every` NOT `.some`. **Tripwire that MUST stay green:** vega-lite-adapter.spec.ts:139-140 asserts `axisY.grid===true` on a **BAR** fixture — a rect-only `.every` guard leaves it untouched (do not touch axisX or the bar path).

### F6a — dashboard output.html sizes chart SVGs ignoring grid span (byte-mover) → **Approach B**
When output.html=true, dashboard.render.html.ts:202 calls `renderVegaLiteToSvg(panel.spec, {tokens})` — no width/height; the SVG keeps Vega's intrinsic step-based (narrow) width + default (tall) height. The span (p.w/p.h) is read only for the outer `<figure>` grid placement (gridStyle 331-334); styleBlock (349-370) has **no svg selector**. Golden proof: dashboard.render.fidelity.test.ts.snap 6-col panels emit `<svg width=202 h=389>` and `<svg width=182 h=397>`. (The finding's 221×373 drifted to 202×389/182×397 via s144/s146 chrome+palette — the span-agnostic **mechanism** is verbatim.)
**Seam (Approach B, ratified):** derive a target width/height from the grid span (p.w/columns × a nominal dashboard px width; p.h for height — the placement data is in hand at dashboard.render.html.ts:192) in renderPanelCell; thread a **new additive `{width,height}` option** through renderVegaLiteToSvg (emitter.ts:43-64) and apply it with `autosize:'fit'` in prepareSpecForBrand before compile. **CRITICAL TRAP (critic amendment):** apply the derived dims inside the emitter (prepareSpecForBrand clone) or a local spec copy — **NEVER write into `panelResults[i].spec`**; panelResults is the object canonicalized for contentHash/specRef at dashboard.render.ts:726/734, so mutating `panel.spec.width` would silently move contentHash and make the "html-only churn" claim false. The new emitter option **defaults to undefined (identity)** so emitter.spec.ts.snap stays byte-identical (only dashboard callers that pass dims regen). Scope: only chart panels with a non-empty spec hit renderVegaLiteToSvg — KPI/geo-placeholder/error cells (kpiCell/placeholderCell) untouched.

### F6b — KPI tiles narrate row order as a trend on non-temporal data (byte-mover) → **suppress**
computeKpi (kpi.ts:199-206) has an else-if that derives a first-vs-last trend even with no periodField and no comparison baseline — exercised by no-periodField sum KPIs (faostat-e2e, strict-fields). Ratified: **reverse the s113 additivity seam (i)** — gate the else-if on `panel.periodField && values.length >= 2`, else `trendDirection = 'flat'`. The baseline branch (comparison set) is UNCHANGED. **Owned regen:** the trendDirection assertions in faostat-e2e + strict-fields flip to 'flat'; the fidelity `.snap` and dashboard.render.test.ts:95 KPIs carry a comparison basis so they do NOT churn.

### F6d — default heatmap narrative trips its own A11Y-R-11 warn (reproduce-first) → **fork-C if real**
Root cause (grounding): data-analysis.ts:132 `resolvePrimaryBindings` binds the narrative measure to the **Y** channel (`resolveBinding(spec,'y')`), but a heatmap's measure is on **COLOR** while X/Y are both dimensions — so it analyzes the Y-dimension as the measure → too few meaningful key findings → A11Y-R-11 (equivalence-rules.ts:**229-241**, "≥3 rows must surface ≥2 key findings") warns. Reproduction is **data-dependent**. Ratified disposition: **m09 reproduces FIRST**; if it does NOT warn → record "does-not-reproduce at HEAD" in OOS and close; if it warns → **fork-C**: fix resolvePrimaryBindings so a MarkRect heatmap reads its COLOR channel as the measure (the honest fix; OWNED narrative-golden regen). **Split to a follow-up sprint if fork-C proves too large.** **NEVER fork-A** (lowering the R-11 bar weakens the a11y contract — rejected).

---

## §3 — Banked cleanups (all reproduce at HEAD; none fixed by s144-s148)

- **#853a** (additive-zero-byte) — vega-lite-adapter.ts:295 change the palette-bake guard `!binding.range` → `!binding.range?.length`, symmetric with the F5 range-write guard `binding.range && binding.range.length > 0` (:312-313). Fixes `range:[]` dead-zoning BOTH writes; exactly one write fires in every case. `?.length` is load-bearing — do NOT rewrite as `=== undefined`. Zero-byte: range:[] is AJV-unreachable via MCP (minItems:2), no golden exercises it.
- **#853b** (additive-zero-byte, land WITH #853a) — viz.render.ts:118 block in cartesianColorRangeWarnings: early-return no-warning when `range.length === 0`, and/or only emit V145 when the compiled color scale is genuinely continuous (inspect compiled `encoding.color.type`) instead of inferring from `!rangeApplied`. Coupled: after #853a, range:[] bakes the 6-slot palette → `compiledColorRange.length(6) !== range.length(0)` → rangeApplied false → V145 would falsely blame "continuous" unless #853b lands too. Warnings unhashed (hashes at :537/:756). Keep viz.render.test.ts:324 (the genuine continuous case) green — ADD a new empty/intent assertion, don't loosen it.
- **#853c** (test-only) — add ONE `it()` to artifact.certify.spec.ts (s147 describe): vizRender with an all-**provably-failing (<3:1 on #FCFCFD)** gray `encodings.color.range` (critic amendment: NOT `#888888`/`#8a8a8a` ≈3.1:1 — use e.g. `#B8B8B8`/`#C0C0C0` and confirm the graded mechanism), `includeNormalizedSpec:true`, then `certify(rendered.normalizedSpec)` and assert `conformant===false` + contrast pillar `'fail'`. A positive #110 witness (certify used as a pure reader).
- **#864/#869** (test-only, **viz-core layer**) — the token-less FALLBACK palette (color length 8/9) V146-threshold test. **A mcp-server vi.mock is INFEASIBLE** (viz-core is tsup-bundled from a single src/index.ts → no internal module specifier survives at the dist boundary; a mcp-server vi.mock silently no-ops against the REAL 6-slot palette). Feasible: (1) a colocated viz-core spec that `vi.mock('./token-resolver.js')` (viz-core vitest aliases @oods/viz-core→src), OR (2) empty the `@oods/tokens` cssVariables source so buildPalette returns the 9-slot fallback naturally. Assert V146 reads `echartsOption.color.length` (8/9). Fallback lengths: chord/graph/sunburst/sankey=9, treemap=8.
- **#842** (ci-config) — ci.yml:181 `pnpm run tokens:validate` (colon = transform --check only) → `pnpm run tokens-validate` (hyphen composite = also runs lint-semantic + guardrails --quiet + **validate-viz-scales**, which never runs in the GitHub job today). **Run `pnpm run tokens-validate` locally FIRST** — the composite may surface currently-unrun failures.
- **#832** (test-config, **default = annotate**) — the viz-core src chrome/palette mutation guards run ONLY via ci.yml's single `pnpm --filter @oods/viz-core test` line (~609); root vitest 'core' (vitest.config.ts:106-121) does not glob packages/viz-core/src/**. **Ratified default: annotate ci.yml:608-609** documenting that this single line is the ONLY gate for viz-core src specs (safer than the glob-add, which risks @→root/src alias + coverage.include pollution).
- **#822** (test-only) — vega-lite-adapter.spec.ts:40/60/85 `as Record<string,unknown> & {...}` (genuine TS2352, caught by NO gate) → `as unknown as {...}` (the double-cast already used at :108/159/173). Optional: add a viz-core typecheck script.

---

## §4 — Mission spine (strict Requires)

- **m01** — Keystone memo (THIS file), NO CODE, completed-at-creation. Requires: none.
- **m02** — F6c: rectOnly axisY.grid guard in resolveOodsVegaConfig; widen axisY.grid→boolean; owned-regen viz.render.fidelity heatmap export only; bar tripwire stays `.toBe(true)`. Requires: m01. **byte-mover.**
- **m03** — F6a (Approach B): span-derived {width,height} threaded through renderVegaLiteToSvg (undefined-default), applied in an emitter-side clone (NEVER panelResults[i].spec); owned-regen dashboard.render.fidelity `output.html export (sprint-115 m05)` only. Requires: m02. **byte-mover.**
- **m04** — F6b: gate KPI trendDirection on periodField/baseline (reverse s113 seam i); owned-regen faostat-e2e + strict-fields trend assertions. Requires: m03. **byte-mover.**
- **m05** — #853a + #853b (coupled, land together); additive-zero-byte. Requires: m04.
- **m06** — #853c e2e gray-range→conformant:false certify guard (hardened gray values); test-only. Requires: m05.
- **m07** — #864/#869 fallback-palette V146 test at the viz-core layer; test-only. Requires: m06.
- **m08** — CI/test hygiene: #842 (ci.yml colon→hyphen) + #832 (annotate) + #822 (double-cast). Requires: m07.
- **m09** — F6d reproduce-first probe; fork-C (COLOR-as-measure binding) if it reproduces, else OOS record; may split to follow-up. Requires: m08.
- **m10** — Closeout gate + rollout. Requires: m09.

---

## §5 — Constraint proofs
- **#564** — byte movement confined to 3 disjoint declared regens (F6c heatmap export / F6a output.html export / F6b trend assertions) + conditional F6d fork-C; every other item proven zero-golden (§1). contentHash/specRef never move.
- **#525** — zero new tools, zero new schema fields; proven in m10 by generator `--check` no-op + docs:api `--check` no-op + vendored-parity green (generated.ts == source schemas, unchanged).
- **#110** — certify never edited; #853c EXERCISES it as a pure reader (positive witness).
- **determinism** — every fix is a pure fn (rectOnly predicate; span-derived dims over p.w/p.h/columns; trendDirection over periodField+values; `!binding.range?.length`); F6c config stays scalar+array-free so canonicalize key-sort holds.
- **#115** — every change is agent-reachable via existing viz_render/dashboard_render and advertised through JSDoc prose (the s147 no-schema-change recipe).

## §6 — OOS (frozen)
New MCP tool / schema field; ECharts-primary RENDERED SVG (phase2.6 seam c); PNG/rasterization; second dashboard template; brush/interval selections; D1 strain ledger (PT/HCM, separate track); Meridian F3/F4/F5 e2e-retest + s148 review replies (correspondence, not code — the reply was SENT this session); vega/vega-lite added to viz-core / any lockfile change; F6d fork-A (lower R-11) and fork-B (narrative enrichment) unless m09 reproduces AND Derek ratifies.

## §7 — Closeout gate (m10, all green, in order)
`pnpm install --frozen-lockfile` → ROOT `pnpm typecheck` → both generators `--check` no-op → `pnpm docs:api --check` → `pnpm -r build` (rebuild ALL dists incl viz-core BEFORE the mcp-server suite resolves the F6c src change) → `pnpm --filter @oods/viz-core test` (incl F6c guard + #864/#869 fallback test) → `pnpm --filter @oods/mcp-server test` (F6c+F6a fidelity goldens regenerated + green) → `pnpm test:scale` → vendored-parity green → `vitest run tests/ --project core` (root, s146-review carry). Then ROLLOUT (build session's job, mine per [[pm2-bridge-restart-is-mine]]): rebuild + `pm2 restart oods-forge-bridge`, dual-path live-verify via :4466 + aquex — heatmap → NO axisY gridlines across cells; dashboard output.html → chart SVGs fill their grid spans (not narrow-tall).

## §8 — Folded critic amendments (5)
1. m06: harden #853c gray values to provably-fail <3:1 (not #888888) + confirm the graded mechanism.
2. m03: pin the exact churning export (`output.html export (sprint-115 m05)`), not the whole snap file.
3. m03: Approach-B dims in an emitter-side clone, NEVER `panelResults[i].spec` (else contentHash moves).
4. m05: #853b hash anchor is viz.render.ts:**537/756**, not :385 (which is only the spec assignment).
5. m02: widen only axisY.grid→boolean (axisX stays false); name vega-lite-adapter.spec.ts:139-140 bar tripwire.
