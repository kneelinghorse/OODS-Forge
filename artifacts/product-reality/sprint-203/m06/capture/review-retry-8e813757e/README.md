# The two suites the sprint owed, run by the review

Sprint 203 shipped with no five-suite receipt: Derek stopped the builder's run at 12:39 on
2026-09-16 with `root-core` 45 minutes in and `component-packages` not started
([what the capture is and is not](../WHAT-THE-CAPTURE-IS-AND-IS-NOT.md)). The reviewing session
owed "root-core and component-packages alone against `9f22e3a56`". This is that run.

**It is a named retry, not a fresh capture.** The canonical runner's own `--suites` path was used,
so `four-suite-baseline.json` records `namedRetry: true` and
`suiteSelection: ["root-core", "component-packages"]`.

## Head

Measured at `8e813757e`, the branch tip, not at `9f22e3a56`. `git diff 9f22e3a56..8e813757e`
touches **only** files under `artifacts/` — no source, test, config or package file — so the two
heads are one tree for testing purposes and the tip is the more honest thing to measure. The review
verified that rather than assuming it.

## Result — RED

| Suite | Status | Passed | Failed | Skipped | Failed files | Wall |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| root-core | **failed** | 7,628 | 3 | 16 | 3 | 3,363s (56 min) |
| component-packages | passed | 1,485 | 0 | 0 | 0 | 192s |

Assembled with the builder's three green suites in [five-suite-accounting.json](five-suite-accounting.json):
**17,978 passed / 3 failed / 32 skipped / 3 failed files / 0 uncollected**, against Sprint 202's
17,849 / 0 / 32 / 0 / 0.

`root-core` began at load average 31.8 and ended at 11.1. Before starting, the review found and
killed an **orphaned `vitest` worker from the run Derek stopped** — PPID 1, still burning 72% CPU
26 minutes after the kill; host load fell 32 → 14.6 immediately (CMOS learning #656).

## The three reds, and what an isolated retry showed

One isolated retry was run per policy `#1833` (diagnostic only; it never replaces the red receipt).
See [isolated-retry/](isolated-retry/).

| File | In the suite | Alone | Verdict |
| --- | --- | --- | --- |
| `codegen/collections.s189.spec.ts` | timed out at 30s | **passed** | load-induced |
| `product-reality/runtime-bite-selector.s196.spec.ts` | `spawnSync pnpm ETIMEDOUT` | **passed** | load-induced |
| `contracts/viz-recipes.s190.spec.ts` | timed out at 60s | **failed at 60.4s** | **reproducible** |

### The reproducible one is a cost regression, not a content regression

`viz-recipes.s190`'s "the exported registry equals every live census cell after canonicalization"
carries its own 60s timeout that `--testTimeout=180000` does not lift; re-run alone with the larger
flag it still stopped at 60.4s ([viz-recipes-180s.log](isolated-retry/viz-recipes-180s.log)).

What moved is the cost, not the registry:

- The same test took **26.4s and passed** in the Sprint 202 capture
  (`sprint-202/m06/capture/attempt-1-56d54d8cc/.../root-core.vitest.json`).
- Its workload is **fixed and unchanged**: `s190-viz-census.ts` walks a hard-coded list of 11
  objects across `design.compose`'s `context` enum, which is 7 entries at both `a5d1ba084` and this
  head — 88 compositions either way.
- The viz registries themselves are **byte-identical to the base**, hash-verified by the review
  alongside the other three must-not-move files.

Same 88 compositions, 26.4s → over 60s, on a quiet host. Per-composition cost roughly doubled while
the object registry grew 18 → 23 and traits 46 → 47. The property the gate asserts is therefore
**currently unproven** — it cannot finish — and the cost points at the roadmap: Phase E's plan is to
keep adding objects.

Carried to Sprint 204 m01 with the rest of the capture work.
