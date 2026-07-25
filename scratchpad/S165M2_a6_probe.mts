// s165 m2: construct the A6 incoherent-band fixtures. Goal: a spec whose S={seg} band is INCOHERENT
// (members disagree on sz) with exactly 2 distinct x and a direction OPPOSING the pooled — a manufactured
// cross-series vote created purely by uneven sz composition across x. A6 must refuse it (narrate); the
// 3-distinct-x twin must still vote (suppress).
import { analyzeVizSpec, correlationSeparabilityEvidence, separableFields } from '../packages/viz-core/src/a11y/data-analysis.js';

type Row = Record<string, unknown>;
const enc = {
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
  y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
  color: { field: 'seg', trait: 'EncodingColor' },
  size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' },
};
const spec = (values: Row[]) =>
  ({
    $schema: 'https://oods.dev/viz-spec/v1', id: 'a6', name: 'a6',
    data: { name: 'd', values }, marks: [{ trait: 'MarkPoint', encodings: { ...enc } }],
    encoding: enc, a11y: { description: 'y over x' },
  }) as any;

const report = (label: string, values: Row[]) => {
  const s = spec(values);
  const ev = correlationSeparabilityEvidence(s);
  console.log(`\n=== ${label} ===`);
  console.log('  sf=', separableFields(s, 'x', 'y'));
  console.log('  corr =', analyzeVizSpec(s).correlation, ' G1\'votes=[', ev.votes.join(','), '] suppresses=', ev.suppresses, ' pooledSign=', ev.pooledSign);
  // hand: the coherent (seg,sz) bands
  const bands = new Map<string, [number, number][]>();
  for (const r of values) {
    const k = `${r.seg}/${r.sz}`;
    if (!bands.has(k)) bands.set(k, []);
    bands.get(k)!.push([Number(r.x), Number(r.y)]);
  }
  for (const [k, pts] of bands) {
    const dir = pts.length < 2 ? 'n=1 (not votable)' : (pts[pts.length - 1][1] - pts[0][1]) > 0 ? 'rises' : (pts[pts.length - 1][1] - pts[0][1]) < 0 ? 'FALLS' : 'flat';
    console.log(`    coherent band ${k}: ${pts.map((p) => p.join('->')).join(' ')}  ${dir}`);
  }
  // hand: the S={seg} incoherent bands (avg over sz per x)
  const segBands = new Map<string, Map<number, number[]>>();
  for (const r of values) {
    const k = String(r.seg);
    if (!segBands.has(k)) segBands.set(k, new Map());
    const byX = segBands.get(k)!;
    const x = Number(r.x);
    if (!byX.has(x)) byX.set(x, []);
    byX.get(x)!.push(Number(r.y));
  }
  for (const [k, byX] of segBands) {
    const pts = [...byX.entries()].map(([x, ys]) => [x, ys.reduce((a, b) => a + b, 0) / ys.length] as [number, number]);
    const szSet = new Set(values.filter((r) => String(r.seg) === k).map((r) => r.sz));
    console.log(`    S={seg} band ${k}: ${pts.map((p) => `${p[0]}->${p[1].toFixed(1)}`).join(' ')}  distinctX=${pts.length} coherent=${szSet.size <= 1}`);
  }
};

// 2 distinct x, uneven sz composition → the seg-pooled band FALLS while every coherent band rises
const twoX: Row[] = [
  { x: 1, y: 10, seg: 'A', sz: 10 }, { x: 1, y: 100, seg: 'A', sz: 20 },
  { x: 2, y: 20, seg: 'A', sz: 10 },
  { x: 1, y: 30, seg: 'B', sz: 10 }, { x: 2, y: 90, seg: 'B', sz: 10 },
];
report('A6 case: 2-distinct-x INCOHERENT band opposing (must NARRATE)', twoX);

// the 3-distinct-x twin: same manufactured mechanism but the incoherent band clears >=3 distinct x
const threeX: Row[] = [
  { x: 1, y: 10, seg: 'A', sz: 10 }, { x: 1, y: 300, seg: 'A', sz: 20 },
  { x: 2, y: 20, seg: 'A', sz: 10 }, { x: 2, y: 200, seg: 'A', sz: 20 },
  { x: 3, y: 30, seg: 'A', sz: 10 },
  { x: 1, y: 30, seg: 'B', sz: 10 }, { x: 2, y: 60, seg: 'B', sz: 10 }, { x: 3, y: 90, seg: 'B', sz: 10 },
];
report('A6 twin: 3-distinct-x INCOHERENT band opposing (must SUPPRESS)', threeX);
