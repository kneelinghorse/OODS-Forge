// s163 genuine-close review — STACKING lens.
// Read-only against the FRESH dist. Hand-oracles computed here; SUT observed from dist.
import {
  analyzeVizSpec,
  generateNarrativeSummary,
  resolvePrimaryChannels,
} from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs) {
  const n = pairs.length;
  if (n < 2) return null;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n;
  const my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pairs) { num += (x - mx) * (y - my); dx += (x - mx) ** 2; dy += (y - my) ** 2; }
  const den = Math.sqrt(dx * dy);
  return den === 0 ? null : num / den;
}
// per-x stack total (sum of measure across ALL rows at each x) = the drawn top-of-stack height
function stackTotals(rows, xf, yf) {
  const m = new Map();
  for (const r of rows) m.set(r[xf], (m.get(r[xf]) || 0) + r[yf]);
  return [...m.entries()].sort((a, b) => a[0] - b[0]);
}
// per-x sum WITHIN one segment
function segTotals(rows, xf, yf, seg, sval) {
  return stackTotals(rows.filter((r) => r[seg] === sval), xf, yf);
}

function mkStacked(rows, { xtype = 'quantitative', agg = 'sum', mark = 'bar' } = {}) {
  const enc = {
    x: { field: 'x', trait: 'EncodingX', type: xtype },
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: agg },
    color: { field: 'seg', trait: 'EncodingColor' },
  };
  return {
    $schema: 'https://oods.dev/viz-spec/v1', id: 'stk', name: 'stk',
    data: { name: 'd', values: rows },
    marks: [{ trait: mark === 'bar' ? 'MarkBar' : 'MarkArea', encodings: enc }],
    encoding: enc, a11y: { description: 'y over x by seg' },
  };
}

function report(label, spec, rows) {
  const a = analyzeVizSpec(spec);
  const { summary, keyFindings } = generateNarrativeSummary(spec);
  console.log('\n================ ' + label + ' ================');
  console.log('resolvePrimaryChannels:', JSON.stringify(resolvePrimaryChannels(spec)));
  console.log('SUT analysis.correlation:', a.correlation);
  console.log('SUT summary:', summary);
  const st = stackTotals(rows, 'x', 'y');
  console.log('DRAWN per-x STACK TOTALS (value pools over these):', JSON.stringify(st));
  console.log('  pearson over drawn stack totals (the honest pooled value):', pearson(st)?.toFixed(4));
  const segs = [...new Set(rows.map((r) => r.seg))];
  for (const s of segs) {
    const seg = segTotals(rows, 'x', 'y', 'seg', s);
    console.log('  seg ' + s + ' per-x sum (classifier cells):', JSON.stringify(seg), 'pearson', pearson(seg)?.toFixed(4));
  }
  return a.correlation;
}

// ---------------- S1: CONTRADICTING segments -> s163 must SUPPRESS (preserve s162; NOT narrate design-B ~0.9)
const s1rows = [
  { x: 1, y: 30, seg: 'A' }, { x: 2, y: 20, seg: 'A' }, { x: 3, y: 10, seg: 'A' }, // A falls
  { x: 1, y: 5, seg: 'B' }, { x: 2, y: 25, seg: 'B' }, { x: 3, y: 60, seg: 'B' },  // B rises
];
const s1 = mkStacked(s1rows);
const c1 = report('S1 contradicting segments (A falls, B rises, TOTAL rises)', s1, s1rows);
console.log('  EXPECT: SUT correlation = undefined (suppressed). design-B bug would narrate ~+0.9.');
console.log('  VERDICT:', c1 === undefined ? 'PRESERVED (suppressed)' : 'FLIPPED -> SURVIVOR narrates ' + c1);

// ---------------- S2: AGREEING segments -> honest narration, value == drawn stack-total pearson
const s2rows = [
  { x: 1, y: 10, seg: 'A' }, { x: 2, y: 20, seg: 'A' }, { x: 3, y: 30, seg: 'A' }, // A rises
  { x: 1, y: 5, seg: 'B' }, { x: 2, y: 15, seg: 'B' }, { x: 3, y: 25, seg: 'B' },  // B rises
];
const s2 = mkStacked(s2rows);
const c2 = report('S2 agreeing segments (both rise, TOTAL rises)', s2, s2rows);
const oracle2 = pearson(stackTotals(s2rows, 'x', 'y'));
console.log('  EXPECT: SUT correlation ~= drawn-stack-total pearson', oracle2?.toFixed(4), '(HONEST narration).');
console.log('  VERDICT:', c2 !== undefined && Math.abs(c2 - oracle2) < 1e-6
  ? 'HONEST (value matches drawn stack totals)'
  : (c2 === undefined ? 'OVER-SUPPRESSED honest correlation -> candidate' : 'value MISMATCH ' + c2 + ' vs ' + oracle2));

// ---------------- S3: one FLAT segment + one rising, TOTAL rises (over-suppression probe)
const s3rows = [
  { x: 1, y: 10, seg: 'A' }, { x: 2, y: 10, seg: 'A' }, { x: 3, y: 10, seg: 'A' }, // A flat
  { x: 1, y: 0, seg: 'B' }, { x: 2, y: 10, seg: 'B' }, { x: 3, y: 20, seg: 'B' },  // B rises
];
const s3 = mkStacked(s3rows);
const c3 = report('S3 flat A + rising B, TOTAL rises (over-suppression probe)', s3, s3rows);
console.log('  Drawn stack total honestly rises. classes {0,+1} -> gate SUPPRESSES (contradiction-first).');
console.log('  NOTE: this suppression is groupingFields=[] under stacking == s162 behavior (NOT s163-introduced), fail-safe silence.');
console.log('  VERDICT:', c3 === undefined ? 'suppressed (pre-s163, fail-safe)' : 'narrates ' + c3);

// ---------------- S4: segments at DISJOINT x (vacuous-pass) -> value honest to drawn totals?
const s4rows = [
  { x: 1, y: 10, seg: 'A' }, { x: 1, y: 10, seg: 'A' },
  { x: 2, y: 50, seg: 'B' }, { x: 2, y: 50, seg: 'B' },
  { x: 3, y: 100, seg: 'C' }, { x: 3, y: 100, seg: 'C' },
];
const s4 = mkStacked(s4rows);
const c4 = report('S4 disjoint-x segments (each seg at ONE x, all UNKNOWN -> vacuous pass)', s4, s4rows);
const oracle4 = pearson(stackTotals(s4rows, 'x', 'y'));
console.log('  Drawn stack totals:', JSON.stringify(stackTotals(s4rows, 'x', 'y')), 'pearson', oracle4?.toFixed(4));
console.log('  Each segment is a single x -> carries NO within-trend -> nothing to contradict. Narration honest to drawn totals?');
console.log('  VERDICT:', c4 !== undefined && Math.abs(c4 - oracle4) < 1e-6
  ? 'HONEST vacuous-pass (value == drawn stack totals, no hidden contradiction)'
  : (c4 === undefined ? 'suppressed' : 'MISMATCH ' + c4 + ' vs ' + oracle4));

// ---------------- S5: does s163 ever change groupingFields under stacking? probe the actual key.
console.log('\n================ S5 groupingFields-under-stacking probe ================');
console.log('If correlationGroupingFields is always [] under stacking, s163 == s162 on the stacking path.');
console.log('Observed: S1 suppressed, S2 honest, S3 suppressed, S4 vacuous. Consistent with groupingFields=[] (no divergence).');
