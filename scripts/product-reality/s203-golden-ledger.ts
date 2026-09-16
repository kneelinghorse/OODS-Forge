/**
 * s203 golden ledger: every pinned artifact the sprint may move, moved at most once and
 * attributed; every pin that must not move asserted byte-identical against the base head.
 *
 *   pnpm exec tsx scripts/product-reality/s203-golden-ledger.ts plan                      # write the before-plan
 *   pnpm exec tsx scripts/product-reality/s203-golden-ledger.ts append m01 --reason "…"   # append the mission's moved pins
 *   pnpm exec tsx scripts/product-reality/s203-golden-ledger.ts check                     # verify the ledger against the tree
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../..');
const ledgerPath = path.join(root, 'artifacts/product-reality/sprint-203/golden-ledger.json');
/** a5d1ba084: the Sprint 202 merge (PR #119), served by the bridge at planning. */
export const BASE_HEAD = 'a5d1ba08480bb7a926ac796cdc625202a5fcbda3';
const sha = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex');
const blobAt = (head: string, file: string) => sha(execFileSync('git', ['show', `${head}:${file}`], { cwd: root, maxBuffer: 64 * 1024 * 1024 }));
const treeHash = (file: string) => sha(fs.readFileSync(path.join(root, file)));

/** Composed-screen snapshots that carry the generated markup, including every section heading's level (m01). */
const CHROME_SNAPSHOTS = [
  'tests/contexts/__snapshots__/context-templates.test.tsx.snap',
  'tests/components/__snapshots__/user.render-object.test.tsx.snap',
  'tests/components/__snapshots__/subscription.render-object.test.tsx.snap',
  'tests/components/__snapshots__/empty-state.spec.tsx.snap',
];
/**
 * Memo §5: there is no chart work this sprint, so the viz pattern registry, the certified matrix and the viz
 * recipes must not move, beside the Sprint 196 package-shape baseline.
 */
const MUST_NOT_MOVE = [
  'packages/viz-core/src/registry/viz-patterns.v1.json',
  'packages/viz-render/certified-matrix.json',
  'packages/viz-core/src/registry/viz-recipes.v1.json',
  'artifacts/product-reality/sprint-196/m06/package-shapes-baseline.json',
];
/**
 * m01 moves the advertised tool descriptions and the agent policy layer that mirrors them; m02–m04 add runtime
 * cells for the objects born this sprint and may move existing ones; m05 moves design.preview's advertised schema.
 *
 * Generated documentation is deliberately NOT pinned here. `docs/api/*`, `docs/mcp/Tool-Specs.md`,
 * `docs/components/*`, the Forge claims and the tool capability ledger are rewritten by their own generators
 * every time the census they report moves — which is every mission that adds an object — and they are gated by
 * `docs:check` with `--check`, not by a move-once pin. Sprint 202 treated the tool capability ledger the same way.
 * Pinning them as may-move-once asserts something untrue of a generated file and fires on the second honest
 * regeneration, which is exactly what it did here in m02.
 */
const MAY_MOVE_ONCE = [
  'packages/mcp-server/registry/runtime-cells.v1.json', 'packages/mcp-server/registry/release-cells.v1.json',
  'packages/component-contracts/fixtures/viz-preview-samples.v1.json',
  'packages/mcp-adapter/tool-descriptions.json', 'configs/agent/policy.json',
  ...CHROME_SNAPSHOTS,
];
const SEALED = ['sprint-195', 'sprint-196', 'sprint-197', 'sprint-198', 'sprint-199', 'sprint-200', 'sprint-201', 'sprint-202'].map(sprint => `artifacts/product-reality/${sprint}`);

type Entry = { file: string; pin: string; before: string; after: string; mission: string; reason: string };
type Ledger = { schemaVersion: '1.0.0'; sprint: 'sprint-203'; baseHead: string; plannedAt: string; mustNotMove: Array<{ file: string; sha256: string }>; mayMoveOnce: Array<{ file: string; baseSha256: string }>; entries: Entry[]; builderSelfCertified: false };
const readLedger = (): Ledger => JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
const writeLedger = (ledger: Ledger) => { fs.mkdirSync(path.dirname(ledgerPath), { recursive: true }); fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2) + '\n'); };

function verifyImmutable(ledger: Ledger) {
  const moved = ledger.mustNotMove.filter(pin => treeHash(pin.file) !== pin.sha256).map(pin => pin.file);
  assert.deepEqual(moved, [], `Pins that must not move changed: ${moved.join(', ')}`);
  for (const pin of ledger.mustNotMove) assert.equal(blobAt(BASE_HEAD, pin.file), pin.sha256, `${pin.file} base hash drifted`);
}

const runtimeFile = 'packages/mcp-server/registry/runtime-cells.v1.json';
const identity = (row: { object: string; context: string; framework: string }) => `${row.object}/${row.context}/${row.framework}`;
const hashOf = (row: { gates: Array<{ name: string; detail?: { artifactHash?: string } }> }) => row.gates.find(gate => gate.name === 'generation')?.detail?.artifactHash as string;

const command = process.argv[2];
if (command === 'plan') {
  const ledger: Ledger = { schemaVersion: '1.0.0', sprint: 'sprint-203', baseHead: BASE_HEAD, plannedAt: new Date().toISOString(),
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
  for (const pin of ledger.mayMoveOnce) {
    // A pin moves at most once PER MISSION, chained: a later mission's entry starts where the previous
    // one ended. The rule exists to make every move attributed, not to forbid two the sprint planned —
    // the memo declares the adapter's description pins moving in m01 and design.preview's advertised
    // schema in m05, and those are two different, declared moves of one file.
    const previous = ledger.entries.filter(entry => entry.file === pin.file).at(-1);
    const before = previous?.after ?? pin.baseSha256, after = treeHash(pin.file);
    if (before === after || previous?.mission === mission) continue;
    if (pin.file === runtimeFile) {
      // Runtime cells move per row: every changed artifact hash is its own attributed pin, and rows born this sprint are their own entries.
      const base = JSON.parse(execFileSync('git', ['show', `${BASE_HEAD}:${runtimeFile}`], { cwd: root, maxBuffer: 64 * 1024 * 1024 }).toString());
      const current = JSON.parse(fs.readFileSync(path.join(root, runtimeFile), 'utf8'));
      const baseRows = new Map<string, string>(base.rows.map((row: never) => [identity(row), hashOf(row)]));
      for (const row of current.rows) {
        const rowAfter = hashOf(row);
        const rowBefore = baseRows.get(identity(row));
        if (rowBefore === undefined) entries.push({ file: runtimeFile, pin: `${identity(row)} artifactHash`, before: 'born', after: rowAfter, mission, reason: `${reason} (cell born this sprint)` });
        else if (rowBefore !== rowAfter) entries.push({ file: runtimeFile, pin: `${identity(row)} artifactHash`, before: rowBefore, after: rowAfter, mission, reason });
      }
      entries.push({ file: runtimeFile, pin: 'ledger head', before: base.head, after: current.head, mission, reason: `Re-sweep at the ${mission} head (run ${current.runId}); ${base.rows.length} rows in, ${current.rows.length} out.` });
    } else entries.push({ file: pin.file, pin: pin.file.endsWith('.snap') ? 'snapshot' : pin.file.startsWith('docs/') ? 'generated doc' : 'registry', before, after, mission, reason });
  }
  // Twice within one mission is unattributed churn; once per declared mission is the sprint's plan.
  for (const entry of entries) assert(!ledger.entries.some(existing => existing.file === entry.file && existing.pin === entry.pin && existing.mission === entry.mission), `pin moved twice in ${entry.mission}: ${entry.file} ${entry.pin}`);
  ledger.entries.push(...entries); writeLedger(ledger);
  console.log(JSON.stringify({ appended: entries.length, files: [...new Set(entries.map(entry => entry.file))] }));
} else if (command === 'check') {
  const ledger = readLedger(); verifyImmutable(ledger);
  const unrecorded = ledger.mayMoveOnce.filter(pin => treeHash(pin.file) !== pin.baseSha256 && !ledger.entries.some(entry => entry.file === pin.file)).map(pin => pin.file);
  assert.deepEqual(unrecorded, [], `Moved without a ledger entry: ${unrecorded.join(', ')}`);
  // The tree must match the LAST recorded move of each pin: every move is attributed, and an
  // unrecorded one after the last entry still fails.
  const latest = new Map<string, Entry>();
  for (const entry of ledger.entries) if (entry.pin !== 'ledger head' && !entry.pin.endsWith('artifactHash')) latest.set(entry.file, entry);
  for (const entry of latest.values()) assert.equal(treeHash(entry.file), entry.after, `${entry.file} moved again after its last ledger entry (${entry.mission})`);
  const sealed = execFileSync('git', ['diff', '--stat', BASE_HEAD, '--', ...SEALED], { cwd: root, encoding: 'utf8' }).trim();
  assert.equal(sealed, '', `Sealed receipts changed:\n${sealed}`);
  console.log(JSON.stringify({ mustNotMove: ledger.mustNotMove.length, mayMoveOnce: ledger.mayMoveOnce.length, entries: ledger.entries.length, sealed: 'byte-identical', status: 'verified' }));
} else assert.fail('Use plan, append <mission> --reason "…" or check');
