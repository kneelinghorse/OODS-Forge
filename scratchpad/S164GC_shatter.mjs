import { analyzeVizSpec, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function mk(rows, encExtra = {}, mark = 'MarkPoint', yAgg = 'average') {
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative', ...(yAgg ? { aggregate: yAgg } : {}) },
    ...encExtra,
  };
  return { $schema: 'https://oods.dev/viz-spec/v1', id: 't', name: 't', data: { name: 'd', values: rows }, marks: [{ trait: mark, encodings: enc }], encoding: enc, a11y: { description: 'y over x' } };
}
function pear(xs, ys) { const n = xs.length; if (n < 2) return null; const mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n; let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; } return sxx === 0 || syy === 0 ? null : sxy / Math.sqrt(sxx * syy); }
function show(label, spec) {
  const a = analyzeVizSpec(spec);
  const nar = generateNarrativeSummary(spec);
  console.log('\n=== ' + label + ' ===');

  console.log('  corr=', a.correlation, '| summary:', nar.summary);
  console.log('  findings-corr:', (nar.findings || []).filter(f => /orrelation|relationship/.test(f)).join(' ; ') || '(none in findings)');
}

// Confirm mechanism via s164 CONTROL: genuine s163-style — color=seg categorical (NOT collinear, spans x), size quant.
// This is the class s164 claims to have closed. Expect SUPPRESS.
{
  const r = [];
  // color seg A and B each span x=1..3; size sz1 falls, sz2 rises WITHIN each color -> size Simpson inside active color partition
  for (const seg of ['A', 'B']) for (let x = 1; x <= 3; x++) {
    r.push({ x, y: 12 - 2 * x + (seg === 'B' ? 1 : 0), seg, sz: 1 });   // sz1 falls
    r.push({ x, y: 20 + 8 * x + (seg === 'B' ? 1 : 0), seg, sz: 2 });   // sz2 rises
  }
  show('CONTROL s163-style: color=seg(cat, spans x) + size(quant); sz1 falls sz2 rises within each color', mk(r, { color: { field: 'seg', trait: 'EncodingColor' }, size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' } }, 'MarkPoint', 'average'));
  console.log('  hand sz1(x1-3)=', pear([1, 2, 3], [10, 8, 6]).toFixed(3), 'sz2=', pear([1, 2, 3], [28, 36, 44]).toFixed(3));
}

// VARIANT E' : categorical partition COLLINEAR with x shatters size grouping. color=seg unique per x.
{
  const r = [
    { x: 1, y: 10, seg: 'p', sz: 1 }, { x: 2, y: 8, seg: 'q', sz: 1 }, { x: 3, y: 6, seg: 'r', sz: 1 },   // sz1 falls
    { x: 1, y: 20, seg: 'p', sz: 2 }, { x: 2, y: 30, seg: 'q', sz: 2 }, { x: 3, y: 40, seg: 'r', sz: 2 },  // sz2 rises
  ];
  show("E' color=seg COLLINEAR with x (p@1,q@2,r@3) + size quant; sz1 falls |r|=-1", mk(r, { color: { field: 'seg', trait: 'EncodingColor' }, size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' } }, 'MarkPoint', 'average'));
  console.log('  hand sz1=', pear([1, 2, 3], [10, 8, 6]).toFixed(3), 'sz2=', pear([1, 2, 3], [20, 30, 40]).toFixed(3), 'pooled6=', pear([1, 2, 3, 1, 2, 3], [10, 8, 6, 20, 30, 40]).toFixed(3));
}

// VARIANT E'' : NON-collinear attempt — color has 2 values, size series shattered via DISJOINT x (n=2 per size).
// sz1 at x=1(color P), x=4(color Q); sz1 falls n=2. color P also has sz2 at x=1; color Q sz2 at x=4.
{
  const r = [
    { x: 1, y: 100, seg: 'P', sz: 1 }, { x: 4, y: 10, seg: 'Q', sz: 1 },   // sz1 FALLS (n=2, disjoint across color)
    { x: 1, y: 5, seg: 'P', sz: 2 }, { x: 2, y: 40, seg: 'P', sz: 2 }, { x: 3, y: 60, seg: 'Q', sz: 2 }, { x: 4, y: 90, seg: 'Q', sz: 2 }, // sz2 rises
  ];
  show("E'' 2-color disjoint-x shatter: sz1 falls x1->x4 (n=2) split across colors P/Q", mk(r, { color: { field: 'seg', trait: 'EncodingColor' }, size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' } }, 'MarkPoint', 'average'));
  console.log('  hand sz1(n=2)=', pear([1, 4], [100, 10]).toFixed(3), 'slope-sign=neg');
}
