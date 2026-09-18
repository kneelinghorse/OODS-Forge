# s205-m01 — the Sprint 204 carries closed, and a craft bar that says what a screen must carry

Builder self-certified: **false**. Built on `codex/sprint-205-stage1-objects` from `ff00832da` (the
planning commit on base `c3847effa`). Every fix is at the producer; nothing generated was hand-edited.

## First: every sprint-scoped pointer moved to Sprint 205 (`c0ab36a78`)

Before any receipt was written (#2203 found three still aimed at the previous sprint at closeout):

- `scripts/product-reality/s205-golden-ledger.ts` — base `c3847effa`, sealed through Sprint 204, the same
  4 must-not-move and 9 may-move-once pins. `artifacts/product-reality/sprint-205/golden-ledger.json`.
- The tripwire checks the s205 ledger.
- The chart gate's unsealed sprint is `sprint-205`; its spec seals 195–204 and builds the escape cases
  from 205.
- The readiness facts moved to `sprint-205/readiness/` through the generator (the gate-2 packet's link
  regenerated with it).
- **New tripwire check, `e2e-expectations-check`**: the archive E2E (`scripts/runtime/e2e.mjs`) asserts
  objects, traits and runtime cells as literals on purpose, so it cannot derive its expectation from the
  code it tests. The check compares those literals with the live registry in half a second, so the
  mission that adds an object or trait sees the stale literal that day rather than at closeout part B.

Tripwire at that commit: green, 59 s ([`tripwire-pointers/`](tripwire-pointers/capture-tripwire.json)).

## The carries

| Carry | Outcome | Proof |
| --- | --- | --- |
| `OODS-V206` / `V207` unregistered | Registered, `validation`, not retryable | `test/contracts/refusal-codes.s205.spec.ts`: both reach `ToolError.toStructured()` (what dispatch sends) as themselves; a sweep asserts every code the server throws (41) is registered |
| `action-mappings` 9 skipped ×2 suites | **8 retired in place, 1 now runs** | Each retired test keeps its title and body and asserts no Stage1 run under `out/` and no Stage1 source file names `bridge_summary` — it FAILS the day Stage1 emits it again. `meta.unresolvedEntity…` never read the bridge (synthetic vocabulary and instances) and runs unconditionally. `b2-legacy-inputs.s184` and `review-carries.s185` (the six selector bindings) green; `b2-repoint-disposition.json` untouched |
| Statusable `Banner` with 3 refused props | **Pin stands** | No sibling with field directives exists (no `StatusBanner` in the contracts or registry); the reason in `statusable-badge-contract.s204.spec.ts` still holds |
| `design.compose.s202` OODS-V204 arm | **Re-anchored on Transaction/detail** | [`v204-probe.json`](v204-probe.json) (`scripts/product-reality/s205-m01-v204-probe.ts`): with every region's fields named as its order, 34 of 92 screens still refuse a swap. Transaction/detail is the same status group moving the other way: ordering `detail-body-10` by `updated_at` refuses `header → StatusTimeline`, recording succeeds, and the refused candidate is not offered |
| Workflow recorded as `list` | **Fixed at the producer** | `assembleWorkflow` called compose four times non-transiently: four compositions written, the list's id returned, the stored version held the list screen only. Now the four compose transiently and the workflow is recorded once as itself; a workflow offers no swaps (an override applies to all four screens). Slot candidates are stored by position because a workflow repeats slot names. `workflow-record.s205.spec.ts` |
| 22 dashboards without a browser receipt | **Receipted** | `dashboard` is a compose *layout*, not a context. `design.preview` already opens a recorded version by `compositionId`, measured at ~0.3 s beyond the composition. The screen harness composes `layout: 'dashboard'` and previews by id |
| Craft bar measures only what a screen must not trip (#659, next-step 1546) | **Positive bar added; residue pinned** | below |

### Dashboards in the browser — [`dashboards/matrix-certify.json`](dashboards/matrix-certify.json)

All 23 objects, React and Vue, 390/820/1440, light/dark/high contrast in brands A and B: **22 screens,
792 cells, 0 axe violations, 0 console errors, 0 page errors, 0 clipped text, 0 below the font floor.**
Chunk refuses the dashboard layout by design (`OODS-V003`, composes only `inline`); the harness now says
so instead of sending a malformed preview.

**Residue found:** 13 dashboards overflow horizontally at 390 and 820 in both frameworks, never at 1440
(312 cells; 204 px over at 820, 634 px at 390 — one fixed ~1,024 px-wide element): Cluster, Collection,
Decision, Document, Evidence, Media, Mission, Person, Plan, Product, Project, Report, Session. Not fixed
here; carried.

### Three Sprint 204 invariants were never running

`card-body-anchor.s204.spec.ts` and `status-timeline-timestamp.s204.spec.ts` looped over
`listObjects().map(entry => entry.name)`. `listObjects()` returns names, so every entry was `undefined`,
every compose threw into a `catch { continue }`, and three invariants passed on zero screens. They now
iterate the real names (and `dashboard` as a layout), with a count guard. **All three hold** on real
screens.

## The positive craft bar — [`craft-says.json`](craft-says.json)

`test/product-reality/craft-says.s205.spec.ts` (logic in `craft-says.ts`; receipt by
`scripts/product-reality/s205-m01-craft-says.ts`). Per context: a **card** names the record and states a
fact beside the name; each **list** row names the record; a **detail** carries the record's primary text,
untruncated. The record's name and primary text are read from the object's declarations (its own fields
first, in file order, then its traits'; `text.label` first), never from what the composer chose.

**66 screens composed (Chunk's 3 typed `OODS-V003`), 24 fail.** Pinned as a ratchet — a new failure or
a fix both fail the spec until the list moves. The pattern: most cards head with a trait's generic
`label` rather than the object's own `name`/`title` (Person, Mission, Sprint, Session, Report, User,
Collection, Document, Project, Evidence, Plan, Subscription, Usage, Cluster); Decision's and Invoice's
list rows are named by their identifiers; Invoice's detail never shows its number; Transaction declares
no field that names a record. These fold into m02's certification, as the mission states.

## Runtime registry re-sweep

Census before the sweep at `96fd502d2`
([`runtime-census.before-sweep.json`](runtime-census.before-sweep.json),
`scripts/product-reality/s205-runtime-census.ts`, Sprint 204's census carried out of its sealed
directory): **218/310 equal, the same 92 cells, and every generated hash identical to the Sprint 204
closeout** — m01's producer changes moved no generation.

**The re-sweep:** `env TZ=UTC OODS_PLAYWRIGHT_WS_ENDPOINT=ws://127.0.0.1:19730/ pnpm exec tsx
scripts/product-reality/s193-runtime-cells.ts artifacts/product-reality/sprint-205/m01/runtime --workflows`,
pinned Linux browser container `forge-s197-playwright`, at `96fd502d2`, nothing else building beside it:
**310/310 pass, 0 typed gaps, 0 fail**, run `9490fe5e-f151-47bd-93d9-19399d48a4ec`, about an hour.
The registry moved once. Census after
([`runtime-census.after-sweep.json`](runtime-census.after-sweep.json)): **310/310 equal**. Golden ledger:
93 entries — exactly the 92 cells Sprint 204 m02 moved, plus the ledger head `7e29ca94e` → `96fd502d2`;
sealed receipts byte-identical.

## Suites

Full mcp-server suite after the sweep and a rebuild: **7,334 passed, 2 failed, 0 skipped**, 424 files,
1,742 s at host load ~12–25. **Skipped 9 → 0**, as the action-mappings retirement intends (the capture's 18
should read 0). The two reds, each measured:
- `codegen/detail-craft.s198` › *vue workflow compiles the readonly detail expressions* timed out at 30 s
  under the full suite and passes alone in 4.2 s (29/29) — the root/mcp parallel-load hazard (#1833), not
  this mission's change.
- `contracts/tool-truth.s193` — this README cites tools, so the generated tool-capability ledger moved; it
  is regenerated through its generator at its recorded head (generated docs are not move-once pins).
