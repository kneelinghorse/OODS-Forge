// RE-CRITIC lens=earlyreturn. Hand-simulate v2 §10 G1 + the τ floor over the DEFECT-5 fixture
// (size-only Simpson, partition=[], grouping={sz}). v2 says this MUST go undefined (§2 m1 RED-first).
// §10: a sub-series OPPOSES iff sign(slope)===-pooledSign AND |Δ_subseries| >= τ·range(POOLED cell values).
// τ proposed ≈0.10 of pooled range (§10 line 86). Let's compute whether ANY band clears the floor.

function pearson(pairs){const n=pairs.length;if(n<2)return null;const mx=pairs.reduce((s,p)=>s+p[0],0)/n,my=pairs.reduce((s,p)=>s+p[1],0)/n;let num=0,dx=0,dy=0;for(const[x,y]of pairs){num+=(x-mx)*(y-my);dx+=(x-mx)**2;dy+=(y-my)**2;}const den=Math.sqrt(dx*dy);return den===0?null:num/den;}
// fitted change across the band = slope * (xmax - xmin) (well-defined; §10 "Δ well-defined at n=2")
function fittedDelta(pairs){const n=pairs.length;const mx=pairs.reduce((s,p)=>s+p[0],0)/n,my=pairs.reduce((s,p)=>s+p[1],0)/n;let cov=0,dx=0;for(const[x,y]of pairs){cov+=(x-mx)*(y-my);dx+=(x-mx)**2;}const slope=dx===0?0:cov/dx;const xs=pairs.map(p=>p[0]);return slope*(Math.max(...xs)-Math.min(...xs));}

function run(label, rows, tau){
  const pooled = pearson(rows.map(r=>[r.x,r.y]));
  const pooledSign = Math.sign(Math.round(pooled*1000)/1000);
  const ys = rows.map(r=>r.y);
  const pooledRange = Math.max(...ys)-Math.min(...ys);
  const floor = tau*pooledRange;
  const bands = [...new Set(rows.map(r=>r.sz))];
  console.log(`\n=== ${label} (τ=${tau}) ===`);
  console.log(`pooled=${pooled.toFixed(3)} sign=${pooledSign}  pooledRange(y)=${pooledRange}  floor=τ·range=${floor.toFixed(2)}`);
  let anyOpposes=false;
  for(const sz of bands){
    const sub=rows.filter(r=>r.sz===sz).map(r=>[r.x,r.y]);
    const d=fittedDelta(sub); const r=pearson(sub);
    const slopeSign=Math.sign(r??0);
    const opposesDir = slopeSign===-pooledSign;
    const clearsFloor = Math.abs(d)>=floor;
    const opposes = opposesDir && clearsFloor;
    anyOpposes = anyOpposes || opposes;
    console.log(`  band sz=${sz}: pearson=${r.toFixed(3)} |Δ_fitted|=${Math.abs(d).toFixed(2)}  dir-opposes=${opposesDir} clears-τ-floor=${clearsFloor} => OPPOSES=${opposes}`);
  }
  console.log(`  G1 result: ${anyOpposes ? 'SUPPRESS (undefined)' : 'NARRATE (pooled '+pooled.toFixed(3)+') <-- PHANTOM if bands truly fall'}`);
}

// DEFECT 5 exact fixture from S164CRIT_claimscope.mjs
const d5=[]; const add5=(x,y,sz)=>d5.push({x,y,sz});
add5(1,50,10);add5(2,40,10);add5(3,30,10);
add5(4,250,20);add5(5,240,20);add5(6,230,20);
add5(7,450,30);add5(8,440,30);add5(9,430,30);
run('DEFECT-5 (memo says MUST suppress)', d5, 0.10);
run('DEFECT-5 with a τ low enough to catch it', d5, 0.04);

// STRENGTHENED Simpson: SAME within-band Δ=20, but bands pushed far apart -> pooled range explodes.
// Defeats ANY fixed τ>0.005. Within-band series still FALL (real opposite a viewer sees).
const s=[]; const adds=(x,y,sz)=>s.push({x,y,sz});
adds(1,50,10);adds(2,40,10);adds(3,30,10);
adds(4,2050,20);adds(5,2040,20);adds(6,2030,20);
adds(7,4050,30);adds(8,4040,30);adds(9,4030,30);
run('STRENGTHENED Simpson (bands far apart)', s, 0.10);
run('STRENGTHENED Simpson at the τ that BARELY caught defect-5', s, 0.04);
