import { analyzeVizSpec, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

// ---- (1) confirm the s162 size phantom still reproduces ----
const rows = [];
const push = (x, y, g, k) => { for (let i = 0; i < k; i++) rows.push({ x, y, seg: g, sz: (g === 'A' ? 0 : 1000) + x * 1000 + i }); };
push(1,0,'A',1); push(2,100,'A',1); push(3,10,'A',100);
push(4,200,'B',1); push(5,300,'B',1); push(6,210,'B',100);
const enc = { x:{field:'x',trait:'EncodingX',type:'quantitative'},
  y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},
  color:{field:'seg',trait:'EncodingColor'},
  size:{field:'sz',trait:'EncodingSize',type:'quantitative'} };
const spec = { $schema:'x', id:'sz', name:'sz', data:{name:'d',values:rows}, marks:[{trait:'MarkPoint',encodings:enc}], encoding:enc, a11y:{description:'d'} };
console.log('[1] size phantom correlation (expect ~0.981):', analyzeVizSpec(spec).correlation);

// ---- (2) STACKING CORNER reachability: mark=bar, agg=sum on y, x quantitative, color=seg categorical ----
// series individually FALL, stack total RISES. Does the SUT emit a correlation today?
const srows = [];
const spush = (x, y, g, k) => { for (let i=0;i<k;i++) srows.push({ x, y, seg:g }); };
// seg A: at x=1 y=100, x=2 y=50, x=3 y=10 (falls). seg B: x=1 y=10, x=2 y=60, x=3 y=110 (rises). Stack total: 110,110,120 (rises slightly)
spush(1,100,'A',1); spush(2,50,'A',1); spush(3,10,'A',1);
spush(1,10,'B',1); spush(2,60,'B',1); spush(3,110,'B',1);
const senc = { x:{field:'x',trait:'EncodingX',type:'quantitative'},
  y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'sum'},
  color:{field:'seg',trait:'EncodingColor'} };
const sspec = { $schema:'x', id:'st', name:'st', data:{name:'d',values:srows}, marks:[{trait:'MarkBar',encodings:senc}], encoding:senc, a11y:{description:'d'} };
console.log('[2] stacked-bar resolvePrimaryChannels:', JSON.stringify(resolvePrimaryChannels(sspec)));
console.log('[2] stacked-bar (sum,quant-x,cat-color) correlation:', analyzeVizSpec(sspec).correlation);

// ---- (2b) same but MarkArea ----
const aspec = { ...sspec, id:'stA', marks:[{trait:'MarkArea',encodings:senc}] };
console.log('[2b] stacked-AREA correlation:', analyzeVizSpec(aspec).correlation);

// ---- (2c) stacking with count agg ----
const cenc = { x:{field:'x',trait:'EncodingX',type:'quantitative'},
  y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'count'},
  color:{field:'seg',trait:'EncodingColor'} };
const cspec = { ...sspec, id:'stC', encoding:cenc, marks:[{trait:'MarkBar',encodings:cenc}] };
console.log('[2c] stacked-bar count correlation:', analyzeVizSpec(cspec).correlation);
