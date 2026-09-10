# s191-m01 — dark charts and generated application themes

**State: Implementation verified; accepted exception recorded; m01 complete.** This is build evidence, not independent certification. Build branch `codex/sprint-191-paydown`; sprint base `d3a99d39`; this mission was executed from the prepared planning head `7bcf159a` with the implementation changes present. The receipt artifact hashes bind the generated files; m05 must re-verify at the frozen implementation head.

## Accepted exception — user authorization

The locked mission requires `APP_CSS` to read governed surface/text/border/button tokens and the browser body to equal the resolved scope canvas. It also says light renders may change only for slot 04. Those cannot both hold for the prior light application: its hard-coded body was `#f5f6f8`, whereas A/light is `#FDF3DE`. Standalone loop hosts previously had no scope and a transparent body. The implemented token-based theme behavior changes those light shells. The user explicitly accepted this exception on 2026-09-10: “accept the three files as an attributed exception, complete m01 with the attribution in the README, and continue to m02.” This authorizes the three generated shell-file differences below; it does not widen the allowed chart-pixel changes beyond the attributed palette changes.

Compared with the retained Sprint 190 light workflow artifact, **only three files per framework change**: `index.html` (scope attributes), `src/main.tsx` / `src/main.ts` (scope at mount), and `src/app.css` (token colors and native color scheme). All other generated files are byte-identical. See `browser-proof.json` → `appChanges`.

## Implementation

- Six dark categorical values live in each brand dark source. Scoped emission includes only declared categorical theme tokens. The collision guard permits only the specific shared categorical/default → dark overlay and the preserved HC slot 04; unrelated shared/brand and cross-brand collisions still fail.
- Light slot 04 moves from `oklch(0.6558 0.122 80.37)` to `oklch(0.6488 0.122 80.37)` (`#B78827` → `#B58525`), the nearest four-decimal lightness that passes both light canvases at fixed hue/chroma. Explicit HC slot-04 retention keeps both HC maps byte-identical.
- `contrastPassed` is computed through the unchanged public-handler import list. Nine categorical recipes pass light/dark; heatmap and the three geo types stay exempt. The eight ECharts-primary types remain uncertified.
- `code.generate.options.theme/brand` select light/dark and A/B (defaults light/A), advertised in the input schema, generated and public types, and API docs. Workflow shell/mount attributes, CSS and embedded chart render all use the same scope. HTML artifacts select A rather than the unmatched `default` brand.
- The loop maps explicit theme/brand or compose preferences into generation. Receipt 1.1 adds scope, computed body background and chart canvas fills; version 1.0 remains readable. Verification rejects transparent or mismatched colors. Native color-scheme follows the theme so browser system-color fallbacks are legible.

## Measured contrast

| Scope | Canvas | 01 | 02 | 03 | 04 | 05 | 06 | Min Role-A ΔE00 |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| A/light | #FDF3DE | 4.3579 | 6.8649 | 3.3703 | 3.0019 | 4.1799 | 6.3930 | 9.8774 |
| A/dark | #230900 | 5.0502 | 3.2428 | 6.4586 | 7.5009 | 5.2031 | 3.7016 | 9.9513 |
| B/light | #EBF7FD | 4.4045 | 6.9382 | 3.4063 | 3.0340 | 4.2246 | 6.4613 | 9.8774 |
| B/dark | #041620 | 4.9164 | 3.1568 | 6.2874 | 7.3020 | 5.0652 | 3.6034 | 9.9513 |

Every Role-C ratio is ≥3:1. Role-A clears the fail floor 2 with no low-chroma slot; the honest caution below the clean target 10 remains. `palette-selection.json` retains the candidate values, `token-proof.json` re-measures the built/resolved values.

## Token hash pairs

`token-baseline.json` retains every before-map. `token-proof.ts` rejects any change outside the exact lists below and checks all 24 resolved slot ratios.

| Map | Before SHA-256 | After SHA-256 | Changed keys |
|---|---|---|---|
| flat | `0cc0e991e94d1fed98fe04a1ec4e18b1d9efdfa8835bd7eaa43782eb5b66f968` | `17793f76332c14474b35cef77f469b278c2f78b99b47cee496c18bbc4189b351` | --oods-viz-scale-categorical-04 |
| A/light | `9859098f7abd81b098c9e221a3a250f56feba0e8cb5ac40c45f82e36b3cb4601` | `22f9bfffa145a93ff0b5718b1fb53ed149f76c5c4e14100a26184d1b0b7cdabf` | --oods-viz-scale-categorical-04 |
| A/dark | `7baca1aeb4c0c04be535ea1b0c9222419dc67f5b3570fb4a1ed0c35182d82ecf` | `b789083efd1eae9d2ee92beb94eb796a3e5def4d9c1c6fec3221091f643349ed` | --oods-viz-scale-categorical-01, --oods-viz-scale-categorical-02, --oods-viz-scale-categorical-03, --oods-viz-scale-categorical-04, --oods-viz-scale-categorical-05, --oods-viz-scale-categorical-06 |
| A/hc | `898d6e8024e6f6f61e726dde0d7e1e528d62b101b3a4b8a82608250fe4f5dbfb` | `898d6e8024e6f6f61e726dde0d7e1e528d62b101b3a4b8a82608250fe4f5dbfb` | none |
| B/light | `64445ee93c9ac566db87fbfe8da8f6055f8e52e1bc6d65658af660c4bb60818d` | `e2ff5531d32ef396d7592af3cf8863e7959bd804f23e315d6fd43c0e50d473b3` | --oods-viz-scale-categorical-04 |
| B/dark | `02d058e7323eb715b6a458e0099951ce7be2dc0d60ae35d3720ac4f442fc2563` | `3de9bce176fa78c5b26b610d66b322c821538b6c39d426240f967ea1a1763095` | --oods-viz-scale-categorical-01, --oods-viz-scale-categorical-02, --oods-viz-scale-categorical-03, --oods-viz-scale-categorical-04, --oods-viz-scale-categorical-05, --oods-viz-scale-categorical-06 |
| B/hc | `34fa0ce85389e460e4e36eff4ec8cf5af484ecbf98321c56f79e85426ac99e2e` | `34fa0ce85389e460e4e36eff4ec8cf5af484ecbf98321c56f79e85426ac99e2e` | none |

## Matrix and registry evidence

`matrix/matrix.json` retains all 52 first/second SVG hashes and four first/second dashboard hashes (11 drawn charts each). Each canvas is checked against the resolved scope; implicit scope equals explicit light/A. `viz-observations.json` independently certifies all 52 scope cells through the public handlers: zero fail, 36 measured passes, 16 exemptions. `viz-census.json` equals the committed registry. The contract retains its exact public import-list pin and rejects a hand-flipped contrastPassed cell.

Against Sprint 190, 32/52 public SVG cells are unchanged. Eighteen dark cells (all nine categorical chart types × two brands) change from the dark palette; the only light pixel movers are `svg/force_graph-A-light.svg` and `svg/force_graph-B-light.svg` from slot 04. The full table is `matrix-attribution.json`. Other compiled-option goldens can change even when their fixture does not draw slot 04. The certified runtime matrix changes only its force_graph normalized hash plus the derived epoch; `qualify-matrix.ts` rerenders all eight families twice and retains the change in `certified-matrix-attribution.json`.

## Browser evidence

The final `browser/` tree has 16 receipts and 48 screenshots: light/A and dark/B × standalone list/detail and workflow list/detail × React/Vue × 390/820/1440. Body and visible chart canvases match, errors and overflow are empty. `verify-receipts.ts` validates receipt schemas, colors, screenshot hashes, widths and exact light generated-file movement. The computed **theme/canvas/error/overflow parity** has no differences and an empty allowlist. This does not claim full visual equivalence: the existing #1845 craft items and two competing chart titles remain scoped to m03.

Observed and fixed during verification: the first browser run resolved the body to transparent because the JS-only `--oods-sys-*` aliases are not CSS declarations. CSS now uses native `--sys-*` tokens (learning #551). `browser-initial-background-failure/` retains that failure. Visual inspection then caught black browser-default text; native color-scheme was added, and the final dark workflow/detail screenshot was inspected after correction.

## Focused verification

| Check | Result | Receipt |
|---|---|---|
| Token + design-loop focused root suites | 163 passed | `focused-root.log` |
| Viz core | 1397 passed, 68 files | `viz-core-tests.log` |
| Rebuilt viz render | 69 passed, 6 files after attributed force-graph hash update | `viz-render-tests.log`, `viz-render-verified.log` |
| MCP viz/dashboard/certify/codegen/registry | 1040 passed, 49 files | `mcp-focused-verified.log` |
| Final native-scheme / token-source checks | 33 passed, 3 files | `final-theme-root.log` |
| Final dark/B workflow strict React/Vue compilation and HTML theme | 3 passed | `final-theme-codegen.log` |
| Root typecheck, MCP build, generated-schema drift | passed | `typecheck.log`, `mcp-build.log`, `schema-types-check.log` |

No full four-suite capture was run. No skipped tests were reported by these focused executions. Initial expected old-palette failures are retained in `mcp-focused-initial.log`; snapshot replacement is retained in `mcp-golden-update.log` and `viz-core-golden-update.log`. All replacements are attributed below; custom low-contrast/chroma/collision failure guards remain green.

## Golden attribution

Exact old/new hashes are in `golden-attribution.json`. Historical s172/s179 baseline JSON files are unchanged; their tests derive only the explicitly declared slot-04/scope deltas.

| File | Reason |
|---|---|
| `packages/mcp-server/src/tools/__snapshots__/viz.render.fidelity.test.ts.snap` | viz.scale.categorical.04: L 0.6558 -> 0.6488, #B78827 -> #B58525; Role-C passes and the six-slot Role-A caution is retained; pristine historical fixtures are unchanged |
| `packages/mcp-server/src/tools/__snapshots__/viz.render.network-fidelity.test.ts.snap` | viz.scale.categorical.04: L 0.6558 -> 0.6488, #B78827 -> #B58525; Role-C passes and the six-slot Role-A caution is retained; pristine historical fixtures are unchanged |
| `packages/mcp-server/src/tools/artifact.certify.scope.test.ts` | s191 dark-scope categorical palette: measured pass replaces known dark failure |
| `packages/mcp-server/src/tools/viz.render.test.ts` | viz.scale.categorical.04: L 0.6558 -> 0.6488, #B78827 -> #B58525; Role-C passes and the six-slot Role-A caution is retained; pristine historical fixtures are unchanged |
| `packages/mcp-server/test/contracts/viz-recipes.s190.spec.ts` | s191 contrastPassed measured by the public census; nine categorical types pass and four remain exempt |
| `packages/mcp-server/test/tools/artifact.certify.contrast-fault.spec.ts` | viz.scale.categorical.04: L 0.6558 -> 0.6488, #B78827 -> #B58525; Role-C passes and the six-slot Role-A caution is retained; pristine historical fixtures are unchanged |
| `packages/mcp-server/test/tools/artifact.certify.echarts-s179-baseline.spec.ts` | viz.scale.categorical.04: L 0.6558 -> 0.6488, #B78827 -> #B58525; Role-C passes and the six-slot Role-A caution is retained; pristine historical fixtures are unchanged |
| `packages/mcp-server/test/tools/artifact.certify.spec-only-bytes.spec.ts` | viz.scale.categorical.04: L 0.6558 -> 0.6488, #B78827 -> #B58525; Role-C passes and the six-slot Role-A caution is retained; pristine historical fixtures are unchanged |
| `packages/mcp-server/test/tools/artifact.certify.spec.ts` | viz.scale.categorical.04: L 0.6558 -> 0.6488, #B78827 -> #B58525; Role-C passes and the six-slot Role-A caution is retained; pristine historical fixtures are unchanged |
| `packages/mcp-server/test/tools/certify-contrast.echarts-caveat-pin.spec.ts` | viz.scale.categorical.04: L 0.6558 -> 0.6488, #B78827 -> #B58525; Role-C passes and the six-slot Role-A caution is retained; pristine historical fixtures are unchanged |
| `packages/mcp-server/test/tools/certify-contrast.spec.ts` | viz.scale.categorical.04: L 0.6558 -> 0.6488, #B78827 -> #B58525; Role-C passes and the six-slot Role-A caution is retained; pristine historical fixtures are unchanged |
| `packages/mcp-server/test/tools/echarts-role-a-assignment.s179.spec.ts` | viz.scale.categorical.04: L 0.6558 -> 0.6488, #B78827 -> #B58525; Role-C passes and the six-slot Role-A caution is retained; pristine historical fixtures are unchanged |
| `packages/viz-core/src/adapters/vega-lite-adapter.spec.ts` | viz.scale.categorical.04: L 0.6558 -> 0.6488, #B78827 -> #B58525; Role-C passes and the six-slot Role-A caution is retained; pristine historical fixtures are unchanged |
| `packages/viz-core/src/registry/viz-recipes.v1.json` | s191 contrastPassed measured by the public census; nine categorical types pass and four remain exempt |
| `packages/viz-core/test/__snapshots__/golden-echarts-options.spec.ts.snap` | viz.scale.categorical.04: L 0.6558 -> 0.6488, #B78827 -> #B58525; Role-C passes and the six-slot Role-A caution is retained; pristine historical fixtures are unchanged |
| `packages/viz-render/certified-matrix.json` | viz.scale.categorical.04: L 0.6558 -> 0.6488, #B78827 -> #B58525; Role-C passes and the six-slot Role-A caution is retained; pristine historical fixtures are unchanged |
| `packages/viz-render/test/echarts-render-worker.spec.ts` | viz.scale.categorical.04: L 0.6558 -> 0.6488, #B78827 -> #B58525; Role-C passes and the six-slot Role-A caution is retained; pristine historical fixtures are unchanged |

## Remaining

The accepted three-file exception resolves the m01 blocker; continue the serial Requires chain with m02. No descope rung was used. No primary runtime, PM2 process, saved schema store or external consumer was changed; no messages were sent. Sprint 191 remains Active and requires independent review after m05.
