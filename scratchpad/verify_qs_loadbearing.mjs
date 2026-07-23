import { analyzeVizSpec, generateNarrativeSummary } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
const mk = (values, withSize) => {
  const enc = {
    x: { field:'x', trait:'EncodingX', type:'quantitative', scale:{type:'linear'} },
    y: { field:'y', trait:'EncodingY', type:'quantitative', aggregate:'sum' },
    color: { field:'seg', trait:'EncodingColor', type:'nominal' },
  };
  if (withSize) enc.size = { field:'sz', trait:'EncodingSize', type:'quantitative', scale:{type:'linear'} };
  return { $schema:'https://oods.dev/viz-spec/v1', id:'v', name:'v',
    data:{name:'d',values}, marks:[{trait:'MarkPoint',encodings:enc}], encoding:enc, a11y:{description:'x'} };
};
const vals = [
  {x:1,y:100,seg:'A',sz:1},{x:2,y:90,seg:'A',sz:2},{x:2,y:80,seg:'A',sz:3},{x:2,y:70,seg:'A',sz:4},
  {x:3,y:300,seg:'B',sz:1},{x:4,y:290,seg:'B',sz:2},{x:4,y:280,seg:'B',sz:3},{x:4,y:270,seg:'B',sz:4},
];
for (const withSize of [true, false]) {
  const spec = mk(vals, withSize);
  const a = analyzeVizSpec(spec);
  const n = generateNarrativeSummary(spec);
  console.log(`withSize=${withSize}: correlation=${a.correlation}  ::  ${n.summary}`);
}
// Prove: the falling-within-color exists ONLY because quantitative size splits x=2 into 3 drawn cells.
// Remove size -> color A drawn cells collapse per-x to (1,100),(2,240) -> RISING (no reversal, honest).
