import { analyzeVizSpec, generateNarrativeSummary, toEChartsOption, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
const B = (field, trait, extra = {}) => ({ field, trait, ...extra });

function report(name, spec) {
  console.log('\n=== ' + name + ' ===');
  try {
    const pc = resolvePrimaryChannels(spec);
    console.log('primaryChannels:', JSON.stringify(pc));
    const a = analyzeVizSpec(spec);
    console.log('analysis max/min/total:', a.max?.value ?? a.max, a.min?.value ?? a.min, a.total);
    try { const o = toEChartsOption(spec); if (o.dataset) console.log('echarts dataset[0].source:', JSON.stringify(o.dataset[0]?.source)); if (o.visualMap) console.log('visualMap:', o.visualMap.min,'..',o.visualMap.max); } catch(e){ console.log('echarts ERR', e.message); }
    const ns = generateNarrativeSummary(spec);
    console.log('keyFindings:', JSON.stringify(ns.keyFindings));
  } catch (e) { console.log('ERR', e.message); }
}

// ANGLE A: detail on a heatmap. x=day,y=hour, color measure=sum(v), detail=user.
// Vega/ECharts heatmap draws ONE rect per (day,hour). But detail splits the spine.
report('detail-on-heatmap sum', {
  $schema:'x', id:'h1', name:'detail heatmap',
  data:{ name:'d', values:[
    { day:'Mon', hour:'9', user:'a', v:10 },
    { day:'Mon', hour:'9', user:'b', v:20 },  // same (Mon,9) rect, different detail
    { day:'Mon', hour:'10', user:'a', v:5 },
  ]},
  marks:[{ trait:'MarkRect', encodings:{
    x:B('day','EncodingX',{scale:'band'}), y:B('hour','EncodingY',{scale:'band'}),
    color:B('v','EncodingColor',{aggregate:'sum', scale:'linear'}),
    detail:B('user','EncodingDetail'),
  }}],
  encoding:{
    x:B('day','EncodingX',{scale:'band'}), y:B('hour','EncodingY',{scale:'band'}),
    color:B('v','EncodingColor',{aggregate:'sum', scale:'linear'}),
    detail:B('user','EncodingDetail'),
  },
  a11y:{ description:'d' },
});

// ANGLE B: size on a heatmap (retinal, unconditionally added to spine, but heatmap draws no size)
report('size-on-heatmap max', {
  $schema:'x', id:'h2', name:'size heatmap',
  data:{ name:'d', values:[
    { day:'Mon', hour:'9', sz:'s', v:10 },
    { day:'Mon', hour:'9', sz:'L', v:40 },
    { day:'Mon', hour:'10', sz:'s', v:5 },
  ]},
  marks:[{ trait:'MarkRect', encodings:{
    x:B('day','EncodingX',{scale:'band'}), y:B('hour','EncodingY',{scale:'band'}),
    color:B('v','EncodingColor',{aggregate:'max', scale:'linear'}),
    size:B('sz','EncodingSize'),
  }}],
  encoding:{
    x:B('day','EncodingX',{scale:'band'}), y:B('hour','EncodingY',{scale:'band'}),
    color:B('v','EncodingColor',{aggregate:'max', scale:'linear'}),
    size:B('sz','EncodingSize'),
  },
  a11y:{ description:'d' },
});

// ANGLE C: horizontal aggregated bar with color=series (stacked). x=sum(hours), y=team, color=proj.
report('horizontal stacked agg bar', {
  $schema:'x', id:'b1', name:'hbar',
  data:{ name:'d', values:[
    { team:'A', proj:'p1', hours:30 },
    { team:'A', proj:'p2', hours:20 },
    { team:'B', proj:'p1', hours:10 },
  ]},
  marks:[{ trait:'MarkBar', encodings:{
    x:B('hours','EncodingX',{aggregate:'sum'}), y:B('team','EncodingY',{scale:'band'}),
    color:B('proj','EncodingColor'),
  }}],
  encoding:{
    x:B('hours','EncodingX',{aggregate:'sum'}), y:B('team','EncodingY',{scale:'band'}),
    color:B('proj','EncodingColor'),
  },
  a11y:{ description:'d' },
});
