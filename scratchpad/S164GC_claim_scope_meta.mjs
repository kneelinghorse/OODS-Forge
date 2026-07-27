import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function mkspec(rows, enc, mark = 'MarkPoint', layout) {
  return {
    $schema: 'https://oods.dev/viz-spec/v1', id: 't', name: 't',
    data: { name: 'd', values: rows },
    marks: [{ trait: mark, encodings: enc }],
    encoding: enc,
    ...(layout ? { layout } : {}),
    a11y: { description: 'y over x' },
  };
}

// pearson helper for hand-verification
function pear(pts) {
  const n = pts.length; if (n < 2) return null;
  const mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pts) { num += (x - mx) * (y - my); dx += (x - mx) ** 2; dy += (y - my) ** 2; }
  const den = Math.sqrt(dx * dy); return den === 0 ? null : num / den;
}
const avgByX = (rows) => {
  const m = new Map();
  for (const r of rows) { if (!m.has(r.x)) m.set(r.x, []); m.get(r.x).push(r.y); }
  return [...m.entries()].map(([x, ys]) => [x, ys.reduce((s, v) => s + v, 0) / ys.length]);
};

// ============================================================
// PROBE 1: SHAPE as a QUANTITATIVE grouping axis (never in the fixtures).
// Two shape bands, each FALLS, between-band offset lifts pooled → Simpson.
// Same structure as defect-1 but on SHAPE instead of size.
// ============================================================
{
  const rows = [];
  const a = (x, y, sh) => rows.push({ x, y, sh });
  // band sh=1 falls
  a(1, 50, 1); a(2, 40, 1); a(3, 30, 1);
  // band sh=2 falls, but offset way up
  a(4, 250, 2); a(5, 240, 2); a(6, 230, 2);
  a(7, 450, 3); a(8, 440, 3); a(9, 430, 3);
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
    shape: { field: 'sh', trait: 'EncodingShape', type: 'quantitative' },
  };
  const spec = mkspec(rows, enc, 'MarkPoint');
  const b1 = pear([[1,50],[2,40],[3,30]]), b2 = pear([[4,250],[5,240],[6,230]]), b3 = pear([[7,450],[8,440],[9,430]]);
  console.log('=== PROBE 1: quantitative SHAPE Simpson (point mark) ===');
  console.log('drawn shape bands pearson: sh1=', b1.toFixed(3), 'sh2=', b2.toFixed(3), 'sh3=', b3.toFixed(3), '(all FALL)');
  console.log('pooled per-x avg pearson=', pear(avgByX(rows)).toFixed(3));
  console.log('corr=', analyzeVizSpec(spec).correlation, '|', generateNarrativeSummary(spec).summary.slice(0, 90));
}

// ============================================================
// PROBE 1b: SHAPE quantitative on a LINE mark (markSplitsByRetina true for line)
// ============================================================
{
  const rows = [];
  const a = (x, y, sh) => rows.push({ x, y, sh });
  a(1, 50, 1); a(2, 40, 1); a(3, 30, 1);
  a(4, 250, 2); a(5, 240, 2); a(6, 230, 2);
  a(7, 450, 3); a(8, 440, 3); a(9, 430, 3);
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
    shape: { field: 'sh', trait: 'EncodingShape', type: 'quantitative' },
  };
  const spec = mkspec(rows, enc, 'MarkLine');
  console.log('\n=== PROBE 1b: quantitative SHAPE Simpson (LINE mark) ===');
  console.log('corr=', analyzeVizSpec(spec).correlation);
}

// ============================================================
// PROBE 2: RAW (no aggregate) size Simpson — fixtures all use aggregate.
// Each size band falls, offset lifts pooled.
// ============================================================
{
  const rows = [];
  const a = (x, y, sz) => rows.push({ x, y, sz });
  a(1, 50, 10); a(2, 40, 10); a(3, 30, 10);
  a(4, 250, 20); a(5, 240, 20); a(6, 230, 20);
  a(7, 450, 30); a(8, 440, 30); a(9, 430, 30);
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative' }, // NO aggregate
    size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' },
  };
  const spec = mkspec(rows, enc, 'MarkPoint');
  const b1 = pear([[1,50],[2,40],[3,30]]);
  console.log('\n=== PROBE 2: RAW (no-aggregate) size Simpson ===');
  console.log('drawn size band sz10 pearson=', b1.toFixed(3), '(FALLS)');
  console.log('pooled raw pearson=', pear(rows.map(r => [r.x, r.y])).toFixed(3));
  console.log('corr=', analyzeVizSpec(spec).correlation);
}

// ============================================================
// PROBE 3: x2 / y2 — do positional-range endpoints create a separable
// opposing sub-series that pools? Build a bar with x2 as a hidden axis.
// ============================================================
{
  const rows = [];
  const a = (x, x2, y) => rows.push({ x, x2, y });
  // if x2 grouped, cells with x2=100 fall, x2=200 fall (offset) — but x2 is positional-range
  a(1, 100, 50); a(2, 100, 40); a(3, 100, 30);
  a(4, 200, 250); a(5, 200, 240); a(6, 200, 230);
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    x2: { field: 'x2', trait: 'EncodingX2', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
  };
  const spec = mkspec(rows, enc, 'MarkBar');
  console.log('\n=== PROBE 3: x2 positional-range as hidden grouping ===');
  console.log('measureChannel=', resolvePrimaryChannels(spec).measureChannel);
  console.log('corr=', analyzeVizSpec(spec).correlation);
}
