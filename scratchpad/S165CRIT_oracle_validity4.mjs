// S165 critic / oracle-validity — PART 4: oracle EVALUABILITY (can the oracle even be computed
// for every spec analyzeVizSpec accepts?) + the ECharts scope gap.
import { toVegaLiteSpec, toEChartsOption, analyzeVizSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

const rows = [{ x: 1, y: 10, sh: 'p', seg: 'a', sz: 1, det: 'd' }, { x: 2, y: 20, sh: 'q', seg: 'b', sz: 2, det: 'e' }, { x: 3, y: 30, sh: 'p', seg: 'a', sz: 1, det: 'd' }];
const enc = {
  x: { field: 'x', trait: 'EncodingX', type: 'quantitative' },
  y: { field: 'y', trait: 'EncodingY', type: 'quantitative', aggregate: 'average' },
  color: { field: 'seg', trait: 'EncodingColor' },
  size: { field: 'sz', trait: 'EncodingSize', type: 'quantitative' },
  shape: { field: 'sh', trait: 'EncodingShape' },
  detail: { field: 'det', trait: 'EncodingDetail' },
};
const mk = (traits) => ({ $schema: 'https://oods.dev/viz-spec/v1', id: 't', name: 't', data: { name: 'd', values: rows },
  marks: traits.map((t) => ({ trait: t, encodings: enc })), encoding: enc, a11y: { description: 'y over x' } });

console.log('=== ORACLE EVALUABILITY: does toVegaLiteSpec compile every spec analyzeVizSpec accepts? ===');
for (const traits of [['MarkPoint'], ['MarkLine', 'MarkPoint'], ['MarkRect'], ['MarkRule'], ['MarkText'],
  ['MarkArc'], ['MarkLine', 'MarkRule'], ['MarkPoint', 'MarkArc'], ['MarkGeoshape']]) {
  const spec = mk(traits);
  let vlOk = 'ok', ecOk = 'ok';
  try { toVegaLiteSpec(spec); } catch (e) { vlOk = 'THROWS: ' + e.constructor.name + ' — ' + e.message; }
  try { toEChartsOption(spec); } catch (e) { ecOk = 'THROWS: ' + e.constructor.name; }
  let corr; try { corr = analyzeVizSpec(spec).correlation; } catch (e) { corr = 'analyze THREW'; }
  console.log(String(JSON.stringify(traits)).padEnd(30), 'analyze.correlation=' + String(corr).padEnd(8), '| VL:', vlOk.padEnd(60), '| ECharts:', ecOk);
}

console.log('\n=== ECharts: which fields does the ECharts path actually split by? ===');
const spec = mk(['MarkPoint']);
const ec = toEChartsOption(spec);
console.log('series count:', ec.series.length);
console.log('series[0].encode:', JSON.stringify(ec.series[0].encode));
console.log('series[0].colorBy:', ec.series[0].colorBy);
console.log('shape present anywhere in the ECharts option?', JSON.stringify(ec).includes('"sh"'));
console.log('-> ECharts has NO shape channel: survivor A\'s separating field does not exist on that renderer.');
console.log('-> detail routed to tooltip only:', JSON.stringify(ec.series[0].encode.tooltip));
