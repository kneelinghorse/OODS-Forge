#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(import.meta.dirname, '../..');
export function commands(directory = root) {
  const workflow = readFileSync(path.join(directory, '.github/workflows/ci.yml'), 'utf8');
  const goldenLine = workflow.match(/name: Run colocated viz\.render \+ dashboard\.render goldens\s+run: ([^\n]+)/)?.[1];
  if (!goldenLine) throw new Error('The named chart golden command is missing from ci.yml');
  const serial = ['--no-file-parallelism', '--maxWorkers=1', '--testTimeout=60000', '--coverage.enabled=false'];
  const contractNames = ['chart-gate.s199', 'viz-recipes.s190', 'viz-pattern-registry.s195', 'viz-taxonomy.s195'];
  const realityNames = ['viz-recipes.s193', 'viz-recipes-proof.s193', 'viz-patterns.s195', 'viz-certification.s195', 'high-contrast.s195', 'chart-placement-codegen.s195'];
  const specs = [
    ...contractNames.map(name => `test/contracts/${name}.spec.ts`),
    ...realityNames.map(name => `test/product-reality/${name}.spec.ts`),
    ...readdirSync(path.join(directory, 'packages/mcp-server/test/product-reality')).filter(name => /^(?:viz|palette)-golden-migration\..*\.spec\.ts$/.test(name)).map(name => `test/product-reality/${name}`),
    ...readdirSync(path.join(directory, 'packages/mcp-server/test/tools')).filter(name => /^(?:artifact\.certify|certify-).*\.spec\.ts$/.test(name)).map(name => `test/tools/${name}`),
  ];
  return [
    ['build-viz-core', ['pnpm', '--filter', '@oods/viz-core', 'build']],
    ['build-viz-render', ['pnpm', '--filter', '@oods/viz-render', 'build']],
    ['typecheck-viz-core', ['pnpm', '--filter', '@oods/viz-core', 'typecheck']],
    ['viz-core', ['pnpm', '--filter', '@oods/viz-core', 'exec', 'vitest', 'run', ...serial]],
    ['viz-render', ['pnpm', '--filter', '@oods/viz-render', 'exec', 'vitest', 'run', ...serial]],
    ['named-goldens', [...goldenLine.trim().split(/\s+/), ...serial]],
    ['viz-contracts', ['pnpm', '--filter', '@oods/mcp-server', 'exec', 'vitest', 'run', ...specs, ...serial]],
    ['scale', ['pnpm', '--filter', '@oods/mcp-server', 'run', 'test:scale']],
    ['docs', ['pnpm', 'docs:check']],
    ['matrix', ['pnpm', 'exec', 'tsx', 'scripts/product-reality/s195-qualify-viz-matrix.ts', '--mode', 's199', '--check']],
    ['tool-truth', ['node', 'scripts/product-reality/s193-tool-truth.mjs', '--check']],
  ];
}

export function verify(output = 'artifacts/product-reality/sprint-199/gate') {
  const directory = path.resolve(root, output);
  if (!directory.startsWith(path.join(root, 'artifacts/product-reality/sprint-199/'))) throw new Error('Chart gate receipts must be under sprint-199');
  mkdirSync(directory, { recursive: true });
  const reports = [];
  const plan = commands();
  const started = Date.now();
  const head = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).stdout.trim();
  for (const [name, [command, ...args]] of plan) {
    const commandStarted = Date.now();
    const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    const log = (result.stdout ?? '') + (result.stderr ?? '') + (result.error?.message ?? '');
    writeFileSync(path.join(directory, `${name}.log`), log);
    reports.push({ name, command: [command, ...args], exitCode: result.status, signal: result.signal, wallMs: Date.now() - commandStarted, log: { path: path.relative(root, path.join(directory, `${name}.log`)), sha256: createHash('sha256').update(log).digest('hex') } });
    writeFileSync(path.join(directory, 'report.json'), JSON.stringify({ head, status: result.status !== 0 ? 'failed' : reports.length === plan.length ? 'passed' : 'incomplete', wallMs: Date.now() - started, commandsNotRun: plan.length - reports.length, reports, builderSelfCertified: false }, null, 2) + '\n');
    console.log(`${name}: ${result.status} (${reports.at(-1).wallMs} ms)`);
    if (result.status !== 0) throw new Error(`Chart gate ${name} failed; see ${directory}/${name}.log`);
  }
}
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) verify(process.argv[2]);
