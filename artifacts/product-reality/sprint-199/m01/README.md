# s199-m01 — carry fixes and a local chart gate

Builder self-certified: **false**. Execution base: `6b7dd54cd73b6e4597205e104ef2e1a9871bee77` with the working implementation identified by [source-manifest.json](source-manifest.json). The recorded base is not relabeled as a clean implementation commit. Every generated application retains its exact artifact hash. The mission-close commit binds these receipts. [Post-capture equivalence](post-capture-equivalence.json) records final source hashes after excluding a constant status enum; all four captured schemas and eight complete serialized app artifacts remain identical. The initial equivalence diagnostic compared in-memory undefined fields against JSON-serialized receipts; the final check compares the public JSON boundary.

[The gallery](index.html) contains the 36 requested affected screenshots: Organization and User address editing and persisted Save (12 each), Evidence filtering (6), and Mission's timeline (6). Both frameworks run at 390, 820, and 1440 px in the pinned Linux Chromium. Every viewport flow and exact React/Vue visible-text/control-value comparison passed. The address proof asserts the old street is absent and the address count remains one; the generated store boundary also preserves a second, unrelated entry when the declared default role is missing. The gallery is evidence for independent review, not a craft certification.

The [runtime scope](runtime/runtime-cells.v1.json) passes 56/56 cells for Organization, User, Evidence and Mission: six standalone contexts plus workflow, both frameworks. [Validation](runtime/validation.json) checks this explicit population; [artifact attribution](runtime/artifact-attribution.json) compares each hash with `b7a96ab0f`. These scoped rows do not replace or inflate the canonical 18-object / 240-cell ledger. The retained composition roster remains 11 objects / 77 schemas / 154 cells.

## Producer changes

- Address seed role rules precede enum rotation. Display and Save share the same role-match/first-entry selection; editing an existing displayed address never silently appends a second one.
- The list filter prefers the domain enum projected into the Classifiable vocabulary, then lifecycle status or a declared enum whose preview values vary. Evidence's store test no longer overrides its filter.
- Timeline identity binds to the title field. Label/description preview projections use that title when there is no authored example/default; all 17 workflow-capable objects pass the no-placeholder check.

## Verification and retained diagnostics

The existing focused run passed 87 tests. The final seed/address boundary run passed 25 (19 new carry cases plus the six collection cases); the readiness boundary run passed 23. These are overlapping runs, not a summed unique-test claim. No tests in these runs were skipped.

`pnpm viz:gate` builds viz-core/viz-render, typechecks viz-core, runs both suites without coverage, reads the named chart golden command from `ci.yml`, runs the selected chart/accuracy/placement contracts and scale gate, then checks docs, the matrix, and the tool ledger. Commands are sequential and the runner stops on the first failure, recording command timings and hashed logs. No hosted CI or full-suite capture runs here.

- [Base gate](gate-base/report.json): green, **119.219 seconds** at the unchanged implementation base.
- [First updated gate](gate-final/report.json): tests passed; the last tool-ledger check detected the new literal handler imports in the carry test. The failure is retained. The derived ledger was subsequently regenerated.
- [Second updated gate](gate-verified/report.json): tests passed; docs detected that Tool-Specs also consumes the tool ledger. Tool-Specs was regenerated. [Final gate](gate-complete/report.json): **passed**, all 11 commands, **114.496 seconds**; no unrun commands or skipped tests.
- [SVG-hash bite](hash-bite/receipt.json): the gate's actual `docs:check` command exits 1 for a zeroed SVG hash in a scratch registry and exits 0 after exact restoration. Raw red/restored logs are retained; the live registry remains byte-identical.
- The initial carry boundary run's one failure was a test selector that omitted the workflow's ID prefix. The corrected selector and final passing run are retained.

## Migration paths and the readiness conflict

The pattern census requires `--observations`; the docs/check caller explicitly reads retained Sprint 197 observations until m03 provides new ones. Matrix qualification supports `--mode s199`; its boundary test exercises a scratch output. The Sprint 199 attribution script adapts the Sprint 197 Git-qualified approach for chart identities and snapshot entries while keeping the palette frozen. The [golden ledger](../golden-ledger.json) contains 342 before-pins in 29 files and zero moved pins at m01. Its initial positional draft is retained here; the finalized before-plan keys registry rows/scopes by identity so adding an identity cannot masquerade as moving existing hashes.

The handoff simultaneously required the unchanged readiness generator and byte-identical Sprint 195–198 receipts. The generator hard-coded its current JSON output inside Sprint 196. The first regeneration exposed the contradiction; the historical bytes were immediately restored and [the diff](readiness-facts.diff) retained. The selected resolution preserves sealed receipts: a selectable `--facts` output, defaulting to `artifacts/product-reality/sprint-199/readiness/release-readiness-facts.json`. Fact collection and verification are unchanged. The generator rejects sealed Sprint 195–198 output paths, the marked packet link is generated, and the current `--check` passes. No bytes remain changed in the sealed directories.

Reproduce app and runtime evidence with the m01 scripts and `OODS_PLAYWRIGHT_WS_ENDPOINT` pointing to the pinned Linux Playwright browser. `capture-apps.ts` copies the Sprint 198 harness and retains only the affected checkpoints. `runtime-scope.ts` reuses that single immutable package pack.

The source-only whitespace check passes. The full staged whitespace check reports blank lines/trailing spaces in raw logs and exact generated consumer sources; these evidence bytes are retained unchanged.
