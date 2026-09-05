import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

type AdvertisedMoverRecord = {
  baseCommit: string;
  measuredImplementationCommit: string;
  derivation: { includedPaths: string[]; setComparison: string };
  expectedCount: number;
  observedCount: number;
  missingFromRecord: string[];
  extraInRecord: string[];
  movers: string[];
  consumer: string;
  status: string;
};

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, '../../../..');
const record = JSON.parse(readFileSync(path.join(
  repositoryRoot,
  'artifacts/product-reality/sprint-184/m05/advertised-movers.json',
), 'utf8')) as AdvertisedMoverRecord;

describe('Sprint 184 m05 advertised mover derivation', () => {
  it('equals the restricted implementation diff as an exact bidirectional set', () => {
    const result = spawnSync('git', [
      'diff',
      '--name-only',
      record.baseCommit,
      record.measuredImplementationCommit,
      '--',
      ...record.derivation.includedPaths,
    ], { cwd: repositoryRoot, encoding: 'utf8' });

    expect(result.status, result.stderr).toBe(0);
    const actual = result.stdout.trim().split(/\r?\n/).filter(Boolean);
    const actualSet = new Set(actual);
    const recordedSet = new Set(record.movers);
    const missingFromRecord = actual.filter((mover) => !recordedSet.has(mover));
    const extraInRecord = record.movers.filter((mover) => !actualSet.has(mover));

    expect(missingFromRecord).toEqual([]);
    expect(extraInRecord).toEqual([]);
    expect(record.missingFromRecord).toEqual(missingFromRecord);
    expect(record.extraInRecord).toEqual(extraInRecord);
    expect(record.movers).toEqual(actual);
    expect(new Set(record.movers).size).toBe(record.movers.length);
    expect(record.expectedCount).toBe(actual.length);
    expect(record.observedCount).toBe(actual.length);
    expect(record.derivation.setComparison).toBe('exact equality in both directions');
    expect(record.consumer).toBe('s184-m07 reconnect audit');
    expect(record.status).toBe('passed');
  });
});
