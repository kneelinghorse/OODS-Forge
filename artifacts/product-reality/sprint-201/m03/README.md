# s201-m03 — Side by side and what-changed

Builder self-certified: **false**. Built on `codex/sprint-201-design-surface` from `82f353aac` (m02). Receipts were taken from the dirty working tree before this mission's commit.

## What is in the tree

- **Structural what-changed** (`packages/mcp-bridge/src/preview/diff.ts`, `diffVersions`): the shape of the design loop's receipt diff (`scripts/design-loop/diff.ts`: one `{field, before, after}` row per difference, a count, JSON equality; its artifact-file comparison reused as is) over two version records: regions added, removed or reordered (the direct children of every screen); slot components (the composer's own placements recorded on the version, else read from the schema by slot id, so a filled slot keeps its identity whether or not the placeholder intent survived); nodes added or removed outside slots, except bare layout containers whose ids the composer renumbers between compositions; props of matched nodes; field order per region outside slots; the seed; artifact files whose hash moved per framework both versions carry. Identical versions report zero differences.
- **`/compare/<id>@<v>/<id>@<v>?framework=&brand=&theme=&width=`** in the preview host: both running apps side by side (the same brand, theme and width; brand and theme re-mount both frames in place; framework navigates), the what-changed panel grouped by category, and both measurement panels, which say `No measurement has been recorded for this version.` until m04 records one. `/compare/…/diff.json` returns the diff; unknown references answer 404, malformed ones 400, versions with no shared framework 409.
- **`design.preview action:"compare"`** (`compositionId`@`version` against `against.version`, optionally `against.compositionId`) returns the same diff from the host with `compareUrl`, `diffUrl`, the frameworks both versions carry, `identical` and `differenceCount`; the output schema is now `anyOf` render | compare; `OODS-V203` without `against`, `OODS-N022` for an unknown version. Contract regenerated: schemas, types, `docs/api`, `Tool-Specs.md` (124 root input parameters), claims, tool descriptions and the agent policy.

## Receipts

- `browser/compare.json` + two screenshots (Chromium through the built bridge, brand B, dark, 820 px): version 1 of a Subscription detail composition against version 2 recomposed with the README's documented override (`metadata` → `TagSummary`). The tool reported exactly the slot change and the artifact files it moved (`{"regions": 0, "slots": 1, "nodes": 0, "props": 0, "fieldOrder": 0, "seed": 0, "artifacts": 4}`), and version 2 against itself reported `identical: True` with 0 differences. In both frameworks the page mounted both apps (38 and 40 components in React, 41 and 43 in Vue) at brand B / dark / 820 px viewport each, the what-changed panel named `Slots · metadata` and `Artifact files`, and both measurement panels stated that nothing had been measured; browser errors: 0.
- Golden ledger: 3 must-not-move / 17 may-move-once / 0 entries verified; sealed sprint-195…200 receipts byte-identical.

## Tests

- `@oods/mcp-bridge` `src/preview/diff.test.ts`: 5 (a version against itself is identical; a swapped slot with moved artifact files reports exactly `slots` + `artifacts`; a reordered region reports the region order only; an added region, a changed prop, a swapped field pair and a changed seed each land in their own category; the compare page and `diff.json` through the routes with 400/404 refusals). `host.test.ts`: 12 unchanged.
- `@oods/mcp-server` `test/tools/design.preview.s201.spec.ts`: 6 (adds: action compare through a real host and a real recompose reports exactly the `metadata` slot change with the four moved artifact files, the compare page frames both versions, `diff.json` equals the tool's diff, self-compare is identical, `OODS-V203`/`OODS-N022` refusals). Contracts `tool-truth.s193`, `tool-specs-generator.s196` (124), `portable-claims.s196`, `composition-store.s201`, the adapter spec; root `how-forge-works`, `forge-claims`, `readme.s200`, `portable-runbook.s200`; `docs:check`, golden ledger `check`.

## Not done here

- The what-changed is structural (schema and artifact hashes), not visual; pixel differences are not claimed. Measurements beside the render are m04; edits producing new versions are m05.
- Overriding a tab slot to `Card` composes a schema `code.generate` rejects (`OODS-V007`: pattern-group props on Card), a pre-existing composer behaviour noted for m05's swap operation, which offers only the composer's own candidates.
