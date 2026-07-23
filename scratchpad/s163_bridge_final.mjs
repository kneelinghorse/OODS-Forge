const BR = 'http://127.0.0.1:4466/run';
async function run(input) {
  const r = await fetch(BR, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ tool:'viz_render', input }) });
  return await r.json();
}
const rows=[]; const push=(x,y,g,k)=>{for(let i=0;i<k;i++)rows.push({x,y,seg:g,sz:(g==='A'?0:1000)+x*1000+i});};
push(1,0,'A',1);push(2,100,'A',1);push(3,10,'A',100);push(4,200,'B',1);push(5,300,'B',1);push(6,210,'B',100);
const base = { rows, chartType:'scatter', output:{ includeA11y:true },
  encodings:{ x:{field:'x',type:'quantitative'}, y:{field:'y',type:'quantitative',aggregate:'average'}, color:'seg' } };

for (const [name, enc] of [
  ['WITH quantitative size (the phantom case)', { size:{field:'sz',type:'quantitative'} }],
  ['WITHOUT size (control — honest 0.819 correlation)', {}],
]) {
  const body = await run({ ...base, encodings:{ ...base.encodings, ...enc } });
  const full = JSON.stringify(body);
  const summary = full.match(/"summary":"([^"]*)"/)?.[1] ?? '(none)';
  const kf = full.match(/"keyFindings":(\[[^\]]*\])/)?.[1] ?? '(none)';
  const corr = full.match(/[Cc]orrelation coefficient[^"]*/g) ?? full.match(/relationship between/g);
  console.log(`\n### ${name} (ok=${body.ok}) ###`);
  console.log('  summary:', summary);
  console.log('  keyFindings:', kf);
  console.log('  >>> correlation finding present?', corr ? JSON.stringify(corr) : 'NONE');
}
