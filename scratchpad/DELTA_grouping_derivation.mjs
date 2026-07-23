// Confirm design-A groupingFields derivation collapses to [] under stacking for the CHECK-B spec,
// and to {sz} for the size fixture, using the REAL drawnCellKeyFields via dist? (not exported public)
// drawnCellKeyFields is off-barrel; approximate by resolvePrimaryChannels + spec structure instead.
import { resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
// stacking spec: bar + sum + color=seg  -> measureChannel y ; series dropped under stacking -> valueKey=[] -> grouping=[]\{seg}=[]
// size spec:     point + avg + color=seg + size=sz -> valueKey={seg,sz}; partition={seg}; grouping={sz}
console.log('stacking measureChannel:', JSON.stringify(resolvePrimaryChannels({
  $schema:'x',id:'s',name:'s',data:{name:'d',values:[]},
  encoding:{x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'sum'},color:{field:'seg',trait:'EncodingColor'}},
  marks:[{trait:'MarkBar',encodings:{}}]})));
console.log('size measureChannel:', JSON.stringify(resolvePrimaryChannels({
  $schema:'x',id:'s',name:'s',data:{name:'d',values:[]},
  encoding:{x:{field:'x',trait:'EncodingX',type:'quantitative'},y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},color:{field:'seg',trait:'EncodingColor'},size:{field:'sz',trait:'EncodingSize',type:'quantitative'}},
  marks:[{trait:'MarkPoint',encodings:{}}]})));
