import { readFileSync } from 'node:fs';
import { analyzeVizSpec } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
for (const p of ['examples/viz/patterns/diverging-bar.spec.json','examples/viz/patterns-v2/diverging-bar.spec.json']) {
  const spec = JSON.parse(readFileSync(p, 'utf8'));
  const a = analyzeVizSpec(spec);
  console.log(p, '=> max:', JSON.stringify(a.max), 'min:', JSON.stringify(a.min), 'total:', a.total, 'corr:', a.correlation);
}
