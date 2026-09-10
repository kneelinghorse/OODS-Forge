# s190-m02 — Public SVG pixels

`viz.render` now returns SVG on `output.svg:true`, with exact-byte `svgHash`, UTF-8 `svgBytes`, a cached `svgRef`, and an actual-size/engine/light/A render echo. The existing spec-only output remains unchanged. All SVGs use the same `@oods/viz-render` functions as certification. ECharts bytes are structurally normalized before return and hashing. Renderer failures return registered `OODS-V165` with status error and no successful SVG/spec identity.

[Matrix](matrix.json), produced by [capture.ts](capture.ts), retains two matching hashes for each of 13 types and five matching Cartesian certification hashes. All 13 SVG files are under `svg/`. [Dashboard](dashboard.html) draws all 11 admitted panel types; its repeated exact HTML hash is in the matrix. Chord and flow_map retain their #881 dashboard exclusion.

## Changes and decisions

- The public SVG leg wraps the existing spec handler; default compact/spec payload and content hashes are preserved. SVG references use the existing TTL value cache.
- The ECharts worker now accepts positive safe-integer dimensions; the certification default remains 600×400. Both pre-dispatch validation and worker preparation carry the requested dimensions. This closes the old fixed-viewport guard that prevented dashboard span-sized charts.
- Vega's existing sizing behavior adds configured padding. Requested dimensions are echoed under `output`; `render.width/height` report the actual root SVG dimensions. Existing Cartesian dashboard bytes were preserved.
- The quantitative heatmap fixture revealed that certification previously rendered only when contrast could grade a unit. The determinism leg now renders contrast-exempt Cartesian charts too, reusing a contrast render when available and keeping the independent second render. Contrast verdicts, accuracy rules and 5-certified/8-uncertified coverage do not change. CMOS decision #1849 records this necessary correction.
- [Golden attribution](golden-attribution.json): only the HTML export entry in `dashboard.render.fidelity.test.ts.snap` moved, replacing the choropleth placeholder with SVG. Both existing Cartesian SVG strings are byte-identical, and all other entries are unchanged. No ECharts default hash-matrix or viz-render SVG golden moved.
- The pre-existing Cartesian fidelity operands were extracted unchanged into a shared fixture for the original fidelity test and new public SVG contract. CI now names the additional colocated file; the guard passes. Tool registration and both policy layers are unchanged.

## Verification

- [Public contract and certification](svg-contract-corrected.log): 24/24 assertions, including all 13 types, exact byte hashing/cache resolution, accessible graphics roles, normalized ECharts structural tokens, five render-certify identities, dimension controls, shared-render mutation, deliberate divergence, both renderer-throw cases and dashboard 11/11 plus an error placeholder.
- [viz-core](viz-core-tests.log): 67 files, 1,390 tests passed; coverage thresholds passed.
- [viz-render final](viz-render-final.log): 6 files, 68 tests passed; coverage thresholds passed. Includes invalid dimensions before worker creation and unchanged default normalized goldens.
- [MCP focused group](mcp-viz-tests-sequential.log): 19 files, 375 tests passed. This includes all 15 colocated files in the CI list plus certification determinism, spec-only compatibility, contrast-fault and prose contracts.
- [Final build](mcp-build.log), [root typecheck](typecheck-final.log), [schema types](schema-types-check.log), [API docs](docs-check.log) and [final prose check](prose-final.log) passed. No full-suite capture was run; the four-suite capture remains m06.

Failures are retained and accounted for. The first public run exposed the absent heatmap render hash, Vega padding, and an incomplete test dashboard lacking its required a11y block. [The next run](svg-contract.log) exposed the fixed ECharts viewport guard; implementation and expectations were corrected before the successful run. [The initial MCP group](mcp-viz-tests.log) overlapped the viz-render test command's destructive dist rebuild and hit three missing-emitter failures; the unchanged group passed sequentially after that build. CMOS learning #546 records the ordering requirement. [A single-file renderer run](echarts-dimensions-tests.log) passed 31 tests but exited 1 on whole-package coverage thresholds; the full six-file renderer suite subsequently passed all 68 tests and its coverage gate. No failure or skip was treated as a pass.

This is the public-pixel baseline for m03's scoped-token comparison. The live bridge remains the m01-delivered Sprint 189 head; these changes are confined to the s190 worktree. Independent sprint review remains required.
