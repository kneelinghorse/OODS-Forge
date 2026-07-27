import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
// horizontal bar with STRING nominal dimension y + color Simpson -> pearson(string,x)=null -> undefined (honest)
const rows = [
  {cat:'Jan',val:10,seg:'A'},{cat:'Feb',val:8,seg:'A'},{cat:'Mar',val:6,seg:'A'},
  {cat:'Apr',val:20,seg:'B'},{cat:'May',val:18,seg:'B'},{cat:'Jun',val:16,seg:'B'},
];
const enc = { x:{field:'val',trait:'EncodingX',type:'quantitative'}, y:{field:'cat',trait:'EncodingY'}, color:{field:'seg',trait:'EncodingColor'} };
const spec = { $schema:'x', id:'z', name:'z', data:{name:'d',values:rows}, marks:[{trait:'MarkBar',encodings:enc}], encoding:enc, a11y:{description:'v'} };
console.log('string-dim horiz bar: rpc=', JSON.stringify(resolvePrimaryChannels(spec)), 'corr=', analyzeVizSpec(spec).correlation);
