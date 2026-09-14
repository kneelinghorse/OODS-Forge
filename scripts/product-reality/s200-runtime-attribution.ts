/**
 * s200-m02 runtime hash attribution, in three layers per canonical cell:
 *   registry (the sprint-198 sweep the registry still carried) -> generation at the base head 8d37b175b
 *   (pre-existing drift from the sprint-198 craft missions and sprint-199 producers, never re-swept)
 *   -> generation at the m02 head (the chrome pass). Every m02 movement must name its producer.
 * The base-head generation comes from the same generator run against the base head's source
 * (artifacts/product-reality/sprint-200/m02/runtime/base-generation-hashes.json records the method).
 * When the sweep ledger is supplied, its artifactHash must equal the m02 generation hash per cell.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { handle as compose } from '../../packages/mcp-server/src/tools/design.compose.js';
import { handle as generate } from '../../packages/mcp-server/src/tools/code.generate.js';
import { chartNodes } from '../../packages/mcp-server/src/codegen/chart-declaration.js';

const root = path.resolve(import.meta.dirname, '../..');
const BASE_HEAD = '8d37b175b76ec9eb0012d86c831499d3113da722';
const runtimeDir = path.join(root, 'artifacts/product-reality/sprint-200/m02/attribution');
const registryFile = 'packages/mcp-server/registry/runtime-cells.v1.json';
const registry = JSON.parse(execFileSync('git', ['show', `${BASE_HEAD}:${registryFile}`], { cwd: root, maxBuffer: 64 * 1024 * 1024 }).toString());
const baseGeneration = JSON.parse(fs.readFileSync(path.join(runtimeDir, 'base-generation-hashes.json'), 'utf8'));
assert.equal(baseGeneration.head, BASE_HEAD);
const baseHashes = new Map<string, string>(baseGeneration.rows.map((row: any) => [row.id, row.hash]));
const s199 = JSON.parse(fs.readFileSync(path.join(root, 'artifacts/product-reality/sprint-199/m07/runtime-diff.json'), 'utf8'));
const s199Rows = new Map<string, any>(s199.rows.map((row: any) => [row.id, row]));
const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const identity = (row: any) => `${row.object}/${row.context}/${row.framework}`;
const sweepPath = process.argv[2];
const sweep = sweepPath ? JSON.parse(fs.readFileSync(path.resolve(sweepPath), 'utf8')) : null;
const sweepRows = new Map<string, any>(sweep ? sweep.rows.map((row: any) => [identity(row), row]) : []);
const rows = [];
for (const old of registry.rows) {
  const id = identity(old);
  const composed = await compose({ object: old.object, context: old.context });
  assert.equal(composed.status, 'ok', `${id} compose`);
  const result = await generate({ schema: composed.schema, framework: old.framework, profile: 'build', ...(old.context === 'workflow' ? {} : { options: { styling: 'tokens', typescript: true } }) });
  assert.equal(result.status, 'ok', JSON.stringify(result.errors));
  const after = result.artifact!.contentHash;
  const base = baseHashes.get(id); assert(base, `${id} missing from the base generation`);
  const placedChart = chartNodes(composed.schema.screens).length > 0;
  const m02Reasons: string[] = [];
  if (base !== after) {
    if (old.context === 'workflow') m02Reasons.push('src/app.css: the generated shell moved onto the token font stack, type scale, spacing, radius, card shadow and the 2px/2px focus rule');
    if (placedChart) m02Reasons.push('placed chart rendered at 720x400 (chart-assets PLACED_CHART_SIZE) and bound to the preview width');
  }
  const prior = s199Rows.get(id);
  const preExisting = old.artifactHash !== base;
  const preExistingReason = !preExisting ? null : prior?.mission
    ? `registry hash from the sprint-198 sweep; sprint-199 ${prior.mission} moved this cell (artifacts/product-reality/sprint-199/m07/runtime-diff.json) without a full re-sweep`
    : 'registry hash from the sprint-198 m02 sweep; later sprint-198 craft producers moved this cell without a full re-sweep (the sprint-199 runtime-diff base already differed from the registry)';
  const sweepRow = sweepRows.get(id);
  rows.push({ id, registryHash: old.artifactHash, baseGenerationHash: base, afterHash: after, preExistingDrift: preExisting, m02Change: base !== after, placedChart,
    reason: [preExistingReason, ...m02Reasons].filter(Boolean).join(' | ') || null, m02Reason: m02Reasons.join('; ') || null,
    ...(sweepRow ? { sweepHash: sweepRow.artifactHash, sweepStatus: sweepRow.status, sweepMatchesGeneration: sweepRow.artifactHash === after } : {}) });
}
const unattributed = rows.filter(row => row.m02Change && !row.m02Reason).map(row => row.id);
const report = { base: BASE_HEAD, registryHead: registry.head, implementationHead: head, kind: 'generation-hash comparison in three layers; the full sweep is checked against the m02 layer',
  compared: rows.length, m02Changed: rows.filter(row => row.m02Change).length, preExistingDrift: rows.filter(row => row.preExistingDrift).length, unchangedSinceRegistry: rows.filter(row => row.registryHash === row.afterHash).length,
  m02ByProducer: { workflowShell: rows.filter(row => row.m02Change && row.id.includes('/workflow/')).length, placedChartDetail: rows.filter(row => row.m02Change && row.placedChart && !row.id.includes('/workflow/')).length },
  unattributed, ...(sweep ? { sweepHead: sweep.head, sweepRunId: sweep.runId, sweepMismatches: rows.filter(row => row.sweepMatchesGeneration === false).map(row => row.id), sweepFailures: rows.filter(row => row.sweepStatus && row.sweepStatus !== 'pass').map(row => row.id) } : {}),
  rows, builderSelfCertified: false };
fs.mkdirSync(runtimeDir, { recursive: true });
fs.writeFileSync(path.join(runtimeDir, 'artifact-attribution.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ compared: report.compared, m02Changed: report.m02Changed, m02ByProducer: report.m02ByProducer, preExistingDrift: report.preExistingDrift, unattributed, sweepMismatches: (report as any).sweepMismatches, sweepFailures: (report as any).sweepFailures }));
assert.deepEqual(unattributed, [], 'every m02 runtime hash movement must name its producer');
