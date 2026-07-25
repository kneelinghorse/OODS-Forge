// S165 PRE-LOCK CRITIC — lens: over-suppression-corpus-damage
// Reference implementation of the DRAFT §3 proposal (separableFields + UNPREFIXED subset scan,
// s164 vote/guard verbatim) run against a corpus of HONEST charts + the shipped s164 keep-controls.
// Compares: CURRENT dist decision (G0 ∧ G1) vs PROPOSAL decision (G0 ∧ ¬G1').
import { analyzeVizSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

// ───────────────────────── verbatim s164 primitives ─────────────────────────
const RHO = 0.5;
const signOf = (r) => (r > 0 ? 1 : r < 0 ? -1 : 0);
function pearsonRounded(xs, ys) {
  const n = xs.length;
  if (n < 3) return null;
  const mx = xs.reduce((s, v) => s + v, 0) / n, my = ys.reduce((s, v) => s + v, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (ys[i] - my); dx += (xs[i] - mx) ** 2; dy += (ys[i] - my) ** 2; }
  const den = Math.sqrt(dx * dy);
  if (den === 0) return null;
  return Math.round((num / den) * 1000) / 1000;
}
function classifyDrawnSeriesDirection(xs, ys) {
  const n = xs.length;
  if (n < 2) return 'unknown';
  const meanX = xs.reduce((s, x) => s + x, 0) / n;
  let denomX = 0; for (const x of xs) denomX += (x - meanX) ** 2;
  if (denomX === 0) return 'unknown';
  if (n === 2) {
    const meanY = (ys[0] + ys[1]) / 2;
    let cov = 0; for (let i = 0; i < 2; i++) cov += (xs[i] - meanX) * (ys[i] - meanY);
    return signOf(cov);
  }
  const r = pearsonRounded(xs, ys);
  if (r === null) return 0;
  return Math.abs(r) >= RHO ? signOf(r) : 0;
}
const keyFor = (row, fields) => fields.map((f) => (row[f] === null || row[f] === undefined ? '\0null' : String(row[f]))).join('\0');
function reduceAggregate(values, agg) {
  if (agg === 'count') return values.length;
  const num = values.map(Number).filter((v) => Number.isFinite(v));
  if (num.length === 0) return undefined;
  if (agg === 'sum') return num.reduce((a, b) => a + b, 0);
  if (agg === 'average') return num.reduce((a, b) => a + b, 0) / num.length;
  if (agg === 'min') return Math.min(...num);
  if (agg === 'max') return Math.max(...num);
  return undefined;
}
function subsetsOf(items) {
  const out = [[]];
  for (const item of items) { const len = out.length; for (let i = 0; i < len; i++) out.push([...out[i], item]); }
  return out;
}
function drawnSubSeries(rows, dim, measure, keyFields, agg) {
  const bySub = new Map();
  const push = (sub, x, y) => { let s = bySub.get(sub); if (!s) { s = { xs: [], ys: [] }; bySub.set(sub, s); } s.xs.push(x); s.ys.push(y); };
  if (agg) {
    const cells = new Map();
    for (const row of rows) {
      const k = keyFor(row, [dim, ...keyFields]);
      let c = cells.get(k);
      if (!c) { c = { sub: keyFor(row, keyFields), dim: row[dim], values: [] }; cells.set(k, c); }
      c.values.push(row[measure]);
    }
    for (const c of cells.values()) {
      const red = reduceAggregate(c.values, agg);
      const x = Number(c.dim);
      if (red === undefined || !Number.isFinite(x)) continue;
      push(c.sub, x, red);
    }
  } else {
    for (const row of rows) {
      const x = Number(row[dim]), y = Number(row[measure]);
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      push(keyFor(row, keyFields), x, y);
    }
  }
  return [...bySub.values()];
}

// ───────────────── PROPOSAL §3.1 separableFields (fail-safe superset) ─────────────────
function separableFields(spec, dim, measure) {
  const enc = spec.encoding ?? {};
  const out = [];
  const add = (f) => { if (f && f !== dim && f !== measure && !out.includes(f)) out.push(f); };
  // facet fields
  if (spec.layout?.trait === 'LayoutFacet') { for (const f of [spec.layout.rows, spec.layout.columns]) if (f?.field) add(f.field); }
  // non-primary positional dimension axes (x/y that are neither the primary dim nor the measure)
  for (const ch of ['x', 'y']) add(enc[ch]?.field);
  // retinal: color (cat AND quant), size, detail — always. shape: relaxed mark gate.
  add(enc.color?.field);
  add(enc.size?.field);
  add(enc.detail?.field);
  const marks = (spec.marks ?? []).map((m) => ({ MarkPoint: 'point', MarkLine: 'line', MarkArea: 'area', MarkBar: 'bar' })[m.trait] ?? 'unknown');
  const known = marks.filter((m) => m !== 'unknown');
  const shapeSplits = known.length === 0 || known.some((m) => m === 'point' || m === 'line' || m === 'area');
  if (shapeSplits) add(enc.shape?.field);
  return out;
}

// ───────────────── PROPOSAL §3.2 — UNPREFIXED subset scan, s164 vote/guard verbatim ─────────────────
function g1PrimeSuppresses(rawRows, dim, measure, sepFields, agg, pooled) {
  const pooledSign = signOf(pooled);
  const votes = []; let anyVotable = false, sharesPooled = false;
  if (sepFields.length === 0) return { suppresses: false, votes, anyVotable, sharesPooled, detail: 'no-op (separableFields=[])' };
  const record = (dir) => {
    if (dir === 'unknown') return;
    anyVotable = true;
    if (dir !== 0) votes.push(dir);
    if (dir !== 0 && dir === pooledSign) sharesPooled = true;
  };
  const trace = [];
  let hasVotableFineBand = false, emptyVote = null;
  for (const subset of subsetsOf(sepFields)) {
    for (const series of drawnSubSeries(rawRows, dim, measure, subset, agg)) {
      if (new Set(series.xs).size < 2) continue;
      const dir = classifyDrawnSeriesDirection(series.xs, series.ys);
      if (dir === 'unknown') continue;
      if (subset.length === 0) { emptyVote = dir; continue; }
      hasVotableFineBand = true;
      record(dir);
      trace.push(`S={${subset.join(',')}} n=${series.xs.length} r=${series.xs.length >= 3 ? pearsonRounded(series.xs, series.ys) : 'n2'} dir=${dir}`);
    }
  }
  if (!hasVotableFineBand && emptyVote !== null) { record(emptyVote); trace.push(`S={} (guard-admitted) dir=${emptyVote}`); }
  let suppresses, why;
  if (!anyVotable) { suppresses = false; why = 'fallback narrate (nothing votable)'; }
  else if (new Set(votes).size > 1) { suppresses = true; why = '(a) votes span >1 sign'; }
  else if (votes.some((v) => v === -pooledSign)) { suppresses = true; why = '(b) a real opposite'; }
  else { suppresses = pooledSign !== 0 && !sharesPooled; why = suppresses ? '(c) NO admitted band shares pooledSign' : 'narrate'; }
  return { suppresses, votes, anyVotable, sharesPooled, why, trace };
}

// ───────────────── spec builder (mirrors the s164 proof-spec `chart()`) ─────────────────
const B = (field, trait, extra = {}) => ({ field, trait, ...extra });
function chart(rows, o = {}) {
  const enc = {
    x: B('x', 'EncodingX', { type: 'quantitative' }),
    y: B('y', 'EncodingY', { type: 'quantitative', ...(o.yAggregate ? { aggregate: o.yAggregate } : {}) }),
  };
  if (o.colorField) enc.color = B(o.colorField, 'EncodingColor', o.colorQuant ? { type: 'quantitative' } : {});
  if (o.sizeField) enc.size = B(o.sizeField, 'EncodingSize', { type: 'quantitative' });
  if (o.detailField) enc.detail = B(o.detailField, 'EncodingDetail', { type: 'quantitative' });
  if (o.shapeField) enc.shape = B(o.shapeField, 'EncodingShape');
  return {
    $schema: 'https://oods.dev/viz-spec/v1', id: 'c', name: 'c',
    data: { name: 'c', values: rows },
    marks: (o.marks ?? [o.mark ?? 'MarkPoint']).map((t) => ({ trait: t, encodings: { ...enc } })),
    encoding: enc,
    ...(o.facetColumnField ? { layout: { trait: 'LayoutFacet', columns: { field: o.facetColumnField } } } : {}),
    a11y: { description: 'y over x' },
  };
}

// ───────────────── CORPUS ─────────────────
const R = [];
const add = (name, kind, spec, note = '') => R.push({ name, kind, spec, note });

// ==== the SHIPPED s164 keep-controls (must STAY narrating) ====
const rowsAllRise = () => { const r = []; for (const seg of ['A', 'B']) for (const sz of [10, 20]) r.push({ x: 1, y: 1 + sz, seg, sz }, { x: 2, y: 2 + sz, seg, sz }, { x: 3, y: 3 + sz, seg, sz }); return r; };
const rowsCase3Flat = () => [
  { x: 1, y: 11, seg: 'A', sz: 10 }, { x: 2, y: 12, seg: 'A', sz: 10 }, { x: 3, y: 13, seg: 'A', sz: 10 },
  { x: 1, y: 21, seg: 'A', sz: 20 }, { x: 2, y: 22, seg: 'A', sz: 20 }, { x: 3, y: 23, seg: 'A', sz: 20 },
  { x: 1, y: 50, seg: 'B', sz: 10 }, { x: 2, y: 50, seg: 'B', sz: 10 }, { x: 3, y: 50, seg: 'B', sz: 10 },
  { x: 1, y: 71, seg: 'B', sz: 20 }, { x: 2, y: 72, seg: 'B', sz: 20 }, { x: 3, y: 73, seg: 'B', sz: 20 },
];
const rowsWeakScatter = () => [
  { x: 1, y: 10, seg: 'A', sz: 10 }, { x: 2, y: 20, seg: 'A', sz: 10 }, { x: 3, y: 30, seg: 'A', sz: 10 },
  { x: 1, y: 52, seg: 'A', sz: 20 }, { x: 2, y: 49, seg: 'A', sz: 20 }, { x: 3, y: 51, seg: 'A', sz: 20 },
];
const rowsContinuousRamp = () => { const r = []; for (const seg of ['A', 'B']) { const o = seg === 'A' ? 0 : 1;
  r.push({ x: 1, y: 100 + o, seg, sz: 9.001 + o * 0.0001 }, { x: 1, y: 90 + o, seg, sz: 8.001 + o * 0.0001 },
         { x: 2, y: 40 + o, seg, sz: 2.001 + o * 0.0001 }, { x: 2, y: 30 + o, seg, sz: 1.001 + o * 0.0001 }); } return r; };
const rowsHonestMultiAxis = () => { const r = []; for (const seg of ['A', 'B']) for (const sz of [10, 20]) for (const dt of [1, 2]) {
  const base = sz + dt * 5 + (seg === 'A' ? 0 : 3); r.push({ x: 1, y: base + 1, seg, sz, dt }, { x: 2, y: base + 5, seg, sz, dt }, { x: 3, y: base + 10, seg, sz, dt }); } return r; };
const rowsRhoScatter = () => { const r = []; [10, 20, 30, 40, 50].forEach((y, i) => r.push({ x: i + 1, y, sz: 10 }));
  [55, 49, 54, 50, 52].forEach((y, i) => r.push({ x: i + 1, y: y + 100, sz: 20 })); return r; };
const rowsWeakConsistentNoGrouping = () => { const r = []; const g = (seg, base) => r.push({ x: 1, y: base + 0, seg }, { x: 2, y: base + 3, seg }, { x: 3, y: base - 1, seg }, { x: 4, y: base + 4, seg }); g('R', 0); g('S', 100); g('T', 200); return r; };

add('KC1 s164 all-rise (size bands all rise)', 'shipped-keep', chart(rowsAllRise(), { colorField: 'seg', sizeField: 'sz', yAggregate: 'average' }));
add('KC2 s164 CASE3-FLAT', 'shipped-keep', chart(rowsCase3Flat(), { colorField: 'seg', sizeField: 'sz', yAggregate: 'average' }));
add('KC3 s164 weak-scatter (|r|<rho opposing band, gray-zone)', 'shipped-keep', chart(rowsWeakScatter(), { colorField: 'seg', sizeField: 'sz', yAggregate: 'average' }));
add('KC4 s164 continuous ramp', 'shipped-keep', chart(rowsContinuousRamp(), { colorField: 'seg', sizeField: 'sz', yAggregate: 'average' }));
add('KC5 s164 honest multi-axis (every fine band rises)', 'shipped-keep', chart(rowsHonestMultiAxis(), { colorField: 'seg', sizeField: 'sz', detailField: 'dt', yAggregate: 'average' }));
add('KC6 s164 rho-scatter |r|~0.3 narrates', 'shipped-keep', chart(rowsRhoScatter(), { sizeField: 'sz', yAggregate: 'average' }));
add('KC7 s164 BYTE-IDENTITY weak-consistent categorical-only (no quant retinal)', 'shipped-keep', chart(rowsWeakConsistentNoGrouping(), { colorField: 'seg' }));

// ==== ORDINARY HONEST CHARTS (the product corpus the memo says it protects) ====
// H1 — honest all-rise multi-series, categorical color only, strong within-series r
add('H1 3-series line, all rise strongly (color only)', 'honest',
  chart([1, 2, 3, 4].flatMap((x) => [{ x, y: 10 * x, seg: 'A' }, { x, y: 10 * x + 50, seg: 'B' }, { x, y: 10 * x + 100, seg: 'C' }]), { colorField: 'seg' }));

// H2 — single falling series, no channels
add('H2 single falling series (no retinal channels)', 'honest',
  chart([{ x: 1, y: 50 }, { x: 2, y: 40 }, { x: 3, y: 30 }, { x: 4, y: 20 }], {}));

// H3 — noisy-but-honest single rise r~0.96
add('H3 noisy honest single rise r~0.96', 'honest',
  chart([[1, 10], [2, 22], [3, 28], [4, 45], [5, 49], [6, 62]].map(([x, y]) => ({ x, y })), {}));

// H4 — LEGIT SCATTER WITH COLOR: each segment is honestly noisy (|r| < rho) and positive-ish,
//      pooled strongly positive. No Simpson: no series contradicts the pooled direction.
const rowsNoisySegments = () => {
  const r = [];
  const segs = { A: [10, 8, 14, 11, 18, 16], B: [40, 44, 41, 48, 45, 52], C: [70, 74, 71, 78, 75, 82] };
  for (const [seg, ys] of Object.entries(segs)) ys.forEach((y, i) => r.push({ x: i + 1, y, seg }));
  return r;
};
add('H4 scatter + categorical color, each series noisy |r|<rho but POSITIVE, pooled +', 'honest', chart(rowsNoisySegments(), { colorField: 'seg' }));

// H5 — FACETED honest chart, panels noisy (|r|<rho) but all trend up, pooled strong
const rowsFacetNoisy = () => { const r = []; const p = { N: [5, 9, 6, 12], S: [55, 59, 56, 62], E: [105, 109, 106, 112] };
  for (const [reg, ys] of Object.entries(p)) ys.forEach((y, i) => r.push({ x: i + 1, y, reg })); return r; };
add('H5 faceted honest chart, each panel noisy |r|<rho, pooled +', 'honest', chart(rowsFacetNoisy(), { facetColumnField: 'reg' }));

// H6 — stacked bar, every segment rises
const rowsStackAllRise = () => [
  { x: 1, y: 10, seg: 'A' }, { x: 2, y: 20, seg: 'A' }, { x: 3, y: 30, seg: 'A' },
  { x: 1, y: 5, seg: 'B' }, { x: 2, y: 15, seg: 'B' }, { x: 3, y: 25, seg: 'B' },
];
add('H6 sum-stacked bar, both segments rise', 'honest', chart(rowsStackAllRise(), { colorField: 'seg', yAggregate: 'sum', mark: 'MarkBar' }));

// H7 — BUBBLE: honest rising series, size = a repeating 3rd quantitative variable uncorrelated with y
const rowsBubble = () => {
  const r = []; const szCycle = [1, 2, 3, 1, 2, 3];
  for (const seg of ['A', 'B']) {
    const off = seg === 'A' ? 0 : 100;
    [10, 21, 29, 41, 50, 61].forEach((y, i) => r.push({ x: i + 1, y: y + off, seg, sz: szCycle[i] }));
  }
  return r;
};
add('H7 bubble: 2 rising series + repeating quantitative size (uncorrelated)', 'honest', chart(rowsBubble(), { colorField: 'seg', sizeField: 'sz', yAggregate: 'average' }));

// H8 — two rising series with a local dip in one (still r>rho each)
const rowsLocalDip = () => [
  { x: 1, y: 10, seg: 'A' }, { x: 2, y: 20, seg: 'A' }, { x: 3, y: 15, seg: 'A' }, { x: 4, y: 32, seg: 'A' }, { x: 5, y: 40, seg: 'A' },
  { x: 1, y: 60, seg: 'B' }, { x: 2, y: 72, seg: 'B' }, { x: 3, y: 68, seg: 'B' }, { x: 4, y: 85, seg: 'B' }, { x: 5, y: 95, seg: 'B' },
];
add('H8 2 rising series with a local dip (both r>rho)', 'honest', chart(rowsLocalDip(), { colorField: 'seg' }));

// H9 — honest rise + a categorical SHAPE channel on a point mark (all shape bands rise)
const rowsShapeHonest = () => [
  { x: 1, y: 10, sh: 'circle' }, { x: 2, y: 20, sh: 'circle' }, { x: 3, y: 30, sh: 'circle' },
  { x: 1, y: 12, sh: 'square' }, { x: 2, y: 24, sh: 'square' }, { x: 3, y: 33, sh: 'square' },
];
add('H9 point + categorical shape, both bands rise', 'honest', chart(rowsShapeHonest(), { shapeField: 'sh' }));

// H10 — honest heatmap-ish second positional? use detail channel honest
const rowsDetailHonest = () => { const r = []; for (const d of [1, 2, 3]) [10, 20, 30, 40].forEach((y, i) => r.push({ x: i + 1, y: y + d * 100, d })); return r; };
add('H10 detail channel, all 3 detail series rise', 'honest', chart(rowsDetailHonest(), { detailField: 'd', yAggregate: 'average' }));

// H11 — single honest series but with a size channel that is ONE-TO-ONE with x (a common "size = magnitude" bubble)
const rowsSizePerPoint = () => [1, 2, 3, 4, 5, 6].map((x) => ({ x, y: 10 * x + (x % 2 ? 3 : -3), sz: x }));
add('H11 single honest rise, size 1:1 with x (each size band n=1)', 'honest', chart(rowsSizePerPoint(), { sizeField: 'sz', yAggregate: 'average' }));

// H12 — honest color RAMP (quantitative color) where every c band rises — B's honest sibling
const rowsQuantColorHonest = () => [
  { x: 1, y: 10, c: 100 }, { x: 2, y: 20, c: 100 }, { x: 3, y: 30, c: 100 },
  { x: 1, y: 40, c: 200 }, { x: 2, y: 55, c: 200 }, { x: 3, y: 70, c: 200 },
];
add('H12 quantitative color ramp, both bands rise (honest sibling of B)', 'honest', chart(rowsQuantColorHonest(), { colorField: 'c', colorQuant: true, yAggregate: 'average' }));

// H13 — honest noisy multi-series with size: within (seg,sz) bands noisy below rho, pooled strong
const rowsNoisyTwoAxis = () => { const r = [];
  for (const seg of ['A', 'B']) for (const sz of [10, 20]) {
    const base = (seg === 'A' ? 0 : 200) + (sz === 10 ? 0 : 60);
    [1, 4, 2, 6].forEach((d, i) => r.push({ x: i + 1, y: base + d, seg, sz }));
  } return r; };
add('H13 noisy 2-axis (seg,sz) bands each |r|<rho positive, pooled +', 'honest', chart(rowsNoisyTwoAxis(), { colorField: 'seg', sizeField: 'sz', yAggregate: 'average' }));

// ───────────────── RUN ─────────────────
console.log('lens: over-suppression-corpus-damage — CURRENT (dist) vs PROPOSAL (reference impl)\n');
const rowsSep = [];
let newlySilenced = 0, keepBroken = 0;
for (const { name, kind, spec } of R) {
  const a = analyzeVizSpec(spec);
  const current = a.correlation;
  const dim = 'x', measure = 'y';
  const agg = spec.encoding.y.aggregate;
  const sep = separableFields(spec, dim, measure);
  const pooled = current;
  let verdict, why = '', trace = [];
  if (current === undefined) {
    verdict = 'CURRENT already suppresses (n/a)';
  } else {
    const g = g1PrimeSuppresses(spec.data.values, dim, measure, sep, agg, pooled);
    why = g.why; trace = g.trace ?? [];
    if (g.suppresses) { verdict = '*** NEWLY SILENCED ***'; newlySilenced++; if (kind === 'shipped-keep') keepBroken++; }
    else verdict = 'still narrates';
  }
  console.log(`[${kind}] ${name}`);
  console.log(`    separableFields = [${sep.join(', ')}]   current corr = ${current}`);
  console.log(`    PROPOSAL: ${verdict}${why ? '  — ' + why : ''}`);
  if (verdict.startsWith('***')) for (const t of trace.slice(0, 10)) console.log(`        ${t}`);
  console.log('');
  rowsSep.push({ name, kind, current, verdict });
}
console.log('══════════ SUMMARY ══════════');
const narrating = rowsSep.filter((r) => r.current !== undefined);
console.log(`charts where CURRENT narrates: ${narrating.length} / ${rowsSep.length}`);
console.log(`NEWLY SILENCED by the proposal: ${newlySilenced} / ${narrating.length} (${((newlySilenced / narrating.length) * 100).toFixed(0)}%)`);
console.log(`  of which SHIPPED s164 keep-controls (would go RED): ${keepBroken}`);
for (const r of rowsSep) if (r.verdict.startsWith('***')) console.log(`   - [${r.kind}] ${r.name} (was ${r.current})`);
