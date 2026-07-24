// The REAL cascade_middle fixture (defect 7): finest (seg,size,det) SHREDS to n=1; middle (seg,size)
// bands FALL; partition (seg) RISES; pooled RISES(+). Test each granularity reading of §10.
const RHO=0.5;
function pearson(xs,ys){const n=xs.length;if(n<2)return null;const mx=xs.reduce((s,v)=>s+v,0)/n,my=ys.reduce((s,v)=>s+v,0)/n;let num=0,dx=0,dy=0;for(let i=0;i<n;i++){num+=(xs[i]-mx)*(ys[i]-my);dx+=(xs[i]-mx)**2;dy+=(ys[i]-my)**2;}const den=Math.sqrt(dx*dy);return den===0?null:num/den;}
const round3=r=>r===null?null:Math.round(r*1000)/1000;const signOf=r=>r>0?1:r<0?-1:0;
function projectCells(rows,dimF,measF,kf){const g=new Map();for(const r of rows){const k=[dimF,...kf].map(f=>String(r[f])).join('\0');if(!g.has(k))g.set(k,{dim:r[dimF],sub:kf.map(f=>String(r[f])).join('\0'),vals:[]});g.get(k).vals.push(r[measF]);}return[...g.values()].map(x=>({dim:x.dim,sub:x.sub,val:x.vals.reduce((s,v)=>s+v,0)/x.vals.length}));}
function classifySub(cc){const xs=cc.map(c=>c.dim),ys=cc.map(c=>c.val);const n=xs.length;if(n<2)return{vote:'unknown'};const mx=xs.reduce((s,v)=>s+v,0)/n;let dx=0;for(const x of xs)dx+=(x-mx)**2;if(dx===0)return{vote:'unknown'};if(n===2){const my=(ys[0]+ys[1])/2;let cov=0;for(let i=0;i<2;i++)cov+=(xs[i]-mx)*(ys[i]-my);return{vote:signOf(cov)};}const r=pearson(xs,ys);if(r===null)return{vote:0};return{vote:Math.abs(r)>=RHO?signOf(r):0};}
function subsets(a){let out=[[]];for(const x of a){out=out.concat(out.map(s=>[...s,x]));}return out;}
function pg(rows,p){const m=new Map();if(p.length===0){m.set('*',rows);return m;}for(const r of rows){const k=p.map(f=>String(r[f])).join('\0');if(!m.has(k))m.set(k,[]);m.get(k).push(r);}return m;}
function decide(E,any,pooled){if(!any)return'FALLBACK-narrate';const s=new Set(E);const ps=signOf(round3(pooled));const flat=E.length===0;return(s.size>1||E.some(e=>e===-ps)||(flat&&ps!==0))?'SUPPRESS':'NARRATE';}

// A: coarsest-first, stop at first level yielding any n>=2
function A(rows,d,m,p,g){const E=[];let any=false;for(const[,pr]of pg(rows,p)){for(const S of subsets(g).sort((a,b)=>a.length-b.length)){const cells=projectCells(pr,d,m,S);const bs=new Map();for(const c of cells){if(!bs.has(c.sub))bs.set(c.sub,[]);bs.get(c.sub).push(c);}let v=false;for(const[,cc]of bs){if(new Set(cc.map(c=>c.dim)).size<2)continue;any=true;v=true;const x=classifySub(cc);if(x.vote!=='unknown'&&x.vote!==0)E.push(x.vote);}if(v)break;}}return{d:decide(E,any,poolOf(rows,d,m,g)),E};}
// B: union all S
function B(rows,d,m,p,g){const E=[];let any=false;for(const[,pr]of pg(rows,p)){for(const S of subsets(g)){const cells=projectCells(pr,d,m,S);const bs=new Map();for(const c of cells){if(!bs.has(c.sub))bs.set(c.sub,[]);bs.get(c.sub).push(c);}for(const[,cc]of bs){if(new Set(cc.map(c=>c.dim)).size<2)continue;any=true;const x=classifySub(cc);if(x.vote!=='unknown'&&x.vote!==0)E.push(x.vote);}}}return{d:decide(E,any,poolOf(rows,d,m,g)),E};}
// C: finest leaf; if shredded back off to COARSEST ancestor with n>=2 (memo "coarsest S")
function C(rows,d,m,p,g){const E=[];let any=false;for(const[,pr]of pg(rows,p)){const full=projectCells(pr,d,m,g);const leaves=new Map();for(const c of full){if(!leaves.has(c.sub))leaves.set(c.sub,[]);leaves.get(c.sub).push(c);}for(const[sk,cc]of leaves){if(new Set(cc.map(c=>c.dim)).size>=2){any=true;const x=classifySub(cc);if(x.vote!=='unknown'&&x.vote!==0)E.push(x.vote);continue;}const rep=pr.find(r=>g.map(f=>String(r[f])).join('\0')===sk);for(const S of subsets(g).sort((a,b)=>a.length-b.length)){const ps=S.map(f=>String(rep[f])).join('\0');const pc=projectCells(pr,d,m,S).filter(c=>c.sub===ps);if(new Set(pc.map(c=>c.dim)).size>=2){any=true;const x=classifySub(pc);if(x.vote!=='unknown'&&x.vote!==0)E.push(x.vote);break;}}}}return{d:decide(E,any,poolOf(rows,d,m,g)),E};}
// D: finest leaf; if shredded back off to FINEST ancestor with n>=2 (minimal backoff)
function D(rows,d,m,p,g){const E=[];let any=false;for(const[,pr]of pg(rows,p)){const full=projectCells(pr,d,m,g);const leaves=new Map();for(const c of full){if(!leaves.has(c.sub))leaves.set(c.sub,[]);leaves.get(c.sub).push(c);}for(const[sk,cc]of leaves){if(new Set(cc.map(c=>c.dim)).size>=2){any=true;const x=classifySub(cc);if(x.vote!=='unknown'&&x.vote!==0)E.push(x.vote);continue;}const rep=pr.find(r=>g.map(f=>String(r[f])).join('\0')===sk);for(const S of subsets(g).sort((a,b)=>b.length-a.length)){const ps=S.map(f=>String(rep[f])).join('\0');const pc=projectCells(pr,d,m,S).filter(c=>c.sub===ps);if(new Set(pc.map(c=>c.dim)).size>=2){any=true;const x=classifySub(pc);if(x.vote!=='unknown'&&x.vote!==0)E.push(x.vote);break;}}}}return{d:decide(E,any,poolOf(rows,d,m,g)),E};}
function poolOf(rows,d,m,g){const pc=projectCells(rows,d,m,g);return round3(pearson(pc.map(c=>c.dim),pc.map(c=>c.val)));}

const rows=[];let id=0;const addr=(x,y,seg,size)=>{id++;rows.push({x,y,seg,size,det:id});};
addr(1,160,'A',10);addr(2,80,'A',10);addr(3,260,'A',20);addr(4,180,'A',20);
addr(1,360,'B',10);addr(2,280,'B',10);addr(3,460,'B',20);addr(4,380,'B',20);
const p=['seg'],g=['size','det'];
console.log('pooled(over grouping cells)=',poolOf(rows,'x','y',g),'(want SUPPRESS: middle size-bands FALL, pooled RISES)');
console.log('A coarsest-stop:',JSON.stringify(A(rows,'x','y',p,g)));
console.log('B union-all-S:  ',JSON.stringify(B(rows,'x','y',p,g)));
console.log('C finest+coarsest-backoff:',JSON.stringify(C(rows,'x','y',p,g)));
console.log('D finest+finest-backoff:  ',JSON.stringify(D(rows,'x','y',p,g)));
