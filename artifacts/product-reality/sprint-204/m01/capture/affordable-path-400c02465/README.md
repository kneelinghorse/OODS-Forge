# The five-suite capture Sprint 203 owed

**Status: GREEN.** One run, five suites, clean tree before and after, at head
`400c02465e8bfe013a3672c5465bf8f650820338` on the affordable path this mission built.

Sprint 203 closed without a capture receipt and said what it owed:
[`sprint-203/m06/capture/WHAT-THE-CAPTURE-IS-AND-IS-NOT.md`](../../../../sprint-203/m06/capture/WHAT-THE-CAPTURE-IS-AND-IS-NOT.md)
offered two ways to pay it — run the two missing suites alone against `9f22e3a56`, **or** fix the
serialisation first and capture once. This is the second.

## The five counts, stated separately

| Suite | Exit | Passed | Failed | Skipped | Failed files | Uncollected | Wall | Load at start |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| viz-core | 0 | 1,546 | 0 | 0 | 0 | 0 | 28.4 s | 4.3 |
| viz-render | 0 | 72 | 0 | 0 | 0 | 0 | 9.5 s | 3.6 |
| mcp-server | 0 | 7,256 | 0 | 16 | 0 | 0 | 1,159.6 s | 3.9 |
| root-core | 0 | 7,641 | 0 | 16 | 0 | 0 | 696.7 s | 7.5 |
| component-packages | 0 | 1,485 | 0 | 0 | 0 | 0 | 27.9 s | 11.0 |
| **Five-suite total** | | **18,000** | **0** | **32** | **0** | **0** | **1,922.1 s** | |

Setup (install, three builds) 39.1 s and the tripwire 51.1 s are on top: **2,012.3 s end to end, 33.5
minutes.**

## The count delta reconciles exactly, which is the part that is load-independent

Durations on this host move with whatever else is running. Counts do not, so the counts are what this
receipt asks to be trusted, and every one of the 22 new assertions is accounted for:

| Against Sprint 203's red receipt (17,978 / 3 / 32 / 3) | Δ passed | Why |
| --- | ---: | --- |
| mcp-server | **+9** | +10 from this mission's two new specs (`ledger-read-cost.s204` 4, `gate-roster.s204` 6); −1 from moving `m06-gate-bites.s184` to the on-demand gate config |
| root-core | **+13** | +10 from the same two specs (root-core already excluded `m06-gate-bites.s184`); **+3 from the three assertions that failed in Sprint 203 and now pass** |
| viz-core, viz-render, component-packages | 0 | unchanged |
| **Total** | **+22** | 17,978 + 22 = **18,000** |

Against Sprint 202's certified 17,849: +129 was Sprint 203's object work, +22 is this mission's.
Skipped is **32 and unchanged** — 16 in mcp-server and 16 in root-core, the Stage1 e2e fixtures whose
run directory no longer exists. They are s204-m03's job, not this mission's, and they are still
skipped here.

## The three files that made Sprint 203 red

All three are green, and all three were red only in root-core's longer run — mcp-server's own suite
passed them even in Sprint 203.

| File | Sprint 203 (root-core) | Here (root-core) | Here (mcp-server) |
| --- | --- | ---: | ---: |
| `contracts/viz-recipes.s190.spec.ts` | **failed** at its own 60 s ceiling | **9.2 s** | 13.1 s |
| `codegen/collections.s189.spec.ts` | **failed** | 15.5 s | 19.0 s |
| `product-reality/runtime-bite-selector.s196.spec.ts` | **failed** | 5.1 s | 8.2 s |

`viz-recipes.s190` is the gate the mission was asked to resolve. It finishes with a **6.5× margin**
under the 60 s ceiling it could not reach before, and under Sprint 202's 26.4 s baseline as well. The
margin is the claim; the number is not, for the reason in the next section.

## What this run does NOT prove

The capture is 1,922 s of suite time against Sprint 203's 5,906 s — 3.1× — and **that ratio is not
this mission's achievement.** Sprint 203's capture ran at load average 24.6 on 8 cores. This one
started each suite between 3.6 and 11.0. The mission's own receipt already concluded that host
contention, not workload, is what exceeded the 60 s ceiling, and the same caution applies in the
other direction: a fast capture on a quiet host does not prove a fast capture.

What is separably attributable:

- **`m06-gate-bites.s184` leaving the default suite** — exactly −1 file and −1 test, and 170.4 s off
  mcp-server at Sprint 202 load (336 s at Sprint 203 load). Directly measured, not inferred.
- **The ledger memo** — ~2.1 s of the census's 88 compositions, held by `ledger-read-cost.s204` as a
  read count rather than a timing.
- **The tripwire at 51.1 s**, down from 113.6 s on its first green run, for the same 14 checks.

Everything beyond those is host load, and this receipt does not claim it.

**One load warning fired**, correctly: `component-packages` started at load 11.05 on 8 cores. Its
28 s is an upper bound. Sprint 203's receipt recorded no load at all, which is why its 3,363 s
root-core could not be told apart from a real regression.

## Provenance

- Runner: `scripts/product-reality/capture-s185-m01-baseline.mjs` — the canonical runner, not a
  bespoke script (the failure mode of Sprint 203's first attempt).
- Command: `--workspace <this worktree> --sprint sprint-204 --mission s204-m01 --label
  affordable-path --runs 1`
- Scheduling, per suite with its reason, in `four-suite-baseline.json#runs[].suites[].fileScheduling`:
  viz-core, mcp-server and root-core serial for the three distinct stated reasons; viz-render and
  component-packages on package defaults.
- Clean tree asserted before setup, after setup, and before and after every suite — all true.
- Raw Vitest JSON retained per suite in `run-1/`, with the per-suite receipts and logs beside them.
