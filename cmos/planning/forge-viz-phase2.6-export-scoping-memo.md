# Forge Viz — Phase 2.6 (Render-to-SVG Export) Scoping Memo

**Sprint:** sprint-115 · **Ratified:** derek, 2026-06-18 (planning PS-2026-06-18-006)
**Grounding:** 12-agent ground→synthesize→critique workflow (task `wjvgofetk`); every factual claim below was code-verified.

---

> **⚠️ CORRECTION (2026-06-18, post-sprint, by derek): the "consumer pull" / "demand signal" framing in this memo is RETRACTED.** There is NO external consumer that pulls from Forge, and Forge is NOT a hosted service (no current plans to be one). The real and only consumer of `output.html` is an AGENT using the Forge MCP tools to render its own composed dashboard. The mission that assumed a `cmos-dashboard` cutover (m06) was correctly dropped. Headless integrations and any production-site dependency are SEPARATE initiatives requiring explicit discussion — never an implied sprint goal. See the standing project constraint captured this date (CONSUMER MODEL). The export capability itself is real and shipped; only its consumer-pull justification was the error.

## 0. TL;DR

Across phases 0/1/2/2.5 the viz arc has promised **"on-brand, accessible output *by construction*"** — but `dashboard.render` output **never becomes pixels.** `@oods/viz-core` carries **zero rendering runtime**, and the one real shipped consumer (`cmos-dashboard` on Railway) hand-rolls chart.js@4 from a CDN to redraw the exact shape Forge already composes.

Sprint-115 adds an **opt-in `output.html`** (HTML + inline SVG), single-renderer (Vega-Lite→SVG), for the **existing metric-overview template only**, in a **new `@oods/viz-render` package**. The demand signal is that a sibling project (`cmos-dashboard`) already hand-rolls chart.js to redraw the same shape; once the export ships we **notify that team via `cmos_message`** — adoption is their call, in their repo (we never author work there). Depth-not-breadth: one bounded, goldenable beachhead — not "export anything," not a general composer, not PNG.

---

## 1. Where we are (the phase ladder)

Inside **Phase 2** of the 5-phase flagship ladder (`forge-viz-flagship-strategy.md` §4):

- **Phase 0** (s109): reconnect `src/viz` → MCP `viz.render`; engine extracted as `@oods/viz-core`. ✅
- **Phase 1** (s110–s112): data-aware recommender + the **full 11-chart matrix** (tabular + hierarchy/network + geo). ✅
- **Phase 2** (s113): decision-centric dashboards — fixed metric-overview `DashboardSpec` + `dashboard.render` composing bare `viz.render` specs, with cross-filtering. ✅
- **Phase 2.5** (s114): KPI explicit period-axis via `temporal.ts`. ✅

**Phase 3** (semantic grounding / NL→viz — the differentiator) is the next *strategic* axis but is **gated** on two open questions: §5.1 (data-source contract) and §5.4 (scope-of-BI). It is decision-memo-ready, not sprint-ready → addressed by the non-build **m08** this sprint.

The unrealized cross-cutting moat — output that becomes an **on-brand, accessible artifact** — is what s115 finally lands.

---

## 2. The pick and why (grounding verdict)

**Render-to-SVG export** was rank-1, the **only** candidate with verified consumer pull (every other candidate scored 2/5). The slate's tail all failed for the **same root reason: depth on a payload nothing renders.**

| Candidate | Verdict | Why |
|---|---|---|
| **dashboard-html-export** | ✅ ENDORSE (w/ changes) | Only verified, shipped, currently-duplicating consumer; realizes the moat at the surface where it becomes visible. |
| brush/interval *(the s114-review lean)* | ❌ REJECT (high) | Nothing renders **or produces** selections (no producer outside tests); range predicates already expressible via `Selection.predicate`; "readiness" rested on a namespace collision (per-chart `IntervalSelection` Vega param ≠ cross-filter `SelectionState`, which explicitly defers ranges). Its own risk note: "sequence after export." |
| semantic grounding (Phase 3) | ❌ REJECT (high) | No governed-measure substrate exists (`catalog.list` is a component/trait catalog; strategy §10b/:7 says "semantic catalog ≠ metrics layer"); gated on open §5.1/§5.4. → **m08 memo** instead. |
| second dashboard template | ❌ REJECT (high) | The "thin default-resolver" seam doesn't exist; the spine is already template-agnostic, so the only net-new code is the registry the guard defers; arbitrary layouts already authorable via `layout.columns`/`placements`. |
| anomaly-narration | ❌ REJECT standalone | Twice-deferred YAGNI; `kpiA11y` already emits a truthful computed sentence. → **folded into m04** as the agent-readable narrative inside the export. |

**This reverses the s114-review's brush/interval lean** — recorded explicitly so the reversal is auditable.

---

## 3. Verified scope corrections (frozen in m01 — non-negotiable)

1. **Single renderer = Vega-Lite → SVG.** The output schema already separates `spec` (Compiled Vega-Lite, tabular — `dashboard.render.output.json:85`) from `echartsSpec` (ECharts-primary: geo/hierarchy/network — `:86`). v1 renders VL panels (KPI tiles + trend + breakdown) to SVG; **ECharts-primary panels (geo) render as an a11y-described placeholder.** Dual-renderer SVG is XL → DEFER.
2. **Rendering runtime in a NEW package `@oods/viz-render`** (`packages/viz-render`; workspace globs `packages/*` already cover it). `vega-lite`/`vega` become runtime deps of *that* package only. **Do NOT add vega to `viz-core`** — it would change the weight/contract for every spec-only importer (not additive-in-spirit). `viz-core` runtime deps stay `@oods/tokens`, `ajv`, `ajv-formats`, `topojson-client` (`viz-core/package.json:28-33`).
3. **Headless determinism.** Prefer vega's headless `view.toSVG()` (no jsdom/canvas in the runtime); strip dynamic ids, disable hover/animation, pin text-metric measurement → byte-stable SVG run-to-run and machine-to-machine.
4. **Byte-stable golden harness is net-new** (existing goldens are JSON spec/option snapshots: `golden-profiles.spec.ts`, `golden-echarts-options.spec.ts`) → its own mission (m05).
5. **Opt-in additivity (s114 standing convention):** `output.html` absent ⇒ `dashboard.render` output **byte-identical** to s114 (`additionalProperties:false` on the output schema is a deliberate edit; absent-path re-bakes zero goldens).
6. **Lockfile:** unlike s114, this sprint **adds runtime deps** (`vega-lite`/`vega` → `@oods/viz-render`). `pnpm-lock.yaml` updates as a *deliverable*; the closeout `--frozen-lockfile` gate runs **after** the intentional update.
7. **Two consumers, not one.** The emitted artifact serves a human embed (cmos-dashboard) **and** agent self-inspection (an agent seeing its own dashboard to verify/iterate — more on-strategy for the "agent-native generative viz" differentiator). Don't scope it browser-only.

Two false premises in the original framing were corrected: `viz-core` does **not** compile VL→SVG today (it emits specs); ECharts has **no** Node SSR string renderer at `ssr/` (only `ssr/client`).

---

## 4. Mission slate (N=7; m06 dropped)

Critical path **m01→m02→m03→m04→m05→m07** (linear); **m08 parallel** (non-build).

| # | Mission | Notes |
|---|---|---|
| **m01** | FREEZE the export seams | Package boundary + dep policy, schema shape, single-renderer scope, SVG determinism contract, additivity, lockfile-add policy, consumer contract, non-goals. Record as CMOS decisions before any code. |
| **m02** | `@oods/viz-render` + VL→SVG emitter | New package; `renderVegaLiteToSvg` (compile→parse→headless `view.toSVG()`); byte-deterministic; own vitest + coverage floor. |
| **m03** | `output.html` through the `dashboard.render` seam | Opt-in control; compose self-contained HTML (SVG panels + KPI tiles + geo a11y-placeholder); 4-place schema edit + `generated.ts`; absent-path byte-identical. |
| **m04** | Computed narrative + brand-token inlining + a11y verify | Reuse `narrative-generator.ts` (`generateNarrativeSummary`, author-override fallback); inline resolved tokens into the export (compact JSON unchanged); assert a11y in emitted markup. Folds in anomaly-narration. |
| **m05** | Byte-stable SVG/HTML golden harness | Net-new rendered-output goldens; determinism; additivity parity (absent-path = 0 deletions). Wire into CI (`ci.yml:579-581`). |
| ~~**m06**~~ | ~~cmos-dashboard cutover~~ | **DROPPED** — never author work in another team's repo. Consumer adoption is coordinated via `cmos_message` (m07), not a mission here; and a consumer can't adopt a capability before it exists. |
| **m07** | Closeout | Rebuild `@oods/*` dists first (incl. the new package); Gen A/B `--check`; `--frozen-lockfile` after the dep-add; ROOT typecheck; coverage; all goldens; #419 scope; test:scale. **Rollout (the build session does this, NOT Derek): pm2 `oods-forge-bridge` restart + dual-path liveness probe.** Notify the cmos-dashboard team via `cmos_message`. Complete + LINK the build session. |
| **m08** | Phase-3 decision memo (**non-build, parallel**) | Resolve §5.1 + §5.4 + the governed-measure data model → `cmos/planning/forge-viz-phase3-scoping-memo.md`. Makes semantic grounding sprint-ready next. |

### Key anchors
- `packages/mcp-server/src/tools/dashboard.render.ts` — `handle` :34, `output.compact/echarts` :35-36, datasets :43, narrative echo :103, schemaVersion :108, output block :114, tokenCssRef :123-124, specRef :127-133, `buildKpiResult` :138, `kpiA11y` :156, `periodBasisLabel` :172, `buildChartResult` :188.
- `packages/mcp-server/src/schemas/dashboard.render.output.json` — `additionalProperties:false` :8, output :32, chart `spec`(VL) :85 / `echartsSpec` :86, error placeholder :112, a11y `narrative` :126-145.
- `packages/viz-core/package.json:28-38` (deps), `pnpm-workspace.yaml` (`packages/*`), ROOT `package.json:211` (vega-lite) / `:236` (vega).
- `packages/viz-core/src/a11y/narrative-generator.ts:24,34-43`; `packages/viz-core/src/spec/dashboard.types.ts:440,453`.
- Goldens: `packages/viz-core/test/golden-profiles.spec.ts`, `golden-echarts-options.spec.ts`; `.github/workflows/ci.yml:579-581`.
- Demand signal (reference only — separate team/repo, NOT edited by us): `cmos-dashboard` hand-rolls chart.js@4 from a CDN to redraw the same KPI/trend/breakdown shape.

---

## 5. Deferred boundary (hold the line)

Brush/interval ranges (revisit only after a selection **producer** + a rendered surface exist); ECharts-primary rendered output (geo/sankey SVG); PNG / headless-browser rasterization; general composer / second template / template registry; UiSchema / Option-B; semantic-grounding **build** (gated on m08's memo); duplicate-period roll-up; timezone/calendar-aware `prior_period` beyond UTC+last-N-distinct.

---

## 6. Process carry-ins (from the s114 review)

- **Open + LINK the build session** at sprint start (s114 closed with 0 learnings / 0 linked sessions).
- **Rebuild changed `@oods/*` dists before the gate sweep** — doubly relevant for a brand-new package downstreams resolve via `dist`.
- `forceComplete` is retired (server-side no-op; build-freshness advisory).
- **Never author missions for another team's repo** — coordinate via `cmos_message`; ship the capability, then notify; adoption is their call.
- **The pm2/bridge restart is the build session's job** (mine), never handed to Derek.

**Refs:** grounding task `wjvgofetk`; `forge-viz-flagship-strategy.md` §3/§4/§5.1/§5.4/§6; `strategic-position.md` (the C-bet); `quality-bars.md` Sprint Conventions + the #419 coverage-sweep criterion.
