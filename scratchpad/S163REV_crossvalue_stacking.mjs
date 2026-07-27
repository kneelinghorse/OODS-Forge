// S163 CROSSVALUE — verify design-A preserved s162 stacking suppression (no design-B regression),
// and that a declared-aggregate correlation with an ACTIVE categorical partition still gates honestly.
import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
function pearson(pairs){const n=pairs.length;if(n<2)return null;const mx=pairs.reduce((s,p)=>s+p[0],0)/n,my=pairs.reduce((s,p)=>s+p[1],0)/n;let num=0,dx=0,dy=0;for(const[x,y]of pairs){num+=(x-mx)*(y-my);dx+=(x-mx)**2;dy+=(y-my)**2;}const den=Math.sqrt(dx*dy);return den===0?null:num/den;}
function mkspec({id='s',mark='MarkArea',enc,values,extra={}}){return{$schema:'https://oods.dev/viz-spec/v1',id,name:id,data:{name:'d',values},marks:[{trait:mark,encodings:JSON.parse(JSON.stringify(enc))}],encoding:JSON.parse(JSON.stringify(enc)),a11y:{description:'d'},...extra};}
function show(label,spec){console.log('\n===== '+label+' =====');const a=analyzeVizSpec(spec);const{summary,keyFindings}=generateNarrativeSummary(spec);console.log('  rpc:',JSON.stringify(resolvePrimaryChannels(spec)));console.log('  correlation:',a.correlation,'| total:',a.total);console.log('  keyFindings:',JSON.stringify(keyFindings));return a;}

// STACKED area, x quant, y sum-aggregate, color=seg. Per-segment y FALLS with x, but the STACK TOTAL rises.
// s162 suppresses this (per-segment contradiction vs pooled). s163 design A must PRESERVE that suppression.
const st=[];
// seg A falls: x1->30, x2->20, x3->10 ; seg B falls: x1->25, x2->18, x3->11 ; but stack total: 55,38,21 falls too
// Make stack total RISE while segments fall: need cross-over. seg A: x1->5,x2->3,x3->1; seg B: x1->1,x2->10,x3->30
// stack: 6, 13, 31 rises; segA falls, segB rises => contradiction => suppress.
const push=(x,y,g)=>st.push({x,y,seg:g});
push(1,5,'A');push(2,3,'A');push(3,1,'A');
push(1,1,'B');push(2,10,'B');push(3,30,'B');
const aStack=show('STACK Simpson: segA falls, segB rises, stack-total rises (declared sum, stacked area) expect gate SUPPRESS or honest',mkspec({
  id:'stack',mark:'MarkArea',values:st,
  enc:{x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'sum',stack:'zero'},color:{field:'seg',trait:'EncodingColor',type:'nominal'}},
}));
// stack total per x
const tot=new Map();for(const r of st){tot.set(r.x,(tot.get(r.x)||0)+r.y);}
console.log('  stack-total cells:',[...tot.entries()],'pearson:',pearson([...tot.entries()])?.toFixed(4));
console.log('  segA pearson:',pearson(st.filter(r=>r.seg==='A').map(r=>[r.x,r.y]))?.toFixed(4),'segB:',pearson(st.filter(r=>r.seg==='B').map(r=>[r.x,r.y]))?.toFixed(4));
console.log('  => segments contradict (A<0,B>0) so gate SHOULD suppress the stack-total correlation');

// CONTROL: stacked, all segments RISE, stack rises => honest, expect NARRATE
const st2=[];const p2=(x,y,g)=>st2.push({x,y,seg:g});
p2(1,5,'A');p2(2,10,'A');p2(3,15,'A');p2(1,2,'B');p2(2,6,'B');p2(3,12,'B');
show('STACK honest: both segs rise, stack rises (expect NARRATE positive)',mkspec({
  id:'stack2',mark:'MarkArea',values:st2,
  enc:{x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'sum',stack:'zero'},color:{field:'seg',trait:'EncodingColor',type:'nominal'}},
}));
const tot2=new Map();for(const r of st2){tot2.set(r.x,(tot2.get(r.x)||0)+r.y);}
console.log('  stack-total pearson:',pearson([...tot2.entries()])?.toFixed(4),'(rises -> narrate)');
console.log('\n==== DONE ====');
