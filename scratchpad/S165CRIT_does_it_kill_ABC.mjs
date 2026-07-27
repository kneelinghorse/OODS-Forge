// S165 PRE-LOCK CRITIC — lens: does-it-kill-ABC
// Reference implementation of the s165 DRAFT design (separableFields + unprefixed subset scan),
// validated for PARITY against the shipped dist first, then run on A/B/C + controls.
import { analyzeVizSpec, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

// ───────────────────────── faithful re-implementation of the SUT (src/a11y/data-analysis.ts) ─────
const QUANT_SCALE_TYPES = new Set(['linear', 'log', 'pow', 'sqrt', 'symlog', 'time', 'utc', 'sequential']);
const toNumber = (v) => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') { const p = Number(v); return Number.isFinite(p) ? p : null; }
  return null;
};
function pearson(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return null;
  let sx = 0, sy = 0; for (let i = 0; i < n; i++) { sx += xs[i]; sy += ys[i]; }
  const mx = sx / n, my = sy / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) { const a = xs[i] - mx, b = ys[i] - my; num += a * b; dx += a * a; dy += b * b; }
  const den = Math.sqrt(dx * dy);
  if (den === 0) return null;
  return Number((num / den).toFixed(3));
}
const resolveBinding = (spec, ch) => spec.encoding?.[ch] ?? spec.marks.map((m) => m.encodings?.[ch]).find(Boolean);
const bindingIsQuantitative = (b) => !!b && (b.type === 'quantitative' || (b.scale !== undefined && QUANT_SCALE_TYPES.has(b.scale)));
function normalizeMark(t) {
  if (!t) return 'unknown';
  const n = t.toLowerCase();
  if (n.includes('markbar')) return 'bar';
  if (n.includes('markline')) return 'line';
  if (n.includes('markpoint')) return 'point';
  if (n.includes('markarea')) return 'area';
  return 'unknown';
}
const knownNormalizedMarks = (spec) => spec.marks.map((m) => normalizeMark(m.trait)).filter((m) => m !== 'unknown');
function resolveMark(spec) {
  const u = [...new Set(knownNormalizedMarks(spec))];
  return u.length === 1 ? u[0] : u.length > 1 ? 'mixed' : 'unknown';
}
const markSplitsByRetina = (m) => m === 'point' || m === 'line' || m === 'area';
const POSITIONAL_CHANNELS = ['x', 'y'];
const RETINAL_GROUPING_CHANNELS = ['color', 'size', 'shape', 'detail'];
const facetFields = (spec) => {
  if (spec.layout?.trait !== 'LayoutFacet') return [];
  const f = [];
  for (const fc of [spec.layout.rows, spec.layout.columns]) if (fc?.field) f.push(fc.field);
  return f;
};
function seriesGroupingFields(spec) {
  const mark = resolveMark(spec); const fields = [];
  for (const ch of RETINAL_GROUPING_CHANNELS) {
    const f = resolveBinding(spec, ch)?.field;
    if (!f) continue;
    if (ch === 'shape' && !markSplitsByRetina(mark)) continue;
    fields.push(f);
  }
  return fields;
}
function drawnCellKeyFields(spec, measureField, stacking) {
  const fields = [];
  const measureChannel = resolvePrimaryChannels(spec).measureChannel;
  const add = (f) => { if (f && f !== measureField && !fields.includes(f)) fields.push(f); };
  for (const ch of POSITIONAL_CHANNELS) {
    if (ch === measureChannel) continue;
    const f = resolveBinding(spec, ch)?.field;
    if (f && !fields.includes(f)) fields.push(f);
  }
  for (const f of facetFields(spec)) add(f);
  if (!stacking) for (const f of seriesGroupingFields(spec)) add(f);
  return fields;
}
const isStackTotalAggregate = (a) => a === 'sum' || a === 'count';
const markStacks = (m) => m === 'bar' || m === 'area';
function keyFor(row, fields) {
  return fields.map((f) => { const v = row[f]; return v === null || v === undefined ? '\0null' : String(v); }).join('\0');
}
function stableSum(ns) { return [...ns].sort((a, b) => a - b).reduce((s, n) => s + n, 0); }
function reduceAggregate(values, agg) {
  if (agg === 'count') return values.length;
  if (agg === 'distinct') { const s = new Set(); for (const v of values) if (v !== null && v !== undefined) s.add(String(v)); return s.size; }
  const num = []; for (const v of values) { const n = toNumber(v); if (n !== null) num.push(n); }
  if (num.length === 0) return undefined;
  if (agg === 'sum') return stableSum(num);
  if (agg === 'average') return stableSum(num) / num.length;
  if (agg === 'min') return Math.min(...num);
  if (agg === 'max') return Math.max(...num);
  const sorted = [...num].sort((a, b) => a - b); const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}
function projectAggregatedRows(rows, dim, meas, agg, groupingFields) {
  const keyFields = [dim, ...groupingFields]; const order = []; const groups = new Map();
  for (const row of rows) {
    const key = keyFor(row, keyFields);
    let g = groups.get(key);
    if (!g) { g = { dimValue: row[dim], values: [] }; groups.set(key, g); order.push(key); }
    g.values.push(row[meas]);
  }
  const out = [];
  for (const k of order) { const g = groups.get(k); const r = reduceAggregate(g.values, agg); if (r === undefined) continue; out.push({ [dim]: g.dimValue, [meas]: r }); }
  return out;
}
function resolvePrimaryBindings(spec) {
  const { measureChannel, dimensionChannel, colorIsMeasure } = resolvePrimaryChannels(spec);
  return {
    mark: resolveMark(spec),
    dimensionField: resolveBinding(spec, dimensionChannel)?.field,
    measureField: resolveBinding(spec, measureChannel)?.field,
  };
}
function narratedValueCellKey(spec) {
  const b = resolvePrimaryBindings(spec);
  if (!b.measureField) return [];
  const agg = resolveBinding(spec, resolvePrimaryChannels(spec).measureChannel)?.aggregate;
  const stacking = agg ? isStackTotalAggregate(agg) && markStacks(b.mark) : false;
  return drawnCellKeyFields(spec, b.measureField, stacking).filter((f) => f !== b.dimensionField);
}
function correlationPartitionFields(spec, dim, meas) {
  const fields = []; const add = (f) => { if (f && f !== dim && f !== meas && !fields.includes(f)) fields.push(f); };
  for (const f of facetFields(spec)) add(f);
  const mark = resolveMark(spec);
  for (const ch of RETINAL_GROUPING_CHANNELS) {
    const b = resolveBinding(spec, ch);
    if (!b?.field || bindingIsQuantitative(b)) continue;
    if (ch === 'shape' && !markSplitsByRetina(mark)) continue;
    add(b.field);
  }
  return fields;
}
function correlationGroupingFields(spec, dim, meas, partitionFields, agg) {
  const stacking = agg ? isStackTotalAggregate(agg) && markStacks(resolveMark(spec)) : false;
  return drawnCellKeyFields(spec, meas, stacking).filter((f) => f !== dim && !partitionFields.includes(f));
}
const signOf = (r) => (r > 0 ? 1 : r < 0 ? -1 : 0);
function classifyGroupDirection(rows, xf, yf) {
  const xs = [], ys = [];
  for (const r of rows) { const x = toNumber(r[xf]), y = toNumber(r[yf]); if (x === null || y === null) continue; xs.push(x); ys.push(y); }
  const n = xs.length; if (n < 2) return 'unknown';
  const mx = xs.reduce((s, x) => s + x, 0) / n; let dx = 0; for (const x of xs) dx += (x - mx) ** 2;
  if (dx === 0) return 'unknown';
  if (n === 2) { const my = (ys[0] + ys[1]) / 2; let cov = 0; for (let i = 0; i < 2; i++) cov += (xs[i] - mx) * (ys[i] - my); return signOf(cov); }
  const r = pearson(xs, ys); return r === null ? 0 : signOf(r);
}
function narratableCorrelation(pooled, classes) {
  const ev = classes.filter((c) => c !== 'unknown');
  if (ev.length === 0) return true;
  if (new Set(ev).size > 1) return false;
  const s = ev[0]; const ps = signOf(pooled);
  if (s === 0) return ps === 0;
  return ps === 0 || ps === s;
}
const RHO = 0.5;
function subsetsOf(items) { const out = [[]]; for (const it of items) { const l = out.length; for (let i = 0; i < l; i++) out.push([...out[i], it]); } return out; }
function classifyDrawnSeriesDirection(xs, ys) {
  const n = xs.length; if (n < 2) return 'unknown';
  const mx = xs.reduce((s, x) => s + x, 0) / n; let dx = 0; for (const x of xs) dx += (x - mx) ** 2;
  if (dx === 0) return 'unknown';
  if (n === 2) { const my = (ys[0] + ys[1]) / 2; let cov = 0; for (let i = 0; i < 2; i++) cov += (xs[i] - mx) * (ys[i] - my); return signOf(cov); }
  const r = pearson(xs, ys); if (r === null) return 0;
  return Math.abs(r) >= RHO ? signOf(r) : 0;
}
function drawnSubSeries(rows, dim, meas, keyFields, agg) {
  const bySub = new Map();
  const push = (sub, x, y) => { let s = bySub.get(sub); if (!s) { s = { key: sub, xs: [], ys: [] }; bySub.set(sub, s); } s.xs.push(x); s.ys.push(y); };
  if (agg) {
    const cells = new Map();
    for (const row of rows) {
      const key = keyFor(row, [dim, ...keyFields]);
      let c = cells.get(key);
      if (!c) { c = { sub: keyFor(row, keyFields), dim: row[dim], values: [] }; cells.set(key, c); }
      c.values.push(row[meas]);
    }
    for (const c of cells.values()) { const red = reduceAggregate(c.values, agg); const x = toNumber(c.dim); if (red === undefined || x === null) continue; push(c.sub, x, red); }
  } else {
    for (const row of rows) { const x = toNumber(row[dim]), y = toNumber(row[meas]); if (x === null || y === null) continue; push(keyFor(row, keyFields), x, y); }
  }
  return [...bySub.values()];
}
function correlationOppositionEvidenceOf(rawRows, dim, meas, partitionFields, groupingFields, agg, pooled, trace) {
  const pooledSign = signOf(pooled); const votes = []; let anyVotable = false, sharesPooled = false;
  if (groupingFields.length === 0) return { votes, anyVotable, sharesPooled, pooledSign, suppresses: false, noop: true };
  const record = (dir) => { if (dir === 'unknown') return; anyVotable = true; if (dir !== 0) votes.push(dir); if (dir !== 0 && dir === pooledSign) sharesPooled = true; };
  const subsets = subsetsOf(groupingFields);
  const partitionGroups = new Map();
  for (const row of rawRows) { const k = partitionFields.length === 0 ? '*' : keyFor(row, partitionFields); const g = partitionGroups.get(k); if (g) g.push(row); else partitionGroups.set(k, [row]); }
  for (const [pk, groupRows] of partitionGroups) {
    let hasVotableFineBand = false, emptyVote = null;
    for (const subset of subsets) {
      for (const series of drawnSubSeries(groupRows, dim, meas, subset, agg)) {
        if (new Set(series.xs).size < 2) continue;
        const dir = classifyDrawnSeriesDirection(series.xs, series.ys);
        if (dir === 'unknown') continue;
        if (subset.length === 0) { emptyVote = dir; if (trace) trace.push(`  P=${pk} S=[] band='${series.key}' n=${series.xs.length} dir=${dir} (DEFERRED)`); continue; }
        hasVotableFineBand = true;
        if (trace) trace.push(`  P=${pk} S=[${subset.join(',')}] band='${series.key.replace(/\0/g, '|')}' xs=${JSON.stringify(series.xs)} ys=${JSON.stringify(series.ys)} dir=${dir}`);
        record(dir);
      }
    }
    if (!hasVotableFineBand && emptyVote !== null) { if (trace) trace.push(`  P=${pk} S=[] ADMITTED dir=${emptyVote}`); record(emptyVote); }
  }
  let suppresses, clause;
  if (!anyVotable) { suppresses = false; clause = 'fallback: nothing votable -> narrate'; }
  else if (new Set(votes).size > 1) { suppresses = true; clause = '(a) votes span >1 sign'; }
  else if (votes.some((v) => v === -pooledSign)) { suppresses = true; clause = '(b) a real opposite'; }
  else { suppresses = pooledSign !== 0 && !sharesPooled; clause = suppresses ? '(c) no band shares pooledSign' : 'no clause fires -> narrate'; }
  return { votes, anyVotable, sharesPooled, pooledSign, suppresses, clause, noop: false };
}

// ───────────────────────── the s165 DRAFT's NEW derivation ────────────────────────────────────
function separableFields(spec, dim, meas) {
  const out = []; const add = (f) => { if (f && f !== dim && f !== meas && !out.includes(f)) out.push(f); };
  const measureChannel = resolvePrimaryChannels(spec).measureChannel;
  for (const ch of POSITIONAL_CHANNELS) { if (ch === measureChannel) continue; add(resolveBinding(spec, ch)?.field); }
  for (const f of facetFields(spec)) add(f);
  const known = knownNormalizedMarks(spec);
  const shapeSeparable = known.length === 0 || known.some(markSplitsByRetina); // memo §3.1: some(...) OR mixed/unknown
  for (const ch of RETINAL_GROUPING_CHANNELS) {
    const b = resolveBinding(spec, ch);
    if (!b?.field) continue;
    if (ch === 'shape' && !shapeSeparable) continue;
    add(b.field); // stacking does NOT drop any of these
  }
  return out;
}

// ───────────────────────── the three deciders ─────────────────────────────────────────────────
function decide(spec, mode, trace) {
  const b = resolvePrimaryBindings(spec);
  const rows = (spec.data.values ?? []).filter((r) => r && typeof r === 'object' && !Array.isArray(r));
  const agg = resolveBinding(spec, resolvePrimaryChannels(spec).measureChannel)?.aggregate;
  const valueRows = agg && b.dimensionField && b.measureField
    ? projectAggregatedRows(rows, b.dimensionField, b.measureField, agg, narratedValueCellKey(spec))
    : rows;
  if (!b.dimensionField || !b.measureField) return { r: undefined, why: 'no bindings' };
  const xs = [], ys = [];
  for (const r of valueRows) { const x = toNumber(r[b.dimensionField]), y = toNumber(r[b.measureField]); if (x === null || y === null) continue; xs.push(x); ys.push(y); }
  const pooled = pearson(xs, ys);
  if (pooled === null) return { r: undefined, why: 'pooled null' };
  const partitionFields = correlationPartitionFields(spec, b.dimensionField, b.measureField);
  const groupingFields = correlationGroupingFields(spec, b.dimensionField, b.measureField, partitionFields, agg);
  const sep = separableFields(spec, b.dimensionField, b.measureField);
  const info = { pooled, partitionFields, groupingFields, separableFields: sep };

  const earlyReturnGuard =
    mode === 'shipped' || mode === 'draft-as-written'
      ? partitionFields.length === 0 && groupingFields.length === 0
      : partitionFields.length === 0 && groupingFields.length === 0 && sep.length === 0;
  if (earlyReturnGuard) return { r: pooled, why: 'EARLY RETURN (partition=∅ ∧ grouping=∅)', ...info };

  const groups = new Map();
  for (const row of rows) { const k = keyFor(row, partitionFields); const g = groups.get(k); if (g) g.push(row); else groups.set(k, [row]); }
  const classes = [];
  for (const gr of groups.values()) classes.push(classifyGroupDirection(agg ? projectAggregatedRows(gr, b.dimensionField, b.measureField, agg, groupingFields) : gr, b.dimensionField, b.measureField));
  const g0 = narratableCorrelation(pooled, classes);
  let g1;
  if (mode === 'shipped') g1 = correlationOppositionEvidenceOf(rows, b.dimensionField, b.measureField, partitionFields, groupingFields, agg, pooled, trace);
  else g1 = correlationOppositionEvidenceOf(rows, b.dimensionField, b.measureField, [], sep, agg, pooled, trace);
  return { r: g0 && !g1.suppresses ? pooled : undefined, why: `G0=${g0 ? 'narrate' : 'SUPPRESS'} classes=${JSON.stringify(classes)} | G1${mode === 'shipped' ? '' : "'"}=${g1.noop ? 'NO-OP' : g1.suppresses ? 'SUPPRESS' : 'narrate'} votes=${JSON.stringify(g1.votes)} clause="${g1.clause ?? 'no-op'}"`, ...info };
}

// ───────────────────────── fixtures ───────────────────────────────────────────────────────────
const mk = (id, marks, enc, values, layout) => ({ $schema: 'https://oods.dev/viz-spec/v1', id, name: id, data: { name: 'd', values }, marks: marks.map((t) => ({ trait: t, encodings: enc })), encoding: enc, ...(layout ? { layout } : {}), a11y: { description: 'y over x' } });

const A_rows = [
  { x: 1, y: 30, shp: 'circle' }, { x: 2, y: 20, shp: 'circle' }, { x: 3, y: 10, shp: 'circle' },
  { x: 4, y: 130, shp: 'square' }, { x: 5, y: 120, shp: 'square' }, { x: 6, y: 110, shp: 'square' },
];
const A_rows_honest = [
  { x: 1, y: 10, shp: 'circle' }, { x: 2, y: 20, shp: 'circle' }, { x: 3, y: 30, shp: 'circle' },
  { x: 4, y: 110, shp: 'square' }, { x: 5, y: 120, shp: 'square' }, { x: 6, y: 130, shp: 'square' },
];
const aEnc = (ch) => ({ x: { field: 'x', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'y', trait: 'EncodingY', type: 'quantitative' }, [ch]: { field: 'shp', trait: ch === 'shape' ? 'EncodingShape' : 'EncodingColor' } });

const B_rows = [
  { x: 1, y: 50, c: 100 }, { x: 2, y: 40, c: 100 }, { x: 3, y: 30, c: 100 },
  { x: 1, y: 10, c: 200 }, { x: 2, y: 60, c: 200 }, { x: 3, y: 110, c: 200 },
];
const bEnc = (quant) => ({ x: { field: 'x', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'sum' }, color: quant ? { field: 'c', trait: 'EncodingColor', type: 'quantitative' } : { field: 'c', trait: 'EncodingColor' } });

const C_rows = [
  { x: 1, y: 10, seg: 'p', sz: 1 }, { x: 2, y: 8, seg: 'q', sz: 1 }, { x: 3, y: 6, seg: 'r', sz: 1 },
  { x: 1, y: 20, seg: 'p', sz: 2 }, { x: 2, y: 30, seg: 'q', sz: 2 }, { x: 3, y: 40, seg: 'r', sz: 2 },
];
const C_rows_nc = [
  { x: 1, y: 10, seg: 'p', sz: 1 }, { x: 2, y: 8, seg: 'p', sz: 1 }, { x: 3, y: 6, seg: 'q', sz: 1 }, { x: 4, y: 4, seg: 'q', sz: 1 },
  { x: 1, y: 20, seg: 'p', sz: 2 }, { x: 2, y: 30, seg: 'p', sz: 2 }, { x: 3, y: 40, seg: 'q', sz: 2 }, { x: 4, y: 50, seg: 'q', sz: 2 },
];
const cEnc = (withSeg) => { const e = { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' }, size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' } }; if (withSeg) e.color = { field: 'seg', trait: 'EncodingColor' }; return e; };

// keep-controls
const honestRise = [
  { x: 1, y: 10, seg: 'p' }, { x: 2, y: 20, seg: 'p' }, { x: 3, y: 30, seg: 'p' },
  { x: 1, y: 110, seg: 'q' }, { x: 2, y: 120, seg: 'q' }, { x: 3, y: 130, seg: 'q' },
];
const noisyRise = [{ x: 1, y: 10 }, { x: 2, y: 22 }, { x: 3, y: 28 }, { x: 4, y: 45 }, { x: 5, y: 49 }];
const rampRows = Array.from({ length: 8 }, (_, i) => ({ x: i + 1, y: (i + 1) * 10, c: i + 1 }));

const fixtures = [
  ['A  mixed[line,point] + shape, both bands FALL (PHANTOM)', mk('A', ['MarkLine', 'MarkPoint'], aEnc('shape'), A_rows), 'MUST SUPPRESS'],
  ['A2 mixed[point,bar] + shape (PHANTOM variant)', mk('A2', ['MarkPoint', 'MarkBar'], aEnc('shape'), A_rows), 'MUST SUPPRESS'],
  ['A3 mixed[line,area] + shape (PHANTOM variant)', mk('A3', ['MarkLine', 'MarkArea'], aEnc('shape'), A_rows), 'MUST SUPPRESS'],
  ['A-ctlP single MarkPoint + shape', mk('Ap', ['MarkPoint'], aEnc('shape'), A_rows), 'already suppressed'],
  ['A-ctlL single MarkLine + shape', mk('Al', ['MarkLine'], aEnc('shape'), A_rows), 'already suppressed'],
  ['A-ctlC mixed + categorical COLOR', mk('Ac', ['MarkLine', 'MarkPoint'], aEnc('color'), A_rows), 'already suppressed'],
  ['A-honest mixed + shape, both bands RISE', mk('Ah', ['MarkLine', 'MarkPoint'], aEnc('shape'), A_rows_honest), 'KEEP narrating'],
  ['B  sum-stacked bar + QUANT color ramp (PHANTOM)', mk('B', ['MarkBar'], bEnc(true), B_rows), 'MUST SUPPRESS'],
  ['B-ctl sum-stacked bar + CATEGORICAL color', mk('Bc', ['MarkBar'], bEnc(false), B_rows), 'already suppressed'],
  ['C  collinear cat seg + size Simpson (PHANTOM)', mk('C', ['MarkPoint'], cEnc(true), C_rows), 'MUST SUPPRESS'],
  ['C-ctl2 size only, no categorical', mk('C2', ['MarkPoint'], cEnc(false), C_rows), 'already suppressed'],
  ['C-ctl3 non-collinear seg + size Simpson', mk('C3', ['MarkPoint'], cEnc(true), C_rows_nc), 'already suppressed'],
  ['K1 honest all-rise multi-series (color)', mk('K1', ['MarkPoint'], { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'y', trait: 'EncodingY', type: 'quantitative' }, color: { field: 'seg', trait: 'EncodingColor' } }, honestRise), 'KEEP narrating'],
  ['K2 single noisy-but-honest rise (no groupings)', mk('K2', ['MarkPoint'], { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'y', trait: 'EncodingY', type: 'quantitative' } }, noisyRise), 'KEEP narrating'],
  ['K3 continuous color ramp (residual)', mk('K3', ['MarkPoint'], { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'y', trait: 'EncodingY', type: 'quantitative' }, color: { field: 'c', trait: 'EncodingColor', type: 'quantitative' } }, rampRows), 'KEEP narrating'],
];

let parityFail = 0;
console.log('='.repeat(110));
console.log('STEP 1 — PARITY: reference "shipped" decider vs the built dist (proves the reference is faithful)');
console.log('='.repeat(110));
for (const [label, spec] of fixtures) {
  const sut = analyzeVizSpec(spec).correlation;
  const ref = decide(spec, 'shipped').r;
  const ok = Object.is(sut, ref);
  if (!ok) parityFail++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label.padEnd(52)} dist=${String(sut).padEnd(8)} ref=${String(ref)}`);
}
console.log(parityFail === 0 ? '\n>>> PARITY 100% — the reference reproduces the shipped decision exactly.\n' : `\n>>> ${parityFail} PARITY FAILURES — reference not trusted.\n`);

for (const mode of ['draft-as-written', 'draft-amended-early-return']) {
  console.log('='.repeat(110));
  console.log(`STEP 2 — s165 PROPOSAL, mode = ${mode}`);
  if (mode === 'draft-as-written') console.log('  (memo §3.3 verbatim: "narratableCorrelation + the per-partition classifyCorrelationGroups path stay BYTE-IDENTICAL"');
  else console.log('  (AMENDED: the deriveCorrelation:1662 early return additionally requires separableFields = ∅)');
  console.log('='.repeat(110));
  for (const [label, spec, expect] of fixtures) {
    const trace = [];
    const out = decide(spec, mode, trace);
    const verdict = out.r === undefined ? 'SUPPRESSED' : `NARRATES ${out.r}`;
    const must = expect === 'MUST SUPPRESS';
    const bad = (must && out.r !== undefined) || (expect === 'KEEP narrating' && out.r === undefined) || (expect === 'already suppressed' && out.r !== undefined);
    console.log(`\n[${bad ? '!! ' : 'ok '}] ${label}`);
    console.log(`     expect=${expect}  ->  ${verdict}`);
    console.log(`     partition=${JSON.stringify(out.partitionFields)} grouping=${JSON.stringify(out.groupingFields)} separable=${JSON.stringify(out.separableFields)} pooled=${out.pooled}`);
    console.log(`     ${out.why}`);
    if (must || bad) for (const t of trace) console.log(`     ${t}`);
  }
  console.log('');
}
