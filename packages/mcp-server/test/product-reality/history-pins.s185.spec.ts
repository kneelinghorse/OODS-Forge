import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

// Sprint 185 m01. Decision #1722 voids the Sprint 182 promotion freeze and
// decision #1725 retires it from the LIVE gates, not from history. The files
// below are that history: the Sprint 182 promotion artifacts, the two frozen
// packed-consumer scripts and the Sprint 184 m01 freeze inventory (capture-time
// evidence, #1695). They are READ-ONLY HISTORY: pinned byte-exactly by sha256,
// never executed by any live test, and never used as the expectation for the
// live nucleus. The closeout generators generate-s182-m05-closeout.mjs and
// generate-s183-m06-closeout.mjs stay tracked as history too and are never
// invoked with --check, --check-promotion or --write-promotion from a live test.

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, '../../../..');

const HISTORY_PINS = [
  {
    path: 'artifacts/product-reality/sprint-182/review/foundation-v1-promotion-binding.v1.json',
    sha256: '00ac40c67b1557607b26aad960c3a6ed57d36cd45bbe872e768950ed4b14918c',
    role: 'Sprint 182 promotion binding (content-addressed supersession record)',
  },
  {
    path: 'artifacts/product-reality/sprint-182/review/independent-review.v1.json',
    sha256: '65b83335555d5221cc0d02aa010118e901ddd862b204b23433d8332e0e796951',
    role: 'Sprint 182 independent-review approval record',
  },
  {
    path: 'packages/component-contracts/registry/component-capability-foundation-v1.s182.v1.json',
    sha256: '7f473d04ca66be9b3119e41e3b4784876115cde5ca742b4f5dd13759e8f7be71',
    role: 'Sprint 182 approved foundation-v1 projection (28 historical cells)',
  },
  {
    path: 'packages/component-contracts/registry/component-capability-closeout.s182.v1.json',
    sha256: '860218936e3e1a7b081e4849ce2abacacea03cb5714642b74e249a918e18202f',
    role: 'Sprint 182 closeout capability projection at ca8d84bb',
  },
  {
    path: 'artifacts/product-reality/sprint-182/m05/evidence-index.json',
    sha256: 'f341a33e7544300d7d0a7357b6fab00e9e0515a5778880dac5938e00d2caab47',
    role: 'Sprint 182 m05 evidence index',
  },
  {
    path: 'artifacts/product-reality/sprint-182/m05/gate-record.json',
    sha256: 'c4a14def13d494fdf0b447a4592dbda1ad2d3cc78710502b8934e818063b9202',
    role: 'Sprint 182 m05 gate record',
  },
  {
    path: 'artifacts/product-reality/sprint-182/m05/claim-diff.json',
    sha256: 'd62ebfdccf731f6a0c74ac1dd4988b8ee302c41330c0c6db7fe274554fe1fa60',
    role: 'Sprint 182 m05 claim diff',
  },
  {
    path: 'artifacts/product-reality/sprint-182/m03/package-verification/consumer.mjs',
    sha256: 'f1d6dd4518bfd3036b2dca89b0d61f041d531a76e7e8de6a1c7325d37fe67491',
    role: 'Sprint 182 m03 frozen Vue packed consumer (hashed only)',
  },
  {
    path: 'artifacts/product-reality/sprint-184/m01/vue-packed-import/consumer.mjs',
    sha256: 'f1d6dd4518bfd3036b2dca89b0d61f041d531a76e7e8de6a1c7325d37fe67491',
    role: 'Sprint 184 m01 frozen Vue packed consumer (hashed only)',
  },
  {
    path: 'artifacts/product-reality/sprint-184/m01/freeze-inventory.json',
    sha256: '5b465ff12d470dda8552c29e0130483865ab4ab238e3ef6687cc903cbb63f8aa',
    role: 'Sprint 184 m01 freeze inventory (capture-time evidence, #1695)',
  },
] as const;

const FROZEN_GENERATORS = [
  'scripts/product-reality/generate-s182-m05-closeout.mjs',
  'scripts/product-reality/generate-s183-m06-closeout.mjs',
] as const;

const FROZEN_CONSUMERS = [
  'artifacts/product-reality/sprint-182/m03/package-verification/consumer.mjs',
  'artifacts/product-reality/sprint-184/m01/vue-packed-import/consumer.mjs',
] as const;

const LIVE_EXTENSIONS = new Set(['.ts', '.tsx', '.mts', '.mjs', '.js', '.cjs']);

function sha256(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

function walk(directory: string, output: string[]): void {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolutePath, output);
    else if (LIVE_EXTENSIONS.has(path.extname(entry.name))) output.push(absolutePath);
  }
}

/** Every live test and product-reality script: packages/<pkg>/test/** plus scripts/product-reality/**. */
export function liveScopeFiles(): string[] {
  const files: string[] = [];
  const packagesRoot = path.join(repositoryRoot, 'packages');
  for (const packageName of readdirSync(packagesRoot)) {
    const testRoot = path.join(packagesRoot, packageName, 'test');
    try {
      if (statSync(testRoot).isDirectory()) walk(testRoot, files);
    } catch {
      // no test directory
    }
  }
  walk(path.join(repositoryRoot, 'scripts', 'product-reality'), files);
  return files
    .map((file) => path.relative(repositoryRoot, file))
    .filter((file) => !(FROZEN_GENERATORS as readonly string[]).includes(file))
    .sort();
}

function read(relativePath: string): string {
  return readFileSync(path.join(repositoryRoot, relativePath), 'utf8');
}

describe('Sprint 182/184 promotion history — read-only under #1722/#1725, hashed and never executed', () => {
  it.each(HISTORY_PINS)('$path is tracked and byte-exact ($role)', ({ path: relativePath, sha256: expected }) => {
    const tracked = spawnSync('git', ['ls-files', '--error-unmatch', relativePath], {
      cwd: repositoryRoot,
      encoding: 'utf8',
    });
    expect(tracked.status, tracked.stderr).toBe(0);
    expect(sha256(readFileSync(path.join(repositoryRoot, relativePath)))).toBe(expected);
  });

  it('keeps both frozen closeout generators tracked', () => {
    for (const generator of FROZEN_GENERATORS) {
      const tracked = spawnSync('git', ['ls-files', '--error-unmatch', generator], {
        cwd: repositoryRoot,
        encoding: 'utf8',
      });
      expect(tracked.status, generator).toBe(0);
    }
  });

  it('no live test or script invokes a frozen generator with --check, --check-promotion or --write-promotion', () => {
    const generatorReference = /generate-s18[23]-m0[56]-closeout\.mjs/;
    const runWithVerb = /\.run\(\s*["']--(?:check|write)/;
    const verbArgument = /["']--(?:check|write)(?:-promotion)?["']/;
    const offenders: string[] = [];
    for (const file of liveScopeFiles()) {
      const text = read(file);
      if (!generatorReference.test(text)) continue;
      const lines = text.split(/\r?\n/);
      if (runWithVerb.test(text)) offenders.push(`${file}: calls the generator's run() with a command verb`);
      lines.forEach((line, index) => {
        if (!generatorReference.test(line)) return;
        const window = lines.slice(index, index + 6).join('\n');
        if (verbArgument.test(window)) offenders.push(`${file}:${index + 1}: names a generator next to a command verb`);
      });
    }
    expect(offenders).toEqual([]);
  });

  it('no live test or script executes a frozen consumer.mjs; they are only read and hashed', () => {
    const execution = /spawn|execFile|exec\(|fork\(|execPath|import\(/;
    const offenders: string[] = [];
    for (const file of liveScopeFiles()) {
      const lines = read(file).split(/\r?\n/);
      lines.forEach((line, index) => {
        if (!FROZEN_CONSUMERS.some((consumer) => line.includes(consumer))) return;
        const window = lines.slice(Math.max(0, index - 4), index + 1).join('\n');
        if (execution.test(window)) offenders.push(`${file}:${index + 1}`);
      });
    }
    expect(offenders).toEqual([]);
  });
});
