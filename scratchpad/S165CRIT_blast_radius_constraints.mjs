// S165 pre-lock critic — lens: blast-radius-constraints.
// Reference implementation of the CURRENT runtime + the PROPOSED s165 design (memo §3),
// calibrated against the built dist, then used to predict what the proposal WOULD decide.
import { analyzeVizSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

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
function derive(spec, mode) {
  const dim = 'x', measure = 'y';
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

// ───────────────────────── fixtures ─────────────────────────
const B_ = (field, trait, extra = {}) => ({ field, trait, ...extra });
function chart(rows, opts = {}) {
  const encoding = { x: B_('x', 'EncodingX', { type: 'quantitative' }), y: B_('y', 'EncodingY', { type: 'quantitative', ...(opts.yAggregate ? { aggregate: opts.yAggregate } : {}) }) };
  if (opts.colorField) encoding.color = B_(opts.colorField, 'EncodingColor', opts.colorQuant ? { type: 'quantitative' } : {});
  if (opts.sizeField) encoding.size = B_(opts.sizeField, 'EncodingSize', { type: 'quantitative' });
  if (opts.detailField) encoding.detail = B_(opts.detailField, 'EncodingDetail', { type: 'quantitative' });
  if (opts.shapeField) encoding.shape = B_(opts.shapeField, 'EncodingShape');
  const marks = (opts.marks ?? [opts.mark ?? 'MarkPoint']).map((t) => ({ trait: t, encodings: { ...encoding } }));
  return { $schema: 'https://oods.dev/viz-spec/v1', id: 'c', name: 'c', data: { name: 'd', values: rows }, marks, encoding, a11y: { description: 'y over x' } };
}
const R = {
  defect1: () => { const r = []; const a = (x, y, seg, sz) => r.push({ x, y, seg, sz }); a(1,50,'A',100);a(2,40,'A',100);a(3,30,'A',100);a(4,250,'A',200);a(5,240,'A',200);a(6,230,'A',200);a(1,1050,'B',100);a(2,1040,'B',100);a(3,1030,'B',100);a(4,1250,'B',200);a(5,1240,'B',200);a(6,1230,'B',200); return r; },
  defect2: () => { const r = []; for (const seg of ['A','B']) r.push({x:1,y:10,seg,d:1},{x:2,y:9,seg,d:1},{x:3,y:100,seg,d:2},{x:4,y:99,seg,d:2}); return r; },
  defect5: () => { const r=[]; const a=(x,y,sz)=>r.push({x,y,sz}); a(1,50,10);a(2,40,10);a(3,30,10);a(4,250,20);a(5,240,20);a(6,230,20);a(7,450,30);a(8,440,30);a(9,430,30); return r; },
  defect6: () => { const r=[]; const a=(x,y,sz)=>r.push({x,y,sz}); a(1,100,10);a(2,60,10);a(3,20,10);a(4,2000,50);a(5,1960,50);a(6,1920,50);a(7,4000,90);a(8,3960,90);a(9,3920,90); return r; },
  defect6c: () => { const r=[]; const a=(x,y,sz)=>r.push({x,y,sz}); a(1,100,10);a(2,99,10);a(3,98,10);a(4,97,10);a(5,96,10);a(6,900,50);a(7,899,50);a(8,898,50);a(9,897,50);a(10,896,50);a(11,1800,90);a(12,1799,90);a(13,1798,90);a(14,1797,90);a(15,1796,90); return r; },
  defect7: () => { const r=[]; let id=0; const a=(x,y,seg,size)=>{id++;r.push({x,y,seg,size,det:id});}; a(1,160,'A',10);a(2,80,'A',10);a(3,260,'A',20);a(4,180,'A',20);a(1,360,'B',10);a(2,280,'B',10);a(3,460,'B',20);a(4,380,'B',20); return r; },
  case6: () => [{x:1,y:1,seg:'A',sz:10},{x:2,y:2,seg:'A',sz:10},{x:3,y:3,seg:'A',sz:10},{x:1,y:3,seg:'A',sz:20},{x:2,y:2,seg:'A',sz:20},{x:3,y:1,seg:'A',sz:20}],
  defect9: () => [{x:1,y:100,sz:10,det:1},{x:2,y:105,sz:10,det:1},{x:3,y:60,sz:10,det:2},{x:4,y:65,sz:10,det:2},{x:5,y:20,sz:10,det:3},{x:6,y:25,sz:10,det:3},{x:1,y:200,sz:20,det:4},{x:2,y:260,sz:20,det:4},{x:3,y:320,sz:20,det:5},{x:4,y:380,sz:20,det:5},{x:5,y:440,sz:20,det:6},{x:6,y:500,sz:20,det:6}],
  disjointFlat: () => [{x:1,y:10,seg:'A',sz:10},{x:2,y:10,seg:'A',sz:10},{x:3,y:100,seg:'A',sz:20},{x:4,y:100,seg:'A',sz:20}],
  twoAxisAllFall: () => { const r=[]; let w=0; for (const seg of ['A','B']) for (const sz of [10,20]) for (const dt of [1,2]) { const x0=w*3; w++; const lift=w*1000; r.push({x:x0+1,y:lift+100,seg,sz,dt},{x:x0+2,y:lift+90,seg,sz,dt},{x:x0+3,y:lift+80,seg,sz,dt}); } return r; },
  allRise: () => { const r=[]; for (const seg of ['A','B']) for (const sz of [10,20]) r.push({x:1,y:1+sz,seg,sz},{x:2,y:2+sz,seg,sz},{x:3,y:3+sz,seg,sz}); return r; },
  case3Flat: () => [{x:1,y:11,seg:'A',sz:10},{x:2,y:12,seg:'A',sz:10},{x:3,y:13,seg:'A',sz:10},{x:1,y:21,seg:'A',sz:20},{x:2,y:22,seg:'A',sz:20},{x:3,y:23,seg:'A',sz:20},{x:1,y:50,seg:'B',sz:10},{x:2,y:50,seg:'B',sz:10},{x:3,y:50,seg:'B',sz:10},{x:1,y:71,seg:'B',sz:20},{x:2,y:72,seg:'B',sz:20},{x:3,y:73,seg:'B',sz:20}],
  weakScatter: () => [{x:1,y:10,seg:'A',sz:10},{x:2,y:20,seg:'A',sz:10},{x:3,y:30,seg:'A',sz:10},{x:1,y:52,seg:'A',sz:20},{x:2,y:49,seg:'A',sz:20},{x:3,y:51,seg:'A',sz:20}],
  continuousRamp: () => { const r=[]; const mk=(seg,x,y,sz)=>r.push({x,y,seg,sz}); for (const seg of ['A','B']) { const o=seg==='A'?0:1; mk(seg,1,100+o,9.001+o*0.0001); mk(seg,1,90+o,8.001+o*0.0001); mk(seg,2,40+o,2.001+o*0.0001); mk(seg,2,30+o,1.001+o*0.0001); } return r; },
  honestMultiAxis: () => { const r=[]; for (const seg of ['A','B']) for (const sz of [10,20]) for (const dt of [1,2]) { const base=sz+dt*5+(seg==='A'?0:3); r.push({x:1,y:base+1,seg,sz,dt},{x:2,y:base+5,seg,sz,dt},{x:3,y:base+10,seg,sz,dt}); } return r; },
  rhoCliff: () => { const r=[]; [100,100,100,100,100,0].forEach((y,i)=>r.push({x:i+1,y,sz:10})); [10,30,60,90,120,150].forEach((y,i)=>r.push({x:i+1,y:y+1000,sz:20})); return r; },
  rhoScatter: () => { const r=[]; [10,20,30,40,50].forEach((y,i)=>r.push({x:i+1,y,sz:10})); [55,49,54,50,52].forEach((y,i)=>r.push({x:i+1,y:y+100,sz:20})); return r; },
  defect4: () => { const r=[]; const base=[['A',1,20],['A',2,10],['B',3,100],['B',4,90]]; let c=0; for (const [seg,x,y] of base) { c++; r.push({x,y,seg,sz:1.0+c*0.5}); } return r; },
  f5Stacking: () => [[1,30,'A',10],[2,20,'A',10],[3,10,'A',10],[1,5,'B',20],[2,25,'B',20],[3,60,'B',20]].map(([x,y,seg,sz])=>({x,y,seg,sz})),
  n2Opposite: () => [{x:1,y:10,sz:10},{x:2,y:20,sz:10},{x:3,y:30,sz:10},{x:4,y:105,sz:20},{x:5,y:104,sz:20}],
  weakConsistentNoGrouping: () => { const r=[]; const g=(seg,base)=>r.push({x:1,y:base+0,seg},{x:2,y:base+3,seg},{x:3,y:base-1,seg},{x:4,y:base+4,seg}); g('R',0); g('S',100); g('T',200); return r; },
  survivorA: () => [{x:1,y:30,shp:'circle'},{x:2,y:20,shp:'circle'},{x:3,y:10,shp:'circle'},{x:4,y:130,shp:'square'},{x:5,y:120,shp:'square'},{x:6,y:110,shp:'square'}],
  survivorAhonest: () => [{x:1,y:10,shp:'circle'},{x:2,y:20,shp:'circle'},{x:3,y:30,shp:'circle'},{x:4,y:110,shp:'square'},{x:5,y:120,shp:'square'},{x:6,y:130,shp:'square'}],
  survivorB: () => [{x:1,y:50,c:100},{x:2,y:40,c:100},{x:3,y:30,c:100},{x:1,y:10,c:200},{x:2,y:60,c:200},{x:3,y:110,c:200}],
  survivorC: () => [{x:1,y:10,seg:'p',sz:1},{x:2,y:8,seg:'q',sz:1},{x:3,y:6,seg:'r',sz:1},{x:1,y:20,seg:'p',sz:2},{x:2,y:30,seg:'q',sz:2},{x:3,y:40,seg:'r',sz:2}],
};

const CASES = [
  ['s164 defect1', chart(R.defect1(), { colorField:'seg', sizeField:'sz', yAggregate:'average' }), 'RED-kill'],
  ['s164 defect2', chart(R.defect2(), { colorField:'seg', detailField:'d', yAggregate:'average' }), 'RED-kill'],
  ['s164 defect5', chart(R.defect5(), { sizeField:'sz', yAggregate:'average' }), 'RED-kill'],
  ['s164 defect6', chart(R.defect6(), { sizeField:'sz', yAggregate:'average' }), 'RED-kill'],
  ['s164 defect6c', chart(R.defect6c(), { sizeField:'sz', yAggregate:'average' }), 'RED-kill'],
  ['s164 defect7', chart(R.defect7(), { colorField:'seg', sizeField:'size', detailField:'det', yAggregate:'average' }), 'RED-kill'],
  ['s164 CASE6', chart(R.case6(), { colorField:'seg', sizeField:'sz', yAggregate:'average' }), 'RED-kill'],
  ['s164 defect9 nested', chart(R.defect9(), { sizeField:'sz', detailField:'det', yAggregate:'average' }), 'RED-kill'],
  ['s164 disjointFlat', chart(R.disjointFlat(), { colorField:'seg', sizeField:'sz', yAggregate:'average' }), 'RED-kill'],
  ['s164 twoAxisAllFall', chart(R.twoAxisAllFall(), { colorField:'seg', sizeField:'sz', detailField:'dt', yAggregate:'average' }), 'RED-kill'],
  ['s164 n2Opposite', chart(R.n2Opposite(), { sizeField:'sz', yAggregate:'average' }), 'RED-kill'],
  ['s164 rhoCliff', chart(R.rhoCliff(), { sizeField:'sz', yAggregate:'average' }), 'RED-kill'],
  ['s164 defect4 (G0)', chart(R.defect4(), { colorField:'seg', sizeField:'sz', yAggregate:'average' }), 'stay-undef'],
  ['s164 F5 stacking (G0)', chart(R.f5Stacking(), { colorField:'seg', sizeField:'sz', yAggregate:'sum', mark:'MarkBar' }), 'stay-undef'],
  ['KEEP allRise', chart(R.allRise(), { colorField:'seg', sizeField:'sz', yAggregate:'average' }), 'KEEP'],
  ['KEEP case3Flat', chart(R.case3Flat(), { colorField:'seg', sizeField:'sz', yAggregate:'average' }), 'KEEP'],
  ['KEEP weakScatter', chart(R.weakScatter(), { colorField:'seg', sizeField:'sz', yAggregate:'average' }), 'KEEP'],
  ['KEEP continuousRamp', chart(R.continuousRamp(), { colorField:'seg', sizeField:'sz', yAggregate:'average' }), 'KEEP'],
  ['KEEP honestMultiAxis', chart(R.honestMultiAxis(), { colorField:'seg', sizeField:'sz', detailField:'dt', yAggregate:'average' }), 'KEEP'],
  ['KEEP rhoScatter', chart(R.rhoScatter(), { sizeField:'sz', yAggregate:'average' }), 'KEEP'],
  ['KEEP weakConsistentNoGrouping', chart(R.weakConsistentNoGrouping(), { colorField:'seg' }), 'KEEP (s164 "G1 no-op" test)'],
  ['SURVIVOR A mixed+shape', chart(R.survivorA(), { shapeField:'shp', marks:['MarkLine','MarkPoint'] }), 'RED-kill'],
  ['ctlA single-point+shape', chart(R.survivorA(), { shapeField:'shp', marks:['MarkPoint'] }), 'stay-undef'],
  ['SANITY A honest mixed+shape', chart(R.survivorAhonest(), { shapeField:'shp', marks:['MarkLine','MarkPoint'] }), 'KEEP'],
  ['SURVIVOR B quant-color stack', chart(R.survivorB(), { colorField:'c', colorQuant:true, yAggregate:'sum', mark:'MarkBar' }), 'RED-kill'],
  ['ctlB cat-color stack', chart(R.survivorB(), { colorField:'c', yAggregate:'sum', mark:'MarkBar' }), 'stay-undef'],
  ['SURVIVOR C collinear+size', chart(R.survivorC(), { colorField:'seg', sizeField:'sz', yAggregate:'average' }), 'RED-kill'],
];

console.log('╔══════════════════════════════════════════════════════════════════════════════════════════╗');
console.log('║ (0) CALIBRATION: reference `current` model vs the built dist analyzeVizSpec().correlation ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════════════════╝');
let mismatch = 0;
for (const [name, spec] of CASES) {
  const live = analyzeVizSpec(spec).correlation;
  const ref = derive(spec, 'current').corr;
  const ok = (live === undefined && ref === undefined) || (live !== undefined && ref !== undefined && Math.abs(live - ref) < 1e-9);
  if (!ok) mismatch++;
  console.log(`${ok ? '  OK ' : ' XX '} ${name.padEnd(34)} dist=${String(live).padEnd(8)} ref=${String(ref)}`);
}
console.log(`\n  calibration mismatches: ${mismatch} / ${CASES.length}\n`);

console.log('╔═══════════════════════════════════════════════════════════════════════════════════════════════╗');
console.log('║ (1) WHAT THE MEMO AS WRITTEN DECIDES  —  memo-literal keeps the :1662 early return byte-ident. ║');
console.log('╚═══════════════════════════════════════════════════════════════════════════════════════════════╝');
const rows = [];
for (const [name, spec, want] of CASES) {
  const cur = derive(spec, 'current');
  const lit = derive(spec, 'memo-literal');
  const amd = derive(spec, 'amended');
  const f = (d) => (d.corr === undefined ? 'undef' : String(Number(d.corr.toFixed(3))));
  rows.push({ name, want, current: f(cur), memoLiteral: f(lit), amended: f(amd), P: `[${cur.partition}]`, G: `[${cur.grouping}]`, SEP: `[${cur.sep}]`, litWhy: lit.why.slice(0, 30) });
}
console.table(rows);

console.log('\n── VERDICT ROWS ──');
for (const r of rows) {
  let flag = '';
  if (r.want === 'RED-kill') {
    flag = r.memoLiteral === 'undef' ? 'memo-literal KILLS' : `*** memo-literal STILL NARRATES ${r.memoLiteral} — PHANTOM SHIPS ***`;
    if (r.memoLiteral !== 'undef' && r.amended === 'undef') flag += '  (amended early-return DOES kill it)';
  } else if (r.want === 'KEEP') {
    flag = r.memoLiteral !== 'undef' ? 'kept' : `*** OVER-SUPPRESSED (was ${r.current}) ***`;
  } else {
    flag = r.memoLiteral === 'undef' ? 'stays undefined' : `*** REGRESSION: now narrates ${r.memoLiteral} ***`;
  }
  console.log(`  ${r.name.padEnd(34)} want=${r.want.padEnd(24)} cur=${r.current.padEnd(8)} lit=${r.memoLiteral.padEnd(8)} amd=${r.amended.padEnd(8)} ${flag}`);
}

console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
console.log('║ (2) s164 PROOF-SPEC ASSERTION BREAKAGE: correlationOppositionEvidence()     ║');
console.log('╚════════════════════════════════════════════════════════════════════════════╝');
{
  const spec = chart(R.weakConsistentNoGrouping(), { colorField: 'seg' });
  const dim='x', measure='y', agg=undefined;
  const rawRows = spec.data.values;
  const pooled = pearson(rawRows.map(r=>r.x), rawRows.map(r=>r.y));
  const P = correlationPartitionFields(spec, dim, measure), G = correlationGroupingFields(spec, dim, measure, P, agg), S = separableFields(spec, dim, measure);
  const evNow = oppositionEvidence(rawRows, dim, measure, P, G, agg, pooled);
  const evNew = oppositionEvidence(rawRows, dim, measure, [], S, agg, pooled);
  console.log('  spec = chart(rowsWeakConsistentNoGrouping, {colorField:"seg"})   pooled =', pooled);
  console.log('  TODAY   partition=', P, 'grouping=', G, '=> evidence', JSON.stringify({votes:evNow.votes, suppresses:evNow.suppresses}));
  console.log('  s165    separable=', S, '(no prefix)      => evidence', JSON.stringify({votes:evNew.votes, suppresses:evNew.suppresses}));
  console.log('  s164 spec line ~313 asserts  expect(ev.votes).toEqual([])   ->', JSON.stringify(evNew.votes) === '[]' ? 'GREEN' : '*** RED ***');
  console.log('  s164 spec "BYTE-IDENTITY ... still NARRATES" ->', derive(spec,'memo-literal').corr !== undefined ? 'GREEN' : '*** RED ***');
}

console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
console.log('║ (3) PERFORMANCE / DETERMINISM: subset-scan cost inside analyzeVizSpec       ║');
console.log('╚════════════════════════════════════════════════════════════════════════════╝');
function synth(n, k) {
  // k separable fields (facet, color, size, detail, shape, second-positional stand-ins)
  const rows = [];
  for (let i = 0; i < n; i++) {
    const r = { x: i % 200, y: Math.sin(i) * 100 + i };
    for (let f = 0; f < k; f++) r['f' + f] = `v${i % (2 + f)}`;
    rows.push(r);
  }
  return rows;
}
for (const [n, k] of [[1000, 3], [1000, 6], [5000, 6], [20000, 6], [20000, 7]]) {
  const rowsN = synth(n, k);
  const fields = Array.from({ length: k }, (_, i) => 'f' + i);
  const pooled = pearson(rowsN.map(r => r.x), rowsN.map(r => r.y)) ?? 0.5;
  const t0 = process.hrtime.bigint();
  const ev = oppositionEvidence(rowsN, 'x', 'y', [], fields, 'average', pooled);
  const t1 = process.hrtime.bigint();
  console.log(`  n=${String(n).padStart(6)} |sep|=${k}  subsets=${2 ** k}  subsetScans=${ev.subsetScans}  seriesBuckets=${ev.seriesSeen}  time=${Number(t1 - t0) / 1e6}ms`);
}
console.log('\n  (for reference: s164 today scans 2^|groupingFields| with |G|<=4 AND the row set is split by the partition first)');

console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
console.log('║ (4) memo §3.2 monotonicity claim: is the s165 scan really a SUPERSET?       ║');
console.log('╚════════════════════════════════════════════════════════════════════════════╝');
for (const [name, spec] of CASES) {
  const d = derive(spec, 'current');
  if (!d.partition) continue;
  const s164Groups = subsetsOf(d.grouping || []).map(S => [...(d.partition||[]), ...S].sort().join('+'));
  const s165Groups = subsetsOf(d.sep || []).map(S => S.slice().sort().join('+'));
  const missing = s164Groups.filter(g => !s165Groups.includes(g));
  if (missing.length) console.log(`  ${name}: s164 scanned key(s) the s165 scan DOES NOT contain -> ${JSON.stringify([...new Set(missing)])}`);
}
console.log('  (empty above = every s164 (P∪S) key is also an s165 S key)');
