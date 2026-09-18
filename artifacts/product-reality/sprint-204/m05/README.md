# s204-m05: the difference presented for review, on the page and in the conversation

Builder self-certified: **false**. Built on `codex/sprint-204-observation` from `050ce1322` (m04).

A person can now read the Stage1-against-Forge difference beside the running design. Pass
`design.preview` an `observationRunPath`. Forge compares that Stage1 run with the version on screen,
stores the rows on the version, and shows them on the browser page and in the conversation app through
one renderer. Nothing on either surface can be acted on. There is no approve, reject or queue: the
person decides outside Forge.

## On the real capture

Run `d0a43821-5730-4bf3-8b40-20f6fcb6b69c` (TraceLab production), Mission list:

| | browser page | conversation (reference host, default CSP, real stdio adapter) |
| --- | --- | --- |
| rows | 3: disagrees on input, agrees on data-bound, agrees on entity | the same 3, same order |
| console errors | 0 | 0 |
| CSP violations | — | 0 |
| link to the observed screen | anchor to `https://tracelab.aquex.ai/missions` | the URL as text (the sandbox cannot open a tab) |
| buttons, forms or inputs inside the panel | 0 | 0 |

`observation-page.png` and `observation-app.png` are the two panels, and `receipt.json` holds the
counts. All of them come from `scripts/product-reality/s204-m05-receipt.ts`, which a reviewer can
re-run.

The disagreement a person sees on Mission list: Forge composes a search box and a filter on
`/missions`, while Stage1 saw no input there beyond the chrome shared by every page.

## What each rule became

| rule (from the mission) | where it holds | proof |
| --- | --- | --- |
| one renderer, two surfaces | `renderObservation` in `packages/mcp-bridge/src/preview/shell.ts`. The page passes an anchor callback; `preview-app/main.ts` passes a text callback. | spec: both files call `renderObservation(record, observationLink)`, and the row markup exists in exactly one source file under the bridge |
| provenanced or not shown | every row prints the Stage1 run uuid, target, artifact kind and read path, **that artifact's** capture time, and the Forge object, context and URN | page and conversation specs check each rendered row for all of them |
| the Forge side is the design on screen | the preview passes the version's own schema into the comparison, and the row names it: "the supplied Mission list schema (the version on screen)" | spec: every row's `schemaDigest` equals the sha256 of the stored version's schema |
| an honest empty state | a composition with no comparable screen (Mission `card`) shows what it searched, against how many observed screens and routes, in which run: "nothing found" | spec |
| staleness means outlived the version | a fresh version marks nothing, although the capture (00:52:11Z) precedes it, which it always will. An edit carries the rows forward and marks every one. `capturedAt` is never re-dated. | spec, on the real capture's timestamps |
| no observation, byte-identical page | the markup **and** its stylesheet are emitted only when the version carries an observation | spec: `renderPreviewShell` output equals `no-observation-shell.pre-m05.html`, captured from the unchanged `shell.ts` before this mission edited it. The app renders no panel at all (reference-host spec). |
| no review workflow | the panel has no controls, and the words approve, reject, queue and accept do not appear | spec on Mission list (disagreeing) and Mission timeline (composed-only) |

Refusals go through the preview as well. `OODS-V208` (not a Stage1 run) and `OODS-V210` (a
composition with no registry object, composed from intent) are thrown before the version is touched.
The spec compares the version file byte for byte before and after.

## Found on the way, and fixed

**m04 counted four Chunk screens Forge will not compose.** Previewing Chunk list failed with
`OODS-V003` because Chunk composes only `inline`. m04's comparison had ignored `design.compose`'s status,
which comes back `error` *together with* a schema. The fix and its spec are described in the m04
README. The m04 record is now 45 rows, not 49.

**A misleading Forge-side label.** Rows compared against the version on screen still said "searched
design.compose … transient". They now name the source they actually compared.

Two points for reviewers:
- `design.compose` records a `workflow` composition's context as `list`. This is existing behaviour
  and it is not changed here. A workflow preview therefore shows the list rows.
- The m04 record's rows gained `routes`, and each Stage1 provenance gained its artifact's
  `capturedAt`. The retained `observation.json` was regenerated from the same run, and the m04 spec
  still requires a recompute to equal it.

## Files

| path | what |
| --- | --- |
| `packages/mcp-server/src/lib/preview-observation.ts` | compare the version on screen, keep its object's rows, carry them forward on an edit |
| `packages/mcp-server/src/tools/design.preview.ts` | `observationRunPath`, computed before anything is attached |
| `packages/mcp-bridge/src/preview/shell.ts` | `renderObservation`, and its conditional stylesheet |
| `packages/mcp-bridge/preview-app/main.ts` | the conversation half of the callback |
| `test/product-reality/observation-beside-the-design.s204.spec.ts` | page: 9 tests |
| `test/product-reality/observation-in-conversation.s204.spec.ts` | reference host: 3 tests |
| `no-observation-shell-input.json`, `no-observation-shell.pre-m05.html` | the byte-identity fixture, from the pre-m05 shell |

Suites at commit: mcp-server **421 files, 7,317 passed, 0 failed, 9 skipped** (the `action-mappings` 9); mcp-bridge 11 files, 58 passed; root `pnpm typecheck` exit 0; `docs:check` exit 0; root `tests/verification` 170/170 — one test, `forge-claims --root`, timed out at 20 s while the full suite ran beside it and passed alone in 23.8 s (the known root-core parallel-load hazard, #1833: one isolated rerun).
