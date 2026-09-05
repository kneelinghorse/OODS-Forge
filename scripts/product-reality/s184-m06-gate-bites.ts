import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

import {
  FRAMEWORKS,
  GATE_NAMES,
  type LiveGenerationCell,
  type PackedPackageRecord,
  type S184M06Framework,
  type S184M06GateName,
  runLiveConsumerCell,
} from './s184-m06-live-consumers.js';
import {
  assertS184M06GateBiteAccounting,
  type S184M06GateBiteTarget,
} from './s184-m06-evidence-controls.js';

type ConsumerMutationReport = {
  schema: string;
  framework: S184M06Framework;
  status: 'detected';
  expectedFailedGate: S184M06GateName;
  observedFailedGates: S184M06GateName[];
  gates: Array<{
    name: S184M06GateName;
    status: 'passed' | 'failed' | 'unproven';
    logs: string[];
    reason?: string;
  }>;
  mutation: {
    id: string;
    gate: S184M06GateName;
    operations: Array<{
      target: string;
      operation: string;
      replacementCount: number;
      beforeSha256: string | null;
      afterSha256: string;
    }>;
  };
  logs: string[];
};

export type S184M06GateBiteReport = {
  schemaVersion: '1.0.0';
  mission: 's184-m06';
  kind: 'eight-gate-consumer-mutation-bites';
  status: 'passed';
  subjectSchema: 'subscription-detail-dark';
  targetCount: 2;
  gateCountPerTarget: 8;
  selectedBites: 16;
  detectedBites: 16;
  hydrationBites: number;
  targets: S184M06GateBiteTarget[];
  cases: Array<{
    id: string;
    framework: S184M06Framework;
    expectedGate: S184M06GateName;
    observedFailedGates: S184M06GateName[];
    status: 'detected';
    report: string;
    logs: string[];
    operations: ConsumerMutationReport['mutation']['operations'];
    precedingPassedGates: S184M06GateName[];
    namedUnprovenAfterFailure: Array<{ gate: S184M06GateName; reason: string }>;
  }>;
  accountingRule: string;
};

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function canonicalJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function toPosix(value: string): string {
  return value.split(path.sep).join('/');
}

function mutationId(framework: S184M06Framework, gate: S184M06GateName): string {
  return `${framework}-${gate}-bite`;
}

/** Execute one real, isolated detail-schema consumer mutation per gate and target. */
export async function runS184M06GateBites({
  artifactRoot,
  generationCells,
  tarballs,
}: {
  artifactRoot: string;
  generationCells: LiveGenerationCell[];
  tarballs: PackedPackageRecord[];
}): Promise<S184M06GateBiteReport> {
  invariant(artifactRoot.length > 0, 'artifactRoot is required.');
  invariant(Array.isArray(tarballs) && tarballs.length > 0, 'Fresh packed tarballs are required.');
  const gateBiteRoot = path.join(artifactRoot, 'gate-bites');
  invariant(!fs.existsSync(gateBiteRoot), `Refusing to overwrite ${gateBiteRoot}.`);

  const cases: S184M06GateBiteReport['cases'] = [];
  for (const framework of FRAMEWORKS) {
    const generation = generationCells.find((cell) => (
      cell.schema === 'subscription-detail-dark' && cell.framework === framework
    ));
    invariant(generation, `Missing live detail generation cell for ${framework}.`);
    for (const gate of GATE_NAMES) {
      const id = mutationId(framework, gate);
      const raw = await runLiveConsumerCell({
        artifactRoot,
        generation,
        tarballs,
        mutation: { id, gate },
      }) as ConsumerMutationReport;
      invariant(raw.status === 'detected', `${id}: mutation was not detected.`);
      invariant(raw.expectedFailedGate === gate, `${id}: expected gate drifted.`);
      invariant(
        raw.observedFailedGates.length === 1 && raw.observedFailedGates[0] === gate,
        `${id}: observed failed gates were ${raw.observedFailedGates.join(', ')}.`,
      );
      invariant(raw.mutation.operations.length > 0, `${id}: no real mutation operation was executed.`);
      invariant(
        raw.mutation.operations.every(({ replacementCount, beforeSha256, afterSha256 }) => (
          replacementCount >= 1 && beforeSha256 !== afterSha256
        )),
        `${id}: mutation operation did not change bytes.`,
      );
      for (const row of raw.gates) {
        if (row.status === 'unproven') {
          invariant(row.logs.length === 0, `${id}/${row.name}: unproven gate names phantom logs.`);
        } else {
          invariant(row.logs.length > 0, `${id}/${row.name}: observed gate has no raw carrier.`);
          invariant(
            row.logs.every((log) => fs.existsSync(path.join(artifactRoot, log))),
            `${id}/${row.name}: observed gate names a missing raw carrier.`,
          );
        }
      }
      invariant(
        raw.logs.every((log) => fs.existsSync(path.join(artifactRoot, log))),
        `${id}: mutation summary names a missing raw carrier.`,
      );
      const reportPath = toPosix(path.join(
        'gate-bites', framework, gate, 'report.json',
      ));
      cases.push({
        id,
        framework,
        expectedGate: gate,
        observedFailedGates: raw.observedFailedGates,
        status: 'detected',
        report: reportPath,
        logs: raw.logs,
        operations: raw.mutation.operations,
        precedingPassedGates: raw.gates
          .filter(({ status }) => status === 'passed')
          .map(({ name }) => name),
        namedUnprovenAfterFailure: raw.gates
          .filter(({ status }) => status === 'unproven')
          .map(({ name, reason }) => ({
            gate: name,
            reason: reason ?? `Not reached after ${gate} failed.`,
          })),
      });
    }
  }

  const targets: S184M06GateBiteTarget[] = FRAMEWORKS.map((framework) => {
    const bites = cases.filter((entry) => entry.framework === framework);
    return {
      framework,
      provenCount: bites.length,
      namedUnprovenCount: 0,
      namedUnproven: [],
      bites: bites.map(({ id, expectedGate, observedFailedGates, status, logs }) => ({
        id,
        expectedGate,
        observedFailedGates,
        status,
        logs,
      })),
    };
  });
  assertS184M06GateBiteAccounting({ targets });
  const report: S184M06GateBiteReport = {
    schemaVersion: '1.0.0',
    mission: 's184-m06',
    kind: 'eight-gate-consumer-mutation-bites',
    status: 'passed',
    subjectSchema: 'subscription-detail-dark',
    targetCount: 2,
    gateCountPerTarget: 8,
    selectedBites: 16,
    detectedBites: 16,
    hydrationBites: cases.filter(({ expectedGate }) => expectedGate === 'hydration').length,
    targets,
    cases,
    accountingRule: 'For each target, provenCount + namedUnprovenCount equals exactly 8; every proven bite has one unique expected gate and one exact observed red gate.',
  };
  invariant(report.hydrationBites === 2, 'Hydration was not bitten once per target.');
  await fsp.mkdir(gateBiteRoot, { recursive: true });
  await fsp.writeFile(path.join(gateBiteRoot, 'report.json'), canonicalJson(report));
  await fsp.writeFile(path.join(gateBiteRoot, 'gate-bites.log'), `${[
    'Sprint 184 m06 eight-gate mutation bites',
    `status=${report.status}`,
    `selected=${report.selectedBites}`,
    `detected=${report.detectedBites}`,
    `hydration=${report.hydrationBites}`,
    ...cases.map((entry) => (
      `${entry.id} expected=${entry.expectedGate} observed=${entry.observedFailedGates.join(',')} `
      + `operations=${entry.operations.length}`
    )),
  ].join('\n')}\n`);
  return report;
}
