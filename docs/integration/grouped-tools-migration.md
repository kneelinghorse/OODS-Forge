# Grouped action-parameter tools — consumer migration guide

The five CRUD-shaped MCP tool families have been consolidated into single
**action-parameter** tools, following the established grouping pattern. This
cuts the default-exposed tool surface without changing any behavior.

| Grouped tool | `action` values | Replaces |
|---|---|---|
| `map`    | `apply` · `create` · `list` · `resolve` · `update` · `delete` | `map.apply` `map.create` `map.list` `map.resolve` `map.update` `map.delete` |
| `schema` | `save` · `load` · `list` · `delete` | `schema.save` `schema.load` `schema.list` `schema.delete` |
| `object` | `list` · `show` | `object.list` `object.show` |
| `repl`   | `render` · `validate` | `repl.render` `repl.validate` |
| `review` | `resolve` · `chain` | `review.resolve` `review.chain` |

Each grouped tool routes the validated payload to the **same per-action
handler** as before. The input is the old per-action body plus one extra field,
`action`; the response is byte-identical to the old per-action tool.

Generation verbs (`design.compose`, `viz.compose`, `code.generate`,
`fidelity.preview`, `pipeline`, `brand.apply`, `tokens.build`) and the
standalone reads (`catalog.list`, `registry.snapshot`, `structuredData.fetch`,
`health`) are **unchanged** — the action-parameter pattern only fits CRUD
families.

## What this means for you right now

**Nothing breaks.** The old per-action tool names remain registered as
deprecated aliases and behave exactly as before. You can migrate at your own
pace within the deprecation window. The old names will be removed in a
follow-up mission **after** all consumers have migrated.

> Operator note: the grouped tools only appear to live agents after a
> `npm run build` (dist rebuild) **and** an adapter restart — the aquex hub
> adapter caches the tool surface + schemas at startup. Until then the old
> names continue to serve.

## How to migrate a call

The transform is mechanical: replace the dotted tool name with the family name
and move the suffix into an `action` field.

```jsonc
// before
{ "tool": "map.apply",  "input": { "report": { ... }, "apply": true } }
// after
{ "tool": "map", "input": { "action": "apply", "report": { ... }, "apply": true } }

// before
{ "tool": "repl.render", "input": { "schemaRef": "...", "apply": true } }
// after
{ "tool": "repl", "input": { "action": "render", "schemaRef": "...", "apply": true } }
```

Over the MCP bridge the external names use underscores, so `map.apply` is
`map_apply` today and the grouped tool is simply `map`.

## Per-consumer notes

- **SDK (`@oods/sdk`)** — the public namespaced API does not change
  (`client.maps.create(input)`, `client.schema.load(input)`, …). Only the
  internal wire name each method sends changes from e.g. `map.create` to
  `map` + `{ action: 'create' }`. SDK consumers upgrade by bumping the package.
- **OODS Forge Playground** — the Design Lab shell client calls `repl.render` /
  `repl.validate`; repoint these to `repl` + `action`.
- **Synthesis-Workbench** — its HTTP client calls `repl.validate` /
  `repl.render`; repoint to `repl` + `action`. Coordinate the cutover with the
  adapter restart so the renamed surface is live before the old names are
  removed.
- **Bridge / connector policy** — the grouped names (`map`, `schema`, `object`,
  `repl`, `review`) are already added to `configs/agent/policy.json`
  (`tools[]` + both connector allow-lists) and the server security policy, so
  they are reachable as soon as the surface is rebuilt.

## Policy note (caps)

Policy is keyed per tool name, so each grouped tool gets one rule covering the
whole family. For `map` and `schema` (which mix read and write actions) the
consolidated rule takes the stricter per-axis cap — `concurrency: 1` — to keep
writes to the shared `component-mappings.json` / `.oods/schemas` serialized.
The previously read-only actions (`map.list`, `map.resolve`, `schema.load`,
`schema.list`) therefore run at the write tier's concurrency. These are
low-volume design-time reads, so the effect is negligible; `object`, `repl`,
and `review` keep their original caps.
