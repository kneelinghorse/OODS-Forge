import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  assertS184M06DifferentialControl,
  assertS184M06GateBiteAccounting,
  assertS184M06LiveGateMatrix,
  auditS184M06ReferencedLogs,
  type S184M06CrossFrameworkReport,
  type S184M06DifferentialControl,
  type S184M06GateBiteTarget,
  type S184M06LiveCell,
} from '../../../../scripts/product-reality/s184-m06-evidence-controls.js';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, '../../../..');
const evidenceRoot = path.join(
  repositoryRoot,
  'artifacts/product-reality/sprint-184/m06',
);

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(evidenceRoot, relativePath), 'utf8')) as T;
}

function sha256(contents: Buffer): string {
  return createHash('sha256').update(contents).digest('hex');
}

function toPosix(value: string): string {
  return value.split(path.sep).join('/');
}

function filesRecursively(root: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const absolutePath = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...filesRecursively(absolutePath));
    if (entry.isFile()) files.push(absolutePath);
  }
  return files.sort();
}

describe('Sprint 184 m06 retained live workflow evidence', () => {
  it('retains the exact live matrix, sixteen real gate bites, and honest partial claim', () => {
    const closeout = readJson<{
      status: string;
      measuredImplementationCommit: string;
      scopeStatement: string;
      headline: Record<string, unknown>;
      unrunChecks: unknown[];
    }>('closeout-report.json');
    const live = readJson<{ status: string; cells: S184M06LiveCell[] }>(
      'live-consumers/report.json',
    );
    const bites = readJson<{
      status: string;
      selectedBites: number;
      detectedBites: number;
      hydrationBites: number;
      targets: S184M06GateBiteTarget[];
      cases: Array<{
        report: string;
        logs: string[];
        operations: Array<{ beforeSha256: string | null; afterSha256: string }>;
      }>;
    }>('live-consumers/gate-bites/report.json');

    assertS184M06LiveGateMatrix(live);
    assertS184M06GateBiteAccounting(bites);
    expect(live.status).toBe('passed');
    expect(bites).toMatchObject({
      status: 'passed',
      selectedBites: 16,
      detectedBites: 16,
      hydrationBites: 2,
    });
    expect(bites.cases).toHaveLength(16);
    expect(bites.cases.every(({ operations }) => (
      operations.length > 0
      && operations.every(({ beforeSha256, afterSha256 }) => beforeSha256 !== afterSha256)
    ))).toBe(true);
    for (const entry of bites.cases) {
      const raw = readJson<{
        gates: Array<{ status: string; logs: string[] }>;
        logs: string[];
      }>(`live-consumers/${entry.report}`);
      expect(raw.gates.filter(({ status }) => status === 'unproven').every(({ logs }) => (
        logs.length === 0
      ))).toBe(true);
      expect(raw.logs).toEqual(entry.logs);
      expect(raw.logs.every((log) => fs.existsSync(path.join(evidenceRoot, 'live-consumers', log))))
        .toBe(true);
    }
    expect(closeout).toMatchObject({
      status: 'passed',
      headline: {
        liveConsumerGates: '32/32 passed',
        schemaTargetCells: '4/4 passed',
        mutationBites: '16/16 detected',
        hydrationBites: '2/2 detected',
        unrunChecks: [],
      },
      unrunChecks: [],
    });
    expect(closeout.scopeStatement).toContain('partially discharges');
    expect(closeout.scopeStatement).toContain(
      'Edit/cancel and timeline remain outside as end-to-end workflow steps',
    );

    const index = readJson<{ measuredImplementationCommit: string }>('evidence-index.json');
    expect(closeout.measuredImplementationCommit).toMatch(/^[a-f0-9]{40}$/);
    expect(index.measuredImplementationCommit).toBe(closeout.measuredImplementationCommit);
    expect(spawnSync(
      'git',
      ['cat-file', '-e', `${closeout.measuredImplementationCommit}^{commit}`],
      { cwd: repositoryRoot },
    ).status).toBe(0);
    expect(spawnSync(
      'git',
      ['merge-base', '--is-ancestor', closeout.measuredImplementationCommit, 'HEAD'],
      { cwd: repositoryRoot },
    ).status).toBe(0);
  });

  it('retains the live-only emitter differential and its exact reverse restoration', () => {
    const differential = readJson<S184M06DifferentialControl>('differential/report.json');
    assertS184M06DifferentialControl(differential);
  });

  it('retains exact bidirectional framework discrimination and source restoration', () => {
    const cross = readJson<S184M06CrossFrameworkReport>(
      'cross-framework-discrimination.json',
    );
    expect(cross).toMatchObject({
      status: 'passed',
      method: {
        componentId: 'StatusBadge',
        physicalSourceWrites: false,
        profile: 'build',
      },
      totals: {
        cases: 2,
        selectedRedCells: 4,
        counterpartGreenCells: 4,
        restoredGreenCells: 4,
      },
      restoration: { status: 'passed' },
    });
    expect(cross.cases.map(({ deletedFramework }) => deletedFramework)).toEqual(['react', 'vue']);
    for (const entry of cross.cases) {
      const counterpart = entry.deletedFramework === 'react' ? 'vue' : 'react';
      expect(entry.replacementCount).toBe(1);
      expect(entry.redCells).toEqual([
        `subscription-list-dark/${entry.deletedFramework}`,
        `subscription-detail-dark/${entry.deletedFramework}`,
      ]);
      expect(entry.greenCells).toEqual([
        `subscription-list-dark/${counterpart}`,
        `subscription-detail-dark/${counterpart}`,
      ]);
      expect(entry.observations.filter(({ status }) => status === 'red').every(({ errorCodes, artifactNonempty }) => (
        !artifactNonempty && errorCodes.length === 1 && errorCodes[0] === 'OODS-N015'
      ))).toBe(true);
    }
    expect(Object.values(cross.restoration.sourceDigests).every(({ before, after, unchanged }) => (
      unchanged && before === after
    ))).toBe(true);
  });

  it('covers every retained file with checksums and every raw log with the tracked-log audit', () => {
    const checksumPath = path.join(evidenceRoot, 'SHA256SUMS');
    const checksumRows = fs.readFileSync(checksumPath, 'utf8')
      .trim()
      .split(/\r?\n/)
      .map((line) => {
        const match = line.match(/^([a-f0-9]{64})  (.+)$/);
        expect(match, line).not.toBeNull();
        return { expected: match![1]!, relativePath: match![2]! };
      });
    const expectedChecksumPaths = filesRecursively(evidenceRoot)
      .filter((file) => file !== checksumPath)
      .map((file) => toPosix(path.relative(evidenceRoot, file)));
    expect(checksumRows.map(({ relativePath }) => relativePath)).toEqual(expectedChecksumPaths);
    for (const { expected, relativePath } of checksumRows) {
      expect(sha256(fs.readFileSync(path.join(evidenceRoot, relativePath))), relativePath).toBe(expected);
    }

    const index = readJson<{
      status: string;
      logs: string[];
      rawLogCount: number;
      unrunMissionChecks: unknown[];
    }>('evidence-index.json');
    const diskLogs = filesRecursively(evidenceRoot)
      .filter((file) => file.endsWith('.log'))
      .map((file) => toPosix(path.relative(repositoryRoot, file)));
    expect(index.logs).toEqual(diskLogs);
    expect(index.rawLogCount).toBe(diskLogs.length);
    expect(index.unrunMissionChecks).toEqual([]);
    expect(index.status).toBe('passed');

    const audit = auditS184M06ReferencedLogs(repositoryRoot, evidenceRoot);
    expect(audit.referencedLogs.length).toBeGreaterThan(0);
    expect(audit.missing).toEqual([]);
    expect(audit.untracked).toEqual([]);
    expect(audit.status).toBe('passed');
  });
});
