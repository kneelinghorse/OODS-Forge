# s205-m03 — the result-state and provenance traits, on Finding's real screens

Builder self-certified: **false**. Built on `codex/sprint-205-stage1-objects` from `e9914a2ae` (m02 closed).

Two traits, both in `traits/core/` in the shape `lifecycle/Supersedable` set — what each records, why it is
its own trait, and what an absent value means — with parameter schemas in `schemas/traits/` and generated
types through `generate:schema-types`. Traits 47 → 49.

## `core/Assessable` — result state

**Field:** `result_state`, never `status`, so an object can carry Stateful and a result without collision.

**The state set, grounded.** Axe returns four answers per rule per page — violations, passes, incomplete,
inapplicable — and Deque warns implementations drop incomplete. Lighthouse's score display modes carry the same
shape (binary, manual, notApplicable, error). Stage1's run 6e435ce7 holds all four axe answers, but only
violations as items; needs-review, passing and not-applicable are page counts (28 / 2,029 / 1,531, from the m02
fit read). Adopted: `violation`, `passed`, `needs_review`, `not_applicable`, `not_measured` (the check did not
run — Lighthouse `error`, a Stage1 pass that did not finish). **Not adopted:** low-confidence (no Stage1 record
carries a confidence), Lighthouse's `informative` (no verdict, no Stage1 record), any numeric score (a score is a
verdict colour in another form). The parameter `recordedStates` says which states a source writes as items;
Finding declares `[violation]`, which is the honest reading of this run — **every real finding on the screens is
a violation**, and a needs-review finding cannot be shown until Stage1 emits the incomplete items. That is a
measured limit, recorded, not worked around.

**The visual rule, enforced and proven.**
- `@oods/component-contracts` exports `RESULT_STATES`, `RESULT_STATE_TONE` and `SEVERITY_TONES`.
- The composer's `enforceResultStateFamily` (in `compose/result-state.ts`, run on every composition) pins every
  StatusBadge or Badge bound to a result state to `RESULT_STATE_TONE` — overriding any tone an author or
  override put there — because an explicit tone wins over the lifecycle status-to-tone table that would colour
  "passed" green. Any other tone-bearing component bound to a result state is refused, **`OODS-V211`**, nothing
  written (registered; the m01 sweep proves every thrown code is).
- `result-state-family.s205.spec.ts` reads the preview runtime's own stylesheet in Chromium for **all six
  scopes** (A/B × light/dark/hc), paints each tone's surface, text and border to pixels, and fails if the result
  family equals any severity tone's; in light and dark it also fails on any shared surface or text colour; and
  it requires the chip's text contrast ≥ 4.5:1. 8/8.

**The tone was chosen on measurement, and the first choice was refused.** `accent` looked like the obvious
distinct family. Painted per scope, its status tokens are defined for **light only**: dark and high contrast
render the light-theme purple chip. `neutral` is theme-aware in all six scopes, shares no surface or text colour
with a severity tone in light or dark, and in high contrast — where success, warning and critical all resolve to
the same Canvas/CanvasText pair and differ only by word — is distinguished by its own border. **Carried finding:**
the `accent` status tokens are not themed for dark and hc.

## `core/Provenanced` — how a value was obtained

Factored from the two shapes Forge already carries, never a third:

| field | observation row (s204) | context item (s203) |
| --- | --- | --- |
| `provenance_source` | Stage1 (implicit) | `source` |
| `provenance_record` | `runId` | `id` |
| `provenance_locator` | `readPath` | `query` |
| `provenance_method` | `artifactKind` | (the search) |
| `provenance_at` | `capturedAt` | `fetchedAt` |

`provenance_method` is what separates provenance from a citation — "axe-core 4.11.0", "sha256 attested by the
run manifest", and the case the mission names, `route_derived` vs `openapi_declared`: two values with different
methods are never shown as the same kind of fact. Labels read as meaning, not as field names: Source, Record,
Read from, Obtained by, Obtained (`label-generator.ts`).

**Adoption by the existing rows: not now, and why.** Observation rows and context items are stored on
composition versions; Sprint 204 m05 guaranteed a version without an observation renders byte-identical to
before, and each shape has its own refusals (`OODS-V206`/`V207` for context, `V208`–`V210` for observation). Re-keying them changes stored
records and their refusals for no screen that needs it this sprint. They adopt this shape when observation widens
to field level — the point where `provenance_method` starts distinguishing values on the same screen — which is
the slice 3 widening, planned after Stage1 emits fields. Recorded as the adoption plan, not a carry.

## On Finding's real screens, and on Run's and CapturedArtifact's

Finding adopts both traits: its `run_id`, `evidence_ref`, `engine` and `observed_at` became `provenance_record`,
`provenance_locator`, `provenance_method` and `provenance_at` (same real values; the m02 author script derives
them). Run and CapturedArtifact adopt Provenanced — a screen needs it there too: their cards had no fact beside
the name, and "obtained by sha256 attested by the run manifest · obtained Sep 17" is that fact.

Certified with the screen harness (the producer guard reading the built dist) —
[`screens/matrix-certify.json`](screens/matrix-certify.json): list, detail and card of all three objects, React
and Vue, 390/820/1440, light/dark/high contrast in brands A and B — **9 screens, 324 cells, 0 axe violations,
0 console errors, 0 page errors, 0 overflow, 0 clipped text, 0 below the font floor.** The rows show the neutral
"Violation" chip and when the finding was obtained; the detail leads with the chip and the provenance block.

**The positive craft bar** ([`craft-says.json`](craft-says.json)): all nine screens of the three objects pass,
cards included. The ratchet is back to the 24 m01 residue.

**Census:** the runtime generation census regenerates all 310 existing cells after every producer change here
and finds **310/310 equal**: nothing certified before this sprint moved.

## Attestable and Confidence-bearing: not authored

Attestable: the m02 fit read shows an attestation on exactly one object (CapturedArtifact's `sha256`, attested
by the manifest, 27 of 27 holding). One field on one object, and its method is already carried by Provenanced.
It becomes a trait when a second object attests. Confidence-bearing: no Stage1 record read carries a confidence
for anything a screen shows. No trait lands without a screen that needs it.

## Pins

Traits 47 → 49: the archive E2E literal (the tripwire's `e2e-expectations-check` caught the move the same hour)
and `forge-claims.contract` moved with the reason; `docs:claims` regenerated. No may-move-once pin moved.
