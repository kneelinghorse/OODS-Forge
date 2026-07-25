// s165 m2: record the HEAD/dist correlation decision for the deterministic sweep. dist is verified at
// HEAD (contains neither separableFields nor correlationSeparabilityEvidenceOf), so this vector is a
// GENUINELY INDEPENDENT operand — a recorded measurement of the shipped behaviour, not a re-derivation.
import { analyzeVizSpec } from '../packages/viz-core/dist/index.js';
import { generateSweepSpecs, specsChecksum } from './S165M2_gen.js';

const SEED = 0x5165;
const COUNT = 400;
const specs = generateSweepSpecs(COUNT, SEED);
const checksum = specsChecksum(specs);

let defined = 0;
let undef = 0;
const vector = specs
  .map((spec) => {
    const corr = (analyzeVizSpec(spec as never) as { correlation?: number }).correlation;
    if (corr === undefined) {
      undef += 1;
      return 'U';
    }
    defined += 1;
    return 'D';
  })
  .join('');

console.log(`seed=0x${SEED.toString(16)} count=${COUNT} checksum=${checksum}`);
console.log(`HEAD decisions: ${defined} DEFINED, ${undef} UNDEFINED`);
console.log('\nconst HEAD_DECISIONS =');
for (let i = 0; i < vector.length; i += 80) {
  console.log(`  '${vector.slice(i, i + 80)}' +`);
}
