// S165 PRE-LOCK CRITIC — the PROPOSED CORRECTION, verified on every fixture in one battery.
//   CORRECTION = three amendments to the draft:
//   (1) the deriveCorrelation early return also requires separableFields = ∅  (else A and B never reach G1');
//   (2) G1 (s164, partition-PREFIXED, groupingFields, ALL clauses a/b/c) is RETAINED UNCHANGED;
//   (3) G1' (new, unprefixed, separableFields) is a SUPPRESSION-ONLY ADD-ON restricted to clauses
//       (a) cross-sign contradiction and (b) a vote === −pooledSign. Clause (c) is NOT extended to the
//       superset band set. Final: narrate iff G0 ∧ ¬G1 ∧ ¬G1'.
//   This composition is a genuine DISJUNCTION of suppressors => provably monotone (§3.2's actual claim).
import { analyzeVizSpec, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
import { readFileSync } from 'node:fs';
const refSrc = readFileSync('/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/scratchpad/S165CRIT_does_it_kill_ABC.mjs', 'utf8');
const body = refSrc.split('// ───────────────────────── fixtures')[0].split("dist/index.js';")[1];
const R = new Function('analyzeVizSpec', 'resolvePrimaryChannels', `${body}\nreturn { decide, separableFields, correlationOppositionEvidenceOf, correlationPartitionFields, correlationGroupingFields, resolvePrimaryBindings, resolveBinding, projectAggregatedRows, narratedValueCellKey, pearson, toNumber, keyFor, classifyGroupDirection, narratableCorrelation };`)(analyzeVizSpec, resolvePrimaryChannels);

function decideCorrected(spec) {
  const b = R.resolvePrimaryBindings(spec);
  const rows = (spec.data.values ?? []).filter((r) => r && typeof r === 'object' && !Array.isArray(r));
  const agg = R.resolveBinding(spec, resolvePrimaryChannels(spec).measureChannel)?.aggregate;
  if (!b.dimensionField || !b.measureField) return { r: undefined };
  const valueRows = agg ? R.projectAggregatedRows(rows, b.dimensionField, b.measureField, agg, R.narratedValueCellKey(spec)) : rows;
  const xs = [], ys = [];
  for (const r of valueRows) { const x = R.toNumber(r[b.dimensionField]), y = R.toNumber(r[b.measureField]); if (x === null || y === null) continue; xs.push(x); ys.push(y); }
  const pooled = R.pearson(xs, ys);
  if (pooled === null) return { r: undefined };
  const P = R.correlationPartitionFields(spec, b.dimensionField, b.measureField);
  const G = R.correlationGroupingFields(spec, b.dimensionField, b.measureField, P, agg);
  const S = R.separableFields(spec, b.dimensionField, b.measureField);
  if (P.length === 0 && G.length === 0 && S.length === 0) return { r: pooled, why: 'early return' };
  const groups = new Map();
  for (const row of rows) { const k = R.keyFor(row, P); const g = groups.get(k); if (g) g.push(row); else groups.set(k, [row]); }
  const classes = [];
  for (const gr of groups.values()) classes.push(R.classifyGroupDirection(agg ? R.projectAggregatedRows(gr, b.dimensionField, b.measureField, agg, G) : gr, b.dimensionField, b.measureField));
  const g0 = R.narratableCorrelation(pooled, classes);
  const g1 = R.correlationOppositionEvidenceOf(rows, b.dimensionField, b.measureField, P, G, agg, pooled);  // s164, UNCHANGED
  const e = R.correlationOppositionEvidenceOf(rows, b.dimensionField, b.measureField, [], S, agg, pooled);  // new, unprefixed
  const g1p = !e.noop && e.anyVotable && (new Set(e.votes).size > 1 || e.votes.some((v) => v === -e.pooledSign)); // clauses (a)+(b) ONLY
  return { r: g0 && !g1.suppresses && !g1p ? pooled : undefined, why: `G0=${g0} G1(s164)=${g1.suppresses} G1'(a/b only)=${g1p} votes'=${JSON.stringify(e.votes)}` };
}

// ── the whole battery ─────────────────────────────────────────────────────────
const mk = (id, marks, enc, values) => ({ $schema: 'https://oods.dev/viz-spec/v1', id, name: id, data: { name: 'd', values }, marks: marks.map((t) => ({ trait: t, encodings: enc })), encoding: enc, a11y: { description: 'y over x' } });
const B_ = (field, trait, extra = {}) => ({ field, trait, ...extra });
function chart(rows, opts = {}) {
  const encoding = { x: B_('x', 'EncodingX', { type: 'quantitative' }), y: B_('y', 'EncodingY', { type: 'quantitative', ...(opts.yAggregate ? { aggregate: opts.yAggregate } : {}) }) };
  if (opts.colorField) encoding.color = B_(opts.colorField, 'EncodingColor');
  if (opts.sizeField) encoding.size = B_(opts.sizeField, 'EncodingSize', { type: 'quantitative' });
  if (opts.detailField) encoding.detail = B_(opts.detailField, 'EncodingDetail', { type: 'quantitative' });
  return { $schema: 'https://oods.dev/viz-spec/v1', id: 'c', name: 'c', data: { name: 'c', values: rows }, marks: [{ trait: opts.mark ?? 'MarkPoint', encodings: { ...encoding } }], encoding, a11y: { description: 'y over x' } };
}
const A_rows = [{x:1,y:30,shp:'circle'},{x:2,y:20,shp:'circle'},{x:3,y:10,shp:'circle'},{x:4,y:130,shp:'square'},{x:5,y:120,shp:'square'},{x:6,y:110,shp:'square'}];
const aEnc = { x:{field:'x',trait:'EncodingX',type:'quantitative'}, y:{field:'y',trait:'EncodingY',type:'quantitative'}, shape:{field:'shp',trait:'EncodingShape'} };
const B_rows = [{x:1,y:50,c:100},{x:2,y:40,c:100},{x:3,y:30,c:100},{x:1,y:10,c:200},{x:2,y:60,c:200},{x:3,y:110,c:200}];
const bEnc = { x:{field:'x',trait:'EncodingX',type:'quantitative'}, y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'sum'}, color:{field:'c',trait:'EncodingColor',type:'quantitative'} };
const C_rows = [{x:1,y:10,seg:'p',sz:1},{x:2,y:8,seg:'q',sz:1},{x:3,y:6,seg:'r',sz:1},{x:1,y:20,seg:'p',sz:2},{x:2,y:30,seg:'q',sz:2},{x:3,y:40,seg:'r',sz:2}];
const cEnc = { x:{field:'x',trait:'EncodingX',type:'quantitative'}, y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'}, color:{field:'seg',trait:'EncodingColor'}, size:{field:'sz',trait:'EncodingSize',type:'quantitative'} };
const rowsDisjointFlat = [{x:1,y:10,seg:'A',sz:10},{x:2,y:10,seg:'A',sz:10},{x:3,y:100,seg:'A',sz:20},{x:4,y:100,seg:'A',sz:20}];
const rowsWeakConsistent = (() => { const r=[]; const g=(seg,base)=>r.push({x:1,y:base+0,seg},{x:2,y:base+3,seg},{x:3,y:base-1,seg},{x:4,y:base+4,seg}); g('R',0);g('S',100);g('T',200); return r; })();
const rowsAllRise = (() => { const r=[]; for (const seg of ['A','B']) for (const sz of [10,20]) r.push({x:1,y:1+sz,seg,sz},{x:2,y:2+sz,seg,sz},{x:3,y:3+sz,seg,sz}); return r; })();
const rowsWeakScatter = [{x:1,y:10,seg:'A',sz:10},{x:2,y:20,seg:'A',sz:10},{x:3,y:30,seg:'A',sz:10},{x:1,y:52,seg:'A',sz:20},{x:2,y:49,seg:'A',sz:20},{x:3,y:51,seg:'A',sz:20}];
const rowsContinuousRamp = (() => { const r=[]; for (const seg of ['A','B']) { const o=seg==='A'?0:1;
  r.push({x:1,y:100+o,seg,sz:9.001+o*0.0001},{x:1,y:90+o,seg,sz:8.001+o*0.0001},{x:2,y:40+o,seg,sz:2.001+o*0.0001},{x:2,y:30+o,seg,sz:1.001+o*0.0001}); } return r; })();
const M1_rows = [{x:1,y:10,sz:1,shp:'a'},{x:2,y:10,sz:1,shp:'b'},{x:3,y:100,sz:2,shp:'a'},{x:4,y:100,sz:2,shp:'b'}];
const M1_enc = { x:{field:'x',trait:'EncodingX',type:'quantitative'}, y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'}, size:{field:'sz',trait:'EncodingSize',type:'quantitative'}, shape:{field:'shp',trait:'EncodingShape'} };
const scatter=[0,6,1,8,3]; const K4_rows=[]; for (const [seg,base] of [['p',10],['q',20],['r',30]]) scatter.forEach((v,i)=>K4_rows.push({x:i+1,y:base+v,seg}));
const K4_enc = { x:{field:'x',trait:'EncodingX',type:'quantitative'}, y:{field:'y',trait:'EncodingY',type:'quantitative'}, color:{field:'seg',trait:'EncodingColor'} };

const battery = [
  ['A  shape on mixed [line,point]              (MUST SUPPRESS)', mk('A',['MarkLine','MarkPoint'],aEnc,A_rows), 'SUPPRESS'],
  ['A2 shape on mixed [point,bar]               (MUST SUPPRESS)', mk('A2',['MarkPoint','MarkBar'],aEnc,A_rows), 'SUPPRESS'],
  ['A3 shape on mixed [line,area]               (MUST SUPPRESS)', mk('A3',['MarkLine','MarkArea'],aEnc,A_rows), 'SUPPRESS'],
  ['B  quant color ramp on sum-STACK            (MUST SUPPRESS)', mk('B',['MarkBar'],bEnc,B_rows), 'SUPPRESS'],
  ['C  collinear cat partition + size Simpson   (MUST SUPPRESS)', mk('C',['MarkPoint'],cEnc,C_rows), 'SUPPRESS'],
  ['s164 RED  disjoint-x all-flat offset', chart(rowsDisjointFlat,{colorField:'seg',sizeField:'sz',yAggregate:'average'}), 'SUPPRESS'],
  ['s164 KEEP all-rise', chart(rowsAllRise,{colorField:'seg',sizeField:'sz',yAggregate:'average'}), 'NARRATE'],
  ['s164 KEEP weak-scatter |r|<ρ', chart(rowsWeakScatter,{colorField:'seg',sizeField:'sz',yAggregate:'average'}), 'NARRATE'],
  ['s164 KEEP continuous ramp', chart(rowsContinuousRamp,{colorField:'seg',sizeField:'sz',yAggregate:'average'}), 'NARRATE'],
  ['s164 BYTE-IDENTITY weak-consistent cat-only partition', chart(rowsWeakConsistent,{colorField:'seg'}), 'NARRATE'],
  ['M1 all-flat-offset + shape-on-mixed', mk('M1',['MarkLine','MarkPoint'],M1_enc,M1_rows), 'SUPPRESS'],
  ['K4 honest 3-series, every series |r|<ρ', mk('K4',['MarkPoint'],K4_enc,K4_rows), 'NARRATE'],
];

let bad = 0;
console.log('fixture'.padEnd(56), 'want'.padEnd(9), 'dist'.padEnd(10), 'DRAFT'.padEnd(10), 'CORRECTED'.padEnd(10), '');
console.log('-'.repeat(128));
for (const [label, spec, want] of battery) {
  const dist = analyzeVizSpec(spec).correlation;
  const draft = R.decide(spec, 'draft-amended-early-return').r;
  const fixed = decideCorrected(spec);
  const ok = want === 'SUPPRESS' ? fixed.r === undefined : fixed.r !== undefined;
  const draftOk = want === 'SUPPRESS' ? draft === undefined : draft !== undefined;
  if (!ok) bad++;
  console.log(label.padEnd(56), want.padEnd(9), String(dist).padEnd(10), `${String(draft).padEnd(8)}${draftOk ? 'ok' : '!!'}`.padEnd(10), `${String(fixed.r).padEnd(8)}${ok ? 'ok' : '!!'}`.padEnd(10));
}
console.log('-'.repeat(128));
console.log(bad === 0 ? 'CORRECTED design: 12/12 — kills A,B,C AND holds every s164 RED-first + keep-control + the two new regression classes.' : `CORRECTED design still fails ${bad}`);
