# Sprint 205: built, review pending

Builder self-certified: **false**. The independent review, delivery to the served bridge and to aquex, and Derek's
Claude Desktop and Cursor runs are separate. GitHub CI is off, so every gate below is a local command with its log
in this tree.

| Head | Commit | What it is |
| --- | --- | --- |
| Base | `c3847effa` | The Sprint 204 merge (PR #122); the bridge and aquex serve it |
| m01 | `c0ab36a78`, `96fd502d2`, `06796a3f7` | Pointers moved first; the carries; the 92-cell re-sweep |
| m02 | `e9914a2ae` | Stage1's objects born from real runs, with their screens |
| m03 | `d84e988dd` | The result-state and provenance traits |
| m04 | `947822462` | The run view against real output, on both surfaces |
| m05 | `587c31531` | The slice 4 research memo |
| Sweep | `858a562e1` | The head the 352-cell runtime registry was swept at |
| Bundle | `374d1d8e7` | The head the frozen archive, its E2E and the Linux proof were built from |
| Capture | `61c3af542` | The head the five-suite capture measured (the first, at `4ff1e6f92`, red and retained) |
| Execution | tip of `codex/sprint-205-stage1-objects` | The capture receipt and this handoff |

## What was built

**Stage1 emits, Forge composes and certifies: a run's real records on certified screens, read only through
admitted, pinned, attested kinds.** Before any of it, the Sprint 204 carries.

- **[m01, the carries](../../m01/README.md):** every sprint-scoped pointer moved first (the tripwire now also checks
  the archive E2E's literal counts); the 92 stale runtime cells re-swept, 310/310; `action-mappings` 8 retired in
  place + 1 running; `OODS-V206`/`V207` registered (and every thrown code proven registered); the `OODS-V204` arm
  re-anchored on Transaction/detail; a workflow recorded once as itself; dashboards previewed in the browser for the
  first time (22/23, 792 cells, 0 axe); three Sprint 204 invariants that iterated `undefined` now run; a positive craft
  bar pinning 24 residue screens.
- **[m02, objects born from real runs](../../m02/README.md):** a self-checking fit read; **Run, Finding,
  CapturedArtifact** under `objects/capture/`; four candidates named as not born; the Evidence naming decision; three
  producer fixes found by real records (records named by their uuid, an empty table in every row, workflow previews
  that could not compile).
- **[m03, the traits](../../m03/README.md):** `core/Assessable` (result state, neutral family pinned by the composer,
  `OODS-V211`, proven in all six scopes; `accent` refused on measurement) and `core/Provenanced` (factored from the
  observation rows and context panel).
- **[m04, the run view](../../m04/README.md):** the deliberate widening (`a11y_report` 2.2.0, `report_index` 1.0.0,
  `a11y_evidence` 1.1.0 under attestation, `run_manifest` shape-pinned because Stage1 does not version it);
  `design.preview` `runPath`; the four screens with run 6e435ce7's real records on the page and in the conversation;
  `OODS-V212`–`V214`; the closure extended.
- **[m05, the slice 4 read](../../../../../cmos/planning/forge-slice4-decisions-against-compositions-research.md):** a memo;
  TraceLab used through its tools (`DP-DR-001`, new mission `FORGE-S205-SLICE4-001`).
- **m06, this closeout.**

## Found and fixed in this closeout

The runtime sweep is the one gate that installs, strict-typechecks and drives every generated app. It found real
defects on the new objects, and every red run is retained beside the green one:

1. [`runtime-red-1`](../runtime-red-1/WHY-THIS-IS-RETAINED.md) — **a form's title-slot input had no change handler**
   (uneditable, "valid" when emptied; latent on Invoice too) and **a `null` sample on a non-nullable optional field**
   failed strict typecheck. Both fixed at the producer.
2. [`runtime-aborted-2`](../runtime-aborted-2/WHY-THIS-IS-RETAINED.md) — **sample ids repeated** when 6 real ids
   cycled across 10 records. The id keeps the stable key unless there are enough real ids.
3. [`runtime-aborted-3`](../runtime-aborted-3/WHY-THIS-IS-RETAINED.md) — **two harness assumptions** that held only
   while sample data was synthetic (a stale copy of the title-field list; a descending order that reversed ties).
4. [`pre-freeze-red-1`](../pre-freeze-red-1/WHY-THIS-IS-RETAINED.md) — the root typecheck over this sprint's own files.
5. [`closeout-red-4ff1e6f92`](../capture/closeout-red-4ff1e6f92/WHY-THIS-IS-RETAINED.md) — the first capture: one
   count pin (266 → 302) this closeout had missed.
6. [`bundle-red-1`](../pre-freeze/bundle-red-1/WHY-THIS-IS-RETAINED.md) — the assembler's tracked-file pins; the
   tripwire now checks them.

Also fixed: the golden-ledger script chained its runtime rows from the base instead of each row's last entry (the m04 and m06
appends each re-recorded m01's 92 moves; both were reverted before commit); the ledger's appends are correct now.

## Review these receipts

- **Pre-freeze:** [part A](../pre-freeze/part-a-status.txt) (19 gates, tripwire first, all exit 0) and
  [part B](../pre-freeze/part-b-status.txt), with every log beside them; the [chart gate](../../gate/).
- **Bundle:** [manifest](../pre-freeze/portable-manifest.json), [digest](../pre-freeze/portable-archive.sha256),
  [E2E](../pre-freeze/e2e-host.json), [Linux proof](../pre-freeze/linux/preview-proof.json).
- **Closeout:** [censuses](censuses.json), [advertised diff](advertised-diff.json),
  [runtime generation census](runtime-census.json) (352/352 equal).
- **Capture:** [closeout-61c3af542](../capture/closeout-61c3af542/README.md), and the retained red one beside it.
- **The run view itself:** [m04 receipt](../../m04/run-view.json) and [its screenshots](../../m04/shots/).

## Verified scope

**The frozen bundle.** `forge-runtime.tar.gz` at `374d1d8e7`: sha256
`adaaad9174657a2edb57452daed4dede641dea01482cbfcf927274a84a51c941`, **56,047,799 bytes**, 315 packages in the
production closure, **20,979 payload entries**, `dirty: false`. Its extracted-runtime E2E passed with **all 19
advertised tools executed and 0 typed**, the client negotiated MCP Apps, and its own `health` reports
`{ objects: 26, traits: 49, components: 110 }` with objects and traits live. The same archive passed **20 of 20**
checks in the pinned container (linux-arm64, Node v22.20.0). Preview app 2,111,586 bytes, revision `8aed87a044d0`.

**Tool ledger** in mode `s205`: 24 rows, 19 auto, 19 executed from the archive, 0 typed.

**Rosters.** Objects 23 → **26**, traits 47 → **49**, runtime cells 310 → **352** (352/352 at `858a562e1`, run
`d096def3`; the generation census 352/352 equal). Components 110 identities, no component-styles file changed. Viz:
13 types, 78 render scopes, 23 patterns; every viz registry and the certified matrix byte-identical to the base.
Advertised diff from the base: 16 advertised-surface paths.

## Test accounting

**One five-suite capture receipt, one run, green, at `61c3af542`.**

| | passed | failed | skipped | failed files | uncollected |
| --- | ---: | ---: | ---: | ---: | ---: |
| **Sprint 205 m06** | **18,275** | **0** | **0** | **0** | **0** |
| Sprint 204 m06 | 18,123 | 0 | 18 | 0 | 0 |
| Sprint 204 m01 | 18,000 | 0 | 32 | 0 | 0 |

Per suite: viz-core 1,546, viz-render 72, mcp-server 7,394, root-core 7,778, component-packages 1,485; 1,711 s end to
end. **Skipped 18 → 0** is m01's action-mappings retirement in both suites that run the e2e directory. One load
warning, at the tripwire (8.55 on 8 cores).

**Retained red:** the first capture at `4ff1e6f92` failed one assertion in one file (a non-workflow cell count this
closeout missed, 266 → 302), in mcp-server and root-core; fixed and re-captured in full, never upgraded.

## Golden ledger and sealed receipts

`artifacts/product-reality/sprint-205/golden-ledger.json`: 4 must-not-move and 9 may-move-once pins, sealed through
Sprint 204. **141 entries**: m01 the 92 re-swept cells and the head; m04 `tool-descriptions.json`; m06 42 cells
born, 4 moved (Invoice form and workflow, from the title-input fix) and the head. `check` reports the sealed receipts
byte-identical.

## Carries for the next sprint's m01

- **Read-only records offer forms.** Run, Finding and CapturedArtifact compose form and workflow contexts, and a
  Finding's detail offers Delete and Edit, though Forge only ever reads them. `metadata.supportedContexts` is the
  mechanism (Chunk uses it), but the preview's sample seeding composes a workflow for every object except Chunk and
  would need to change with it.
- **13 dashboards overflow at 390 and 820** (a fixed ~1,024 px element), both frameworks, found by m01's first
  dashboard receipts.
- **Each workflow previewed has one high-contrast `color-contrast` node** (measured on the three new workflows and on
  Subscription's; the other workflows were not previewed) — visible only since workflows are actually previewed.
- **The `accent` status tokens are defined for light only** (dark and hc render the light chip).
- **The positive craft bar's 24 residue screens** (mostly cards heading with a trait's generic `label`).
- **Behaviour-trait state fields in forms** (Search Query, Filter Count, Page appear as editable fields on the
  capture objects' forms).
- **Stage1-side facts, for Stage1 to decide:** the run manifest carries no `schema_version`; `entity_catalog`,
  `style_fingerprint` and `stylesheet_rules` are unstamped; non-verdict axe results are written only as counts, so a
  needs-review finding cannot be shown; `auth.type` still reads `none` for authenticated captures. Recorded, not sent:
  there are no consumer notices.
- **Slice 4:** the memo's Sprint 206 candidate 1 (applicability on supplied decisions, evaluated in the preview).
- **Derek's Claude Desktop and Cursor runs** are his, standing for a sixth sprint.
- **Delivery and the roadmap closure** belong to the reviewing session: fast-forward the primary, install, build,
  restart PM2, check `/health`, `aquex reconnect oods-forge` and prove it through the aquex health tool, and write the
  `near.md` closure.

## Not done, by rule

No npm publish, no tag, no release, no consumer notices, no primary-checkout build, PM2 restart or aquex reconnect, no
edits to host configuration, and no writes into the Stage1 or TraceLab repositories (TraceLab was used through its
tools: one research mission created and read). Stage1's repository is at the same commit with the same six
uncommitted files it had before this sprint read anything.
