import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import { handle } from '../../../../packages/mcp-server/src/tools/design.preview.js';
const names = async () => (await fs.readdir(os.tmpdir())).filter(name => name.startsWith('oods-design-preview-')).sort();
const before = await names();
let observed;
try { await handle({ object: 'Subscription', context: 'list', framework: 'react' }); assert.fail('stopped loop must not render'); }
catch (error: any) { assert.equal(error.opiCode, 'OODS-N019'); observed = error.toStructured(); }
const after = await names(); assert.deepEqual(after, before);
await fs.writeFile(new URL('./preview-stopped.json', import.meta.url), JSON.stringify({ status: 'passed', error: observed, newOutputDirectories: 0 }, null, 2) + '\n');
console.log('Stopped loop: OODS-N019, no partial output.');
