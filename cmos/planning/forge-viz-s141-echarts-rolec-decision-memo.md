# Keystone Decision Memo — Sprint-141 · ECharts role-C′ Breadth (certify grades the colors the ECharts adapters bake)

**Arc.** Close certify's ECharts coverage-inversion: `artifact.certify` grades the OODS categorical palette that Forge's 5 ECharts categorical adapters BAKE into `itemStyle.color` today (reconstructed via the same token source), AND grades the bubble_map ordinal-categorical color range — honoring the s139 "grade what renders" discipline without leaving the metadata-only IR. HEAD `4833696`.

**Grounding.** `wf_1b11f43c-813` (6 scouts → synthesist → 2 adversarial critics → revise, vs HEAD). premise STRONG, feasibility FITS-ONE-SPRINT, both critics amend-then-lock (zero blockers). Reuses the s137 rule-set + s138 m05 5-categorical/3-geo split + decision #1024 verbatim (not re-derived).

**Derek decisions (review-close + this planning session):**
- **DIRECTION** (Fork-1 re-pick after the dark-theme grounding fired reconsider-premise): DEFER dark-theme; PROCEED with ECharts role-C′ breadth — the strictly-higher-pull existing gap on the live `viz.render` path.
- **LOCK** — proceed to sprint, eyes open on the honest value read (§1).
- **bubble_map = GRADE THE ORDINAL PATH NOW** (Fork-A option 3, NOT the recommended `'unchecked'`) — see §4.8 + §7 m03. This is the value upgrade: it is the arc's ONE override-aware, genuinely-varying verdict that can report `'fail'`.
- **anti-drift = consistency-LOCK test** (technical must — a shared-resolver refactor moves `itemStyle` bytes → golden regen → violates #110; §3d).

---

### 1. Premise — STRONG, with an honest value read (ratify eyes-open)

The coverage-inversion is real and on the exact agent path: `viz.render` accepts + renders all 8 ECharts-primary types TODAY (`echarts-primary.ts:17,26-49`; `isEChartsPrimaryType → renderEChartsPrimary`), the 5 categorical adapters bake the OODS palette (`buildPalette()` → `getVizScaleTokens('categorical')` → `itemStyle.color`: `treemap-adapter.ts:105-107`, `sunburst:83`, `sankey:196`, `graph:340`, `chord:181`), yet certify routes ALL 8 to `uncertifiedVerdict`/`pillars.contrast:'unchecked'` (`artifact.certify.ts:144-150`). certify is silent about a rendered, gradeable, WCAG-1.4.11 palette on the path agents exercise. Anti-circular: the consumer is any agent on live `viz.render`; the hollow sits on their path (unlike dark-theme, whose producer does not exist).

**Value probe — RESOLVED live** (collapses the old ship-fail-vs-hold headline). Fixed default 6-slot palette `[#3668D8,#3F45BE,#279669,#B6892B,#D94747,#606676]`: **role-C ALL PASS** vs canvas `#FCFCFD` (min **3.10:1** at `#B6892B`); **role-A PASS** — min-pairwise CIEDE2000 min-over-CVD(deutan/protan/tritan@sev100) = **7.25** (≥ 2.0 fail floor; below the 10 clean target → "distinguishability caution").

**The honest value asymmetry (folds C2-a/C2-b — ratify eyes-open).** Because the 5 categorical adapters' `buildPalette()` takes no args (`config.tokens` feeds only usermeta) and cardinality is absent from the metadata IR, certify's categorical verdict is INVARIANT to input — treemap/sunburst/sankey/force_graph/chord report a **constant `contrast:'pass'`** for every chart until the OODS palette itself changes (guarded by the lock). This is a real affirmative WCAG-1.4.11 + CVD claim, but it is a **compile-time constant surfaced per-call**, NOT the byte-reading per-chart grading the cartesian path does (override-aware + cardinality-sliced, genuinely varying). An ECharts categorical `'pass'` therefore means something WEAKER than a cartesian `'pass'`; a MANDATORY one-line asymmetry note prevents over-reading (§6). **bubble_map is the exception** (§4.8): grading its ordinal range IS override-aware and CAN report `'fail'` — the arc's one genuine per-chart verdict.

**What the arc buys, honestly:** symmetric, honest contrast coverage across all 13 types (5/13 → 13/13 carry a real `pillars.contrast` verdict) + a palette-regression guard + one genuinely-failing override-aware verdict (bubble_map) — additively, one sprint, zero #564 risk. It **moves** the hollow (certify now speaks to baked ECharts color) more than it **closes** it (adjacency, categorical override-awareness, true emit-then-read, and the ECharts `contentHash` stay frozen sub-arcs, §8). Ratified with that framing.

---

### 2. Feasibility — FITS ONE SPRINT

Load-bearing: the baked ECharts categorical palette is data-independent and clamps to a fixed 6. Every `buildPalette()` calls `getVizScaleTokens('categorical', {count:8|9})`; `VIZ_CATEGORICAL_SCALE` has 6 entries and `sliceAndMaybeReverse` runs `clamp(count ?? values.length, 1, 6)`, so `count:8/9` is INERT — all five resolve the SAME 6 OODS hexes. certify reconstructs the rendered palette from tokens alone: ZERO chart data, NO new input (schema stays `{spec}`, `artifact.certify.ts:30-33`). All role-C/role-A math already exists in `certify-contrast.ts`. `pillars.contrast` is already typed `'pass'|'fail'|'unchecked'|'exempt'` (`generated.ts:303`) — no schema type change.

**bubble_map ordinal feasibility — CONFIRMED (this session, direct read).** The ordinal-categorical branch is IR-determined: `colorEncoding.scale === 'ordinal' && colorField` (`echarts-bubble-adapter.ts:171-172`), both plain color-encoding fields certify already reads for cartesian. The graded palette = `colorEncoding.range ?? DEFAULT_COLOR_RANGE` (`:163`), where `DEFAULT_COLOR_RANGE = [#a5d8ff, #5ea3ff, #1f6feb]` (`:22-26`) — three sequential blues used categorically = a role-A failure by construction. So certify can, from the IR alone: detect the branch, reconstruct the exact graded range (override-aware), and grade it. m01 CONFIRMS the NormalizedVizSpec spatial color encoding exposes `scale`/`field`/`range` to certify; if a given chart's IR lacks the field, fall back to `'unchecked'` for that chart (grade only when present).

---

### 3. Seam — palette RECONSTRUCTION, not emit-then-read (LOAD-BEARING; decision #1024 pt3)

certify does NOT run any ECharts adapter and does NOT read emitted `itemStyle` bytes. It **reconstructs** the graded palette from tokens/IR.

**3a. Reconstruct from the real shared source, not the label constant (C1-a).** The categorical grade palette is built from the SAME `getVizScaleTokens('categorical')` call the adapters make (sliced to 6), NOT `certify-contrast.ts`'s `categoricalToken()` label constant. Adapters emit `--viz-scale-categorical-NN` (`scale-token-mapper.ts`) resolved via `resolveTokenToColor`'s `--oods-` prefix fallback (`token-resolver.ts:29-35`); `categoricalToken` (`certify-contrast.ts:62`) emits `--oods-viz-scale-categorical-NN`; they converge only through that fallback. Sharing the actual call makes `certified==rendered` true by SHARED SOURCE, not fragile prefix convergence.

**3b. Fixed-default, NOT `resolveCategoricalPalette(spec)` (decision #1024 pt3).** The categorical grade MUST resolve the FIXED DEFAULT 6-slot palette and MUST NOT reuse `resolveCategoricalPalette(spec)` (`certify-contrast.ts:325`) — that resolver is override-aware + cardinality-sliced, whereas the ECharts categorical adapters ignore `config.tokens` and certify has no cardinality. Grading the override-aware/sliced palette would grade a color the ECharts render ignores = a NEW hollow.

**3c. New exported entry + fixed-default canvas (C1-c).** m02 adds a NEW exported `evaluateEChartsCategoricalContrast()` in `certify-contrast.ts` (module-internal `gradeCategorical`:177 + `categoricalToken`:62 stay private; `evaluateContrastPillar`:318 takes a compiled `VegaLiteAdapterSpec` that does not exist for ECharts). It reconstructs the fixed-6 + calls `gradeCategorical` with a NON-override palette (empty overrides Map) AND a NON-override canvas (`CANVAS_TOKEN → #FCFCFD`, `:57`) — the ECharts adapters honor neither `config.tokens` palette NOR canvas overrides, so `certified==rendered` holds. Reuses the role-C/role-A math + `#FCFCFD` + `cvd-machado.js` + the rgb→hex bridge. **bubble_map (m03) reuses this grader** with a DIFFERENT, override-aware palette source (`colorEncoding.range ?? DEFAULT_COLOR_RANGE`) — same role-A/role-C math, different (IR-derived) palette.

**3d. Anti-drift = consistency-LOCK test, NOT an adapter refactor (Derek-ratified; the s138 F3 lesson without byte risk).** Do NOT refactor the 5 adapters into a shared resolver — that moves `itemStyle` bytes → `echarts-options` golden regen → violates #110. Pin drift with a consistency-LOCK test asserting each adapter's `buildPalette()` === certify's fixed-6 grade palette. NORMALIZE both to hex first (C1-b): adapters bake `rgb()` (`convertOklchToRgb`, `token-resolver.ts:95`); certify's slots are hex. Provably equal today (same token source, clamp collapses count); the lock catches any future divergence (non-clamping count; a token falling to `FALLBACK_PALETTE`) with zero byte risk.

**Contrast with true emit-then-read (frozen).** Reading real `itemStyle` bytes would need `adaptX(spec, INPUT)` where `INPUT` is the SEPARATE tool-input data branch (`viz.render.ts:363`), absent from the metadata-only IR (`data:{values:[]}`, `viz.render.ts:528-536`) = the frozen input-schema sub-arc (OOS #2). Note the bubble_map ordinal grade sidesteps this: the BRANCH and the RANGE are in the color ENCODING (IR), not the data branch.

---

### 4. Per-type roles

Rules (`s137-contrast-rules.md`): role-C = mark-fill vs canvas ≥ 3:1 (WCAG 1.4.11); role-A = min-pairwise CIEDE2000 over Machado-2009 CVD@sev100 (< 2 fail / 2–10 pass+warn / ≥ 10 clean); role-B = sequential/diverging gradient → WCAG essential-exception EXEMPT. Canvas `#FCFCFD`. Grade the FULL fixed default 6-slot palette (no cardinality slice — data absent; superset-safe: all-6-pass ⇒ every consumed subset passes role-C, and min-pairwise over 6 ≤ over any slice, so role-A cannot false-pass).

1. **treemap** (`MarkTreemap`): tile fills → role-C + role-A → **PASS**. 1px `#e0e0e0` stroke → adjacency satisfied-by-stroke, NOT graded.
2. **sunburst** (`MarkSunburst`): ring-arc fills → **PASS**. 2px `#ffffff` arc border.
3. **sankey** (`MarkSankey`): NODE rects → **PASS**. LINKS (gradient, opacity 0.5) ill-defined → SKIPPED.
4. **force_graph** (`MarkGraph`): node-symbol fills → **PASS**. EDGES (`lineStyle 'source'`) SKIPPED.
5. **chord** (`MarkChord`): ring-arc fills → **PASS**. RIBBONS (opacity 0.5) SKIPPED.
6. **choropleth** (`MarkChoropleth`): sequential visualMap ramp / piecewise = binned-sequential → role-B **EXEMPT**.
7. **flow_map** (`MarkFlow`): single sequential line color, no palette → role-B **EXEMPT** (single-hue).
8. **bubble_map** (`MarkBubble`) — **DEREK: GRADE THE ORDINAL PATH NOW (real, override-aware).** Branch off the IR: if `colorEncoding.scale === 'ordinal' && colorEncoding.field` → the ordinal-categorical branch is active → grade the range `colorEncoding.range ?? DEFAULT_COLOR_RANGE` as a CATEGORICAL palette: role-A min-pairwise ΔE00-over-CVD + role-C vs `#FCFCFD`. The default range = three sequential blues `[#a5d8ff,#5ea3ff,#1f6feb]` used categorically → role-A **EXPECTED FAIL** (m03 computes + locks the exact ΔE00-over-CVD → `contrast:'fail'`). If the author supplies a distinguishable `color.range`, the verdict genuinely VARIES (override-aware — the arc's one non-constant ECharts verdict). Else (no ordinal color encoding → sequential visualMap default) → role-B **EXEMPT**. If the IR lacks the spatial color encoding fields → `'unchecked'` (m01 confirms the IR exposes them; grade only when present).

**Adjacency caveat — MANDATORY (C2-d).** The arc is NAMED role-C′ but ships role-C-vs-canvas + role-A only; adjacency is frozen OOS. treemap inherits color DOWN the hierarchy so siblings share a color distinguished only by the 1px stroke the grade never verifies. Every ECharts categorical `contrastNote` MUST state: **"touching-mark/adjacency contrast not graded; relies on the separating stroke."**

**Override caveat (all 5 categorical `contrastNote`s).** Per-node data-color overrides (`node.color ?? palette[i]`, `sankey-utils.ts:77`, `graph-adapter.ts:221`) are ungraded; the grade reflects the default baked palette (matches the s138 single-series caveat). bubble_map is exempt from this caveat — it DOES grade the override-aware range.

---

### 5. Determinism

No determinism-proof / `contentHash` for these 8 types; `pillars.determinism` + `pillars.a11yEquivalence` STAY `'unchecked'` (no Vega-Lite compile — the ECharts branch early-returns at `artifact.certify.ts:144-150` BEFORE the two `toVegaLiteSpec` calls ~`189-191`). Unchanged + honest. The reconstruction grades (categorical fixed-6; bubble_map from the IR range) are pure functions of constants/IR — no data/`Date`/random/Map-Set order → byte-stable re-run. render↔certify `contentHash` identity stays explicitly CARTESIAN-ONLY (certify cannot reproduce `sha256(canonicalize(echartsOption))` without the data branch, so it emits none — no false hash-identity claim). True emit-then-read + a matching ECharts `contentHash` = frozen input-schema sub-arc (OOS #2/#8).

---

### 6. #564 posture — Design A (additive), certify-output-only

Renderers untouched: the arc changes ONLY certify's read path; the graded colors are already baked today, so `viz.render` + `dashboard.render` + every `echarts-options`/`network-fidelity`/`geo-fidelity`/`dashboard` golden stays byte-IDENTICAL (m03 proves it). Outputs that flip (certify's own payload): `pillars.contrast` `'unchecked'` → `'pass'` (5 categorical) / `'exempt'` (choropleth, flow_map, bubble_map-sequential) / `'fail'`-or-`'pass'` (bubble_map-ordinal, override-aware) / `'unchecked'` (bubble_map-IR-missing); `contrastNote` absent → present; the ECharts `notes[]` contrast line (`artifact.certify.ts:147`) dropped. UNCHANGED sentinels: `coverage` STAYS `'uncertified'`, `conformant` STAYS `null`, `pillars.a11yEquivalence` + `pillars.determinism` STAY `'unchecked'`, no `contentHash`.

**Why Design A, not the s140-[B] flip (C1-d, resolved by the probe).** Had role-A FAILED, Design A would hide it in `conformant:null` and B would be higher-signal. The probe PASSED, so B yields `conformant:true` for all 8 = near-zero signal at the full s140-[B] cost (uncertified early-return break + schema-desc→`generated.ts` regen + tool-descriptions/policy + changelog ritual). Design A confirmed.

**Contract signal — MANDATORY (C2-e).** `pillars.contrast` flips from a universal `'unchecked'` to real verdicts for the 8 ECharts types; a consumer keying "is-ECharts/uncertified?" off `contrast==='unchecked'` silently breaks. A schema-desc note (that `coverage:'uncertified'` may now carry a real `pillars.contrast` verdict, incl. `'fail'` for a categorically-misused bubble_map range) + a changelog line are REQUIRED (s140-[B] discipline on the observable field that changes).

**Sanctioned test edit.** Hand-INVERT the certify tripwire (`artifact.certify.spec.ts`, the `MarkSankey → contrast:'unchecked'` assertion), NOT a `-u` regen — mirroring s138 m03.

---

### 7. Mission spine (4 missions, strict Requires)

**m01 — Keystone decision memo (NO CODE) — Completed at sprint creation.** THIS file. Ratifies: the s137 3-role rules + s138-m05 5-categorical/3-geo split; the reconstruct-fixed-default-6 seam from the shared `getVizScaleTokens('categorical')` call (NOT `resolveCategoricalPalette(spec)`, decision #1024 pt3); Design A additive; anti-drift = consistency-lock-test; **bubble_map = grade the ordinal path (Derek)**; the value probe as fact (6-slot PASSES → 5 categorical constant `'pass'`). CONFIRMS the NormalizedVizSpec spatial color encoding exposes `scale`/`field`/`range` to certify (grade-when-present, else `'unchecked'`). Requires: none.

**m02 — Categorical-5 contrast grade path.** In `artifact.certify.ts:144-150`, replace the blanket `contrast:'unchecked'` for `MarkTreemap`/`MarkSunburst`/`MarkSankey`/`MarkGraph`/`MarkChord` with a route to the NEW exported `evaluateEChartsCategoricalContrast()` (§3c) over the fixed default 6-slot palette — role-C (each vs `#FCFCFD` ≥ 3:1) + role-A (min-pairwise ΔE00 over CVD), FILLS only (skip ribbons/edges). Keep `coverage:'uncertified'`/`conformant:null`/a11yEquivalence+determinism `'unchecked'`/no `contentHash`. Every `contrastNote` carries the MANDATORY adjacency + per-node-override caveats (§4). Add per-type contrast tests + the consistency-LOCK test (each `buildPalette()` === the fixed-6 grade palette, normalized rgb→hex). Requires: m01.

**m03 — Geo: exempt + bubble_map ORDINAL grade + tripwire + golden proof.** Route `MarkChoropleth` + `MarkFlow` → `contrast:'exempt'` (WCAG sequential essential-exception). **`MarkBubble` (Derek's real-grade):** branch off the IR color encoding — `scale==='ordinal' && field` → grade `colorEncoding.range ?? DEFAULT_COLOR_RANGE` via the m02 grader (role-A ΔE00-over-CVD + role-C); the default 3-blue range → lock the EXPECTED `contrast:'fail'` (a genuine fail test); an author distinguishable range → `'pass'` (override-aware test); non-ordinal / sequential visualMap → `'exempt'`; IR-missing color encoding → `'unchecked'`. Per-trait routing, NO `dataBranch` shortcut. Hand-INVERT the certify tripwire (`artifact.certify.spec.ts`, NOT `-u`). PROVE `echarts-options`/`network-fidelity`/`geo-fidelity`/`dashboard` goldens byte-IDENTICAL. Requires: m02.

**m04 — Closeout + two-layer reconnect live-verify.** Full gate: `pnpm install --frozen-lockfile` (no dep), ROOT `pnpm typecheck`, `pnpm -r build`, all tests + colocated goldens, `test:scale`, viz-core/viz-render, `generated.ts` regen + `generate:check`, `docs:api`. `pm2 restart oods-forge-bridge` (mine). TWO-LAYER reconnect live-verify on :4466 AND aquex: a categorical type → `'pass'`; a geo type → `'exempt'`; **bubble_map default ordinal → `'fail'`** (Derek's teeth, live-reproduced); a grey `config.tokens`-override run on a categorical type → SAME verdict as default (proves the categorical grade is override-INDEPENDENT by construction); confirm advertised set STILL 25 + NO golden moved. Requires: m03.

---

### 8. Out of scope (frozen, with reasons)

1. **Touching-mark role-C′ ADJACENCY** (neighbor-vs-neighbor) — the literal "C-prime." Shipped grade is role-C-vs-canvas + role-A; true adjacency needs per-type topology + domain-order replication; the 1–2px stroke satisfies the memo boundary. `s137-rules:17,52`; `s138 memo:113`.
2. **True emit-then-read of ECharts `itemStyle` bytes + rendered-cardinality slice** — infeasible from the metadata-only IR (`data:{values:[]}`); needs an additive data-branch INPUT-schema change = own sub-arc. `s138 memo:114`. (Note: bubble_map's ordinal grade is NOT this — its branch + range live in the color ENCODING, which IS in the IR.) Also gates a matching ECharts `contentHash`.
3. **force_graph EDGE + sankey/chord RIBBON contrast** — `lineStyle 'source'/'gradient'` + opacity, not the categorical palette; separate chrome logic.
4. **Geo BASEMAP contrast** (`areaColor #f2f2f2`) — chrome/geometry, theme-sensitive, no palette role.
5. **`config.tokens`-AWARE ECharts CATEGORICAL baking** (brand-fidelity) — the 5 categorical adapters ignore overrides; making them override-aware MOVES `itemStyle` bytes = non-additive; separate brand-fidelity arc. (bubble_map's range IS override-aware from the IR, so it is IN scope.)
6. **Dark-theme contrast** — `resolveTokenToColor` theme-blind/light-only; grounded reconsider-premise `wf_34fd94f6-314` (no cartesian `config.theme:'dark'` producer). Architecture + WCAG math (cat-02 7.31:1 light → 2.51:1 dark on #101215) captured for whenever a real dark producer appears.
7. **render↔certify `contentHash` IDENTITY for ECharts types** — needs re-emit which needs the data branch; stays cartesian-only.
8. **The s140-review surviving hole** (graded-`'unchecked'` vs nothing-to-grade disambiguation) + the two cheap carry-notes (the `certify-contrast.ts:~153` "depth-2 bounded" doc comment; the tool-descriptions/policy vs registry.json 25-count reconcile) — separate, carried.

---

### 9. Constraints

- **#525 (MCP-only):** no new tool; `artifact.certify` OUTPUT grows only; advertised set STAYS **25**.
- **#110 (no scorer):** no ranking; goldens byte-IDENTICAL (adapters untouched); only sanctioned non-output change = the hand-inverted certify tripwire (NOT `-u`).
- **#564 (additive):** renderers untouched; `pillars.contrast` already typed for `'pass'`/`'fail'`/`'exempt'` (`generated.ts:303`); `coverage:'uncertified'` + `conformant:null` sentinels preserved (Design A); the schema-desc contract note is MANDATORY (C2-e).
- **Determinism:** pure reconstruction (fixed 6 tokens / IR range + `#FCFCFD` + fixed Machado matrices), no data/`Date`/random/Map-Set order; NO re-emit `contentHash`; a11yEquivalence + determinism pillars STAY `'unchecked'`.
- **Seam integrity:** categorical grade uses the DEFAULT non-override palette from the SHARED `getVizScaleTokens('categorical')` source (NOT `resolveCategoricalPalette(spec)`), fixed-default canvas → `certified==rendered` by construction, pinned by the normalized consistency-lock (not an adapter refactor). bubble_map grades the IR-derived range (override-aware, the one varying verdict).

Records: grounding `wf_1b11f43c-813`; direction `wf_34fd94f6-314` (dark-theme reconsider) + decision #1046; s140-review `wf_4adcaf2b-cac`; prior art decision #1024, s137 memo §11, s138 memo m05, `cmos/research/s137-contrast-rules.md`.
