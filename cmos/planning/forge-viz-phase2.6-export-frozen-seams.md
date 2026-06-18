# Forge Viz — Phase 2.6 (Render-to-SVG Export) FROZEN SEAMS

**Sprint:** sprint-115 · **Mission:** s115-m01 (freeze-before-compute) · **Date:** 2026-06-18
**Convention:** the s114 standing freeze-before-compute ritual (decision #790) — record every
undecided seam as a CMOS decision **and** an in-repo note BEFORE any code, so m02–m05 add code,
not schema/contract churn.

This note is the **contract** the rest of sprint-115 executes against. Every seam below is FROZEN.
A later mission that needs to deviate must re-open the seam as a new decision first.

Companion: `forge-viz-phase2.6-export-scoping-memo.md` (the grounding/why). This file is the *what's
frozen* (the how-it-binds). All line anchors below were code-verified at freeze time (2026-06-18).

---

## Seam (a) — PACKAGE BOUNDARY + DEP POLICY

- The rendering runtime lives in a **NEW** package **`@oods/viz-render`** at `packages/viz-render`.
  The pnpm workspace glob `packages/*` (`pnpm-workspace.yaml:2`) already covers it — no workspace
  manifest edit needed.
- `vega-lite` and `vega` (the latter needed to compile + instantiate a headless view) become
  **RUNTIME deps of `@oods/viz-render` ONLY**, promoted from the ROOT devDeps
  (`package.json:211` `vega-lite ^6.4.1`, `:236` `vega ^6.2.0`).
- **`@oods/viz-core` stays the zero-runtime spec transformer.** Its runtime deps are UNCHANGED:
  `@oods/tokens`, `ajv`, `ajv-formats`, `topojson-client` (`viz-core/package.json:28-33`).
  `echarts` stays a viz-core **devDep** (`:38`). **DO NOT add `vega`/`vega-lite` to viz-core** — it
  would change the install weight/contract for every spec-only importer (not additive-in-spirit).
- Build/test tooling mirrors viz-core: tsup build (`viz-core/package.json:23`), own
  `vitest.config.ts` with a coverage floor (`viz-core/vitest.config.ts` pattern).
- **FROZEN:** rendering runtime is a separate package; viz-core's dependency surface does not move.

## Seam (b) — SCHEMA SHAPE (opt-in input flag + additive output field)

- **Input:** add an opt-in boolean `output.html` (default `false`) on `dashboard.render.input.json`,
  alongside the existing `output.compact` / `output.echarts` controls
  (`dashboard.render.input.json:80-96`; handler reads them at `dashboard.render.ts:35-36`).
- **Output:** add an additive `html` string field (and OPTIONALLY a per-panel `svg` string) to
  `dashboard.render.output.json`.
- Both schemas are `additionalProperties:false` (input `:14`, output `:8`, output sub-objects e.g.
  `output` block `:34`, `chartPanelResult` `:78`). So adding these fields is a **DELIBERATE additive
  edit** — not a free-for-all. The shape is frozen here; the actual schema edit lands in **m03**
  (the 4-place schema surface: source schema → regen types → re-vendor byte-identical copies where
  parity tests assert it → hand-edit `dashboard.render.{input,output}.json` + regenerate
  `generated.ts`; see `scripts/types/schema-routes.ts`, `packages/mcp-server/src/schemas/generated.ts`).
- **FROZEN:** `output.html` (boolean input) + `html` (string output) + optional per-panel `svg`
  (string). No other new fields.

## Seam (c) — SINGLE-RENDERER SCOPE (Vega-Lite → SVG only; geo → a11y placeholder)

- v1 renders **Vega-Lite panels to SVG only**. The output schema already splits the two payloads:
  `spec` = **Compiled Vega-Lite** (tabular: trend/breakdown — `dashboard.render.output.json:85`)
  vs `echartsSpec` = **ECharts-primary** (geo/hierarchy/network — `:86`).
- So v1 renders the VL panels — **KPI tiles + trend (line) + breakdown (bar)** — to SVG, and emits
  an **a11y-DESCRIBED PLACEHOLDER** for ECharts-primary panels (geo: `echartsSpec` present,
  `spec = {}`). Do NOT render ECharts-primary panels in v1.
- **REJECTED (out of scope this sprint):** dual-renderer SVG (ECharts→SVG), PNG, any
  headless-browser / canvas rasterization.
- **FROZEN:** one renderer (VL→SVG); geo is an a11y-described placeholder; no PNG, no second renderer.

## Seam (d) — SVG DETERMINISM CONTRACT (byte-stable)

- Prefer vega's **HEADLESS** `view.toSVG()`: `new vega.View(vega.parse(compiledVegaSpec), { renderer: 'none' })`
  then `await view.toSVG()`. **No jsdom, no canvas** in the runtime (jsdom is a ROOT devDep at
  `package.json:196`; it must NOT leak into `@oods/viz-render`'s runtime deps).
- The emitted SVG string must be **BYTE-STABLE run-to-run AND machine-to-machine**:
  - strip / normalize auto-generated ids (vega clip-path / gradient ids),
  - disable hover + animation (`hover: false`, no transitions),
  - pin text-metric measurement (a fixed font-metric shim / `vega.textMetrics` config) so glyph
    advance widths do not vary by platform font availability.
- **FROZEN:** headless `view.toSVG()`, no jsdom/canvas, deterministic (no dynamic ids, no hover/anim,
  pinned text metrics). Proven by the m05 render-twice-identical golden.

## Seam (e) — ADDITIVITY CONTRACT (opt-in, byte-identical when absent)

- When `output.html` is **ABSENT** (or `false`), `dashboard.render` output is **BYTE-IDENTICAL** to
  the s114 baseline — zero new fields on the wire, **zero golden re-bake**.
- This is the s114 standing convention (decision #790): a new optional field claiming "opt-in
  additive" must prove it with a byte-level snapshot-diff (0 deletions) + an explicit absent-vs-present
  contrast. m05 supplies that proof.
- **FROZEN:** absent `output.html` ⇒ existing `dashboard.render` output unchanged, to the byte.

## Seam (f) — LOCKFILE-ADD POLICY

- Unlike s114 (which added NO deps), this sprint **ADDS runtime deps** (`vega-lite`/`vega` →
  `@oods/viz-render`). `pnpm-lock.yaml` updating is a **DELIVERABLE**, not drift.
- The closeout `pnpm install --frozen-lockfile` gate runs **AFTER** the intentional lockfile update —
  it verifies the committed lockfile matches, it does not forbid the add.
- **FROZEN:** the lockfile change is expected; `--frozen-lockfile` is a post-update consistency gate.

## Seam (g) — CONSUMER CONTRACT (two consumers, not browser-only)

- The emitted artifact serves **BOTH**:
  1. a **human embed** (the `cmos-dashboard` Railway surface that today hand-rolls chart.js@4 from a
     CDN — the duplication s115 collapses), and
  2. **agent self-inspection** (an agent seeing its own composed dashboard as on-brand, accessible
     markup to verify/iterate — the on-strategy "agent-native generative viz" use).
- Therefore the artifact is **self-contained** (inline SVG + inline brand tokens + computed
  narrative; m04). Do NOT scope it browser-only and do NOT assume a downstream CSS bundle for the
  HTML path (the compact JSON path keeps its deferred `tokenCssRef` at `dashboard.render.ts:123-124`;
  the HTML export inlines instead — m04).
- **FROZEN:** self-contained artifact serving human embed + agent self-inspection.

## Seam (h) — NON-GOALS (scope fence — hold the line)

Explicitly OUT of scope for sprint-115 (the deferred boundary; do not drift into these):

- brush / interval **range** selections (revisit only after a selection *producer* + a rendered
  surface exist),
- a second dashboard template / general composer / template registry,
- UiSchema / Option-B projection,
- ECharts-primary **rendered** output (geo/sankey/network SVG),
- PNG / headless-browser rasterization,
- the semantic-grounding **build** (gated on the m08 Phase-3 memo),
- duplicate-period roll-up; timezone/calendar-aware `prior_period` beyond UTC + last-N-distinct.

**FROZEN:** the above are non-goals; any of them requires re-opening scope with derek.

---

## Forward anchors (so m02–m05 execute without re-grounding)

| Mission | Key anchors |
|---|---|
| m02 (emitter) | `packages/viz-render/*` (new); `viz-core/package.json:23` (tsup), `viz-core/vitest.config.ts` (coverage floor); ROOT `package.json:211`/`:236` (vega-lite/vega); `viz-core/src/adapters/vega-lite-adapter.ts` (the VL spec source shape). |
| m03 (wire) | `dashboard.render.ts:34-36,114,123-133`; `dashboard.render.input.json` (output block `:80-96`); `dashboard.render.output.json:8,32,85,86`; `scripts/types/schema-routes.ts`; `packages/mcp-server/src/schemas/generated.ts`; `tests/contracts/schema-types.contract.test.ts`. |
| m04 (narrative + tokens + a11y) | `dashboard.render.ts:103` (narrative echo today), `:123-124` (deferred tokenCssRef), `:156` (kpiA11y); `viz-core/src/a11y/narrative-generator.ts:24` (`generateNarrativeSummary`), `:34-38` (author-override fallback); `viz-core/src/spec/dashboard.types.ts:440,453` (`DashboardA11YSpec.narrative`); `viz-core/src/adapters/echarts/token-resolver.ts` (token application reference). |
| m05 (goldens) | net-new rendered-output (SVG/HTML string) goldens — existing goldens are JSON snapshots: `viz-core/test/golden-profiles.spec.ts`, `golden-echarts-options.spec.ts`; CI step "Run colocated viz.render + dashboard.render goldens" in `.github/workflows/ci.yml` (the `dashboard.render.test.ts` + `dashboard.render.fidelity.test.ts` line); coverage floors for `@oods/viz-render` + viz-core; `tests/contracts/schema-types.contract.test.ts` green. |

## Two false premises corrected at grounding (do not re-introduce)

1. `viz-core` does **NOT** compile VL→SVG today — it emits specs. The runtime is net-new (m02).
2. ECharts has **NO** Node SSR string renderer at `ssr/` (only `ssr/client`). That is why the single
   renderer is VL→SVG and geo is a placeholder, not "render everything via ECharts SSR."
