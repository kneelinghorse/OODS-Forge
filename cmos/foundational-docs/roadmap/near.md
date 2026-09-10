# Near Roadmap

**Status:** ACTIVE — program decision `#1652`; Sprint 186 certified by `#1785`; Sprint 187 independently certified and closed by `#1809`; carries preserved by `#1810`; Sprint 188 independently certified and closed by `#1831`; craft carries preserved by `#1832`; capture policy `#1833`; Sprint 189 independently certified and closed by `#1844`; residual craft carries `#1845`; Sprint 190 independently certified and closed by `#1859`; residual visualization carries `#1860`; Sprint 191 independently certified and closed by `#1880`; residual carries `#1881`; Sprint 192 (Increment 11) BUILT, REVIEW PENDING (`#1882`, `#1884`)

**Updated:** 2026-09-10 — Sprint 192 build session `PS-2026-09-10-012`; current catalog/maturity rows derive from the m06 ledger; Increment 11 built for independent review, Increments 12–14 retained

**Sprint 188:** CERTIFIED AND CLOSED. Build base `cd8ee986`; Mission 1 delivered that merged head and the authentic User-form successor. Missions 2–5 built the generated React/Vue Subscription workflow and eight declared billing/archive recipes. Mission 6 froze the final proof and handed off. Review `PS-2026-09-08-011` (decision `#1831`) inspected all 36 frozen-head screenshots in both frameworks: the workflow runs end to end with all four states and criterion 8 is opened; usable is not certified, and the ranked craft carries are preserved by `#1832`. See [Increment 7](#increment-7--sprint-188-ship-then-make-the-subscription-app-whole--certified-and-closed).

**Sprint 189:** CERTIFIED AND CLOSED. Build base `f4cd1ba3`; Mission 1 delivered that merged head to the live bridge and sent the Sprint 188 reconnect. Missions 2–5 built the browser design loop (`scripts/design-loop`, public `design.preview`) and used it to retire all seven `#1832` carries at the producer. Mission 6 froze the final proof and handed off. Review `PS-2026-09-09-002` (decision `#1844`) inspected the 24 frozen-head receipts and 72 screenshots in both frameworks: every `#1832` item is resolved by exact receipt lines and criterion 8 is certified for the Subscription app; the residual craft list is `#1845`. See [Increment 8](#increment-8--sprint-189-browser-design-loop--certified-and-closed).

**Sprint 190:** CERTIFIED AND CLOSED. Build base `c3a68d5f`; Mission 1 delivered the merged Sprint 189 head `f19a654c` to the live bridge and sent the Sprint 189 reconnect. Missions 2–5 put the shared renderer on the public surface: `viz.render` returns SVG for all 13 types, dashboard HTML draws 11/11 admitted types, theme and brand resolve from the token scopes, `artifact.certify` grades the requested scope, VizAreaPreview renders a real chart on Subscription/detail, and one measured registry equals its public-handler census. Mission 6 froze the final proof and handed off. Review `PS-2026-09-10-001` (decision `#1859`) re-ran the registry contract test and the independent auditor at the frozen head and inspected the 52-cell matrix, contrast rows and browser receipts; the residual visualization carries are `#1860`. See [Increment 9](#increment-9--sprint-190-visualization-public-render--certified-and-closed).

**Sprint 191:** CERTIFIED AND CLOSED. Build base `d3a99d39`; no delivery mission, because the bridge already served that head. Mission 1 put a measured dark categorical palette into the A/B token scopes, repaired light slot 04, added the registry `contrastPassed` cell and gave `code.generate` theme/brand options so the generated app takes its theme. Mission 2 closed OODS-N016 generically so the Organization and User workflows generate (77/77, 154/154) with six packed cells green. Mission 3 retired the seven `#1845`/chart craft items and `#1274` at the producer with BEFORE/AFTER receipts. Mission 4 closed maintenance `#1318`–`#1322` on receipts and rebuilt the `#1315` bundle clean. Mission 5 froze the final proof and handed off. Review `PS-2026-09-10-008` (decision `#1880`) recomputed all 24 palette cells from the built CSS, re-ran the independent auditor and the contract specs at the head and inspected the dark and AFTER screenshots in both frameworks; the residual carries are `#1881`. See [Increment 10](#increment-10--sprint-191-carry-forward-pay-down--certified-and-closed).

**PR integration:** PR #84's initial CI run failed three jobs after the frozen local proof. [CI follow-up](../../planning/forge-s187-ci-followup.md), session `PS-2026-09-07-003` / decision #1811, records the correction; remote acceptance is determined by the checks on the corrected PR head. PR #84 and PR #85 subsequently merged into `OODS-pro` at `cd8ee986`. Sprint 188 merged through PR #86 (`33a20d0e`) and PR #87 (`ed0d5750`); remote CI on the frozen head `7fc3c9e0` passed all three workflows before the review.

**Scope:** The next three independently reviewed increments — Increment 11 (Sprint 192, locked), Increment 12 (Sprint 193) and Increment 13 (Sprint 194); see [Program position](#program-position-and-the-next-three-increments)

**Program authority:** [Forge Product Reality Program](product-reality-program.md)

## Direction

OODS Foundry and Forge must function as one usable design system and agent toolchain Derek can use to
build real work. Greenfield output is a first-class requirement. Mapping into an existing company
system remains valuable, but it cannot substitute for Forge-owned components, runtime artifacts, or
working generation.

Two direction decisions from 2026-09-05 govern this queue. The Sprint 182 promotion freeze is void
(`#1722`): it was self-imposed, nothing outside our own scripts depends on it, and it is never cited
as a constraint again — new components go straight into the nucleus. The binding constraint on the
program is component breadth (`#1723`), so the increments after Runnable Generation are breadth waves
ordered by how many pre-existing saved schemas each wave makes reachable. Sprint 186 reached the
disclosed successor corpus's 16/16 boundary. The next locked breadth metric is fresh composition
through the existing public object/context inputs; saved-corpus success does not establish that coverage.

The current program does not ratify MCP Apps, Figma, Penpot, or a custom canvas; surface selection
follows runnable product foundations.

## Current measured state — Sprint 192 m06 ledger, 2026-09-10; independent review pending

| Claim area | Current evidence | Remaining obligation |
|---|---|---|
| Component catalog | 109 obligations retained under #1788; React and Vue implement **75/109**, HTML maps **109/109**, versioned contracts **75/109**, generated-consumer evidence **61/109**. The `2026-09-10` catalog export equals the generated capability ledger | 34 implementations pending (25 `Viz*` control rows and 9 others); proposed classification is 24 native / 84 recipe / 1 alias. All 109 await Derek’s approval; `approvedRuntimeCensus` remains null |
| Component maturity | Accessibility and theme **75 verified / 34 unavailable**; interaction **24 verified / 51 not-applicable (static) / 34 unavailable**, with reasons. Six scopes × 75 roots × two frameworks = **900 measured cells**. Four component packages run in CI and the fifth capture suite. The token resolver reports zero unresolved colour roles and zero reachable system-colour fallbacks outside forced-colors; all six formerly unguarded names are defined | Independent review pending. Baseline #1884 retains 191 referenced / 45 token-defined / 57 locally declared / 89 unresolved, 7 missing system names, and 61 names reaching a system-colour fallback through actual per-scope resolution; the former 26 was a syntactic estimate |
| React and Vue | m05 proves 28 packed cells: 14 workflow cells across seven objects (including Subscription/Organization/User 6/6), 10 canonical timeline cells and four real-trait fixture cells; 214 passed gates and 10 explicit static N/A, zero failed/skipped. Historical Sprint 187 breadth remains separately retained | Sprint 193 must exercise the full 154-cell population at one head; no union of historical and current receipts is presented as that proof. Invoice and Plan still have no packed runtime cell |
| Fresh composition | **77/77 schemas and 154/154 build generation cells**, including 66/66 single-screen schemas and 132/132 cells; zero OODS-V007 or N0 warnings in m05 final census | Generation counts do not assert runtime maturity; Invoice and Plan display-only header bindings were repaired at the producer |
| Saved designs | The served store carries the adopted User-form successor (version 2, byte-identical to the Sprint 187 successor), so the live store is 16/16-capable; the retained original store's 15/16 is a historical negative | None on the served store; the original store is retained, not relabeled |
| Delivery and discovery | The bridge serves reviewed `5fdf8a18`; m01 retained exact store hashes and six delivery/re-pin messages | Sprint 192 reconnect will be prepared unsent at m07; delivery of this build follows independent review |
| Visualization | 13/13 public SVG in light/dark × A/B; 11/11 admitted types drawn; contrastPassed light/dark for 9 categorical types, [] for 4 exempt; 5 certified / 8 uncertified; area placed on Subscription/detail | Sprint 191 certified and closed by `#1880`; the 8 ECharts types are uncertified by architecture (no compile leg); the 21 patterns all sit on the 5 certified types and no taxonomy or Core Analytics Profile artifact exists; HC pixels deferred (#1851); the Role-A caution and residue are carried by `#1881` (Sprint 194) |
| Release proof | Portable runtime: 12 packages, deterministic, SBOM 245, double-assembled in CI; `docs/api` (28 files) generated with `--check` | The bridge is not in the bundle; only Subscription is a harness-driven reference app; `docs/components` (33 files) and the Tool-Specs counts are hand-written; mutation bites cover consumer gates only (Increment 14) |

The Sprint 187 evidence below is retained as this table's historical baseline.

The exact runtime and saved-store hashes are in
[the m06 evidence packet](../../../artifacts/product-reality/sprint-187/m06/README.md).
Final four-suite counts, skipped tests and file-attributed deltas belong to its retained capture and
claim ledger. The baseline comparator is s186 execution `740e8405`, never a relabeled run. The initial clean `2a7bb93e` capture failed22 server and17 root assertions; its raw evidence remains retained. Corrected bundled discovery schema and contract expectations are verified at the new implementation. The corrected capture and output audit record the final build gates and were verified during independent review.

Independent review re-derived all seven criteria byte-for-byte and reran the separate output audit:
30 executions and 900 frozen paths pass. Rebuilt fresh and saved censuses reproduce the table above.
Raw suite counts are 1390 / 64 / 5866 / 6146 passed, zero failed, with the identical 16 existing skips
in the overlapping server/root runs. The review inspected retained browser and suite receipts rather
than repeating those full runs. See [the review determination](../../planning/forge-s187-review-determination.md).
CMOS closed Sprint 187 on 2026-09-07; learnings #516–#518 and carry-forward #1389–#1391 retain the
review lessons, delivery work and explicit product limits. Master-context milestone snapshot: 2162.

Counts describe the named surface only. HTML evidence is not React or Vue evidence, a source emitter
is not a runtime package, an admitted chart name is not rendered output, and a preview frame is not a
chart.

## Program position and the next three increments

Measured 2026-09-10 at `70e41570` (public bytes identical to `5fdf8a18`) by four read-only probes and direct measurement; the numbers are in the table above and in [the Sprint 192 memo](../../planning/forge-s192-component-truth-decision-memo.md), section 2.

Program sequence rows done: the direction reset; component foundation (Sprint 182); runnable generation (183); the first greenfield workflow (184, usable certified in 189); component breadth waves 1–2 with fresh composition and the Subscription rows (185–188); current visualization closure (190–191). Open: the breadth waves' own exit gate — every reconciled native/recipe claim resolving truthfully in React and Vue — because 72 of 109 rows resolve and none of them carries measured accessibility, theme or interaction evidence; visualization breadth; the design-surface adapter decision; integrated release proof. Program exit criteria 1–2 (an approved classification and a runtime census derived from memberships) have waited since Sprint 182.

The binding debt is therefore truth about the breadth already built, and the scalable answer is machinery: proof that runs in a gate and a ledger regenerated from it, so that each later wave is born measured.

| Increment | Sprint | Outcome | Exit |
|---|---|---|---|
| 11 — Component truth | 192, BUILT, REVIEW PENDING | Proof in the gate; token-resolution contract; accessibility, interaction and theme measured 75/75 in both frameworks; the three disputed rows; the ledger regenerated and served; the 109-row classification proposal | Every governed root has measured cells from suites that run in CI; `catalog_list` serves them; Derek's approval is the only open step to a non-null runtime census |
| 12 — Runtime at scale and the visualization-controls wave | 193 | The generic single-screen harness over all 132 single-screen cells (one pack per sweep) and the workflow harness over all 11 workflows, so runtime-proven cells become a gated ratio moving from 34 toward 154 with typed gaps; the 9 remaining non-viz rows and the 25 `Viz*` control rows implemented on the Sprint 192 machinery; the design loop gains a mount/interaction/no-console-error tier | Runtime coverage is a gate, not prose; React and Vue implement 109/109 or carry a typed gap per row |
| 13 — Visualization breadth and certification | 194 | A versioned taxonomy and Core Analytics Profile across the eight families; the 21 patterns promoted to recipe identities in the registry; extension gaps typed (financial, scientific); the ECharts certification architecture decision (a compile leg or a declared uncertified profile); the HC palette decision (`#1851`); the Role-A hue revision; viz mutation bites | 100% of the census classified; the core profile surface-complete; no untyped gap |
| 14 — Integrated release proof | 195 | The bridge in the portable bundle; Subscription, Organization and User exercised from the bundle as reference apps; `docs/components` and the Tool-Specs counts generated from the ledger with `--check`; doc and viz mutation bites; the gate-2 decisions | Every published claim is generated from current executable evidence; no false green survives mutation |

The design-surface adapter decision remains Derek's gate and can be taken after Increment 11 without displacing the sequence. Sprint numbers after 192 are assigned only after each preceding increment's independent review.

## Increment 1 — Sprint 182: Product Reality Foundation — CLOSED 2026-09-04

Reviewed by `PS-2026-09-04-004` (decision `#1662`); `foundation-v1` promoted by Derek (decision
`#1663`). The 14-component nucleus is real in React and Vue with clean packed-consumer proof. Its build
authority was
[forge-s182-product-reality-foundation-decision-memo.md](../../planning/forge-s182-product-reality-foundation-decision-memo.md).

## Increment 2 — Sprint 183: Runnable Generation — CLOSED 2026-09-05

Built by `PS-2026-09-04-007` at frozen head `9a4202fe` and independently reviewed by `PS-2026-09-05-001`
(decision `#1689`, determination in
[forge-s183-review-determination.md](../../planning/forge-s183-review-determination.md)). The exit gate
was genuinely met: the six-month-old schema `compose-7d860337` installs, builds, renders, hydrates and
passes interactions in clean React and Vue consumers. Two record defects blocked certification — a
`passed` claim that five archived mutation patches could not support, and an undisclosed loss of HTML
generation for Forge's own detail template absorbed by repointing tests. Both were repaired in
`s184-m07`, and the sprint was closed on 2026-09-05.

## Increment 3 — Sprint 184: First Greenfield Workflow — CLOSED 2026-09-05, PARTIAL BY DESIGN

Built from `ab0d712d` and reviewed by `PS-2026-09-05-004`; closed by Derek the same day. Its build
authority was
[forge-s184-greenfield-workflow-decision-memo.md](../../planning/forge-s184-greenfield-workflow-decision-memo.md).

It ported the eight components the two March-2026 Subscription schemas needed, resolved six
off-contract facts by moving contracts rather than schemas, added the workflow state axis to the
schema language and both emitters, reversed the screen-scope binding rule so generated call sites
exist, replaced the textual stub guard with a forwarding check, and proved the list → detail slice
from live generation in both frameworks.

**Increment 3 is recorded as partial, in those words.** The four workflow states are proven on a
schema the sprint's own script builds; the real Subscription schemas are proven state-neutral. No
single artifact demonstrates the program sentence "the same semantic workflow is usable in both
frameworks with loading, empty, error, and success states." Edit/cancel and timeline have no
pre-existing schema, and authoring one would be the circularity the increment exists to avoid. The
review also found that the sprint's per-mission mover accounting missed five consumer-relevant
advertised movers, including the nucleus Table's zero-row output; that notice is owed and is sent in
Sprint 185.

## Increment 4 — Sprint 185: Component Breadth Wave 1

Numbered because Sprint 184 is independently reviewed and closed. Its build authority is
[forge-s185-component-breadth-wave-1-decision-memo.md](../../planning/forge-s185-component-breadth-wave-1-decision-memo.md),
locked by decision `#1724` at build base `1118f436`.

It adds **DetailHeader, CardHeader, ColorSwatch, ColorizedBadge and VizAreaPreview** to the nucleus as
real React and Vue components and proves them by running the six pre-existing saved schemas they block
through live generation and the consumer gates in both frameworks. Reachable saved schemas go from
5/16 to 11/16.

Planning measured twelve target cells failing with `OODS-N015` on those five IDs and twelve green
pruned controls. It incorrectly inferred a pure port; the build found the hidden defects described
below. The sprint also retired the voided literal nucleus freeze. VizAreaPreview ships honestly as a
sized preview frame, not a chart (`#1727`).

**Built and independently reviewed 2026-09-06; CERTIFIED and CLOSED** (review session
`PS-2026-09-06-002`, determination in
[forge-s185-review-determination.md](../../planning/forge-s185-review-determination.md)). The exit
gate held from live generation: 124 of 124 applicable gates over 16 framework cells, four interaction
rows not applicable and excluded; reachability 11/16; every live nucleus pin derived. The "pure port"
inference did not survive the build — three contract defects were found and repaired in-sprint
(`#1734`, `#1736`, `#1738`). Four-suite closeout at `f8d15098` was green with zero failures.

## Increment 5 — Sprint 186: Component Breadth Wave 2 — CERTIFIED AND CLOSED

Locked 2026-09-06 on Derek's confirmation. Build authority was
[forge-s186-component-breadth-wave-2-decision-memo.md](../../planning/forge-s186-component-breadth-wave-2-decision-memo.md)
at build base `5aa53b3a`. The starting census showed the remaining five unreachable schemas blocked by
exactly 23 components, all with executing HTML renderers. Six missions, one per schema in
smallest-cluster-first order (test-tagged 3, user-detail 4, user-list 5, user-timeline 5, user-form 6)
and a sixth that folded the eight ported families into the root. Existing Sprint 185 tooling was
reused with explicit narrow adaptations (#1780), rather than literal unchanged execution.

Independent review `PS-2026-09-06-006` closed the sprint under decision #1785. Governed components
grew 27 → 50; the five newly reachable schemas passed 80/80 applicable consumer gates in both
frameworks. **The 16/16 result applies to the authentic recomposed successor store.** The original
historical corpus remains 15/16 on five invalid User-form field bindings per framework. Decisions
#1776–#1779 record the scope adjustment; the program's original-input obligation is not silently
removed. See [review determination](../../planning/forge-s186-review-determination.md).

Pace rule from Derek, in force from this sprint on: appreciable progress every sprint, not a little work
and a lot of measuring. No per-mission four-suite captures, no new closeout apparatus, no critic
workflow. The per-component evidence bar from Wave 1 is unchanged.

## Increment 6 — Sprint 187: Fresh Composition Coverage — CERTIFIED AND CLOSED

**LOCKED** by decisions `#1787`–`#1789`, planning session `PS-2026-09-06-007`.
The [decision memo](../../planning/forge-s187-fresh-composition-decision-memo.md) is the build authority.
The fourteen component families, binding repairs, discovery refresh and delivery preparation are
implemented. The serial mission evidence is retained under `artifacts/product-reality/sprint-187/`.
The final census at `a9c02b7d` improves the planning baseline from 27/66 schemas and 58/132 cells to
**66/66 and 132/132**. All 28 selected consumer cells pass their applicable gates (218 pass,
6 explicitly N/A, zero failures/skips). No schemas were pruned or hand-authored as fresh inputs.

| Delivered work | Evidence boundary |
|---|---|
| LabelCell, InlineLabel, FormLabelGroup, ClassificationBadge, ClassificationEditor | Real React/Vue roots, contracts, styles and local native classification controls; no persistence |
| OwnerBadge, OwnershipSummary, OwnershipMeta, TagSummary | Owner/role metadata, zero counts, tags and documented children precedence |
| ArchiveSummary, ArchivePill, CancellationForm, CancellationBadge, PriceCardMeta | False badges, nullable archive timestamp, price model/interval and local cancellation controls; no cancellation workflow |
| Composition and binding repairs | StatusTimeline.label, numeric zero, boolean false, local query updates, optional card actions and nullable datetime; original Product/detail B2 operand measured separately |
| Discovery/census/aliases/delivery | Retain109 explained in live discovery; eleven dispositions recorded; aliases retained because migration is unproven; isolated delivery rehearsal and rollback complete |

The existing s185/s186 proof tools received named, bounded s187 adaptations. No new closeout
framework or per-mission four-suite capture was introduced. The source capability fold is unchanged
from the evidence-backed m04 result:150 surface cells on 50 existing IDs and 600 references, with all 109
identities retained. Final m06 runtime evidence supplements those retained proofs.

After this increment, the strongest follow-on candidates are the still-partial **complete greenfield
workflow** and **current visualization public-render closure**. Neither is automatically numbered or
locked here. The green 66-schema generation matrix does not prove navigation, edit/cancel, state
transitions, responsive craft, remaining catalog breadth, or chart pixels.

## Increment 7 — Sprint 188: Ship, then make the Subscription app whole — CERTIFIED AND CLOSED

The build follows decisions `#1814`/`#1815` and amendments `#1817`, `#1822` and `#1825`. The [decision memo](../../planning/forge-s188-subscription-workflow-decision-memo.md) and amended CMOS criteria control scope. The [M05 packet](../../../artifacts/product-reality/sprint-188/m05/README.md) records the component and application evidence; the [M06 handoff](../../../artifacts/product-reality/sprint-188/m06/accepted-timeout/README.md) records the final implementation, execution and evidence heads. Sprint 188 is **Completed**, independently certified by review `PS-2026-09-08-011` and decision `#1831`. Historical builder receipts retain `builderSelfCertified:false`; they are not relabeled.

**Delivered:** Mission 1 fast-forwarded the primary checkout to merged `cd8ee986`, rebuilt and restarted PM2, repaired served schema loading, and adopted only the authentic User-form successor with hashed backup/rollback. Seventeen HTTP probes and two retained N015 negatives verified the served result. The authorized combined reconnect was sent once to aquex-mcp and forge-demos. The new workflow implementation awaits the next reviewed delivery.

**Built:** public `context:'workflow'` produces a runnable Subscription application in both frameworks: generated navigation, typed local store, ten deterministic records, edit/save/cancel/history, archive views and loading/empty/error/success on list/detail/form/timeline. The M05 proof passes 16 gates, 18 flow checks and 32 state observations with 36 screenshots at 390/820/1440, including payment and archived views. The final M06 proof repeats at its frozen implementation head.

All eight declared rows are implemented: BillingSummaryBadge, BillingAmountInput, BillingIntervalSelector, CycleProgressCard, PaymentTimeline, PaymentEventTimeline, BillingCardMeta and ArchivedRowOverlay. Composition uses three mechanisms keyed on the declared recipe set: resolved parameters, extension-only selection and placement preservation. Generic grouping and unplaced-extension behavior are regression-pinned. M04 and M05 census changes are exactly attributed against their prior heads; the current baseline is 66/66 schemas and 132/132 screen generation cells plus Subscription/workflow's two cells. Current catalog discovery restores the original 14 nucleus rows from independently approved foundation evidence; frozen baseline/intake/reconciliation records remain unchanged. `/health.revision` exposes the build commit and structured-data manifest hash from a build-time stamp.

| Mission | Outcome |
|---|---|
| m01 | Delivery, adoption, reconnect from the primary checkout; no code change |
| m02 | `context:'workflow'`, application emitters in React and Vue, real field labels |
| m03 | The app live in both frameworks: full flow, four states on four screens, screenshots |
| m04 | BillingSummaryBadge, BillingAmountInput, BillingIntervalSelector |
| m05 | CycleProgressCard, PaymentTimeline, PaymentEventTimeline, BillingCardMeta, ArchivedRowOverlay; nucleus catalog truth; `/health` revision |
| m06 | Census 66/66 plus `Subscription/workflow`, one four-suite capture, sprint-wide advertised diff, review handoff |

Exit: the program sentence — *the same semantic workflow is usable in both frameworks with loading, empty,
error, and success states* — met for Subscription, and criterion 8 opened with one application. **"Usable" is
decided by the independent review's responsive/craft inspection, not by the build.** The sprint does not claim
persistence, a backend, URL routing, confirmation or permission primitives, or maturity of the 64 families.
Descope ladder and never-cut list are in the memo. After this increment, the strongest follow-on candidates are
the **browser design loop** (compose, render live, adjust, reconcile) and **current visualization public-render
closure** (#1372); neither is numbered or locked here.

**Review verdict (`PS-2026-09-08-011`, decision `#1831`):** all 36 screenshots at 390/820/1440 in both frameworks
were inspected. The application is operable end to end and the eight declared rows render real values, but the
composed source screens carry template defects — an unwired list header block with a `No items` paginator above
nine records, four empty timeline cards, description-as-label form fields with duplicated controls, an editable
cancellation fieldset and `Archived: false` on the detail screen, raw ISO timestamps — so usable is not certified.
The ranked carries are decision `#1832` and are the target list for the browser design loop candidate. Capture and
timeout handling for Sprint 189 is decision `#1833`.

## Gates that apply to every increment

- Claims come from executable evidence, never catalog prose or research conclusions.
- React and Vue are equal targets; framework-specific behavior stays idiomatic.
- Packed-consumer tests use no workspace alias, repository source import, existing `node_modules`, or
  user registry configuration.
- An unsupported target fails with a typed gap; warning-only fallback is not success.
- Exploratory work may use advisory validation. Production/release artifacts must pass the declared
  enforced profile.
- Every significant failure mode receives a negative test or mutation bite capable of proving the
  gate is discriminating, and a bite for a behavioral promise removes the behavior, not a string.
- A pre-existing test whose input changes during a sprint carries a stated reason in the closeout.
- A claim quantified with "every" is measured against the full tracked population at the review head.
- Advertised-surface movement is computed once, sprint-wide, from the final diff — never assembled
  from per-mission scopes.
- Automated snapshots prove stability, not design quality; an independent review inspects responsive
  craft and interaction states before a greenfield artifact is called usable.
- A build session records evidence and stops. A separate review session decides genuine close, and
  scopes its verification to findings that could flip the determination.
- Public publishing, hosting, and paid external API use require explicit later decisions.

## Parallel obligations and parks

Sprint 191 m04 closes maintenance `#1318`–`#1322`: SR27 requires the full sprint advertised diff,
runtime scans include native adapter JavaScript, OODS-N013 keeps its unavailable-target category with
matching descriptions, historical DTCG and repinned-schema bites are retaken, and the A --final pin
is confirmed. `#1315` remains pending: the reproducible bundle and exact re-pin notices are prepared
for Sprint 192 delivery after review, with zero sends. Evidence: `artifacts/product-reality/sprint-191/m04/README.md`.

Derek resolved the census choice (#1331) by accepting the recommendation to **retain all 109
obligations** (#1788). The old 98-runtime split is not approved. Its generator assigns `authoring-only`
when a root React export or HTML renderer is absent, although the excluded traits describe runtime
behavior. Missing implementation cannot by itself remove an obligation. Sprint 187 m05 reviewed
those eleven rows with trait/caller evidence: nine retain implementation work and two alias/merge
proposals need product decisions. No runtime intent was excluded because code was missing.
The historical `approvedRuntimeCensus` stays null while that old proposal is unapproved; live discovery
must explain the accepted retain-109 ruling. Surface-cell evidence updates do not move scope (#1726).

The following are parked until their named dependency is met:

- the eight-family root fold is complete; `/ported`, `/readiness-ported` and `/css-ported` alias
  retirement was reviewed in Sprint 187 (#1382/#1385); retain aliases while external migration is unproven;
- closure of all current visualization recipes, and making VizAreaPreview a real chart — after
  component breadth, unless independent staffing permits parallel work;
- visualization breadth beyond the current 13 — after the public render and certification path is
  coherent;
- Figma, Penpot, MCP Apps, or another design-surface adapter — after Forge artifacts are runnable and
  the adapter's capabilities, costs, auth, and write semantics can be evaluated honestly;
- public package publication or hosted Forge delivery — after licensing, distribution, and operating
  cost decisions; and
- `schema.ingest` — historically shelved by `#1649`; decision `#1652` retains the shelving result
  while superseding its incorrect surface claim.

## Independent review and remaining delivery

Read [the m06 evidence packet](../../../artifacts/product-reality/sprint-187/m06/README.md) and its
claim-ledger/review-handoff JSON. The build is in
`/Users/systemsystems/.codex/worktrees/s187/OODS-Forge`, branch
`codex/sprint-187-fresh-composition`; actual public implementation `a9c02b7dadeef56690be82e05fe8b02f54beff9f`.
The ledger separately names the actual four-suite execution and frozen evidence/review commits;
public-byte equivalence must hold between implementation and execution. Canonical CMOS remains in
the primary checkout, whose unrelated dirty work was not reset or used as implementation source.

Sprint 187 is **Completed**, independently certified by review `PS-2026-09-07-002` and decision
`#1809`. Historical builder receipts retain `builderSelfCertified:false`; they are not relabeled.
Delivery #1374/#1379/#1384 was completed by Sprint 188 m01 at merged `cd8ee986`, with the authorized
PM2 restart, exact User-form adoption and combined reconnect. That delivery does not deploy Sprint 188's
new workflow. Alias retirement and unverified maturity remain open. Maintenance #1315/#1318–#1322
remains named and unabsorbed before integrated public release. PR83 CI follow-up #1386 was resolved;
its ECharts soak skip remains disclosed.

The historical Sprint 189 delivery draft was sent by Sprint 189 m01 after reviewed `f4cd1ba3` was delivered.
The Sprint 189 review (`#1844`) inspected the AFTER receipts and screenshots: the duplicate source/application
controls, raw timestamps, narrow summary terms, wrapped archive badge and surplus empty cards are gone, and the
Subscription app is certified usable; the residual craft list is `#1845`. Sprint 190 m01 delivered that merged head
(`f19a654c`). The Sprint 190 review (`#1859`) closed the visualization public-render surface. Decision `#1861`
records that merged head `d3a99d39` was already delivered and the reconnect sent to cmos-dashboard,
forge-demos and aquex-mcp before this build; archived dashboard-demos is excluded.
The Sprint 191 review (`#1880`) certified the carry-forward pay-down and closed the sprint; the residual carries
are `#1881`. PR #94 merged into `OODS-pro` at `5fdf8a18`. Sprint 192 m01 delivers that merged head to the bridge,
sends the prepared reconnect to cmos-dashboard, forge-demos and aquex-mcp, and sends the `#1315` re-pin notices to
aquex-mcp, forge-demos and shopify-forge, which closes `#1315`.


## Increment 8 — Sprint 189: Browser design loop — CERTIFIED AND CLOSED

Sprint 189 is **Completed**, independently certified by review `PS-2026-09-09-002` and decision `#1844`. It was built under decisions #1832–#1834. Mission 1 delivered reviewed `f4cd1ba3` from the primary checkout, rebuilt and restarted PM2, verified its build-stamped revision and sent the prepared reconnect to aquex-mcp and forge-demos. All 17 served-store hashes stayed unchanged.

The build worktree now has a persistent exact-tarball React/Vue preview loop with screenshots, accessibility text, layout measurements and source hashes. Composed list and timeline contexts own their collections and controls. Forms use short labels with help, one owner per field and native Save; detail is read-only with cancellation on demand and populated, uniquely labeled tabs. Summary values, timestamps, archived badges and deterministic billing seeds are reconciled. The public `design.preview` tool uses the same loop and reports OODS-N019 when it is stopped. The served primary bridge still has the delivered Sprint 188 implementation; the Sprint 189 preview tool is proven on the worktree bridge.

The final packet retains the 77-schema census with the 66/66 and 132/132 single-screen population plus Subscription/workflow 2/2. The wider generation result remains 75/77 and 150/154, with the existing User/workflow and Organization/workflow gaps disclosed. Saved-corpus results remain separate: original 15/16, successor 16/16. The final four-suite capture follows #1833; exact counts and all failures/skips belong to its raw receipts and file-attributed accounting.

[The Sprint 189 handoff](../../../artifacts/product-reality/sprint-189/m06/README.md) binds the frozen implementation, execution and evidence commits, the BEFORE/AFTER browser receipts and all seven craft dispositions. The Sprint 190 reconnect is prepared and remains unsent. Historical builder receipts retain `builderSelfCertified:false`; they are not relabeled. This build does not certify accessibility, theme maturity or every object/context at runtime.

**Review verdict (`PS-2026-09-09-002`, decision `#1844`):** all 24 receipts and 72 screenshots at 390/820/1440 in both
frameworks were inspected against the seven-item `#1832` mapping. Every Sprint 188 defect is resolved by exact receipt
lines: one bound search, filter, sort and paginator over nine real rows with Active/Archived tabs; a chronological
timeline with formatted timestamps and a formatted billing header; short form labels with help text, one owner per
field, seeded datetime and reason code, one Save; a read-only detail with cancellation on demand, populated unique
tabs, history-bound audit entries and Yes/No summary terms; an unbroken archived badge with `1 record`; identical
StatusTimeline text across HTML, React and Vue; mid-cycle seeds. Zero page or console errors, zero overflow, zero
React/Vue lifecycle text differences. A person can list, search, filter, open, edit, save, cancel and read the
timeline in both frameworks at all three widths, so criterion 8 is certified for the Subscription app. Six residual
craft items found by the screenshot pass (Vue Search label wrap and pagination bullets at 390 px, raw event codes
and a duplicated two-entry history on detail, a wide-badge row wrap at 1440 px, the minor-units help text beside a
major-units amount, the Vue archived badge outside its row card) are ranked in `#1845`; none blocks usability. The
four-suite capture followed `#1833`: the first capture failed on 26 stale schema-shape assertions, one corrective
capture passed with zero failures and zero timeouts. The Package Compatibility CI failure on PR #90 was a
pre-existing workflow gap (the compat runner never built `@oods/component-contracts` before Storybook and had not run
since those imports landed); the review closure commit adds that build step to `scripts/pkg/compat.ts`, mirroring the
a11y-contract job, with public runtime bytes unchanged.

## Increment 9 — Sprint 190: Visualization public render — CERTIFIED AND CLOSED

Sprint 190 is **Completed**, independently certified by review `PS-2026-09-10-001` and decision `#1859`. It was built under decisions #1847–#1858. Historical builder receipts retain `builderSelfCertified:false`; they are not relabeled. The measured [visualization registry](../../../packages/viz-core/src/registry/viz-recipes.v1.json) reports 13/13 public SVG in light/dark × A/B; 5 certified / 8 uncertified; area placed on Subscription/detail. Dashboard HTML draws 11/11 admitted types; chord and flow_map remain excluded under #881. The public-tool census, two-run 52-SVG matrix, component and saved-store census, packed application flows and light/dark browser receipts are retained in the [m06 packet](../../../artifacts/product-reality/sprint-190/m06/README.md). The [handoff](../../../artifacts/product-reality/sprint-190/m06/closeout/review-handoff.json) binds the frozen implementation `502e9bf7`, execution `81fb1a96` and evidence `b5b80d9d` commits; PR #92 merged into `OODS-pro` at `d3a99d39`.

The default uses CSS light/A. The flat token export remains byte-identical; m03 contains the one-time golden migration and every flat-versus-light/A token difference (#1850). HC token scopes remain exported while HC pixels are deferred (#1851). Certification grades the requested scope and retains failures: the existing light categorical palettes on dark canvases can fail contrast. Heatmap and geo exemptions make no categorical canvas-ratio claim. Eight ECharts-primary types retain `conformant:null`.

Subscription/detail includes a static sample-payment SVG above the timeline in HTML, React and Vue; workflow records each receive a seeded SVG. Editing the form does not regenerate the chart. This placement changes only Subscription/detail in the 66-schema population. The wider 77-schema population retains the Organization/User workflow OODS-N016 gaps. Generation coverage does not imply full runtime coverage for every context.

Mission 1 delivered the reviewed Sprint 189 head and its authorized reconnects. Decision `#1861` records later delivery of the merged Sprint 190 head `d3a99d39` and the sent reconnects to cmos-dashboard, forge-demos and aquex-mcp; archived dashboard-demos is excluded. Sprint 191 was certified by `#1880` and merged at `5fdf8a18`; the Sprint 192 reconnect and re-pin notice plans remain prepared-unsent until Sprint 192 m01 sends them.

**Review verdict (`PS-2026-09-10-001`, decision `#1859`):** the registry-equals-census contract test and the Sprint 190
prose tests were re-run at the frozen head (12/12), and the independent closeout auditor was re-run from a fresh
invocation: 37/37 criteria, 13 executions, 296 frozen paths. The retained scope observations hold 52/52
`svgHash == renderHash` identities across 13 types × light/dark × A/B, every one repeated byte-stable; dashboard HTML
draws 11/11 admitted types with chord and flow_map excluded under #881 and answered in the registry notes. The light
React 1440 and dark Vue 390 screenshots show the payment area chart as a named figure above Status Timeline with the
dark scope applied to the chart pixels and no overflow. The corrective four-suite capture is zero failures (viz-core
1397, viz-render 69, mcp-server 6091, root 6265) with the same 16 skip identities as Sprint 189; PR CI, pkg-compat and
Token Governance all succeeded. The program exit gate, 13/13 current recipes rendering visible public output with
truthful cells, is met, so the visualization public-render surface is closed. The truthful residue is ranked in `#1860`
and none of it blocks closure: 14 dark-scope contrast failures (line, scatter, treemap, sunburst, sankey, chord,
force_graph × A/B) because the light categorical palette is drawn on the dark canvas, so certified line and scatter
report `conformant:false` for dark; HC pixels deferred (#1851); the generated app shell stays light under
`theme:'dark'` while chart pixels follow the scope; the constant seeded payments draw the area chart as a flat block
under a duplicated title; eight ECharts-primary types remain uncertified with `conformant:null`.


## Increment 10 — Sprint 191: Carry-forward pay-down — CERTIFIED AND CLOSED

Sprint 191 is **Completed**, independently certified by review `PS-2026-09-10-008` and decision `#1880`. Build base
`d3a99d39`; authority `#1862`; built under decisions #1863–#1879. The
[handoff](../../../artifacts/product-reality/sprint-191/m05/closeout/review-handoff.json) binds the frozen
implementation `be5d2b30`, execution `e8027e64` and review-input `dc0f4789` commits; PR #94 merged into `OODS-pro` at
`5fdf8a18`. Historical builder receipts retain `builderSelfCertified:false` and `separateReviewRequired:true`; they
are not relabeled.

The nine categorical chart types report `contrastPassed: [light, dark]` across brands A/B; the four
exempt types retain `[]`. Role-C canvas contrast passes while Role-A cautions remain visible. HC pixels
are deferred and eight ECharts types remain uncertified. The generated shell carries theme and brand.
Derek accepted exactly three changed light workflow shell files per framework on 2026-09-10; m01's
README attributes the exception and preserves the before/after hashes.

Organization and User join Subscription for **6/6** packed workflow cells. The fresh population is
**77/77 schemas and 154/154 cells**, including **66/66 and 132/132** single-screen generation.
The original saved store remains **15/16**, the authentic successor **16/16**, and all **17** live store
hashes remain unchanged. Generation counts do not assert full runtime coverage for every schema.

Craft repairs cover search and pagination parity, human-readable history, genuine audit ownership,
archive badge containment, billing alignment, amount units and recorded-payment charts. Payment SVGs
represent recorded samples and do not regenerate on form edits. The m01 dark and m03 BEFORE/AFTER
receipts remain historical; m05 re-verifies the current implementation and retains the complete hashes.

Maintenance `#1318`–`#1322` is complete. `#1315` bundle re-pin delivery remains pending. Reconnect
notices for cmos-dashboard, forge-demos and aquex-mcp, plus re-pin notices for aquex-mcp, forge-demos
and shopify-forge, remain **prepared-unsent** for Sprint 192. Final proof includes one four-suite
capture under `#1833`, the 52-cell matrix rendered twice, registry-derived censuses, the reproducible
portable bundle, Git-derived advertised movers and the independent output audit.

**Review verdict (`PS-2026-09-10-008`, decision `#1880`):** the six categorical slots were recomputed from the built
`tokens.css` (oklch → sRGB → WCAG) for A/B × light/dark: 24/24 cells at or above 3:1 (minima 3.00 A/light slot 04,
3.03 B/light slot 04, 3.16 B/dark slot 02), paints identical to the builder's token proof; the retained contrast table
holds 52 scope observations, 36 pass / 16 exempt / 0 fail, and the 52-cell matrix plus four dashboards are byte-stable
across two renders. The independent auditor was re-run from a fresh invocation, 33/33 criteria, 8 executions, 864
frozen paths; the s190/s191 closeout, theme and collections specs (22/22) and the root prose and runtime-boundary
tests (18/18) pass at the head. The census is 77/77 and 154/154 with exactly Organization/workflow and User/workflow
changing status, 34 attributed and 0 unattributed artifact changes; the packed apps pass 6 cells and 48 gates. The
dark Vue 390 detail and dark React 1440 list screenshots show the shell, chrome and chart on the dark/B canvas; the
AFTER Vue 390 list, Vue 1440 detail, Vue 390 archived and Organization React 390 form screenshots show the search
label unwrapped, no pagination bullets, humanized history with one timeline, a four-point payment series under one
title, the archived badge inside its card and a seeded address entry. The corrective four-suite capture is zero
failures (viz-core 1397, viz-render 69, mcp-server 6110, root 6301, the same 16 skip identities) and the merge-head
CI run is green. Maintenance `#1318`–`#1322` close on their receipts, so the carry-forward pay-down is complete and
Sprint 191 is closed. The truthful residue is ranked in `#1881` and none of it blocks closure: HC pixels deferred
(#1851); eight ECharts-primary types uncertified; the Role-A pairwise minimum just under the clean target; two recipe
surfaces (CancellationSummary and the Billing tab panel) unthemed against the canvas; the standalone list context
truncating its Sort select at 390 and carrying no rows; raw lifecycle words on timeline entries and sample payment
amounts unrelated to the record price; Organization and User workflows generated and gate-green but below
Subscription's craft bar.

## Increment 11 — Sprint 192: Component truth — BUILT, REVIEW PENDING

Authority #1882 and baseline correction #1884. Seven serial missions deliver the reviewed Sprint 191
head and its six notices, put the four component packages in CI and a fifth capture suite, measure
accessibility/interaction and six theme scopes, implement AuditSummaryCard, SortIndicator and
TimelineEntryLabel, and regenerate the catalog from evidence. Current coverage is 75 React/Vue
implementations and 109 HTML mappings; the other 34 implementations remain obligations. The
proposal is 24 native / 84 recipe / 1 alias with all 109 classifications awaiting Derek and
`approvedRuntimeCensus:null`. The historical foundation-v1 authority remains separate.

The base diagnostic retains 191 / 45 / 57 / 89, seven missing system names, six unguarded names,
and 61 reachable system-colour names under the real per-scope resolver. The repaired token contract
has zero unresolved colour roles and zero reachable system-colour fallbacks outside forced-colors.
The final packet is [Sprint 192 m07](../../../artifacts/product-reality/sprint-192/m07/README.md).
Fresh generation (77 schemas / 154 cells), packed runtime observations and independent certification
remain distinct claims. Sprint 192 stays Active, `builderSelfCertified:false`; independent review and
Derek's classification decision remain open. Reconnect for Sprint 193 is prepared unsent.
