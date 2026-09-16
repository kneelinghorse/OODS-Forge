# Sprint 203 has no five-suite capture receipt

**Read this before trusting any test count in this sprint.**

The five-suite capture that closes a sprint (#1833) **did not complete for Sprint 203**. Two runs were
attempted and neither produced a receipt:

| Attempt | Directory | What happened |
| --- | --- | --- |
| 1 | [`aborted-db00f26d2/`](aborted-db00f26d2/WHY-THIS-IS-RETAINED.md) | A bespoke script, not the canonical runner. Interrupted; `mcp-server` straddled a source edit. Not a receipt — but it found the `FACTS_PATH` defect, which is why it is kept. |
| 2 | [`incomplete-9f22e3a56/`](incomplete-9f22e3a56/partial-accounting.json) | The canonical runner at the capture head. **Stopped by Derek at 12:39 on 2026-09-16 after 87 minutes.** Three suites finished; `root-core` was 45 minutes in and `component-packages` never started. |

## What attempt 2 does prove

At head `9f22e3a56`, with a clean tree and the four setup builds green:

| Suite | Status | Passed | Failed | Skipped | Failed files | Wall |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| viz-core | passed | 1,546 | 0 | 0 | 0 | 64s |
| viz-render | passed | 72 | 0 | 0 | 0 | 38s |
| mcp-server | passed | 7,247 | 0 | 16 | 0 | 2,249s |
| **Three of five** | **passed** | **8,865** | **0** | **16** | **0** | |
| root-core | **NOT RUN TO COMPLETION** | — | — | — | — | 45 min, killed |
| component-packages | **NOT RUN** | — | — | — | — | — |

**8,865 is not comparable to Sprint 202's 17,849.** That was a five-suite total; root-core alone
contributed 7,565 passed and 16 skipped to it. Nothing in this sprint may quote a five-suite number.

## Why it was stopped

The capture costs more than it is worth in its current shape, and Derek stopped it on that basis.
The measured cause is recorded in CMOS as **learning #655** (evergreen), with the remedy carried to
Sprint 204 m01:

- `mcp-server` alone is 2,249s across 412 files. One file,
  `packages/mcp-server/test/product-reality/m06-gate-bites.s184.spec.ts`, is **336s for a single
  test** — 19% of that suite's summed time. The slowest 12 files (3% of the files, 236 of 7,263
  tests) are 55% of it.
- Every suite runs `--maxWorkers=1 --no-file-parallelism`, but policy `#1833` constrains **root-core
  only** — its git-range mover specs go red under parallel scheduling. The other four suites pay
  roughly thirty minutes a capture for a constraint that is not theirs.
- Nothing cheap runs before the expensive thing. Both defects found on 2026-09-16 are the same narrow
  class — specs asserting a sprint-scoped fact — about thirty specs that run in two minutes.
- The host is uncontrolled: this run hit load average **24.6 on 8 cores**, which is why root-core ran
  2.4x its Sprint 202 time of 16 minutes.

## What the reviewing session owes this sprint

Run `root-core` and `component-packages` alone against `9f22e3a56` and assemble the five counts from
the five raw Vitest JSONs, **or** fix the serialization first and capture once. Until one of those
happens, Sprint 203 has three green suites at its head and no capture receipt.
