const BR = 'http://127.0.0.1:4466/run';
async function run(input) {
  const r = await fetch(BR, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ tool:'viz_render', input }) });
  return await r.json();
}
const rows=[]; const push=(x,y,g,k)=>{for(let i=0;i<k;i++)rows.push({x,y,seg:g,sz:(g==='A'?0:1000)+x*1000+i});};
push(1,0,'A',1);push(2,100,'A',1);push(3,10,'A',100);push(4,200,'B',1);push(5,300,'B',1);push(6,210,'B',100);
const body = await run({ rows, chartType:'scatter', includeA11y:true,
  encodings:{ x:{field:'x',type:'quantitative'}, y:{field:'y',type:'quantitative',aggregate:'average'}, color:'seg', size:{field:'sz',type:'quantitative'} } });
console.log('top keys:', Object.keys(body));
console.log('result type/keys:', typeof body.result, body.result && (Array.isArray(body.result)?'array['+body.result.length+']':Object.keys(body.result)));
console.log('artifactsDetail:', JSON.stringify(body.artifactsDetail)?.slice(0,500));
// full-blob correlation scan across the ENTIRE response
const full = JSON.stringify(body);
console.log('\nfull-response correlation mentions:', full.match(/correlation[":]*\s*[-0-9.]+/gi)?.slice(0,6) ?? 'NONE');
console.log('full-response has "relationship between":', full.includes('relationship between'));
console.log('any a11y/narrative path present:', full.includes('"narrative"'), '| summary snippet:', full.match(/"summary":"[^"]{0,80}/)?.[0] ?? 'n/a');
