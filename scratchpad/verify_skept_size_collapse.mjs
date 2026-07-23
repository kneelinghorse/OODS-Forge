import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(xs, ys){
  const n=xs.length; if(n<2) return null;
  const mx=xs.reduce((a,b)=>a+b,0)/n, my=ys.reduce((a,b)=>a+b,0)/n;
  let cov=0,vx=0,vy=0;
  for(let i=0;i<n;i++){cov+=(xs[i]-mx)*(ys[i]-my);vx+=(xs[i]-mx)**2;vy+=(ys[i]-my)**2;}
  if(vx===0||vy===0) return null;
  return cov/Math.sqrt(vx*vy);
}
function mkspec(rows, {withSize=true, withColor=true, agg='average'}={}){
  const enc={
    x:{field:'x',trait:'EncodingX',type:'quantitative',scale:{type:'linear'}},
    y:{field:'y',trait:'EncodingY',type:'quantitative',scale:{type:'linear'}},
  };
  if(agg) enc.y.aggregate=agg;
  if(withColor) enc.color={field:'seg',trait:'EncodingColor',type:'nominal'};
  if(withSize) enc.size={field:'sz',trait:'EncodingSize',type:'quantitative',scale:{type:'linear'}};
  return {$schema:'https://oods.dev/viz-spec/v1',id:'v',name:'v',
    data:{name:'d',values:rows}, marks:[{trait:'MarkPoint',encodings:enc}], encoding:enc, a11y:{description:'s'}};
}
function rowsBuild(){
  const r=[]; let sz=1;
  r.push({x:1,y:0,seg:'A',sz:sz++});
  r.push({x:2,y:100,seg:'A',sz:sz++});
  for(let i=0;i<100;i++) r.push({x:3,y:10,seg:'A',sz:sz++});
  r.push({x:4,y:200,seg:'B',sz:sz++});
  r.push({x:5,y:300,seg:'B',sz:sz++});
  for(let i=0;i<100;i++) r.push({x:6,y:210,seg:'B',sz:sz++});
  return r;
}
const rows=rowsBuild();

console.log('=== CASE 1: declared-aggregate + color + quant SIZE (candidate phantom) ===');
const s1=mkspec(rows,{withSize:true,withColor:true,agg:'average'});
console.log('resolvePrimaryChannels:', JSON.stringify(resolvePrimaryChannels(s1)));
const a1=analyzeVizSpec(s1);
console.log('analysis.correlation:', a1.correlation);
console.log('narration:', generateNarrativeSummary(s1).summary);
console.log('keyFindings:', JSON.stringify(generateNarrativeSummary(s1).keyFindings));
// drawn cells = sz-keyed = raw rows (each sz unique). per-seg over drawn cells:
for(const seg of ['A','B']){
  const rr=rows.filter(v=>v.seg===seg);
  console.log(`  seg ${seg} pearson over sz-keyed DRAWN cells:`, pearson(rr.map(v=>v.x),rr.map(v=>v.y)));
}
console.log('  pooled over all sz-keyed drawn cells:', pearson(rows.map(v=>v.x),rows.map(v=>v.y)));

console.log('\n=== CASE 2 (control): SAME shape, declared-aggregate + color, NO size ===');
const s2=mkspec(rows,{withSize:false,withColor:true,agg:'average'});
const a2=analyzeVizSpec(s2);
console.log('analysis.correlation:', a2.correlation, '(expect undefined = SUPPRESSED)');

console.log('\n=== CASE 3 (disclosed quant-size-only): declared-aggregate + size, NO color ===');
const s3=mkspec(rows,{withSize:true,withColor:false,agg:'average'});
const a3=analyzeVizSpec(s3);
console.log('analysis.correlation:', a3.correlation, '(partitionFields empty -> gate inactive -> narrates = DISCLOSED)');

console.log('\n=== CASE 4 (control): NO aggregate, color + size (the s158 SIZED-test shape) ===');
const s4=mkspec(rows,{withSize:true,withColor:true,agg:null});
const a4=analyzeVizSpec(s4);
console.log('analysis.correlation:', a4.correlation, '(no-aggregate => re-proj identity, size in both => should match value path)');
