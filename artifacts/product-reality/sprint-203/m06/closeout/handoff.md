# Sprint 203 — built, review pending

Builder self-certified: **false**. Independent review, delivery, and the Claude Desktop and Cursor
runs remain separate. GitHub CI is off, so every gate below is a local command with its log in this
tree.

| Head | Commit | What it is |
| --- | --- | --- |
| Implementation | `7e29ca94e` | m05's receipts, the last mission commit |
| Runtime re-sweep | `ad4ce343e` | The roster swept once at 310 cells, and the `DateRange` lowering it caught |
| Pre-freeze | `c9eda38af` | The Sprint 203 readiness facts, the golden ledger's cell entries, the part A receipts |
| Chart gate | `e61bc6a89` | `viz:gate` green, and the gate moved off the sealed sprint |
| Part B receipts | `db00f26d2` | The frozen bundle, its E2E and the Linux proof |
| Roadmap | `6513146c1` | near.md to BUILT, REVIEW PENDING |
| Ledger + readiness | `0027cc0cd` | The tool ledger in mode `s203`, and the readiness default the pre-freeze flag was masking |
| Chart-gate boundary | `9f22e3a56` | The gate's escape cases moved to the unsealed sprint; the head the capture attempt measured |
| Execution | tip of `codex/sprint-203-objects-and-context` | The commit that adds this handoff |

## What was built

**Objects are born from use, and context sits beside the design.** Five objects entered the registry
because a real screen needed them — three from CMOS's own record, two from Hive's cohort — and each
arrived with the screen that needed it, certified usable. Alongside them, an agent can now hand Forge
the context it already found and see it rendered beside the running preview, without Forge reaching
into anyone else's store.

Two rules governed the sprint and both held: **no object without its screen**, and **reuse proven by a
fit read first**.

By mission:

- **[m01, the Sprint 202 carries closed](../../m01/README.md):**
  - `heading-order` was far wider than recorded: **98 findings over 85 screens × 2 frameworks**, from
    eight components on Subscription alone. Fixed in all three renderers — React, Vue and the
    server-side HTML renderer the carry never named — plus the composer and `CardHeader`'s fallback
    level. **98 → 0**, both frameworks, every screen.
  - axe-core inside the conversation view: the descope is **re-typed with a measured reason**. A
    subtree run drops nine document-level rules — three of them exactly the findings Sprint 202 m01
    closed — and a whole-document run reports the chrome's own findings. Inlining the engine would add
    582 KB (+28%) for a strictly weaker measurement.
  - `test-s55-m03` at 15/16: **both sides were wrong**. The assertion ran inside the loop and stopped
    at the first offender. The verb list gained `Read`, `Open` and `Certify`; four descriptions that
    genuinely opened with a noun phrase were rewritten; the check now reports every offender at once.
    **16/16.**
- **[m02, objects born from CMOS's own record](../../m02/README.md):** `Decision`, `Sprint` and
  `Session`, read from the live store with `sqlite3 -readonly`. **Nothing was written to CMOS and
  Forge gained no code path to it.** The fit read maps every column of all four tables to a
  disposition and fails its own output if one is missing — it caught six on the first run. It found
  dead columns (null on all 1,933 / 499 rows), unusable CMOS counters (`total_missions` null on 176 of
  186 sprints), sound links (0 dangling `sprint_id` across 3,168 references), and quantified the
  long-free-text risk (`decision_text` to **8,418 characters**, 197 rows over 2,000).
- **[m03, objects born from Hive's cohort](../../m03/README.md):** `Person` and `Cluster`, read
  through Hive's **read tools only** — its three write tools were never called. **740 people, 307
  active across 331 feeds, 426 articles, 26 multi-person clusters.** These are the first screens that
  cohort has ever had. Three of four proposed reuses were **refused on measurement** (`core/User`,
  `core/Relationship`, `content/Article`) and one held (`lifecycle/Stateful`).
- **[m04, the new screens certified usable](../../m04/README.md):** 35 screens × 2 frameworks × 18
  width/scope cells = **1,260 measured cells** per phase, at 390/820/1440, in light, dark and high
  contrast, brands A and B. `button-name` on 9 screens → **none**; 0 console errors, 0 overflow, 0
  clipped text, 0 fonts below the 9px floor. **The first high-contrast run was wrong and the mission
  says so**: `hc` must be measured under `forced-colors: active`, proven by an already-certified
  screen reporting 19 nodes one way and none the other. Long free text was tested at the **real**
  extreme — the longest of the 1,933 CMOS decisions, 8,418 characters — and carried in full.
- **[m05, context beside the design](../../m05/README.md):** the caller hands what it already found to
  `design.preview` as `contextItems` and `contextSearched`; Forge checks, keys, stores and renders it.
  **Forge's closure is asserted by a spec, not by prose**: every `.ts` file under
  `packages/mcp-server/src` is read with comments stripped and none imports a sqlite driver, names
  `cmos.sqlite`, or calls a Hive, TraceLab or aquex surface. Staleness marks context that has
  **outlived** the version it was gathered for, not context fetched before the call.
- **m06, this closeout:** the deferred runtime sweep (18 → 23 objects, 240 → 310 cells, 310/310, 0
  typed), the defect it caught, the pre-freeze pass, the frozen bundle with its E2E and Linux proof,
  the tool ledger in mode `s203`, and the five-suite capture.

## Review these receipts

- **Pre-freeze:** [part A](../pre-freeze/part-a-status.txt) and [part B](../pre-freeze/part-b-status.txt),
  with every gate's log and exit code; the [chart gate report](../../gate/report.json); the frozen
  bundle's [manifest](../pre-freeze/portable-manifest.json), [digest](../pre-freeze/portable-archive.sha256),
  [E2E receipt](../pre-freeze/e2e-host.json) and [Linux proof](../pre-freeze/linux/preview-proof.json).
- **Runtime:** the [swept registry](../runtime/runtime-cells.v1.json) and the
  [retained red first run](../runtime-red-1/WHY-THIS-IS-RETAINED.md).
- **Closeout:** the [censuses](censuses.json), the [runtime generation census](runtime-census.json),
  the [advertised diff attributed by mission](advertised-diff.json) and the
  [golden ledger](../../golden-ledger.json).
- **Capture — READ THIS FIRST:** [what the capture is and is not](../capture/WHAT-THE-CAPTURE-IS-AND-IS-NOT.md).
  There is **no five-suite receipt for Sprint 203**. The [partial accounting](../capture/incomplete-9f22e3a56/partial-accounting.json)
  covers the three suites that ran; the [first, aborted attempt](../capture/aborted-db00f26d2/WHY-THIS-IS-RETAINED.md)
  is retained because it found the `FACTS_PATH` defect.

## Verified scope

**The frozen bundle.** `forge-runtime.tar.gz` at `cd7e76a2e`: sha256
`9d7d73d581d83d8124e85374c4075c0bbbef28675c6929ae99c1003417f851fd`, **55,976,074 bytes**, 315 packages
in the production closure, **20,960 payload entries**, terms and brand source aboard, `dirty: false`.
Its extracted-runtime E2E passed with **all 19 advertised tools executed and 0 typed limits**.

**The new roster inside the archive.** In that same run, the bundle's own `health` reported **23
objects**, 110 components and 46 traits, and `productReality.runtime` at **310 cells, 310 pass, 0
typed gaps** — the five objects born this sprint reaching an agent from the frozen archive, not just
from the checkout. The E2E's first two runs failed on exactly those two numbers, and each failure
moved the assertion to what the bundle holds.

**The conversation surface from the archive.** A client that negotiated `io.modelcontextprotocol/ui`
saw the adapter advertise `resources` and the extension, `_meta.ui.resourceUri` on `design_preview`
alone, and exactly one listed resource: the shipped preview app (**2,108,696 bytes**, revision
`d1b254db5bdf`), read back byte for byte. Its `design_preview` call carried `structuredContent` equal
to the text plus the resource URIs, and the compiled modules, styles, version record (head
`cd7e76a2e`) and lineage list were read through `resources/read`. The restart client declared nothing,
got no `_meta.ui` and kept the text result. The same archive passed in the pinned Linux container
(linux-arm64, Node v22.20.0) with **20 of 20 checks** and a matching digest.

**The tool ledger** is in mode `s203`, bound to that receipt (`pre-freeze/e2e-host.json`, sha256
`054d2610…`): 24 rows, 19 auto, 19 executed from the archive, 0 typed.

**Rosters and registries.** Canonical runtime roster **23 objects / 310 cells**, re-swept once in m06
(310/310, 0 typed, run `d4aa535a-ca90-4639-84a1-02c659a2eea2`); the generation census at the capture
head re-composed and re-generated every row and did NOT complete — `closeout/runtime-census.ts` was still running when the session closed and is committed for the reviewing session to run.
The release ledger is 42 cells and did not move. 110 component identities / 1,320 theme cells, with
one stylesheet file changed for the heading-level fix. Viz 13 types / 78 render scopes / 23 patterns,
with **every viz registry and the certified matrix byte-identical to the base** — there was no chart
work this sprint.

**The advertised diff** from `a5d1ba084`: 22 commits, 12,020 changed paths (the great majority m06's 310-cell sweep receipts), **18 advertised-surface paths** attributed to their commits (`closeout/advertised-diff.json`).

## Test accounting

**There is no five-suite capture receipt for Sprint 203.** The canonical runner ran at `9f22e3a56`
with a clean tree and the four setup builds green, and was **stopped by Derek at 12:39 on 2026-09-16
after 87 minutes**. Three suites finished; root-core was 45 minutes in when it was killed and
component-packages never started, so the runner never wrote `four-suite-baseline.json`.

| Suite | Status | Passed | Failed | Skipped | Failed files | Wall |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| viz-core | passed | 1,546 | 0 | 0 | 0 | 64s |
| viz-render | passed | 72 | 0 | 0 | 0 | 38s |
| mcp-server | passed | 7,247 | 0 | 16 | 0 | 2,249s |
| **Three of five** | **passed** | **8,865** | **0** | **16** | **0** | |
| root-core | **killed at 45 min** | — | — | — | — | — |
| component-packages | **never started** | — | — | — | — | — |

**8,865 is not comparable to Sprint 202's 17,849** — that was a five-suite total, and root-core alone
contributed 7,565 passed to it. No five-suite number may be quoted for this sprint.

The m06 changes themselves were each verified individually at this head: the tool-truth readers, the
readiness spec (23 tests), the chart-gate spec (14 tests, the new escape case proven by mutation), the
golden ledger `check`, `docs:check` and `s193-tool-truth --check`. What is missing is the receipt, not
the evidence for the changes.

**The reviewing session owes this sprint** either root-core and component-packages alone against
`9f22e3a56`, assembling the five counts from the five raw Vitest JSONs, or the serialization fix first
and one clean capture. Until then Sprint 203 has three green suites at its head and no receipt.

**Why it was stopped** is recorded as CMOS learning **#655** (evergreen) and carried to Sprint 204 m01:
mcp-server is 2,249s over 412 files with one file at 336s for a single test; the slowest 12 files are
55% of the suite; everything is serialized for a policy (`#1833`) that constrains root-core alone; no
cheap sprint-scoped tripwire runs before the expensive suites; and the host is uncontrolled — this run
hit load average 24.6 on 8 cores, which is why root-core ran 2.4x its Sprint 202 time.

## Golden ledger and sealed receipts

`artifacts/product-reality/sprint-203/golden-ledger.json` holds **138 entries** across three files:
134 runtime-cell entries from m06's re-sweep, `packages/mcp-adapter/tool-descriptions.json` and
`configs/agent/policy.json`.

- No chart golden, chrome snapshot, recipe registry or contracts fixture moved.
- The **four** must-not-move files are byte-identical to the base `a5d1ba084`: the viz pattern
  registry, the viz recipes, the certified matrix and the Sprint 196 package-shape baseline.
- The move rule is **one move per mission, chained**, corrected in m05: `tool-descriptions.json` moved
  legitimately in both m01 and m05.
- The sealed Sprint 195–202 receipts are byte-identical across the branch.

## Carries for the next sprint's m01

- **The five-suite capture, which this sprint does not have.** Either root-core and
  component-packages alone against `9f22e3a56`, or the serialization fix first and one clean run.
- **The capture's cost.** CMOS learning **#655** with the measured numbers; the remedy is four items,
  led by un-serialising the suites that policy `#1833` does not constrain.
- **`Decision/card` is not certified usable.** A CMOS decision has no title, so the card shows a raw
  date, a badge and nothing about the decision. This is the one screen born this sprint that m04 could
  not certify.
- **Three defects measured in m04 and deliberately left**, each because the fix disturbs a screen an
  earlier sprint certified: the empty `Card` body under every card header (all 23 objects — it is the
  placeholder that slot `componentOverrides` and slot swaps target); the raw stored date in slot-bound
  text (formatting pulls `@oods/component-contracts` into artifacts that declare no such dependency);
  and the `Allowed transitions: None recorded` row on every `Stateful` detail (the fix reshapes
  Subscription's already-certified tabs).
- **`traits/visual/Statusable.trait.yaml`** authors `Badge` with a `statusField` directive the
  canonical `Badge` contract refuses. No object composes it, so it sits unexercised — a latent
  refusal waiting for the first object that does.
- **The Claude Desktop and Cursor renders are Derek's runs.** `sprint-202/m05/hosts/` still holds only
  its README, unmodified. A reference-host or archive pass is not a host pass. This is the second
  sprint the carry has stood.
- **Delivery and the roadmap closure.** Delivering this head to the served bridge (fast-forward,
  install, build, PM2 restart, `/health`) belongs to the reviewing session, as does the near.md
  closure paragraph.

## Not done, by rule

No npm publish, no tag, no release, no consumer notices, no primary-checkout build or PM2 restart, and
no edits to the Claude Desktop or Cursor configuration files.
