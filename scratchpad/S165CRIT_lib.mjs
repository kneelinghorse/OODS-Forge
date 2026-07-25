// S165 pre-lock critic — lens: blast-radius-constraints.
// Reference implementation of the CURRENT runtime + the PROPOSED s165 design (memo §3),
// calibrated against the built dist, then used to predict what the proposal WOULD decide.


// ───────────────────────── shared math (mirrors analysis/stats.ts + data-analysis.ts) ────────────
const RHO = 0.5;
const signOf = (r) => (r > 0 ? 1 : r < 0 ? -1 : 0);
function pearson(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return null;
  const mx = xs.reduce((s, v) => s + v, 0) / n, my = ys.reduce((s, v) => s + v, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (ys[i] - my); dx += (xs[i] - mx) ** 2; dy += (ys[i] - my) ** 2; }
  const den = Math.sqrt(dx * dy);
  return den === 0 ? null : Number((num / den).toFixed(3));
}
const keyFor = (row, fields) => fields.map((f) => (row[f] === null || row[f] === undefined ? '\0null' : String(row[f]))).join('\0');
function subsetsOf(items) { const out = [[]]; for (const it of items) { const n = out.length; for (let i = 0; i < n; i++) out.push([...out[i], it]); } return out; }
const toNumber = (v) => { const n = Number(v); return Number.isFinite(n) ? n : null; };
function reduceAggregate(values, agg) {
  const nums = values.map(toNumber).filter((v) => v !== null);
  if (agg === 'count') return values.length;
  if (nums.length === 0) return undefined;
  if (agg === 'sum') return nums.reduce((s, v) => s + v, 0);
  if (agg === 'average') return nums.reduce((s, v) => s + v, 0) / nums.length;
  throw new Error('agg ' + agg);
}

// ───────────────────────── spec derivations (mirror data-analysis.ts) ─────────────────────────
const MARK_SHAPE = { MarkPoint: 'point', MarkLine: 'line', MarkBar: 'bar', MarkArea: 'area', MarkRect: 'rect' };
const knownNormalizedMarks = (spec) => spec.marks.map((m) => MARK_SHAPE[m.trait]).filter(Boolean);
const resolveMark = (spec) => { const u = [...new Set(knownNormalizedMarks(spec))]; return u.length === 1 ? u[0] : u.length > 1 ? 'mixed' : 'unknown'; };
const markSplitsByRetina = (m) => m === 'point' || m === 'line' || m === 'area';
const markStacks = (m) => m === 'bar' || m === 'area';
const isStackTotalAggregate = (a) => a === 'sum' || a === 'count';
const RETINAL_GROUPING_CHANNELS = ['color', 'size', 'shape', 'detail'];
const bind = (spec, ch) => spec.encoding[ch];
const isQuant = (b) => b?.type === 'quantitative';
const facetFields = (spec) => (spec.layout?.trait === 'LayoutFacet' ? [spec.layout.columns?.field, spec.layout.rows?.field].filter(Boolean) : []);

function seriesGroupingFields(spec) {
  const mark = resolveMark(spec); const out = [];
  for (const ch of RETINAL_GROUPING_CHANNELS) {
    const f = bind(spec, ch)?.field; if (!f) continue;
    if (ch === 'shape' && !markSplitsByRetina(mark)) continue;
    out.push(f);
  }
  return out;
}
// probe spec shape: x=dimension (positional), y=measure channel.
function drawnCellKeyFields(spec, measureField, stacking) {
  const fields = [];
  const measureChannel = 'y';
  const add = (f) => { if (f && f !== measureField && !fields.includes(f)) fields.push(f); };
  for (const ch of ['x', 'y']) { if (ch === measureChannel) continue; const f = bind(spec, ch)?.field; if (f && !fields.includes(f)) fields.push(f); }
  for (const f of facetFields(spec)) add(f);
  if (!stacking) for (const f of seriesGroupingFields(spec)) add(f);
  return fields;
}
function correlationPartitionFields(spec, dim, measure) {
  const fields = []; const add = (f) => { if (f && f !== dim && f !== measure && !fields.includes(f)) fields.push(f); };
  for (const f of facetFields(spec)) add(f);
  const mark = resolveMark(spec);
  for (const ch of RETINAL_GROUPING_CHANNELS) {
    const b = bind(spec, ch); if (!b?.field || isQuant(b)) continue;
    if (ch === 'shape' && !markSplitsByRetina(mark)) continue;
    add(b.field);
  }
  return fields;
}
function correlationGroupingFields(spec, dim, measure, partition, agg) {
  const stacking = agg ? isStackTotalAggregate(agg) && markStacks(resolveMark(spec)) : false;
  return drawnCellKeyFields(spec, measure, stacking).filter((f) => f !== dim && !partition.includes(f));
}
// ── PROPOSED (memo §3.1) ─────────────────────────────────────────────────────────────────────
function separableFields(spec, dim, measure) {
  const fields = []; const add = (f) => { if (f && f !== dim && f !== measure && !fields.includes(f)) fields.push(f); };
  for (const f of facetFields(spec)) add(f);
  // (no non-primary positional axes in the probe spec shape)
  const marks = knownNormalizedMarks(spec);
  const resolved = resolveMark(spec);
  const shapeSeparable = resolved === 'mixed' || resolved === 'unknown' || marks.some(markSplitsByRetina);
  for (const ch of RETINAL_GROUPING_CHANNELS) {
    const b = bind(spec, ch); if (!b?.field) continue;
    if (ch === 'shape' && !shapeSeparable) continue;
    add(b.field); // color BOTH kinds, size, detail — stacking does NOT drop
  }
  return fields;
}

// ───────────────────────── the gates ─────────────────────────
function drawnSubSeries(rows, dim, measure, keyFields, agg) {
  const bySub = new Map();
  const push = (sub, x, y) => { let s = bySub.get(sub); if (!s) { s = { xs: [], ys: [] }; bySub.set(sub, s); } s.xs.push(x); s.ys.push(y); };
  if (agg) {
    const cells = new Map();
    for (const row of rows) {
      const k = keyFor(row, [dim, ...keyFields]);
      let c = cells.get(k); if (!c) { c = { sub: keyFor(row, keyFields), dim: row[dim], values: [] }; cells.set(k, c); }
      c.values.push(row[measure]);
    }
    for (const c of cells.values()) { const red = reduceAggregate(c.values, agg); const x = toNumber(c.dim); if (red === undefined || x === null) continue; push(c.sub, x, red); }
  } else {
    for (const row of rows) { const x = toNumber(row[dim]), y = toNumber(row[measure]); if (x === null || y === null) continue; push(keyFor(row, keyFields), x, y); }
  }
  return [...bySub.values()];
}
function classifyDrawnSeriesDirection(xs, ys) {
  const n = xs.length; if (n < 2) return 'unknown';
  const mx = xs.reduce((s, v) => s + v, 0) / n; let dx = 0; for (const x of xs) dx += (x - mx) ** 2;
  if (dx === 0) return 'unknown';
  if (n === 2) { const my = (ys[0] + ys[1]) / 2; let cov = 0; for (let i = 0; i < 2; i++) cov += (xs[i] - mx) * (ys[i] - my); return signOf(cov); }
  const r = pearson(xs, ys); if (r === null) return 0;
  return Math.abs(r) >= RHO ? signOf(r) : 0;
}
function classifyGroupDirection(rows, xF, yF) {
  const xs = [], ys = [];
  for (const r of rows) { const x = toNumber(r[xF]), y = toNumber(r[yF]); if (x === null || y === null) continue; xs.push(x); ys.push(y); }
  const n = xs.length; if (n < 2) return 'unknown';
  const mx = xs.reduce((s, v) => s + v, 0) / n; let dx = 0; for (const x of xs) dx += (x - mx) ** 2;
  if (dx === 0) return 'unknown';
  if (n === 2) { const my = (ys[0] + ys[1]) / 2; let cov = 0; for (let i = 0; i < 2; i++) cov += (xs[i] - mx) * (ys[i] - my); return signOf(cov); }
  const r = pearson(xs, ys); return r === null ? 0 : signOf(r);
}
function projectAggregatedRows(rows, dim, measure, agg, grouping) {
  const cells = new Map();
  for (const row of rows) { const k = keyFor(row, [dim, ...grouping]); let c = cells.get(k); if (!c) { c = { dim: row[dim], values: [] }; cells.set(k, c); } c.values.push(row[measure]); }
  const out = [];
  for (const c of cells.values()) { const red = reduceAggregate(c.values, agg); if (red === undefined) continue; out.push({ [dim]: c.dim, [measure]: red }); }
  return out;
}
function classifyCorrelationGroups(rawRows, dim, measure, partition, grouping, agg) {
  const groups = new Map();
  for (const row of rawRows) { const k = keyFor(row, partition); const g = groups.get(k); if (g) g.push(row); else groups.set(k, [row]); }
  const classes = [];
  for (const gr of groups.values()) { const cells = agg ? projectAggregatedRows(gr, dim, measure, agg, grouping) : gr; classes.push(classifyGroupDirection(cells, dim, measure)); }
  return classes;
}
function narratableCorrelation(pooled, classes) {
  const ev = classes.filter((c) => c !== 'unknown');
  if (ev.length === 0) return true;
  if (new Set(ev).size > 1) return false;
  const s = ev[0], ps = signOf(pooled);
  if (s === 0) return ps === 0;
  return ps === 0 || ps === s;
}
// G1 (s164) / G1' (s165) — identical body; only the field inputs + prefix differ.
function oppositionEvidence(rawRows, dim, measure, partition, grouping, agg, pooled, opts = {}) {
  const pooledSign = signOf(pooled); const votes = []; let anyVotable = false, sharesPooled = false;
  let subsetScans = 0, seriesSeen = 0;
  if (grouping.length === 0) return { votes, anyVotable, sharesPooled, pooledSign, suppresses: false, subsetScans, seriesSeen };
  const record = (d) => { if (d === 'unknown') return; anyVotable = true; if (d !== 0) votes.push(d); if (d !== 0 && d === pooledSign) sharesPooled = true; };
  const subsets = subsetsOf(grouping);
  const partitionGroups = new Map();
  for (const row of rawRows) { const k = partition.length === 0 ? '*' : keyFor(row, partition); const g = partitionGroups.get(k); if (g) g.push(row); else partitionGroups.set(k, [row]); }
  for (const gr of partitionGroups.values()) {
    let hasFine = false, emptyVote = null;
    for (const S of subsets) {
      subsetScans++;
      for (const s of drawnSubSeries(gr, dim, measure, S, agg)) {
        seriesSeen++;
        if (new Set(s.xs).size < 2) continue;
        const d = classifyDrawnSeriesDirection(s.xs, s.ys);
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
  return { votes, anyVotable, sharesPooled, pooledSign, suppresses, subsetScans, seriesSeen };
}

// ───────────────────────── the three deriveCorrelation variants ─────────────────────────
export function derive(spec, mode, dimF, measF) {
  const dim = dimF ?? 'x', measure = measF ?? 'y';
  const agg = bind(spec, 'y')?.aggregate;
  const stacking = agg ? isStackTotalAggregate(agg) && markStacks(resolveMark(spec)) : false;
  const valueKey = agg ? drawnCellKeyFields(spec, measure, stacking).filter((f) => f !== dim) : null;
  const rawRows = spec.data.values;
  const valueRows = agg ? projectAggregatedRows(rawRows, dim, measure, agg, valueKey) : rawRows;
  const pooled = pearson(valueRows.map((r) => toNumber(r[dim])), valueRows.map((r) => toNumber(r[measure])));
  if (pooled === null) return { corr: undefined, why: 'pooled null' };
  const partition = correlationPartitionFields(spec, dim, measure);
  const grouping = correlationGroupingFields(spec, dim, measure, partition, agg);
  const sep = separableFields(spec, dim, measure);

  // EARLY RETURN — data-analysis.ts:1662. `current` + `memo-literal` keep it byte-identical (memo §3.3).
  const earlyReturnFires = partition.length === 0 && grouping.length === 0;
  if (mode !== 'amended' && earlyReturnFires) return { corr: pooled, why: 'EARLY-RETURN(:1662) partition=∅ grouping=∅', partition, grouping, sep };
  if (mode === 'amended' && earlyReturnFires && sep.length === 0) return { corr: pooled, why: 'early-return (sep=∅ too)', partition, grouping, sep };

  const g0 = narratableCorrelation(pooled, classifyCorrelationGroups(rawRows, dim, measure, partition, grouping, agg));
  let g1;
  if (mode === 'current') g1 = oppositionEvidence(rawRows, dim, measure, partition, grouping, agg, pooled);
  else g1 = oppositionEvidence(rawRows, dim, measure, [], sep, agg, pooled); // §3.2: separableFields, NO prefix
  return { corr: g0 && !g1.suppresses ? pooled : undefined, why: `g0=${g0} g1sup=${g1.suppresses}`, partition, grouping, sep, ev: g1 };
}


export { separableFields, correlationPartitionFields, correlationGroupingFields, oppositionEvidence, subsetsOf, pearson };
