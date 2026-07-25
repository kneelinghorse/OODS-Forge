import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { sxy += (xs[i]-mx)*(ys[i]-my); sxx += (xs[i]-mx)**2; syy += (ys[i]-my)**2; }
  if (sxx === 0 || syy === 0) return null;
  return sxy / Math.sqrt(sxx*syy);
}

function mkspec(rows, enc, mark='MarkPoint') {
  return { $schema:'https://oods.dev/viz-spec/v1', id:'t', name:'t', data:{name:'d',values:rows},
    marks:[{trait:mark,encodings:enc}], encoding:enc, a11y:{description:'y over x'} };
}

// Report drawn sub-series pearson at each granularity we care about.
function report(label, rows, keyer) {
  const groups = new Map();
  for (const r of rows) {
    const k = keyer(r);
    if (!groups.has(k)) groups.set(k, {xs:[], ys:[]});
    groups.get(k).xs.push(r.x); groups.get(k).ys.push(r.y);
  }
  console.log('  ['+label+']');
  for (const [k, g] of groups) {
    // aggregate y per distinct x (average) to mimic drawn cells
    const cell = new Map();
    for (let i=0;i<g.xs.length;i++){ const x=g.xs[i]; if(!cell.has(x)) cell.set(x,[]); cell.get(x).push(g.ys[i]); }
    const xs=[...cell.keys()], ys=xs.map(x=>{const v=cell.get(x);return v.reduce((a,b)=>a+b,0)/v.length;});
    const r = xs.length>=2 ? pearson(xs, ys) : null;
    console.log('    '+k+' : n='+xs.length+' pts x='+JSON.stringify(xs)+' y='+JSON.stringify(ys.map(v=>+v.toFixed(2)))+' pearson='+(r===null?'NA':r.toFixed(3)));
  }
}

// ===== CASE A: classic nested Simpson, two quant axes sz & dt (quantitative detail via 2nd retinal) =====
// We need a 2nd quantitative grouping channel. detail role is grouping; give it type quantitative.
// Build joint (sz,dt) cells that FALL, but each single-axis marginal RISES and pooled RISES.
{
  // sz in {1,2}, dt in {1,2}. Within each joint cell, y decreases as x increases.
  // But higher sz+dt cells sit at higher x AND higher y (between-cell positive offset) -> marginals rise.
  const rows = [];
  // joint cells: (sz,dt) -> base x offset, base y offset; within-cell x steps up, y steps down
  const cells = [
    {sz:1, dt:1, x0:0,  y0:0},
    {sz:1, dt:2, x0:3,  y0:10},
    {sz:2, dt:1, x0:6,  y0:20},
    {sz:2, dt:2, x0:9,  y0:30},
  ];
  for (const c of cells) {
    for (let i=0;i<3;i++){
      rows.push({ x: c.x0 + i, y: c.y0 - 4*i, sz: c.sz, dt: c.dt });
    }
  }
  const enc = { x:{field:'x',trait:'EncodingX',type:'quantitative'},
    y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},
    size:{field:'sz',trait:'EncodingSize',type:'quantitative'},
    detail:{field:'dt',trait:'EncodingDetail',type:'quantitative'} };
  const spec = mkspec(rows, enc);
  console.log('=== CASE A nested Simpson (sz x dt joint FALLS, marginals RISE) ===');
  console.log('  measureChannel=', resolvePrimaryChannels(spec).measureChannel);
  report('JOINT sz,dt (finest DRAWN)', rows, r=>`sz${r.sz}dt${r.dt}`);
  report('marginal sz only', rows, r=>`sz${r.sz}`);
  report('marginal dt only', rows, r=>`dt${r.dt}`);
  report('POOLED', rows, r=>'*');
  const res = analyzeVizSpec(spec).correlation;
  console.log('  >>> analyzeVizSpec.correlation=', res, '| summary:', generateNarrativeSummary(spec).summary.slice(0,140));
}

// ===== CASE B: nested Simpson with n=2 joint cells (slope voted unconditionally, no rho gate) =====
{
  const rows = [];
  const cells = [
    {sz:1, dt:1, x0:0,  y0:0},
    {sz:1, dt:2, x0:3,  y0:12},
    {sz:2, dt:1, x0:6,  y0:24},
    {sz:2, dt:2, x0:9,  y0:36},
  ];
  for (const c of cells) { for (let i=0;i<2;i++){ rows.push({ x: c.x0 + i, y: c.y0 - 5*i, sz: c.sz, dt: c.dt }); } }
  const enc = { x:{field:'x',trait:'EncodingX',type:'quantitative'},
    y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},
    size:{field:'sz',trait:'EncodingSize',type:'quantitative'},
    detail:{field:'dt',trait:'EncodingDetail',type:'quantitative'} };
  const spec = mkspec(rows, enc);
  console.log('\n=== CASE B nested Simpson n=2 joint cells ===');
  report('JOINT sz,dt', rows, r=>`sz${r.sz}dt${r.dt}`);
  report('POOLED', rows, r=>'*');
  console.log('  >>> corr=', analyzeVizSpec(spec).correlation);
}

// ===== CASE C: joint FALLS but WEAKLY (|r|<0.5) -> rho gate drops the vote (DISCLOSED gray-zone) =====
{
  const rows = [];
  // joint cells: mostly flat/noisy falling, |pearson|<0.5, but pooled strongly positive via offsets
  const cells = [
    {sz:1, dt:1, x0:0,  y0:0},
    {sz:1, dt:2, x0:5,  y0:15},
    {sz:2, dt:1, x0:10, y0:30},
    {sz:2, dt:2, x0:15, y0:45},
  ];
  for (const c of cells) {
    // within-cell weak downward with noise: x 0..4, y wiggles slightly down -> |r|<0.5
    const ys=[0,-1,1,-1,-1];
    for (let i=0;i<5;i++){ rows.push({ x: c.x0 + i, y: c.y0 + ys[i], sz: c.sz, dt: c.dt }); }
  }
  const enc = { x:{field:'x',trait:'EncodingX',type:'quantitative'},
    y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},
    size:{field:'sz',trait:'EncodingSize',type:'quantitative'},
    detail:{field:'dt',trait:'EncodingDetail',type:'quantitative'} };
  const spec = mkspec(rows, enc);
  console.log('\n=== CASE C joint WEAK fall (rho gate) DISCLOSED gray-zone ===');
  report('JOINT sz,dt', rows, r=>`sz${r.sz}dt${r.dt}`);
  report('POOLED', rows, r=>'*');
  console.log('  >>> corr=', analyzeVizSpec(spec).correlation);
}

// ===== CASE D: joint cells vertical (0 x-variance) but a REAL falling series when you step sz within a dt? =====
// Try: finest joint cells each 1 point (continuous ramp), single-axis rises. DISCLOSED residual-2.
{
  const rows = [];
  let sz=1;
  for (let x=0;x<8;x++){ rows.push({x, y: x*2, sz: x, dt: x%2}); } // every (sz) unique -> joint cells 1pt
  const enc = { x:{field:'x',trait:'EncodingX',type:'quantitative'},
    y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},
    size:{field:'sz',trait:'EncodingSize',type:'quantitative'},
    detail:{field:'dt',trait:'EncodingDetail',type:'quantitative'} };
  const spec = mkspec(rows, enc);
  console.log('\n=== CASE D continuous ramp joint=1pt DISCLOSED residual-2 ===');
  console.log('  >>> corr=', analyzeVizSpec(spec).correlation);
}
