/**
 * s205-m01: the positive craft bar's receipt — every screen of every object that does not say what it must.
 *
 *   pnpm exec tsx scripts/product-reality/s205-m01-craft-says.ts artifacts/product-reality/sprint-205/m01/craft-says.json
 */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { craftSays } from '../../packages/mcp-server/test/product-reality/craft-says.js';

const result = await craftSays();
const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
fs.writeFileSync(process.argv[2]!, JSON.stringify({ measuredAt: new Date().toISOString(), head, dirty: execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim().length > 0, ...result, failing: result.failures.length }, null, 2) + '\n');
console.log(JSON.stringify({ screens: result.screens, refusedByDesign: result.refusedByDesign.length, failing: result.failures.length }));
