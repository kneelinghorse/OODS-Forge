import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
function pearson(pairs){const n=pairs.length;if(n<2)return null;const mx=pairs.reduce((s,p)=>s+p[0],0)/n,my=pairs.reduce((s,p)=>s+p[1],0)/n;let num=0,dx=0,dy=0;for(const[x,y]of pairs){num+=(x-mx)*(y-my);dx+=(x-mx)**2;dy+=(y-my)**2;}const den=Math.sqrt(dx*dy);return den===0?null:num/den;}
const B=(f,t,e={})=>({field:f,trait:t,...e});
function report(name,spec,o){const a=analyzeVizSpec(spec);let n;try{n=generateNarrativeSummary(spec);}catch(e){n={summary:'(threw '+e.message+')',keyFindings:[]};}console.log('\n===',name);console.log('  SUT correlation:',a.correlation);console.log('  summary:',n.summary);console.log('  keyFindings:',JSON.stringify(n.keyFindings).slice(0,300));if(o)for(const[k,v]of Object.entries(o))console.log('    '+k+':',v);}

// K : MULTI-FACET (rows AND columns). facetFields returns [region, seg]. Each panel (region×seg)
// falls; cross-panel pooled rises. Must SUPPRESS (both facet fields in partition).
{
  const rows=[];const add=(x,y,r,s)=>rows.push({x,y,region:r,seg:s});
  add(1,30,'N','A');add(2,20,'N','A');add(3,10,'N','A');
  add(4,90,'N','B');add(5,80,'N','B');add(6,70,'N','B');
  add(7,150,'S','A');add(8,140,'S','A');add(9,130,'S','A');
  add(10,210,'S','B');add(11,200,'S','B');add(12,190,'S','B');
  const enc={x:B('x','EncodingX',{type:'quantitative'}),y:B('y','EncodingY',{type:'quantitative',aggregate:'average'})};
  const spec={$schema:'https://oods.dev/viz-spec/v1',id:'K',name:'K',data:{name:'d',values:rows},marks:[{trait:'MarkPoint',encodings:{...enc}}],encoding:enc,layout:{trait:'LayoutFacet',rows:{field:'region'},columns:{field:'seg'}},a11y:{description:'y over x'}};
  report('K multi-facet rows+cols, every panel falls, pooled rises => SUPPRESS',spec,{pooled:pearson(rows.map(r=>[r.x,r.y]))?.toFixed(3),EXPECT:'undefined'});
}

// L : facet(column) + categorical COLOR (2 partition fields). Each (panel,color) group falls;
// pooled rises. Must SUPPRESS.
{
  const rows=[];const add=(x,y,p,c)=>rows.push({x,y,panel:p,seg:c});
  add(1,30,'P1','A');add(2,20,'P1','A');add(3,10,'P1','A');
  add(1,35,'P1','B');add(2,25,'P1','B');add(3,15,'P1','B');
  add(7,130,'P2','A');add(8,120,'P2','A');add(9,110,'P2','A');
  add(7,135,'P2','B');add(8,125,'P2','B');add(9,115,'P2','B');
  const enc={x:B('x','EncodingX',{type:'quantitative'}),y:B('y','EncodingY',{type:'quantitative'}),color:B('seg','EncodingColor')};
  const spec={$schema:'https://oods.dev/viz-spec/v1',id:'L',name:'L',data:{name:'d',values:rows},marks:[{trait:'MarkPoint',encodings:{...enc}}],encoding:enc,layout:{trait:'LayoutFacet',columns:{field:'panel'}},a11y:{description:'y over x'}};
  report('L facet+color 2-partition, all groups fall, pooled rises => SUPPRESS',spec,{pooled:pearson(rows.map(r=>[r.x,r.y]))?.toFixed(3),EXPECT:'undefined'});
}

// M : facet cross-panel with DECLARED aggregate + COUNT-WEIGHTING (combine s160 facet + s162 count).
// Panel P1 falls (count-weighted mass at x=3), panel P2 falls; pooled rises. SUPPRESS.
{
  const rows=[];const push=(x,y,p,k)=>{for(let i=0;i<k;i++)rows.push({x,y,panel:p});};
  push(1,0,'P1',1);push(2,100,'P1',1);push(3,10,'P1',100);
  push(4,200,'P2',1);push(5,300,'P2',1);push(6,210,'P2',100);
  const enc={x:B('x','EncodingX',{type:'quantitative'}),y:B('y','EncodingY',{type:'quantitative',aggregate:'average'})};
  const spec={$schema:'https://oods.dev/viz-spec/v1',id:'M',name:'M',data:{name:'d',values:rows},marks:[{trait:'MarkPoint',encodings:{...enc}}],encoding:enc,layout:{trait:'LayoutFacet',columns:{field:'panel'}},a11y:{description:'y over x'}};
  // drawn cells = per (x,panel) avg (count collapses since only panel+x keyed, no size): P1 (1,0),(2,100),(3,10)
  report('M facet cross-panel + avg agg + count-weight (no size)',spec,{
    P1_drawnCells:pearson([[1,0],[2,100],[3,10]])?.toFixed(3),
    EXPECT:'per-panel drawn cells rise +0.09; pooled rises; is it a LIE? panels drawn-rise so honest-ish'});
}

// N : EXTREMA/TOTAL cross-panel marginal trap. Faceted bar, y=sum. If a naive impl summed across
// panels it would invent region-marginal totals that are not drawn. Check max/total honesty.
{
  const rows=[];const add=(x,y,r)=>rows.push({month:x,sales:y,region:r});
  add('Jan',10,'North');add('Feb',30,'North');
  add('Jan',54,'South');add('Feb',94,'South');
  const enc={x:B('month','EncodingX'),y:B('sales','EncodingY',{type:'quantitative',aggregate:'sum'})};
  const spec={$schema:'https://oods.dev/viz-spec/v1',id:'N',name:'N',data:{name:'d',values:rows},marks:[{trait:'MarkBar',encodings:{...enc}}],encoding:enc,layout:{trait:'LayoutFacet',columns:{field:'region'}},a11y:{description:'sales by month'}};
  report('N faceted bar y=sum: extrema/total must be real drawn cells (no cross-panel marginal)',spec,{
    drawn:'North{Jan10,Feb30} South{Jan54,Feb94}; cross-panel marginal Feb=124/Jan=64 would be PHANTOM',
    EXPECT:'max=94(real drawn cell), no phantom 124; total may sum drawn cells=188'});
}
