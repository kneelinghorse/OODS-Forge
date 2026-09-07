# Near Roadmap

**Status:** ACTIVE — program decision `#1652`; Sprint 186 certified by `#1785`; Sprint 187 locked by `#1787`–`#1789` and ready for build

**Updated:** 2026-09-06 — planning session `PS-2026-09-06-007`

**Scope:** The next three independently reviewed increments

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

## Current measured state — certified Sprint 186; fresh-composition probe at `87a7933b`

| Claim area | Current evidence | Near-horizon obligation |
|---|---|---|
| Component catalog | 109 obligation IDs; 50 governed components in one root union; the former eight ported families also resolve through compatibility aliases | Add fourteen families; review alias retirement; retain all 109 obligations under #1788 and review the eleven disputed classifications |
| React and Vue | Sprint 186 added 23 families; ten live consumer cells pass 80/80 applicable gates; packed root/alias imports work in both frameworks | Accessibility, theme and interaction baseline cells for the 23 added families remain `unverified`; generation evidence does not promote those surfaces |
| Fresh composition | All 11 objects returned by `object.list` × six public contexts were executed: 27/66 schemas generate in both frameworks, 58/132 individual cells pass | Fourteen missing components block 30 schemas; three binding-contract issue groups block nine more; see the locked Sprint 187 plan below |
| Saved designs | Successor store: 16/16 and 32 green framework cells; original historical store: 15/16. Fresh User/form equals the saved version-2 successor | Preserve historical negative evidence; adoption into another store is explicit delivery work, not a retroactive repair of the original corpus |
| Delivery and discovery | PR #83 merged; its 15 executed CI checks succeeded and echarts-render-soak was skipped. PM2 serves the primary checkout; `/health` is ready. Component metadata still dates to 2026-03-06; legacy catalog `status` describes HTML mapping | Verify served build identity and schema adoption; refresh discovery from current sources and make status meaning clear (#1371) |
| Visualization | Program baseline: 13 admitted types, five complete the folded certified path. That population was not remeasured in this planning pass | Current public-render closure is still owed; remeasure before locking a chart increment, then expand breadth |

Counts describe the named surface only. HTML evidence is not React or Vue evidence, a source emitter
is not a runtime package, an admitted chart name is not rendered output, and a preview frame is not a
chart.

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

## Increment 6 — Sprint 187: Fresh Composition Coverage — LOCKED, READY FOR BUILD

**LOCKED** by decisions `#1787`–`#1789`, planning session `PS-2026-09-06-007`.
The [decision memo](../../planning/forge-s187-fresh-composition-decision-memo.md) is the build authority.
Six serial CMOS missions exist: `s187-m01` is Current; `s187-m02`–`s187-m06` are Queued. Build has not started.
The [planning census](../../planning/forge-s187-planning-probe/fresh-composition-census.json) executed
all 66 default object/context combinations at the reviewed code: no component overrides, pruned
schemas, or rewritten saved inputs. It measures generation only, not consumer runtime or usability.

Locked outcome: make the existing object composer produce supported React and Vue output for
all 11 advertised objects and six public contexts. The target is 66/66 fresh schemas and
132/132 generation cells, plus 14 named fresh paths in both frameworks (28 packed-consumer cells).
The cohort covers all fourteen added families and the three measured binding issue groups.
Readiness failures can mask further contract defects; the 14 ports alone are not a promise of closure.

| Locked work | Measured reason |
|---|---|
| Naming/classification: LabelCell, InlineLabel, FormLabelGroup, ClassificationBadge, ClassificationEditor | Shared blockers across Article, Media, Product, Organization and Relationship |
| Ownership/summary: OwnerBadge, OwnershipSummary, OwnershipMeta, TagSummary | Unblocks ownership views and the remaining User card gap |
| Lifecycle/financial: ArchiveSummary, ArchivePill, CancellationForm, CancellationBadge, PriceCardMeta | Blocks fresh Subscription/Transaction detail, form and card, plus Product card |
| Repair composition and binding contracts | StatusTimeline.label breaks four already-governed detail schemas; numeric Select bindings fail four Vue cells; boolean Text binding fails Transaction/timeline |
| Discovery, census and delivery preparation | Refresh metadata and surface-specific status; disposition the eleven disputed census rows while retaining 109; assess aliases and prepare isolated rollout/adoption proof |

All fourteen components have executing HTML renderers. Use the existing port/contract/readiness and
consumer patterns. Keep the one final four-suite capture and bounded independent review. The locked
memo defines binding repair, three port clusters, discovery/delivery preparation, then closeout.
The existing saved-schema consumer runner needs a bounded fresh-input extension in `s187-m01`.

After this increment, the strongest follow-on candidates are the still-partial **complete greenfield
workflow** and **current visualization public-render closure**. Neither is automatically numbered or
locked here. A green 66-schema generation matrix would not prove navigation, edit/cancel, state
transitions, responsive craft, remaining catalog breadth, or chart pixels.

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

Sprint-181 follow-ups `#1315` and `#1318`–`#1322` remain Forge-owned maintenance debt under decision
`#1651`; they are named at every closeout and must close before an integrated public release.

Derek resolved the census choice (#1331) by accepting the recommendation to **retain all 109
obligations** (#1788). The old 98-runtime split is not approved. Its generator assigns `authoring-only`
when a root React export or HTML renderer is absent, although the excluded traits describe runtime
behavior. Missing implementation cannot by itself remove an obligation. Sprint 187 m05 will review
those eleven rows for implementation, explicit alias/merge, actual authoring-only use or deliberate
retirement, with evidence and remaining work stated per row. This adds no eleven-port commitment.
The historical `approvedRuntimeCensus` stays null while that old proposal is unapproved; live discovery
must explain the accepted retain-109 ruling. Surface-cell evidence updates do not move scope (#1726).

The following are parked until their named dependency is met:

- the eight-family root fold is complete; `/ported`, `/readiness-ported` and `/css-ported` alias
  retirement is a Sprint-187 review item (#1382), not another root-fold mission;
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

## Planning handoff

Start the fresh build using [forge-s187-build-handoff.md](../../planning/forge-s187-build-handoff.md).
The prepared worktree is `/Users/systemsystems/.codex/worktrees/s187/OODS-Forge`, branch
`codex/sprint-187-fresh-composition`, based on merged PR #83 (`21c7c319`) plus review and planning
records. Dependencies and build prerequisites pass; the fresh census reproduces 27/66 and 58/132.
Use the primary checkout only as the canonical CMOS projectRoot; its source is on an older branch
with pre-existing changes. Run `s187-m01` through `s187-m06` in dependency order.

Deployment carries #1374/#1379 remain open. PM2's healthy process is not proof of the served source
version; integration, build identity and authenticated successor-store adoption must be verified.
PR #83 CI follow-up #1386 is resolved: coverage and viz-determinism succeeded; the soak skip remains
disclosed. Planning is locked; build records evidence and leaves Sprint 187 Active for separate review.
