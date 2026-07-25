import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
function pearson(xs,ys){const n=xs.length;const mx=xs.reduce((a,b)=>a+b,0)/n;const my=ys.reduce((a,b)=>a+b,0)/n;let a=0,dx=0,dy=0;for(let i=0;i<n;i++){a+=(xs[i]-mx)*(ys[i]-my);dx+=(xs[i]-mx)**2;dy+=(ys[i]-my)**2;}return a/Math.sqrt(dx*dy);}
const rows=[{x:1,y:10,g:'A'},{x:2,y:8,g:'A'},{x:3,y:6,g:'A'},{x:4,y:30,g:'B'},{x:5,y:28,g:'B'},{x:6,y:26,g:'B'}];
console.log('per-group: A pearson', pearson([1,2,3],[10,8,6]).toFixed(3),' B pearson', pearson([4,5,6],[30,28,26]).toFixed(3),' POOLED', pearson(rows.map(r=>r.x),rows.map(r=>r.y)).toFixed(3));
function mk(marks,chan){const enc={x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative'},[chan]:{field:'g',trait:'Encoding'+chan[0].toUpperCase()+chan.slice(1)}};return {$schema:'https://oods.dev/viz-spec/v1',id:'t',name:'t',data:{name:'d',values:rows},marks,encoding:enc,a11y:{description:'y over x'}};}
for (const [lbl,marks,chan] of [
  ['MarkPoint + SHAPE (control)',[{trait:'MarkPoint'}],'shape'],
  ['MIXED point+line + SHAPE',[{trait:'MarkPoint'},{trait:'MarkLine'}],'shape'],
  ['MIXED point+line + COLOR',[{trait:'MarkPoint'},{trait:'MarkLine'}],'color'],
  ['MIXED point+line + DETAIL',[{trait:'MarkPoint'},{trait:'MarkLine'}],'detail'],
]) {
  const spec=mk(marks,chan);
  const enc=spec.encoding; for (const m of spec.marks) m.encodings=enc;
  const a=analyzeVizSpec(spec);
  console.log(`\n[${lbl}] corr=`, a.correlation, '');
}
