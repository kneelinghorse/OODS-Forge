// S165 CRITIC — run the PROPOSAL against every SHIPPED keep-control that asserts a DEFINED correlation.
import { analyzeVizSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
const RHO=0.5,sg=r=>r>0?1:r<0?-1:0;
function pr(xs,ys){const n=xs.length;if(n<3)return null;const mx=xs.reduce((s,v)=>s+v,0)/n,my=ys.reduce((s,v)=>s+v,0)/n;let nu=0,dx=0,dy=0;for(let i=0;i<n;i++){nu+=(xs[i]-mx)*(ys[i]-my);dx+=(xs[i]-mx)**2;dy+=(ys[i]-my)**2;}const d=Math.sqrt(dx*dy);return d===0?null:Math.round(nu/d*1000)/1000;}
function cls(xs,ys){const n=xs.length;if(n<2)return'unknown';const mx=xs.reduce((s,x)=>s+x,0)/n;let d=0;for(const x of xs)d+=(x-mx)**2;if(d===0)return'unknown';if(n===2){const my=(ys[0]+ys[1])/2;let c=0;for(let i=0;i<2;i++)c+=(xs[i]-mx)*(ys[i]-my);return sg(c);}const r=pr(xs,ys);if(r===null)return 0;return Math.abs(r)>=RHO?sg(r):0;}
const kf=(r,f)=>f.map(k=>String(r[k])).join('\0');
const redA=(v,a)=>{const n=v.map(Number).filter(Number.isFinite);if(!n.length)return undefined;return a==='sum'?n.reduce((x,y)=>x+y,0):a==='average'?n.reduce((x,y)=>x+y,0)/n.length:undefined;};
const subs=i=>{const o=[[]];for(const t of i){const l=o.length;for(let k=0;k<l;k++)o.push([...o[k],t]);}return o;};
function ser(rows,dim,meas,f,agg){const m=new Map();const push=(s,x,y)=>{let e=m.get(s);if(!e){e={xs:[],ys:[]};m.set(s,e);}e.xs.push(x);e.ys.push(y);};
 if(agg){const c=new Map();for(const r of rows){const k=kf(r,[dim,...f]);let e=c.get(k);if(!e){e={sub:kf(r,f),dim:r[dim],v:[]};c.set(k,e);}e.v.push(r[meas]);}
  for(const e of c.values()){const v=redA(e.v,agg),x=Number(e.dim);if(v===undefined||!Number.isFinite(x))continue;push(e.sub,x,v);} }
 else for(const r of rows){const x=Number(r[dim]),y=Number(r[meas]);if(Number.isFinite(x)&&Number.isFinite(y))push(kf(r,f),x,y);}
 return [...m.values()];}
function g1p(rows,dim,meas,sep,agg,pooled){const ps=sg(pooled),votes=[];let any=false,shares=false,fine=false,ev=null;
 if(!sep.length)return{s:false,why:'no-op'};
 const rec=d=>{if(d==='unknown')return;any=true;if(d!==0)votes.push(d);if(d!==0&&d===ps)shares=true;};
 for(const S of subs(sep))for(const se of ser(rows,dim,meas,S,agg)){if(new Set(se.xs).size<2)continue;const d=cls(se.xs,se.ys);if(d==='unknown')continue;if(!S.length){ev=d;continue;}fine=true;rec(d);}
 if(!fine&&ev!==null)rec(ev);
 let s,why;if(!any){s=false;why='fallback';}else if(new Set(votes).size>1){s=true;why='(a) votes span both signs';}
 else if(votes.some(v=>v===-ps)){s=true;why='(b) real opposite';}else{s=ps!==0&&!shares;why=s?'(c) every band FLAT under rho':'narrate';}
 return{s,why};}
const mk=(rows,o={})=>{const e={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative',...(o.agg?{aggregate:o.agg}:{})}};
 if(o.color)e.color={field:o.color,trait:'EncodingColor'};if(o.size)e.size={field:o.size,trait:'EncodingSize',type:'quantitative'};
 if(o.detail)e.detail={field:o.detail,trait:'EncodingDetail',type:'quantitative'};
 return{$schema:'https://oods.dev/viz-spec/v1',id:'k',name:'k',data:{name:'d',values:rows},marks:[{trait:o.mark??'MarkPoint',encodings:e}],encoding:e,
  ...(o.facet?{layout:{trait:'LayoutFacet',columns:{field:o.facet}}}:{}),a11y:{description:'y over x'}};};

const K=[];
// s162:111 risingRows (uneven counts, per-group drawn cells rise)
{const rows=[];const push=(x,y,g,k)=>{for(let i=0;i<k;i++)rows.push({x,y,seg:g});};
 push(1,10,'A',1);push(2,20,'A',50);push(3,30,'A',3);push(4,40,'B',2);push(5,50,'B',1);push(6,60,'B',4);
 K.push(['s162:111 color-grouping narrates',mk(rows,{color:'seg',agg:'average'}),['seg'],'average']);}
// s162:121 no-aggregate two rising groups
{const rows=[{x:1,y:1,seg:'A'},{x:2,y:2,seg:'A'},{x:3,y:3,seg:'A'},{x:1,y:10,seg:'B'},{x:2,y:20,seg:'B'},{x:3,y:30,seg:'B'}];
 K.push(['s162:121 no-agg two rising groups',mk(rows,{color:'seg'}),['seg'],undefined]);}
// s163:187 legitRows over-suppression guard
{const rows=[];const p=(x,y,g,s)=>rows.push({x,y,seg:g,sz:s});
 p(1,10,'A',1);p(1,16,'A',2);p(2,22,'A',1);p(2,28,'A',2);p(3,34,'A',1);p(3,40,'A',2);
 p(1,60,'B',1);p(1,66,'B',2);p(2,72,'B',1);p(2,78,'B',2);p(3,84,'B',1);p(3,90,'B',2);
 K.push(['s163:187 legit agg+size narrates',mk(rows,{color:'seg',size:'sz',agg:'average'}),['seg','sz'],'average']);}
// s163:197 no-aggregate with size present
{const rows=[{x:1,y:1,seg:'A',sz:5},{x:2,y:2,seg:'A',sz:6},{x:3,y:3,seg:'A',sz:7},{x:1,y:10,seg:'B',sz:5},{x:2,y:20,seg:'B',sz:6},{x:3,y:30,seg:'B',sz:7}];
 K.push(['s163:197 no-agg + size narrates',mk(rows,{color:'seg',size:'sz'}),['seg','sz'],undefined]);}
// s164:271 weak-consistent categorical-only
{const rows=[];const g=(seg,b)=>rows.push({x:1,y:b,seg},{x:2,y:b+3,seg},{x:3,y:b-1,seg},{x:4,y:b+4,seg});g('R',0);g('S',100);g('T',200);
 K.push(['s164:271 weak-consistent categorical-only',mk(rows,{color:'seg'}),['seg'],undefined]);}
// s164 keep-controls
{const rows=[];for(const seg of['A','B'])for(const sz of[10,20])rows.push({x:1,y:1+sz,seg,sz},{x:2,y:2+sz,seg,sz},{x:3,y:3+sz,seg,sz});
 K.push(['s164:229 all-rise',mk(rows,{color:'seg',size:'sz',agg:'average'}),['seg','sz'],'average']);}
{const rows=[{x:1,y:11,seg:'A',sz:10},{x:2,y:12,seg:'A',sz:10},{x:3,y:13,seg:'A',sz:10},{x:1,y:21,seg:'A',sz:20},{x:2,y:22,seg:'A',sz:20},{x:3,y:23,seg:'A',sz:20},{x:1,y:50,seg:'B',sz:10},{x:2,y:50,seg:'B',sz:10},{x:3,y:50,seg:'B',sz:10},{x:1,y:71,seg:'B',sz:20},{x:2,y:72,seg:'B',sz:20},{x:3,y:73,seg:'B',sz:20}];
 K.push(['s164:234 CASE3-FLAT',mk(rows,{color:'seg',size:'sz',agg:'average'}),['seg','sz'],'average']);}
{const rows=[{x:1,y:10,seg:'A',sz:10},{x:2,y:20,seg:'A',sz:10},{x:3,y:30,seg:'A',sz:10},{x:1,y:52,seg:'A',sz:20},{x:2,y:49,seg:'A',sz:20},{x:3,y:51,seg:'A',sz:20}];
 K.push(['s164:237 weak-scatter gray-zone',mk(rows,{color:'seg',size:'sz',agg:'average'}),['seg','sz'],'average']);}
{const rows=[];for(const seg of['A','B']){const o=seg==='A'?0:1;rows.push({x:1,y:100+o,seg,sz:9.001+o*1e-4},{x:1,y:90+o,seg,sz:8.001+o*1e-4},{x:2,y:40+o,seg,sz:2.001+o*1e-4},{x:2,y:30+o,seg,sz:1.001+o*1e-4});}
 K.push(['s164:240 continuous ramp',mk(rows,{color:'seg',size:'sz',agg:'average'}),['seg','sz'],'average']);}
{const rows=[];for(const seg of['A','B'])for(const sz of[10,20])for(const dt of[1,2]){const b=sz+dt*5+(seg==='A'?0:3);rows.push({x:1,y:b+1,seg,sz,dt},{x:2,y:b+5,seg,sz,dt},{x:3,y:b+10,seg,sz,dt});}
 K.push(['s164:245 honest multi-axis',mk(rows,{color:'seg',size:'sz',detail:'dt',agg:'average'}),['seg','sz','dt'],'average']);}
{const rows=[];[10,20,30,40,50].forEach((y,i)=>rows.push({x:i+1,y,sz:10}));[55,49,54,50,52].forEach((y,i)=>rows.push({x:i+1,y:y+100,sz:20}));
 K.push(['s164:256 rho-scatter narrates',mk(rows,{size:'sz',agg:'average'}),['sz'],'average']);}

let broken=0;
console.log('SHIPPED keep-controls asserting a DEFINED correlation, under the PROPOSAL:\n');
for(const [name,spec,sep,agg] of K){
  const cur=analyzeVizSpec(spec).correlation;
  if(cur===undefined){console.log(`  ${name.padEnd(45)} CURRENT=undefined (?! unexpected)`);continue;}
  const g=g1p(spec.data.values,'x','y',sep,agg,cur);
  if(g.s)broken++;
  console.log(`  ${name.padEnd(45)} cur=${String(cur).padEnd(8)} PROPOSAL=${g.s?'*** RED (silenced) *** '+g.why:'GREEN'}`);
}
console.log(`\n  ==> ${broken} / ${K.length} shipped keep-controls go RED under §3.2 as written.`);
