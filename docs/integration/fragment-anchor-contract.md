# Fragment-Anchor Contract

> Defines the two anchor attributes Forge emits on `repl.render`
> `output.format=fragments` HTML, and which one a consumer may pin long-lived
> references (e.g. human review comments) to.

**Version:** 1.0
**Status:** Active
**Owner:** OODS Forge
**Related tools:** `repl.render` (`output.format=fragments`), `design.compose`
**Primary consumer:** Synthesis-Workbench click-and-comment review layer

---

## Overview

Synthesis-Workbench renders Forge's fragment HTML in a review surface and lets a
human attach comments to specific rendered nodes. For those comments to survive
the author re-composing the design (adding a tab, reordering a section), the
anchor a comment is pinned to must be **durable** — it must keep pointing at the
same semantic slot even as the surrounding structure changes.

Forge already emits two anchor attributes on every rendered component (no
renderer change was needed for this contract; see
`packages/mcp-server/src/render/component-map.ts:120,122`). This document
declares which is durable and which is not.

## Anchor Attributes (Quick Reference)

| Attribute | Source | Always present | Durability | Consumer guidance |
|-----------|--------|----------------|------------|-------------------|
| `data-oods-node-id` | `node.id` | Yes, on every rendered node | **Best-effort.** Deterministic for a fixed input, but a per-compose-run `uid()` counter — it **shifts** when the structure changes. | Safe as a within-render key. **Do not persist across re-composes.** |
| `data-oods-label` | `node.meta.label` | When the node has a label (composed slots always do) | **Durable.** Derived from slot/field semantics, not tree position. A surviving slot keeps its label across a structural re-compose. | **Pin long-lived references here.** Not guaranteed unique — see caveat below. |

> Section-layout wrappers also emit `data-layout-node-id` (the same `node.id`
> value, on the `<section>` element). That is the layout node-id and carries the
> same best-effort durability as `data-oods-node-id`; it is not a separate
> durable anchor.

## Why `data-oods-node-id` is best-effort

`node.id` is assigned during composition by a module-level counter
(`uid()` in `compose/templates/types.ts`), reset at the start of each template
via `resetIdCounter()`. IDs are handed out in tree-traversal order, so the value
is **deterministic for a given input** (the same compose input yields the same
ids byte-for-byte) but **position-dependent**: adding, removing, or reordering a
section changes which nodes precede a given slot and therefore shifts that
slot's id.

Worked example — composing `Subscription` in `detail` context, changing only the
tab count from 3 to 5:

| Slot (`data-oods-label`) | `data-oods-node-id` @ 3 tabs | `data-oods-node-id` @ 5 tabs | Stable? |
|--------------------------|------------------------------|------------------------------|---------|
| `header`   | `slot-header-2`    | `slot-header-2`    | id stable (precedes the change) |
| `tab-3`    | `slot-tab-3-15`    | `slot-tab-3-10`    | **id shifted**, label stable |
| `metadata` | `slot-metadata-12` | `slot-metadata-16` | **id shifted**, label stable |

The `header` slot's id is stable only because it happens to precede the changed
region — that is incidental, not a guarantee.

## Why `data-oods-label` is durable

Labels come from slot/field semantics (`humanizeFieldName`,
`compose/.../label-generator.ts`), not from the layout counter. A slot that
survives a structural change keeps the same label, as the table above shows
(`tab-3`, `metadata`, `header` all keep their labels across the re-compose).

## Caveat: labels are not guaranteed unique

`data-oods-label` is durable but **not guaranteed unique within a single
render**. Auto-derived *tab* labels are de-duplicated
(`design.compose.ts` appends an index on collision), but slot labels in general
are not uniqueness-enforced — two slots can legitimately carry the same label.

Consumers that need to address exactly one node should therefore anchor on
**`data-oods-label` plus a disambiguator**, for example:

- the label **scoped to the enclosing fragment key** (the fragment map is keyed
  by the top-level `node.id`), or
- the label **plus its ordinal** among same-labeled siblings, or
- the label **plus a content hash** of the node, if the consumer needs to detect
  that the slot's content changed.

A bare `[data-oods-label="..."]` selector may match more than one element.

## Determinism guarantee

For a fixed `design.compose` input, both anchors are reproducible: re-composing
the same input yields an identical `data-oods-label → data-oods-node-id` map.
This is what makes `data-oods-node-id` usable as a within-render key — it only
becomes unreliable when the *input structure* changes.

## Verification

This contract is regression-tested by
`packages/mcp-server/test/contracts/fragment-anchor-contract.spec.ts`:

1. **Presence** — both anchors appear on every labeled node of
   `repl.render` `format:fragments` output.
2. **Determinism** — identical compose input yields an identical
   label → node-id map.
3. **Durability vs best-effort** — across a structural re-compose (3 → 5 tabs),
   every surviving slot keeps its `data-oods-label`, while at least one
   surviving slot's `data-oods-node-id` shifts (pinned concretely on `header`
   staying fixed and `metadata` shifting).
