# s203-m06 — Closeout, local only

Builder self-certified: **false**.

The heads, in order:

| Head | Commit | What it holds |
| --- | --- | --- |
| Implementation | `7e29ca94e` | m05's receipts: the last mission commit |
| Runtime re-sweep | `ad4ce343e` | The roster swept once at 310 cells, and the `DateRange` lowering the sweep caught |
| Pre-freeze | `c9eda38af` | The Sprint 203 readiness facts, the golden ledger's cell entries, the part A receipts |
| Chart gate | `e61bc6a89` | `viz:gate` green, and the gate's receipt path moved off the sealed sprint |
| Part B2 receipts | `db00f26d2` | The frozen bundle, its E2E and the Linux proof |
| Roadmap | `6513146c1` | near.md to BUILT, REVIEW PENDING, and the m06 handoff |
| Ledger + readiness | `0027cc0cd` | The tool ledger bound in mode `s203`, and the readiness default the pre-freeze flag was masking |
| Chart-gate boundary | `9f22e3a56` | The gate's escape cases moved to the unsealed sprint; the head the capture attempt measured |
| Execution | tip of `codex/sprint-203-objects-and-context` | This README, the censuses, the advertised diff and the handoff |

## The deferred runtime sweep, and the defect it caught

The runtime sweep m02–m04 deferred ran once here, in the pinned Linux browser container
(`mcr.microsoft.com/playwright@sha256:f1e7e010…`): the roster went **18 → 23 objects and 240 → 310
cells**, and the sweep measured **310 cells, 310 pass, 0 typed gaps, 0 fail**
(`runtime/runtime-cells.v1.json`, run `d4aa535a-ca90-4639-84a1-02c659a2eea2`, registry head
`7e29ca94e`).

**The sweep found a real defect and it is fixed at the producer.** m02 widened the `Stack` contract to
admit a `DateRange` pattern group without widening the lowering, so the generated React artifact
emitted `<Stack patternComponent fields>` and failed strict typecheck. `composition-directives.ts` now
consumes directives for every pattern group. Nothing else in the repo runs that gate — not part A, not
the four suites — which is the whole reason the sweep is not optional.

The first sweep run went red on four cells (two real, two npm flakes) and **is retained** at
`runtime-red-1/` with `WHY-THIS-IS-RETAINED.md`.

Separately, a **root sweep for stranded pins** found five and fixed all five.

## Pre-freeze pass

`pre-freeze/part-a-status.txt` and `pre-freeze/part-b-status.txt` list every command with its exit
code and window. Each command's log sits beside them.

### Part A

`run-part-a.sh` rebuilds nothing. It ran 27 gates. **Two went red on the first pass and both were
real:**

- `generate-check` — the schema generators had not been re-run after the new objects landed;
- `golden-ledger-check` — the ledger did not yet carry the runtime-cell entries the re-sweep produced.

Both were fixed and re-run, and `docs:check` and `typecheck` were re-run behind them. The four reruns
are recorded at the foot of `part-a-status.txt`, each exit 0. **Every gate ends green; two of them
took two passes, and the status file says so rather than hiding it.**

- **Generators and ledgers:** readiness `--check` on the Sprint 203 facts; `docs:check`,
  `generate:check` and `s193-tool-truth --check`; `--check` for `docs:api`, `docs:tools`,
  `docs:claims`, `render-license`, `third-party-notices` and `client-configs`; the golden ledger
  `check`, the viz census `--check` and the schema-types `--check`.
- **Specs:** the root verification project (the near.md readers and the install path), the object
  domains, the four Sprint 203 specs (`heading-order.s203`, `axe-scope.s203`,
  `context-beside-the-design.s203`, `context-in-conversation.s203`), the Sprint 201 and 202 surface,
  the bridge preview, and the four component packages.
- **Adapter and build:** the adapter's install and protocol proofs (`test-s55-m03` now **16/16**,
  `test-s55-m04`, `test-s55-m05`, native errors), and root `typecheck`.

### The chart gate

`pnpm viz:gate` ran alone at `c9eda38af`, because it rebuilds viz-core and viz-render. **All 11
commands exited 0** in 246 s (`artifacts/product-reality/sprint-203/gate/report.json`,
`commandsNotRun: 0`). The gate's receipt path had been hardcoded to the sealed sprint-202 and is now a
named constant, so the gate writes into its own sprint instead of the sealed one.

### Part B2

`run-part-b2.sh` ran three times, at `e17ee60d2`, `27e6037c4` and `cd7e76a2e` — the first two failed
the E2E on the two counts the new roster moved, and each failure moved the assertion to what the
bundle actually holds rather than the other way round:

1. `e17ee60d2` → the E2E still asserted **18 objects**; the archive's own health reports **23**.
2. `27e6037c4` → the E2E still asserted **240 runtime cells**; the archive's ledger holds **310**.
3. `cd7e76a2e` → **pass**, and that is the frozen bundle.

At `cd7e76a2e`, in order: the server and bridge dists were rebuilt at the head, `portable:assemble
--final` built the archive, the E2E ran against the extraction, and the Linux container proof ran from
the same archive.

The results:

- **The frozen bundle:** `forge-runtime.tar.gz`, **55,976,074 bytes**, sha256
  `9d7d73d581d83d8124e85374c4075c0bbbef28675c6929ae99c1003417f851fd`, **315 packages** in the closure,
  **20,960 payload entries**, `dirty: false` (`portable-manifest.json`, `portable-archive.sha256`,
  `portable-assemble.log`).
- **`e2e-host.json`:** pass.
  - **19 tools: 19 executed, 0 typed.** 30 calls in the first adapter process and 1 after the restart.
  - The archive's own `health` reports the new roster from inside the bundle: **23 objects**, 110
    components, 46 traits, and `productReality.runtime` at **310 cells, 310 pass, 0 typed gaps**.
  - The negotiated client listed and read the shipped preview app (**2,108,696 bytes**, revision
    `d1b254db5bdf`) and read `design_preview`'s modules, styles, record (head `cd7e76a2e`) and lineage
    through `resources/read`.
  - The restart client declared nothing and kept the text result.
  - The extraction tree was restored (`before` = `after`).
- **`linux/preview-proof.json`:** pass on linux-arm64 with Node v22.20.0, **20 of 20 checks**.

### Binding the tool ledger

The ledger is bound in mode **`s203`** to `pre-freeze/e2e-host.json` (receipt sha256
`054d26102ce9746e6684a78009cf49fcd61e0b3a77c300c308290f57d359a5f0`): **24 rows, 19 auto, 19 executed
from the archive, 0 typed**, 5 on-demand at contract tier. `docs/mcp/Tool-Specs.md` was regenerated.

The spec's new `s203` block reads the receipt directly, and the fact that discriminates this bundle
from Sprint 202's is the roster: **the archive's own health reports 23 objects where Sprint 202's
reported 18.**

### A readiness default the pre-freeze flag was masking

`s196-release-readiness.ts` exported `FACTS_PATH` still naming **sprint-202**. The pre-freeze pass
regenerates the Gate 2 packet with an explicit `--facts artifacts/…/sprint-203/…` flag, so
`readiness-check` passed while the default was stale. The only caller of the default is
`release-readiness.s196.spec.ts` — a spec part A does not run — so the drift could only surface in the
full suite, and it did. `FACTS_PATH` now names sprint-203.

This is the same shape as the `DateRange` defect above: **a gate that only one runner exercises.**

### The chart gate's own boundary cases, which tested nothing

`e61bc6a89` above moved the gate's receipt boundary to sprint-203 but changed only the two `toThrow`
messages, leaving both escape-path inputs built from sprint-202. Neither then tested what it names:

- `sprint-202/../sprint-201/gate` resolves to `sprint-201/gate`, already covered by the sealed-sprint
  cases — so nothing exercised a path carrying the allowed prefix as a raw string and escaping only on
  resolution;
- `sprint-202-other/gate` fails on the sprint number before the separator clause is reached, so the
  `+ path.sep` in the guard — the only thing separating the sprint-203 receipt tree from a sibling
  directory sharing its prefix — had **zero coverage**.

Both inputs now come from the unsealed sprint, and 202 joins the sealed roster the way 201 joined it
in `202805582`. **Proven by mutation, not by reading:** with `+ path.sep` deleted,
`verify('artifacts/product-reality/sprint-203-other/gate')` is accepted and `mkdirSync`s the
directory, writing the gate's command logs and `report.json` outside the receipt tree — observed
directly, then removed. Under the old inputs that mutant stays green. 14 tests pass against the
restored guard, which is byte-identical to the committed file.

**Three defects this sprint, all the same shape:** a gate that exactly one runner exercises, where the
runner that would catch it is the expensive one nobody runs first. That is the argument behind
learning `#655`.

## The capture (#1833) — incomplete

**Sprint 203 has no five-suite capture receipt.** Read
[`capture/WHAT-THE-CAPTURE-IS-AND-IS-NOT.md`](../capture/WHAT-THE-CAPTURE-IS-AND-IS-NOT.md) before
quoting any test count from this sprint.

Two attempts, neither a receipt. The second ran the canonical runner
(`capture-s185-m01-baseline.mjs`) at `9f22e3a56` with a clean tree and the four setup builds green,
and **Derek stopped it at 12:39 on 2026-09-16 after 87 minutes**:

| Suite | Status | Passed | Failed | Skipped | Failed files | Wall |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| viz-core | passed | 1,546 | 0 | 0 | 0 | 64s |
| viz-render | passed | 72 | 0 | 0 | 0 | 38s |
| mcp-server | passed | 7,247 | 0 | 16 | 0 | 2,249s |
| **Three of five** | **passed** | **8,865** | **0** | **16** | **0** | |
| root-core | **killed at 45 min** | — | — | — | — | — |
| component-packages | **never started** | — | — | — | — | — |

**8,865 is not comparable to Sprint 202's 17,849**, which was a five-suite total; root-core alone
contributed 7,565 passed to it. The raw Vitest JSON for the three suites that ran is under
`capture/incomplete-9f22e3a56/run-1/`, with `partial-accounting.json` beside it.

The sprint's own m06 work was verified individually before and after the attempt: the tool-truth
readers, the readiness spec, the chart-gate spec (14 tests, with the new escape case proven by
mutation), the golden ledger `check`, `docs:check` and `s193-tool-truth --check` are all green at this
head. What is missing is the *five-suite receipt*, not evidence for the changes.

**Why it was stopped, and the remedy.** The capture costs more than it is worth in its current shape.
`mcp-server` alone is 2,249s over 412 files, of which one file — `m06-gate-bites.s184.spec.ts` — is
**336s for a single test**, 19% of that suite; the slowest 12 files are 55% of it. Everything runs
`--maxWorkers=1 --no-file-parallelism`, but policy `#1833` constrains **root-core only**. Nothing
cheap runs before the expensive thing: both defects found this day are the same narrow
sprint-scoped-assertion class, about thirty specs that run in two minutes. And the host is
uncontrolled — this run hit load average **24.6 on 8 cores**, which is why root-core ran 2.4x its
Sprint 202 time. Recorded as CMOS learning **#655** (evergreen) and carried to Sprint 204 m01.


## Censuses (`closeout/censuses.json`, `closeout/runtime-census.json`)

Measured at the capture head by `closeout/census.mjs` and `closeout/runtime-census.ts`.

- **Runtime.** The canonical roster is **23 objects / 310 cells**, up from the base's 18 / 240 — the
  five objects born this sprint (`Decision`, `Sprint`, `Session` from CMOS's record; `Person`,
  `Cluster` from Hive's cohort) and the **70 cells** they added. The registry carries m06's re-sweep
  (310/310 pass, 0 typed gaps, run `d4aa535a…`, registry head `7e29ca94e`), and its moved cells are
  attributed in the golden ledger. The generation census re-composed and re-generated every row at
  this head: **not completed in this session.** `closeout/runtime-census.ts` re-composes and re-generates all 310 rows and was still running when the session closed; it is committed so the reviewing session can run it in one command. The sweep's own 310/310 with 0 typed gaps stands (`runtime/runtime-cells.v1.json`); what is missing is the independent generation-hash re-check at the closeout head The release
  ledger is 42 cells, written only by a bundle-mode sweep, and did not move.
- **Components.** 110 identities / 1,320 theme cells; Sprint 200 m02's measurement stands. No
  component identity changed this sprint. `packages/component-styles/src` changed in one file,
  `components.css`, where m01 closed the Sprint 202 heading-order carry by moving the panel, form,
  billing and audit-summary selectors from `h3` to `h2` with the headings themselves.
- **Viz. Unmoved, because there was no chart work this sprint.** 13 types / 78 render scopes / 23
  patterns, and all five viz registries — recipes, patterns, taxonomy, classification and the
  certified matrix — are **byte-identical to the base**. The pattern registry, the recipes and the
  matrix are must-not-move pins and held.
- **Tools.** The ledger is in mode `s203`, bound to the frozen bundle's E2E: 24 rows, 19 auto with
  **19 executed from the archive and 0 typed**, 5 on-demand at contract tier.
- **Bundle.** 315 packages in the closure, 20,960 payload entries, the archive **55,976,074 bytes**
  (sha256 `9d7d73d5…`) at `cd7e76a2e`, `dirty: false`. The preview app resource inside it is
  **2,108,696 bytes** at revision `d1b254db5bdf`.
- **Golden ledger.** 138 entries.

## Golden ledger and sealed receipts

`artifacts/product-reality/sprint-203/golden-ledger.json` holds **138 entries** across three files:
134 runtime-cell entries from m06's re-sweep, plus `tool-descriptions.json` and
`configs/agent/policy.json`.

- The **four must-not-move files** are byte-identical to the base: the viz pattern registry, the viz
  recipes, the certified matrix and the Sprint 196 package-shape baseline.
- `check` passed at every mission and at the capture head:
  `{"mustNotMove":4,"mayMoveOnce":9,"entries":138,"sealed":"byte-identical","status":"verified"}`.
- The **move rule is one move per mission, chained** — not one move ever. m05 corrected that reading:
  `tool-descriptions.json` moved in m01 (the four descriptions that opened with a noun phrase) and
  again in m05 (`design.preview`'s advertised input), and both moves are legitimate.
- The sealed Sprint 195–202 receipts are byte-identical to the base `a5d1ba084`.

## Advertised diff

`closeout/advertised-diff.json`: 22 commits from `a5d1ba084` (planning 1, m01 70, m02 56, m03 27, m04 464, m05 21, m06 11,409), 12,020 changed paths — the great majority m06's 310-cell runtime sweep receipts — of which **18 are advertised surface**, each attributed to its commits.

`objects/*.object.yaml` is advertised surface this sprint, because the registry an agent browses
through `catalog.list` and `object` grew by five.

## Roadmap

Only the top part of `cmos/foundational-docs/roadmap/near.md` changed: the §3 row E and the §8
Sprint 203 header read **BUILT, REVIEW PENDING 2026-09-16**, with a built paragraph giving the mission
summary and the census counts. The 136 closeout-reader assertions pass and the retained record below
the divider is byte-identical.

## Carries for the Sprint 204 m01

1. **`Decision/card` is not certified usable.** A CMOS decision has no title, so the card shows a raw
   date, a badge, and nothing about the decision.
2. **Three defects measured in m04 and deliberately left**, each because the fix disturbs a screen an
   earlier sprint certified:
   - the empty `Card` body under every card header, on all 23 objects (the placeholder is what slot
     `componentOverrides` and slot swaps target);
   - the raw stored date in slot-bound text (formatting pulls `@oods/component-contracts` into
     artifacts that declare no such dependency);
   - the `Allowed transitions: None recorded` row on every `Stateful` detail (the fix reshapes
     Subscription's already-certified tabs).
3. **`traits/visual/Statusable.trait.yaml`** authors `Badge` with a `statusField` directive the
   canonical `Badge` contract refuses. No object composes it, so it sits unexercised.
4. **Derek's Claude Desktop and Cursor runs remain his and are not claimed.** The host folder
   `artifacts/product-reality/sprint-202/m05/hosts/` still holds only its README, untouched. This is
   the second sprint the carry has stood.

## Handoff

`closeout/handoff.md` (`builderSelfCertified: false`) gives the heads, the receipts index, the
verified scope, the test accounting and the carries. `closeout/pull-request.json` records the PR
against `OODS-pro`.

Not done here, by rule: no release, tag, notices, PM2 restart or primary-checkout build. Delivery and
the Claude Desktop and Cursor runs belong to the review.
