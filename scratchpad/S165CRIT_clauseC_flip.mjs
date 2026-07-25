// S165 CRITIC — is the clause-(c) monotonicity violation degenerate (constant color) or general?
import { analyzeVizSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
const RHO=0.5,sg=r=>r>0?1:r<0?-1:0;
function pr(xs,ys){const n=xs.length;if(n<3)return null;const mx=xs.reduce((s,v)=>s+v,0)/n,my=ys.reduce((s,v)=>s+v,0)/n;let nu=0,dx=0,dy=0;for(let i=0;i<n;i++){nu+=(xs[i]-mx)*(ys[i]-my);dx+=(xs[i]-mx)**2;dy+=(ys[i]-my)**2;}const d=Math.sqrt(dx*dy);return d===0?null:Math.round(nu/d*1000)/1000;}
function clsG(xs,ys){const n=xs.length;if(n<2)return'unknown';const mx=xs.reduce((s,x)=>s+x,0)/n;let d=0;for(const x of xs)d+=(x-mx)**2;if(d===0)return'unknown';
 if(n===2){const my=(ys[0]+ys[1])/2;let c=0;for(let i=0;i<2;i++)c+=(xs[i]-mx)*(ys[i]-my);return sg(c);}
 const r=pr(xs,ys);if(r===null)return 0;return Math.abs(r)>=RHO?sg(r):0;}
const kf=(r,f)=>f.map(k=>String(r[k])).join('\0');
const redA=(v,a)=>{const n=v.map(Number).filter(Number.isFinite);if(!n.length)return undefined;return a==='average'?n.reduce((x,y)=>x+y,0)/n.length:n.reduce((x,y)=>x+y,0);};
const subs=i=>{const o=[[]];for(const t of i){const l=o.length;for(let k=0;k<l;k++)o.push([...o[k],t]);}return o;};
function ser(rows,dim,meas,f,agg){const m=new Map();const push=(s,x,y)=>{let e=m.get(s);if(!e){e={xs:[],ys:[]};m.set(s,e);}e.xs.push(x);e.ys.push(y);};
 const c=new Map();for(const r of rows){const k=kf(r,[dim,...f]);let e=c.get(k);if(!e){e={sub:kf(r,f),dim:r[dim],v:[]};c.set(k,e);}e.v.push(r[meas]);}
 for(const e of c.values()){const v=redA(e.v,agg),x=Number(e.dim);if(v===undefined||!Number.isFinite(x))continue;push(e.sub,x,v);}
 return [...m.entries()].map(([k,v])=>({key:k.replace(/\0/g,'|'),...v}));}
function g1p(rows,sep,agg,pooled){const ps=sg(pooled),votes=[];let any=false,shares=false,fine=false,ev=null;const tr=[];
 const rec=d=>{if(d==='unknown')return;any=true;if(d!==0)votes.push(d);if(d!==0&&d===ps)shares=true;};
 for(const S of subs(sep))for(const se of ser(rows,'x','y',S,agg)){if(new Set(se.xs).size<2)continue;const d=clsG(se.xs,se.ys);if(d==='unknown')continue;
  if(!S.length){ev=d;continue;}fine=true;rec(d);tr.push(`S={${S}} "${se.key}" pts=${se.xs.map((x,i)=>`(${x},${se.ys[i]})`).join('')} ${se.xs.length>=3?'r='+pr(se.xs,se.ys):'n=2'} VOTE=${d}`);}
 if(!fine&&ev!==null)rec(ev);
 let s;if(!any)s=false;else if(new Set(votes).size>1)s=true;else if(votes.some(v=>v===-ps))s=true;else s=ps!==0&&!shares;
 return{s,tr};}
const mk=rows=>{const e={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},
 color:{field:'seg',trait:'EncodingColor'},size:{field:'sz',trait:'EncodingSize',type:'quantitative'}};
 return{$schema:'https://oods.dev/viz-spec/v1',id:'z',name:'z',data:{name:'d',values:rows},marks:[{trait:'MarkPoint',encodings:e}],encoding:e,a11y:{description:'y over x'}};};

// NON-degenerate: TWO real segments, each drawn as two FLAT bands at disjoint x. Nothing trends.
const rows=[
 {x:1,y:10,seg:'A',sz:10},{x:2,y:10,seg:'A',sz:10},{x:3,y:100,seg:'A',sz:20},{x:4,y:100,seg:'A',sz:20},
 {x:1,y:20,seg:'B',sz:10},{x:2,y:20,seg:'B',sz:10},{x:3,y:200,seg:'B',sz:20},{x:4,y:200,seg:'B',sz:20},
];
const cur=analyzeVizSpec(mk(rows)).correlation;
console.log('NON-DEGENERATE disjoint-x all-flat offset (2 real segments, 4 flat drawn bands):');
console.log('  every drawn band is EXACTLY FLAT (y constant within band); only the between-band offset trends.');
console.log('  CURRENT dist correlation =',cur,'(SUPPRESSED — this is the s164 clause-(c) behaviour)');
const cells=[];{const c=new Map(),ord=[];for(const r of rows){const k=kf(r,['x','seg','sz']);if(!c.has(k)){c.set(k,{d:r.x,v:[]});ord.push(k);}c.get(k).v.push(r.y);}
 for(const k of ord)cells.push({x:c.get(k).d,y:redA(c.get(k).v,'average')});}
const pooled=pr(cells.map(r=>r.x),cells.map(r=>r.y));
console.log('  pooled over drawn cells =',pooled);
const g=g1p(rows,['seg','sz'],'average',pooled);
for(const t of g.tr)console.log('    '+t);
console.log('  DRAFT G1\' =',g.s?'suppress':'NARRATE');
console.log('  ==> DRAFT would narrate',pooled,'over a chart with FOUR EXACTLY-FLAT drawn bands.');
