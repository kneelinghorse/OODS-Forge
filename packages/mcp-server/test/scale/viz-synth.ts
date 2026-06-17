/**
 * Scale-tier VIZ dataset synthesizer (sprint-110 m05).
 *
 * Generates realistic row datasets at 100/500/1000 rows for the data-aware viz
 * determinism gate. Same seed -> byte-identical rows across runs (mulberry32,
 * no Math.random()/Date.now() leaks), so the whole profile -> recommendation ->
 * spec pipeline can be asserted byte-stable at scale.
 *
 * Shape mirrors a real BI extract: a monthly temporal axis, a small categorical
 * dimension, a high-cardinality categorical code, and two correlated measures —
 * enough to exercise every data-aware signal (temporal regularity, cardinality,
 * correlation, negativity, stats).
 */

export type VizScaleTier = 100 | 500 | 1000;

export interface VizSynthOptions {
  tier: VizScaleTier;
  seed: number;
}

// mulberry32: small, fast, well-distributed PRNG with explicit state. Same seed
// -> same sequence. (Matches test/scale/synth.ts:27-36.)
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const REGIONS = ['North', 'South', 'East', 'West', 'Central'] as const;

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/**
 * Synthesize a viz row dataset. Deterministic for a given (tier, seed). The
 * temporal axis is regularly spaced by construction; the two measures are
 * positively correlated with seeded noise so the recommender has real signal.
 */
export function synthesizeVizRows(options: VizSynthOptions): Array<Record<string, unknown>> {
  const rand = mulberry32(options.seed);
  const rows: Array<Record<string, unknown>> = [];
  for (let i = 0; i < options.tier; i += 1) {
    // Regular monthly axis (wraps across years) — deterministic, UTC-safe text.
    const year = 2020 + Math.floor(i / 12);
    const month = (i % 12) + 1;
    const region = REGIONS[i % REGIONS.length];
    const skuCode = `sku-${pad2(i % 64)}`; // high-cardinality categorical code
    // Correlated measures: revenue tracks units with bounded seeded noise.
    const units = 50 + Math.floor(rand() * 200);
    const revenue = Math.round(units * 9.5 + (rand() - 0.5) * 120);
    rows.push({
      month: `${year}-${pad2(month)}`,
      region,
      sku: skuCode,
      units,
      revenue,
    });
  }
  return rows;
}

// ---------------------------------------------------------------------------
// Network/hierarchy synthesizers (sprint-111 m05).
//
// The viz scale tier above feeds the tabular profiler/recommender determinism
// gate. These produce the NEW network/hierarchy contracts (HierarchyInput /
// SankeyInput / NetworkInput) at the same tiers, so "same seed -> byte-identical
// ECharts option" can be asserted at scale for treemap/sunburst/sankey/force_graph.
// Same (tier, seed) -> identical structure (mulberry32, no Math.random/Date leaks).
// Each is constructed to be VALID for its adapter (sankey: every link valued +
// referencing existing nodes; hierarchy: every parentId references an earlier node).
// ---------------------------------------------------------------------------

const GROUPS = ['frontend', 'backend', 'data', 'infra'] as const;

/** Deterministic adjacency_list hierarchy: node 0 is the root, every later node
 *  attaches to an earlier node (an acyclic tree by construction). */
export function synthesizeHierarchyInput(options: VizSynthOptions): {
  type: 'adjacency_list';
  data: Array<{ id: string; parentId: string | null; value: number; name: string }>;
} {
  const rand = mulberry32(options.seed);
  const data: Array<{ id: string; parentId: string | null; value: number; name: string }> = [];
  for (let i = 0; i < options.tier; i += 1) {
    const parentIndex = i === 0 ? null : Math.floor(rand() * i); // always an earlier node
    data.push({
      id: `n${i}`,
      parentId: parentIndex === null ? null : `n${parentIndex}`,
      value: 1 + Math.floor(rand() * 100),
      name: `Node ${i}`,
    });
  }
  return { type: 'adjacency_list', data };
}

/** Deterministic sankey: a forward chain (n_i -> n_{i+1}) so every link is valued
 *  and references existing nodes (passes validateSankeyInput). */
export function synthesizeSankeyInput(options: VizSynthOptions): {
  nodes: Array<{ name: string }>;
  links: Array<{ source: string; target: string; value: number }>;
} {
  const rand = mulberry32(options.seed);
  const nodes = Array.from({ length: options.tier }, (_, i) => ({ name: `n${i}` }));
  const links: Array<{ source: string; target: string; value: number }> = [];
  for (let i = 0; i < options.tier - 1; i += 1) {
    links.push({ source: `n${i}`, target: `n${i + 1}`, value: 1 + Math.floor(rand() * 50) });
  }
  return { nodes, links };
}

/** Deterministic network: grouped nodes + forward links between existing nodes. */
export function synthesizeNetworkInput(options: VizSynthOptions): {
  nodes: Array<{ id: string; group: string; value: number }>;
  links: Array<{ source: string; target: string; value: number }>;
} {
  const rand = mulberry32(options.seed);
  const nodes = Array.from({ length: options.tier }, (_, i) => ({
    id: `n${i}`,
    group: GROUPS[i % GROUPS.length],
    value: 1 + Math.floor(rand() * 20),
  }));
  const links: Array<{ source: string; target: string; value: number }> = [];
  for (let i = 0; i < options.tier - 1; i += 1) {
    const target = i + 1 + Math.floor(rand() * Math.max(1, options.tier - i - 1));
    links.push({
      source: `n${i}`,
      target: `n${Math.min(target, options.tier - 1)}`,
      value: 1 + Math.floor(rand() * 10),
    });
  }
  return { nodes, links };
}
