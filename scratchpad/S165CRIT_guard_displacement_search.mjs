// S165 pre-lock critic — LENS: monotonicity-and-guard-interaction, VECTOR 2
// The manufactured-vote guard is "admit the S=empty vote only if NO votable finer band". s164 evaluates
// that PER PARTITION GROUP over subsets of groupingFields; the proposal evaluates it ONCE over subsets of
// the LARGER separableFields. A field that is NEW to separableFields can make a finer band votable and
// thereby DISPLACE (drop) an S=empty vote that was carrying the suppression in s164 -> LESS suppression.
// Search: mixed mark ([MarkLine,MarkPoint]) + categorical shape (NEW to separableFields; dropped by s164
// because markSplitsByRetina('mixed')=false) + quantitative size unique per row (=> groupingFields=[sz],
// every {sz} band n=1 => unvotable => s164 ADMITS the S=empty vote).

import { analyzeVizSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

const RHO = 0.5, round3 = (v) => Math.round(v * 1000) / 1000;
function pearson(xs, ys) { const n = xs.length; if (n < 3) return null;
  const mx = xs.reduce((s,v)=>s+v,0)/n, my = ys.reduce((s,v)=>s+v,0)/n; let num=0,dx=0,dy=0;
  for (let i=0;i<n;i++){num+=(xs[i]-mx)*(ys[i]-my);dx+=(xs[i]-mx)**2;dy+=(ys[i]-my)**2;}
  const den=Math.sqrt(dx*dy); return den===0?null:round3(num/den); }
const signOf = (r) => (r>0?1:r<0?-1:0);
const keyFor = (row, f) => f.map((k)=>String(row[k])).join('\0');
const avg = (v) => v.reduce((s,x)=>s+Number(x),0)/v.length;
function classifyDrawn(xs, ys) { const n=xs.length; if(n<2) return 'unknown';
  const mx=xs.reduce((s,v)=>s+v,0)/n; let dx=0; for(const x of xs)dx+=(x-mx)**2; if(dx===0)return 'unknown';
  if(n===2){const my=(ys[0]+ys[1])/2; return signOf((xs[0]-mx)*(ys[0]-my)+(xs[1]-mx)*(ys[1]-my));}
  const r=pearson(xs,ys); if(r===null)return 0; return Math.abs(r)>=RHO?signOf(r):0; }
function sub(rows, keyFields) { // declaredAggregate = 'average'
  const cells=new Map();
  for(const row of rows){const k=keyFor(row,['x',...keyFields]); if(!cells.has(k))cells.set(k,{sub:keyFor(row,keyFields),dim:row.x,vals:[]}); cells.get(k).vals.push(row.y);}
  const bySub=new Map();
  for(const c of cells.values()){ if(!bySub.has(c.sub))bySub.set(c.sub,{xs:[],ys:[]}); bySub.get(c.sub).xs.push(Number(c.dim)); bySub.get(c.sub).ys.push(avg(c.vals)); }
  return [...bySub.values()]; }
const subsetsOf = (items) => items.reduce((a,i)=>a.concat(a.map((s)=>[...s,i])),[[]]);
function gate(rows, fields, pooled) {
  const ps=signOf(pooled); const votes=[]; let anyVotable=false, shares=false, hasFine=false, emptyVote=null;
  if(!fields.length) return {suppresses:false, why:'no-op', votes, shares};
  const record=(d)=>{if(d==='unknown')return; anyVotable=true; if(d!==0)votes.push(d); if(d!==0&&d===ps)shares=true;};
  for(const S of subsetsOf(fields)) for(const s of sub(rows,S)){
    if(new Set(s.xs).size<2) continue; const d=classifyDrawn(s.xs,s.ys); if(d==='unknown')continue;
    if(S.length===0){emptyVote=d;continue;} hasFine=true; record(d); }
  if(!hasFine&&emptyVote!==null) record(emptyVote);
  if(!anyVotable) return {suppresses:false, why:'fallback', votes, shares, emptyVote, hasFine};
  if(new Set(votes).size>1) return {suppresses:true, why:'(a)', votes, shares, emptyVote, hasFine};
  if(votes.some(v=>v===-ps)) return {suppresses:true, why:'(b)', votes, shares, emptyVote, hasFine};
  const s=ps!==0&&!shares; return {suppresses:s, why:s?'(c)':'none', votes, shares, emptyVote, hasFine};
}
function specOf(rows) {
  const enc={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},
    shape:{field:'sh',trait:'EncodingShape'}, size:{field:'sz',trait:'EncodingSize',type:'quantitative'}};
  return {$schema:'https://oods.dev/viz-spec/v1',id:'v2',name:'v2',data:{name:'d',values:rows},
    marks:[{trait:'MarkLine',encodings:enc},{trait:'MarkPoint',encodings:enc}],encoding:enc,a11y:{description:'y over x'}};
}

// ---- randomized search ----
let found = null, tried = 0;
const rnd = (n) => Math.floor(Math.random() * n);
for (let iter = 0; iter < 400000 && !found; iter++) {
  const nrows = 5 + rnd(3);
  const rows = [];
  for (let i = 0; i < nrows; i++) rows.push({ x: 1 + rnd(4), y: rnd(12) * 10, sh: ['p','q'][rnd(2)], sz: i + 1 });
  tried++;
  // pooled = pearson over cells keyed (x, sz) => sz unique => raw rows
  const pooled = pearson(rows.map(r=>r.x), rows.map(r=>r.y));
  if (pooled === null || Math.abs(pooled) < 0.4) continue;                 // a REAL narrated coefficient
  if (!sub(rows, ['sh']).some((s) => new Set(s.xs).size >= 3)) continue;   // a real n>=3 shape band
  const s164 = gate(rows, ['sz'], pooled);                 // groupingFields = [sz] (shape dropped: mixed mark)
  const s165 = gate(rows, ['sh','sz'], pooled);            // separableFields = [sh, sz]
  if (!s164.suppresses || s165.suppresses) continue;
  if (s164.hasFine) continue;                              // require the s164 suppressor to be the ADMITTED S=empty vote
  // G0: partitionFields=[] -> one group, re-projected over [sz] = raw rows -> dir == sign(pooled) -> narrates
  const live = analyzeVizSpec(specOf(rows)).correlation;
  if (live !== undefined) continue;                        // dist must actually SUPPRESS
  found = { rows, pooled, s164, s165, live };
}
if (!found) { console.log('no vector-2 instance found in', tried, 'tries'); process.exit(0); }
const { rows, pooled, s164, s165, live } = found;
console.log('################ VECTOR 2: guard DISPLACEMENT (mixed mark + shape) ################');
console.log('rows:', JSON.stringify(rows));
console.log('pooled over drawn cells r =', pooled);
console.log('\ns164 (groupingFields=[sz], shape dropped by markSplitsByRetina("mixed")):');
console.log('  votable finer band? ', s164.hasFine, ' S=EMPTY vote =', s164.emptyVote, ' votes =', JSON.stringify(s164.votes));
console.log('  => ', s164.suppresses ? 'SUPPRESSES' : 'allows', s164.why);
console.log('  dist analyzeVizSpec.correlation =', live, '(ground truth)');
console.log('\ns165 PROPOSAL (separableFields=[sh,sz], no partition prefix):');
console.log('  votable finer band? ', s165.hasFine, ' S=EMPTY vote =', s165.emptyVote, '(DROPPED)', ' votes =', JSON.stringify(s165.votes));
console.log('  => ', s165.suppresses ? 'SUPPRESSES' : 'ALLOWS -> NARRATES ' + pooled, s165.why);
console.log('\nshape bands:');
for (const s of sub(rows, ['sh'])) console.log('   xs=', JSON.stringify(s.xs), 'ys=', JSON.stringify(s.ys), '-> dir', classifyDrawn(s.xs, s.ys), 'r=', pearson(s.xs, s.ys));
console.log('whole-chart per-x mean (the S=EMPTY series s164 admitted):');
for (const s of sub(rows, [])) console.log('   xs=', JSON.stringify(s.xs), 'ys=', JSON.stringify(s.ys), '-> dir', classifyDrawn(s.xs, s.ys));
console.log('\nVERDICT: s164 = SUPPRESSED (undefined), s165 proposal = NARRATES', pooled, '=> NON-MONOTONE (vector 2)');
