// S163 genuine-close review — lens "measurexclude" (measure-exclusion / arg drift).
// HYPOTHESIS: narratedValueCellKey(spec) and correlationGroupingFields(spec,measure,stacking)
// both call drawnCellKeyFields but MIGHT pass different measureField/stacking -> value key and
// classifier key DIVERGE for a real spec -> a raw-vs-drawn Simpson survives the s163 subset gate.
// We test BEHAVIORALLY against the fresh dist (analyzeVizSpec.correlation + generateNarrativeSummary)
// and hand-oracle Pearson over the DRAWN cells the value pools over vs the per-partition direction.
import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs){
  const n=pairs.length; if(n<2) return null;
  const mx=pairs.reduce((s,p)=>s+p[0],0)/n, my=pairs.reduce((s,p)=>s+p[1],0)/n;
  let num=0,dx=0,dy=0; for(const [x,y] of pairs){num+=(x-mx)*(y-my);dx+=(x-mx)**2;dy+=(y-my)**2;}
  const den=Math.sqrt(dx*dy); return den===0?null:num/den;
}
// project raw rows to drawn cells: one cell per distinct tuple of keyFields (incl dim), avg the measure
function projectAvg(rows, dimF, measF, keyFields){
  const groups=new Map();
  for(const r of rows){ const key=keyFields.map(f=>String(r[f])).join('\0');
    if(!groups.has(key)) groups.set(key,{dim:r[dimF],vals:[]}); groups.get(key).vals.push(Number(r[measF])); }
  return [...groups.values()].map(g=>[Number(g.dim), g.vals.reduce((s,v)=>s+v,0)/g.vals.length]);
}
const banner=(t)=>console.log('\n========================= '+t+' =========================');

// ---------------------------------------------------------------------------
// CASE 1 (baseline): the s162 size fixture. EXPECT SUT undefined (s163 closed it).
// ---------------------------------------------------------------------------
banner('CASE 1 — s162 size fixture (expect SUT undefined)');
{
  const rows=[]; const push=(x,y,g,k)=>{for(let i=0;i<k;i++) rows.push({x,y,seg:g,sz:(g==='A'?0:1000)+x*1000+i});};
  push(1,0,'A',1); push(2,100,'A',1); push(3,10,'A',100);
  push(4,200,'B',1); push(5,300,'B',1); push(6,210,'B',100);
  const enc={ x:{field:'x',trait:'EncodingX',type:'quantitative'},
              y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},
              color:{field:'seg',trait:'EncodingColor'},
              size:{field:'sz',trait:'EncodingSize',type:'quantitative'} };
  const spec={ $schema:'x', id:'c1', name:'c1', data:{name:'d',values:rows},
    marks:[{trait:'MarkPoint',encodings:enc}], encoding:enc, a11y:{description:'y over x'} };
  console.log('channels:', JSON.stringify(resolvePrimaryChannels(spec)));
  console.log('SUT correlation:', analyzeVizSpec(spec).correlation);
  // drawn cells the VALUE pools over = per (x,seg,sz). seg A / seg B FALL, pooled RISES.
  console.log('oracle seg A (size-keyed drawn):', pearson(projectAvg(rows.filter(r=>r.seg==='A'),'x','y',['x','seg','sz']))?.toFixed(3));
  console.log('oracle seg B (size-keyed drawn):', pearson(projectAvg(rows.filter(r=>r.seg==='B'),'x','y',['x','seg','sz']))?.toFixed(3));
  console.log('oracle POOLED (size-keyed drawn):', pearson(projectAvg(rows,'x','y',['x','seg','sz']))?.toFixed(3));
}

// ---------------------------------------------------------------------------
// CASE 2 (ARG-DRIFT STRESS): measure on X (horizontalAggregatedBar), categorical color
// partition + quantitative size. If narratedValueCellKey and correlationGroupingFields derived
// measureField differently, the size re-absorption would fail on the measure=X path -> Simpson leaks.
// dim = y (yr, quantitative), measure = x (val, avg). color=seg categorical, size=sz quant.
// Construct: within each seg, per-(yr,sz) cells FALL, per-yr means RISE (count-weight on one yr).
// ---------------------------------------------------------------------------
banner('CASE 2 — measure=X horizontal aggregated bar + color partition + quant size (arg-drift stress)');
{
  // yr is the correlation dimension; val is the measure on X. Same Simpson geometry as case 1, axes swapped.
  const rows=[]; const push=(yr,val,g,k)=>{for(let i=0;i<k;i++) rows.push({yr,val,seg:g,sz:(g==='A'?0:1000)+yr*1000+i});};
  push(1,0,'A',1); push(2,100,'A',1); push(3,10,'A',100);
  push(4,200,'B',1); push(5,300,'B',1); push(6,210,'B',100);
  const enc={ x:{field:'val',trait:'EncodingX',type:'quantitative',aggregate:'average'},
              y:{field:'yr',trait:'EncodingY',type:'quantitative'},
              color:{field:'seg',trait:'EncodingColor'},
              size:{field:'sz',trait:'EncodingSize',type:'quantitative'} };
  const spec={ $schema:'x', id:'c2', name:'c2', data:{name:'d',values:rows},
    marks:[{trait:'MarkBar',encodings:enc}], encoding:enc, a11y:{description:'val over yr'} };
  console.log('channels:', JSON.stringify(resolvePrimaryChannels(spec)));
  const sut=analyzeVizSpec(spec).correlation;
  console.log('SUT correlation:', sut);
  // drawn cells the VALUE pools over: measure=val, dim=yr, key=[yr,seg,sz]
  console.log('oracle seg A (size-keyed drawn, yr vs val):', pearson(projectAvg(rows.filter(r=>r.seg==='A'),'yr','val',['yr','seg','sz']))?.toFixed(3));
  console.log('oracle seg B (size-keyed drawn, yr vs val):', pearson(projectAvg(rows.filter(r=>r.seg==='B'),'yr','val',['yr','seg','sz']))?.toFixed(3));
  console.log('oracle POOLED (size-keyed drawn):', pearson(projectAvg(rows,'yr','val',['yr','seg','sz']))?.toFixed(3));
  console.log('=> per-seg drawn cells FALL; pooled RISES. HONEST verdict = SUPPRESS (undefined).');
  console.log('   SURVIVOR iff SUT is a DEFINED positive number.');
}

// ---------------------------------------------------------------------------
// CASE 3 (channel drift): partition on color (categorical) + a QUANTITATIVE DETAIL channel
// carrying the count-weight (instead of size). correlationPartitionFields skips quant detail;
// drawnCellKeyFields keeps it -> must be re-absorbed by groupingFields exactly like size.
// ---------------------------------------------------------------------------
banner('CASE 3 — quant DETAIL channel carries the Simpson (not size)');
{
  const rows=[]; const push=(x,y,g,k)=>{for(let i=0;i<k;i++) rows.push({x,y,seg:g,dd:(g==='A'?0:1000)+x*1000+i});};
  push(1,0,'A',1); push(2,100,'A',1); push(3,10,'A',100);
  push(4,200,'B',1); push(5,300,'B',1); push(6,210,'B',100);
  const enc={ x:{field:'x',trait:'EncodingX',type:'quantitative'},
              y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},
              color:{field:'seg',trait:'EncodingColor'},
              detail:{field:'dd',trait:'EncodingDetail',type:'quantitative'} };
  const spec={ $schema:'x', id:'c3', name:'c3', data:{name:'d',values:rows},
    marks:[{trait:'MarkPoint',encodings:enc}], encoding:enc, a11y:{description:'y over x'} };
  console.log('SUT correlation:', analyzeVizSpec(spec).correlation);
  console.log('oracle POOLED (detail-keyed drawn):', pearson(projectAvg(rows,'x','y',['x','seg','dd']))?.toFixed(3));
  console.log('=> per-seg drawn FALL; pooled RISES. HONEST = SUPPRESS. SURVIVOR iff SUT positive number.');
}

// ---------------------------------------------------------------------------
// CASE 4 (colorIsMeasure reachability): markrect heatmap with color aggregate. measureChannel=color.
// Correlation should be SHORT-CIRCUITED (isMarkRectGrid) -> undefined. Confirms the colorIsMeasure
// arg-drift branch is not reachable through correlation.
// ---------------------------------------------------------------------------
banner('CASE 4 — heatmap color=measure (expect short-circuit undefined, not reachable)');
{
  const rows=[]; for(let x=1;x<=4;x++) for(let yv=1;yv<=3;yv++) rows.push({x,yv,temp:x*yv});
  const enc={ x:{field:'x',trait:'EncodingX',type:'quantitative'},
              y:{field:'yv',trait:'EncodingY',type:'quantitative'},
              color:{field:'temp',trait:'EncodingColor',type:'quantitative',aggregate:'average'} };
  const spec={ $schema:'x', id:'c4', name:'c4', data:{name:'d',values:rows},
    marks:[{trait:'MarkRect',encodings:enc}], encoding:enc, a11y:{description:'heatmap'} };
  console.log('channels:', JSON.stringify(resolvePrimaryChannels(spec)));
  console.log('SUT correlation:', analyzeVizSpec(spec).correlation, '(expect undefined — rect grid short-circuit)');
}

// ---------------------------------------------------------------------------
// CASE 5 (honest control — over-suppression check): color partition + quant size, but the drawn
// cells GENUINELY RISE in every seg AND pooled. s163 must NOT suppress this (no over-suppression).
// ---------------------------------------------------------------------------
banner('CASE 5 — honest rising correlation with size channel (expect DEFINED, no over-suppress)');
{
  const rows=[]; const push=(x,y,g,sz)=>rows.push({x,y,seg:g,sz});
  // seg A rises, seg B rises, pooled rises. size varies but no Simpson.
  push(1,10,'A',5);push(2,20,'A',9);push(3,30,'A',5);push(4,40,'A',9);
  push(1,12,'B',5);push(2,24,'B',9);push(3,36,'B',5);push(4,48,'B',9);
  const enc={ x:{field:'x',trait:'EncodingX',type:'quantitative'},
              y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},
              color:{field:'seg',trait:'EncodingColor'},
              size:{field:'sz',trait:'EncodingSize',type:'quantitative'} };
  const spec={ $schema:'x', id:'c5', name:'c5', data:{name:'d',values:rows},
    marks:[{trait:'MarkPoint',encodings:enc}], encoding:enc, a11y:{description:'y over x'} };
  console.log('SUT correlation:', analyzeVizSpec(spec).correlation);
  console.log('oracle POOLED drawn:', pearson(projectAvg(rows,'x','y',['x','seg','sz']))?.toFixed(3), '(honest rising — expect SUT ~= this)');
}
