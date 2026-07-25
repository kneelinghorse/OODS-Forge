// S165 PRE-LOCK CRITIC — lens does-it-kill-ABC, part 4: sweep the shipped example corpus for
// keep-control breaks (currently NARRATES -> proposal SUPPRESSES) and for under-suppression flips.
import { analyzeVizSpec, resolvePrimaryChannels } from '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core/dist/index.js';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
const src = readFileSync('/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/scratchpad/S165CRIT_does_it_kill_ABC.mjs', 'utf8');
const body = src.split('// ───────────────────────── fixtures')[0].split("dist/index.js';")[1];
const { decide } = new Function('analyzeVizSpec', 'resolvePrimaryChannels', `${body}\nreturn { decide };`)(analyzeVizSpec, resolvePrimaryChannels);

const roots = ['/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/examples/viz'];
const files = [];
const walk = (d) => { for (const e of readdirSync(d)) { const p = join(d, e); if (statSync(p).isDirectory()) walk(p); else if (e.endsWith('.spec.json')) files.push(p); } };
for (const r of roots) walk(r);

let parity = 0, breaks = 0, under = 0, n = 0;
for (const f of files.sort()) {
  let spec; try { spec = JSON.parse(readFileSync(f, 'utf8')); } catch { continue; }
  if (!spec?.marks || !spec?.data?.values) continue;
  let sut, shipped, prop;
  try { sut = analyzeVizSpec(spec).correlation; shipped = decide(spec, 'shipped'); prop = decide(spec, 'draft-amended-early-return'); } catch (e) { continue; }
  n++;
  const ok = Object.is(sut, shipped.r);
  if (!ok) { parity++; }
  const flipSilent = shipped.r !== undefined && prop.r === undefined;
  const flipLoud = shipped.r === undefined && prop.r !== undefined;
  if (flipSilent) breaks++;
  if (flipLoud) under++;
  if (flipSilent || flipLoud || !ok) {
    console.log(`${!ok ? '[parity-mismatch]' : flipSilent ? '[KEEP-CONTROL BREAK]' : '[UNDER-SUPPRESSION]'} ${f.split('/examples/viz/')[1]}`);
    console.log(`    dist=${sut}  shipped-ref=${shipped.r}  proposal=${prop.r}`);
    console.log(`    partition=${JSON.stringify(shipped.partitionFields)} grouping=${JSON.stringify(shipped.groupingFields)} separable=${JSON.stringify(prop.separableFields)}`);
    console.log(`    shipped : ${shipped.why}`);
    console.log(`    proposal: ${prop.why}`);
  }
}
console.log(`\nswept ${n} corpus specs | parity mismatches ${parity} | keep-control BREAKS (narrate->silent) ${breaks} | under-suppression flips ${under}`);
