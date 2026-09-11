import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handle as render } from '../../packages/mcp-server/dist/tools/viz.render.js';
import { handle as certify } from '../../packages/mcp-server/dist/tools/artifact.certify.js';
import { ECHARTS_OPERAND_CASES, renderInputFor } from '../../packages/mcp-server/test/tools/s172-echarts-operands.js';

const phase = process.argv[2];
if (phase !== 'before' && phase !== 'after') throw new Error('Supply before or after to retain the built-handler operand profile');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const directory = path.join(root, 'artifacts/product-reality/sprint-195/m04/certify');
fs.mkdirSync(directory, { recursive: true });
const rows = [];
for (const operand of ECHARTS_OPERAND_CASES) {
  const rendered = await render(renderInputFor(operand) as never);
  if (rendered.status !== 'ok') throw new Error(JSON.stringify(rendered.errors));
  const spec = rendered.normalizedSpec!;
  const data = { [operand.branch]: operand.branchData };
  rows.push({ chartType: operand.chartType, input: { spec, data },
    operand: await certify({ spec, data } as never), specOnly: await certify({ spec }),
  });
}
fs.writeFileSync(path.join(directory, `${phase}.json`), JSON.stringify({ phase, buildRevision: JSON.parse(fs.readFileSync(path.join(root, 'packages/mcp-server/dist/build-revision.json'), 'utf8')), rows }, null, 2) + '\n');
console.log(JSON.stringify({ phase, rows: rows.length, coverage: rows.map(row => ({ chartType: row.chartType, coverage: row.operand.coverage, conformant: row.operand.conformant })) }, null, 2));
