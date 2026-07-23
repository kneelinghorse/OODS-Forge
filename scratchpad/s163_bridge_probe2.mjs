const BR = 'http://127.0.0.1:4466/run';
async function run(tool, input) {
  const r = await fetch(BR, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ tool, input }) });
  return { status: r.status, body: await r.json() };
}
const rows=[]; const push=(x,y,g,k)=>{for(let i=0;i<k;i++)rows.push({x,y,seg:g,sz:(g==='A'?0:1000)+x*1000+i});};
push(1,0,'A',1);push(2,100,'A',1);push(3,10,'A',100);push(4,200,'B',1);push(5,300,'B',1);push(6,210,'B',100);
const mk = (extra) => ({ rows, chartType:'scatter',
  encodings:{ x:{field:'x',type:'quantitative'}, y:{field:'y',type:'quantitative',aggregate:'average'}, color:'seg', ...extra } });

for (const [name, extra] of [['WITH size (phantom case)', { size:{field:'sz',type:'quantitative'} }], ['WITHOUT size (control, honest 0.819)', {}]]) {
  const { body } = await run('viz_render', mk(extra));
  const res = body?.result ?? body;
  // find the a11y narrative wherever it is
  const narr = res?.a11y?.narrative ?? res?.narrative ?? res?.a11y ?? null;
  const blob = JSON.stringify(res);
  const corrMatch = blob.match(/[Cc]orrelation[^"]{0,40}/g);
  console.log(`\n### ${name} ###`);
  console.log('  narrative summary:', narr?.summary ?? '(dig) '+ (blob.match(/"summary":"[^"]*"/)?.[0] ?? 'n/a'));
  console.log('  keyFindings:', blob.match(/"keyFindings":\[[^\]]*\]/)?.[0] ?? 'n/a');
  console.log('  correlation mentions in result:', corrMatch ? JSON.stringify(corrMatch) : 'NONE');
}
