# Sprint 179 M03 — served-option truth

**Mission:** `s179-m03`  
**Base:** `1be93f8e16fee2607682361bbd56e521fda3bcdb`  
**Local evidence date:** 2026-08-29  
**Status:** implementation and local qualification complete.

## Result

The ECharts option hashed and served for a joined choropleth now carries the join property ECharts needs to associate registered regions with series rows. The direct MCP choropleth path emits `geo.nameProperty = join.featureProperty` only when a join exists. The no-join path remains byte-identical.

The multi-layer `adaptToECharts` sibling remains intentionally unchanged in behavior as required by the locked memo. Because it shares `buildChoropleth`, the helper now accepts an optional emission flag that defaults to `false`; only `adaptChoroplethToECharts` opts in. The browser-side `src/viz` twin remains untouched.

`evaluateEChartsDeterminism` now retains the exact first and second projected options and their canonical strings. The two projections come from independent adapter emissions; the second remains the determinism proof. The current `artifact.certify` response still exposes only `{ stable, contentHash }`, so M03 does not advertise the later render-grading surface.

## Contract proof

- The canonical joined fixture uses `featureProperty: "region"` and deliberately has no default `name` property.
- The served projection retains `__registration` and strips only `__joinDiagnostics`.
- Direct ECharts SSR renders the two joined regions with ramp paints `rgb(0,55,119)` and `rgb(223,237,252)`, with `ecmeta_data_index` values `0` and `1`.
- A raw-option ramp mutation made after projection does not move the retained render proof. Applying the same mutation to the projected object does move the rendered paints.
- Removing the direct adapter's opt-in flag and rebuilding viz-core produced the intended RED: `#5070dd/#5070dd` instead of the joined ramp. The sibling raw/projected discrimination test stayed green. The flag was restored and DIST rebuilt before final verification.
- The parked multi-layer adapter has an explicit assertion that joined output still has no own `geo.nameProperty`.

## Declared movement

Only the joined choropleth projected-option hash moved among the eight canonical operands:

```text
before  178534c597318a742fae67e2fe6c9a24ea1cc75306bf736d6332ccef476ef5c1
after   e260ca0965e23f4de4cec03e9f898d7628b702830d85a1008650d85ad7aba9aa
```

The final viz-core direct normalized SSR hash for that joined choropleth is
`756b369388670679f3346dbd62c74f42c0780ee6f01ed06975e68139e48f671c`.

The pristine M01 fixture and its SHA-256 remain anchored to base `1be93f8`. The current control derives exactly one override and proves the other seven full responses are unchanged. Within the choropleth cell, only `renderedContentHash` and `certified.determinism.contentHash` move.

The declared snapshots moved exactly as follows:

- viz-core `choropleth (join)`: one added `geo.nameProperty: "region"`;
- MCP geo fidelity: one added `geo.nameProperty: "region"`;
- dashboard fidelity: one added `geo.nameProperty: "name"` and dashboard hash movement from `c50950df6a5a148ee60d8d9a869b5f45205081977cab599ae438e98a033c5f46` to `7d3a5e5d55b92897991b33e2a25062769b58d7f69c67b0577be9c58411625ea9`.

The dashboard fixture uses ECharts' default `name` join property, so its bytes and hash move while its paint does not. No M03 lockfile change was made.

## Implementation inventory

Product changes:

- `packages/viz-core/src/adapters/spatial/echarts-choropleth-adapter.ts`
- `packages/mcp-server/src/tools/certify-echarts-emit.ts`

Tests and declared snapshots:

- `packages/viz-core/test/choropleth-adapter.spec.ts`
- `packages/viz-core/test/golden-echarts-options.spec.ts`
- `packages/viz-core/test/s179-echarts-render-harness.ts`
- `packages/viz-core/test/s179-echarts-render-baseline.spec.ts`
- `packages/viz-core/test/__snapshots__/golden-echarts-options.spec.ts.snap`
- `packages/mcp-server/test/tools/certify-echarts-projected-render-s179.spec.ts`
- `packages/mcp-server/test/tools/artifact.certify.echarts-s179-baseline.spec.ts`
- `packages/mcp-server/src/tools/viz.render.geo-fidelity.test.ts`
- `packages/mcp-server/test/scale/viz-determinism.spec.ts`
- `packages/mcp-server/src/tools/__snapshots__/viz.render.geo-fidelity.test.ts.snap`
- `packages/mcp-server/src/tools/__snapshots__/dashboard.render.fidelity.test.ts.snap`

The two memo-enumerated stale comments that incorrectly said the JSON projection drops a
bubble-map `symbolSize` function were corrected. Final audit and a zero-residue grep found the
same stale claim in the opt-in scale suite and viz-core golden-test commentary; both additional
comments were corrected as discovered scope. The still-true tooltip-formatter limitation
remains documented.

## Verification

```text
focused viz-core RED before production
  2 files failed; 2 failed / 20 passed
  both failures: expected geo.nameProperty "region", received undefined

final focused viz-core
  3 files / 40 tests green

full @oods/viz-core
  67/67 files, 1390/1390 tests, 0 skips
  statements/lines 81.16% (9414/11599)
  branches 82.38% (2839/3446)
  functions 82.72% (517/625)

@oods/viz-core typecheck
  green

@oods/viz-core build
  ESM/CJS/DTS green; final DIST rebuilt after the controlled mutant

focused MCP gate
  6 files / 107 tests green

all-eight cross-tool parity
  45 tests green; seven hashes unchanged, choropleth moved exactly once

spec-only byte control
  32 tests green; no response movement

@oods/mcp-server build
  green

full @oods/mcp-server
  214 files passed, 1 file skipped (215 total)
  4347 tests passed, 16 skipped (4363 total), 0 failures
  23.09 s Vitest duration; package configuration does not collect coverage

opt-in @oods/mcp-server scale suite
  4/4 files, 62/62 tests, 0 skips

root viz namespace pin
  130/130 symbols; exact equality with configs/quality/viz-public-surface-4e999de.json

git diff --check
  green
```

The 16 skips are pre-existing, fixture-gated cross-project E2E cases: seven
`stage1-rollups.e2e.spec.ts` cases require the full Stage1 rollup fixture set, and nine
`action-mappings.e2e.spec.ts` cases require `bridge_summary.json`. No M03 test is skipped.
No snapshots were accepted outside the three declared movers. No commit was created; the
sprint commit boundary remains Derek-owned.

## Decisions captured by this mission

1. Preserve the locked off-MCP multi-layer behavior with an opt-in helper flag rather than interpreting “non-mover” as file-only.
2. Retain both independently projected options and their canonical bytes internally, while keeping the current public certification response unchanged until M05.
3. Keep the pristine M01 operand fixture immutable and derive the single M03 choropleth override so historical evidence and current movement remain simultaneously testable.

Review session `PS-2026-08-29-003` materialized evergreen learnings `#449` (behavioral
non-mover fences through shared helpers) and `#450` (close stale-wording work with a literal
residue grep).
