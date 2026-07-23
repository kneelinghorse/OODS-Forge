import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { analyzeVizSpec, generateNarrativeSummary, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';

const files = execSync("find examples/viz -name '*.spec.json' -not -path '*worktrees*'", {cwd:'/Users/systemsystems/portfolio/Design-Tools/OODS-Forge'}).toString().trim().split('\n');
for (const f of files) {
  let spec;
  try { spec = JSON.parse(readFileSync('/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/'+f,'utf8')); } catch(e){ continue; }
  let rpc;
  try { rpc = resolvePrimaryChannels(spec); } catch(e){ continue; }
  // interested in measure=x (horizontal) or color
  if (rpc.measureChannel === 'x' || rpc.colorIsMeasure) {
    console.log('\n### '+f+'  rpc='+JSON.stringify(rpc));
    try {
      const a = analyzeVizSpec(spec);
      const n = generateNarrativeSummary(spec);
      console.log('  mark:', a.mark, 'corr:', JSON.stringify(a.correlation));
      console.log('  summary:', n.summary);
      console.log('  kf:', JSON.stringify(n.keyFindings));
    } catch(e){ console.log('  ERR', e.message); }
  }
}
console.log('\n--- done ---');
