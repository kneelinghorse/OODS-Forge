// RE-CRITIC claimscope lens. Two probes:
//  P1: confirm defect 5 (size-only Simpson) CURRENTLY narrates (v1 blocker was real; v2 §10 must fix via G1).
//  P2: the NEW hole — tau is relative to range(POOLED cell values)=GLOBAL. Under independent/free
//      y-scales (scale-resolver.ts:10 'shared'|'independent', a SHIPPED feature), a sub-series that
//      falls across its ENTIRE local panel (maximally visible) has Δ << τ·globalRange → v2 classifies
//      it NON-opposing → pooled positive NARRATES. Contradicts rule 14 "no narrated direction may
//      contradict what a viewer SEES". Hand-simulate v2 §10.
import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs){ const n=pairs.length; if(n<2) return null;
  const mx=pairs.reduce((s,p)=>s+p[0],0)/n, my=pairs.reduce((s,p)=>s+p[1],0)/n;
  let num=0,dx=0,dy=0; for(const [x,y] of pairs){num+=(x-mx)*(y-my);dx+=(x-mx)**2;dy+=(y-my)**2;}
  const den=Math.sqrt(dx*dy); return den===0?null:num/den; }
const slopeDelta=(pairs)=>{ // fitted change across x (n>=2), sign == slope sign
  const n=pairs.length; const mx=pairs.reduce((s,p)=>s+p[0],0)/n, my=pairs.reduce((s,p)=>s+p[1],0)/n;
  let num=0,dx=0; for(const[x,y]of pairs){num+=(x-mx)*(y-my);dx+=(x-mx)**2;} const slope=num/dx;
  const xs=pairs.map(p=>p[0]); return slope*(Math.max(...xs)-Math.min(...xs)); };

// ---------- P1: size-only Simpson (defect 5 / claimscope v1 blocker) ----------
{
  const rows=[]; const add=(x,y,sz)=>rows.push({x,y,sz});
  add(1,50,10);add(2,40,10);add(3,30,10); add(4,250,20);add(5,240,20);add(6,230,20);
  add(7,450,30);add(8,440,30);add(9,430,30);
  const enc={ x:{field:'x',trait:'EncodingX',type:'quantitative'},
    y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},
    size:{field:'sz',trait:'EncodingSize',type:'quantitative'} };
  const spec={ $schema:'https://oods.dev/viz-spec/v1', id:'sz', name:'sz',
    data:{name:'d',values:rows}, marks:[{trait:'MarkPoint',encodings:enc}], encoding:enc,
    a11y:{description:'avg y'} };
  const a=analyzeVizSpec(spec);
  console.log('=== P1 size-only Simpson (v1 claimscope BLOCKER — must be fixed by v2 G1) ===');
  console.log('SUT correlation:', a.correlation, '| pooled=', pearson(rows.map(r=>[r.x,r.y]))?.toFixed(3));
}

// ---------- P2: INDEPENDENT-SCALE facet Simpson, τ-vs-global-range hole ----------
{
  // 2 facets. Panel LOW lives in y∈[10,20]; panel HIGH lives in y∈[1010,1020]. BOTH FALL across
  // their whole local panel. Global pooled range ≈ [10,1020] (~1010) because facets are OFFSET.
  // Under sharedScales.y='independent' each panel renders on its OWN y-axis: each fall is FULL-PANEL,
  // maximally visible. Pooled correlation is strongly POSITIVE (HIGH panel is up-and-right of LOW).
  const rows=[]; const add=(x,y,p)=>rows.push({x,y,panel:p});
  add(1,20,'LOW'); add(2,15,'LOW'); add(3,10,'LOW');            // falls, Δ=10, local range [10,20]
  add(4,1020,'HIGH'); add(5,1015,'HIGH'); add(6,1010,'HIGH');   // falls, Δ=10, local range [1010,1020]
  const enc={ x:{field:'x',trait:'EncodingX',type:'quantitative'},
    y:{field:'y',trait:'EncodingY',type:'quantitative'} };
  const spec={ $schema:'https://oods.dev/viz-spec/v1', id:'indep', name:'indep',
    data:{name:'d',values:rows}, marks:[{trait:'MarkPoint',encodings:enc}], encoding:enc,
    layout:{trait:'LayoutFacet', columns:{field:'panel'}, sharedScales:{ y:'independent' }},
    a11y:{description:'y over x, independent y per facet'} };
  const a=analyzeVizSpec(spec);
  let narr; try{narr=generateNarrativeSummary(spec);}catch(e){narr={summary:'(threw '+e.message+')',keyFindings:[]};}
  const pooled=pearson(rows.map(r=>[r.x,r.y]));
  const gRange=Math.max(...rows.map(r=>r.y))-Math.min(...rows.map(r=>r.y));
  const low=rows.filter(r=>r.panel==='LOW').map(r=>[r.x,r.y]);
  const high=rows.filter(r=>r.panel==='HIGH').map(r=>[r.x,r.y]);
  console.log('\n=== P2 INDEPENDENT-SCALE facet Simpson (τ-vs-global-range hole) ===');
  console.log('SUT correlation:', a.correlation);
  console.log('SUT summary:', narr.summary);
  console.log('pooled r=', pooled?.toFixed(3), '| GLOBAL cell-value range=', gRange);
  console.log('LOW panel: pearson=', pearson(low)?.toFixed(3), 'Δ=', slopeDelta(low).toFixed(1),
    '| HIGH panel: pearson=', pearson(high)?.toFixed(3), 'Δ=', slopeDelta(high).toFixed(1));
  const tau=0.10;
  console.log('\n-- HAND-SIMULATE v2 §10 (partition=facet[panel], grouping=[], pooledSign=+1) --');
  for(const [nm,pairs] of [['LOW',low],['HIGH',high]]){
    const d=slopeDelta(pairs), opp=Math.sign(d)===-1, meets=Math.abs(d)>=tau*gRange;
    console.log(`  facet ${nm}: Δ=${d.toFixed(1)}, opposes(sign)=${opp}, |Δ|>=τ·range=${(tau*gRange).toFixed(1)}? ${meets} => ${opp&&meets?'SUPPRESS-vote':'NON-opposing (waved through)'}`);
  }
  console.log('  => v2 verdict: since neither facet Δ(=10) >= τ·globalRange(=101), NO opposition => NARRATE positive.');
  console.log('  BUT each facet falls full-panel on its independent y-axis => viewer sees TWO downward lines.');
}
