# s204-m02 — the Sprint 203 screen defects fixed at the producer, and the receipts that lied corrected

Builder self-certified: **false**. Built on `codex/sprint-204-observation` from `0243e7bd4` (m01
closed). Every defect is fixed at the producer; nothing is edited in generated output.

The Sprint 203 review ruled all four screen defects FIXED (#2180), each with the constraint that
stopped the builder kept rather than overruled, and named three receipt defects beside them. This is
that work. It is also the second mission in a row to find that **a number in a receipt was wrong**,
so the harnesses here are retained in the tree and they measure which arm they are looking at.

## The harness, which is the point of (f)

`scripts/product-reality/s204-m02-screens.ts` — the replacement for the Sprint 203 m04 harness that
appears in no source file and could not be re-run. Every rendered number below comes from it.

It does not trust its own `--label`. It reads the built producer the bridge loads
(`packages/mcp-server/dist`), records which of the m02 changes that build carries, and **refuses to
run** if the build does not match the arm being claimed:

| arm | dist digest | carries the m02 producer |
| --- | --- | --- |
| before | `8733c5169816cfe1` | none of the four probes |
| after | `3f64b022181f1f21` | all four |

`artifacts/product-reality/sprint-204/m02/screen-readout.mjs` gained the same guard. It compares
`dist` against `src`, which is only a before/after while `dist` holds the base build — after the
rebuild this mission needs, it would compare the after arm against itself and report a tidy zero.
It now refuses and says so.

## The four screen defects

Measured across **every object in the registry in every context it declares — 184 composed screens**,
before and after, by `screen-readout.mjs`:

| | before | after |
| --- | ---: | ---: |
| screens drawing an empty bordered box | **44** | **0** |
| screens printing `Allowed transitions: None recorded` | **24** | **0** |
| screens placing a field that says what the record is | 156 | **158** |

**(a) The empty bordered box.** The card template's body placeholder is a `Card` nothing fills. It is
not dropped — dropping it takes the anchor a `componentOverrides` preference and a `design.preview`
slot swap target — it is rendered as a zero-height `Stack`. The element, its `id` and its
`meta.intent` of `slot:<name>` all stay: `#slot-body-4` is `#slot-body-4` in both arms, asserted by
`card-body-anchor.s204.spec.ts`, which also re-derives the set of box-painting components from the
110 canonical contracts so a future component that starts painting a border cannot quietly
reintroduce the defect. Reported as a card problem; it was the same placeholder on 22 card bodies and
73 detail tabs, and both are fixed.

**(b) The raw stored date.** Lowered at generate time as a module-local `formatSlotDate`, emitted into
the artifact rather than imported, so the generated artifact's declared dependency surface does not
move — the constraint the review refused to overrule. `slot-date-lowering.s204.spec.ts` holds the copy
in agreement with `formatDateTime` over a corpus, including absent and invalid values, and pins it to
UTC so the same record reads the same on every host.

**(c) `Allowed transitions: None recorded`.** The status-timeline rule matched its second field on
NAME alone, and `/transition/i` also matches Stateful's `allowed_transitions` — a `string[]` of state
names, an internal field, not a moment in time. It now requires a date-typed field.
`status-timeline-timestamp.s204.spec.ts` holds the cause rather than the string: no status-timeline
node may bind a field the object does not declare as a date.

**(d) `Decision/card`.** Bound its header to `created_at`, because `wireFieldProps` assigns
alphabetically and that sorts first — so the card read `Decision · 2026-09-01T12:00:00.000Z · Active`
and said nothing about the decision. It now binds the record's own prose, marked `headingExcerpt` so
the artifact shows the first line. The rule is stated as a prohibition — a card header must not bind a
field that says nothing about the record — and only a timestamp qualifies today, which is why the
blast radius is Decision and Invoice and not twenty certified screens.

## Long free text, re-measured — defect (f)

The Sprint 203 receipt recorded `charactersRendered: 1` for the 8,418-character decision and asserted
in prose that it "renders in full". Both could not be true. Re-measured at 390 in both frameworks,
with the extreme values written onto the version the host serves:

| screen / field | before | after | in full | clipped | ellipsised | overflow |
| --- | ---: | ---: | --- | ---: | ---: | ---: |
| `Decision/card/decision_text` | 1 / 8402 | **120 / 8402** | no, by design | 0 | 0 | 0 |
| `Decision/detail/decision_text` | 8402 / 8402 | 8402 / 8402 | **yes** | 0 | 0 | 0 |
| `Person/detail/blurb` | 249 / 249 | 249 / 249 | yes | 0 | 0 | 0 |
| `Cluster/detail/lead_title` | 181 / 181 | 181 / 181 | yes | 0 | 0 | 0 |
| `Cluster/detail/lead_url` (unbroken, 131 chars) | 131 / 131 | 131 / 131 | yes | 0 | 0 | 0 |

React and Vue agree on every row. **The Sprint 203 prose was right and its number was wrong**: the
detail does carry the whole decision. The `1` was a prefix probe reported as a character count — in
every row of that receipt `charactersRendered` equals `nodesCarryingIt`, which is the tell.

Two things this harness had to get right to avoid reporting the same kind of false number:

- **Whitespace is normalised on both sides before comparing.** The value holds `\n\n` paragraph
  breaks and `innerText` reports the box's own line breaks, so a raw comparison stops at the first
  paragraph and reports **345 of 8,402** for a value that is entirely present. That truncation exists
  only in the measurement.
- **Presence needs a floor.** A one-character opening matches by coincidence on a screen that does not
  carry the value at all, so presence means the first 40 characters. Without it `Decision/card` would
  have reported `valuePresent: true` in the before arm, where the field is simply absent.

`Decision/card`'s 120 is the excerpt limit, and `Decision/detail` still reads 8402 in the same arm —
the cut is scoped to the heading, which is what (d) asked for.

## The rendered matrix, both arms

Every screen this mission changes, in React and Vue at 390, 820 and 1440; and the re-certification set
at the full Sprint 199 bar — three widths across light, dark and high contrast in brands A and B,
36 cells per screen, high contrast measured under `forced-colors: active`.

| | screens | cells/arm | axe | console | page errors | overflow | clipped | below 9px |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| touched, before | 46 | 276 | 0 | 0 | 0 | 0 | 0 | 0 |
| touched, after | 46 | 276 | 0 | 0 | 0 | 0 | 0 | 0 |
| certify, before | 21 | 756 | 0 | 0 | 0 | 0 | 0 | 0 |
| certify, after | 21 | 756 | 0 | 0 | 0 | 0 | 0 | 0 |

**2,064 measured cells, 2,064 screenshots, zero failures in either arm.**

### What the matrix does NOT cover, stated rather than rounded off

This mission changes **68** composed screens. The matrix covers **46**. `design.preview` accepts
seven contexts — detail, list, form, timeline, card, inline, workflow — and **`dashboard` is not among
them**, so the 22 dashboard screens cannot be opened in a browser through that tool at all. They are
named in `matrix-touched.json` under `notPreviewable` and they are covered at the schema level by the
readout above, where they account for 22 of the 44 empty boxes removed.

That is a real gap against this mission's success criterion, and closing it means widening a tool's
context contract, which a craft pass does not do on its way past. It is carried to the review.

The first run of this harness is why the gap is stated at all: it composed as fast as it could, 51 of
68 screens came back refused on the bridge's ten-a-minute cap for `design.preview`, and it still wrote
a receipt reading **"0 axe violations"** over the 17 that got through. The harness now paces, retries a
rate limit as a wait rather than an answer, separates a contract limit from a failure, and **exits
non-zero** if any screen fails to render.

## Certification

`Decision/card` was the one screen Sprint 203 could not certify, for a measured reason: it showed a
raw stored date and a supersession badge and nothing about the decision. It now carries a first-line
excerpt of `decision_text`, draws no empty box, and is clean across all 36 of its width/scope cells in
both frameworks. **The sprint's new screens are 35 of 35.**

`Invoice/card` gained the same way without being asked to — it bound `created_at` and now binds
`invoice_number`.

Subscription and Person are re-certified here because this mission's fixes reshape them, and both are
clean across the whole matrix. The reasons are not what the mission expected, and both corrections
matter:

- **Subscription/detail's composed tree is byte-identical across the two arms**, verified node by
  node. The mission expected the (c) fix to reshape its tabs; what actually moved is the composer's
  recorded slot-candidate metadata — `tab-3` selected `StatusBadge` from `['StatusBadge', 'Badge',
  'ColorizedBadge']` and now selects `Stack` from `['Stack', 'Text', 'Card']`. No `StatusBadge`
  element is lost because none was ever placed; `payment_status` is carried by `PaymentTimeline` on
  `tab-1` in both arms. The re-pairing to `updated_at` that the mission described is real, and it is
  on **Subscription/dashboard**.
- **Person/detail and Person/workflow are genuinely re-derived**, and this was not predicted. The
  whole tab container changes identity — `Tabs#detail-tabs-9` becomes
  `Tabs#screen-detail-13-record-tabs`, and every read-field anchor under it moves with it. Person was
  certified in Sprint 203, so it is re-certified here.

## Pins that moved, with their reasons

Six, in the suites rather than in a receipt. Five trace to the (c) fix and one to (g):

| pin | what moved | why |
| --- | --- | --- |
| `tool-truth.s193` | the tool capability ledger | a new spec imports `health.ts`, and its documented-limit caveat moved from line 150 to 166. Regenerated at the recorded census head; re-binding the head is m06's job. |
| `billing-placement.s188` | `Article/detail`'s status group | reads `updated_at` where it read `allowed_transitions`. The consequence is recorded rather than hidden: `allowed_transitions` is no longer placed by anything, so that detail binds 17 fields where it bound 18. |
| `design.compose.s202` (m01) | the status tab anchor | re-anchored on the invariant — offered candidates are a subset of ranked ones and everything offered generates — instead of on a slot that no longer ranks the Badge family. |
| `design.compose.s202` (m04) | the OODS-V204 arm | see below. |
| `tests/traits/Statusable.test.ts` | the list extension's component | `Badge` to `StatusBadge`, the (g) fix. |
| `forge-claims.contract.s196` | **a public tutorial claim** | `docs/how-forge-works.html` says the Product detail is a **52-node tree** where it said 55. |

### The public claim that moved, because it is the defect stated in the tutorial's own words

Product composes Stateful, so the example screen the published tutorial walks a reader through was
carrying an `Allowed transitions: None recorded` row of its own — a labelled `Stack` holding a label
`Text` and a value `Text`. Those are the three nodes. Product's slot roster is still 10 and its field
count still 38; what changed is that a row saying nothing is gone from the example. The pin exists
precisely so a change here cannot happen quietly, and it did not.

### An ordering trap, hit twice in two missions

The tool capability ledger records **README references**, so writing this README invalidates it. m01
hit the same thing and its tripwire caught it in 54.8 seconds. The ledger is regenerated **after** a
mission's receipts are written, never before.

The golden ledger for this sprint is created (`s204-golden-ledger.ts`, base `8ef91bd13`, 4 must-not-move
and 9 may-move-once pins, sealed through sprint-203) and verifies with **zero entries**: no pinned
artifact moved in m01 or m02. m01 never created one, which is why m02 does.

## Tests

| suite | files | tests | note |
| --- | --- | --- | --- |
| `@oods/mcp-server` | 417 passed, 1 skipped | **7,281 passed, 0 failed**, 16 skipped | the 16 skipped are the Stage1 e2e fixtures m03 owns |
| root `core` | 681 passed, 1 skipped | **7,667 passed, 0 failed**, 16 skipped | 1 unhandled `Timeout calling "onTaskUpdate"` |

That unhandled error is vitest's worker RPC under parallel scheduling, not a failing assertion — the
known root-core hazard (policy #1833). It is reported rather than rounded off: the first root run of
this mission read `4 files / 7 tests failed`, and an isolated rerun read `2 files / 5 tests`. **The
five were real and are fixed above; the extra two were the scheduler.** A count taken from a contended
run is not a result.

New specs, all green: `card-body-anchor.s204` (4), `slot-date-lowering.s204` (7),
`status-timeline-timestamp.s204` (3), `health-live-counts.s204` (4),
`statusable-badge-contract.s204` (8).

## Carried to the review

1. **The 22 dashboard screens have no browser receipt**, because `design.preview` does not accept that
   context. Widening the contract is not a craft pass's call.
2. **`design.compose.s202`'s OODS-V204 arm no longer reproduces.** That test existed to prove
   recording never aborts on a field order some candidate cannot carry, and its guard required the
   scenario to actually occur. After (c) it does not occur on that screen at all: `status` is now held
   by the status-timeline group, so no candidate swap changes which region carries a body field.
   Measured across every field `detail-body-10` carries — `updated_at`, `created_at`, `last_event`,
   `last_event_at`, `plan_code`, `customer_name`, `subscription_id` — against every ranked candidate of
   every slot: **zero refusals**. The invariant is still enforced and the vacuity guard is now the swap
   count. Whether to re-anchor the arm on another object or retire it is the review's call, not a
   quiet edit.
3. **`Statusable.trait.yaml` authors a second refused component.** (g) asked for the `Badge` on the
   list context, which now authors `StatusBadge` as `lifecycle/Supersedable` already did. Sweeping the
   whole trait found `detail` authors a `Banner` refused on the **same three props** —
   `statusField`, `domainField`, `showIcon` — with the same code. It is not fixed the same way because
   it cannot be: `Banner` has no sibling that takes field directives and its contract carries none, so
   closing it means widening a canonical contract. Typed in
   `statusable-badge-contract.s204.spec.ts`, pinned to exactly those three props so the exception
   cannot quietly grow. **No object composes Statusable**, so neither refusal has ever fired on a real
   screen.
4. **`allowed_transitions` is no longer displayed anywhere.** Removing the row was the ask; nothing
   else places that field, so it is now absent rather than relocated.

## Files

| path | what |
| --- | --- |
| `screen-readout.mjs` / `.json` | all 184 screens, both arms, four metrics |
| `before/` `after/` `matrix-touched.json` | 46 screens × 2 frameworks × 3 widths |
| `before/` `after/` `matrix-certify.json` | 21 screens × 36 width/scope cells |
| `before/` `after/` `long-text.json` | the (f) re-measure, with its fixtures |
| `before/` `after/` `shots/` `long-text/` | 2,064 + 40 screenshots |
