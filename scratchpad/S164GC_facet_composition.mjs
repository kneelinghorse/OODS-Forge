import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(xs, ys){const n=xs.length;const mx=xs.reduce((a,b)=>a+b,0)/n,my=ys.reduce((a,b)=>a+b,0)/n;let sxy=0,sxx=0,syy=0;for(let i=0;i<n;i++){sxy+=(xs[i]-mx)*(ys[i]-my);sxx+=(xs[i]-mx)**2;syy+=(ys[i]-my)**2;}if(sxx===0||syy===0)return null;return sxy/Math.sqrt(sxx*syy);}
function subseriesDir(rows, xf, yf, keyf){
  const groups={};
  for(const r of rows){const k=keyf.map(f=>r[f]).join('|');(groups[k]??=[]).push(r);}
  const out={};
  for(const [k,rs] of Object.entries(groups)){
    // aggregate by x (average) since y has aggregate:average
    const byx={};for(const r of rs){(byx[r.x]??=[]).push(r.y);}
    const xs=Object.keys(byx).map(Number);const ys=xs.map(x=>{const a=byx[x];return a.reduce((p,c)=>p+c,0)/a.length;});
    out[k]=xs.length>=2?{r:pearson(xs,ys),n:xs.length}:{r:null,n:xs.length};
  }
  return out;
}

function run(label, spec, extra){
  const c=analyzeVizSpec(spec).correlation;
  console.log(`\n=== ${label} ===`);
  console.log('SUT corr=', c, '|', generateNarrativeSummary(spec).summary.slice(0,90));
  if(extra) extra();
  return c;
}

const facetEnc = (extra={}) => ({
  x:{field:'x',trait:'EncodingX',type:'quantitative'},
  y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'average'},
  ...extra
});
function mkspec(rows, enc, mark='MarkPoint', layout){
  return { $schema:'https://oods.dev/viz-spec/v1', id:'t', name:'t', data:{name:'d',values:rows}, marks:[{trait:mark,encodings:enc}], encoding:enc, a11y:{description:'y over x'}, ...(layout?{layout}:{}) };
}
const facetLayout = { trait:'LayoutFacet', columns:{field:'panel',trait:'FacetField'} };

// ---------- (a) WITHIN-PANEL size Simpson: each panel, each size band falls, panel pooled rises ----------
// Build 2 panels. Within each panel, 2 size bands. Each band falls. Across bands the level shifts up with x => pooled rises.
function withinPanelSizeRows(){
  const rows=[];
  for(const panel of ['P','Q']){
    // size band A: at x=1 y=10, x=2 y=8, x=3 y=6 (falls)
    // size band B: at x=1 y=30, x=2 y=28, x=3 y=26 ... but to get Simpson rise we shift bands by x
    // classic Simpson: band lo at low x high y? no we want pooled RISE while each band FALLS.
    // band A occupies x=1,2 with y descending but high; band B occupies x=3,4 with y descending but higher.
    rows.push({x:1,y:20,panel,sz:1});
    rows.push({x:2,y:16,panel,sz:1});
    rows.push({x:3,y:12,panel,sz:1});   // band sz=1 falls 20->12
    rows.push({x:3,y:40,panel,sz:9});
    rows.push({x:4,y:36,panel,sz:9});
    rows.push({x:5,y:32,panel,sz:9});   // band sz=9 falls 40->32, but sits higher & at higher x => pooled rises
  }
  return rows;
}
{
  const rows=withinPanelSizeRows();
  const enc=facetEnc({size:{field:'sz',trait:'EncodingSize',type:'quantitative'}});
  const spec=mkspec(rows,enc,'MarkPoint',facetLayout);
  run('(a) within-panel size Simpson (facet cols=panel, size quant)', spec, ()=>{
    console.log(' partition should be {panel}; grouping {sz}. Hand sub-series by (panel,sz):');
    const d=subseriesDir(rows,'x','y',['panel','sz']);console.log('  ',d);
    console.log('  pooled over (panel,sz cells) all points:', pearson(rows.map(r=>r.x),rows.map(r=>r.y)));
  });
}

// ---------- (b) CROSS-PANEL Simpson: each panel falls, pooled rises ----------
function crossPanelRows(){
  const rows=[];
  // panel P at low x, high-ish falling; panel Q at high x, higher falling => pooled rises across panels
  [['P',1,20],['P',2,16],['P',3,12]].forEach(([p,x,y])=>rows.push({x,y,panel:p}));
  [['Q',4,44],['Q',5,40],['Q',6,36]].forEach(([p,x,y])=>rows.push({x,y,panel:p}));
  return rows;
}
{
  const rows=crossPanelRows();
  const enc=facetEnc();
  const spec=mkspec(rows,enc,'MarkPoint',facetLayout);
  run('(b) cross-panel Simpson (each panel falls, pooled rises)', spec, ()=>{
    console.log('  panel P dir r=',pearson([1,2,3],[20,16,12]),' panel Q dir r=',pearson([4,5,6],[44,40,36]));
    console.log('  pooled=',pearson(rows.map(r=>r.x),rows.map(r=>r.y)));
  });
}

// ---------- (c) STACKING gap: faceted STACKED area/bar + quantitative size grouping axis ----------
// Under stacking drawnCellKeyFields DROPS series fields; quant size is skipped by partition => size in NEITHER gate.
// declared aggregate = 'sum' (stack total) on y, mark area/bar (markStacks). facet=panel partition.
// Within each panel, size bands each FALL; pooled rises. If size escapes both gates => narrate = phantom.
function stackSizeRows(){
  const rows=[];
  for(const panel of ['P','Q']){
    rows.push({x:1,y:20,panel,sz:1});
    rows.push({x:2,y:16,panel,sz:1});
    rows.push({x:3,y:12,panel,sz:1});
    rows.push({x:3,y:40,panel,sz:9});
    rows.push({x:4,y:36,panel,sz:9});
    rows.push({x:5,y:32,panel,sz:9});
  }
  return rows;
}
{
  const rows=stackSizeRows();
  const enc={ x:{field:'x',trait:'EncodingX',type:'quantitative'}, y:{field:'y',trait:'EncodingY',type:'quantitative',aggregate:'sum'}, size:{field:'sz',trait:'EncodingSize',type:'quantitative'} };
  const spec=mkspec(rows,enc,'MarkArea',facetLayout);
  run('(c) STACKED faceted area + quant size Simpson (aggregate:sum)', spec, ()=>{
    console.log('  channels=',resolvePrimaryChannels(spec));
    const d=subseriesDir(rows,'x','y',['panel','sz']);console.log('  sub-series by (panel,sz):',d);
  });
}

// ---------- (d) facet + SECOND-POSITIONAL y dimension Simpson (heatmap-ish, color=measure) ----------
// x=dim quant, y=second dim quant, color=measure(sum). groupingFields should include y. facet=panel.
// Each y-band falls over x, pooled rises.
function secondPosRows(){
  const rows=[];
  for(const panel of ['P']){
    rows.push({x:1,yy:1,m:20,panel});
    rows.push({x:2,yy:1,m:16,panel});
    rows.push({x:3,yy:1,m:12,panel});
    rows.push({x:3,yy:9,m:40,panel});
    rows.push({x:4,yy:9,m:36,panel});
    rows.push({x:5,yy:9,m:32,panel});
  }
  return rows;
}
{
  const rows=secondPosRows();
  const enc={ x:{field:'x',trait:'EncodingX',type:'quantitative'}, y:{field:'yy',trait:'EncodingY',type:'quantitative'}, color:{field:'m',trait:'EncodingColor',type:'quantitative',aggregate:'sum'} };
  const spec=mkspec(rows,enc,'MarkPoint',facetLayout);
  run('(d) facet + second-positional y Simpson (color=measure)', spec, ()=>{
    console.log('  channels=',resolvePrimaryChannels(spec));
    // measure=m over x, grouped by yy. sub-series (panel,yy):
    const g={};for(const r of rows){(g[r.panel+'|'+r.yy]??=[]).push(r);}
    for(const[k,rs]of Object.entries(g)){console.log('   band',k,'r=',pearson(rs.map(r=>r.x),rs.map(r=>r.m)));}
  });
}

// ---------- (e) facet where panels RISE but one panel has a strong internal size opposition ----------
function mixedPanelRows(){
  const rows=[];
  // Panel P: clean rise (no size structure) -> panel dir +
  rows.push({x:1,y:5,panel:'P',sz:1});rows.push({x:2,y:10,panel:'P',sz:1});rows.push({x:3,y:15,panel:'P',sz:1});
  // Panel Q: size Simpson - each size band falls, panel pooled rises
  rows.push({x:1,y:20,panel:'Q',sz:1});rows.push({x:2,y:16,panel:'Q',sz:1});rows.push({x:3,y:12,panel:'Q',sz:1});
  rows.push({x:3,y:40,panel:'Q',sz:9});rows.push({x:4,y:36,panel:'Q',sz:9});rows.push({x:5,y:32,panel:'Q',sz:9});
  return rows;
}
{
  const rows=mixedPanelRows();
  const enc=facetEnc({size:{field:'sz',trait:'EncodingSize',type:'quantitative'}});
  const spec=mkspec(rows,enc,'MarkPoint',facetLayout);
  run('(e) facet: panel P rises clean, panel Q internal size Simpson', spec, ()=>{
    const d=subseriesDir(rows,'x','y',['panel','sz']);console.log('  sub-series:',d);
    console.log('  pooled=',pearson(rows.map(r=>r.x),rows.map(r=>r.y)));
  });
}
