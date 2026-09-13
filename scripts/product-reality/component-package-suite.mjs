// One capture suite, four existing package runners. Keep each package's cwd:
// package-contract tests intentionally verify their own published file layout.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const packages = ['component-contracts', 'component-styles', 'components-react', 'components-vue'];
const supplied = process.argv.slice(2).filter(argument => !argument.startsWith('--'));
if (JSON.stringify(supplied) !== JSON.stringify(packages)) throw new Error('The component suite requires the four literal package names in dependency order.');
const outputArgument = process.argv.find(argument => argument.startsWith('--outputFile='));
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-component-suite-'));
const reports = [];
let failed = false;
for (const name of packages) {
  const output = path.join(temporary, `${name}.json`);
  const args = ['--filter', `@oods/${name}`, 'exec', 'vitest', 'run', ...process.argv.filter(argument => /^--(?:testTimeout=|maxWorkers=|no-file-parallelism$)/.test(argument)), '--reporter=default', '--reporter=json', `--outputFile=${output}`];
  console.log(`$ pnpm ${args.join(' ')}`);
  const result = spawnSync('pnpm', args, { cwd: root, stdio: 'inherit' });
  failed ||= result.status !== 0;
  if (fs.existsSync(output)) reports.push(JSON.parse(fs.readFileSync(output, 'utf8')));
  else { failed = true; console.error(`${name}: no Vitest report was emitted`); }
}
const totals = ['numTotalTestSuites', 'numPassedTestSuites', 'numFailedTestSuites', 'numPendingTestSuites', 'numTotalTests', 'numPassedTests', 'numFailedTests', 'numPendingTests', 'numTodoTests'];
const combined = { success: !failed && reports.length === packages.length && reports.every(report => report.success),
  ...Object.fromEntries(totals.map(key => [key, reports.reduce((sum, report) => sum + (report[key] ?? 0), 0)])),
  testResults: reports.flatMap(report => report.testResults ?? []),
  componentPackages: packages, packageReportCount: reports.length };
if (outputArgument) fs.writeFileSync(path.resolve(outputArgument.slice('--outputFile='.length)), JSON.stringify(combined, null, 2) + '\n');
console.log(JSON.stringify({ packages: reports.length, passed: combined.numPassedTests, failed: combined.numFailedTests, skipped: combined.numPendingTests, success: combined.success }));
fs.rmSync(temporary, { recursive: true, force: true });
process.exitCode = combined.success ? 0 : 1;
