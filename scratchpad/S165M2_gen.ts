// ── s165 m2 MONOTONICITY SWEEP GENERATOR (shared text; the identical block lives in
// correlation-union-suppressor-s165.spec.ts and its behavioural identity is proven by the committed
// SPECS_CHECKSUM assert, so a drifted copy goes RED rather than silently comparing different specs).
export type GenRow = Record<string, unknown>;

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateSweepSpecs(count: number, seed: number): Record<string, unknown>[] {
  const rnd = mulberry32(seed);
  const pick = <T>(items: readonly T[]): T => items[Math.floor(rnd() * items.length) % items.length];
  const MARKS: string[][] = [['MarkPoint'], ['MarkLine'], ['MarkBar'], ['MarkArea'], ['MarkLine', 'MarkPoint']];
  const AGGS = [undefined, 'average', 'sum'] as const;
  const COLOR = [undefined, 'seg', 'grp', 'sz', 'dt'] as const;
  const QUANT = new Set(['sz', 'dt']);
  const specs: Record<string, unknown>[] = [];
  for (let i = 0; i < count; i += 1) {
    const nSeg = 1 + Math.floor(rnd() * 3);
    const nSz = 1 + Math.floor(rnd() * 3);
    const nX = 2 + Math.floor(rnd() * 4);
    const rows: GenRow[] = [];
    for (let s = 0; s < nSeg; s += 1) {
      for (let z = 0; z < nSz; z += 1) {
        const slope = pick([-10, -3, 0, 3, 10]);
        const base = Math.floor(rnd() * 4) * 250;
        const jitter = pick([0, 0, 1, 5]);
        for (let x = 1; x <= nX; x += 1) {
          rows.push({
            x,
            y: base + slope * x + (rnd() < 0.5 ? jitter : -jitter),
            seg: `S${s}`,
            grp: `G${z}`,
            sz: (z + 1) * 10,
            dt: (s + 1) * 100 + z,
          });
        }
      }
    }
    const marks = pick(MARKS);
    const agg = pick(AGGS);
    const colorField = pick(COLOR);
    const sizeField = rnd() < 0.5 ? 'sz' : undefined;
    const shapeField = rnd() < 0.35 ? 'grp' : undefined;
    const detailField = rnd() < 0.35 ? 'dt' : undefined;
    const facet = rnd() < 0.2;
    const encoding: Record<string, unknown> = {
      x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
      y: { field: 'y', trait: 'EncodingY', type: 'quantitative', ...(agg ? { aggregate: agg } : {}) },
    };
    if (colorField) {
      encoding.color = {
        field: colorField,
        trait: 'EncodingColor',
        ...(QUANT.has(colorField) ? { type: 'quantitative' } : {}),
      };
    }
    if (sizeField) encoding.size = { field: sizeField, trait: 'EncodingSize', type: 'quantitative' };
    if (shapeField) encoding.shape = { field: shapeField, trait: 'EncodingShape' };
    if (detailField) encoding.detail = { field: detailField, trait: 'EncodingDetail', type: 'quantitative' };
    specs.push({
      $schema: 'https://oods.dev/viz-spec/v1',
      id: `sweep-${i}`,
      name: `sweep ${i}`,
      data: { name: 'd', values: rows },
      marks: marks.map((trait) => ({ trait, encodings: { ...encoding } })),
      encoding,
      a11y: { description: 'y over x' },
      ...(facet ? { layout: { trait: 'LayoutFacet', columns: { field: 'grp' } } } : {}),
    });
  }
  return specs;
}

// A deterministic content fingerprint over the generated specs (FNV-1a over the concatenated JSON), so a
// drifted generator copy is caught by an assert instead of silently comparing a different fixture set.
export function specsChecksum(specs: readonly Record<string, unknown>[]): string {
  let hash = 0x811c9dc5;
  const text = specs.map((spec) => JSON.stringify(spec)).join('');
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}
