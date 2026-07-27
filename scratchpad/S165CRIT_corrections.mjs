// S165 CRITIC — verify the two proposed corrections.
// C1 (for D1): sharesPooled must read the UNGATED sign; the rho floor gates OPPOSITION only.
// C2 (for D2): keep the partition prefix, but RELAX a partition field that is COLLINEAR with x
//              (its groups have <2 distinct x anywhere) instead of dropping the prefix wholesale.
import { analyzeVizSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
const RHO=0.5,sg=r=>r>0?1:r<0?-1:0;
function pr(xs,ys){const n=xs.length;if(n<3)return null;const mx=xs.reduce((s,v)=>s+v,0)/n,my=ys.reduce((s,v)=>s+v,0)/n;let nu=0,dx=0,dy=0;for(let i=0;i<n;i++){nu+=(xs[i]-mx)*(ys[i]-my);dx+=(xs[i]-mx)**2;dy+=(ys[i]-my)**2;}const d=Math.sqrt(dx*dy);return d===0?null:Math.round(nu/d*1000)/1000;}
function raw(xs,ys){const n=xs.length;if(n<2)return'unknown';const mx=xs.reduce((s,x)=>s+x,0)/n;let d=0;for(const x of xs)d+=(x-mx)**2;if(d===0)return'unknown';
 if(n===2){const my=(ys[0]+ys[1])/2;let c=0;for(let i=0;i<2;i++)c+=(xs[i]-mx)*(ys[i]-my);return{gated:sg(c),ungated:sg(c)};}
 const r=pr(xs,ys);if(r===null)return{gated:0,ungated:0};return{gated:Math.abs(r)>=RHO?sg(r):0,ungated:sg(r)};}
const kf=(r,f)=>f.map(k=>String(r[k])).join('\0');
const redA=(v,a)=>{const n=v.map(Number).filter(Number.isFinite);if(!n.length)return undefined;return a==='sum'?n.reduce((x,y)=>x+y,0):a==='average'?n.reduce((x,y)=>x+y,0)/n.length:undefined;};
const subs=i=>{const o=[[]];for(const t of i){const l=o.length;for(let k=0;k<l;k++)o.push([...o[k],t]);}return o;};
function ser(rows,dim,meas,f,agg){const m=new Map();const push=(s,x,y)=>{let e=m.get(s);if(!e){e={xs:[],ys:[]};m.set(s,e);}e.xs.push(x);e.ys.push(y);};
 if(agg){const c=new Map();for(const r of rows){const k=kf(r,[dim,...f]);let e=c.get(k);if(!e){e={sub:kf(r,f),dim:r[dim],v:[]};c.set(k,e);}e.v.push(r[meas]);}
  for(const e of c.values()){const v=redA(e.v,agg),x=Number(e.dim);if(v===undefined||!Number.isFinite(x))continue;push(e.sub,x,v);} }
 else for(const r of rows){const x=Number(r[dim]),y=Number(r[meas]);if(Number.isFinite(x)&&Number.isFinite(y))push(kf(r,f),x,y);}
 return [...m.values()];}
// scan with an explicit PREFIX set P (may be empty) + subsets of G
function scan(rows,dim,meas,P,G,agg,pooled,C1){
 const ps=sg(pooled),votes=[];let any=false,shares=false;
 const groups=new Map();for(const r of rows){const k=P.length?kf(r,P):'*';(groups.get(k)??groups.set(k,[]).get(k)).push(r);}
 const rec=(o)=>{if(o==='unknown')return;any=true;if(o.gated!==0)votes.push(o.gated);
   const shareSign=C1?o.ungated:o.gated; if(shareSign!==0&&shareSign===ps)shares=true;};
 for(const gr of groups.values()){let fine=false,ev=null;
  for(const S of subs(G))for(const se of ser(gr,dim,meas,S,agg)){if(new Set(se.xs).size<2)continue;const o=raw(se.xs,se.ys);if(o==='unknown')continue;
   if(!S.length){ev=o;continue;}fine=true;rec(o);}
  if(!fine&&ev!==null)rec(ev);}
 let s,why;if(!any){s=false;why='fallback narrate';}else if(new Set(votes).size>1){s=true;why='(a) both signs';}
 else if(votes.some(v=>v===-ps)){s=true;why='(b) real opposite';}else{s=ps!==0&&!shares;why=s?'(c) nothing shares pooledSign':'narrate';}
 return{s,why,anyVotable:any};}
const mk=(rows,o={})=>{const e={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative',...(o.agg?{aggregate:o.agg}:{})}};
 if(o.color)e.color={field:o.color,trait:'EncodingColor',...(o.cq?{type:'quantitative'}:{})};if(o.size)e.size={field:o.size,trait:'EncodingSize',type:'quantitative'};
 return{$schema:'https://oods.dev/viz-spec/v1',id:'x',name:'x',data:{name:'d',values:rows},marks:[{trait:o.mark??'MarkPoint',encodings:e}],encoding:e,a11y:{description:'y over x'}};};

console.log('── C1: sharesPooled reads the UNGATED sign (rho gates OPPOSITION only) ──');
// s164:271 keep-control
{const rows=[];const g=(seg,b)=>rows.push({x:1,y:b,seg},{x:2,y:b+3,seg},{x:3,y:b-1,seg},{x:4,y:b+4,seg});g('R',0);g('S',100);g('T',200);
 const cur=analyzeVizSpec(mk(rows,{color:'seg'})).correlation;
 console.log('  s164:271 weak-consistent   draft:',scan(rows,'x','y',[],['seg'],undefined,cur,false).s?'RED':'GREEN',
             ' | with C1:',scan(rows,'x','y',[],['seg'],undefined,cur,true).s?'RED':'GREEN');}
// s164 disjoint-flat (clause (c)'s reason for existing) MUST STAY SUPPRESSED
{const rows=[{x:1,y:10,seg:'A',sz:10},{x:2,y:10,seg:'A',sz:10},{x:3,y:100,seg:'A',sz:20},{x:4,y:100,seg:'A',sz:20}];
 const cur=1; // pooled rises
 console.log('  s164 disjoint-flat offset  draft:',scan(rows,'x','y',[],['seg','sz'],'average',cur,false).s?'SUPPRESSED (good)':'NARRATES (BAD)',
             ' | with C1:',scan(rows,'x','y',[],['seg','sz'],'average',cur,true).s?'SUPPRESSED (good)':'NARRATES (BAD)');}
// survivor B (quant color ramp on stacked bar) must STILL be killed
{const rows=[{x:1,y:50,c:100},{x:2,y:40,c:100},{x:3,y:30,c:100},{x:1,y:10,c:200},{x:2,y:60,c:200},{x:3,y:110,c:200}];
 console.log('  survivor B (stack+ramp)    draft:',scan(rows,'x','y',[],['c'],'sum',1,false).s?'KILLED':'SURVIVES',
             ' | with C1:',scan(rows,'x','y',[],['c'],'sum',1,true).s?'KILLED':'SURVIVES');}

console.log('\n── C2: keep the partition prefix; RELAX only a partition field COLLINEAR with x ──');
function collinearRelaxed(rows,dim,P){ // drop P fields whose groups all have <2 distinct x
 return P.filter(f=>{const g=new Map();for(const r of rows){const k=String(r[f]);(g.get(k)??g.set(k,new Set()).get(k)).add(String(r[dim]));}
  return [...g.values()].some(s=>s.size>=2);});}
// survivor C
{const rows=[{x:1,y:10,seg:'p',sz:1},{x:2,y:8,seg:'q',sz:1},{x:3,y:6,seg:'r',sz:1},{x:1,y:20,seg:'p',sz:2},{x:2,y:30,seg:'q',sz:2},{x:3,y:40,seg:'r',sz:2}];
 const cur=analyzeVizSpec(mk(rows,{color:'seg',size:'sz',agg:'average'})).correlation;
 const P=collinearRelaxed(rows,'x',['seg']);
 console.log('  survivor C  current corr =',cur,' relaxed prefix P =',JSON.stringify(P));
 console.log('    C2 verdict:',scan(rows,'x','y',P,['sz'],'average',cur,true).s?'*** KILLED (undefined) ***':'SURVIVES');}
// honest bubble (D2 instance 2) must STAY narrating
{const rows=[{x:1,y:10,seg:'North',sz:1},{x:2,y:20,seg:'North',sz:2},{x:3,y:30,seg:'North',sz:3},
             {x:1,y:300,seg:'South',sz:3},{x:2,y:310,seg:'South',sz:2},{x:3,y:320,seg:'South',sz:1}];
 const cur=analyzeVizSpec(mk(rows,{color:'seg',size:'sz',agg:'average'})).correlation;
 const P=collinearRelaxed(rows,'x',['seg']);
 console.log('  honest bubble  current corr =',cur,' relaxed prefix P =',JSON.stringify(P));
 console.log('    draft (no prefix):',scan(rows,'x','y',[],['seg','sz'],'average',cur,true).s?'*** SILENCED ***':'narrates');
 console.log('    C2  (prefix kept):',scan(rows,'x','y',P,['sz'],'average',cur,true).s?'*** SILENCED ***':'narrates (GOOD)');}
