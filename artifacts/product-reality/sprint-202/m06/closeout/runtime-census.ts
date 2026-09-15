/**
 * s202-m06 runtime generation census: every row of packages/mcp-server/registry/runtime-cells.v1.json is
 * re-composed and re-generated at the closeout head, and its artifactHash is compared with the registry's.
 * The registry moved once in Sprint 202 (m01, the carries: the figure heading and narrow render for placed charts,
 * the page landmarks and heading) and was fully re-swept then; m02–m05 changed the adapter, the preview host, the
 * preview app, the composition store and the install path, not the generated application code, so every hash must
 * still equal a fresh generation. This is the generation layer of the m01 attribution, not a browser sweep.
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
