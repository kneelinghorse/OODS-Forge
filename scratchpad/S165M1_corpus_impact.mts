// s165 m1 verification: corpus impact of (a) the §3.5 layered suppression and (b) the re-gated early
// return. Runs against SRC (not dist) so it reflects the working tree.
import { globSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  analyzeVizSpec,
  separableFields,
  layeredCorrelationUnsupported,
  resolvePrimaryChannels,
  getEncodingBinding,
} from '../packages/viz-core/src/a11y/data-analysis.js';

const REPO = path.resolve(import.meta.dirname, '..');
const GLOBS = ['examples/viz/**/*.spec.json'];
const files = [...new Set(GLOBS.flatMap((g) => globSync(path.join(REPO, g))))].sort();

const layered: string[] = [];
const withSeparable: { name: string; fields: string[]; corr: unknown }[] = [];
const corrDefined: { name: string; corr: unknown }[] = [];
let corrUndefined = 0;

for (const file of files) {
  const spec = JSON.parse(readFileSync(file, 'utf8')) as any;
  const short = path.relative(REPO, file);
  if (!Array.isArray(spec.marks)) continue;
  if (layeredCorrelationUnsupported(spec)) layered.push(short);
  const ch = resolvePrimaryChannels(spec);
  const dim = getEncodingBinding(spec, ch.dimensionChannel)?.field ?? '';
  const meas = getEncodingBinding(spec, ch.measureChannel)?.field ?? '';
  const sf = separableFields(spec, dim, meas);
  const a = analyzeVizSpec(spec);
  if (sf.length > 0) withSeparable.push({ name: short, fields: sf, corr: a.correlation });
  if (a.correlation === undefined) corrUndefined += 1;
  else corrDefined.push({ name: short, corr: a.correlation });
}

console.log(`corpus specs: ${files.length}`);
console.log(`correlation DEFINED: ${corrDefined.length}  UNDEFINED: ${corrUndefined}`);
console.log(`\n§3.5 layeredCorrelationUnsupported fires on ${layered.length}:`);
for (const l of layered) console.log('   ', l);
console.log(`\nspecs with non-empty separableFields: ${withSeparable.length}`);
for (const w of withSeparable) console.log(`    corr=${String(w.corr).padEnd(8)} sf=[${w.fields}]  ${w.name}`);
console.log('\nspecs that NARRATE a correlation:');
for (const c of corrDefined) console.log(`    ${String(c.corr).padEnd(8)} ${c.name}`);
