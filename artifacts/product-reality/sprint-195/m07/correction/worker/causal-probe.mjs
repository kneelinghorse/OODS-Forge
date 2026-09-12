// Prepared during the exclusive capture. Execute only after root releases it.
// Reads the exact retained s172 operand, changes only projected color[4], and
// writes no repository files. Redirect stdout to the new correction receipt.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = process.argv[2] ?? '/Users/systemsystems/.codex/worktrees/s195/OODS-Forge';
const { adaptGraphToECharts } = await import(pathToFileURL(path.join(root, 'packages/viz-core/dist/index.js')));
const { renderEChartsToSvg, getEChartsRenderWorkerState } = await import(pathToFileURL(path.join(root, 'packages/viz-render/dist/index.js')));
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const canonical = value => Array.isArray(value) ? `[${value.map(canonical).join(',')}]`
  : value !== null && typeof value === 'object' ? `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`
  : JSON.stringify(value);
const boundaryPath = 'artifacts/product-reality/sprint-195/m04/certify/boundary/force_graph.json';
const boundaryBytes = fs.readFileSync(path.join(root, boundaryPath));
const { input } = JSON.parse(boundaryBytes);
assert.equal(input.spec.name, 'Service graph');
assert.deepEqual(input.data.network.nodes, [{ id: 'a', group: 'core' }, { id: 'b', group: 'core' }, { id: 'c', group: 'edge' }]);
const afterOption = JSON.parse(JSON.stringify(adaptGraphToECharts(input.spec, input.data.network)));
const beforeOption = structuredClone(afterOption);
assert.equal(afterOption.color[4], 'rgb(202, 73, 73)');
beforeOption.color[4] = 'rgb(202, 73, 72)';
assert.deepEqual(afterOption.series, beforeOption.series);
const expectedAfter = structuredClone(beforeOption);
expectedAfter.color[4] = 'rgb(202, 73, 73)';
assert.deepEqual(expectedAfter, afterOption);
const originals = [structuredClone(beforeOption), structuredClone(afterOption)];
const beforeSvg = await renderEChartsToSvg(beforeOption);
const afterSvg = await renderEChartsToSvg(afterOption);
const beforeRepeated = await renderEChartsToSvg(beforeOption);
const afterRepeated = await renderEChartsToSvg(afterOption);
assert.equal(beforeSvg, beforeRepeated);
assert.equal(afterSvg, afterRepeated);
assert.deepEqual([beforeOption, afterOption], originals);
const beforePath = 'artifacts/product-reality/sprint-192/m07/matrix/svg/force_graph-A-light.svg';
const afterPath = 'artifacts/product-reality/sprint-195/m05/golden-migration/matrix/svg/force_graph-A-light.svg';
assert.equal(beforeSvg, fs.readFileSync(path.join(root, beforePath), 'utf8'));
assert.equal(afterSvg, fs.readFileSync(path.join(root, afterPath), 'utf8'));
assert.equal(sha(beforeSvg), '3b947d90250a98838aad801be4f98ea8e5095528618296083b8644075ff6a331');
assert.equal(sha(afterSvg), 'df5261688594d5f845960170d643c35518954198cda607a598e069beed7e53df');
const state = await getEChartsRenderWorkerState();
assert.equal(state.randomRestored, true);
assert.equal(state.activeJobs, 0);
assert.equal(state.activeCharts, 0);
const seed = option => {
  const bytes = canonical(option);
  const hash = sha(`oods-echarts-lcg-v1\0${bytes}`);
  return { canonicalOptionSha256: sha(bytes), seedDigest: hash, initialState: Number.parseInt(hash.slice(0, 8), 16) || 1 };
};
console.log(JSON.stringify({
  status: 'passed', head: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  boundaryInput: { path: boundaryPath, sha256: sha(boundaryBytes) },
  changedOptionLeaves: [{ path: 'color[4]', before: beforeOption.color[4], after: afterOption.color[4] }],
  otherOptionBytesUnchanged: true, callerOptionsUnmodified: true,
  before: { ...seed(beforeOption), svgHash: sha(beforeSvg), svgBytes: Buffer.byteLength(beforeSvg), repeated: true, exactHistoricalSvg: beforePath },
  after: { ...seed(afterOption), svgHash: sha(afterSvg), svgBytes: Buffer.byteLength(afterSvg), repeated: true, exactQualifiedSvg: afterPath },
  geometryUnchanged: false,
  conclusion: 'Only the authorized m05 light categorical slot05 option leaf changes. Whole-option seed changes under the unchanged worker policy; both old and new rendered bytes exactly reproduce their independently retained historical SVGs. This is qualified geometry migration, not paint-only drift.',
  workerState: state,
}, null, 2));
