import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  createTargetCapabilityPreflight,
} from '../../packages/mcp-server/src/codegen/target-readiness.js';
import type { UiSchema } from '../../packages/mcp-server/src/schemas/generated.js';
import { handle as generateCode } from '../../packages/mcp-server/src/tools/code.generate.js';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
export const S184_M06_REPOSITORY_ROOT = path.resolve(scriptDirectory, '../..');

export const S184_M06_GATE_NAMES = Object.freeze([
  'fresh-exact-tarball-install',
  'strict-typecheck',
  'production-build',
  'server-render',
  'mount',
  'hydration',
  'shared-css-resolution',
  'interaction-evidence',
] as const);

export const S184_M06_SCHEMA_NAMES = Object.freeze([
  'subscription-list-dark',
  'subscription-detail-dark',
] as const);

export const S184_M06_FRAMEWORKS = Object.freeze(['react', 'vue'] as const);

type GateName = typeof S184_M06_GATE_NAMES[number];
type SchemaName = typeof S184_M06_SCHEMA_NAMES[number];
type Framework = typeof S184_M06_FRAMEWORKS[number];

type GateRow = {
  name: string;
  status: string;
  logs: string[];
};

export type S184M06LiveCell = {
  schema: string;
  framework: string;
  status: string;
  gates: GateRow[];
};

export type S184M06GateBite = {
  id: string;
  expectedGate: string;
  observedFailedGates: string[];
  status: string;
  logs: string[];
};

export type S184M06GateBiteTarget = {
  framework: string;
  provenCount: number;
  namedUnprovenCount: number;
  namedUnproven: Array<{ gate: string; reason: string }>;
  bites: S184M06GateBite[];
};

export type S184M06DifferentialControl = {
  status: string;
  mutation: {
    sourcePath: string;
    replacementCount: number;
    touchedPaths: string[];
    artifactJsonPathsTouched: string[];
    forwardPatch: string;
    reversePatch: string;
  };
  newHarness: {
    baselineSha256: string;
    mutatedSha256: string;
    restoredSha256: string;
  };
  sprint183Harness: {
    baselineSha256: string;
    mutatedSha256: string;
    restoredSha256: string;
    forbiddenReferenceCounts: Record<string, number>;
  };
  logs: string[];
  observations?: {
    baseline: { live: unknown; sprint183: unknown };
    mutated: { live: unknown; sprint183: unknown };
    restored: { live: unknown; sprint183: unknown };
  };
};

type CrossFrameworkCell = {
  cell: string;
  schema: SchemaName;
  framework: Framework;
  status: 'green' | 'red';
  errorCodes: string[];
  artifactNonempty: boolean;
};

type CrossFrameworkCase = {
  id: string;
  deletedFramework: Framework;
  componentId: 'StatusBadge';
  sourcePath: string;
  replacementCount: 1;
  removedImplementationSha256: string;
  sourceSha256Before: string;
  virtualSourceSha256After: string;
  observations: CrossFrameworkCell[];
  redCells: string[];
  greenCells: string[];
  status: 'passed';
};

export type S184M06CrossFrameworkReport = {
  schemaVersion: '1.0.0';
  mission: 's184-m06';
  kind: 'cross-framework-workflow-discrimination';
  status: 'passed';
  method: {
    componentId: 'StatusBadge';
    rationale: string;
    physicalSourceWrites: false;
    profile: 'build';
  };
  cases: CrossFrameworkCase[];
  restoration: {
    observations: CrossFrameworkCell[];
    greenCells: string[];
    sourceDigests: Record<Framework, {
      path: string;
      before: string;
      after: string;
      unchanged: boolean;
    }>;
    status: 'passed';
  };
  totals: {
    cases: 2;
    selectedRedCells: 4;
    counterpartGreenCells: 4;
    restoredGreenCells: 4;
  };
};

const implementationSource: Readonly<Record<Framework, string>> = {
  react: path.join(S184_M06_REPOSITORY_ROOT, 'packages/components-react/src/ported.tsx'),
  vue: path.join(S184_M06_REPOSITORY_ROOT, 'packages/components-vue/src/ported.ts'),
};

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function sha256(value: string | Buffer): string {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function canonicalJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function repositoryPath(absolutePath: string): string {
  return path.relative(S184_M06_REPOSITORY_ROOT, absolutePath).split(path.sep).join('/');
}

function cellId(schema: SchemaName, framework: Framework): string {
  return `${schema}/${framework}`;
}

function loadSchema(schema: SchemaName): UiSchema {
  const record = JSON.parse(readFileSync(path.join(
    S184_M06_REPOSITORY_ROOT,
    `artifacts/product-reality/sprint-183/m04/saved-schema-store/${schema}.json`,
  ), 'utf8')) as { schema: UiSchema };
  return record.schema;
}

function deleteStatusBadgeImplementation(
  source: string,
  framework: Framework,
): { source: string; replacementCount: number; removedSha256: string } {
  const startNeedle = 'export const StatusBadge =';
  const endNeedle = framework === 'react'
    ? 'export interface PriceBadgeProps'
    : 'function currencyLabel(';
  const start = source.indexOf(startNeedle);
  const end = source.indexOf(endNeedle, start + startNeedle.length);
  const hasSecondStart = source.indexOf(startNeedle, start + startNeedle.length) >= 0;
  invariant(start >= 0 && end > start && !hasSecondStart, `${framework}: StatusBadge implementation anchors are not unique.`);
  const removed = source.slice(start, end);
  invariant(removed.includes('data-oods-component'), `${framework}: selected block is not the StatusBadge implementation.`);
  invariant(removed.includes('StatusBadge'), `${framework}: selected block does not name StatusBadge.`);
  return {
    source: `${source.slice(0, start)}${source.slice(end)}`,
    replacementCount: 1,
    removedSha256: sha256(removed),
  };
}

async function observeWorkflowCells(
  targetCapabilityPreflight: ReturnType<typeof createTargetCapabilityPreflight>,
): Promise<CrossFrameworkCell[]> {
  const observations: CrossFrameworkCell[] = [];
  for (const schema of S184_M06_SCHEMA_NAMES) {
    for (const framework of S184_M06_FRAMEWORKS) {
      const generated = await generateCode(
        { framework, profile: 'build', schema: loadSchema(schema) },
        { targetCapabilityPreflight },
      );
      const artifactNonempty = Boolean(
        generated.status === 'ok'
        && generated.code.length > 0
        && generated.artifact?.files.some(({ contents }) => contents.length > 0),
      );
      observations.push({
        cell: cellId(schema, framework),
        schema,
        framework,
        status: generated.status === 'ok' && artifactNonempty ? 'green' : 'red',
        errorCodes: (generated.errors ?? []).map(({ code }) => code),
        artifactNonempty,
      });
    }
  }
  return observations;
}

/**
 * Delete the complete ported implementation shared by both exit-gate schemas through
 * the readiness file-reader seam. The mutation is virtual: both schemas for the
 * selected framework must red while both counterpart-framework cells stay green.
 */
export async function createS184M06CrossFrameworkDiscriminationReport(): Promise<S184M06CrossFrameworkReport> {
  const sourceBefore: Record<Framework, string> = {
    react: readFileSync(implementationSource.react, 'utf8'),
    vue: readFileSync(implementationSource.vue, 'utf8'),
  };
  const cases: CrossFrameworkCase[] = [];

  for (const deletedFramework of S184_M06_FRAMEWORKS) {
    const transformed = deleteStatusBadgeImplementation(sourceBefore[deletedFramework], deletedFramework);
    invariant(
      transformed.replacementCount === 1,
      `${deletedFramework}: expected exactly one complete StatusBadge implementation; found ${transformed.replacementCount}.`,
    );
    const preflight = createTargetCapabilityPreflight({
      repositoryRoot: S184_M06_REPOSITORY_ROOT,
      readFile: (absolutePath) => (
        absolutePath === implementationSource[deletedFramework]
          ? transformed.source
          : readFileSync(absolutePath, 'utf8')
      ),
    });
    const observations = await observeWorkflowCells(preflight);
    const redCells = observations.filter(({ status }) => status === 'red');
    const greenCells = observations.filter(({ status }) => status === 'green');
    const expectedRed = S184_M06_SCHEMA_NAMES.map((schema) => cellId(schema, deletedFramework));
    const counterpartFramework = deletedFramework === 'react' ? 'vue' : 'react';
    const expectedGreen = S184_M06_SCHEMA_NAMES.map((schema) => cellId(schema, counterpartFramework));

    invariant(
      JSON.stringify(redCells.map(({ cell }) => cell)) === JSON.stringify(expectedRed),
      `${deletedFramework}: red cells were ${redCells.map(({ cell }) => cell).join(', ')}.`,
    );
    invariant(
      JSON.stringify(greenCells.map(({ cell }) => cell)) === JSON.stringify(expectedGreen),
      `${deletedFramework}: green cells were ${greenCells.map(({ cell }) => cell).join(', ')}.`,
    );
    for (const cell of redCells) {
      invariant(
        cell.errorCodes.length === 1 && cell.errorCodes[0] === 'OODS-N015',
        `${cell.cell}: expected exact OODS-N015, received ${cell.errorCodes.join(', ')}.`,
      );
      invariant(!cell.artifactNonempty, `${cell.cell}: red mutation emitted an artifact.`);
    }
    for (const cell of greenCells) {
      invariant(cell.errorCodes.length === 0, `${cell.cell}: counterpart leaked errors.`);
      invariant(cell.artifactNonempty, `${cell.cell}: counterpart artifact is empty.`);
    }

    cases.push({
      id: `${deletedFramework}-StatusBadge-implementation-deleted`,
      deletedFramework,
      componentId: 'StatusBadge',
      sourcePath: repositoryPath(implementationSource[deletedFramework]),
      replacementCount: 1,
      removedImplementationSha256: transformed.removedSha256,
      sourceSha256Before: sha256(sourceBefore[deletedFramework]),
      virtualSourceSha256After: sha256(transformed.source),
      observations,
      redCells: redCells.map(({ cell }) => cell),
      greenCells: greenCells.map(({ cell }) => cell),
      status: 'passed',
    });
  }

  const restoration = await observeWorkflowCells(createTargetCapabilityPreflight({
    repositoryRoot: S184_M06_REPOSITORY_ROOT,
  }));
  invariant(
    restoration.every(({ status, artifactNonempty }) => status === 'green' && artifactNonempty),
    'Cross-framework control did not restore all four workflow cells.',
  );
  const sourceAfter: Record<Framework, string> = {
    react: readFileSync(implementationSource.react, 'utf8'),
    vue: readFileSync(implementationSource.vue, 'utf8'),
  };
  const sourceDigests = Object.fromEntries(S184_M06_FRAMEWORKS.map((framework) => {
    const before = sha256(sourceBefore[framework]);
    const after = sha256(sourceAfter[framework]);
    invariant(before === after, `${framework}: ported source changed during virtual discrimination.`);
    return [framework, {
      path: repositoryPath(implementationSource[framework]),
      before,
      after,
      unchanged: true,
    }];
  })) as S184M06CrossFrameworkReport['restoration']['sourceDigests'];

  return {
    schemaVersion: '1.0.0',
    mission: 's184-m06',
    kind: 'cross-framework-workflow-discrimination',
    status: 'passed',
    method: {
      componentId: 'StatusBadge',
      rationale: 'StatusBadge is the ported component present in both frozen Subscription schemas; the injected source removes its complete declaration and implementation body.',
      physicalSourceWrites: false,
      profile: 'build',
    },
    cases,
    restoration: {
      observations: restoration,
      greenCells: restoration.map(({ cell }) => cell),
      sourceDigests,
      status: 'passed',
    },
    totals: {
      cases: 2,
      selectedRedCells: 4,
      counterpartGreenCells: 4,
      restoredGreenCells: 4,
    },
  };
}

type CommandObservation = {
  command: string;
  exitCode: number;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
};

function command(
  executable: string,
  args: string[],
  cwd: string,
  timeout = 600_000,
): CommandObservation {
  const result = spawnSync(executable, args, {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      CI: '1',
      FORCE_COLOR: '0',
      NO_COLOR: '1',
    },
    maxBuffer: 64 * 1024 * 1024,
    timeout,
  });
  return {
    command: [executable, ...args].join(' '),
    exitCode: result.status ?? 127,
    signal: result.signal,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function requireGreen(result: CommandObservation, label: string): void {
  invariant(
    result.exitCode === 0,
    `${label} failed (${result.exitCode}): ${result.stderr || result.stdout || 'no output'}`,
  );
}

function sanitizedCommandLog(
  result: CommandObservation,
  replacements: Array<[string, string]>,
): string {
  const sanitize = (value: string): string => replacements.reduce(
    (current, [literal, replacement]) => current.split(literal).join(replacement),
    value,
  );
  return `${[
    `$ ${sanitize(result.command)}`,
    `exitCode=${result.exitCode}`,
    `signal=${result.signal ?? ''}`,
    '',
    '[stdout]',
    sanitize(result.stdout),
    '[stderr]',
    sanitize(result.stderr),
  ].join('\n').trimEnd()}\n`;
}

export type S184M06GenerationSnapshot = {
  kind: 's184-m06-live-code-generate-snapshot';
  acquisition: 'live-code.generate-handler';
  cells: Array<{
    schema: SchemaName;
    framework: Framework;
    status: string;
    codeSha256: string;
    codeBytes: number;
    artifactContentHash: string | null;
    artifactFileSha256: string | null;
  }>;
  snapshotSha256: string;
};

/** Small child-process surface used to prove that M06 reads the current emitter. */
export async function createS184M06GenerationSnapshot(): Promise<S184M06GenerationSnapshot> {
  const cells: S184M06GenerationSnapshot['cells'] = [];
  for (const schema of S184_M06_SCHEMA_NAMES) {
    for (const framework of S184_M06_FRAMEWORKS) {
      const result = await generateCode({ framework, profile: 'build', schema: loadSchema(schema) });
      invariant(result.status === 'ok', `${schema}/${framework}: live generation failed.`);
      const file = result.artifact?.files[0];
      invariant(result.code.length > 0 && file?.contents, `${schema}/${framework}: live artifact is empty.`);
      cells.push({
        schema,
        framework,
        status: result.status,
        codeSha256: sha256(result.code),
        codeBytes: Buffer.byteLength(result.code),
        artifactContentHash: result.artifact?.contentHash ?? null,
        artifactFileSha256: file.contentHash ?? null,
      });
    }
  }
  const payload = {
    kind: 's184-m06-live-code-generate-snapshot' as const,
    acquisition: 'live-code.generate-handler' as const,
    cells,
  };
  return { ...payload, snapshotSha256: sha256(canonicalJson(payload)) };
}

export type S183HarnessSnapshot = {
  kind: 's183-m05-committed-artifact-harness-snapshot';
  acquisition: 'loadCommittedRunnableArtifacts';
  artifacts: Array<{
    framework: Framework;
    contentHash: string;
    sourceContentHash: string;
  }>;
  forbiddenReferenceCounts: Record<string, number>;
  snapshotSha256: string;
};

/** Execute the Sprint-183 harness's committed-artifact acquisition boundary. */
export async function createS183HarnessSnapshot(): Promise<S183HarnessSnapshot> {
  const legacy = await import('./s183-m05-saved-schema-consumers.mjs') as unknown as {
    loadCommittedRunnableArtifacts: () => Promise<{
      artifacts: Record<Framework, { contentHash: string; files: Array<{ contentHash: string }> }>;
    }>;
  };
  const loaded = await legacy.loadCommittedRunnableArtifacts();
  const legacySource = readFileSync(path.join(
    S184_M06_REPOSITORY_ROOT,
    'scripts/product-reality/s183-m05-saved-schema-consumers.mjs',
  ), 'utf8');
  const forbiddenReferenceCounts = Object.fromEntries([
    'code.generate',
    'codeGenerate',
    'emitter',
    'generateCode',
  ].map((needle) => [needle, legacySource.split(needle).length - 1]));
  const payload = {
    kind: 's183-m05-committed-artifact-harness-snapshot' as const,
    acquisition: 'loadCommittedRunnableArtifacts' as const,
    artifacts: S184_M06_FRAMEWORKS.map((framework) => ({
      framework,
      contentHash: loaded.artifacts[framework].contentHash,
      sourceContentHash: loaded.artifacts[framework].files[0]!.contentHash,
    })),
    forbiddenReferenceCounts,
  };
  return { ...payload, snapshotSha256: sha256(canonicalJson(payload)) };
}

function parseSnapshot<T>(result: CommandObservation, label: string): T {
  requireGreen(result, label);
  try {
    return JSON.parse(result.stdout) as T;
  } catch {
    throw new Error(`${label} did not return one JSON snapshot: ${result.stdout}`);
  }
}

export type S184M06DifferentialOptions = {
  implementationCommit: string;
  outputRoot: string;
};

/**
 * Replay one literal React-emitter mutation in a detached temporary worktree.
 * The current live handler must move; the Sprint-183 committed-artifact loader
 * must remain byte-identical. The reverse patch must restore both observations.
 */
export async function createS184M06DifferentialControl(
  options: S184M06DifferentialOptions,
): Promise<S184M06DifferentialControl> {
  invariant(/^[a-f0-9]{40}$/.test(options.implementationCommit), 'A full implementation commit is required.');
  const outputDirectory = path.resolve(options.outputRoot);
  const differentialRoot = path.join(outputDirectory, 'differential');
  invariant(!existsSync(differentialRoot), `Refusing to overwrite ${differentialRoot}.`);
  mkdirSync(path.join(differentialRoot, 'logs'), { recursive: true });

  const disposableRoot = mkdtempSync(path.join(os.tmpdir(), 'oods-s184-m06-differential-'));
  const worktreeRoot = path.join(disposableRoot, 'repository');
  const replacements: Array<[string, string]> = [
    [worktreeRoot, '<differential-worktree>'],
    [S184_M06_REPOSITORY_ROOT, '<repository-root>'],
  ];
  const logs: string[] = [];
  const logResult = (name: string, result: CommandObservation): void => {
    const absolutePath = path.join(differentialRoot, 'logs', `${name}.log`);
    writeFileSync(absolutePath, sanitizedCommandLog(result, replacements));
    logs.push(repositoryPath(absolutePath));
  };
  let addedWorktree = false;
  try {
    const add = command('git', ['worktree', 'add', '--detach', worktreeRoot, options.implementationCommit], S184_M06_REPOSITORY_ROOT);
    logResult('worktree-add', add);
    requireGreen(add, 'differential worktree add');
    addedWorktree = true;
    for (const relativePath of [
      'node_modules',
      'packages/mcp-server/node_modules',
      'packages/components-react/node_modules',
      'packages/components-vue/node_modules',
    ]) {
      const source = path.join(S184_M06_REPOSITORY_ROOT, relativePath);
      const destination = path.join(worktreeRoot, relativePath);
      invariant(existsSync(source), `Differential runtime dependency tree is absent: ${relativePath}.`);
      symlinkSync(source, destination, 'junction');
    }

    const readinessBoundary = [];
    for (const [framework, packageName] of [
      ['react', '@oods/components-react'],
      ['vue', '@oods/components-vue'],
    ] as const) {
      const build = command('pnpm', ['--filter', packageName, 'run', 'build'], worktreeRoot);
      logResult(`readiness-${framework}-build`, build);
      requireGreen(build, `${framework} readiness declaration build`);
      const declarations = ['index.d.ts', 'ported.d.ts'].map((name) => {
        const relativePath = `packages/components-${framework}/dist/${name}`;
        const absolutePath = path.join(worktreeRoot, relativePath);
        invariant(existsSync(absolutePath) && statSync(absolutePath).isFile(), `${relativePath} was not built.`);
        const contents = readFileSync(absolutePath);
        return { path: relativePath, bytes: contents.byteLength, sha256: sha256(contents) };
      });
      readinessBoundary.push({ framework, packageName, declarations });
    }
    const readinessBoundaryLog = path.join(differentialRoot, 'logs', 'readiness-boundary.log');
    writeFileSync(readinessBoundaryLog, canonicalJson({
      implementationCommit: options.implementationCommit,
      buildLocation: '<differential-worktree>',
      rootDistMutated: false,
      readinessBoundary,
    }));
    logs.push(repositoryPath(readinessBoundaryLog));

    const helper = path.join(worktreeRoot, 'node_modules/.bin/tsx');
    const helperScript = 'scripts/product-reality/s184-m06-evidence-controls.ts';
    const runSnapshot = (mode: '--generation-snapshot' | '--s183-harness-snapshot', label: string) => {
      const result = command(helper, [helperScript, mode], worktreeRoot);
      logResult(label, result);
      return result;
    };
    const baselineLive = parseSnapshot<S184M06GenerationSnapshot>(
      runSnapshot('--generation-snapshot', 'baseline-live'),
      'baseline live snapshot',
    );
    const baselineLegacy = parseSnapshot<S183HarnessSnapshot>(
      runSnapshot('--s183-harness-snapshot', 'baseline-s183'),
      'baseline Sprint-183 snapshot',
    );

    const emitterRelativePath = 'packages/mcp-server/src/codegen/react-emitter.ts';
    const emitterPath = path.join(worktreeRoot, emitterRelativePath);
    const sourceBefore = readFileSync(emitterPath, 'utf8');
    const needle = 'aria-label="Screen actions"';
    const replacement = 'aria-label="Generated screen actions"';
    const replacementCount = sourceBefore.split(needle).length - 1;
    invariant(replacementCount === 1, `Differential source anchor count is ${replacementCount}, expected 1.`);
    writeFileSync(emitterPath, sourceBefore.replace(needle, replacement));

    const touched = command('git', ['diff', '--name-only'], worktreeRoot);
    logResult('forward-touched-paths', touched);
    requireGreen(touched, 'forward touched paths');
    const touchedPaths = touched.stdout.trim().split(/\r?\n/).filter(Boolean);
    exactSet(touchedPaths, [emitterRelativePath], 'differential forward paths');
    const forwardPatchResult = command('git', ['diff', '--binary', '--', emitterRelativePath], worktreeRoot);
    logResult('forward-patch-capture', forwardPatchResult);
    requireGreen(forwardPatchResult, 'forward patch capture');
    const reversePatchResult = command('git', ['diff', '-R', '--binary', '--', emitterRelativePath], worktreeRoot);
    logResult('reverse-patch-capture', reversePatchResult);
    requireGreen(reversePatchResult, 'reverse patch capture');
    invariant(forwardPatchResult.stdout.length > 0 && reversePatchResult.stdout.length > 0, 'Differential patches are empty.');
    const forwardPatchAbsolute = path.join(differentialRoot, 'emitter-forward.patch');
    const reversePatchAbsolute = path.join(differentialRoot, 'emitter-reverse.patch');
    writeFileSync(forwardPatchAbsolute, forwardPatchResult.stdout);
    writeFileSync(reversePatchAbsolute, reversePatchResult.stdout);

    const mutatedLive = parseSnapshot<S184M06GenerationSnapshot>(
      runSnapshot('--generation-snapshot', 'mutated-live'),
      'mutated live snapshot',
    );
    const mutatedLegacy = parseSnapshot<S183HarnessSnapshot>(
      runSnapshot('--s183-harness-snapshot', 'mutated-s183'),
      'mutated Sprint-183 snapshot',
    );
    const reverseApply = command('git', ['apply', '--whitespace=nowarn', reversePatchAbsolute], worktreeRoot);
    logResult('reverse-apply', reverseApply);
    requireGreen(reverseApply, 'reverse emitter mutation');
    invariant(readFileSync(emitterPath, 'utf8') === sourceBefore, 'Reverse patch did not restore emitter bytes.');

    const restoredLive = parseSnapshot<S184M06GenerationSnapshot>(
      runSnapshot('--generation-snapshot', 'restored-live'),
      'restored live snapshot',
    );
    const restoredLegacy = parseSnapshot<S183HarnessSnapshot>(
      runSnapshot('--s183-harness-snapshot', 'restored-s183'),
      'restored Sprint-183 snapshot',
    );
    const restoredDiff = command('git', ['diff', '--name-only'], worktreeRoot);
    logResult('restored-touched-paths', restoredDiff);
    requireGreen(restoredDiff, 'restored touched paths');
    invariant(restoredDiff.stdout.trim() === '', `Reverse patch left changes: ${restoredDiff.stdout}`);

    const snapshots = {
      baseline: { live: baselineLive, sprint183: baselineLegacy },
      mutated: { live: mutatedLive, sprint183: mutatedLegacy },
      restored: { live: restoredLive, sprint183: restoredLegacy },
    };
    for (const [name, value] of Object.entries(snapshots)) {
      writeFileSync(path.join(differentialRoot, `${name}.json`), canonicalJson(value));
    }
    const result: S184M06DifferentialControl = {
      status: 'passed',
      mutation: {
        sourcePath: emitterRelativePath,
        replacementCount,
        touchedPaths,
        artifactJsonPathsTouched: touchedPaths.filter((entry) => entry.endsWith('.json')),
        forwardPatch: repositoryPath(forwardPatchAbsolute),
        reversePatch: repositoryPath(reversePatchAbsolute),
      },
      newHarness: {
        baselineSha256: baselineLive.snapshotSha256,
        mutatedSha256: mutatedLive.snapshotSha256,
        restoredSha256: restoredLive.snapshotSha256,
      },
      sprint183Harness: {
        baselineSha256: baselineLegacy.snapshotSha256,
        mutatedSha256: mutatedLegacy.snapshotSha256,
        restoredSha256: restoredLegacy.snapshotSha256,
        forbiddenReferenceCounts: baselineLegacy.forbiddenReferenceCounts,
      },
      logs,
      observations: snapshots,
    };
    assertS184M06DifferentialControl(result);
    writeFileSync(path.join(differentialRoot, 'report.json'), canonicalJson(result));
    return result;
  } finally {
    if (addedWorktree) {
      const remove = command('git', ['worktree', 'remove', '--force', worktreeRoot], S184_M06_REPOSITORY_ROOT);
      if (remove.exitCode !== 0) {
        process.stderr.write(`Warning: ${remove.stderr || remove.stdout}`);
      }
    }
    rmSync(disposableRoot, { recursive: true, force: true });
  }
}

function exactSet(actual: readonly string[], expected: readonly string[], label: string): void {
  invariant(new Set(actual).size === actual.length, `${label}: duplicate values.`);
  const sortedActual = [...actual].sort();
  const sortedExpected = [...expected].sort();
  invariant(
    JSON.stringify(sortedActual) === JSON.stringify(sortedExpected),
    `${label}: expected ${sortedExpected.join(', ')}, received ${sortedActual.join(', ')}.`,
  );
}

function assertLogReferences(logs: unknown, label: string): asserts logs is string[] {
  invariant(Array.isArray(logs) && logs.length > 0, `${label}: at least one raw log is required.`);
  for (const log of logs) {
    invariant(
      typeof log === 'string' && log.endsWith('.log'),
      `${label}: invalid raw log reference ${String(log)}.`,
    );
  }
}

/** Verify the four live schema/target cells and their exact eight-gate rows. */
export function assertS184M06LiveGateMatrix(report: { cells?: S184M06LiveCell[] }): void {
  invariant(Array.isArray(report.cells), 'Live report cells are required.');
  exactSet(
    report.cells.map(({ schema, framework }) => `${schema}/${framework}`),
    S184_M06_SCHEMA_NAMES.flatMap((schema) => (
      S184_M06_FRAMEWORKS.map((framework) => `${schema}/${framework}`)
    )),
    'live workflow cells',
  );
  for (const cell of report.cells) {
    invariant(cell.status === 'passed', `${cell.schema}/${cell.framework}: cell is not passed.`);
    exactSet(cell.gates.map(({ name }) => name), S184_M06_GATE_NAMES, `${cell.schema}/${cell.framework} gates`);
    for (const gate of cell.gates) {
      invariant(gate.status === 'passed', `${cell.schema}/${cell.framework}/${gate.name}: gate is not passed.`);
      assertLogReferences(gate.logs, `${cell.schema}/${cell.framework}/${gate.name}`);
    }
  }
}

/** Verify one unique, exact red control per gate on each framework target. */
export function assertS184M06GateBiteAccounting(
  report: { targets?: S184M06GateBiteTarget[] },
  options: { requireAllEightProven?: boolean } = {},
): void {
  const requireAllEightProven = options.requireAllEightProven ?? true;
  invariant(Array.isArray(report.targets), 'Gate-bite target rows are required.');
  exactSet(report.targets.map(({ framework }) => framework), S184_M06_FRAMEWORKS, 'gate-bite targets');
  for (const target of report.targets) {
    invariant(Number.isInteger(target.provenCount), `${target.framework}: provenCount is required.`);
    invariant(Number.isInteger(target.namedUnprovenCount), `${target.framework}: namedUnprovenCount is required.`);
    invariant(
      target.provenCount + target.namedUnprovenCount === S184_M06_GATE_NAMES.length,
      `${target.framework}: provenCount + namedUnprovenCount must equal 8.`,
    );
    invariant(target.provenCount === target.bites.length, `${target.framework}: provenCount does not match bites.`);
    invariant(
      target.namedUnprovenCount === target.namedUnproven.length,
      `${target.framework}: namedUnprovenCount does not match named reasons.`,
    );
    const proven = target.bites.map(({ expectedGate }) => expectedGate);
    const unproven = target.namedUnproven.map(({ gate }) => gate);
    exactSet([...proven, ...unproven], S184_M06_GATE_NAMES, `${target.framework} gate accounting`);
    invariant(new Set(proven).size === proven.length, `${target.framework}: two bites target the same gate.`);
    for (const bite of target.bites) {
      invariant(bite.status === 'detected', `${target.framework}/${bite.id}: bite was not detected.`);
      invariant(
        bite.observedFailedGates.length === 1 && bite.observedFailedGates[0] === bite.expectedGate,
        `${target.framework}/${bite.id}: bite did not red exactly ${bite.expectedGate}.`,
      );
      assertLogReferences(bite.logs, `${target.framework}/${bite.id}`);
    }
    for (const row of target.namedUnproven) {
      invariant(row.reason.trim().length > 0, `${target.framework}/${row.gate}: unproven reason is empty.`);
    }
    if (requireAllEightProven) {
      invariant(target.provenCount === 8, `${target.framework}: all eight gate bites are required.`);
      invariant(target.namedUnprovenCount === 0, `${target.framework}: no gate may remain unproven.`);
      invariant(proven.includes('hydration'), `${target.framework}: hydration was not bitten.`);
    }
  }
}

/** Verify the live-only effect and byte-identical reverse direction of an emitter mutation. */
export function assertS184M06DifferentialControl(report: S184M06DifferentialControl): void {
  invariant(report.status === 'passed', 'Differential control is not passed.');
  invariant(
    /^packages\/mcp-server\/src\/codegen\/(?:react|vue)-emitter\.ts$/.test(report.mutation.sourcePath),
    `Differential mutation does not target an emitter source: ${report.mutation.sourcePath}.`,
  );
  invariant(report.mutation.replacementCount === 1, 'Differential mutation must replace exactly one source occurrence.');
  exactSet(report.mutation.touchedPaths, [report.mutation.sourcePath], 'differential touched paths');
  invariant(report.mutation.artifactJsonPathsTouched.length === 0, 'Differential mutation touched artifact JSON.');
  invariant(report.mutation.forwardPatch.endsWith('.patch'), 'Forward mutation patch is not archived.');
  invariant(report.mutation.reversePatch.endsWith('.patch'), 'Reverse mutation patch is not archived.');
  invariant(
    report.newHarness.baselineSha256 !== report.newHarness.mutatedSha256,
    'Emitter mutation did not change the live harness output.',
  );
  invariant(
    report.newHarness.baselineSha256 === report.newHarness.restoredSha256,
    'Reverse emitter mutation did not restore the live harness output.',
  );
  invariant(
    report.sprint183Harness.baselineSha256 === report.sprint183Harness.mutatedSha256,
    'Emitter mutation changed the Sprint-183 committed-artifact harness output.',
  );
  invariant(
    report.sprint183Harness.baselineSha256 === report.sprint183Harness.restoredSha256,
    'Reverse emitter mutation changed the Sprint-183 harness output.',
  );
  invariant(
    Object.values(report.sprint183Harness.forbiddenReferenceCounts).every((count) => count === 0),
    'Sprint-183 harness unexpectedly references generation or emitter symbols.',
  );
  assertLogReferences(report.logs, 'differential control');
}

function filesRecursively(root: string): string[] {
  if (!existsSync(root)) return [];
  const files: string[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const absolutePath = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...filesRecursively(absolutePath));
    if (entry.isFile()) files.push(absolutePath);
  }
  return files;
}

function collectLogStrings(value: unknown, result: Set<string>): void {
  if (typeof value === 'string') {
    const isPathOnlyReference = value.endsWith('.log')
      && !/[\s<>]/u.test(value)
      && !path.isAbsolute(value)
      && !value.split('/').includes('..');
    if (isPathOnlyReference) result.add(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const entry of value) collectLogStrings(entry, result);
    return;
  }
  if (value && typeof value === 'object') {
    for (const entry of Object.values(value)) collectLogStrings(entry, result);
  }
}

export type S184M06LogRetentionAudit = {
  jsonFiles: string[];
  referencedLogs: string[];
  missing: string[];
  untracked: string[];
  status: 'passed' | 'failed';
};

/** Audit every .log reference in every retained M06 JSON file against git ls-files. */
export function auditS184M06ReferencedLogs(
  repositoryRoot = S184_M06_REPOSITORY_ROOT,
  evidenceRoot = path.join(repositoryRoot, 'artifacts/product-reality/sprint-184/m06'),
): S184M06LogRetentionAudit {
  const relativeToAuditRoot = (absolutePath: string): string => (
    path.relative(repositoryRoot, absolutePath).split(path.sep).join('/')
  );
  const jsonFiles = filesRecursively(evidenceRoot)
    .filter((file) => file.endsWith('.json'))
    .sort();
  const referenced = new Set<string>();
  const liveProofRoot = path.join(evidenceRoot, 'live-consumers');
  for (const jsonFile of jsonFiles) {
    const raw = new Set<string>();
    collectLogStrings(JSON.parse(readFileSync(jsonFile, 'utf8')), raw);
    for (const log of raw) {
      const usesLiveProofConvention = jsonFile === liveProofRoot
        || jsonFile.startsWith(`${liveProofRoot}${path.sep}`);
      const absolute = log.startsWith('artifacts/')
        ? path.join(repositoryRoot, log)
        : path.resolve(usesLiveProofConvention ? liveProofRoot : evidenceRoot, log);
      const relative = relativeToAuditRoot(absolute);
      invariant(
        relative.startsWith('artifacts/product-reality/sprint-184/m06/'),
        `${relativeToAuditRoot(jsonFile)} references an out-of-scope log: ${log}.`,
      );
      referenced.add(relative);
    }
  }
  const referencedLogs = [...referenced].sort();
  const tracked = spawnSync('git', ['ls-files'], { cwd: repositoryRoot, encoding: 'utf8' });
  invariant(tracked.status === 0, `git ls-files failed: ${tracked.stderr}`);
  const trackedPaths = new Set(tracked.stdout.split(/\r?\n/).filter(Boolean));
  const missing = referencedLogs.filter((log) => !existsSync(path.join(repositoryRoot, log)));
  const untracked = referencedLogs.filter((log) => !trackedPaths.has(log));
  for (const log of referencedLogs.filter((candidate) => !missing.includes(candidate))) {
    invariant(statSync(path.join(repositoryRoot, log)).isFile(), `${log}: referenced log is not a file.`);
  }
  return {
    jsonFiles: jsonFiles.map(relativeToAuditRoot),
    referencedLogs,
    missing,
    untracked,
    status: missing.length === 0 && untracked.length === 0 ? 'passed' : 'failed',
  };
}

export type { Framework, GateName, SchemaName };

const invokedPath = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : null;

if (invokedPath === import.meta.url) {
  if (process.argv.includes('--generation-snapshot')) {
    process.stdout.write(canonicalJson(await createS184M06GenerationSnapshot()));
  } else if (process.argv.includes('--s183-harness-snapshot')) {
    process.stdout.write(canonicalJson(await createS183HarnessSnapshot()));
  }
}
