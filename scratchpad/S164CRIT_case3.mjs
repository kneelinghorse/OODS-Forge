function pearson(xs,ys){const n=xs.length;if(n<2)return null;const mx=xs.reduce((s,v)=>s+v,0)/n,my=ys.reduce((s,v)=>s+v,0)/n;let num=0,dx=0,dy=0;for(let i=0;i<n;i++){num+=(xs[i]-mx)*(ys[i]-my);dx+=(xs[i]-mx)**2;dy+=(ys[i]-my)**2;}const den=Math.sqrt(dx*dy);return den===0?null:num/den;}
const round3=r=>r===null?null:Math.round(r*1000)/1000;const signOf=r=>r>0?1:r<0?-1:0;
function classifyGroupDirection(cells,xF,yF){const xs=[],ys=[];for(const row of cells){const x=row[xF],y=row[yF];if(x==null||y==null||!Number.isFinite(x)||!Number.isFinite(y))continue;xs.push(x);ys.push(y);}const n=xs.length;if(n<2)return'unknown';const mx=xs.reduce((s,x)=>s+x,0)/n;let dX=0;for(const x of xs)dX+=(x-mx)**2;if(dX===0)return'unknown';if(n===2){const my=(ys[0]+ys[1])/2;let cov=0;for(let i=0;i<2;i++)cov+=(xs[i]-mx)*(ys[i]-my);return signOf(cov);}const r=pearson(xs,ys);return r===null?0:signOf(round3(r));}
function narratable(pooled,classes){const ev=classes.filter(c=>c!=='unknown');if(ev.length===0)return true;if(new Set(ev).size>1)return false;const s=ev[0],ps=signOf(round3(pooled));if(s===0)return ps===0;return ps===0||ps===s;}
function project(rows,dimF,measF,extra){const kf=[dimF,...extra];const g=new Map();for(const r of rows){const k=kf.map(f=>String(r[f])).join('\0');if(!g.has(k))g.set(k,{dim:r[dimF],vals:[]});g.get(k).vals.push(r[measF]);}return[...g.values()].map(x=>({[dimF]:x.dim,[measF]:x.vals.reduce((s,v)=>s+v,0)/x.vals.length}));}
function newClasses(rows,dimF,measF,partition,grouping){const key=[...partition,...grouping];const g=new Map();for(const r of rows){const k=key.map(f=>String(r[f])).join('\0');if(!g.has(k))g.set(k,[]);g.get(k).push(r);}const sc=[];let any=false;for(const grp of g.values()){const cells=project(grp,dimF,measF,[]);if(new Set(cells.map(c=>c[dimF])).size>=2)any=true;sc.push(classifyGroupDirection(cells,dimF,measF));}return{classes:sc,any};}
// steep rising bands, one flat control band, levels chosen so pooled is clearly positive
const rows=[];
rows.push({x:1,y:10,seg:'A',sz:10},{x:2,y:40,seg:'A',sz:10},{x:3,y:70,seg:'A',sz:10}); // steep rise
rows.push({x:1,y:20,seg:'A',sz:20},{x:2,y:50,seg:'A',sz:20},{x:3,y:80,seg:'A',sz:20}); // steep rise
rows.push({x:1,y:45,seg:'B',sz:10},{x:2,y:45,seg:'B',sz:10},{x:3,y:45,seg:'B',sz:10}); // FLAT control
rows.push({x:1,y:30,seg:'B',sz:20},{x:2,y:60,seg:'B',sz:20},{x:3,y:90,seg:'B',sz:20}); // steep rise
const cells=project(rows,'x','y',['seg','sz']);
const pooled=round3(pearson(cells.map(c=>c.x),cells.map(c=>c.y)));
const nc=newClasses(rows,'x','y',['seg'],['sz']);
console.log('CASE3-STRONG: pooled =',pooled,'(clearly positive)');
console.log('  NEW sub-series classes =',JSON.stringify(nc.classes),' (3 rising +1, one flat 0)');
console.log('  -> narratable?',narratable(pooled,nc.classes),' => narrate',narratable(pooled,nc.classes)?pooled:'undefined (SUPPRESSED)');
console.log('  A viewer sees 3 rising clouds + 1 FLAT control; NOTHING falls. Positive is honest, yet gate suppresses.');
