import { analyzeVizSpec, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

const rows=[]; let sz=1;
rows.push({x:1,y:0,seg:'A',sz:sz++});
rows.push({x:2,y:100,seg:'A',sz:sz++});
for(let i=0;i<100;i++) rows.push({x:3,y:10,seg:'A',sz:sz++});
rows.push({x:4,y:200,seg:'B',sz:sz++});
rows.push({x:5,y:300,seg:'B',sz:sz++});
for(let i=0;i<100;i++) rows.push({x:6,y:210,seg:'B',sz:sz++});

function mk(withColor, withSize){
  const enc={
    x:{field:'x',trait:'EncodingX',type:'quantitative',scale:{type:'linear'}},
    y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average',scale:{type:'linear'}},
  };
  if(withColor) enc.color={field:'seg',trait:'EncodingColor',type:'nominal'};
  if(withSize) enc.size={field:'sz',trait:'EncodingSize',type:'quantitative',scale:{type:'linear'}};
  return {$schema:'https://oods.dev/viz-spec/v1',id:'c',name:'C',data:{name:'d',values:rows},
    marks:[{trait:'MarkPoint',encodings:enc}],encoding:enc,a11y:{description:'s'}};
}

for(const [c,s,label] of [[true,true,'color+size (SUSPECT)'],[false,true,'size-only (DISCLOSED)'],[true,false,'color-only, NO size (gate should suppress)'],[false,false,'neither']]){
  const spec=mk(c,s);
  const a=analyzeVizSpec(spec);
  const nar=generateNarrativeSummary(spec);
  const corrFinding=nar.keyFindings.find(f=>f.startsWith('Correlation'));
  console.log(`\n[${label}] correlation=${a.correlation}  narratesCorrelation=${a.correlation!==undefined}`);
  console.log('  summary:', nar.summary);
  console.log('  corr finding:', corrFinding??'(none — SUPPRESSED)');
}
