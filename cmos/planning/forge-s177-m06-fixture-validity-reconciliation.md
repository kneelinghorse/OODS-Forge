# Forge s177 m06 — fixture-validity reconciliation

**Status: VERIFIED.** The two previously separate fixture oracles now have one executable
account. The whole-spec oracle uses the installed Vega-Lite **6.4.1** schema at
`node_modules/vega-lite/build/vega-lite-schema.json` (SHA-256
`4f11cd379b7cac0ddee17eefea84c028bd41619ace28778acf843c009e43abd2`).

## Counts

Both oracles cover the same 42 committed mark-bearing fixtures.

| | NVS valid | NVS invalid | Total |
|---|---:|---:|---:|
| Vega-Lite whole spec valid | 27 | 1 | 28 |
| Vega-Lite whole spec invalid | 10 | 4 | 14 |
| Total | 37 | 5 | 42 |

The historical “3 at `/params/0`, 11 at `/`” split was only the order of
`validate.errors[0]` through Vega-Lite's union branches. It was not a causal classification
and is retired.

## Four-file overlap

The exact intersection of the 14 whole-spec-invalid fixtures and the 5 deliberately
NVS-invalid certify fail-safe fixtures is:

1. `examples/viz/before-after/accessibility-tighten/after.spec.json`
2. `examples/viz/before-after/facet-small-multiples/after.spec.json`
3. `examples/viz/before-after/renderer-density-upgrade/after.spec.json`
4. `examples/viz/before-after/renderer-density-upgrade/before.spec.json`

The fifth NVS-invalid fixture,
`examples/viz/before-after/accessibility-tighten/before.spec.json`, emits a valid Vega-Lite
whole spec. Therefore neither invalid set contains the other.

## Whole-spec causes

The 14 fixtures reduce to three non-disjoint, output-level causes:

- **Selection event array → string (4 fixtures):** accessibility-tighten/after,
  facet-small-multiples/after, and renderer-density-upgrade/before+after. Exact AJV causal
  paths are `/params/{0,1}/select/on`; the installed schema's applicable branch requires a
  string event selector.
- **Padding nested under a composite child (9 fixtures):** facet-small-multiples/before+after,
  facet-layout, detail-overview-bar, drilldown-stacked-bar, facet-small-multiples-line,
  facet-target-band, focus-context-line, and sparkline-grid. Exact child paths are pinned in
  the manifest; AJV reports `additionalProperties` for `padding` there.
- **Type emitted on secondary `y2` encoding (3 fixtures):** facet-target-band and the two
  target-band-line twins. AJV reports `additionalProperties` for `type` at the exact `y2`
  paths.

facet-small-multiples/after carries the first two causes; facet-target-band carries the last
two. That overlap explains why the bucket counts sum to 16 while the invalid fixture set is
14.

## Resolution and executable carriers

Source fixture and production bytes remain unchanged. These examples feed documented,
Storybook, pattern-registry, or standing-corpus surfaces, and s177 permits no behavioral
mover beyond Fork-R. Rewriting the 11 cheap source values or changing the adapter would
breach that locked boundary.

Instead, `tests/viz/mark-options-schema-validity-s167.test.ts` now pins:

- the exact 42-file corpus and exact 14-file invalid set;
- per-file AJV causal signatures (`instancePath|keyword|params`);
- exact JSON-pointer corrections, each proved necessary by a leave-one-out RED;
- correction sufficiency, because applying only the declared corrections must make each
  compiled whole spec validate; and
- zero unannotated whole-spec failures.

The independent NVS/certify fail-safe manifest remains executable in
`packages/viz-core/test/accuracy-rules-s170.spec.ts`: exactly five named invalid inputs take
the deliberate pre-certification fail-safe branch. This record reconciles that closed set
against the whole-spec exception manifest and names their exact four-file intersection.

No schema, production adapter, fixture, generated file, docs/api, policy, or tool-description
byte moved for this reconciliation.
