// Adversarial FACET-lens reproduction battery for the s163 genuine-close review.
// Read-only against the fresh dist (HEAD ae6c0dc). Hand-oracles computed here.
import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs){
  const n=pairs.length; if(n<2) return null;
  const mx=pairs.reduce((s,p)=>s+p[0],0)/n, my=pairs.reduce((s,p)=>s+p[1],0)/n;
  let num=0,dx=0,dy=0; for(const [x,y] of pairs){num+=(x-mx)*(y-my);dx+=(x-mx)**2;dy+=(y-my)**2;}
  const den=Math.sqrt(dx*dy); return den===0?null:num/den;
}
const B=(field,trait,extra={})=>({field,trait,...extra});
function mkSpec({rows,enc,facetCol,facetRow,mark='MarkPoint',id='f'}){
  const spec={ $schema:'https://oods.dev/viz-spec/v1', id, name:id,
    data:{name:'d',values:rows}, marks:[{trait:mark,encodings:{...enc}}], encoding:enc,
    a11y:{description:'y over x'} };
  if(facetCol||facetRow){ spec.layout={trait:'LayoutFacet',
    ...(facetCol?{columns:{field:facetCol}}:{}), ...(facetRow?{rows:{field:facetRow}}:{})}; }
  return spec;
}
function report(name, spec, oracles){
  const a=analyzeVizSpec(spec);
  let narr; try{ narr=generateNarrativeSummary(spec); }catch(e){ narr={summary:'(threw: '+e.message+')',keyFindings:[]}; }
  console.log('\n========================================================');
  console.log('CASE:', name);
  console.log('resolvePrimaryChannels:', JSON.stringify(resolvePrimaryChannels(spec)));
  console.log('SUT analysis.correlation:', a.correlation);
  console.log('SUT summary   :', narr.summary);
  console.log('SUT keyFindings:', JSON.stringify(narr.keyFindings));
  if(oracles) for(const [k,v] of Object.entries(oracles)) console.log('  oracle['+k+']:', v);
}

// ------------------------------------------------------------------ CASE A
// FACET cross-panel Simpson, DECLARED aggregate (y avg). Each panel FALLS; the pooled
// across panels RISES (panel P2 is up-and-right of P1). Expect: SUPPRESS (undefined).
{
  const rows=[];
  // panel P1 at low x/low y, falling; panel P2 at high x/high y, falling
  const add=(x,y,p)=>rows.push({x,y,panel:p});
  add(1,30,'P1'); add(2,20,'P1'); add(3,10,'P1');
  add(4,90,'P2'); add(5,80,'P2'); add(6,70,'P2');
  const enc={ x:B('x','EncodingX',{type:'quantitative'}),
              y:B('y','EncodingY',{type:'quantitative',aggregate:'average'}) };
  const spec=mkSpec({rows,enc,facetCol:'panel',id:'A'});
  report('A facet cross-panel Simpson (avg agg): each panel falls, pooled rises', spec, {
    P1:pearson([[1,30],[2,20],[3,10]])?.toFixed(3),
    P2:pearson([[4,90],[5,80],[6,70]])?.toFixed(3),
    pooledAllCells:pearson(rows.map(r=>[r.x,r.y]))?.toFixed(3),
    EXPECT:'undefined (both panels fall, pooled + is a cross-panel artifact)'
  });
}

// ------------------------------------------------------------------ CASE B
// FACET cross-panel Simpson, NO aggregate (raw scatter). Same shape. Expect SUPPRESS.
{
  const rows=[];
  const add=(x,y,p)=>rows.push({x,y,panel:p});
  add(1,30,'P1'); add(2,20,'P1'); add(3,10,'P1');
  add(4,90,'P2'); add(5,80,'P2'); add(6,70,'P2');
  const enc={ x:B('x','EncodingX',{type:'quantitative'}),
              y:B('y','EncodingY',{type:'quantitative'}) };
  const spec=mkSpec({rows,enc,facetCol:'panel',id:'B'});
  report('B facet cross-panel Simpson (NO agg raw scatter)', spec, {
    pooled:pearson(rows.map(r=>[r.x,r.y]))?.toFixed(3), EXPECT:'undefined'
  });
}

// ------------------------------------------------------------------ CASE C
// FACET (categorical partition) + quantitative SIZE Simpson twin (mirror of the s162 survivor
// but with facet as the partition and size as the count-weighted retinal). Expect SUPPRESS.
{
  const rows=[];
  const push=(x,y,p,k)=>{for(let i=0;i<k;i++) rows.push({x,y,panel:p,sz:(p==='P1'?0:1000)+x*1000+i});};
  push(1,0,'P1',1); push(2,100,'P1',1); push(3,10,'P1',100);
  push(4,200,'P2',1); push(5,300,'P2',1); push(6,210,'P2',100);
  const enc={ x:B('x','EncodingX',{type:'quantitative'}),
              y:B('y','EncodingY',{type:'quantitative',aggregate:'average'}),
              size:B('sz','EncodingSize',{type:'quantitative'}) };
  const spec=mkSpec({rows,enc,facetCol:'panel',id:'C'});
  const p1=rows.filter(r=>r.panel==='P1').map(r=>[r.x,r.y]);
  const p2=rows.filter(r=>r.panel==='P2').map(r=>[r.x,r.y]);
  report('C facet + quantitative size Simpson twin', spec, {
    P1_sizeKeyedCells:pearson(p1)?.toFixed(3), P2_sizeKeyedCells:pearson(p2)?.toFixed(3),
    pooled:pearson(rows.map(r=>[r.x,r.y]))?.toFixed(3),
    EXPECT:'undefined (size-keyed drawn cells fall in both panels)'
  });
}

// ------------------------------------------------------------------ CASE D
// FACET (categorical partition) + quantitative COLOR-RAMP Simpson. color is quantitative so
// correlationPartitionFields SKIPS it; it must be re-absorbed into groupingFields. Count-weight
// via repeated rows so size-collapse-style asymmetry could reappear on the color axis.
{
  const rows=[];
  const push=(x,y,p,c,k)=>{for(let i=0;i<k;i++) rows.push({x,y,panel:p,cval:c});};
  // Within each panel, color-ramp keyed drawn cells FALL, per-x means RISE (count-weight at x=3/6)
  push(1,0,'P1',1,1); push(2,100,'P1',2,1); push(3,10,'P1',3,100);
  push(4,200,'P2',4,1); push(5,300,'P2',5,1); push(6,210,'P2',6,100);
  const enc={ x:B('x','EncodingX',{type:'quantitative'}),
              y:B('y','EncodingY',{type:'quantitative',aggregate:'average'}),
              color:B('cval','EncodingColor',{type:'quantitative'}) };
  const spec=mkSpec({rows,enc,facetCol:'panel',id:'D'});
  const p1=rows.filter(r=>r.panel==='P1').map(r=>[r.x,r.y]);
  const p2=rows.filter(r=>r.panel==='P2').map(r=>[r.x,r.y]);
  report('D facet + quantitative color-ramp Simpson (count-weighted)', spec, {
    P1_cells:pearson(p1)?.toFixed(3), P2_cells:pearson(p2)?.toFixed(3),
    pooled:pearson(rows.map(r=>[r.x,r.y]))?.toFixed(3),
    EXPECT:'undefined if color-ramp re-absorbed as grouping; DEFINED + would be a LIE'
  });
}

// ------------------------------------------------------------------ CASE E
// s160 cross-panel EXTREMA phantom re-test (different path: max/min/total narration).
// Faceted, y avg. Per-panel drawn cell values are the truth; a cross-panel marginal must not
// invent a max/min that is not a drawn cell.
{
  const rows=[];
  const add=(x,y,p)=>rows.push({x,y,region:p});
  // North: values 10,30 ; South: 54,94  (drawn per-(region,x) avg cells)
  add('Jan',10,'North'); add('Feb',30,'North');
  add('Jan',54,'South'); add('Feb',94,'South');
  const enc={ x:B('x','EncodingX',{field:'x'}),
              y:B('y','EncodingY',{type:'quantitative',aggregate:'average'}) };
  // note field names: use explicit field
  enc.x=B('x','EncodingX'); rows.forEach(r=>{}); // x field is 'x'
  const spec=mkSpec({rows,enc,facetCol:'region',id:'E'});
  report('E facet cross-panel EXTREMA (max/min/total) honesty', spec, {
    drawnCells:'North{Jan10,Feb30} South{Jan54,Feb94}',
    EXPECT:'max=94 min=10 are REAL drawn cells; no cross-panel marginal phantom'
  });
}

// ------------------------------------------------------------------ CASE F
// WITHIN-GROUP retinal Simpson WITH an active categorical partition. Each (panel,size-band)
// series FALLS, but pooled-over-size within each panel RISES, and pooled overall RISES.
// The disclosure claims the retinal-Simpson escape needs NO partition; here a facet partition
// is ACTIVE. Characterize what the SUT narrates.
{
  const rows=[];
  const add=(x,y,p,s)=>rows.push({x,y,panel:p,sz:s});
  // panel P1: sz=1 band {(1,10),(2,5)} falls ; sz=2 band {(3,100),(4,95)} falls ; pooled rises
  add(1,10,'P1',1); add(2,5,'P1',1); add(3,100,'P1',2); add(4,95,'P1',2);
  // panel P2: same shape, shifted
  add(1,12,'P2',1); add(2,6,'P2',1); add(3,102,'P2',2); add(4,96,'P2',2);
  const enc={ x:B('x','EncodingX',{type:'quantitative'}),
              y:B('y','EncodingY',{type:'quantitative',aggregate:'average'}),
              size:B('sz','EncodingSize',{type:'quantitative'}) };
  const spec=mkSpec({rows,enc,facetCol:'panel',id:'F'});
  const bandP1s1=[[1,10],[2,5]], bandP1s2=[[3,100],[4,95]];
  const P1all=rows.filter(r=>r.panel==='P1').map(r=>[r.x,r.y]);
  report('F within-group size-band Simpson WITH active facet partition', spec, {
    P1_sz1band:pearson(bandP1s1)?.toFixed(3), P1_sz2band:pearson(bandP1s2)?.toFixed(3),
    P1_pooledOverSize:pearson(P1all)?.toFixed(3),
    pooledAll:pearson(rows.map(r=>[r.x,r.y]))?.toFixed(3),
    NOTE:'each (panel,size) band FALLS; pooled-over-size RISES. Is narrated + a lie or disclosed retinal-Simpson?'
  });
}

// ------------------------------------------------------------------ CASE G
// FACET + categorical COLOR both active; each (facet,color) group has a single x (UNKNOWN),
// pooled shows strong correlation. Disclosed all-unknown vacuous-pass — confirm it narrates
// and is the disclosed class (not a NEW facet crack).
{
  const rows=[];
  const add=(x,y,p,c)=>rows.push({x,y,panel:p,seg:c});
  add(1,10,'P1','A'); add(2,20,'P1','B'); add(3,30,'P2','A'); add(4,40,'P2','B');
  const enc={ x:B('x','EncodingX',{type:'quantitative'}),
              y:B('y','EncodingY',{type:'quantitative'}),
              color:B('seg','EncodingColor') };
  const spec=mkSpec({rows,enc,facetCol:'panel',id:'G'});
  report('G facet+color, every (facet,color) group single-x (all-unknown vacuous)', spec, {
    pooled:pearson(rows.map(r=>[r.x,r.y]))?.toFixed(3),
    EXPECT:'DEFINED (disclosed all-unknown vacuous-pass) — confirm it is that class'
  });
}
