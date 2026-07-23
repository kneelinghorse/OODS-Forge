import { analyzeVizSpec, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
// Stacked AREA: x quant, y sum, color categorical. Two color segments.
// Design goal: per-color SEGMENT heights FALL across x, but the STACK TOTAL RISES.
// A rows: seg heights fall (10,8,6); B rows: rise steeply (0,20,40). totals: 10,28,46 RISE.
const rows=[];
const push=(x,y,g)=>rows.push({x,y,seg:g});
push(1,10,'A'); push(2,8,'A'); push(3,6,'A');
push(1,0,'B');  push(2,20,'B'); push(3,40,'B');
const enc={ x:{field:'x',trait:'EncodingX',type:'quantitative'},
            y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'sum'},
            color:{field:'seg',trait:'EncodingColor'} };
const spec={ $schema:'https://oods.dev/viz-spec/v1', id:'st', name:'st',
  data:{name:'d',values:rows},
  marks:[{trait:'MarkArea',encodings:enc}], encoding:enc, a11y:{description:'y over x'} };
console.log('channels:', JSON.stringify(resolvePrimaryChannels(spec)));
console.log('CURRENT (s162) stacked-area correlation:', analyzeVizSpec(spec).correlation);
// stack totals per x: 10,28,46 -> strongly rising. Per-seg A falls, B rises.
