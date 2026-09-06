import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

import { handle as codeGenerate } from '../../packages/mcp-server/src/tools/code.generate.js';
import type { UiSchema } from '../../packages/mcp-server/src/schemas/generated.js';
import { createS183HarnessSnapshot } from './s184-m06-evidence-controls.js';
import {
  FRAMEWORKS, GATE_NAMES, runLiveConsumerCell, runLiveGenerationOnly,
  type LiveGenerationCell, type PackedPackageRecord, type S184M06Framework,
} from './s184-m06-live-consumers.js';
import { deleteRootExport } from './s185-m03-export-mutations.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const defaultRoot = path.join(repositoryRoot, 'artifacts/product-reality/sprint-185/m04/controls');
const scriptPath = 'scripts/product-reality/s185-m04-controls.ts';
export const S185_M04_CONTROL_SCHEMAS = [
  'cmos-messages-redesign', 'plan-form-dark', 'pt-shop-parts-entry-router-v1',
  'user-card-showcase', 'cmos-dashboard-redesign', 'the-academy-landing-v1',
] as const;
const subjectSchema = 'plan-form-dark';
const hash = (value: string | Buffer): string => createHash('sha256').update(value).digest('hex');
const relative = (value: string): string => path.relative(repositoryRoot, value).split(path.sep).join('/');
const json = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;
const writeJson = (file: string, value: unknown): void => fs.writeFileSync(file, json(value));

function absentDirectory(directory: string): void {
  assert.ok(!fs.existsSync(directory), `Refusing to overwrite evidence: ${directory}`);
  fs.mkdirSync(directory, { recursive: true });
}

function command(executable: string, args: string[], logFile: string, cwd = repositoryRoot, expectedExit = 0) {
  const started = new Date().toISOString();
  const result = spawnSync(executable, args, { cwd, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  fs.writeFileSync(logFile, [
    `started=${started}`, `cwd=${cwd}`, `command=${JSON.stringify([executable, ...args])}`,
    '[stdout]', result.stdout ?? '', '[stderr]', result.stderr ?? '',
    `exit=${result.status} signal=${result.signal ?? 'none'}`, result.error ? String(result.error) : '', '',
  ].join('\n'));
  assert.equal(result.status, expectedExit, `Unexpected command exit; see ${relative(logFile)}`);
  return { exitCode: result.status, log: relative(logFile) };
}

/** A reproducible patch is retained and applied, not merely described by hashes. */
function patchFor(before: string, after: string, target: string, directory: string, label: string): string {
  const beforeFile = path.join(directory, `${label}.before.txt`);
  const afterFile = path.join(directory, `${label}.after.txt`);
  fs.writeFileSync(beforeFile, before); fs.writeFileSync(afterFile, after);
  const result = spawnSync('git', ['diff', '--no-index', '--', beforeFile, afterFile], { encoding: 'utf8' });
  assert.equal(result.status, 1, `${label}: mutation must change source`);
  const patch = result.stdout
    .replace(/^diff --git .+$/m, `diff --git a/${target} b/${target}`)
    .replace(/^--- .+$/m, `--- a/${target}`)
    .replace(/^\+\+\+ .+$/m, `+++ b/${target}`);
  const patchPath = path.join(directory, `${label}.patch`);
  fs.writeFileSync(patchPath, patch);
  return patchPath;
}

function directoryHash(directory: string): string {
  const entries: Array<[string, string]> = [];
  function visit(current: string): void {
    for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = path.join(current, entry.name);
      if (entry.isDirectory()) visit(file);
      else entries.push([path.relative(directory, file), hash(fs.readFileSync(file))]);
    }
  }
  visit(directory);
  return hash(json(entries));
}

function schemaRecord(name: string): { schema: UiSchema; file: string; sha256: string; headerNodes: string[] } {
  const file = `artifacts/product-reality/sprint-183/m04/saved-schema-store/${name}.json`;
  const bytes = fs.readFileSync(path.join(repositoryRoot, file));
  const { schema } = JSON.parse(bytes.toString()) as { schema: UiSchema };
  const headerNodes: string[] = [];
  function visit(value: unknown): void {
    if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      if (record.component === 'DetailHeader') headerNodes.push(String(record.id));
      Object.values(record).forEach(visit);
    }
  }
  visit(schema);
  return { schema, file, sha256: hash(bytes), headerNodes };
}

export type HeaderObservation = {
  cell: string; schema: string; framework: S184M06Framework; headerNodes: string[];
  status: 'green' | 'red'; errorCodes: string[]; errorComponents: Array<string | undefined>;
  artifactNonempty: boolean; sourceBytes: number; sourceSha256: string; schemaSha256: string;
  validationChecks: string[];
};

export async function observeS185HeaderCells(): Promise<HeaderObservation[]> {
  const cells: HeaderObservation[] = [];
  for (const schema of S185_M04_CONTROL_SCHEMAS) {
    const input = schemaRecord(schema);
    for (const framework of FRAMEWORKS) {
      // No capability seam: the actual implementation, root export and rebuilt
      // declaration files determine the real build-profile readiness gate.
      const result = await codeGenerate({ schema: input.schema, framework, profile: 'build' });
      const artifactNonempty = Boolean(result.artifact?.files.some(file => file.contents.length > 0));
      cells.push({
        cell: `${schema}/${framework}`, schema, framework, headerNodes: input.headerNodes,
        status: result.status === 'ok' ? 'green' : 'red',
        errorCodes: (result.errors ?? []).map(error => error.code),
        errorComponents: (result.errors ?? []).map(error => error.component),
        artifactNonempty, sourceBytes: Buffer.byteLength(result.code), sourceSha256: hash(result.code),
        schemaSha256: input.sha256, validationChecks: result.validationReceipt.checks,
      });
    }
  }
  return cells;
}

export function assertS185HeaderCells(cells: HeaderObservation[], deletedFramework: S184M06Framework | null): void {
  const expected = S185_M04_CONTROL_SCHEMAS.flatMap(schema => FRAMEWORKS.map(framework => `${schema}/${framework}`));
  assert.deepEqual(cells.map(cell => cell.cell).sort(), expected.sort(), 'Must observe exactly twelve unique saved-schema cells');
  const usages = S185_M04_CONTROL_SCHEMAS.map(name => ({ name, ...schemaRecord(name) }));
  assert.equal(usages.filter(input => input.headerNodes.length > 0).length, 5, 'Measured DetailHeader schema count changed');
  assert.deepEqual(usages.find(input => input.name === 'user-card-showcase')!.headerNodes, []);
  for (const cell of cells) {
    const input = usages.find(input => input.name === cell.schema)!;
    assert.deepEqual(cell.headerNodes, input.headerNodes, `${cell.cell}: measured header provenance changed`);
    assert.equal(cell.schemaSha256, input.sha256, `${cell.cell}: immutable input changed`);
    const mustRed = cell.framework === deletedFramework && input.headerNodes.length > 0;
    assert.equal(cell.status, mustRed ? 'red' : 'green', `${cell.cell}: wrong side of framework discrimination`);
    if (mustRed) {
      assert.ok(cell.validationChecks.includes('target-readiness'), `${cell.cell}: readiness gate was not executed`);
      assert.deepEqual([...new Set(cell.errorCodes)], ['OODS-N015'], `${cell.cell}: wrong failed gate`);
      assert.ok(cell.errorComponents.length > 0 && cell.errorComponents.every(component => component === 'DetailHeader'));
      assert.equal(cell.artifactNonempty, false); assert.equal(cell.sourceBytes, 0);
    } else {
      assert.deepEqual(cell.errorCodes, []); assert.equal(cell.artifactNonempty, true); assert.ok(cell.sourceBytes > 0);
    }
  }
}

/** Remove the complete component body; keep CardHeader and shared helpers intact. */
export function deleteDetailHeaderImplementation(source: string, framework: S184M06Framework) {
  const parsed = ts.createSourceFile(framework === 'react' ? 'breadth.tsx' : 'breadth.ts', source,
    ts.ScriptTarget.Latest, true, framework === 'react' ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const declarations = parsed.statements.filter(statement => ts.isVariableStatement(statement)
    && statement.declarationList.declarations.some(declaration => ts.isIdentifier(declaration.name) && declaration.name.text === 'DetailHeader'));
  assert.equal(declarations.length, 1, `${framework}: exactly one complete DetailHeader declaration required`);
  const ranges = [{ start: declarations[0]!.getStart(parsed), end: declarations[0]!.end }];
  if (framework === 'react') {
    const displayNames = parsed.statements.filter(statement => ts.isExpressionStatement(statement)
      && ts.isBinaryExpression(statement.expression)
      && ts.isPropertyAccessExpression(statement.expression.left)
      && statement.expression.left.expression.getText(parsed) === 'DetailHeader'
      && statement.expression.left.name.text === 'displayName');
    assert.equal(displayNames.length, 1, 'React DetailHeader displayName must be removed with its declaration');
    ranges.push({ start: displayNames[0]!.getStart(parsed), end: displayNames[0]!.end });
    // The package enables noUnusedLocals during declaration generation. Its
    // now-unused private props import belongs to this deleted implementation.
    const propsImports: Array<{ start: number; end: number }> = [];
    for (const statement of parsed.statements) {
      if (!ts.isImportDeclaration(statement)) continue;
      const bindings = statement.importClause?.namedBindings;
      if (!bindings || !ts.isNamedImports(bindings)) continue;
      for (const [index, element] of bindings.elements.entries()) {
        if (element.name.text !== 'DetailHeaderProps') continue;
        assert.ok(bindings.elements.length > 1, 'Expected the shared type import list');
        propsImports.push(index === bindings.elements.length - 1
          ? { start: bindings.elements[index - 1]!.end, end: element.end }
          : { start: element.getStart(parsed), end: bindings.elements[index + 1]!.getStart(parsed) });
      }
    }
    assert.equal(propsImports.length, 1, 'Expected one private DetailHeaderProps import');
    ranges.push(propsImports[0]!);
  }
  const removed = ranges.map(range => source.slice(range.start, range.end)).join('\n');
  assert.ok(removed.includes('data-oods-component') && removed.includes('DetailHeader'), 'Selected body must contain the real render implementation');
  let mutated = source;
  for (const range of ranges.sort((a, b) => b.start - a.start)) mutated = mutated.slice(0, range.start) + mutated.slice(range.end);
  return { source: mutated, removed, replacementCount: 1 };
}

function childSnapshot(mode: '--header-snapshot' | '--differential-snapshot', directory: string, phase: string) {
  const snapshotPath = path.join(directory, `${phase}.json`);
  const run = command(path.join(repositoryRoot, 'node_modules/.bin/tsx'), [
    scriptPath, mode, '--output', snapshotPath,
  ], path.join(directory, `${phase}.log`));
  return { run, snapshotPath: relative(snapshotPath), snapshot: JSON.parse(fs.readFileSync(snapshotPath, 'utf8')) };
}

/** Physical implementation deletion requires an exclusive framework build window. */
export function runS185M04HeaderDiscrimination(artifactRoot = defaultRoot) {
  const directory = path.join(artifactRoot, 'detailheader-discrimination');
  absentDirectory(directory);
  const cases: Array<Record<string, unknown>> = [];
  for (const framework of FRAMEWORKS) {
    const cellRoot = path.join(directory, framework); absentDirectory(cellRoot);
    const implementation = `packages/components-${framework}/src/breadth.${framework === 'react' ? 'tsx' : 'ts'}`;
    const rootExport = `packages/components-${framework}/src/index.ts`;
    const sources = [implementation, rootExport].map(file => ({ file, before: fs.readFileSync(path.join(repositoryRoot, file), 'utf8') }));
    const deleted = [deleteDetailHeaderImplementation(sources[0]!.before, framework).source,
      deleteRootExport(sources[1]!.before, 'DetailHeader').source];
    const patches = sources.map((source, index) => patchFor(source.before, deleted[index]!, source.file, cellRoot, `delete-${index}`));
    const otherFramework = framework === 'react' ? 'vue' : 'react';
    const otherDist = path.join(repositoryRoot, `packages/components-${otherFramework}/dist`);
    const otherDistBefore = directoryHash(otherDist);
    const preGreen = childSnapshot('--header-snapshot', cellRoot, 'pre-green');
    assertS185HeaderCells(preGreen.snapshot, null);
    let deletedPhase: ReturnType<typeof childSnapshot> | undefined;
    const logs: string[] = [preGreen.run.log];
    let restored = false;
    try {
      logs.push(command('git', ['apply', ...patches], path.join(cellRoot, 'apply-deletions.log')).log);
      sources.forEach((source, index) => assert.equal(fs.readFileSync(path.join(repositoryRoot, source.file), 'utf8'), deleted[index]));
      logs.push(command('pnpm', ['--filter', `@oods/components-${framework}`, 'run', 'build'], path.join(cellRoot, 'selected-red-build.log')).log);
      deletedPhase = childSnapshot('--header-snapshot', cellRoot, 'selected-red');
      logs.push(deletedPhase.run.log); assertS185HeaderCells(deletedPhase.snapshot, framework);
    } finally {
      // Never replace unrelated edits. Each source must still equal its known
      // original or exact mutation before restoration can touch it.
      sources.forEach((source, index) => assert.ok([source.before, deleted[index]].includes(fs.readFileSync(path.join(repositoryRoot, source.file), 'utf8')),
        `Unexpected concurrent edit in ${source.file}`));
      const appliedPatches = patches.filter((_patch, index) => fs.readFileSync(path.join(repositoryRoot, sources[index]!.file), 'utf8') === deleted[index]);
      if (appliedPatches.length) logs.push(command('git', ['apply', '--reverse', ...appliedPatches], path.join(cellRoot, 'restore-sources.log')).log);
      sources.forEach(source => assert.equal(fs.readFileSync(path.join(repositoryRoot, source.file), 'utf8'), source.before));
      logs.push(command('pnpm', ['--filter', `@oods/components-${framework}`, 'run', 'build'], path.join(cellRoot, 'restored-green-build.log')).log);
      restored = true;
    }
    const restoredGreen = childSnapshot('--header-snapshot', cellRoot, 'restored-green');
    logs.push(restoredGreen.run.log); assertS185HeaderCells(restoredGreen.snapshot, null);
    assert.equal(directoryHash(otherDist), otherDistBefore, 'Other framework dist changed during a selected-framework deletion');
    const record = { framework, status: 'passed', failedGate: 'target-readiness', errorCode: 'OODS-N015',
      physicalImplementationDeletion: true, selectedRedCells: 5, unaffectedGreenCells: 7, restoredGreenCells: 12,
      patches: patches.map(relative), sources: sources.map((source, index) => ({ path: source.file,
        beforeSha256: hash(source.before), deletedSha256: hash(deleted[index]!), restoredSha256: hash(fs.readFileSync(path.join(repositoryRoot, source.file))) })),
      preGreen, selectedRed: deletedPhase, restoredGreen, restored, otherFrameworkDistUnchanged: true, logs };
    writeJson(path.join(cellRoot, 'report.json'), record); cases.push(record);
    process.stdout.write(`${framework}/DetailHeader: five selected cells red, seven unaffected green, twelve restored\n`);
  }
  const priorFile = 'artifacts/product-reality/sprint-185/m03/mutation/mutation-manifest.json';
  const prior = JSON.parse(fs.readFileSync(path.join(repositoryRoot, priorFile), 'utf8'));
  assert.equal(prior.status, 'passed');
  const referencedMutants = prior.mutants.filter((row: { component: string }) => row.component !== 'DetailHeader');
  assert.equal(referencedMutants.length, 8); assert.ok(referencedMutants.every((row: { status: string }) => row.status === 'passed'));
  assert.deepEqual(referencedMutants.map((row: { selectedCell: string }) => row.selectedCell).sort(),
    FRAMEWORKS.flatMap(framework => ['CardHeader', 'ColorSwatch', 'ColorizedBadge', 'VizAreaPreview'].map(component => `${framework}/${component}`)).sort());
  const report = { mission: 's185-m04', kind: 'physical-detailheader-cross-framework-discrimination', status: 'passed', cases,
    totals: { directions: 2, selectedRedCells: 10, unaffectedGreenCells: 14, restoredGreenObservations: 24 },
    otherFourComponents: { report: priorFile, sha256: hash(fs.readFileSync(path.join(repositoryRoot, priorFile))),
      cells: referencedMutants.map((row: { selectedCell: string }) => row.selectedCell) } };
  writeJson(path.join(directory, 'report.json'), report); return report;
}

export async function createS185M04DifferentialSnapshot(outputRoot: string) {
  const generated = await runLiveGenerationOnly({ artifactRoot: outputRoot, schemaNames: [subjectSchema], mission: 's185-m04' });
  const cells = generated.cells.map(cell => ({ schema: cell.schema, framework: cell.framework,
    sourceSha256: cell.sourceSha256, artifactContentHash: cell.artifact.contentHash }));
  return { live: { acquisition: 'runLiveGenerationOnly/current-code.generate', cells, sha256: hash(json(cells)) },
    legacy: await createS183HarnessSnapshot() };
}

export function assertS185Differential(snapshots: { preGreen: any; selectedRed: any; restoredGreen: any }): void {
  const { preGreen, selectedRed, restoredGreen } = snapshots;
  assert.notEqual(preGreen.live.sha256, selectedRed.live.sha256, 'Live harness did not respond to emitter mutation');
  assert.equal(preGreen.live.sha256, restoredGreen.live.sha256, 'Live harness failed to restore');
  assert.equal(preGreen.legacy.snapshotSha256, selectedRed.legacy.snapshotSha256, 'Frozen Sprint 183 harness moved');
  assert.equal(preGreen.legacy.snapshotSha256, restoredGreen.legacy.snapshotSha256);
  for (const snapshot of [preGreen, selectedRed, restoredGreen]) {
    assert.deepEqual(snapshot.live.cells.map((cell: any) => cell.framework).sort(), [...FRAMEWORKS].sort());
  }
  for (const framework of FRAMEWORKS) {
    const before = preGreen.live.cells.find((cell: any) => cell.framework === framework);
    const after = selectedRed.live.cells.find((cell: any) => cell.framework === framework);
    assert.equal(before.schema, subjectSchema); assert.equal(after.schema, subjectSchema);
    if (framework === 'react') assert.notEqual(before.sourceSha256, after.sourceSha256);
    else assert.equal(before.sourceSha256, after.sourceSha256, 'React emitter change leaked into Vue');
  }
}

/** Source-only mutation; still requires an exclusive live-generation window. */
export function runS185M04Differential(artifactRoot = defaultRoot) {
  const directory = path.join(artifactRoot, 'differential'); absentDirectory(directory);
  const file = 'packages/mcp-server/src/codegen/react-emitter.ts';
  const source = fs.readFileSync(path.join(repositoryRoot, file), 'utf8');
  const needle = 'aria-label="Screen actions"';
  assert.equal(source.split(needle).length - 1, 1, 'Expected one emitter surface literal');
  const mutated = source.replace(needle, 'aria-label="Sprint 185 mutation screen actions"');
  const patch = patchFor(source, mutated, file, directory, 'emitter-forward');
  const reversePatch = patchFor(mutated, source, file, directory, 'emitter-reverse');
  const preGreen = childSnapshot('--differential-snapshot', directory, 'pre-green');
  let selectedRed: ReturnType<typeof childSnapshot> | undefined;
  const logs = [preGreen.run.log];
  const checkEquality = (candidate: string, label: string, expectedExit: number) => command(
    path.join(repositoryRoot, 'node_modules/.bin/tsx'), [scriptPath, '--check-source-equality',
      '--baseline', path.join(repositoryRoot, preGreen.snapshotPath), '--candidate', path.join(repositoryRoot, candidate)],
    path.join(directory, `${label}-source-equality.log`), repositoryRoot, expectedExit,
  );
  logs.push(checkEquality(preGreen.snapshotPath, 'pre-green', 0).log);
  try {
    logs.push(command('git', ['apply', patch], path.join(directory, 'apply-forward.log')).log);
    selectedRed = childSnapshot('--differential-snapshot', directory, 'selected-red'); logs.push(selectedRed.run.log);
    logs.push(checkEquality(selectedRed.snapshotPath, 'selected-red', 1).log);
  } finally {
    const current = fs.readFileSync(path.join(repositoryRoot, file), 'utf8');
    assert.ok(current === source || current === mutated, 'Unexpected concurrent emitter edit');
    if (current === mutated) logs.push(command('git', ['apply', reversePatch], path.join(directory, 'apply-reverse.log')).log);
    assert.equal(fs.readFileSync(path.join(repositoryRoot, file), 'utf8'), source);
  }
  const restoredGreen = childSnapshot('--differential-snapshot', directory, 'restored-green'); logs.push(restoredGreen.run.log);
  logs.push(checkEquality(restoredGreen.snapshotPath, 'restored-green', 0).log);
  const snapshots = { preGreen: preGreen.snapshot, selectedRed: selectedRed!.snapshot, restoredGreen: restoredGreen.snapshot };
  assertS185Differential(snapshots);
  const report = { mission: 's185-m04', kind: 'live-emitter-differential', status: 'passed', subjectSchema,
    failedGate: 'live-generation-source-equality', mutation: { file, replacementCount: 1, patch: relative(patch), reversePatch: relative(reversePatch),
      beforeSha256: hash(source), deletedSha256: hash(mutated), restoredSha256: hash(fs.readFileSync(path.join(repositoryRoot, file))),
      artifactJsonPathsTouched: [] }, preGreen, selectedRed, restoredGreen, snapshots, logs };
  writeJson(path.join(directory, 'report.json'), report); return report;
}

export function assertS185HydrationBite(report: any): void {
  assert.equal(report.status, 'detected'); assert.equal(report.expectedFailedGate, 'hydration');
  assert.deepEqual(report.observedFailedGates, ['hydration'], 'Hydration mutation must isolate the named gate');
  assert.deepEqual(report.gates.map((gate: any) => gate.name).sort(), [...GATE_NAMES].sort(), 'Every named gate must occur exactly once');
  assert.deepEqual(report.gates.filter((gate: any) => gate.status === 'failed').map((gate: any) => gate.name), ['hydration'],
    'Actual gate rows must agree with the declared hydration red');
  assert.ok(report.gates.every((gate: any) => ['passed', 'failed', 'unproven'].includes(gate.status)));
  for (const name of ['fresh-exact-tarball-install', 'strict-typecheck', 'production-build', 'server-render', 'mount']) {
    assert.equal(report.gates.find((gate: any) => gate.name === name)?.status, 'passed', `${name} must precede the hydration red`);
  }
  assert.ok(report.mutation.operations.length > 0);
  assert.equal(report.mutation.gate, 'hydration');
  assert.ok(report.mutation.operations.every((operation: any) => operation.replacementCount === 1 && operation.beforeSha256 !== operation.afterSha256));
}

function assertHydrationBaseline(report: Record<string, unknown>, generation: LiveGenerationCell): void {
  assert.equal(report.status, 'passed');
  const gates = report.gates as Array<{ name: string; status: string }>;
  assert.deepEqual(gates.map(gate => gate.name).sort(), [...GATE_NAMES].sort());
  assert.ok(gates.every(gate => gate.status === 'passed'), 'All eight plan-form gates must pass before and after the bite');
  assert.equal((report.generation as { sourceSha256: string }).sourceSha256, generation.sourceSha256);
}

export async function runS185M04HydrationBites({ artifactRoot, generationArtifactRoot, generationCells, tarballs }: {
  artifactRoot: string; generationArtifactRoot: string; generationCells: LiveGenerationCell[]; tarballs: PackedPackageRecord[];
}) {
  const directory = path.join(artifactRoot, 'hydration'); absentDirectory(directory);
  const cases: Array<Record<string, unknown>> = [];
  for (const framework of FRAMEWORKS) {
    const generation = generationCells.find(cell => cell.schema === subjectSchema && cell.framework === framework);
    assert.ok(generation, `Missing new-schema live generation for ${framework}`);
    const cellRoot = path.join(directory, framework); absentDirectory(cellRoot);
    const phaseRoots = Object.fromEntries(['pre-green', 'selected-red', 'restored-green'].map(phase => [phase, path.join(cellRoot, phase)]));
    // Reuse this run's in-memory artifact and exact original generation log.
    // Each consumer report resolves its own relative evidence paths completely.
    const originalGenerationLog = path.join(generationArtifactRoot, generation.generationLog);
    assert.ok(fs.existsSync(originalGenerationLog), 'Original live generation raw log is required');
    for (const phaseRoot of Object.values(phaseRoots)) {
      const sourcePath = path.join(phaseRoot, generation.sourcePath);
      fs.mkdirSync(path.dirname(sourcePath), { recursive: true });
      fs.writeFileSync(sourcePath, generation.source);
      const logPath = path.join(phaseRoot, generation.generationLog);
      fs.mkdirSync(path.dirname(logPath), { recursive: true });
      fs.copyFileSync(originalGenerationLog, logPath);
    }
    const preGreen = await runLiveConsumerCell({ artifactRoot: phaseRoots['pre-green']!, generation, tarballs, mission: 's185-m04' });
    assertHydrationBaseline(preGreen, generation);
    const selectedRed = await runLiveConsumerCell({ artifactRoot: phaseRoots['selected-red']!, generation, tarballs, mission: 's185-m04',
      mutation: { id: `${framework}-${subjectSchema}-hydration`, gate: 'hydration' } });
    assertS185HydrationBite(selectedRed);
    const relativeCell = selectedRed.cellRelative as string;
    assert.ok(relativeCell, 'Consumer must report its actual evidence directory');
    const generatedFile = framework === 'react' ? 'src/GeneratedUI.tsx' : 'src/GeneratedUI.vue';
    assert.equal(fs.readFileSync(path.join(phaseRoots['selected-red']!, relativeCell, 'source', generatedFile), 'utf8'), generation.source,
      'The hydration bite must consume the exact current-run generated source');
    const entry = `src/main.${framework === 'react' ? 'tsx' : 'ts'}`;
    const before = fs.readFileSync(path.join(phaseRoots['selected-red']!, relativeCell, 'source', entry), 'utf8');
    const after = fs.readFileSync(path.join(phaseRoots['selected-red']!, relativeCell, 'mutation-source', entry), 'utf8');
    const patch = patchFor(before, after, entry, cellRoot, 'remove-hydration');
    const replayRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-s185-hydration-patch-'));
    const patchLogs: string[] = [];
    try {
      fs.mkdirSync(path.join(replayRoot, 'src')); fs.writeFileSync(path.join(replayRoot, entry), before);
      patchLogs.push(command('git', ['apply', patch], path.join(cellRoot, 'apply-hydration-patch.log'), replayRoot).log);
      assert.equal(fs.readFileSync(path.join(replayRoot, entry), 'utf8'), after, 'Applied patch must reproduce the exact consumer bytes that failed hydration');
      patchLogs.push(command('git', ['apply', '--reverse', patch], path.join(cellRoot, 'reverse-hydration-patch.log'), replayRoot).log);
      assert.equal(fs.readFileSync(path.join(replayRoot, entry), 'utf8'), before);
    } finally { fs.rmSync(replayRoot, { recursive: true, force: true }); }
    const restoredGreen = await runLiveConsumerCell({ artifactRoot: phaseRoots['restored-green']!, generation, tarballs, mission: 's185-m04' });
    assertHydrationBaseline(restoredGreen, generation);
    const phases = { preGreen, selectedRed, restoredGreen };
    const phaseKeys = { preGreen: 'pre-green', selectedRed: 'selected-red', restoredGreen: 'restored-green' } as const;
    const logs = Object.entries(phases).flatMap(([phase, raw]) => (raw.gates as any[]).flatMap(gate =>
      gate.logs.map((log: string) => relative(path.join(phaseRoots[phaseKeys[phase as keyof typeof phaseKeys]]!, log)))));
    logs.push(...Object.values(phaseRoots).map(phaseRoot => relative(path.join(phaseRoot, generation.generationLog))));
    for (const log of [...logs, ...patchLogs]) assert.ok(fs.existsSync(path.join(repositoryRoot, log)), `Missing raw log ${log}`);
    const record = { framework, subjectSchema, status: 'passed', expectedFailedGate: 'hydration', observedFailedGates: ['hydration'],
      patch: relative(patch), applyingPatchVerified: true, beforeSha256: hash(before), afterSha256: hash(after),
      originalGenerationLog: relative(originalGenerationLog), sourcePolicy: 'Same current-run in-memory artifact and byte-exact copy of its original raw generation log in every phase',
      phaseRoots: Object.fromEntries(Object.entries(phaseRoots).map(([key, value]) => [key, relative(value)])), phases, logs: [...new Set([...logs, ...patchLogs])] };
    writeJson(path.join(cellRoot, 'report.json'), record); cases.push(record);
    process.stdout.write(`${subjectSchema}/${framework}: hydration red and restored with the same generated artifact and exact tarballs\n`);
  }
  const report = { mission: 's185-m04', kind: 'new-schema-hydration-bites', status: 'passed', subjectSchema, selectedBites: 2, detectedBites: 2, cases };
  writeJson(path.join(directory, 'report.json'), report); return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const outputIndex = process.argv.indexOf('--output');
  const output = outputIndex >= 0 ? path.resolve(process.argv[outputIndex + 1]!) : undefined;
  if (process.argv.includes('--header-snapshot')) {
    assert.ok(output); writeJson(output, await observeS185HeaderCells());
  } else if (process.argv.includes('--differential-snapshot')) {
    assert.ok(output); writeJson(output, await createS185M04DifferentialSnapshot(`${output}.evidence`));
  } else if (process.argv.includes('--check-source-equality')) {
    const read = (flag: string) => JSON.parse(fs.readFileSync(process.argv[process.argv.indexOf(flag) + 1]!, 'utf8'));
    assert.equal(read('--candidate').live.sha256, read('--baseline').live.sha256, 'live-generation-source-equality');
    process.stdout.write('live-generation-source-equality: passed\n');
  } else if (process.argv.includes('--cross-framework')) runS185M04HeaderDiscrimination(output);
  else if (process.argv.includes('--differential')) runS185M04Differential(output);
  else throw new Error('Choose --cross-framework or --differential; source mutations require the exclusive coordinated window.');
}
