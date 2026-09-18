# Sprint 204: built, review pending

Builder self-certified: **false**. The independent review, delivery to the served bridge, and Derek's
Claude Desktop and Cursor runs are separate. GitHub CI is off, so every gate below is a local command
with its log in this tree.

| Head | Commit | What it is |
| --- | --- | --- |
| Base | `8ef91bd13` | The Sprint 203 merge plus that review's receipts; the bridge serves it |
| m01 | `0243e7bd4` | The capture made affordable; Sprint 203's receipt paid |
| m02 | `43e4b14e6` | The Sprint 203 screen defects fixed at the producer |
| m03 | `d1208a626`, `df7e58491` | TraceLab captured; the Stage1 seam; the `object_rollup` 1.2.0 widening |
| m04 | `050ce1322` | The difference computed |
| m05 | `041683b33` | The difference presented on the page and in the conversation; an m04 defect fixed |
| Bundle | `20b4b995b` | The head the frozen archive, its E2E and the Linux proof were built from |
| Capture | `385601955` | The head the five-suite capture measured |
| Execution | tip of `codex/sprint-204-observation` | The capture receipt and this handoff |

## What was built

**Stage1 observed TraceLab's live production frontend. Forge set that beside what it composes from
the same objects and shows the difference on both surfaces, as evidence a person judges.** Before any
of that, the sprint paid the receipt Sprint 203 could not produce.

- **[m01, the capture made affordable](../../m01/README.md):** one five-suite run at `400c02465`,
  **18,000 / 0 / 32 / 0 / 0**. `m06-gate-bites.s184` (170–336 s for one test) moved to an executable
  on-demand roster. A sprint-scoped tripwire now runs first, the runner reaps its own process group,
  and load is recorded per suite.
- **[m02, the Sprint 203 screen defects](../../m02/README.md):** fixed at the producer. Empty card
  boxes 44 → 0 and `Allowed transitions` rows 24 → 0 across 184 screens, with 2,064 matrix cells and
  zero violations. `health` reports objects and traits **live** (23, 47); components stay a snapshot
  (110), and `health` says which is which.
- **[m03, TraceLab captured](../../m03/README.md):** production, authenticated, run
  `d0a43821-5730-4bf3-8b40-20f6fcb6b69c`, 25 routes with real records. The fit read found all four
  contract kinds readable once `object_rollup` 1.2.0 was accepted. **That is the one widening of the
  accepted contract**, and it is Derek's explicit exception to this sprint's rule, taken on the
  evidence that every `object_rollup` on disk is 1.2.0. The Stage1 e2e skips fell 16 → 9.
- **[m04, the difference computed](../../m04/README.md):** 45 typed rows: 5 observed-only,
  14 composed-only, 15 agreeing, 11 disagreeing on three named axes (entity, input, data-bound). Every
  row carries both provenances, and none were withheld. Refusals `OODS-V208`, `V209` and `V210` write
  nothing. Stage1 is read only through `structuredData.fetch`.
- **[m05, the difference presented](../../m05/README.md):** `design.preview` takes
  `observationRunPath`. One `renderObservation` serves the page and the conversation. The real Mission
  list rows show on both, with 0 console errors and 0 CSP violations. A version with no observation
  renders a page byte-identical to the one produced before this existed, and nothing in the panel can
  be acted on.
- **m06, this closeout:** pre-freeze parts A and B, the frozen bundle with its E2E and Linux proof,
  the tool ledger in mode `s204`, the censuses, `near.md`, and one capture.

## Found and fixed in this closeout

The tripwire and the gates did their job. In order:

1. **m05 moved `tool-descriptions.json` without a golden-ledger entry.** The tripwire caught it in
   0.5 s, and the entry is appended (`292aa3bf6`).
2. **The tripwire still checked Sprint 203's golden ledger**, which fails on any legitimate move this
   sprint. m02 created the s204 ledger without repointing the tripwire (`8467bfd3c`).
3. **`viz:gate` wrote its receipts into sealed `sprint-203/gate/`.** Those files were restored byte
   for byte, and the gate moved to sprint-204 with the spec sealing 203 (`a9efec5a2`).
4. **The archive E2E expected 46 traits; the bundle reports the live 47.** That is m02's fix reaching
   the archive. The red run is retained at
   [`pre-freeze/e2e-red-1/`](../pre-freeze/e2e-red-1/WHY-THIS-IS-RETAINED.md) (`20b4b995b`).
5. **m04 counted four Chunk screens Forge refuses to compose** (`OODS-V003`: Chunk composes only
   `inline`), because `design.compose` returns a schema *alongside* `status: "error"`. This was found
   and fixed in m05. The m04 record went from 49 rows to 45.

## Review these receipts

- **Pre-freeze:** [part A](../pre-freeze/part-a-status.txt) (the tripwire first, then every s201–s204
  spec, the reference host, the component packages, the adapter proofs and the root typecheck) and
  [part B](../pre-freeze/part-b-status.txt), with every log beside them. Also the
  [chart gate](../../gate/report.json) and the [on-demand gates](../pre-freeze/on-demand-gates.log).
- **Bundle:** the [manifest](../pre-freeze/portable-manifest.json), the
  [digest](../pre-freeze/portable-archive.sha256), the [E2E](../pre-freeze/e2e-host.json) and the
  [Linux proof](../pre-freeze/linux/preview-proof.json).
- **Closeout:** the [censuses](censuses.json), the [advertised diff](advertised-diff.json), and the
  runtime generation census [at the closeout head](runtime-census.json),
  [at m01's head](runtime-census.at-m01-0243e7bd4.json) and [at m02's head](runtime-census.at-m02-43e4b14e6.json).
- **Capture:** [closeout-385601955](../capture/closeout-385601955/README.md).
- **The observation itself:** the [m04 record](../../m04/observation.json) and the two
  [m05 screenshots](../../m05/observation-page.png).

## Verified scope

**The frozen bundle.** `forge-runtime.tar.gz` at `20b4b995b`: sha256
`6138370da0d7cf8c7b77acc70ed1572a61ab248567a5aaccfd8460baddd04c64`, **56,003,647 bytes**, 315
packages in the production closure, **20,964 payload entries**, `dirty: false`. Its extracted-runtime
E2E passed with **all 19 advertised tools executed and 0 typed**. The client negotiated MCP Apps and
the restart client kept the text result. The bundle's own `health` reports
`{ objects: 23, traits: 47, components: 110 }` with `countsFrom: { objects: live, traits: live,
components: snapshot }`. The same archive passed **20 of 20** checks in the pinned container
(linux-arm64, Node v22.20.0). The preview app is 2,111,372 bytes, revision `d9fe60d4de04`.

**The tool ledger** is in mode `s204`, bound to that E2E receipt: 24 rows, 19 auto, 19 executed from
the archive, 0 typed.

**Rosters and registries.** The registry did not grow this sprint: 23 objects, 310 runtime cells, 42
release cells. Components have 110 identities, with 0 component-styles files changed since the base.
Viz has 13 types, 78 render scopes and 23 patterns, and every viz registry and the certified matrix
are byte-identical to the base. The advertised diff, measured at `32d0535d6`, is 20 commits from the base with 10
advertised-surface paths, each attributed.

**The runtime generation census does not match the registry, and that is expected.** At the closeout
head, 218 of 310 rows equal the registry's `artifactHash` and **92 do not**: every card, and detail
and workflow wherever status timestamps or slot dates render. The attribution is measured, not
inferred:
- The same census at m02's parent, `0243e7bd4`, is **310/310 equal**.
- At m02, `43e4b14e6`, it is **the same 92**, with every generated hash identical to the closeout head.

All of the movement is m02's producer work, and nothing after it moved generation. The runtime
registry's hashes for those 92 cells are therefore pre-m02. A browser re-sweep (about two hours in
the pinned container) is carried below and not done here.

## Test accounting

**One five-suite capture, one run, green, at `385601955`.**

| | passed | failed | skipped | failed files | uncollected |
| --- | ---: | ---: | ---: | ---: | ---: |
| **Sprint 204 m06** | **18,123** | **0** | **18** | **0** | **0** |
| Sprint 204 m01 | 18,000 | 0 | 32 | 0 | 0 |
| Sprint 203 (red) | 17,978 | 3 | 32 | 3 | 0 |

Per suite: viz-core 1,546, viz-render 72, mcp-server 7,318 (9 skipped), root-core 7,702 (9 skipped),
and component-packages 1,485. It ran 1,916 s end to end. **Skipped 32 → 18** is exactly m03's
16 → 9, counted in both suites that run the e2e directory. The 18 that remain are the
`action-mappings` tests. One load warning fired: component-packages started at 12.33 on 8 cores, so
its duration is an upper bound.

Before the capture, a stranded-pin sweep (viz-core, viz-render and root-core on the same runner)
came back green. One root verification test timed out during m05 while the full suite ran beside it
and passed alone in 23.8 s. This is the known root-core parallel-load hazard (`#1833`), recorded in
the m05 README.

## Golden ledger and sealed receipts

`artifacts/product-reality/sprint-204/golden-ledger.json`: 4 must-not-move files and 9 may-move-once
pins, sealed through Sprint 203, and **one entry**: m05's move of
`packages/mcp-adapter/tool-descriptions.json`. `check` reports the sealed receipts byte-identical. The
Sprint 203 gate files that `viz:gate` briefly overwrote were restored from git before any commit.

## Carries for the next sprint's m01

- **The runtime registry is pre-m02 for 92 cells.** It needs a browser re-sweep in the pinned
  container, or a ruling that m02's own 2,064-cell matrix is the receipt for those screens.
- **The 9 `action-mappings` e2e tests still skip**, in each of two suites. Their emitter is gone from
  Stage1. Retiring the file breaks six of the thirteen repoint bindings in a frozen Sprint 184
  disposition, and three of those six sit inside the bridge-dependent group. The review decides.
- **`OODS-V206` and `OODS-V207` are not in the error registry.** These are Sprint 203's context
  refusals. `createError` degrades an unknown code to `server_error` with an incident id, so at the
  tool surface those refusals look like server faults. The fix is two lines in `registry.ts`.
- **`design.compose` records a workflow composition's context as `list`.** A workflow preview
  therefore shows the list's observation rows. This is existing behaviour and is not changed here.
- **The Stage1 manifest records `auth.type: "none"` for an authenticated capture.** That is Stage1's
  to correct, and it is recorded because it was measured.
- **Carried from m02:** `design.compose.s202`'s `OODS-V204` arm no longer reproduces;
  `Statusable.trait.yaml`'s `Banner` carries the same three refused props as the fixed `Badge`; and
  22 dashboard screens have no browser receipt because `design.preview` does not accept that context.
- **Carried from m03:** the Stage1 MCP tools return `hub control request failed`, and the local
  TraceLab qdrant is misconfigured (production is fine).
- **Derek's Claude Desktop and Cursor runs** are his, now standing for a fourth sprint.
- **Delivery and the roadmap closure** belong to the reviewing session: fast-forward the primary,
  install, build, restart PM2, check `/health`, and write the `near.md` closure.

## Not done, by rule

No npm publish, no tag, no release, no consumer notices, no primary-checkout build or PM2 restart, no
edits to host configuration, and no writes into the TraceLab or Stage1 repositories.
