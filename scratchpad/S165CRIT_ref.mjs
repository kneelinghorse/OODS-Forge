// S165 pre-lock critic — REFERENCE IMPLEMENTATION of BOTH the shipped s164 gate and the
// PROPOSED s165 gate (§3 of forge-viz-s165-render-truth-separability-decision-memo.md),
// transcribed from packages/viz-core/src/a11y/data-analysis.ts @ HEAD 8297cc6.
// Validated against the built dist (see S165CRIT_selfcheck.mjs).
import { resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

// ---------- stats ----------
export function toNumber(v) {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') { const p = Number(v); return Number.isFinite(p) ? p : null; }
  return null;
}
export function pearson(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return null;
  let sx = 0, sy = 0;
  for (let i = 0; i < n; i++) { sx += xs[i]; sy += ys[i]; }
  const mx = sx / n, my = sy / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) { const a = xs[i] - mx, b = ys[i] - my; num += a * b; dx += a * a; dy += b * b; }
  const den = Math.sqrt(dx * dy);
  if (den === 0) return null;
  return Number((num / den).toFixed(3));
}
const stableSum = (v) => [...v].sort((a, b) => a - b).reduce((s, x) => s + x, 0);
export const signOf = (r) => (r > 0 ? 1 : r < 0 ? -1 : 0);

// ---------- spec helpers (mirror data-analysis.ts) ----------
export function normalizeMark(t) {
  if (!t) return 'unknown';
  const n = t.toLowerCase();
  if (n.includes('markbar')) return 'bar';
  if (n.includes('markline')) return 'line';
  if (n.includes('markpoint')) return 'point';
  if (n.includes('markarea')) return 'area';
  return 'unknown';
}
export const knownNormalizedMarks = (spec) => spec.marks.map((m) => normalizeMark(m.trait)).filter((m) => m !== 'unknown');
export function resolveMark(spec) {
  const u = [...new Set(knownNormalizedMarks(spec))];
  return u.length === 1 ? u[0] : u.length > 1 ? 'mixed' : 'unknown';
}
export const markSplitsByRetina = (m) => m === 'point' || m === 'line' || m === 'area';
export const markStacks = (m) => m === 'bar' || m === 'area';
export const isStackTotalAggregate = (a) => a === 'sum' || a === 'count';
export function resolveBinding(spec, ch) {
  const top = spec.encoding?.[ch];
  if (top) return top;
  for (const m of spec.marks) { const b = m.encodings?.[ch]; if (b) return b; }
  return undefined;
}
const QUANT_SCALE_TYPES = new Set(['linear', 'log', 'sqrt']);
export function bindingIsQuantitative(b) {
  if (!b) return false;
  return b.type === 'quantitative' || (b.scale !== undefined && QUANT_SCALE_TYPES.has(b.scale));
}
export function facetFields(spec) {
  if (spec.layout?.trait !== 'LayoutFacet') return [];
  const out = [];
  for (const f of [spec.layout.rows, spec.layout.columns]) if (f?.field) out.push(f.field);
  return out;
}
const CHANNEL_GROUPING_ROLE = { x: 'positional', y: 'positional', x2: 'positional-range', y2: 'positional-range', color: 'retinal', size: 'retinal', shape: 'retinal', detail: 'detail' };
const POSITIONAL_CHANNELS = Object.keys(CHANNEL_GROUPING_ROLE).filter((c) => CHANNEL_GROUPING_ROLE[c] === 'positional');
const RETINAL_GROUPING_CHANNELS = Object.keys(CHANNEL_GROUPING_ROLE).filter((c) => CHANNEL_GROUPING_ROLE[c] === 'retinal' || CHANNEL_GROUPING_ROLE[c] === 'detail');

export function seriesGroupingFields(spec) {
  const mark = resolveMark(spec);
  const out = [];
  for (const ch of RETINAL_GROUPING_CHANNELS) {
    const f = resolveBinding(spec, ch)?.field;
    if (!f) continue;
    if (ch === 'shape' && !markSplitsByRetina(mark)) continue;
    out.push(f);
  }
  return out;
}
export function drawnCellKeyFields(spec, measureField, stacking) {
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
export function resolvePrimaryBindings(spec) {
  const { measureChannel, dimensionChannel, colorIsMeasure } = resolvePrimaryChannels(spec);
  return {
    mark: resolveMark(spec),
    dimensionField: resolveBinding(spec, dimensionChannel)?.field,
    measureField: resolveBinding(spec, measureChannel)?.field,
    colorField: colorIsMeasure ? undefined : resolveBinding(spec, 'color')?.field,
    sizeField: resolveBinding(spec, 'size')?.field,
  };
}
export function narratedValueCellKey(spec) {
  const b = resolvePrimaryBindings(spec);
  if (!b.measureField) return [];
  const agg = resolveBinding(spec, resolvePrimaryChannels(spec).measureChannel)?.aggregate;
  const stacking = agg ? isStackTotalAggregate(agg) && markStacks(b.mark) : false;
  return drawnCellKeyFields(spec, b.measureField, stacking).filter((f) => f !== b.dimensionField);
}
export const collectRows = (spec) => (Array.isArray(spec.data.values) ? spec.data.values.filter((e) => e && typeof e === 'object' && !Array.isArray(e)) : []);
export function keyFor(row, fields) {
  return fields.map((f) => { const v = row[f]; return v === null || v === undefined ? '\0null' : String(v); }).join('\0');
}
export function reduceAggregate(values, agg) {
  if (agg === 'count') return values.length;
  if (agg === 'distinct') { const s = new Set(); for (const v of values) if (v !== null && v !== undefined) s.add(String(v)); return s.size; }
  const num = [];
  for (const v of values) { const n = toNumber(v); if (n !== null) num.push(n); }
  if (num.length === 0) return undefined;
  if (agg === 'sum') return stableSum(num);
  if (agg === 'average') return num.reduce((s, v) => s + v, 0) / num.length;
  if (agg === 'min') return Math.min(...num);
  if (agg === 'max') return Math.max(...num);
  const sorted = [...num].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}
export function projectAggregatedRows(rows, dim, meas, agg, groupingFields) {
  const keyFields = [dim, ...groupingFields];
  const order = [], groups = new Map();
  for (const row of rows) {
    const k = keyFor(row, keyFields);
    let g = groups.get(k);
    if (!g) { g = { dimValue: row[dim], values: [] }; groups.set(k, g); order.push(k); }
    g.values.push(row[meas]);
  }
  const out = [];
  for (const k of order) {
    const g = groups.get(k);
    const r = reduceAggregate(g.values, agg);
    if (r === undefined) continue;
    out.push({ [dim]: g.dimValue, [meas]: r });
  }
  return out;
}
function pearsonOverRows(rows, xf, yf) {
  const xs = [], ys = [];
  for (const r of rows) { const x = toNumber(r[xf]), y = toNumber(r[yf]); if (x === null || y === null) continue; xs.push(x); ys.push(y); }
  return pearson(xs, ys);
}

// ---------- s164 gate pieces ----------
export function correlationPartitionFields(spec, dim, meas) {
  const fields = [];
  const add = (f) => { if (f && f !== dim && f !== meas && !fields.includes(f)) fields.push(f); };
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
export function correlationGroupingFields(spec, dim, meas, partitionFields, agg) {
  const stacking = agg ? isStackTotalAggregate(agg) && markStacks(resolveMark(spec)) : false;
  return drawnCellKeyFields(spec, meas, stacking).filter((f) => f !== dim && !partitionFields.includes(f));
}
function classifyGroupDirection(rows, xf, yf) {
  const xs = [], ys = [];
  for (const r of rows) { const x = toNumber(r[xf]), y = toNumber(r[yf]); if (x === null || y === null) continue; xs.push(x); ys.push(y); }
  const n = xs.length;
  if (n < 2) return 'unknown';
  const mx = xs.reduce((s, x) => s + x, 0) / n;
  let dx = 0; for (const x of xs) dx += (x - mx) ** 2;
  if (dx === 0) return 'unknown';
  if (n === 2) { const my = (ys[0] + ys[1]) / 2; let cov = 0; for (let i = 0; i < 2; i++) cov += (xs[i] - mx) * (ys[i] - my); return signOf(cov); }
  const r = pearson(xs, ys);
  return r === null ? 0 : signOf(r);
}
export function narratableCorrelation(pooled, classes) {
  const ev = classes.filter((c) => c !== 'unknown');
  if (ev.length === 0) return true;
  if (new Set(ev).size > 1) return false;
  const s = ev[0], ps = signOf(pooled);
  if (s === 0) return ps === 0;
  return ps === 0 || ps === s;
}
export const RHO = 0.5;
export function subsetsOf(items) {
  const out = [[]];
  for (const it of items) { const len = out.length; for (let i = 0; i < len; i++) out.push([...out[i], it]); }
  return out;
}
export function classifyDrawnSeriesDirection(xs, ys) {
  const n = xs.length;
  if (n < 2) return 'unknown';
  const mx = xs.reduce((s, x) => s + x, 0) / n;
  let dx = 0; for (const x of xs) dx += (x - mx) ** 2;
  if (dx === 0) return 'unknown';
  if (n === 2) { const my = (ys[0] + ys[1]) / 2; let cov = 0; for (let i = 0; i < 2; i++) cov += (xs[i] - mx) * (ys[i] - my); return signOf(cov); }
  const r = pearson(xs, ys);
  if (r === null) return 0;
  return Math.abs(r) >= RHO ? signOf(r) : 0;
}
export function drawnSubSeries(rows, dim, meas, keyFields, agg) {
  const bySub = new Map();
  const push = (sub, x, y) => { let s = bySub.get(sub); if (!s) { s = { xs: [], ys: [] }; bySub.set(sub, s); } s.xs.push(x); s.ys.push(y); };
  if (agg) {
    const cells = new Map();
    for (const row of rows) {
      const k = keyFor(row, [dim, ...keyFields]);
      let c = cells.get(k);
      if (!c) { c = { sub: keyFor(row, keyFields), dim: row[dim], values: [] }; cells.set(k, c); }
      c.values.push(row[meas]);
    }
    for (const c of cells.values()) {
      const red = reduceAggregate(c.values, agg);
      const x = toNumber(c.dim);
      if (red === undefined || x === null) continue;
      push(c.sub, x, red);
    }
  } else {
    for (const row of rows) {
      const x = toNumber(row[dim]), y = toNumber(row[meas]);
      if (x === null || y === null) continue;
      push(keyFor(row, keyFields), x, y);
    }
  }
  return [...bySub.values()];
}
// s164 G1 (partition-PREFIXED scan over subsets of groupingFields)
export function g1_s164(rawRows, dim, meas, partitionFields, groupingFields, agg, pooled) {
  const pooledSign = signOf(pooled);
  const votes = []; let anyVotable = false, sharesPooled = false;
  if (groupingFields.length === 0) return { votes, anyVotable, sharesPooled, pooledSign, suppresses: false };
  const record = (d) => { if (d === 'unknown') return; anyVotable = true; if (d !== 0) votes.push(d); if (d !== 0 && d === pooledSign) sharesPooled = true; };
  const subsets = subsetsOf(groupingFields);
  const groups = new Map();
  for (const row of rawRows) { const k = partitionFields.length === 0 ? '*' : keyFor(row, partitionFields); const g = groups.get(k); if (g) g.push(row); else groups.set(k, [row]); }
  for (const groupRows of groups.values()) {
    let hasFine = false, emptyVote = null;
    for (const S of subsets) {
      for (const ser of drawnSubSeries(groupRows, dim, meas, S, agg)) {
        if (new Set(ser.xs).size < 2) continue;
        const d = classifyDrawnSeriesDirection(ser.xs, ser.ys);
        if (d === 'unknown') continue;
        if (S.length === 0) { emptyVote = d; continue; }
        hasFine = true; record(d);
      }
    }
    if (!hasFine && emptyVote !== null) record(emptyVote);
  }
  let suppresses;
  if (!anyVotable) suppresses = false;
  else if (new Set(votes).size > 1) suppresses = true;
  else if (votes.some((v) => v === -pooledSign)) suppresses = true;
  else suppresses = pooledSign !== 0 && !sharesPooled;
  return { votes, anyVotable, sharesPooled, pooledSign, suppresses };
}

// ---------- PROPOSED s165 pieces (memo §3.1 / §3.2) ----------
export function separableFields(spec, dim, meas) {
  const fields = [];
  const add = (f) => { if (f && f !== dim && f !== meas && !fields.includes(f)) fields.push(f); };
  for (const f of facetFields(spec)) add(f);
  const measureChannel = resolvePrimaryChannels(spec).measureChannel;
  for (const ch of POSITIONAL_CHANNELS) { if (ch === measureChannel) continue; add(resolveBinding(spec, ch)?.field); }
  add(resolveBinding(spec, 'color')?.field);   // categorical AND quantitative
  add(resolveBinding(spec, 'size')?.field);
  const known = knownNormalizedMarks(spec);
  const mark = resolveMark(spec);
  if (mark === 'mixed' || mark === 'unknown' || known.some(markSplitsByRetina)) add(resolveBinding(spec, 'shape')?.field);
  add(resolveBinding(spec, 'detail')?.field);
  return fields; // stacking drops NOTHING
}
// G1' = UNPREFIXED scan over every subset of separableFields
export function g1_s165(rawRows, dim, meas, sepFields, agg, pooled) {
  const pooledSign = signOf(pooled);
  const votes = []; let anyVotable = false, sharesPooled = false;
  if (sepFields.length === 0) return { votes, anyVotable, sharesPooled, pooledSign, suppresses: false };
  const record = (d) => { if (d === 'unknown') return; anyVotable = true; if (d !== 0) votes.push(d); if (d !== 0 && d === pooledSign) sharesPooled = true; };
  let hasFine = false, emptyVote = null;
  for (const S of subsetsOf(sepFields)) {
    for (const ser of drawnSubSeries(rawRows, dim, meas, S, agg)) {
      if (new Set(ser.xs).size < 2) continue;
      const d = classifyDrawnSeriesDirection(ser.xs, ser.ys);
      if (d === 'unknown') continue;
      if (S.length === 0) { emptyVote = d; continue; }
      hasFine = true; record(d);
    }
  }
  if (!hasFine && emptyVote !== null) record(emptyVote);
  let suppresses;
  if (!anyVotable) suppresses = false;
  else if (new Set(votes).size > 1) suppresses = true;
  else if (votes.some((v) => v === -pooledSign)) suppresses = true;
  else suppresses = pooledSign !== 0 && !sharesPooled;
  return { votes, anyVotable, sharesPooled, pooledSign, suppresses };
}

// ---------- the full pipeline, both variants ----------
export const isMarkRectGrid = (spec) => spec.marks.length > 0 && spec.marks.every((m) => m.trait === 'MarkRect');
export function isStripPlot(spec) {
  const marks = spec.marks.map((m) => normalizeMark(m.trait));
  if (marks.length === 0 || !marks.every((m) => m === 'point')) return false;
  return bindingIsQuantitative(resolveBinding(spec, 'x')) !== bindingIsQuantitative(resolveBinding(spec, 'y'));
}
export function refCorrelation(spec, variant = 's164') {
  if (isMarkRectGrid(spec) || isStripPlot(spec)) return { correlation: undefined, why: 'pre-gate (rect grid / strip plot)' };
  const b = resolvePrimaryBindings(spec);
  const rows = collectRows(spec);
  const agg = resolveBinding(spec, resolvePrimaryChannels(spec).measureChannel)?.aggregate;
  if (!b.dimensionField || !b.measureField) return { correlation: undefined, why: 'no dim/measure' };
  const analysisRows = agg ? projectAggregatedRows(rows, b.dimensionField, b.measureField, agg, narratedValueCellKey(spec)) : rows;
  const pooled = pearsonOverRows(analysisRows, b.dimensionField, b.measureField);
  if (pooled === null) return { correlation: undefined, why: 'pooled null' };
  const partitionFields = correlationPartitionFields(spec, b.dimensionField, b.measureField);
  const groupingFields = correlationGroupingFields(spec, b.dimensionField, b.measureField, partitionFields, agg);
  if (partitionFields.length === 0 && groupingFields.length === 0 && variant === 's164') {
    return { correlation: pooled, why: 'early-return (no partition, no grouping)', pooled, partitionFields, groupingFields };
  }
  // G0 (unchanged in both variants)
  const groups = new Map();
  for (const row of rows) { const k = keyFor(row, partitionFields); const g = groups.get(k); if (g) g.push(row); else groups.set(k, [row]); }
  const classes = [];
  for (const gr of groups.values()) {
    const cells = agg ? projectAggregatedRows(gr, b.dimensionField, b.measureField, agg, groupingFields) : gr;
    classes.push(classifyGroupDirection(cells, b.dimensionField, b.measureField));
  }
  const g0 = narratableCorrelation(pooled, classes);
  if (variant === 's164') {
    const ev = g1_s164(rows, b.dimensionField, b.measureField, partitionFields, groupingFields, agg, pooled);
    return { correlation: g0 && !ev.suppresses ? pooled : undefined, pooled, g0, g1: ev, partitionFields, groupingFields, classes };
  }
  const sep = separableFields(spec, b.dimensionField, b.measureField);
  // §3.3: G0 stays byte-identical INCLUDING its early-return; §3.2 replaces only G1's inputs.
  if (partitionFields.length === 0 && groupingFields.length === 0) {
    const ev = g1_s165(rows, b.dimensionField, b.measureField, sep, agg, pooled);
    return { correlation: !ev.suppresses ? pooled : undefined, pooled, g0: true, g1: ev, sep, note: 's164 early-return path; G1prime still applied', partitionFields, groupingFields };
  }
  const ev = g1_s165(rows, b.dimensionField, b.measureField, sep, agg, pooled);
  return { correlation: g0 && !ev.suppresses ? pooled : undefined, pooled, g0, g1: ev, sep, partitionFields, groupingFields, classes };
}
