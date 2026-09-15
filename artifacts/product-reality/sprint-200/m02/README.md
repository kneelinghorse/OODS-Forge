# s200-m02 — the chrome pass

Builder self-certified: **false**. Base `8d37b175b` on `codex/sprint-200-available`; the mission commit records the implementation head. The live primary checkout was not built or delivered. Independent visual judgment of the sheets is pending.

Open [the review sheets](sheets/index.html): 160 before/after pairs, 320 screenshots. Subscription, Organization and Relationship in list, detail, form and timeline, React and Vue, light and dark, 390/820/1440, plus one component sheet per framework and theme with keyboard-focus crops. Both sides use the same compositions, seed data, viewport and clock; only the built chrome differs (`sheets/comparison.json` names the seven changed sources). 24 screens changed visible text, all declared: the placed graph no longer repeats its title as a figcaption, and the larger payment chart labels more ticks. No pair is pixel-identical; no captured viewport overflows horizontally.

## What moved, at the producer

- **One geometric scale.** `ref.space.ramp` (twelve rem steps on the 4px unit, 050…1200) joins the reference space scale. Every `sys` geometric role now resolves to a ramp entry or a reference token, never a literal: the nineteen existing roles keep their values, `radius-control` is `ref.border.radius.sm`, `shadow-panel` is `shadow.elevation.card` expanded into its parts, and twenty-one roles are new (control heights and size paddings, compact field paddings, badge height, `stack-lg`/`stack-xl`, tab paddings, the tab indicator on the new `ref.border.width.emphasis` 3px, `radius-card`, `shadow-overlay`). `sys.focus.offset` is `ref.border.width.bold`. Twenty-three `cmp` roles carry them to the components. The build grows from 964 to 1,042 CSS variables; every type-scale value is unchanged.
- **Component chrome on the roles.** `components.css` and `components-ported.css` consume the roles with one fallback per variable, equal to the token value. One focus rule (token width, colour and offset) covers every interactive element; the six other focus sites are gone. Card takes its own radius and shadow roles; the dark scope takes the dark elevation through a `[data-theme='dark']` override, because the tokens build scopes only colour per brand and theme. Tabs, the collection block, pagination, tags, banners, form fields and read fields sit on the spacing and radius roles. The literals that remain are structural and listed in the geometry contract spec.
- **React and Vue identical.** Button, Card and Text carry no raw Tailwind class in either framework; intent, size, radius and focus come from the roles through `data-intent` and `data-size`. The layout gap fallbacks match the tokens; Vue gains the `xl` gap.
- **The generated shell.** `APP_CSS` is on the token font stack, the type scale (eyebrow = caption, h1 = heading-xl, labels = label-md, body = body-md), the spacing and radius roles, the card shadow and the 2px/2px focus rule; the phone rules use the same tokens.
- **Placed charts.** `chart-assets` renders placed SVGs at 720×400 (`PLACED_CHART_SIZE`); the preview binds `--oods-viz-width` and the stylesheet caps the SVG at that width, so it scales down and never up. The frame migration (`placement/migration.json`, 33 placements: the eight detail assets in light, the Subscription HC pair, and the five recorded Usage requests with their workflow assets) chains from the sprint-197 palette layer; the sprint-195 and sprint-196 placement specs follow it, and the retained pixels are the receipts. `svgCarriesTitle` in `@oods/component-contracts` decides the caption in React, Vue and the HTML renderer: no figcaption when the SVG paints its title through `role-title-text` or as an ECharts text title, with the accessible name on the wrapper.

## Measured

| Probe (React, A/light component sheet) | Before | After |
|---|---|---|
| Card radius / elevated shadow | 8px / `rgba(0,0,0,.12) 0 4px 16px` literal | 12px / `rgba(15,23,42,.12) 0 16px 40px -12px` (elevation card token) |
| Button md height / padding / radius / line-height | 40px / 10px 16px / 8px / 16px | 40px / 10px 16px / 8px / 19.2px (tight scale) |
| Focus ring, button and field, both frameworks, both themes | 2px solid + 2px offset | 2px solid + 2px offset, from one rule and three tokens |
| Text lg, input, tab, badge, pagination | unchanged | unchanged, now from the roles |

- Theme proof: React 660 root-cells, 0 failures; Vue 660 root-cells, 0 failures (1,320; `theme-proof/`).
- Gates: `test:axe` 9/9 light and dark; `test:contrast` 30/30; tokens `--check` and `lint:tokens` green; `docs:check` green after two generator runs: the claims page took the new variable count (964 → 1,042) and Tool-Specs took the tool-truth ledger regenerated at this head (only the `code.generate` and `design.compose` rows moved, in their test-import lists); root and package typechecks green.
- Suites: component-styles 59/59 (geometry contract, framework parity, styles, token resolution, ported, high-contrast browser); components-react 639/639; components-vue 625/625; tokens 227/227; focused mcp-server codegen and product-reality specs 307/307 plus the placement spec 28/28.
- Full mcp-server suite, run alone after the sweep: 391 files, 7,131 passed, 16 skipped (the same 16 optional Stage1 cases), 0 failed. An earlier run beside the sweep showed six failures (the Usage temporal placement pins and the tool-truth ledger) that the frame migration layer and the ledger regeneration resolved.
- Root core project, run alone: 650 files, 7,489 passed, 16 skipped, one failure — `collections.s189.spec.ts` "vue standalone collection props compile" timed out at 30 s under the full run and passed in isolation in 6 s (12/12), the one isolated rerun the capture policy (#1833) allows for a lone timeout. The three root tests that pinned the Button's raw Tailwind classes now assert the class and data attributes.
- `pnpm viz:gate artifacts/product-reality/sprint-200/m02/checks/viz-gate`: 11/11 steps in 128 s, 2671 passed assertions across its test steps, no chart golden moved (the viz registries, certified matrix and eleven chart snapshots are the ledger's must-not-move set).
- Runtime re-sweep (`runtime/runtime-cells.v1.json`): 240/240 pass, 0 typed gaps, 0 failures, one pack, all 18 objects in React and Vue with the 34 workflow rows, on the pinned Linux Chromium 141.0.7390.37, 31 minutes; the emitter bite fails red and restores byte-identical; the registry carries this ledger (run 88effa9a…). Third attempt, run alone (`runtime-attempt-3-decision.json`); attempts 1 and 2 are retained with their causes. Every sweep hash equals the fresh generation hash for its cell (`attribution/artifact-attribution.json`: 0 mismatches).
- Runtime attribution (`attribution/artifact-attribution.json`): of 240 cells, 42 move for this mission (34 workflow shells through `src/app.css`, 8 placed-chart details), 206 already differed from the registry before this mission (the registry still carried the sprint-198 m02 sweep; the sprint-198 craft missions and sprint-199 producers moved cells without a full re-sweep), 34 are unchanged since the registry. The pre-m02 baseline is a fresh generation from the base head's source (`attribution/base-generation-hashes.json`).
- Golden ledger (`../golden-ledger.json`): 15 must-not-move pins byte-identical against the base head (viz recipes 78, viz patterns 88, certified matrix 8, the sprint-196 package-shapes baseline, the eleven chart snapshots); 243 entries appended once for this mission: 3 chrome snapshots, 206 runtime rows (each with its registry, base-generation and after hashes and its layered reason), 33 placed-chart assets, and the registry head. `s200-golden-ledger.ts check` verifies it.

## Contradictions stated

- The mission said the fourteen snapshots must not move. Three of them pin the React Card and Text class strings through `src/components/base` re-exports, so they move once with the class change; the eleven chart snapshots are byte-identical. All three are in the golden ledger with the reason.
- The registry's 240 hashes had not been re-swept since sprint 198; this is the first full sweep since. Its first attempt (`runtime-attempt-1/`, retained) failed Collection/workflow: the composed Collection list declares no filter control (no lifecycle field) and the s188 harness dereferenced its options. That crash exists at the base head too; the harness now follows the composed schema and records `filter-not-declared`. No generated output was edited.
- The emitter paths for `radiusToken`, `shadowToken` and `typographyToken` stay: existing specs exercise them as the authored-schema contract, and compose does not set them. The shell takes its chrome from tokens through CSS instead.
- `components-ported.css` keeps no focus rule of its own; the shared rule covers its families and the alias that resolves to it is retired in m04.
- The chart gate collided with the sweep's package packing once (a build step found the tokens dist absent); it was rerun after the sweep.
- The root design-system snapshot (`src/components/base/{Button,Card,Text}.tsx`, deprecated re-exports of the package primitives) is rendered by root stories such as `src/stories/base-stories/Button.stories.tsx`, and `.storybook/preview.ts` loads the explorer token CSS but not `@oods/component-styles/css`, which `@oods/component-styles` is not a root dependency of. Those stories therefore show the primitives without chrome now that no utility class carries it. Storybook is not a local gate and no proof in this mission renders it, so this is recorded as residue for the review rather than changed blind.
- Two mcp-server specs (`m06-gate-bites.s184`, `bundle-harness.s196`) pack and rebuild the foundation packages; a sweep, a theme proof or a sheet build running beside the mcp-server suite fails on the moving dists. The suites here ran one at a time after the sweep.

## Reproduce

```sh
pnpm build:tokens && pnpm build:packages
pnpm exec tsx scripts/product-reality/s200-chrome-sheets.ts prepare      # then `before` on the base tree and `after` on this tree
python3 scripts/product-reality/s200-chrome-gallery.py --check
pnpm --filter @oods/component-styles exec vitest run
(cd packages/components-react && node test/visual-evidence.mjs --output=artifacts/product-reality/sprint-200/m02/theme-proof/react --mission=s200-m02)
(cd packages/components-vue && node test/visual-evidence.mjs --output=artifacts/product-reality/sprint-200/m02/theme-proof/vue --mission=s200-m02)
BASE_ROOT=<git archive of 8d37b175b with node_modules and dist linked> pnpm exec tsx scripts/product-reality/s200-placement-migration.ts
env TZ=UTC OODS_PLAYWRIGHT_WS_ENDPOINT=ws://127.0.0.1:19730/ pnpm exec tsx scripts/product-reality/s193-runtime-cells.ts artifacts/product-reality/sprint-200/m02/runtime --workflows
pnpm exec tsx scripts/product-reality/s200-runtime-attribution.ts artifacts/product-reality/sprint-200/m02/runtime/runtime-cells.v1.json
pnpm exec tsx scripts/product-reality/s200-golden-ledger.ts check
pnpm viz:gate artifacts/product-reality/sprint-200/m02/checks/viz-gate
```

## Receipts

- [Sheets](sheets/index.html), [comparison](sheets/comparison.json), [before](sheets/before.json), [after](sheets/after.json), [inputs](sheets/inputs.json).
- [Theme proof React](theme-proof/react/report.json), [Vue](theme-proof/vue/report.json).
- [Placed-chart migration](placement/migration.json) with the retained 720×400 pixels.
- [Runtime sweep](runtime/runtime-cells.v1.json), [validation](runtime/validation.json), [execution record](runtime-execution.json), [attribution](attribution/artifact-attribution.json), [base generation](attribution/base-generation-hashes.json), the retained [first attempt](runtime-attempt-1/).
- [Golden ledger](../golden-ledger.json), [chart gate](checks/viz-gate/report.json).
