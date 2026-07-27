// ===========================================================================================
// S165 PRE-LOCK CRITIC — LENS: next-survivor-channel-sweep
// Reference impl of BOTH gates validated against dist in S165CRIT_selfcheck.mjs (14/14 OK).
// ===========================================================================================
import { analyzeVizSpec, toVegaLiteSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
import { refCorrelation, separableFields, resolvePrimaryBindings, pearson } from './S165CRIT_ref.mjs';

const P = (pairs) => { const n = pairs.length; if (n < 2) return null; const mx = pairs.reduce((s, p) => s + p[0], 0) / n, my = pairs.reduce((s, p) => s + p[1], 0) / n; let nu = 0, dx = 0, dy = 0; for (const [x, y] of pairs) { nu += (x - mx) * (y - my); dx += (x - mx) ** 2; dy += (y - my) ** 2; } const d = Math.sqrt(dx * dy); return d === 0 ? null : nu / d; };
const mk = (marks, encoding, rows, layout) => ({ $schema: 'https://oods.dev/viz-spec/v1', id: 't', name: 't', data: { name: 'd', values: rows }, marks, encoding, layout, a11y: { description: 'y over x' } });
const X = { field: 'x', trait: 'EncodingX', type: 'quantitative' };
const Yq = { field: 'y', trait: 'EncodingY', type: 'quantitative' };
const Yavg = { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' };
const Ysum = { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'sum' };

function report(label, spec, opts = {}) {
  const dist = analyzeVizSpec(spec).correlation;
  const r164 = refCorrelation(spec, 's164');
  const r165 = refCorrelation(spec, 's165');
  const b = resolvePrimaryBindings(spec);
  const sep = b.dimensionField && b.measureField ? separableFields(spec, b.dimensionField, b.measureField) : [];
  console.log(`\n--- ${label}`);
  console.log(`    dist(s164)=${dist}   ref164=${r164.correlation}   PROPOSED s165=${r165.correlation}`);
  console.log(`    dim=${b.dimensionField} meas=${b.measureField} | partition=${JSON.stringify(r164.partitionFields)} grouping=${JSON.stringify(r164.groupingFields)} | separableFields=${JSON.stringify(sep)}`);
  if (opts.bands) for (const [n, pr] of Object.entries(opts.bands)) console.log(`    drawn band ${n}: pearson=${P(pr)?.toFixed(3)}`);
  if (r165.g1) console.log(`    G1' votes=${JSON.stringify(r165.g1.votes)} anyVotable=${r165.g1.anyVotable} sharesPooled=${r165.g1.sharesPooled} suppresses=${r165.g1.suppresses}`);
  return { dist, r164: r164.correlation, r165: r165.correlation };
}

console.log('###############################################################');
console.log('# PART 0 — does the PROPOSAL kill the 3 confirmed survivors?   #');
console.log('###############################################################');
// A (real fixture from S164GC_MAINLOOP_verify.mjs)
const aRows = [{ x: 1, y: 30, shp: 'circle' }, { x: 2, y: 20, shp: 'circle' }, { x: 3, y: 10, shp: 'circle' }, { x: 4, y: 130, shp: 'square' }, { x: 5, y: 120, shp: 'square' }, { x: 6, y: 110, shp: 'square' }];
const aEnc = { x: X, y: Yq, shape: { field: 'shp', trait: 'EncodingShape' } };
report('A shape × mixed [line,point]', mk([{ trait: 'MarkLine', encodings: aEnc }, { trait: 'MarkPoint', encodings: aEnc }], aEnc, aRows), { bands: { circle: [[1, 30], [2, 20], [3, 10]], square: [[4, 130], [5, 120], [6, 110]] } });
// B
const bRows = [{ x: 1, y: 50, c: 100 }, { x: 2, y: 40, c: 100 }, { x: 3, y: 30, c: 100 }, { x: 1, y: 10, c: 200 }, { x: 2, y: 60, c: 200 }, { x: 3, y: 110, c: 200 }];
const bEnc = { x: X, y: Ysum, color: { field: 'c', trait: 'EncodingColor', type: 'quantitative' } };
report('B quant color ramp × sum-stacked bar', mk([{ trait: 'MarkBar', encodings: bEnc }], bEnc, bRows));
// C
const cRows = [{ x: 1, y: 10, seg: 'p', sz: 1 }, { x: 2, y: 8, seg: 'q', sz: 1 }, { x: 3, y: 6, seg: 'r', sz: 1 }, { x: 1, y: 20, seg: 'p', sz: 2 }, { x: 2, y: 30, seg: 'q', sz: 2 }, { x: 3, y: 40, seg: 'r', sz: 2 }];
const cEnc = { x: X, y: Yavg, color: { field: 'seg', trait: 'EncodingColor' }, size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' } };
report('C collinear categorical + size Simpson', mk([{ trait: 'MarkPoint', encodings: cEnc }], cEnc, cRows));

console.log('\n\n###############################################################');
console.log('# PART 1 — LAYERED specs: marks[1] encodings are INVISIBLE     #');
console.log('###############################################################');
// resolveBinding(spec,ch) returns the TOP-LEVEL binding, else the FIRST mark that carries `ch`.
// A layered spec whose layers bind the SAME channel to DIFFERENT fields therefore exposes only
// layer 0's field to EVERY derivation, including the proposed separableFields.
// The Vega-Lite adapter (vega-lite-adapter.ts:131 `spec.marks.map(createLayer)`) compiles EVERY
// layer with its OWN merged encodings, so layer 1's color IS a real compiled split channel.
const l1Rows = [
  { x: 1, y: 50, a: 'only', b: 'p' }, { x: 2, y: 40, a: 'only', b: 'p' }, { x: 3, y: 30, a: 'only', b: 'p' },   // b=p FALLS
  { x: 4, y: 230, a: 'only', b: 'q' }, { x: 5, y: 220, a: 'only', b: 'q' }, { x: 6, y: 210, a: 'only', b: 'q' }, // b=q FALLS
];
const l1 = mk([
  { trait: 'MarkLine', encodings: { x: X, y: Yq, color: { field: 'a', trait: 'EncodingColor' } } },
  { trait: 'MarkLine', encodings: { x: X, y: Yq, color: { field: 'b', trait: 'EncodingColor' } } },
], undefined, l1Rows);
const r1 = report('P1 two line layers, layer0 color=a (constant), layer1 color=b (SIMPSON)', l1, { bands: { 'b=p': [[1, 50], [2, 40], [3, 30]], 'b=q': [[4, 230], [5, 220], [6, 210]] } });
{
  const vl = toVegaLiteSpec(l1);
  console.log('    COMPILED layers color fields:', JSON.stringify(vl.layer?.map((L) => L.encoding?.color?.field)));
}

// Same, but the invisible layer binds DETAIL (a pure splitter) instead of color
const l2 = mk([
  { trait: 'MarkLine', encodings: { x: X, y: Yq, detail: { field: 'a', trait: 'EncodingDetail' } } },
  { trait: 'MarkLine', encodings: { x: X, y: Yq, detail: { field: 'b', trait: 'EncodingDetail' } } },
], undefined, l1Rows);
const r2 = report('P2 two line layers, layer0 detail=a (constant), layer1 detail=b (SIMPSON)', l2);

// Same channel, different fields, where layer0 field genuinely varies (so it is NOT a degenerate constant)
const l3Rows = [
  { x: 1, y: 50, a: 'k1', b: 'p' }, { x: 2, y: 40, a: 'k2', b: 'p' }, { x: 3, y: 30, a: 'k1', b: 'p' },
  { x: 4, y: 230, a: 'k2', b: 'q' }, { x: 5, y: 220, a: 'k1', b: 'q' }, { x: 6, y: 210, a: 'k2', b: 'q' },
];
const l3 = mk([
  { trait: 'MarkLine', encodings: { x: X, y: Yq, color: { field: 'a', trait: 'EncodingColor' } } },
  { trait: 'MarkPoint', encodings: { x: X, y: Yq, color: { field: 'b', trait: 'EncodingColor' } } },
], undefined, l3Rows);
const r3 = report('P3 line(color=a interleaved) + point(color=b SIMPSON)', l3);

console.log('\n\n###############################################################');
console.log('# PART 2 — LAYERED specs: a SECOND MEASURE on layer 1          #');
console.log('###############################################################');
// resolveBinding("y") returns layer 0"s y. Layer 1 draws a DIFFERENT measure over the SAME x.
// Both are drawn, visually separable series; the narrated r describes only layer 0.
const mRows = [{ x: 1, v1: 1, v2: 90 }, { x: 2, v1: 5, v2: 60 }, { x: 3, v1: 9, v2: 30 }];
const m1 = mk([
  { trait: 'MarkLine', encodings: { x: X, y: { field: 'v1', trait: 'EncodingY', type: 'quantitative' } } },
  { trait: 'MarkLine', encodings: { x: X, y: { field: 'v2', trait: 'EncodingY', type: 'quantitative' } } },
], undefined, mRows);
const r4 = report('P4 dual-measure layers: v1 RISES (narrated), v2 FALLS (drawn, unseen)', m1, { bands: { v1: [[1, 1], [2, 5], [3, 9]], v2: [[1, 90], [2, 60], [3, 30]] } });
console.log('    COMPILED layer y fields:', JSON.stringify(toVegaLiteSpec(m1).layer?.map((L) => L.encoding?.y?.field)));

console.log('\n\n###############################################################');
console.log('# PART 3 — MONOTONICITY: is "can only ADD suppression" TRUE?   #');
console.log('###############################################################');
// §3.2 claims the unprefixed superset scan is "monotone: can only add suppression".
// Clause (c) of the s164 decision is NEGATIVE evidence: suppress when pooledSign!==0 AND NO
// admitted band shares the pooled sign. ADDING bands can SATISFY it -> UN-suppress.
// Hunt for a case: ref164 = undefined (suppressed by G1 only, G0 narrates) AND ref165 = defined.
function randRows(rng, cfg) {
  const rows = [];
  for (let i = 0; i < cfg.n; i++) {
    rows.push({
      x: 1 + (i % cfg.xs),
      y: Math.round(rng() * 100),
      seg: 'S' + (i % cfg.segs),
      sz: 1 + (i % cfg.szs),
      det: 'D' + (i % cfg.dets),
    });
  }
  return rows;
}
let seed = 1234567;
const rng = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const channelSets = [
  { color: { field: 'seg', trait: 'EncodingColor' } },
  { size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' } },
  { color: { field: 'seg', trait: 'EncodingColor' }, size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' } },
  { color: { field: 'seg', trait: 'EncodingColor' }, detail: { field: 'det', trait: 'EncodingDetail' } },
  { color: { field: 'seg', trait: 'EncodingColor', type: 'quantitative' }, size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' } },
  { detail: { field: 'det', trait: 'EncodingDetail' }, size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' } },
];
const yVariants = [Yq, Yavg, Ysum];
const markVariants = [['MarkPoint'], ['MarkLine'], ['MarkBar'], ['MarkLine', 'MarkPoint']];
const regressions = [];
const stillNarrate = [];
let tried = 0;
for (let trial = 0; trial < 6000; trial++) {
  const cfg = { n: 6 + Math.floor(rng() * 7), xs: 2 + Math.floor(rng() * 3), segs: 2 + Math.floor(rng() * 2), szs: 2, dets: 2 };
  const rows = randRows(rng, cfg);
  const cs = channelSets[Math.floor(rng() * channelSets.length)];
  const yv = yVariants[Math.floor(rng() * yVariants.length)];
  const mv = markVariants[Math.floor(rng() * markVariants.length)];
  const enc = { x: X, y: yv, ...cs };
  const spec = mk(mv.map((t) => ({ trait: t, encodings: enc })), enc, rows);
  let a, b;
  try { a = refCorrelation(spec, 's164'); b = refCorrelation(spec, 's165'); } catch (e) { continue; }
  tried++;
  if (a.correlation === undefined && b.correlation !== undefined) {
    regressions.push({ spec, a, b });
  }
}
console.log(`\n  scanned ${tried} random specs.`);
console.log(`  MONOTONICITY VIOLATIONS (s164 SUPPRESSES, proposed s165 NARRATES): ${regressions.length}`);
if (regressions.length) {
  const seen = new Set();
  let shown = 0;
  for (const R of regressions) {
    const sig = JSON.stringify(Object.keys(R.spec.encoding));
    if (seen.has(sig) && shown >= 3) continue;
    seen.add(sig);
    if (shown >= 4) break;
    shown++;
    const dist = analyzeVizSpec(R.spec).correlation;
    console.log(`\n  >>> VIOLATION #${shown}`);
    console.log(`      rows: ${JSON.stringify(R.spec.data.values)}`);
    console.log(`      marks: ${JSON.stringify(R.spec.marks.map((m) => m.trait))}  encoding channels: ${JSON.stringify(Object.keys(R.spec.encoding))}  y.aggregate=${R.spec.encoding.y.aggregate}`);
    console.log(`      dist(shipped s164) = ${dist}   ref164 = ${R.a.correlation}  (G0 narrates=${R.a.g0}, G1 suppresses=${R.a.g1?.suppresses})`);
    console.log(`      PROPOSED s165      = ${R.b.correlation}   G1' votes=${JSON.stringify(R.b.g1.votes)} anyVotable=${R.b.g1.anyVotable} sharesPooled=${R.b.g1.sharesPooled}`);
    console.log(`      s164 G1: votes=${JSON.stringify(R.a.g1?.votes)} sharesPooled=${R.a.g1?.sharesPooled} pooledSign=${R.a.g1?.pooledSign}`);
    console.log(`      separableFields=${JSON.stringify(separableFields(R.spec, 'x', 'y'))}`);
  }
}

console.log('\n\n###############################################################');
console.log('# PART 4 — remaining channel/layout axes                       #');
console.log('###############################################################');
// x2/y2 (positional-range) — never separable in either design
const rrRows = [{ x: 1, y: 10, x2: 1.4 }, { x: 2, y: 20, x2: 2.4 }, { x: 3, y: 30, x2: 3.4 }];
report('P5 x2 band endpoint (role positional-range)', mk([{ trait: 'MarkBar', encodings: { x: X, y: Yq, x2: { field: 'x2', trait: 'EncodingX2', type: 'quantitative' } } }], { x: X, y: Yq, x2: { field: 'x2', trait: 'EncodingX2', type: 'quantitative' } }, rrRows));

// LayoutConcat panels — facetFields() returns [] for LayoutConcat
const ccRows = [{ x: 1, y: 50, panel: 'A' }, { x: 2, y: 40, panel: 'A' }, { x: 3, y: 30, panel: 'A' }, { x: 4, y: 230, panel: 'B' }, { x: 5, y: 220, panel: 'B' }, { x: 6, y: 210, panel: 'B' }];
report('P6 LayoutConcat "panel" field bound to NOTHING (concat panels)', mk([{ trait: 'MarkLine', encodings: { x: X, y: Yq } }], { x: X, y: Yq }, ccRows, { trait: 'LayoutConcat' }));

// shape on a BAR-only spec (knownNormalizedMarks=['bar'] -> some(markSplitsByRetina)=false)
const shbRows = [{ x: 1, y: 30, shp: 'c' }, { x: 2, y: 20, shp: 'c' }, { x: 3, y: 10, shp: 'c' }, { x: 4, y: 130, shp: 's' }, { x: 5, y: 120, shp: 's' }, { x: 6, y: 110, shp: 's' }];
const shbEnc = { x: X, y: Yq, shape: { field: 'shp', trait: 'EncodingShape' } };
report('P7 shape on a BAR-only spec (proposal keeps it NON-separable)', mk([{ trait: 'MarkBar', encodings: shbEnc }], shbEnc, shbRows), { bands: { c: [[1, 30], [2, 20], [3, 10]], s: [[4, 130], [5, 120], [6, 110]] } });

// bar + rect layer: knownNormalizedMarks = ['bar'] (rect filtered), resolveMark='bar' NOT mixed
const shrEnc = { x: X, y: Yq, shape: { field: 'shp', trait: 'EncodingShape' } };
report('P8 shape on [MarkBar, MarkRect] (known=[bar], resolveMark=bar, NOT mixed)', mk([{ trait: 'MarkBar', encodings: shrEnc }, { trait: 'MarkRect', encodings: shrEnc }], shrEnc, shbRows));

// [MarkLine, MarkRule] -> known=['line'] -> some(splits)=true, resolveMark='line'
report('P9 shape on [MarkLine, MarkRule] (known=[line] -> separable)', mk([{ trait: 'MarkLine', encodings: shrEnc }, { trait: 'MarkRule', encodings: shrEnc }], shrEnc, shbRows));

// size/color bound to the MEASURE field name -> excluded by the "not the measure" rule
const dupRows = [{ x: 1, y: 50, g: 'p' }, { x: 2, y: 40, g: 'p' }, { x: 3, y: 30, g: 'p' }, { x: 4, y: 230, g: 'q' }, { x: 5, y: 220, g: 'q' }, { x: 6, y: 210, g: 'q' }];
report('P10 detail bound to the DIMENSION field (excluded, harmless)', mk([{ trait: 'MarkPoint', encodings: { x: X, y: Yq, detail: { field: 'x', trait: 'EncodingDetail' } } }], { x: X, y: Yq, detail: { field: 'x', trait: 'EncodingDetail' } }, dupRows));

// raw horizontal bar (measure channel SWAPS to x): does the swap drop a separable axis?
const hbRows = [{ cat: 1, val: 50, g: 'p' }, { cat: 2, val: 40, g: 'p' }, { cat: 3, val: 30, g: 'p' }, { cat: 4, val: 230, g: 'q' }, { cat: 5, val: 220, g: 'q' }, { cat: 6, val: 210, g: 'q' }];
const hbEnc = { x: { field: 'val', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'cat', trait: 'EncodingY' }, color: { field: 'g', trait: 'EncodingColor' } };
report('P11 RAW horizontal bar (measure=x, dim=y) + color Simpson', mk([{ trait: 'MarkBar', encodings: hbEnc }], hbEnc, hbRows));

// horizontal AGGREGATED bar
const habEnc = { x: { field: 'val', trait: 'EncodingX', type: 'quantitative', aggregate: 'sum' }, y: { field: 'cat', trait: 'EncodingY' }, color: { field: 'g', trait: 'EncodingColor', type: 'quantitative' } };
report('P12 horizontal AGGREGATED bar (measure=x) + QUANT color ramp', mk([{ trait: 'MarkBar', encodings: habEnc }], habEnc, hbRows.map((r) => ({ ...r, g: r.g === 'p' ? 1 : 2 }))));

console.log('\n\n###############################################################');
console.log('# SUMMARY                                                      #');
console.log('###############################################################');
const verdictRow = (n, r, expect) => console.log(`  ${n.padEnd(52)} dist=${String(r.dist).padEnd(9)} s165=${String(r.r165).padEnd(9)} ${r.r165 === undefined ? 'SUPPRESSED' : 'NARRATES'}  ${expect}`);
verdictRow('P1 layered color on marks[1]', r1, '<= expect SUPPRESSED (both b-bands fall)');
verdictRow('P2 layered detail on marks[1]', r2, '<= expect SUPPRESSED');
verdictRow('P3 layered mixed marks, color on marks[1]', r3, '<= expect SUPPRESSED');
verdictRow('P4 dual-measure layers', r4, '<= v2 falls, unseen');
console.log(`  MONOTONICITY violations found: ${regressions.length}`);
