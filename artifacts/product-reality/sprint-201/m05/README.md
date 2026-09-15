# s201-m05 — Editing that writes back

Builder self-certified: **false**. Built on `codex/sprint-201-design-surface` from `1613ad0ed` (m04). Receipts were taken from the dirty working tree before this mission's commit.

## What is in the tree

- **The override surface, extended** (`design.compose` `preferences`): `regionOrder` (the screen's regions by id in the desired order), `fieldOrder` (region id → field names in order among sibling field nodes: a field editor, a read-only row wrapping one field, or a slot placing a field component), and `seed` (recorded on the schema as `seed`; the sample-data generator rotates its deterministic lists by a stable hash of it, so a seed change alters the sample data and nothing else). `applyOrderOverrides` runs after composition and refuses names the screen does not have (`OODS-V204`); the composer never edits a schema by hand. Every recorded version now lists each slot's composer candidates; `options.operation` names the lineage operation of a recomposition.
- **`design.preview action:"edit"`**: one operation on `compositionId@version` — `reorder-region {regionOrder}`, `swap-slot {slot, component}` (the component must be one of the composer's own candidates for that slot on the parent), `reorder-fields {region, fieldOrder}`, `seed {seed}` — re-composes the parent's own inputs through the override surface with exactly that change, records a new version with the parent and the operation, generates both frameworks and certifies its charts, and opens it. An operation that names nothing the version has, changes nothing, or picks a non-candidate is refused with `OODS-V204` and records nothing. The parent's file is never written by an edit. The render output gains `editable` (regions in order, slots with candidates, field order per region, the seed). **`action:"versions"`** lists a composition's versions with lineage and URLs.
- **From the page** (`shell.ts` `renderEditControls`): regions with up/down, one swap form per slot with more than one candidate, fields with up/down per region, a seed form. Each posts one operation to `POST /preview/<id>/<n>/edit`; the host runs `design.preview action:"edit"` on the native server (the bridge through its own client; the standalone host, started by the adapter, through a native client of its own, `native.ts`, so Claude Desktop and Cursor users edit too) and the page opens the new version in the same framework, brand, theme and width. A native `OODS-V*` refusal comes back as 422 with the native error; a host without a native server answers 501.

## Receipts

- `browser/edits.json` + four screenshots (Chromium through the built bridge) on a Subscription detail version 1:
  - reorder-region from the page → version 2 (`reorder-region ← v1` on its lineage), the running app showing `detail-body-10, detail-header-1` in React and `detail-body-10, detail-header-1` in Vue, from `detail-header-1, detail-body-10`;
  - swap-slot from the page (`metadata` → `TagSummary`, a composer candidate) → version 3; the compare view v1 vs v3 reports `{"regions": 0, "slots": 1, "nodes": 0, "props": 0, "fieldOrder": 0, "seed": 0, "artifacts": 4}` with exactly `metadata: ['AuditTimeline'] → ['TagSummary']`;
  - reorder-fields from the page (`detail-body-10`: `updated_at` above `created_at`) → version 4, the read-only rows on screen in the new order (`detail-tabs-9-updated_at-value, detail-tabs-9-created_at-value`);
  - seed from the page (`harbor-2`) → version 5; the running app's text changed and the compare view reports only `seed` (this screen's artifact carries no seeded text: its chart amounts do not rotate), the model did;
  - the page's guard refused a swap to the candidate the slot already leads with without recording anything; `versions` listed `[{"version": 1, "parentVersion": null, "operation": "compose"}, {"version": 2, "parentVersion": 1, "operation": "reorder-region"}, {"version": 3, "parentVersion": 1, "operation": "swap-slot"}, {"version": 4, "parentVersion": 1, "operation": "reorder-fields"}, {"version": 5, "parentVersion": 1, "operation": "seed"}]`; version 1's schema, inputs, lineage, artifacts and model were unchanged after all four edits (its file gained only the axe measurements the opened page stored, `react`); browser errors: 0.
- Golden ledger: 3 must-not-move / 17 may-move-once / 0 entries verified; sealed sprint-195…200 receipts byte-identical.

## Tests

- `@oods/mcp-server` `test/tools/design.preview.s201.spec.ts`: 8 (adds: each of the four operations yields the expected schema change — regions reordered in both generated artifacts, the slot swap reported by compare as exactly that change, fields reordered, the seed changing the schema's `seed` and the sample records and nothing else — each a new version with parent and operation; the parent's file byte-identical after every one; seven refusals with `OODS-V204` recording nothing; `versions` listing the lineage). Contracts `tool-truth.s193`, `tool-specs-generator.s196` (125 root inputs), `portable-claims.s196`, `composition-store.s201`, the adapter spec, `test/compose` and `src/codegen`: green.
- `@oods/mcp-bridge` `src/preview/edit.test.ts`: 3 (the four controls rendered from the version; the edit route relaying one operation to the native tool and answering the new version's URL with the page's scope; a typed native refusal as 422, no native tool as 501). `host`, `diff`, `measurements`: 22.

## Not done here

- Edits offer what the composer offers: a slot swap only among the composer's own candidates (a free component name is refused), and a region or field order only among what the screen carries. Overriding a tab slot to `Card` composes a schema `code.generate` rejects (noted at m03); such candidates are not offered.
- The craft list is m06.
