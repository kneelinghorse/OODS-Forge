import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { handle as compose } from '../../../../packages/mcp-server/src/tools/design.compose.js';
import { workflowSampleData } from '../../../../packages/mcp-server/src/codegen/workflow-data-emitter.js';
import { OBJECTS, supportsWorkflow } from '../../../../packages/mcp-server/src/lib/runtime-ledger.js';
const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
for (const object of OBJECTS) {
  const { schema, status, errors } = await compose({ object, context: supportsWorkflow(object) ? 'workflow' : 'inline' });
  if (status !== 'ok') throw new Error(JSON.stringify(errors));
  const { records, seedTable } = workflowSampleData(schema);
  const dir = path.resolve('artifacts/product-reality/sprint-198/m05/seeds', object);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, 'seed-table.json'), JSON.stringify({ object, sourceHead: head, policy: 'workflowSampleData', seedAt: '2026-09-08T12:00:00.000Z', records: records.length, values: seedTable }, null, 2) + '\n');
}
