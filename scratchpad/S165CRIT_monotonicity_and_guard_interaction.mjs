// S165 pre-lock critic — LENS: monotonicity-and-guard-interaction
// Claim under attack (memo §3.2): "the scan is a superset -> monotone: can only add suppression."
//
// Strategy: build a faithful JS reference of the SHIPPED s164 gate (G0 + G1) and of the PROPOSED
// s165 gate (G0 unchanged + G1' = subsets of separableFields, NO partition prefix, same vote rules
// + manufactured-vote guard). Validate the s164 reference against the real dist on control fixtures,
// then search for a spec where dist SUPPRESSES and the proposal NARRATES (non-monotone).

import { analyzeVizSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

const RHO = 0.5;
const round3 = (v) => Math.round(v * 1000) / 1000;

function pearson(xs, ys) {
  const n = xs.length;
  if (n < 3) return null;
  const mx = xs.reduce((s, v) => s + v, 0) / n;
  const my = ys.reduce((s, v) => s + v, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i += 1) { num += (xs[i] - mx) * (ys[i] - my); dx += (xs[i] - mx) ** 2; dy += (ys[i] - my) ** 2; }
  const den = Math.sqrt(dx * dy);
  return den === 0 ? null : round3(num / den);
}
const signOf = (r) => (r > 0 ? 1 : r < 0 ? -1 : 0);
const keyFor = (row, fields) => fields.map((f) => (row[f] === null || row[f] === undefined ? '\0null' : String(row[f]))).join('\0');

function reduceAgg(values, agg) {
  const nums = values.map(Number).filter((v) => Number.isFinite(v));
  if (!nums.length) return undefined;
  if (agg === 'sum') return nums.reduce((s, v) => s + v, 0);
  if (agg === 'average' || agg === 'mean') return nums.reduce((s, v) => s + v, 0) / nums.length;
  if (agg === 'max') return Math.max(...nums);
  if (agg === 'min') return Math.min(...nums);
  if (agg === 'count') return values.length;
  throw new Error('agg?' + agg);
}

// ---- classifiers (data-analysis.ts:1326 and :1427) ----
function classifyGroupDirection(pairs) { // G0 — UNGATED (no rho)
  const xs = pairs.map((p) => p[0]), ys = pairs.map((p) => p[1]);
  const n = xs.length;
  if (n < 2) return 'unknown';
  const mx = xs.reduce((s, v) => s + v, 0) / n;
  let dx = 0; for (const x of xs) dx += (x - mx) ** 2;
  if (dx === 0) return 'unknown';
  if (n === 2) { const my = (ys[0] + ys[1]) / 2; return signOf((xs[0] - mx) * (ys[0] - my) + (xs[1] - mx) * (ys[1] - my)); }
  const r = pearson(xs, ys);
  return r === null ? 0 : signOf(r);
}
function classifyDrawnSeriesDirection(xs, ys) { // G1 — rho-gated at n>=3
  const n = xs.length;
  if (n < 2) return 'unknown';
  const mx = xs.reduce((s, v) => s + v, 0) / n;
  let dx = 0; for (const x of xs) dx += (x - mx) ** 2;
  if (dx === 0) return 'unknown';
  if (n === 2) { const my = (ys[0] + ys[1]) / 2; return signOf((xs[0] - mx) * (ys[0] - my) + (xs[1] - mx) * (ys[1] - my)); }
  const r = pearson(xs, ys);
  if (r === null) return 0;
  return Math.abs(r) >= RHO ? signOf(r) : 0;
}

// ---- drawnSubSeries (:1462) ----
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
      const red = reduceAgg(c.values, agg); const x = Number(c.dim);
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

const subsetsOf = (items) => items.reduce((acc, it) => acc.concat(acc.map((s) => [...s, it])), [[]]);

// ---- G1 (:1542) — s164 SHIPPED: partition-prefixed, subsets of groupingFields ----
function g1_s164(rows, dim, measure, partitionFields, groupingFields, agg, pooled) {
  const pooledSign = signOf(pooled);
  const votes = []; let anyVotable = false, sharesPooled = false;
  if (groupingFields.length === 0) return { suppresses: false, votes, anyVotable, sharesPooled, why: 'no-op (groupingFields=[])' };
  const record = (dir) => { if (dir === 'unknown') return; anyVotable = true; if (dir !== 0) votes.push(dir); if (dir !== 0 && dir === pooledSign) sharesPooled = true; };
  const subsets = subsetsOf(groupingFields);
  const groups = new Map();
  for (const row of rows) { const k = partitionFields.length === 0 ? '*' : keyFor(row, partitionFields); (groups.get(k) || groups.set(k, []).get(k)).push(row); }
  for (const groupRows of groups.values()) {
    let hasFine = false, emptyVote = null;
    for (const S of subsets) {
      for (const s of drawnSubSeries(groupRows, dim, measure, S, agg)) {
        if (new Set(s.xs).size < 2) continue;
        const dir = classifyDrawnSeriesDirection(s.xs, s.ys);
        if (dir === 'unknown') continue;
        if (S.length === 0) { emptyVote = dir; continue; }
        hasFine = true; record(dir);
      }
    }
    if (!hasFine && emptyVote !== null) record(emptyVote);
  }
  return decide(votes, anyVotable, sharesPooled, pooledSign);
}

// ---- G1' (memo §3.2) — PROPOSED: subsets of separableFields, NO partition prefix ----
function g1_s165(rows, dim, measure, separableFields, agg, pooled, trace) {
  const pooledSign = signOf(pooled);
  const votes = []; let anyVotable = false, sharesPooled = false;
  if (separableFields.length === 0) return { suppresses: false, votes, anyVotable, sharesPooled, why: 'no-op (separableFields=[])' };
  const record = (dir) => { if (dir === 'unknown') return; anyVotable = true; if (dir !== 0) votes.push(dir); if (dir !== 0 && dir === pooledSign) sharesPooled = true; };
  let hasFine = false, emptyVote = null;
  for (const S of subsetsOf(separableFields)) {
    for (const s of drawnSubSeries(rows, dim, measure, S, agg)) {
      if (new Set(s.xs).size < 2) continue;
      const dir = classifyDrawnSeriesDirection(s.xs, s.ys);
      if (dir === 'unknown') continue;
      if (trace) trace.push(`    S=[${S.join(',')}] n=${s.xs.length} r=${s.xs.length >= 3 ? pearson(s.xs, s.ys) : '(n=2 slope)'} -> ${S.length === 0 ? 'DEFERRED ' : ''}dir=${dir}`);
      if (S.length === 0) { emptyVote = dir; continue; }
      hasFine = true; record(dir);
    }
  }
  if (!hasFine && emptyVote !== null) record(emptyVote);
  return decide(votes, anyVotable, sharesPooled, pooledSign);
}

function decide(votes, anyVotable, sharesPooled, pooledSign) {
  let suppresses, why;
  if (!anyVotable) { suppresses = false; why = 'fallback: nothing votable'; }
  else if (new Set(votes).size > 1) { suppresses = true; why = '(a) votes disagree'; }
  else if (votes.some((v) => v === -pooledSign)) { suppresses = true; why = '(b) a real opposite'; }
  else { suppresses = pooledSign !== 0 && !sharesPooled; why = suppresses ? '(c) no admitted band shares pooledSign' : 'no opposition'; }
  return { suppresses, votes, anyVotable, sharesPooled, why };
}

// ---- G0 (:1711 + :1383) ----
function g0(rows, dim, measure, partitionFields, groupingFields, agg, pooled) {
  const groups = new Map();
  for (const row of rows) { const k = keyFor(row, partitionFields); (groups.get(k) || groups.set(k, []).get(k)).push(row); }
  const classes = [];
  for (const groupRows of groups.values()) {
    let pairs;
    if (agg) {
      const cells = new Map();
      for (const row of groupRows) {
        const k = keyFor(row, [dim, ...groupingFields]);
        let c = cells.get(k); if (!c) { c = { dim: row[dim], values: [] }; cells.set(k, c); }
        c.values.push(row[measure]);
      }
      pairs = [...cells.values()].map((c) => [Number(c.dim), reduceAgg(c.values, agg)]).filter((p) => Number.isFinite(p[0]) && p[1] !== undefined);
    } else pairs = groupRows.map((r) => [Number(r[dim]), Number(r[measure])]).filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]));
    classes.push(classifyGroupDirection(pairs));
  }
  const evidence = classes.filter((c) => c !== 'unknown');
  const pooledSign = signOf(pooled);
  let narrates;
  if (evidence.length === 0) narrates = true;
  else if (new Set(evidence).size > 1) narrates = false;
  else if (evidence[0] === 0) narrates = pooledSign === 0;
  else narrates = pooledSign === 0 || pooledSign === evidence[0];
  return { classes, narrates };
}

// pooled value = pearson over the cells keyed by (dim + narratedValueCellKey)
function pooledOf(rows, dim, measure, valueKey, agg) {
  let pairs;
  if (agg) {
    const cells = new Map();
    for (const row of rows) {
      const k = keyFor(row, [dim, ...valueKey]);
      let c = cells.get(k); if (!c) { c = { dim: row[dim], values: [] }; cells.set(k, c); }
      c.values.push(row[measure]);
    }
    pairs = [...cells.values()].map((c) => [Number(c.dim), reduceAgg(c.values, agg)]);
  } else pairs = rows.map((r) => [Number(r[dim]), Number(r[measure])]);
  return pearson(pairs.map((p) => p[0]), pairs.map((p) => p[1]));
}

// =====================================================================================
// FIXTURE: "all-flat bands at disjoint x offsets" inside a categorical partition
//   color=seg (CATEGORICAL) -> partitionFields=[seg]
//   size=sz  (QUANTITATIVE) -> skipped by partition, kept by drawnCellKeyFields -> groupingFields=[sz]
//   Every drawn (seg,sz) band is FLAT; the pooled rise is a pure between-band offset artifact.
// =====================================================================================
const rows = [
  // seg A
  { x: 1, y: 10, seg: 'A', sz: 1 }, { x: 2, y: 10, seg: 'A', sz: 1 },
  { x: 3, y: 20, seg: 'A', sz: 2 }, { x: 4, y: 20, seg: 'A', sz: 2 },
  // seg B
  { x: 5, y: 30, seg: 'B', sz: 1 }, { x: 6, y: 30, seg: 'B', sz: 1 },
  { x: 7, y: 40, seg: 'B', sz: 2 }, { x: 8, y: 40, seg: 'B', sz: 2 },
];
const enc = {
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
  y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
  color: { field: 'seg', trait: 'EncodingColor' },
  size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' },
};
const spec = {
  $schema: 'https://oods.dev/viz-spec/v1', id: 'flip', name: 'flip',
  data: { name: 'd', values: rows }, marks: [{ trait: 'MarkPoint', encodings: enc }],
  encoding: enc, a11y: { description: 'y over x' },
};

const dim = 'x', measure = 'y', agg = 'average';
const partitionFields = ['seg'];          // facet + CATEGORICAL retinal
const groupingFields = ['sz'];            // drawnCellKeyFields \ {x, seg}
const separableFields = ['seg', 'sz'];    // memo §3.1
const valueKey = ['seg', 'sz'];           // narratedValueCellKey

const pooled = pooledOf(rows, dim, measure, valueKey, agg);

console.log('################ FIXTURE: all-flat drawn bands, disjoint x offsets ################');
console.log('drawn bands (the marks a viewer can separate):');
for (const S of [['seg', 'sz']]) {
  for (const s of drawnSubSeries(rows, dim, measure, S, agg)) {
    console.log(`  (seg,sz) band xs=${JSON.stringify(s.xs)} ys=${JSON.stringify(s.ys)} -> dir ${classifyDrawnSeriesDirection(s.xs, s.ys)} (FLAT)`);
  }
}
console.log('pooled over drawn cells r =', pooled);

const G0 = g0(rows, dim, measure, partitionFields, groupingFields, agg, pooled);
const S164 = g1_s164(rows, dim, measure, partitionFields, groupingFields, agg, pooled);
const trace = [];
const S165 = g1_s165(rows, dim, measure, separableFields, agg, pooled, trace);

console.log('\n--- G0 (unchanged in both) ---');
console.log('  classes:', JSON.stringify(G0.classes), '-> narrates:', G0.narrates);
console.log('\n--- G1 s164 (SHIPPED: partition-prefixed, subsets of [sz]) ---');
console.log('  votes:', JSON.stringify(S164.votes), 'anyVotable:', S164.anyVotable, 'sharesPooled:', S164.sharesPooled);
console.log('  =>', S164.suppresses ? 'SUPPRESSES' : 'allows', '|', S164.why);
console.log('\n--- G1\' s165 PROPOSAL (subsets of [seg,sz], NO partition prefix) ---');
trace.forEach((l) => console.log(l));
console.log('  votes:', JSON.stringify(S165.votes), 'anyVotable:', S165.anyVotable, 'sharesPooled:', S165.sharesPooled);
console.log('  =>', S165.suppresses ? 'SUPPRESSES' : 'allows', '|', S165.why);

const refS164Final = G0.narrates && !S164.suppresses ? pooled : undefined;
const refS165Final = G0.narrates && !S165.suppresses ? pooled : undefined;
const live = analyzeVizSpec(spec).correlation;

console.log('\n################ VERDICT ################');
console.log('  LIVE dist (s164 shipped)   correlation =', live, live === undefined ? '(SUPPRESSED)' : '(NARRATED)');
console.log('  reference s164 prediction  correlation =', refS164Final);
console.log('  reference s165 PROPOSAL    correlation =', refS165Final);
console.log('  reference matches dist?    ', String(refS164Final) === String(live) ? 'YES (reference validated)' : 'NO (reference is wrong!)');
console.log('  MONOTONE?                  ',
  live === undefined && refS165Final !== undefined
    ? '*** NO — NON-MONOTONE: s164 SUPPRESSES, the s165 proposal NARRATES ***'
    : 'monotone on this fixture');
