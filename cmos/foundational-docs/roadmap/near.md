# Near Roadmap

**Status:** ACTIVE — program decision `#1652`; Sprint-185 lock decision `#1724`

**Updated:** 2026-09-05

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
ordered by how many pre-existing saved schemas each wave makes reachable.

The current program does not ratify MCP Apps, Figma, Penpot, or a custom canvas; surface selection
follows runnable product foundations.

## Current measured state — at `5aa53b3a`, the Sprint 185 review head (branch `codex/sprint-185-component-breadth-wave-1`)

| Claim area | Current evidence | Near-horizon obligation |
|---|---|---|
| Component catalog | 109 unique IDs; 27 governed (19 nucleus at the root + 8 ported on `/ported` subpaths); 11 of 16 saved schemas fully reachable | Wave 2 takes the remaining five, per schema |
| React | Installable package exports the 19-family nucleus at the root and 8 ported families on a subpath; live generation of eight saved schemas passes 124 of 124 applicable consumer gates | Accessibility, theme and interaction surface cells for the five new families are still `unverified` |
| Vue | Same surface, same gates, no React/Radix/RJSF runtime dependency | Same bar as React |
| Generation | Versioned file-set artifact, exact dependencies, typed actions with an owned-state forwarding guard, `draft`/`build`/`release` profiles, a `loading`/`empty`/`error`/`success` state axis, `OODS-N018` for html+tailwind | Sprint 184's owed movers and Sprint 185's were sent together (`fb620639`, `a22747cf`); the served bridge still runs the pre-185 checkout |
| Saved designs | All 16 records vendored; the 11 reachable ones generate green in both frameworks; the remaining 5 are each blocked by their own single-use components (about twenty in total) | Wave 2 picks the schema with the smallest missing set first |
| Visualization | 13 admitted types; five complete the folded certified path | Unchanged; parked behind component breadth |

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

Planning measured the starting point by executing the real emitter. All twelve target cells fail today
with only `OODS-N015` on exactly those five ids, and with those nodes pruned all twelve generate green.
Unlike Sprint 184, no contract defects hide behind the component gap — this is a pure port plus the
retirement of the voided freeze from the live gates, which still pin the nucleus at 14 and would red
any addition. VizAreaPreview ships honestly as a sized preview frame, not a chart (`#1727`).

**Built and independently reviewed 2026-09-06; CERTIFIED and CLOSED** (review session
`PS-2026-09-06-002`, determination in
[forge-s185-review-determination.md](../../planning/forge-s185-review-determination.md)). The exit
gate held from live generation: 124 of 124 applicable gates over 16 framework cells, four interaction
rows not applicable and excluded; reachability 11/16; every live nucleus pin derived. The "pure port"
inference did not survive the build — three contract defects were found and repaired in-sprint
(`#1734`, `#1736`, `#1738`). Four-suite closeout at `f8d15098` was green with zero failures.

## Increment 5 — Component Breadth Wave 2

Numbered next. The reachability census at `5aa53b3a` shows the remaining five unreachable schemas
(the four `user-*` showcases and `test-tagged-schema`) are blocked by about twenty missing components,
each used by exactly one schema — address, membership, preference, tag, role, message and
classification families. Wave 2 is therefore planned per schema: pick the schema(s) with the smallest
full missing set and take every component that schema needs together, with the Wave 1 shape
(contract-first, root export, live cell gate, one four-suite capture at close, two unions kept per
`#1729`).

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

Derek's open call, untouched by any sprint: approve or revise the 98-row proposed runtime census so
`approvedRuntimeCensus` stops being null and the 109 denominator can move (`#1331`). Surface-cell
edits in the capability baseline are evidence updates and do not move that denominator (`#1726`).

The following are parked until their named dependency is met:

- folding the eight ported components into the root export — the next sprint that already moves the
  root export surface for another reason (`#1729`);
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

## Build handoff

Sprint 185 is closed. The next session plans Wave 2 from the reachability census at `5aa53b3a`,
confirms the sprint's purpose with Derek in one sentence before any workflow spend, and locks a memo.
The build that follows runs in its own worktree, records evidence and stops; a separate review session
decides genuine close. When the Sprint 185 branch is integrated into the checkout pm2 serves, rebuild
`packages/mcp-bridge`, restart `oods-forge-bridge`, confirm `/health`, and tell aquex-mcp and
forge-demos the build is live.
