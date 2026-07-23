// INDEPENDENT reviewer reproduction of the s162 size-collapse correlation phantom.
// Hand-oracles computed here; SUT observed from fresh dist.
import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs){
  const n=pairs.length; if(n<2) return null;
  const mx=pairs.reduce((s,p)=>s+p[0],0)/n, my=pairs.reduce((s,p)=>s+p[1],0)/n;
  let num=0,dx=0,dy=0; for(const [x,y] of pairs){num+=(x-mx)*(y-my);dx+=(x-mx)**2;dy+=(y-my)**2;}
  const den=Math.sqrt(dx*dy); return den===0?null:num/den;
}

// Bubble/scatter with y AVERAGED, color=seg (categorical, ACTIVE partition), size=sz (quantitative).
// seg A: (x1,y0)x1, (x2,y100)x1, (x3,y10)x100 distinct sz  -> drawn (size-keyed) cells FALL, per-x means RISE
// seg B: (x4,y200)x1,(x5,y300)x1,(x6,y210)x100 distinct sz
const rows=[];
const push=(x,y,g,k)=>{for(let i=0;i<k;i++) rows.push({x,y,seg:g,sz:(g==='A'?0:1000)+x*1000+i});};
push(1,0,'A',1); push(2,100,'A',1); push(3,10,'A',100);
push(4,200,'B',1); push(5,300,'B',1); push(6,210,'B',100);

const enc={ x:{field:'x',trait:'EncodingX',type:'quantitative'},
            y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},
            color:{field:'seg',trait:'EncodingColor'},
            size:{field:'sz',trait:'EncodingSize',type:'quantitative'} };
const spec={ $schema:'https://oods.dev/viz-spec/v1', id:'sz', name:'sz',
  data:{name:'d',values:rows},
  marks:[{trait:'MarkPoint',encodings:enc}], encoding:enc, a11y:{description:'y over x'} };

// ---- SUT ----
const a=analyzeVizSpec(spec); const {summary,keyFindings}=generateNarrativeSummary(spec);
console.log('resolvePrimaryChannels:', JSON.stringify(resolvePrimaryChannels(spec)));
console.log('SUT analysis.correlation:', a.correlation);
console.log('SUT summary:', summary);
console.log('SUT keyFindings:', JSON.stringify(keyFindings));

// ---- hand oracles over the DRAWN (size-keyed) cells the codebase pools the VALUE over ----
// drawn cell = one per (x,seg,sz) under avg = one per raw row here (each sz distinct) => y is the row's y.
const cellsA=rows.filter(r=>r.seg==='A').map(r=>[r.x,r.y]);
const cellsB=rows.filter(r=>r.seg==='B').map(r=>[r.x,r.y]);
const cellsAll=rows.map(r=>[r.x,r.y]);
console.log('\n-- DRAWN (size-keyed) cells, the cells the narrated VALUE pools over --');
console.log('seg A pearson (size-keyed drawn cells):', pearson(cellsA)?.toFixed(4));
console.log('seg B pearson (size-keyed drawn cells):', pearson(cellsB)?.toFixed(4));
console.log('POOLED over all size-keyed drawn cells:', pearson(cellsAll)?.toFixed(4), '  <- should equal SUT correlation');

// ---- hand oracle over the DIRECTION-GATE cells (per-x means, size COLLAPSED) ----
function perXmeans(rs){ const m=new Map(); for(const r of rs){ if(!m.has(r.x)) m.set(r.x,[]); m.get(r.x).push(r.y);} 
  return [...m.entries()].map(([x,ys])=>[x, ys.reduce((s,v)=>s+v,0)/ys.length]); }
console.log('\n-- DIRECTION-GATE cells (per-x means, size collapsed by groupingFields=[]) --');
console.log('seg A per-x-mean pearson:', pearson(perXmeans(rows.filter(r=>r.seg==='A')))?.toFixed(4));
console.log('seg B per-x-mean pearson:', pearson(perXmeans(rows.filter(r=>r.seg==='B')))?.toFixed(4));

// ---- CONTROL: identical data, size channel REMOVED (drawn cells become per-x means) ----
const enc2={...enc}; delete enc2.size;
const spec2={...spec, encoding:enc2, marks:[{trait:'MarkPoint',encodings:enc2}], id:'nosz'};
console.log('\n-- CONTROL: size channel removed (chart now draws per-x means) --');
console.log('  SUT correlation:', analyzeVizSpec(spec2).correlation, '(honest: per-color per-x means genuinely rise -> no Simpson)');
