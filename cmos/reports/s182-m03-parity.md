# Sprint 182 M03 Vue parity report

Date: 2026-09-03
Mission: `s182-m03`
Frozen predecessor: `38afc8a`
Shared high-contrast amendment: `3a21a2f` (`s182-m01a`)
Target: `@oods/components-vue`
Result: all 14 Vue cells are `implemented-evidence-complete` and `emissionEligible`. This is not a
`codegenUsable`, `foundation-v1`, release, or production-readiness claim.

## Canonical surface

The package exposes concrete Vue 3 implementations and public declarations for the exact canonical
nucleus:

`Badge`, `Banner`, `Button`, `Card`, `Checkbox`, `DatePicker`, `Grid`, `Input`, `Select`, `Stack`,
`Table`, `Tabs`, `Text`, and `Textarea`.

The semantic `Table` compound family also exposes `TableHead`, `TableBody`, `TableCaption`,
`TableRow`, `TableHeaderCell`, and `TableCell`; those helpers do not add canonical census rows.
`TextField`, `Popover`, and a scaffold constant are absent from the root runtime surface.

Vue is a peer dependency. Runtime dependencies are only `@oods/component-contracts` and
`@oods/component-styles`, both at ordinary `0.1.0` semver. Built source and the package manifest
contain no React, Radix, RJSF, `workspace:`, `file:`, repository-root, or consumer source-scanning
dependency.

## Contract and implementation matrix

| Component | Vue implementation | Locked semantic outcome |
|---|---|---|
| Badge | `src/primitives.ts` | Status/domain or explicit tone, subtle/solid emphasis, optional decorative icon, and status label fallback. |
| Banner | `src/primitives.ts` | Title/detail/content/actions slots, status/domain or explicit tone, `alert` for critical and `status` otherwise, compact named dismiss button. |
| Button | `src/primitives.ts` | Native button, safe `type="button"` default, disabled state, content slot/prop, and `activate` event. |
| Card | `src/primitives.ts` | One governed semantic container with elevated state and native attributes. |
| Checkbox | `src/fields.ts` | Native controlled/uncontrolled checkbox, label/help/error associations, and `update:modelValue`/`change`; omitted `modelValue` preserves `checked`/`defaultChecked`. |
| DatePicker | `src/fields.ts` | Composes canonical `Input`, uses native `type="date"`, ISO value/default and min/max/step, and forwards idiomatic events. |
| Grid | `src/primitives.ts` | CSS-grid columns or minimum-column width, token gap, align, and justify while preserving DOM order. |
| Input | `src/fields.ts` | Canonical native field with stable ID, controlled/uncontrolled values, label/help/error metadata, input/change, and `update:modelValue`. |
| Select | `src/fields.ts` | Native select, option content/disabled state, controlled/uncontrolled values, field metadata, and update/change. |
| Stack | `src/primitives.ts` | Token-driven row/column flex layout, gap, align, justify, and wrap. |
| Table | `src/table.ts` | Native caption/head/body/row/header/data-cell family, density, and optional selectable row activation through a named real button. |
| Tabs | `src/tabs.ts` | Item-driven API, canonical `disabled` plus compatibility `isDisabled`, controlled/uncontrolled selection, private overflow, and automatic Arrow/Home/End focus and selection with disabled skip and wrap. |
| Text | `src/primitives.ts` | Governed semantic element, size, weight, and safe `span` fallback. |
| Textarea | `src/fields.ts` | Native textarea with shared field metadata, rows, controlled/uncontrolled values, and update/input/change events. |

Status normalization is framework-local because no target-neutral runtime was required. It maps the
locked subscription/invoice statuses to shared tone tokens, keeps `data-status` and `data-domain`,
and gives an explicit tone precedence. No React implementation is imported.

## Package-native verification

The final command was:

```text
pnpm --filter @oods/components-vue run typecheck &&
pnpm --filter @oods/components-vue run build &&
pnpm --filter @oods/components-vue run test &&
pnpm --filter @oods/components-vue run test:pack
```

Results:

- `vue-tsc --noEmit`: passed.
- `tsup` ESM, CJS, and public declarations: passed.
- Vitest: 5 files passed, 30 tests passed, zero failed, zero skipped.
- The shared-scenario carrier runs 15/15 tests: one exact 14-row mapping assertion plus one
  executable test per frozen scenario. Interactive rows fire the declared event and assert one exact
  payload/outcome; render and layout rows assert their declared semantics, visible content/order,
  state, and tokenized layout values rather than treating a successful mount as scenario evidence.
- SSR renders all 14 canonical markers and semantic table/tab/button markup.
- Accessibility coverage proves every native field family's label/help/error association, Banner
  announcement roles, native button/table/tab semantics, and a zero-violation automated axe run.
- The Vue-only packed verifier: selected 6, failed 0, skipped 0.

`artifacts/product-reality/sprint-182/m03/package-verification/report.json` was generated at
`2026-09-04T02:44:45.099Z` with SHA-256
`4a2f3af11fdea8f4c1524269f848e47a96f24f4d7036c58539bcaa33fcc9efbd`.
It created an external temporary consumer with an empty npm user config and no lockfile, installed
fresh OODS tarballs plus explicit `vue` and `@vue/server-renderer` dependencies, resolved all imports
inside that consumer, found 14 ESM and 14 CJS canonical exports, loaded the public
`@oods/components-vue/readiness` JSON, re-derived all 14 cells through the installed
`@oods/component-contracts` predicate, resolved packed CSS, and SSR-rendered a native Button. The
renderer is a direct consumer dependency rather than an npm-hoisting accident.

| Packed artifact | SHA-256 |
|---|---|
| `@oods/tokens` | `6fd4d0e57cc9e2f78dd6702d59d53227adc8cb88ed79f1192bafd199f4172940` |
| `@oods/component-contracts` | `e0acbdffced05a4d6def5eb0266edbbf67af761bba99e03ed7868d316cc8335b` |
| `@oods/component-styles` | `c9bc6a9659239059b854f25c4b26806223e199937b5ec95ac5971fec02dca26c` |
| `@oods/components-vue` | `ab874520d6d8179ad46ca64fb74e26c1559e50e79e39fe38bc70069c745033a1` |

The shared built CSS SHA-256 remains
`63c41511827f7fdb7b93108bf5b4ef824e1aa4dfa3f70b2be7d8cb60caedf9d1`, byte-equal to the input
recorded by the final visual report after the pack run.

## Readiness derivation

`packages/components-vue/evidence/vue-readiness.v1.json` has SHA-256
`0bcb8104b303cdbd34a5d8506900fb6d8aa1750d06d5009001d5fa3dda9caafc` and contains exactly 14
ordered rows. Every row carries `{status:"passed", refs:[...]}` for `versionedContract`,
`targetImplementation`, `packageExport`, `publicDeclaration`, `dependencyClosure`, and
`frameworkScenario`. Package-native and installed-consumer checks both call the frozen
`evaluateEmissionEligibility` predicate; the JSON does not certify itself. The JSON is included in
the tarball and exported at the public `@oods/components-vue/readiness` subpath.

## Visual and responsive evidence

The final report at `artifacts/product-reality/sprint-182/m03/visual-regression/report.json` was
generated at `2026-09-04T02:28:06.871Z`: selected 9, failed 0, skipped 0 in Chromium
`141.0.7390.37`. Its SHA-256 is
`8c9c04e9d0f7c6b68b261eab34842a951ee4fd20910bbc90a55ef2aefb978377`.

Every cell uses a new Chromium process, persistent animation/transition/caret freeze CSS, an entire
document contained inside one viewport, a plain non-`fullPage` screenshot, and a post-interaction
repaint. Before capture, the gate verifies exact key labels/values/table rows, selection and focus,
field/table widths and heights, and zero control/cell clipping both before and after interaction.
The nine originals were then independently audited with original-file OCR and fresh small section
crops. All were human-clean. Their reviewed SHA-256 values were pinned, and a second fresh-process
run reproduced all nine exactly; the report records the matched 9/0/0 baseline.

| Cell | Enabled Button | Critical status/banner | Validation error | Disabled label | Dismiss |
|---|---:|---:|---:|---:|---:|
| A light | 4.61:1 | 6.74:1 | 7.46:1 | 1.76:1 | 40×40 |
| A dark | 5.45:1 | 8.96:1 | 12.16:1 | 2.64:1 | 40×40 |
| A high contrast | 15.13:1 | 21:1 | 21:1 | 14.02:1 | 40×40 |
| B light | 4.65:1 | 6.79:1 | 7.52:1 | 1.88:1 | 40×40 |
| B dark | 6.51:1 | 8.98:1 | 12.13:1 | 2.59:1 | 40×40 |
| B high contrast | 15.13:1 | 21:1 | 21:1 | 14.02:1 | 40×40 |

The responsive cells are phone 375px, tablet 768px, and desktop 1280px with no horizontal document
clipping. The phone cell visibly exercises the private `More sections` Tabs overflow while keeping
the form and four-column table usable.

Full-matrix HC images are deliberately named `vue-A-hc-desktop-full.png` and
`vue-B-hc-desktop-full.png`. The earlier `s182-m01a` HC report/status and its two original HC PNGs
remain byte-identical to commit `3a21a2f`, avoiding cross-mission evidence drift.

## Discrimination evidence

`cmos/reports/s182-m03-mutation-evidence.md` records the locked carriers and complete
green → red → restored lifecycle:

- B-08 removed only the `Text` re-export: selected 1 / failed 0 → selected 1 / failed 1 → selected
  1 / failed 0.
- B-09 removed only Input's `update:modelValue` emission: selected 1 / failed 0 → selected 1 /
  failed 1 → selected 1 / failed 0.
- B-10 removed only Tabs' ArrowRight branch: selected 1 / failed 0 → selected 1 / failed 1 →
  selected 1 / failed 0.

Every selected run reports zero skipped tests. Package and accessibility carriers additionally fail
on missing declared/CSS dependencies and broken label/error associations; those material conditions
are not represented as silent passes.

The canonical five-file receipt bundles are at
`artifacts/product-reality/sprint-182/gates/B-08/`, `B-09/`, and `B-10/`; byte-identical copies
remain below `m03/gates/` as mission-local provenance.

## Boundary and residual notes

- M03 modified no shared contract, scenario, style, root compatibility, catalog, refresh, MCP,
  documentation, or lockfile path. Shared visual defects were escalated through `s182-m01a`/`m01b`
  and consumed only after the rebuilt CSS was stable.
- The visual harness emits the repository's existing empty Tailwind-content warning. It does not run
  Tailwind generation: it imports the prebuilt public CSS subpath and proves loaded styles/tokens in
  the browser, so consumer source scanning remains absent.
- `isDisabled` remains a Vue compatibility alias, but canonical `disabled` controls filtering,
  native disabled state, wraparound, focus, and selection.
- M04 still owns generated-consumer/codegen proof and `codegenUsable`; M05 plus independent review
  own any later `foundation-v1` promotion.
