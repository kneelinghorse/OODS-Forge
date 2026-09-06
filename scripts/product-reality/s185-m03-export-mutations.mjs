#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import ts from 'typescript';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const frameworks = ['react', 'vue'];

/** Sprint 185 defaults; later waves pass their own component set, cell spec, output and mission. */
export const DEFAULT_MUTATION_OPTIONS = Object.freeze({
  evidenceRoot: path.join(repositoryRoot, 'artifacts/product-reality/sprint-185/m03/mutation'),
  components: ['DetailHeader', 'CardHeader', 'ColorSwatch', 'ColorizedBadge', 'VizAreaPreview'],
  cellSpec: 'test/product-reality/breadth-export-cells.s185.spec.ts',
  mission: 's185-m03',
});

function parseArguments(argv) {
  const options = { ...DEFAULT_MUTATION_OPTIONS };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const value = argv[index + 1];
    if (argument === '--components' && value) { options.components = value.split(',').filter(Boolean); index += 1; }
    else if (argument === '--spec' && value) { options.cellSpec = value; index += 1; }
    else if (argument === '--output' && value) { options.evidenceRoot = path.resolve(value); index += 1; }
    else if (argument === '--mission' && value) { options.mission = value; index += 1; }
    else throw new Error(`Unknown or incomplete argument: ${argument}`);
  }
  return options;
}

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function relative(file) {
  return path.relative(repositoryRoot, file).split(path.sep).join('/');
}

function writeJson(file, value) {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function command(executable, args, logFile) {
  const started = new Date().toISOString();
  const result = spawnSync(executable, args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  writeFileSync(logFile, [
    `started=${started}`,
    `command=${JSON.stringify([executable, ...args])}`,
    result.stdout ?? '',
    result.stderr ?? '',
    result.error ? String(result.error) : '',
    `exit=${result.status} signal=${result.signal ?? 'none'}`,
    '',
  ].join('\n'));
  return { exitCode: result.status, signal: result.signal, log: relative(logFile) };
}

/** Delete one runtime root-export specifier, preserving every other source byte. */
export function deleteRootExport(source, component) {
  const parsed = ts.createSourceFile('index.ts', source, ts.ScriptTarget.Latest, true);
  const matches = [];
  for (const statement of parsed.statements) {
    if (!ts.isExportDeclaration(statement) || statement.isTypeOnly
      || !statement.exportClause || !ts.isNamedExports(statement.exportClause)) continue;
    const elements = statement.exportClause.elements;
    for (const [index, element] of elements.entries()) {
      if (!element.isTypeOnly && element.name.text === component) {
        matches.push({ statement, elements, element, index });
      }
    }
  }
  invariant(matches.length === 1, `${component}: expected one runtime root export; found ${matches.length}.`);
  const { statement, elements, element, index } = matches[0];
  const start = elements.length === 1
    ? statement.getStart(parsed)
    : index === elements.length - 1 ? elements[index - 1].end : element.getStart(parsed);
  const end = elements.length === 1
    ? statement.end
    : index === elements.length - 1 ? element.end : elements[index + 1].getStart(parsed);
  const mutated = source.slice(0, start) + source.slice(end);
  invariant(mutated !== source, `${component}: mutation did not change source.`);
  return { source: mutated, removed: source.slice(start, end), replacementCount: matches.length };
}

function directoryHash(directory) {
  const entries = [];
  const visit = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = path.join(current, entry.name);
      if (entry.isDirectory()) visit(file);
      else entries.push([path.relative(directory, file), sha256(readFileSync(file))]);
    }
  };
  visit(directory);
  return sha256(JSON.stringify(entries));
}

const DEFAULT_MUTATION_OPTIONS_WITH_CELLS = Object.freeze({
  ...DEFAULT_MUTATION_OPTIONS,
  cells: frameworks.flatMap((framework) => DEFAULT_MUTATION_OPTIONS.components.map((component) => `${framework}/${component}`)),
});

function observe(directory, phase, expectedRedCell = null, { cells, cellSpec } = DEFAULT_MUTATION_OPTIONS_WITH_CELLS) {
  process.stdout.write(`${path.basename(directory)} ${phase}: observing all ${cells.length} cells\n`);
  const packageReportPath = path.join(directory, `${phase}-package.json`);
  const packageRun = command('pnpm', [
    '--filter', '@oods/mcp-server', 'exec', 'vitest', 'run', cellSpec,
    '--reporter=json', `--outputFile=${packageReportPath}`,
  ], path.join(directory, `${phase}-package.log`));
  const readinessReportPath = path.join(directory, `${phase}-readiness.json`);
  const readinessRun = command(process.execPath, [
    'scripts/product-reality/verify-readiness-refs.mjs', '--output', readinessReportPath,
  ], path.join(directory, `${phase}-readiness.log`));

  const packageReport = JSON.parse(readFileSync(packageReportPath, 'utf8'));
  const assertions = packageReport.testResults.flatMap((suite) => suite.assertionResults);
  const observations = assertions.map((assertion) => ({
    cell: assertion.title.replace(/^'|'$/g, ''),
    status: assertion.status,
    failureMessages: assertion.failureMessages,
  }));
  // The cell spec may carry every component ported so far; every intended
  // cell must execute, and any other executed cell must stay green.
  const executedCells = observations.map(({ cell }) => cell);
  invariant(cells.every((cell) => executedCells.includes(cell)) && new Set(executedCells).size === executedCells.length,
    `${phase}: package selector did not execute every one of the ${cells.length} intended cells exactly once.`);
  invariant(observations.every(({ status }) => status === 'passed' || status === 'failed'),
    `${phase}: package cells were skipped or not executed.`);
  const packageRedCells = observations.filter(({ status }) => status === 'failed').map(({ cell }) => cell).sort();
  const readiness = JSON.parse(readFileSync(readinessReportPath, 'utf8'));
  const readinessRedCells = [...new Set(readiness.failures.map(({ target, componentId }) => `${target}/${componentId}`))].sort();
  const expectedRed = expectedRedCell ? [expectedRedCell] : [];
  invariant(JSON.stringify(packageRedCells) === JSON.stringify(expectedRed),
    `${phase}: package red set ${JSON.stringify(packageRedCells)} differs from ${JSON.stringify(expectedRed)}.`);
  invariant(JSON.stringify(readinessRedCells) === JSON.stringify(expectedRed),
    `${phase}: readiness red set ${JSON.stringify(readinessRedCells)} differs from ${JSON.stringify(expectedRed)}.`);
  invariant(Object.entries(readiness.expected).every(([key, value]) => readiness.totals[key] === value),
    `${phase}: readiness reference denominator changed.`);
  invariant(packageRun.exitCode === (expectedRedCell ? 1 : 0), `${phase}: unexpected package process exit.`);
  invariant(readinessRun.exitCode === (expectedRedCell ? 1 : 0), `${phase}: unexpected readiness process exit.`);
  if (expectedRedCell) {
    invariant(readiness.failures.some(({ evidenceClass }) => evidenceClass === 'packageExport'),
      `${phase}: the source root export reference did not bite.`);
    invariant(readiness.failures.some(({ evidenceClass }) => evidenceClass === 'publicDeclaration'),
      `${phase}: the rebuilt public declaration reference did not bite.`);
  }
  return {
    phase,
    executedCellCount: executedCells.length,
    packageRun,
    readinessRun,
    packageReport: relative(packageReportPath),
    readinessReport: relative(readinessReportPath),
    observations,
    packageRedCells,
    readinessRedCells,
    readinessTotals: readiness.totals,
    readinessFailures: readiness.failures,
  };
}

function build(framework, directory, phase) {
  process.stdout.write(`${path.basename(directory)} ${phase}: building only @oods/components-${framework}\n`);
  const result = command('pnpm', ['--filter', `@oods/components-${framework}`, 'run', 'build'],
    path.join(directory, `${phase}-build.log`));
  invariant(result.exitCode === 0, `${phase}: ${framework} build failed; see ${result.log}.`);
  return result;
}

function writePatch(beforePath, afterPath, sourceRelativePath, patchPath) {
  const diff = spawnSync('git', ['diff', '--no-index', '--', beforePath, afterPath], {
    cwd: repositoryRoot, encoding: 'utf8',
  });
  invariant(diff.status === 1, 'Expected one source patch from distinct snapshots.');
  const patch = diff.stdout
    .replace(/^diff --git .+$/m, `diff --git a/${sourceRelativePath} b/${sourceRelativePath}`)
    .replace(/^--- .+$/m, `--- a/${sourceRelativePath}`)
    .replace(/^\+\+\+ .+$/m, `+++ b/${sourceRelativePath}`);
  writeFileSync(patchPath, patch);
}

// This runner physically mutates one package root and rebuilds that framework.
// Run only in the coordinated exclusive build window; all source restoration
// and final green checks execute before advancing to another mutation.
export function runExportMutationMatrix(options = DEFAULT_MUTATION_OPTIONS) {
  const { evidenceRoot, components, cellSpec, mission } = { ...DEFAULT_MUTATION_OPTIONS, ...options };
  const cells = frameworks.flatMap((framework) => components.map((component) => `${framework}/${component}`));
  const observeCells = (directory, phase, expectedRedCell = null) => observe(directory, phase, expectedRedCell, { cells, cellSpec });
  mkdirSync(evidenceRoot, { recursive: true });
  const report = {
    schemaVersion: '1.0.0', mission, status: 'running',
    method: 'one actual source root-export deletion, selected package rebuild, all-cell package SSR plus independent readiness verification',
    components, frameworks, cells,
    mutants: [],
  };
  const htmlPath = path.join(repositoryRoot, 'packages/mcp-server/src/render/component-map.ts');
  const htmlBefore = sha256(readFileSync(htmlPath));
  try {
    for (const framework of frameworks) {
      for (const component of components) {
        const selectedCell = `${framework}/${component}`;
        const directory = path.join(evidenceRoot, `${framework}-${component}`);
        mkdirSync(directory, { recursive: true });
        const sourcePath = path.join(repositoryRoot, `packages/components-${framework}/src/index.ts`);
        const sourceRelativePath = relative(sourcePath);
        const original = readFileSync(sourcePath, 'utf8');
        const mutated = deleteRootExport(original, component);
        const beforePath = path.join(directory, 'index.before.ts');
        const afterPath = path.join(directory, 'index.deleted.ts');
        const patchPath = path.join(directory, 'delete-export.patch');
        writeFileSync(beforePath, original);
        writeFileSync(afterPath, mutated.source);
        writePatch(beforePath, afterPath, sourceRelativePath, patchPath);
        const otherFramework = framework === 'react' ? 'vue' : 'react';
        const otherDist = path.join(repositoryRoot, `packages/components-${otherFramework}/dist`);
        const otherDistBefore = directoryHash(otherDist);
        const record = {
          selectedCell, framework, component, sourcePath: sourceRelativePath,
          patch: relative(patchPath), replacementCount: mutated.replacementCount,
          sourceSha256Before: sha256(original), sourceSha256Deleted: sha256(mutated.source),
          status: 'running',
        };
        report.mutants.push(record);
        record.preGreen = observeCells(directory, 'pre-green');
        const apply = command('git', ['apply', '--', patchPath], path.join(directory, 'patch-apply.log'));
        let failure;
        try {
          invariant(apply.exitCode === 0, `${selectedCell}: mutation patch failed to apply.`);
          invariant(readFileSync(sourcePath, 'utf8') === mutated.source,
            `${selectedCell}: applied source differs from the single-export mutation.`);
          record.deletedBuild = build(framework, directory, 'selected-red');
          record.selectedRed = observeCells(directory, 'selected-red', selectedCell);
        } catch (error) {
          failure = error;
        } finally {
          const current = readFileSync(sourcePath, 'utf8');
          invariant(current === original || current === mutated.source,
            `${selectedCell}: unrelated source changes appeared during the exclusive mutation window.`);
          writeFileSync(sourcePath, original);
          record.restoredByteIdentically = readFileSync(sourcePath, 'utf8') === original;
          record.restoredBuild = build(framework, directory, 'restored-green');
          record.restoredGreen = observeCells(directory, 'restored-green');
          record.otherFrameworkDist = {
            framework: otherFramework, before: otherDistBefore, after: directoryHash(otherDist),
          };
          invariant(record.otherFrameworkDist.before === record.otherFrameworkDist.after,
            `${selectedCell}: the unselected framework dist changed.`);
        }
        if (failure) throw failure;
        record.status = 'passed';
        writeJson(path.join(directory, 'result.json'), record);
        writeJson(path.join(evidenceRoot, 'mutation-manifest.json'), report);
        process.stdout.write(`${selectedCell}: selected cell red, other ${record.selectedRed.executedCellCount - 1} green, all ${record.restoredGreen.executedCellCount} restored\n`);
      }
    }
    report.htmlRenderer = { before: htmlBefore, after: sha256(readFileSync(htmlPath)) };
    invariant(report.htmlRenderer.before === report.htmlRenderer.after, 'HTML renderer changed during mutation run.');
    report.totals = {
      mutations: report.mutants.length,
      selectedPackageReds: report.mutants.reduce((count, entry) => count + entry.selectedRed.packageRedCells.length, 0),
      selectedReadinessReds: report.mutants.reduce((count, entry) => count + entry.selectedRed.readinessRedCells.length, 0),
      unaffectedGreenCells: report.mutants.reduce((count, entry) => count + entry.selectedRed.executedCellCount - 1, 0),
      restoredGreenCells: report.mutants.reduce((count, entry) => count + entry.restoredGreen.executedCellCount, 0),
    };
    report.status = 'passed';
  } catch (error) {
    report.status = 'failed';
    report.error = String(error);
    throw error;
  } finally {
    writeJson(path.join(evidenceRoot, 'mutation-manifest.json'), report);
  }
  return report;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    runExportMutationMatrix(parseArguments(process.argv.slice(2)));
  } catch (error) {
    process.stderr.write(`${String(error)}\n`);
    process.exitCode = 1;
  }
}
