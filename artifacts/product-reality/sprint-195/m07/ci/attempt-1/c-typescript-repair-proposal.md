# C clean-checkout TypeScript failure diagnosis

Capture metadata head: `54def3aa88683d81f1f942558a24715c064021e9`. Actual PR checkout: `738d9b9999f854783498135b5e846faef4538c83`. No source edits or corrective tests were run during the active full capture.

Raw TypeScript diagnostics and line bindings are in `c-typescript-diagnostics.json`; all referenced job logs are retained under `raw/`.

There are 13 compiler diagnostics in typecheck, coverage prerequisites, and product-reality prerequisites: two missing `.mjs` declarations, nine unresolved built-module imports, and two tuple inference failures. The build job, which builds packages first, leaves only the two declaration and two tuple failures. This separates clean-checkout dependency assumptions from actual source typing failures.

Minimal proposed corrections, pending authorized implementation and verification:

1. Add `scripts/product-reality/component-theme-proof.d.mts`, following existing sibling `s182-m04-consumer-harness.d.mts` and `s183-m05-saved-schema-consumers.d.mts`. Declare the existing `runVizThemeProof` and alias `runVizForcedColourProof`, with Playwright Page/browser types, actual case options, and the returned report counts. Do not change the native harness or suppress implicit-any checks.
2. Keep compiled receipt calls compiled: replace static dist imports with awaited dynamic URL imports and source-API type bindings, for example `await import(new URL('../../packages/mcp-server/dist/tools/viz.render.js', import.meta.url).href) as typeof import('../../packages/mcp-server/src/tools/viz.render.js')`. This still fails at execution if the build is absent and still invokes exactly that dist module; callers are checked against the actual source API without invented module stubs. Apply to two imports in `s195-certify-profile-receipt.ts`, five in `s195-hc-built-receipt.ts`, one in `s195-qualify-viz-matrix.ts`, and one in `s195-viz-matrix.ts`. No source fallback, wildcard declaration, or tsconfig exclusion.
3. Contextually type `s195-hc-browser.ts` requests as `VizRenderInput` and `DashboardRenderInput`. A literal `[...SALES]` then retains the required nonempty tuple under contextual typing. `CASES.slice(0, 2).map(...)` additionally loses nonempty cardinality and retains the broad 13-type chart union; explicitly select/assert the existing bar and line fixtures and construct two typed chart panels. Preserve the existing data, encodings, panel order, IDs, brands, themes, and outputs.

Related independent failures:

- `portable-runtime`, job 103465880337, fails `scripts/runtime/assemble.mjs:426`: actual tracked domains count 15 versus the old 14 pin. The added domain chart placement file must be attributed before updating that exact inventory expectation.
- `viz-determinism`, job 103465880385: 1,494 passing and 2 failing tests; both `packages/viz-core/src/adapters/vega-lite-adapter.spec.ts` assertions expect `#CA4948`, while the qualified palette now emits `#CA4949`. Raw red logs are retained.

These are proposed repairs, not verified fixes. Public-script byte changes require explicit source attribution and refreshed proof qualification; the frozen implementation head must not be relabeled.
