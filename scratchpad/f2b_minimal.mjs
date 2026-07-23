import { analyzeVizSpec, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
function pearson(xs,ys){const n=xs.length;if(n<2)return null;const mx=xs.reduce((a,b)=>a+b,0)/n,my=ys.reduce((a,b)=>a+b,0)/n;let c=0,vx=0,vy=0;for(let i=0;i<n;i++){c+=(xs[i]-mx)*(ys[i]-my);vx+=(xs[i]-mx)**2;vy+=(ys[i]-my)**2;}if(vx===0||vy===0)return null;return c/Math.sqrt(vx*vy);}

for(const H of [3,4,6,10]){
  const rows=[]; let sz=1;
  rows.push({x:1,y:0,seg:'A',sz:sz++});
  rows.push({x:2,y:100,seg:'A',sz:sz++});
  for(let i=0;i<H;i++) rows.push({x:3,y:10,seg:'A',sz:sz++});
  rows.push({x:4,y:200,seg:'B',sz:sz++});
  rows.push({x:5,y:300,seg:'B',sz:sz++});
  for(let i=0;i<H;i++) rows.push({x:6,y:210,seg:'B',sz:sz++});
  const enc={x:{field:'x',trait:'EncodingX',type:'quantitative',scale:{type:'linear'}},
    y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average',scale:{type:'linear'}},
    color:{field:'seg',trait:'EncodingColor',type:'nominal'},
    size:{field:'sz',trait:'EncodingSize',type:'quantitative',scale:{type:'linear'}}};
  const spec={$schema:'https://oods.dev/viz-spec/v1',id:'m',name:'M',data:{name:'d',values:rows},marks:[{trait:'MarkPoint',encodings:enc}],encoding:enc,a11y:{description:'s'}};
  const a=analyzeVizSpec(spec);
  const segA=rows.filter(r=>r.seg==='A'),segB=rows.filter(r=>r.seg==='B');
  console.log(`H=${H} rows=${rows.length}: narrated corr=${a.correlation}  | drawn segA r=${pearson(segA.map(r=>r.x),segA.map(r=>r.y)).toFixed(3)}  segB r=${pearson(segB.map(r=>r.x),segB.map(r=>r.y)).toFixed(3)}  | ${a.correlation!==undefined?generateNarrativeSummary(spec).summary:'SUPPRESSED'}`);
}
