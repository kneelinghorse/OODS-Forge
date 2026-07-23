import { analyzeVizSpec, generateNarrativeSummary, toEChartsOption, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
const B = (field, trait, extra = {}) => ({ field, trait, ...extra });

function report(name, spec) {
  console.log('\n=== ' + name + ' ===');
  const pc = resolvePrimaryChannels(spec);
  console.log('primaryChannels:', JSON.stringify(pc));
  const a = analyzeVizSpec(spec);
  console.log('analysis max/min/total:', a.max?.value ?? a.max, a.min?.value ?? a.min, a.total);
  const o = toEChartsOption(spec);
  console.log('echarts dataset[0].source:', JSON.stringify(o.dataset?.[0]?.source));
  if (o.visualMap) console.log('visualMap:', o.visualMap.min,'..',o.visualMap.max);
  console.log('keyFindings:', JSON.stringify(generateNarrativeSummary(spec).keyFindings));
}

// PLAIN aggregated heatmap, multiple rows per (day,hour) — does ECharts dataset aggregate?
report('plain agg heatmap sum', {
  $schema:'x', id:'p1', name:'agg heatmap',
  data:{ name:'d', values:[
    { day:'Mon', hour:'9', v:10 },
    { day:'Mon', hour:'9', v:20 },   // same rect → sum 30
    { day:'Mon', hour:'10', v:5 },
    { day:'Tue', hour:'9', v:7 },
  ]},
  marks:[{ trait:'MarkRect', encodings:{
    x:B('day','EncodingX',{scale:'band'}), y:B('hour','EncodingY',{scale:'band'}),
    color:B('v','EncodingColor',{aggregate:'sum', scale:'linear'}),
  }}],
  encoding:{
    x:B('day','EncodingX',{scale:'band'}), y:B('hour','EncodingY',{scale:'band'}),
    color:B('v','EncodingColor',{aggregate:'sum', scale:'linear'}),
  },
  a11y:{ description:'d' },
});

// FACETED aggregated heatmap (the s159 m5 regression class): columns=region, cells per (day,hour,region)
report('faceted agg heatmap', {
  $schema:'x', id:'f1', name:'facet heatmap',
  data:{ name:'d', values:[
    { day:'Mon', hour:'9', region:'N', v:10 },
    { day:'Mon', hour:'9', region:'S', v:90 },  // different panel
    { day:'Mon', hour:'10', region:'N', v:5 },
  ]},
  marks:[{ trait:'MarkRect', encodings:{
    x:B('day','EncodingX',{scale:'band'}), y:B('hour','EncodingY',{scale:'band'}),
    color:B('v','EncodingColor',{aggregate:'sum', scale:'linear'}),
  }}],
  encoding:{
    x:B('day','EncodingX',{scale:'band'}), y:B('hour','EncodingY',{scale:'band'}),
    color:B('v','EncodingColor',{aggregate:'sum', scale:'linear'}),
  },
  layout:{ trait:'LayoutFacet', columns:{ field:'region' } },
  a11y:{ description:'d' },
});
