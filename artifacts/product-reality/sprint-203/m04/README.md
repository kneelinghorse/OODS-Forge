# s203-m04 — The new screens certified usable

Builder self-certified: **false**. Built on `codex/sprint-203-objects-and-context` from `1b1375fe1`
(m03 closed). Every defect fixed here is fixed at the producer; nothing is edited in generated output.

## The matrix

`before/matrix.json` and `after/matrix.json`, from the same harness: the five objects born this sprint
in **every context each declares**, in React and Vue, at **390, 820 and 1440**, in **light, dark and
high contrast**, in **brands A and B** — 35 screens × 2 frameworks × 18 width/scope cells = **1,260
measured cells** per phase, with screenshots at all three widths in `before/shots` and `after/shots`.

| | before | after |
| --- | --- | --- |
| axe violations | `button-name` on 9 screens | **none** |
| console errors | 0 | 0 |
| horizontal overflow | 0 | 0 |
| clipped text | 0 | 0 |
| font below the 9px floor | 0 | 0 |

### High contrast has to be measured under forced colours, and the first run was wrong

The before run reported `color-contrast` (serious) on **24 screens** in `hc`, both brands, both
frameworks. That was the harness, not the product. `hc` declares the scope for an environment where
the operating system supplies the colours, and Sprints 195 and 199 proved it under forced-colors
emulation for exactly that reason. Measured the same way:

| screen | hc without forced colours | hc under `forced-colors: active` |
| --- | --- | --- |
| `Decision/detail` (born this sprint) | `color-contrast` × 16 | clean |
| `Subscription/detail` | `color-contrast` × 3 | clean |
| `Organization/detail` (certified usable in Sprint 199) | `color-contrast` × 19 | clean |

An already-certified screen reporting 19 nodes under one method and none under the other is the proof
that the method was wrong. The harness now opens a second page with `forcedColors: 'active'` for the
`hc` scopes, and the after matrix measures all six scopes that way.

## Long free text, at the real extreme values

`long-text-fixtures.json` holds the actual values, not invented ones: the **longest of the 1,933 CMOS
decisions at 8,418 characters** (longest single word 48), a Hive blurb, a long Hive article title, and
an unbroken 110-character URL as the worst case. Each is written onto the version the host serves and
opened at **390** in both frameworks (`after/long-text.json`, 20 screenshots).

Every detail carries its extreme value **in full**: present, **0 clipped nodes, 0 ellipsised nodes, 0px
horizontal overflow**, in React and Vue. The 8,418-character decision reads on a phone-width detail
without truncation that hides meaning.

## Fixed at the producer

| Defect | Cause | What moved |
| --- | --- | --- |
| `button-name` — a focusable control with no accessible name at all | A template declares a slot by putting a placeholder in the tree; where nothing fills it the placeholder survives. Harmless as a `Stack` (an empty div), not as the card footer's `Button`. | `dropUnfilledInteractiveSlots`: an unfilled placeholder that is an interactive control is removed. An empty control is worse than no control, and naming it would put a button on the page that does nothing. Found by m01 on Article, Media, Invoice and Usage; **reproduced by m03 on Person, which is what identified the card template rather than those objects**. |
| `landmark-unique` — sibling regions with the same accessible name | `PaymentEventTimeline` hardcoded `aria-label="Payment event"` on every instance. | The name comes from the event it shows; "Last payment" and "Next payment" are what tell them apart. React and Vue; the HTML renderer already derived it. |
| The record title printed twice in a header | Every object composing `content/Labelled` seeds `description` from its own title, so a header showing both printed the same words twice. | `DetailHeader` and `CardHeader` drop supporting copy that only repeats the heading, in **all three renderers**. |
| The record name printed twice in a list row | The row places a title cell and, separately, `LabelCell` bound to `label` — the display projection of that same title. | The composer no longer places the projection beside the field it projects; where `label` **is** the title (an object with no name or title of its own, such as Organization or Cluster) the projection is the one that stays. **8 of 133 screens → 0.** |
| The same text twice inside one `LabelCell` | `LabelCell` renders a label and a description, and both seed to the record title. | A description that only repeats the label is not rendered, in all three renderers. |

The last three are one defect in three places, and **all three reach objects certified in earlier
sprints** — Organization, Evidence, Collection, Mission, Document, Project, User and Product all
printed their own name twice, in a row or a header. The craft passes did not catch it because the
assertions check that a field is present, never that it is not the same words twice.

## Found, measured, and deliberately not fixed

Each of these is real. Each was attempted, and each was reverted because the fix disturbs something a
previous sprint certified or pinned — which is the review's call to make, not this mission's.

| Finding | Where | Why it is not fixed here |
| --- | --- | --- |
| An empty bordered box under every card header | The card template's `body` slot placeholder is a `Card` that nothing fills, for **all 23 objects** | That placeholder is the slot a `componentOverrides` preference and a `design.preview` slot swap target. Dropping it breaks both and the fragment-anchor contract (`schema-ref.workflow`, `design.compose.s202`, `fragment-anchor-contract`). |
| A date rendered as its raw stored value | A `Text` bound to a date through a slot — the `Decision` card reads `2026-09-01T12:00:00.000Z` where its detail reads `Sep 1, 2026, 12:00 PM` | The formatter is gated on the `read-only-field` intent while the boolean and array branches beside it are not. Removing that gate pulls `@oods/component-contracts` into generated artifacts that currently declare no such dependency, which changes the artifact's declared dependency surface (`emitter-directives.s184`, `ported-workflow.s184`). A craft pass should not widen a package's dependencies. |
| `Allowed transitions: None recorded` on every `Stateful` detail | The status-timeline pattern rule looks for a timestamp and matches `allowed_transitions` via `/transition/i` — a list of state names, and an internal field | Requiring a real date removes the row, and also re-pairs Subscription's group with `updated_at`, reshaping an already-certified detail's tabs (`billing-placement.s188`, `design.compose.s202`). |

Two more, observed and not this sprint's objects: a `Collection` list row prints a raw
`00000000-0000-4000-8000-000000000001`, and a `Subscription` card prints `FALSE FALSE` from
`CancellationBadge` and `ArchivePill` rendering boolean props.

## Certified usable

Measured per object and context (`certification.json`, and the rendered readout in `after/readout.json`).

| Object | card | detail | form | inline | list | timeline | workflow |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Decision | **no** | yes | yes | yes | yes | yes | yes |
| Sprint | yes | yes | yes | yes | yes | yes | yes |
| Session | yes | yes | yes | yes | yes | yes | yes |
| Person | yes | yes | yes | yes | yes | yes | yes |
| Cluster | yes | yes | yes | yes | yes | yes | yes |

**34 of 35 certified usable.** Every one of the 35 is clean on the whole matrix — zero axe violations,
zero console errors, zero layout failures across 1,260 width/scope cells — and every "yes" above also
carries the empty card-body box on its card, typed above.

`Decision/card` is **not certified usable**, for a measured reason rather than a stylistic one. It
renders `Decision · 2026-09-01T12:00:00.000Z · Active`: a raw stored date and a supersession badge,
and **nothing that says what the decision was**. A CMOS decision has no title — m02 established that
from the store, where the only content is `decision_text` — so the card's header slot falls back to the
first available field, and the 8,418-character decision the object exists to carry is not on the card
at all. Giving it a title would invent one; showing an excerpt is a composer change with the same
dependency consequence as the date formatting above. It is typed here for the review.

`Decision/list` is certified: it identifies rows by `decision-001` with a formatted date and status,
which reads as a list of decisions, though it too says nothing about their content. The list formats
its date and the card does not, from the same value — which is the clearest single demonstration of the
formatter gap recorded above.

## Tests

`@oods/mcp-server` **410 files / 7,203 passed**, `@oods/components-react` 639, `@oods/components-vue`
625, `@oods/component-contracts` 159. One pin moved with a producer fix and is updated with its reason:
`schema-ref.workflow` counted 9 nodes / 6 components on a bare list composed with no object, and now
counts 7 / 4, because that list has no filters or sort to offer and no longer emits two empty, nameless
form controls.
