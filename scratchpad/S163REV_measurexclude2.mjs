import { analyzeVizSpec, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
function pearson(pairs){ const n=pairs.length; if(n<2) return null;
  const mx=pairs.reduce((s,p)=>s+p[0],0)/n, my=pairs.reduce((s,p)=>s+p[1],0)/n;
  let num=0,dx=0,dy=0; for(const [x,y] of pairs){num+=(x-mx)*(y-my);dx+=(x-mx)**2;dy+=(y-my)**2;}
  const den=Math.sqrt(dx*dy); return den===0?null:num/den; }
function projectAvg(rows, dimF, measF, keyFields){ const groups=new Map();
  for(const r of rows){ const key=keyFields.map(f=>String(r[f])).join('\0');
    if(!groups.has(key)) groups.set(key,{dim:r[dimF],vals:[]}); groups.get(key).vals.push(Number(r[measF])); }
  return [...groups.values()].map(g=>[Number(g.dim), g.vals.reduce((s,v)=>s+v,0)/g.vals.length]); }
const mk=(marks,enc,rows)=>({ $schema:'x', id:'n', name:'n', data:{name:'d',values:rows}, marks:[{trait:marks,encodings:enc}], encoding:enc, a11y:{description:'d'} });
const banner=(t)=>console.log('\n===== '+t+' =====');

// CASE 6: TWO categorical partitions (color=seg + detail=grp) + quant size. Each (seg,grp) drawn cell
// FALLS; pooled RISES. Must SUPPRESS (undefined). Stresses multi-field partition ∪ size groupingFields.
banner('CASE 6 — two categorical partitions + quant size (expect undefined)');
{ const rows=[]; const push=(x,y,g,h,k)=>{for(let i=0;i<k;i++) rows.push({x,y,seg:g,grp:h,sz:x*1000+i+(g==='A'?0:5e4)+(h==='p'?0:1e5)});};
  // 4 partition groups (A/B x p/q), each a falling triple, offset so pooled rises
  push(1,0,'A','p',1);push(2,50,'A','p',1);push(3,5,'A','p',80);
  push(2,60,'A','q',1);push(3,110,'A','q',1);push(4,70,'A','q',80);
  push(3,120,'B','p',1);push(4,170,'B','p',1);push(5,130,'B','p',80);
  push(4,180,'B','q',1);push(5,230,'B','q',1);push(6,190,'B','q',80);
  const enc={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},color:{field:'seg',trait:'EncodingColor'},detail:{field:'grp',trait:'EncodingDetail'},size:{field:'sz',trait:'EncodingSize',type:'quantitative'}};
  const spec=mk('MarkPoint',enc,rows);
  console.log('SUT correlation:', analyzeVizSpec(spec).correlation);
  const keys=['x','seg','grp','sz'];
  for(const g of ['A','B']) for(const h of ['p','q'])
    console.log(`  oracle (${g},${h}) drawn:`, pearson(projectAvg(rows.filter(r=>r.seg===g&&r.grp===h),'x','y',keys))?.toFixed(3));
  console.log('  oracle POOLED drawn:', pearson(projectAvg(rows,'x','y',keys))?.toFixed(3));
}

// CASE 7: STACKING sum on bar + categorical color partition. value=stack total (series dropped);
// classifier=per-series. Confirm it does NOT narrate a phantom that the stack-total drawn cells
// contradict. Geometry: per-series both rise, stack total also rises -> honest, should narrate;
// then a variant where per-series rise but we probe whether a phantom can leak.
banner('CASE 7 — stacking sum + color partition (per-series rise, stack total rises = honest)');
{ const rows=[]; const push=(x,y,g)=>rows.push({x,y,seg:g});
  push(1,10,'A');push(2,20,'A');push(3,30,'A');push(1,5,'B');push(2,10,'B');push(3,15,'B');
  const enc={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'sum'},color:{field:'seg',trait:'EncodingColor'}};
  const spec=mk('MarkBar',enc,rows);
  console.log('channels:', JSON.stringify(resolvePrimaryChannels(spec)));
  console.log('SUT correlation:', analyzeVizSpec(spec).correlation);
  // stack total per x = sum over seg
  const st=new Map(); for(const r of rows){ st.set(r.x,(st.get(r.x)||0)+r.y); }
  console.log('  oracle stack-total drawn (x vs sum):', pearson([...st.entries()].map(([x,v])=>[x,v]))?.toFixed(3));
}

// CASE 8: within-partition size-Simpson WITH categorical partition present. Each FIXED size falls,
// but pooled-over-size within each seg RISES. Per survivor def the value pools over per-(x,seg,sz)
// cells which RISE -> honest to narrate. Confirm SUT narrates the POOLED drawn direction (not a lie).
banner('CASE 8 — within-partition size Simpson (per-fixed-size falls, pooled drawn rises = honest narrate)');
{ const rows=[]; const push=(x,y,g,sz)=>rows.push({x,y,seg:g,sz});
  // seg A: size=1 series (x1..3 falling), size=2 series (x4..6 falling but higher y) => pooled rises
  push(1,30,'A',1);push(2,20,'A',1);push(3,10,'A',1);push(4,130,'A',2);push(5,120,'A',2);push(6,110,'A',2);
  push(1,32,'B',1);push(2,22,'B',1);push(3,12,'B',1);push(4,132,'B',2);push(5,122,'B',2);push(6,112,'B',2);
  const enc={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},color:{field:'seg',trait:'EncodingColor'},size:{field:'sz',trait:'EncodingSize',type:'quantitative'}};
  const spec=mk('MarkPoint',enc,rows);
  const sut=analyzeVizSpec(spec).correlation;
  console.log('SUT correlation:', sut);
  console.log('  oracle POOLED drawn (per x,seg,sz):', pearson(projectAvg(rows,'x','y',['x','seg','sz']))?.toFixed(3), '(the cells the value pools over)');
  console.log('  oracle seg A fixed-size=1:', pearson(rows.filter(r=>r.seg==='A'&&r.sz===1).map(r=>[r.x,r.y]))?.toFixed(3), ' fixed-size=2:', pearson(rows.filter(r=>r.seg==='A'&&r.sz===2).map(r=>[r.x,r.y]))?.toFixed(3));
  console.log('  => If SUT === pooled-drawn sign, it is HONEST w.r.t the drawn cells (size = magnitude, not a series). Only a SURVIVOR if SUT sign != pooled-drawn sign.');
}
