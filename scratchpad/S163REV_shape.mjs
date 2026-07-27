// s163 genuine-close review — lens SHAPE. Independent reviewer reproduction.
// Hand-oracles computed here; SUT observed from the shared fresh dist @ HEAD ae6c0dc.
import {
  analyzeVizSpec,
  generateNarrativeSummary,
  resolvePrimaryChannels,
} from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs) {
  const n = pairs.length;
  if (n < 2) return null;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n,
    my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pairs) { num += (x - mx) * (y - my); dx += (x - mx) ** 2; dy += (y - my) ** 2; }
  const den = Math.sqrt(dx * dy);
  return den === 0 ? null : num / den;
}
const f = (v) => (v == null ? 'null' : v.toFixed(4));

function run(label, spec, drawnCellsBySeg) {
  console.log('\n============================================================');
  console.log(label);
  console.log('============================================================');
  const a = analyzeVizSpec(spec);
  const { summary, keyFindings } = generateNarrativeSummary(spec);
  console.log('resolvePrimaryChannels:', JSON.stringify(resolvePrimaryChannels(spec)));
  console.log('SUT analysis.correlation:', a.correlation);
  const corrFinding = keyFindings.find((k) => /correl/i.test(JSON.stringify(k)));
  console.log('SUT correlation keyFinding:', corrFinding ? JSON.stringify(corrFinding) : '(none)');
  console.log('SUT summary:', summary);
  // hand oracle over the DRAWN cells the value pools over
  let allPairs = [];
  for (const [seg, cells] of Object.entries(drawnCellsBySeg)) {
    console.log(`  drawn-cell pearson [${seg}]:`, f(pearson(cells)), ` (n=${cells.length})`);
    allPairs = allPairs.concat(cells);
  }
  console.log('  POOLED over all drawn cells:', f(pearson(allPairs)), ' <- should equal SUT correlation if narrated');
}

// ---------------------------------------------------------------------------
// CASE A — the size-survivor ANALOG carried on a QUANTITATIVE SHAPE.
// color=seg categorical (ACTIVE partition), shape=sh quantitative retinal (distinct per row),
// y aggregate:'average'. If s163 fineness fix works, shape is re-absorbed into groupingFields and
// the phantom is SUPPRESSED (undefined). If NOT, the classifier collapses shape -> narrates a lie.
// Data mirrors the size fixture: within each seg the size/shape-keyed drawn cells FALL, per-x means RISE.
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
  const spec = { $schema: 'https://oods.dev/viz-spec/v1', id: 'shA', name: 'shA', data: { name: 'd', values: rows }, marks: [{ trait: 'MarkPoint', encodings: enc }], encoding: enc, a11y: { description: 'y over x' } };
  // drawn cell = one per (x,seg,sh); each sh distinct => one per raw row => y is the row's y.
  const cellsA = rows.filter((r) => r.seg === 'A').map((r) => [r.x, r.y]);
  const cellsB = rows.filter((r) => r.seg === 'B').map((r) => [r.x, r.y]);
  run('CASE A: color=seg (categorical partition) + shape=sh (QUANTITATIVE carrier), y avg — EXPECT undefined (fineness fix re-absorbs shape)', spec, { A: cellsA, B: cellsB });
}

// ---------------------------------------------------------------------------
// CASE B — shape QUANTITATIVE as the ONLY non-dimension channel (no color/facet).
// partitionFields = empty (shape quantitative -> skipped) -> EARLY RETURN -> narrate pooled.
// This is the DISCLOSED all-quantitative-retinal boundary. Confirm it behaves as disclosed.
{
  const rows = [];
  const push = (x, y, k, base) => { for (let i = 0; i < k; i++) rows.push({ x, y, sh: base + x * 1000 + i }); };
  // one falling series drawn at distinct shapes, but per-x means rise (Simpson on shape axis)
  push(1, 0, 1, 0); push(2, 100, 1, 0); push(3, 10, 100, 0);
  push(4, 200, 1, 5000); push(5, 300, 1, 5000); push(6, 210, 100, 5000);
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
    shape: { field: 'sh', trait: 'EncodingShape', type: 'quantitative' },
  };
  const spec = { $schema: 'https://oods.dev/viz-spec/v1', id: 'shB', name: 'shB', data: { name: 'd', values: rows }, marks: [{ trait: 'MarkPoint', encodings: enc }], encoding: enc, a11y: { description: 'y over x' } };
  const cells = rows.map((r) => [r.x, r.y]);
  run('CASE B: shape=sh (QUANTITATIVE) ONLY carrier, no color — EXPECT narrate (DISCLOSED all-quant-retinal early-return)', spec, { all: cells });
}

// ---------------------------------------------------------------------------
// CASE C — shape CATEGORICAL as the ONLY carrier, a Simpson on the shape axis.
// partitionFields = {sh} -> gate ACTIVE -> per-shape classify -> should SUPPRESS the phantom.
{
  const rows = [];
  // shape 'circle': rises;  shape 'square': rises; but pooled across both FALLS (between-group Simpson)
  const push = (x, y, s, k) => { for (let i = 0; i < k; i++) rows.push({ x, y, sh: s }); };
  // circle at high x low-ish y, square at low x high y => pooled negative; within each shape rises
  push(4, 10, 'circle', 1); push(5, 20, 'circle', 1); push(6, 30, 'circle', 1);
  push(1, 200, 'square', 1); push(2, 210, 'square', 1); push(3, 220, 'square', 1);
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
    shape: { field: 'sh', trait: 'EncodingShape', type: 'nominal' },
  };
  const spec = { $schema: 'https://oods.dev/viz-spec/v1', id: 'shC', name: 'shC', data: { name: 'd', values: rows }, marks: [{ trait: 'MarkPoint', encodings: enc }], encoding: enc, a11y: { description: 'y over x' } };
  const cC = rows.filter((r) => r.sh === 'circle').map((r) => [r.x, r.y]);
  const cS = rows.filter((r) => r.sh === 'square').map((r) => [r.x, r.y]);
  run('CASE C: shape=sh (CATEGORICAL/nominal) ONLY, cross-shape Simpson — EXPECT undefined (gate active, per-shape suppress)', spec, { circle: cC, square: cS });
}

// ---------------------------------------------------------------------------
// CASE D — OVER-SUPPRESSION probe: color=seg categorical + shape=sh quantitative, y avg,
// data where the DRAWN (shape-keyed) cells HONESTLY RISE in BOTH segs and pooled RISES.
// If s163 narrates (defined, positive) -> honest. If it SUPPRESSES -> over-suppression survivor.
{
  const rows = [];
  const push = (x, y, g, sh, k) => { for (let i = 0; i < k; i++) rows.push({ x, y, seg: g, sh }); };
  // seg A: cells (1,10)(2,20)(3,30) rising, 2 distinct shapes per x with real y-spread
  push(1, 8, 'A', 100, 1); push(1, 12, 'A', 200, 1);
  push(2, 18, 'A', 100, 1); push(2, 22, 'A', 200, 1);
  push(3, 28, 'A', 100, 1); push(3, 32, 'A', 200, 1);
  // seg B: cells (1,50)(2,60)(3,70) rising
  push(1, 48, 'B', 100, 1); push(1, 52, 'B', 200, 1);
  push(2, 58, 'B', 100, 1); push(2, 62, 'B', 200, 1);
  push(3, 68, 'B', 100, 1); push(3, 72, 'B', 200, 1);
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
    color: { field: 'seg', trait: 'EncodingColor' },
    shape: { field: 'sh', trait: 'EncodingShape', type: 'quantitative' },
  };
  const spec = { $schema: 'https://oods.dev/viz-spec/v1', id: 'shD', name: 'shD', data: { name: 'd', values: rows }, marks: [{ trait: 'MarkPoint', encodings: enc }], encoding: enc, a11y: { description: 'y over x' } };
  const cellsA = rows.filter((r) => r.seg === 'A').map((r) => [r.x, r.y]);
  const cellsB = rows.filter((r) => r.seg === 'B').map((r) => [r.x, r.y]);
  run('CASE D: OVER-SUPPRESSION probe — honest rising cells in both segs, shape quant — EXPECT DEFINED positive (narrate)', spec, { A: cellsA, B: cellsB });
}

// ---------------------------------------------------------------------------
// CASE E — stacked AREA + categorical shape + y sum. Area splits by shape AND stacks.
// valueKey drops series under stacking; partition keeps shape -> classifier FINER (disclosed).
// Probe whether it reaches correlation + whether it over-suppresses an honest stack-total rise.
{
  const rows = [];
  const push = (x, y, s) => rows.push({ x, y, sh: s });
  // both shapes rise with x; stack total rises => honest positive
  push(1, 10, 'circle'); push(2, 20, 'circle'); push(3, 30, 'circle');
  push(1, 5, 'square'); push(2, 15, 'square'); push(3, 25, 'square');
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'sum' },
    shape: { field: 'sh', trait: 'EncodingShape', type: 'nominal' },
  };
  const spec = { $schema: 'https://oods.dev/viz-spec/v1', id: 'shE', name: 'shE', data: { name: 'd', values: rows }, marks: [{ trait: 'MarkArea', encodings: enc }], encoding: enc, a11y: { description: 'y over x' } };
  const cC = rows.filter((r) => r.sh === 'circle').map((r) => [r.x, r.y]);
  const cS = rows.filter((r) => r.sh === 'square').map((r) => [r.x, r.y]);
  run('CASE E: stacked AREA + shape nominal + y sum, both shapes rise — probe stacking-finer behavior', spec, { circle: cC, square: cS });
}
