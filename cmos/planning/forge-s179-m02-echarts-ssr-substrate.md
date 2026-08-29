# Sprint 179 M02 — lazy deterministic ECharts SSR substrate

**Mission:** `s179-m02`  
**Base:** `1be93f8e16fee2607682361bbd56e521fda3bcdb`  
**Local evidence date:** 2026-08-29  
**Status:** implementation and local qualification complete; real Linux-x64 CI, numeric budget ratification, and memory-plateau gates remain owned by M06 per the locked memo.

## Result

`@oods/viz-render` now exposes a lazy ECharts-to-normalized-SVG path backed by one long-lived serialized worker. The main realm validates inputs and queues work without importing ECharts. The worker dynamically loads only the eight required chart modules, used components, and SVG renderer on its first renderable call.

The public renderer:

- accepts the already-projected JSON option and never mutates it;
- uses the fixed `600x400` v1 viewport;
- sets clone-only `animation:false` and force `layoutAnimation:false`;
- derives a versioned LCG seed from canonical projected-option bytes and patches only the worker realm's `Math.random`, restoring it in `finally`;
- normalizes only admitted zrender structural `cls/ani/s/g/p/c` tokens with one shared first-appearance map;
- rewrites inline geo operands to one fixed internal alias, registers the supplied FeatureCollection immediately before every `setOption`, and tracks the actual alias passed to `registerMap`;
- neutralizes zero-argument worker clock reads around ECharts import/render so zrender's `tryCreateASCIIWidthMap` timing branch cannot depend on host load;
- masks DOM/canvas globals, never fetches maps, disposes every created chart on success and typed failure, and exposes worker-state counters for verification;
- builds executable ESM and CJS public/worker entries. The public barrel keeps the pre-existing async Vega emitter behind a native dynamic import so CommonJS consumers can use ECharts without synchronously requiring Vega-Lite's ESM/top-level-await graph.

## Contract boundaries

Only one numeric input ceiling was ratified for this mission: **250 force nodes**. The public contract therefore reports:

```text
forceNodes: 250
forceLinks: null
payloadBytes: null
```

The nulls are unresolved contracts, not claims of unlimited support. Dimensions are a fixed v1 policy, not a newly invented maximum: supplied dimensions other than `600x400` reject before worker creation.

Bubble-map input without inline geometry returns typed `ECHARTS_NO_MAP` before worker creation. The renderer performs no network fallback. Malformed registrations, mismatched map names, unsupported series, unreadable SVG, render faults, worker faults, invalid JSON/options, and the force-node boundary have distinct typed carriers.

## Implementation inventory

Product/config changes:

- `packages/viz-render/src/echarts-worker-protocol.ts`
- `packages/viz-render/src/echarts-worker-runtime.ts`
- `packages/viz-render/src/echarts-render.worker.ts`
- `packages/viz-render/src/echarts-renderer.ts`
- `packages/viz-render/src/echarts-svg-normalizer.ts`
- `packages/viz-render/src/first-appearance-remap.ts`
- `packages/viz-render/src/index.ts`
- `packages/viz-render/src/emitter.ts`
- `packages/viz-render/package.json`
- `packages/viz-render/tsup.config.ts`
- `packages/viz-render/vitest.config.ts`
- `pnpm-lock.yaml`

Test/evidence changes:

- `packages/viz-render/test/echarts-render-worker.spec.ts`
- `packages/viz-render/test/echarts-svg-normalizer.spec.ts`
- `packages/viz-render/test/s179-echarts-render-measure.mts`
- `packages/mcp-server/test/tools/echarts-render-worker.startup.spec.ts`

The lockfile diff adds only `echarts:^6.0.0` / resolved `6.0.0` to the `packages/viz-render` importer. ECharts and zrender both resolve to `6.0.0`; zrender remains transitive. No viz-core runtime dependency moved.

## Rule-9 carriers and bites

| Intent                          | Carrier / observed bite                                                                                                                                                                                                                   |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lazy main realm                 | MCP startup installs a `module.register` resolve poison for `echarts` and `echarts/*`, proves the poison rejects a deliberate `echarts/core` import, then imports the server and observes worker/spawn/load all zero.                     |
| One serialized worker           | Four concurrently requested mixed jobs complete FIFO; `spawnCount=1`, `loadCount=1`, `maxActiveJobs=1`.                                                                                                                                   |
| Converged force                 | Canonical normalized SVG hash is `c14f3173e6e6af1c3633e31ebb9acb5d968bcbc89c6c45e77b6be449214ee6c8`. The same-seed `layoutAnimation:true` first-frame mutant measured `fa27909961c5ab8acab6769e9ffb15a61227e47ce0b21ac754394b17cbf6a40c`. |
| Force RNG isolation/restoration | Degenerate coincident/symmetric/isolated/zero-value input is stable around intervening renders; a forced post-chart-created force fault restores RNG and disposes the chart without touching main-realm `Math.random` or `Date`.          |
| Force limit                     | 250 nodes render; 251 returns typed `ECHARTS_INPUT_LIMIT`. No link/payload ceiling is invented.                                                                                                                                           |
| Text timing                     | Built worker renders twice identically with a 20 ms poison clock and 101 uncached font families; more than 100 font names survive in the SVG while the clock/ambient guards restore.                                                      |
| Structural normalization        | Rich class, animation, shadow, gradient, pattern, and clip definition/reference pairs remain linked; author text, ARIA/ecmeta data, geometry, transforms, and lookalikes remain byte-identical; normalization is idempotent.              |
| Fresh geo registration          | Test-only skipped registration in a fresh built worker returns typed `ECHARTS_NO_MAP` after chart creation and still reports created/disposed `1/1`.                                                                                      |
| Warm geo replacement            | Conflicting FeatureCollections produce different SVG; restoring the first geometry restores its exact SVG.                                                                                                                                |
| Registry boundedness            | 1,000 unique caller IDs and FeatureCollections produce 1,000 actual registration calls while tracked registration-key cardinality remains one; the final geometry hash changes and the worker stays singular.                             |
| CJS packaging                   | Built `require(dist/index.cjs)` renders ECharts; the built CJS Vega API dynamically loads the separate ESM emitter and renders without spawning ECharts. This reds the original `ERR_REQUIRE_ASYNC_MODULE` defect.                        |
| Disposal/faults                 | Forced render, unsupported series, unreadable SVG, and skipped-registration paths retain typed errors and balance every created chart with disposal.                                                                                      |

## Verification

### Package and source gates

```text
pnpm --filter @oods/viz-render test
  build: ESM + CJS + DTS green
  test files: 3/3 green
  tests: 46/46 green
  skips: 0
  statements/lines: 92.85% (689/742)
  branches: 86.20% (175/203)
  functions: 92.50% (37/40)
```

Coverage measures every main-realm source module. `echarts-render.worker.ts` and `echarts-worker-runtime.ts` are excluded because executing them in Vitest's main realm would defeat the isolation contract and Node's V8 collector does not remap built-worker coverage into `src/**`; their behavior is exercised through the real built ESM/CJS worker carriers.

```text
pnpm --filter @oods/mcp-server run build
  green

pnpm --filter @oods/mcp-server exec vitest run \
  test/tools/echarts-render-worker.startup.spec.ts --coverage.enabled=false
  1/1 green, 0 skips

pnpm --filter @oods/mcp-server exec vitest run \
  test/tools/artifact.certify.spec-only-bytes.spec.ts \
  test/tools/artifact.certify.echarts-s179-baseline.spec.ts \
  --coverage.enabled=false
  2 files, 42/42 green, 0 skips
```

All new/modified M02 files except the pre-existing unformatted `emitter.ts` pass the repository Prettier check. The pristine `HEAD:packages/viz-render/src/emitter.ts` also fails the current Prettier check; M02 kept its edit surgical rather than rewriting the whole legacy file. `git diff --check` is clean.

### Final built-artifact identity

```text
ESM index   7776875556c4d5e587eba30ee5e257d5876fcbfec56057b3a01aee658d6eb88a
ESM worker  77cb2d5dd49ba068df517c95e7e54dfbbcb039b4043a9724a61b8f556ba8d856
CJS index   cdc96c8206fa80ca4e904434ba17cf6bb2fb610587160f5a0c83a65f403e05b4
CJS worker  f70ea982ba4b1d55fa9ca36b4a7ba10f97513c643b1db42939684ec19c6c66c4
```

### Eight-family cross-host replay

The same final built artifact and exact canonical M01 operands were rendered twice per family on:

- Darwin 25.3.0, arm64, Node `v24.6.0`, V8 `13.6.233.10-node.24`;
- Alpine 3.23.4 Linux, arm64, Node `v22.22.2`, V8 `12.4.254.21-node.39`, image `sha256:62ddd2e22a559a15cdf7cc50c269e5358302748802453d64fe90b9a26db81506`.

Every family matched within each host and across the two hosts; neither input mutated:

| Family      | Normalized SVG SHA-256                                             |
| ----------- | ------------------------------------------------------------------ |
| treemap     | `b61714c82926e331f9eae00a17babaa8e2b54241994ffb2d192c355843242f5d` |
| sunburst    | `1a346625cc5a9962d13fae69df25b8f38ad6a88c6e76b1b1c7e28ea41c28d3bd` |
| sankey      | `37af640b0ff7480b5cc20e246caba087be45d361363e166bdca2002ae4f94e1e` |
| chord       | `68ee777050c31706845a197166cac058484dcf16e102bbf6c2009d19316ed662` |
| force_graph | `c14f3173e6e6af1c3633e31ebb9acb5d968bcbc89c6c45e77b6be449214ee6c8` |
| choropleth  | `1506cb791b702a162e333a864a70c772e853088a1d3dab4184ce5be8f5fcb8f1` |
| bubble_map  | `7887dc246ae6e4562a3b7a34da998dc9a9b744bd45f1920d2d9673339025e5aa` |
| flow_map    | `58871d84288bc6d88add326b9793be9f5767b3675dcb675c7196e1941bbc202d` |

Both hosts ended at `spawnCount=1`, `loadCount=1`, `maxActiveJobs=1`, 16 completed jobs, 16 charts created/disposed, six geo registrations, one geo registration key, zero active charts/jobs, and restored RNG/clock guards.

This is useful local cross-host evidence, but it is not the locked memo's real Linux-x64 CI qualification. M06 owns that axis and the certified-runtime-matrix record.

### Built-artifact measurements

Reproducible command:

```text
pnpm --filter @oods/viz-render exec tsx test/s179-echarts-render-measure.mts
```

Final local observation on Darwin arm64 Node 24, nearest-rank p95:

| Measurement                                |                     Samples |         p95 |
| ------------------------------------------ | --------------------------: | ----------: |
| package import                             |          10 fresh processes |   10.803 ms |
| worker startup + lazy ECharts first render |          10 fresh processes | 1048.049 ms |
| total package import + first render        |          10 fresh processes | 1055.043 ms |
| warm canonical treemap                     | 50 renders after one warmup |   14.375 ms |
| force at 250 nodes                         |                   5 renders |  722.162 ms |

The final measurement worker completed 56/56 jobs with one spawn/load, `maxActiveJobs=1`, and 56/56 chart disposals. Process-wide RSS moved from 40,304,640 to 271,810,560 bytes (`+231,505,920`). That RSS observation includes the client process and is **not** worker-side heap evidence or a plateau result.

The local first-use p95 is 55.043 ms above the memo's explicitly provisional 1,000 ms figure; this is recorded as a thin local miss, not hidden or promoted into a release-runner budget. Warm and 250-node force p95 remain below the provisional 15 ms and 1,500 ms figures. M06 must ratify or renumber the numeric gates on the release runner and execute the required worker-side heap/RSS slope plateau; none of those gates is deleted here.

## Deferred qualification and honest limits

- Real Linux-x64 CI replay remains M06 work; the local Linux evidence is arm64.
- Numeric release budgets remain provisional until M06 pins them.
- The 1,000-geometry functional soak proves fixed-key registration and disposal, not memory plateau. M06 owns worker-side post-GC heap plus process-wide RSS trend windows and slope/fallback grading.
- Force link and payload ceilings remain unresolved `null` values. Completion does not claim those input-limit contracts are closed.
- The worker runtime/entry are behaviorally covered through built artifacts but excluded from source coverage accounting for the stated worker-realm reason.
- No commit was created; the sprint's commit boundary remains Derek-owned.

## Decisions captured by this mission

1. Keep one serialized worker in v1. The measured warm path does not justify a pool, and the worker owns map registry, allocator counters, RNG, and text-clock state as one realm.
2. Publish only the ratified 250-node force ceiling and fixed `600x400` viewport. Represent unratified link/payload limits as explicit nulls rather than inventing numbers.
3. Preserve CommonJS usability with a lazy public-barrel Vega import and separate emitted `emitter` entry, leaving the existing async API and Vega SVG bytes unchanged.
4. Couple boundedness metrics to the exact alias passed to `registerMap`, and perform registration immediately before `setOption` so the test and implementation prove the literal ordering contract.
