import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { describe, expect, it } from 'vitest';

import {
  S184_M06_FRAMEWORKS,
  S184_M06_GATE_NAMES,
  S184_M06_SCHEMA_NAMES,
  assertS184M06DifferentialControl,
  assertS184M06GateBiteAccounting,
  assertS184M06LiveGateMatrix,
  auditS184M06ReferencedLogs,
  createS184M06CrossFrameworkDiscriminationReport,
  createS184M06GenerationSnapshot,
  createS183HarnessSnapshot,
  type S184M06DifferentialControl,
  type S184M06GateBiteTarget,
  type S184M06LiveCell,
} from '../../../../scripts/product-reality/s184-m06-evidence-controls.js';

const log = 'artifacts/product-reality/sprint-184/m06/logs/control.log';

function validCells(): S184M06LiveCell[] {
  return S184_M06_SCHEMA_NAMES.flatMap((schema) => (
    S184_M06_FRAMEWORKS.map((framework) => ({
      schema,
      framework,
      status: 'passed',
      gates: S184_M06_GATE_NAMES.map((name) => ({ name, status: 'passed', logs: [log] })),
    }))
  ));
}

function validBiteTargets(): S184M06GateBiteTarget[] {
  return S184_M06_FRAMEWORKS.map((framework) => ({
    framework,
    provenCount: 8,
    namedUnprovenCount: 0,
    namedUnproven: [],
    bites: S184_M06_GATE_NAMES.map((gate) => ({
      id: `${framework}-${gate}`,
      expectedGate: gate,
      observedFailedGates: [gate],
      status: 'detected',
      logs: [log],
    })),
  }));
}

function validDifferential(): S184M06DifferentialControl {
  return {
    status: 'passed',
    mutation: {
      sourcePath: 'packages/mcp-server/src/codegen/react-emitter.ts',
      replacementCount: 1,
      touchedPaths: ['packages/mcp-server/src/codegen/react-emitter.ts'],
      artifactJsonPathsTouched: [],
      forwardPatch: 'mutations/emitter-forward.patch',
      reversePatch: 'mutations/emitter-reverse.patch',
    },
    newHarness: {
      baselineSha256: 'sha256:live-before',
      mutatedSha256: 'sha256:live-after',
      restoredSha256: 'sha256:live-before',
    },
    sprint183Harness: {
      baselineSha256: 'sha256:legacy',
      mutatedSha256: 'sha256:legacy',
      restoredSha256: 'sha256:legacy',
      forbiddenReferenceCounts: {
        'code.generate': 0,
        codeGenerate: 0,
        emitter: 0,
        generateCode: 0,
      },
    },
    logs: [log],
  };
}

describe('Sprint 184 m06 evidence controls', () => {
  it('acquires current code.generate output while the Sprint-183 harness still acquires committed artifacts', async () => {
    const [live, legacy] = await Promise.all([
      createS184M06GenerationSnapshot(),
      createS183HarnessSnapshot(),
    ]);

    expect(live).toMatchObject({
      acquisition: 'live-code.generate-handler',
      kind: 's184-m06-live-code-generate-snapshot',
    });
    expect(live.cells).toHaveLength(4);
    expect(live.cells.every(({ status, codeBytes }) => status === 'ok' && codeBytes > 0)).toBe(true);
    expect(legacy).toMatchObject({
      acquisition: 'loadCommittedRunnableArtifacts',
      kind: 's183-m05-committed-artifact-harness-snapshot',
      forbiddenReferenceCounts: {
        'code.generate': 0,
        codeGenerate: 0,
        emitter: 0,
        generateCode: 0,
      },
    });
    expect(legacy.artifacts).toHaveLength(2);
  });

  it('discriminates the two frozen workflow schemas when one framework loses StatusBadge', async () => {
    const report = await createS184M06CrossFrameworkDiscriminationReport();

    expect(report).toMatchObject({
      status: 'passed',
      totals: {
        cases: 2,
        selectedRedCells: 4,
        counterpartGreenCells: 4,
        restoredGreenCells: 4,
      },
      method: {
        componentId: 'StatusBadge',
        physicalSourceWrites: false,
        profile: 'build',
      },
    });
    expect(report.cases.map(({ deletedFramework }) => deletedFramework)).toEqual(['react', 'vue']);
    for (const control of report.cases) {
      expect(control.redCells).toEqual(
        S184_M06_SCHEMA_NAMES.map((schema) => `${schema}/${control.deletedFramework}`),
      );
      expect(control.observations.filter(({ status }) => status === 'red'))
        .toHaveLength(2);
      expect(control.observations.filter(({ status }) => status === 'red')
        .every(({ errorCodes, artifactNonempty }) => (
          errorCodes.length === 1 && errorCodes[0] === 'OODS-N015' && !artifactNonempty
        ))).toBe(true);
    }
    expect(report.restoration.greenCells).toHaveLength(4);
    expect(Object.values(report.restoration.sourceDigests).every(({ unchanged }) => unchanged))
      .toBe(true);
  });

  it('requires all four live cells to report the exact eight named gates with raw logs', () => {
    const cells = validCells();
    expect(() => assertS184M06LiveGateMatrix({ cells })).not.toThrow();

    const duplicate = structuredClone(cells);
    duplicate[0]!.gates[7]!.name = 'hydration';
    expect(() => assertS184M06LiveGateMatrix({ cells: duplicate }))
      .toThrow(/duplicate values|expected/);

    const logless = structuredClone(cells);
    logless[0]!.gates[0]!.logs = [];
    expect(() => assertS184M06LiveGateMatrix({ cells: logless }))
      .toThrow(/raw log/);
  });

  it('counts each target once per gate, requires a hydration bite, and cannot headline unproven work', () => {
    const targets = validBiteTargets();
    expect(() => assertS184M06GateBiteAccounting({ targets })).not.toThrow();

    const duplicate = structuredClone(targets);
    duplicate[0]!.bites[0]!.expectedGate = 'strict-typecheck';
    duplicate[0]!.bites[0]!.observedFailedGates = ['strict-typecheck'];
    expect(() => assertS184M06GateBiteAccounting({ targets: duplicate }))
      .toThrow(/duplicate values|same gate/);

    const falseHeadline = structuredClone(targets);
    falseHeadline[0]!.bites.pop();
    expect(() => assertS184M06GateBiteAccounting({ targets: falseHeadline }))
      .toThrow(/provenCount does not match bites/);

    const wrongGate = structuredClone(targets);
    wrongGate[0]!.bites[0]!.observedFailedGates = ['strict-typecheck'];
    expect(() => assertS184M06GateBiteAccounting({ targets: wrongGate }))
      .toThrow(/did not red exactly/);
  });

  it('requires an emitter-only mutation to change live output, leave s183 inert, and restore both', () => {
    const report = validDifferential();
    expect(() => assertS184M06DifferentialControl(report)).not.toThrow();

    const deadLiveControl = structuredClone(report);
    deadLiveControl.newHarness.mutatedSha256 = deadLiveControl.newHarness.baselineSha256;
    expect(() => assertS184M06DifferentialControl(deadLiveControl))
      .toThrow(/did not change the live harness/);

    const legacyMoved = structuredClone(report);
    legacyMoved.sprint183Harness.mutatedSha256 = 'sha256:legacy-moved';
    expect(() => assertS184M06DifferentialControl(legacyMoved))
      .toThrow(/changed the Sprint-183/);

    const artifactTouched = structuredClone(report);
    artifactTouched.mutation.artifactJsonPathsTouched.push('legacy.artifact.json');
    expect(() => assertS184M06DifferentialControl(artifactTouched))
      .toThrow(/artifact JSON/);
  });

  it('finds every JSON-referenced raw log that is absent from git ls-files', () => {
    const repositoryRoot = mkdtempSync(path.join(tmpdir(), 'oods-s184-m06-retention-'));
    const evidenceRoot = path.join(
      repositoryRoot,
      'artifacts/product-reality/sprint-184/m06',
    );
    mkdirSync(path.join(evidenceRoot, 'logs'), { recursive: true });
    writeFileSync(path.join(evidenceRoot, 'logs/control.log'), 'control\n');
    writeFileSync(path.join(evidenceRoot, 'report.json'), `${JSON.stringify({
      logs: ['logs/control.log'],
      reason: 'npm failed\nA complete log is at <consumer-root>/.npm-cache/_logs/debug-0.log',
    }, null, 2)}\n`);
    expect(spawnSync('git', ['init', '-q'], { cwd: repositoryRoot }).status).toBe(0);
    expect(spawnSync('git', ['add', 'artifacts'], { cwd: repositoryRoot }).status).toBe(0);

    const green = auditS184M06ReferencedLogs(repositoryRoot, evidenceRoot);
    expect(green).toMatchObject({ status: 'passed', missing: [], untracked: [] });
    expect(green.referencedLogs).toEqual([
      'artifacts/product-reality/sprint-184/m06/logs/control.log',
    ]);

    writeFileSync(path.join(evidenceRoot, 'report.json'), `${JSON.stringify({
      logs: ['logs/control.log', 'logs/untracked.log'],
    }, null, 2)}\n`);
    writeFileSync(path.join(evidenceRoot, 'logs/untracked.log'), 'untracked\n');
    const red = auditS184M06ReferencedLogs(repositoryRoot, evidenceRoot);
    expect(red.status).toBe('failed');
    expect(red.missing).toEqual([]);
    expect(red.untracked).toEqual([
      'artifacts/product-reality/sprint-184/m06/logs/untracked.log',
    ]);
  });
});
