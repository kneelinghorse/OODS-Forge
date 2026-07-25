// MAIN-LOOP independent reproduction of survivors B (stacking color-ramp) and C (collinear-categorical + size).
import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
function pearson(pairs){const n=pairs.length;if(n<2)return null;const mx=pairs.reduce((s,p)=>s+p[0],0)/n,my=pairs.reduce((s,p)=>s+p[1],0)/n;let num=0,dx=0,dy=0;for(const[x,y]of pairs){num+=(x-mx)*(y-my);dx+=(x-mx)**2;dy+=(y-my)**2;}const den=Math.sqrt(dx*dy);return den===0?null:num/den;}
function rep(label,spec){const a=analyzeVizSpec(spec);const{keyFindings,summary}=generateNarrativeSummary(spec);const cf=(keyFindings||[]).find(k=>/[Cc]orrelation/.test(JSON.stringify(k)));console.log(`\n=== ${label} ===`);console.log('  channels:',JSON.stringify(resolvePrimaryChannels(spec)));console.log('  correlation =',a.correlation,a.correlation===undefined?'(SUPPRESSED)':'(NARRATED)');console.log('  keyFinding  :',cf?JSON.stringify(cf):'(none)');if(a.correlation!==undefined)console.log('  summary     :',summary);return a.correlation;}

// ---------- B: stacking color-ramp ----------
console.log('################ B: sum-stacked bar + QUANTITATIVE color ramp ################');
const bRows=[
  {x:1,y:50,c:100},{x:2,y:40,c:100},{x:3,y:30,c:100},   // c=100 band FALLS
  {x:1,y:10,c:200},{x:2,y:60,c:200},{x:3,y:110,c:200},   // c=200 band RISES
];
console.log('  drawn c=100 band pearson:',pearson([[1,50],[2,40],[3,30]]).toFixed(3),'(FALLS)');
console.log('  drawn c=200 band pearson:',pearson([[1,10],[2,60],[3,110]]).toFixed(3),'(RISES)');
console.log('  per-x stack totals      :',pearson([[1,60],[2,100],[3,140]]).toFixed(3),'(RISES)');
const bEnc=t=>({x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'sum'},color:t?{field:'c',trait:'EncodingColor',type:'quantitative'}:{field:'c',trait:'EncodingColor'}});
const bSpec=t=>({$schema:'https://oods.dev/viz-spec/v1',id:'b',name:'b',data:{name:'d',values:bRows},marks:[{trait:'MarkBar',encodings:bEnc(t)}],encoding:bEnc(t),a11y:{description:'y over x'}});
const bQuant=rep('B1 color type=quantitative (ramp -> partition SKIPS it)',bSpec(true));
const bCat  =rep('B2 CONTROL color categorical (no type -> partition covers it)',bSpec(false));

// ---------- C: collinear categorical partition + size Simpson ----------
console.log('\n\n################ C: collinear categorical (color=seg, one x per seg) + size Simpson ################');
const cRows=[
  {x:1,y:10,seg:'p',sz:1},{x:2,y:8,seg:'q',sz:1},{x:3,y:6,seg:'r',sz:1},     // sz=1 FALLS, seg collinear w/ x
  {x:1,y:20,seg:'p',sz:2},{x:2,y:30,seg:'q',sz:2},{x:3,y:40,seg:'r',sz:2},    // sz=2 RISES
];
console.log('  drawn sz=1 (small pts) pearson:',pearson([[1,10],[2,8],[3,6]]).toFixed(3),'(FALLS)');
console.log('  drawn sz=2 (large pts) pearson:',pearson([[1,20],[2,30],[3,40]]).toFixed(3),'(RISES)');
console.log('  pooled over all 6            :',pearson(cRows.map(r=>[r.x,r.y])).toFixed(3));
const cEnc=(withSeg,collinear)=>{const e={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},size:{field:'sz',trait:'EncodingSize',type:'quantitative'}};if(withSeg)e.color={field:'seg',trait:'EncodingColor'};return e;};
const cSpec=(withSeg)=>({$schema:'https://oods.dev/viz-spec/v1',id:'c',name:'c',data:{name:'d',values:cRows},marks:[{trait:'MarkPoint',encodings:cEnc(withSeg)}],encoding:cEnc(withSeg),a11y:{description:'y over x'}});
// non-collinear control: seg has 2 x each
const cRowsNC=[
  {x:1,y:10,seg:'p',sz:1},{x:2,y:8,seg:'p',sz:1},{x:3,y:6,seg:'q',sz:1},{x:4,y:4,seg:'q',sz:1},
  {x:1,y:20,seg:'p',sz:2},{x:2,y:30,seg:'p',sz:2},{x:3,y:40,seg:'q',sz:2},{x:4,y:50,seg:'q',sz:2},
];
const cSpecNC=()=>{const e={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},size:{field:'sz',trait:'EncodingSize',type:'quantitative'},color:{field:'seg',trait:'EncodingColor'}};return{$schema:'https://oods.dev/viz-spec/v1',id:'cnc',name:'cnc',data:{name:'d',values:cRowsNC},marks:[{trait:'MarkPoint',encodings:e}],encoding:e,a11y:{description:'y over x'}};};
const cColl=rep('C1 collinear color=seg + size Simpson (one x per seg)',cSpec(true));
const cSizeOnly=rep('C2 CONTROL size Simpson, NO categorical (should suppress)',cSpec(false));
const cNonColl=rep('C3 CONTROL non-collinear seg (2 x per seg) + size Simpson (should suppress)',cSpecNC());

console.log('\n\n################ VERDICT ################');
console.log('B1 stacking color-ramp (falling band) :',bQuant,bQuant!==undefined&&bQuant>0?'=> PHANTOM (defined + over a falling drawn color band)':'=> not reproduced');
console.log('B2 control categorical color          :',bCat,bCat===undefined?'(suppressed OK)':'(!!)');
console.log('C1 collinear-cat + size (falling sz=1):',cColl,cColl!==undefined&&cColl>0?'=> PHANTOM (defined + over a falling drawn size band)':'=> not reproduced');
console.log('C2 control size-only                  :',cSizeOnly,cSizeOnly===undefined?'(suppressed OK)':'(!!)');
console.log('C3 control non-collinear seg          :',cNonColl,cNonColl===undefined?'(suppressed OK)':'(!!)');
