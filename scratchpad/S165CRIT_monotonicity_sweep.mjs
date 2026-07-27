// S165 pre-lock critic — LENS: monotonicity-and-guard-interaction (SWEEP)
// Runs the reference s164 gate (validated against dist) and the reference s165 PROPOSAL gate over the
// ENTIRE shipped s164 proof-spec fixture set (correlation-drawn-mark-direction-s164.spec.ts) plus the
// 3 s165 survivors, and reports every DIRECTION of change.

import { analyzeVizSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

const RHO = 0.5;
const round3 = (v) => Math.round(v * 1000) / 1000;
function pearson(xs, ys) {
  const n = xs.length; if (n < 3) return null;
  const mx = xs.reduce((s, v) => s + v, 0) / n, my = ys.reduce((s, v) => s + v, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i += 1) { num += (xs[i] - mx) * (ys[i] - my); dx += (xs[i] - mx) ** 2; dy += (ys[i] - my) ** 2; }
  const den = Math.sqrt(dx * dy); return den === 0 ? null : round3(num / den);
}
const signOf = (r) => (r > 0 ? 1 : r < 0 ? -1 : 0);
const keyFor = (row, fields) => fields.map((f) => (row[f] === null || row[f] === undefined ? '\0null' : String(row[f]))).join('\0');
function reduceAgg(values, agg) {
  const nums = values.map(Number).filter((v) => Number.isFinite(v));
  if (!nums.length) return undefined;
  if (agg === 'sum') return nums.reduce((s, v) => s + v, 0);
  if (agg === 'average') return nums.reduce((s, v) => s + v, 0) / nums.length;
  throw new Error('agg?' + agg);
}
function classifyGroupDirection(pairs) {
  const xs = pairs.map((p) => p[0]), ys = pairs.map((p) => p[1]); const n = xs.length;
  if (n < 2) return 'unknown';
  const mx = xs.reduce((s, v) => s + v, 0) / n; let dx = 0; for (const x of xs) dx += (x - mx) ** 2;
  if (dx === 0) return 'unknown';
  if (n === 2) { const my = (ys[0] + ys[1]) / 2; return signOf((xs[0] - mx) * (ys[0] - my) + (xs[1] - mx) * (ys[1] - my)); }
  const r = pearson(xs, ys); return r === null ? 0 : signOf(r);
}
function classifyDrawn(xs, ys) {
  const n = xs.length; if (n < 2) return 'unknown';
  const mx = xs.reduce((s, v) => s + v, 0) / n; let dx = 0; for (const x of xs) dx += (x - mx) ** 2;
  if (dx === 0) return 'unknown';
  if (n === 2) { const my = (ys[0] + ys[1]) / 2; return signOf((xs[0] - mx) * (ys[0] - my) + (xs[1] - mx) * (ys[1] - my)); }
  const r = pearson(xs, ys); if (r === null) return 0;
  return Math.abs(r) >= RHO ? signOf(r) : 0;
}
function drawnSubSeries(rows, dim, measure, keyFields, agg) {
  const bySub = new Map();
  const push = (sub, x, y) => { let s = bySub.get(sub); if (!s) { s = { xs: [], ys: [] }; bySub.set(sub, s); } s.xs.push(x); s.ys.push(y); };
  if (agg) {
    const cells = new Map();
    for (const row of rows) {
      const k = keyFor(row, [dim, ...keyFields]); let c = cells.get(k);
      if (!c) { c = { sub: keyFor(row, keyFields), dim: row[dim], values: [] }; cells.set(k, c); }
      c.values.push(row[measure]);
    }
    for (const c of cells.values()) { const red = reduceAgg(c.values, agg); const x = Number(c.dim); if (red === undefined || !Number.isFinite(x)) continue; push(c.sub, x, red); }
  } else {
    for (const row of rows) { const x = Number(row[dim]), y = Number(row[measure]); if (!Number.isFinite(x) || !Number.isFinite(y)) continue; push(keyFor(row, keyFields), x, y); }
  }
  return [...bySub.values()];
}
const subsetsOf = (items) => items.reduce((acc, it) => acc.concat(acc.map((s) => [...s, it])), [[]]);
function decide(votes, anyVotable, sharesPooled, pooledSign) {
  if (!anyVotable) return { suppresses: false, why: 'fallback: nothing votable', votes, sharesPooled };
  if (new Set(votes).size > 1) return { suppresses: true, why: '(a) votes disagree', votes, sharesPooled };
  if (votes.some((v) => v === -pooledSign)) return { suppresses: true, why: '(b) a real opposite', votes, sharesPooled };
  const s = pooledSign !== 0 && !sharesPooled;
  return { suppresses: s, why: s ? '(c) no admitted band shares pooledSign' : 'no opposition', votes, sharesPooled };
}
function g1(rows, dim, measure, partitionFields, fields, agg, pooled, prefixed) {
  const pooledSign = signOf(pooled); const votes = []; let anyVotable = false, sharesPooled = false;
  if (fields.length === 0) return { suppresses: false, why: 'no-op (fields=[])', votes, sharesPooled };
  const record = (dir) => { if (dir === 'unknown') return; anyVotable = true; if (dir !== 0) votes.push(dir); if (dir !== 0 && dir === pooledSign) sharesPooled = true; };
  const subsets = subsetsOf(fields);
  const groups = new Map();
  for (const row of rows) { const k = prefixed && partitionFields.length ? keyFor(row, partitionFields) : '*'; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(row); }
  for (const groupRows of groups.values()) {
    let hasFine = false, emptyVote = null;
    for (const S of subsets) for (const s of drawnSubSeries(groupRows, dim, measure, S, agg)) {
      if (new Set(s.xs).size < 2) continue;
      const dir = classifyDrawn(s.xs, s.ys); if (dir === 'unknown') continue;
      if (S.length === 0) { emptyVote = dir; continue; }
      hasFine = true; record(dir);
    }
    if (!hasFine && emptyVote !== null) record(emptyVote);
  }
  return decide(votes, anyVotable, sharesPooled, pooledSign);
}
function g0(rows, dim, measure, partitionFields, groupingFields, agg, pooled) {
  const groups = new Map();
  for (const row of rows) { const k = keyFor(row, partitionFields); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(row); }
  const classes = [];
  for (const groupRows of groups.values()) {
    let pairs;
    if (agg) {
      const cells = new Map();
      for (const row of groupRows) { const k = keyFor(row, [dim, ...groupingFields]); if (!cells.has(k)) cells.set(k, { dim: row[dim], values: [] }); cells.get(k).values.push(row[measure]); }
      pairs = [...cells.values()].map((c) => [Number(c.dim), reduceAgg(c.values, agg)]).filter((p) => Number.isFinite(p[0]) && p[1] !== undefined);
    } else pairs = groupRows.map((r) => [Number(r[dim]), Number(r[measure])]).filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]));
    classes.push(classifyGroupDirection(pairs));
  }
  const evidence = classes.filter((c) => c !== 'unknown'); const ps = signOf(pooled);
  let narrates;
  if (!evidence.length) narrates = true;
  else if (new Set(evidence).size > 1) narrates = false;
  else if (evidence[0] === 0) narrates = ps === 0;
  else narrates = ps === 0 || ps === evidence[0];
  return { classes, narrates };
}
function pooledOf(rows, dim, measure, valueKey, agg) {
  let pairs;
  if (agg) {
    const cells = new Map();
    for (const row of rows) { const k = keyFor(row, [dim, ...valueKey]); if (!cells.has(k)) cells.set(k, { dim: row[dim], values: [] }); cells.get(k).values.push(row[measure]); }
    pairs = [...cells.values()].map((c) => [Number(c.dim), reduceAgg(c.values, agg)]);
  } else pairs = rows.map((r) => [Number(r[dim]), Number(r[measure])]);
  return pearson(pairs.map((p) => p[0]), pairs.map((p) => p[1]));
}

// ---- spec builder mirroring the s164 spec helper `chart()` ----
function chart(rows, opts = {}) {
  const enc = { x: { field: 'x', trait: 'EncodingX', type: 'quantitative' }, y: { field: 'y', trait: 'EncodingY', type: 'quantitative', ...(opts.yAggregate ? { aggregate: opts.yAggregate } : {}) } };
  if (opts.colorField) enc.color = { field: opts.colorField, trait: 'EncodingColor', ...(opts.colorQuant ? { type: 'quantitative' } : {}) };
  if (opts.sizeField) enc.size = { field: opts.sizeField, trait: 'EncodingSize', type: 'quantitative' };
  if (opts.detailField) enc.detail = { field: opts.detailField, trait: 'EncodingDetail', type: 'quantitative' };
  if (opts.shapeField) enc.shape = { field: opts.shapeField, trait: 'EncodingShape' };
  const marks = (opts.marks ?? [opts.mark ?? 'MarkPoint']).map((m) => ({ trait: m, encodings: { ...enc } }));
  return { $schema: 'https://oods.dev/viz-spec/v1', id: 'c', name: 'c', data: { name: 'c', values: rows }, marks, encoding: enc, a11y: { description: 'y over x' } };
}
// field derivations for these fixtures (no facet used here)
function fieldsFor(opts) {
  const mixed = (opts.marks ?? [opts.mark ?? 'MarkPoint']).length > 1;
  const markName = mixed ? 'mixed' : (opts.mark ?? 'MarkPoint').replace('Mark', '').toLowerCase();
  const splits = ['point', 'line', 'area'].includes(markName);
  const stacking = opts.yAggregate === 'sum' && ['bar', 'area'].includes(markName);
  const series = [];                       // seriesGroupingFields order: color,size,shape,detail
  if (opts.colorField) series.push(opts.colorField);
  if (opts.sizeField) series.push(opts.sizeField);
  if (opts.shapeField && splits) series.push(opts.shapeField);
  if (opts.detailField) series.push(opts.detailField);
  const drawnKey = stacking ? [] : series;                       // minus dim x (x is the dim)
  const partition = [];                                          // categorical retinal only
  if (opts.colorField && !opts.colorQuant) partition.push(opts.colorField);
  if (opts.shapeField && splits) partition.push(opts.shapeField);
  const grouping = drawnKey.filter((f) => !partition.includes(f));
  const separable = [];                                          // memo §3.1
  if (opts.colorField) separable.push(opts.colorField);
  if (opts.sizeField) separable.push(opts.sizeField);
  if (opts.shapeField && (splits || mixed)) separable.push(opts.shapeField);
  if (opts.detailField) separable.push(opts.detailField);
  return { partition, grouping, separable, valueKey: drawnKey, agg: opts.yAggregate };
}

// ---- the shipped s164 fixtures ----
const F = {};
F.defect1 = () => { const r = []; const a = (x, y, seg, sz) => r.push({ x, y, seg, sz });
  a(1,50,'A',100);a(2,40,'A',100);a(3,30,'A',100);a(4,250,'A',200);a(5,240,'A',200);a(6,230,'A',200);
  a(1,1050,'B',100);a(2,1040,'B',100);a(3,1030,'B',100);a(4,1250,'B',200);a(5,1240,'B',200);a(6,1230,'B',200); return r; };
F.defect2 = () => { const r = []; for (const seg of ['A','B']) r.push({x:1,y:10,seg,d:1},{x:2,y:9,seg,d:1},{x:3,y:100,seg,d:2},{x:4,y:99,seg,d:2}); return r; };
F.defect5 = () => { const r = []; const a=(x,y,sz)=>r.push({x,y,sz}); a(1,50,10);a(2,40,10);a(3,30,10);a(4,250,20);a(5,240,20);a(6,230,20);a(7,450,30);a(8,440,30);a(9,430,30); return r; };
F.defect6 = () => { const r = []; const a=(x,y,sz)=>r.push({x,y,sz}); a(1,100,10);a(2,60,10);a(3,20,10);a(4,2000,50);a(5,1960,50);a(6,1920,50);a(7,4000,90);a(8,3960,90);a(9,3920,90); return r; };
F.defect6c = () => { const r=[]; const a=(x,y,sz)=>r.push({x,y,sz});
  [100,99,98,97,96].forEach((y,i)=>a(i+1,y,10)); [900,899,898,897,896].forEach((y,i)=>a(i+6,y,50)); [1800,1799,1798,1797,1796].forEach((y,i)=>a(i+11,y,90)); return r; };
F.defect7 = () => { const r=[]; let id=0; const a=(x,y,seg,size)=>{id++;r.push({x,y,seg,size,det:id});};
  a(1,160,'A',10);a(2,80,'A',10);a(3,260,'A',20);a(4,180,'A',20);a(1,360,'B',10);a(2,280,'B',10);a(3,460,'B',20);a(4,380,'B',20); return r; };
F.defect8 = () => [{x:1,y:1,seg:'A',sz:10},{x:2,y:2,seg:'A',sz:10},{x:3,y:3,seg:'A',sz:10},{x:1,y:3,seg:'A',sz:20},{x:2,y:2,seg:'A',sz:20},{x:3,y:1,seg:'A',sz:20}];
F.defect9 = () => [
  {x:1,y:100,sz:10,det:1},{x:2,y:105,sz:10,det:1},{x:3,y:60,sz:10,det:2},{x:4,y:65,sz:10,det:2},{x:5,y:20,sz:10,det:3},{x:6,y:25,sz:10,det:3},
  {x:1,y:200,sz:20,det:4},{x:2,y:260,sz:20,det:4},{x:3,y:320,sz:20,det:5},{x:4,y:380,sz:20,det:5},{x:5,y:440,sz:20,det:6},{x:6,y:500,sz:20,det:6}];
F.disjointFlat = () => [{x:1,y:10,seg:'A',sz:10},{x:2,y:10,seg:'A',sz:10},{x:3,y:100,seg:'A',sz:20},{x:4,y:100,seg:'A',sz:20}];
F.twoAxisAllFall = () => { const r=[]; let w=0; for (const seg of ['A','B']) for (const sz of [10,20]) for (const dt of [1,2]) { const x0=w*3; w++; const lift=w*1000; r.push({x:x0+1,y:lift+100,seg,sz,dt},{x:x0+2,y:lift+90,seg,sz,dt},{x:x0+3,y:lift+80,seg,sz,dt}); } return r; };
F.n2Opposite = () => [{x:1,y:10,sz:10},{x:2,y:20,sz:10},{x:3,y:30,sz:10},{x:4,y:105,sz:20},{x:5,y:104,sz:20}];
F.allRise = () => { const r=[]; for (const seg of ['A','B']) for (const sz of [10,20]) r.push({x:1,y:1+sz,seg,sz},{x:2,y:2+sz,seg,sz},{x:3,y:3+sz,seg,sz}); return r; };
F.case3Flat = () => [{x:1,y:11,seg:'A',sz:10},{x:2,y:12,seg:'A',sz:10},{x:3,y:13,seg:'A',sz:10},{x:1,y:21,seg:'A',sz:20},{x:2,y:22,seg:'A',sz:20},{x:3,y:23,seg:'A',sz:20},
  {x:1,y:50,seg:'B',sz:10},{x:2,y:50,seg:'B',sz:10},{x:3,y:50,seg:'B',sz:10},{x:1,y:71,seg:'B',sz:20},{x:2,y:72,seg:'B',sz:20},{x:3,y:73,seg:'B',sz:20}];
F.weakScatter = () => [{x:1,y:10,seg:'A',sz:10},{x:2,y:20,seg:'A',sz:10},{x:3,y:30,seg:'A',sz:10},{x:1,y:52,seg:'A',sz:20},{x:2,y:49,seg:'A',sz:20},{x:3,y:51,seg:'A',sz:20}];
F.continuousRamp = () => { const r=[]; for (const seg of ['A','B']) { const o = seg==='A'?0:1;
  r.push({x:1,y:100+o,seg,sz:9.001+o*0.0001},{x:1,y:90+o,seg,sz:8.001+o*0.0001},{x:2,y:40+o,seg,sz:2.001+o*0.0001},{x:2,y:30+o,seg,sz:1.001+o*0.0001}); } return r; };
F.honestMultiAxis = () => { const r=[]; for (const seg of ['A','B']) for (const sz of [10,20]) for (const dt of [1,2]) { const base=sz+dt*5+(seg==='A'?0:3); r.push({x:1,y:base+1,seg,sz,dt},{x:2,y:base+5,seg,sz,dt},{x:3,y:base+10,seg,sz,dt}); } return r; };
F.rhoCliff = () => { const r=[]; [100,100,100,100,100,0].forEach((y,i)=>r.push({x:i+1,y,sz:10})); [10,30,60,90,120,150].forEach((y,i)=>r.push({x:i+1,y:y+1000,sz:20})); return r; };
F.rhoScatter = () => { const r=[]; [10,20,30,40,50].forEach((y,i)=>r.push({x:i+1,y,sz:10})); [55,49,54,50,52].forEach((y,i)=>r.push({x:i+1,y:y+100,sz:20})); return r; };
F.defect4 = () => { const r=[]; const base=[['A',1,20],['A',2,10],['B',3,100],['B',4,90]]; let c=0; for (const [seg,x,y] of base){c++;r.push({x,y,seg,sz:1.0+c*0.5});} return r; };
F.f5Stacking = () => [[1,30,'A',10],[2,20,'A',10],[3,10,'A',10],[1,5,'B',20],[2,25,'B',20],[3,60,'B',20]].map(([x,y,seg,sz])=>({x,y,seg,sz}));
// the 3 s165 survivors
F.survA = () => [{x:1,y:30,sh:'circle'},{x:2,y:20,sh:'circle'},{x:3,y:10,sh:'circle'},{x:4,y:130,sh:'square'},{x:5,y:120,sh:'square'},{x:6,y:110,sh:'square'}];
F.survB = () => [{x:1,y:50,c:100},{x:2,y:40,c:100},{x:3,y:30,c:100},{x:1,y:10,c:200},{x:2,y:60,c:200},{x:3,y:110,c:200}];
F.survC = () => [{x:1,y:10,seg:'p',sz:1},{x:2,y:8,seg:'q',sz:1},{x:3,y:6,seg:'r',sz:1},{x:1,y:20,seg:'p',sz:2},{x:2,y:30,seg:'q',sz:2},{x:3,y:40,seg:'r',sz:2}];

const CASES = [
  ['defect1',                F.defect1(),        { colorField:'seg', sizeField:'sz', yAggregate:'average' }],
  ['defect1-twin-detail',    F.defect1().map(r=>({x:r.x,y:r.y,seg:r.seg,d:r.sz})), { colorField:'seg', detailField:'d', yAggregate:'average' }],
  ['defect2',                F.defect2(),        { colorField:'seg', detailField:'d', yAggregate:'average' }],
  ['defect5',                F.defect5(),        { sizeField:'sz', yAggregate:'average' }],
  ['defect6',                F.defect6(),        { sizeField:'sz', yAggregate:'average' }],
  ['defect6c-shallow',       F.defect6c(),       { sizeField:'sz', yAggregate:'average' }],
  ['defect7',                F.defect7(),        { colorField:'seg', sizeField:'size', detailField:'det', yAggregate:'average' }],
  ['defect8-CASE6',          F.defect8(),        { colorField:'seg', sizeField:'sz', yAggregate:'average' }],
  ['defect9-nested',         F.defect9(),        { sizeField:'sz', detailField:'det', yAggregate:'average' }],
  ['DISJOINT-FLAT (:217)',   F.disjointFlat(),   { colorField:'seg', sizeField:'sz', yAggregate:'average' }],
  ['two-axis-all-fall',      F.twoAxisAllFall(), { colorField:'seg', sizeField:'sz', detailField:'dt', yAggregate:'average' }],
  ['n2-opposite',            F.n2Opposite(),     { sizeField:'sz', yAggregate:'average' }],
  ['KEEP all-rise',          F.allRise(),        { colorField:'seg', sizeField:'sz', yAggregate:'average' }],
  ['KEEP CASE3-FLAT',        F.case3Flat(),      { colorField:'seg', sizeField:'sz', yAggregate:'average' }],
  ['KEEP weak-scatter',      F.weakScatter(),    { colorField:'seg', sizeField:'sz', yAggregate:'average' }],
  ['KEEP continuous-ramp',   F.continuousRamp(), { colorField:'seg', sizeField:'sz', yAggregate:'average' }],
  ['KEEP honest-multi-axis', F.honestMultiAxis(),{ colorField:'seg', sizeField:'sz', detailField:'dt', yAggregate:'average' }],
  ['KEEP rho-cliff(suppr)',  F.rhoCliff(),       { sizeField:'sz', yAggregate:'average' }],
  ['KEEP rho-scatter',       F.rhoScatter(),     { sizeField:'sz', yAggregate:'average' }],
  ['defect4-continuous-size',F.defect4(),        { colorField:'seg', sizeField:'sz', yAggregate:'average' }],
  ['F5-stacking',            F.f5Stacking(),     { colorField:'seg', sizeField:'sz', yAggregate:'sum', mark:'MarkBar' }],
  ['SURVIVOR A shape/mixed', F.survA(),          { shapeField:'sh', marks:['MarkLine','MarkPoint'] }],
  ['SURVIVOR B stack+ramp',  F.survB(),          { colorField:'c', colorQuant:true, yAggregate:'sum', mark:'MarkBar' }],
  ['SURVIVOR C collinear',   F.survC(),          { colorField:'seg', sizeField:'sz', yAggregate:'average' }],
];

const dim='x', measure='y';
const rowsPad = (s) => s.padEnd(26);
let mismatches = 0, flipsToNarrate = 0, flipsToSuppress = 0;
console.log(rowsPad('FIXTURE') + ' | dist(s164) | ref164 | ok? | s165prop | change');
console.log('-'.repeat(100));
for (const [name, rows, opts] of CASES) {
  const spec = chart(rows, opts);
  const { partition, grouping, separable, valueKey, agg } = fieldsFor(opts);
  const pooled = pooledOf(rows, dim, measure, valueKey, agg);
  const live = analyzeVizSpec(spec).correlation;
  if (pooled === null) { console.log(rowsPad(name) + ' | pooled null (skipped) live=' + live); continue; }
  const G0 = g0(rows, dim, measure, partition, grouping, agg, pooled);
  const A = g1(rows, dim, measure, partition, grouping, agg, pooled, true);   // s164
  const B = g1(rows, dim, measure, partition, separable, agg, pooled, false); // s165 proposal
  const ref164 = G0.narrates && !A.suppresses ? pooled : undefined;
  const ref165 = G0.narrates && !B.suppresses ? pooled : undefined;
  const refUnion = G0.narrates && !A.suppresses && !B.suppresses ? pooled : undefined; // CORRECTION: OR the two scans
  const ok = String(ref164) === String(live);
  if (!ok) mismatches++;
  let change = 'same';
  if (ref164 === undefined && ref165 !== undefined) { change = '*** SUPPRESS -> NARRATE (NON-MONOTONE) ***'; flipsToNarrate++; }
  else if (ref164 !== undefined && ref165 === undefined) { change = 'narrate -> suppress (monotone add)'; flipsToSuppress++; }
  const um = (ref164 === undefined && refUnion !== undefined) ? ' !!UNION-NON-MONOTONE!!' : '';
  console.log(`${rowsPad(name)} | ${String(live).padEnd(10)} | ${String(ref164).padEnd(6)} | ${ok?'OK ':'BAD'} | ${String(ref165).padEnd(8)} | union=${String(refUnion).padEnd(8)}${um} | ${change}`);
  if (change.startsWith('***')) {
    console.log(`     fields: partition=[${partition}] grouping=[${grouping}] separable=[${separable}] pooled=${pooled}`);
    console.log(`     s164 G1: ${A.why} votes=${JSON.stringify(A.votes)} sharesPooled=${A.sharesPooled}`);
    console.log(`     s165 G1: ${B.why} votes=${JSON.stringify(B.votes)} sharesPooled=${B.sharesPooled}`);
  }
}
console.log('-'.repeat(100));
console.log(`reference-vs-dist mismatches: ${mismatches} / ${CASES.length}`);
console.log(`NON-MONOTONE flips (suppress -> narrate): ${flipsToNarrate}`);
console.log(`added suppression (narrate -> suppress) : ${flipsToSuppress}`);
