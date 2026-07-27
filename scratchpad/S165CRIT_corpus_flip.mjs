// S165 critic — do the 6 corpus keep-controls that narrate today survive the proposal?
import { readFileSync } from 'node:fs';
import { analyzeVizSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
const mod = await import('/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/scratchpad/S165CRIT_lib.mjs');
const { derive } = mod;
const ROOT = '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/examples';
const FILES = [
  '/viz/patterns/bubble-distribution.spec.json',
  '/viz/patterns/correlation-scatter.spec.json',
  '/viz/patterns-v2/bubble-distribution.spec.json',
  '/viz/patterns-v2/correlation-scatter.spec.json',
  '/viz/patterns-v2/linked-brush-scatter.spec.json',
  '/viz/scatter-chart.spec.json',
];
const out = [];
for (const f of FILES) {
  const spec = JSON.parse(readFileSync(ROOT + f, 'utf8'));
  const dim = spec.encoding?.x?.field, meas = spec.encoding?.y?.field;
  const live = analyzeVizSpec(spec).correlation;
  const cur = derive(spec, 'current', dim, meas);
  const lit = derive(spec, 'memo-literal', dim, meas);
  const amd = derive(spec, 'amended', dim, meas);
  const cal = (live === undefined && cur.corr === undefined) || (live !== undefined && cur.corr !== undefined && Math.abs(live - cur.corr) < 1e-9);
  out.push({ file: f.split('/').pop(), dist: live, refCurrent: cur.corr, calibrated: cal ? 'OK' : 'MISMATCH',
             P: JSON.stringify(cur.partition), G: JSON.stringify(cur.grouping), SEP: JSON.stringify(cur.sep),
             s165: lit.corr === undefined ? 'SILENCED' : lit.corr, amended: amd.corr === undefined ? 'SILENCED' : amd.corr });
}
console.table(out);
