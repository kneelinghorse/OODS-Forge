const BR = 'http://127.0.0.1:4466/run';
async function run(tool, input) {
  const r = await fetch(BR, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ tool, input }) });
  return { status: r.status, body: await r.json() };
}
const s1rows=[]; const push=(x,y,g,k)=>{for(let i=0;i<k;i++)s1rows.push({x,y,seg:g});};
push(1,10,'A',1);push(2,-1,'A',100);push(3,0,'A',100);push(4,30,'B',1);push(5,19,'B',100);push(6,20,'B',100);

const probes = [
  ['S1 correlation-suppress (declared-agg scatter, color=seg)', 'scatter',
    { rows:s1rows, chartType:'scatter', encodings:{ x:{field:'x',type:'quantitative'}, y:{field:'y',type:'quantitative',aggregate:'average'}, color:'seg' } }],
  ['G2 raw-horizontal-bar (score/year)', 'bar',
    { rows:[{year:2020,score:120},{year:2021,score:340},{year:2022,score:90}], chartType:'bar',
      encodings:{ x:{field:'score',type:'quantitative',scale:'linear'}, y:{field:'year',scale:'band'} } }],
];
for (const [name, _ct, input] of probes) {
  const { status, body } = await run('viz_render', input);
  const narr = body?.a11y?.narrative;
  console.log(`\n### ${name} (HTTP ${status}, status=${body?.status}) ###`);
  if (!narr) { console.log('  no narrative; keys:', Object.keys(body||{}), JSON.stringify(body?.error||body?.warnings||'').slice(0,300)); continue; }
  console.log('  summary:', narr.summary);
  console.log('  keyFindings:', JSON.stringify(narr.keyFindings));
}
