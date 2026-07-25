import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
function pearson(xs, ys){const n=xs.length;const mx=xs.reduce((a,b)=>a+b,0)/n,my=ys.reduce((a,b)=>a+b,0)/n;let sxy=0,sxx=0,syy=0;for(let i=0;i<n;i++){sxy+=(xs[i]-mx)*(ys[i]-my);sxx+=(xs[i]-mx)**2;syy+=(ys[i]-my)**2;}if(sxx===0||syy===0)return null;return sxy/Math.sqrt(sxx*syy);}
const facetLayout = { trait:'LayoutFacet', columns:{field:'panel',trait:'FacetField'} };
const shapeRows = (panels) => { const rows=[]; for(const panel of panels){ rows.push({x:1,y:20,panel,shp:'a'});rows.push({x:2,y:16,panel,shp:'a'});rows.push({x:3,y:12,panel,shp:'a'}); rows.push({x:3,y:40,panel,shp:'b'});rows.push({x:4,y:36,panel,shp:'b'});rows.push({x:5,y:32,panel,shp:'b'}); } return rows; };
const enc = { x:{field:'x',trait:'EncodingX',type:'quantitative'}, y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'}, shape:{field:'shp',trait:'EncodingShape'} };
function show(label, spec){const a=analyzeVizSpec(spec);console.log(`\n=== ${label} ===`);console.log('  corr=', a.correlation);console.log('  narrative:', generateNarrativeSummary(spec).summary);}

// Control 1: SINGLE MarkPoint (not mixed) + facet + shape Simpson -> shape SHOULD be captured -> suppress
show('C1 single MarkPoint facet + shape Simpson (expect undefined)',
  { $schema:'x', id:'t', name:'t', data:{name:'d',values:shapeRows(['P'])}, marks:[{trait:'MarkPoint',encodings:enc}], encoding:enc, a11y:{}, layout:facetLayout });

// Control 2: MIXED (point+line) facet + shape Simpson (the candidate) -- no a11y.description override so we see prose
show('C2 MIXED(point+line) facet + shape Simpson (candidate)',
  { $schema:'x', id:'t', name:'t', data:{name:'d',values:shapeRows(['P'])}, marks:[{trait:'MarkPoint',encodings:enc},{trait:'MarkLine',encodings:enc}], encoding:enc, a11y:{}, layout:facetLayout });

// Control 3: MIXED + shape Simpson, NO facet (is facet needed?)
show('C3 MIXED(point+line) shape Simpson NO facet',
  { $schema:'x', id:'t', name:'t', data:{name:'d',values:shapeRows(['P'])}, marks:[{trait:'MarkPoint',encodings:enc},{trait:'MarkLine',encodings:enc}], encoding:enc, a11y:{} });

// Control 4: single MarkLine + shape Simpson NO facet -> should suppress (shape splits lines)
show('C4 single MarkLine shape Simpson (expect undefined)',
  { $schema:'x', id:'t', name:'t', data:{name:'d',values:shapeRows(['P'])}, marks:[{trait:'MarkLine',encodings:enc}], encoding:enc, a11y:{} });

console.log('\n  HAND: shape band a (x1,2,3 / y20,16,12) r=',pearson([1,2,3],[20,16,12]),' band b (x3,4,5 / y40,36,32) r=',pearson([3,4,5],[40,36,32]));
console.log('  HAND pooled all 6 cells r=', pearson([1,2,3,3,4,5],[20,16,12,40,36,32]));
