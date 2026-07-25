import { writeFileSync } from 'node:fs';
import { analyzeVizSpec } from '../packages/viz-core/src/a11y/data-analysis.js';
import { bubbleSpecs, POPULATIONS } from './S165M4_bubblegen.js';
const out: Record<string, (number | null)[]> = {};
for (const [label, honestOnly, seed] of POPULATIONS) {
  out[label] = bubbleSpecs(300, seed, honestOnly).map((s) => {
    const c = analyzeVizSpec(s as never).correlation;
    return c === undefined ? null : c;
  });
}
writeFileSync(process.argv[2], JSON.stringify(out));
console.log('recorded', Object.entries(out).map(([k, v]) => `${k}: ${v.filter((x) => x !== null).length}/300`).join(' | '));
