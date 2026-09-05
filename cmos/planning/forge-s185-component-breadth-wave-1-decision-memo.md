# Forge Sprint 185 — Component Breadth Wave 1

**Status:** LOCKED — planning session `PS-2026-09-05-005`, 2026-09-05, decision `#1724`.
**Program authority:** [Product Reality Program](../foundational-docs/roadmap/product-reality-program.md) — the
"Component breadth waves" row, numbered here as Increment 4.
**Predecessor:** Sprint 184, reviewed by `PS-2026-09-05-004` and closed by Derek 2026-09-05. Sprint 183 was reviewed
(determination DO NOT CLOSE, `#1689`), its two blockers were discharged in `s184-m07`, and it was closed on
2026-09-05 during this planning session.
**Build base:** `1118f436345e160437abfedbe73a19f190a92562` — the tip of `codex/sprint-184-greenfield-workflow`,
linear over `ab0d712d` and `8ce34907`, remote in sync. The build session enters an exclusive worktree from this
commit and never touches the primary checkout.
**Per-mission detail lives in CMOS** (`s185-m01` … `s185-m05`). This memo carries direction, the measured
starting point, the settled decisions, the exit gate and the descope ladder.

## 1. What this sprint is

Derek set the direction on 2026-09-05 in two decisions. The Sprint 182 promotion freeze is void (`#1722`): it was
self-imposed, no consumer depends on it, and it pushed Sprint 184 into shipping eight components on a side
subpath. The binding constraint on the program is component breadth (`#1723`): 22 governed components against a
109-row baseline, and only 5 of 16 saved schemas reachable.

Sprint 185 therefore does one thing: it adds the five components that unblock the most saved schemas —
**DetailHeader, CardHeader, ColorSwatch, ColorizedBadge, VizAreaPreview** — straight into
`NUCLEUS_COMPONENT_IDS` as real React and Vue components, and proves them by running the six pre-existing saved
schemas they block through live generation and the eight packed-consumer gates in both frameworks. Reachable
saved schemas move from 5/16 to 11/16.

## 2. Measured starting point

Measured at `1118f436` by executing the real `code.generate` handler at `profile=build` against the vendored
corpus, and by a census over all 16 vendored records. Facts, not estimates.

| Surface | Measured now |
|---|---|
| Reachability | 16 saved schemas; 5 fully reachable; 22 governed components (14 nucleus + 8 ported) |
| Blocker frequency | DetailHeader blocks **6** schemas; every other missing component blocks exactly 1 |
| Target cells | All 12 (6 schemas × react/vue) fail with **only** `OODS-N015`, naming exactly the five ids (1/1/1/1/2/3 per schema, identical on both frameworks) |
| Hidden contract defects | **None.** With the five components' nodes pruned, all 12 cells return `status=ok` with an artifact. Unlike Sprint 184, nothing waits behind the component gap |
| Control | `cmos-activity-redesign` generates green unpruned on both targets today |
| HTML side | All five have executing renderers in `packages/mcp-server/src/render/component-map.ts` (DetailHeader :640, CardHeader :623, ColorSwatch :1377, ColorizedBadge :516 over the badge primitive, VizAreaPreview :1449 over the viz-preview helper). Baseline rows: `recipe`, react/vue `unavailable` |
| React / Vue side | No implementation of any of the five exists anywhere in the tree |
| Freeze machinery still live | `ported-freeze.s184.spec.ts` asserts the nucleus is 14 and runs `--check-promotion`; `independent-review-approval.s183.spec.ts` runs the s182 generator against the live tree; roughly twelve more test and script sites hardcode 14 or 28. A build that adds one id to the nucleus goes red on literals today |
| Interaction surface of the six | Tabs in two schemas; fields and buttons in two; PaginationBar in one; **`the-academy-landing-v1` has no interactive element at all** |

Schema ages (createdAt): cmos-messages-redesign 2026-03-13, cmos-dashboard-redesign 2026-03-13, plan-form-dark
2026-03-15, user-card-showcase 2026-03-16, the-academy-landing-v1 2026-03-26, pt-shop-parts-entry-router-v1
2026-08-12. Every one predates the nucleus (2026-09-03). The schemas are never edited; where a schema and a
contract disagree, the contract moves (`#1693`).

## 3. Settled decisions

- **`#1724`** — scope and base as above; five missions; no critic workflow. The slate was grounded by direct
  execution, and the one open risk (exactly which live gates pin the 14) is enumerated by m01's own red control.
- **`#1725`** — the freeze is retired from the **live** gates, not from history. Every Sprint 182/183/184 promotion
  artifact, both closeout generators and the frozen consumer scripts stay tracked as byte-pinned history and are
  never executed against the live tree again. Every live assertion about the nucleus derives its expectation
  from `NUCLEUS_COMPONENT_IDS` (inside packed consumers, from the packed contracts tarball), never from a literal
  14, 28 or a hand-written id list. Discriminating test: after m01, adding an id with no implementation fails
  only for the right reasons — TypeScript totality and `OODS-N015` — and for no frozen-literal reason.
- **`#1726`** — a surface-cell edit in the capability baseline is an evidence update, not movement of the 109-row
  denominator (answers `#1356`). The s184 overlay is folded into the baseline and deleted. Row count and every
  classification stay put; census approval (`#1331`) stays Derek's and untouched.
- **`#1727`** — VizAreaPreview ships as a sized preview **frame** with a default slot, mirroring what the HTML
  renderer already does. Its contract says in words that it renders no chart pixels and is not visualization
  evidence. A real area chart would drag the viz engine into both component packages; parked.
- **`#1728`** — CardHeader is introduced; Card's "no header family" note is amended. Contract versions move on
  shape, not prose, so Card stays 1.0.0 and the five new contracts start at 1.0.0. Props come from measurement:
  what the schemas put on the nodes plus what the HTML renderers consume.
- **`#1729`** — the eight ported components stay on `/ported` this sprint. Folding them into the root export is a
  second import-path move for consumers with zero new capability; parked with a trigger and named in the
  reconnect.
- **`#1730`** — interaction-evidence is `not-applicable` (named reason, excluded from the pass count) when a
  schema declares no interactive element. The-academy-landing-v1 is the first live case. Headlines read
  "N of M applicable", M stated per cell.

## 4. Missions

| Id | Mission | Requires |
|---|---|---|
| m01 | Retire the voided freeze from the live gates; derive the nucleus count. Red control first | — |
| m02 | Contracts, shared scenarios, prop-value contracts and token-driven styles for the five; nucleus 14→19 | m01 |
| m03 | React and Vue implementations as root exports, readiness rows with resolving evidence, packed proof, per-component cross-framework bites | m02 |
| m04 | Live exit gate: the six schemas × two frameworks through live `code.generate` and the consumer gates; B2 detail template re-measured | m03 |
| m05 | Capability-baseline surfaces + overlay fold, one sprint-wide advertised-surface diff, combined reconnect (s184's owed + s185's), s184 review carries, closeout without self-certification | m04 |

## 5. Exit gate

Six pre-existing saved schemas, generated **live** by `code.generate` at `profile=build`, install from packed
tarballs, typecheck strictly, build, server-render, mount, hydrate and resolve shared CSS in clean isolated React
and Vue consumers, and pass an interaction wherever the schema declares one. Twelve cells. Every applicable gate
green; not-applicable gates named and excluded; every gate proven discriminating by at least one bite, hydration
included. The four Sprint 184 cells still pass through the same generalized harness.

## 6. Descope ladder

Declared at lock. Every rung keeps DetailHeader and keeps the exit gate live.

1. **Drop VizAreaPreview.** It unblocks one schema (cmos-dashboard-redesign) and its semantics are a frame.
   Reachability 11/16 → 10/16.
2. **Drop ColorSwatch and ColorizedBadge.** They unblock one schema together (the-academy-landing-v1).
   With rung 1, 9/16.
3. **Reduce m03's bite matrix** from five components × two targets to DetailHeader and CardHeader × two, the rest
   declared unproven by name.
4. **Reduce m05's overlay fold** to a recorded disclosure; the five new components' baseline surface cells are
   still updated.

**Never cut:** m01 in full — without it the build reds on frozen literals and the next person "fixes" it by
rewriting history. DetailHeader — six schemas. The live gate on whatever schemas remain. The reconnect — two
sprints of advertised movement are owed.

## 7. Out of scope

Folding the eight ported components into the root export. Any visualization work, including making
VizAreaPreview a chart. Movement of the 109-row denominator or approval of the runtime census. The five remaining
unreachable schemas (17 distinct components across the user-* showcases and test-tagged-schema). Design-surface
adapters, publication, hosting. Maintenance `#1315` and `#1318`–`#1322` stay carried and named, unabsorbed.

## 8. Planning honesty

Grounded by execution: the generator probe (full and pruned, 12 + 12 + 2 control cells) and the reachability
census, with their captured output, are vendored at
[forge-s185-planning-probe/](forge-s185-planning-probe/) (`generation-probe.mjs`, `reachability-census.mjs`,
`output.md`, measured at `1118f436`); m04 copies them into the sprint's evidence tree and replays them at the base
commit as the red control. No grounding or critic workflow was run,
by design (`#1724`; the s184 planning learning was to match ceremony to the ask). Not measured: the exact set of
live literal pins (m01's red control enumerates it — the grep inventory in `#1725` is the expectation), the
effort to generalize the harness's interaction selection, and DetailHeader's heading-level behaviour when nested
under a Card that also carries a CardHeader. If a mission cannot be executed as chartered, amend this memo and
record it; do not route around it silently.

**Consumer feedback folded at planning close.** cmos-dashboard reported four defects on 2026-09-03. One is
Forge's and bounded: `code.generate` silently ignores `options.styling` on the html path, so m05 turns
`framework=html` + `styling=tailwind` into a named warning at draft and a typed error at build/release, corrects
the input-schema text, and names the movement in the reconnect. Two are Stage1's and were forwarded to that
project. One, the components structured-data export last generated 2026-03-06, is carried by name. Detail and
dispositions live in the `s185-m05` mission notes.

## 9. Derek's

None. Sprint 183 was closed during this planning session once its blockers were confirmed discharged. The
runtime-census approval (`#1331`) stays open and does not gate this sprint.

## 10. Build handoff

The fresh build session reads `agents.md`, runs `cmos_review()`, reads this memo, creates an exclusive worktree
from `1118f436` on a new branch, and begins `s185-m01`. It builds only from this memo and the CMOS missions, records
evidence, and stops. A separate review session decides genuine close and, when it certifies, closes the sprint itself.
