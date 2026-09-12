# s195-m05 Role-A palette revision

The built A/B palettes now meet the clean Role-A target while retaining all Role-C and chroma checks. Minimum pairwise CIEDE2000 across normal vision and all three Machado CVD simulations moves from **9.8773979454 to 10.0175619523** in light and from **9.9513289784 to 10.2363931628** in dark. All 24 slot/canvas ratios remain at least 3:1, all 24 resolved slot chromas remain at least 0.03, and all 240 individual pair/mode distances are at least 10. These are grades of actual built, renderer-resolved token bytes.

Only one hue per theme changes; authored lightness and chroma remain fixed:

| Scope | Slot | Before source | After source | Before paint | After paint |
| --- | --- | --- | --- | --- | --- |
| A/B light | 05 | `oklch(0.5824 0.1655 23.89)` | `oklch(0.5824 0.1655 23.81)` | `#CA4948` | `#CA4949` |
| A/B dark | 04 | `oklch(0.72 0.122 80.37)` | `oklch(0.72 0.122 80.41)` | `#CC9B40` | `#CC9C40` |

The deterministic search tests all six single-slot hue changes at each increasing absolute 0.01-degree offset, negative then positive, up to a declared five-degree bound. It exhausts every smaller radius before selecting the first feasible radius. Light finds its only first-radius candidate after 96 trials at −0.08 degrees; dark finds its only first-radius candidate after 48 trials at +0.04 degrees. This is a minimum on the declared single-slot, fixed-L/C, 0.01-degree grid, not a claim of a continuous global optimum. No broader search or measured-ceiling descope was needed.

`scripts/product-reality/s195-palette.ts` uses Colorjs conversion, the production `evaluateCategoricalRoleA`, the production Machado simulation and the production contrast ratio. The verification stage independently requires the actual `resolveCategoricalPalette` output to equal the searched colors. `before.json` preserves all seven raw token maps, relevant canonical sources and full before grades. `selection.json` records the bounds, trial counts, candidates and chosen source values. `after.json` preserves all 24 slot grades, all 240 pair/mode grades and the exact source/map change lists with hashes.

| Scope | Canvas | Slot 01 | 02 | 03 | 04 | 05 | 06 | Minimum ΔE00 |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| A/light | #FDF3DE | 4.3579 | 6.8649 | 3.3703 | 3.0019 | 4.1775 | 6.3930 | 10.0175619523 |
| A/dark | #230900 | 5.0502 | 3.2428 | 6.4586 | 7.5611 | 5.2031 | 3.7016 | 10.2363931628 |
| B/light | #EBF7FD | 4.4045 | 6.9382 | 3.4063 | 3.0340 | 4.2221 | 6.4613 | 10.0175619523 |
| B/dark | #041620 | 4.9164 | 3.1568 | 6.2874 | 7.3606 | 5.0652 | 3.6034 | 10.2363931628 |

Canonical source changes are confined to those categorical slots in the four approved brand base/dark files. The base files previously contained no viz block: each now adds categorical05, so their physical source leaf counts move **44→45 each**, adding two declarations overall. Dark source leaf counts stay 50, HC source counts stay 45, and shared `viz-scales.json` stays 26. Resolved token identity counts do not increase. The shared viz source and HC source files remain unchanged. Base categorical05 also supplies the flat/default and HC maps; that inherited categorical paint changes there as recorded. All other resolved token values, including HC system canvas/text values, remain unchanged.

The token build requires a narrow overlay refinement because it deliberately loads both brand base files in every scope to resolve global brand aliases. A shared categorical token may now be overridden by **identical** A/B base values, followed by the existing own-theme overlay. Different base values, cross-brand theme overrides, reversed or mixed-theme chains, unknown files, noncategorical paths and slots outside 01–06 remain rejected. The existing HC exception remains restricted to slot04. Scoped CSS emits these declared base categorical overrides, including inherited HC values. This preserves the source list and all unrelated token leaves. `collision-tests.log` retains the real failing guard evidence that exposed the globally loaded base interaction; the final tests prove both the required exception and its rejection boundaries.

Verification completed:

- **34 token tests passed, zero skipped**: seven existing collision tests, eleven new exact-overlay tests, fourteen CSS/JS scope tests including HC, and two deterministic-search/built-palette proof tests (`token-tests-final.log`).
- **136 certify tests passed, zero skipped** across five focused files (`caution-tests-final.log`). Default-palette caution pins now follow the measured ≥10 result; a new explicit old-palette override test still produces the 9.88 caution. The caution mechanism and historical fixtures remain intact. One live six-color consistency literal changes only `#CA4948`→`#CA4949`; the golden-migration owner includes that file in attribution.
- Strict standalone search-script typecheck passed (`search-typecheck-final.log`, empty diagnostic output).
- The **single real token build** passed (`token-build.log`), after the golden-migration owner declared baseline capture ready. Built output proof passed (`built-token-verification.log`). The HC owner subsequently performed the coordinated core→server build; no further token build occurred here.
- Owned-file whitespace check passed. No full-suite or visual capture occurred in this slice; pixel/registry/matrix migration is retained in the separate m05 golden-migration packet.

The initial search-helper assertion failure is retained in `selection-initial-failure.log`; an unnecessary derived-coordinate assertion was removed while the source-number parse and production color grades remained. The first standalone typecheck ran during the coordinated viz-core DTS replacement and reported missing declarations; `search-typecheck.log` preserves it and the stable post-build rerun passes. `caution-tests.log` retains the expected stale live palette-literal failure before its attributed update.

Replay and verify the retained result without changing sources:

```sh
pnpm exec tsx --tsconfig artifacts/product-reality/sprint-195/m05/palette/runtime-tsconfig.json scripts/product-reality/s195-palette.ts --replay
pnpm exec tsx --tsconfig artifacts/product-reality/sprint-195/m05/palette/runtime-tsconfig.json scripts/product-reality/s195-palette.ts --verify
```

The explicit runtime config resolves the built packages instead of root authoring aliases. Initial selection used `--select` before canonical edits; `--apply` then changed the four source files once. Historical before evidence is never overwritten with changed source/maps.
