# s195-m05 explicit golden and matrix migration

`baseline.json` was captured before palette mutation at fixed commit `9c75a1dbb495ca26c16f2f75ce52095e72adb16e`: 1,802 tracked source/test/golden identities, all 825 tracked SVGs, all 14 snapshots, token sources and generated maps, and 29 retained matrix/census records. `before/` retains source/snapshot bytes and the actual exported scoped token map. Historical receipts and input fixtures remain untouched.

The palette revision changes only four existing public chart SVG identities versus m04: force_graph in light/dark × A/B. The other 48 chart SVGs and all 32 public pattern SVGs remain identical. All four remeasured legacy dashboard HTML scopes move because they embed force_graph. High-contrast is new evidence, not a replacement for an old golden.

Actual golden updates changed three snapshot files containing 14 render-spec/option entries: six core ECharts options, three MCP Cartesian specs, and five MCP ECharts options. No tracked standalone SVG golden or renderer SVG snapshot changed. The eight-family certified render matrix changes force_graph only, with its epoch recomputed by the existing s191 algorithm. `golden-attribution.json` includes every moved entry's before/after SHA, ten modified test files, eight documentation files, 56 new SVG evidence files (52 matrix plus four browser consumer charts), and all 910 retained matrix rows. It marks 231 older rows superseded by class and reason; these include prior historical epoch changes, while the direct m04 delta is exactly four of 52 cells.

The bounded update commands were:

```sh
pnpm --filter @oods/viz-core exec vitest run test/golden-echarts-options.spec.ts --update
pnpm --filter @oods/mcp-server exec vitest run src/tools/viz.render.fidelity.test.ts src/tools/viz.render.network-fidelity.test.ts --update
pnpm exec tsx scripts/product-reality/s195-qualify-viz-matrix.ts
pnpm exec tsx scripts/product-reality/s195-viz-matrix.ts
python3 scripts/product-reality/s195-attribute-viz-goldens.py
```

All initial reds are retained. The core update applied six snapshots and passed its 16 assertions but exited 1 on the package-wide coverage floor; the renderer's 27 assertions likewise passed while its default full-package coverage floor rejected the subset. Final scoped commands explicitly use `--coverage.enabled=false`; no coverage configuration or thresholds changed. The earlier strict script check also caught copied legacy producer import/tuple typing, now corrected and green. The final MCP run is 101/101, renderer 27/27, core 16/16, none skipped. The pattern schema freshness rejection and fresh recapture are documented in `../patterns/`.

`golden-before-commands.json`, `golden-update-commands.json`, `golden-update-continuation.json`, `final-verification-commands.json`, and `final-generator-checks.json` retain exact commands and statuses, including intermediate failures; the named final logs identify the green runs. The current generator, census, taxonomy, attribution, strict typecheck, and diff checks all pass.

Root qualified the attribution with `--head 52b0da991705c4c565987bc9faf7738ba00d885e` and recorded that exact `qualificationHead`. The four qualified migration checks and 11 ledger checks passed, none skipped. Qualified tracked after-state reads come from that Git commit; raw historical and m05 evidence remains filesystem-hash checked. The four migration tests read `../integration-results.json`'s `implementationHead` and use the qualified check. Before commit, live mode is used. This keeps the mission's receipt valid when later missions legitimately change live code. Root owns the final integration/ledger receipt and receipt commit; these builder verification records are not independent certification.
