import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { NUCLEUS_COMPONENT_IDS } from '@oods/component-contracts';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, '../../../..');
const m04BaseCommit = '158a34bf80742d759ee7f7f079579a854e226ad6';

type FreezeRow = {
  rowClass: string;
  path: string;
  recordedSha256: string;
  workingTreeSha256?: string;
};

function sha256(value: Buffer | string): string {
  return createHash('sha256').update(value).digest('hex');
}

function repositoryFile(repositoryPath: string): Buffer {
  return readFileSync(path.join(repositoryRoot, repositoryPath));
}

function gitFile(repositoryPath: string): Buffer {
  const result = spawnSync('git', ['show', `${m04BaseCommit}:${repositoryPath}`], {
    cwd: repositoryRoot,
    encoding: null,
    maxBuffer: 32 * 1024 * 1024,
  });
  expect(result.status, `${repositoryPath}: ${result.stderr?.toString()}`).toBe(0);
  return result.stdout;
}

const idListPinFiles = [
  'packages/components-vue/test/ssr.spec.ts',
  'packages/components-vue/test/scenarios.spec.ts',
  'packages/components-react/test/scenarios.spec.tsx',
  'packages/components-vue/test/packed-import.mjs',
  'packages/component-contracts/test/contracts.spec.ts',
  'packages/components-react/test/package-contract.spec.ts',
  'packages/components-vue/test/package-contract.spec.ts',
  'packages/component-styles/test/styles.spec.ts',
  'packages/mcp-server/test/product-reality/independent-review-approval.s183.spec.ts',
  'scripts/product-reality/generate-s182-m05-closeout.mjs',
  'artifacts/product-reality/sprint-184/m01/vue-packed-import/consumer.mjs',
] as const;

const namedFrozenSurfaces = [
  'artifacts/product-reality/sprint-182/m05/evidence-index.json',
  'artifacts/product-reality/sprint-184/m01/vue-packed-import/consumer.mjs',
  'packages/components-react/src/index.ts',
  'packages/components-vue/src/index.ts',
  'packages/components-react/evidence/react-readiness.v1.json',
  'packages/components-vue/evidence/vue-readiness.v1.json',
  'packages/component-styles/src/index.ts',
  'packages/component-styles/src/components.css',
] as const;

describe('Sprint 184 m04 frozen-surface accounting', () => {
  it('rehashes every m01 inventory row by class with only the two declared m03 transitions', () => {
    const inventory = JSON.parse(repositoryFile(
      'artifacts/product-reality/sprint-184/m01/freeze-inventory.json',
    ).toString('utf8')) as {
      rowCount: number;
      uniquePathCount: number;
      countsByRowClass: Record<string, number>;
      rows: FreezeRow[];
    };
    const m03 = JSON.parse(repositoryFile(
      'artifacts/product-reality/sprint-184/m03/closeout-report.json',
    ).toString('utf8')) as {
      m01FreezeAccounting: {
        movers: Array<{ path: string; measuredSha256: string }>;
      };
    };
    const m03Movers = new Map(m03.m01FreezeAccounting.movers.map((mover) => [
      mover.path,
      mover.measuredSha256,
    ]));
    const classCounts = inventory.rows.reduce<Record<string, number>>((counts, row) => {
      counts[row.rowClass] = (counts[row.rowClass] ?? 0) + 1;
      return counts;
    }, {});
    expect(inventory.rows).toHaveLength(inventory.rowCount);
    expect(classCounts).toEqual(inventory.countsByRowClass);

    const uniqueRows = new Map(inventory.rows.map((row) => [row.path, row]));
    expect(uniqueRows.size).toBe(inventory.uniquePathCount);
    const transitions: string[] = [];
    for (const row of uniqueRows.values()) {
      const measured = sha256(repositoryFile(row.path));
      const m01 = row.workingTreeSha256 ?? row.recordedSha256;
      const expected = m03Movers.get(row.path) ?? m01;
      expect(measured, `${row.rowClass}:${row.path}`).toBe(expected);
      if (measured !== m01) transitions.push(row.path);
    }
    expect(transitions.sort()).toEqual([...m03Movers.keys()].sort());
  });

  it('keeps every named frozen surface and ID-list pin byte-identical to the m04 base', () => {
    for (const repositoryPath of new Set([...namedFrozenSurfaces, ...idListPinFiles])) {
      expect(
        sha256(repositoryFile(repositoryPath)),
        repositoryPath,
      ).toBe(sha256(gitFile(repositoryPath)));
    }
    expect(sha256(repositoryFile(
      'artifacts/product-reality/sprint-182/m05/evidence-index.json',
    ))).toBe('f341a33e7544300d7d0a7357b6fab00e9e0515a5778880dac5938e00d2caab47');
    expect(sha256(repositoryFile(
      'artifacts/product-reality/sprint-184/m01/vue-packed-import/consumer.mjs',
    ))).toBe('f1d6dd4518bfd3036b2dca89b0d61f041d531a76e7e8de6a1c7325d37fe67491');
  });

  it('leaves foundation-v1 at 14 components and 28 promoted cells without a new approval call', () => {
    const foundation = JSON.parse(repositoryFile(
      'packages/component-contracts/registry/component-capability-foundation-v1.s182.v1.json',
    ).toString('utf8')) as { summary: { foundationV1Cells: number } };
    expect(NUCLEUS_COMPONENT_IDS).toHaveLength(14);
    expect(foundation.summary.foundationV1Cells).toBe(28);

    const diff = spawnSync('git', ['diff', '--unified=0', m04BaseCommit, '--'], {
      cwd: repositoryRoot,
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
    });
    expect(diff.status, diff.stderr).toBe(0);
    const addedLines = diff.stdout.split('\n').filter((line) => line.startsWith('+') && !line.startsWith('+++'));
    const evaluatorName = `evaluateFoundation${'V1'}`;
    expect(addedLines.filter((line) => line.includes(`${evaluatorName}(`))).toEqual([]);
  });

  it('keeps the capability baseline structurally byte-exact and check-promotion clean with no writes', () => {
    const baselinePath = 'packages/component-contracts/registry/component-capability-baseline.v1.json';
    expect(repositoryFile(baselinePath).equals(gitFile(baselinePath))).toBe(true);

    const statusBefore = spawnSync('git', ['status', '--porcelain=v1', '--untracked-files=all'], {
      cwd: repositoryRoot,
      encoding: 'utf8',
    });
    const check = spawnSync(process.execPath, [
      path.join(repositoryRoot, 'scripts/product-reality/generate-s182-m05-closeout.mjs'),
      '--check-promotion',
    ], { cwd: repositoryRoot, encoding: 'utf8', timeout: 120_000 });
    const statusAfter = spawnSync('git', ['status', '--porcelain=v1', '--untracked-files=all'], {
      cwd: repositoryRoot,
      encoding: 'utf8',
    });

    expect(check.status, `${check.stdout}\n${check.stderr}`).toBe(0);
    expect(check.stdout).toContain('Verified Sprint 182 independent-review projection: 28 foundation-v1 cells');
    expect(statusAfter.stdout).toBe(statusBefore.stdout);
  }, 120_000);
});
