import { analyzeVizSpec, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs){
  const n=pairs.length; if(n<2) return null;
  const mx=pairs.reduce((s,p)=>s+p[0],0)/n, my=pairs.reduce((s,p)=>s+p[1],0)/n;
  let num=0,dx=0,dy=0; for(const [x,y] of pairs){num+=(x-mx)*(y-my);dx+=(x-mx)**2;dy+=(y-my)**2;}
  const den=Math.sqrt(dx*dy); return den===0?null:num/den;
}
const sign=r=> r>0?1:r<0?-1:0;

// ---------- Design-A simulator (partition by categorical, reproject by groupingFields, one dir per partition) ----------
function projAvg(rows, dim, meas, grouping){
  const g=new Map();
  for(const r of rows){ const key=[dim,...grouping].map(f=>String(r[f])).join('\0'); if(!g.has(key)) g.set(key,{dim:r[dim],vals:[]}); g.get(key).vals.push(r[meas]); }
  return [...g.values()].map(o=>[o.dim, o.vals.reduce((s,v)=>s+v,0)/o.vals.length]);
}
function classifyDesignA(rows, dim, meas, partitionFields, groupingFields){
  const parts=new Map();
  for(const r of rows){ const key=partitionFields.map(f=>String(r[f])).join('\0'); if(!parts.has(key)) parts.set(key,[]); parts.get(key).push(r); }
  const classes=[];
  for(const grp of parts.values()){
    const cells=projAvg(grp, dim, meas, groupingFields); // avg reduction, keyed by dim+grouping
    const r=pearson(cells);
    classes.push(r===null?'unknown':sign(r));
  }
  return classes;
}

// ===== CHECK A: design-A on the size fixture => classes [-1,-1] => suppress =====
const rows=[];
const push=(x,y,g,k)=>{for(let i=0;i<k;i++) rows.push({x,y,seg:g,sz:(g==='A'?0:1000)+x*1000+i});};
push(1,0,'A',1); push(2,100,'A',1); push(3,10,'A',100);
push(4,200,'B',1); push(5,300,'B',1); push(6,210,'B',100);
console.log('== CHECK A: design-A hand-sim on size fixture ==');
console.log('  partition=[seg], grouping=[sz] classes:', JSON.stringify(classifyDesignA(rows,'x','y',['seg'],['sz'])), '(expect [-1,-1] => suppress)');
console.log('  s162 partition=[seg], grouping=[]  classes:', JSON.stringify(classifyDesignA(rows,'x','y',['seg'],[])), '(the s162 bug: [+1,+1] => narrate)');

// ===== CHECK B: stacking keep-control — conflicting stacked bar, current dist should suppress =====
// stacked bar, y sum, quantitative x (dim), color=seg; per-segment DRAWN direction conflicts across segs.
// seg A rises with x, seg B falls with x.
const srows=[
  {x:1,y:10,seg:'A'},{x:2,y:20,seg:'A'},{x:3,y:30,seg:'A'},
  {x:1,y:30,seg:'B'},{x:2,y:20,seg:'B'},{x:3,y:10,seg:'B'},
];
const senc={ x:{field:'x',trait:'EncodingX',type:'quantitative'},
             y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'sum'},
             color:{field:'seg',trait:'EncodingColor'} };
const sspec={ $schema:'https://oods.dev/viz-spec/v1', id:'stk', name:'stk',
  data:{name:'d',values:srows}, marks:[{trait:'MarkBar',encodings:senc}], encoding:senc, a11y:{description:'y over x'} };
console.log('\n== CHECK B: stacking keep-control (conflicting stacked bar) ==');
console.log('  resolvePrimaryChannels:', JSON.stringify(resolvePrimaryChannels(sspec)));
console.log('  CURRENT dist correlation:', analyzeVizSpec(sspec).correlation, '(s162 must be undefined; design-A must preserve)');
// hand: value pools per-x stack totals: x1=40,x2=40,x3=40 => zero variance => pooled null => undefined anyway?
const totals=new Map(); for(const r of srows){ totals.set(r.x,(totals.get(r.x)||0)+r.y);}
console.log('  per-x stack totals:', JSON.stringify([...totals.entries()]));
// try a version where totals are NOT flat, to make pooled defined, still conflicting segments
const srows2=[
  {x:1,y:10,seg:'A'},{x:2,y:25,seg:'A'},{x:3,y:45,seg:'A'},   // A rises
  {x:1,y:30,seg:'B'},{x:2,y:20,seg:'B'},{x:3,y:12,seg:'B'},   // B falls
];
const sspec2={...sspec, id:'stk2', data:{name:'d',values:srows2}, marks:[{trait:'MarkBar',encodings:senc}]};
const t2=new Map(); for(const r of srows2){ t2.set(r.x,(t2.get(r.x)||0)+r.y);}
console.log('  variant2 per-x stack totals:', JSON.stringify([...t2.entries()]), 'pooled=', pearson([...t2.entries()]).toFixed(3));
console.log('  variant2 CURRENT dist correlation:', analyzeVizSpec(sspec2).correlation);
console.log('  variant2 design-A hand-sim classes partition=[seg] grouping=[]:', JSON.stringify(classifyDesignA(srows2,'x','y',['seg'],[])));

// ===== CHECK C: disclosed escape — all-quantitative-retinal Simpson, NO categorical partition, must NARRATE =====
// size is the only retinal channel, quantitative -> partitionFields = [] -> early-return pooled -> narrate.
const crows=[];
const cpush=(x,y,szgrp,k)=>{for(let i=0;i<k;i++) crows.push({x,y,sz:szgrp});};
// two size-bands acting as hidden series that reverse, no color/facet
cpush(1,0,10,1); cpush(2,100,10,1); cpush(3,10,10,100);
cpush(4,200,99,1); cpush(5,300,99,1); cpush(6,210,99,100);
const cenc={ x:{field:'x',trait:'EncodingX',type:'quantitative'},
             y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},
             size:{field:'sz',trait:'EncodingSize',type:'quantitative'} };
const cspec={ $schema:'https://oods.dev/viz-spec/v1', id:'qr', name:'qr',
  data:{name:'d',values:crows}, marks:[{trait:'MarkPoint',encodings:cenc}], encoding:cenc, a11y:{description:'y over x'} };
console.log('\n== CHECK C: disclosed all-quantitative-retinal escape (no categorical partition) ==');
console.log('  CURRENT dist correlation:', analyzeVizSpec(cspec).correlation, '(DISCLOSED: still narrates; design-A does NOT change this)');
