/**
 * s200 golden ledger: every pinned artifact the sprint may move, moved at most once and
 * attributed; every pin that must not move asserted byte-identical against the base head.
 *
 *   pnpm exec tsx scripts/product-reality/s200-golden-ledger.ts plan        # write the before-plan
 *   pnpm exec tsx scripts/product-reality/s200-golden-ledger.ts append m02  # append the mission's moved pins
 *   pnpm exec tsx scripts/product-reality/s200-golden-ledger.ts check       # verify the ledger against the tree
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../..');
const ledgerPath = path.join(root, 'artifacts/product-reality/sprint-200/golden-ledger.json');
const BASE_HEAD = '8d37b175b76ec9eb0012d86c831499d3113da722';
const sha = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex');
const blobAt = (head: string, file: string) => sha(execFileSync('git', ['show', `${head}:${file}`], { cwd: root, maxBuffer: 64 * 1024 * 1024 }));
const treeHash = (file: string) => sha(fs.readFileSync(path.join(root, file)));

const CHART_SNAPSHOTS = [
  'tests/utils/__snapshots__/format.test.ts.snap', 'tests/components/__snapshots__/empty-state.spec.tsx.snap',
  'tests/viz/adapters/spatial/__snapshots__/echarts-visual-regression.test.ts.snap',
  'packages/viz-core/test/__snapshots__/golden-profiles.spec.ts.snap', 'packages/viz-core/test/__snapshots__/dashboard-layout.spec.ts.snap',
  'packages/viz-core/test/__snapshots__/golden-echarts-options.spec.ts.snap', 'packages/viz-render/test/__snapshots__/emitter.spec.ts.snap',
  'packages/mcp-server/src/tools/__snapshots__/viz.render.network-fidelity.test.ts.snap', 'packages/mcp-server/src/tools/__snapshots__/viz.render.geo-fidelity.test.ts.snap',
  'packages/mcp-server/src/tools/__snapshots__/dashboard.render.fidelity.test.ts.snap', 'packages/mcp-server/src/tools/__snapshots__/viz.render.fidelity.test.ts.snap',
];
/** Snapshots that pin the React primitives' class strings through src/components/base re-exports. */
const CHROME_SNAPSHOTS = [
  'tests/contexts/__snapshots__/context-templates.test.tsx.snap',
  'tests/components/__snapshots__/user.render-object.test.tsx.snap',
  'tests/components/__snapshots__/subscription.render-object.test.tsx.snap',
];
const MUST_NOT_MOVE = [
  'packages/viz-core/src/registry/viz-recipes.v1.json', 'packages/viz-core/src/registry/viz-patterns.v1.json', 'packages/viz-render/certified-matrix.json',
  'artifacts/product-reality/sprint-196/m06/package-shapes-baseline.json', ...CHART_SNAPSHOTS,
];
const MAY_MOVE_ONCE = ['packages/mcp-server/registry/runtime-cells.v1.json', 'packages/mcp-server/registry/release-cells.v1.json', ...CHROME_SNAPSHOTS];

type Entry = { file: string; pin: string; before: string; after: string; mission: string; reason: string };
type Ledger = { schemaVersion: '1.0.0'; sprint: 'sprint-200'; baseHead: string; plannedAt: string; mustNotMove: Array<{ file: string; sha256: string }>; mayMoveOnce: Array<{ file: string; baseSha256: string }>; entries: Entry[]; builderSelfCertified: false };
const readLedger = (): Ledger => JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
const writeLedger = (ledger: Ledger) => { fs.mkdirSync(path.dirname(ledgerPath), { recursive: true }); fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2) + '\n'); };

function verifyImmutable(ledger: Ledger) {
  const moved = ledger.mustNotMove.filter(pin => treeHash(pin.file) !== pin.sha256).map(pin => pin.file);
  assert.deepEqual(moved, [], `Pins that must not move changed: ${moved.join(', ')}`);
  for (const pin of ledger.mustNotMove) assert.equal(blobAt(BASE_HEAD, pin.file), pin.sha256, `${pin.file} base hash drifted`);
}

const command = process.argv[2];
if (command === 'plan') {
  const ledger: Ledger = { schemaVersion: '1.0.0', sprint: 'sprint-200', baseHead: BASE_HEAD, plannedAt: new Date().toISOString(),
    mustNotMove: MUST_NOT_MOVE.map(file => ({ file, sha256: blobAt(BASE_HEAD, file) })),
    mayMoveOnce: MAY_MOVE_ONCE.map(file => ({ file, baseSha256: blobAt(BASE_HEAD, file) })), entries: [], builderSelfCertified: false };
  writeLedger(ledger); verifyImmutable(ledger);
  console.log(JSON.stringify({ mustNotMove: ledger.mustNotMove.length, mayMoveOnce: ledger.mayMoveOnce.length }));
} else if (command === 'append') {
  const mission = process.argv[3]; assert(mission, 'append needs a mission id');
  const ledger = readLedger(); verifyImmutable(ledger);
  const entries: Entry[] = [];
  for (const file of CHROME_SNAPSHOTS) {
    const before = blobAt(BASE_HEAD, file), after = treeHash(file);
    if (before !== after) entries.push({ file, pin: 'snapshot', before, after, mission, reason: 'The React Card and Text no longer carry raw Tailwind class strings; the root src/components/base re-exports render them, so their snapshots follow the class attribute.' });
  }
  const runtimeFile = 'packages/mcp-server/registry/runtime-cells.v1.json';
  const base = JSON.parse(execFileSync('git', ['show', `${BASE_HEAD}:${runtimeFile}`], { cwd: root, maxBuffer: 64 * 1024 * 1024 }).toString());
  const current = JSON.parse(fs.readFileSync(path.join(root, runtimeFile), 'utf8'));
  const identity = (row: { object: string; context: string; framework: string }) => `${row.object}/${row.context}/${row.framework}`;
  const baseRows = new Map<string, string>(base.rows.map((row: any) => [identity(row), row.artifactHash as string]));
  assert.equal(current.rows.length, 240); assert.equal(base.rows.length, 240);
  const attribution = JSON.parse(fs.readFileSync(path.join(root, 'artifacts/product-reality/sprint-200/m02/attribution/artifact-attribution.json'), 'utf8'));
  const reasons = new Map<string, string>(attribution.rows.map((row: any) => [row.id, row.reason]));
  for (const row of current.rows) {
    const before = baseRows.get(identity(row))!; const after = row.artifactHash as string;
    if (before !== after) {
      const reason = reasons.get(identity(row)); assert(reason, `unattributed runtime hash ${identity(row)}`);
      entries.push({ file: runtimeFile, pin: `${identity(row)} artifactHash`, before, after, mission, reason });
    }
  }
  entries.push({ file: runtimeFile, pin: 'ledger head', before: base.head, after: current.head, mission, reason: `Full 240-cell re-sweep at the ${mission} head (run ${current.runId}).` });
  // The placed-chart assets: every recorded placement moves once to the 720x400 frame.
  const placementFile = 'artifacts/product-reality/sprint-200/m02/placement/migration.json';
  const placement = JSON.parse(fs.readFileSync(path.join(root, placementFile), 'utf8'));
  for (const row of placement.placements) {
    entries.push({ file: placementFile, pin: `${row.case}/${row.path}${row.source ? ` (${row.source})` : ''}`, before: row.beforeHash, after: row.afterHash, mission, reason: row.reason });
  }
  const releaseFile = 'packages/mcp-server/registry/release-cells.v1.json';
  if (blobAt(BASE_HEAD, releaseFile) !== treeHash(releaseFile)) entries.push({ file: releaseFile, pin: 'release ledger', before: blobAt(BASE_HEAD, releaseFile), after: treeHash(releaseFile), mission, reason: 'Release cells re-swept.' });
  for (const entry of entries) assert(!ledger.entries.some(existing => existing.file === entry.file && existing.pin === entry.pin), `pin moved twice: ${entry.file} ${entry.pin}`);
  ledger.entries.push(...entries); writeLedger(ledger);
  console.log(JSON.stringify({ appended: entries.length, snapshots: entries.filter(entry => entry.pin === 'snapshot').length, runtimeRows: entries.filter(entry => entry.pin.endsWith('artifactHash')).length, placements: entries.filter(entry => entry.file === placementFile).length }));
} else if (command === 'check') {
  const ledger = readLedger(); verifyImmutable(ledger);
  const unrecorded = ledger.mayMoveOnce.filter(pin => treeHash(pin.file) !== pin.baseSha256 && !ledger.entries.some(entry => entry.file === pin.file)).map(pin => pin.file);
  assert.deepEqual(unrecorded, [], `Moved without a ledger entry: ${unrecorded.join(', ')}`);
  for (const entry of ledger.entries) if (entry.pin === 'snapshot' || entry.pin === 'release ledger') assert.equal(treeHash(entry.file), entry.after, `${entry.file} moved again after its ledger entry`);
  console.log(JSON.stringify({ mustNotMove: ledger.mustNotMove.length, entries: ledger.entries.length, status: 'verified' }));
} else assert.fail('Use plan, append <mission> or check');
