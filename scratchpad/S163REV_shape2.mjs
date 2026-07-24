// s163 genuine-close review — lens SHAPE, round 2. Ordinal/numeric-coded shape + line mark + within-seg shape Simpson.
import {
  analyzeVizSpec,
  generateNarrativeSummary,
  resolvePrimaryChannels,
} from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs) {
  const n = pairs.length;
  if (n < 2) return null;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n, my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pairs) { num += (x - mx) * (y - my); dx += (x - mx) ** 2; dy += (y - my) ** 2; }
  const den = Math.sqrt(dx * dy);
  return den === 0 ? null : num / den;
}
const f = (v) => (v == null ? 'null' : v.toFixed(4));

function run(label, spec, cellsBySeg) {
  console.log('\n============================================================');
  console.log(label);
  console.log('============================================================');
  const a = analyzeVizSpec(spec);
  const { summary, keyFindings } = generateNarrativeSummary(spec);
  console.log('SUT analysis.correlation:', a.correlation);
  const corrFinding = keyFindings.find((k) => /correl/i.test(JSON.stringify(k)));
  console.log('SUT correlation keyFinding:', corrFinding ? JSON.stringify(corrFinding) : '(none)');
  let all = [];
  for (const [seg, cells] of Object.entries(cellsBySeg)) {
    console.log(`  drawn-cell pearson [${seg}]:`, f(pearson(cells)), ` (n=${cells.length})`);
    all = all.concat(cells);
  }
  console.log('  POOLED over drawn cells:', f(pearson(all)));
}

const mk = (id, enc, rows, mark = 'MarkPoint') => ({ $schema: 'https://oods.dev/viz-spec/v1', id, name: id, data: { name: 'd', values: rows }, marks: [{ trait: mark, encodings: enc }], encoding: enc, a11y: { description: 'y over x' } });

// CASE F — shape ORDINAL, numeric-coded, as ONLY carrier. bindingIsQuantitative(ordinal)=false -> partition.
// Cross-shape Simpson; expect caught (undefined) like categorical.
{
  const rows = [];
  const push = (x, y, s) => rows.push({ x, y, sh: s });
  push(4, 10, 1); push(5, 20, 1); push(6, 30, 1);      // shape-code 1 rises
  push(1, 200, 2); push(2, 210, 2); push(3, 220, 2);   // shape-code 2 rises; pooled falls
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
    shape: { field: 'sh', trait: 'EncodingShape', type: 'ordinal' },
  };
  run('CASE F: shape ORDINAL numeric-coded, cross-shape Simpson — EXPECT undefined (ordinal=categorical partition)',
    mk('shF', enc, rows), { c1: rows.filter(r => r.sh === 1).map(r => [r.x, r.y]), c2: rows.filter(r => r.sh === 2).map(r => [r.x, r.y]) });
}

// CASE G — shape with NO type stamp but numeric values, as ONLY carrier. bindingIsQuantitative=false -> partition.
{
  const rows = [];
  const push = (x, y, s) => rows.push({ x, y, sh: s });
  push(4, 10, 1); push(5, 20, 1); push(6, 30, 1);
  push(1, 200, 2); push(2, 210, 2); push(3, 220, 2);
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
    shape: { field: 'sh', trait: 'EncodingShape' }, // NO type
  };
  run('CASE G: shape NO-type numeric-coded, cross-shape Simpson — EXPECT undefined (untyped=categorical partition)',
    mk('shG', enc, rows), { c1: rows.filter(r => r.sh === 1).map(r => [r.x, r.y]), c2: rows.filter(r => r.sh === 2).map(r => [r.x, r.y]) });
}

// CASE H — LINE mark, shape=sh QUANTITATIVE carrier + color=seg categorical, y avg. Verify fineness fix on line.
{
  const rows = [];
  const push = (x, y, g, k) => { for (let i = 0; i < k; i++) rows.push({ x, y, seg: g, sh: (g === 'A' ? 0 : 1000) + x * 1000 + i }); };
  push(1, 0, 'A', 1); push(2, 100, 'A', 1); push(3, 10, 'A', 100);
  push(4, 200, 'B', 1); push(5, 300, 'B', 1); push(6, 210, 'B', 100);
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
    color: { field: 'seg', trait: 'EncodingColor' },
    shape: { field: 'sh', trait: 'EncodingShape', type: 'quantitative' },
  };
  run('CASE H: LINE mark + color partition + shape QUANT carrier, y avg — EXPECT undefined (fineness fix on line)',
    mk('shH', enc, rows, 'MarkLine'), { A: rows.filter(r => r.seg === 'A').map(r => [r.x, r.y]), B: rows.filter(r => r.seg === 'B').map(r => [r.x, r.y]) });
}

// CASE I — WITHIN-seg shape Simpson: color=seg categorical, shape=sh quant, y avg. Per-x MEAN rises within each
// seg, but the shape-keyed DRAWN cells FALL. This is the exact size-survivor mechanism carried on shape.
// If s163 collapses shape it would narrate positive; expect undefined (fineness fix).
{
  const rows = [];
  // seg A: at each x two shape cells; the (x,shape) drawn cells fall while per-x mean rises
  const push = (x, y, g, sh) => rows.push({ x, y, seg: g, sh });
  // seg A
  push(1, 5, 'A', 10); push(1, 15, 'A', 20);   // x1 mean 10
  push(2, 4, 'A', 10); push(2, 26, 'A', 20);   // x2 mean 15  (per-x mean rises)
  push(3, 2, 'A', 10); push(3, 38, 'A', 20);   // x3 mean 20
  // but shape-10 cells: (1,5)(2,4)(3,2) FALL; shape-20 cells: (1,15)(2,26)(3,38) RISE ... mixed -> let me make BOTH fall
  // redo seg A so both shape series fall: shape10 (1,30)(2,20)(3,10); shape20 (1,32)(2,22)(3,12); per-x means 31,21,11 FALL too — not a simpson.
  run('CASE I placeholder (superseded below)', mk('shI0', { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' } }, rows), {});
}

// CASE I (real) — the size-survivor mechanism on shape, minimal + clean.
// Within seg A: per-x means RISE, but each shape's drawn cells FALL. Same for seg B.
{
  const rows = [];
  const push = (x, y, g, sh) => rows.push({ x, y, seg: g, sh });
  // Use the EXACT size-fixture shape of data but on the shape channel with 2 shape buckets whose cells fall.
  // shape 'lo': (1,0)(2,-? ) ... simplest: replicate the template's structure with counts via distinct sh per row.
  // seg A rows: (1,0)x1 (2,100)x1 (3,10)x100 but split by shape bucket so drawn cells (x,shape-bucket avg) fall.
  // Simpler: 2 shape buckets, each bucket's (x,y) cells fall; between-bucket offset makes per-x mean rise.
  push(1, 100, 'A', 'lo'); push(2, 60, 'A', 'lo'); push(3, 20, 'A', 'lo');   // lo falls 100->20
  push(1, 110, 'A', 'hi'); push(2, 160, 'A', 'hi'); push(3, 210, 'A', 'hi'); // hi RISES -> not both fall
  run('CASE I note: constructing a clean both-fall within-seg shape Simpson is what CASE A already is (distinct sh per row). CASE A stands as the canonical size-analog.',
    mk('shI', { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' } }, rows), {});
}
