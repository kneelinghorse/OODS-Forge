// S165 critic — is "removing the partition prefix can only ADD suppression" (memo §3.2) true?
// Claim under test: the manufactured-vote guard only DEFERS S=∅. Without the partition prefix, the
// subset S={partitionField} reproduces exactly the per-partition-group S=∅ aggregate the guard defers —
// but now with |S|>=1, so it counts as a genuine "fine band", votes, and can FLIP suppression → narration.
import { analyzeVizSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
import { derive, oppositionEvidence, separableFields, correlationPartitionFields, correlationGroupingFields, pearson }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/scratchpad/S165CRIT_lib.mjs';

const B_ = (field, trait, extra = {}) => ({ field, trait, ...extra });
function chart(rows, opts = {}) {
  const encoding = { x: B_('x','EncodingX',{type:'quantitative'}), y: B_('y','EncodingY',{type:'quantitative',...(opts.yAggregate?{aggregate:opts.yAggregate}:{})}) };
  if (opts.colorField) encoding.color = B_(opts.colorField,'EncodingColor', opts.colorQuant?{type:'quantitative'}:{});
  if (opts.sizeField) encoding.size = B_(opts.sizeField,'EncodingSize',{type:'quantitative'});
  const marks = (opts.marks ?? [opts.mark ?? 'MarkPoint']).map(t => ({ trait: t, encodings: { ...encoding } }));
  return { $schema:'https://oods.dev/viz-spec/v1', id:'c', name:'c', data:{name:'d',values:rows}, marks, encoding, a11y:{description:'y over x'} };
}
const show = (label, spec) => {
  const dim='x', meas='y';
  const agg = spec.encoding.y.aggregate;
  const cur = derive(spec,'current'), lit = derive(spec,'memo-literal'), amd = derive(spec,'amended');
  const live = analyzeVizSpec(spec).correlation;
  const P = correlationPartitionFields(spec,dim,meas), G = correlationGroupingFields(spec,dim,meas,P,agg), S = separableFields(spec,dim,meas);
  const raw = spec.data.values;
  const pooledRows = raw; // no aggregate collapse needed for the display
  const evNow = oppositionEvidence(raw,dim,meas,P,G,agg, cur.corr ?? (lit.corr ?? 0));
  console.log(`\n=== ${label} ===`);
  console.log(`  dist correlation      : ${live}`);
  console.log(`  P=${JSON.stringify(P)}  G=${JSON.stringify(G)}  SEP=${JSON.stringify(S)}`);
  console.log(`  s164 (today)          : ${cur.corr === undefined ? 'SUPPRESSED' : cur.corr}   [${cur.why}]`);
  console.log(`  s165 memo-literal     : ${lit.corr === undefined ? 'SUPPRESSED' : lit.corr}   [${lit.why}]`);
  console.log(`  s165 amended-earlyret : ${amd.corr === undefined ? 'SUPPRESSED' : amd.corr}   [${amd.why}]`);
  if (lit.ev) console.log(`  s165 G1' evidence     : votes=${JSON.stringify(lit.ev.votes)} anyVotable=${lit.ev.anyVotable} sharesPooled=${lit.ev.sharesPooled} pooledSign=${lit.ev.pooledSign} suppresses=${lit.ev.suppresses}`);
  if (cur.ev) console.log(`  s164 G1  evidence     : votes=${JSON.stringify(cur.ev.votes)} anyVotable=${cur.ev.anyVotable} sharesPooled=${cur.ev.sharesPooled} pooledSign=${cur.ev.pooledSign} suppresses=${cur.ev.suppresses}`);
  return { live, cur: cur.corr, lit: lit.corr, amd: amd.corr };
};

// (1) the EXISTING s164 RED-first fixture "disjoint-x all-flat offset"
const disjointFlat = [
  { x:1,y:10,seg:'A',sz:10 },{ x:2,y:10,seg:'A',sz:10 },{ x:3,y:100,seg:'A',sz:20 },{ x:4,y:100,seg:'A',sz:20 },
];
show('s164 RED-first fixture: disjoint-x all-flat offset (spec asserts UNDEFINED)', chart(disjointFlat,{colorField:'seg',sizeField:'sz',yAggregate:'average'}));

// (2) the SAME mechanism with a genuinely 2-valued partition — proves it is a CLASS, not a constant-field artifact.
// Two colour groups; inside each, every drawn size band is EXACTLY FLAT at disjoint x (nothing rises).
// Pooled rises purely from the between-band offsets. s164 suppresses (clause c). Does s165 still?
const twoValuePartition = [
  { x:1,y:10, seg:'A',sz:10 },{ x:2,y:10, seg:'A',sz:10 },
  { x:3,y:60, seg:'A',sz:20 },{ x:4,y:60, seg:'A',sz:20 },
  { x:5,y:110,seg:'B',sz:30 },{ x:6,y:110,seg:'B',sz:30 },
  { x:7,y:160,seg:'B',sz:40 },{ x:8,y:160,seg:'B',sz:40 },
];
show('2-valued partition, every drawn size band FLAT, pooled rises from offsets only', chart(twoValuePartition,{colorField:'seg',sizeField:'sz',yAggregate:'average'}));

// (3) control: same shape but the size bands genuinely FALL (a real opposite) — both designs must suppress.
const realOpposite = [
  { x:1,y:20, seg:'A',sz:10 },{ x:2,y:10, seg:'A',sz:10 },
  { x:3,y:70, seg:'A',sz:20 },{ x:4,y:60, seg:'A',sz:20 },
  { x:5,y:120,seg:'B',sz:30 },{ x:6,y:110,seg:'B',sz:30 },
  { x:7,y:170,seg:'B',sz:40 },{ x:8,y:160,seg:'B',sz:40 },
];
show('CONTROL: same shape but every size band FALLS (real opposite) — both must SUPPRESS', chart(realOpposite,{colorField:'seg',sizeField:'sz',yAggregate:'average'}));

console.log('\n──────────────────────────────────────────────────────────────────────');
console.log('If any row above shows s164=SUPPRESSED and s165=<a number>, memo §3.2\'s');
console.log('"monotone: can only add suppression" and RULE 15\'s "can never under-suppress"');
console.log('are BOTH falsified — the s165 scan narrates where s164 was silent.');
