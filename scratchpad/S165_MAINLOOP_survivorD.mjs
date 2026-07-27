// MAIN-LOOP independent verification of critic finding P3: a FOURTH live survivor at HEAD.
// Claim: resolveBinding returns only the FIRST mark carrying a channel, but toVegaLiteSpec compiles
// one layer per mark — so a layered spec binding the SAME channel to a DIFFERENT field per layer
// keeps a Simpson phantom on the layer-1 field, which is invisible to every gate.
import { analyzeVizSpec, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
import { toVegaLiteSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(p){const n=p.length;if(n<2)return null;const mx=p.reduce((s,q)=>s+q[0],0)/n,my=p.reduce((s,q)=>s+q[1],0)/n;let nu=0,dx=0,dy=0;for(const[x,y]of p){nu+=(x-mx)*(y-my);dx+=(x-mx)**2;dy+=(y-my)**2;}const d=Math.sqrt(dx*dy);return d===0?null:nu/d;}

// grp splits into two FALLING bands; seg (the layer-0 color) is CONSTANT so it partitions to 1 group.
const rows = [
  { x: 1, y: 30,  seg: 'only', grp: 'circle' }, { x: 2, y: 20,  seg: 'only', grp: 'circle' }, { x: 3, y: 10,  seg: 'only', grp: 'circle' },
  { x: 4, y: 130, seg: 'only', grp: 'square' }, { x: 5, y: 120, seg: 'only', grp: 'square' }, { x: 6, y: 110, seg: 'only', grp: 'square' },
];
console.log('hand-computed drawn bands by grp (the LAYER-1 colour field):');
console.log('  grp=circle:', pearson([[1,30],[2,20],[3,10]]).toFixed(3), '(FALLS)');
console.log('  grp=square:', pearson([[4,130],[5,120],[6,110]]).toFixed(3), '(FALLS)');
console.log('  POOLED    :', pearson(rows.map(r=>[r.x,r.y])).toFixed(3), '(RISES)');

const base = { x:{field:'x',trait:'EncodingX',type:'quantitative'}, y:{field:'y',trait:'EncodingY',type:'quantitative'} };
const mk = (colorField) => ({ ...base, color:{ field: colorField, trait:'EncodingColor' } });

// LAYERED: layer0 colours by seg (constant), layer1 colours by grp (the real splitter)
const layered = {
  $schema:'https://oods.dev/viz-spec/v1', id:'d', name:'d', data:{name:'d',values:rows},
  marks:[{trait:'MarkLine',encodings:mk('seg')},{trait:'MarkPoint',encodings:mk('grp')}],
  encoding: base, a11y:{description:'y over x'},
};
// CONTROL: grp is the ONLY colour (single mark) -> gate should see it and suppress
const control = {
  $schema:'https://oods.dev/viz-spec/v1', id:'ctl', name:'ctl', data:{name:'d',values:rows},
  marks:[{trait:'MarkPoint',encodings:mk('grp')}], encoding: mk('grp'), a11y:{description:'y over x'},
};

for (const [label, spec] of [['LAYERED per-layer colour (seg on L0, grp on L1)', layered], ['CONTROL grp as the only colour', control]]) {
  const a = analyzeVizSpec(spec);
  const kf = (generateNarrativeSummary(spec).keyFindings||[]).find(k=>/orrelation/.test(JSON.stringify(k)));
  console.log(`\n=== ${label} ===`);
  console.log('  correlation =', a.correlation, a.correlation===undefined?'(SUPPRESSED)':'(NARRATED)');
  console.log('  keyFinding  =', kf?JSON.stringify(kf):'(none)');
}

// Does the COMPILED output really draw both colour fields?
try {
  const vl = toVegaLiteSpec(layered);
  const layers = vl.layer || vl.spec?.layer;
  console.log('\ncompiled layer colour fields:', JSON.stringify((layers||[]).map(l=>l.encoding?.color?.field)));
} catch (e) { console.log('\ncompile probe failed:', e.message); }
