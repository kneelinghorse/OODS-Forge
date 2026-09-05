import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, '../../../..');
const evidenceRoot = path.join(
  repositoryRoot,
  'artifacts/product-reality/sprint-184/m05',
);

function json<T>(name: string): T {
  return JSON.parse(readFileSync(path.join(evidenceRoot, name), 'utf8')) as T;
}

function sha256(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

describe('Sprint 184 m05 retained evidence', () => {
  it('retains the complete state, parity, mutation, Table, and Input headline', () => {
    const build = json<{ summary: Record<string, number>; cells: unknown[] }>(
      'state-build-matrix.json',
    );
    const parity = json<{
      differenceCount: number;
      allowlistCount: number;
      computedDifferences: unknown[];
      declaredDifferenceAllowlist: unknown[];
    }>('parity-report.json');
    const mutations = json<{
      dimensions: { mutations: number; totalAssertionObservations: number };
      summary: {
        passedMutations: number;
        exactSelectedReds: number;
        unselectedGreenObservations: number;
        restoredGreenCells: number;
      };
      mutations: Array<{
        replacementCount: number;
        redCells: string[];
        greenCellCount: number;
        exactIsolation: boolean;
        status: string;
      }>;
    }>('mutations/mutation-matrix.json');
    const tableInput = json<{
      table: { targets: number; greenTargets: number; text: string };
      inputValidation: { selectedCells: number; greenCells: number; disposition: string };
    }>('table-input-report.json');
    const controls = json<{
      assertions: {
        propsLoadingV007BuildReds: number;
        inertMetaIntentCells: number;
        unknownBuildReds: number;
        unknownDraftWarnings: number;
      };
    }>('contract-controls.json');
    const closeout = json<{
      headline: Record<string, unknown>;
      unrunChecks: unknown[];
      status: string;
    }>('closeout-report.json');

    expect(build.summary).toMatchObject({
      selectedCells: 8,
      greenCells: 8,
      nonEmptyArtifacts: 8,
      errors: 0,
    });
    expect(build.cells).toHaveLength(8);
    expect(parity).toMatchObject({ differenceCount: 0, allowlistCount: 0 });
    expect(parity.computedDifferences).toEqual([]);
    expect(parity.declaredDifferenceAllowlist).toEqual([]);
    expect(mutations.dimensions).toEqual({
      states: 4,
      frameworks: 2,
      mutations: 8,
      assertionCellsPerMutation: 8,
      totalAssertionObservations: 64,
    });
    expect(mutations.summary).toMatchObject({
      passedMutations: 8,
      exactSelectedReds: 8,
      unselectedGreenObservations: 56,
      restoredGreenCells: 8,
    });
    expect(mutations.mutations).toHaveLength(8);
    for (const mutation of mutations.mutations) {
      expect(mutation).toMatchObject({
        replacementCount: 1,
        greenCellCount: 7,
        exactIsolation: true,
        status: 'passed',
      });
      expect(mutation.redCells).toHaveLength(1);
    }
    expect(tableInput.table).toEqual(expect.objectContaining({
      targets: 2,
      greenTargets: 2,
      text: 'No rows available.',
    }));
    expect(tableInput.inputValidation).toMatchObject({
      selectedCells: 4,
      greenCells: 4,
      disposition: expect.stringContaining('pre-existing'),
    });
    expect(controls.assertions).toEqual({
      propsLoadingV007BuildReds: 2,
      inertMetaIntentCells: 2,
      unknownBuildReds: 2,
      unknownDraftWarnings: 2,
    });
    expect(closeout.headline).toMatchObject({
      stateBuildCells: '8/8 green',
      parityDifferences: 0,
      parityAllowlistEntries: 0,
      tableEmptyTargets: '2/2 green',
      inputValidationPins: '4/4 green (pre-existing)',
      unrunChecks: [],
    });
    expect(closeout.unrunChecks).toEqual([]);
    expect(closeout.status).toBe('passed');
  });

  it('resolves every indexed artifact and verifies the root checksum receipt', () => {
    const index = json<{
      primaryArtifacts: string[];
      logs: string[];
      unrunMissionChecks: unknown[];
      status: string;
    }>('evidence-index.json');
    for (const repositoryPath of [...index.primaryArtifacts, ...index.logs]) {
      expect(existsSync(path.join(repositoryRoot, repositoryPath)), repositoryPath).toBe(true);
    }
    expect(index.unrunMissionChecks).toEqual([]);
    expect(index.status).toBe('passed');

    const checksumLines = readFileSync(path.join(evidenceRoot, 'SHA256SUMS'), 'utf8')
      .trim()
      .split(/\r?\n/);
    expect(checksumLines.length).toBeGreaterThan(0);
    for (const line of checksumLines) {
      const match = line.match(/^([a-f0-9]{64})  (.+)$/);
      expect(match, line).not.toBeNull();
      const [, expected, relativePath] = match!;
      expect(
        sha256(readFileSync(path.join(evidenceRoot, relativePath!))),
        relativePath,
      ).toBe(expected);
    }
  });
});
