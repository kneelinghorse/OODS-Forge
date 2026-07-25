// S165 CRITIC — test the memo §3.2 claim: "the scan is a superset -> MONOTONE: can only add suppression".
// Run every s164 RED-first fixture through the DRAFT reference impl (G0 unchanged + G1').
import { analyzeVizSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
const RHO=0.5,sg=r=>r>0?1:r<0?-1:0;
function pr(xs,ys){const n=xs.length;if(n<3)return null;const mx=xs.reduce((s,v)=>s+v,0)/n,my=ys.reduce((s,v)=>s+v,0)/n;let nu=0,dx=0,dy=0;for(let i=0;i<n;i++){nu+=(xs[i]-mx)*(ys[i]-my);dx+=(xs[i]-mx)**2;dy+=(ys[i]-my)**2;}const d=Math.sqrt(dx*dy);return d===0?null:Math.round(nu/d*1000)/1000;}
function clsG(xs,ys){const n=xs.length;if(n<2)return'unknown';const mx=xs.reduce((s,x)=>s+x,0)/n;let d=0;for(const x of xs)d+=(x-mx)**2;if(d===0)return'unknown';
 if(n===2){const my=(ys[0]+ys[1])/2;let c=0;for(let i=0;i<2;i++)c+=(xs[i]-mx)*(ys[i]-my);return sg(c);}
 const r=pr(xs,ys);if(r===null)return 0;return Math.abs(r)>=RHO?sg(r):0;}
function clsU(xs,ys){const n=xs.length;if(n<2)return'unknown';const mx=xs.reduce((s,x)=>s+x,0)/n;let d=0;for(const x of xs)d+=(x-mx)**2;if(d===0)return'unknown';
 if(n===2){const my=(ys[0]+ys[1])/2;let c=0;for(let i=0;i<2;i++)c+=(xs[i]-mx)*(ys[i]-my);return sg(c);}
 const r=pr(xs,ys);if(r===null)return 0;return sg(r);}
const kf=(r,f)=>f.map(k=>String(r[k])).join('\0');
const redA=(v,a)=>{const n=v.map(Number).filter(Number.isFinite);if(!n.length)return undefined;return a==='sum'?n.reduce((x,y)=>x+y,0):a==='average'?n.reduce((x,y)=>x+y,0)/n.length:undefined;};
const subs=i=>{const o=[[]];for(const t of i){const l=o.length;for(let k=0;k<l;k++)o.push([...o[k],t]);}return o;};
function ser(rows,dim,meas,f,agg){const m=new Map();const push=(s,x,y)=>{let e=m.get(s);if(!e){e={xs:[],ys:[]};m.set(s,e);}e.xs.push(x);e.ys.push(y);};
 if(agg){const c=new Map();for(const r of rows){const k=kf(r,[dim,...f]);let e=c.get(k);if(!e){e={sub:kf(r,f),dim:r[dim],v:[]};c.set(k,e);}e.v.push(r[meas]);}
  for(const e of c.values()){const v=redA(e.v,agg),x=Number(e.dim);if(v===undefined||!Number.isFinite(x))continue;push(e.sub,x,v);} }
 else for(const r of rows){const x=Number(r[dim]),y=Number(r[meas]);if(Number.isFinite(x)&&Number.isFinite(y))push(kf(r,f),x,y);}
 return [...m.values()];}
// G0 (unchanged): partition, project each group over groupingFields, ungated per-group direction
function g0(rows,dim,meas,P,G,agg,pooled){
 const groups=new Map();for(const r of rows){const k=kf(r,P);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(r);}
 const classes=[];
 for(const gr of groups.values()){
  let cells=gr;
  if(agg){const c=new Map();const order=[];for(const r of gr){const k=kf(r,[dim,...G]);if(!c.has(k)){c.set(k,{d:r[dim],v:[]});order.push(k);}c.get(k).v.push(r[meas]);}
   cells=[];for(const k of order){const e=c.get(k);const v=redA(e.v,agg);if(v===undefined)continue;cells.push({[dim]:e.d,[meas]:v});}}
  const xs=[],ys=[];for(const r of cells){const x=Number(r[dim]),y=Number(r[meas]);if(Number.isFinite(x)&&Number.isFinite(y)){xs.push(x);ys.push(y);}}
  classes.push(clsU(xs,ys));}
 const ev=classes.filter(c=>c!=='unknown');
 if(!ev.length)return true;
 if(new Set(ev).size>1)return false;
 const s=ev[0],ps=sg(pooled);
 if(s===0)return ps===0;
 return ps===0||ps===s;}
function g1prime(rows,dim,meas,sep,agg,pooled){
 const ps=sg(pooled),votes=[];let any=false,shares=false,fine=false,ev=null;
 if(!sep.length)return{s:false};
 const rec=d=>{if(d==='unknown')return;any=true;if(d!==0)votes.push(d);if(d!==0&&d===ps)shares=true;};
 const trace=[];
 for(const S of subs(sep))for(const se of ser(rows,dim,meas,S,agg)){if(new Set(se.xs).size<2)continue;const d=clsG(se.xs,se.ys);if(d==='unknown')continue;
  if(!S.length){ev=d;continue;}fine=true;rec(d);trace.push(`S={${S}} n=${se.xs.length} r=${se.xs.length>=3?pr(se.xs,se.ys):'n2'} dir=${d}`);}
 if(!fine&&ev!==null)rec(ev);
 let s;if(!any)s=false;else if(new Set(votes).size>1)s=true;else if(votes.some(v=>v===-ps))s=true;else s=ps!==0&&!shares;
 return{s,trace};}
const B=(f,t,e={})=>({field:f,trait:t,...e});
function chart(rows,o={}){const enc={x:B('x','EncodingX',{type:'quantitative'}),y:B('y','EncodingY',{type:'quantitative',...(o.yAggregate?{aggregate:o.yAggregate}:{})})};
 if(o.colorField)enc.color=B(o.colorField,'EncodingColor');if(o.sizeField)enc.size=B(o.sizeField,'EncodingSize',{type:'quantitative'});
 if(o.detailField)enc.detail=B(o.detailField,'EncodingDetail',{type:'quantitative'});
 return{$schema:'https://oods.dev/viz-spec/v1',id:'c',name:'c',data:{name:'c',values:rows},marks:[{trait:o.mark??'MarkPoint',encodings:{...enc}}],encoding:enc,
  ...(o.facetColumnField?{layout:{trait:'LayoutFacet',columns:{field:o.facetColumnField}}}:{}),a11y:{description:'y over x'}};}
const sepOf=o=>[o.facetColumnField,o.colorField,o.sizeField,o.detailField].filter(Boolean);
const partOf=o=>[o.facetColumnField,o.colorField].filter(Boolean);
const grpOf=o=>[o.sizeField,o.detailField].filter(Boolean);

// ── s164 RED-first fixtures ──
const F=[];
const rowsDefect1=()=>{const r=[],a=(x,y,seg,sz)=>r.push({x,y,seg,sz});
 a(1,50,'A',100);a(2,40,'A',100);a(3,30,'A',100);a(4,250,'A',200);a(5,240,'A',200);a(6,230,'A',200);
 a(1,1050,'B',100);a(2,1040,'B',100);a(3,1030,'B',100);a(4,1250,'B',200);a(5,1240,'B',200);a(6,1230,'B',200);return r;};
F.push(['defect1 color+size',rowsDefect1(),{colorField:'seg',sizeField:'sz',yAggregate:'average'}]);
F.push(['defect2 detail n=2',[...['A','B'].flatMap(seg=>[{x:1,y:10,seg,d:1},{x:2,y:9,seg,d:1},{x:3,y:100,seg,d:2},{x:4,y:99,seg,d:2}])],{colorField:'seg',detailField:'d',yAggregate:'average'}]);
F.push(['defect5 size-only',(()=>{const r=[],a=(x,y,sz)=>r.push({x,y,sz});a(1,50,10);a(2,40,10);a(3,30,10);a(4,250,20);a(5,240,20);a(6,230,20);a(7,450,30);a(8,440,30);a(9,430,30);return r;})(),{sizeField:'sz',yAggregate:'average'}]);
F.push(['defect6 strong-sep',(()=>{const r=[],a=(x,y,sz)=>r.push({x,y,sz});a(1,100,10);a(2,60,10);a(3,20,10);a(4,2000,50);a(5,1960,50);a(6,1920,50);a(7,4000,90);a(8,3960,90);a(9,3920,90);return r;})(),{sizeField:'sz',yAggregate:'average'}]);
F.push(['defect8 CASE6',[{x:1,y:1,seg:'A',sz:10},{x:2,y:2,seg:'A',sz:10},{x:3,y:3,seg:'A',sz:10},{x:1,y:3,seg:'A',sz:20},{x:2,y:2,seg:'A',sz:20},{x:3,y:1,seg:'A',sz:20}],{colorField:'seg',sizeField:'sz',yAggregate:'average'}]);
F.push(['defect9 nested',[{x:1,y:100,sz:10,det:1},{x:2,y:105,sz:10,det:1},{x:3,y:60,sz:10,det:2},{x:4,y:65,sz:10,det:2},{x:5,y:20,sz:10,det:3},{x:6,y:25,sz:10,det:3},{x:1,y:200,sz:20,det:4},{x:2,y:260,sz:20,det:4},{x:3,y:320,sz:20,det:5},{x:4,y:380,sz:20,det:5},{x:5,y:440,sz:20,det:6},{x:6,y:500,sz:20,det:6}],{sizeField:'sz',detailField:'det',yAggregate:'average'}]);
F.push(['DISJOINT-FLAT (s164:217)',[{x:1,y:10,seg:'A',sz:10},{x:2,y:10,seg:'A',sz:10},{x:3,y:100,seg:'A',sz:20},{x:4,y:100,seg:'A',sz:20}],{colorField:'seg',sizeField:'sz',yAggregate:'average'}]);
F.push(['two-axis-all-fall',(()=>{const r=[];let w=0;for(const seg of['A','B'])for(const sz of[10,20])for(const dt of[1,2]){const x0=w*3;w++;const lift=w*1000;r.push({x:x0+1,y:lift+100,seg,sz,dt},{x:x0+2,y:lift+90,seg,sz,dt},{x:x0+3,y:lift+80,seg,sz,dt});}return r;})(),{colorField:'seg',sizeField:'sz',detailField:'dt',yAggregate:'average'}]);
F.push(['n2-opposite',[{x:1,y:10,sz:10},{x:2,y:20,sz:10},{x:3,y:30,sz:10},{x:4,y:105,sz:20},{x:5,y:104,sz:20}],{sizeField:'sz',yAggregate:'average'}]);

console.log('MONOTONICITY TEST — s164 RED-first fixtures under the DRAFT (G0 unchanged AND G1\'):\n');
let flips=0;
for(const [name,rows,o] of F){
 const spec=chart(rows,o);
 const cur=analyzeVizSpec(spec).correlation;
 // pooled: recompute over drawn cells (value key) — use the value the s164 gate would compare against
 const vk=[...(o.facetColumnField?[o.facetColumnField]:[]),...(o.colorField?[o.colorField]:[]),...(o.sizeField?[o.sizeField]:[]),...(o.detailField?[o.detailField]:[])];
 let cells=rows;
 if(o.yAggregate){const c=new Map(),ord=[];for(const r of rows){const k=kf(r,['x',...vk]);if(!c.has(k)){c.set(k,{d:r.x,v:[]});ord.push(k);}c.get(k).v.push(r.y);}
  cells=ord.map(k=>({x:c.get(k).d,y:redA(c.get(k).v,o.yAggregate)}));}
 const pooled=pr(cells.map(r=>Number(r.x)),cells.map(r=>Number(r.y)));
 const G0=g0(rows,'x','y',partOf(o),grpOf(o),o.yAggregate,pooled);
 const G1=g1prime(rows,'x','y',sepOf(o),o.yAggregate,pooled);
 const draft=(G0&&!G1.s)?pooled:undefined;
 const flip=cur===undefined&&draft!==undefined;
 if(flip)flips++;
 console.log(`  ${name.padEnd(26)} CURRENT=${String(cur).padEnd(9)} pooled=${String(pooled).padEnd(8)} G0=${G0?'narrate':'suppress'} G1'=${G1.s?'suppress':'narrate'}  DRAFT=${String(draft).padEnd(9)} ${flip?'<<< MONOTONICITY VIOLATED: undefined -> NARRATES':''}`);
 if(flip)for(const t of G1.trace)console.log('        '+t);
}
console.log(`\n  ==> ${flips} s164 RED-first fixture(s) FLIP from suppressed to NARRATING under the draft.`);
