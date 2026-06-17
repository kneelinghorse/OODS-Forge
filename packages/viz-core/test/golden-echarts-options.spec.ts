import { describe, expect, it } from 'vitest';
import {
  adaptGraphToECharts,
  adaptSankeyToECharts,
  adaptSunburstToECharts,
  adaptTreemapToECharts,
  type HierarchyInput,
  type NetworkInput,
  type NormalizedVizSpec,
  type SankeyInput,
} from '@oods/viz-core';

// Committed golden harness for the sprint-111 network/hierarchy ECharts options
// (the m05 determinism gate). For treemap/sunburst/sankey/force_graph the OPTION is
// a pure, deterministic function of (spec, input) — so it can be pinned to a golden.
// The iterative force LAYOUT (rendered node x/y) is client-side and explicitly NOT
// goldened (m04 audit). We golden the JSON-SAFE projection (JSON.parse(JSON.stringify))
// — the function-free, transmittable form viz.render actually returns; the tooltip
// formatter closure is intentionally excluded (it does not survive JSON transport).
//
// The snapshot IS the golden: any drift in an adapter (a changed default, a dropped
// field, a reordered series) flips it. Determinism is separately asserted (run twice
// -> byte-identical) so the gate also catches nondeterminism the snapshot can't show.

const jsonSafe = (option: unknown): unknown => JSON.parse(JSON.stringify(option));

function spec(id: string, name: string, mark: string, description: string): NormalizedVizSpec {
  return {
    $schema: 'https://oods.dev/viz-spec/v1',
    id,
    name,
    data: { values: [] },
    marks: [{ trait: mark }],
    encoding: {},
    a11y: { description },
  } as NormalizedVizSpec;
}

// --- fixtures: small, fully-specified, real-shaped --------------------------
const HIERARCHY_NESTED: HierarchyInput = {
  type: 'nested',
  data: {
    name: 'Org',
    value: 100,
    children: [
      { name: 'Engineering', value: 60, children: [{ name: 'Frontend', value: 25 }, { name: 'Backend', value: 35 }] },
      { name: 'Sales', value: 40, children: [{ name: 'AMER', value: 24 }, { name: 'EMEA', value: 16 }] },
    ],
  },
};
const HIERARCHY_ADJACENCY: HierarchyInput = {
  type: 'adjacency_list',
  data: [
    { id: 'root', parentId: null, value: 0, name: 'Company' },
    { id: 'a', parentId: 'root', value: 12, name: 'Alpha' },
    { id: 'b', parentId: 'root', value: 18, name: 'Beta' },
    { id: 'a1', parentId: 'a', value: 7, name: 'Alpha-1' },
  ],
};
const SANKEY_FLOW: SankeyInput = {
  nodes: [{ name: 'Coal' }, { name: 'Grid' }, { name: 'Homes' }, { name: 'Industry' }],
  links: [
    { source: 'Coal', target: 'Grid', value: 100 },
    { source: 'Grid', target: 'Homes', value: 60 },
    { source: 'Grid', target: 'Industry', value: 40 },
  ],
};
const NETWORK_GRAPH: NetworkInput = {
  nodes: [
    { id: 'web', group: 'frontend', value: 9 },
    { id: 'api', group: 'backend', value: 6 },
    { id: 'db', group: 'data', value: 4 },
    { id: 'cache', group: 'data' },
  ],
  links: [
    { source: 'web', target: 'api', value: 3 },
    { source: 'api', target: 'db', value: 2 },
    { source: 'api', target: 'cache', value: 1 },
  ],
};

const CASES: ReadonlyArray<readonly [string, () => unknown]> = [
  ['treemap (nested)', () => adaptTreemapToECharts(spec('viz:treemap', 'Org', 'MarkTreemap', 'Treemap of org headcount.'), HIERARCHY_NESTED)],
  ['treemap (adjacency)', () => adaptTreemapToECharts(spec('viz:treemap-adj', 'Company', 'MarkTreemap', 'Treemap from adjacency list.'), HIERARCHY_ADJACENCY)],
  ['sunburst (nested)', () => adaptSunburstToECharts(spec('viz:sunburst', 'Org', 'MarkSunburst', 'Sunburst of org headcount.'), HIERARCHY_NESTED)],
  ['sankey (flow)', () => adaptSankeyToECharts(spec('viz:sankey', 'Energy', 'MarkSankey', 'Sankey of energy flow.'), SANKEY_FLOW)],
  ['force_graph (network)', () => adaptGraphToECharts(spec('viz:graph', 'Service map', 'MarkGraph', 'Force graph of services.'), NETWORK_GRAPH)],
];

describe('golden ECharts options — treemap / sunburst / sankey / force_graph', () => {
  for (const [name, build] of CASES) {
    it(`${name}: JSON-safe option matches the committed golden`, () => {
      expect(jsonSafe(build())).toMatchSnapshot();
    });

    it(`${name}: same (spec, input) -> byte-identical option (determinism gate)`, () => {
      expect(JSON.stringify(jsonSafe(build()))).toBe(JSON.stringify(jsonSafe(build())));
    });
  }
});
