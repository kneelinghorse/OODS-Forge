// s165 m2: monotonicity (s164_undefined ⇒ s165_undefined) measured against the RECORDED HEAD vector,
// plus the newly-silenced rate over the same deterministic sweep (input to the m4 §6.1 measurement).
import { analyzeVizSpec } from '../packages/viz-core/src/a11y/data-analysis.js';
import { analyzeVizSpec as analyzeHead } from '../packages/viz-core/dist/index.js';
import { generateSweepSpecs, specsChecksum } from './S165M2_gen.js';

const specs = generateSweepSpecs(400, 0x5165);
console.log(`checksum=${specsChecksum(specs)}`);

let violations = 0;
let headDefined = 0;
let newlySilenced = 0;
let bothDefined = 0;
let valueMoved = 0;
const violationDetail: string[] = [];
const silencedDetail: string[] = [];

specs.forEach((spec, i) => {
  const head = (analyzeHead(spec as never) as { correlation?: number }).correlation;
  const sut = analyzeVizSpec(spec as never).correlation;
  if (head === undefined && sut !== undefined) {
    violations += 1;
    violationDetail.push(`#${i} head=undefined sut=${sut}`);
  }
  if (head !== undefined) {
    headDefined += 1;
    if (sut === undefined) {
      newlySilenced += 1;
      if (silencedDetail.length < 8) silencedDetail.push(`#${i} head=${head}`);
    } else {
      bothDefined += 1;
      if (sut !== head) {
        valueMoved += 1;
        console.log(`  **VALUE MOVED** #${i} head=${head} sut=${sut}`);
      }
    }
  }
});

console.log(`\nMONOTONICITY violations (head=undefined but s165 narrates): ${violations}`);
for (const v of violationDetail.slice(0, 10)) console.log('   ', v);
console.log(`\nHEAD narrated: ${headDefined}/400`);
console.log(`  newly SILENCED by s165: ${newlySilenced}  (${((newlySilenced / headDefined) * 100).toFixed(1)}% of HEAD-narrating, ${((newlySilenced / 400) * 100).toFixed(1)}% global)`);
console.log(`  still narrating:        ${bothDefined}`);
console.log(`  VALUE moved on a still-narrating spec: ${valueMoved} (must be 0 — s165 changes only the emit decision)`);
console.log('\nsample newly-silenced:');
for (const s of silencedDetail) console.log('   ', s);
