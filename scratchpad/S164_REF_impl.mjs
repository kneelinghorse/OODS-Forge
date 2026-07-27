// s164 m1 REFERENCE IMPLEMENTATION of §10 (dimensionless "any real opposite").
// Self-contained: encodes pooled + G0 (unchanged s163) + G1 (new full-lattice COLLECT-EVERY).
// Validates the algorithm against EVERY enumerated fixture with its expected s164 decision
// BEFORE porting to data-analysis.ts. narrate iff (G0 narrates) AND (G1 narrates).
const RHO = 0.5;

const round3 = (r) => (r === null ? null : Math.round(r * 1000) / 1000);
const signOf = (r) => (r > 0 ? 1 : r < 0 ? -1 : 0);
function pearson(xs, ys) {
  const n = xs.length; if (n < 2) return null;
  const mx = xs.reduce((s, v) => s + v, 0) / n, my = ys.reduce((s, v) => s + v, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (ys[i] - my); dx += (xs[i] - mx) ** 2; dy += (ys[i] - my) ** 2; }
  const den = Math.sqrt(dx * dy); return den === 0 ? null : num / den;
}
const keyFor = (row, fields) => fields.map((f) => (row[f] === null || row[f] === undefined ? '\0null' : String(row[f]))).join('\0');

// project rows to drawn cells keyed by (dim ∪ keyFields), reducing measure by agg; RETAINS keyFields
// values on each cell (so G1 can bucket cells into sub-series). Without an aggregate, cells = raw rows.
function projectCells(rows, dim, measure, keyFields, agg) {
  if (!agg) return rows.map((r) => ({ x: r[dim], y: r[measure], sub: keyFor(r, keyFields) }));
  const groups = new Map();
  for (const r of rows) {
    const k = keyFor(r, [dim, ...keyFields]);
    if (!groups.has(k)) groups.set(k, { x: r[dim], sub: keyFor(r, keyFields), vals: [] });
    groups.get(k).vals.push(r[measure]);
  }
  return [...groups.values()].map((g) => {
    const nums = g.vals.map(Number).filter((v) => Number.isFinite(v));
    return { x: g.x, sub: g.sub, y: nums.reduce((s, v) => s + v, 0) / nums.length };
  });
}

// classify ONE sub-series' within-series direction — the s163 classifyGroupDirection contract EXTENDED
// with the dimensionless ρ gate: n>=3 votes its rounded-pearson sign ONLY if |r|>=RHO (else FLAT 0);
// n=2 votes its slope sign unconditionally; n<2 or zero x-variance -> 'unknown'.
function classifyDirection(cells) {
  const xs = [], ys = [];
  for (const c of cells) { const x = Number(c.x), y = Number(c.y); if (Number.isFinite(x) && Number.isFinite(y)) { xs.push(x); ys.push(y); } }
  const n = xs.length;
  if (n < 2) return 'unknown';
  const mx = xs.reduce((s, v) => s + v, 0) / n;
  let denomX = 0; for (const x of xs) denomX += (x - mx) ** 2;
  if (denomX === 0) return 'unknown';
  if (n === 2) { const my = (ys[0] + ys[1]) / 2; let cov = 0; for (let i = 0; i < 2; i++) cov += (xs[i] - mx) * (ys[i] - my); return signOf(cov); }
  const r = round3(pearson(xs, ys));
  if (r === null) return 0;
  return Math.abs(r) >= RHO ? signOf(r) : 0; // dimensionless ρ gate (n>=3 only)
}

// s163 classifyGroupDirection WITHOUT the ρ gate (G0 uses rounded-pearson sign — byte-identical to s163).
function classifyG0Direction(cells) {
  const xs = [], ys = [];
  for (const c of cells) { const x = Number(c.x), y = Number(c.y); if (Number.isFinite(x) && Number.isFinite(y)) { xs.push(x); ys.push(y); } }
  const n = xs.length;
  if (n < 2) return 'unknown';
  const mx = xs.reduce((s, v) => s + v, 0) / n;
  let denomX = 0; for (const x of xs) denomX += (x - mx) ** 2;
  if (denomX === 0) return 'unknown';
  if (n === 2) { const my = (ys[0] + ys[1]) / 2; let cov = 0; for (let i = 0; i < 2; i++) cov += (xs[i] - mx) * (ys[i] - my); return signOf(cov); }
  const r = pearson(xs, ys);
  return r === null ? 0 : signOf(round3(r));
}

const subsetsOf = (arr) => { const out = [[]]; for (const a of arr) { const len = out.length; for (let i = 0; i < len; i++) out.push([...out[i], a]); } return out; };
function groupBy(rows, fields) {
  if (fields.length === 0) return new Map([['*', rows]]);
  const m = new Map();
  for (const r of rows) { const k = keyFor(r, fields); if (!m.has(k)) m.set(k, []); m.get(k).push(r); }
  return m;
}

// ── G0 (unchanged s163): partition rawRows by partitionFields, re-project each group over the FULL
// groupingFields, ONE direction per partition group; narratableCorrelation over the classes.
function classifyCorrelationGroups(rawRows, dim, measure, partitionFields, groupingFields, agg) {
  const classes = [];
  for (const [, groupRows] of groupBy(rawRows, partitionFields)) {
    const cells = agg ? projectCells(groupRows, dim, measure, groupingFields, agg) : groupRows.map((r) => ({ x: r[dim], y: r[measure] }));
    classes.push(classifyG0Direction(cells));
  }
  return classes;
}
function narratableCorrelation(pooled, classes) {
  const evidence = classes.filter((c) => c !== 'unknown');
  if (evidence.length === 0) return true;
  if (new Set(evidence).size > 1) return false;
  const s = evidence[0], pooledSign = signOf(pooled);
  if (s === 0) return pooledSign === 0;
  return pooledSign === 0 || pooledSign === s;
}

// ── G1 (new): dimensionless "any real opposite", contradiction-first, full-lattice COLLECT-EVERY.
// Returns TRUE if G1 SUPPRESSES. No-op (false) when groupingFields=[].
function g1Suppresses(rawRows, dim, measure, partitionFields, groupingFields, agg, pooled) {
  if (groupingFields.length === 0) return false; // no-op -> defer to G0 (byte-identical to s163)
  const pooledSign = signOf(pooled);
  const E = [];              // non-flat votes (∈{-1,+1}) across ALL admitted sub-series, all P, all S
  let anyVotable = false;    // any admitted sub-series with n>=2 (votable, incl flats)
  let anySharesPooled = false;

  for (const [, prows] of groupBy(rawRows, partitionFields)) {
    // Collect votable |S|>=1 fine bands first; only admit the S=∅ whole-group series if NONE exist
    // (manufactured-vote guard: a whole-group over-x aggregate of a group that has genuine finer bands
    //  casts only a between-band-offset vote; when there are NO votable finer bands the S=∅ series IS
    //  the drawn signal — the continuous-ramp path, §4 residual-2).
    let hasVotableFineBand = false;
    let emptyVote = null; // the S=∅ sub-series direction (deferred)
    for (const S of subsetsOf(groupingFields)) {
      const cells = projectCells(prows, dim, measure, S, agg);
      for (const [, subCells] of groupBy(cells, ['sub'])) {
        if (new Set(subCells.map((c) => c.x)).size < 2) continue; // n<2 distinct x -> not votable
        const dir = classifyDirection(subCells);
        if (dir === 'unknown') continue;
        if (S.length === 0) { emptyVote = dir; continue; } // defer S=∅
        hasVotableFineBand = true;
        anyVotable = true;
        if (dir !== 0) E.push(dir);
        if (dir === pooledSign && dir !== 0) anySharesPooled = true;
      }
    }
    if (!hasVotableFineBand && emptyVote !== null) {
      anyVotable = true;
      if (emptyVote !== 0) E.push(emptyVote);
      if (emptyVote === pooledSign && emptyVote !== 0) anySharesPooled = true;
    }
  }

  if (!anyVotable) return false; // FALLBACK: degenerate <2-distinct-x everywhere -> narrate
  if (new Set(E).size > 1) return true;                 // (a) sub-series disagree
  if (E.some((e) => e === -pooledSign)) return true;     // (b) a real opposite
  if (pooledSign !== 0 && !anySharesPooled) return true; // (c) all-flat-offset / disjoint-x: no drawn band shows the trend
  return false;
}

// ── deriveCorrelation (s164): narrate iff G0 narrates AND G1 narrates.
function deriveCorrelation(rawRows, dim, measure, partitionFields, groupingFields, agg) {
  // pooled over drawn cells (project by the FULL grouping+partition = narratedValueCellKey; here we
  // key by partition∪grouping which is the value cell key minus dim).
  const valueKey = [...partitionFields, ...groupingFields];
  const valueCells = agg ? projectCells(rawRows, dim, measure, valueKey, agg) : rawRows.map((r) => ({ x: r[dim], y: r[measure] }));
  const pooled = round3(pearson(valueCells.map((c) => Number(c.x)), valueCells.map((c) => Number(c.y))));
  if (pooled === null) return undefined;
  if (partitionFields.length === 0 && groupingFields.length === 0) return pooled; // early-return (both empty)
  const classes = classifyCorrelationGroups(rawRows, dim, measure, partitionFields, groupingFields, agg);
  const g0 = narratableCorrelation(pooled, classes);
  const g1 = !g1Suppresses(rawRows, dim, measure, partitionFields, groupingFields, agg, pooled);
  return (g0 && g1) ? pooled : undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURES  (P = partitionFields, G = groupingFields, agg = declared aggregate)
// ─────────────────────────────────────────────────────────────────────────────
const F = [];
const add = (name, want, rows, P, G, agg = 'average') => F.push({ name, want, rows, P, G, agg });

// defect 1 — color partition + quant SIZE, each (seg,sz) n=3 falls, pooled rises
{ const rows = []; const a = (x, y, seg, sz) => rows.push({ x, y, seg, sz });
  a(1,50,'A',100); a(2,40,'A',100); a(3,30,'A',100); a(4,250,'A',200); a(5,240,'A',200); a(6,230,'A',200);
  a(1,1050,'B',100); a(2,1040,'B',100); a(3,1030,'B',100); a(4,1250,'B',200); a(5,1240,'B',200); a(6,1230,'B',200);
  add('defect1 size-Simpson (color partition)', 'SUPPRESS', rows, ['seg'], ['sz']); }
// defect 2 — quant detail n=2 bands, avg
{ const rows = []; for (const seg of ['A','B']) rows.push({x:1,y:10,seg,d:1},{x:2,y:9,seg,d:1},{x:3,y:100,seg,d:2},{x:4,y:99,seg,d:2});
  add('defect2 quant-detail n=2 bands', 'SUPPRESS', rows, ['seg'], ['d']); }
// defect 5 — SIZE-ONLY, NO categorical partition, 3 bands n=3 fall, pooled rises
{ const rows = []; const a = (x,y,sz) => rows.push({x,y,sz});
  a(1,50,10); a(2,40,10); a(3,30,10); a(4,250,20); a(5,240,20); a(6,230,20); a(7,450,30); a(8,440,30); a(9,430,30);
  add('defect5 size-only Simpson (P=[])', 'SUPPRESS', rows, [], ['sz']); }
// defect 6 — strong-separation size-only Simpson (each band r=-1, far apart)
{ const rows = []; const a = (x,y,sz)=>rows.push({x,y,sz});
  a(1,100,10); a(2,60,10); a(3,20,10); a(4,2000,50); a(5,1960,50); a(6,1920,50); a(7,4000,90); a(8,3960,90); a(9,3920,90);
  add('defect6 strong-separation (caseA)', 'SUPPRESS', rows, [], ['sz']); }
// defect 6c — r=-1 shallow sub-series (perfect fall, small Δ)
{ const rows = []; const a = (x,y,sz)=>rows.push({x,y,sz});
  a(1,100,10); a(2,99,10); a(3,98,10); a(4,97,10); a(5,96,10);
  a(6,900,50); a(7,899,50); a(8,898,50); a(9,897,50); a(10,896,50);
  a(11,1800,90); a(12,1799,90); a(13,1798,90); a(14,1797,90); a(15,1796,90);
  add('defect6c shallow r=-1 (magnitude-τ would miss)', 'SUPPRESS', rows, [], ['sz']); }
// defect 7 — cascade middle: P=seg, G={size,detail}, detail all-distinct -> finest shreds, middle falls
{ const rows = []; let id = 0; const a = (x,y,seg,size) => { id++; rows.push({x,y,seg,size,det:id}); };
  a(1,160,'A',10); a(2,80,'A',10); a(3,260,'A',20); a(4,180,'A',20);
  a(1,360,'B',10); a(2,280,'B',10); a(3,460,'B',20); a(4,380,'B',20);
  add('defect7 cascade-middle (finest shreds)', 'SUPPRESS', rows, ['seg'], ['size','det']); }
// defect 8 — CASE6 pooled≈0 opposing bands
{ const rows = []; rows.push({x:1,y:1,seg:'A',sz:10},{x:2,y:2,seg:'A',sz:10},{x:3,y:3,seg:'A',sz:10},
    {x:1,y:3,seg:'A',sz:20},{x:2,y:2,seg:'A',sz:20},{x:3,y:1,seg:'A',sz:20});
  add('defect8 CASE6 pooled≈0 opposing', 'SUPPRESS', rows, ['seg'], ['sz']); }
// defect 9 — nested Simpson: P=[], G={sz,det}, sz=10 cloud falls (n=6), finest det-slices rise (n=2)
{ const rows = [];
  rows.push({x:1,y:100,sz:10,det:1},{x:2,y:105,sz:10,det:1},{x:3,y:60,sz:10,det:2},{x:4,y:65,sz:10,det:2},{x:5,y:20,sz:10,det:3},{x:6,y:25,sz:10,det:3});
  rows.push({x:1,y:200,sz:20,det:4},{x:2,y:260,sz:20,det:4},{x:3,y:320,sz:20,det:5},{x:4,y:380,sz:20,det:5},{x:5,y:440,sz:20,det:6},{x:6,y:500,sz:20,det:6});
  add('defect9 nested-Simpson H1 (COLLECT-EVERY)', 'SUPPRESS', rows, [], ['sz','det']); }
// disjoint-x all-flat offset: single seg, two FLAT bands at disjoint x, pooled rises
{ const rows = []; rows.push({x:1,y:10,seg:'A',sz:10},{x:2,y:10,seg:'A',sz:10},{x:3,y:100,seg:'A',sz:20},{x:4,y:100,seg:'A',sz:20});
  add('all-flat-offset disjoint-x', 'SUPPRESS', rows, ['seg'], ['sz']); }
// F4a as-written is HONEST (the +x*300 offset makes every fine sub-series RISE 470→760→1050) -> NARRATE
{ const rows = []; for (const seg of ['A','B']) for (const sz of [10,20]) for (const dt of [1,2]) {
    const base = sz*3 + dt*40 + (seg==='A'?0:5);
    rows.push({x:1,y:base+100,seg,sz,dt},{x:2,y:base+90,seg,sz,dt},{x:3,y:base+80,seg,sz,dt}); }
  for (const r of rows) r.y += r.x * 300;
  add('F4a (offset makes all fine series rise -> honest)', 'NARRATE', rows, ['seg'], ['sz','dt']); }
// two-quant-axis Simpson done RIGHT: each (seg,sz,dt) FALLS over its own x-window, higher bands at higher (x,y)
{ const rows = []; let w = 0;
  for (const seg of ['A','B']) for (const sz of [10,20]) for (const dt of [1,2]) {
    const x0 = w * 3; w++; const lift = w * 1000; // disjoint x-window + ascending lift -> pooled rises
    rows.push({x:x0+1,y:lift+100,seg,sz,dt},{x:x0+2,y:lift+90,seg,sz,dt},{x:x0+3,y:lift+80,seg,sz,dt}); } // each band FALLS
  add('two-axis-all-fall Simpson (real phantom)', 'SUPPRESS', rows, ['seg'], ['sz','dt']); }
// F4c — honest rise + ONE thin dipping slice (ratified over-suppression, residual-3)
{ const rows = []; for (const seg of ['A','B']) for (const sz of [10,20]) for (const dt of [1,2]) {
    const base = sz + dt*5 + (seg==='A'?0:3);
    let ys = [base+1, base+5, base+10];
    if (seg==='B' && sz===20 && dt===2) ys = [base+10, base+9, base+8];
    rows.push({x:1,y:ys[0],seg,sz,dt},{x:2,y:ys[1],seg,sz,dt},{x:3,y:ys[2],seg,sz,dt}); }
  add('F4c honest+thin-dip (residual-3 over-suppress)', 'SUPPRESS', rows, ['seg'], ['sz','dt']); }
// ρ two-sided — cliff opposing band |r|≈0.655 (>=ρ) -> SUPPRESS
{ const rows = []; const cliff = [100,100,100,100,100,0];
  cliff.forEach((y,i)=>rows.push({x:i+1,y,sz:10}));                 // sz10 band: cliff, r=-0.655
  [10,30,60,90,120,150].forEach((y,i)=>rows.push({x:i+1,y:y+1000,sz:20})); // sz20 band rises, lifts pooled
  add('ρ cliff |r|≈0.655 opposing (>=ρ)', 'SUPPRESS', rows, [], ['sz']); }

// ── KEEP-CONTROLS (NARRATE) ──
// all-rise
{ const rows = []; for (const seg of ['A','B']) for (const sz of [10,20]) rows.push({x:1,y:1+sz,seg,sz},{x:2,y:2+sz,seg,sz},{x:3,y:3+sz,seg,sz});
  add('KEEP all-rise', 'NARRATE', rows, ['seg'], ['sz']); }
// CASE3-FLAT rise + one exactly-flat band
{ const rows = []; rows.push({x:1,y:11,seg:'A',sz:10},{x:2,y:12,seg:'A',sz:10},{x:3,y:13,seg:'A',sz:10},
    {x:1,y:21,seg:'A',sz:20},{x:2,y:22,seg:'A',sz:20},{x:3,y:23,seg:'A',sz:20},
    {x:1,y:50,seg:'B',sz:10},{x:2,y:50,seg:'B',sz:10},{x:3,y:50,seg:'B',sz:10},
    {x:1,y:71,seg:'B',sz:20},{x:2,y:72,seg:'B',sz:20},{x:3,y:73,seg:'B',sz:20});
  add('KEEP CASE3-FLAT (rise + flat band)', 'NARRATE', rows, ['seg'], ['sz']); }
// WEAK-SCATTER: rising band + an n>=3 opposing band with |r|<ρ (scattered)
{ const rows = []; rows.push({x:1,y:10,seg:'A',sz:10},{x:2,y:20,seg:'A',sz:10},{x:3,y:30,seg:'A',sz:10},
    {x:1,y:52,seg:'A',sz:20},{x:2,y:49,seg:'A',sz:20},{x:3,y:51,seg:'A',sz:20});
  add('KEEP weak-scatter opposing |r|<ρ', 'NARRATE', rows, ['seg'], ['sz']); }
// ρ two-sided — scatter opposing band |r|≈0.3 (<ρ) -> NARRATE
{ const rows = []; [10,20,30,40,50].forEach((y,i)=>rows.push({x:i+1,y,sz:10}));          // sz10 rises strongly
  [55,49,54,50,52].forEach((y,i)=>rows.push({x:i+1,y:y+100,sz:20}));                       // sz20 weak scatter |r|≈0.3
  add('ρ scatter |r|≈0.3 opposing (<ρ)', 'NARRATE', rows, [], ['sz']); }
// continuous ramp (continuous_size_fallback) — all-distinct size, both color series FALL, pooled falls (honest)
{ const rows = []; const mk = (seg,x,y,sz) => rows.push({x,y,seg,sz});
  for (const seg of ['A','B']) { const o = seg==='A'?0:1;
    mk(seg,1,100+o,9.001+o*0.0001); mk(seg,1,90+o,8.001+o*0.0001); mk(seg,2,40+o,2.001+o*0.0001); mk(seg,2,30+o,1.001+o*0.0001); }
  add('KEEP continuous-ramp (honest, S=∅ no-opposition)', 'NARRATE', rows, ['seg'], ['sz']); }
// F4b honest multi-axis all-rise
{ const rows = []; for (const seg of ['A','B']) for (const sz of [10,20]) for (const dt of [1,2]) {
    const base = sz + dt*5 + (seg==='A'?0:3);
    rows.push({x:1,y:base+1,seg,sz,dt},{x:2,y:base+5,seg,sz,dt},{x:3,y:base+10,seg,sz,dt}); }
  add('KEEP F4b honest multi-axis all-rise', 'NARRATE', rows, ['seg'], ['sz','dt']); }

// ── NON-REGRESSION (SUPPRESS via G0; G1 must not flip to narrate) ──
// defect 4 — between-partition Simpson + continuous size (fallback trap): G0 suppresses
{ const rows = []; const base = [['A',1,20],['A',2,10],['B',3,100],['B',4,90]]; let c = 0;
  for (const [seg,x,y] of base) { c++; rows.push({x,y,seg,sz:1.0+c*0.5}); }
  add('defect4 between-partition + continuous size (G0)', 'SUPPRESS', rows, ['seg'], ['sz']); }
// F5 stacking — under stacking groupingFields=[] -> G1 no-op; G0 suppresses (A falls, B rises)
{ const rows = []; const data = [[1,30,'A'],[2,20,'A'],[3,10,'A'],[1,5,'B'],[2,25,'B'],[3,60,'B']];
  for (const [x,y,seg] of data) rows.push({x,y,seg});
  add('F5 stacking Simpson (G=[], sum)', 'SUPPRESS', rows, ['seg'], [], 'sum'); }

// ── BYTE-IDENTITY: no grouping (G=[]) weak-consistent -> G0 narrates, G1 no-op ──
{ const rows = []; const g = (seg,base)=>rows.push({x:1,y:base+0,seg},{x:2,y:base+3,seg},{x:3,y:base-1,seg},{x:4,y:base+4,seg});
  g('R',0); g('S',100); g('T',200);
  add('byte-id weak-consistent no-grouping (G0)', 'NARRATE', rows, ['seg'], []); }

// ─────────────────────────────────────────────────────────────────────────────
let pass = 0, fail = 0;
for (const f of F) {
  const r = deriveCorrelation(f.rows, 'x', 'y', f.P, f.G, f.agg);
  const got = r === undefined ? 'SUPPRESS' : 'NARRATE';
  const ok = got === f.want;
  if (ok) pass++; else fail++;
  console.log(`${ok ? '✅' : '❌'} ${got.padEnd(8)} (want ${f.want.padEnd(8)}) r=${r === undefined ? 'undef' : r}  ${f.name}`);
}
console.log(`\n${pass}/${F.length} pass, ${fail} fail`);
