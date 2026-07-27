// PROOF: the memo §10 LITERAL wording "a sub-series is VOTABLE at the COARSEST S where it reaches
// n>=2 distinct x" (Reading A) NARRATES a phantom that the parenthetical (Reading B/finest) suppresses.
// Also proves it on DEFECT1 (primary reproduced survivor) and CASE6 (v2-blocker-3).
const RHO=0.5;
function pearson(xs,ys){const n=xs.length;if(n<2)return null;const mx=xs.reduce((s,v)=>s+v,0)/n,my=ys.reduce((s,v)=>s+v,0)/n;let num=0,dx=0,dy=0;for(let i=0;i<n;i++){num+=(xs[i]-mx)*(ys[i]-my);dx+=(xs[i]-mx)**2;dy+=(ys[i]-my)**2;}const den=Math.sqrt(dx*dy);return den===0?null:num/den;}
const round3=r=>r===null?null:Math.round(r*1000)/1000;const signOf=r=>r>0?1:r<0?-1:0;
function proj(rows,d,m,kf){const g=new Map();for(const r of rows){const k=[d,...kf].map(f=>String(r[f])).join('\0');if(!g.has(k))g.set(k,{dim:r[d],sub:kf.map(f=>String(r[f])).join('\0'),vals:[]});g.get(k).vals.push(r[m]);}return[...g.values()].map(x=>({dim:x.dim,sub:x.sub,val:x.vals.reduce((s,v)=>s+v,0)/x.vals.length}));}
function cls(cc){const xs=cc.map(c=>c.dim),ys=cc.map(c=>c.val),n=xs.length;if(n<2)return'unknown';const mx=xs.reduce((s,v)=>s+v,0)/n;let dx=0;for(const x of xs)dx+=(x-mx)**2;if(dx===0)return'unknown';if(n===2){const my=(ys[0]+ys[1])/2;let cov=0;for(let i=0;i<2;i++)cov+=(xs[i]-mx)*(ys[i]-my);return signOf(cov);}const r=pearson(xs,ys);if(r===null)return 0;return Math.abs(r)>=RHO?signOf(r):0;}
function subsets(a){let o=[[]];for(const x of a)o=o.concat(o.map(s=>[...s,x]));return o;}
function pg(rows,p){const m=new Map();if(!p.length){m.set('*',rows);return m;}for(const r of rows){const k=p.map(f=>String(r[f])).join('\0');if(!m.has(k))m.set(k,[]);m.get(k).push(r);}return m;}
function decide(E,any,pooled){if(!any)return'FALLBACK-narrate';const s=new Set(E),ps=signOf(round3(pooled)),flat=E.length===0;return(s.size>1||E.some(e=>e===-ps)||(flat&&ps!==0))?'SUPPRESS':'NARRATE';}
function poolOf(rows,d,m,g){const pc=proj(rows,d,m,g);return round3(pearson(pc.map(c=>c.dim),pc.map(c=>c.val)));}
// Reading A: coarsest-first, stop at first level giving any n>=2
function readA(rows,d,m,p,g){const E=[];let any=false;for(const[,pr]of pg(rows,p)){for(const S of subsets(g).sort((a,b)=>a.length-b.length)){const cells=proj(pr,d,m,S),bs=new Map();for(const c of cells){if(!bs.has(c.sub))bs.set(c.sub,[]);bs.get(c.sub).push(c);}let v=false;for(const[,cc]of bs){if(new Set(cc.map(c=>c.dim)).size<2)continue;any=true;v=true;const x=cls(cc);if(x!=='unknown'&&x!==0)E.push(x);}if(v)break;}}return{decision:decide(E,any,poolOf(rows,d,m,g)),E};}
// Reading B: every n>=2 sub-series at every S
function readB(rows,d,m,p,g){const E=[];let any=false;for(const[,pr]of pg(rows,p)){for(const S of subsets(g)){const cells=proj(pr,d,m,S),bs=new Map();for(const c of cells){if(!bs.has(c.sub))bs.set(c.sub,[]);bs.get(c.sub).push(c);}for(const[,cc]of bs){if(new Set(cc.map(c=>c.dim)).size<2)continue;any=true;const x=cls(cc);if(x!=='unknown'&&x!==0)E.push(x);}}}return{decision:decide(E,any,poolOf(rows,d,m,g)),E};}

function ladder(rows,p,g){console.log('  seg-pooled(coarsest S=[]) |r| per partition:');for(const[k,pr]of pg(rows,p)){const c=proj(pr,'x','y',[]);console.log(`    ${k}: r=${pearson(c.map(x=>x.dim),c.map(x=>x.val))?.toFixed(3)} vote=${cls(c)}`);}}

// STRONG Simpson: middle size-bands FALL, but between-size lift is steep so seg-pooled |r|>=RHO (rises).
{const rows=[];let id=0;const a=(x,y,seg,size)=>{id++;rows.push({x,y,seg,size,det:id});};
 // seg A: size10 x=1,2 fall around 100; size20 x=3,4 fall around 500 -> pooled rises strong
 a(1,100,'A',10);a(2,90,'A',10);a(3,500,'A',20);a(4,490,'A',20);
 a(1,300,'B',10);a(2,290,'B',10);a(3,700,'B',20);a(4,690,'B',20);
 console.log('=== STRONG-LIFT 2-axis Simpson (size bands FALL, seg-pooled RISES |r|>=RHO) ===');
 console.log('  pooled=',poolOf(rows,'x','y',['size','det']),'(want SUPPRESS)');
 ladder(rows,['seg'],['size','det']);
 console.log('  READING A (memo literal "coarsest S"):',JSON.stringify(readA(rows,'x','y',['seg'],['size','det'])));
 console.log('  READING B (parenthetical "every n>=2"):',JSON.stringify(readB(rows,'x','y',['seg'],['size','det'])));
}
// DEFECT1 primary survivor
{const rows=[];for(const seg of['A','B'])rows.push({x:1,y:10,seg,d:1},{x:2,y:9,seg,d:1},{x:3,y:100,seg,d:2},{x:4,y:99,seg,d:2});
 console.log('\n=== DEFECT1 detail Simpson (primary reproduced survivor, want SUPPRESS) ===');
 console.log('  pooled=',poolOf(rows,'x','y',['d']));
 console.log('  READING A:',JSON.stringify(readA(rows,'x','y',['seg'],['d'])));
 console.log('  READING B:',JSON.stringify(readB(rows,'x','y',['seg'],['d'])));
}
// CASE6
{const rows=[{x:1,y:1,seg:'A',sz:10},{x:2,y:2,seg:'A',sz:10},{x:3,y:3,seg:'A',sz:10},{x:1,y:3,seg:'A',sz:20},{x:2,y:2,seg:'A',sz:20},{x:3,y:1,seg:'A',sz:20}];
 console.log('\n=== CASE6 pooled~0 opposing (v2-blocker-3, want SUPPRESS) ===');
 console.log('  pooled=',poolOf(rows,'x','y',['sz']));
 console.log('  READING A:',JSON.stringify(readA(rows,'x','y',['seg'],['sz'])));
 console.log('  READING B:',JSON.stringify(readB(rows,'x','y',['seg'],['sz'])));
}
