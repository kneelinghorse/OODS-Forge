import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

function pearson(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { sxy += (xs[i]-mx)*(ys[i]-my); sxx += (xs[i]-mx)**2; syy += (ys[i]-my)**2; }
  if (sxx === 0 || syy === 0) return NaN;
  return sxy / Math.sqrt(sxx*syy);
}

function mk(marks, enc, rows) {
  const encObj = enc;
  return { $schema:'https://oods.dev/viz-spec/v1', id:'t', name:'t', data:{name:'d',values:rows},
    marks: marks.map(t=>({trait:t, encodings:encObj})), encoding:encObj, a11y:{description:'y over x'} };
}

function report(label, spec) {
  const corr = analyzeVizSpec(spec).correlation;
  const ch = resolvePrimaryChannels(spec);
  console.log(`\n=== ${label} ===`);
  console.log('measureChannel=', ch.measureChannel, 'dimensionChannel=', ch.dimensionChannel, 'colorIsMeasure=', ch.colorIsMeasure);
  console.log('corr=', corr, '|', generateNarrativeSummary(spec).summary.slice(0,140));
  return corr;
}

// ---------------------------------------------------------------
// CASE 1: canonical heatmap. x=day dim, y=hour dim (2 bands), color=value aggregated avg.
// Within each hour band value RISES with day; pooled across bands FALLS (Simpson on y positional).
// hour=1 band: day 1..4 -> value 10,20,30,40 (rising, r=+1)
// hour=2 band: day 1..4 -> value 5,15,25,35 (rising, r=+1)  ... make it OPPOSE:
// Make hour bands so pooled x-vs-color falls but within-band rises.
const heatRows = [];
// hour band A (low hour) sits at HIGH color for low day, band B (high hour) at LOW color for high day
// within band: rising. Across: high-day cells are in the low-color band => pooled falls.
// bandA day 1,2 -> color 50,60 (rising)
// bandB day 3,4 -> color 10,20 (rising)
// pooled over (day,color): (1,50)(2,60)(3,10)(4,20) => falls
for (const [d,c] of [[1,50],[2,60]]) heatRows.push({day:d, hour:1, val:c});
for (const [d,c] of [[3,10],[4,20]]) heatRows.push({day:d, hour:2, val:c});
const heatEnc = { x:{field:'day',trait:'EncodingX',type:'quantitative'}, y:{field:'hour',trait:'EncodingY',type:'quantitative'}, color:{field:'val',trait:'EncodingColor',type:'quantitative',aggregate:'average'} };
const heatSpec = mk(['MarkRect'], heatEnc, heatRows);
console.log('bandA pearson(day,val) [(1,50),(2,60)]:', pearson([1,2],[50,60]));
console.log('bandB pearson(day,val) [(3,10),(4,20)]:', pearson([3,4],[10,20]));
console.log('pooled pearson(day,val) all:', pearson([1,2,3,4],[50,60,10,20]));
report('CASE1 heatmap MarkRect y=hour Simpson', heatSpec);

// ---------------------------------------------------------------
// CASE 2: same data/layout but drawn as POINTS (not rect) -> not heatmapColorIsMeasure.
// color has aggregate but color isn't measure channel. measure defaults to y=hour.
const ptEnc = { x:{field:'day',trait:'EncodingX',type:'quantitative'}, y:{field:'hour',trait:'EncodingY',type:'quantitative'}, color:{field:'val',trait:'EncodingColor',type:'quantitative',aggregate:'average'} };
report('CASE2 same as heatmap but MarkPoint (color=agg, not rect)', mk(['MarkPoint'], ptEnc, heatRows));

// ---------------------------------------------------------------
// CASE 3: LAYERED rect+point (mixed) -> isMarkRectGrid false -> correlation NOT hard-suppressed.
// x=day dim, y=hour dim, color=val agg. measure defaults to y=hour. Does it narrate pearson(day,hour)?
report('CASE3 mixed MarkRect+MarkPoint (heatmap escapes rect-grid guard)', mk(['MarkRect','MarkPoint'], ptEnc, heatRows));

// ---------------------------------------------------------------
// CASE 4: real scatter with x,y measure + color RAMP (quantitative color as a pseudo 2nd dim).
// x,y both quant, color=quantitative (continuous ramp). Simpson via color bands.
// This is retinal-quant (disclosed continuous-ramp), but check.
const scRows = [];
// two color bands, each rising in y-vs-x, pooled falling
for (const [x,y,c] of [[1,50,1],[2,60,1],[3,10,9],[4,20,9]]) scRows.push({x,y,c});
const scEnc = { x:{field:'x',trait:'EncodingX',type:'quantitative'}, y:{field:'y',trait:'EncodingY',type:'quantitative'}, color:{field:'c',trait:'EncodingColor',type:'quantitative'} };
console.log('\nscatter cband1 [(1,50),(2,60)]:', pearson([1,2],[50,60]), 'cband9 [(3,10),(4,20)]:', pearson([3,4],[10,20]), 'pooled:', pearson([1,2,3,4],[50,60,10,20]));
report('CASE4 scatter x,y quant + quantitative color ramp Simpson', mk(['MarkPoint'], scEnc, scRows));

// ---------------------------------------------------------------
// CASE 5: horizontal orientation - x=measure, y=nominal dimension, second positional? no. sanity.
