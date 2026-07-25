// s165 m4 §6.1 bubble-chart corpus generator (side-effect free; shared by the recorder and the audit).
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

type Row = Record<string, unknown>;

// A BUBBLE CHART: MarkPoint, categorical color, quantitative size, optionally a quantitative detail.
export function bubbleSpecs(count: number, seed: number, honestOnly: boolean) {
  const rnd = mulberry32(seed);
  const pick = <T,>(items: readonly T[]): T => items[Math.floor(rnd() * items.length) % items.length];
  const specs: Record<string, unknown>[] = [];
  for (let i = 0; i < count; i += 1) {
    const nSeg = 2 + Math.floor(rnd() * 3); // 2-4 colour series
    const nSz = 2 + Math.floor(rnd() * 3); // 2-4 size bands
    const nX = 3 + Math.floor(rnd() * 5); // 3-7 x positions
    const globalSign = rnd() < 0.5 ? 1 : -1;
    const rows: Row[] = [];
    for (let s = 0; s < nSeg; s += 1) {
      for (let z = 0; z < nSz; z += 1) {
        // honest: every band slopes the SAME way. realistic: any sign, including 0.
        const slope = honestOnly
          ? globalSign * pick([2, 5, 9, 14])
          : pick([-14, -9, -5, -2, 0, 2, 5, 9, 14]);
        const base = Math.floor(rnd() * 5) * 120;
        const noise = pick([0, 0, 1, 3]);
        for (let x = 1; x <= nX; x += 1) {
          // a realistic bubble chart has UNEVEN band composition — not every (seg,sz) covers every x
          if (rnd() < 0.18) continue;
          rows.push({
            x,
            y: base + slope * x + (rnd() < 0.5 ? noise : -noise),
            seg: `S${s}`,
            sz: (z + 1) * 12,
            dt: s * 10 + z,
          });
        }
      }
    }
    const withDetail = rnd() < 0.4;
    const aggregate = pick([undefined, 'average'] as const);
    const encoding: Record<string, unknown> = {
      x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
      y: { field: 'y', trait: 'EncodingY', type: 'quantitative', ...(aggregate ? { aggregate } : {}) },
      color: { field: 'seg', trait: 'EncodingColor' },
      size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' },
      ...(withDetail ? { detail: { field: 'dt', trait: 'EncodingDetail', type: 'quantitative' } } : {}),
    };
    specs.push({
      $schema: 'https://oods.dev/viz-spec/v1',
      id: `bubble-${i}`,
      name: `bubble ${i}`,
      data: { name: 'd', values: rows },
      marks: [{ trait: 'MarkPoint', encodings: { ...encoding } }],
      encoding,
      a11y: { description: 'y over x' },
    });
  }
  return specs;
}

export const POPULATIONS: [string, boolean, number][] = [
  ['REALISTIC bubble charts (random band slopes)', false, 0xb0b1],
  ['HONEST-BY-CONSTRUCTION bubble charts (all bands same sign)', true, 0xb0b2],
];

