# s109-m01 — @oods/viz-core extraction record (Rule-1 audit + decisions)

Durable record of the mission-start audit (done before any file move) and the
extraction decisions, captured here because the CMOS `decisions[]` channel has a
known marshalling-loss risk (decision #632). Authoritative for Phase-1 follow-up.

## Move-set — the verified headless beachhead (26 files)

Import-closure traced from the #681 named seeds. **Clean**: zero React / hook /
context / `.tsx` coupling anywhere in the set. Files moved into
`packages/viz-core/src/` preserving subdir structure:

- `spec/normalized-viz-spec.ts`
- `adapters/{vega-lite-adapter, vega-lite-layout-mapper, echarts-adapter, echarts-layout-mapper, echarts-interactions, interaction-propagator, renderer-selector, scale-resolver}.ts`
- `patterns/{index, suggest-chart, chart-patterns-v2, interaction-scorer, layout-scorer, responsive-scorer, pattern-field-helpers}.ts`
- `a11y/{index, data-analysis, equivalence-rules, facet-table-generator, format, narrative-generator, table-generator}.ts`
- `transforms/stack-transform.ts`, `encoding/color-intensity-mapper.ts`, `tokens/scale-token-mapper.ts`

### Corrections to #681's named seed list
1. **`adapters/interaction-propagator.ts` was missing** from the seed list. It is
   a transitive dep of the named `echarts-interactions.ts`, headless, and must
   move → the set is **26**, not 25.
2. **`patterns/index.ts` is the ~1300-line chart-patterns DATA module** (the
   `chartPatterns` array + `ChartPattern`/`IntentGoal`/`PatternField` types), not
   a thin re-export barrel. Clean leaf, zero imports.

## Cross-boundary refs (the only extraction blockers) + resolution
- Spec IR reached repo-root `generated/types/viz/normalized-viz-spec.ts` (via `~/`
  + `../../../`) and `schemas/viz/normalized-viz-spec.schema.json` (via `../../../`,
  `assert {type:json}`). Several adapters also imported the generated type via `~/`.
  → **VENDORED** (copied) both into `packages/viz-core/src/spec/`
  (`normalized-viz-spec.types.ts` with a sync header + `normalized-viz-spec.schema.json`);
  rewrote all intra-package imports to package-relative paths; `assert`→`with`.
  Repo-root originals **kept** — codegen owns them and the generated-type retarget
  is deferred to Phase 1 (#681). Intentional, header-documented duplication.
- `@oods/tokens` (color-intensity-mapper) — normal workspace dep, declared in the
  package. Adapters are **pure spec→spec** (no vega/vega-lite/echarts/d3 runtime
  deps), so the package needs only `ajv ^8.17.1` + `ajv-formats ^3.0.1` + `@oods/tokens`.

## Build pitfalls (all handled in-mission)
1. `assert {type:json}` → `with {type:json}` (Node 24.6.0).
2. Runtime-schema JSON: vendored local file, **inlined by esbuild** → self-contained, no runtime file dep.
3. `@oods/tokens` default-import-of-CJS interop — verified **non-degraded** (cssVariables populated; resolved colours real) in source tests + the built CJS *and* ESM.
4. Build order `@oods/tokens` → `@oods/viz-core` (declared dep; tokens built first).

## Template + resolution notes
- Mirrors `@oods/a11y-tools` (type:module, tsup dual ESM/CJS, exports map, `.js`
  relative-import convention). **Deviation:** tsconfig `moduleResolution: "bundler"`
  (not `"node"`) to support the JSON import attribute + `.js` resolution in the dts build.
- Root tsconfig is `moduleResolution: "Bundler"` with `@oods/*` → `./packages/*/src`,
  which maps the package **root** to source but does **not** compose for subpaths.
  Every existing `src/` `@oods/*` import is bare. → drove the compat design below.

## Phase-0 compat decision: re-export shims (NOT consumer repointing)
Each original `src/viz/<subdir>/<file>` move-set path was replaced with a 1:1
relative re-export shim into `packages/viz-core/src`. Rationale:
- Single source of truth (the "one engine" goal).
- Also covers the **deferred** spatial/echarts/hook files that deep-import moved
  modules — a partial repoint of only the 53 beachhead consumers would strand them.
- Zero churn risk; root typecheck + 29 root viz tests stay green.

The mission criterion's *outcome* (consumers resolve into the package; viz suite
green) is met via shims; the *mechanism* (in-place shim vs edited import) differs.
**Deferred to Phase 1:** the consumer rewire (repoint the ~137 sites to
`@oods/viz-core` and delete the shims) + the generated-type/schema retarget that
removes the vendored duplication.

## Verification (all green)
package build (ESM+CJS+dts) · 12 package tests via source alias · dual-build node
smoke (CJS+ESM exports + tokens interop non-degraded + bar-chart round-trip
valid, data.values.length=4) · root `tsc --noEmit` 0 errors · 29 root viz/token
tests via shims · eslint `src/viz` clean.
