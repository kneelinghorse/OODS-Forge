const BR = 'http://127.0.0.1:4466/run';
async function run(input){const r=await fetch(BR,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({tool:'viz_render',input})});return (await r.json());}
const s1rows=[];const push=(x,y,g,k)=>{for(let i=0;i<k;i++)s1rows.push({x,y,seg:g});};
push(1,10,'A',1);push(2,-1,'A',100);push(3,0,'A',100);push(4,30,'B',1);push(5,19,'B',100);push(6,20,'B',100);
const probes=[
 ['S1 correlation-suppress',{rows:s1rows,chartType:'scatter',encodings:{x:{field:'x',type:'quantitative'},y:{field:'y',type:'quantitative',aggregate:'average'},color:'seg'}}],
 ['G2 raw-horizontal-bar',{rows:[{year:2020,score:120},{year:2021,score:340},{year:2022,score:90}],chartType:'bar',encodings:{x:{field:'score',type:'quantitative',scale:'linear'},y:{field:'year',scale:'band'}}}],
];
for(const [name,input] of probes){
  const body=await run(input);
  const res=body.result||body;
  const narr=res?.a11y?.narrative;
  console.log(`\n### ${name} ###`);
  if(!narr){console.log('  result keys:',Object.keys(res||{}));console.log('  a11y:',JSON.stringify(res?.a11y||'').slice(0,300));continue;}
  console.log('  summary:',narr.summary);
  console.log('  keyFindings:',JSON.stringify(narr.keyFindings));
  const hasCorr=(narr.keyFindings||[]).some(f=>/[Cc]orrelation/.test(f));
  console.log('  -> correlation finding present?',hasCorr);
}
