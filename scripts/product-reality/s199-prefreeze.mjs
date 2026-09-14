import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const output = process.argv[2] ?? 'artifacts/product-reality/sprint-199/m07/pre-freeze';
const common = ['exec', 'vitest', 'run', '--no-file-parallelism', '--maxWorkers=1', '--testTimeout=60000', '--coverage.enabled=false'];
const commands = [
  ['readiness', ['pnpm', 'exec', 'tsx', 'scripts/product-reality/s196-release-readiness.ts', '--check']],
  ['registry', ['pnpm', ...common, '--project=core', 'tests/registry', 'tests/integration/object-registry.test.ts']],
  ['near-contracts', ['pnpm', '--filter', '@oods/mcp-server', ...common,
    ...['closeout.s190', 'closeout.s191', 'closeout.s196', 'closeout.s197', 'closeout.s198', 'public-head-equivalence.s185', 'release-readiness.s196'].map(name => `test/product-reality/${name}.spec.ts`)]],
  ['prose-contracts', ['pnpm', ...common, '--project=core', 'tests/verification']],
  ['viz-gate', ['pnpm', 'viz:gate', `${output}/viz-gate`]],
];
mkdirSync(output, { recursive: true });
const reports = [];
for (const [name, [command, ...args]] of commands) {
  const start = Date.now();
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const log = (result.stdout ?? '') + (result.stderr ?? '') + (result.error?.message ?? '');
  const file = path.join(output, `${name}.log`);
  writeFileSync(file, log);
  reports.push({ name, command: [command, ...args], exitCode: result.status, signal: result.signal, wallMs: Date.now() - start,
    log: { path: file, sha256: createHash('sha256').update(log).digest('hex') } });
  writeFileSync(path.join(output, 'report.json'), JSON.stringify({ status: reports.length === commands.length && reports.every(row => row.exitCode === 0) ? 'passed' : 'incomplete', commandsNotRun: commands.length - reports.length, reports, builderSelfCertified: false }, null, 2) + '\n');
  console.log(`${name}: ${result.status}`);
  if (result.status !== 0) { process.exitCode = 1; break; }
}
