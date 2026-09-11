/** Fresh native pattern census without rewriting frozen generated source. */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { measurePatternCensus, writePatternOutputs } from '../../../../scripts/product-reality/s195-pattern-census.js';

const folder = 'artifacts/product-reality/sprint-195/m07/patterns';
const gitHead = () => execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const head = gitHead();
const observations = await measurePatternCensus();
const rows = writePatternOutputs(observations, { check: true });
assert.equal(gitHead(), head, 'Source head changed during native pattern measurements');
mkdirSync(folder, { recursive: true });
const write = (name: string, value: unknown) => writeFileSync(`${folder}/${name}`, JSON.stringify(value, null, 2) + '\n');
write('pattern-observations.json', observations);
write('pattern-census.json', rows);
write('execution.json', { head, afterHead: gitHead(), status: 'passed', cells: observations.cells.length,
  publicIdentities: rows.filter(row => row.publicSvg).length, generatedSourceBytesMatched: true,
  command: process.argv, builderSelfCertified: false });
console.log(JSON.stringify({ head, cells: observations.cells.length, publicIdentities: rows.filter(row => row.publicSvg).length }));
