import { analyzeVizSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
const srows = [];
const spush = (x, y, g, k) => { for (let i=0;i<k;i++) srows.push({ x, y, seg:g }); };
spush(1,100,'A',1); spush(2,50,'A',1); spush(3,10,'A',1);
spush(1,10,'B',1); spush(2,60,'B',1); spush(3,110,'B',1);
const senc = { x:{field:'x',trait:'EncodingX',type:'quantitative'},
  y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'sum'},
  color:{field:'seg',trait:'EncodingColor'} };
const mk = (extra) => ({ $schema:'x', id:'st', name:'st', data:{name:'d',values:srows}, marks:[{trait:'MarkBar',encodings:{...senc,...extra}}], encoding:{...senc,...extra}, a11y:{description:'d'} });

// with color (partition by seg -> series [-1,+1] -> suppress under s162)
console.log('WITH color (s162 current):', analyzeVizSpec(mk({})).correlation);

// WITHOUT color: no partition -> should narrate the stack-total pooled (proves pooled non-null, gate not firing)
const noColorEnc = { x:senc.x, y:senc.y };
const noColorSpec = { $schema:'x', id:'st2', name:'st2', data:{name:'d',values:srows}, marks:[{trait:'MarkBar',encodings:noColorEnc}], encoding:noColorEnc, a11y:{description:'d'} };
console.log('WITHOUT color (pooled over stack totals, should be ~+0.87):', analyzeVizSpec(noColorSpec).correlation);

// series AGREE (both rise) -> even s162 should narrate
const arows = [];
const apush = (x,y,g)=>arows.push({x,y,seg:g});
apush(1,10,'A');apush(2,20,'A');apush(3,30,'A');
apush(1,5,'B');apush(2,15,'B');apush(3,25,'B');
const aspec = { $schema:'x', id:'st3', name:'st3', data:{name:'d',values:arows}, marks:[{trait:'MarkBar',encodings:senc}], encoding:senc, a11y:{description:'d'} };
console.log('series AGREE rise (s162):', analyzeVizSpec(aspec).correlation);
