# Sprint 204 closeout capture: five suites, one run, green

Head `385601955`, the closeout head: every mission's code, the pre-freeze receipts, the tool ledger in
mode `s204`, the censuses and `near.md` at BUILT, REVIEW PENDING. The only commits after it are this
receipt and the handoff. The runner is the canonical `scripts/product-reality/capture-s185-m01-baseline.mjs`,
with `--sprint sprint-204 --mission s204-m06 --label closeout --runs 1`. Its tripwire passed first, in
66.6 s. The tree was clean before setup, after setup, and before and after every suite.

| suite | passed | failed | skipped | failed files | files | wall | load (1m) at start |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| viz-core | 1,546 | 0 | 0 | 0 | 75 | 28 s | 4.60 |
| viz-render | 72 | 0 | 0 | 0 | 7 | 8 s | 6.18 |
| mcp-server | 7,318 | 0 | 9 | 0 | 421 | 902 s | 5.60 |
| root-core | 7,702 | 0 | 9 | 0 | 685 | 808 s | 7.86 |
| component-packages | 1,485 | 0 | 0 | 0 | 71 | 26 s | **12.33** |
| **five suites** | **18,123** | **0** | **18** | **0** | 1,259 | 1,916 s end to end | |

**Uncollected: 0.** Every suite's collected file count equals its total, and no suite failed to
collect.

**One load warning fired.** `component-packages` started at load 12.33 on 8 cores, so its 26 s is an
upper bound. The counts are the comparable number; the durations are not.

## Against the last receipt (s204-m01, `400c02465`: 18,000 / 0 / 32 / 0 / 0)

- **Skipped 32 → 18.** The drop of 14 is exactly m03's re-pointing of `stage1-rollups.e2e.spec.ts`
  (16 → 9 skipped), counted once in mcp-server and once in root-core, which both run the e2e
  directory. The 18 that remain are the 9 `action-mappings` e2e tests in each suite. Their emitter is
  gone from Stage1, and retiring them would break a frozen Sprint 184 receipt. The review decides.
- **Passed +123.** These are the specs this sprint added from m02 to m06, the 14 formerly skipped
  e2e tests now running, and the m06 spec changes (the tool-truth s204 block and the chart-gate cases).
  Failed stays at 0 and failed files at 0.

The four `[Vue warn]: Unhandled error during execution of render function` lines in
`component-packages.log` come from tests that exercise component error paths. All 71 files passed.
They are Vue's own console warnings, not Vitest unhandled errors.
