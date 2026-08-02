# Sprint-166 — PT arc opener (SSOT)

**Locked 2026-08-01, planning session PS-2026-08-01-003.** Derek ratified the two-front plan (PT = brand-in-Forge + client-owned artifact delivery; mobile = token-sharing federation, certify-first) and directed: proceed, Stage1-first on Figma ingestion. Parent memos: `forge-pt-design-system-decision-memo.md`, `forge-mobile-native-strategy-memo.md`, `forge-two-front-consolidated-plan-2026-08.md`. Grounding: wf_ef223bd5-8b9 (two-front research, 11 agents) + wf_d0648383-dd7 (this charter's anchors, 3 agents; FF#23/FF#22 churn predictions grep-cited per decision #1151). Build executes in a SEPARATE fresh session from this memo; the genuine-close review is another separate session.

**Theme:** clear the consumer-debt head (the two live Forge-Demos bugs) + buy the cheap facts that de-risk both fronts (token platform outputs, Stage1→DTCG adapter, mobile sandbox), before s167 commits 2–4 weeks to the brand pipeline.

**The Stage1 discovery that reshaped Move 1 (probe wf_d0648383-dd7):** Stage1's `fig-extract` CLI (local `.fig` decoder — no Figma API, no plan-tier dependency) has ALREADY been run (2026-07-27, run dfc093d5) over all six Parts Town Figma files including both native mobile files. Artifacts at `/Users/systemsystems/portfolio/Design-Tools/Stage1/fig-out/`: Parts-Town-Design-System = 713 tokens (340 color / 155 text_style / 92 number / 17 effect_style; 22 unresolved), 1,494 components, 202 variables; cross-file twin index of 3,565 component keys. What's missing is only the back half: no DTCG emission anywhere (their `fig_local_tokens` is a flat proprietary shape; aliases resolved to values, reference chains lost), and the MCP surface doesn't expose fig-extract (CLI + artifacts on disk). So PT Move 1 collapses to a **Forge-side adapter** (m04). Per [[no-missions-in-other-teams-repos]]: all adapter code lives in Forge; anything we want from Stage1 (alias-chain preservation, MCP exposure) goes as a cmos_message, adoption their call.

---

## Missions

### m01 [M] FF#23 — heatmap visualMap.dimension + SSR paint probe

Consumer bug (Forge-Demos intel_alert 6b595d87, Demo 04 Hero 2): dataset-backed MarkRect heatmap with trailing non-measure fields emits a dimensionless `visualMap`; ECharts binds it to the LAST dataset dimension (a string) → cells paint `fill:none` while emission probes pass.

- **RED-first:** new trailing-field fixture (measure NOT last — every existing fixture has the measure last, which is why current tests pass: `echarts-adapter.spec.ts:206-211`). Reproduce blank-paint via the SSR probe below, then fix.
- **Fix site:** `buildHeatmapVisualMap`, `packages/viz-core/src/adapters/echarts-adapter.ts:456-492` — add `dimension` at the CALL-SITE level (precedent: bubble adapter sets `dimension: 3` at its call site, `echarts-bubble-adapter.ts:239`; do NOT touch shared `createVisualMapForScale` — that would move geo goldens `golden-echarts-options.spec.ts.snap:164-180,443-458` + mcp geo snaps). Use the **field-NAME form** (`colorBinding.field`, in scope at :461/:479), not an index — the layered/linked-dataset edge (`convertLinkedDatasets` :245-253 dims diverge from `spec.data.values`) makes an index mis-pointable; name resolves per-dataset. Emit only when cells exist (empty-data path falls to `fallbackDomain`, no row to read). Covers the diverging branch (:462) — same field in scope. Aggregated path is accidentally-correct today (`data-analysis.ts:238` puts measure last); explicit dimension there is behavior-neutral hardening.
- **Second copy of the bug class:** the browser Heatmap component REPLACES the adapter's visualMap with its own dimensionless one — `src/components/viz/Heatmap.tsx:718-746` (`applyHeatmapVisualMap`, applied :213). Fix it in the same mission (own `dimension` or stop overriding), else the component path stays broken after viz-core is fixed.
- **SSR paint probe (the class-closure ask in the report):** echarts@6.0.0 is already a viz-core devDependency (`package.json:39`) with SSR + `renderToSVGString` (`types/dist/echarts.d.ts:1640,11160`). Probe: `echarts.init(undefined, null, {renderer:'svg', ssr:true, width, height})` → `setOption(toEChartsOption(spec))` → `renderToSVGString()` → assert heatmap cell `<rect>`s carry non-`none` fill from the inRange ramp (colors pre-resolved to rgb/hex, never `var(...)` — `echarts-adapter.spec.ts:262-266`). Mirrors the existing Vega `assertDrewMarks` pattern (`viz.render.fidelity.test.ts:91-107`). No new dependency, no DOM, no node-canvas.
- **Predicted churn (grep-verified):** NONE of the existing visualMap tests/goldens move with a call-site fix — s156/s159/s160 blocks are key-targeted not exhaustive (`echarts-adapter.spec.ts:247-542`), facet-limit + diverging-center suites assert min/max only, golden suite has NO heatmap case. All new assertions are owned. #564 zero-golden expected.
- **Mutation bite-proof:** revert the `dimension` emission → new RED (trailing-field fixture + paint probe); existing suite stays GREEN.
- Closeout replies to Forge-Demos on thread 6b595d87.

### m02 [S] FF#22 — LayoutLayer.order: document declaration-order + id-keying, prove it

Consumer bug (Forge-Demos info_push 001bf9ba): `order: ['MarkPoint','MarkPoint','MarkPoint']` fails `uniqueItems`. Grounding verdict: **docs-fix is the CORRECT fix, not a schema relaxation** — the sole consumer `applyLayerOrdering` (`vega-lite-adapter.ts:705-733`) builds a `Map<key,layer>` that collapses duplicate keys, so duplicate trait names in `order` can never address distinct layers regardless of schema; but `inferLayerKey` (:696-703) ALREADY prefers `mark.options.id`, so repeated same-trait marks with distinct ids are orderable today.

- Amend the `order` property description in **BOTH byte-identical schema copies** — `schemas/viz/normalized-viz-spec.schema.json:671-676` AND `packages/viz-core/src/spec/normalized-viz-spec.schema.json:671-676` (parity enforced by `vendored-schema-parity.spec.ts:15-24`; editing one fails the suite). Text: entries match `mark.options.id` (preferred; give repeated same-trait marks distinct ids), falling back to `mark.trait`; omitted/unmatched → declaration order, later on top; duplicates rejected because duplicate keys cannot address distinct layers.
- Regenerate types: `pnpm generate:schema-types` (JSDoc lands at `normalized-viz-spec.types.ts:213-216`; CI runs `--check`).
- **Positive proof test (owned, new):** three same-trait MarkPoint marks with distinct `options.id` + `order` by ids → paint order matches; plus keep-green declaration-order fallback (`vega-lite-adapter.test.ts:99-119` must not move).
- Optional sympathetic edits: `orderHint` description (`schemas/traits/layout-layer.parameters.schema.json:30`, `traits/viz/layout-layer.trait.ts:41`, yaml :32) + `docs/viz/normalized-viz-spec.md:73-75`.
- **Predicted churn (grep-verified):** none — all three existing `order` usages are unique string keys; no test asserts duplicate rejection; mcp-server has no LayoutLayer schema copy (boundary intentionally permissive, `artifact.certify.input.json:5`).
- Closeout replies to Forge-Demos on thread 001bf9ba.

### m03 [S] Token-platform spike — ios-swift/compose outputs on SD ^4.4.0

The mobile memo's cheapest genuinely-informative fact: add `ios-swift` and `compose` platform blocks to the tokens build (`packages/tokens/scripts/build.mjs` + `style-dictionary.config.cjs` — zero mobile formats today) on the PINNED style-dictionary ^4.4.0 (package.json:207 — no upgrade), run the build, and prove or falsify the one unverified blocker: tokens-studio preprocessor compatibility with SD's native transform groups.

- Deliverables: generated `.swift` + Compose/Kotlin token files (additive artifacts, not goldens) + a short findings note (works / what broke / v5-needed?).
- `tokens:validate` stays 322 EXACT unless the new platforms alter the validated set — any count change is decision-recorded, not silent.

### m04 [M] Stage1→DTCG adapter v0 — the Move-1 collapse

Forge-side adapter: `fig_local_tokens` (Stage1's flat `{name, kind, source, values:[{mode,value}]}` shape) → DTCG (`$value`/`$type`; modes → theme/token-set structure Forge's pipeline can consume). Input: the EXISTING 2026-07-27 artifacts, starting with `Parts-Town-Design-System.tokens.json` (713 tokens). Validate output through the tokens build.

- Scope v0: `color`, `number`, `text_style` kinds (587 of 713); effect/grid/boolean/string deferred with a disclosed list.
- **Disclosed limitations (state, do not silently absorb):** aliases arrive value-resolved (DTCG `{token.path}` reference structure is LOST — Stage1 tracks chains internally; recovering them is a Stage1 ask, message not mission); 22 unresolved tokens likely mean an unsupplied upstream library (client question); artifact staleness vs the client's live Figma is unknown (extraction 2026-07-27; Derek's call whether to re-run fig-extract on fresh exports).
- Adapter lives in Forge (suggest `packages/tokens/` tooling or `tools/`); NOTHING written into Stage1's repo. A cmos_message to Stage1 (thanks + the alias-chain/MCP-exposure asks) goes at closeout — adoption their call.
- Output = the PT brand's raw token material, feeding s167. Success = a DTCG file that `tokens.build` ingests without error + a mapping coverage report (N converted / N skipped / N unresolved).

### m05 [S] Mobile sandbox spike — certify-native feasibility end-to-end

One afternoon, per the mobile memo: install XcodeBuildMCP, boot a headless iOS simulator, drive a scratch screen (SwiftUI or Expo) styled from m03's generated tokens, extract the accessibility hierarchy, run `performAccessibilityAudit`. Deliverable: a feasibility note — what worked, what an MCP `certify.native` would need, machine cost observed. Precondition: Xcode present + ~50 GB disk (abort-and-report if not; that answer is itself the deliverable). No Forge code changes.

### m06 — Closeout

Full gate sweep per [[forge-closeout-gate-sweep]], all NAMED invocations (standing rule 17):
- viz-core `pnpm --filter @oods/viz-core exec vitest run` = **1193** + owned delta
- mcp-server `pnpm --filter @oods/mcp-server run test` = **3978** (after dist rebuild — its vitest resolves @oods/viz-core→dist)
- root `npx vitest run --project core` = **4638 tests / 426 files** (4618+20 skipped / 424+2) — verified at HEAD 2ecd3ae 2026-08-01
- scale `pnpm --filter @oods/mcp-server run test:scale` = **62** · `tokens:validate` = **322** (m03 delta decision-recorded if any)
- root `pnpm typecheck` PASS · `pnpm install --frozen-lockfile` clean · **ZERO owned golden (#564)** — m03/m04 outputs are NEW files, not golden moves
- pm2 `oods-forge-bridge` restart if dist changed (mine, never Derek's) + :4466 health check
- Forge-Demos replies on threads 6b595d87 (FF#23) + 001bf9ba (FF#22); Stage1 message (m04 asks)
- Line-item charter-diff against this memo; deviations amend the memo in the same change.

**DAG:** m01–m05 are parallel roots (disjoint surfaces: viz-core adapter / schemas / tokens build / new adapter module / external tooling). m06 Requires all five.

**Honest-claim ceiling:** m01 closes FF#23 for the adapter + browser-component paths with paint-level proof, scoped to dataset-backed quantitative/diverging MarkRect heatmaps; m02 documents (not widens) order semantics and proves the id-keyed pattern; m03/m04/m05 are spikes/adapters — they produce artifacts and verdicts, not certified capability claims.

---

## Roadmap after s166 (recorded, not chartered — each sprint gets its own planning pass)

1. **s167 — brand pipeline real** (PT Move 2, 2–4 wk, may split): `[data-brand]` CSS generated from token sources into the tokens package build (kills drifted `apps/explorer/src/styles/brand.css`); brand enum widened out of `["A"]` (3 schema/type files); `brands/PT/{base,dark,hc}.json` seeded from m04's DTCG output; font-loading hook (Museo Slab/Effra); viz-palette brand binding. Closes the fidelity pillar's "brand seam no-op" gap regardless of PT outcome.
2. **s168 — responsive crawl**: breakpoint tokens → view-context collapse + contextPanel drawer → mobile Playwright/VRT/Storybook-viewport guardrails → viz ResizeObserver ports → touch targets. (~2 wk; anchors in the mobile memo §1.)
3. **s169 — PT delivery repo + pilot**: client-owned org/scope, `@partstown/tokens`, private Storybook, governance docs, pilot surface (parts-commerce screens; Gate-5-boundary fallback = generic commerce surface). LICENSE files for viz-core/viz-render land no later than here.
4. **s170+ — mobile walk** (gate OPENED 2026-08-01: PT mobile = YES, iOS+Android Figma in hand; sequenced after pilot): N×M resolved brand×theme token sets, trait/object registry as cross-platform spec layer, `certify.native` prototype over the m05 toolchain. Native component code lives in the app repo, not Forge.
5. **Phase-2 pocket:** Railway-hosted Forge MCP endpoint (infra already paid) — after the artifact pipeline is live.

**Client questions still open (Derek):** commercial shape (Q1), Figma tier confirm (Q2 — moot for ingestion since fig-extract is local, still relevant for future sync), registry policy (Q3), re-platform timeline (Q4), ownership day one (Q5), scope tokens-vs-componentry (Q6 — conditions s169's delivery shape), Gate-5 boundary (Q7), WCAG/ADA appetite (Q9).

---

## Build amendments (build session PS-2026-08-01-004, 2026-08-01)

Line-item charter-diff ran clean; three small deviations, all additive hygiene, none touching a
chartered surface:

1. **m04 — `.gitignore` exception `/artifacts/tokens/**`** (mirrors the structured-data pattern):
   the memo placed the DTCG output in the repo but `/artifacts/*` was blanket-ignored; the
   deliverable and its conformance/SD-ingest tests must survive a fresh clone.
2. **m02 — `generated/types/traits/layout-layer.parameters.ts` also regenerated**: the
   sympathetic `orderHint` edit to `schemas/traits/layout-layer.parameters.schema.json` turned
   out to be a codegen SOURCE; `generate:schema-types --check` forced the regeneration (clean).
3. **m03 — `build.mjs` success-log lines extended** to list the two new mobile artifacts
   (cosmetic; the memo chartered config-only platform blocks).

Final gate numbers: viz-core 1193→**1205** (+7 m01, +5 m02 owned) · mcp-server **3978** EXACT
(fresh dist) · root core **4651/428** = 4638/426 + 13 tests/2 files owned (m01 component 2,
m04 adapter 11) · scale **62** · tokens **322** EXACT · root typecheck PASS · frozen-lockfile
clean · ZERO owned golden · bridge restarted ↺, :4466 healthy.
