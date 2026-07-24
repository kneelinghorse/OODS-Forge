import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
function pearson(pairs){const n=pairs.length;if(n<2)return null;const mx=pairs.reduce((s,p)=>s+p[0],0)/n,my=pairs.reduce((s,p)=>s+p[1],0)/n;let num=0,dx=0,dy=0;for(const[x,y]of pairs){num+=(x-mx)*(y-my);dx+=(x-mx)**2;dy+=(y-my)**2;}const den=Math.sqrt(dx*dy);return den===0?null:num/den;}
const B=(f,t,e={})=>({field:f,trait:t,...e});
function mkSpec({rows,enc,facetCol,id='f',mark='MarkPoint'}){const spec={$schema:'https://oods.dev/viz-spec/v1',id,name:id,data:{name:'d',values:rows},marks:[{trait:mark,encodings:{...enc}}],encoding:enc,a11y:{description:'y over x'}};if(facetCol)spec.layout={trait:'LayoutFacet',columns:{field:facetCol}};return spec;}
function report(name,spec,o){const a=analyzeVizSpec(spec);let n;try{n=generateNarrativeSummary(spec);}catch(e){n={summary:'(threw '+e.message+')',keyFindings:[]};}console.log('\n===',name);console.log('  SUT correlation:',a.correlation);console.log('  summary:',n.summary);console.log('  keyFindings:',JSON.stringify(n.keyFindings));if(o)for(const[k,v]of Object.entries(o))console.log('    '+k+':',v);}

// D' : facet + quantitative COLOR-RAMP UNIQUE per row (count-weighted drawn cells FALL). The true
// s162 survivor analog on the color-ramp axis. drawnCellKeyFields keys cval (seriesGroupingFields,
// unconditional); correlationPartitionFields SKIPS it (quantitative). MUST be re-absorbed into
// groupingFields (like size in C) => classifier votes over the count-weighted FALLING cells => SUPPRESS.
{
  const rows=[];
  const push=(x,y,p,k)=>{for(let i=0;i<k;i++) rows.push({x,y,panel:p,cval:(p==='P1'?0:1e6)+x*1000+i});}; // cval UNIQUE per row
  push(1,0,'P1',1); push(2,100,'P1',1); push(3,10,'P1',100);
  push(4,200,'P2',1); push(5,300,'P2',1); push(6,210,'P2',100);
  const enc={x:B('x','EncodingX',{type:'quantitative'}),y:B('y','EncodingY',{type:'quantitative',aggregate:'average'}),color:B('cval','EncodingColor',{type:'quantitative'})};
  const spec=mkSpec({rows,enc,facetCol:'panel',id:"D'"});
  const p1=rows.filter(r=>r.panel==='P1').map(r=>[r.x,r.y]),p2=rows.filter(r=>r.panel==='P2').map(r=>[r.x,r.y]);
  report("D' facet + UNIQUE quantitative color-ramp (count-weighted cells FALL)",spec,{
    P1_colorRampKeyedCells:pearson(p1)?.toFixed(3),P2_cells:pearson(p2)?.toFixed(3),
    pooledRaw:pearson(rows.map(r=>[r.x,r.y]))?.toFixed(3),
    EXPECT:'undefined (color-ramp re-absorbed like size); DEFINED + => SURVIVOR (color-axis reopening)'});
}

// D'' : same but NO facet — pure quantitative color-ramp, NO categorical partition => DISCLOSED
// all-quant-retinal escape (partition=empty => early-return => narrates). Confirm it narrates
// (this is the disclosed boundary, contrast with D').
{
  const rows=[];
  const push=(x,y,k)=>{for(let i=0;i<k;i++) rows.push({x,y,cval:x*1000+i});};
  push(1,0,1); push(2,100,1); push(3,10,100); // one series, count-weighted fall
  const enc={x:B('x','EncodingX',{type:'quantitative'}),y:B('y','EncodingY',{type:'quantitative',aggregate:'average'}),color:B('cval','EncodingColor',{type:'quantitative'})};
  const spec=mkSpec({rows,enc,id:"D''"});
  report("D'' NO facet, pure quant color-ramp (DISCLOSED all-quant-retinal escape)",spec,{
    cells:pearson(rows.map(r=>[r.x,r.y]))?.toFixed(3),
    EXPECT:'DEFINED (disclosed: partition=empty => early-return => narrates)'});
}

// H : OVER-SUPPRESSION keep-control. Facet + size where each panel drawn cells HONESTLY rise AND
// pooled rises => must NARRATE (design A narrates honest agreement; not over-suppressed).
{
  const rows=[];
  const push=(x,y,p,k)=>{for(let i=0;i<k;i++) rows.push({x,y,panel:p,sz:(p==='P1'?0:1e6)+x*1000+i});};
  // each panel rises over its size-keyed cells
  push(1,10,'P1',1); push(2,20,'P1',1); push(3,30,'P1',5);
  push(4,40,'P2',1); push(5,50,'P2',1); push(6,60,'P2',5);
  const enc={x:B('x','EncodingX',{type:'quantitative'}),y:B('y','EncodingY',{type:'quantitative',aggregate:'average'}),size:B('sz','EncodingSize',{type:'quantitative'})};
  const spec=mkSpec({rows,enc,facetCol:'panel',id:'H'});
  const p1=rows.filter(r=>r.panel==='P1').map(r=>[r.x,r.y]),p2=rows.filter(r=>r.panel==='P2').map(r=>[r.x,r.y]);
  report('H OVER-SUPPRESSION keep-control: facet+size, both panels honestly rise',spec,{
    P1:pearson(p1)?.toFixed(3),P2:pearson(p2)?.toFixed(3),pooled:pearson(rows.map(r=>[r.x,r.y]))?.toFixed(3),
    EXPECT:'DEFINED positive (honest agreement must narrate, not over-suppress)'});
}

// I : facet panels DISAGREE (P1 rises, P2 falls) honestly => SUPPRESS (mixed evidence). Confirm
// the gate suppresses genuine cross-panel disagreement (correct behavior, boundary check).
{
  const rows=[];
  const add=(x,y,p)=>rows.push({x,y,panel:p});
  add(1,10,'P1');add(2,20,'P1');add(3,30,'P1'); // rises
  add(1,30,'P2');add(2,20,'P2');add(3,10,'P2'); // falls
  const enc={x:B('x','EncodingX',{type:'quantitative'}),y:B('y','EncodingY',{type:'quantitative'})};
  const spec=mkSpec({rows,enc,facetCol:'panel',id:'I'});
  report('I facet panels disagree (P1 up, P2 down) => SUPPRESS',spec,{
    pooled:pearson(rows.map(r=>[r.x,r.y]))?.toFixed(3),EXPECT:'undefined'});
}

// J : facet + size, DISTINCT sizes at SAME x (real within-x spread), each panel size-keyed cells
// FALL but per-x means RISE (the exact s162 asymmetry mechanism, now with facet). SUPPRESS.
{
  const rows=[];
  const add=(x,y,p,s)=>rows.push({x,y,panel:p,sz:s});
  // panel P1: at x=1 sizes {1:y=100, 2:y=90}; x=2 sizes {3:y=60,4:y=50}; x=3 sizes {5:y=20,6:y=10}
  // per-x mean: (1,95),(2,55),(3,15) FALLS... need per-x means RISE while size cells fall. Flip:
  add(1,10,'P1',1); add(1,20,'P1',9); add(2,15,'P1',2); add(2,25,'P1',10); add(3,12,'P1',3); add(3,22,'P1',11);
  // within each size band across x: sz small falls? Let's just observe SUT vs oracle.
  const enc={x:B('x','EncodingX',{type:'quantitative'}),y:B('y','EncodingY',{type:'quantitative',aggregate:'average'}),size:B('sz','EncodingSize',{type:'quantitative'})};
  const spec=mkSpec({rows,enc,facetCol:'panel',id:'J'});
  const p1=rows.filter(r=>r.panel==='P1').map(r=>[r.x,r.y]);
  report('J facet + size, within-x spread (observe)',spec,{
    P1_sizeCells:pearson(p1)?.toFixed(3),EXPECT:'observe (single panel P1)'});
}
