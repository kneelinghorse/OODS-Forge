import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels, heatmapColorIsMeasure } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
function pearson(xs, ys){const n=xs.length;const mx=xs.reduce((a,b)=>a+b,0)/n,my=ys.reduce((a,b)=>a+b,0)/n;let sxy=0,sxx=0,syy=0;for(let i=0;i<n;i++){sxy+=(xs[i]-mx)*(ys[i]-my);sxx+=(xs[i]-mx)**2;syy+=(ys[i]-my)**2;}if(sxx===0||syy===0)return null;return sxy/Math.sqrt(sxx*syy);}
function run(label, spec){const c=analyzeVizSpec(spec).correlation;console.log(`\n=== ${label} ===`);console.log('SUT corr=', c, '|', generateNarrativeSummary(spec).summary.slice(0,100));console.log('  channels=',resolvePrimaryChannels(spec),'heatmapColor=',heatmapColorIsMeasure(spec));return c;}
const facetLayout = { trait:'LayoutFacet', columns:{field:'panel',trait:'FacetField'} };
function mkspec(rows, enc, mark='MarkPoint', layout){return { $schema:'https://oods.dev/viz-spec/v1', id:'t', name:'t', data:{name:'d',values:rows}, marks:[{trait:mark,encodings:enc}], encoding:enc, a11y:{description:'d'}, ...(layout?{layout}:{}) };}

// ---------- (d2) HEATMAP (MarkRect) facet + second-positional y Simpson, color=measure ----------
// x=dim, y=second dim (quant), color=measure(sum). Each y-band falls over x; pooled(color over x) rises.
{
  const rows=[];
  for(const panel of ['P','Q']){
    // y-band 1 (low): x=1..3 color falls 20->12
    rows.push({x:1,yy:1,m:20,panel});rows.push({x:2,yy:1,m:16,panel});rows.push({x:3,yy:1,m:12,panel});
    // y-band 9 (high): x=3..5 color falls 40->32, higher & higher-x => pooled rises
    rows.push({x:3,yy:9,m:40,panel});rows.push({x:4,yy:9,m:36,panel});rows.push({x:5,yy:9,m:32,panel});
  }
  const enc={ x:{field:'x',trait:'EncodingX',type:'quantitative'}, y:{field:'yy',trait:'EncodingY',type:'quantitative'}, color:{field:'m',trait:'EncodingColor',type:'quantitative',aggregate:'sum'} };
  const spec=mkspec(rows,enc,'MarkRect',facetLayout);
  run('(d2) HEATMAP facet + 2nd-positional y Simpson (color=measure=m over x, grouped by yy)', spec);
  console.log('  measure m over x, band (panel,yy): P|1 r=',pearson([1,2,3],[20,16,12]),' P|9 r=',pearson([3,4,5],[40,36,32]));
  console.log('  pooled m over x (all cells):', pearson(rows.map(r=>r.x),rows.map(r=>r.m)));
}

// ---------- (f) MIXED mark faceted + categorical SHAPE Simpson ----------
// mark 'mixed' => markSplitsByRetina false => shape excluded from BOTH partition and series grouping.
// If shape visually separates & each shape-band falls while pooled rises => escape.
{
  const rows=[];
  for(const panel of ['P']){
    rows.push({x:1,y:20,panel,shp:'a'});rows.push({x:2,y:16,panel,shp:'a'});rows.push({x:3,y:12,panel,shp:'a'});
    rows.push({x:3,y:40,panel,shp:'b'});rows.push({x:4,y:36,panel,shp:'b'});rows.push({x:5,y:32,panel,shp:'b'});
  }
  const enc={ x:{field:'x',trait:'EncodingX',type:'quantitative'}, y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'}, shape:{field:'shp',trait:'EncodingShape'} };
  // layered multi-mark => resolveMark 'mixed'
  const spec={ $schema:'https://oods.dev/viz-spec/v1', id:'t', name:'t', data:{name:'d',values:rows}, marks:[{trait:'MarkPoint',encodings:enc},{trait:'MarkLine',encodings:enc}], encoding:enc, a11y:{description:'d'}, layout:facetLayout };
  run('(f) MIXED-mark facet + categorical shape Simpson', spec);
  console.log('  shape band a r=',pearson([1,2,3],[20,16,12]),' shape band b r=',pearson([3,4,5],[40,36,32]));
  console.log('  pooled=', pearson(rows.map(r=>r.x),rows.map(r=>r.y)));
}

// ---------- (f2) MIXED mark faceted + categorical SIZE ... size splits only on point/line/area not mixed ----------
{
  const rows=[];
  rows.push({x:1,y:20,panel:'P',sz:'a'});rows.push({x:2,y:16,panel:'P',sz:'a'});rows.push({x:3,y:12,panel:'P',sz:'a'});
  rows.push({x:3,y:40,panel:'P',sz:'b'});rows.push({x:4,y:36,panel:'P',sz:'b'});rows.push({x:5,y:32,panel:'P',sz:'b'});
  const enc={ x:{field:'x',trait:'EncodingX',type:'quantitative'}, y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'}, size:{field:'sz',trait:'EncodingSize'} };
  const spec={ $schema:'https://oods.dev/viz-spec/v1', id:'t', name:'t', data:{name:'d',values:rows}, marks:[{trait:'MarkPoint',encodings:enc},{trait:'MarkLine',encodings:enc}], encoding:enc, a11y:{description:'d'}, layout:facetLayout };
  run('(f2) MIXED-mark facet + categorical size Simpson', spec);
  console.log('  size band a r=',pearson([1,2,3],[20,16,12]),' size band b r=',pearson([3,4,5],[40,36,32]));
}
