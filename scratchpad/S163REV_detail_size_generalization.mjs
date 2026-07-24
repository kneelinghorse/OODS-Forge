// Generalization check: the SAME gap the quant-detail case exposes also hits quantitative SIZE
// (grouping-only) carrying a Simpson WITHIN a categorical color partition — a plain bubble chart.
// This is the s162 fixture's exact channels (color partition + quant size) but with the Simpson
// carried by REPEATED size VALUES inside each color, not across color. The s163 fix re-projects by
// size (invariant holds) but pools size cells for direction -> MISS.
import { analyzeVizSpec, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
function pearson(pairs){const n=pairs.length;if(n<2)return null;const mx=pairs.reduce((s,p)=>s+p[0],0)/n,my=pairs.reduce((s,p)=>s+p[1],0)/n;let num=0,dx=0,dy=0;for(const[x,y]of pairs){num+=(x-mx)*(y-my);dx+=(x-mx)**2;dy+=(y-my)**2;}const den=Math.sqrt(dx*dy);return den===0?null:num/den;}

// size has only TWO distinct values {10,20} within each color -> two size-bands, each a falling
// sub-trend; pooled over sizes rises. avg aggregate so each (x,seg,sz) is a drawn cell.
const rows=[]; const push=(x,y,seg,sz)=>rows.push({x,y,seg,sz});
for(const seg of ['A','B']){ push(1,10,seg,10); push(2,9,seg,10); push(3,100,seg,20); push(4,99,seg,20); }
const enc={ x:{field:'x',trait:'EncodingX',type:'quantitative'},
            y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},
            color:{field:'seg',trait:'EncodingColor'},
            size:{field:'sz',trait:'EncodingSize',type:'quantitative'} };
const spec={ $schema:'https://oods.dev/viz-spec/v1', id:'sz2', name:'sz2',
  data:{name:'d',values:rows}, marks:[{trait:'MarkPoint',encodings:enc}], encoding:enc, a11y:{description:'x'} };
const a=analyzeVizSpec(spec); const {summary,keyFindings}=generateNarrativeSummary(spec);
console.log('=== quant-SIZE within color partition (bubble chart) ===');
console.log('SUT analysis.correlation:', a.correlation);
console.log('SUT summary:', summary);
console.log('SUT keyFindings:', JSON.stringify(keyFindings));
console.log('POOLED:', pearson(rows.map(r=>[r.x,r.y]))?.toFixed(4));
for(const seg of ['A','B']) for(const sz of [10,20]){
  const sub=rows.filter(r=>r.seg===seg&&r.sz===sz).map(r=>[r.x,r.y]);
  console.log(`  seg=${seg} size=${sz}:`, pearson(sub)?.toFixed(4),'(drawn sub-cloud FALLS)');
}
