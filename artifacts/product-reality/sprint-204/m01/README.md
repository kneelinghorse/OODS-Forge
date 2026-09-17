# s204-m01 — the capture made affordable

Sprint 203 shipped without a five-suite receipt, and the capture that should have produced one cost
87+ minutes and contained a gate that could not finish. This mission was asked to fix the cost and
then produce the receipt Sprint 203 owed.

What follows separates what was **measured** from what was **assumed**, because three of this
mission's own early conclusions were wrong and the measurements are what caught them.

## 1. The gate that could not finish

`contracts/viz-recipes.s190`'s "the exported registry equals every live census cell after
canonicalization" stopped at its own 60s ceiling in the Sprint 203 review, where Sprint 202 measured
26.4s for the same fixed 88 compositions. The mission's instruction was explicit: measure
per-composition cost, do not simply raise the number.

### What the measurement found

A CPU profile of the 88 compositions showed `readRuntimeSummary` and its file read dominating
self-time. `design.compose` loads its catalog through `catalog.list`, which read **and fully
revalidated** the 3.79 MB, 310-cell runtime ledger on **every single call**.

That is real waste and it is now fixed: the ledger is memoized against its identity on disk
(path, device, inode, size, mtime), so a rewritten ledger is re-read and an invalid one still throws
for every caller. `packages/mcp-server/test/product-reality/ledger-read-cost.s204.spec.ts` holds
that by counting reads, not by timing.

### What the measurement did NOT support, and the corrections it forced

| claim made early in the mission | status | what the sound measurement says |
| --- | --- | --- |
| "496 ms → 99 ms per composition" | **wrong** | those were two runs at load 10 and load 6. Not a before/after. |
| "the ledger read is 47% of the census" | **wrong** | it is 24 ms of a 266 ms composition — about 9%. |
| "the components snapshot is 21% of non-idle, cache it too" | **wrong, and reverted** | measured directly it saves 1.3 ms per composition. The cost is the parse, which a text cache does not remove. The cache was added and then removed. |

The instrument that misled twice was **sampled CPU self-time on a loaded process**. It is not a cost
model. The numbers below come from direct measurement of each operation and from counting calls,
neither of which is sensitive to what else the machine is doing.

| file | size | cold read | memoized | saved / composition | saved across 88 |
| --- | ---: | ---: | ---: | ---: | ---: |
| runtime ledger | 3.79 MB, 310 cells | 24 ms | 0.008 ms | 24 ms | **2.1 s** |
| components snapshot | 1.06 MB | 3.4 ms | *(not cached)* | 1.3 ms if cached | 0.12 s |

A wall-clock A/B of the two arms in one process is retained in
[census-cost/census-phase-profile.json](census-cost/census-phase-profile.json) and is
**inconclusive** — it is kept to show why, not dropped. A 24 ms effect cannot be read off a 266 ms
baseline while the host's load average swings between 16 and 33.

### So why did the gate fail, and is it fixed?

Per-composition cost is **266 ms**, of which both file reads together are 27 ms. The other ~90% is
genuine composition work. The two memos save ~2.2 s of a ~24 s census.

Sprint 203 measured 60.4 s at **load average 31.8**. This mission measured the same gate green at
**16.2 s at load ~10**. That gap is far larger than 2.2 s, and the honest attribution is **host
contention, not workload**.

**The mission's stated fear is therefore not supported.** "A gate that doubles every five objects
will fail again in Sprint 206" assumes per-composition cost grows with the object registry. It does
not: the census walks a fixed 88 compositions and each loads exactly one object. The one term that
*did* grow with the registry was the per-call ledger read — 310 cells and rising — and that term is
now paid once per process instead of 88 times.

**The open risk is different from the one the sprint expected, and it is not closed by this mission:**
the 60 s ceiling is exceeded by host load, not by registry growth. Nothing here prevents a future
capture on a busy machine from hitting it again. What this mission adds is that the receipt now
records the load, so the next reader can tell the two apart.

## 2. Un-serialising the suites

The mission's premise was that policy `#1833` constrains root-core alone, and that the other four
suites pay roughly thirty extra minutes per capture for another suite's flake. **That premise is
false for mcp-server**, and [scheduling/file-scheduling.json](scheduling/file-scheduling.json) holds
every run's counts.

| suite | serial baseline | verdict |
| --- | --- | --- |
| mcp-server | 7,197 tests / 1,420 s | **cannot be un-serialised.** Its own `vitest.config.ts` sets `fileParallelism:false` because pack specs run prepack builds that replace shared workspace `dist` trees. Forced parallel: **120 failed suites, and only 6,801 of 7,263 tests collected at all** — with exactly the predicted signatures. Wall fell to 1,001 s: a 30% saving for a destroyed run. See [scheduling/mcp-server-forced-parallel.json](scheduling/mcp-server-forced-parallel.json). |
| root-core | 7,581 / 961 s | stays serial. Policy `#1833`, not re-litigated. |
| viz-core | 1,546 / 28 s | stays serial **on arithmetic, not a hard constraint**. Six parallel runs and three serial: parallel run 1, at the highest load observed, failed `chart-titles.s201`'s label-overlap assertion, which reads settled positions of an iterative ECharts force layout. Runs 2–6 and all serial runs matched exactly. A 28 s suite does not justify admitting a timing-sensitive geometry assertion into the receipt. |
| viz-render | 72 / 11 s | parallel proven clean 3/3 at 72/72/0. |
| component-packages | 1,485 / 52 s | parallel proven clean 3/3 at 1,485/1,485/0. |

**Measured saving: roughly 35 seconds of a 2,472-second capture.** mcp-server and root-core are 96%
of the capture and both are serial for stated reasons. Scheduling was not the cost.

What the change *is* worth: scheduling is now decided **per suite with its reason recorded on the
receipt**, instead of one blanket `--serial` applied to all five because of root-core's problem —
which is precisely what CMOS learning `#655` objected to.

### A second premise that does not hold

root-core and mcp-server share **299 files** — 628 s of root-core's 708 s of file time — which looks
like pure duplication. It is not. The root `core` project resolves `@oods/viz-core` to **src** where
the package suite resolves it to **dist**, and it excludes the 25 pack-lifecycle files individually.
Different resolution, genuinely different coverage. Left untouched deliberately.

## 3. The outlier that did not earn its time

`m06-gate-bites.s184` was **170.4 s for a single test** in the Sprint 202 *certified* capture — 15.8%
of mcp-server's summed file time and the slowest file in the whole five-suite capture. (336 s in
Sprint 203's run, which was taken at load average 24.6.) Its pack step is only 20.4 s of that; the
rest is 16 mutation cycles.

What it proves is **gate integrity** — that each of the eight runtime gates detects a unique injected
defect on both framework targets. That moves when the gate harness or the generation path moves, not
once per sprint. It does not earn a place in a suite that runs at every sprint close.

It is **moved, not retired**, on the existing `test:scale` precedent (decision `#614`):
`packages/mcp-server/vitest.gates.config.ts`, excluded from the default suite, run at closeout
through one command.

The risk in moving a proof out of a default suite is that it becomes a proof nobody runs — this
repo's standing example is the Stage1 e2e fixtures, skipped in every capture for sprints because the
run they read no longer existed. So the roster is **executable**:
[`scripts/product-reality/on-demand-gates.json`](../../../../scripts/product-reality/on-demand-gates.json)
names every on-demand gate, `run-on-demand-gates.mjs` runs all of them, and
`gate-roster.s204.spec.ts` asserts the roster agrees with the configs it describes — including that
the runner reads the roster rather than listing gates of its own, so registering a future gate in one
place is enough to make closeout run it.

**Capture accounting:** mcp-server loses exactly **one file and one test** against the Sprint 202
baseline. root-core is unaffected — it already excluded this file.

## 4. The tripwire

CMOS learning `#655`: both defects found on 2026-09-16 were specs asserting a sprint-scoped fact — a
ledger, a census, a mode block, a near.md reader — and nothing ran them first, so a ninety-second
discovery cost thirty-four minutes.

`scripts/product-reality/capture-tripwire.mjs` is fourteen such checks. It runs **after the builds
and before the first suite** inside the capture runner, and first in
`scripts/product-reality/s204-pre-freeze-part-a.sh`. The capture aborts if it is red. It runs every
check rather than stopping at the first, so a builder sees all the sprint-scoped facts at once.

**It earned itself on its first real run**, finding three failures in 126.5 s — each verified clean
at the untouched base first, so each was genuinely this mission's drift:

| check | cause | resolution |
| --- | --- | --- |
| `readiness-check` | this mission's `package.json` change moved the fingerprint | advanced `FACTS_PATH` to sprint-204 and regenerated — the same move s199-m01 through s203-m06 each made |
| `tool-truth-check` | the new spec imports the `design.compose` and `catalog.list` handlers, which the capability ledger records | regenerated the ledger and `docs:tools` in the same change, per learning `#650` |
| `near-md-readers` | `dist/pkg` not built — **not drift at all** | ran `pkg:build`; the ordering requirement is now documented in the script |

The third is the one worth keeping: a tripwire that fails on a missing build artifact rather than a
stale fact teaches a builder to ignore it. Green run: **113.6 s**, with a correct warning that the
host was at load 14.1 on 8 cores. Receipt in
[tripwire-proof/capture-tripwire.json](tripwire-proof/capture-tripwire.json).

## 5. Reaping the process group

CMOS learning `#656`: the capture Derek stopped left an orphaned vitest worker at PPID 1 burning 72%
CPU for at least 26 minutes, and the review found it only by looking.

The cause was structural. The runner used `spawnSync`, which **blocks the event loop**, so a
SIGTERM handler could never fire while a suite was running — no amount of handler registration would
have helped. Each suite now runs `detached` in its own process group and is awaited, so a handler
*can* run: SIGINT/SIGTERM/SIGHUP reap the whole group with `kill(-pid)`, then SIGKILL insists after
two seconds. `spawnSync`'s `maxBuffer` cap was lost in the switch and is restored explicitly, with a
truncation note in the log rather than an OOM.

SIGKILL to the runner itself remains unhandleable by anyone; that is stated rather than papered over.

## 6. Host load

Sprint 203's capture ran at load average 24.6 on 8 cores and took 2.4× its Sprint 202 time, and the
receipt said nothing about it. Every suite's load average was already recorded; what was missing was
anything that *read* it. The runner now warns above the core count, per suite, and the tripwire warns
before the capture starts.

Measured across this session, the host — Derek's working machine, running Chrome, Firefox, VS Code
and an unrelated Stage1 test run — sat between **load 7 and load 33 on 8 cores**. That is the single
largest influence on every duration in this receipt, and it is why the capture's **counts** are the
comparable number and its **durations** are an upper bound.

## 7. The receipt Sprint 203 owed

One five-suite capture, one run, green, at head `400c02465` on the path sections 1 to 6 built.
Full accounting and provenance in
[capture/affordable-path-400c02465/](capture/affordable-path-400c02465/README.md).

| | passed | failed | skipped | failed files | uncollected |
| --- | ---: | ---: | ---: | ---: | ---: |
| **Sprint 204 m01** | **18,000** | **0** | **32** | **0** | **0** |
| Sprint 203 (red) | 17,978 | 3 | 32 | 3 | 0 |
| Sprint 202 (certified) | 17,849 | 0 | 32 | 0 | 0 |

Every one of the +22 assertions is accounted for: +10 twice for this mission's two new specs in
mcp-server and root-core, −1 for `m06-gate-bites.s184` leaving the default suite, and **+3 for the
three assertions that failed in Sprint 203 and now pass**. The 32 skipped are unchanged and are still
the Stage1 e2e fixtures — s204-m03's job, not closed here.

`viz-recipes.s190`, the gate this mission was asked to resolve, finishes in **9.2 s in root-core and
13.1 s in mcp-server** against the 60 s ceiling it could not reach in Sprint 203.

End to end: 2,012 s — 33.5 minutes — against the 87+ minutes Derek stopped, and against Sprint 203's
5,906 s of suite time. **That 3.1x is not claimed as this mission's doing.** Sprint 203 captured at
load average 24.6 on 8 cores; this capture started its suites between 3.6 and 11.0. Consistent with
section 1's conclusion — contention, not workload, is the dominant term — the durations here are an
upper bound and the *counts* are the comparable number. What is separably attributable is listed in
the capture receipt: the moved gate file, the ledger memo, and the tripwire at 51.1 s for the same 14
checks it ran in 113.6 s.

**The open risk is unchanged and still not closed by this mission:** nothing prevents a capture on a
busy machine from hitting the 60 s ceiling again. What is different is that the receipt now records
the load, and one warning did fire — `component-packages` started at load 11.05 — so the next reader
can tell a slow host from a regression, which Sprint 203's receipt could not.
