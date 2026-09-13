#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(import.meta.dirname, '../..');
export const commands = [
  // Fingerprints include the root manifest. Check before freezing or launching suites.
  ['readiness', ['pnpm', 'exec', 'tsx', 'scripts/product-reality/s196-release-readiness.ts', '--check']],
  ['palette', ['pnpm', 'exec', 'tsx', 'scripts/tokens/generate-palette.ts', '--check']],
  ['tokens', ['pnpm', 'check:tokens']],
  ['tool-truth', ['node', 'scripts/product-reality/s193-tool-truth.mjs', '--check']],
  ['docs', ['pnpm', 'docs:check']],
  ['contracts', ['pnpm', 'exec', 'vitest', 'run', '--project=core', '--no-file-parallelism', '--maxWorkers=1', '--testTimeout=60000', '--coverage.enabled=false',
    'tests/governance-gates/a11y-guardrail-dataset.s198.test.ts', 'tests/tokens/canonical-guardrails.s198.test.ts',
    'packages/mcp-server/test/product-reality/release-readiness.s196.spec.ts', 'packages/mcp-server/test/product-reality/closeout.s197.spec.ts']],
];
export function verify(output = 'artifacts/product-reality/sprint-198/m07/pre-freeze') {
  const directory = path.resolve(root, output);
  mkdirSync(directory, { recursive: true });
  const reports = [];
  for (const [name, [command, ...args]] of commands) {
    const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
    writeFileSync(path.join(directory, `${name}.log`), (result.stdout ?? '') + (result.stderr ?? '') + (result.error?.message ?? ''));
    reports.push({ name, command: [command, ...args], exitCode: result.status, signal: result.signal });
    writeFileSync(path.join(directory, 'report.json'), JSON.stringify({ reports, builderSelfCertified: false }, null, 2) + '\n');
    console.log(`${name}: ${result.status}`);
    if (result.status !== 0) throw new Error(`Pre-freeze ${name} failed; see ${directory}/${name}.log`);
  }
}
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) verify(process.argv[2]);
