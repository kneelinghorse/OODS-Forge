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
