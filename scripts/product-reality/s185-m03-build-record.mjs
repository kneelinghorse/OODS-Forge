#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CANONICAL_ADVERTISED_SCOPE } from './s184-m07-reconnect.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const evidencePath = 'artifacts/product-reality/sprint-185/m03';
const evidenceRoot = path.join(root, evidencePath);
const baseCommit = 'b659a6eeabc762b8d6d1f489f206445f433a12fd';
const read = name => readFileSync(path.join(evidenceRoot, name), 'utf8');
const json = name => JSON.parse(read(name));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const write = (name, value) => writeFileSync(path.join(evidenceRoot, name), `${JSON.stringify(value, null, 2)}\n`);
const invariant = (condition, message) => { if (!condition) throw new Error(message); };

const readiness = json('readiness-refs.json');
const mutations = json('mutation/mutation-manifest.json');
invariant(readiness.status === 'passed', 'Readiness references must all resolve.');
invariant(mutations.status === 'passed' && mutations.mutants.length === 10, 'All ten physical export mutations must pass.');

const verification = [
  ['React package', 'react-package-tests.log'],
  ['Vue package', 'vue-package-tests.log'],
  ['Live generation and resolving reference regressions', 'live-generation-refs-tests.log'],
  ['Computed parity, built export cells and mounted generated heading', 'parity-and-mounted-heading.log'],
  ['Unchanged HTML renderer regressions', 'html-renderer-regression.log'],
].map(([name, log]) => {
  const output = read(log).replace(/\u001b\[[0-9;]*m/g, '');
  const match = output.match(/\n\s*Tests\s+(\d+) passed \((\d+)\)/);
  invariant(match && match[1] === match[2], `${log}: expected an entirely passing executed suite.`);
  return { name, passed: Number(match[1]), failed: 0, skipped: 0, log: `${evidencePath}/${log}` };
});

const packed = ['react', 'vue'].map(target => {
  const reportPath = target === 'react' ? 'packed/react/packed-import/report.json' : 'packed/vue/report.json';
  const report = json(reportPath);
  invariant(report.status === 'passed' && report.failed === 0 && report.skipped === 0,
    `${target}: clean packed consumer did not pass.`);
  return { target, selected: report.selected, failed: report.failed, skipped: report.skipped, report: `${evidencePath}/${reportPath}` };
});

const paths = execFileSync('git', ['diff', '--name-only', baseCommit, '--', ...CANONICAL_ADVERTISED_SCOPE], {
  cwd: root, encoding: 'utf8',
}).trim().split('\n').filter(Boolean).sort();
write('advertised-movers.json', {
  mission: 's185-m03', baseCommit, comparison: 'm02 head to m03 working tree',
  canonicalAdvertisedScope: CANONICAL_ADVERTISED_SCOPE, paths,
  additionalPublicBehavior: [{
    path: 'packages/components-react/src/presentational.tsx',
    component: 'Badge', reason: 'Explicit tone now controls rendered color tokens even when status has a registry presentation; ColorizedBadge inherits the corrected precedence.',
    decision: 1736,
  }],
  purpose: 'Input to m05 only; recompute the sprint-wide canonical diff and additionally account for component/codegen public behavior.',
});

const logs = [];
const walk = directory => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith('.log')) logs.push({ path: path.relative(root, file), sha256: sha256(readFileSync(file)) });
  }
};
walk(evidenceRoot);
write('evidence-index.json', {
  mission: 's185-m03', baseCommit, implementation: 'Five nucleus root exports in each framework, resolving readiness, exact tarball consumers, and live generated heading subscription.',
  verification, packed, readiness: { totals: readiness.totals, expected: readiness.expected, report: `${evidencePath}/readiness-refs.json` },
  mutationMatrix: { totals: mutations.totals, report: `${evidencePath}/mutation/mutation-manifest.json` },
  builds: ['react-build.log', 'vue-build.log'].map(log => `${evidencePath}/${log}`),
  typechecks: ['react-typecheck.log', 'vue-typecheck.log', 'server-typecheck.log'].map(log => `${evidencePath}/${log}`),
  rawLogs: logs.sort((left, right) => left.path.localeCompare(right.path)),
  disclosures: [
    'Counts describe executions and overlap across package, focused, parity, export and mutation checks; they are not added into a unique-test total.',
    'Initial React packed placeholder assertion failed because renderToString inserts hydration comments between text chunks. The assertion now compares visible text; the first report and log are retained.',
    'The initial generated-heading test could not collect in Vitest jsdom because server import.meta URLs were not file URLs. Live generation now runs in Node and generated components mount in isolated jsdom child processes. The first log remains.',
    'An early readiness run preceded the new React rows and failed only the denominator. Its before-react-rows output remains; the current report resolves every reference.',
    'Independent review caught whitespace separator loss and React Badge status tokens overriding explicit tone. The final package/parity runs and packed tarballs include these corrections; predecessor proof logs are retained.',
    'One Vue package run overlapped the replacement of dist during build and failed on missing declaration/ported files. The build-overlap log remains; the final package run executes after build completion.',
    'Source and script whitespace checks pass. Raw failing-tool excerpts and applying mutation patches retain their original whitespace, so an unrestricted diff --check reports those evidence lines.',
    'Root imports for the five already derive from nucleus membership in the existing emitters; live generation verifies every emitted component import against the built package. No emitter map edit or HTML renderer change was needed in m03.',
    'The four-suite sprint baseline is reserved for m05 at its frozen review head, per decision #1732.',
  ],
  advertisedMovers: `${evidencePath}/advertised-movers.json`,
  commitBoundaryReason: 'Freeze implemented root exports and their physical deletion controls before m04 packed schema consumers.',
  builderSelfCertified: false, separateReviewRequired: true,
});
process.stdout.write(`Recorded ${verification.length} test executions, ${packed.length} packed consumers and ${logs.length} raw logs.\n`);
