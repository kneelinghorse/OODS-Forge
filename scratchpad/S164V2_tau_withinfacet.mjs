// RE-CRITIC claimscope — the τ phantom that G0 does NOT catch and G1 (τ) WAVES THROUGH.
// Requirement to exercise τ: partition-level (G0) must AGREE with pooled, while a FINER
// (partition∪grouping) sub-series OPPOSES. => a Simpson INSIDE each facet on the size axis.
// Independent per-facet y (scale-resolver 'independent', shipped) makes each within-facet band
// PERCEPTIBLE on the panel's LOCAL axis while its Δ is a tiny fraction of the GLOBAL pooled range
// that τ uses as denominator. Hand-sim v2 §10 G0 AND G1.
import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
function pearson(pairs){ const n=pairs.length; if(n<2) return null;
  const mx=pairs.reduce((s,p)=>s+p[0],0)/n, my=pairs.reduce((s,p)=>s+p[1],0)/n;
  let num=0,dx=0,dy=0; for(const[x,y]of pairs){num+=(x-mx)*(y-my);dx+=(x-mx)**2;dy+=(y-my)**2;}
  const den=Math.sqrt(dx*dy); return den===0?null:num/den; }
function slopeDelta(pairs){ const n=pairs.length; const mx=pairs.reduce((s,p)=>s+p[0],0)/n, my=pairs.reduce((s,p)=>s+p[1],0)/n;
  let num=0,dx=0; for(const[x,y]of pairs){num+=(x-mx)*(y-my);dx+=(x-mx)**2;} const slope=num/dx;
  const xs=pairs.map(p=>p[0]); return slope*(Math.max(...xs)-Math.min(...xs)); }

// Two facets, each an internal size Simpson: band sz=1 and band sz=2 BOTH FALL, but panel pooled RISES.
// Panel HIGH is offset +1000 so the GLOBAL cell range is dominated by the between-facet gap (~1030),
// NOT by any within-facet motion. Under sharedScales.y='independent' each panel renders on its own
// [~0,30] / [~1000,1030] axis, so each falling band spans ~1/3 of the visible panel height.
const rows=[]; const add=(x,y,p,sz)=>rows.push({x,y,panel:p,sz});
// panel LOW  (local y in [0,30]): sz1 {(1,10),(2,0)} falls; sz2 {(3,30),(4,20)} falls; pooled rises
add(1,10,'LOW',1); add(2,0,'LOW',1); add(3,30,'LOW',2); add(4,20,'LOW',2);
// panel HIGH (local y in [1000,1030]): same shape +1000
add(5,1010,'HIGH',1); add(6,1000,'HIGH',1); add(7,1030,'HIGH',2); add(8,1020,'HIGH',2);
const enc={ x:{field:'x',trait:'EncodingX',type:'quantitative'},
  y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},
  size:{field:'sz',trait:'EncodingSize',type:'quantitative'} };
const spec={ $schema:'https://oods.dev/viz-spec/v1', id:'wf', name:'wf',
  data:{name:'d',values:rows}, marks:[{trait:'MarkPoint',encodings:enc}], encoding:enc,
  layout:{trait:'LayoutFacet', columns:{field:'panel'}, sharedScales:{ y:'independent' }},
  a11y:{description:'avg y over x, independent y per facet'} };

const a=analyzeVizSpec(spec);
let narr; try{narr=generateNarrativeSummary(spec);}catch(e){narr={summary:'(threw '+e.message+')',keyFindings:[]};}
const all=rows.map(r=>[r.x,r.y]);
const pooled=pearson(all), gRange=Math.max(...rows.map(r=>r.y))-Math.min(...rows.map(r=>r.y));
console.log('=== within-facet size Simpson, independent y (τ phantom candidate) ===');
console.log('resolvePrimaryChannels:', JSON.stringify(resolvePrimaryChannels(spec)));
console.log('SUT correlation:', a.correlation);
console.log('SUT summary:', narr.summary);
console.log('SUT keyFindings:', JSON.stringify(narr.keyFindings));
console.log('pooled r=', pooled?.toFixed(3), '(sign +) | GLOBAL cell range=', gRange, '| τ·range(0.10)=', (0.10*gRange).toFixed(1));

// partition-level (G0) direction of each facet = pooled over the facet's cells:
for(const p of ['LOW','HIGH']){
  const cells=rows.filter(r=>r.panel===p).map(r=>[r.x,r.y]);
  console.log(`  G0 facet ${p}: pooled=${pearson(cells).toFixed(3)} => votes ${Math.sign(pearson(cells))} (agrees with pooled + => G0 does NOT contradict)`);
}
console.log('  => G0 evidence={+1,+1}, pooled + => narratableCorrelation NARRATES (no contradiction).');
console.log('-- G1 (τ) over (facet∪size) sub-bands, pooledSign=+1 --');
const tau=0.10;
for(const p of ['LOW','HIGH']) for(const s of [1,2]){
  const b=rows.filter(r=>r.panel===p&&r.sz===s).map(r=>[r.x,r.y]);
  const d=slopeDelta(b); const localRange=Math.max(...rows.filter(r=>r.panel===p).map(r=>r.y))-Math.min(...rows.filter(r=>r.panel===p).map(r=>r.y));
  console.log(`  band ${p}/sz${s}: Δ=${d.toFixed(1)} (=${(100*Math.abs(d)/localRange).toFixed(0)}% of LOCAL panel axis), opposes +, |Δ|>=τ·GLOBALrange(${(tau*gRange).toFixed(1)})? ${Math.abs(d)>=tau*gRange} => ${Math.abs(d)>=tau*gRange?'SUPPRESS':'WAVED THROUGH'}`);
}
console.log('\nRESULT: every band Δ=10 = ~33% of its LOCAL independent-scale panel axis (clearly falling to a viewer),');
console.log('but 10 << τ·GLOBALrange(103) => v2 G1 waves ALL through => NARRATE "positive".');
console.log('This is §4 residual-1 (below-τ) but it is a PERCEPTIBLE fall under independent scales = a reachable phantom in the claimed-CLOSED faceted-partition Simpson class.');
