/**
 * s201 golden ledger: every pinned artifact the sprint may move, moved at most once and
 * attributed; every pin that must not move asserted byte-identical against the base head.
 *
 *   pnpm exec tsx scripts/product-reality/s201-golden-ledger.ts plan                      # write the before-plan
 *   pnpm exec tsx scripts/product-reality/s201-golden-ledger.ts append m06 --reason "…"   # append the mission's moved pins
 *   pnpm exec tsx scripts/product-reality/s201-golden-ledger.ts check                     # verify the ledger against the tree
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../..');
const ledgerPath = path.join(root, 'artifacts/product-reality/sprint-201/golden-ledger.json');
/** c02f3ddcb: the Sprint 200 merge plus the license-holder correction (PR #117). */
export const BASE_HEAD = 'c02f3ddcbc6a74dd5e16a5c7a95736f533ca98f7';
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
const CHROME_SNAPSHOTS = [
  'tests/contexts/__snapshots__/context-templates.test.tsx.snap',
  'tests/components/__snapshots__/user.render-object.test.tsx.snap',
  'tests/components/__snapshots__/subscription.render-object.test.tsx.snap',
];
/** The pattern registry, the certified matrix and the package-shape baseline never move in this sprint. */
const MUST_NOT_MOVE = [
  'packages/viz-core/src/registry/viz-patterns.v1.json', 'packages/viz-render/certified-matrix.json',
  'artifacts/product-reality/sprint-196/m06/package-shapes-baseline.json',
];
/** m06 may move the runtime cells once (the craft list) and a chart recipe's pins once (the two chart titles); each move is attributed here. */
const MAY_MOVE_ONCE = [
  'packages/mcp-server/registry/runtime-cells.v1.json', 'packages/mcp-server/registry/release-cells.v1.json',
  'packages/viz-core/src/registry/viz-recipes.v1.json', ...CHART_SNAPSHOTS, ...CHROME_SNAPSHOTS,
];

type Entry = { file: string; pin: string; before: string; after: string; mission: string; reason: string };
type Ledger = { schemaVersion: '1.0.0'; sprint: 'sprint-201'; baseHead: string; plannedAt: string; mustNotMove: Array<{ file: string; sha256: string }>; mayMoveOnce: Array<{ file: string; baseSha256: string }>; entries: Entry[]; builderSelfCertified: false };
const readLedger = (): Ledger => JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
const writeLedger = (ledger: Ledger) => { fs.mkdirSync(path.dirname(ledgerPath), { recursive: true }); fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2) + '\n'); };

function verifyImmutable(ledger: Ledger) {
  const moved = ledger.mustNotMove.filter(pin => treeHash(pin.file) !== pin.sha256).map(pin => pin.file);
  assert.deepEqual(moved, [], `Pins that must not move changed: ${moved.join(', ')}`);
  for (const pin of ledger.mustNotMove) assert.equal(blobAt(BASE_HEAD, pin.file), pin.sha256, `${pin.file} base hash drifted`);
}

const command = process.argv[2];
if (command === 'plan') {
  const ledger: Ledger = { schemaVersion: '1.0.0', sprint: 'sprint-201', baseHead: BASE_HEAD, plannedAt: new Date().toISOString(),
    mustNotMove: MUST_NOT_MOVE.map(file => ({ file, sha256: blobAt(BASE_HEAD, file) })),
    mayMoveOnce: MAY_MOVE_ONCE.map(file => ({ file, baseSha256: blobAt(BASE_HEAD, file) })), entries: [], builderSelfCertified: false };
  writeLedger(ledger); verifyImmutable(ledger);
  console.log(JSON.stringify({ mustNotMove: ledger.mustNotMove.length, mayMoveOnce: ledger.mayMoveOnce.length }));
} else if (command === 'append') {
  const mission = process.argv[3]; assert(mission, 'append needs a mission id');
  const reasonIndex = process.argv.indexOf('--reason'); const reason = reasonIndex >= 0 ? process.argv[reasonIndex + 1] : undefined;
  assert(reason, 'append needs --reason "<why the pins moved>"');
  const ledger = readLedger(); verifyImmutable(ledger);
  const entries: Entry[] = [];
  const runtimeFile = 'packages/mcp-server/registry/runtime-cells.v1.json';
  for (const pin of ledger.mayMoveOnce) {
    const before = pin.baseSha256, after = treeHash(pin.file);
    if (before === after || ledger.entries.some(entry => entry.file === pin.file)) continue;
    if (pin.file === runtimeFile) {
      // Runtime cells move per row: every changed artifact hash is its own attributed pin.
      const base = JSON.parse(execFileSync('git', ['show', `${BASE_HEAD}:${runtimeFile}`], { cwd: root, maxBuffer: 64 * 1024 * 1024 }).toString());
      const current = JSON.parse(fs.readFileSync(path.join(root, runtimeFile), 'utf8'));
      const identity = (row: { object: string; context: string; framework: string }) => `${row.object}/${row.context}/${row.framework}`;
      const hashOf = (row: any) => row.gates.find((gate: any) => gate.name === 'generation')?.detail?.artifactHash as string;
      const baseRows = new Map<string, string>(base.rows.map((row: any) => [identity(row), hashOf(row)]));
      assert.equal(current.rows.length, 240); assert.equal(base.rows.length, 240);
      for (const row of current.rows) {
        const rowBefore = baseRows.get(identity(row))!; const rowAfter = hashOf(row);
        if (rowBefore !== rowAfter) entries.push({ file: runtimeFile, pin: `${identity(row)} artifactHash`, before: rowBefore, after: rowAfter, mission, reason });
      }
      entries.push({ file: runtimeFile, pin: 'ledger head', before: base.head, after: current.head, mission, reason: `Full 240-cell re-sweep at the ${mission} head (run ${current.runId}).` });
    } else entries.push({ file: pin.file, pin: pin.file.endsWith('.snap') ? 'snapshot' : 'registry', before, after, mission, reason });
  }
  for (const entry of entries) assert(!ledger.entries.some(existing => existing.file === entry.file && existing.pin === entry.pin), `pin moved twice: ${entry.file} ${entry.pin}`);
  ledger.entries.push(...entries); writeLedger(ledger);
  console.log(JSON.stringify({ appended: entries.length, files: [...new Set(entries.map(entry => entry.file))] }));
} else if (command === 'check') {
  const ledger = readLedger(); verifyImmutable(ledger);
  const unrecorded = ledger.mayMoveOnce.filter(pin => treeHash(pin.file) !== pin.baseSha256 && !ledger.entries.some(entry => entry.file === pin.file)).map(pin => pin.file);
  assert.deepEqual(unrecorded, [], `Moved without a ledger entry: ${unrecorded.join(', ')}`);
  for (const entry of ledger.entries) if (entry.pin === 'snapshot' || entry.pin === 'registry') assert.equal(treeHash(entry.file), entry.after, `${entry.file} moved again after its ledger entry`);
  const sealed = execFileSync('git', ['diff', '--stat', BASE_HEAD, '--', 'artifacts/product-reality/sprint-195', 'artifacts/product-reality/sprint-196', 'artifacts/product-reality/sprint-197', 'artifacts/product-reality/sprint-198', 'artifacts/product-reality/sprint-199', 'artifacts/product-reality/sprint-200'], { cwd: root, encoding: 'utf8' }).trim();
  assert.equal(sealed, '', `Sealed receipts changed:\n${sealed}`);
  console.log(JSON.stringify({ mustNotMove: ledger.mustNotMove.length, mayMoveOnce: ledger.mayMoveOnce.length, entries: ledger.entries.length, sealed: 'byte-identical', status: 'verified' }));
} else assert.fail('Use plan, append <mission> --reason "…" or check');
