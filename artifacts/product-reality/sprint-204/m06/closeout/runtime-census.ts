/**
 * s204-m06 runtime generation census: every row of packages/mcp-server/registry/runtime-cells.v1.json is
 * re-composed and re-generated at the closeout head, and its artifactHash is compared with the registry's.
 * The registry did not move in Sprint 204 (no object was added and no re-sweep was run), while m02 changed the
 * screen producers (empty card bodies, slot dates, status timestamps, the Statusable list badge). So a hash that
 * no longer equals a fresh generation is EXPECTED where m02 reshaped the screen, and each one is attributed by
 * generating the same row at the base in a separate pass — this census states equal/unequal, it does not
 * certify. This is the generation layer, not a browser sweep.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { handle as compose } from '../../../../../packages/mcp-server/src/tools/design.compose.js';
import { handle as generate } from '../../../../../packages/mcp-server/src/tools/code.generate.js';

const root = path.resolve(import.meta.dirname, '../../../../..');
const registry = JSON.parse(fs.readFileSync(path.join(root, 'packages/mcp-server/registry/runtime-cells.v1.json'), 'utf8'));
const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const rows: Array<{ id: string; registryHash: string; generatedHash: string; equal: boolean }> = [];
for (const old of registry.rows) {
  const id = `${old.object}/${old.context}/${old.framework}`;
  const composed = await compose({ object: old.object, context: old.context });
  if (composed.status !== 'ok') throw new Error(`${id}: compose ${composed.status}`);
  const result = await generate({ schema: composed.schema, framework: old.framework, profile: 'build', ...(old.context === 'workflow' ? {} : { options: { styling: 'tokens', typescript: true } }) });
  if (result.status !== 'ok') throw new Error(`${id}: generate ${JSON.stringify(result.errors)}`);
  const generatedHash = result.artifact!.contentHash;
  rows.push({ id, registryHash: old.artifactHash, generatedHash, equal: generatedHash === old.artifactHash });
}
const unequal = rows.filter(row => !row.equal);
const report = { builderSelfCertified: false, head, registryHead: registry.head, registryRunId: registry.runId ?? null, kind: 'generation-hash census: registry artifactHash vs a fresh compose+generate at the closeout head (no browser sweep)', compared: rows.length, equal: rows.length - unequal.length, unequal: unequal.map(row => row.id), objects: [...new Set(registry.rows.map((row: any) => row.object))].length, rows };
fs.writeFileSync(path.join(import.meta.dirname, 'runtime-census.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ compared: report.compared, equal: report.equal, unequal: report.unequal, registryHead: report.registryHead }));
