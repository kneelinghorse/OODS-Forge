import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterAll, describe, expect, it } from 'vitest';

import { packFoundationPackages } from '../../../../scripts/product-reality/s182-m04-consumer-harness.mjs';
import { runS184M06GateBites } from '../../../../scripts/product-reality/s184-m06-gate-bites.js';
import {
  FRAMEWORKS,
  GATE_NAMES,
  runLiveGenerationOnly,
  type PackedPackageRecord,
} from '../../../../scripts/product-reality/s184-m06-live-consumers.js';

let artifactRoot: string | null = null;

afterAll(async () => {
  if (artifactRoot) await fsp.rm(artifactRoot, { recursive: true, force: true });
});

describe('Sprint 184 m06 real consumer gate bites', () => {
  it('executes one unique red mutation for every gate on both framework targets', async () => {
    artifactRoot = await fsp.mkdtemp(path.join(os.tmpdir(), 'oods-s184-m06-gate-bites-'));
    const tarballs = await packFoundationPackages(artifactRoot) as PackedPackageRecord[];
    const generation = await runLiveGenerationOnly({ artifactRoot });
    const report = await runS184M06GateBites({
      artifactRoot,
      generationCells: generation.cells,
      tarballs,
    });

    expect(report).toMatchObject({
      status: 'passed',
      subjectSchema: 'subscription-detail-dark',
      targetCount: 2,
      gateCountPerTarget: 8,
      selectedBites: 16,
      detectedBites: 16,
      hydrationBites: 2,
    });
    expect(report.targets.map(({ framework }) => framework)).toEqual(FRAMEWORKS);
    for (const target of report.targets) {
      expect(target).toMatchObject({
        provenCount: 8,
        namedUnprovenCount: 0,
        namedUnproven: [],
      });
      expect(target.bites.map(({ expectedGate }) => expectedGate)).toEqual(GATE_NAMES);
      expect(target.bites.every(({ expectedGate, observedFailedGates, status }) => (
        status === 'detected'
        && observedFailedGates.length === 1
        && observedFailedGates[0] === expectedGate
      ))).toBe(true);
    }
    expect(report.cases.every(({ operations }) => (
      operations.length > 0
      && operations.every(({ replacementCount, beforeSha256, afterSha256 }) => (
        replacementCount >= 1 && beforeSha256 !== afterSha256
      ))
    ))).toBe(true);
  }, 1_800_000);
});
