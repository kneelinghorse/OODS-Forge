# Sprint-148 Decision Memo (SSOT) — Meridian F3+F4 chord correctness

**Status:** LOCKED (planning PS-2026-07-06-005). Derek-ratified scope via AskUserQuestion; grounded + adversarially verified by `wf_3e909c07-206` (5 live-repo scouts → synthesist → adversarial critic vs HEAD `ace0e78`; verdict **AMEND-THEN-LOCK**, 0 blockers, anchors zero-drift, readyToExecute=true, 4 amendments folded below). Build session executes m02→m06 from this memo without re-grounding.

**Source:** Meridian inbox msg `258b6a7a` (first real-data consumption of the s134–s143 certify arc, PT-D1 worldview). F1+F2→s146 (done), F5→s147 (done). This sprint = the carried **F3+F4 = "chord correctness"**; F6a-d export seams + D1 strain ledger remain carried.

---

## §1 Scope (Derek-locked)

All **additive** — warnings + one fail-loud error path + schema prose + regenerated docs. **Zero rendered-byte change**, certify untouched. Lands in exactly two production files (`viz.render.ts` + `errors/registry.ts`) plus schema prose + doc rebake.

- **F3 = never-cycle WARN (OODS-V146).** When a categorical ECharts-primary chart has more distinct color groups than the 6-slot OODS palette, `palette[index % 6]` silently repeats a color (CIEDE2000 = 0 between two arcs), invisible to certify's s141 **data-independent palette-constant** grade. Fix = a WARN at `viz.render`, across **all 5 cycling types** (treemap/sunburst/sankey/force_graph/chord). NOT fold-into-Other, NOT instance-level certify grading (both OOS §6).
- **F4 = chord + force_graph link integrity.** A link naming a nonexistent node, and an exact duplicate link, both pass `viz.render` silently on chord today (`chord-adapter.ts:177` `buildLinks` has zero validation). Fix = **dangling node ref → FAIL-LOUD (OODS-V147)**; **duplicate link → WARN (OODS-V148)**. Sankey already validates node refs (`sankey-utils.ts` `SankeyValidationError` → V126) and stays out of F4.
- **Breadth = full network/categorical class.** F3 covers all 5 cycling types; F4 covers chord + force_graph.

---

## §2 F3 per-type cardinality map (the correctness trap — DO NOT reuse the pre-computed `nodeCount`)

Threshold = **`echartsOption.color.length`** (production = 6; robust to the no-token FALLBACK path which cycles at 8/9 — do NOT hardcode 6 or use `getVizScaleTokens('categorical').length`, which would false-warn at 7–8 units on the fallback path — **amendment 4**). WARN iff `count > threshold`. `nodeCount` at `viz.render.ts:488-518` is the WRONG source for 3 of 5 types.

| Type | Count unit (what actually gets a per-index color) | Anchor |
|---|---|---|
| **chord** | `nodes.length` (colors every node, ignores `node.color`) | `chord-adapter.ts:168-172` |
| **sankey** | `nodes.length` (slightly OVER-reports if explicit `node.color` present — acceptable for a WARN) | `sankey-utils.ts:75-77` |
| **force_graph** | **distinct GROUP count** = `extractCategoryNames(nodes, 'group').length` (sorted Set of non-empty strings); **SKIP when 0** (no groups → no palette coloring). NOT `network.nodes.length`. | `graph-adapter.ts:273-284` |
| **treemap** | **first-visible-level siblings** over `convertToEChartsTreeData(branchData)`: `(tree.length===1 && tree[0].children?.length>0) ? tree[0].children.length : tree.length`. NOT `hierarchyNodeCount`. | `treemap-adapter.ts:129-153`, `hierarchy-utils.ts:27` |
| **sunburst** | identical to treemap (byte-identical `assignColorsToData`) | `sunburst-adapter.ts:105` |
| **geo** (choropleth/bubble_map/flow_map) | `[]` — no categorical cycling; **guard by chartType FIRST**, before reading `.color` (geo uses `visualMap`, has no top-level `color:palette` → an unconditional read THROWS — **amendment 2**) | — |

---

## §3 F4 seams

- **Dangling node ref (V147, FAIL-LOUD, PRE-DISPATCH).** Alongside the s147 V145 block (`viz.render.ts:474`), BEFORE the adapter try/dispatch, for **chord (key = `node.name`)** and **force_graph (key = `node.id`)** only. A link naming a node not in the key set → `errorOut('OODS-V147', …, retryable:true)`. Sankey untouched — keeps its adapter throw → V126 (`:617`).
- **Duplicate link (V148, WARN).** On the **surviving** links (after the V147 short-circuit), for chord + force_graph. **Directed key `(source,target)`** — chord is DIRECTED (schema `:121`; ECharts builds directed, ribbon inherits SOURCE color), so **A→B ≠ B→A**; a reciprocal-trade chord (A→B and B→A, different widths) is VALID data, NOT a duplicate. **Default granularity = the PAIR `(source,target)`** (the ECharts arc double-count / stacked-ribbon corruption fires on the pair regardless of value; two A→B with values 10 & 5 still silently stack). Use a **collision-safe key** (`JSON.stringify([source,target])` or a NUL-join — NOT ECharts' naive `n1+'-'+n2` concat, which collides). Enumerate duplicate groups in INPUT order. Push V148 onto the combined `out.warnings` array. Adapters only throw, so this MUST live at the `viz.render` layer.
  - **OPEN NUANCE (Derek/Meridian, defaulted PAIR):** flip to the TRIPLE `(source,target,value)` if "exact duplicate" is meant literally. Recommend PAIR — catches strictly more real defects.

---

## §4 OODS-V codes (all `category:'validation'`, added after V145 at `registry.ts:187`)

V145 is the highest VIZ-band code (V140–V145); V200/V201 are a SEPARATE Brand/Map band. V146/V147/V148 verified unused across `.ts/.json/.md` (excl dist/node_modules).

- **OODS-V146** — never-cycle WARN. `'Categorical palette recycles: more distinct color groups than the 6-slot OODS palette'`. `severity:'warning'`, `retryable:true`. All 5 cycling types.
- **OODS-V147** — dangling-node-ref FAIL. `'Link references a non-existent node'`. `errorOut` fail-loud, `retryable:true` (a dangling ref is a FIXABLE input — matches V126/V131 posture, deliberately unlike V145's `retryable:false` closed-misuse). chord + force_graph.
- **OODS-V148** — duplicate-link WARN. `'Duplicate link'`. `severity:'warning'`, `retryable:true`. chord + force_graph.

`registry.test.ts` auto-covers the 3 new codes via its enumeration + V-prefix=category regex.

---

## §5 Constraint proofs

- **#564 (additive, no golden regen, zero rendered bytes).** `warnings[]` is the only success-path field F3/F4 touch; V147 `errorOut`s BEFORE the option is built. `echartsSpec(:552)` / `contentHash=sha256(canonicalize(echartsOption))(:609)` / `specRef(:600)` all derive from `echartsOption`, which is only READ. Every existing network/hierarchy fixture is ≤6 slots / no dangling / no dupes, so V146/V147/V148 fire on NONE → warnings stay `[]` → byte-identity holds. `warnings` output-schema unchanged (`code` is a free string; `severity` enum already includes `'warning'`). **AMENDMENT 1:** the dashboard lifts per-panel `viz.render` warnings into its `warnings[]` (prefixed by panel id) when `a11yEquivalence` is on (`dashboard.render.ts:612-619`), and panels can be echarts-primary (`:911-915`). This fold is **intended additive behavior**, not a violation — a real >6-category echarts-primary panel under `a11yEquivalence` WILL surface V146 in dashboard `warnings[]`. Dormant in the current suite (CPC first-level=4, SANKEY=6 nodes, no such test), so byte-identity still holds today, but m06 must verify the dashboard + faostat-e2e suites too and the proof must NOT claim a blanket "warnings stay []".
- **#525 (no new tool).** All logic internal to `viz.render.ts` + `registry.ts` + schema prose. Set stays 25 (raw 19).
- **#110 (certify a pure reader).** `artifact.certify.ts` / `certify-contrast.ts` require ZERO edits — all F3/F4 changes are generate-side at `viz.render`. Instance-level certify grading of palette collisions is explicitly OOS.
- **Determinism.** All four helpers pure — Set membership, sorted-Set group extraction, first-visible-level count, JSON-stringify directed key enumerated in input order. No Date/random/IO.
- **#115 (advertise).** V146/V147/V148 message text + fix the chord over-promise (`input.json:101` already claims "reference existing node names" — V147 makes it TRUE, keep/clarify, do not soften) + add node-ref-integrity prose to force_graph/network links (`:155`, none today) + add a "links must be unique per directed (source,target)" clause to sankey/chord/network link descriptions + an s148 advertise sentence in `mcp-adapter/tool-descriptions.json` + rebake `docs/api/viz-render.md` via `pnpm docs:api` (the `--check` gate at `generate-api-reference.ts:299` exit-1s CI on drift).

---

## §6 OOS (frozen)

- Fold-into-"Other" bucketing for >6 categories — F3 is WARN-only, bytes unchanged.
- Instance-level certify grading of palette collisions — certify stays the s141 data-independent palette-constant reader, zero edits.
- Duplicate-link WARN on **sankey** — out of the ratified F4 breadth (sankey is named only for node-refs, already validated). Do NOT emit V148 for sankey this sprint.
- Recoding sankey's dangling-ref from V126 → V147 — sankey keeps its existing throw→V126 (`:617`); changing an existing wire code is an error-contract change a reproducible-freeze consumer could notice.
- `src/viz/adapters/echarts` (Storybook/React consumer) — the agent path imports only `@oods/viz-core`; untouched.
- NL→viz — reverted 2026-06-29, not reinherited.
- force_graph `node.name` vs `node.id` divergence — pre-existing adapter ambiguity; F4 keys by `node.id` (input identity contract), out of scope to reconcile.

---

## §7 Mission spine (strict Requires m01→m06)

- **m01 — Keystone plan-of-record memo [NO CODE].** This file. Records §2 cardinality map, §3 F4 seams, §4 codes, §5 proofs (incl. amendment 1 dashboard fold), the resolved chord-reciprocal decision (directed, A→B≠B→A), the threshold=`color.length` rationale (amendment 4), and the two defaulted build decisions: dup-key = PAIR (open nuance, flip to triple trivially); helper location = **replicate the ~6-line group-extraction + ~4-line dangling Set inside `viz.render.ts`** (zero viz-core churn, #564-conservative, matches the s147 single-file `cartesianColorRangeWarnings` precedent; treemap/sunburst stay drift-safe via the exported `convertToEChartsTreeData`) rather than exporting from viz-core (which triggers the dist-rebuild-before-mcp-suite gate). F3 explicit-color net-out: accepted as-is (raw count slightly over-reports for a WARN). Requires: none.
- **m02 — Register V146/V147/V148.** Three `category:'validation'` entries after `registry.ts:187`, all `retryable:true`. Re-confirm the codes unused. Requires: m01.
- **m03 — F3 never-cycle WARN in `renderEChartsPrimary`.** Pure helper `neverCycleWarnings(chartType, branchData, echartsOption)` (mirror `cartesianColorRangeWarnings@:91`). **Guard geo by chartType FIRST (amendment 2)**, then per-type count per §2, threshold=`echartsOption.color.length`, emit one V146 when `count > threshold`. Invoke after `geoWarnings(~:542)`, combine `warnings:[...geoWarnings,...cycleWarnings]` at `:554`. Prove `contentHash(:609)`/`specRef(:600)` unchanged. Requires: m02.
- **m04 — F4 dangling FAIL + duplicate WARN in `renderEChartsPrimary`.** Serialized after m03 (same file). `findDanglingLinks(nodeKeys, links)` + `findDuplicateLinks(links)` (collision-safe directed key, input-order). Dangling → `errorOut('OODS-V147')` PRE-DISPATCH alongside the V145 block (`:474`) for chord(name)+force_graph(id). Duplicates on surviving links → V148 WARN onto the combined array. Verify sankey dangling still → V126 and no V148 for sankey. Requires: m03.
- **m05 — #115 advertise + prose + doc rebake.** Fix the chord over-promise; add force_graph/network node-ref prose; add the directed-uniqueness clause; add an s148 advertise sentence to `tool-descriptions.json`; `pnpm docs:api` to rebake `docs/api/viz-render.md` (leave `--check` green). Requires: m04.
- **m06 — Tests + closeout gate.** NEW >6-slot fixtures firing V146 on ALL 5 types (chord/sankey ≥7 nodes; force_graph ≥7 distinct groups; treemap/sunburst ≥7 first-visible-level siblings) + a ≤6 negative per type. Dangling + duplicate cases for chord+force_graph (V147/V148) + a negative proving sankey dangling still → V126 with no V148. **AMENDMENT 3:** assert the SPECIFIC code, do NOT reuse the broad `code.startsWith('OODS-V14')` prefix filter (`viz.render.test.ts:246`) on any new echarts-primary fixture. **AMENDMENT 1:** add the dashboard + faostat-e2e suites to the byte-identity / no-new-warning verification set. Assert all golden/fidelity suites byte-identical (golden-echarts-options, golden-profiles, chord/graph/sankey/treemap/sunburst-adapter.spec, viz.render.fidelity/network-fidelity/geo-fidelity). Closeout: `vitest run tests/ --project core`, `pnpm install --frozen-lockfile`, ROOT `pnpm typecheck`, `pnpm docs:api --check`, `pnpm -r build`, viz-core + mcp-server + test:scale + vendored-parity green. Requires: m05.

---

## §8 Carried (post-s148, unchanged ranking)

F6a-d export/theme seams (dashboard `output.html` SVG grid-span sizing; suppress `trendDirection` when no `periodField`; drop `axisY.grid` on MarkRect heatmaps; the default heatmap narrative that trips its own A11Y-R-11 warn) — a prior scoping memo pair exists (`forge-viz-phase2.6-export-*`). Then D1 strain ledger (PT/HCM registry/trait track — separate from the tool findings).
