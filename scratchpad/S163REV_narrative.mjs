// Confirm the CONSUMER-FACING narrative text matches analysis.correlation for the measurexclude cases.
import { analyzeVizSpec, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function mk(marks, enc, rows){ return { $schema:'x', id:'n', name:'n', data:{name:'d',values:rows},
  marks:[{trait:marks,encodings:enc}], encoding:enc, a11y:{description:'d'} }; }
const grep=(s)=>/correlat/i.test(s);

// Case 1 (size Simpson, suppressed)
{ const rows=[]; const push=(x,y,g,k)=>{for(let i=0;i<k;i++) rows.push({x,y,seg:g,sz:(g==='A'?0:1000)+x*1000+i});};
  push(1,0,'A',1);push(2,100,'A',1);push(3,10,'A',100);push(4,200,'B',1);push(5,300,'B',1);push(6,210,'B',100);
  const enc={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},color:{field:'seg',trait:'EncodingColor'},size:{field:'sz',trait:'EncodingSize',type:'quantitative'}};
  const spec=mk('MarkPoint',enc,rows); const {summary,keyFindings}=generateNarrativeSummary(spec);
  console.log('CASE1 corr=',analyzeVizSpec(spec).correlation,'| narrative mentions correlation?',grep(summary+JSON.stringify(keyFindings)));
  console.log('   summary:',summary);
}
// Case 2 (measure=X, suppressed)
{ const rows=[]; const push=(yr,val,g,k)=>{for(let i=0;i<k;i++) rows.push({yr,val,seg:g,sz:(g==='A'?0:1000)+yr*1000+i});};
  push(1,0,'A',1);push(2,100,'A',1);push(3,10,'A',100);push(4,200,'B',1);push(5,300,'B',1);push(6,210,'B',100);
  const enc={x:{field:'val',trait:'EncodingX',type:'quantitative',aggregate:'average'},y:{field:'yr',trait:'EncodingY',type:'quantitative'},color:{field:'seg',trait:'EncodingColor'},size:{field:'sz',trait:'EncodingSize',type:'quantitative'}};
  const spec=mk('MarkBar',enc,rows); const {summary,keyFindings}=generateNarrativeSummary(spec);
  console.log('CASE2 corr=',analyzeVizSpec(spec).correlation,'| narrative mentions correlation?',grep(summary+JSON.stringify(keyFindings)));
}
// Case 5 (honest rising, narrated)
{ const rows=[]; const push=(x,y,g,sz)=>rows.push({x,y,seg:g,sz});
  push(1,10,'A',5);push(2,20,'A',9);push(3,30,'A',5);push(4,40,'A',9);push(1,12,'B',5);push(2,24,'B',9);push(3,36,'B',5);push(4,48,'B',9);
  const enc={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},color:{field:'seg',trait:'EncodingColor'},size:{field:'sz',trait:'EncodingSize',type:'quantitative'}};
  const spec=mk('MarkPoint',enc,rows); const {summary,keyFindings}=generateNarrativeSummary(spec);
  console.log('CASE5 corr=',analyzeVizSpec(spec).correlation,'| narrative mentions correlation?',grep(summary+JSON.stringify(keyFindings)));
  console.log('   keyFindings:',JSON.stringify(keyFindings));
}
