import { analyzeVizSpec, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function mkspec(rows, enc, mark = 'MarkPoint') {
  return { $schema: 'https://oods.dev/viz-spec/v1', id: 't', name: 't',
    data: { name: 'd', values: rows }, marks: [{ trait: mark, encodings: enc }], encoding: enc,
    a11y: { description: 'y over x' } };
}
function pear(pts) {
  const n = pts.length; if (n < 2) return null;
  const mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pts) { num += (x - mx) * (y - my); dx += (x - mx) ** 2; dy += (y - my) ** 2; }
  const den = Math.sqrt(dx * dy); return den === 0 ? null : num / den;
}
const avgByX = (rows, filt = () => true) => {
  const m = new Map();
  for (const r of rows.filter(filt)) { if (!m.has(r.x)) m.set(r.x, []); m.get(r.x).push(r.y); }
  return [...m.entries()].map(([x, ys]) => [x, ys.reduce((s, v) => s + v, 0) / ys.length]);
};

// PROBE 4: QUANTITATIVE COLOR RAMP only (no categorical partition). memo §7 claims "a color ramp" closed.
{
  const rows = [];
  const a = (x, y, c) => rows.push({ x, y, c });
  a(1, 50, 10); a(2, 40, 10); a(3, 30, 10);
  a(4, 250, 20); a(5, 240, 20); a(6, 230, 20);
  a(7, 450, 30); a(8, 440, 30); a(9, 430, 30);
  const enc = { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
    color: { field: 'c', trait: 'EncodingColor', type: 'quantitative' } };
  console.log('=== PROBE 4: QUANT color-ramp-only Simpson ===');
  console.log('band c=10 pearson=', pear([[1,50],[2,40],[3,30]]).toFixed(3), '(FALLS); pooled=', pear(avgByX(rows)).toFixed(3));
  console.log('corr=', analyzeVizSpec(mkspec(rows, enc)).correlation);
}

// PROBE 5: categorical DETAIL as partition + quant size grouping.
{
  const rows = [];
  const a = (x, y, det, sz) => rows.push({ x, y, det, sz });
  // detail 'P' : two size bands each fall
  a(1, 50, 'P', 10); a(2, 40, 'P', 10); a(3, 30, 'P', 10);
  a(4, 250, 'P', 20); a(5, 240, 'P', 20); a(6, 230, 'P', 20);
  a(1, 1050, 'Q', 10); a(2, 1040, 'Q', 10); a(3, 1030, 'Q', 10);
  a(4, 1250, 'Q', 20); a(5, 1240, 'Q', 20); a(6, 1230, 'Q', 20);
  const enc = { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
    detail: { field: 'det', trait: 'EncodingDetail' }, // categorical (no type)
    size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' } };
  console.log('\n=== PROBE 5: categorical detail partition + quant size ===');
  console.log('band (P,10) pearson=', pear([[1,50],[2,40],[3,30]]).toFixed(3), '(FALLS)');
  console.log('corr=', analyzeVizSpec(mkspec(rows, enc)).correlation);
}

// PROBE 6: DISCLOSED gray-zone reproduction — n>=3 opposing band with |r| in [0.3,0.5).
// This SHOULD narrate (residual-1). Confirm it narrates over a real (weak) opposite.
{
  const rows = [];
  const a = (x, y, sz) => rows.push({ x, y, sz });
  // band sz10 rises steeply, shares pooled
  a(1, 10, 10); a(2, 20, 10); a(3, 30, 10); a(4, 40, 10); a(5, 50, 10);
  // band sz20 offset up, weakly FALLS (|r|~0.3-0.5)
  a(1, 155, 20); a(2, 149, 20); a(3, 154, 20); a(4, 150, 20); a(5, 152, 20);
  const enc = { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
    size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' } };
  const b2 = pear([[1,155],[2,149],[3,154],[4,150],[5,152]]);
  console.log('\n=== PROBE 6: DISCLOSED gray-zone (n>=3 opposing |r|<rho) ===');
  console.log('band sz20 pearson=', b2.toFixed(3), '(weakly falls, |r|<0.5); pooled=', pear(avgByX(rows)).toFixed(3));
  console.log('corr=', analyzeVizSpec(mkspec(rows, enc)).correlation, '(narrates = residual-1 disclosed)');
}

// PROBE 7: a STRONGER gray-zone push — opposing band |r| just below 0.5 with a CLEAR monotone-ish fall.
// Is the "bounded [0,rho)" claim honest, or can a VISUALLY clear fall sit just under rho?
{
  const rows = [];
  const a = (x, y, sz) => rows.push({ x, y, sz });
  a(1, 10, 10); a(2, 20, 10); a(3, 30, 10); a(4, 40, 10); a(5, 50, 10);
  // sz20: monotone fall but with one big jump so |r|~0.45
  a(1, 200, 20); a(2, 160, 20); a(3, 195, 20); a(4, 150, 20); a(5, 148, 20);
  const enc = { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
    size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' } };
  const b2 = pear([[1,200],[2,160],[3,195],[4,150],[5,148]]);
  console.log('\n=== PROBE 7: gray-zone with a clearer visual fall ===');
  console.log('band sz20 pearson=', b2.toFixed(3), '; corr=', analyzeVizSpec(mkspec(rows, enc)).correlation);
}
