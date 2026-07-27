// S164 v3 FINAL-CRITIC lens n2_vote.
// Two hunts:
//  (H1) NESTED SIMPSON: does §10's "coarsest S where it reaches n>=2" (backoff/finest-resolvable)
//       reading MISS a real opposing COARSE band whose finer slices all agree pooled? -> PHANTOM.
//       Compare vs the parenthetical "collect EVERY n>=2 sub-series across ALL subsets S".
//  (H2) confirm n=2-always-votes closes defect-2 + an n=2 STRONG-SEPARATION Simpson.
// SUT does NOT implement §10; I hand-simulate both readings over the DRAWN cells with pearson.
import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels }
  from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(pairs){const n=pairs.length;if(n<2)return null;const mx=pairs.reduce((s,p)=>s+p[0],0)/n,my=pairs.reduce((s,p)=>s+p[1],0)/n;let num=0,dx=0,dy=0;for(const[x,y]of pairs){num+=(x-mx)*(y-my);dx+=(x-mx)**2;dy+=(y-my)**2;}const den=Math.sqrt(dx*dy);return den===0?null:num/den;}
const r3=r=>r===null?null:Math.round(r*1000)/1000;
const sgn=r=>r>0?1:r<0?-1:0;
function n2sign(p){const mx=(p[0][0]+p[1][0])/2,my=(p[0][1]+p[1][1])/2;let c=0;for(const[x,y]of p)c+=(x-mx)*(y-my);return sgn(c);}
// direction vote per §10: n=2 -> slope sign (always); n>=3 -> sign(round3(r)) if |r|>=rho else 0(FLAT)
function vote(pairs, rho){const n=pairs.length;if(n<2)return 'unk';const xs=pairs.map(p=>p[0]);const mx=xs.reduce((s,x)=>s+x,0)/n;let dx=0;for(const x of xs)dx+=(x-mx)**2;if(dx===0)return 'unk';if(n===2)return n2sign(pairs);const r=r3(pearson(pairs));if(r===null)return 0;return Math.abs(r)>=rho?sgn(r):0;}

// powerset
function subsets(arr){const out=[[]];for(const a of arr){const len=out.length;for(let i=0;i<len;i++)out.push([...out[i],a]);}return out;}

// Decide narrate/suppress under a given SET of sub-series direction votes vs pooled.
function decide(votes, pooledSign){
  const E=votes.filter(v=>v!=='unk' && v!==0); // non-flat
  const flats=votes.filter(v=>v===0).length;
  if(votes.filter(v=>v!=='unk').length===0) return 'FALLBACK->narrate';
  if(new Set(E).size>1) return 'SUPPRESS(disagree)';
  if(E.some(e=>e===-pooledSign)) return 'SUPPRESS(real-opposite)';
  // all flat but pooled != 0 -> §10 clause
  if(E.length===0 && flats>0 && pooledSign!==0) return 'SUPPRESS(all-flat pooled!=0)';
  return 'narrate';
}

// Build drawn cells (avg per (x, ...groupingVals, ...partitionVals)) — here rows ARE the cells (1 per key).
function runCase(label, rows, partitionFields, groupingFields, rho){
  console.log(`\n===== ${label} =====`);
  const pooled=r3(pearson(rows.map(r=>[r.x,r.y])));
  const ps=sgn(pooled);
  console.log(`  pooled r=${pooled} sign=${ps}`);
  const partVals = partitionFields.length? [...new Set(rows.map(r=>partitionFields.map(f=>r[f]).join('|')))] : ['*'];
  // READING A: "coarsest S where finest series reach n>=2" == start finest, back off minimally.
  //   Implemented as: finest key = P ∪ all grouping. For each finest series n>=2 vote; those that shred (n<2)
  //   back off by dropping grouping fields one at a time (finest-resolvable). Vote the resolved series ONCE.
  // READING B: "collect EVERY n>=2 sub-series across ALL subsets S". Union of all granularities.
  const votesA=[]; const votesB=[]; const seenA=new Set();
  for(const pv of partVals){
    const pr = partitionFields.length? rows.filter(r=>partitionFields.map(f=>r[f]).join('|')===pv):rows;
    // READING B: every subset
    for(const S of subsets(groupingFields)){
      const keys=[...new Set(pr.map(r=>S.map(f=>r[f]).join('|')))];
      for(const k of keys){
        const pairs=pr.filter(r=>S.map(f=>r[f]).join('|')===k).map(r=>[r.x,r.y]);
        const dx=new Set(pairs.map(p=>p[0])).size;
        if(dx>=2) votesB.push(vote(pairs,rho));
      }
    }
    // READING A: finest-resolvable backoff. Enumerate finest series; if shred, drop fields until n>=2.
    const order=[...groupingFields];
    const finestKeys=[...new Set(pr.map(r=>order.map(f=>r[f]).join('|')))];
    for(const fk of finestKeys){
      let S=[...order];
      let pairs=pr.filter(r=>order.map(f=>r[f]).join('|')===fk).map(r=>[r.x,r.y]);
      // if shred, back off (drop last grouping field) until n>=2 distinct x
      while(new Set(pairs.map(p=>p[0])).size<2 && S.length>0){
        S=S.slice(0,-1);
        const kv=S.map(f=>pr.find(r=>order.map(g=>r[g]).join('|')===fk)[f]).join('|');
        pairs=pr.filter(r=>S.map(f=>r[f]).join('|')===kv).map(r=>[r.x,r.y]);
      }
      const sig=S.join(',')+'::'+S.map(f=>pr.find(r=>order.map(g=>r[g]).join('|')===fk)[f]).join('|');
      if(new Set(pairs.map(p=>p[0])).size>=2 && !seenA.has(pv+sig)){ seenA.add(pv+sig); votesA.push(vote(pairs,rho)); }
    }
  }
  console.log(`  READING A (coarsest/backoff finest-resolvable) votes=${JSON.stringify(votesA)} -> ${decide(votesA,ps)}`);
  console.log(`  READING B (collect EVERY n>=2, all subsets)      votes=${JSON.stringify(votesB)} -> ${decide(votesB,ps)}`);
}

const RHO=0.5;

// ---- H1: NESTED SIMPSON. grouping = {sz, det}. size=10 band FALLS overall (n=6, |r| high),
// but each detail slice within it is n=2 and RISES. size=20 band rises. pooled +.
// Reading A (finest-resolvable): finest (sz,det) all n=2 rising -> never sees the falling sz=10 cloud -> NARRATE (PHANTOM).
// Reading B: subset S={sz} evaluates sz=10 n=6 -> FALLS -> SUPPRESS.
const nested=[];
// sz=10: three detail pairs, each rises +5, offset DOWN as x grows -> cloud falls
nested.push({x:1,y:100,sz:10,det:1},{x:2,y:105,sz:10,det:1});
nested.push({x:3,y:60, sz:10,det:2},{x:4,y:65, sz:10,det:2});
nested.push({x:5,y:20, sz:10,det:3},{x:6,y:25, sz:10,det:3});
// sz=20: rises cleanly, pulls pooled +
nested.push({x:1,y:200,sz:20,det:4},{x:2,y:260,sz:20,det:4});
nested.push({x:3,y:320,sz:20,det:5},{x:4,y:380,sz:20,det:5});
nested.push({x:5,y:440,sz:20,det:6},{x:6,y:500,sz:20,det:6});
console.log('sz=10 cloud pearson:', r3(pearson(nested.filter(r=>r.sz===10).map(r=>[r.x,r.y]))), '(FALLS = real opposite)');
console.log('each sz=10 detail pair:', nested.filter(r=>r.sz===10&&r.det===1).map(r=>[r.x,r.y]),'rises etc.');
runCase('H1_nested_simpson (partition=[], grouping={sz,det})', nested, [], ['sz','det'], RHO);

// ---- H2a: defect-2 (n=2 detail bands). partition={seg}, grouping={d}.
const d2=[];
for(const seg of ['A','B']){ d2.push({x:1,y:10,seg,d:1},{x:2,y:9,seg,d:1},{x:3,y:100,seg,d:2},{x:4,y:99,seg,d:2}); }
runCase('H2a_defect2 (partition={seg}, grouping={d})', d2, ['seg'], ['d'], RHO);

// ---- H2b: n=2 STRONG-SEPARATION Simpson. Two n=2 bands far apart, each slopes down; pooled rises.
const sep=[];
sep.push({x:1,y:100,sz:10},{x:2,y:90,sz:10});     // band lo falls
sep.push({x:3,y:1000,sz:20},{x:4,y:990,sz:20});   // band hi falls, far above -> pooled rises
console.log('\nH2b bands: lo',[[1,100],[2,90]],'hi',[[3,1000],[4,990]],'pooled rises via separation');
runCase('H2b_n2_strong_separation (partition=[], grouping={sz})', sep, [], ['sz'], RHO);
