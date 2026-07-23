import { analyzeVizSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
const mk=(rows)=>{const enc={x:{field:'x',trait:'EncodingX',type:'quantitative',scale:{type:'linear'}},y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average',scale:{type:'linear'}},color:{field:'seg',trait:'EncodingColor',type:'nominal'}};return{$schema:'https://oods.dev/viz-spec/v1',id:'x',name:'X',data:{name:'d',values:rows},marks:[{trait:'MarkPoint',encodings:enc}],encoding:enc,a11y:{description:'s'}};};
// (b) all-flat groups + directional pooled -> must suppress
const flat=[{x:1,y:10,seg:'A'},{x:2,y:10,seg:'A'},{x:4,y:90,seg:'B'},{x:5,y:90,seg:'B'}];
console.log('(b) all-flat groups, directional pooled: corr=',analyzeVizSpec(mk(flat)).correlation,'(expect undefined)');
// (d) opposing signs -> must suppress
const opp=[{x:1,y:10,seg:'A'},{x:2,y:20,seg:'A'},{x:3,y:30,seg:'A'},{x:1,y:30,seg:'B'},{x:2,y:20,seg:'B'},{x:3,y:10,seg:'B'}];
console.log('(d) opposing +1/-1: corr=',analyzeVizSpec(mk(opp)).correlation,'(expect undefined)');
