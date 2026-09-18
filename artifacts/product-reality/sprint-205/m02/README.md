# s205-m02 — Stage1's objects born from real runs, with their screens

Builder self-certified: **false**. Built on `codex/sprint-205-stage1-objects` from `06796a3f7` (m01 closed).
Every value these objects show was read from a Stage1 run on disk; **nothing was written into Stage1**, and
Forge gained no code path to it (the run is read by these receipt scripts from its path; the product reads
it through `structuredData.fetch` in m04).

## The fit read comes first — [`fit-read.json`](fit-read.json)

[`fit-read.mjs`](fit-read.mjs) reads run `6e435ce7` (designsystem.digital.gov, 2026-09-17, 40 pages) and
gives **every field path** of the four sources a run view reads a disposition — the object and field it
becomes, derived, or not modelled with the reason. It fails its own output if any path is left without one
(it caught one of mine: a page whose `violations[]` is empty).

| Source | born | derived | not modelled |
| --- | ---: | ---: | ---: |
| `manifest.json` | 9 | 10 | 43 |
| `artifacts/a11y_report.json` (2.2.0) | 9 | 7 | 13 |
| `artifacts/report-index.json` (1.0.0) | 6 | — | 7 |
| `evidence/a11y/<page>.json` | 12 | 2 | 9 |

What the read found that shapes the design, rather than confirming it:

- **The finding grain is a rule failing on a page**, from the page evidence — not `violations_detail`,
  which rolls the same rule up across pages and would show one finding twice. 6 findings on 4 of 40 pages.
- **Non-verdicts exist only as counts.** Each page records `incomplete` (needs review), `passes` and
  `inapplicable` as numbers — 28 / 2,029 / 1,531 on this run — never as items. So every Finding born here is
  a violation, and a needs-review finding cannot exist until Stage1 emits the items. m03 reads this.
- **Every artifact is attested, and every attestation holds**: 27 in the index, 27 hashes in the manifest,
  27 matching the bytes on disk.
- **Four things carry no `schema_version`**: `entity_catalog`, `style_fingerprint`, `stylesheet_rules` —
  and **the run manifest itself**. The lock admits the manifest in m04 "at its pinned version"; it has none,
  so m04 must pin it by shape or record that Stage1 needs to stamp it.
- `auth.type` is shown **as recorded**. Sprint 204 measured `none` on an authenticated capture; that is
  Stage1's to correct, and a screen never infers otherwise.
- Absolute paths on the capturing machine (`outputs.*`) and Stage1's own `environment.stage` are not
  modelled: a screen must not show a builder's home directory.

## The candidates Stage1 named

| Candidate | Outcome | Why |
| --- | --- | --- |
| Run | **born** | The run list and detail: one capture, from the manifest, the a11y rollup and the index. |
| Finding | **born** | The finding list and detail: one rule failing on one page, from the page evidence. |
| Evidence | **born as `CapturedArtifact`** | In its records, Stage1's evidence is a file the run wrote under the manifest's attestation. |
| Artifact | not born | The same records as the above; one object, not two. |
| Surface | not born | No screen this sprint shows a page on its own; each finding names its route, URL and evidence file. |
| Subject | not born | Every run read has exactly one target: two fields on Run. Born when a screen compares runs of one subject. |
| Comparison | not born | No two-run screen this sprint; Forge's comparison with its own composition is Sprint 204's observation record. |

## The Evidence naming decision

**Registry fact:** `object-loader.ts` indexes objects by `object.name`, and on a second file with the same
name it keeps the first and **silently drops the second** (`if (name && !index.has(name))`). The URN is
`urn:oods:object:<Name>@<version>`. `Evidence` already resolves to TraceLab's `research.data` object. So a
second `Evidence` would not coexist — it would quietly lose.

**Decision:** Stage1's object takes its own name from what its records are — bytes under a sha256
attestation with a kind, a path, a size and a written-at — **`CapturedArtifact`**. URN formation is
unchanged. `Attestation` was the other honest candidate; it names the digest rather than the thing, and the
screens list files. **The alternative not taken** — domain-qualified URNs
(`urn:oods:object:capture.Evidence@0.1.0`) — would change how every object is addressed, across the
composition store, the context panel's keys and the observation records, for one collision; it is worth
taking when collisions recur, not for the first one. Shared semantics between the two Evidences, if any,
belong in a trait (m03), never a base object. `capture.spec.ts` holds TraceLab's `Evidence` where it was.

## What landed

`objects/capture/` — **Run**, **Finding**, **CapturedArtifact**, all `0.1.0`, `alpha`, domain
`capture.*`, tags `capture` and `stage1`. [`author-objects.mjs`](author-objects.mjs) writes them: the
fields are authored by hand, and every field's `examples` are copied from the fit read's real records, one
real record per index, so the composer's sample record N is a real record N. Run's six records are every
app-mode run on disk with an a11y report at 2.2.0 (two of USWDS, four of TraceLab production); Finding's are
the run's six findings; CapturedArtifact's are six of the 27 attested artifacts.

They carry only fields the run writes plus the list behaviors (search, filter, paging) — no
`content/Labelled` (its generic `label` is what heads most cards in m01's residue) and no `Timestampable`
(its `created_at` would put generated dates on a capture).

## Three producer defects the real records surfaced, fixed at the producer

1. **Records named by their uuid.** The collection, detail and workflow producers name a record from a fixed
   list (`plan_name`, `name`, `title`, `display_name`, `label`) and otherwise fall back to the identifier, so
   Run's rows and heading read `6e435ce7-…`. New `compose/record-label.ts`: the one field the author marked
   `text.label`, consulted only where the producers fell back to the id; the card heading uses it when a
   header `Text` binds something else. **Measured blast radius: none** — the runtime census regenerates all
   310 existing cells and finds **310/310 equal**.
2. **An empty table inside every list row.** An items slot no trait fills is placed as a bare `Table`, and
   the row kept it: "No rows available." under every run. The row filter now drops a table with no columns
   and no rows. Census still **310/310**.
3. **A workflow could not be previewed at all.** m01 made `design.compose` record a workflow as itself;
   `design.preview` then opened the real workflow app for the first time, and the host could not compile it:
   the app's own `src/app.css` import (bundled with no output file) and, in Vue, the SFC compiler resolving a
   component's types from `./store` without a file system. Both are answered from the artifact's own files
   (the CSS applied the way a Vue SFC's styles already are). `workflow-record.s205.spec.ts` holds both
   frameworks.

## The screens, certified — [`screens/matrix-certify.json`](screens/matrix-certify.json)

The screen harness (`scripts/product-reality/s204-m02-screens.ts`, the producer guard reading the built
dist) at React and Vue, 390/820/1440, light/dark/high-contrast in brands A and B:

- **list, detail and card of all three objects: 9 screens, 324 cells — 0 axe violations, 0 console errors,
  0 page errors, 0 horizontal overflow, 0 clipped text, 0 below the font floor.**
- **workflow of all three** ([`screens-workflow/`](screens-workflow/matrix-certify.json)): 3 screens,
  108 cells, 0 console errors; **36 `color-contrast` violations, one node per high-contrast cell**. The same
  node fails on Subscription's workflow, so it is not these objects: it is the first time any workflow was
  actually previewed (before m01 a "workflow" preview showed its list). Carried, not fixed here.

All 21 composition contexts (3 objects × 7) compose, validate and generate in both frameworks
(`test/objects/capture.spec.ts`).

**The positive craft bar** ([`craft-says.json`](craft-says.json)): the three lists name every row and the
three details carry their primary text in full. The three **cards** name the record and state no fact
beside it yet — a card's facts arrive through a trait's view extension, and m03's provenance trait (the
engine and time on a Finding, the attestation on an artifact) is that trait. Pinned in the ratchet: 27 = the
24 m01 residue + these 3. The mission's required screens — run and finding lists and details — pass.

Noted, not changed: the 10-row sample cycles the 6 real runs (two appear twice); a captured Finding is
offered Delete and Edit by the default detail actions. Both are carried as craft findings.

## Census and pins

Objects **23 → 26**; definitions 24 → 27 (`docs:claims` regenerated `README.md` and
`docs/how-forge-works.html`; `forge-claims.contract` moved with its reason). The archive E2E's literal moved
23 → 26 in this mission, and the tripwire's `e2e-expectations-check` holds it. **The runtime registry is not
swept here**: the new objects add cells, m03 adds a trait that changes their screens, and a sweep now would
move every added pin twice; it runs once at m06 (Sprint 203's rule). No may-move-once pin moved in m02
(ledger `check` green). The Stage1 repository shows the same 6 uncommitted files it had before this mission
read anything, at the same commit `d2bd7106`.
