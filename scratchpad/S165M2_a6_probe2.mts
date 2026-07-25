// s165 m2: an A6 fixture where the INCOHERENT-BAND RULE alone decides. Uses the shape-on-MarkBar
// mechanism so partitionFields=∅, and puts the manufactured 2-distinct-x opposing band on the {shape}
// axis — a band G1_s164 structurally cannot see (shape is not in groupingFields for a bar).
import {
  analyzeVizSpec,
  correlationSeparabilityEvidence,
  correlationOppositionEvidence,
  correlationGateFields,
} from '../packages/viz-core/src/a11y/data-analysis.js';

type Row = Record<string, unknown>;
const enc = {
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
  y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
  shape: { field: 'shp', trait: 'EncodingShape' },
  size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' },
};
const spec = (values: Row[]) =>
  ({
    $schema: 'https://oods.dev/viz-spec/v1', id: 'a6b', name: 'a6b',
    data: { name: 'd', values }, marks: [{ trait: 'MarkBar', encodings: { ...enc } }],
    encoding: enc, a11y: { description: 'y over x' },
  }) as any;

const report = (label: string, values: Row[]) => {
  const s = spec(values);
  const gate = correlationGateFields(s);
  const g1p = correlationSeparabilityEvidence(s);
  const g1 = correlationOppositionEvidence(s);
  console.log(`\n=== ${label} ===`);
  console.log('  gate =', JSON.stringify(gate));
  console.log('  corr =', analyzeVizSpec(s).correlation);
  console.log(`  G1_s164: votes=[${g1.votes}] suppresses=${g1.suppresses}`);
  console.log(`  G1'    : votes=[${g1p.votes}] suppresses=${g1p.suppresses} pooledSign=${g1p.pooledSign}`);
  const bands = (keys: string[]) => {
    const m = new Map<string, Map<number, number[]>>();
    for (const r of values) {
      const k = keys.map((f) => String(r[f])).join('/') || '*';
      if (!m.has(k)) m.set(k, new Map());
      const byX = m.get(k)!;
      if (!byX.has(Number(r.x))) byX.set(Number(r.x), []);
      byX.get(Number(r.x))!.push(Number(r.y));
    }
    for (const [k, byX] of m) {
      const pts = [...byX.entries()].map(([x, ys]) => `${x}->${(ys.reduce((a, b) => a + b, 0) / ys.length).toFixed(1)}`);
      const others = keys.length === 2 ? 1 : new Set(values.filter((r) => keys.map((f) => String(r[f])).join('/') === (k === '*' ? '' : k)).map((r) => keys.includes('shp') ? r.sz : r.shp)).size;
      console.log(`      S={${keys}} band ${k}: ${pts.join(' ')}  distinctX=${byX.size} coherent=${others <= 1}`);
    }
  };
  bands(['shp']); bands(['sz']); bands(['shp', 'sz']);
};

// shp=circle: sz composition uneven across x → the {shp=circle} band FALLS (155 -> 20) over 2 distinct x
// while every COHERENT band rises AND the pooled r is clearly POSITIVE. That falling band is a pure
// composition artifact (one extra large-sz point at x=1), so A6 must refuse its n=2 vote.
const twoX: Row[] = [
  { x: 1, y: 10, shp: 'circle', sz: 10 }, { x: 2, y: 20, shp: 'circle', sz: 10 },
  { x: 1, y: 300, shp: 'circle', sz: 20 },
  { x: 1, y: 10, shp: 'square', sz: 10 }, { x: 2, y: 200, shp: 'square', sz: 10 }, { x: 3, y: 400, shp: 'square', sz: 10 },
];
report('A6: 2-distinct-x INCOHERENT opposing band → must NARRATE (A6 refuses the manufactured vote)', twoX);

// the twin: the SAME mechanism but the incoherent band clears >=3 distinct x and the ρ floor → it votes.
const threeX: Row[] = [
  { x: 1, y: 10, shp: 'circle', sz: 10 }, { x: 2, y: 20, shp: 'circle', sz: 10 }, { x: 3, y: 30, shp: 'circle', sz: 10 },
  { x: 1, y: 300, shp: 'circle', sz: 20 }, { x: 2, y: 200, shp: 'circle', sz: 20 },
  { x: 1, y: 10, shp: 'square', sz: 10 }, { x: 2, y: 200, shp: 'square', sz: 10 }, { x: 3, y: 400, shp: 'square', sz: 10 },
];
report('A6 twin: 3-distinct-x INCOHERENT opposing band → must SUPPRESS', threeX);
