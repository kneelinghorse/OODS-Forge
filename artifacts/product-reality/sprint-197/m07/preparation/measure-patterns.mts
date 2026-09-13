import { measurePatternCensus } from '../../../../../scripts/product-reality/s195-pattern-census.ts';
import { mkdirSync, writeFileSync } from 'node:fs';
const result = await measurePatternCensus({ root: process.cwd() });
const output = 'artifacts/product-reality/sprint-197/m07/patterns';
mkdirSync(output, { recursive: true });
writeFileSync(`${output}/pattern-observations.json`, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ cells: result.cells.length }));
