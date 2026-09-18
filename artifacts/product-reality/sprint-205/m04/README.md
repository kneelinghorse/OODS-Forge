# s205-m04 — the run view against real output

Builder self-certified: **false**. Built on `codex/sprint-205-stage1-objects` from `d84e988dd` (m03 closed).

**The first visible slice, on Stage1's data, not a fixture.** `design.preview` takes `runPath`: a Stage1 run's
real records become the screen — the run, its findings with their result state and provenance, its attested
artifacts — on the browser page and inside the conversation app. Forge reads the run from disk, only through
`structuredData.fetch`, never calls Stage1 and writes nothing into it.

## The deliberate widening of the seam

Decided at the Sprint 205 lock (#2205), recorded as one decision on this mission's completion. `structuredData.fetch`
admits four run-view kinds, each at exactly what run 6e435ce7 writes; the four rollup kinds are untouched:

| kind | file | pinned | notes |
| --- | --- | --- | --- |
| `a11y_report` | `artifacts/a11y_report.json` | `schema_version` 2.2.0 | |
| `report_index` | `artifacts/report-index.json` | `schema_version` 1.0.0 | payload kind `report_index` |
| `a11y_evidence` | `evidence/a11y/a11y_manifest.json` | `version` 1.1.0 | the evidence manifest stamps `version`, not `schema_version`; **every per-page axe file is read only after its sha256 equals the run manifest's attestation** (41 of 41) |
| `run_manifest` | `manifest.json` | **unversioned, shape-pinned** | Stage1 stamps no version on the run manifest (m02 fit read). Pinned by the shape the view reads: `run_id`, `mode`, `targets[{name,url}]`, `passes[{id,version,status}]`, `environment.timestamp`, `hashes`. A manifest that grows a `schema_version` is refused until a decision admits it. |

The lock said "each at its pinned schema_version"; the manifest has none, so it is pinned by shape instead, and that
is stated rather than papered over. Every other artifact the view reads must also be under the manifest's
attestation. **Not admitted:** `entity_catalog`, `style_fingerprint`, `stylesheet_rules` — no `schema_version`;
Stage1 would have to stamp them.

**Fast-fail unchanged, proven per kind** (`test/e2e/stage1-run-view.e2e.spec.ts`, on copies of the run in a temp
directory): a11y_report 2.3.0, report_index 1.1.0 and a11y_evidence 1.2.0 are refused; a stamped manifest and a
manifest missing `targets` are refused; an evidence file whose bytes differ from its attestation is refused.
**Discovering gate:** every run on disk that carries the kinds is read through all four (fails if Stage1 is
checked out but no run qualifies; skips only with no checkout) — 8/8.

## The run view — [`run-view.json`](run-view.json)

`lib/run-view.ts` builds the capture objects' records from the four kinds and nothing else (the closure spec
asserts it reads no file itself). What it covered on run 6e435ce7: **6 findings, 40 pages (4 with findings),
4 evidence files cited, 27 artifacts, 41 attested evidence files, read in 29 ms.**

`design.preview` reads the run BEFORE any version is composed or touched, overrides the preview model with the
records (every row on a list, the record on a detail), and stores on the version which run it shows — runId,
target, the kinds and versions read, the coverage. An edit carries that forward and re-reads the same run.

**On the browser page** (`scripts/product-reality/s205-m04-run-view.ts`): run list, run detail, finding list and
finding detail, React and Vue, 1440 and 390 — **16 cells, 0 console errors.** The finding list shows exactly the
run's six findings, each with the neutral "Violation" result chip and the time it was obtained; the finding detail
shows the engine (axe-core 4.11.0), the evidence file it came from, the run and the source; the run list shows
this run, one row, named by its target — not the six seed records.

**Inside the conversation**, under the reference host's default CSP and the real adapter over stdio: the same four
screens each showing the run's real records — **0 CSP violations, 0 console errors in the host page, 0 errors in
the app.** Screenshots in [`shots/`](shots).

The observation panel is untouched and still works beside a composition that has one (the Sprint 204 specs run in
the full suite).

## Refusals — each writes nothing

| code | when | proven |
| --- | --- | --- |
| `OODS-V212` | the path is not one Stage1 run (no manifest, or not the shape a run view reads) | composition store stays empty |
| `OODS-V213` | an artifact the view needs is outside the admitted contract (version, kind or attestation) | store stays empty |
| `OODS-V214` | the composition is not Run, Finding or CapturedArtifact — or the version already shows a run of a different target | store stays empty; the bound version's file byte for byte |

(`OODS-V211` was taken by m03's result-state refusal, so these continue from V212.) All registered; the m01 sweep
proves every thrown code is. `run-view.s205.spec.ts` also proves reading never writes into the run.

## The closure, extended

`run-view.s205.spec.ts`: no sqlite driver, other product's store, network module, `fetch(` or socket in
`run-view.ts`, `structuredData.fetch.ts`, `result-state.ts` or `record-label.ts`; `run-view.ts` reads no file itself;
`structuredData.fetch.ts` writes nothing; and across **every source file of `mcp-server/src` and `mcp-bridge/src`**,
no sqlite driver, `cmos.sqlite`, Hive or TraceLab tool, and no process spawned to run Stage1.

## Pins and generated files

`packages/mcp-adapter/tool-descriptions.json` moved once (golden ledger, m04): `design.preview` names the run view
and its refusals, and `structuredData.fetch`'s description — which still said "Stage1 v1.5.0" and omitted
`drift_report` — names every kind it reads. `docs/api` and `docs/mcp/Tool-Specs.md` regenerated; schema types
regenerated. **Ledger script fixed:** appending after the re-sweep re-recorded all 92 runtime rows under m04,
because the runtime file's entries are per row and none carries the file's own hash; it now recognises a registry
already recorded at its current head. The ledger has exactly one m04 entry.

Not built, by rule: no queue, no approve or reject, no proposal. A person reads the run view and decides outside Forge.

## Suites

Full mcp-server suite: **7,371 passed, 2 failed, 0 skipped** (428 files, 917 s). Both reds were this mission's
own fallout and are fixed: `tool-specs-generator.s196` pins the count of root input parameters (128 → 129 with
`runPath`, moved with its reason), and the generated tool-capability ledger regenerated for the new specs (50/50 on
re-run). New specs: `run-view.s205.spec.ts` 10/10, `stage1-run-view.e2e.spec.ts` 8/8.
