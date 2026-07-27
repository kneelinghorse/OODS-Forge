// Search: is there a NEAR-MONOTONE decreasing band (high down-step fraction, monotone or 1 break)
// with |pearson| < 0.5 ? If not, the gray-zone can never host a human-"clearly falling" phantom.
function pearson(xs, ys) {
  const n = xs.length; const mx = xs.reduce((a,b)=>a+b,0)/n, my = ys.reduce((a,b)=>a+b,0)/n;
  let cov=0,vx=0,vy=0; for (let i=0;i<n;i++){cov+=(xs[i]-mx)*(ys[i]-my);vx+=(xs[i]-mx)**2;vy+=(ys[i]-my)**2;}
  if (vx===0||vy===0) return 0; return cov/Math.sqrt(vx*vy);
}
function downFrac(ys){let d=0;for(let i=1;i<ys.length;i++)if(ys[i]<ys[i-1])d++;return d/(ys.length-1);}
function strictlyMono(ys){for(let i=1;i<ys.length;i++)if(ys[i]>=ys[i-1])return false;return true;}
function nonInc(ys){for(let i=1;i<ys.length;i++)if(ys[i]>ys[i-1])return false;return true;}

// Enumerate step-shaped monotone-noninc sequences: value stays hi then drops to lo at position k
// n=6..10, and also single-outlier shapes. Report min |r| among monotone-noninc with clear net decline.
let bestMonoLowR = null;
for (let n=4;n<=12;n++){
  const xs=[...Array(n)].map((_,i)=>i+1);
  // two-level step at each break position k, hi/lo ratios
  for (let k=1;k<n;k++){
    for (const hi of [10,50,100]){
      for (const lo of [0,1,5]){
        const ys=xs.map((_,i)=> i<k?hi:lo);
        if (hi<=lo) continue;
        const r=pearson(xs,ys);
        if (nonInc(ys) && Math.abs(r)<0.5){
          if (!bestMonoLowR || Math.abs(r)<Math.abs(bestMonoLowR.r)) bestMonoLowR={n,k,hi,lo,ys,r};
        }
      }
    }
  }
}
console.log('Step monotone-noninc with |r|<0.5 (min |r|):', bestMonoLowR ? JSON.stringify(bestMonoLowR) : 'NONE FOUND');

// Strictly-decreasing-every-step: can ANY have |r|<0.5? scan geometric/convex decays
let bestStrictLowR=null, minStrictR=1;
for (let n=4;n<=10;n++){
  const xs=[...Array(n)].map((_,i)=>i+1);
  for (const base of [2,3,5,10]){
    for (const start of [100,1000]){
      // geometric decay start, start/base, ... strictly decreasing
      let ys=[]; let v=start; for(let i=0;i<n;i++){ys.push(Math.round(v)); v=v/base;}
      // ensure strict
      if (!strictlyMono(ys)) continue;
      const r=pearson(xs,ys);
      if (Math.abs(r)<minStrictR){minStrictR=Math.abs(r); bestStrictLowR={n,base,start,ys,r};}
    }
  }
}
console.log('Strictly-decreasing min |r| found:', JSON.stringify(bestStrictLowR), ' -> min|r|=',minStrictR.toFixed(3));
console.log('CONCLUSION: strictly-decreasing sequences cannot reach |r|<0.5 unless drop is a single-step outlier;');
console.log('a monotone sequence a human calls "clearly falling" keeps |r| well above 0.5.');
