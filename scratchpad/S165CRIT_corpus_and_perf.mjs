// S165 critic — corpus blast radius + high-cardinality perf.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { analyzeVizSpec, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

const ROOT = '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/examples';
function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.spec.json')) out.push(p);
  }
  return out;
}
const files = walk(ROOT);
console.log(`corpus spec.json files: ${files.length}\n`);
const MARK_SHAPE = { MarkPoint:'point', MarkLine:'line', MarkBar:'bar', MarkArea:'area', MarkRect:'rect' };
let narrating = 0;
const rows = [];
for (const f of files) {
  let spec;
  try { spec = JSON.parse(readFileSync(f, 'utf8')); } catch { continue; }
  let a;
  try { a = analyzeVizSpec(spec); } catch (e) { rows.push({ file: f.replace(ROOT,''), corr: 'THROW '+e.message.slice(0,30) }); continue; }
  if (a.correlation === undefined) continue;
  narrating++;
  const enc = spec.encoding ?? {};
  const marks = (spec.marks ?? []).map(m => MARK_SHAPE[m.trait] ?? m.trait);
  const uniq = [...new Set(marks)];
  const resolved = uniq.length === 1 ? uniq[0] : uniq.length > 1 ? 'mixed' : 'unknown';
  const retinal = ['color','size','shape','detail'].filter(c => enc[c]?.field)
    .map(c => `${c}=${enc[c].field}${enc[c].type === 'quantitative' ? ':Q' : ''}`);
  const facet = spec.layout?.trait === 'LayoutFacet' ? [spec.layout.columns?.field, spec.layout.rows?.field].filter(Boolean) : [];
  rows.push({ file: f.replace(ROOT,''), corr: a.correlation, mark: resolved, retinal: retinal.join(',') || '-', facet: facet.join(',') || '-', yAgg: enc.y?.aggregate ?? '-' });
}
console.table(rows);
console.log(`corpus specs currently NARRATING a correlation: ${narrating}`);

// ── high-cardinality perf: a separable field with UNIQUE values per row (s164's own defect7 uses det:id)
const RHO=0.5; const signOf=r=>r>0?1:r<0?-1:0;
function pearson(xs,ys){const n=Math.min(xs.length,ys.length);if(n<3)return null;const mx=xs.reduce((s,v)=>s+v,0)/n,my=ys.reduce((s,v)=>s+v,0)/n;let nu=0,dx=0,dy=0;for(let i=0;i<n;i++){nu+=(xs[i]-mx)*(ys[i]-my);dx+=(xs[i]-mx)**2;dy+=(ys[i]-my)**2;}const d=Math.sqrt(dx*dy);return d===0?null:Number((nu/d).toFixed(3));}
const keyFor=(row,f)=>f.map(k=>row[k]===null||row[k]===undefined?'\0null':String(row[k])).join('\0');
function subsetsOf(a){const o=[[]];for(const x of a){const n=o.length;for(let i=0;i<n;i++)o.push([...o[i],x]);}return o;}
const toNumber=v=>{const n=Number(v);return Number.isFinite(n)?n:null;};
function drawnSubSeries(rowsIn,dim,meas,keyFields,agg){const bySub=new Map();const push=(s,x,y)=>{let e=bySub.get(s);if(!e){e={xs:[],ys:[]};bySub.set(s,e);}e.xs.push(x);e.ys.push(y);};
 if(agg){const cells=new Map();for(const r of rowsIn){const k=keyFor(r,[dim,...keyFields]);let c=cells.get(k);if(!c){c={sub:keyFor(r,keyFields),dim:r[dim],values:[]};cells.set(k,c);}c.values.push(r[meas]);}
  for(const c of cells.values()){const nums=c.values.map(toNumber).filter(v=>v!==null);if(!nums.length)continue;const red=nums.reduce((s,v)=>s+v,0)/nums.length;const x=toNumber(c.dim);if(x===null)continue;push(c.sub,x,red);} }
 else {for(const r of rowsIn){const x=toNumber(r[dim]),y=toNumber(r[meas]);if(x===null||y===null)continue;push(keyFor(r,keyFields),x,y);}}
 return [...bySub.values()];}
function classify(xs,ys){const n=xs.length;if(n<2)return 'unknown';const mx=xs.reduce((s,v)=>s+v,0)/n;let dx=0;for(const x of xs)dx+=(x-mx)**2;if(dx===0)return 'unknown';if(n===2){const my=(ys[0]+ys[1])/2;let c=0;for(let i=0;i<2;i++)c+=(xs[i]-mx)*(ys[i]-my);return signOf(c);}const r=pearson(xs,ys);if(r===null)return 0;return Math.abs(r)>=RHO?signOf(r):0;}
function scan(rowsIn,fields,agg){let buckets=0;for(const S of subsetsOf(fields)){for(const s of drawnSubSeries(rowsIn,'x','y',S,agg)){buckets++;if(new Set(s.xs).size<2)continue;classify(s.xs,s.ys);}}return buckets;}

console.log('\n── HIGH-CARDINALITY perf (a `detail`/`size` field with near-unique values, as in the s164 defect7 corpus fixture) ──');
for (const [n,k,card] of [[2000,5,'unique'],[10000,5,'unique'],[10000,6,'unique'],[50000,6,'unique']]) {
  const data=[];
  for(let i=0;i<n;i++){const r={x:i%500,y:Math.sin(i)*100+i};for(let f=0;f<k;f++)r['f'+f]= f===0? i : `v${i%(2+f)}`;data.push(r);}
  const fields=Array.from({length:k},(_,i)=>'f'+i);
  const t0=process.hrtime.bigint();
  const b=scan(data,fields,'average');
  const t1=process.hrtime.bigint();
  console.log(`  n=${String(n).padStart(6)} |sep|=${k} (f0 unique-per-row) subsets=${2**k} seriesBuckets=${b} time=${(Number(t1-t0)/1e6).toFixed(1)}ms`);
}
