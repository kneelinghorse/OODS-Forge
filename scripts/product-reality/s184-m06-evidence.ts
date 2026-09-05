import { createHash } from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  assertS184M06LiveGateMatrix,
  createS184M06CrossFrameworkDiscriminationReport,
  createS184M06DifferentialControl,
} from './s184-m06-evidence-controls.js';
import { runS184M06GateBites } from './s184-m06-gate-bites.js';
import { runLiveWorkflowProof } from './s184-m06-live-consumers.js';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
export const S184_M06_REPOSITORY_ROOT = path.resolve(scriptDirectory, '../..');
export const S184_M06_EVIDENCE_ROOT = path.join(
  S184_M06_REPOSITORY_ROOT,
  'artifacts/product-reality/sprint-184/m06',
);
const DEFERRED_RETAINED_SPEC = 'packages/mcp-server/test/product-reality/m06-evidence.s184.spec.ts';

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function canonicalJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function sha256(value: Buffer | string): string {
  return createHash('sha256').update(value).digest('hex');
}

function toPosix(value: string): string {
  return value.split(path.sep).join('/');
}

function repositoryPath(absolutePath: string): string {
  return toPosix(path.relative(S184_M06_REPOSITORY_ROOT, absolutePath));
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

function git(args: string[]): string {
  const result = spawnSync('git', args, {
    cwd: S184_M06_REPOSITORY_ROOT,
    encoding: 'utf8',
  });
  invariant(result.status === 0, `git ${args.join(' ')} failed: ${result.stderr}`);
  return result.stdout.trim();
}

export type S184M06EvidenceReport = {
  schemaVersion: '1.0.0';
  mission: 's184-m06';
  status: 'passed';
  measuredImplementationCommit: string;
  measurementBoundary: {
    trackedTree: 'clean';
    untrackedMeasurementInputs: [];
    deferredRetainedSpec: string | null;
  };
  scopeStatement: string;
  headline: {
    liveConsumerGates: '32/32 passed';
    schemaTargetCells: '4/4 passed';
    mutationBites: '16/16 detected';
    hydrationBites: '2/2 detected';
    differential: 'live changed; Sprint-183 unchanged; reverse restored';
    crossFrameworkDiscrimination: '2/2 directions exact';
    unrunChecks: [];
  };
  reports: Record<string, string>;
  unrunChecks: [];
};

export async function generateS184M06Evidence({
  implementationCommit,
  evidenceRoot = S184_M06_EVIDENCE_ROOT,
}: {
  implementationCommit: string;
  evidenceRoot?: string;
}): Promise<S184M06EvidenceReport> {
  invariant(/^[a-f0-9]{40}$/.test(implementationCommit), 'A full implementation commit is required.');
  invariant(git(['rev-parse', 'HEAD']) === implementationCommit, 'HEAD differs from the measured implementation commit.');
  const workingTreeRows = git(['status', '--short', '--untracked-files=all'])
    .split(/\r?\n/)
    .filter(Boolean);
  const deferredSpecRow = `?? ${DEFERRED_RETAINED_SPEC}`;
  const unexpectedRows = workingTreeRows.filter((row) => row !== deferredSpecRow);
  invariant(
    unexpectedRows.length === 0,
    `M06 evidence requires a clean implementation boundary; unexpected rows: ${unexpectedRows.join(', ')}.`,
  );
  invariant(!fs.existsSync(evidenceRoot), `Refusing to overwrite ${evidenceRoot}.`);
  await fsp.mkdir(evidenceRoot, { recursive: true });

  const liveRoot = path.join(evidenceRoot, 'live-consumers');
  const live = await runLiveWorkflowProof({ artifactRoot: liveRoot });
  assertS184M06LiveGateMatrix(live.report as {
    cells: Array<{
      schema: string;
      framework: string;
      status: string;
      gates: Array<{ name: string; status: string; logs: string[] }>;
    }>;
  });
  const bites = await runS184M06GateBites({
    artifactRoot: liveRoot,
    generationCells: live.generationCells,
    tarballs: live.tarballs,
  });

  const differential = await createS184M06DifferentialControl({
    implementationCommit,
    outputRoot: evidenceRoot,
  });
  const crossFramework = await createS184M06CrossFrameworkDiscriminationReport();
  const crossPath = path.join(evidenceRoot, 'cross-framework-discrimination.json');
  await fsp.writeFile(crossPath, canonicalJson(crossFramework));
  await fsp.writeFile(path.join(evidenceRoot, 'cross-framework-discrimination.log'), `${[
    'Sprint 184 m06 cross-framework discrimination',
    `status=${crossFramework.status}`,
    ...crossFramework.cases.map((entry) => (
      `${entry.id} red=${entry.redCells.join(',')} green=${entry.greenCells.join(',')}`
    )),
    `restored=${crossFramework.restoration.greenCells.length}/4`,
  ].join('\n')}\n`);

  const report: S184M06EvidenceReport = {
    schemaVersion: '1.0.0',
    mission: 's184-m06',
    status: 'passed',
    measuredImplementationCommit: implementationCommit,
    measurementBoundary: {
      trackedTree: 'clean',
      untrackedMeasurementInputs: [],
      deferredRetainedSpec: workingTreeRows.includes(deferredSpecRow)
        ? DEFERRED_RETAINED_SPEC
        : null,
    },
    scopeStatement: 'Sprint 184 only partially discharges the Increment-3 workflow gate: M06 proves live, state-neutral Subscription list/detail artifacts and generated interactions in React and Vue, while M05 separately proves the generic loading, empty, error, and success state axis. Edit/cancel and timeline remain outside as end-to-end workflow steps because no pre-existing saved Subscription schema carries their destination screens.',
    headline: {
      liveConsumerGates: '32/32 passed',
      schemaTargetCells: '4/4 passed',
      mutationBites: '16/16 detected',
      hydrationBites: '2/2 detected',
      differential: 'live changed; Sprint-183 unchanged; reverse restored',
      crossFrameworkDiscrimination: '2/2 directions exact',
      unrunChecks: [],
    },
    reports: {
      liveWorkflow: repositoryPath(path.join(liveRoot, 'report.json')),
      gateBites: repositoryPath(path.join(liveRoot, 'gate-bites/report.json')),
      differential: repositoryPath(path.join(evidenceRoot, 'differential/report.json')),
      crossFramework: repositoryPath(crossPath),
    },
    unrunChecks: [],
  };
  invariant(live.report.status === 'passed', 'Live workflow report is not passed.');
  invariant(bites.status === 'passed' && bites.detectedBites === 16, 'Gate bites are incomplete.');
  invariant(differential.status === 'passed', 'Differential control is not passed.');
  invariant(crossFramework.status === 'passed', 'Cross-framework control is not passed.');
  await fsp.writeFile(path.join(evidenceRoot, 'closeout-report.json'), canonicalJson(report));
  await fsp.writeFile(path.join(evidenceRoot, 'seal.log'), `${[
    'Sprint 184 m06 evidence seal',
    `implementationCommit=${implementationCommit}`,
    'liveConsumerGates=32/32',
    'gateBites=16/16',
    'hydrationBites=2/2',
    'differential=passed',
    'crossFramework=passed',
    'unrunChecks=0',
  ].join('\n')}\n`);

  const beforeIndex = filesRecursively(evidenceRoot);
  const logs = beforeIndex
    .filter((file) => file.endsWith('.log'))
    .map(repositoryPath);
  const primaryArtifacts = [
    path.join(evidenceRoot, 'closeout-report.json'),
    path.join(liveRoot, 'report.json'),
    path.join(liveRoot, 'gate-bites/report.json'),
    path.join(evidenceRoot, 'differential/report.json'),
    crossPath,
  ].map(repositoryPath);
  const evidenceIndex = {
    schemaVersion: '1.0.0',
    sprintId: 'sprint-184',
    missionId: 's184-m06',
    kind: 'evidence-index',
    status: 'passed',
    measuredImplementationCommit: implementationCommit,
    primaryArtifacts: [
      repositoryPath(path.join(evidenceRoot, 'SHA256SUMS')),
      ...primaryArtifacts,
    ],
    logs,
    rawLogCount: logs.length,
    retentionVerification: 'Stage the entire M06 evidence tree, then run the retained-evidence spec; it requires every JSON-referenced log to be returned by git ls-files.',
    unrunMissionChecks: [],
  };
  await fsp.writeFile(path.join(evidenceRoot, 'evidence-index.json'), canonicalJson(evidenceIndex));

  const checksumFiles = filesRecursively(evidenceRoot)
    .filter((file) => path.basename(file) !== 'SHA256SUMS');
  const checksums = checksumFiles.map((file) => (
    `${sha256(fs.readFileSync(file))}  ${toPosix(path.relative(evidenceRoot, file))}`
  ));
  await fsp.writeFile(path.join(evidenceRoot, 'SHA256SUMS'), `${checksums.join('\n')}\n`);
  return report;
}

function cliArguments(argv: string[]): { implementationCommit: string; evidenceRoot: string } {
  let implementationCommit = '';
  let evidenceRoot = S184_M06_EVIDENCE_ROOT;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]!;
    if (argument === '--implementation-commit') {
      implementationCommit = argv[++index] ?? '';
    } else if (argument === '--output') {
      evidenceRoot = path.resolve(argv[++index] ?? '');
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  return { implementationCommit, evidenceRoot };
}

const invokedPath = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : null;

if (invokedPath === import.meta.url) {
  generateS184M06Evidence(cliArguments(process.argv.slice(2)))
    .then((report) => process.stdout.write(canonicalJson(report)))
    .catch((error: unknown) => {
      process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
      process.exitCode = 1;
    });
}
