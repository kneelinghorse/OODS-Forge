import {
  analyzeVizSpec, resolvePrimaryChannels,
} from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
function pearson(pairs){const n=pairs.length;if(n<2)return null;const mx=pairs.reduce((s,p)=>s+p[0],0)/n,my=pairs.reduce((s,p)=>s+p[1],0)/n;let num=0,dx=0,dy=0;for(const[x,y]of pairs){num+=(x-mx)*(y-my);dx+=(x-mx)**2;dy+=(y-my)**2;}const den=Math.sqrt(dx*dy);return den===0?null:num/den;}
function totals(rows,xf,yf,filt){const m=new Map();for(const r of rows){if(filt&&!filt(r))continue;m.set(r[xf],(m.get(r[xf])||0)+r[yf]);}return[...m.entries()].sort((a,b)=>a[0]-b[0]);}

// A) HORIZONTAL stacked bar: measure=x (aggregate on x), dim=y numeric, contradicting segments.
{
  const rows=[
    {y:1,x:30,seg:'A'},{y:2,x:20,seg:'A'},{y:3,x:10,seg:'A'}, // A falls in x over y
    {y:1,x:5,seg:'B'},{y:2,x:25,seg:'B'},{y:3,x:60,seg:'B'},  // B rises
  ];
  const enc={x:{field:'x',trait:'EncodingX',type:'quantitative',aggregate:'sum'},
             y:{field:'y',trait:'EncodingY',type:'quantitative'},
             color:{field:'seg',trait:'EncodingColor'}};
  const spec={$schema:'x',id:'h',name:'h',data:{name:'d',values:rows},marks:[{trait:'MarkBar',encodings:enc}],encoding:enc,a11y:{description:'x by y'}};
  const c=analyzeVizSpec(spec).correlation;
  console.log('A) HORIZONTAL stacked (measure=x):', JSON.stringify(resolvePrimaryChannels(spec)));
  const st=totals(rows,'y','x'); // dim=y, measure=x
  console.log('   drawn per-y stack totals(x):',JSON.stringify(st),'pearson',pearson(st)?.toFixed(4));
  console.log('   segA(x over y):',JSON.stringify(totals(rows,'y','x',r=>r.seg==='A')),'segB:',JSON.stringify(totals(rows,'y','x',r=>r.seg==='B')));
  console.log('   SUT correlation:',c,'-> EXPECT undefined (segments contradict).',c===undefined?'HELD':'CHECK '+c);
}

// B) AREA mark stacked, contradicting segments.
{
  const rows=[
    {x:1,y:30,seg:'A'},{x:2,y:20,seg:'A'},{x:3,y:10,seg:'A'},
    {x:1,y:5,seg:'B'},{x:2,y:25,seg:'B'},{x:3,y:60,seg:'B'},
  ];
  const enc={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'sum'},color:{field:'seg',trait:'EncodingColor'}};
  const spec={$schema:'x',id:'ar',name:'ar',data:{name:'d',values:rows},marks:[{trait:'MarkArea',encodings:enc}],encoding:enc,a11y:{description:'y by x'}};
  const c=analyzeVizSpec(spec).correlation;
  const st=totals(rows,'x','y');
  console.log('\nB) AREA stacked contradicting: drawn totals',JSON.stringify(st),'pearson',pearson(st)?.toFixed(4),'| SUT',c,c===undefined?'HELD (suppressed)':'CHECK '+c);
}

// C) COUNT aggregate stacked, agreeing -> honest narration.
{
  const rows=[];
  const push=(x,seg,k)=>{for(let i=0;i<k;i++)rows.push({x,seg,y:1});};
  push(1,'A',2);push(2,'A',4);push(3,'A',6); // A count rises
  push(1,'B',1);push(2,'B',2);push(3,'B',3); // B count rises
  const enc={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'count'},color:{field:'seg',trait:'EncodingColor'}};
  const spec={$schema:'x',id:'ct',name:'ct',data:{name:'d',values:rows},marks:[{trait:'MarkBar',encodings:enc}],encoding:enc,a11y:{description:'count by x'}};
  const c=analyzeVizSpec(spec).correlation;
  // drawn stack total = total count per x
  const st=[[1,3],[2,6],[3,9]];
  console.log('\nC) COUNT stacked agreeing: drawn total-count per x',JSON.stringify(st),'pearson',pearson(st)?.toFixed(4),'| SUT',c,(c!==undefined&&Math.abs(c-1)<1e-3)?'HONEST':'CHECK '+c);
}

// D) single-x UNKNOWN segment DISTORTS pooled to opposite sign -> Simpson-reversal guard must SUPPRESS (no lie).
{
  const rows=[
    {x:1,y:10,seg:'A'},{x:2,y:20,seg:'A'},{x:3,y:30,seg:'A'}, // A rises +1
    {x:1,y:1000,seg:'B'},                                     // B single x=1 -> unknown, huge bump at x=1
  ];
  const enc={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'sum'},color:{field:'seg',trait:'EncodingColor'}};
  const spec={$schema:'x',id:'d',name:'d',data:{name:'d',values:rows},marks:[{trait:'MarkBar',encodings:enc}],encoding:enc,a11y:{description:'y by x'}};
  const c=analyzeVizSpec(spec).correlation;
  const st=totals(rows,'x','y');
  console.log('\nD) unknown-B distorts pooled: drawn totals',JSON.stringify(st),'pooled pearson',pearson(st)?.toFixed(4),
    '\n   segA classified +1 (only voter); pooled sign =',Math.sign(pearson(st)),
    '| SUT',c,c===undefined?'HELD (Simpson-reversal guard suppressed the pooled-vs-A disagreement)':'-> if defined & opposite to drawn-total-honest this is a candidate: '+c);
}

// E) single-x UNKNOWN segments only (all unknown) -> vacuous pass; value must equal drawn stack totals (honest).
{
  const rows=[{x:1,y:20,seg:'A'},{x:2,y:100,seg:'B'},{x:3,y:200,seg:'C'}];
  const enc={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'sum'},color:{field:'seg',trait:'EncodingColor'}};
  const spec={$schema:'x',id:'e',name:'e',data:{name:'d',values:rows},marks:[{trait:'MarkBar',encodings:enc}],encoding:enc,a11y:{description:'y by x'}};
  const c=analyzeVizSpec(spec).correlation;
  const st=totals(rows,'x','y');const o=pearson(st);
  console.log('\nE) all-unknown vacuous pass: drawn totals',JSON.stringify(st),'pearson',o?.toFixed(4),'| SUT',c,
    (c!==undefined&&Math.abs(c-Math.round(o*1000)/1000)<1e-9)?'HONEST (== rounded drawn-total pearson; no hidden within-seg contradiction)':'CHECK '+c);
}
