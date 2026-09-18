# Sprint 205 closeout capture: five suites, one run, green

Head `61c3af542`, the closeout head: every mission's code, the pre-freeze receipts, the tool ledger in mode `s205`,
the censuses and `near.md` at BUILT, REVIEW PENDING. The only commits after it are this receipt and the handoff. The
runner is the canonical `scripts/product-reality/capture-s185-m01-baseline.mjs`, with `--sprint sprint-205
--mission s205-m06 --label closeout --runs 1`. Its tripwire passed first. The tree was clean before setup, after
setup, and before and after the run.

| suite | passed | failed | skipped | failed files | files | wall | load (1m) at start |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| viz-core | 1,546 | 0 | 0 | 0 | 75 | 28 s | 5.71 |
| viz-render | 72 | 0 | 0 | 0 | 7 | 9 s | 4.22 |
| mcp-server | 7,394 | 0 | 0 | 0 | 428 | 846 s | 4.13 |
| root-core | 7,778 | 0 | 0 | 0 | 692 | 680 s | 5.99 |
| component-packages | 1,485 | 0 | 0 | 0 | 71 | 22 s | 5.21 |
| **five suites** | **18,275** | **0** | **0** | **0** | 1,273 | 1,711 s end to end | |

**Uncollected: 0.** Every suite collected every file, and none failed to collect.

**One load warning fired**, at the tripwire (8.55 on 8 cores); every suite started below the threshold.

## Against the last receipt (s204-m06, `385601955`: 18,123 / 0 / 18 / 0 / 0)

- **Skipped 18 → 0.** The 9 `action-mappings` tests in each of mcp-server and root-core: 8 retired in place as
  assertions that fail the day Stage1 emits `bridge_summary.json` again, and 1 that never read the file and now runs
  (s205-m01).
- **Passed +152**, from the specs this sprint added (m01 refusal codes, workflow record, positive craft bar; m02 the
  capture objects; m03 the result-state family; m04 the run view and its admitted kinds) and the 18 formerly skipped
  tests now counted as passes.

## Retained beside it

The first capture at `4ff1e6f92` was red — one assertion in one file in mcp-server and root-core, a non-workflow cell
count this closeout should have moved (266 → 302). It is retained at
[`../closeout-red-4ff1e6f92/`](../closeout-red-4ff1e6f92/WHY-THIS-IS-RETAINED.md), never a receipt.
