const BR = 'http://127.0.0.1:4466/run';
async function run(tool, input) {
  const r = await fetch(BR, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ tool, input }) });
  return { status: r.status, body: await r.json() };
}
// The s162-survivor size-Simpson rows: color=seg (categorical, ACTIVE gate), size=sz (quantitative).
const rows=[]; const push=(x,y,g,k)=>{for(let i=0;i<k;i++)rows.push({x,y,seg:g,sz:(g==='A'?0:1000)+x*1000+i});};
push(1,0,'A',1);push(2,100,'A',1);push(3,10,'A',100);push(4,200,'B',1);push(5,300,'B',1);push(6,210,'B',100);
const input = { rows, chartType:'scatter',
  encodings:{ x:{field:'x',type:'quantitative'}, y:{field:'y',type:'quantitative',aggregate:'average'},
              color:'seg', size:{field:'sz',type:'quantitative'} } };
const { status, body } = await run('viz_render', input);
const narr = body?.a11y?.narrative;
console.log(`### s163 size-Simpson via bridge (HTTP ${status}, status=${body?.status}) ###`);
if (!narr) { console.log('  no narrative; keys:', Object.keys(body||{}), JSON.stringify(body?.error||body?.warnings||'').slice(0,300)); }
else {
  console.log('  summary:', narr.summary);
  console.log('  keyFindings:', JSON.stringify(narr.keyFindings));
  const hasCorr = JSON.stringify(narr).toLowerCase().includes('correlation');
  console.log('  >>> correlation finding present?', hasCorr, '(EXPECT false — phantom suppressed)');
}
