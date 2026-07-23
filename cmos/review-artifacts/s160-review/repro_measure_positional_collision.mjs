// FINDING REPRO — measure-field == positional-field: spine's measure exclusion drops the x key →
// ECharts cells MERGE across x (regression vs 0b2da4d, which keyed [xField,yField] and emitted 2 cells).
// Fixture: MarkRect, x=hour, y=day, color={field:'hour', aggregate:'count'} ("count of records per hour/day").
// HAND ORACLE: drawn cells per (hour,day): ('9','Mon')=2 rows → count 2; ('10','Mon')=1 → count 1.
//   Pre-s160 (git show 0b2da4d data-analysis.ts ~:207): keyFields=[xField,yField] → 2 cells
//     [{hour:<2 overwrites '9'>, day:'Mon'}, {hour:<1>, day:'Mon'}]  (x-overwrite bug pre-existing).
//   Post-s160: drawnCellKeyFields excludes measure.field('hour') from POSITIONAL x → keyFields=['day']
//     → ONE pooled cell [{day:'Mon', hour:3}]; visualMap 3..3 (pre: 1..2).
//   Guard side: drawn set = merged {3}; projection keys [dimension 'hour','day'] → cells 2,1 →
//     honest per-cell extrema max=2/min=1 NULLED by the guard (over-fire, fail-safe direction).
import { analyzeVizSpec, generateNarrativeSummary, toEChartsOption } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

const B = (field, trait, extra = {}) => ({ field, trait, ...extra });
const spec = {
  $schema: 'https://oods.dev/viz-spec/v1', id: 'dg', name: 'count-of-x heatmap',
  data: { name: 'dg', values: [
    { hour: '9', day: 'Mon' }, { hour: '9', day: 'Mon' }, { hour: '10', day: 'Mon' },
  ]},
  marks: [{ trait: 'MarkRect', encodings: {
    x: B('hour', 'EncodingX', { scale: 'band' }), y: B('day', 'EncodingY', { scale: 'band' }),
    color: B('hour', 'EncodingColor', { aggregate: 'count' }),
  }}],
  encoding: {
    x: B('hour', 'EncodingX', { scale: 'band' }), y: B('day', 'EncodingY', { scale: 'band' }),
    color: B('hour', 'EncodingColor', { aggregate: 'count' }),
  },
  a11y: { description: 'counts' },
};
const o = toEChartsOption(spec);
console.log('cells (expect 2 per hand-oracle / pre-s160; observed 1 merged):', JSON.stringify(o.dataset[0].source));
console.log('visualMap:', o.visualMap?.min, '..', o.visualMap?.max, '(hand: 1..2)');
const a = analyzeVizSpec(spec);
console.log('analysis max/min (guard-nulled honest 2/1):', a.max, a.min, 'total:', a.total);
console.log('keyFindings:', JSON.stringify(generateNarrativeSummary(spec).keyFindings));
