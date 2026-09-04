# Sprint 182 M02 React verification

Date: 2026-09-03
Mission: `s182-m02`
Target: `@oods/components-react`
Frozen predecessor: `38afc8a`
Result: React package, compatibility shims, executable shared scenarios, accessibility,
interactions, visual evidence, tarball, isolated packed consumer, and the four-package foundation
verifier are green.

## Package and repository checks

| Command | Result |
|---|---|
| `pnpm --filter @oods/components-react run typecheck` | passed |
| `pnpm --filter @oods/components-react run build` | passed; ESM, CJS, and declarations emitted for root, `./status`, and `./table` |
| `pnpm --filter @oods/components-react run test` | 5 files / 27 passed / 0 failed / 0 skipped; all 14 scenario rows execute their declared event/assertion or concrete render/layout outcome |
| `pnpm exec tsc --noEmit -p tsconfig.json` | passed for the root repository and compatibility shims |
| `pnpm exec vitest run tests/base/badge.test.tsx tests/base/banner.test.tsx tests/base/button.test.tsx tests/base/checkbox.test.tsx tests/base/date-picker.test.tsx tests/base/select.test.tsx tests/base/table.test.tsx tests/base/text-field.test.tsx tests/base/textarea.test.tsx tests/components/tabs.spec.tsx` | 10 files / 43 passed / 0 failed / 0 skipped |
| `pnpm build-storybook` | passed; built index contains all 14 React Nucleus stories with explicit `parameters.oodsComponentId` |
| `git diff --check` | passed |

The final selected carriers were also run individually:

| Gate | Exact selector | Selected / passed / failed / selected skipped |
|---|---|---:|
| B-05 | `package-contract.spec.ts::B-05 exports the exact React nucleus with public declarations` | 1 / 1 / 0 / 0 |
| B-06 | `accessibility.spec.tsx::B-06 preserves React field label and error associations` | 1 / 1 / 0 / 0 |
| B-07 | `interactions.spec.tsx::B-07 moves React Tabs selection and focus with ArrowRight` | 1 / 1 / 0 / 0 |

Vitest reports tests excluded by `-t` as skipped. Those non-selected tests are not selected-gate
skips; exact counts and the green→red→restored controls are recorded in
`cmos/reports/s182-m02-mutation-evidence.md`.

The manifest-literal evidence bundles are:

- `artifacts/product-reality/sprint-182/gates/B-05/`
- `artifacts/product-reality/sprint-182/gates/B-06/`
- `artifacts/product-reality/sprint-182/gates/B-07/`

Each contains exactly the required `mutation.patch`, `pre-green.log`, `selected-red.log`,
`restored-green.log`, and `receipt.json`. Receipt validation re-hashed the restored carrier,
production source, declaration artifact, patch, and three logs with no mismatch. B-05's canonical
bundle records only the manifest-locked `Text` re-export mutation; the declaration-edge mutation is
supplemental evidence in the mission-local mutation report.

## Visual and responsive evidence

Command:

```sh
pnpm --filter @oods/components-react run test:visual
```

Final result: 9 selected / 9 passed / 0 failed / 0 skipped in Chromium `141.0.7390.37`.
`artifacts/product-reality/sprint-182/m02/visual-regression/report.json` was generated at
`2026-09-04T02:30:22.088Z`.

The six A/B × light/dark/high-contrast desktop captures and three responsive captures use fresh
Chromium processes, persistent animation/transition/caret freeze CSS, post-interaction repaint and
geometry checks, and a single viewport rather than `fullPage` tiling. The harness asserts content,
dimensions, clipping, color contrast, dismiss sizing, exact component IDs, browser errors, and the
byte identity of all nine human-reviewed raster hashes. The final full-run high-contrast files use
the `-desktop-full.png` suffix so this mission cannot overwrite the separately frozen M01a files.

## Tarball and isolated consumer

Commands:

```sh
pnpm --filter @oods/components-react exec pnpm pack \
  --pack-destination "$PWD/artifacts/product-reality/sprint-182/m02/final-verified/package"
pnpm --filter @oods/components-react run test:packed -- \
  --artifact-root artifacts/product-reality/sprint-182/m02/final-verified
```

Results:

- Final tarball:
  `artifacts/product-reality/sprint-182/m02/final-verified/package/oods-components-react-0.1.0.tgz`
- SHA-256: `935922d5bec53e6be5c7bb6db129793f24428c3f81d6aee594c880c598029f97`
- The direct tarball and the independently produced isolated-consumer tarball have the same hash.
- Packed inventory contains root/status/table ESM, CJS, declarations, the private `types.js` /
  `types.cjs` declaration-resolution targets and matching declarations, the 14-row readiness JSON,
  manifest, and license; it contains no repository source tree.
- `artifacts/product-reality/sprint-182/m02/final-verified/packed-import/report.json`: selected 1 /
  passed 1 / failed 0 / skipped 0.
- The fresh consumer used a new `node_modules`, empty npm configuration, disabled install scripts,
  and only local tarballs plus React peers. Root ESM and CJS each expose exactly the 14 locked
  components; SSR, status resolution, the seven-member Table subpath, readiness JSON, and shared CSS
  import all pass.
- The packed React manifest contains no `workspace:`, `file:`, or `link:` dependency protocol.

## Cross-package verifier

```sh
node scripts/product-reality/verify-package-foundations.mjs \
  --artifact-root artifacts/product-reality/sprint-182/m02/final-verified
```

Final report:
`artifacts/product-reality/sprint-182/m02/final-verified/package-foundations/report.json`.
Result: selected 4 / passed 4 / failed 0 / skipped 0.

| Package | Pair tarball SHA-256 | Pair inventory SHA-256 | Members per run |
|---|---|---|---:|
| `@oods/component-contracts` | `e0acbdffced05a4d6def5eb0266edbbf67af761bba99e03ed7868d316cc8335b` | `0ed0681a761ca473ea61c4efbbff031ace373a70949d98a1cf96d79503ac3d32` | 8 |
| `@oods/component-styles` | `c9bc6a9659239059b854f25c4b26806223e199937b5ec95ac5971fec02dca26c` | `604e94a9c02f416a7f91b0fbaca726625a4d26dab89ab378aab5e4a14e92aa1a` | 6 |
| `@oods/components-react` | `57ca6fc334753d07e9999642db2256f87160d1be5c0289dc502389f99f2938d9` | `1e68d13091c69eb272f9c05befaf61ffa5e8d863a810d366d8dec8462962d741` | 20 |
| `@oods/components-vue` | `ab874520d6d8179ad46ca64fb74e26c1559e50e79e39fe38bc70069c745033a1` | `1f5120069165aec3c5a6bb2abdde46f5cb4b44011404c5580e03184ca2668974` | 6 |

For each package, run 1 and run 2 have equal tarball hashes and equal canonical inventory hashes.
Both runs report empty arrays for all 12 finding classes: forbidden protocols, absolute paths,
unsafe archive entries, source-path leaks, undeclared bare imports, unresolved relative imports,
invalid export targets, missing export targets, missing legacy entry points, missing required
exports, missing required dependencies, and package identity findings.

The immutable first verifier receipt at
`artifacts/product-reality/sprint-182/m02/package-verification/package-foundations/report.json`
recorded the pre-fix 3/4 failure and its six unresolved React declaration edges. It is superseded by
the final report above rather than overwritten. The subsequent
`artifacts/product-reality/sprint-182/m02/final/package-foundations/report.json` proved the
declaration fix but predates executable scenario/readiness correction, so it too is historical; only
the `final-verified` receipt is authoritative.

## Scope and risks

- M02 did not edit `pnpm-lock.yaml` directly. Root regenerated it once after the shared M01a and both
  M02/M03 package dependency changes were quiescent; that lockfile diff is shared attribution, not an
  M02-only claim. Root reports the lockfile-only install and frozen-lockfile check green.
- No shared contracts, scenarios, styles, truth-plane/catalog refresh, Vue, README/agent, or CMOS DB
  source was changed by M02.
- The only root test changes are the four explicitly authorized Tabs expectations, updated to the
  locked automatic Arrow/Home/End/disabled-skip behavior.
- Root `TextField` is a non-counting compatibility alias to canonical `Input`; status registry/glyph
  modules are compatibility shims to package-owned behavior.
- No `component-core` package was introduced.
