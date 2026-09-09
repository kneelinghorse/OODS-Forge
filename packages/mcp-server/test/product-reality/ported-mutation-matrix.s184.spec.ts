import { readFileSync } from 'node:fs';
import path from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';
import { PORTED_COMPONENT_IDS } from '@oods/component-contracts';

import {
  createPortedMutationMatrixReport,
  formatPortedMutationMatrixChecksums,
  formatPortedMutationMatrixLog,
  MUTATION_EVIDENCE_DIRECTORY,
  type PortedMutationMatrixReport,
} from '../../../../scripts/product-reality/s184-m04-ported-mutation-matrix.js';

const FRAMEWORKS = ['react', 'vue'] as const;

describe('Sprint 184 m04 ported export mutation evidence', () => {
  let report: PortedMutationMatrixReport;

  beforeAll(async () => {
    report = await createPortedMutationMatrixReport();
  }, 120_000);

  it('runs the complete 8x2 mutation matrix across all 16 cells', () => {
    expect(report).toMatchObject({
      schemaVersion: '1.0.0',
      mission: 's184-m04',
      status: 'passed',
      method: {
        physicalSourceWrites: false,
        generationProfile: 'build',
      },
      dimensions: {
        components: 8,
        frameworks: 2,
        cells: 16,
        mutations: 16,
        observationsPerMutation: 16,
        totalMutationCellObservations: 256,
      },
      totals: {
        mutationsPassed: 16,
        selectedReadinessReds: 16,
        selectedGenerationReds: 16,
        unselectedGreenObservations: 240,
        crossFrameworkDiscriminationsPassed: 16,
        restoredGreenCells: 16,
      },
    });
    expect(report.componentOrder).toEqual(PORTED_COMPONENT_IDS);
    expect(report.frameworkOrder).toEqual(FRAMEWORKS);
  });

  it('isolates each virtual named-export deletion to its selected readiness and generation cell', () => {
    for (const mutation of report.mutations) {
      expect(mutation).toMatchObject({
        replacementCount: 1,
        readinessRedCells: [mutation.selectedCell],
        generationRedCells: [mutation.selectedCell],
        exactIsolation: true,
        status: 'passed',
      });
      expect(mutation.observations).toHaveLength(16);
      expect(mutation.virtualSourceSha256After).not.toBe(mutation.sourceSha256Before);

      const selected = mutation.observations.find(({ cell }) => cell === mutation.selectedCell);
      expect(selected).toMatchObject({
        readiness: 'red',
        readinessCodes: ['OODS-N015'],
        generation: 'red',
        generationCodes: ['OODS-N015'],
        generatedArtifactNonempty: false,
      });
      const unselected = mutation.observations.filter(({ cell }) => cell !== mutation.selectedCell);
      expect(unselected).toHaveLength(15);
      expect(unselected.every((observation) => (
        observation.readiness === 'green'
        && observation.generation === 'green'
        && observation.generatedArtifactNonempty
      ))).toBe(true);
    }
  });

  it('proves cross-framework discrimination for every selected component', () => {
    for (const mutation of report.mutations) {
      expect(mutation.crossFrameworkStayedGreen, mutation.mutationId).toBe(true);
      const counterpart = mutation.observations.find(
        ({ cell }) => cell === mutation.crossFrameworkCell,
      );
      expect(counterpart).toMatchObject({
        component: mutation.targetComponent,
        framework: mutation.targetFramework === 'react' ? 'vue' : 'react',
        readiness: 'green',
        readinessCodes: [],
        generation: 'green',
        generationCodes: [],
        generatedArtifactNonempty: true,
      });
    }
  });

  it('restores every cell green without changing either target source on disk', () => {
    expect(report.restoration).toMatchObject({
      allCellsGreen: true,
      redCells: [],
      status: 'passed',
    });
    expect(report.restoration.greenCells).toHaveLength(16);
    expect(report.restoration.observations.every((observation) => (
      observation.readiness === 'green'
      && observation.generation === 'green'
      && observation.generatedArtifactNonempty
    ))).toBe(true);
    for (const framework of FRAMEWORKS) {
      expect(report.restoration.sourceSha256BeforeAndAfter[framework]).toMatchObject({
        unchanged: true,
      });
      expect(report.restoration.sourceSha256BeforeAndAfter[framework].before)
        .toBe(report.restoration.sourceSha256BeforeAndAfter[framework].after);
    }
    expect(Object.values(report.assertions).every(Boolean)).toBe(true);
  });

  it('retains historical checksums and the same mutation isolation as current source evolves', () => {
    const reportContents = readFileSync(path.join(MUTATION_EVIDENCE_DIRECTORY, 'mutation-matrix.json'), 'utf8');
    const retained = JSON.parse(reportContents) as PortedMutationMatrixReport;
    const logContents = formatPortedMutationMatrixLog(retained);
    expect(readFileSync(path.join(MUTATION_EVIDENCE_DIRECTORY, 'mutation-matrix.log'), 'utf8')).toBe(logContents);
    expect(readFileSync(path.join(MUTATION_EVIDENCE_DIRECTORY, 'SHA256SUMS'), 'utf8'))
      .toBe(formatPortedMutationMatrixChecksums(reportContents, logContents));
    // Source hashes identify their own executions; the 16-cell isolation promise stays exact.
    const semantics = (value: PortedMutationMatrixReport) => ({
      ...value,
      mutations: value.mutations.map(({ sourceSha256Before: _before, virtualSourceSha256After: _after, ...row }) => row),
      restoration: { ...value.restoration, sourceSha256BeforeAndAfter: undefined },
    });
    expect(semantics(report)).toEqual(semantics(retained));
  });
});
