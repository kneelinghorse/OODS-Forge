// S165 PRE-LOCK CRITIC — lens does-it-kill-ABC, part 5 (DECISIVE):
// run the ACTUAL s164 proof-spec fixtures (transcribed from
// packages/viz-core/src/a11y/correlation-drawn-mark-direction-s164.spec.ts) through the proposal.
// §5 of the s165 memo claims "the full s162/s163/s164 fixture sets stay GREEN".
import { analyzeVizSpec, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
import { readFileSync } from 'node:fs';
const src = readFileSync('/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/scratchpad/S165CRIT_does_it_kill_ABC.mjs', 'utf8');
const body = src.split('// ───────────────────────── fixtures')[0].split("dist/index.js';")[1];
const { decide } = new Function('analyzeVizSpec', 'resolvePrimaryChannels', `${body}\nreturn { decide };`)(analyzeVizSpec, resolvePrimaryChannels);

const B = (field, trait, extra = {}) => ({ field, trait, ...extra });
function chart(rows, opts = {}) {
  const encoding = {
    x: B('x', 'EncodingX', { type: 'quantitative' }),
    y: B('y', 'EncodingY', { type: 'quantitative', ...(opts.yAggregate ? { aggregate: opts.yAggregate } : {}) }),
  };
  if (opts.colorField) encoding.color = B(opts.colorField, 'EncodingColor');
  if (opts.sizeField) encoding.size = B(opts.sizeField, 'EncodingSize', { type: 'quantitative' });
  if (opts.detailField) encoding.detail = B(opts.detailField, 'EncodingDetail', { type: 'quantitative' });
  return {
    $schema: 'https://oods.dev/viz-spec/v1', id: 'corr-s164', name: 'corr s164',
    data: { name: 'c', values: rows },
    marks: [{ trait: opts.mark ?? 'MarkPoint', encodings: { ...encoding } }],
    encoding,
    ...(opts.facetColumnField ? { layout: { trait: 'LayoutFacet', columns: { field: opts.facetColumnField } } } : {}),
    a11y: { description: 'y over x' },
  };
}
const rowsDefect1 = () => { const r = []; const a = (x, y, seg, sz) => r.push({ x, y, seg, sz });
  a(1,50,'A',100);a(2,40,'A',100);a(3,30,'A',100);a(4,250,'A',200);a(5,240,'A',200);a(6,230,'A',200);
  a(1,1050,'B',100);a(2,1040,'B',100);a(3,1030,'B',100);a(4,1250,'B',200);a(5,1240,'B',200);a(6,1230,'B',200); return r; };
const rowsDefect2 = () => { const r = []; for (const seg of ['A','B']) r.push({x:1,y:10,seg,d:1},{x:2,y:9,seg,d:1},{x:3,y:100,seg,d:2},{x:4,y:99,seg,d:2}); return r; };
const rowsDefect5 = () => { const r = []; const a=(x,y,sz)=>r.push({x,y,sz});
  a(1,50,10);a(2,40,10);a(3,30,10);a(4,250,20);a(5,240,20);a(6,230,20);a(7,450,30);a(8,440,30);a(9,430,30); return r; };
const rowsDisjointFlat = () => [
  {x:1,y:10,seg:'A',sz:10},{x:2,y:10,seg:'A',sz:10},{x:3,y:100,seg:'A',sz:20},{x:4,y:100,seg:'A',sz:20}];
const rowsTwoAxisAllFall = () => { const r=[]; let w=0;
  for (const seg of ['A','B']) for (const sz of [10,20]) for (const dt of [1,2]) { const x0=w*3; w++; const lift=w*1000;
    r.push({x:x0+1,y:lift+100,seg,sz,dt},{x:x0+2,y:lift+90,seg,sz,dt},{x:x0+3,y:lift+80,seg,sz,dt}); } return r; };
const rowsAllRise = () => { const r=[]; for (const seg of ['A','B']) for (const sz of [10,20]) r.push({x:1,y:1+sz,seg,sz},{x:2,y:2+sz,seg,sz},{x:3,y:3+sz,seg,sz}); return r; };
const rowsCase3Flat = () => [
  {x:1,y:11,seg:'A',sz:10},{x:2,y:12,seg:'A',sz:10},{x:3,y:13,seg:'A',sz:10},
  {x:1,y:21,seg:'A',sz:20},{x:2,y:22,seg:'A',sz:20},{x:3,y:23,seg:'A',sz:20},
  {x:1,y:50,seg:'B',sz:10},{x:2,y:50,seg:'B',sz:10},{x:3,y:50,seg:'B',sz:10},
  {x:1,y:71,seg:'B',sz:20},{x:2,y:72,seg:'B',sz:20},{x:3,y:73,seg:'B',sz:20}];
const rowsWeakScatter = () => [
  {x:1,y:10,seg:'A',sz:10},{x:2,y:20,seg:'A',sz:10},{x:3,y:30,seg:'A',sz:10},
  {x:1,y:52,seg:'A',sz:20},{x:2,y:49,seg:'A',sz:20},{x:3,y:51,seg:'A',sz:20}];
const rowsContinuousRamp = () => { const r=[]; const mk=(seg,x,y,sz)=>r.push({x,y,seg,sz});
  for (const seg of ['A','B']) { const o = seg==='A'?0:1;
    mk(seg,1,100+o,9.001+o*0.0001); mk(seg,1,90+o,8.001+o*0.0001); mk(seg,2,40+o,2.001+o*0.0001); mk(seg,2,30+o,1.001+o*0.0001); } return r; };
const rowsHonestMultiAxis = () => { const r=[]; for (const seg of ['A','B']) for (const sz of [10,20]) for (const dt of [1,2]) {
  const base = sz + dt*5 + (seg==='A'?0:3); r.push({x:1,y:base+1,seg,sz,dt},{x:2,y:base+5,seg,sz,dt},{x:3,y:base+10,seg,sz,dt}); } return r; };
const rowsRhoCliff = () => { const r=[]; [100,100,100,100,100,0].forEach((y,i)=>r.push({x:i+1,y,sz:10}));
  [10,30,60,90,120,150].forEach((y,i)=>r.push({x:i+1,y:y+1000,sz:20})); return r; };
const rowsRhoScatter = () => { const r=[]; [10,20,30,40,50].forEach((y,i)=>r.push({x:i+1,y,sz:10}));
  [55,49,54,50,52].forEach((y,i)=>r.push({x:i+1,y:y+100,sz:20})); return r; };
const rowsDefect4 = () => { const r=[]; const base=[['A',1,20],['A',2,10],['B',3,100],['B',4,90]]; let c=0;
  for (const [seg,x,y] of base) { c++; r.push({x,y,seg,sz:1.0+c*0.5}); } return r; };
const rowsF5Stacking = () => { const r=[]; const data=[[1,30,'A',10],[2,20,'A',10],[3,10,'A',10],[1,5,'B',20],[2,25,'B',20],[3,60,'B',20]];
  for (const [x,y,seg,sz] of data) r.push({x,y,seg,sz}); return r; };
const rowsN2Opposite = () => [
  {x:1,y:10,sz:10},{x:2,y:20,sz:10},{x:3,y:30,sz:10},{x:4,y:105,sz:20},{x:5,y:104,sz:20}];
const rowsWeakConsistentNoGrouping = () => { const r=[]; const g=(seg,base)=>r.push({x:1,y:base+0,seg},{x:2,y:base+3,seg},{x:3,y:base-1,seg},{x:4,y:base+4,seg});
  g('R',0); g('S',100); g('T',200); return r; };
const rowsDefect6 = rowsDefect5;

// [label, spec, s164-expectation]  ('SUPPRESS' = RED-first must stay undefined, 'NARRATE' = keep-control)
const cases = [
  ['RED  defect1 color-partition + quant size', chart(rowsDefect1(), { colorField:'seg', sizeField:'sz', yAggregate:'average' }), 'SUPPRESS'],
  ['RED  defect1-twin quant DETAIL', chart(rowsDefect2(), { colorField:'seg', detailField:'d', yAggregate:'average' }), 'SUPPRESS'],
  ['RED  defect5 size-only Simpson', chart(rowsDefect5(), { sizeField:'sz', yAggregate:'average' }), 'SUPPRESS'],
  ['RED  disjoint-x ALL-FLAT offset (clause-3)', chart(rowsDisjointFlat(), { colorField:'seg', sizeField:'sz', yAggregate:'average' }), 'SUPPRESS'],
  ['RED  two-axis-all-fall Simpson', chart(rowsTwoAxisAllFall(), { colorField:'seg', sizeField:'sz', detailField:'dt', yAggregate:'average' }), 'SUPPRESS'],
  ['RED  n=2 opposing band amid a sharing band', chart(rowsN2Opposite(), { sizeField:'sz', yAggregate:'average' }), 'SUPPRESS'],
  ['RED  ρ cliff |r|≈0.655 opposing band', chart(rowsRhoCliff(), { sizeField:'sz', yAggregate:'average' }), 'SUPPRESS'],
  ['NR   defect4 between-partition Simpson (G0 suppresses)', chart(rowsDefect4(), { colorField:'seg', sizeField:'sz', yAggregate:'average' }), 'SUPPRESS'],
  ['NR   F5 stacked-bar Simpson + quant size', chart(rowsF5Stacking(), { colorField:'seg', sizeField:'sz', yAggregate:'sum', mark:'MarkBar' }), 'SUPPRESS'],
  ['KEEP all-rise: every size band rises', chart(rowsAllRise(), { colorField:'seg', sizeField:'sz', yAggregate:'average' }), 'NARRATE'],
  ['KEEP CASE3-FLAT: rising bands + one exactly-flat', chart(rowsCase3Flat(), { colorField:'seg', sizeField:'sz', yAggregate:'average' }), 'NARRATE'],
  ['KEEP weak-scatter: n>=3 opposing band |r|<ρ', chart(rowsWeakScatter(), { colorField:'seg', sizeField:'sz', yAggregate:'average' }), 'NARRATE'],
  ['KEEP continuous ramp (all-distinct size)', chart(rowsContinuousRamp(), { colorField:'seg', sizeField:'sz', yAggregate:'average' }), 'NARRATE'],
  ['KEEP honest multi-axis (every fine band rises)', chart(rowsHonestMultiAxis(), { colorField:'seg', sizeField:'sz', detailField:'dt', yAggregate:'average' }), 'NARRATE'],
  ['KEEP ρ scattered opposing band |r|≈0.3', chart(rowsRhoScatter(), { sizeField:'sz', yAggregate:'average' }), 'NARRATE'],
  ['BYTE-IDENTITY weak-consistent categorical-only partition', chart(rowsWeakConsistentNoGrouping(), { colorField:'seg' }), 'NARRATE'],
];

let parityBad = 0, broke = 0, resurrect = 0;
console.log('label'.padEnd(58), 'expect'.padEnd(9), 'dist'.padEnd(10), 'proposal'.padEnd(10), 'result');
console.log('-'.repeat(120));
for (const [label, spec, expect] of cases) {
  const dist = analyzeVizSpec(spec).correlation;
  const ref = decide(spec, 'shipped');
  const trace = [];
  const prop = decide(spec, 'draft-amended-early-return', trace);
  if (!Object.is(dist, ref.r)) parityBad++;
  const distOK = expect === 'SUPPRESS' ? dist === undefined : dist !== undefined;
  const propOK = expect === 'SUPPRESS' ? prop.r === undefined : prop.r !== undefined;
  let result = 'ok';
  if (!distOK) result = 'BASELINE-MISMATCH';
  else if (!propOK && expect === 'NARRATE') { result = '*** KEEP-CONTROL BREAKS (goes silent)'; broke++; }
  else if (!propOK && expect === 'SUPPRESS') { result = '*** SURVIVOR RESURRECTED (narrates again)'; resurrect++; }
  console.log(label.padEnd(58), expect.padEnd(9), String(dist).padEnd(10), String(prop.r).padEnd(10), result);
  if (result !== 'ok') {
    console.log(`        partition=${JSON.stringify(ref.partitionFields)} grouping=${JSON.stringify(ref.groupingFields)} separable=${JSON.stringify(prop.separableFields)} pooled=${prop.pooled}`);
    console.log(`        proposal: ${prop.why}`);
    for (const t of trace) console.log(`        ${t}`);
  }
}
console.log('-'.repeat(120));
console.log(`parity mismatches vs dist: ${parityBad} | s164 KEEP-CONTROLS BROKEN: ${broke} | s164 RED-first SURVIVORS RESURRECTED: ${resurrect}`);
