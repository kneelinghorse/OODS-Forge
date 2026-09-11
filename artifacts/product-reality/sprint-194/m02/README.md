# Sprint 194 m02 — Brand seam

The boundary spec calls real handlers with literal input/output wire validation,
without mocks, on a temporary copy of `packages/tokens`. The served primary
checkout and the worktree's canonical brand source remain unchanged.

`brand.intake` returns an envelope hash and a consumable brand-relative delta.
`brand.apply` writes the selected canonical source in the temporary package,
retains before/after SHA256 and byte counts, runs both token-build stages and
captures their stdout/stderr/exit. A deliberately unresolved alias exercises the
real failure path: OODS-S019, the last 40 output lines, source writes left in place.

`brand-boundary.json`, `before.svg`, `after.svg`, and
`generated-app-B-dark.png` retain the positive browser and SVG evidence. The
B/dark primary text change moves chart svgHash, the generated React app's CSS
bundle and heading, and its governed Text component. The generated app is bundled
from the unedited code.generate file set; its actual @oods/tokens/css import is
resolved to the temporary package's rebuilt CSS and asserted in bundler metadata.
The composed schema is byte-identical before/after generation. All three required
pixel movements are proven; no component-cell carry was used.

The test exposed tsup embedding a second token copy in viz-core. Native esbuild
externalization is necessary: tsup's external plugin bypasses even its explicit
external list when the inherited @oods/* tsconfig alias matches. The fixed package
shares the live token bundle with the server. Package bytes changed, requiring the
fresh 154-cell runtime sweep at m07.

`tokens.build` returns requested-scope JSON and CSS (five artifacts now); full CSS
still contains all scopes, while TypeScript/Tailwind are explicitly legacy A/light.
`fidelity.preview` resolves built canonical A/B light tokens. Legacy brand-a/brand-b
aliases produce a deprecation warning for one release; unknown brands fail,
including empty manifests. External billing fixture tests now supply an explicit
supported brand rather than relying on the removed fallback.

Validation: 9 boundary tests; 162 related tests across 11 files (including real
stdio intake, both framework theme contracts, and existing SVG goldens); 9 narrative
checks. No tests skipped. A final emitter edge check passed 92 tests after adding
unknown-brand rejection for an empty manifest. Builds, generated types and API
reference checks are recorded with the final verification. These are targeted
mission checks, not the reserved five-suite closeout capture.

The derived tool ledger promotes four brand tools to product-reality source tier:
11 product-reality / 8 contract / 4 unit / 4 none, 27 registered. The four changed
caveats are documented limits. Portable E2E remains four calls until m06; the ledger
explicitly treats imports as source evidence, not independent runtime approval.
