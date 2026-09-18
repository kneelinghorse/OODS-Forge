# s204-m04: comparing what Stage1 saw on TraceLab with what Forge composes

Builder self-certified: **false**. Built on `codex/sprint-204-observation` from `df7e58491`.

This mission compares Stage1's capture of TraceLab's live frontend against what Forge composes from
the same seven research objects. The result is one typed record, and a person reviews every row. No
row proposes, applies or writes a change.

## What it covered, measured

Run `d0a43821-5730-4bf3-8b40-20f6fcb6b69c` (TraceLab production, authenticated, `--infer`), against
Chunk, Collection, Document, Evidence, Mission, Project and Report.

| | |
| --- | ---: |
| targets | 1 (`https://tracelab.aquex.ai/`) |
| routes Stage1 observed | 25 |
| screens those routes make up | 15 |
| screens Forge composed (7 objects × list, detail, form, timeline, less Chunk's 4 refused) | 24 |
| screens on both sides | 10 |
| **rows** | **45** |
| rows withheld because a side could not say where it came from | 0 |
| wall time of the comparison | 251–282 ms across runs (about 1.2 s for the whole command, including module load) |

| category | rows | what it means |
| --- | ---: | --- |
| observed-only | 5 | `/`, `/graph`, `/admin/observability`, `/admin/spaces`, `/admin/users`: no compared object |
| composed-only | 14 | every timeline except Chunk's; detail and form for Collection, Document and Evidence; form for Project and Report |
| agreeing | 15 | 7 entity, 6 input, 2 data-bound |
| disagreeing | 11 | 3 entity, 4 input, 4 data-bound |

### The disagreements

| axis | screens | what each side says |
| --- | --- | --- |
| entity | `/collections` `/documents` `/evidence` | Stage1 saw these routes but did not name the entity. It names only Mission, Project and Report. Forge holds all three objects. |
| input | `/missions` `/projects` `/collections` `/evidence` | Forge composes a search box and a filter on each list. Stage1 saw no input on these screens, apart from the chrome shared by every page. |
| data-bound | `/collections` `/documents` `/evidence` `/reports` | Forge composes a repeating item list. Stage1 saw no data-bound component on these screens, apart from the chrome. |

These rows are evidence, not verdicts. A disagreement can mean Forge composes more than TraceLab
shows. It can equally mean Stage1 labelled something Forge would call a list. A person decides which.

### Corrected in m05: Chunk was counted as composed when Forge refuses it

m04 first committed **49** rows, 18 of them composed-only, and four of those claimed Forge composes
Chunk list, detail, form and timeline. It does not. `design.compose` refuses Chunk outside `inline`
with `OODS-V003`, and it returns a schema *alongside* `status: "error"`. The comparison read the
schema and never checked the status. m05 found this when it tried to preview Chunk list.

Now a refused screen is never a composed-only row. It is listed under the record's `notComposed`
with the composer's code, four entries for `Chunk:{list,detail,form,timeline}:OODS-V003`. A
spec runs a comparison of Chunk alone and requires zero composed-only rows. The numbers above are the
corrected ones.

## How it works

`packages/mcp-server/src/lib/observation.ts`, run by `scripts/product-reality/s204-m04-observation.ts`:

```
pnpm exec tsx scripts/product-reality/s204-m04-observation.ts \
  --run ~/portfolio/Design-Tools/Stage1/out/stage1/tracelab-production-infer/d0a43821-5730-4bf3-8b40-20f6fcb6b69c
```

- **Reading Stage1: through `structuredData.fetch` and nothing else.** It reads `identity_graph` and
  `object_rollup`. The only file it opens directly is the run's `manifest.json`, to confirm the
  directory is one Stage1 run. `capability_rollup` and `drift_report` are readable too. They hold no
  route or screen evidence to compare, so they are not read, and the record says so under
  `notCompared`. Field-level comparison is also listed there, because this run's entities come from
  routes and carry no fields.
- **Composing Forge's side: `design.compose` in transient mode.** Computing a comparison records no
  composition version. The spec checks that the schema store stays empty.
- **Every row carries both provenances.** The Stage1 side gives the run id, the target, the artifact
  kind, the path `structuredData.fetch` returned, and JSON pointers into that artifact. The Forge
  side gives the object, the context, the URN (`urn:oods:object:<Name>@<version>`, the Sprint 203
  context-panel form) and the sha256 of the composed schema. When one side has nothing, it says what
  was searched and `found: 0`. A row missing either side is withheld, and the withheld count is part
  of the scale.
- **Evidence, not instruction.** The record is `nature: "evidence-for-review"`. It copies Stage1's own
  `requires_human_adjudication: true` from the rollup. The spec walks the whole record and fails on
  any key such as `action`, `proposal`, `apply`, `patch`, `write` or `reconciliation`. It also checks
  that Stage1's `reconciliation.action: "create"` is never copied into a row.
- **Stated interpretation.** How routes become screens, how screens match objects, what counts as
  chrome, and what counts as input or data-bound are all written into the record under `rules`, so a
  reviewer can dispute any of them.

### Refusals: each one writes nothing

| code | when |
| --- | --- |
| `OODS-V208` | the path is not one Stage1 run: missing, no manifest, a manifest missing run id, passes, targets or an artifacts directory; an artifact from a different run; or an output path inside the run it read |
| `OODS-V209` | an artifact's `schema_version` is outside what `structuredData.fetch` accepts |
| `OODS-V210` | the comparison names an object the registry does not hold |

All three are registered in `src/errors/registry.ts`, so the tool surface reports them as validation
refusals rather than server errors. The spec shows for each one that the output directory is never
created.

## Proof

`packages/mcp-server/test/product-reality/observation.s204.spec.ts`, 14 tests:

- A synthetic run with a chrome component carrying both `input` and `data-bound` proves the four
  categories are typed separately, that every disagreement names its axis, and that chrome is
  attributed to no screen.
- Each refusal is tested end to end with nothing written, including an attempt to write into the run.
- **The closure, extended.** The Sprint 203 spec already walks every file under
  `packages/mcp-server/src`, so it covers the new module automatically. This spec adds the script,
  widens the forbidden list to network modules, `fetch(`, `child_process` and WebSocket, and asserts
  that the module's only direct file read is the manifest.
- **The real capture.** Wherever Stage1 is checked out, the run must exist, not be skipped. The spec
  recomputes it and requires rows identical to the retained `observation.json`.

Two deliberate breaks confirmed the spec catches real faults. Counting chrome as part of a screen
failed the categories test. Dropping `transient` failed the no-composition test. Both edits were
reverted.

Full mcp-server suite at commit: **419 files, 7,304 passed, 0 failed, 9 skipped** (the 9 are the `action-mappings` tests carried from m03). Root `pnpm typecheck` exit 0; root `tests/verification` 28 files, 170 passed.

## Limits a reviewer should know

1. **Stage1's component labels are often Tailwind class names.** "Rounded Md" and "Flex 1" are the
   input-bearing components on `/reports`. The `input` trait is Stage1's inference, not something
   Forge confirmed on the screen. The input and data-bound axes are only as good as those traits,
   which is why the rows go to a person.
2. **The chrome rule is blunt.** A component on all 25 routes counts as chrome. A component on 24 of
   them does not, and it is attributed to every screen it appears on.
3. **The run's manifest says `auth.type: "none"`.** The capture was authenticated: it holds real
   project, report and mission records behind TraceLab's sign-in wall. Stage1's manifest does not
   record `--auth`. That is Stage1's to correct, recorded here because it was measured.
4. **Screens are matched by URL, not by what the page shows.** `/graph` has no object. Something
   like `/users` would match a registry `User` only if `User` were among the compared objects.

## Also in this commit

- `scripts/product-reality/s204-m02-screens.ts:210`: an unused `width` parameter, committed in m02,
  failed the root `pnpm typecheck` (TS6133). It is renamed `_width` and nothing else changes. Root
  typecheck is now exit 0.

## Carried to the review

- **`OODS-V206` and `OODS-V207` (Sprint 203's context refusals) are not in the error registry.**
  `createError` falls back to `category: server_error` with an incident id for an unknown code, so
  at the tool surface those refusals look like server faults. Not fixed here, to keep the change
  surgical. Two lines in `registry.ts` would fix it.
