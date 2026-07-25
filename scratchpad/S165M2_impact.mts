// s165 m2: does G1′ kill A/B/C/D, keep the keep-controls narrating, keep the stays-suppressed set
// suppressed, and leave the corpus alone? Runs against SRC.
import { globSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  analyzeVizSpec,
  separableFields,
  correlationSeparabilityEvidence,
  resolvePrimaryChannels,
  getEncodingBinding,
} from '../packages/viz-core/src/a11y/data-analysis.js';

const REPO = path.resolve(import.meta.dirname, '..');
type Row = Record<string, unknown>;
const XY = {
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
  y: { field: 'y', trait: 'EncodingY', type: 'quantitative' },
};
const mk = (marks: any[], encoding: any, values: Row[], extra: any = {}) =>
  ({
    $schema: 'https://oods.dev/viz-spec/v1', id: 'p', name: 'p',
    data: { name: 'd', values }, marks, encoding, a11y: { description: 'y over x' }, ...extra,
  }) as any;

// ── the s164 fixture vocabulary (same builder shape as the s164 proof spec) ──
function chart(rows: Row[], opts: any = {}) {
  const encoding: any = {
    x: XY.x,
    y: { field: 'y', trait: 'EncodingY', type: 'quantitative', ...(opts.yAggregate ? { aggregate: opts.yAggregate } : {}) },
  };
  if (opts.colorField) encoding.color = { field: opts.colorField, trait: 'EncodingColor' };
  if (opts.sizeField) encoding.size = { field: opts.sizeField, trait: 'EncodingSize', type: 'quantitative' };
  if (opts.detailField) encoding.detail = { field: opts.detailField, trait: 'EncodingDetail', type: 'quantitative' };
  return mk([{ trait: opts.mark ?? 'MarkPoint', encodings: { ...encoding } }], encoding, rows);
}

const rowsDefect1 = (): Row[] => { const r: Row[] = []; const a = (x: number, y: number, seg: string, sz: number) => r.push({ x, y, seg, sz });
  a(1,50,'A',100);a(2,40,'A',100);a(3,30,'A',100);a(4,250,'A',200);a(5,240,'A',200);a(6,230,'A',200);
  a(1,1050,'B',100);a(2,1040,'B',100);a(3,1030,'B',100);a(4,1250,'B',200);a(5,1240,'B',200);a(6,1230,'B',200); return r; };
const rowsDefect5 = (): Row[] => { const r: Row[] = []; const a=(x:number,y:number,sz:number)=>r.push({x,y,sz});
  a(1,50,10);a(2,40,10);a(3,30,10);a(4,250,20);a(5,240,20);a(6,230,20);a(7,450,30);a(8,440,30);a(9,430,30); return r; };
const rowsDisjointFlat = (): Row[] => [
  { x:1,y:10,seg:'A',sz:10 },{ x:2,y:10,seg:'A',sz:10 },{ x:3,y:100,seg:'A',sz:20 },{ x:4,y:100,seg:'A',sz:20 }];
const rowsAllRise = (): Row[] => { const r: Row[] = []; for (const seg of ['A','B']) for (const sz of [10,20]) r.push({x:1,y:1+sz,seg,sz},{x:2,y:2+sz,seg,sz},{x:3,y:3+sz,seg,sz}); return r; };
const rowsCase3Flat = (): Row[] => [
  {x:1,y:11,seg:'A',sz:10},{x:2,y:12,seg:'A',sz:10},{x:3,y:13,seg:'A',sz:10},
  {x:1,y:21,seg:'A',sz:20},{x:2,y:22,seg:'A',sz:20},{x:3,y:23,seg:'A',sz:20},
  {x:1,y:50,seg:'B',sz:10},{x:2,y:50,seg:'B',sz:10},{x:3,y:50,seg:'B',sz:10},
  {x:1,y:71,seg:'B',sz:20},{x:2,y:72,seg:'B',sz:20},{x:3,y:73,seg:'B',sz:20}];
const rowsWeakScatter = (): Row[] => [
  {x:1,y:10,seg:'A',sz:10},{x:2,y:20,seg:'A',sz:10},{x:3,y:30,seg:'A',sz:10},
  {x:1,y:52,seg:'A',sz:20},{x:2,y:49,seg:'A',sz:20},{x:3,y:51,seg:'A',sz:20}];
const rowsContinuousRamp = (): Row[] => { const r: Row[] = []; const m=(seg:string,x:number,y:number,sz:number)=>r.push({x,y,seg,sz});
  for (const seg of ['A','B']) { const o = seg==='A'?0:1;
    m(seg,1,100+o,9.001+o*0.0001); m(seg,1,90+o,8.001+o*0.0001); m(seg,2,40+o,2.001+o*0.0001); m(seg,2,30+o,1.001+o*0.0001);} return r; };
const rowsHonestMultiAxis = (): Row[] => { const r: Row[] = []; for (const seg of ['A','B']) for (const sz of [10,20]) for (const dt of [1,2]) {
  const base = sz + dt*5 + (seg==='A'?0:3); r.push({x:1,y:base+1,seg,sz,dt},{x:2,y:base+5,seg,sz,dt},{x:3,y:base+10,seg,sz,dt}); } return r; };
const rowsRhoScatter = (): Row[] => { const r: Row[] = []; [10,20,30,40,50].forEach((y,i)=>r.push({x:i+1,y,sz:10}));
  [55,49,54,50,52].forEach((y,i)=>r.push({x:i+1,y:y+100,sz:20})); return r; };
const rowsWeakConsistentNoGrouping = (): Row[] => { const r: Row[] = [];
  const g=(seg:string,b:number)=>r.push({x:1,y:b+0,seg},{x:2,y:b+3,seg},{x:3,y:b-1,seg},{x:4,y:b+4,seg});
  g('R',0);g('S',100);g('T',200); return r; };
const rowsN2Opposite = (): Row[] => [
  {x:1,y:10,sz:10},{x:2,y:20,sz:10},{x:3,y:30,sz:10},{x:4,y:105,sz:20},{x:5,y:104,sz:20}];
const rowsF5Stacking = (): Row[] => { const r: Row[] = [];
  const d: [number,number,string,number][] = [[1,30,'A',10],[2,20,'A',10],[3,10,'A',10],[1,5,'B',20],[2,25,'B',20],[3,60,'B',20]];
  for (const [x,y,seg,sz] of d) r.push({x,y,seg,sz}); return r; };
const rowsDefect4 = (): Row[] => { const r: Row[] = [];
  const base: [string,number,number][] = [['A',1,20],['A',2,10],['B',3,100],['B',4,90]]; let c=0;
  for (const [seg,x,y] of base) { c++; r.push({x,y,seg,sz:1.0+c*0.5}); } return r; };

// honest 3-series chart, every series r≈0.376, nothing falling (§5 keep-control)
const rowsHonest376 = (): Row[] => { const r: Row[] = [];
  for (const [seg, b] of [['A',0],['B',50],['C',100]] as [string, number][]) {
    [1,3,2,5,4].forEach((y,i)=>r.push({x:i+1,y:b+y,seg})); } return r; };

// ── survivors ──
const aEnc = { ...XY, shape: { field: 'shp', trait: 'EncodingShape' } };
const aRows: Row[] = [
  {x:1,y:30,shp:'circle'},{x:2,y:20,shp:'circle'},{x:3,y:10,shp:'circle'},
  {x:4,y:130,shp:'square'},{x:5,y:120,shp:'square'},{x:6,y:110,shp:'square'}];
const survivorA = (traits: string[]) => mk(traits.map((t)=>({trait:t,encodings:aEnc})), aEnc, aRows);
const bEnc = { x: XY.x, y: { field:'y',trait:'EncodingY',type:'quantitative',aggregate:'sum' }, color:{field:'c',trait:'EncodingColor',type:'quantitative'} };
const survivorB = mk([{trait:'MarkBar',encodings:bEnc}], bEnc, [
  {x:1,y:50,c:100},{x:2,y:40,c:100},{x:3,y:30,c:100},{x:1,y:10,c:200},{x:2,y:60,c:200},{x:3,y:110,c:200}]);
const cEnc = { x: XY.x, y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'}, color:{field:'seg',trait:'EncodingColor'}, size:{field:'sz',trait:'EncodingSize',type:'quantitative'} };
const survivorC = mk([{trait:'MarkPoint',encodings:cEnc}], cEnc, [
  {x:1,y:10,seg:'p',sz:1},{x:2,y:8,seg:'q',sz:1},{x:3,y:6,seg:'r',sz:1},
  {x:1,y:20,seg:'p',sz:2},{x:2,y:30,seg:'q',sz:2},{x:3,y:40,seg:'r',sz:2}]);
const dRows: Row[] = [
  {x:1,y:30,seg:'only',grp:'circle'},{x:2,y:20,seg:'only',grp:'circle'},{x:3,y:10,seg:'only',grp:'circle'},
  {x:4,y:130,seg:'only',grp:'square'},{x:5,y:120,seg:'only',grp:'square'},{x:6,y:110,seg:'only',grp:'square'}];
const survivorD = (channel: string, trait: string) => mk([
  {trait:'MarkLine',encodings:{...XY,[channel]:{field:'seg',trait}}},
  {trait:'MarkPoint',encodings:{...XY,[channel]:{field:'grp',trait}}}], XY, dRows);

const rows = (label: string, spec: any, want: 'undefined' | 'defined') => {
  const c = analyzeVizSpec(spec).correlation;
  const ev = correlationSeparabilityEvidence(spec);
  const ok = want === 'undefined' ? c === undefined : c !== undefined;
  console.log(
    `  ${ok ? 'PASS' : '**FAIL**'}  ${label.padEnd(56)} corr=${String(c).padEnd(9)} want=${want.padEnd(9)} G1'votes=[${ev.votes}] suppresses=${ev.suppresses}`
  );
  return ok;
};

let fails = 0;
const t = (ok: boolean) => { if (!ok) fails++; };

console.log('######## RED-FIRST: the four survivors must go undefined ########');
t(rows('A mixed[line,point] + shape', survivorA(['MarkLine','MarkPoint']), 'undefined'));
t(rows('A mixed[point,bar] + shape', survivorA(['MarkPoint','MarkBar']), 'undefined'));
t(rows('A mixed[line,area] + shape', survivorA(['MarkLine','MarkArea']), 'undefined'));
t(rows('A MarkBar + shape (mechanism-1 twin)', survivorA(['MarkBar']), 'undefined'));
t(rows('B sum-stacked bar + quant color ramp', survivorB, 'undefined'));
t(rows('C collinear categorical + size Simpson', survivorC, 'undefined'));
t(rows('D per-layer color', survivorD('color','EncodingColor'), 'undefined'));
t(rows('D per-layer detail', survivorD('detail','EncodingDetail'), 'undefined'));
t(rows('D per-layer shape', survivorD('shape','EncodingShape'), 'undefined'));

console.log('\n######## KEEP-CONTROLS: must STAY narrating ########');
t(rows('honest all-rise multi-series', chart(rowsAllRise(), {colorField:'seg',sizeField:'sz',yAggregate:'average'}), 'defined'));
t(rows('CASE3-FLAT', chart(rowsCase3Flat(), {colorField:'seg',sizeField:'sz',yAggregate:'average'}), 'defined'));
t(rows('weak-scatter (rho gray-zone)', chart(rowsWeakScatter(), {colorField:'seg',sizeField:'sz',yAggregate:'average'}), 'defined'));
t(rows('continuous ramp', chart(rowsContinuousRamp(), {colorField:'seg',sizeField:'sz',yAggregate:'average'}), 'defined'));
t(rows('honest multi-axis (all fine bands rise)', chart(rowsHonestMultiAxis(), {colorField:'seg',sizeField:'sz',detailField:'dt',yAggregate:'average'}), 'defined'));
t(rows('rho-scatter (below floor)', chart(rowsRhoScatter(), {sizeField:'sz',yAggregate:'average'}), 'defined'));
t(rows('rowsWeakConsistentNoGrouping (0.011)', chart(rowsWeakConsistentNoGrouping(), {colorField:'seg'}), 'defined'));
t(rows('honest 3-series r=0.376, nothing falling', chart(rowsHonest376(), {colorField:'seg'}), 'defined'));
t(rows('single falling series (no separable field)', mk([{trait:'MarkLine',encodings:XY}], XY, [{x:1,y:30},{x:2,y:20},{x:3,y:10}]), 'defined'));
t(rows('noisy honest rise r=0.96 single series', mk([{trait:'MarkPoint',encodings:XY}], XY, [{x:1,y:10},{x:2,y:19},{x:3,y:32},{x:4,y:38},{x:5,y:52}]), 'defined'));

console.log('\n######## STAYS-SUPPRESSED: the s164 suppression set must not reopen ########');
t(rows('rowsDisjointFlat (the 11th-phantom fixture)', chart(rowsDisjointFlat(), {colorField:'seg',sizeField:'sz',yAggregate:'average'}), 'undefined'));
t(rows('defect1 (color partition + quant size)', chart(rowsDefect1(), {colorField:'seg',sizeField:'sz',yAggregate:'average'}), 'undefined'));
t(rows('defect5 (size-only Simpson)', chart(rowsDefect5(), {sizeField:'sz',yAggregate:'average'}), 'undefined'));
t(rows('defect4 (between-partition + continuous size)', chart(rowsDefect4(), {colorField:'seg',sizeField:'sz',yAggregate:'average'}), 'undefined'));
t(rows('F5 stacked-bar Simpson + quant size', chart(rowsF5Stacking(), {colorField:'seg',sizeField:'sz',yAggregate:'sum',mark:'MarkBar'}), 'undefined'));
t(rows('n2-opposite', chart(rowsN2Opposite(), {sizeField:'sz',yAggregate:'average'}), 'undefined'));

console.log('\n######## CORPUS: the 6 narrating specs ########');
const GLOBS = ['examples/viz/**/*.spec.json'];
let moved = 0;
const HEAD_NARRATING: Record<string, number> = {
  'examples/viz/patterns-v2/bubble-distribution.spec.json': 0.736,
  'examples/viz/patterns-v2/correlation-scatter.spec.json': -0.979,
  'examples/viz/patterns-v2/linked-brush-scatter.spec.json': 0.901,
  'examples/viz/patterns/bubble-distribution.spec.json': 0.736,
  'examples/viz/patterns/correlation-scatter.spec.json': -0.979,
  'examples/viz/scatter-chart.spec.json': -0.985,
};
for (const file of [...new Set(GLOBS.flatMap((g) => globSync(path.join(REPO, g))))].sort()) {
  const spec = JSON.parse(readFileSync(file, 'utf8')) as any;
  const short = path.relative(REPO, file);
  if (!Array.isArray(spec.marks)) continue;
  const c = analyzeVizSpec(spec).correlation;
  const was = HEAD_NARRATING[short];
  if (was !== undefined) {
    const same = c === was;
    if (!same) moved++;
    const ch = resolvePrimaryChannels(spec);
    const sfl = separableFields(spec, getEncodingBinding(spec, ch.dimensionChannel)?.field ?? '', getEncodingBinding(spec, ch.measureChannel)?.field ?? '');
    console.log(`  ${same ? 'PASS' : '**MOVED**'}  ${short.padEnd(56)} HEAD=${was}  now=${c}  sf=[${sfl}]  votes=[${correlationSeparabilityEvidence(spec).votes}]`);
  } else if (c !== undefined) {
    moved++;
    console.log(`  **NEW NARRATION**  ${short} now=${c}`);
  }
}

console.log(`\n######## RESULT: ${fails} fixture failures, ${moved} corpus movements ########`);
