#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

// Deliberately independent of the closeout producer and suite-accounting
// checker. Read their actual outputs, then check the frozen operands directly.
const prefix = 'artifacts/product-reality/sprint-185/m05/closeout';
const defaultManifest = 'artifacts/product-reality/sprint-185/m05/closeout-inputs/manifest.json';
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const bare = value => String(value).replace(/^sha256:/, '');
const fullHead = value => typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);
// Independent copy of the reviewed public byte scope; do not import the
// producer's predicate or accept its equivalence boolean as audit evidence.
const publicScope = [
  'configs/agent/policy.json', 'docs/api', 'packages/mcp-adapter/tool-descriptions.json',
  'packages/mcp-server/src/schemas', 'packages/mcp-server/src/schemas/generated.ts',
  'packages/mcp-server/src/security/policy.json', 'packages/mcp-server/src/tools/registry.json',
  'packages/component-contracts/package.json', 'packages/component-contracts/src', 'packages/component-contracts/registry',
  'packages/component-styles/package.json', 'packages/component-styles/src', 'packages/component-styles/scripts', 'packages/component-styles/tsup.config.ts',
  'packages/components-react/package.json', 'packages/components-react/src', 'packages/components-react/evidence', 'packages/components-react/tsup.config.ts',
  'packages/components-vue/package.json', 'packages/components-vue/src', 'packages/components-vue/evidence', 'packages/components-vue/tsup.config.ts', 'packages/components-vue/tsup.ported.config.ts',
  'packages/mcp-server/src/codegen', 'packages/mcp-server/src/render', 'packages/mcp-server/src/errors/registry.ts', 'packages/mcp-server/src/tools/code.generate.ts',
];
const publicScope186 = [...publicScope,
  'packages/mcp-server/src/compose', 'packages/mcp-server/src/tools/design.compose.ts'];
const publicScope187 = [...publicScope186,
  'packages/mcp-server/src/tools/catalog.list.ts', 'packages/mcp-server/src/tools/catalog.shared.ts', 'packages/mcp-server/src/tools/types.ts',
  'cmos/scripts/refresh_structured_data.py', 'cmos/planning/component-schema.json',
  'cmos/planning/oods-components.json', 'cmos/planning/oods-tokens.json',
  'artifacts/structured-data', 'docs/mcp/Tool-Specs.md', 'docs/mcp/Structured-Data-Refresh.md', 'docs/api/catalog-list.md', 'docs/how-forge-works.html'];
const publicScope188 = [...publicScope187, 'packages/mcp-bridge/src', 'packages/mcp-bridge/package.json',
  'packages/mcp-server/package.json', 'scripts/build-revision.mjs', 'cmos/foundational-docs/roadmap/near.md',
  'scripts/runtime/assemble.mjs', '.github/workflows/ci.yml'];
const testPath = file => /(^|\/)(?:__tests__|test|tests)\//.test(file) || /\.(?:spec|test)\.[cm]?[jt]sx?$/.test(file);

const publicScope189 = [...publicScope188, 'scripts/design-loop', 'packages/mcp-server/src/tools/design.preview.ts', 'packages/mcp-server/src/index.ts', 'packages/mcp-server/src/tools/registry.ts', 'agents.md', 'README.md', 'package.json'];
const publicScope190 = [...publicScope189, 'packages/tokens', 'packages/viz-core', 'packages/viz-render', 'packages/mcp-server/src/tools/viz.render.ts', 'packages/mcp-server/src/tools/dashboard.render.ts', 'packages/mcp-server/src/tools/artifact.certify.ts', 'packages/mcp-server/src/tools/certify-contrast.ts', 'packages/mcp-server/src/tools/certify-echarts-emit.ts', 'packages/mcp-server/src/tools/certify-echarts-render-contrast.ts', 'objects', 'traits', 'src/types/oods-tokens.d.ts', 'src/registry/trait-loader.ts', 'src/registry/parameter-applier.ts', 'schemas/traits/mark-area.parameters.schema.json', 'generated/types/traits/mark-area.parameters.ts', 'cmos/foundational-docs/roadmap/product-reality-program.md'];
const publicScope191 = [...publicScope190, 'scripts/runtime'];
const publicScope192 = [...publicScope191, 'scripts/product-reality/component-package-suite.mjs', 'scripts/product-reality/component-theme-proof.mjs', 'scripts/product-reality/s192-token-resolution.mjs', 'scripts/product-reality/scenario-interactions.ts', 'packages/components-react/scripts', 'packages/components-vue/scripts'];
const publicScope193 = [...publicScope192, 'packages/mcp-server/src/lib/runtime-ledger.ts', 'packages/mcp-server/src/lib/tool-ledger.ts', 'packages/mcp-server/src/tools/health.ts', 'packages/mcp-server/registry', 'scripts/product-reality/s193-runtime-cells.ts', 'scripts/product-reality/s193-workflow-cells.ts', 'scripts/product-reality/s193-tool-truth.mjs', 'scripts/product-reality/s193-tool-caveats.json', 'scripts/product-reality/s184-m06-live-consumers.ts', 'scripts/product-reality/s185-m04-consumer-contract.ts', 'scripts/product-reality/s185-closeout.mjs', 'scripts/product-reality/s185-audit-closeout.mjs', 'scripts/product-reality/s185-suite-accounting.mjs', 'scripts/product-reality/s185-sprint-wide-movers.mjs', 'scripts/product-reality/s185-reconnect.mjs', 'packages/component-contracts/fixtures/viz-preview-samples.v1.json', 'scripts/product-reality/s188-m03-app-consumers.ts', 'scripts/product-reality/trait-recipe-assertions.ts', 'scripts/product-reality/viz-recipe-assertions.ts', 'schemas/traits', 'generated/types/traits', 'generated/types/index.ts', 'cmos/foundational-docs/closeout-checklist.md'];
const publicScope194 = [...publicScope193, 'packages/mcp-server/src', 'packages/mcp-adapter', 'packages/mcp-sdk', 'configs/agent/policy.json', 'docs/api', 'docs/mcp', 'docs/runtime', 'docs/how-forge-works.html', 'scripts/product-reality/s194-input-options.mjs'];

// Sprint 195's independently enumerated public additions; never import producer scope.
const publicScope195 = [...publicScope194,
  'domains/saas-billing', 'src/core/trait-definition.ts', 'docs/viz', 'docs/authoring-traits-viz.md',
  'examples/viz/patterns-v2', 'scripts/product-reality/s190-viz-census.ts',
  'scripts/product-reality/s195-attribute-viz-goldens.py', 'scripts/product-reality/s195-certify-profile-migration.mjs',
  'scripts/product-reality/s195-certify-profile-receipt.ts', 'scripts/product-reality/s195-certify-profile-schema.ts',
  'scripts/product-reality/s195-chart-declaration-schema.ts', 'scripts/product-reality/s195-hc-browser.ts',
  'scripts/product-reality/s195-hc-built-receipt.ts', 'scripts/product-reality/s195-hc-schema.ts',
  'scripts/product-reality/s195-health-viz-schema.ts', 'scripts/product-reality/s195-palette.ts',
  'scripts/product-reality/s195-pattern-census.ts', 'scripts/product-reality/s195-pattern-input-schema.ts',
  'scripts/product-reality/s195-pattern-sources.ts', 'scripts/product-reality/s195-qualify-viz-matrix.ts',
  'scripts/product-reality/s195-soak-observation.mjs', 'scripts/product-reality/s195-viz-accuracy-bite.mjs',
  'scripts/product-reality/s195-viz-bite-probe.ts', 'scripts/product-reality/s195-viz-certification-migration.mjs',
  'scripts/product-reality/s195-viz-matrix.ts', 'scripts/product-reality/s195-viz-mutation-bites.mjs',
  'scripts/product-reality/s195-viz-taxonomy.ts'];

// Independent Sprint196 additions; mover coverage includes generated documentation.
const S196_BUILD_BASE = '1d100e20bcc0911031192406625357638adecbe5';
const publicScope196 = [...publicScope195,
  'docs/components', 'docs/history/components', 'docs/README.md', 'docs/adoption',
  'packages/mcp-server/README.md', 'packages/mcp-bridge/README.md', 'scripts/docs',
  'cmos/planning/forge-gate2-decision-packet.md',
  'scripts/product-reality/s182-m04-consumer-harness.mjs', 'scripts/product-reality/s182-m04-consumer-harness.d.mts',
  'scripts/product-reality/s196-bundle-runtime.ts', 'scripts/product-reality/s196-attribute-temporal-goldens.py',
  'scripts/product-reality/s196-bundle-bites.mjs', 'scripts/product-reality/s196-m05-doc-bites.mjs',
  'scripts/product-reality/s196-release-readiness.ts', 'scripts/product-reality/s196-temporal-bite.mjs',
  'scripts/product-reality/s196-temporal-placement-receipt.mjs', 'scripts/product-reality/s196-temporal-probe.ts'];

const S197_BUILD_BASE = 'bc12723e9b7a42a4790a98f5d2a0dc4a1f970b99';
const publicScope197 = [...publicScope196,
  'pnpm-lock.yaml', 'scripts/quality/brand-cascade-browser-proof.mjs', 'scripts/quality/brand-focus-identity.mjs', 'tools/token-lint/index.mjs', 'tests/design-loop/design-loop.test.ts', 'tests/verification/how-forge-works.contract.test.ts', 'tests/verification/s177-prose-carriers.contract.test.ts',
  'scripts/product-reality/s185-reachability.mjs', 'scripts/tokens', 'tools/a11y/guardrails', 'testing/a11y/status-provenance.spec.ts', 'tests/tokens', 'packages/mcp-server/test', 'cmos/foundational-docs/roadmap/README.md', 'cmos/planning/forge-s197-palette-decision-memo.md', 'cmos/planning/forge-s197-build-handoff.md', 'scripts/product-reality/capture-s185-m01-baseline.mjs', 'scripts/product-reality/s197-attribute-palette-goldens.py', 'scripts/product-reality/s197-categorical-search.ts', 'scripts/product-reality/s197-dark-palette.ts', 'scripts/product-reality/s197-hc-scope.ts', 'scripts/product-reality/s197-light-palette.mjs', 'scripts/product-reality/s197-palette-baseline.py', 'scripts/product-reality/s197-palette-consumer-goldens.ts', 'scripts/product-reality/s197-palette-gallery.py', 'scripts/product-reality/s197-palette-sheets.ts', 'scripts/product-reality/s197-tracelab-repin.py', 'scripts/product-reality/s197-tracelab-sheets.mjs', 'scripts/product-reality/s197-viz-palette.ts'];

export function auditPublicRuntimeBytes({ root, implementationHead, executionHead, sprintId = 'sprint-185' }) {
  assert(fullHead(implementationHead) && fullHead(executionHead));
  const scope = sprintId === 'sprint-197' ? publicScope197 : sprintId === 'sprint-196' ? publicScope196 : sprintId === 'sprint-195' ? publicScope195 : sprintId === 'sprint-194' ? publicScope194 : sprintId === 'sprint-193' ? publicScope193 : sprintId === 'sprint-192' ? publicScope192 : sprintId === 'sprint-191' ? publicScope191 : sprintId === 'sprint-190' ? publicScope190 : sprintId === 'sprint-189' ? publicScope189 : sprintId === 'sprint-188' ? publicScope188 : sprintId === 'sprint-187' ? publicScope187 : sprintId === 'sprint-186' ? publicScope186 : publicScope;
  execFileSync('git', ['merge-base', '--is-ancestor', implementationHead, executionHead], { cwd: root });
  const scopedChangedPaths = execFileSync('git', ['diff', '--name-only', '--no-renames', '-z', `${implementationHead}..${executionHead}`, '--', ...scope], { cwd: root, encoding: 'utf8' })
    .split('\0').filter(Boolean).sort();
  return { implementationHead, executionHead, ancestor: true, scope, excludeTests: true,
    scopedChangedPaths, changedPaths: scopedChangedPaths.filter(file => !testPath(file)), excludedTestPaths: scopedChangedPaths.filter(testPath) };
}

export function auditSprintRange({ root, base, head, sprintId = 'sprint-186' }) {
  assert(fullHead(base) && fullHead(head));
  const paths = (scope, includeTests = false) => execFileSync('git', ['diff', '--name-only', '-z', ...(['sprint-196', 'sprint-197'].includes(sprintId) ? ['--no-renames'] : []), `${base}..${head}`, '--', ...scope], { cwd: root, encoding: 'utf8' })
    .split('\0').filter(file => file && (includeTests || !testPath(file))).sort();
  const canonical = ['configs/agent/policy.json', 'docs/api', 'packages/mcp-adapter/tool-descriptions.json',
    'packages/mcp-server/src/schemas', 'packages/mcp-server/src/schemas/generated.ts',
    'packages/mcp-server/src/security/policy.json', 'packages/mcp-server/src/tools/registry.json'];
  const result = { base, head, canonicalPaths: paths(canonical), publicPaths: paths(sprintId === 'sprint-197' ? publicScope197 : sprintId === 'sprint-196' ? publicScope196 : sprintId === 'sprint-195' ? publicScope195 : sprintId === 'sprint-194' ? publicScope194 : sprintId === 'sprint-193' ? publicScope193 : sprintId === 'sprint-192' ? publicScope192 : sprintId === 'sprint-191' ? publicScope191 : sprintId === 'sprint-190' ? publicScope190 : sprintId === 'sprint-189' ? publicScope189 : sprintId === 'sprint-188' ? publicScope188 : sprintId === 'sprint-187' ? publicScope187 : publicScope186, sprintId === 'sprint-197') };
  if (sprintId === 'sprint-195') {
    // Freeze only the human-readable patch representation to the retained format;
    // every path inventory uses -z and never relies on quotePath configuration.
    result.patch = execFileSync('git', ['-c', 'core.quotepath=false', 'diff', '--no-ext-diff', '--no-renames', '--unified=0', base, head, '--', ...publicScope195], { cwd: root, encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 });
    result.componentInputs = execFileSync('git', ['ls-tree', '-r', '--name-only', '-z', head, '--', 'packages/component-contracts', 'packages/component-styles', 'packages/components-react', 'packages/components-vue', 'packages/tokens/src', 'scripts/product-reality/component-theme-proof.mjs', 'scripts/product-reality/s192-token-resolution.mjs'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean).sort();
  }
  if (['sprint-196', 'sprint-197'].includes(sprintId)) {
    result.patch = result.publicPaths.length ? execFileSync('git', ['--literal-pathspecs', 'diff', '--no-ext-diff', '--no-renames', '--unified=0', base, head, '--', ...result.publicPaths], { cwd: root, encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 }) : '';
    // Per-file diffs keep path parsing separate from Git's quoted patch headers.
    result.patches = result.publicPaths.map(file => ({ path: file, patch: execFileSync('git', ['--literal-pathspecs', 'diff', '--no-ext-diff', '--no-renames', '--unified=0', base, head, '--', file], { cwd: root, encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 }) }));
    result.componentInputs = execFileSync('git', ['ls-tree', '-r', '--name-only', '-z', head, '--', 'packages/component-contracts', 'packages/component-styles', 'packages/components-react', 'packages/components-vue', 'packages/tokens/src', 'scripts/product-reality/component-theme-proof.mjs', 'scripts/product-reality/s192-token-resolution.mjs'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean).sort();
  }
  return result;
}
// --no-renames makes every name-status record a status/path pair; tabs and
// newlines inside paths must never be interpreted as record separators.
export function auditEvidenceChanges({ root, executionHead, reviewHead }) {
  const fields = execFileSync('git', ['diff', '--name-status', '--no-renames', '-z', `${executionHead}..${reviewHead}`],
    { cwd: root, encoding: 'utf8' }).split('\0');
  assert.equal(fields.pop(), '', 'Git evidence changes must be NUL-terminated');
  assert.equal(fields.length % 2, 0, 'Git evidence changes must contain status/path pairs');
  return fields.reduce((changes, field, index) => {
    if (index % 2 === 0) changes.push({ status: field, path: fields[index + 1] });
    return changes;
  }, []);
}

export function auditCiChangedPaths({ root, head, implementation, scope }) {
  return execFileSync('git', ['diff', '--name-only', '--no-renames', '-z', head, implementation, '--', ...scope],
    { cwd: root, encoding: 'utf8' }).split('\0').filter(file => file && !testPath(file)).sort();
}

const sourceKeys = [
  ['baselineFold'], ['movers'], ['movers', 'noticePlan', 'deliveries'],
  ['reviewCarries', 'behaviorBites', 'near'], ['reviewCarries'], ['bridge'], [],
  ['cmosMission', 'cmosOriginalMission', 'cmosSprint', 'near', 'm04BuildRecord'],
];

// Independent verification of the one named user exception; no producer helper imports.
export function auditSprint188Timeout({ approval, accounting, readBytes, readHistorical }) {
  assert.equal(approval.approved, true); assert.equal(approval.decisionId, 1830);
  assert.equal(approval.cmosDecision.decisionId, 1830); assert.equal(approval.cmosDecision.missionId, 's188-m06');
  assert.equal(approval.missionId, 's188-m06');
  assert.equal(approval.executionHead, '3f0e9d136e12b81a8ee459b43d1c1fc4aa3c617e');
  assert.equal(approval.proposalHead, '0f6891e3b4a8decb0626d49dbf6fa870bb712276');
  const file = 'packages/mcp-server/test/product-reality/sprint-wide-movers.s185.spec.ts';
  const name = 'Sprint-wide accounting includes runtime behavior omitted by per-mission scopes turns a reproduced Table omission into a failing completed mover record';
  assert.equal(approval.file, file); assert.equal(approval.testKey, name + '#0');
  assert.equal(approval.timeoutMs, 20000); assert.equal(approval.observedDurationMs, 21855);
  assert.equal(approval.sprintReview.status, 'pending-sprint-review'); assert(approval.sprintReview.nextSprintAdjustmentRequired && approval.sprintReview.text.trim());
  const read = target => JSON.parse(readBytes(target));
  const captures = accounting.executions.filter(row => row.cohort === 'closeout'); assert.equal(captures.length, 4);
  const observed = []; const inspected = {};
  for (const capture of captures) {
    assert.equal(capture.measuredHead, approval.executionHead); assert(capture.cleanBefore && capture.cleanAfter);
    assert.equal(capture.counts.failed, capture.suite === 'root-core' ? 1 : 0); assert.equal(capture.exitCode, capture.suite === 'root-core' ? 1 : 0);
    const raw = read(capture.rawReport.path);
    for (const result of raw.testResults) {
      if (result.name.endsWith('/' + file)) inspected[capture.suite] = result;
      for (const test of result.assertionResults ?? []) if (test.status === 'failed') observed.push({ suite: capture.suite, file: result.name, test });
    }
  }
  assert.equal(observed.length, 1); assert.equal(observed[0].suite, 'root-core'); assert(observed[0].file.endsWith('/' + file)); assert.equal(observed[0].test.fullName, name);
  assert.equal(accounting.closeoutFailures.length, 1);
  const failure = accounting.closeoutFailures[0]; assert.equal(failure.status, 'approved-timeout-disclosed'); assert.equal(failure.file, file); assert.equal(failure.testKey, name + '#0');
  const proof = failure.failureEvidence; assert.equal(proof.source, 'raw-log'); assert.equal(proof.status, 'resolved');
  const log = readBytes(proof.log.path); assert.equal(digest(log), proof.log.sha256);
  assert.equal(log.toString().split('\n').slice(proof.startLine - 1, proof.endLine).join('\n'), proof.text);
  assert(proof.text.includes(` FAIL  |core| ${file} > `)); assert(proof.cause.startsWith('Error: Test timed out in 20000ms.\n'));
  const diagnostic = read(approval.diagnostic); assert.equal(diagnostic.capturedExecutionHead, approval.executionHead); assert.equal(diagnostic.spec, file);
  for (const ref of diagnostic.files) assert.equal(digest(readBytes(ref.path)), ref.sha256, 'Retained diagnostic bytes changed.');
  const directory = path.posix.dirname(approval.diagnostic);
  const retry = read(directory + '/isolation.vitest.json'); const ci = read(directory + '/ci-complete.json');
  assert.equal(retry.success, true); assert.equal(retry.numPassedTests, 7); assert.equal(retry.numFailedTests, 0); assert.equal(retry.numPendingTests, 0); assert.equal(retry.testResults.length, 1);
  const isolated = retry.testResults[0]; assert(isolated.name.endsWith('/' + file));
  for (const result of [inspected['root-core'], inspected['mcp-server']]) {
    assert(result); assert.deepEqual(result.assertionResults.map(row => row.fullName).sort(), isolated.assertionResults.map(row => row.fullName).sort());
  }
  assert([...isolated.assertionResults, ...inspected['mcp-server'].assertionResults].every(row => row.status === 'passed'));
  assert.equal(diagnostic.isolation.exitCode, 0); assert.equal(diagnostic.isolation.targetDurationMs, isolated.assertionResults.find(row => row.fullName === name).duration);
  assert.equal(ci.databaseId, 34256102496); assert.equal(ci.status, 'completed'); assert.equal(ci.conclusion, 'success');
  assert(['coverage', 'viz-determinism'].every(job => ci.jobs.some(row => row.name === job && row.conclusion === 'success')));
  const source = digest(readHistorical(approval.executionHead, file));
  assert.equal(digest(readHistorical(ci.headSha, file)), source); assert.equal(digest(readHistorical(approval.proposalHead, file)), source);
  for (const [head, expected] of Object.entries(diagnostic.specHashes)) assert.equal(digest(readHistorical(head, file)), expected);
  assert.deepEqual(accounting.timeoutAcceptance, { decisionId: 1830, status: 'accepted-observed-timeout', file, testKey: name + '#0',
    observedFailureCount: 1, retryPassed: 7, sprintReview: approval.sprintReview, approval: accounting.timeoutAcceptance.approval });
  assert.deepEqual(failure.approval, accounting.timeoutAcceptance.approval);
  return true;
}
const auditDerivationFiles188 = ['scripts/product-reality/s185-suite-accounting.mjs',
  'scripts/product-reality/s185-closeout.mjs', 'scripts/product-reality/s185-audit-closeout.mjs'];
export function auditSprint188ApprovalChanges(changes, readHistorical, readCurrent) {
  for (const { path: file, status } of changes) {
    if (auditDerivationFiles188.includes(file)) { assert.equal(status, 'M'); continue; }
    if (file === 'packages/mcp-server/test/product-reality/approved-timeout.s188.spec.ts') { assert.equal(status, 'A'); continue; }
    assert.equal(status, 'A', `Approval changes a captured input: ${file}`);
    if (file.startsWith('artifacts/product-reality/sprint-188/m06/accepted-timeout/')) continue;
    assert.equal(digest(readCurrent(file)), digest(readHistorical('0f6891e3b4a8decb0626d49dbf6fa870bb712276', file)), `Submitted evidence changed: ${file}`);
  }
}

// This historical schema remains invalid for the five original scalar bindings.
export function auditSprint188OriginalFormFailure(results) {
  assert.equal(results.length, 2);
  for (const [index, result] of results.entries()) {
    const framework = ['react', 'vue'][index];
    const expected = [['address_roles', 'array', 'Input', 'slot-field-3-13'],
      ['preference_document', 'unknown', 'Input', 'slot-field-5-17'],
      ['state_history', 'array', 'DatePicker', 'slot-field-6-19'],
      ['tags', 'array', 'Input', 'slot-field-8-23'], ['tag_metadata', 'array', 'Input', 'slot-field-9-25']];
    assert.equal(result.status, 'error'); assert(!result.artifact);
    assert.deepEqual(result.errors, expected.map(([field, kind, component, nodeId]) => ({code: 'OODS-V007', nodeId, component,
      message: `Field "${field}" has ${kind} data, which cannot bind to ${component}.value on the ${framework} target; accepted field kinds: string, number, boolean.`})));
  }
}

export function auditBrowserReceipt(ref, readFrozen, head) {
  const bytes = Buffer.from(readFrozen(ref.path)); assert.equal(digest(bytes), bare(ref.sha256));
  const receipt = JSON.parse(bytes); assert.equal(receipt.sourceHead, head); assert.deepEqual(receipt.errors, []);
  assert.deepEqual(receipt.views.map(view => view.width), [390, 820, 1440]);
  const directory = path.posix.dirname(ref.path);
  const sibling = file => { assert(!path.posix.isAbsolute(file) && !file.split('/').includes('..')); return Buffer.from(readFrozen(`${directory}/${file}`)); };
  const artifact = JSON.parse(sibling('artifact.json')); assert.equal(artifact.contentHash, receipt.artifactContentHash);
  for (const file of artifact.files) assert.equal(digest(file.contents), bare(file.contentHash));
  for (const view of receipt.views) {
    assert.equal(view.measurements.documentWidth, view.width);
    assert.equal(digest(sibling(view.screenshot)), bare(view.screenshotHash));
    assert.equal(sibling(view.dump).toString('utf8').trim(), view.accessibility.trim());
    assert(!view.measurements.glyphWraps.some(node => node.text.length < 24 && node.lines.length > 6));
  }
  return true;
}

export function auditFinalCloseout({ executionHead, reviewHead, readOutput, readFrozen, readHistorical, gitEvidence, publicGitEvidence, rangeGitEvidence, manifestPath = defaultManifest, ciChangedPaths }) {
  if (manifestPath.startsWith('artifacts/product-reality/sprint-197/m07/')) return auditSprint197Closeout({ executionHead, reviewHead, readOutput, readFrozen, readHistorical, gitEvidence, publicGitEvidence, rangeGitEvidence, manifestPath });
  if (manifestPath.startsWith('artifacts/product-reality/sprint-196/')) return auditSprint196Closeout({ executionHead, reviewHead, readOutput, readFrozen, readHistorical, gitEvidence, publicGitEvidence, rangeGitEvidence, manifestPath, ciChangedPaths });
  if (manifestPath.startsWith('artifacts/product-reality/sprint-195/m07/')) return auditSprint195Closeout({ executionHead, reviewHead, readOutput, readFrozen, readHistorical, gitEvidence, publicGitEvidence, rangeGitEvidence, manifestPath, ciChangedPaths });
  if (manifestPath.startsWith('artifacts/product-reality/sprint-194/m07/')) return auditSprint194Closeout({ executionHead, reviewHead, readOutput, readFrozen, readHistorical, gitEvidence, publicGitEvidence, rangeGitEvidence, manifestPath });
  if (manifestPath.startsWith('artifacts/product-reality/sprint-193/m07/')) return auditSprint193Closeout({ executionHead, reviewHead, readOutput, readFrozen, readHistorical, gitEvidence, publicGitEvidence, rangeGitEvidence, manifestPath });
  if (manifestPath.startsWith('artifacts/product-reality/sprint-192/m07/')) return auditSprint192Closeout({ executionHead, reviewHead, readOutput, readFrozen, readHistorical, gitEvidence, publicGitEvidence, rangeGitEvidence, manifestPath });
  if (manifestPath.startsWith('artifacts/product-reality/sprint-190/m06/') || manifestPath.startsWith('artifacts/product-reality/sprint-191/m05/')) return auditSprint190Closeout({ executionHead, reviewHead, readOutput, readFrozen, readHistorical, publicGitEvidence, rangeGitEvidence, manifestPath });
  assert(fullHead(executionHead) && fullHead(reviewHead), 'Audit requires actual full execution and review SHAs.');
  const browser = manifestPath.startsWith('artifacts/product-reality/sprint-189/m06/');
  const workflow = browser || manifestPath.startsWith('artifacts/product-reality/sprint-188/m06/');
  const approvedTimeout = workflow && JSON.parse(readFrozen(manifestPath)).accounting?.approvedTimeout;
  const fresh = manifestPath.startsWith('artifacts/product-reality/sprint-187/m06/');
  const wave2 = manifestPath.startsWith('artifacts/product-reality/sprint-186/m06/');
  const missionId = browser ? 's189-m06' : workflow ? 's188-m06' : fresh ? 's187-m06' : wave2 ? 's186-m06' : 's185-m05';
  const sprintId = browser ? 'sprint-189' : workflow ? 'sprint-188' : fresh ? 'sprint-187' : wave2 ? 'sprint-186' : 'sprint-185';
  const criterionCount = workflow ? 6 : fresh ? 7 : wave2 ? 6 : 8;
  const suiteCriterion = workflow ? 2 : fresh ? 5 : wave2 ? 4 : 6;
  const outputPrefix = browser ? 'artifacts/product-reality/sprint-189/m06/closeout' : workflow ? `artifacts/product-reality/sprint-188/m06/${approvedTimeout ? 'closeout-accepted' : 'closeout'}` : fresh ? 'artifacts/product-reality/sprint-187/m06/closeout' : wave2 ? 'artifacts/product-reality/sprint-186/m06/closeout' : prefix;
  const requiredSourceKeys = workflow ? [['freshCensus', 'savedOriginal', 'savedSuccessor', 'savedCompatibility'], ['liveConsumers'], [], ['movers', 'moversDeclaration', 'noticePlan', 'deliveries'], ['missionHistory', 'historicalEvidence', 'prose', 'near'], ['cmosMission', 'cmosSprint', 'carries', 'noticePlan']] : fresh ? [['freshCensus'], ['cohort', 'liveConsumers'], ['savedOriginal', 'savedSuccessor', 'savedCompatibility'], ['rootEvidence', 'baselineFold'], ['movers', 'moversDeclaration', 'noticePlan', 'deliveries', 'carries'], [], ['cmosMission', 'cmosOriginalMission', 'cmosSprint', 'near']] : wave2 ? [['unionFold'], ['baselineFold'], ['movers', 'moversDeclaration'],
    ['movers', 'noticePlan', 'deliveries'], [], ['cmosMission', 'cmosOriginalMission', 'cmosSprint', 'near']] : sourceKeys;
  assert.equal(gitEvidence?.ancestor, true, 'Review head must descend from the actual execution head.');
  // Decision 1741 allows new capture records, not rewritten fixtures or code.
  if (approvedTimeout) auditSprint188ApprovalChanges(gitEvidence.changes, readHistorical, readFrozen);
  else for (const change of gitEvidence.changes) {
    const allowed = browser ? /^artifacts\/product-reality\/sprint-189\/m06\/(?:four-suite-closeout[^/]*|closeout|ci)\/.*\.(?:json|log)$/.test(change.path) : workflow
      ? /^artifacts\/product-reality\/sprint-188\/m06\/four-suite-closeout\/(?:run-\d+\/(?:viz-core|viz-render|mcp-server|root-core)\.(?:json|vitest\.json|log)|setup\/[\w-]+\.log|four-suite-baseline\.json|accounting\.json|attributions\.json|failure-dispositions\.json)$/.test(change.path)
        || /^artifacts\/product-reality\/sprint-188\/m06\/closeout\/(?:claim-ledger|review-handoff|evidence-index)\.json$/.test(change.path)
      : fresh
      ? /^artifacts\/product-reality\/sprint-187\/m06\/four-suite-closeout(?:-attempt-[\w-]+)?\/(?:run-\d+\/(?:viz-core|viz-render|mcp-server|root-core)\.(?:json|vitest\.json|log)|setup\/[\w-]+\.log|four-suite-baseline\.json|accounting\.json|attributions\.json|failure-dispositions\.json)$/.test(change.path)
        || /^artifacts\/product-reality\/sprint-187\/m06\/closeout\/(?:claim-ledger|review-handoff|evidence-index)\.json$/.test(change.path)
      : wave2
      ? /^artifacts\/product-reality\/sprint-186\/m06\/four-suite-closeout(?:-attempt-[\w-]+)?\/(?:run-\d+\/(?:viz-core|viz-render|mcp-server|root-core)\.(?:json|vitest\.json|log)|setup\/[\w-]+\.log|four-suite-baseline\.json|accounting\.json|attributions\.json|failure-dispositions\.json)$/.test(change.path)
        || /^artifacts\/product-reality\/sprint-186\/m06\/closeout\/(?:claim-ledger|review-handoff|evidence-index)\.json$/.test(change.path)
      : /^artifacts\/product-reality\/sprint-185\/m05\/four-suite-closeout\/(?:run-\d+\/(?:viz-core|viz-render|mcp-server|root-core)\.(?:json|vitest\.json|log)|setup\/[\w-]+\.log|four-suite-baseline\.json|accounting\.json|attributions\.json|failure-dispositions\.json)$/.test(change.path)
        || /^artifacts\/product-reality\/sprint-185\/m05\/closeout\/(?:claim-ledger|review-handoff|evidence-index)\.json$/.test(change.path);
    assert(change.status === 'A' && allowed, `Review descendant changes executable inputs or pre-existing evidence: ${change.status} ${change.path}`);
  }
  const outputBytes = new Map();
  const output = name => {
    const bytes = Buffer.from(readOutput(`${outputPrefix}/${name}.json`)); outputBytes.set(name, bytes);
    return JSON.parse(bytes.toString('utf8'));
  };
  const ledger = output('claim-ledger');
  const accounting = output('suite-accounting');
  const handoff = output('review-handoff');
  const index = output('evidence-index');
  for (const document of [ledger, accounting, handoff, index]) {
    assert.equal(document.executionHead, executionHead, 'Output relabels actual execution head.');
    assert.equal(document.reviewHead, reviewHead, 'Output names another frozen review head.');
  }
  const checked = new Map();
  const frozen = file => {
    assert(typeof file === 'string' && file.length && !path.posix.isAbsolute(file) && !file.includes('\\')
      && !file.split('/').some(part => ['', '.', '..'].includes(part)), `Unsafe frozen reference: ${file}`);
    assert(!file.startsWith(`${outputPrefix}/`), 'Generated output cannot justify itself as a frozen source.');
    if (!checked.has(file)) {
      const bytes = Buffer.from(readFrozen(file));
      checked.set(file, { path: file, sha256: digest(bytes), bytes });
    }
    return checked.get(file);
  };
  const reference = ref => {
    assert(ref && typeof ref.sha256 === 'string' && /^[a-f0-9]{64}$/.test(bare(ref.sha256)), 'Cited reference lacks captured SHA256.');
    if (ref.executionSourceHead !== undefined) {
      assert(approvedTimeout && (auditDerivationFiles188.includes(ref.path) || ref.path === 'packages/mcp-server/test/product-reality/approved-timeout.s188.spec.ts')); assert(fullHead(ref.executionSourceHead));
      const bytes = Buffer.from(readHistorical(ref.executionSourceHead, ref.path));
      assert.equal(digest(bytes), bare(ref.sha256), 'Captured derivation source hash differs.'); assert.equal(ref.commit, reviewHead);
      return {path: ref.path, sha256: digest(bytes), bytes};
    }
    const observed = frozen(ref.path);
    assert.equal(observed.sha256, bare(ref.sha256), `Frozen source hash differs: ${ref.path}`);
    if (ref.commit !== undefined) assert.equal(ref.commit, reviewHead, 'Frozen reference has a relabeled review commit.');
    return observed;
  };
  const parseFrozen = file => JSON.parse(frozen(file).bytes.toString('utf8'));
  const manifest = parseFrozen(manifestPath);
  assert.equal(manifest.missionId, missionId);
  assert(Array.isArray(manifest.sources.derivationInputs) && manifest.sources.derivationInputs.length > 0, 'Derivation rules must be frozen inputs.');
  for (const file of manifest.sources.derivationInputs) frozen(file);
  const implementationHead = parseFrozen(manifest.sources.noticePlan).implementationHead;
  if (implementationHead !== executionHead) {
    assert.equal(publicGitEvidence?.implementationHead, implementationHead);
    assert.equal(publicGitEvidence.executionHead, executionHead); assert.equal(publicGitEvidence.ancestor, true);
    assert.equal(publicGitEvidence.excludeTests, true); assert.deepEqual(publicGitEvidence.scope, browser ? publicScope189 : workflow ? publicScope188 : fresh ? publicScope187 : wave2 ? publicScope186 : publicScope);
    assert.deepEqual(publicGitEvidence.excludedTestPaths, publicGitEvidence.scopedChangedPaths.filter(testPath));
    assert.deepEqual(publicGitEvidence.changedPaths, publicGitEvidence.scopedChangedPaths.filter(file => !testPath(file)));
    assert.deepEqual(publicGitEvidence.changedPaths, [], 'Advertised public runtime bytes changed after the notice implementation head.');
    assert.deepEqual(ledger.publicHeadEquivalence, publicGitEvidence, 'Producer public equivalence differs from independent Git evidence.');
  }
  const unwrap = document => document.rawResponse?.structuredContent?.data ?? document;
  const mission = unwrap(parseFrozen(manifest.sources.cmosMission));
  const original = unwrap(parseFrozen(manifest.sources.cmosOriginalMission));
  const sprint = unwrap(parseFrozen(manifest.sources.cmosSprint));
  assert.equal(mission.id, missionId); assert.equal(original.id, missionId); assert.equal(sprint.id, sprintId);
  assert.equal(mission.successCriteria.length, criterionCount); assert.equal(ledger.claims.length, criterionCount);
  assert.deepEqual(ledger.claims.map(row => row.criterion), mission.successCriteria, 'Claim text differs from literal frozen CMOS criteria.');
  assert.equal(ledger.criterionSource.path, manifest.sources.cmosMission); reference(ledger.criterionSource);
  assert.equal(ledger.originalCriterionSource.path, manifest.sources.cmosOriginalMission); reference(ledger.originalCriterionSource);
  assert.equal(sprint.status, 'Active', 'The builder must leave the sprint Active.');
  for (const document of [ledger, handoff]) {
    assert.equal(document.builderSelfCertified, false); assert.equal(document.separateReviewRequired, true);
  }
  assert.equal(handoff.sprintStatus, 'Active'); assert.equal(handoff.approvalStatus, 'pending-independent-review');
  assert.equal(handoff.buildStatus, 'BUILT, REVIEW PENDING');
  reference(handoff.sprintStatusSource);
  assert(frozen(manifest.sources.near).bytes.toString('utf8').includes('BUILT, REVIEW PENDING'));

  assert.equal(index.selfExcluded, true);
  assert(!index.generatedOutputs.some(row => row.path === `${outputPrefix}/evidence-index.json`), 'Index has a self-hash cycle.');
  for (const ref of index.frozenInputs) reference(ref);
  // The handoff may later bind this audit. Inspect its flags but do not bind its
  // mutable bytes in the audit: ledger/accounting + frozen inputs are stable.
  for (const name of ['claim-ledger', 'suite-accounting']) {
    const refs = index.generatedOutputs.filter(row => row.path === `${outputPrefix}/${name}.json`);
    assert.equal(refs.length, 1, `Missing/duplicate generated ${name} index reference.`);
    assert.equal(refs[0].sha256, digest(outputBytes.get(name)), `Indexed ${name} hash differs from actual output.`);
  }

  assert.equal(accounting.status, 'passed');
  assert.deepEqual(accounting.validationIssues, []); assert.deepEqual(accounting.unattributedDeltas, []);
  assert.equal(accounting.headRelation.ancestor, true);
  if (approvedTimeout) {
    assert.equal(accounting.headRelation.executableInputsUnchanged, false);
    assert.equal(accounting.headRelation.capturedRuntimeAndTestSourcesUnchanged, true); assert.equal(accounting.headRelation.postCaptureDerivationOnly, true);
    assert.equal(accounting.headRelation.proposalHead, '0f6891e3b4a8decb0626d49dbf6fa870bb712276');
    assert.deepEqual(accounting.headRelation.derivationFiles, auditDerivationFiles188);
    assert.deepEqual(accounting.headRelation.changedEvidencePaths, gitEvidence.changes);
  } else assert.equal(accounting.headRelation.executableInputsUnchanged, true);
  for (const ref of accounting.references) reference(ref);
  const executions = new Map();
  for (const row of ledger.executions) {
    assert(typeof row.id === 'string' && row.id.length && !executions.has(row.id), 'Missing/duplicate ledger execution.');
    executions.set(row.id, row);
  }
  const actualIds = new Set(); const rawHashes = new Set();
  for (const actual of accounting.executions) {
    assert(!actualIds.has(actual.id)); actualIds.add(actual.id);
    const row = executions.get(actual.id); assert(row, 'Suite execution missing from ledger.');
    for (const [key, value] of Object.entries(actual)) assert.deepEqual(row[key], value, `Suite execution ${actual.id} changed ${key}.`);
    assert.equal(row.evidenceKind, 'suite-receipt');
    const receipt = JSON.parse(reference(actual.receipt).bytes.toString('utf8'));
    reference(actual.log); reference(actual.rawReport);
    assert(!rawHashes.has(bare(actual.rawReport.sha256)), 'One raw suite execution is counted twice.'); rawHashes.add(bare(actual.rawReport.sha256));
    assert.equal(actual.measuredHead, receipt.measuredHead, 'Suite receipt execution head was relabeled.');
    assert.equal(actual.exitCode, receipt.exitCode); assert.equal(actual.suite, receipt.suite);
    assert.equal(actual.cleanBefore, receipt.cleanBefore.clean); assert.equal(actual.cleanAfter, receipt.cleanAfter.clean);
    assert.deepEqual(actual.counts, receipt.vitest.tests, 'Suite counts differ from the retained actual receipt.');
  }
  if (browser) {
    assert(accounting.closeoutAttempts.length <= 1, 'Decision 1833 capture budget exceeded.');
    for (const attempt of accounting.closeoutAttempts) {
      assert.equal(attempt.runs.length, 1); assert.equal(attempt.suiteSelection, 'all');
      const rows = attempt.runs[0].suiteExecutionIds.map(id => executions.get(id));
      assert.equal(rows.length, 4); assert(rows.every(row => row.measuredHead === attempt.measuredHead));
      const failures = rows.flatMap(row => row.observedFailures);
      assert(failures.some(row => row.messages.some(message => message.includes('AssertionError'))));
      assert(failures.some(row => digest(readHistorical(attempt.measuredHead, row.file)) !== digest(readHistorical(executionHead, row.file))), 'The failed test source must be reconciled before the corrective capture.');
    }
  }
  const supplementalLogs = new Set();
  for (const actual of manifest.executions) {
    assert(!actualIds.has(actual.id)); actualIds.add(actual.id);
    const row = executions.get(actual.id); assert(row, 'Actual supplemental execution missing.');
    for (const key of ['command', 'cwd', 'host', 'exitCode', 'executionHead', 'sourceState']) assert.deepEqual(row[key], actual[key], `Supplemental ${actual.id} changed ${key}.`);
    assert(fullHead(actual.executionHead)); assert.equal(row.evidenceKind, 'retained-command');
    for (const key of ['inputs', 'outputs', 'logs']) {
      const refs = actual[key] ?? [];
      assert.deepEqual((row[key] ?? []).map(ref => ({ path: ref.path, sha256: bare(ref.sha256) })), refs.map(ref => ({ path: ref.path, sha256: bare(ref.sha256) })), `Execution ${actual.id} has different ${key}.`);
      for (const ref of row[key] ?? []) {
        if (ref.executionSourceHead !== undefined) { assert.equal(key, 'inputs'); assert.equal(ref.executionSourceHead, actual.inputSourceHead ?? actual.executionHead); if (actual.inputSourceHead) assert.equal(actual.sourceState, 'worktree'); }
        reference(ref);
      }
    }
    const logIdentity = actual.logs.map(ref => bare(ref.sha256)).sort().join(':');
    assert(!supplementalLogs.has(logIdentity) && !rawHashes.has(logIdentity), 'A supplemental execution was rolled up twice.'); supplementalLogs.add(logIdentity);
  }
  assert.equal(actualIds.size, executions.size, 'Ledger invents an execution absent from frozen inputs.');
  assert.equal(accounting.closeout.runs.length, 1);
  const capture = accounting.closeout.runs[0].suiteExecutionIds;
  assert.equal(capture.length, 4); assert.equal(new Set(capture).size, 4);
  const captureRows = capture.map(id => executions.get(id));
  assert(captureRows.every(row => row?.evidenceKind === 'suite-receipt' && row.cohort === 'closeout'
    && row.measuredHead === executionHead && row.cleanBefore === true && row.cleanAfter === true), 'Capture contains an unrelated, unclean or relabeled execution.');
  assert.deepEqual(captureRows.map(row => row.suite).sort(), ['mcp-server', 'root-core', 'viz-core', 'viz-render']);

  if (approvedTimeout) {
    const approval = parseFrozen(approvedTimeout);
    assert.equal(accounting.timeoutAcceptance.approval.path, approvedTimeout); reference(accounting.timeoutAcceptance.approval);
    assert(manifest.claimBindings[2].evidencePaths.includes(approvedTimeout));
    auditSprint188Timeout({approval, accounting, readBytes: file => frozen(file).bytes, readHistorical});
    assert.deepEqual(ledger.timeoutAcceptance, accounting.timeoutAcceptance); assert.deepEqual(handoff.timeoutAcceptance, accounting.timeoutAcceptance);
  }
  if (workflow) {
    const census = parseFrozen(manifest.sources.freshCensus);
    const expectedObjects = ['Article', 'Invoice', 'Media', 'Organization', 'Plan', 'Product', 'Relationship', 'Subscription', 'Transaction', 'Usage', 'User'];
    const expectedContexts = ['card', 'detail', 'form', 'inline', 'list', 'timeline'];
    assert.equal(census.head, implementationHead); assert.equal(census.profile, 'build');
    assert.deepEqual(census.objects, expectedObjects); assert.deepEqual([...census.contexts].sort(), expectedContexts);
    assert.equal(census.rows.length, 66); assert.equal(census.schemaCount, 66); assert.equal(census.greenSchemas, 66);
    assert.equal(census.generationCells, 132); assert.equal(census.greenCells, 132);
    assert.deepEqual(census.rows.map(row => `${row.input.object}/${row.input.context}`).sort(), expectedObjects.flatMap(object => expectedContexts.map(context => `${object}/${context}`)).sort());
    const required = { list: ['BillingSummaryBadge', 'ArchivedRowOverlay'], form: ['BillingAmountInput', 'BillingIntervalSelector'],
      detail: ['CycleProgressCard', 'PaymentTimeline'], timeline: ['PaymentEventTimeline'], card: ['BillingCardMeta'] };
    assert.deepEqual(census.workflow.input, { object: 'Subscription', context: 'workflow' });
    for (const row of [...census.rows, census.workflow]) {
      const composed = JSON.parse(reference(row.composition).bytes.toString('utf8'));
      assert.equal(composed.status, 'ok'); assert.equal(row.green, true);
      const ids = new Set(); const walk = node => { ids.add(node.component); node.children?.forEach(walk); };
      composed.schema.screens.forEach(walk);
      assert.deepEqual([...ids].sort(), row.components);
      if (row.input.object === 'Subscription') for (const id of required[row.input.context] ?? []) assert(ids.has(id));
      assert.deepEqual(row.cells.map(cell => cell.framework).sort(), ['react', 'vue']);
      for (const cell of row.cells) {
        const generated = JSON.parse(reference(cell.response).bytes.toString('utf8'));
        assert.equal(generated.status, 'ok'); assert(generated.artifact); assert(!generated.errors?.length);
        for (const file of generated.artifact.files) assert.equal(bare(file.contentHash), digest(file.contents));
      }
    }
    const adoption = parseFrozen('artifacts/product-reality/sprint-188/m01/adoption.json');
    const historical = parseFrozen('artifacts/product-reality/sprint-186/m05/reachability/report.json');
    const originalStore = parseFrozen(manifest.sources.savedOriginal); const successor = parseFrozen(manifest.sources.savedSuccessor);
    const hashes = report => Object.fromEntries(report.rows.map(row => [row.schema + '.json', row.input.sha256]));
    assert.deepEqual(hashes(originalStore), hashes(historical));
    assert.deepEqual(hashes(successor), Object.fromEntries(Object.entries(adoption.after).filter(([file]) => file !== '_index.json')));
    for (const [report, source, reachable, cells] of [[originalStore, manifest.sources.savedOriginal, 15, 30], [successor, manifest.sources.savedSuccessor, 16, 32]]) {
      assert.equal(report.head, implementationHead); assert.equal(report.total, 16); assert.equal(report.reachable, reachable); assert.equal(report.generatedCells, cells);
      let passing = 0;
      for (const row of report.rows) {
        reference(row.input);
        const results = row.cells.map(cell => JSON.parse(reference({ path: `${path.posix.dirname(source)}/${cell.response.path}`, sha256: cell.response.sha256 }).bytes.toString('utf8')));
        const green = results.every(result => result.status === 'ok' && result.artifact);
        assert.equal(row.reachable, green); if (green) passing++;
        else { assert.equal(row.schema, 'user-form-showcase'); auditSprint188OriginalFormFailure(results); }
      }
      assert.equal(passing, reachable);
    }
    const compatibility = parseFrozen(manifest.sources.savedCompatibility);
    assert(compatibility.originalInputsUnchanged && compatibility.successorInputsUnchanged && compatibility.liveStoreUnchanged);
    assert.deepEqual(compatibility.liveStore.hashes, adoption.after);
    const app = parseFrozen(manifest.sources.liveConsumers); const appRoot = path.posix.dirname(manifest.sources.liveConsumers);
    assert.equal(app.sourceHead, implementationHead); assert.deepEqual(app.cells.map(cell => cell.framework).sort(), ['react', 'vue']);
    for (const cell of app.cells) {
      assert.equal(cell.gates.length, 8); assert(cell.gates.every(gate => gate.status === 'passed'));
      assert.equal(cell.flow.length, 9); assert(cell.flow.every(row => row.status === 'passed'));
      assert.equal(cell.consumerAuthoredComponents, 0); assert.equal(cell.consumerAuthoredActions, 0);
      const cellRef = app.cellReports.find(ref => ref.framework === cell.framework);
      assert.deepEqual(JSON.parse(reference({path: `${appRoot}/${cellRef.report}`, sha256: cellRef.sha256}).bytes.toString('utf8')), cell);
      const archive = cell.flow.find(row => row.name === 'ten-sample-records').detail;
      assert.equal(archive.active.length, 9); assert.equal(archive.archived.length, 1); assert.equal(archive.archivePresentation.opacity, '0.6');
      const detail = cell.flow.find(row => row.name === 'detail-navigation').detail;
      for (const id of ['CycleProgressCard', 'PaymentTimeline']) assert(detail.mounts.some(row => row.component === id && row.present && row.passed));
      assert(cell.flow.find(row => row.name === 'timeline-navigation-and-history').detail.mounts.some(row => row.component === 'PaymentEventTimeline' && row.present));
      const owned = parseFrozen(`${appRoot}/${cell.framework}/source-ownership.json`);
      assert.equal(owned.generatedFilesUnchanged, true); assert(owned.files.every(row => row.actual === row.expected));
    }
    const states = ['loading', 'empty', 'error', 'success']; const contexts = ['list', 'detail', 'form', 'timeline'];
    assert.deepEqual(app.stateObservations.map(row => `${row.framework}/${row.screen}/${row.state}`).sort(), ['react', 'vue'].flatMap(target => contexts.flatMap(context => states.map(state => `${target}/${context}/${state}`))).sort());
    assert.equal(app.screenshots.length, 36);
    assert.deepEqual(app.screenshots.map(row => `${row.framework}/${row.screen}/${row.width}`).sort(), ['react', 'vue'].flatMap(target => [...contexts, 'archived', 'payments'].flatMap(context => [390, 820, 1440].map(width => `${target}/${context}/${width}`))).sort());
    for (const image of app.screenshots) reference({path: `${appRoot}/${image.file}`, sha256: image.sha256});
    const bite = parseFrozen(`${appRoot}/navigation-bite.json`);
    assert.equal(bite.beforeHash, bite.restoredHash); assert.notEqual(bite.beforeHash, bite.afterHash);
    assert.deepEqual(bite.red.filter(row => row.status === 'failed').map(row => row.name), ['detail-navigation']);
    assert(bite.restored.length === 9 && bite.unaffected.length === 9 && [...bite.restored, ...bite.unaffected].every(row => row.status === 'passed'));
    const movers = parseFrozen(manifest.sources.movers); const declared = parseFrozen(manifest.sources.moversDeclaration);
    assert.equal(rangeGitEvidence.base, browser ? 'f4cd1ba3cda3d1d52405582e425ecd6d19890b51' : 'cd8ee986db40e73a3fb9a9f1ec7b7db6de9ca076'); assert.equal(rangeGitEvidence.head, implementationHead);
    for (const key of ['canonicalPaths', 'publicPaths']) { assert.deepEqual(movers[browser ? 's189' : 's188'][key], rangeGitEvidence[key]); assert.deepEqual(declared[browser ? 's189' : 's188'][key], rangeGitEvidence[key]); }
    const plan = parseFrozen(manifest.sources.noticePlan);
    assert.equal(plan.status, 'prepared-unsent'); assert.equal(plan.deliverySprint, browser ? 'sprint-190' : 'sprint-189'); assert.equal(plan.implementationHead, implementationHead);
    assert.deepEqual(parseFrozen(manifest.sources.deliveries), []); assert(rangeGitEvidence.publicPaths.every(file => plan.draft.includes(file)));
    const prose = parseFrozen(manifest.sources.prose); assert(prose.success); assert.equal(prose.numFailedTests, 0); assert.equal(prose.numPendingTests, 0);
    assert(prose.testResults.length > 0 && prose.testResults.every(row => /tests\/verification\/.*\.contract\.test\.ts$/.test(row.name)));
    assert(frozen(manifest.sources.near).bytes.toString('utf8').includes('BUILT, REVIEW PENDING'));
    assert.equal(handoff.implementationHead, implementationHead); reference(handoff.craft); reference(handoff.carries);
    if (browser) {
      const wide = parseFrozen(manifest.sources.wideCensus);
      assert.equal(wide.head, implementationHead); assert.equal(wide.rows.length, 77);
      // s191 closes both gaps; retained historical captures may still contain the attributed pair.
      const blocked = wide.rows.filter(row => !row.green).map(row => row.input.object + '/' + row.input.context).sort();
      assert([JSON.stringify([]), JSON.stringify(['Organization/workflow', 'User/workflow'])].includes(JSON.stringify(blocked)));
      assert.equal(wide.rows.filter(row => row.green).length, 77 - blocked.length);
      for (const row of wide.rows.filter(row => !row.green)) assert(row.cells.every(cell => cell.status === 'error' && cell.errors.some(error => error.code === 'OODS-N016')));
      const chain = parseFrozen(manifest.sources.censusDiff);
      assert.equal(chain.status, 'passed'); assert.equal(chain.head, implementationHead); assert.equal(chain.rows.length, 77);
      const baseline = parseFrozen(chain.baseline.path), middle = parseFrozen(chain.middle.path), reconciled = parseFrozen(chain.reconciled.path);
      for (const ref of [chain.baseline, chain.middle, chain.reconciled, ...chain.classifications]) reference(ref);
      assert.equal(baseline.head, 'f4cd1ba3cda3d1d52405582e425ecd6d19890b51');
      for (const row of wide.rows) {
        const key = candidate => JSON.stringify(candidate.input) === JSON.stringify(row.input);
        const before = baseline.rows.find(key), after = reconciled.rows.find(key), listed = chain.rows.find(key);
        assert(before && after && listed); assert.deepEqual(row.schema, after.schema, 'Final schema has an unclassified post-m04 change.');
        assert.equal(listed.changed, JSON.stringify(before.schema) !== JSON.stringify(row.schema));
        assert.equal(listed.beforeHash, digest(JSON.stringify(before.schema))); assert.equal(listed.afterHash, digest(JSON.stringify(row.schema)));
        const expected = chain.classifications.flatMap(ref => parseFrozen(ref.path).rows.find(key).changes.map(change => ({ mission: ref.mission, ...change })));
        assert.deepEqual(listed.changes, expected);
        if (listed.changed) assert(listed.changes.length > 0 && listed.changes.every(change => change.category && ['s189-m03', 's189-m04'].includes(change.mission)));
      }
      assert.equal(middle.rows.length, 77);
      const set = parseFrozen(manifest.sources.receiptSet);
      assert.equal(set.head, implementationHead); assert(set.receipts.length >= 10);
      for (const ref of set.receipts) auditBrowserReceipt(ref, file => frozen(file).bytes, implementationHead);
      for (const context of ['list', 'detail', 'form', 'timeline', 'workflow']) for (const framework of ['react', 'vue']) assert(set.receipts.some(ref => ref.screen === context && ref.framework === framework));
      const mapping = parseFrozen(manifest.sources.carryMapping);
      assert.deepEqual(mapping.items.map(item => item.id), [1, 2, 3, 4, 5, 6, 7]);
      for (const item of mapping.items) {
        assert(['resolved', 'carried'].includes(item.disposition)); assert(item.reason.trim()); assert(item.evidence.length > 0);
        for (const ref of item.evidence) {
          const bytes = reference(ref).bytes;
          assert.equal(bytes.toString('utf8').split('\n').slice(ref.startLine - 1, ref.endLine).join('\n'), ref.text, 'Carry mapping cites different lines.');
        }
      }
      const pr = parseFrozen(manifest.sources.pr);
      assert.equal(pr.base, 'OODS-pro'); assert.equal(pr.head, 'codex/sprint-189-browser-design-loop');
      assert(/^https:\/\/github.com\/.+\/pull\/\d+$/.test(pr.url)); assert(pr.runs.length > 0 && pr.runs.every(run => Number.isInteger(run.databaseId)));
      reference(handoff.receipts); reference(handoff.carryMapping); reference(handoff.pullRequest);
    }

  } else if (fresh) {
    const lockedBase = '21c7c31906fbb81d049b943155c64ed78409fb9f';
    const expected = ['User/detail', 'Product/detail', 'Usage/list', 'Subscription/inline', 'Transaction/timeline', 'Product/list', 'Product/form', 'Product/inline',
      'Organization/list', 'Organization/detail', 'Organization/card', 'Subscription/detail', 'Subscription/form', 'Subscription/card'];
    const targets = ['react', 'vue'];
    const names = ['Article', 'Invoice', 'Media', 'Organization', 'Plan', 'Product', 'Relationship', 'Subscription', 'Transaction', 'Usage', 'User'];
    const contexts = ['detail', 'list', 'form', 'timeline', 'card', 'inline'];
    const census = parseFrozen(manifest.sources.freshCensus);
    assert.equal(census.head, implementationHead); assert.equal(census.profile, 'build');
    assert.equal(census.schemaCount, 66); assert.equal(census.greenSchemas, 66); assert.equal(census.generationCells, 132); assert.equal(census.greenCells, 132);
    assert.deepEqual(census.objects, names); assert.deepEqual(census.contexts, contexts);
    assert.deepEqual(census.rows.map(row => `${row.input.object}/${row.input.context}`).sort(), names.flatMap(name => contexts.map(context => `${name}/${context}`)).sort());
    for (const row of census.rows) {
      assert.deepEqual(Object.keys(row.input).sort(), ['context', 'object']); assert.equal(row.composed, true); assert.equal(row.green, true); assert.deepEqual(row.ungoverned, []);
      assert.deepEqual(row.cells.map(cell => cell.framework), targets);
      assert(row.cells.every(cell => cell.status === 'ok' && cell.artifactPresent && cell.errors.length === 0));
    }
    const cohort = parseFrozen(manifest.sources.cohort); const runtime = parseFrozen(manifest.sources.liveConsumers);
    assert.deepEqual(cohort.groups.flatMap(group => group.paths), expected); assert.deepEqual(cohort.frameworks, targets);
    assert.deepEqual(runtime.freshInputs.map(row => `${row.object}/${row.context}`), expected);
    assert.deepEqual(runtime.cells.map(cell => `${cell.composition.input.object}/${cell.composition.input.context}/${cell.framework}`).sort(), expected.flatMap(item => targets.map(target => `${item}/${target}`)).sort());
    assert.equal(runtime.status, 'passed'); assert.equal(runtime.cellCount, 28); assert.equal(runtime.failed, 0); assert.equal(runtime.skipped, 0);
    const gates = ['fresh-exact-tarball-install', 'strict-typecheck', 'production-build', 'server-render', 'mount', 'hydration', 'shared-css-resolution', 'interaction-evidence'];
    const runtimeDir = path.posix.dirname(manifest.sources.liveConsumers);
    const observedPackages = new Map(); const observedFamilies = new Set();
    let passed = 0; let notApplicable = 0;
    for (const cell of runtime.cells) {
      const doc = JSON.parse(reference({ path: path.posix.join(runtimeDir, cell.report), sha256: cell.reportSha256 }).bytes.toString('utf8'));
      assert.equal(doc.framework, cell.framework); assert.equal(doc.status, 'passed'); assert.deepEqual(doc.gates.map(gate => gate.name), gates);
      assert.equal(cell.composition.sourceHead, implementationHead); assert.equal(cell.composition.sourceDiffSha256, `sha256:${digest('')}`);
      reference({ path: path.posix.join(runtimeDir, cell.composition.sourceDiffPath), sha256: cell.composition.sourceDiffSha256 });
      const composed = parseFrozen(path.posix.join(runtimeDir, 'live-generation', cell.schema, 'composition.json'));
      assert.deepEqual(composed.composition, cell.composition);
      assert.equal(digest(`${JSON.stringify(composed.schema, null, 2)}\n`), bare(cell.composition.schemaSha256));
      const artifact = parseFrozen(path.posix.join(runtimeDir, 'live-generation', cell.schema, cell.framework, 'artifact.json'));
      assert.equal(artifact.contentHash, cell.generation.artifactContentHash);
      for (const file of artifact.files) assert.equal(digest(file.contents), bare(file.contentHash));
      reference({ path: path.posix.join(runtimeDir, cell.generation.sourcePath), sha256: cell.generation.sourceSha256 });
      assert.equal(cell.generation.fingerprint.profile, 'build'); assert.equal(cell.generation.fingerprint.sourceOfArtifact, 'current-in-run-output');
      for (const file of doc.localTarballs) {
        const ref = { path: path.posix.join(runtimeDir, 'submitted-packages/tarballs', path.posix.basename(file.installSpec)), sha256: file.sha256 };
        assert.equal(reference(ref).bytes.length, file.bytes);
        if (observedPackages.has(file.name)) assert.equal(file.sha256, observedPackages.get(file.name));
        else observedPackages.set(file.name, file.sha256);
      }
      for (const gate of doc.gates) {
        if (gate.status === 'passed') assert(gate.logs?.length > 0, 'A passed runtime gate needs its retained command or browser log.');
        for (const log of gate.logs ?? []) frozen(path.posix.join(runtimeDir, log));
        if (gate.status === 'passed') passed++;
        else { assert.equal(gate.name, 'interaction-evidence'); assert.equal(gate.status, 'not-applicable'); notApplicable++; }
      }
      assert.equal(doc.accounting.balanced, true); assert.equal(doc.accounting.namedUnprovenCount, 0);
      assert.deepEqual(doc.browser.runtimeErrors, []); assert.equal(doc.browser.hydrationInvariant.equal, true);
      assert(doc.browser.boundValues.every(value => value.passed === true && value.visible === true));
      for (const [name, count] of Object.entries(doc.browser.componentCounts)) if (count > 0) observedFamilies.add(name);
    }
    assert.equal(runtime.selected, 224); assert.equal(runtime.passed, passed); assert.equal(runtime.notApplicable, notApplicable);
    assert.equal(passed + notApplicable, 224); assert.equal(runtime.applicable, passed);
    const originalStore = parseFrozen(manifest.sources.savedOriginal); const successor = parseFrozen(manifest.sources.savedSuccessor);
    const compatible = parseFrozen(manifest.sources.savedCompatibility);
    assert.equal(compatible.originalInputsUnchanged, true); assert.equal(compatible.successorInputsUnchanged, true); assert.equal(compatible.historicalNegativeRetained, true);
    assert.equal(compatible.originalBaseline, 15); assert.equal(compatible.successorBaseline, 16); assert(compatible.originalDeltaExplanation?.trim());
    for (const ref of compatible.references) reference(ref);
    for (const [store, key] of [[originalStore, 'savedOriginal'], [successor, 'savedSuccessor']]) {
      assert.equal(store.head, implementationHead); assert.equal(store.total, 16); assert.equal(store.rows.length, 16);
      let greenSchemas = 0; let greenCells = 0;
      for (const row of store.rows) {
        reference(row.input); assert.deepEqual(row.cells.map(cell => cell.framework), targets);
        const rawCells = row.cells.map(cell => {
          const result = JSON.parse(reference({ path: path.posix.join(path.posix.dirname(manifest.sources[key]), cell.response.path), sha256: cell.response.sha256 }).bytes.toString('utf8'));
          assert.equal(result.status, cell.status); assert.equal(Boolean(result.artifact), cell.artifactPresent);
          if (result.status === 'ok' && result.artifact) { greenCells++; return true; } return false;
        });
        assert.equal(row.reachable, rawCells.every(Boolean)); if (row.reachable) greenSchemas++;
      }
      assert.equal(store.generatedCells, greenCells); assert.equal(store.reachable, greenSchemas);
    }
    assert(originalStore.reachable >= 15); assert.equal(successor.reachable, 16); assert.equal(successor.generatedCells, 32);
    const types = 'packages/component-contracts/src/types.ts';
    const ids = text => [...text.match(/export const NUCLEUS_COMPONENT_IDS = \[([\s\S]*?)\] as const/)[1].matchAll(/'([^']+)'/g)].map(match => match[1]);
    const current = ids(frozen(types).bytes.toString('utf8')); const prior = ids(Buffer.from(readHistorical(lockedBase, types)).toString('utf8'));
    const added = current.filter(name => !prior.includes(name)); const proof = parseFrozen(manifest.sources.rootEvidence);
    assert.equal(current.length, 64); assert.equal(new Set(current).size, 64); assert.equal(added.length, 14); assert(prior.every(name => current.includes(name)));
    assert.deepEqual(proof.governedIds, current); assert.deepEqual([...proof.addedIds].sort(), [...added].sort());
    assert(added.every(name => observedFamilies.has(name)), 'A new family has no actual mounted runtime observation.');
    const readiness = JSON.parse(reference(proof.readiness).bytes.toString('utf8'));
    assert.equal(readiness.status, 'passed'); assert.deepEqual(readiness.failures, []); assert.equal(readiness.totals.references, 778); assert.equal(readiness.totals.resolved, 778);
    const positive = JSON.parse(reference(proof.positiveExports).bytes.toString('utf8'));
    const exportTests = positive.testResults.flatMap(file => file.assertionResults);
    assert.equal(positive.success, true); assert.equal(positive.numPassedTests, 28); assert.equal(exportTests.length, 28);
    assert(exportTests.every(test => test.status === 'passed'));
    // Vitest quotes the interpolated $cell title. Match the complete terminal
    // cell token, preserving compatibility with the plain synthetic fixtures.
    const exportCell = test => {
      const token = test.fullName.split(' ').at(-1);
      return token.startsWith("'") && token.endsWith("'") ? token.slice(1, -1) : token;
    };
    for (const target of targets) for (const name of added) assert.equal(exportTests.filter(test => exportCell(test) === `${target}/${name}`).length, 1);
    const mutations = proof.mutations.flatMap(ref => JSON.parse(reference(ref).bytes.toString('utf8')).mutants);
    assert.deepEqual(mutations.map(row => row.selectedCell).sort(), added.flatMap(name => targets.map(target => `${target}/${name}`)).sort());
    for (const row of mutations) {
      assert.equal(row.status, 'passed'); assert.equal(row.restoredByteIdentically, true); assert.notEqual(row.sourceSha256Before, row.sourceSha256Deleted);
      const red = parseFrozen(row.selectedRed.packageReport).testResults.flatMap(file => file.assertionResults);
      assert.deepEqual(red.filter(test => test.status === 'failed').map(exportCell), [row.selectedCell]);
      const redReadiness = parseFrozen(row.selectedRed.readinessReport);
      assert(redReadiness.failures.length > 0 && redReadiness.failures.every(item => `${item.target}/${item.componentId}` === row.selectedCell));
      const restored = parseFrozen(row.restoredGreen.packageReport).testResults.flatMap(file => file.assertionResults);
      assert(restored.length > 0 && restored.every(test => test.status === 'passed'));
      assert.equal(parseFrozen(row.restoredGreen.readinessReport).status, 'passed');
      assert.notEqual(row.selectedRed.packageRun.exitCode, 0); assert.notEqual(row.selectedRed.readinessRun.exitCode, 0);
      assert.equal(row.restoredGreen.packageRun.exitCode, 0); assert.equal(row.restoredGreen.readinessRun.exitCode, 0);
      for (const phase of ['selectedRed', 'restoredGreen']) { frozen(row[phase].packageRun.log); frozen(row[phase].readinessRun.log); }
    }
    const baselinePath = 'packages/component-contracts/registry/component-capability-baseline.v1.json';
    const baseline = parseFrozen(baselinePath); const before = JSON.parse(Buffer.from(readHistorical(lockedBase, baselinePath)).toString('utf8'));
    const identity = document => document.rows.map(row => [row.id, row.proposedClassification, row.reconciliationState]);
    assert.equal(baseline.rows.length, 109); assert.deepEqual(identity(baseline), identity(before));
    const scope = parseFrozen('packages/component-contracts/registry/component-obligation-scope.v1.json');
    assert.equal(scope.decisionId, 1788); assert.equal(scope.controllingObligationDenominator, 109); assert.equal(scope.approvedRuntimeCensus, null);
    assert.equal(parseFrozen('packages/component-contracts/registry/component-reconciliation.proposed.v1.json').approvedRuntimeCensus, null);
    for (const name of added) {
      const row = baseline.rows.find(row => row.id === name);
      for (const surface of ['react', 'vue', 'generatedConsumer']) {
        assert.equal(row.surfaces[surface].state, 'implemented-evidence-complete'); assert(row.surfaces[surface].evidence.length > 0);
        for (const ref of row.surfaces[surface].evidence) {
          const at = ref.indexOf('#'); assert(at > 0); const doc = parseFrozen(ref.slice(0, at)); const anchor = ref.slice(at + 1);
          if (anchor.startsWith('/')) {
            let value = doc;
            for (const token of anchor.slice(1).split('/')) { const key = token.replaceAll('~1', '/').replaceAll('~0', '~'); assert(value != null && Object.hasOwn(value, key)); value = value[key]; }
            assert(value != null);
          } else assert.equal([...(doc.rows ?? []), ...(doc.components ?? [])].filter(item => (item.componentId ?? item.id) === anchor).length, 1);
        }
      }
      for (const surface of ['accessibility', 'theme', 'interaction']) assert.equal(row.surfaces[surface].state, 'unverified');
    }
    const fold = parseFrozen(manifest.sources.baselineFold); for (const ref of fold.sourceHashes) reference(ref);
    assert.equal(fold.denominator, 109); assert(fold.readinessReferences.length && fold.readinessReferences.every(row => row.resolved));
    const movers = parseFrozen(manifest.sources.movers); const declared = parseFrozen(manifest.sources.moversDeclaration);
    assert.equal(movers.s187.base, lockedBase); assert.equal(movers.s187.head, implementationHead);
    assert.equal(rangeGitEvidence.base, lockedBase); assert.equal(rangeGitEvidence.head, implementationHead);
    for (const key of ['canonicalPaths', 'publicPaths']) { assert.deepEqual(movers.s187[key], rangeGitEvidence[key]); assert.deepEqual(declared.s187[key], rangeGitEvidence[key]); }
    const notice = parseFrozen(manifest.sources.noticePlan); const deliveries = parseFrozen(manifest.sources.deliveries);
    assert.deepEqual(notice.addedNucleus, added); assert.equal(notice.status, 'prepared'); assert.equal(notice.sendsExecuted, 0); assert.equal(notice.deployment, 'pending');
    assert.equal(notice.notices.length, 2); assert.equal(deliveries.length, 2);
    for (const destination of ['cmos://derek/aquex-mcp', 'cmos://derek/forge-demos']) {
      const entries = notice.notices.filter(row => row.request.targetAddress === destination); const records = deliveries.filter(row => row.targetAddress === destination);
      assert.equal(entries.length, 1); assert.equal(records.length, 1); assert.equal(digest(JSON.stringify(entries[0].request)), entries[0].requestSha256);
      assert.equal(records[0].requestSha256, entries[0].requestSha256); assert.equal(records[0].status, 'prepared'); assert.equal(records[0].messageId, null);
      assert([...added, 'Deployment: pending', 'retain-109', '/ported', '/readiness-ported', '/css-ported'].every(term => entries[0].request.body.includes(term)));
    }
    const carries = parseFrozen(manifest.sources.carries);
    assert.equal(carries.greenfieldWorkflow, 'partial'); assert.equal(carries.builderSelfCertified, false);
    for (const id of [1315, 1318, 1319, 1320, 1321, 1322, 1372, 1374, 1375, 1379, 1384]) assert(carries.rows.some(row => row.id === id && row.status === 'pending' && row.remainingWork?.trim()));
    assert.deepEqual(mission.successCriteria, original.successCriteria);
    assert.equal(accounting.baselines.sprint186Closeout.measuredHead, '740e8405fa8e094ab903a19e6e551fbe8bff2de2');
    assert(captureRows.every(row => row.exitCode === 0 && row.counts.failed === 0));
  } else if (wave2) {
    assert.equal(typeof readHistorical, 'function', 'Audit requires historical Git bytes for the locked base.');
    const base = '5aa53b3ae92cdb70b1577b56a72debf10e58a5b2';
    const typesPath = 'packages/component-contracts/src/types.ts';
    const currentTypes = frozen(typesPath).bytes.toString('utf8');
    const oldTypes = Buffer.from(readHistorical(base, typesPath)).toString('utf8');
    const array = (source, name) => {
      const declaration = source.match(new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\] as const`));
      assert(declaration, `Missing source union ${name}.`);
      return [...declaration[1].matchAll(/'([^']+)'/g)].map(match => match[1]);
    };
    const nucleus = array(currentTypes, 'NUCLEUS_COMPONENT_IDS');
    const oldNucleus = array(oldTypes, 'NUCLEUS_COMPONENT_IDS');
    const formerPorted = array(oldTypes, 'PORTED_COMPONENT_IDS');
    const added = nucleus.filter(id => !oldNucleus.includes(id) && !formerPorted.includes(id));
    assert.equal(nucleus.length, 50); assert.equal(new Set(nucleus).size, nucleus.length);
    assert.equal(formerPorted.length, 8); assert.equal(added.length, 23);
    assert([...oldNucleus, ...formerPorted].every(id => nucleus.includes(id)));
    assert(/export type GovernedComponentId = NucleusComponentId;/.test(currentTypes), 'Separate governance union remains.');
    const union = parseFrozen(manifest.sources.unionFold);
    assert.deepEqual(union.nucleusComponents, nucleus); assert.deepEqual(union.formerPortedComponents, formerPorted);
    assert.equal(union.aliasHorizon, 'sprint-187');
    assert(union.readers.length > 0 && union.readers.every(row => row.path?.trim() && row.disposition?.trim()));
    for (const framework of ['react', 'vue']) {
      const packed = parseFrozen(union.packedConsumers[framework]);
      const proof = packed.proof ?? packed.packedProof;
      assert.equal(packed.status, 'passed'); assert.equal(packed.strictCompatibilityCompile?.status, 'passed');
      assert.equal(packed.strictCompatibilityCompile.skipLibCheck, false);
      assert(formerPorted.every(id => proof.rootRuntimeIds.includes(id) && proof.aliasRuntimeIds.includes(id)));
      assert.deepEqual(proof.compatibilityProof.map(row => row.componentId).sort(), [...formerPorted].sort());
      assert(proof.compatibilityProof.every(row => row.esmSame === true && row.cjsSame === true && row.ssrSame === true), 'Packed aliases differ from actual root values or rendered markup.');
      for (const row of proof.compatibilityProof) {
        assert.equal(row.aliasMarkup, row.rootMarkup, 'Actual packed alias markup differs from root markup.');
        assert(row.rootMarkup.includes(`data-oods-component="${row.componentId}"`), 'Packed markup does not contain the claimed family.');
      }
      assert.deepEqual(proof.compatibilityResolution, { runtimeSame: true, readinessSame: true, cssSame: true });
      const rootSpecifier = `@oods/components-${framework}`;
      const resolved = proof.resolvedSpecifiers;
      assert.equal(proof.compatibilitySpecifiers.root, proof.compatibilitySpecifiers.alias, 'Runtime alias resolves to another file.');
      assert.equal(resolved[rootSpecifier], resolved[`${rootSpecifier}/ported`]);
      assert.equal(resolved[rootSpecifier], proof.compatibilitySpecifiers.root);
      assert.equal(resolved['@oods/component-styles/css'], resolved['@oods/component-styles/css-ported']);
      for (const specifier of [rootSpecifier, `${rootSpecifier}/ported`, `${rootSpecifier}/readiness-ported`, '@oods/component-styles/css', '@oods/component-styles/css-ported'])
        assert(typeof resolved[specifier] === 'string' && resolved[specifier].includes('/node_modules/@oods/'), 'Packed alias is not resolved from installed package bytes.');
    }
    const baselinePath = 'packages/component-contracts/registry/component-capability-baseline.v1.json';
    const baseline = parseFrozen(baselinePath);
    const historical = JSON.parse(Buffer.from(readHistorical(base, baselinePath)).toString('utf8'));
    const identities = document => document.rows.map(row => [row.id, row.proposedClassification, row.reconciliationState]);
    assert.equal(baseline.rows.length, 109); assert.deepEqual(identities(baseline), identities(historical));
    assert.equal(parseFrozen('packages/component-contracts/registry/component-reconciliation.proposed.v1.json').approvedRuntimeCensus, null);
    for (const component of added) for (const surface of ['react', 'vue', 'generatedConsumer']) {
      const cell = baseline.rows.find(row => row.id === component)?.surfaces?.[surface];
      assert.equal(cell?.state, 'implemented-evidence-complete'); assert(cell.evidence.length > 0);
      for (const ref of cell.evidence) {
        const separator = ref.indexOf('#'); assert(separator > 0);
        const document = parseFrozen(ref.slice(0, separator)); const anchor = ref.slice(separator + 1);
        if (anchor.startsWith('/')) {
          let observed = document;
          for (const token of anchor.slice(1).split('/')) {
            const key = token.replaceAll('~1', '/').replaceAll('~0', '~');
            assert(observed != null && Object.hasOwn(observed, key), `Baseline evidence anchor does not resolve: ${ref}`); observed = observed[key];
          }
          assert(observed != null);
        } else assert.equal([...(document.rows ?? []), ...(document.components ?? [])].filter(row => (row.componentId ?? row.id) === anchor).length, 1);
      }
    }
    const fold = parseFrozen(manifest.sources.baselineFold);
    for (const ref of fold.sourceHashes) reference(ref);
    assert(fold.readinessReferences.length > 0 && fold.readinessReferences.every(row => row.resolved === true));
    const movers = parseFrozen(manifest.sources.movers); const declared = parseFrozen(manifest.sources.moversDeclaration);
    assert.equal(movers.s186.base, base); assert.equal(movers.s186.head, implementationHead);
    assert.equal(rangeGitEvidence?.base, base); assert.equal(rangeGitEvidence.head, implementationHead);
    for (const key of ['canonicalPaths', 'publicPaths']) {
      assert.deepEqual(movers.s186[key], rangeGitEvidence[key], 'Mover output differs from independent Git diff.');
      assert.deepEqual(declared.s186[key], rangeGitEvidence[key], 'Declared movers omit or add actual changed paths.');
    }
    const plan = parseFrozen(manifest.sources.noticePlan); const deliveries = parseFrozen(manifest.sources.deliveries);
    assert.deepEqual(plan.addedNucleus, added); assert.deepEqual(plan.formerPorted, formerPorted); assert.equal(plan.aliasHorizon, 'sprint-187');
    assert.equal(plan.notices.length, 2); assert.equal(deliveries.length, 2); assert.equal(new Set(deliveries.map(row => row.messageId)).size, 2);
    for (const targetAddress of ['cmos://derek/aquex-mcp', 'cmos://derek/forge-demos']) {
      const notices = plan.notices.filter(row => row.request.targetAddress === targetAddress); assert.equal(notices.length, 1);
      const notice = notices[0]; assert.equal(digest(JSON.stringify(notice.request)), notice.requestSha256);
      assert([...added, ...formerPorted, 'Union fold', '/ported', '/readiness-ported', '/css-ported', 'Sprint 187', 'Emitter movers:', 'Deployment:'].every(term => notice.request.body.includes(term)));
      const sent = deliveries.filter(row => row.targetAddress === targetAddress); assert.equal(sent.length, 1);
      assert.equal(sent[0].status, 'sent'); assert(/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(sent[0].messageId));
      assert.equal(sent[0].requestSha256, notice.requestSha256);
    }
  }
  if (wave2 || fresh || workflow) {
    const baselineKey = browser ? 'sprint188Closeout' : workflow ? 'sprint187Closeout' : fresh ? 'sprint186Closeout' : 'sprint185Closeout';
    assert.deepEqual(Object.keys(accounting.baselines), [baselineKey]);
    const captures = { ...accounting.baselines, closeout: accounting.closeout };
    const populations = new Map();
    const normalize = value => ['pending', 'disabled', 'skipped'].includes(value) ? 'skipped' : value;
    for (const execution of accounting.executions.filter(row => Object.hasOwn(captures, row.cohort))) {
      const aggregate = JSON.parse(reference(captures[execution.cohort].aggregate).bytes.toString('utf8'));
      const raw = JSON.parse(reference(execution.rawReport).bytes.toString('utf8'));
      const files = new Map(); const counts = { total: 0, passed: 0, failed: 0, skipped: 0, todo: 0 };
      for (const result of raw.testResults) {
        const file = path.relative(aggregate.workspace, result.name).replaceAll('\\', '/');
        assert(file && !file.startsWith('../') && !files.has(file));
        const seen = new Map(); const assertions = new Map();
        for (const row of result.assertionResults ?? []) {
          const name = row.fullName ?? [...(row.ancestorTitles ?? []), row.title].join(' ');
          const occurrence = seen.get(name) ?? 0; seen.set(name, occurrence + 1);
          const state = normalize(row.status); assert(['passed', 'failed', 'skipped', 'todo'].includes(state));
          counts.total++; counts[state]++; assertions.set(`${name}#${occurrence}`, state);
        }
        files.set(file, { status: normalize(result.status), assertions });
      }
      assert.deepEqual(execution.counts, counts, 'Accounting counts differ from actual raw assertion rows.');
      populations.set(execution.id, files);
    }
    if (workflow) {
      for (const current of captureRows) {
        assert.equal(current.counts.failed, approvedTimeout && current.suite === 'root-core' ? 1 : 0); assert.equal(current.exitCode, approvedTimeout && current.suite === 'root-core' ? 1 : 0);
        const baseline = accounting.executions.find(row => row.cohort === baselineKey && row.suite === current.suite);
        const skipped = execution => [...populations.get(execution.id)].flatMap(([file, row]) => [...row.assertions].filter(([, state]) => state === 'skipped').map(([name]) => `${file}:${name}`)).sort();
        assert.deepEqual(skipped(current), skipped(baseline), 'A skipped test identity changed.');
        assert.equal(skipped(current).length, ['mcp-server', 'root-core'].includes(current.suite) ? 16 : 0);
      }
    }
    for (const comparison of accounting.comparisons) {
      const before = populations.get(comparison.beforeExecutionId); const after = populations.get(comparison.afterExecutionId);
      assert(before && after); const changed = [];
      for (const file of [...new Set([...before.keys(), ...after.keys()])].sort()) {
        const old = before.get(file); const next = after.get(file);
        if (!old || !next || old.status !== next.status || old.assertions.size !== next.assertions.size
          || [...old.assertions].some(([key, value]) => next.assertions.get(key) !== value)) changed.push(file);
      }
      assert.deepEqual(comparison.fileDeltas.map(row => row.file), changed, 'A file population delta was omitted or invented.');
      assert(comparison.fileDeltas.every(row => row.attribution?.kind && row.attribution.reason?.trim() && row.attribution.references?.length), 'A changed file lacks attribution evidence.');
    }
    assert.equal(accounting.comparisons.length, accounting.baselines[baselineKey].runs.length * 4, 'A baseline suite comparison is absent.');
    assert(accounting.closeoutFailures.every(row => row.status === (approvedTimeout ? 'approved-timeout-disclosed' : 'inherited-failure-disclosed')), 'An unexplained closeout failure was marked accounted.');
  }

  assert.equal(manifest.claimBindings.length, criterionCount); assert.equal(new Set(manifest.claimBindings.map(row => row.criterionIndex)).size, criterionCount);
  for (const [criterionIndex, claim] of ledger.claims.entries()) {
    assert.equal(claim.criterionIndex, criterionIndex); assert.equal(claim.claimId, `${missionId}-sc${String(criterionIndex + 1).padStart(2, '0')}`);
    const binding = manifest.claimBindings.find(row => row.criterionIndex === criterionIndex); assert(binding);
    const resolvedIds = [...(binding.executionIds ?? [])];
    if (binding.suiteBindings !== undefined) {
      assert.equal(criterionIndex, suiteCriterion, 'Only the four-suite criterion may use future suite selectors.');
      assert.deepEqual([...binding.suiteBindings].sort(), ['mcp-server', 'root-core', 'viz-core', 'viz-render']);
      for (const suite of binding.suiteBindings) {
        const candidates = captureRows.filter(row => row.suite === suite);
        assert.equal(candidates.length, 1, `Suite selector is absent or ambiguous: ${suite}`);
        resolvedIds.push(candidates[0].id);
      }
    }
    assert.deepEqual(claim.executionIds, resolvedIds); assert(claim.executionIds.length > 0);
    assert.equal(new Set(claim.executionIds).size, claim.executionIds.length);
    assert.deepEqual(claim.evidence.map(ref => ref.path), binding.evidencePaths);
    for (const ref of claim.evidence) reference(ref);
    const required = requiredSourceKeys[criterionIndex].map(key => manifest.sources[key]);
    assert(required.every(file => binding.evidencePaths.includes(file)), 'Claim omits required frozen source.');
    const bound = claim.executionIds.map(id => { const row = executions.get(id); assert(row, 'Claim cites an unexecuted ID.'); return row; });
    if (criterionIndex !== suiteCriterion) {
      assert(bound.some(row => row.exitCode === 0 && row.evidenceKind === 'retained-command'
        && row.logs.some(ref => binding.evidencePaths.includes(ref.path))
        && [...row.inputs, ...(row.outputs ?? [])].some(ref => required.includes(ref.path))), 'Unrelated or failed execution cannot prove this claim.');
    } else {
      assert(capture.every(id => claim.executionIds.includes(id)), 'Four-suite claim must bind all four actual capture executions.');
      assert(bound.some(row => row.evidenceKind === 'suite-receipt' && binding.evidencePaths.includes(row.log.path)), 'Four-suite claim lacks executed evidence.');
    }
    assert.equal(claim.status, 'passed', 'Claim remains unproven.'); assert.deepEqual(claim.unproven, []);
    assert(claim.observations.length > 0 && claim.observations.every(row => row.passed === true), 'Claim ignores an unmet measured predicate.');
  }
  let checkedSprintCriteria = criterionCount;
  if (workflow) {
    const history = parseFrozen(manifest.sources.missionHistory);
    const past = history.missions.filter(row => row.id !== missionId);
    const expected = past.flatMap(row => row.successCriteria.map((criterion, criterionIndex) => ({ missionId: row.id, criterion, criterionIndex })));
    assert.equal(expected.length, browser ? 30 : 33); assert.equal(ledger.priorClaims.length, expected.length);
    assert.equal(ledger.boundSprintCriteria, browser ? 36 : 39); assert.equal(handoff.boundSprintCriteria, browser ? 36 : 39);
    const retained = parseFrozen(manifest.sources.historicalEvidence);
    assert.equal(retained.status, 'passed'); assert.equal(retained.boundCriteria, browser ? 30 : 33); assert.equal(retained.replayedExternalActions, 0);
    for (const ref of retained.references) {
      reference(ref);
      if (ref.missionHead) assert.equal(digest(Buffer.from(readHistorical(ref.missionHead, ref.path))), bare(ref.sha256), 'Prior execution evidence changed since its mission close.');
    }
    const evidencePlan = parseFrozen(`artifacts/product-reality/${sprintId}/m06/retained-evidence-plan.json`);
    assert.equal(evidencePlan.bindings.length, browser ? 30 : 33);
    const sends = parseFrozen(`artifacts/product-reality/${sprintId}/m01/reconnect-sent.json`);
    assert.deepEqual(sends.map(row => row.targetAddress).sort(), ['cmos://derek/aquex-mcp', 'cmos://derek/forge-demos']);
    assert.equal(new Set(sends.map(row => row.result.structuredContent.data.messageId)).size, 2);
    assert(sends.every(row => row.result.structuredContent.success));
    if (!browser) for (const [mission, count] of [['m04', 9], ['m05', 13]]) {
      const parity = parseFrozen(`artifacts/product-reality/sprint-188/${mission}/parity.json`);
      assert.deepEqual(parity.allowlist, []); assert.equal(parity.receipts.length, count);
      assert(parity.receipts.every(row => row.differences.length === 0));
      const mutations = parseFrozen(`artifacts/product-reality/sprint-188/${mission}/export-bites/mutation-manifest.json`);
      assert.equal(mutations.mutants.length, mission === 'm04' ? 6 : 10);
      assert(mutations.mutants.every(row => row.status === 'passed' && row.restoredByteIdentically && row.sourceSha256Before !== row.sourceSha256Deleted));
    }
    for (const row of expected) {
      const claim = ledger.priorClaims.find(claim => claim.missionId === row.missionId && claim.criterionIndex === row.criterionIndex);
      assert(claim); assert.equal(claim.criterion, row.criterion); assert.equal(claim.status, 'evidence-bound');
      const binding = manifest.priorClaimBindings.find(binding => binding.missionId === row.missionId && binding.criterionIndex === row.criterionIndex);
      assert.deepEqual(claim.executionIds, binding.executionIds); assert.deepEqual(claim.evidence.map(ref => ref.path), binding.evidencePaths);
      for (const ref of claim.evidence) reference(ref);
      assert(binding.evidencePaths.includes(manifest.sources.historicalEvidence));
      const planned = evidencePlan.bindings.find(binding => binding.missionId === row.missionId && binding.criterionIndex === row.criterionIndex);
      assert(planned && planned.evidencePaths.every(file => binding.evidencePaths.includes(file)), 'Historical criterion dropped its retained execution evidence.');
      assert(claim.executionIds.some(id => { const execution = executions.get(id); return execution && execution.exitCode === 0
        && execution.inputs.some(ref => binding.evidencePaths.includes(ref.path)) && execution.logs.some(ref => binding.evidencePaths.includes(ref.path)); }));
    }
    checkedSprintCriteria += expected.length;
  }
  assert.deepEqual(ledger.headline, { total: criterionCount, proven: criterionCount, unproven: 0 }); assert.deepEqual(ledger.unproven, []);
  assert.equal(ledger.status, 'ready-for-independent-review');
  return { schemaVersion: '1.0.0', status: 'passed', executionHead, reviewHead,
    ledgerSha256: digest(outputBytes.get('claim-ledger')), accountingSha256: digest(outputBytes.get('suite-accounting')),
    checkedCriteria: checkedSprintCriteria, checkedExecutions: executions.size, checkedFrozenPaths: checked.size, gitEvidence,
    publicHeadEquivalence: implementationHead === executionHead ? { implementationHead, executionHead, identicalHead: true } : publicGitEvidence,
    auditedInputs: [...checked.values()].map(({ path: file, sha256 }) => ({ path: file, sha256 })).sort((a, b) => a.path.localeCompare(b.path)),
    builderSelfCertified: false, separateReviewRequired: true,
    limitation: 'This audit verifies the actual build evidence graph and does not certify the sprint. Handoff flags are checked; handoff bytes are excluded because the handoff subsequently binds this audit.' };
}

/** The root project repeats MCP tests; compare identities, not summed skips. */
export function auditSprint190SkippedIdentities(current, baseline) {
  const collect = rows => {
    assert.deepEqual(rows.map(row => row.suite).sort(), ['mcp-server','root-core','viz-core','viz-render']);
    return Object.fromEntries(rows.map(({suite, workspace, report, platform}) => {
      const identities = [];
      for (const file of report.testResults) {
        const canonical = value => platform === 'darwin' ? value.replace(/^\/private\/tmp(?=\/)/, '/tmp') : value;
        const relative = path.relative(canonical(workspace), canonical(file.name)).replaceAll('\\', '/');
        assert(relative && !relative.startsWith('../') && !path.isAbsolute(relative));
        const occurrences = new Map();
        for (const test of file.assertionResults ?? []) {
          const name = test.fullName ?? [...(test.ancestorTitles ?? []), test.title].join(' ');
          const occurrence = occurrences.get(name) ?? 0; occurrences.set(name, occurrence + 1);
          if (['pending','disabled','skipped'].includes(test.status)) identities.push(`${relative}:${name}#${occurrence}`);
        }
      }
      assert.equal(identities.length, report.numPendingTests);
      return [suite, identities.sort()];
    }));
  };
  const observed = collect(current), expected = collect(baseline);
  assert.deepEqual(observed, expected, 'Skipped identities changed from Sprint 189.');
  const identities = [...new Set(Object.values(observed).flat())].sort();
  assert.equal(identities.length, 16);
  return { uniqueIdentities: identities.length, skippedExecutions: Object.values(observed).flat().length, identities };
}

/** Independent s190 audit: read actual output files and re-derive from frozen inputs. */
export function auditSprint190Closeout({ executionHead, reviewHead, readOutput, readFrozen, readHistorical, publicGitEvidence, rangeGitEvidence, manifestPath }) {
  const paydown = manifestPath.startsWith('artifacts/product-reality/sprint-191/m05/');
  const count = paydown ? 33 : 37;
  const folder = paydown ? 'artifacts/product-reality/sprint-191/m05/closeout' : 'artifacts/product-reality/sprint-190/m06/closeout';
  const manifest = JSON.parse(readFrozen(manifestPath));
  const ledger = JSON.parse(readOutput(`${folder}/claim-ledger.json`));
  const handoff = JSON.parse(readOutput(`${folder}/review-handoff.json`));
  const accounting = JSON.parse(readOutput(`${folder}/suite-accounting.json`));
  for (const out of [ledger, handoff]) { assert.equal(out.executionHead, executionHead); assert.equal(out.reviewHead, reviewHead); assert.equal(out.builderSelfCertified, false); assert.equal(out.separateReviewRequired, true); assert.equal(out.sprintStatus, 'Active'); }
  const checked = new Set();
  const verifyRef = ref => { assert(ref.path && !path.isAbsolute(ref.path) && !ref.path.split('/').includes('..')); const bytes = readFrozen(ref.path); assert.equal(digest(bytes), bare(ref.sha256), ref.path); checked.add(ref.path); return bytes; };
  for (const ref of [...ledger.references, ...accounting.references]) verifyRef(ref);
  const source = key => JSON.parse(readFrozen(manifest.sources[key]));
  const criteria = source('missions').missions.flatMap(mission => mission.successCriteria.map((criterion,index) => ({missionId:mission.id,criterionIndex:index+1,criterion})));
  assert.equal(criteria.length, count); assert.equal(ledger.claims.length, count);
  const ids = new Set(ledger.executions.map(row => row.id)); assert.equal(ids.size, ledger.executions.length);
  for (let i=0;i<criteria.length;i++) {
    const claim = ledger.claims[i]; for (const key of ['missionId','criterionIndex','criterion']) assert.equal(claim[key], criteria[i][key]);
    assert.equal(claim.status, 'proven'); assert(claim.executionIds.length && claim.evidence.length);
    claim.executionIds.forEach(id => assert(ids.has(id))); claim.evidence.forEach(verifyRef);
  }
  for (const execution of ledger.executions) for (const ref of execution.evidence) {
    const bytes = verifyRef(ref); if (execution.historical) assert(bytes.equals(readHistorical(execution.head,ref.path)));
  }
  assert(publicGitEvidence.ancestor); assert.deepEqual(publicGitEvidence.changedPaths, []);
  assert.deepEqual(publicGitEvidence.scope, paydown ? publicScope191 : publicScope190);
  const movers = source('movers');
  assert.equal(rangeGitEvidence.head, manifest.implementationHead);
  for (const key of ['canonicalPaths','publicPaths']) assert.deepEqual(movers[paydown ? 's191' : 's190'][key], rangeGitEvidence[key]);
  const registry = source('registry'); assert.deepEqual(registry,source('vizCensus')); assert.equal(registry.length,13);
  assert.equal(registry.filter(row=>row.publicSvg && row.themes.light && row.themes.dark && !row.themes.hc).length,13);
  assert.equal(registry.filter(row=>row.dashboardDrawn===true).length,11);
  assert.equal(registry.filter(row=>row.certifyCoverage==='certified').length,5);
  assert.deepEqual(registry.filter(row=>row.chartInApp==='placed').map(row=>row.chartType),['area']);
  if (paydown) {
    assert.equal(registry.filter(row => row.contrastPassed.length === 2).length, 9);
    assert.equal(registry.filter(row => row.contrastPassed.length === 0).length, 4);
    for (const row of registry) assert.deepEqual(row.contrastPassed, row.contrastMeasured.length ? ['light','dark'] : []);
  }
  const observed = source('vizObservations');
  assert.equal(observed.observations.flatMap(row=>row.scopes).length,52);
  for(const row of observed.observations) for(const scope of row.scopes) {
    assert.equal(scope.svgHash,scope.renderHash); assert.equal(scope.contrast.theme,scope.theme); assert.equal(scope.contrast.brand,scope.brand);
    if (paydown) assert.notEqual(scope.contrast.verdict,'fail');
    if (scope.coverage==='uncertified') assert.equal(scope.conformant,null);
    if (!['pass','fail'].includes(scope.contrast.verdict)) assert.equal(scope.contrast.measured,false);
  }
  const matrix=source('matrix'); assert.equal(matrix.head,manifest.implementationHead); assert.equal(matrix.table.length,52);
  for(const row of matrix.table) { assert.equal(row.svgHash,row.secondHash); verifyRef({path:`${path.posix.dirname(manifest.sources.matrix)}/${row.file}`,sha256:row.svgHash}); }
  const census=source('componentCensus'); assert.equal(census.greenSchemas,66); assert.equal(census.greenCells,132); assert([75,77].includes(census.greenTotalSchemas)); assert.equal(census.greenTotalSchemas,census.allRows.filter(row=>row.green).length); assert.equal(census.totalSchemas,77); assert(census.workflow.green);
  for(const row of census.allRows.filter(row=>!row.green)) assert(row.cells.every(cell=>cell.errors.some(error=>error.code==='OODS-N016')));
  if (paydown) {
    assert.equal(census.greenTotalSchemas,77); assert.equal(census.greenTotalCells,154);
    const movement = source('schemaMovement'); assert.deepEqual(movement.statusChanges,['Organization/workflow','User/workflow']); assert.deepEqual(movement.unattributedChanges,[]); assert.equal(movement.workflowCells,6);
  } else assert.deepEqual(source('schemaMovement').changedSchemas,['Subscription/detail']);
  assert.equal(source('originalStore').reachable,15); assert.equal(source('successorStore').reachable,16);
  assert.equal(source('compatibility').liveStoreFiles,17); assert.equal(source('compatibility').changedLiveFiles,0);
  const flows=source('flows'); assert.equal(flows.sourceHead,manifest.implementationHead); assert.equal(flows.stateObservations.length,paydown ? 96 : 32);
  for(const cell of flows.cells) { assert.equal(cell.gates.length,8); assert.equal(cell.flow.length,paydown && cell.object !== 'Subscription' ? 6 : 9); assert([...cell.gates,...cell.flow].every(row=>row.status==='passed')); }
  assert.equal(flows.screenshots.length,paydown ? 84 : 36); for(const shot of flows.screenshots) verifyRef({path:`${path.posix.dirname(manifest.sources.flows)}/${shot.file}`,sha256:shot.sha256});
  if (paydown) {
    const browser = source('browserReceipts'); assert.equal(browser.sourceHead,manifest.implementationHead); assert.equal(browser.receipts.length,34);
    browser.references.forEach(verifyRef);
    for (const row of browser.receipts) {
      const receipt=JSON.parse(verifyRef(row)); assert.equal(receipt.sourceHead,row.sourceHead); assert.equal(row.sourceHead,manifest.implementationHead);
      assert.deepEqual(receipt.errors,[]); assert.deepEqual(receipt.views.map(view=>view.width),[390,820,1440]);
      for (const view of receipt.views) { assert.deepEqual(view.measurements.overflow,[]); verifyRef({path:`${path.posix.dirname(row.path)}/${view.screenshot}`,sha256:view.screenshotHash}); }
    }
    const runtime=source('runtime'); assert.equal(runtime.head,manifest.implementationHead); assert.equal(runtime.manifest.commit,manifest.implementationHead); assert.equal(runtime.manifest.dirty,false);
    assert.equal(runtime.manifest.archivePacking.determinismCertified,true); assert.equal(runtime.archiveSha256,runtime.secondArchiveSha256); assert.equal(runtime.e2e.exitCode,0);
    runtime.references.forEach(verifyRef);
    const repin=source('repin'); assert.equal(repin.implementationHead,manifest.implementationHead); assert.equal(repin.archiveSha256,runtime.archiveSha256); assert.equal(repin.status,'prepared-unsent'); assert.deepEqual(repin.targets,['aquex-mcp','forge-demos','shopify-forge']);
  } else {
  const browser=source('browserReceipts'); assert.equal(browser.receipts.length,4);
  for(const ref of browser.receipts) { const receipt=JSON.parse(verifyRef(ref)); assert.equal(receipt.sourceHead,manifest.implementationHead); assert.deepEqual(receipt.errors,[]); assert.equal(receipt.views.length,3); for(const view of receipt.views) { assert(view.accessibility.includes('graphics-object')); assert(view.accessibility.includes('img "Payment amounts"')); assert.deepEqual(view.measurements.overflow,[]); verifyRef({path:`${path.posix.dirname(ref.path)}/${view.screenshot}`,sha256:view.screenshotHash}); } }
  }
  assert.equal(accounting.status,'passed'); assert.deepEqual(accounting.validationIssues,[]); assert.deepEqual(accounting.unattributedDeltas,[]);
  const runs=accounting.executions.filter(row=>row.cohort==='closeout'); assert.equal(runs.length,4);
  assert.deepEqual(runs.map(row=>row.suite).sort(),['mcp-server','root-core','viz-core','viz-render']);
  const timeout=accounting.timeoutAcceptance;
  if(timeout) {
    assert.equal(timeout.decisionId,1833); assert.equal(accounting.closeoutFailures.length,1);
    const failure=accounting.closeoutFailures[0], message=[...failure.messages,failure.failureEvidence?.cause??''].join('\n');
    assert(/(?:Test|Hook) timed out in \d+ms/.test(message) && !message.includes('AssertionError')); assert.equal(failure.status,'isolated-timeout-disclosed');
    const retry=timeout.rerun; assert.equal(retry.executionHead,executionHead); assert.equal(retry.attempts,1); assert.equal(retry.exitCode,0); assert.equal(retry.testKey,failure.testKey); assert.equal(retry.file,failure.file);
    assert(retry.argv.includes('-t'));
    const raw=JSON.parse(verifyRef(retry.rawReport)); verifyRef(retry.log); assert(raw.success); assert.equal(raw.numFailedTests,0); assert.equal(raw.numPassedTests,1);
    const passed=raw.testResults.flatMap(file=>file.assertionResults??[]).filter(row=>row.status==='passed'); assert.equal(`${passed[0].fullName}#0`,failure.testKey);
  } else assert.deepEqual(accounting.closeoutFailures,[]);
  for(const run of runs) { const raw=JSON.parse(verifyRef(run.rawReport)); const failed=timeout?.executionId===run.id?1:0; assert.equal(run.measuredHead,executionHead); assert.equal(run.exitCode,failed); assert.equal(raw.success,!failed); assert.equal(raw.numFailedTests,failed); assert.equal(raw.numPassedTests,run.counts.passed); assert.equal(raw.numPendingTests,run.counts.skipped); }
  const skipInputs = (cohort, capture) => {
    const aggregate = JSON.parse(verifyRef(capture.aggregate));
    return accounting.executions.filter(row => row.cohort === cohort).map(row => ({
      suite: row.suite, workspace: aggregate.workspace, report: JSON.parse(verifyRef(row.rawReport)),
    }));
  };
  const skipped = auditSprint190SkippedIdentities(skipInputs('closeout', accounting.closeout),
    skipInputs(paydown ? 'sprint190Closeout' : 'sprint189Closeout', accounting.baselines[paydown ? 'sprint190Closeout' : 'sprint189Closeout']));
  if (!paydown) {
  const m02 = JSON.parse(readFrozen('artifacts/product-reality/sprint-190/m02/golden-attribution.json'));
  assert.deepEqual(accounting.goldenHistory.m02, { ...m02,
    beforeSha256: digest(readHistorical(m02.base, m02.file)),
    afterSha256: digest(readHistorical(accounting.goldenAttribution.beforeHead, m02.file)) });
  assert.deepEqual(accounting.goldenHistory.m03.files, accounting.goldenAttribution.files);
  verifyRef(accounting.goldenHistory.m03.tokenDifferences);
  for(const row of accounting.goldenAttribution.files) verifyRef({path:row.file,sha256:row.afterSha256});
  } else for (const row of accounting.goldenAttribution.files) {
    verifyRef({path:row.file,sha256:row.afterSha256}); assert.equal(digest(readHistorical(accounting.goldenAttribution.beforeHead,row.file)),row.beforeSha256); assert(row.reason.trim());
  }
  const notice=source('noticePlan'); assert.equal(notice.sent,false); assert.equal(notice.implementationHead,manifest.implementationHead); assert.deepEqual(notice.targets,paydown ? ['cmos-dashboard','forge-demos','aquex-mcp'] : ['cmos-dashboard','dashboard-demos','forge-demos','aquex-mcp']);
  const ci=source('ci'); assert.equal(ci.baseRefName,'OODS-pro'); for(const job of (paydown ? ['pkg-compat','viz-determinism','coverage','portable-runtime'] : ['pkg-compat','viz-determinism','coverage'])) assert(ci.jobs.some(row=>row.name===job && row.runId && row.conclusion==='success'));
  assert.equal(source('prose').exitCode,0);
  return {status:'passed',skipped,checkedCriteria:count,checkedExecutions:ledger.executions.length,checkedFrozenPaths:checked.size,executionHead,reviewHead,builderSelfCertified:false,separateReviewRequired:true};
}

// Independently check decision 1890 without trusting the producer's allowlist or booleans.
export function auditSprint192Derivation({ approval, changes, executionHead, reviewHead, readHistorical }) {
  const expected = ['scripts/product-reality/s185-audit-closeout.mjs',
    'scripts/product-reality/s185-closeout.mjs', 'scripts/product-reality/s185-suite-accounting.mjs'];
  assert.equal(approval.approved, true); assert.equal(approval.decisionId, 1890);
  assert.equal(approval.userApproval, 'yes, approved. proceed'); assert.equal(approval.missionId, 's192-m07');
  assert.equal(executionHead, 'fb56910b2364982a4913a5229798ba06f324370d'); assert.equal(approval.executionHead, executionHead);
  assert.deepEqual(approval.files.map(row => row.path).sort(), expected);
  const modified = changes.filter(row => row.status !== 'A');
  assert.deepEqual(modified.map(row => row.path).sort(), expected);
  for (const row of modified) assert.equal(row.status, 'M');
  for (const row of changes.filter(row => row.status === 'A')) {
    assert(/^artifacts\/product-reality\/sprint-192\/m07\/(?:(?:five-suite-closeout[^/]*|closeout|ci)\/.*\.(?:json|log|md)|README\.md)$/.test(row.path), row.path);
  }
  for (const row of approval.files) {
    assert.match(row.beforeSha256, /^[a-f0-9]{64}$/); assert.match(row.afterSha256, /^[a-f0-9]{64}$/);
    assert.equal(digest(readHistorical(executionHead, row.path)), row.beforeSha256, row.path);
    assert.equal(digest(readHistorical(reviewHead, row.path)), row.afterSha256, row.path);
  }
  return { decisionId: 1890, derivationFiles: expected };
}

/** Read actual Sprint 192 output independently; never invoke the producer here. */
export function auditSprint192Closeout({ executionHead, reviewHead, readOutput, readFrozen, readHistorical, gitEvidence, publicGitEvidence, rangeGitEvidence, manifestPath }) {
  const base = 'artifacts/product-reality/sprint-192/m07';
  const manifest = JSON.parse(readFrozen(manifestPath));
  const ledger = JSON.parse(readOutput(`${base}/closeout/claim-ledger.json`));
  const handoff = JSON.parse(readOutput(`${base}/closeout/review-handoff.json`));
  const accounting = JSON.parse(readOutput(`${base}/closeout/suite-accounting.json`));
  const checked = new Set();
  const verify = ref => { assert(ref.path && !path.isAbsolute(ref.path) && !ref.path.split('/').includes('..')); const bytes = readFrozen(ref.path); assert.equal(digest(bytes), bare(ref.sha256), ref.path); checked.add(ref.path); return bytes; };
  const source = key => JSON.parse(readFrozen(manifest.sources[key]));
  for (const result of [ledger, handoff]) {
    assert.equal(result.builderSelfCertified, false); assert.equal(result.separateReviewRequired, true); assert.equal(result.sprintStatus, 'Active');
    assert.equal(result.executionHead, executionHead); assert.equal(result.reviewHead, reviewHead); assert.equal(result.implementationHead, manifest.implementationHead);
  }
  assert.equal(handoff.evidenceCommit, reviewHead); assert.equal(handoff.exportVersion, '2026-09-10');
  assert.equal(gitEvidence.ancestor, true);
  assert.equal(accounting.executionHead, executionHead); assert.equal(accounting.reviewHead, reviewHead);
  assert.equal(accounting.headRelation.ancestor, true);
  assert.deepEqual(accounting.headRelation.changedEvidencePaths, gitEvidence.changes);
  assert.equal(accounting.headRelation.executableInputsUnchanged, false);
  assert.equal(accounting.headRelation.capturedRuntimeAndTestSourcesUnchanged, true);
  assert.equal(accounting.headRelation.postCaptureDerivationOnly, true);
  assert.equal(accounting.headRelation.approval.path, manifest.accounting.postCaptureDerivation);
  const derivation = auditSprint192Derivation({ approval: JSON.parse(verify(accounting.headRelation.approval)),
    changes: gitEvidence.changes, executionHead, reviewHead, readHistorical });
  assert.equal(accounting.headRelation.decisionId, derivation.decisionId);
  assert.deepEqual(accounting.headRelation.derivationFiles, derivation.derivationFiles);

  for (const ref of [...ledger.references, ...accounting.references]) verify(ref);
  const expected = source('missions').missions.flatMap(mission => mission.successCriteria.map((criterion, index) => ({ missionId: mission.id, criterionIndex: index + 1, criterion })));
  assert.equal(expected.length, 43); assert.equal(ledger.claims.length, 43);
  const executions = new Map(ledger.executions.map(row => [row.id, row])); assert.equal(executions.size, ledger.executions.length);
  for (let i = 0; i < expected.length; i++) {
    const claim = ledger.claims[i]; for (const key of ['missionId', 'criterionIndex', 'criterion']) assert.equal(claim[key], expected[i][key]);
    assert.equal(claim.status, 'proven'); assert(claim.executionIds.length && claim.evidence.length);
    for (const ref of claim.evidence) { verify(ref); assert(claim.executionIds.some(id => executions.get(id)?.evidence.some(row => row.path === ref.path && row.sha256 === ref.sha256))); }
  }
  for (const execution of executions.values()) for (const ref of execution.evidence) { const bytes = verify(ref); if (execution.historical) assert(bytes.equals(readHistorical(execution.head, ref.path))); }
  assert(publicGitEvidence.ancestor); assert.deepEqual(publicGitEvidence.changedPaths, []); assert.deepEqual(publicGitEvidence.scope, publicScope192);
  const movers = source('movers'); assert.equal(rangeGitEvidence.head, manifest.implementationHead);
  for (const key of ['canonicalPaths', 'publicPaths']) assert.deepEqual(movers.s192[key], rangeGitEvidence[key]);
  const capability = source('componentLedger'), exported = source('componentExport'); assert.equal(capability.rows.length, 109); assert.equal(capability.approvedRuntimeCensus, null);
  const count = (surface, state) => capability.rows.filter(row => row.surfaces[surface].state === state).length;
  assert.equal(count('react', 'implemented-evidence-complete'), 75); assert.equal(count('vue', 'implemented-evidence-complete'), 75); assert.equal(count('html', 'mapped'), 109);
  assert.equal(count('accessibility', 'verified'), 75); assert.equal(count('theme', 'verified'), 75); assert.equal(count('interaction', 'verified'), 24); assert.equal(count('interaction', 'not-applicable'), 51);
  for (const row of capability.rows) {
    assert.deepEqual(row.surfaces, exported.components.find(entry => entry.id === row.id).productReality.surfaces);
    for (const surface of ['accessibility', 'theme', 'interaction']) { assert.notEqual(row.surfaces[surface].state, 'unverified'); if (['not-applicable', 'unavailable'].includes(row.surfaces[surface].state)) assert(row.surfaces[surface].reason); }
  }
  const proof = source('componentProof'); assert.equal(proof.head, manifest.implementationHead); proof.references.forEach(verify);
  for (const target of ['react', 'vue']) {
    const report = source(`${target}Measured`); assert.equal(report.success, true); assert.equal(report.numPendingTests, 0); assert.equal(report.numFailedTests, 0);
    const axe = report.testResults.filter(row => /accessibility\.spec\./.test(row.name)).flatMap(row => row.assertionResults).filter(row => /shared scenario/.test(row.fullName)); assert.equal(axe.length, 75); assert(axe.every(row => row.status === 'passed'));
    const themes = source(`${target}Theme`); assert.equal(themes.cells.length, 6); assert.equal(themes.failed, 0); assert.equal(themes.skipped, 0);
    for (const cell of themes.cells) { assert.equal(cell.status, 'passed'); assert.equal(new Set(cell.rows.map(row => row.componentId)).size, 75); verify({ path: `${path.posix.dirname(manifest.sources[`${target}Theme`])}/${cell.screenshot}`, sha256: cell.screenshotSha256 }); }
  }
  assert.equal(source('tokens').head, manifest.implementationHead); for (const row of source('tokens').rows) { assert.equal(row.counts.unresolvedColourRoles, 0); assert.equal(row.counts.reachableSystemColourFallbacks, 0); }
  const composition = source('componentCensus'); assert.equal(composition.head, manifest.implementationHead); assert.equal(composition.allRows.length, 77); assert.equal(composition.greenTotalCells, 154); assert(composition.allRows.every(row => row.green && row.cells.every(cell => cell.errors.length === 0)));
  const movement = source('schemaMovement'); assert.equal(movement.changedSchemas, 14); assert.equal(movement.unchangedSchemas, 63);
  assert.equal(source('originalStore').reachable, 15); assert.equal(source('successorStore').reachable, 16); assert.equal(source('compatibility').changedLiveFiles, 0); assert.equal(source('compatibility').liveStoreFiles, 17);
  const flows = source('flows'); assert.equal(flows.sourceHead, manifest.implementationHead); assert.equal(flows.cells.length, 6); for (const cell of flows.cells) { assert.equal(cell.gates.length, 8); assert(cell.gates.every(row => row.status === 'passed')); assert(cell.flow.every(row => row.status === 'passed')); }
  for (const shot of flows.screenshots) verify({ path: `${base}/${shot.file}`, sha256: shot.sha256 });
  const registry = source('registry'); assert.deepEqual(registry, source('vizCensus')); assert.equal(registry.length, 13); assert.equal(registry.filter(row => row.dashboardDrawn === true).length, 11);
  const matrix = source('matrix'); assert.equal(matrix.table.length, 52); assert.deepEqual(matrix.table.map(row => row.svgHash), source('previousMatrix').table.map(row => row.svgHash));
  for (const row of matrix.table) verify({ path: `${base}/matrix/${row.file}`, sha256: row.svgHash });
  assert.equal(accounting.status, 'passed'); assert.deepEqual(accounting.validationIssues, []); assert.deepEqual(accounting.unattributedDeltas, []);
  const runs = accounting.executions.filter(row => row.cohort === 'closeout'); assert.equal(runs.length, 5); assert.deepEqual(runs.map(row => row.suite).sort(), ['component-packages', 'mcp-server', 'root-core', 'viz-core', 'viz-render']);
  for (const run of runs) {
    const raw = JSON.parse(verify(run.rawReport)); assert.equal(run.measuredHead, executionHead); const failed = accounting.timeoutAcceptance?.executionId === run.id ? 1 : 0;
    assert.equal(raw.numFailedTests, failed); assert.equal(raw.success, !failed); assert.equal(run.exitCode, failed); assert.equal(raw.numPassedTests, run.counts.passed); assert.equal(raw.numPendingTests, run.counts.skipped);
  }
  if (accounting.timeoutAcceptance) {
    const timeout = accounting.timeoutAcceptance; assert.equal(timeout.decisionId, 1833); assert.equal(accounting.closeoutFailures.length, 1);
    const failure = accounting.closeoutFailures[0]; assert(failure.messages.join('\n').match(/(?:Test|Hook) timed out in \d+ms/)); assert(!failure.messages.join('\n').includes('AssertionError'));
    assert.equal(timeout.rerun.attempts, 1); assert.equal(timeout.rerun.exitCode, 0); assert.equal(timeout.rerun.executionHead, executionHead);
    const raw = JSON.parse(verify(timeout.rerun.rawReport)); verify(timeout.rerun.log); assert.equal(raw.numFailedTests, 0); assert.equal(raw.numPassedTests, 1);
  } else assert.deepEqual(accounting.closeoutFailures, []);
  const inputs = (cohort, capture) => { const aggregate = JSON.parse(verify(capture.aggregate)); return accounting.executions.filter(row => row.cohort === cohort && row.suite !== 'component-packages').map(row => ({ suite: row.suite, workspace: aggregate.workspace, platform: aggregate.host.platform, report: JSON.parse(verify(row.rawReport)) })); };
  const skipped = auditSprint190SkippedIdentities(inputs('closeout', accounting.closeout), inputs('sprint191Closeout', accounting.baselines.sprint191Closeout));
  assert.equal(runs.find(row => row.suite === 'component-packages').counts.skipped, 0);
  for (const row of accounting.goldenAttribution.files) { verify({ path: row.file, sha256: row.afterSha256 }); assert.equal(digest(readHistorical(accounting.goldenAttribution.beforeHead, row.file)), row.beforeSha256); assert(row.reason.trim()); }
  const notice = source('noticePlan'); assert.equal(notice.sent, false); assert.equal(notice.sendsExecuted, 0); assert.deepEqual(notice.targets, ['cmos-dashboard', 'forge-demos', 'aquex-mcp']); assert(notice.notices.every(row => row.request.body.includes('2026-09-10') && row.request.body.includes('catalog_list productReality.surfaces')));
  const ci = source('ci'); assert.equal(ci.baseRefName, 'OODS-pro'); for (const name of ['coverage', 'component-packages', 'a11y-contract', 'portable-runtime']) assert(ci.jobs.some(row => row.name === name && row.runId && row.conclusion === 'success'));
  assert.equal(source('prose').exitCode, 0);
  return { status: 'passed', skipped, derivation, gitEvidence, checkedCriteria: 43, checkedExecutions: executions.size, checkedFrozenPaths: checked.size, executionHead, reviewHead, builderSelfCertified: false, separateReviewRequired: true };
}

export function auditSprint193CaptureLimit({ accounting, manifest, verify }) {
  // Independently enforce the named one-time third capture, including its frozen receipt.
  const captureExtension = accounting.captureExtensionAcceptance;
  assert.equal(accounting.closeout.runs.length, 1);
  if (captureExtension) {
    const extension = JSON.parse(verify(captureExtension.receipt));
    assert.equal(captureExtension.receipt.path, manifest.accounting.captureExtension);
    assert.equal(extension.project, 'OODS-Forge'); assert.equal(extension.sprintId, 'sprint-193');
    assert.equal(extension.missionId, 's193-m07'); assert.equal(extension.decisionId, 1911);
    assert.equal(extension.sessionId, 'PS-2026-09-11-002');
    assert.equal(extension.allowedTotalCaptures, 3); assert.equal(extension.stopAfterThisCapture, true);
    assert.equal(extension.builderSelfCertified, false);
    const priorHeads = ['0dde152832cc63c6c768e5932ec995e2d8c48219', '39e51fb249e327130548564978752a134c734d24'];
    assert.deepEqual(extension.priorExecutionHeads, priorHeads);
    assert.deepEqual(accounting.closeoutAttempts.map(attempt => attempt.measuredHead), priorHeads);
    assert.deepEqual(captureExtension, { decisionId: 1911, totalCaptures: 3, priorExecutionHeads: priorHeads, stopAfterThisCapture: true, receipt: captureExtension.receipt });
  } else { assert(!manifest.accounting.captureExtension); assert(accounting.closeoutAttempts.length <= 1); }
  for (const [index, attempt] of accounting.closeoutAttempts.entries()) {
    const aggregate = JSON.parse(verify(attempt.aggregate));
    assert.equal(aggregate.measuredHead, attempt.measuredHead); assert.equal(aggregate.runs.length, 1); assert.equal(aggregate.suiteSelection, 'all');
    const retained = accounting.executions.filter(row => row.cohort === `closeout-attempt-${index + 1}`);
    assert.deepEqual(retained.map(row => row.suite).sort(), ['component-packages', 'mcp-server', 'root-core', 'viz-core', 'viz-render']);
    assert(retained.some(row => JSON.parse(verify(row.rawReport)).testResults.some(file => (file.assertionResults ?? []).some(test => (test.failureMessages ?? []).some(message => message.includes('AssertionError'))))));
  }
}

export function auditSprint193Closeout({ executionHead, reviewHead, readOutput, readFrozen, readHistorical, gitEvidence, publicGitEvidence, rangeGitEvidence, manifestPath }) {
  const base = 'artifacts/product-reality/sprint-193/m07';
  const manifest = JSON.parse(readFrozen(manifestPath));
  const ledger = JSON.parse(readOutput(`${base}/closeout/claim-ledger.json`));
  const handoff = JSON.parse(readOutput(`${base}/closeout/review-handoff.json`));
  const accounting = JSON.parse(readOutput(`${base}/closeout/suite-accounting.json`));
  const checked = new Set();
  const verify = ref => { assert(ref.path && !path.isAbsolute(ref.path) && !ref.path.split('/').includes('..')); const bytes = readFrozen(ref.path); assert.equal(digest(bytes), bare(ref.sha256), ref.path); checked.add(ref.path); return bytes; };
  const source = key => JSON.parse(readFrozen(manifest.sources[key]));
  for (const result of [ledger, handoff]) {
    assert.equal(result.builderSelfCertified, false); assert.equal(result.separateReviewRequired, true); assert.equal(result.sprintStatus, 'Active');
    assert.equal(result.executionHead, executionHead); assert.equal(result.reviewHead, reviewHead); assert.equal(result.implementationHead, manifest.implementationHead);
  }
  assert.equal(handoff.evidenceCommit, reviewHead); assert.equal(handoff.exportVersion, '2026-09-11-s193-m07');
  assert.equal(gitEvidence.ancestor, true);
  assert.equal(accounting.executionHead, executionHead); assert.equal(accounting.reviewHead, reviewHead);
  assert.equal(accounting.headRelation.ancestor, true);
  assert.deepEqual(accounting.headRelation.changedEvidencePaths, gitEvidence.changes);
  assert.equal(accounting.headRelation.executableInputsUnchanged, true);
  for (const change of gitEvidence.changes) {
    assert.equal(change.status, 'A');
    assert(/^artifacts\/product-reality\/sprint-193\/m07\/(?:five-suite-closeout[^/]*|closeout|ci)\/.*\.(?:json|log|md)$/.test(change.path), change.path);
  }

  for (const ref of [...ledger.references, ...accounting.references]) verify(ref);
  const expected = source('missions').missions.flatMap(mission => mission.successCriteria.map((criterion, index) => ({ missionId: mission.id, criterionIndex: index + 1, criterion })));
  assert.equal(expected.length, 36); assert.equal(ledger.claims.length, 36);
  const executions = new Map(ledger.executions.map(row => [row.id, row])); assert.equal(executions.size, ledger.executions.length);
  for (let i = 0; i < expected.length; i++) {
    const claim = ledger.claims[i]; for (const key of ['missionId', 'criterionIndex', 'criterion']) assert.equal(claim[key], expected[i][key]);
    assert.equal(claim.status, 'proven'); assert(claim.executionIds.length && claim.evidence.length);
    for (const ref of claim.evidence) { verify(ref); assert(claim.executionIds.some(id => executions.get(id)?.evidence.some(row => row.path === ref.path && row.sha256 === ref.sha256))); }
  }
  for (const execution of executions.values()) for (const ref of execution.evidence) { const bytes = verify(ref); if (execution.historical) assert(bytes.equals(readHistorical(execution.head, ref.path))); }
  assert(publicGitEvidence.ancestor); assert.deepEqual(publicGitEvidence.changedPaths, []); assert.deepEqual(publicGitEvidence.scope, publicScope193);
  const movers = source('movers'); assert.equal(rangeGitEvidence.head, manifest.implementationHead);
  for (const key of ['canonicalPaths', 'publicPaths']) assert.deepEqual(movers.s193[key], rangeGitEvidence[key]);
  const capability = source('componentLedger'), exported = source('componentExport'); assert.equal(capability.rows.length, 109); assert.equal(capability.approvedRuntimeCensus, null);
  const count = (surface, state) => capability.rows.filter(row => row.surfaces[surface].state === state).length;
  assert.equal(count('react', 'implemented-evidence-complete'), 109); assert.equal(count('vue', 'implemented-evidence-complete'), 109); assert.equal(count('html', 'mapped'), 109);
  assert.equal(count('accessibility', 'verified'), 109); assert.equal(count('theme', 'verified'), 109); assert.equal(count('interaction', 'verified'), 40); assert.equal(count('interaction', 'not-applicable'), 69);
  for (const row of capability.rows) {
    assert.deepEqual(row.surfaces, exported.components.find(entry => entry.id === row.id).productReality.surfaces);
    for (const surface of ['accessibility', 'theme', 'interaction']) { assert.notEqual(row.surfaces[surface].state, 'unverified'); if (['not-applicable', 'unavailable'].includes(row.surfaces[surface].state)) assert(row.surfaces[surface].reason); }
  }
  const proof = source('componentProof'); assert.equal(proof.head, manifest.implementationHead); proof.references.forEach(verify);
  for (const target of ['react', 'vue']) {
    const report = source(`${target}Measured`); assert.equal(report.success, true); assert.equal(report.numPendingTests, 0); assert.equal(report.numFailedTests, 0);
    const axe = report.testResults.filter(row => /accessibility\.spec\./.test(row.name)).flatMap(row => row.assertionResults).filter(row => /shared scenario/.test(row.fullName)); assert.equal(axe.length, 109); assert(axe.every(row => row.status === 'passed'));
    const themes = source(`${target}Theme`); assert.equal(themes.cells.length, 6); assert.equal(themes.failed, 0); assert.equal(themes.skipped, 0);
    for (const cell of themes.cells) { assert.equal(cell.status, 'passed'); assert.equal(new Set(cell.rows.map(row => row.componentId)).size, 109); verify({ path: `${path.posix.dirname(manifest.sources[`${target}Theme`])}/${cell.screenshot}`, sha256: cell.screenshotSha256 }); }
  }
  const composition = source('componentCensus'); assert.equal(composition.head, manifest.implementationHead); assert.equal(composition.allRows.length, 77); assert.equal(composition.greenTotalCells, 154); assert(composition.allRows.every(row => row.green && row.cells.every(cell => cell.errors.length === 0)));
  const movement = source('schemaMovement'); assert.equal(movement.changedSchemas + movement.unchangedSchemas, 77); assert.deepEqual(movement.unattributedChanges, []); assert.equal(movement.rows.length, movement.changedSchemas); assert.equal(Object.values(movement.classes).reduce((a, b) => a + b, 0), movement.changedSchemas);
  assert.equal(source('originalStore').reachable, 15); assert.equal(source('successorStore').reachable, 16); assert.equal(source('compatibility').changedLiveFiles, 0); assert.equal(source('compatibility').liveStoreFiles, 17);
  const registry = source('registry'); assert.deepEqual(registry, source('vizCensus')); assert.equal(registry.length, 13); assert.equal(registry.filter(row => row.dashboardDrawn === true).length, 11);
  const runtime = source('runtime');
  assert.equal(runtime.head, manifest.implementationHead); assert.equal(runtime.packCount, 1); assert.equal(runtime.historicalReceiptsUnioned, false);
  assert.equal(runtime.browserImage, 'mcr.microsoft.com/playwright@sha256:f1e7e01021efd65dd1a2c56064be399f3e4de00fd021ac561325f2bfbb2b837a');
  assert.deepEqual(runtime.summary, { cells: 154, pass: 154, typedGap: 0, fail: 0 });
  const objects = ['Article', 'Invoice', 'Media', 'Organization', 'Plan', 'Product', 'Relationship', 'Subscription', 'Transaction', 'Usage', 'User'];
  const identities = objects.flatMap(object => ['card', 'detail', 'form', 'inline', 'list', 'timeline', 'workflow'].flatMap(context => ['react', 'vue'].map(framework => `${object}/${context}/${framework}`))).sort();
  assert.deepEqual(runtime.rows.map(row => `${row.object}/${row.context}/${row.framework}`).sort(), identities);
  for (const row of runtime.rows) {
    assert.equal(row.status, 'pass'); assert.equal(row.head, runtime.head); assert.equal(row.runId, runtime.runId);
    const receiptPath = `${path.posix.dirname(manifest.sources.runtime)}/${row.report}`;
    assert.deepEqual(JSON.parse(readFrozen(receiptPath)), row);
    assert(ledger.references.some(ref => ref.path === receiptPath));
    const required = ['generation', 'fresh-exact-tarball-install', 'strict-typecheck', 'production-build', 'mount', 'accessibility-tree', 'screenshots', 'context-states'];
    if (row.context === 'workflow') required.push('server-render', 'hydration', 'shared-css-resolution', 'interaction-evidence');
    for (const name of required) assert.equal(row.gates.filter(gate => gate.name === name && gate.status === 'pass').length, 1);
    assert(row.gates.every(gate => gate.status === 'pass'));
    if (row.context === 'workflow') assert.equal(row.gates.find(gate => gate.name === 'context-states').detail.observations.length, 16);
  }
  assert.deepEqual(source('runtimeValidation').issues, []);
  const tools = source('toolLedger'); assert.equal(tools.rows.length, 27); assert.equal(tools.rows.filter(row => row.registration === 'auto').length, 21);
  const counts = Object.fromEntries(['product-reality', 'contract', 'unit', 'none'].map(tier => [tier, tools.rows.filter(row => row.proofTier === tier).length]));
  assert.deepEqual(counts, { 'product-reality': 7, contract: 12, unit: 4, none: 4 }); assert.deepEqual(counts, tools.summary.byTier);
  const toolProof = source('toolProof'); assert.equal(toolProof.byteIdentical, true); assert.equal(toolProof.sha256, digest(readFrozen(manifest.sources.toolLedger)));
  const health = source('health'); assert.equal(health.status, 'ok'); assert.deepEqual(health.productReality.runtime, { ...runtime.summary, head: runtime.head }); assert.deepEqual(health.productReality.tools, { entries: 27, byTier: counts, head: tools.head });
  assert.equal(accounting.status, 'passed'); assert.deepEqual(accounting.validationIssues, []); assert.deepEqual(accounting.unattributedDeltas, []);
  auditSprint193CaptureLimit({ accounting, manifest, verify });
  const runs = accounting.executions.filter(row => row.cohort === 'closeout'); assert.equal(runs.length, 5); assert.deepEqual(runs.map(row => row.suite).sort(), ['component-packages', 'mcp-server', 'root-core', 'viz-core', 'viz-render']);
  for (const run of runs) {
    const raw = JSON.parse(verify(run.rawReport)); assert.equal(run.measuredHead, executionHead); const failed = accounting.timeoutAcceptance?.executionId === run.id ? 1 : 0;
    assert.equal(raw.numFailedTests, failed); assert.equal(raw.success, !failed); assert.equal(run.exitCode, failed); assert.equal(raw.numPassedTests, run.counts.passed); assert.equal(raw.numPendingTests, run.counts.skipped);
  }
  if (accounting.timeoutAcceptance) {
    const timeout = accounting.timeoutAcceptance; assert.equal(timeout.decisionId, 1833); assert.equal(accounting.closeoutFailures.length, 1);
    const failure = accounting.closeoutFailures[0]; assert(failure.messages.join('\n').match(/(?:Test|Hook) timed out in \d+ms/)); assert(!failure.messages.join('\n').includes('AssertionError'));
    assert.equal(timeout.rerun.attempts, 1); assert.equal(timeout.rerun.exitCode, 0); assert.equal(timeout.rerun.executionHead, executionHead);
    const raw = JSON.parse(verify(timeout.rerun.rawReport)); verify(timeout.rerun.log); assert.equal(raw.numFailedTests, 0); assert.equal(raw.numPassedTests, 1);
  } else assert.deepEqual(accounting.closeoutFailures, []);
  assert.equal(accounting.comparisons.length, 5); assert.deepEqual(accounting.comparisons.map(row => row.suite).sort(), ['component-packages', 'mcp-server', 'root-core', 'viz-core', 'viz-render']);
  const inputs = (cohort, capture) => { const aggregate = JSON.parse(verify(capture.aggregate)); return accounting.executions.filter(row => row.cohort === cohort && row.suite !== 'component-packages').map(row => ({ suite: row.suite, workspace: aggregate.workspace, platform: aggregate.host.platform, report: JSON.parse(verify(row.rawReport)) })); };
  const skipped = auditSprint190SkippedIdentities(inputs('closeout', accounting.closeout), inputs('sprint192Closeout', accounting.baselines.sprint192Closeout));
  assert.equal(runs.find(row => row.suite === 'component-packages').counts.skipped, 0);
  for (const row of accounting.goldenAttribution.files) { verify({ path: row.file, sha256: row.afterSha256 }); assert.equal(digest(readHistorical(accounting.goldenAttribution.beforeHead, row.file)), row.beforeSha256); assert(row.reason.trim()); }
  const notice = source('noticePlan'); assert.equal(notice.sent, false); assert.equal(notice.sendsExecuted, 0); assert.deepEqual(notice.targets, ['cmos-dashboard', 'forge-demos', 'aquex-mcp']); assert(notice.notices.every(row => row.request.body.includes('2026-09-11-s193-m07') && row.request.body.includes('catalog_list productReality.surfaces')));
  const ci = source('ci'); assert.equal(ci.baseRefName, 'OODS-pro'); for (const name of ['coverage', 'component-packages', 'a11y-contract', 'portable-runtime', 'runtime-cells']) assert(ci.jobs.some(row => row.name === name && row.runId && row.conclusion === 'success'));
  assert.equal(source('prose').exitCode, 0);
  return { status: 'passed', skipped, gitEvidence, checkedCriteria: 36, checkedExecutions: executions.size, checkedFrozenPaths: checked.size, executionHead, reviewHead, builderSelfCertified: false, separateReviewRequired: true };
}


const S195_BUILD_BASE = '5b25c3c9ec795315bf52a698d135c96bffd66393';
const S195_PALETTE_HEAD = '52b0da991705c4c565987bc9faf7738ba00d885e';
const s195Scopes = ['A/light', 'A/dark', 'A/hc', 'B/light', 'B/dark', 'B/hc'].sort();
const sorted195 = values => [...values].sort();
const canonical195 = value => JSON.stringify(value, (_key, child) => child && typeof child === 'object' && !Array.isArray(child) ? Object.fromEntries(Object.keys(child).sort().map(key => [key, child[key]])) : child);
const safe195 = file => { assert(typeof file === 'string' && !path.posix.isAbsolute(file) && !file.split('/').includes('..'), `Unsafe proof path ${file}`); return file; };
const read195 = (read, file) => JSON.parse(read(safe195(file)));
const hash195 = (read, file, expected) => assert.equal(digest(read(safe195(file))), bare(expected), `Proof bytes differ: ${file}`);

export function auditSprint195Runtime({ runtime, dashboard, placement, runtimePath, dashboardPath, readFrozen, head }) {
  const root = path.posix.dirname(runtimePath), dashboardRoot = path.posix.dirname(dashboardPath);
  const objects = ['Article', 'Invoice', 'Media', 'Organization', 'Plan', 'Product', 'Relationship', 'Subscription', 'Transaction', 'Usage', 'User'];
  const identity = row => `${row.object}/${row.context}/${row.framework}`;
  const expected = objects.flatMap(object => ['card', 'detail', 'form', 'inline', 'list', 'timeline', 'workflow'].flatMap(context => ['react', 'vue'].map(framework => `${object}/${context}/${framework}`)));
  assert.deepEqual(sorted195(runtime.rows.map(identity)), sorted195(expected));
  assert.deepEqual(sorted195(dashboard.rows.map(identity)), ['Invoice/detail/react', 'Invoice/detail/vue', 'Usage/detail/react', 'Usage/detail/vue']);
  assert.equal(runtime.head, head); assert(fullHead(head)); assert.equal(runtime.packCount, 1); assert.equal(runtime.historicalReceiptsUnioned, false);
  assert.equal(runtime.browserImage, 'mcr.microsoft.com/playwright@sha256:f1e7e01021efd65dd1a2c56064be399f3e4de00fd021ac561325f2bfbb2b837a');
  for (const key of ['head', 'runId', 'packCount', 'browserImage']) { assert.equal(dashboard[key], runtime[key]); assert.equal(placement[key], runtime[key]); }
  assert.equal(dashboard.scope.layout, 'dashboard'); assert.deepEqual(sorted195(dashboard.scope.objects), ['Invoice', 'Usage']);
  assert.equal(dashboard.historicalReceiptsUnioned, false);
  assert.deepEqual(runtime.summary, { cells: 154, pass: 154, typedGap: 0, fail: 0 });
  assert.deepEqual(dashboard.summary, { cells: 4, pass: 4, typedGap: 0, fail: 0 });
  assert.deepEqual(placement.canonical, runtime.summary); assert.deepEqual(placement.dashboard, dashboard.summary);
  assert.equal(placement.chartThemeScopes, 48); assert.equal(placement.chartThemeScopesPassed, 48); assert.equal(placement.proof.length, 48);
  const browser = read195(readFrozen, `${root}/browser.json`); assert.equal(browser.image, runtime.browserImage); assert.equal(browser.version, '141.0.7390.37'); assert.match(browser.userAgent, /Linux/);
  const packages = read195(readFrozen, `${root}/submitted-packages/inventory.json`); assert(packages.length); assert.equal(new Set(packages.map(row => row.name)).size, packages.length);
  for (const pkg of packages) hash195(readFrozen, `${root}/${pkg.artifactPath}`, pkg.sha256);
  const packageHashes = Object.fromEntries(packages.map(pkg => [pkg.name, bare(pkg.sha256)]));
  const themed = [];
  for (const [population, directory, ledger] of [['canonical', root, runtime], ['dashboard', dashboardRoot, dashboard]]) for (const row of ledger.rows) {
    assert.equal(row.head, head); assert.equal(row.runId, runtime.runId); assert.equal(row.status, 'pass');
    assert.deepEqual(read195(readFrozen, `${directory}/${row.report}`), row);
    const required = ['generation', 'fresh-exact-tarball-install', 'strict-typecheck', 'production-build', 'mount', 'accessibility-tree', 'screenshots', 'context-states'];
    if (row.context === 'workflow') required.push('server-render', 'hydration', 'shared-css-resolution', 'interaction-evidence');
    assert.equal(new Set(row.gates.map(gate => gate.name)).size, row.gates.length);
    for (const name of required) assert(row.gates.some(gate => gate.name === name && gate.status === 'pass'), `${identity(row)} missing ${name}`);
    assert(row.gates.every(gate => gate.status === 'pass'));
    if (row.context === 'workflow') assert.equal(row.gates.find(gate => gate.name === 'context-states').detail.observations.length, 16);
    const install = row.gates.find(gate => gate.name === 'fresh-exact-tarball-install').detail;
    if (row.context === 'workflow') {
      const raw = read195(readFrozen, `${directory}/${install.report}`);
      assert.deepEqual(raw.gates.find(gate => gate.name === 'fresh-exact-tarball-install').detail, install.observation);
      const manifest = read195(readFrozen, `${directory}/workflows/${row.object}/${row.framework}/installed-manifest.json`);
      for (const pkg of install.observation.isolation.installed) { const packed = packages.find(item => item.name === pkg.name); assert(packed); assert.equal(manifest.dependencies[pkg.name], `file:./tarballs/${path.posix.basename(packed.artifactPath)}`); }
    } else { assert(install.tarballs.length); for (const pkg of install.tarballs) assert.equal(bare(pkg.sha256), packageHashes[pkg.name], `Different sweep tarball ${pkg.name}`); }
    if (!['Invoice', 'Usage'].includes(row.object) || row.context !== 'detail') continue;
    const cellRoot = `${directory}/${path.posix.dirname(row.report)}`;
    assert.deepEqual(read195(readFrozen, `${cellRoot}/composition-request.json`), population === 'dashboard' ? { object: row.object, layout: 'dashboard' } : { object: row.object, context: 'detail' });
    const scopeGate = row.gates.find(gate => gate.name === 'chart-theme-scopes'); assert(scopeGate); assert.equal(scopeGate.status, 'pass');
    assert.equal(scopeGate.detail.cells, 6); assert.equal(scopeGate.detail.failed, 0); assert.equal(scopeGate.detail.skipped, 0); assert.equal(scopeGate.detail.reusedSweepTarballs, true);
    assert.equal(`${directory}/${scopeGate.detail.report}`, `${cellRoot}/chart-themes/report.json`);
    const report = read195(readFrozen, `${directory}/${scopeGate.detail.report}`);
    assert.equal(report.status, 'passed'); assert.equal(report.selected, 6); assert.equal(report.failed, 0); assert.equal(report.skipped, 0); assert.deepEqual(report.failures, []);
    assert.deepEqual(sorted195(report.cells.map(cell => `${cell.brand}/${cell.theme}`)), s195Scopes);
    for (const cell of report.cells) {
      assert.equal(cell.id, `${cell.brand}-${cell.theme}`); assert.equal(cell.status, 'passed'); assert.deepEqual(cell.errors, []); assert.deepEqual(cell.failures, []);
      assert.equal(cell.placeholders, 0); assert.equal(cell.charts.length, 1); assert.equal(cell.charts[0].matchesPublicSvg, true); assert(cell.charts[0].width > 0 && cell.charts[0].height > 0); assert.equal(cell.forcedColours, cell.theme === 'hc');
      const title = row.object === 'Invoice' ? 'Invoice line item amounts' : 'Example API-call usage';
      assert(readFrozen(`${cellRoot}/chart-themes/${cell.id}-accessibility-tree.txt`).toString().includes(`img "${title}"`));
      hash195(readFrozen, `${cellRoot}/chart-themes/${cell.screenshot}`, cell.screenshotSha256);
      const proof = read195(readFrozen, `${cellRoot}/chart-themes/${cell.id}-certification.json`), generated = read195(readFrozen, `${cellRoot}/chart-themes/${cell.id}-generation.json`);
      assert.equal(proof.renderRequest.theme, cell.theme); assert.equal(proof.renderRequest.brand, cell.brand); assert.equal(proof.renderRequest.name, title);
      assert.equal(proof.renderRequest.chartType, row.object === 'Invoice' ? 'bar' : 'line'); assert.equal(proof.rendered.status, 'ok'); assert.equal(digest(proof.rendered.svg), bare(proof.rendered.svgHash));
      assert.equal(proof.certification.status, 'ok'); assert.equal(proof.certification.coverage, 'certified'); assert.equal(proof.certification.conformant, true); assert.equal(proof.certification.determinism.stable, true); assert(/^(?:sha256:)?[a-f0-9]{64}$/.test(proof.certification.determinism.renderHash)); // Certification grades the IR's default dimensions; generation below binds the displayed360×200 pixels.
      assert.equal(generated.request.options.theme, cell.theme); assert.equal(generated.request.options.brand, cell.brand); assert.equal(generated.response.status, 'ok');
      assert.equal(generated.response.artifact.files.find(file => file.path.endsWith('.svg'))?.contents, proof.rendered.svg);
      const summary = placement.proof.filter(item => item.population === population && item.object === row.object && item.framework === row.framework && item.brand === cell.brand && item.theme === cell.theme);
      assert.equal(summary.length, 1); assert.equal(summary[0].svgHash, proof.rendered.svgHash); assert.equal(summary[0].conformant, true); assert.equal(summary[0].screenshotSha256, cell.screenshotSha256);
      themed.push(`${population}/${identity(row)}/${cell.id}`);
    }
  }
  assert.equal(new Set(themed).size, 48);
  assert.equal(read195(readFrozen, `${dashboardRoot}/validation.json`).reusedSweepTarballs, true);
  return { canonical: 154, dashboard: 4, chartThemes: 48, packCount: 1 };
}

export function auditSprint195Viz({ registry, observations, patterns, patternCensus, taxonomy, classification, patternSources, readFrozen }) {
  const types = ['bar', 'line', 'area', 'scatter', 'heatmap', 'treemap', 'sunburst', 'sankey', 'chord', 'force_graph', 'choropleth', 'bubble_map', 'flow_map'];
  assert.deepEqual(sorted195(registry.map(row => row.chartType)), sorted195(types)); assert.deepEqual(observations.registry, registry);
  assert.deepEqual(sorted195(observations.observations.map(row => row.chartType)), sorted195(types));
  let rendered = 0, deferred = 0, nonconformant = 0;
  for (const row of registry) {
    assert.equal(row.publicSvg, true); assert.equal(row.certifyCoverage, 'certified'); assert.equal(row.renderScopes.length, 6);
    const raw = observations.observations.find(item => item.chartType === row.chartType); assert.equal(raw.defaultEqualsLightA, true);
    assert.deepEqual(sorted195(raw.scopes.map(scope => `${scope.brand}/${scope.theme}`)), s195Scopes);
    assert.deepEqual(row.certifyScopes, raw.scopes.filter(scope => scope.status === 'rendered').map(({ theme, brand, coverage, conformant, pillars, accuracySummary }) => ({ theme, brand, coverage, conformant, pillars, accuracySummary })));
    for (const scope of raw.scopes) {
      const projected = row.renderScopes.find(item => item.brand === scope.brand && item.theme === scope.theme); assert(projected); assert.equal(projected.status, scope.status);
      if (scope.status === 'typed-deferred') { deferred++; assert.equal(scope.theme, 'hc'); assert(scope.errors.length && scope.errors.every(error => error.code === 'OODS-V165' && error.message.trim())); assert.deepEqual(projected.errors, scope.errors); continue; }
      rendered++; assert.equal(scope.status, 'rendered'); assert.equal(digest(scope.svg), bare(scope.svgHash)); assert.equal(scope.svgHash, scope.renderHash); assert.equal(scope.repeated, true); assert.equal(projected.svgHash, scope.svgHash);
      assert.equal(scope.coverage, 'certified'); assert(scope.accuracySummary.rulesEvaluated > 0); assert.equal(scope.render.theme, scope.theme); assert.equal(scope.render.brand, scope.brand);
      assert.equal(scope.conformant, scope.pillars.a11yEquivalence === 'pass' && scope.pillars.determinism === 'pass' && !['fail', 'ungradeable'].includes(scope.pillars.contrast) && scope.pillars.accuracy === 'pass');
      if (!scope.conformant) { nonconformant++; assert.equal(row.chartType, 'bubble_map'); assert(scope.findings.some(item => item.code === 'OODS-V169')); }
      if (scope.theme === 'hc') { assert.equal(scope.pillars.contrast, 'exempt'); assert.equal(scope.contrast.reason, 'forced-colors'); }
    }
    assert.equal(row.themes.hc, raw.scopes.filter(scope => scope.theme === 'hc').every(scope => scope.status === 'rendered'));
    if (row.specEngine === 'echarts') { assert.equal(row.chartInApp, 'not-placed'); assert.match(row.notes.join(' '), /1944/); }
  }
  assert.deepEqual({ rendered, deferred, nonconformant }, { rendered: 60, deferred: 18, nonconformant: 4 });
  assert.equal(registry.filter(row => row.dashboardDrawn === true).length, 11); assert.equal(observations.placementCompositions, 88); assert.equal(observations.placements.length, 8);
  assert.deepEqual(sorted195([...new Set(observations.placements.map(row => row.chartType))]), ['area', 'bar', 'line']);
  assert.deepEqual(observations.accuracyControls.map(row => row.expectedCode), ['OODS-V168', 'OODS-V171']);
  for (const row of observations.accuracyControls) { assert.equal(row.grade.conformant, false); assert.equal(row.grade.pillars.accuracy, 'fail'); assert(row.grade.findings.some(item => item.code === row.expectedCode)); }
  assert.equal(patterns.length, 21); assert.equal(patternSources.length, 21); assert.equal(patternCensus.cells.length, 84);
  assert.deepEqual(sorted195(patterns.map(row => row.id)), sorted195(patternSources.map(row => row.id))); assert.equal(new Set(patterns.map(row => row.id)).size, 21);
  assert.equal(patterns.filter(row => row.publicSvg).length, 8);
  assert.equal(patternCensus.inputSchemaSha256, digest(readFrozen('packages/mcp-server/src/schemas/viz.render.input.json')));
  const four = ['A/light', 'A/dark', 'B/light', 'B/dark'].sort();
  for (const row of patterns) {
    const source = patternSources.find(item => item.id === row.id); const authored = readFrozen(row.specPath);
    assert.equal(row.specSha256, digest(authored)); assert.equal(source.specSha256, row.specSha256); assert.equal(source.specPath, row.specPath); assert.equal(row.baseChartType, source.baseChartType); assert.deepEqual(JSON.parse(authored), source.spec); assert.deepEqual(row.portability, source.portability);
    assert.deepEqual(sorted195(row.scopes.map(scope => `${scope.brand}/${scope.theme}`)), four);
    const cells = patternCensus.cells.filter(cell => cell.id === row.id); assert.deepEqual(sorted195(cells.map(cell => `${cell.request.brand}/${cell.request.theme}`)), four);
    for (const scope of row.scopes) {
      const cell = cells.find(item => item.request.brand === scope.brand && item.request.theme === scope.theme); assert.equal(cell.request.pattern, row.id);
      if (!row.publicSvg) { assert.equal(row.status, 'authoring-only'); assert.equal(scope.status, 'authoring-only'); assert.equal(cell.rendered.status, 'error'); assert(cell.rendered.errors.length && cell.rendered.errors.every(error => error.code === 'OODS-V167')); assert.deepEqual(scope.errors, cell.rendered.errors.map(({ code, message }) => ({ code, message }))); assert(row.reasons.includes(cell.rendered.errors[0].message)); continue; }
      assert.equal(row.status, 'public'); assert.equal(scope.status, 'public'); assert.equal(cell.rendered.status, 'ok'); assert.equal(digest(cell.rendered.svg), bare(scope.svgHash)); assert.equal(cell.rendered.svgHash, scope.svgHash);
      assert.equal(digest(canonical195(cell.rendered.normalizedSpec)), scope.normalizedSpecSha256); assert.equal(scope.a11yDescription, cell.rendered.normalizedSpec.a11y.description);
      assert.deepEqual(scope.certify, { coverage: cell.certified.coverage, conformant: cell.certified.conformant, pillars: cell.certified.pillars, stable: cell.certified.determinism.stable, renderHash: cell.certified.determinism.renderHash });
      assert.equal(scope.certify.renderHash, scope.svgHash);
    }
  }
  assert.equal(taxonomy.schemaVersion, 1); assert.equal(taxonomy.identities.length, 34); assert.equal(classification.assignments.length, 34);
  const identities = [...types, ...patterns.map(row => row.id)]; assert.deepEqual(sorted195(taxonomy.identities.map(row => row.id)), sorted195(identities)); assert.equal(new Set(identities).size, 34);
  assert.deepEqual(taxonomy.families, classification.families.map(({ id, definition }) => ({ id, definition }))); assert.equal(taxonomy.families.length, 8);
  for (const row of taxonomy.identities) {
    const assignment = classification.assignments.find(item => item.id === row.id); assert(assignment); for (const key of ['family', 'role', 'coreCell']) assert.equal(row[key], assignment[key]);
    assert(taxonomy.families.some(family => family.id === row.family)); assert(['core', 'extension'].includes(row.role));
    const pattern = patterns.find(item => item.id === row.id); assert.equal(row.kind, pattern ? 'pattern' : 'type'); assert.equal(row.publicSvg, pattern ? pattern.publicSvg : true);
    if (pattern) assert.equal(row.specSha256, pattern.specSha256);
  }
  const core = classification.families.flatMap(family => family.coreCells.map(cell => ({ ...cell, family: family.id })));
  assert.deepEqual(sorted195(taxonomy.coreCells.map(row => `${row.family}/${row.cell}`)), sorted195(core.map(row => `${row.family}/${row.cell}`)));
  for (const cell of taxonomy.coreCells) {
    const input = core.find(row => row.cell === cell.cell && row.family === cell.family); const assigned = taxonomy.identities.filter(row => row.family === cell.family && row.coreCell === cell.cell);
    assert.equal(cell.definition, input.definition); assert.deepEqual(sorted195(cell.identities), sorted195(assigned.map(row => row.id)));
    assert.equal(cell.status, assigned.some(row => row.publicSvg) ? 'surface-complete' : 'typed-gap'); if (cell.status === 'typed-gap') assert.equal(cell.reason, input.gapReason);
  }
  const summary = { types: 13, patterns: 21, families: 8, classified: 34, coreCells: core.length, coreSurfaceComplete: taxonomy.coreCells.filter(row => row.status === 'surface-complete').length, typedGaps: taxonomy.coreCells.filter(row => row.status === 'typed-gap').length };
  assert.deepEqual(summary, { types: 13, patterns: 21, families: 8, classified: 34, coreCells: 20, coreSurfaceComplete: 13, typedGaps: 7 }); assert.deepEqual(taxonomy.summary, summary);
  return summary;
}

export function auditSprint195Bites(index, indexPath, readFrozen) {
  assert.equal(index.status, 'passed'); assert.equal(index.builderSelfCertified, false); assert.deepEqual(sorted195(index.bites.map(row => row.id)), ['palette', 'pattern-sha', 'registry']);
  assert.equal(index.finalPaletteAttempt, 'attempt-3/bites.json');
  const root = path.posix.dirname(indexPath);
  for (const row of index.bites) {
    assert.equal(row.status, 'passed'); assert.equal(row.restoredByteIdentically, true); assert.equal(row.beforeSha256, row.restoredSha256); assert.notEqual(row.beforeSha256, row.disabledSha256);
    hash195(readFrozen, row.path, row.restoredSha256);
    assert.equal(row.receipt, row.id === 'palette' ? 'attempt-3/bites.json' : 'attempt-2/bites.json');
    const file = `${root}/${row.receipt}`, receipt = read195(readFrozen, file), actual = receipt.records.find(item => item.id === row.id);
    assert(actual); assert.equal(actual.status, 'passed'); assert.equal(actual.restoredByteIdentically, true); assert.equal(actual.path, row.path); assert.equal(actual.beforeSha256, row.beforeSha256); assert.equal(actual.disabledSha256, row.disabledSha256);
    const red = actual.commands.find(command => command.log.endsWith(row.id === 'palette' ? 'disabled-census.log' : 'disabled-contract.log'));
    const green = actual.commands.find(command => command.log.endsWith(row.id === 'palette' ? 'restored-census.log' : 'restored-contract.log'));
    assert.equal(red?.exitCode, 1); assert.equal(green?.exitCode, 0);
    const directory = path.posix.dirname(file), log = readFrozen(`${directory}/${red.log}`).toString();
    assert.match(log, row.id === 'palette' ? /Measured viz registry differs from canonical source/ : row.id === 'registry' ? /the exported registry equals every live census cell/ : /bundled source SHA is stale|specSha256|source hashes/);
    assert(readFrozen(`${directory}/${green.log}`).length > 0);
    if (row.id === 'palette') {
      for (const [phase, contrast, conformant, measured, evidence] of [['disabled', 'fail', false, false, 'none'], ['restored', 'pass', true, true, 'render']]) {
        const proof = read195(readFrozen, `${directory}/palette/${phase}-proof.json`);
        assert.equal(proof.rendered.status, 'ok'); assert.equal(digest(proof.rendered.svg), bare(proof.rendered.svgHash)); assert.equal(proof.grade.determinism.renderHash, proof.rendered.svgHash);
        assert.equal(proof.grade.pillars.contrast, contrast); assert.equal(proof.grade.conformant, conformant); assert.equal(proof.grade.contrastResults[0].measured, measured); assert.equal(proof.grade.contrastResults[0].evidence, evidence); assert.equal('contrastMeasured' in proof.grade, false);
      }
    }
  }
  return { bites: 3, restored: true };
}

export function auditSprint195Soak(soak, soakPath, readFrozen) {
  assert.equal(soak.issue, '#1442'); assert.equal(soak.provenRetentionCause, null); assert.equal(soak.rendererSourceChanges, false); assert.equal(soak.disposition.code, 'OODS-SOAK-1442'); assert.equal(soak.disposition.retentionCertification, 'not-established'); assert.equal(soak.disposition.thresholdChanges, false);
  for (const proof of Object.values(soak.thresholdAndStatisticsProof)) { assert.equal(proof.unchanged, true); assert.equal(proof.beforeSha256, proof.afterSha256); }
  const root = path.posix.dirname(soakPath);
  const strict = read195(readFrozen, `${root}/full-suite-observation/vitest.json`), observation = read195(readFrozen, `${root}/full-suite-observation/observation.json`);
  assert.equal(strict.numPassedTests, 2); assert.equal(strict.numFailedTests, 1); assert.equal(strict.numPendingTests, 0); assert.equal(strict.success, false);
  const failed = strict.testResults.flatMap(row => row.assertionResults).filter(row => row.status === 'failed'); assert.equal(failed.length, 1); assert.match(failed[0].failureMessages.join('\n'), /OODS-SOAK-1442: statistically positive retained resource trend/);
  assert.equal(observation.originalExitCode, 1); assert.equal(observation.status, 'observation'); assert.equal(observation.retentionCertification, 'not-established');
  const log = readFrozen(`${root}/full-suite-observation/strict-soak.log`).toString(); const raw = JSON.parse(/ECHARTS_SOAK_EVIDENCE resources-observed (\{[^\n]+\})/.exec(log)?.[1] ?? 'null'); assert.deepEqual(raw, observation.evidence);
  assert.equal(raw.samples.length, 21); assert.equal(raw.warmupRenders, 100); assert.equal(raw.measuredRenders, 2000);
  assert.equal(raw.budgets.workerHeapAbsoluteDeltaBytes, 12 * 1024 * 1024); assert.equal(raw.budgets.workerHeapSlopeBytesPerWindow, 256 * 1024); assert.equal(raw.budgets.processRssSlopeBytesPerWindow, 2 * 1024 * 1024);
  const trend = values => { const mean = values.reduce((a, b) => a + b, 0) / 8; const denominator = 42; const slope = values.reduce((sum, value, i) => sum + (i - 3.5) * (value - mean), 0) / denominator; const se = Math.sqrt(values.reduce((sum, value, i) => sum + (value - (mean - slope * 3.5 + slope * i)) ** 2, 0) / 6 / denominator); return { slope, slopeStandardError: se, positiveTrendLower99: slope - 3.143 * se }; };
  for (const [field, name, budget] of [['workerHeapUsedBytes', 'heapTrend', 'workerHeapSlopeBytesPerWindow'], ['processRssBytes', 'rssTrend', 'processRssSlopeBytesPerWindow']]) { assert.deepEqual(trend(raw.samples.slice(13).map(row => row[field])), raw[name]); assert(raw[name].slope <= raw.budgets[budget]); }
  assert(raw.heapTrend.positiveTrendLower99 > 0 || raw.rssTrend.positiveTrendLower99 > 0); assert(raw.workerHeapDeltaBytes <= raw.budgets.workerHeapAbsoluteDeltaBytes);
  assert.equal(raw.beforeFault.chartsCreated, 2100); assert.equal(raw.beforeFault.chartsDisposed, 2100); assert.equal(raw.afterFault.chartsCreated, 2101); assert.equal(raw.afterFault.chartsDisposed, 2101); assert.equal(raw.afterFault.activeCharts, 0); assert.equal(raw.afterFault.geoRegistrySize, 1); assert.equal(raw.afterFault.renderFaults, raw.beforeFault.renderFaults + 1); assert.equal(raw.afterFault.randomRestored, true); assert.equal(raw.afterFault.clockGuardRestored, true); assert.equal(raw.afterFault.ambientAccesses, 0);
  for (const name of ['head', 'unchanged-control']) assert.match(readFrozen(`${root}/${name}.log`).toString(), /FAIL.*plateaus after/s);
  return { strictPassed: 2, strictFailed: 1, strictSkipped: 0, retentionCertified: false };
}

export function auditSprint195Attribution({ attribution, movers, migration, readFrozen, readHistorical, rangeGitEvidence }) {
  assert.equal(attribution.base, S195_BUILD_BASE); assert.equal(attribution.head, movers.s195.head); assert.deepEqual(attribution.unattributedPaths, []);
  assert.equal(rangeGitEvidence.base, S195_BUILD_BASE); assert.equal(rangeGitEvidence.head, attribution.head);
  assert.deepEqual(sorted195(attribution.rows.map(row => row.path)), sorted195(movers.s195.publicPaths)); assert.equal(new Set(attribution.rows.map(row => row.path)).size, attribution.rows.length);
  hash195(readFrozen, attribution.patch.path, attribution.patch.sha256);
  assert.equal(readFrozen(attribution.patch.path).toString(), rangeGitEvidence.patch, 'The retained advertised patch omits or alters a Git hunk');
  for (const row of attribution.rows) {
    assert(row.missions.length && row.commits.length && row.reason?.trim()); assert(row.missions.every(mission => /^s195-m0[1-7]$/.test(mission))); assert(row.commits.every(fullHead));
    assert(row.evidence.length); for (const ref of row.evidence) hash195(readFrozen, ref.path, ref.sha256);
    const filePatch = rangeGitEvidence.patch.split(/(?=^diff --git )/m).filter(chunk => chunk.startsWith(`diff --git a/${row.path} b/${row.path}\n`));
    assert.equal(filePatch.length, 1, `Missing advertised file patch: ${row.path}`);
    const headers = filePatch[0].split('\n').filter(line => line.startsWith('@@ '));
    assert.deepEqual(row.hunks.map(hunk => hunk.header), headers.length ? headers : ['file-metadata'], `Missing or invented attributed hunk in ${row.path}`);
    assert(row.hunks.length); for (const hunk of row.hunks) { assert(hunk.reason.trim() && hunk.missions.length && hunk.commits.length); assert(hunk.missions.every(id => row.missions.includes(id))); assert(hunk.commits.every(id => row.commits.includes(id))); }
    for (const [head, expected] of [[S195_BUILD_BASE, row.beforeSha256], [attribution.head, row.afterSha256]]) {
      assert(expected === null || /^[a-f0-9]{64}$/.test(expected));
      let observed = null; try { observed = digest(readHistorical(head, row.path)); } catch (error) { if (expected !== null) throw error; } assert.equal(observed, expected, `Attribution bytes differ at ${head}:${row.path}`);
    }
  }
  assert.equal(migration.qualificationHead, S195_PALETTE_HEAD); assert.equal(migration.builderSelfCertified, false); hash195(readFrozen, migration.receipt.path, migration.receipt.sha256);
  const palette = read195(readFrozen, migration.receipt.path); assert.equal(palette.qualificationHead, S195_PALETTE_HEAD); assert.equal(palette.historicalRawFilesUnchanged, true); assert.equal(palette.builderSelfCertified, false);
  assert.equal(palette.files.length, 29); assert.equal(palette.snapshotEntries.length, 14); assert.equal(palette.matrixRows.length, 910); assert.equal(palette.matrixRows.filter(row => row.status === 'superseded').length, 231);
  for (const row of palette.files) { assert.equal(digest(readHistorical(palette.beforeHead, row.file)), row.beforeSha256); assert.equal(digest(readHistorical(palette.qualificationHead, row.file)), row.afterSha256); assert(row.reason.trim()); }
  for (const row of [...palette.sourceHashes, ...palette.newSvgEvidence]) hash195(readFrozen, row.path, row.sha256);
  for (const row of palette.matrixRows) assert(row.reason.trim());
  return { paths: attribution.rows.length, historicalMatrixRows: 910, superseded: 231 };
}

export function auditSprint195Ci({ ci, implementationHead, readFrozen, changedPaths }) {
  assert.equal(ci.baseRefName, 'OODS-pro'); assert.equal(ci.headRefName, 'codex/sprint-195-visualization-breadth');
  const required = ['coverage', 'product-reality-consumers', 'component-packages', 'a11y-contract', 'portable-runtime', 'runtime-cells', 'viz-determinism'];
  assert.deepEqual(sorted195(ci.jobs.map(row => row.name)), sorted195(required));
  const heads = sorted195([...new Set(ci.jobs.map(row => row.headSha))]);
  assert.deepEqual(sorted195(ci.sourceEquivalence.map(row => row.headSha)), heads);
  for (const row of ci.jobs) {
    assert(fullHead(row.headSha)); assert.equal(row.status, 'completed'); assert.equal(row.conclusion, 'success');
    hash195(readFrozen, row.run.path, row.run.sha256); hash195(readFrozen, row.jobInventory.path, row.jobInventory.sha256);
    const run = read195(readFrozen, row.run.path), jobs = read195(readFrozen, row.jobInventory.path).jobs;
    assert.equal(run.id, row.runId); assert.equal(run.head_sha, row.headSha); assert.equal(run.status, 'completed');
    const matching = jobs.filter(job => job.id === row.jobId); assert.equal(matching.length, 1);
    const actual = matching[0]; assert.equal(actual.run_id, row.runId); assert.equal(actual.name, row.name); assert.equal(actual.status, row.status); assert.equal(actual.conclusion, row.conclusion);
  }
  for (const row of ci.sourceEquivalence) {
    assert.equal(row.implementationHead, implementationHead); assert.deepEqual(row.scope, publicScope195); assert.deepEqual(row.changedPaths, []);
    assert.deepEqual(changedPaths(row.headSha, implementationHead, publicScope195), [], 'CI executed different public source bytes');
  }
  return { jobs: 7, actualHeads: heads.length };
}

export function auditSprint195ToolProof({ tools, proof, implementationHead, ledgerPath, readFrozen }) {
  assert(fullHead(tools.head) && fullHead(implementationHead));
  assert.equal(proof.censusHead, tools.head); assert.equal(proof.implementationHead, implementationHead);
  assert.equal(proof.byteIdentical, true); hash195(readFrozen, ledgerPath, proof.sha256); assert.deepEqual(proof.summary, tools.summary);
  const registry = read195(readFrozen, 'packages/mcp-server/src/tools/registry.json');
  assert.deepEqual(tools.rows.map(row => row.name), [...registry.auto, ...registry.onDemand]);
  const descriptions = read195(readFrozen, 'packages/mcp-adapter/tool-descriptions.json');
  for (const row of tools.rows) {
    assert.equal(row.registration, registry.auto.includes(row.name) ? 'auto' : 'on-demand');
    hash195(readFrozen, row.inputSchemaPath, row.inputSchemaHash);
    const schema = read195(readFrozen, row.inputSchemaPath);
    assert.deepEqual(row.advertisedClaim, { description: descriptions[row.name], inputSchemaDescription: schema.description ?? '' });
    assert.equal(bare(row.claimHash), digest(JSON.stringify(row.advertisedClaim, null, 2) + '\n'));
  }
  return { censusHead: tools.head, implementationHead, entries: tools.rows.length };
}

export function auditSprint195CertificationProfiles(receipt) {
  assert.deepEqual(sorted195(receipt.rows.map(row => row.chartType)), ['bubble_map', 'chord', 'choropleth', 'flow_map', 'force_graph', 'sankey', 'sunburst', 'treemap']);
  for (const row of receipt.rows) {
    assert(row.input.data); assert.equal(row.operand.coverage, 'certified'); assert.equal(row.operand.conformant, row.chartType !== 'bubble_map'); assert.equal(row.operand.determinism.stable, true);
    assert.equal(row.specOnly.status, 'ok'); assert.equal(row.specOnly.coverage, 'uncertified'); assert.equal(row.specOnly.conformant, null);
    for (const key of ['accuracy', 'determinism', 'a11yEquivalence']) assert.equal(row.specOnly.pillars[key], 'unchecked');
    assert.equal(row.specOnly.findings.length, 0); assert.equal(row.specOnly.determinism, undefined); assert.equal(row.specOnly.accuracySummary, undefined);
  }
  return { operands: 8, specOnlyUncertified: 8, operandConformant: 7 };
}

export function auditSprint195Claims({ missions, claims, executions, verify, readHistorical }) {
  assert.deepEqual(missions.map(row => row.id), Array.from({ length: 7 }, (_, index) => `s195-m0${index + 1}`));
  const expected = missions.flatMap(mission => mission.successCriteria.map((criterion, index) => ({ missionId: mission.id, criterionIndex: index + 1, criterion })));
  assert.equal(expected.length, 28); assert.equal(claims.length, expected.length);
  const byId = new Map(executions.map(row => [row.id, row])); assert.equal(byId.size, executions.length);
  for (let i = 0; i < expected.length; i++) {
    const claim = claims[i]; for (const key of ['missionId', 'criterionIndex', 'criterion']) assert.equal(claim[key], expected[i][key]);
    assert(['proven', 'proven-with-documented-limit'].includes(claim.status)); if (claim.status === 'proven-with-documented-limit') { assert(claim.decisionIds?.length); assert(claim.qualification?.trim()); }
    assert(claim.executionIds.length && claim.evidence.length); assert(claim.executionIds.every(id => byId.has(id)));
    for (const ref of claim.evidence) { verify(ref); assert(claim.executionIds.some(id => byId.get(id).evidence.some(row => row.path === ref.path && row.sha256 === ref.sha256))); }
  }
  for (const execution of executions) { assert(fullHead(execution.head)); for (const ref of execution.evidence) { const bytes = verify(ref); if (execution.historical) assert(bytes.equals(readHistorical(execution.head, ref.path))); } }
  return { criteria: expected.length, executions: byId.size };
}

export function auditSprint196Ci({ ci, implementationHead, readFrozen, changedPaths }) {
  assert.equal(ci.baseRefName, 'OODS-pro'); assert.equal(ci.headRefName, 'codex/sprint-196-release-proof');
  const required = ['coverage', 'product-reality-consumers', 'component-packages', 'a11y-contract', 'portable-runtime (20.11.1)', 'portable-runtime (24)', 'release-runtime', 'runtime-cells', 'viz-determinism'];
  assert.deepEqual(sorted195(ci.jobs.map(row => row.name)), sorted195(required));
  const heads = sorted195([...new Set(ci.jobs.map(row => row.headSha))]);
  assert.deepEqual(sorted195(ci.sourceEquivalence.map(row => row.headSha)), heads);
  for (const row of ci.jobs) {
    assert(fullHead(row.headSha)); assert.equal(row.status, 'completed'); assert.equal(row.conclusion, 'success');
    hash195(readFrozen, row.run.path, row.run.sha256); hash195(readFrozen, row.jobInventory.path, row.jobInventory.sha256);
    const run = read195(readFrozen, row.run.path), jobs = read195(readFrozen, row.jobInventory.path).jobs;
    assert.equal(run.id, row.runId); assert.equal(run.head_sha, row.headSha); assert.equal(run.status, 'completed');
    const matching = jobs.filter(job => job.id === row.jobId); assert.equal(matching.length, 1);
    const actual = matching[0]; assert.equal(actual.run_id, row.runId); assert.equal(actual.name, row.name); assert.equal(actual.status, row.status); assert.equal(actual.conclusion, row.conclusion);
  }
  for (const row of ci.sourceEquivalence) {
    assert.equal(row.implementationHead, implementationHead); assert.deepEqual(row.scope, publicScope196); assert.deepEqual(row.changedPaths, []);
    assert.deepEqual(changedPaths(row.headSha, implementationHead, publicScope196), [], 'CI executed different public source bytes');
  }
  return { jobs: required.length, actualHeads: heads.length };
}

export function auditSprint196Claims({ missions, claims, executions, verify, readHistorical }) {
  assert.deepEqual(missions.map(row => row.id), Array.from({ length: 7 }, (_, index) => `s196-m0${index + 1}`));
  const expected = missions.flatMap(mission => mission.successCriteria.map((criterion, index) => ({ missionId: mission.id, criterionIndex: index + 1, criterion })));
  assert.equal(expected.length, 26); assert.equal(claims.length, expected.length);
  const byId = new Map(executions.map(row => [row.id, row])); assert.equal(byId.size, executions.length);
  for (let i = 0; i < expected.length; i++) {
    const claim = claims[i]; for (const key of ['missionId', 'criterionIndex', 'criterion']) assert.equal(claim[key], expected[i][key]);
    assert(['proven', 'proven-with-documented-limit'].includes(claim.status)); if (claim.status === 'proven-with-documented-limit') { assert(claim.decisionIds?.length); assert(claim.qualification?.trim()); }
    assert(claim.executionIds.length && claim.evidence.length); assert(claim.executionIds.every(id => byId.has(id)));
    for (const ref of claim.evidence) { verify(ref); assert(claim.executionIds.some(id => byId.get(id).evidence.some(row => row.path === ref.path && row.sha256 === ref.sha256))); }
  }
  for (const execution of executions) { assert(fullHead(execution.head)); for (const ref of execution.evidence) { const bytes = verify(ref); if (execution.historical) assert(bytes.equals(readHistorical(execution.head, ref.path))); } }
  return { criteria: expected.length, executions: byId.size };
}

export function auditSprint195Theme({ report, reportPath, target, ids, readFrozen }) {
  assert.equal(report.target, target); assert.equal(report.status, 'passed'); assert.equal(report.failed, 0); assert.equal(report.skipped, 0); assert.deepEqual(report.failures, []);
  assert.equal(report.cells.length, 6); assert.deepEqual(sorted195(report.cells.map(cell => `${cell.brand}/${cell.theme}`)), s195Scopes);
  assert.deepEqual(sorted195(report.canonicalIds), sorted195(ids)); assert.equal(ids.length, 109);
  for (const cell of report.cells) { assert.equal(cell.status, 'passed'); assert.deepEqual(sorted195(cell.rows.map(row => row.componentId)), sorted195(ids)); assert.equal(cell.overflow, false); assert.equal(cell.bodyBackground, cell.tokenBackground); assert.equal(cell.bodyForeground, cell.tokenForeground); assert.deepEqual(cell.errors, []); assert.deepEqual(cell.failures, []); assert.equal(cell.forcedColours, cell.theme === 'hc'); for (const row of cell.rows) { assert(!row.missing && row.width > 0 && row.height > 0 && row.pairs.length); for (const pair of row.pairs) assert(cell.theme === 'hc' ? pair.visible : pair.ratio >= 4.5); for (const control of row.controls) assert(control.focused && control.visible && (cell.theme === 'hc' ? control.ratio > 1 : control.ratio >= 3)); if (cell.theme !== 'hc') assert.deepEqual(row.systemColours, []); } hash195(readFrozen, `${path.posix.dirname(reportPath)}/${cell.screenshot}`, cell.screenshotSha256); }
  return { cells: 6, components: 109 };
}

export function auditSprint194ToolOutcomes({ tools, portable }) {
  assert.equal(portable.status, 'pass');
  assert.equal(portable.tools.count, 19); assert.equal(portable.calls.fixturePins.length, 19);
  assert.equal(portable.extractionTree.restoredAfterScopedWrites, true); assert.equal(portable.extractionTree.before, portable.extractionTree.after);
  assert.equal(portable.calls.primarySequenceCount, 27); assert.equal(portable.calls.totalAcrossProcesses, 28);
  assert.deepEqual([...portable.tools.names].sort(), tools.rows.filter(row => row.registration === 'auto').map(row => row.name.replaceAll('.', '_')).sort());
  assert.deepEqual(portable.calls.fixturePins.map(row => row.tool).sort(), tools.rows.filter(row => row.registration === 'auto').map(row => row.name).sort());
  const outcomes = Object.entries(portable.calls.outcomes); assert.equal(outcomes.length, 19);
  assert.equal(outcomes.filter(([, row]) => row.outcome === 'pass').length, 14);
  assert.equal(outcomes.filter(([, row]) => row.outcome === 'documented-limit').length, 5);
  assert.equal(tools.retired.length, 3); assert(tools.retired.every(row => row.decisionIds.length > 0));
  assert(tools.rows.filter(row => row.registration === 'auto').every(row => row.proofTier === 'product-reality' && row.portableE2E && row.caveats.every(c => c.kind === 'documented-limit')));
  for (const [tool, outcome] of outcomes.filter(([, row]) => row.outcome === 'documented-limit')) assert(tools.rows.find(row => row.name === tool).portableLimits.some(row => row.tool === tool));
  return { advertised: 19, calls: 28, pass: 14, documentedLimits: 5 };
}

export function auditSprint194Closeout({ executionHead, reviewHead, readOutput, readFrozen, readHistorical, gitEvidence, publicGitEvidence, rangeGitEvidence, manifestPath }) {
  const base = 'artifacts/product-reality/sprint-194/m07';
  const manifest = JSON.parse(readFrozen(manifestPath));
  const ledger = JSON.parse(readOutput(`${base}/closeout/claim-ledger.json`));
  const handoff = JSON.parse(readOutput(`${base}/closeout/review-handoff.json`));
  const accounting = JSON.parse(readOutput(`${base}/closeout/suite-accounting.json`));
  const checked = new Set();
  const verify = ref => { assert(ref.path && !path.isAbsolute(ref.path) && !ref.path.split('/').includes('..')); const bytes = readFrozen(ref.path); assert.equal(digest(bytes), bare(ref.sha256), ref.path); checked.add(ref.path); return bytes; };
  const source = key => JSON.parse(readFrozen(manifest.sources[key]));
  for (const result of [ledger, handoff]) {
    assert.equal(result.builderSelfCertified, false); assert.equal(result.separateReviewRequired, true); assert.equal(result.sprintStatus, 'Active');
    assert.equal(result.executionHead, executionHead); assert.equal(result.reviewHead, reviewHead); assert.equal(result.implementationHead, manifest.implementationHead);
  }
  assert.equal(handoff.evidenceCommit, reviewHead); assert.equal(handoff.exportVersion, '2026-09-11-s194-m07');
  assert.equal(gitEvidence.ancestor, true);
  assert.equal(accounting.executionHead, executionHead); assert.equal(accounting.reviewHead, reviewHead);
  assert.equal(accounting.headRelation.ancestor, true);
  assert.deepEqual(accounting.headRelation.changedEvidencePaths, gitEvidence.changes);
  assert.equal(accounting.headRelation.executableInputsUnchanged, true);
  for (const change of gitEvidence.changes) {
    assert.equal(change.status, 'A');
    assert(/^artifacts\/product-reality\/sprint-194\/m07\/(?:five-suite-closeout[^/]*|closeout|ci)\/.*\.(?:json|log|md)$/.test(change.path), change.path);
  }

  for (const ref of [...ledger.references, ...accounting.references]) verify(ref);
  const expected = source('missions').missions.flatMap(mission => mission.successCriteria.map((criterion, index) => ({ missionId: mission.id, criterionIndex: index + 1, criterion })));
  assert(expected.length > 0); assert.equal(ledger.claims.length, expected.length);
  const executions = new Map(ledger.executions.map(row => [row.id, row])); assert.equal(executions.size, ledger.executions.length);
  for (let i = 0; i < expected.length; i++) {
    const claim = ledger.claims[i]; for (const key of ['missionId', 'criterionIndex', 'criterion']) assert.equal(claim[key], expected[i][key]);
    assert(['proven', 'proven-with-documented-limit'].includes(claim.status)); if (claim.status === 'proven-with-documented-limit') { assert(claim.decisionIds?.length); assert(claim.qualification?.trim()); } assert(claim.executionIds.length && claim.evidence.length);
    for (const ref of claim.evidence) { verify(ref); assert(claim.executionIds.some(id => executions.get(id)?.evidence.some(row => row.path === ref.path && row.sha256 === ref.sha256))); }
  }
  for (const execution of executions.values()) for (const ref of execution.evidence) { const bytes = verify(ref); if (execution.historical) assert(bytes.equals(readHistorical(execution.head, ref.path))); }
  assert(publicGitEvidence.ancestor); assert.deepEqual(publicGitEvidence.changedPaths, []); assert.deepEqual(publicGitEvidence.scope, publicScope194);
  const movers = source('movers'); assert.equal(rangeGitEvidence.head, manifest.implementationHead);
  for (const key of ['canonicalPaths', 'publicPaths']) assert.deepEqual(movers.s194[key], rangeGitEvidence[key]);
  const capability = source('componentLedger'), exported = source('componentExport'); assert.equal(capability.rows.length, 109); assert.equal(capability.approvedRuntimeCensus, null);
  const count = (surface, state) => capability.rows.filter(row => row.surfaces[surface].state === state).length;
  assert.equal(count('react', 'implemented-evidence-complete'), 109); assert.equal(count('vue', 'implemented-evidence-complete'), 109); assert.equal(count('html', 'mapped'), 109);
  assert.equal(count('accessibility', 'verified'), 109); assert.equal(count('theme', 'verified'), 109); assert.equal(count('interaction', 'verified'), 40); assert.equal(count('interaction', 'not-applicable'), 69);
  for (const row of capability.rows) {
    assert.deepEqual(row.surfaces, exported.components.find(entry => entry.id === row.id).productReality.surfaces);
    for (const surface of ['accessibility', 'theme', 'interaction']) { assert.notEqual(row.surfaces[surface].state, 'unverified'); if (['not-applicable', 'unavailable'].includes(row.surfaces[surface].state)) assert(row.surfaces[surface].reason); }
  }
  const proof = source('componentProof'); assert.match(proof.head, /^[a-f0-9]{40}$/); proof.references.forEach(verify);
  const retainedProof = JSON.parse(readFrozen(proof.retainedFrom.path));
  verify(proof.retainedFrom);
  assert.equal(retainedProof.head, proof.head);
  assert.deepEqual(proof.references, retainedProof.references.filter(ref => ref.path !== 'packages/mcp-server/registry/tool-capability-ledger.v1.json'));
  for (const target of ['react', 'vue']) {
    const report = source(`${target}Measured`); assert.equal(report.success, true); assert.equal(report.numPendingTests, 0); assert.equal(report.numFailedTests, 0);
    const axe = report.testResults.filter(row => /accessibility\.spec\./.test(row.name)).flatMap(row => row.assertionResults).filter(row => /shared scenario/.test(row.fullName)); assert.equal(axe.length, 109); assert(axe.every(row => row.status === 'passed'));
    const themes = source(`${target}Theme`); assert.equal(themes.cells.length, 6); assert.equal(themes.failed, 0); assert.equal(themes.skipped, 0);
    for (const cell of themes.cells) { assert.equal(cell.status, 'passed'); assert.equal(new Set(cell.rows.map(row => row.componentId)).size, 109); verify({ path: `${path.posix.dirname(manifest.sources[`${target}Theme`])}/${cell.screenshot}`, sha256: cell.screenshotSha256 }); }
  }
  const composition = source('componentCensus'); assert.equal(composition.head, manifest.implementationHead); assert.equal(composition.allRows.length, 77); assert.equal(composition.greenTotalCells, 154); assert(composition.allRows.every(row => row.green && row.cells.every(cell => cell.errors.length === 0)));
  const movement = source('schemaMovement'); assert.equal(movement.changedSchemas + movement.unchangedSchemas, 77); assert.deepEqual(movement.unattributedChanges, []); assert.equal(movement.rows.length, movement.changedSchemas); assert.equal(Object.values(movement.classes).reduce((a, b) => a + b, 0), movement.changedSchemas);
  assert.equal(source('originalStore').reachable, 15); assert.equal(source('successorStore').reachable, 16); assert.equal(source('compatibility').changedLiveFiles, 0); assert.equal(source('compatibility').liveStoreFiles, 17);
  const registry = source('registry'); assert.deepEqual(registry, source('vizCensus')); assert.equal(registry.length, 13); assert.equal(registry.filter(row => row.dashboardDrawn === true).length, 11);
  const runtime = source('runtime');
  assert.equal(runtime.head, manifest.implementationHead); assert.equal(runtime.packCount, 1); assert.equal(runtime.historicalReceiptsUnioned, false);
  assert.equal(runtime.browserImage, 'mcr.microsoft.com/playwright@sha256:f1e7e01021efd65dd1a2c56064be399f3e4de00fd021ac561325f2bfbb2b837a');
  assert.deepEqual(runtime.summary, { cells: 154, pass: 154, typedGap: 0, fail: 0 });
  const objects = ['Article', 'Invoice', 'Media', 'Organization', 'Plan', 'Product', 'Relationship', 'Subscription', 'Transaction', 'Usage', 'User'];
  const identities = objects.flatMap(object => ['card', 'detail', 'form', 'inline', 'list', 'timeline', 'workflow'].flatMap(context => ['react', 'vue'].map(framework => `${object}/${context}/${framework}`))).sort();
  assert.deepEqual(runtime.rows.map(row => `${row.object}/${row.context}/${row.framework}`).sort(), identities);
  for (const row of runtime.rows) {
    assert.equal(row.status, 'pass'); assert.equal(row.head, runtime.head); assert.equal(row.runId, runtime.runId);
    const receiptPath = `${path.posix.dirname(manifest.sources.runtime)}/${row.report}`;
    assert.deepEqual(JSON.parse(readFrozen(receiptPath)), row);
    assert(ledger.references.some(ref => ref.path === receiptPath));
    const required = ['generation', 'fresh-exact-tarball-install', 'strict-typecheck', 'production-build', 'mount', 'accessibility-tree', 'screenshots', 'context-states'];
    if (row.context === 'workflow') required.push('server-render', 'hydration', 'shared-css-resolution', 'interaction-evidence');
    for (const name of required) assert.equal(row.gates.filter(gate => gate.name === name && gate.status === 'pass').length, 1);
    assert(row.gates.every(gate => gate.status === 'pass'));
    if (row.context === 'workflow') assert.equal(row.gates.find(gate => gate.name === 'context-states').detail.observations.length, 16);
  }
  assert.deepEqual(source('runtimeValidation').issues, []);
  const tools = source('toolLedger'); assert.equal(tools.rows.length, 24); assert.equal(tools.rows.filter(row => row.registration === 'auto').length, 19);
  const counts = Object.fromEntries(['product-reality', 'contract', 'unit', 'none'].map(tier => [tier, tools.rows.filter(row => row.proofTier === tier).length]));
  assert.deepEqual(counts, { 'product-reality': 19, contract: 5, unit: 0, none: 0 }); assert.deepEqual(counts, tools.summary.byTier);
  const toolProof = source('toolProof'); assert.equal(toolProof.byteIdentical, true); assert.equal(toolProof.sha256, digest(readFrozen(manifest.sources.toolLedger)));
  auditSprint194ToolOutcomes({ tools, portable: source('portable') });
  const retention = source('componentRetention'); assert.equal(retention.base, '1f69c957f4435a0a2f18b168b684de050f7a5f22'); assert.deepEqual(retention.changedPaths, []);
  assert(!source('movers').s194.publicPaths.some(file => /^packages\/(?:component-contracts|component-styles|components-react|components-vue)\//.test(file)), 'Retained component proof requires unchanged component implementation bytes');
  const preFreeze = source('preFreeze'); assert.equal(preFreeze.status, 'passed'); assert.equal(preFreeze.skipped, 0);
  const health = source('health'); assert.equal(health.status, 'ok'); assert.deepEqual(health.productReality.runtime, { ...runtime.summary, head: runtime.head }); assert.deepEqual(health.productReality.tools, { entries: 24, byTier: counts, head: tools.head });
  assert.equal(accounting.status, 'passed'); assert.deepEqual(accounting.validationIssues, []); assert.deepEqual(accounting.unattributedDeltas, []);
  assert.equal(accounting.closeout.runs.length, 1); assert(accounting.closeoutAttempts.length <= 1); assert.equal(accounting.captureExtensionAcceptance, undefined);
  const runs = accounting.executions.filter(row => row.cohort === 'closeout'); assert.equal(runs.length, 5); assert.deepEqual(runs.map(row => row.suite).sort(), ['component-packages', 'mcp-server', 'root-core', 'viz-core', 'viz-render']);
  for (const run of runs) {
    const raw = JSON.parse(verify(run.rawReport)); assert.equal(run.measuredHead, executionHead); const failed = accounting.timeoutAcceptance?.executionId === run.id ? 1 : 0;
    assert.equal(raw.numFailedTests, failed); assert.equal(raw.success, !failed); assert.equal(run.exitCode, failed); assert.equal(raw.numPassedTests, run.counts.passed); assert.equal(raw.numPendingTests, run.counts.skipped);
  }
  if (accounting.timeoutAcceptance) {
    const timeout = accounting.timeoutAcceptance; assert.equal(timeout.decisionId, 1833); assert.equal(accounting.closeoutFailures.length, 1);
    const failure = accounting.closeoutFailures[0]; assert(failure.messages.join('\n').match(/(?:Test|Hook) timed out in \d+ms/)); assert(!failure.messages.join('\n').includes('AssertionError'));
    assert.equal(timeout.rerun.attempts, 1); assert.equal(timeout.rerun.exitCode, 0); assert.equal(timeout.rerun.executionHead, executionHead);
    const raw = JSON.parse(verify(timeout.rerun.rawReport)); verify(timeout.rerun.log); assert.equal(raw.numFailedTests, 0); assert.equal(raw.numPassedTests, 1);
  } else assert.deepEqual(accounting.closeoutFailures, []);
  assert.equal(accounting.comparisons.length, 5); assert.deepEqual(accounting.comparisons.map(row => row.suite).sort(), ['component-packages', 'mcp-server', 'root-core', 'viz-core', 'viz-render']);
  const inputs = (cohort, capture) => { const aggregate = JSON.parse(verify(capture.aggregate)); return accounting.executions.filter(row => row.cohort === cohort && row.suite !== 'component-packages').map(row => ({ suite: row.suite, workspace: aggregate.workspace, platform: aggregate.host.platform, report: JSON.parse(verify(row.rawReport)) })); };
  const skipped = auditSprint190SkippedIdentities(inputs('closeout', accounting.closeout), inputs('sprint193Closeout', accounting.baselines.sprint193Closeout));
  assert.equal(runs.find(row => row.suite === 'component-packages').counts.skipped, 0);
  for (const row of accounting.goldenAttribution.files) { verify({ path: row.file, sha256: row.afterSha256 }); assert.equal(digest(readHistorical(accounting.goldenAttribution.beforeHead, row.file)), row.beforeSha256); assert(row.reason.trim()); }
  const notice = source('noticePlan'); assert.equal(notice.sent, false); assert.equal(notice.sendsExecuted, 0); assert.deepEqual(notice.targets, ['cmos-dashboard', 'forge-demos', 'aquex-mcp']); assert(notice.notices.every(row => row.request.body.includes('Sprint 194 candidate') && row.request.body.includes('19 advertised')));
  const ci = source('ci'); assert.equal(ci.baseRefName, 'OODS-pro'); for (const name of ['coverage', 'product-reality-consumers', 'component-packages', 'a11y-contract', 'portable-runtime', 'runtime-cells', 'viz-determinism']) assert(ci.jobs.some(row => row.name === name && row.runId && row.conclusion === 'success'));
  assert.equal(source('prose').exitCode, 0);
  return { status: 'passed', skipped, gitEvidence, checkedCriteria: expected.length, checkedExecutions: executions.size, checkedFrozenPaths: checked.size, executionHead, reviewHead, builderSelfCertified: false, separateReviewRequired: true };
}
export function auditSprint195BiteIndex(index, readFrozen, runtime) {
  assert.equal(index.head, runtime.head); assert.equal(index.builderSelfCertified, false);
  assert.deepEqual(sorted195(index.rows.map(row => row.id)), ['accuracy-rule', 'retirement-gate', 'runtime-emitter', 'viz-mutations']);
  for (const row of index.rows) {
    assert.equal(row.status, 'passed'); hash195(readFrozen, row.receipt.path, row.receipt.sha256);
    assert.equal(row.missionId, { 'retirement-gate': 's195-m01', 'accuracy-rule': 's195-m04', 'viz-mutations': 's195-m06', 'runtime-emitter': 's195-m07' }[row.id]);
    const raw = read195(readFrozen, row.receipt.path), root = path.posix.dirname(row.receipt.path);
    if (row.id === 'viz-mutations') { auditSprint195Bites(raw, row.receipt.path, readFrozen); continue; }
    if (row.id === 'retirement-gate') {
      assert.equal(raw.bite.redExitCode, 1); assert.equal(raw.bite.greenExitCode, 0); assert.deepEqual(raw.bite.redTests, { passed: 9, failed: 1, skipped: 0 }); assert.deepEqual(raw.bite.greenTests, { passed: 10, failed: 0, skipped: 0 }); assert.equal(raw.bite.scratchRemoved, true);
      assert.match(readFrozen(`${root}/${raw.bite.redLog}`).toString(), /release\.verify/); assert.match(readFrozen(`${root}/${raw.bite.greenLog}`).toString(), /10 passed/);
      let scratch; try { scratch = readFrozen(raw.bite.scratchPath); } catch { /* Expected: the mutation was never committed. */ } assert.equal(scratch, undefined);
    } else if (row.id === 'accuracy-rule') {
      assert.equal(raw.status, 'passed'); assert.equal(raw.restoredByteIdentically, true); assert.equal(raw.mutation.code, 'OODS-V171'); assert.notEqual(raw.mutation.sourceSha256Before, raw.mutation.sourceSha256Disabled); hash195(readFrozen, raw.mutation.path, raw.mutation.sourceSha256Before);
      for (const [name, code] of [['disabled-census', 1], ['restored-census', 0]]) { const command = raw.commands.find(item => item.name === name); assert.equal(command?.exitCode, code); assert(readFrozen(`${root}/${command.log}`).length); }
    } else {
      assert.equal(raw.beforeHash, raw.restoredHash); assert.notEqual(raw.beforeHash, raw.mutatedHash); hash195(readFrozen, raw.source, raw.restoredHash);
      assert.equal(raw.red.status, 'fail'); assert.equal(raw.redSpecExitCode, 1); assert(raw.red.gates.some(gate => gate.name === 'mount' && gate.status === 'fail')); assert.equal(raw.restored.status, 'pass'); assert(raw.restored.gates.every(gate => gate.status === 'pass'));
      for (const value of [raw.red, raw.restored]) { assert.equal(value.head, runtime.head); assert.equal(value.runId, runtime.runId); }
    }
  }
  return { mutationFamilies: 4, visualizationBites: 3 };
}

export function auditSprint195Closeout({ executionHead, reviewHead, readOutput, readFrozen, readHistorical, gitEvidence, publicGitEvidence, rangeGitEvidence, manifestPath, ciChangedPaths }) {
  const base = 'artifacts/product-reality/sprint-195/m07';
  const manifest = JSON.parse(readFrozen(manifestPath));
  const ledger = JSON.parse(readOutput(`${base}/closeout/claim-ledger.json`));
  const handoff = JSON.parse(readOutput(`${base}/closeout/review-handoff.json`));
  const accounting = JSON.parse(readOutput(`${base}/closeout/suite-accounting.json`));
  const checked = new Set();
  const verify = ref => { assert(ref.path && !path.isAbsolute(ref.path) && !ref.path.split('/').includes('..')); const bytes = readFrozen(ref.path); assert.equal(digest(bytes), bare(ref.sha256), ref.path); checked.add(ref.path); return bytes; };
  const source = key => JSON.parse(readFrozen(manifest.sources[key]));
  for (const result of [ledger, handoff]) {
    assert.equal(result.builderSelfCertified, false); assert.equal(result.separateReviewRequired, true); assert.equal(result.sprintStatus, 'Active');
    assert.equal(result.executionHead, executionHead); assert.equal(result.reviewHead, reviewHead); assert.equal(result.implementationHead, manifest.implementationHead);
  }
  assert.equal(handoff.evidenceCommit, reviewHead); assert.equal(handoff.exportVersion, '2026-09-11-s195-m07');
  assert.equal(gitEvidence.ancestor, true);
  assert.equal(accounting.executionHead, executionHead); assert.equal(accounting.reviewHead, reviewHead);
  assert.equal(accounting.headRelation.ancestor, true);
  assert.deepEqual(accounting.headRelation.changedEvidencePaths, gitEvidence.changes);
  assert.equal(accounting.headRelation.executableInputsUnchanged, true);
  for (const change of gitEvidence.changes) {
    assert.equal(change.status, 'A');
    assert(/^artifacts\/product-reality\/sprint-195\/m07\/(?:five-suite-closeout[^/]*|closeout|ci)\/.*\.(?:json|log|md)$/.test(change.path), change.path);
  }

  for (const ref of [...ledger.references, ...accounting.references]) verify(ref);
  assert.equal(source('missions').sprint.id, 'sprint-195'); assert.equal(source('missions').sprint.status, 'Active');
  const claimCounts = auditSprint195Claims({ missions: source('missions').missions, claims: ledger.claims, executions: ledger.executions, verify, readHistorical });
  assert(publicGitEvidence.ancestor); assert.deepEqual(publicGitEvidence.changedPaths, []); assert.deepEqual(publicGitEvidence.scope, publicScope195);
  const movers = source('movers'); assert.equal(rangeGitEvidence.base, S195_BUILD_BASE); assert.equal(rangeGitEvidence.head, manifest.implementationHead);
  const declared = read195(readFrozen, `${base}/movers/declared-movers.json`); for (const key of ['canonicalPaths', 'publicPaths']) assert.deepEqual(declared.s195[key], rangeGitEvidence[key]);
  for (const key of ['canonicalPaths', 'publicPaths']) assert.deepEqual(movers.s195[key], rangeGitEvidence[key]);
  const capability = source('componentLedger'), exported = source('componentExport'); assert.equal(capability.rows.length, 109); assert.equal(capability.approvedRuntimeCensus, null);
  const count = (surface, state) => capability.rows.filter(row => row.surfaces[surface].state === state).length;
  assert.equal(count('react', 'implemented-evidence-complete'), 109); assert.equal(count('vue', 'implemented-evidence-complete'), 109); assert.equal(count('html', 'mapped'), 109);
  assert.equal(count('accessibility', 'verified'), 109); assert.equal(count('theme', 'verified'), 109); assert.equal(count('interaction', 'verified'), 40); assert.equal(count('interaction', 'not-applicable'), 69);
  for (const row of capability.rows) {
    assert.deepEqual(row.surfaces, exported.components.find(entry => entry.id === row.id).productReality.surfaces);
    for (const surface of ['accessibility', 'theme', 'interaction']) { assert.notEqual(row.surfaces[surface].state, 'unverified'); if (['not-applicable', 'unavailable'].includes(row.surfaces[surface].state)) assert(row.surfaces[surface].reason); }
  }
  const proof = source('componentProof'); assert.match(proof.head, /^[a-f0-9]{40}$/); proof.references.forEach(verify);
  assert.equal(proof.head, manifest.implementationHead); assert.equal(proof.status, 'passed'); assert(proof.sourceInputs.length > 0);
  assert.deepEqual(sorted195(proof.sourceInputs.map(row => row.path)), rangeGitEvidence.componentInputs); for (const input of proof.sourceInputs) { verify(input); assert.equal(digest(readHistorical(manifest.implementationHead, input.path)), bare(input.sha256)); }
  assert.deepEqual(sorted195(proof.executions.map(row => row.reportPath)), sorted195(['reactTheme', 'vueTheme', 'reactMeasured', 'vueMeasured'].map(key => manifest.sources[key])));
  for (const row of proof.executions) { assert.equal(row.headBefore, manifest.implementationHead); assert.equal(row.headAfter, manifest.implementationHead); assert.equal(row.exitCode, 0); assert(row.command.trim() && readFrozen(safe195(row.log)).length); }
  for (const key of ['reactTheme', 'vueTheme', 'reactMeasured', 'vueMeasured']) { assert(manifest.sources[key].startsWith(base + '/')); assert(proof.references.some(ref => ref.path === manifest.sources[key])); }
  for (const target of ['react', 'vue']) {
    const report = source(`${target}Measured`); assert.equal(report.success, true); assert.equal(report.numPendingTests, 0); assert.equal(report.numFailedTests, 0);
    const axe = report.testResults.filter(row => /accessibility\.spec\./.test(row.name)).flatMap(row => row.assertionResults).filter(row => /shared scenario/.test(row.fullName)); assert.equal(axe.length, 109); assert(axe.every(row => row.status === 'passed'));
    auditSprint195Theme({ report: source(`${target}Theme`), reportPath: manifest.sources[`${target}Theme`], target, ids: capability.rows.map(row => row.id), readFrozen });
  }
  const composition = source('componentCensus'); assert.equal(composition.head, manifest.implementationHead); assert.equal(composition.allRows.length, 77); assert.equal(composition.greenTotalCells, 154); assert(composition.allRows.every(row => row.green && row.cells.every(cell => cell.errors.length === 0)));
  const movement = source('schemaMovement'); assert.equal(movement.changedSchemas + movement.unchangedSchemas, 77); assert.deepEqual(movement.unattributedChanges, []); assert.equal(movement.rows.length, movement.changedSchemas); assert.equal(Object.values(movement.classes).reduce((a, b) => a + b, 0), movement.changedSchemas);
  assert.equal(source('originalStore').reachable, 15); assert.equal(source('successorStore').reachable, 16); assert.equal(source('compatibility').changedLiveFiles, 0); assert.equal(source('compatibility').liveStoreFiles, 17);
  const taxonomy = source('taxonomy');
  auditSprint195Viz({ registry: source('registry'), observations: source('vizObservations'), patterns: source('patternRegistry'), patternCensus: source('patternCensus'), taxonomy,
    classification: read195(readFrozen, 'packages/viz-core/src/registry/viz-classification.v1.json'), patternSources: read195(readFrozen, 'packages/viz-core/src/patterns/viz-pattern-sources.v1.json'), readFrozen });
  assert.deepEqual(source('vizCensus'), source('registry'));
  const taxonomyCensus = source('taxonomyCensus'); assert.equal(taxonomyCensus.status, 'passed'); assert.equal(taxonomyCensus.head, manifest.implementationHead); assert.deepEqual(taxonomyCensus.summary, taxonomy.summary); assert.equal(taxonomyCensus.sha256, digest(readFrozen(manifest.sources.taxonomy)));
  for (const key of ['runtime', 'dashboardRuntime', 'runtimePlacement', 'vizObservations', 'patternCensus']) assert(manifest.sources[key].startsWith(base + '/'), `Fresh195 proof expected: ${key}`);
  auditSprint195CertificationProfiles(read195(readFrozen, 'artifacts/product-reality/sprint-195/m04/certify/after.json'));
  const runtime = source('runtime');
  auditSprint195Runtime({ runtime, dashboard: source('dashboardRuntime'), placement: source('runtimePlacement'), runtimePath: manifest.sources.runtime, dashboardPath: manifest.sources.dashboardRuntime, head: manifest.implementationHead, readFrozen });
  assert.deepEqual(source('runtimeValidation').issues, []);
  auditSprint195BiteIndex(source('bitesIndex'), readFrozen, runtime);
  auditSprint195Soak(source('soak'), manifest.sources.soak, readFrozen);
  const decisions = source('missions').decisions;
  for (const id of [1944, 1946]) { assert(decisions.some(row => row.id === id)); assert(ledger.claims.some(row => row.missionId === 's195-m06' && row.decisionIds?.includes(id) && row.status === 'proven-with-documented-limit')); }
  auditSprint195Attribution({ attribution: source('moverAttribution'), movers, migration: source('paletteMigration'), readFrozen, readHistorical, rangeGitEvidence });
  const tools = source('toolLedger'); assert.equal(tools.rows.length, 24); assert.equal(tools.rows.filter(row => row.registration === 'auto').length, 19);
  const counts = Object.fromEntries(['product-reality', 'contract', 'unit', 'none'].map(tier => [tier, tools.rows.filter(row => row.proofTier === tier).length]));
  assert.deepEqual(counts, { 'product-reality': 19, contract: 5, unit: 0, none: 0 }); assert.deepEqual(counts, tools.summary.byTier);
  auditSprint195ToolProof({ tools, proof: source('toolProof'), implementationHead: manifest.implementationHead, ledgerPath: manifest.sources.toolLedger, readFrozen });
  auditSprint194ToolOutcomes({ tools, portable: source('portable') });
  const retention = source('componentRetention'); assert.equal(retention.base, S195_BUILD_BASE); assert.deepEqual(retention.changedPaths, []);
  assert(!source('movers').s195.publicPaths.some(file => /^packages\/(?:component-contracts|component-styles|components-react|components-vue)\//.test(file)), 'Retained component proof requires unchanged component implementation bytes');
  const preFreeze = source('preFreeze'); assert.equal(preFreeze.status, 'passed'); assert.equal(preFreeze.skipped, 0);
  const health = source('health'); assert.equal(health.status, 'ok'); assert.deepEqual(health.productReality.runtime, { ...runtime.summary, head: runtime.head }); assert.deepEqual(health.productReality.tools, { entries: 24, byTier: counts, head: tools.head });
  assert.equal(accounting.status, 'passed'); assert.deepEqual(accounting.validationIssues, []); assert.deepEqual(accounting.unattributedDeltas, []);
  assert.equal(accounting.closeout.runs.length, 1); assert(accounting.closeoutAttempts.length <= 1); assert.equal(accounting.captureExtensionAcceptance, undefined);
  const runs = accounting.executions.filter(row => row.cohort === 'closeout'); assert.equal(runs.length, 5); assert.deepEqual(runs.map(row => row.suite).sort(), ['component-packages', 'mcp-server', 'root-core', 'viz-core', 'viz-render']);
  for (const run of runs) {
    const raw = JSON.parse(verify(run.rawReport)); assert.equal(run.measuredHead, executionHead); const failed = 0;
    assert.equal(raw.numFailedTests, failed); assert.equal(raw.success, !failed); assert.equal(run.exitCode, failed); assert.equal(raw.numPassedTests, run.counts.passed); assert.equal(raw.numPendingTests, run.counts.skipped);
  }
  assert.equal(accounting.timeoutAcceptance, undefined); assert.deepEqual(accounting.closeoutFailures, []);
  assert.equal(accounting.comparisons.length, 5); assert.deepEqual(accounting.comparisons.map(row => row.suite).sort(), ['component-packages', 'mcp-server', 'root-core', 'viz-core', 'viz-render']);
  assert.deepEqual(health.productReality.viz, taxonomy.summary);
  const inputs = (cohort, capture) => { const aggregate = JSON.parse(verify(capture.aggregate)); return accounting.executions.filter(row => row.cohort === cohort && row.suite !== 'component-packages').map(row => ({ suite: row.suite, workspace: aggregate.workspace, platform: aggregate.host.platform, report: JSON.parse(verify(row.rawReport)) })); };
  const skipped = auditSprint190SkippedIdentities(inputs('closeout', accounting.closeout), inputs('sprint194Closeout', accounting.baselines.sprint194Closeout));
  assert.equal(runs.find(row => row.suite === 'component-packages').counts.skipped, 0);
  for (const row of accounting.goldenAttribution.files) { verify({ path: row.file, sha256: row.afterSha256 }); assert.equal(digest(readHistorical(accounting.goldenAttribution.beforeHead, row.file)), row.beforeSha256); assert(row.reason.trim()); }
  const notice = source('noticePlan'); assert.equal(notice.sent, false); assert.equal(notice.sendsExecuted, 0); assert.deepEqual(notice.targets, ['cmos-dashboard', 'forge-demos', 'aquex-mcp']); assert(notice.notices.every(row => row.request.body.includes('Sprint 195 candidate') && row.request.body.includes('19 advertised')));
  auditSprint195Ci({ ci: source('ci'), implementationHead: manifest.implementationHead, readFrozen, changedPaths: ciChangedPaths });
  assert.equal(notice.deliverySprint, 'sprint-196'); assert.equal(notice.implementationHead, manifest.implementationHead);
  for (const item of notice.notices) { assert.equal(digest(JSON.stringify(item.request)), item.requestSha256); for (const term of ['pattern', 'hc', 'spec-only', 'productReality.viz', 'builderSelfCertified:false']) assert(item.request.body.includes(term)); }
  assert.equal(source('prose').exitCode, 0); assert(readFrozen(manifest.sources.near).toString().includes('Increment 14 — Sprint 195: Visualization breadth and certification — BUILT, REVIEW PENDING'));
  return { status: 'passed', skipped, gitEvidence, checkedCriteria: claimCounts.criteria, checkedExecutions: claimCounts.executions, checkedFrozenPaths: checked.size, executionHead, reviewHead, builderSelfCertified: false, separateReviewRequired: true };
}


export function auditSprint196HeadRelations({ relation, actual, implementationHead, executionHead, readFrozen, readHistorical, runtimePath, releasePath }) {
  const allowed = ['packages/mcp-server/registry/release-cells.v1.json', 'packages/mcp-server/registry/runtime-cells.v1.json'];
  assert.equal(relation.implementationHead, implementationHead); assert.equal(relation.executionHead, executionHead); assert.equal(relation.carryHead, executionHead);
  assert.equal(actual.ancestor, true); assert.equal(actual.implementationHead, implementationHead); assert.equal(actual.executionHead, executionHead); assert.deepEqual(actual.scope, publicScope196);
  assert.deepEqual(relation.allowedLedgerPaths.slice().sort(), allowed); assert.deepEqual(relation.excludedDocumentationPaths, ['cmos/foundational-docs/roadmap/near.md']);
  assert.deepEqual(relation.changedPaths, actual.changedPaths); assert(actual.changedPaths.every(file => allowed.includes(file) || file === 'cmos/foundational-docs/roadmap/near.md'));
  assert.deepEqual(relation.references.map(row => row.path).sort(), allowed);
  for (const ref of relation.references) { const bytes = readFrozen(ref.path); assert.equal(digest(bytes), bare(ref.sha256)); assert.equal(digest(readHistorical(executionHead, ref.path)), bare(ref.sha256)); const value = JSON.parse(bytes); assert.equal(value.bundleHead ?? value.head, implementationHead); const snapshot = ref.path.includes('/release-') ? releasePath : runtimePath; assert(Buffer.from(bytes).equals(readFrozen(snapshot)), `Canonical ledger differs from measured snapshot: ${ref.path}`); }
}

export function auditSprint196Release({ release, releasePath, measurementManifest, head, readFrozen }) {
  const folder = path.posix.dirname(releasePath), read = file => read195(readFrozen, `${folder}/${file}`);
  assert.equal(release.bundleHead, head); assert.equal(measurementManifest.commit, head); assert.equal(measurementManifest.dirty, false); assert.equal(release.archiveSha256, measurementManifest.archive.sha256); assert(measurementManifest.archive.byteSize > 0);
  assert.equal(release.packCount, 1); assert.equal(release.historicalReceiptsUnioned, false);
  const ids = new Set(); assert.equal(release.rows.length, 42);
  const identity = read('bundle-identity.json'); assert.equal(identity.manifestVerified, true); assert.equal(identity.bundleHead, head); assert.equal(identity.archiveSha256, release.archiveSha256); assert.equal(identity.source.productSourcesMatch, true);
  const inventory = read('submitted-packages/inventory.json'); assert.equal(inventory.length, 5); assert.equal(new Set(inventory.map(row => row.name)).size, 5);
  for (const item of inventory) hash195(readFrozen, `${folder}/${item.artifactPath}`, item.sha256);
  const browser = read('browser.json'); assert.equal(browser.image, release.browserImage); assert.equal(browser.version, '141.0.7390.37'); assert.match(browser.userAgent, /Linux/);
  const verifyFiles = value => { if (!value || typeof value !== 'object') return; if (value.path && value.hash) hash195(readFrozen, `${folder}/${value.path}`, value.hash); for (const child of Object.values(value)) if (typeof child === 'object') verifyFiles(child); };
  for (const cell of release.rows) {
    assert(['Organization', 'Subscription', 'User'].includes(cell.object)); assert(['card', 'detail', 'form', 'inline', 'list', 'timeline', 'workflow'].includes(cell.context)); assert(['react', 'vue'].includes(cell.framework)); ids.add(`${cell.object}/${cell.context}/${cell.framework}`);
    assert.equal(cell.status, 'pass'); assert.equal(cell.head, head); assert.equal(cell.bundleHead, head); assert.equal(cell.archiveSha256, release.archiveSha256); assert.equal(cell.runId, release.runId); assert.match(cell.artifactHash, /^sha256:[0-9a-f]{64}$/); assert.equal(cell.hostArtifactHash, cell.artifactHash); assert.equal(cell.hashEqualToHost, true);
    assert.deepEqual(read(cell.report), cell); assert(cell.gates.every(gate => gate.status === 'pass')); cell.gates.forEach(gate => verifyFiles(gate.detail));
    const expected = ['generation', 'fresh-exact-tarball-install', 'strict-typecheck', 'production-build', 'mount', 'accessibility-tree', 'screenshots', 'context-states', ...(cell.context === 'workflow' ? ['server-render', 'hydration', 'shared-css-resolution', 'interaction-evidence'] : [])];
    for (const name of expected) assert.equal(cell.gates.filter(gate => gate.name === name).length, 1);
    assert.equal(cell.gates.find(gate => gate.name === 'generation').detail.artifactHash, cell.artifactHash);
    const installation = cell.gates.find(gate => gate.name === 'fresh-exact-tarball-install').detail;
    if (cell.context === 'workflow') { const original = read(installation.report); assert.equal(original.artifactHash, cell.artifactHash); assert.deepEqual(original.gates.find(gate => gate.name === 'fresh-exact-tarball-install').detail, installation.observation); assert.equal(installation.observation.isolation.localPackagesFromBuiltTarballsOnly, true); assert.equal(installation.observation.isolation.installScripts, false); }
    else for (const item of installation.tarballs) assert.equal(bare(item.sha256), bare(inventory.find(row => row.name === item.name)?.sha256));
    const sub = cell.context === 'workflow' ? `workflows/${cell.object}/parity` : `${path.posix.dirname(cell.report)}/parity`;
    const comparisons = read(`${sub}/generation-comparisons.json`).filter(row => row.framework === cell.framework); assert(comparisons.some(row => row.bundleArtifactHash === cell.artifactHash));
    for (const proof of comparisons) {
      assert.equal(proof.bundleHead, head); assert.equal(proof.hashEqualToHost, true); assert.equal(proof.hostArtifactHash, proof.bundleArtifactHash);
      const host = read(`${sub}/${proof.hostResponse}`), bundle = read(`${sub}/${proof.bundleResponse}`); assert.equal(host.status, 'ok'); assert.equal(bundle.status, 'ok'); assert.equal(host.artifact.contentHash, proof.hostArtifactHash); assert.equal(bundle.artifact.contentHash, proof.bundleArtifactHash); assert.deepEqual(host.artifact, bundle.artifact);
      hash195(readFrozen, `${folder}/${sub}/${proof.bundleResponse.replace('-bundle.json', '-request.json')}`, proof.requestHash);
    }
  }
  assert.equal(ids.size, 42); const summary = { cells: release.rows.length, pass: release.rows.filter(row => row.status === 'pass').length, typedGap: 0, fail: 0 }; assert.deepEqual(release.summary, summary);
  return { ...summary, bundleHead: head, archiveSha256: release.archiveSha256, apps: ['Organization', 'Subscription', 'User'], frameworks: ['react', 'vue'] };
}

export function auditSprint196Attestation({ attestation, head, readHistorical }) {
  assert.equal(attestation.sourceHead, head); assert.equal(attestation.schemaVersion, 'forge-readiness-attestation/v1');
  const order = value => Array.isArray(value) ? value.map(order) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, order(value[key])])) : value;
  const payload = { ...attestation }; delete payload.sha256; assert.equal(digest(JSON.stringify(order(payload), null, 2) + '\n'), attestation.sha256);
  const shipped = new Map(attestation.shippedPackageHashes.map(row => [row.path, row.sha256])); assert.equal(shipped.size, attestation.shippedPackageHashes.length); assert(shipped.size > 0);
  const hashes = new Map();
  for (const target of ['react', 'vue']) { const rows = attestation.targets[target].rows; assert.equal(rows.length, 109); assert.equal(new Set(rows.map(row => row.componentId)).size, 109);
    for (const row of rows) { assert.equal(row.emissionEligible, true); assert.deepEqual([...new Set(row.references.map(ref => ref.class))].sort(), ['dependencyClosure', 'frameworkScenario', 'packageExport', 'publicDeclaration', 'targetImplementation', 'versionedContract']);
      for (const ref of row.references) { assert.match(ref.sha256, /^[0-9a-f]{64}$/); if (ref.referenceClass === 'A') { if (!hashes.has(ref.path)) hashes.set(ref.path, digest(readHistorical(head, ref.path))); assert.equal(hashes.get(ref.path), ref.sha256); } else { assert.equal(ref.referenceClass, 'B'); assert.equal(shipped.get(ref.path), ref.sha256); } }
    }
  }
}

export function auditSprint196Roadmap(text) {
  const heading = '## Increment 15 — Sprint 196: Release proof — BUILT, REVIEW PENDING';
  assert.equal(text.split('\n').filter(line => line === heading).length, 1);
  assert(/\[[^\]]+\]\([^)]*forge-gate2-decision-packet\.md[^)]*\)/.test(text));
}

export function auditSprint196Portable({ report, archive, releaseSummary, nodeMajor }) {
  assert.equal(report.status, 'pass'); assert.match(report.nodeVersion, nodeMajor === 20 ? /^v20\.11\.1$/ : /^v24\./);
  assert.equal(report.manifest.commit, archive.commit); assert.equal(report.manifest.dirty, false); assert.equal(report.manifest.payloadTreeSha256, archive.payloadTreeSha256);
  assert.equal(report.tools.names.length, 19); assert.equal(new Set(report.tools.names).size, 19);
  const outcomes = report.calls.outcomes; assert.equal(Object.keys(outcomes).length, 19); assert.equal(Object.values(outcomes).filter(row => row.outcome === 'pass').length, 17);
  assert.deepEqual(Object.keys(outcomes).filter(key => outcomes[key].outcome === 'typed').sort(), ['brand.apply', 'design.preview']); assert.equal(outcomes['brand.apply'].code, 'OODS-N020'); assert.equal(outcomes['design.preview'].code, 'OODS-N019');
  assert.equal(report.calls.bridge.parity, true); assert.equal(report.calls.bridge.revision.commit, archive.commit); assert.equal(report.calls.bridge.tools.length, 19); assert.equal(report.calls.bridge.termination.code, 0);
  assert.deepEqual(report.calls.health.release, releaseSummary); assert.deepEqual(outcomes.health.release, releaseSummary);
  assert.equal(report.extractionTree.before, report.extractionTree.after); assert.equal(report.extractionTree.restoredAfterScopedWrites, true); assert.equal(report.lifecycle.stdinClose.exited, true); assert.equal(report.lifecycle.stdinClose.code, 0); assert.equal(report.lifecycle.restart.sigterm.code, 0); assert.equal(report.lifecycle.restart.sigterm.forcedKill, false);
}

export function auditSprint196Attribution({ attribution, movers, migration, readFrozen, readHistorical, rangeGitEvidence }) {
  assert.equal(attribution.base, S196_BUILD_BASE); assert.equal(attribution.head, movers.s196.head); assert.deepEqual(attribution.unattributedPaths, []);
  assert.equal(rangeGitEvidence.base, S196_BUILD_BASE); assert.equal(rangeGitEvidence.head, attribution.head);
  assert.deepEqual(sorted195(attribution.rows.map(row => row.path)), sorted195(movers.s196.publicPaths)); assert.equal(new Set(attribution.rows.map(row => row.path)).size, attribution.rows.length);
  hash195(readFrozen, attribution.patch.path, attribution.patch.sha256);
  assert.equal(readFrozen(attribution.patch.path).toString(), rangeGitEvidence.patch, 'The retained advertised patch omits or alters a Git hunk');
  for (const row of attribution.rows) {
    assert(row.missions.length && row.commits.length && row.reason?.trim()); assert(row.missions.every(mission => /^s196-m0[1-7]$/.test(mission))); assert(row.commits.every(fullHead));
    assert(row.evidence.length); for (const ref of row.evidence) hash195(readFrozen, ref.path, ref.sha256);
    const filePatch = rangeGitEvidence.patches.filter(item => item.path === row.path).map(item => item.patch);
    assert.equal(filePatch.length, 1, `Missing advertised file patch: ${row.path}`);
    const headers = filePatch[0].split('\n').filter(line => line.startsWith('@@ '));
    assert.deepEqual(row.hunks.map(hunk => hunk.header), headers.length ? headers : ['file-metadata'], `Missing or invented attributed hunk in ${row.path}`);
    assert(row.hunks.length); for (const hunk of row.hunks) { assert(hunk.reason.trim() && hunk.missions.length && hunk.commits.length); assert(hunk.missions.every(id => row.missions.includes(id))); assert(hunk.commits.every(id => row.commits.includes(id))); }
    for (const [head, expected] of [[S196_BUILD_BASE, row.beforeSha256], [attribution.head, row.afterSha256]]) {
      assert(expected === null || /^[a-f0-9]{64}$/.test(expected));
      let observed = null; try { observed = digest(readHistorical(head, row.path)); } catch (error) { if (expected !== null) throw error; } assert.equal(observed, expected, `Attribution bytes differ at ${head}:${row.path}`);
    }
  }
  return { paths: attribution.rows.length };
}

export function auditSprint196Closeout({ executionHead, reviewHead, readOutput, readFrozen, readHistorical, gitEvidence, publicGitEvidence, rangeGitEvidence, manifestPath, ciChangedPaths }) {
  const base = 'artifacts/product-reality/sprint-196/m07';
  const manifest = JSON.parse(readFrozen(manifestPath));
  const ledger = JSON.parse(readOutput(`${base}/closeout/claim-ledger.json`));
  const handoff = JSON.parse(readOutput(`${base}/closeout/review-handoff.json`));
  const accounting = JSON.parse(readOutput(`${base}/closeout/suite-accounting.json`));
  const checked = new Set();
  const verify = ref => { assert(ref.path && !path.isAbsolute(ref.path) && !ref.path.split('/').includes('..')); const bytes = readFrozen(ref.path); assert.equal(digest(bytes), bare(ref.sha256), ref.path); checked.add(ref.path); return bytes; };
  const source = key => JSON.parse(readFrozen(manifest.sources[key]));
  for (const result of [ledger, handoff]) {
    assert.equal(result.builderSelfCertified, false); assert.equal(result.separateReviewRequired, true); assert.equal(result.sprintStatus, 'Active');
    assert.equal(result.executionHead, executionHead); assert.equal(result.reviewHead, reviewHead); assert.equal(result.implementationHead, manifest.implementationHead);
  }
  assert.equal(handoff.evidenceCommit, reviewHead); assert.equal(handoff.exportVersion, '2026-09-12-s196-m07');
  assert.equal(gitEvidence.ancestor, true);
  assert.equal(accounting.executionHead, executionHead); assert.equal(accounting.reviewHead, reviewHead);
  assert.equal(accounting.headRelation.ancestor, true);
  assert.deepEqual(accounting.headRelation.changedEvidencePaths, gitEvidence.changes);
  assert.equal(accounting.headRelation.executableInputsUnchanged, true);
  for (const change of gitEvidence.changes) {
    assert.equal(change.status, 'A');
    assert(/^(?:artifacts\/product-reality\/sprint-196\/m07\/(?:five-suite-closeout[^/]*|closeout|ci|movers|final-archive)\/.*\.(?:json|log|md|patch|txt|sha256)|artifacts\/product-reality\/sprint-196\/m07\/e2e-node(?:20|24)\.json)$/.test(change.path), change.path);
  }

  for (const ref of [...ledger.references, ...accounting.references]) verify(ref);
  assert.equal(source('missions').sprint.id, 'sprint-196'); assert.equal(source('missions').sprint.status, 'Active');
  const claimCounts = auditSprint196Claims({ missions: source('missions').missions, claims: ledger.claims, executions: ledger.executions, verify, readHistorical });
  auditSprint196HeadRelations({ relation: source('headRelations'), actual: publicGitEvidence, implementationHead: manifest.implementationHead, executionHead, readFrozen, readHistorical, runtimePath: manifest.sources.runtime, releasePath: manifest.sources.release });
  const movers = source('movers'); assert.equal(rangeGitEvidence.base, S196_BUILD_BASE); assert.equal(rangeGitEvidence.head, executionHead);
  const declared = read195(readFrozen, `${base}/movers/declared-movers.json`); for (const key of ['canonicalPaths', 'publicPaths']) assert.deepEqual(declared.s196[key], rangeGitEvidence[key]);
  for (const key of ['canonicalPaths', 'publicPaths']) assert.deepEqual(movers.s196[key], rangeGitEvidence[key]);
  const capability = source('componentLedger'), exported = source('componentExport'); assert.equal(capability.rows.length, 109); assert.equal(capability.approvedRuntimeCensus, null);
  const count = (surface, state) => capability.rows.filter(row => row.surfaces[surface].state === state).length;
  assert.equal(count('react', 'implemented-evidence-complete'), 109); assert.equal(count('vue', 'implemented-evidence-complete'), 109); assert.equal(count('html', 'mapped'), 109);
  assert.equal(count('accessibility', 'verified'), 109); assert.equal(count('theme', 'verified'), 109); assert.equal(count('interaction', 'verified'), 40); assert.equal(count('interaction', 'not-applicable'), 69);
  for (const row of capability.rows) {
    assert.deepEqual(row.surfaces, exported.components.find(entry => entry.id === row.id).productReality.surfaces);
    for (const surface of ['accessibility', 'theme', 'interaction']) { assert.notEqual(row.surfaces[surface].state, 'unverified'); if (['not-applicable', 'unavailable'].includes(row.surfaces[surface].state)) assert(row.surfaces[surface].reason); }
  }
  const proof = source('componentProof'); assert.match(proof.head, /^[a-f0-9]{40}$/); proof.references.forEach(verify);
  assert.equal(proof.retained, true); assert.equal(proof.retentionBase, S196_BUILD_BASE); assert.equal(proof.implementationHead, manifest.implementationHead); assert.equal(proof.status, 'passed'); assert(proof.sourceInputs.length > 0);
  assert.deepEqual(sorted195(proof.sourceInputs.map(row => row.path)), rangeGitEvidence.componentInputs); for (const input of proof.sourceInputs) { verify(input); assert.equal(digest(readHistorical(manifest.implementationHead, input.path)), bare(input.sha256)); }
  for (const ref of proof.sourceInputs) assert.equal(digest(readHistorical(S196_BUILD_BASE, ref.path)), bare(ref.sha256));
  for (const key of ['reactTheme', 'vueTheme', 'reactMeasured', 'vueMeasured']) { assert(manifest.sources[key].startsWith('artifacts/product-reality/sprint-195/m07/')); assert(proof.references.some(ref => ref.path === manifest.sources[key])); assert(Buffer.from(readFrozen(manifest.sources[key])).equals(readHistorical(S196_BUILD_BASE, manifest.sources[key]))); }
  for (const target of ['react', 'vue']) {
    const report = source(`${target}Measured`); assert.equal(report.success, true); assert.equal(report.numPendingTests, 0); assert.equal(report.numFailedTests, 0);
    const axe = report.testResults.filter(row => /accessibility\.spec\./.test(row.name)).flatMap(row => row.assertionResults).filter(row => /shared scenario/.test(row.fullName)); assert.equal(axe.length, 109); assert(axe.every(row => row.status === 'passed'));
    auditSprint195Theme({ report: source(`${target}Theme`), reportPath: manifest.sources[`${target}Theme`], target, ids: capability.rows.map(row => row.id), readFrozen });
  }
  const composition = source('componentCensus'); assert.equal(composition.head, manifest.implementationHead); assert.equal(composition.allRows.length, 77); assert.equal(composition.greenTotalCells, 154); assert(composition.allRows.every(row => row.green && row.cells.every(cell => cell.errors.length === 0)));
  const movement = source('schemaMovement'); assert.equal(movement.changedSchemas, 0); assert.equal(movement.unchangedSchemas, 77); assert.deepEqual(movement.unattributedChanges, []); assert.equal(movement.rows.length, movement.changedSchemas); assert.equal(Object.values(movement.classes).reduce((a, b) => a + b, 0), movement.changedSchemas);
  assert.equal(source('originalStore').reachable, 15); assert.equal(source('successorStore').reachable, 16); assert.equal(source('compatibility').changedLiveFiles, 0); assert.equal(source('compatibility').liveStoreFiles, 17);
  const taxonomy = source('taxonomy');
  auditSprint195Viz({ registry: source('registry'), observations: source('vizObservations'), patterns: source('patternRegistry'), patternCensus: source('patternCensus'), taxonomy,
    classification: read195(readFrozen, 'packages/viz-core/src/registry/viz-classification.v1.json'), patternSources: read195(readFrozen, 'packages/viz-core/src/patterns/viz-pattern-sources.v1.json'), readFrozen });
  assert.deepEqual(source('vizCensus'), source('registry'));
  const taxonomyCensus = source('taxonomyCensus'); assert.equal(taxonomyCensus.status, 'passed'); assert.equal(taxonomyCensus.head, manifest.implementationHead); assert.deepEqual(taxonomyCensus.summary, taxonomy.summary); assert.equal(taxonomyCensus.sha256, digest(readFrozen(manifest.sources.taxonomy)));
  for (const key of ['runtime', 'dashboardRuntime', 'runtimePlacement', 'vizObservations', 'patternCensus']) assert(manifest.sources[key].startsWith(base + '/'), `Fresh195 proof expected: ${key}`);
  const runtime = source('runtime');
  auditSprint195Runtime({ runtime, dashboard: source('dashboardRuntime'), placement: source('runtimePlacement'), runtimePath: manifest.sources.runtime, dashboardPath: manifest.sources.dashboardRuntime, head: manifest.implementationHead, readFrozen });
  assert.deepEqual(source('runtimeValidation').issues, []);
  const missionEvidence = source('missionEvidence'); assert.equal(missionEvidence.missionId, 's196-m07'); assert.deepEqual(missionEvidence.records.map(row => row.missionId).sort(), Array.from({ length: 6 }, (_, i) => `s196-m0${i + 1}`)); for (const row of missionEvidence.records) { assert(row.references.length); row.references.forEach(verify); }
  const delivered = read195(readFrozen, 'artifacts/product-reality/sprint-196/m01/verification.json'); assert.equal(delivered.status, 'passed'); assert(delivered.successCriteria.every(row => row.status === 'passed')); assert.equal(delivered.successCriteria.find(row => row.sendsExecuted !== undefined).sendsExecuted, 3);
  const docBites = read195(readFrozen, 'artifacts/product-reality/sprint-196/m05/doc-bites/bites.json'); assert.equal(docBites.records.length, 11); assert.equal(docBites.summary.failed, 0); assert.equal(docBites.allRestoredByteIdentically, true); for (const row of docBites.records) { assert.equal(row.beforeSha256, row.restoredSha256); assert.equal(row.restoredByteIdentically, true); assert(row.commands.some(command => command.exitCode !== 0)); assert.equal(row.commands.at(-1).exitCode, 0); }
  const bundleBites = read195(readFrozen, 'artifacts/product-reality/sprint-196/m05/bundle-bites/verification.json'); assert.equal(bundleBites.status, 'passed'); assert.deepEqual(bundleBites.summary, { bites: 4, passed: 4, failed: 0, restored: 4 }); assert.equal(bundleBites.originalArchiveSha256After, bundleBites.archive.sha256);
  const utc = read195(readFrozen, 'artifacts/product-reality/sprint-196/m05/timezone-bite/verification.json'); assert.equal(utc.primarySvg.baselineEqual, 16); assert.equal(utc.primarySvg.mutatedDifferent, 16); assert.equal(utc.primarySvg.mutatedAssertionExitCode, 1); assert.equal(utc.primarySvg.restoredEqual, 16); assert.equal(utc.restoration.sourceBytesAndModesRestored, true); assert.equal(utc.restoration.matchesBaselineWholeDist, true);
  const gate2 = read195(readFrozen, 'artifacts/product-reality/sprint-196/m06/verification.json'); assert.equal(gate2.status, 'passed'); assert.equal(gate2.approvalDecisionId, 1952); assert.deepEqual(gate2.constraints, { active: 7, archived: 5, modified: false }); gate2.sourceHashes.forEach(verify);
  auditSprint196Attribution({ attribution: source('moverAttribution'), movers, readFrozen, readHistorical, rangeGitEvidence });
  const tools = source('toolLedger'); assert.equal(tools.rows.length, 24); assert.equal(tools.rows.filter(row => row.registration === 'auto').length, 19);
  const counts = Object.fromEntries(['product-reality', 'contract', 'unit', 'none'].map(tier => [tier, tools.rows.filter(row => row.proofTier === tier).length]));
  assert.deepEqual(counts, { 'product-reality': 19, contract: 5, unit: 0, none: 0 }); assert.deepEqual(counts, tools.summary.byTier);
  auditSprint195ToolProof({ tools, proof: source('toolProof'), implementationHead: manifest.implementationHead, ledgerPath: manifest.sources.toolLedger, readFrozen });
  const retention = source('componentRetention'); assert.equal(retention.base, S196_BUILD_BASE); assert.equal(retention.head, manifest.implementationHead); assert.deepEqual(retention.sourceInputs, proof.sourceInputs); assert.deepEqual(retention.changedPaths, []);
  assert(!source('movers').s196.publicPaths.some(file => /^packages\/(?:component-contracts|component-styles|components-react|components-vue)\//.test(file)), 'Retained component proof requires unchanged component implementation bytes');
  const preFreeze = source('preFreeze'); assert.equal(preFreeze.status, 'passed'); assert.equal(preFreeze.skipped, 0);
  const release = source('release'), measuredArchive = source('measurementManifest'), finalArchive = source('finalManifest');
  const releaseSummary = auditSprint196Release({ release, releasePath: manifest.sources.release, measurementManifest: measuredArchive, head: manifest.implementationHead, readFrozen });
  assert.deepEqual(source('releaseValidation').issues, []); assert.equal(finalArchive.commit, executionHead); assert.equal(finalArchive.dirty, false);
  auditSprint196Attestation({ attestation: source('readinessAttestation'), head: executionHead, readHistorical });
  auditSprint196Portable({ report: source('e2eNode20'), archive: finalArchive, releaseSummary, nodeMajor: 20 }); auditSprint196Portable({ report: source('e2eNode24'), archive: finalArchive, releaseSummary, nodeMajor: 24 });
  const health = source('health'); assert.deepEqual(health.productReality.release, releaseSummary); assert.equal(health.status, 'ok'); assert.deepEqual(health.productReality.runtime, { ...runtime.summary, head: runtime.head }); assert.deepEqual(health.productReality.tools, { entries: 24, byTier: counts, head: tools.head });
  assert.equal(accounting.status, 'passed'); assert.deepEqual(accounting.validationIssues, []); assert.deepEqual(accounting.unattributedDeltas, []);
  assert.equal(accounting.closeout.runs.length, 1); assert(accounting.closeoutAttempts.length <= 1); assert.equal(accounting.captureExtensionAcceptance, undefined);
  const runs = accounting.executions.filter(row => row.cohort === 'closeout'); assert.equal(runs.length, 5); assert.deepEqual(runs.map(row => row.suite).sort(), ['component-packages', 'mcp-server', 'root-core', 'viz-core', 'viz-render']);
  for (const run of runs) {
    const raw = JSON.parse(verify(run.rawReport)); assert.equal(run.measuredHead, executionHead); const failed = 0;
    assert.equal(raw.numFailedTests, failed); assert.equal(raw.success, !failed); assert.equal(run.exitCode, failed); assert.equal(raw.numPassedTests, run.counts.passed); assert.equal(raw.numPendingTests, run.counts.skipped);
  }
  assert.equal(accounting.timeoutAcceptance, undefined); assert.deepEqual(accounting.closeoutFailures, []);
  assert.equal(accounting.comparisons.length, 5); assert.deepEqual(accounting.comparisons.map(row => row.suite).sort(), ['component-packages', 'mcp-server', 'root-core', 'viz-core', 'viz-render']);
  assert.deepEqual(health.productReality.viz, taxonomy.summary);
  const inputs = (cohort, capture) => { const aggregate = JSON.parse(verify(capture.aggregate)); return accounting.executions.filter(row => row.cohort === cohort && row.suite !== 'component-packages').map(row => ({ suite: row.suite, workspace: aggregate.workspace, platform: aggregate.host.platform, report: JSON.parse(verify(row.rawReport)) })); };
  const skipped = auditSprint190SkippedIdentities(inputs('closeout', accounting.closeout), inputs('sprint195Closeout', accounting.baselines.sprint195Closeout));
  assert.equal(runs.find(row => row.suite === 'component-packages').counts.skipped, 0);
  for (const row of accounting.goldenAttribution.files) { verify({ path: row.file, sha256: row.afterSha256 }); assert.equal(digest(readHistorical(accounting.goldenAttribution.beforeHead, row.file)), row.beforeSha256); assert(row.reason.trim()); }
  const notice = source('noticePlan'); assert.equal(notice.sent, false); assert.equal(notice.sendsExecuted, 0); assert.deepEqual(notice.targets, ['cmos-dashboard', 'forge-demos', 'aquex-mcp']); assert(notice.notices.every(row => row.request.body.includes('Sprint 196 candidate') && row.request.body.includes('19 advertised')));
  auditSprint196Ci({ ci: source('ci'), implementationHead: executionHead, readFrozen, changedPaths: ciChangedPaths });
  assert.equal(notice.deliveryState, 'pending-independent-review'); assert.equal(notice.implementationHead, executionHead); assert.equal(notice.measurementHead, manifest.implementationHead);
  for (const item of notice.notices) { assert.equal(digest(JSON.stringify(item.request)), item.requestSha256); for (const term of ['bridge', 'Readiness attestation', 'OODS-N020', 'Structured native errors', 'health.productReality.release', 'builderSelfCertified:false']) assert(item.request.body.includes(term)); }
  assert.equal(source('prose').exitCode, 0); auditSprint196Roadmap(readFrozen(manifest.sources.near).toString());
  return { status: 'passed', skipped, gitEvidence, checkedCriteria: claimCounts.criteria, checkedExecutions: claimCounts.executions, checkedFrozenPaths: checked.size, executionHead, reviewHead, builderSelfCertified: false, separateReviewRequired: true };
}


/** Independent palette checks consume raw receipts, not the producer's success flags. */
export function auditSprint197Runtime({ runtime, head, runtimePath, readFrozen }) {
  const root = path.posix.dirname(runtimePath), read = file => readFrozen(`${root}/${file}`), json = file => JSON.parse(read(file));
  const names = ['Article', 'Chunk', 'Collection', 'Document', 'Evidence', 'Invoice', 'Media', 'Mission', 'Organization', 'Plan', 'Product', 'Project', 'Relationship', 'Report', 'Subscription', 'Transaction', 'Usage', 'User'];
  const expected = names.flatMap(object => (object === 'Chunk' ? ['inline'] : ['card', 'detail', 'form', 'inline', 'list', 'timeline', 'workflow']).flatMap(context => ['react', 'vue'].map(framework => `${object}/${context}/${framework}`))).sort();
  assert.equal(runtime.head, head); assert(fullHead(head)); assert.equal(runtime.packCount, 1); assert.equal(runtime.historicalReceiptsUnioned, false);
  assert.deepEqual(runtime.rows.map(row => `${row.object}/${row.context}/${row.framework}`).sort(), expected);
  assert.deepEqual(runtime.summary, { cells: 240, pass: 240, typedGap: 0, fail: 0 });
  const browser = json('browser.json'); assert.equal(browser.version, '141.0.7390.37'); assert.match(browser.userAgent, /Linux/);
  assert.equal(browser.image, 'mcr.microsoft.com/playwright@sha256:f1e7e01021efd65dd1a2c56064be399f3e4de00fd021ac561325f2bfbb2b837a'); assert.equal(runtime.browserImage, browser.image);
  const packages = json('submitted-packages/inventory.json'); assert(packages.length > 0);
  for (const pkg of packages) assert.equal(digest(read(pkg.artifactPath)), bare(pkg.sha256));
  const hashTree = value => {
    if (!value || typeof value !== 'object') return;
    if (value.path && value.hash) assert.equal(digest(read(value.path)), bare(value.hash));
    for (const nested of Object.values(value)) if (typeof nested === 'object') hashTree(nested);
  };
  let charts = 0;
  for (const cell of runtime.rows) {
    assert.equal(cell.head, head); assert.equal(cell.runId, runtime.runId); assert.equal(cell.status, 'pass'); assert(cell.artifactHash);
    assert.deepEqual(json(cell.report), cell);
    const gates = ['generation', 'fresh-exact-tarball-install', 'strict-typecheck', 'production-build', 'mount', 'accessibility-tree', 'screenshots', 'context-states'];
    if (cell.context === 'workflow') gates.push('server-render', 'hydration', 'shared-css-resolution', 'interaction-evidence');
    for (const name of gates) assert.equal(cell.gates.filter(gate => gate.name === name && gate.status === 'pass').length, 1);
    assert(cell.gates.every(gate => gate.status === 'pass')); cell.gates.forEach(gate => hashTree(gate.detail));
    if (cell.context === 'workflow') {
      const states = cell.gates.find(gate => gate.name === 'context-states').detail.observations;
      assert.deepEqual(states.map(row => `${row.screen}/${row.state}`).sort(), ['list', 'detail', 'form', 'timeline'].flatMap(screen => ['loading', 'empty', 'error', 'success'].map(state => `${screen}/${state}`)).sort());
    }
    if (cell.context !== 'detail' || !['Invoice', 'Usage'].includes(cell.object)) continue;
    const gate = cell.gates.find(row => row.name === 'chart-theme-scopes'); assert(gate); assert.equal(gate.detail.cells, 6); assert.equal(gate.detail.failed, 0); assert.equal(gate.detail.skipped, 0);
    const report = json(gate.detail.report), folder = path.posix.dirname(gate.detail.report);
    assert.deepEqual(report.cells.map(row => row.id).sort(), ['A-dark', 'A-hc', 'A-light', 'B-dark', 'B-hc', 'B-light']);
    for (const row of report.cells) {
      assert.deepEqual(row.errors, []); assert.deepEqual(row.failures, []); assert.equal(row.status, 'passed'); assert.equal(row.placeholders, 0);
      assert.equal(row.charts.length, 1); assert.equal(row.charts[0].matchesPublicSvg, true);
      assert.equal(digest(read(`${folder}/${row.screenshot}`)), row.screenshotSha256); assert(read(`${folder}/${row.id}-accessibility-tree.txt`).length); charts++;
    }
  }
  const bite = json('emitter-bite.json'); assert.equal(bite.sourceRestoredByteIdentical, true); assert.equal(bite.reusedSweepTarballs, true);
  assert.notEqual(bite.mutatedHash, bite.beforeHash); assert.equal(bite.restoredHash, bite.beforeHash); assert.equal(bite.red.status, 'fail'); assert.equal(bite.redSpecExitCode, 1); assert.equal(bite.restored.status, 'pass'); assert(bite.ledgerIssues.length > 0);
  assert.equal(charts, 24); return { cells: expected.length, chartThemeCells: charts };
}

// Independent verification of #2008: do not import the accounting validator.
export function auditSprint197Readiness({ approval, changes, executionHead, reviewHead, failures, readHistorical, readBytes }) {
  const root = 'artifacts/product-reality/sprint-197/m07';
  const facts = { path: 'artifacts/product-reality/sprint-196/m06/release-readiness-facts.json',
    beforeSha256: '8fbfcb74551f8370ed52d4b10ddc55526cceba48a8ab0074f3e67192c6819f67',
    afterSha256: 'ba27bb2e7d5c9a6b9278b916d69ac593608bfe971a769a927d3af39cf2218c1d' };
  assert.equal(executionHead, '02d811f71a4f188142783edf0f9ea189590876c1'); assert.equal(approval.executionHead, executionHead);
  assert.equal(approval.decisionId, 2008); assert.equal(approval.missionId, 's197-m07'); assert.equal(approval.builderSelfCertified, false); assert(fullHead(approval.fixedHead));
  const receipt = ref => { const b = readBytes(ref.path); assert.equal(digest(b), ref.sha256, ref.path); return b; };
  const decision = JSON.parse(receipt(approval.decision));
  assert.equal(decision.id, 2008); assert.equal(decision.missionId, 's197-m07'); assert.equal(decision.sprintId, 'sprint-197');
  assert(decision.decision.includes(facts.afterSha256) && decision.decision.includes('NO third full five-suite capture'));
  assert.deepEqual(approval.facts, facts);
  assert.equal(digest(readHistorical(executionHead, facts.path)), facts.beforeSha256);
  for (const head of [approval.fixedHead, reviewHead]) assert.equal(digest(readHistorical(head, facts.path)), facts.afterSha256);
  assert.equal(digest(readBytes(facts.path)), facts.afterSha256);
  const unchanged = {
    'cmos/planning/forge-gate2-decision-packet.md': 'e7279d225d7e9fee64d14c6695f7b32e83f04107a19ce7e656e457c8802957c3',
    'scripts/product-reality/s196-release-readiness.ts': 'a11560a8e2c31c399c6081f7aa343929025372a39f3491b12e016888fda83786',
    'packages/mcp-server/test/product-reality/release-readiness.s196.spec.ts': '9cc8db7dc765b26c1885eab95b5e6f9d63fd7bd2c7533c4cb58169890c140fc8',
  };
  for (const [file, expected] of Object.entries(unchanged)) for (const head of [executionHead, approval.fixedHead, reviewHead]) assert.equal(digest(readHistorical(head, file)), expected);
  const paths = ['scripts/product-reality/s185-audit-closeout.mjs', 'scripts/product-reality/s185-closeout.mjs',
    'scripts/product-reality/s185-suite-accounting.mjs', 'packages/mcp-server/test/product-reality/closeout.s197.spec.ts'].sort();
  assert.deepEqual(approval.supportingFiles.map(row => row.path).sort(), paths);
  for (const row of approval.supportingFiles) {
    assert.equal(digest(readHistorical(executionHead, row.path)), row.beforeSha256);
    assert.equal(digest(readBytes(row.path)), row.afterSha256);
    for (const head of [approval.fixedHead, reviewHead]) assert.equal(digest(readHistorical(head, row.path)), row.afterSha256);
  }
  const exceptions = [...paths, facts.path].sort();
  assert.deepEqual(changes.filter(row => exceptions.includes(row.path)).map(row => row.path).sort(), exceptions);
  for (const row of changes) {
    if (exceptions.includes(row.path)) assert.equal(row.status, 'M');
    else { assert.equal(row.status, 'A'); assert(/^artifacts\/product-reality\/sprint-197\/m07\/(?:five-suite-closeout[^/]*|closeout|ci|movers)\/.*\.(?:json|log|md|patch|txt)$/.test(row.path), row.path); }
  }
  const checkpoint = '0c6159821c2261afd060b682ca910723f31c0349';
  const index = JSON.parse(readHistorical(checkpoint, `${root}/closeout/retained-evidence-index.json`));
  const captureFiles = index.files.filter(row => row.path.startsWith(`${root}/five-suite-closeout`)); assert.equal(captureFiles.length, 40);
  for (const ref of captureFiles) { receipt(ref); assert.equal(digest(readHistorical(checkpoint, ref.path)), ref.sha256); }
  assert.equal(failures.length, 2); assert.deepEqual(failures.map(row => row.suite).sort(), ['mcp-server', 'root-core']);
  for (const failure of failures) {
    assert.equal(failure.file, 'packages/mcp-server/test/product-reality/release-readiness.s196.spec.ts');
    assert.equal(failure.testKey, 's196 release readiness derives facts without making Gate 2 decisions checks generated JSON and the marked facts block while preserving authored prose#0');
  }
  assert.deepEqual(approval.scoped.map(row => row.project).sort(), ['mcp-server', 'root-core']);
  for (const run of approval.scoped) {
    assert.equal(run.head, approval.fixedHead); assert.equal(run.exitCode, 0); assert(run.command.includes('vitest')); receipt(run.log);
    const raw = JSON.parse(receipt(run.report)); assert.equal(raw.success, true);
    assert.equal(raw.numFailedTests + raw.numPendingTests + raw.numTodoTests, 0);
    const names = raw.testResults.map(file => file.name.split('/').pop()).sort();
    assert.deepEqual(names, ['closeout.s196.spec.ts', 'closeout.s197.spec.ts', 'release-readiness.s196.spec.ts']);
    const rows = raw.testResults.flatMap(file => file.assertionResults); assert.equal(rows.length, raw.numTotalTests); assert(rows.every(row => row.status === 'passed'));
    for (const file of raw.testResults) assert(file.assertionResults.length > 0);
    assert.equal(raw.testResults.find(file => file.name.endsWith('/release-readiness.s196.spec.ts')).assertionResults.length, 22);
  }
  assert.equal(approval.docs.head, approval.fixedHead); assert.equal(approval.docs.exitCode, 0); assert.equal(approval.docs.command, 'pnpm docs:check'); receipt(approval.docs.log);
  return { decisionId: 2008, fixedHead: approval.fixedHead, facts, preservedCaptureFiles: captureFiles.length };
}

export function auditSprint197Closeout({ executionHead, reviewHead, readOutput, readFrozen, readHistorical, gitEvidence, publicGitEvidence, rangeGitEvidence, manifestPath }) {
  const base = 'artifacts/product-reality/sprint-197/m07', manifest = JSON.parse(readFrozen(manifestPath));
  const ledger = JSON.parse(readOutput(`${base}/closeout/claim-ledger.json`)), handoff = JSON.parse(readOutput(`${base}/closeout/review-handoff.json`)), accounting = JSON.parse(readOutput(`${base}/closeout/suite-accounting.json`));
  const fixedHead = manifest.fixedHead ?? executionHead;
  const checked = new Set();
  const verify = ref => { assert(ref.path && !path.isAbsolute(ref.path) && !ref.path.split('/').includes('..')); const bytes = readFrozen(ref.path); assert.equal(digest(bytes), bare(ref.sha256), ref.path); checked.add(ref.path); return bytes; };
  const source = key => JSON.parse(readFrozen(manifest.sources[key]));
  for (const result of [ledger, handoff]) {
    assert.equal(result.builderSelfCertified, false); assert.equal(result.separateReviewRequired, true); assert.equal(result.sprintStatus, 'Active');
    assert.equal(result.fixedHead, fixedHead); assert.equal(result.executionHead, executionHead); assert.equal(result.reviewHead, reviewHead); assert.equal(result.implementationHead, manifest.implementationHead);
  }
  assert.equal(handoff.evidenceCommit, reviewHead); assert.equal(handoff.state, 'BUILT, REVIEW PENDING');
  assert.equal(gitEvidence.ancestor, true); assert.deepEqual(accounting.headRelation.changedEvidencePaths, gitEvidence.changes);
  if (manifest.accounting.readinessCorrection) {
    const approval = JSON.parse(readFrozen(manifest.accounting.readinessCorrection));
    const accepted = auditSprint197Readiness({ approval, changes: gitEvidence.changes, executionHead, reviewHead,
      failures: accounting.closeoutFailures, readHistorical, readBytes: readFrozen });
    assert.equal(manifest.fixedHead, accepted.fixedHead);
    for (const key of Object.keys(accepted)) assert.deepEqual(accounting.readinessAcceptance[key], accepted[key]);
    assert.equal(accounting.readinessAcceptance.approval.path, manifest.accounting.readinessCorrection); verify(accounting.readinessAcceptance.approval);
    assert.equal(accounting.closeout.status, 'failed'); assert.equal(accounting.closeoutAttempts.length, 1);
    assert.equal(accounting.closeoutAttempts[0].status, 'failed'); assert.equal(accounting.closeoutAttempts[0].measuredHead, 'c5246c3f721ea49761e4a5c5eecbbd4df0b10279');
    assert.equal(accounting.captureExtensionAcceptance, undefined);
    for (const row of accounting.closeoutFailures) { assert.equal(row.status, 'introduced-generated-provenance-drift'); assert.equal(row.correctionDecisionId, 2008); assert.equal(row.correctionHead, manifest.fixedHead); }
  } else for (const change of gitEvidence.changes) {
    assert.equal(change.status, 'A'); assert(/^artifacts\/product-reality\/sprint-197\/m07\/(?:five-suite-closeout[^/]*|closeout|ci|movers)\/.*\.(?:json|log|md|patch|txt)$/.test(change.path), change.path);
  }
  [...ledger.references, ...accounting.references].forEach(verify);
  const missions = source('missions'); assert.equal(missions.sprint.id, 'sprint-197'); assert.equal(missions.sprint.status, 'Active');
  const expected = missions.missions.flatMap(row => row.successCriteria.map((criterion, i) => ({ missionId: row.id, criterionIndex: i + 1, criterion })));
  assert.deepEqual(missions.missions.map(row => row.id), Array.from({ length: 7 }, (_, i) => `s197-m0${i + 1}`));
  assert.equal(expected.length, 32); assert(missions.missions.slice(0, 6).every(row => row.status === 'Completed')); assert.equal(ledger.claims.length, expected.length); assert.equal(new Set(ledger.executions.map(row => row.id)).size, ledger.executions.length);
  expected.forEach((literal, i) => {
    const claim = ledger.claims[i]; for (const key of Object.keys(literal)) assert.equal(claim[key], literal[key]); assert.equal(claim.status, 'proven');
    assert(claim.evidence.length && claim.executionIds.length);
    for (const ref of claim.evidence) { verify(ref); assert(claim.executionIds.some(id => ledger.executions.find(row => row.id === id)?.evidence.some(item => item.path === ref.path && item.sha256 === ref.sha256))); }
  });
  for (const execution of ledger.executions) { assert(fullHead(execution.head)); for (const ref of execution.evidence) { const bytes = verify(ref); if (execution.historical) assert(bytes.equals(readHistorical(execution.head, ref.path))); } }
  const runtime = source('runtime'); auditSprint197Runtime({ runtime, head: manifest.implementationHead, runtimePath: manifest.sources.runtime, readFrozen });
  assert.deepEqual(source('runtimeValidation').issues, []); assert(readFrozen(manifest.sources.runtime).equals(readFrozen('packages/mcp-server/registry/runtime-cells.v1.json')));
  for (const target of ['react', 'vue']) {
    const report = source(`${target}Theme`); assert.deepEqual([...report.canonicalIds].sort(), JSON.parse(readHistorical(manifest.implementationHead, `artifacts/product-reality/sprint-195/m07/${target}-theme/report.json`)).canonicalIds.sort()); assert.equal(report.mission, 's197-m07'); assert.equal(report.rootCells, 654);
    auditSprint195Theme({ report, reportPath: manifest.sources[`${target}Theme`], target, ids: report.canonicalIds, readFrozen });
    const measured = source(`${target}Measured`); assert.equal(measured.success, true); assert.equal(measured.numFailedTests, 0); assert.equal(measured.numPendingTests, 0);
    const axe = measured.testResults.filter(row => /accessibility\.spec\./.test(row.name)).flatMap(row => row.assertionResults).filter(row => /shared scenario/.test(row.fullName));
    assert.equal(axe.length, 109); assert(axe.every(row => row.status === 'passed'));
  }
  const proof = source('sourceProof'); assert.equal(proof.head, manifest.implementationHead); assert(proof.references.length > 0);
  for (const prefix of ['packages/component-contracts/', 'packages/component-styles/', 'packages/components-react/', 'packages/components-vue/', 'packages/tokens/src/', 'packages/mcp-server/src/codegen/', 'scripts/tokens/']) assert(proof.references.some(ref => ref.path.startsWith(prefix)));
  for (const ref of proof.references) { verify(ref); assert.equal(digest(readHistorical(manifest.implementationHead, ref.path)), bare(ref.sha256)); }
  const census = source('componentCensus'); assert.equal(census.head, manifest.implementationHead); assert.equal(census.allRows.length, 77); assert.equal(census.greenTotalSchemas, 77); assert.equal(census.greenTotalCells, 154);
  for (const row of census.allRows) { assert(row.green); verify(row.composition); assert.deepEqual(row.cells.map(cell => cell.framework).sort(), ['react', 'vue']); for (const cell of row.cells) { assert.equal(cell.status, 'ok'); assert.deepEqual(cell.errors, []); verify(cell.response); } }
  const movement = source('schemaMovement'); assert.equal(movement.changedSchemas, 0); assert.equal(movement.allRows.length, 77);
  const normalizeSchema = schema => {
    const nodes = []; const walk = node => { nodes.push(node); (node.children ?? []).forEach(walk); }; schema.screens.forEach(walk);
    const ids = new Map(nodes.map((node, index) => [node.id, `node-${index}`]));
    const clean = value => Array.isArray(value) ? value.map(clean) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, clean(value[key])])) : typeof value === 'string' ? (ids.get(value) ?? value) : value;
    return digest(JSON.stringify(clean(schema)));
  };
  for (const row of movement.allRows) { const before = JSON.parse(verify(row.before)), after = JSON.parse(verify(row.after)); assert.equal(normalizeSchema(before.schema), row.beforeNormalizedHash); assert.equal(normalizeSchema(after.schema), row.afterNormalizedHash); assert.equal(row.beforeNormalizedHash, row.afterNormalizedHash); }
  const compatibility = source('compatibility'); assert.equal(compatibility.cohortFiles, 17); assert.equal(compatibility.changedCohortFiles, 0); assert.equal(compatibility.liveStoreFiles, 37); assert.equal(compatibility.changedLiveFiles, 0); assert.equal(compatibility.readOnly, true);
  assert.deepEqual(compatibility.cohortStore.hashes, JSON.parse(readHistorical(S197_BUILD_BASE, 'artifacts/product-reality/sprint-196/m07/saved-compatibility.json')).liveStore.hashes);
  for (const [name, hash] of Object.entries(compatibility.cohortStore.hashes)) assert.equal(digest(readFrozen(`${compatibility.cohortStore.path}/${name}`)), hash);
  for (const [name, hash] of Object.entries(compatibility.liveStore.hashes)) assert.equal(digest(readFrozen(`${compatibility.snapshotRoot}/${name}`)), hash);
  const oldStoreIndex = JSON.parse(readFrozen(`${compatibility.cohortStore.path}/_index.json`)), currentStoreIndex = JSON.parse(readFrozen(`${compatibility.snapshotRoot}/_index.json`));
  assert.equal(currentStoreIndex.schemas.length, 36); assert.equal(currentStoreIndex.updatedAt, '2026-09-12T23:38:44.819Z');
  for (const row of oldStoreIndex.schemas) assert.deepEqual(currentStoreIndex.schemas.find(item => item.name === row.name), row);
  for (const [name, hash] of Object.entries(compatibility.cohortStore.hashes)) if (name !== '_index.json') assert.equal(compatibility.liveStore.hashes[name], hash);
  assert.equal(source('toolLedger').rows.length, 24); assert(readFrozen(manifest.sources.toolLedger).equals(readHistorical(manifest.implementationHead, manifest.sources.toolLedger)));
  const taxonomy = source('taxonomy');
  auditSprint195Viz({ registry: source('registry'), observations: source('vizObservations'), patterns: source('patternRegistry'), patternCensus: source('patternCensus'), taxonomy,
    classification: JSON.parse(readFrozen('packages/viz-core/src/registry/viz-classification.v1.json')),
    patternSources: JSON.parse(readFrozen('packages/viz-core/src/patterns/viz-pattern-sources.v1.json')), readFrozen });
  assert.equal(accounting.executionHead, executionHead); assert.equal(accounting.reviewHead, reviewHead); assert.equal(accounting.status, 'passed');
  assert.deepEqual(accounting.validationIssues, []); assert.deepEqual(accounting.unattributedDeltas, []); assert.equal(accounting.comparisons.length, 5);
  assert.equal(accounting.closeout.runs.length, 1); assert.equal(accounting.closeout.runs[0].suiteExecutionIds.length, 5);
  const aggregate = JSON.parse(verify(accounting.closeout.aggregate)); assert.equal(aggregate.configuredTestTimeoutMs, 60_000); assert.equal(aggregate.fileScheduling, 'serial; maxWorkers=1');
  for (const row of accounting.executions.filter(row => row.cohort === 'closeout')) { const raw = JSON.parse(verify(row.rawReport)); assert(raw.testResults.length > 0); assert.equal(raw.numFailedTests, row.counts.failed); }
  const pre = source('preFreeze'); assert.equal(pre.status, 'passed'); assert.equal(pre.skipped, 0); assert(pre.reports.length > 0); for (const row of pre.reports) { assert.equal(row.failed, 0); assert.equal(row.skipped, 0); const raw = JSON.parse(verify(row)); if (row.kind === 'vitest') { assert.equal(raw.success, true); assert.equal(raw.numFailedTests, 0); assert.equal(raw.numPendingTests, 0); } else { assert.equal(row.kind, 'command'); assert.equal(raw.exitCode, 0); assert(raw.command.length); verify(raw.log); } }
  assert.deepEqual(source('headRelations').publicComparison, publicGitEvidence);
  const allowed = ['pnpm-lock.yaml', 'scripts/quality/brand-cascade-browser-proof.mjs', 'scripts/quality/brand-focus-identity.mjs', 'tools/token-lint/index.mjs', 'tests/design-loop/design-loop.test.ts', 'tests/verification/how-forge-works.contract.test.ts', 'tests/verification/s177-prose-carriers.contract.test.ts', 'package.json', 'scripts/product-reality/s197-categorical-search.ts', 'scripts/product-reality/s197-palette-sheets.ts', 'scripts/product-reality/s197-viz-palette.ts', 'tests/tokens/__fixtures__/brand-css-slot-contract.json', 'tests/tokens/brand-root-and-containment.test.ts', 'tests/tokens/bridged-slot-specificity-census.test.ts', 'tests/tokens/collision-guard.test.ts', 'tests/tokens/mobile-output.test.ts', 'tests/tokens/palette-role-a.s195.test.ts', 'tests/tokens/palette-integration.s197.test.ts', 'packages/mcp-server/test/product-reality/closeout.s197.spec.ts', 'packages/mcp-server/registry/runtime-cells.v1.json', 'cmos/foundational-docs/roadmap/near.md', 'docs/how-forge-works.html', 'scripts/product-reality/s185-closeout.mjs', 'scripts/product-reality/s185-audit-closeout.mjs', 'scripts/product-reality/s185-suite-accounting.mjs', 'scripts/product-reality/s185-sprint-wide-movers.mjs', 'scripts/product-reality/capture-s185-m01-baseline.mjs', 'scripts/product-reality/component-package-suite.mjs', 'scripts/product-reality/s185-reachability.mjs'];
  assert(publicGitEvidence.changedPaths.every(file => allowed.includes(file)));
  const beforePackage = JSON.parse(readHistorical(manifest.implementationHead, 'package.json')), currentPackage = JSON.parse(readFrozen('package.json'));
  assert.equal(currentPackage.devDependencies.esbuild, '0.25.10'); delete currentPackage.devDependencies.esbuild;
  assert.equal(currentPackage.scripts['lint:tokens'], 'node tools/token-lint/index.mjs packages/tokens/src/tokens packages/tokens/src/presets packages/tokens/src/*.json');
  currentPackage.scripts['lint:tokens'] = beforePackage.scripts['lint:tokens']; assert.deepEqual(currentPackage, beforePackage);
  const lock = readFrozen('pnpm-lock.yaml').toString(), addition = '      esbuild:\n        specifier: 0.25.10\n        version: 0.25.10\n';
  assert.equal(lock.split(addition).length, 2); assert.equal(lock.replace(addition, ''), readHistorical(manifest.implementationHead, 'pnpm-lock.yaml').toString());
  assert.equal(rangeGitEvidence.base, S197_BUILD_BASE); assert.equal(rangeGitEvidence.head, fixedHead);
  const movers = source('movers'), declared = JSON.parse(readFrozen(`${base}/movers/declared-movers.json`));
  for (const key of ['canonicalPaths', 'publicPaths']) { assert.deepEqual(movers.s197[key], rangeGitEvidence[key]); assert.deepEqual(declared.s197[key], rangeGitEvidence[key]); }
  const attribution = source('moverAttribution'); assert.deepEqual(attribution.unattributedPaths, []); assert.deepEqual(attribution.rows.map(row => row.path).sort(), rangeGitEvidence.publicPaths);
  assert.equal(new Set(attribution.rows.map(row => row.path)).size, rangeGitEvidence.publicPaths.length); verify(attribution.patch);
  for (const row of attribution.rows) {
    assert(row.reason?.trim() && row.missions.length && row.missions.every(id => /^s197-m0[1-7]$/.test(id))); assert(row.commits.length && row.commits.every(fullHead));
    if (row.beforeSha256 !== null) assert.equal(digest(readHistorical(S197_BUILD_BASE, row.path)), row.beforeSha256);
    if (row.afterSha256 !== null) assert.equal(digest(readHistorical(fixedHead, row.path)), row.afterSha256);
  }
  const boundary = source('boundary'); assert.equal(boundary.messagesSent, 0); assert.equal(boundary.reconnectPrepared, false); assert.equal(boundary.deliveryExecuted, false);
  const ci = source('ci'); assert.equal(ci.pr.baseRefName, 'OODS-pro'); assert(ci.runs.length > 0);
  for (const run of ci.runs) { const raw = JSON.parse(verify(run.receipt)); assert.equal(raw.headSha, run.headSha); assert.equal(raw.status, 'completed'); assert.equal(raw.conclusion, run.conclusion); assert(run.conclusion === 'success' || (run.disposition?.trim() && run.evidence?.length)); for (const ref of run.evidence ?? []) verify(ref); }
  if (manifest.accounting.readinessCorrection) assert(ci.runs.some(run => run.headSha === fixedHead && JSON.parse(verify(run.receipt)).status === 'completed'), 'Decision 2008 requires CI on the fixed source.');
  const text = readFrozen(manifest.sources.near).toString(), before = readHistorical(manifest.implementationHead, manifest.sources.near).toString(), marker = '\n---\n\n# Retained record —';
  assert(text.includes(marker)); assert.equal(text.slice(text.indexOf(marker)), before.slice(before.indexOf(marker)));
  const top = text.slice(0, text.indexOf(marker)); assert.match(top, /197 — \*\*BUILT, REVIEW PENDING\*\*/); assert.match(top, /### Sprint 197 — Palette and the dark theme — BUILT, REVIEW PENDING/);
  for (const measured of ['16.540957', '20.105820', '24/24', '52', '180', '90']) assert(top.includes(measured));
  return { status: 'passed', checkedCriteria: expected.length, checkedExecutions: ledger.executions.length, checkedFrozenPaths: checked.size, executionHead, reviewHead, builderSelfCertified: false, separateReviewRequired: true };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argument = name => { const index = process.argv.indexOf(name); return index < 0 ? undefined : process.argv[index + 1]; };
  const root = path.resolve(argument('--root') ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '../..'));
  const executionHead = argument('--execution-head'); const reviewHead = argument('--review-head');
  const artifactsRoot = path.resolve(argument('--artifacts-root') ?? root);
  const outputRoot = path.resolve(argument('--output') ?? path.join(root, 'artifacts/product-reality/sprint-185/m05/closeout-independent-audit'));
  const command = process.argv.map(value => `'${value.replace(/'/g, `'\\''`)}'`).join(' ');
  mkdirSync(outputRoot, { recursive: true });
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', executionHead, reviewHead], { cwd: root });
    const changes = auditEvidenceChanges({ root, executionHead, reviewHead });
    const readFrozen = file => execFileSync('git', ['show', `${reviewHead}:${file}`], { cwd: root, maxBuffer: 128 * 1024 * 1024 });
    const readHistorical = (commit, file) => execFileSync('git', ['show', `${commit}:${file}`], { cwd: root, maxBuffer: 128 * 1024 * 1024 });
    const manifestPath = argument('--manifest') ?? defaultManifest;
    const manifest = JSON.parse(readFrozen(manifestPath));
    const implementationHead = ['s196-m07', 's197-m07'].includes(manifest.missionId) ? manifest.implementationHead : JSON.parse(readFrozen(manifest.sources.noticePlan)).implementationHead;
    const publicGitEvidence = auditPublicRuntimeBytes({ root, implementationHead, executionHead,
      sprintId: manifest.missionId === 's197-m07' ? 'sprint-197' : manifest.missionId === 's196-m07' ? 'sprint-196' : manifest.missionId === 's195-m07' ? 'sprint-195' : manifest.missionId === 's194-m07' ? 'sprint-194' : manifest.missionId === 's193-m07' ? 'sprint-193' : manifest.missionId === 's192-m07' ? 'sprint-192' : manifest.missionId === 's191-m05' ? 'sprint-191' : manifest.missionId === 's190-m06' ? 'sprint-190' : manifest.missionId === 's189-m06' ? 'sprint-189' : manifest.missionId === 's188-m06' ? 'sprint-188' : manifest.missionId === 's187-m06' ? 'sprint-187' : manifest.missionId === 's186-m06' ? 'sprint-186' : 'sprint-185' });
    const rangeGitEvidence = manifest.missionId === 's197-m07' ? auditSprintRange({ root, base: S197_BUILD_BASE, head: manifest.fixedHead ?? executionHead, sprintId: 'sprint-197' }) : manifest.missionId === 's196-m07' ? auditSprintRange({ root, base: S196_BUILD_BASE, head: executionHead, sprintId: 'sprint-196' }) : manifest.missionId === 's195-m07' ? auditSprintRange({ root, base: '5b25c3c9ec795315bf52a698d135c96bffd66393', head: implementationHead, sprintId: 'sprint-195' }) : manifest.missionId === 's194-m07' ? auditSprintRange({ root, base: '1f69c957f4435a0a2f18b168b684de050f7a5f22', head: implementationHead, sprintId: 'sprint-194' }) : manifest.missionId === 's193-m07' ? auditSprintRange({ root, base: 'c098237f1a1d026df4f1ad5c0ca51b15ebab0f4d', head: implementationHead, sprintId: 'sprint-193' }) : manifest.missionId === 's192-m07' ? auditSprintRange({ root, base: execFileSync('git',['rev-parse','5fdf8a18'],{cwd:root,encoding:'utf8'}).trim(), head: implementationHead, sprintId:'sprint-192' }) : manifest.missionId === 's191-m05' ? auditSprintRange({ root, base: execFileSync('git',['rev-parse','d3a99d39'],{cwd:root,encoding:'utf8'}).trim(), head: implementationHead, sprintId:'sprint-191' }) : manifest.missionId === 's190-m06' ? auditSprintRange({ root, base: execFileSync('git',['rev-parse','c3a68d5f'],{cwd:root,encoding:'utf8'}).trim(), head: implementationHead, sprintId:'sprint-190' }) : manifest.missionId === 's189-m06' ? auditSprintRange({ root, base: 'f4cd1ba3cda3d1d52405582e425ecd6d19890b51', head: implementationHead, sprintId: 'sprint-189' }) : manifest.missionId === 's188-m06'
      ? auditSprintRange({ root, base: 'cd8ee986db40e73a3fb9a9f1ec7b7db6de9ca076', head: implementationHead, sprintId: 'sprint-188' }) : manifest.missionId === 's187-m06'
      ? auditSprintRange({ root, base: '21c7c31906fbb81d049b943155c64ed78409fb9f', head: implementationHead, sprintId: 'sprint-187' }) : manifest.missionId === 's186-m06'
      ? auditSprintRange({ root, base: '5aa53b3ae92cdb70b1577b56a72debf10e58a5b2', head: implementationHead }) : undefined;
    const report = auditFinalCloseout({ executionHead, reviewHead,
      gitEvidence: { ancestor: true, changes }, publicGitEvidence, rangeGitEvidence, manifestPath,
      readOutput: file => readFileSync(path.join(artifactsRoot, file)),
      readFrozen, readHistorical,
      ciChangedPaths: (head, implementation, scope) => auditCiChangedPaths({ root, head, implementation, scope }),
    });
    const stdout = `Independent actual-output audit passed: ${report.checkedCriteria} literal criteria, ${report.checkedExecutions} executions, ${report.checkedFrozenPaths} frozen paths.\n`;
    writeFileSync(path.join(outputRoot, 'audit.json'), `${JSON.stringify({ ...report, exitCode: 0, command, host: os.hostname(), stdout }, null, 2)}\n`);
    writeFileSync(path.join(outputRoot, 'audit.log'), stdout); process.stdout.write(stdout);
  } catch (error) {
    const stdout = `${error.stack ?? error}\n`;
    writeFileSync(path.join(outputRoot, 'audit.json'), `${JSON.stringify({ status: 'failed', executionHead, reviewHead, exitCode: 1, command, host: os.hostname(), stdout }, null, 2)}\n`);
    writeFileSync(path.join(outputRoot, 'audit.log'), stdout); process.stderr.write(stdout); process.exitCode = 1;
  }
}
