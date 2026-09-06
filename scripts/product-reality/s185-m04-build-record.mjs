#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const evidencePath = 'artifacts/product-reality/sprint-185/m04';
const schemaDirectory = 'artifacts/product-reality/sprint-183/m04/saved-schema-store';
const baseCommit = '1118f436345e160437abfedbe73a19f190a92562';
const implementationBase = '2069481c91c6c8cb70417dc17b8bc5c37cfa2bd2';
export const NEW_SCHEMAS = Object.freeze(['cmos-messages-redesign', 'plan-form-dark', 'pt-shop-parts-entry-router-v1',
  'user-card-showcase', 'cmos-dashboard-redesign', 'the-academy-landing-v1']);
const REGRESSION_SCHEMAS = ['subscription-list-dark', 'subscription-detail-dark'];
const FRAMEWORKS = ['react', 'vue'];
export const GATES = Object.freeze(['fresh-exact-tarball-install', 'strict-typecheck', 'production-build', 'server-render',
  'mount', 'hydration', 'shared-css-resolution', 'interaction-evidence']);
export const NOT_APPLICABLE_REASONS = Object.freeze({
  'the-academy-landing-v1': 'no interactive element declared',
  'cmos-dashboard-redesign': 'no enabled interaction declared; unbound PaginationBar defaults to zero items',
});
const invariant = (condition, message) => { if (!condition) throw new Error(message); };
const canonical = value => `${JSON.stringify(value, null, 2)}\n`;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const digest = value => String(value).replace(/^sha256:/, '');
const equal = (left, right, label) => invariant(canonical(left) === canonical(right), `${label}: values differ.`);
const sameMembers = (actual, expected, label) => equal([...actual].sort(), [...expected].sort(), label);
const gate = (report, name) => report.gates.find(row => row.name === name);

/** Count observed rows; a missing observation cannot turn into a passed or excluded gate. */
export function deriveGateAccounting(gates, schema, { requireComplete = true } = {}) {
  invariant(Array.isArray(gates), `${schema}: gate rows are missing.`);
  sameMembers(gates.map(row => row.name), GATES, `${schema}: exact gate membership`);
  for (const row of gates) {
    invariant(['passed', 'failed', 'unproven', 'not-applicable'].includes(row.status), `${schema}/${row.name}: unknown status.`);
    if (row.status === 'not-applicable') invariant(row.name === 'interaction-evidence'
      && NOT_APPLICABLE_REASONS[schema] === row.reason, `${schema}: unsupported exclusion or changed reason.`);
  }
  const excluded = gates.filter(row => row.status === 'not-applicable');
  const proven = gates.filter(row => row.status === 'passed').length;
  const failed = gates.filter(row => row.status === 'failed').length;
  const unproven = gates.filter(row => row.status === 'unproven').length + failed;
  const applicable = gates.length - excluded.length;
  if (requireComplete) {
    invariant(unproven === 0, `${schema}: ${unproven} applicable gates remain unproven.`);
    invariant(excluded.length === (Object.hasOwn(NOT_APPLICABLE_REASONS, schema) ? 1 : 0), `${schema}: exclusion was counted as a pass.`);
  }
  return { total: gates.length, applicable, proven, notApplicable: excluded.length, unproven, failed,
    result: `${proven} of ${applicable} applicable gates`,
    exclusions: excluded.map(({ name, reason }) => ({ gate: name, reason })) };
}

/** Deliberately compare stable outcomes and exact action operands, not enriched whole reports. */
export function historicalOutcomeProjection(report) {
  const interaction = gate(report, 'interaction-evidence').detail;
  return {
    schema: report.schema, schemaRef: report.schemaRef, framework: report.framework, status: report.status,
    selected: report.selected, passed: report.passed, failed: report.failed, skipped: report.skipped,
    gates: report.gates.map(({ name, status }) => ({ name, status })),
    actionCounts: interaction.actionCounts, actionArgs: interaction.actionArgs,
    expectedArguments: interaction.expectedArguments, selectorEvidence: interaction.selectorEvidence,
  };
}

export function verifyHydrationRed(report) {
  invariant(report.status === 'detected', 'Hydration control was not detected.');
  equal(report.observedFailedGates, ['hydration'], 'Hydration control failed gate');
  for (const name of GATES.filter(name => !['hydration', 'interaction-evidence'].includes(name)))
    invariant(gate(report, name)?.status === 'passed', `Hydration control prerequisite ${name} did not pass.`);
  invariant(gate(report, 'hydration')?.status === 'failed', 'Hydration control must fail hydration.');
  invariant(gate(report, 'interaction-evidence')?.status === 'unproven', 'Hydration failure cannot prove interaction.');
}

export function buildRecords({ root = repositoryRoot, checkTracked = false } = {}) {
  const inputs = new Map();
  const referencedLogs = new Set();
  const resolveRef = (ref, base = evidencePath) => {
    invariant(typeof ref === 'string' && !path.isAbsolute(ref), `Expected repository-relative evidence reference: ${ref}`);
    const result = ref.startsWith('artifacts/') || ref.startsWith('scripts/') || ref.startsWith('packages/')
      ? ref : path.posix.join(base, ref);
    invariant(!result.split('/').includes('..'), `Evidence reference escapes its root: ${ref}`);
    return result;
  };
  const bytes = (ref, base) => {
    const resolved = resolveRef(ref, base);
    const content = readFileSync(path.join(root, resolved));
    inputs.set(resolved, { path: resolved, bytes: content.length, sha256: hash(content) });
    if (resolved.endsWith('.log')) referencedLogs.add(resolved);
    return content;
  };
  const read = (ref, base) => bytes(ref, base).toString('utf8');
  const json = (ref, base) => JSON.parse(read(ref, base));
  const verifyHash = (ref, expected, base) => {
    const content = bytes(ref, base);
    invariant(hash(content) === digest(expected), `${resolveRef(ref, base)}: SHA-256 mismatch.`);
    return content;
  };
  const logRefs = (logs, base) => {
    invariant(Array.isArray(logs) && logs.length > 0, `${base}: raw logs are missing.`);
    for (const ref of logs) invariant(bytes(ref, base).length > 0, `${ref}: referenced proof log is empty.`);
  };
  const allFiles = directory => readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap(entry => {
    const file = path.posix.join(directory, entry.name);
    return entry.isDirectory() ? allFiles(file) : [file];
  }).sort();
  const schemaNodes = schema => {
    const result = [];
    const visit = node => { result.push(node); (node.children ?? []).forEach(visit); };
    schema.screens.forEach(visit);
    return result;
  };
  const saved = schema => {
    const file = `${schemaDirectory}/${schema}.json`;
    const value = json(file);
    return { file, schema: value.schema ?? value, sha256: inputs.get(file).sha256 };
  };
  const criteria = json('mission-criteria.json');
  invariant(criteria.missionId === 's185-m04' && criteria.successCriteria.length === 9, 'Exact CMOS criterion snapshot is required.');
  const execution = json('execution-summary.json');
  invariant(execution.mission === 's185-m04' && execution.status === 'passed', 'The coordinated execution has not passed.');

  const identity = json('controls/saved-schema-byte-identity.json');
  for (const row of identity.schemas) {
    invariant(row.baseAndCurrentBytesEqual === true, `${row.path}: immutable operand changed.`);
    verifyHash(row.path, row.sha256);
    const historical = execFileSync('git', ['show', `${baseCommit}:${row.path}`], { cwd: root });
    invariant(hash(historical) === row.sha256, `${row.path}: detached base operand differs.`);
  }
  const vendor = json('controls/vendor-provenance.json');
  sameMembers(vendor.files.map(row => path.basename(row.vendored)),
    ['generation-probe.mjs', 'reachability-census.mjs', 'output.md', 'measured-at.txt'], 'Original planning files');
  for (const file of vendor.files) {
    const content = verifyHash(file.vendored, file.sha256);
    invariant(content.length === file.bytes, `${file.vendored}: original byte count differs.`);
  }
  invariant(read('controls/measured-at.txt') === '1118f436\n', 'Planning measurement base differs.');
  const replay = json('controls/base-replay.json');
  invariant(replay.baseCommit === baseCommit && replay.baseStatusAfterBuild === '', 'Replay must use a clean detached base.');
  const output = read('controls/output.md');
  const generationHeading = '## generation-probe.mjs (code.generate at profile=build; full vs pruned of the five)\n';
  const expectedCensus = output.split('## reachability-census.mjs\n')[1].split(`\n${generationHeading}`)[0];
  const expectedGeneration = output.split(generationHeading)[1];
  const replayGeneration = read('controls/generation-probe.mjs.replay.stdout.log');
  invariant(read('controls/reachability-census.mjs.replay.stdout.log') === expectedCensus, 'Census replay is not byte-identical.');
  invariant(replayGeneration === expectedGeneration, 'Generation replay is not byte-identical.');
  const replayRows = replayGeneration.split('\n').filter(line => /\/(?:full|pruned):/.test(line));
  invariant(replayRows.length === NEW_SCHEMAS.length * FRAMEWORKS.length * 2, 'Planning replay is missing rows.');
  for (const schema of NEW_SCHEMAS) for (const framework of FRAMEWORKS) for (const mode of ['full', 'pruned']) {
    const rows = replayRows.filter(line => line.startsWith(`${schema}/${framework}/${mode}:`));
    invariant(rows.length === 1 && (mode === 'full' ? /status=error artifact=no \{"OODS-N015":\d+\}/ : /status=ok artifact=yes \{\}/).test(rows[0]),
      `Planning red/green control missing: ${schema}/${framework}/${mode}.`);
  }
  invariant(replay.comparisons.every(row => row.exitCode === 0 && row.exactStdoutMatch), 'Base replay command failed.');
  const resolution = json('controls/base-resolution.json');
  const isolation = json('controls/dependency-isolation.json');
  invariant(resolution.rows.length > 0 && resolution.rows.every(row => row.resolved.startsWith(`${resolution.base}/`)), 'Base resolved a current package.');
  invariant(resolution.base === isolation.basePath && isolation.head === baseCommit && isolation.nodeModulesDirectorySymlinks === false,
    'Base dependencies are not independently installed.');
  invariant(isolation.oodsWorkspaceDependencyLinks.every(row => row.resolved.startsWith('packages/') && !row.resolved.includes('..')),
    'Base workspace dependency escaped the checkout.');
  invariant(json('controls/base-build-exit.json').exitCode === 0, 'Base package closure did not build.');
  const activity = json('controls/activity-companion.stdout.json');
  invariant(activity.provenance.startsWith('New companion observation;') && activity.schemaUnchanged, 'Activity provenance is mislabeled.');
  sameMembers(activity.cells.map(row => row.framework), FRAMEWORKS, 'New activity companion controls');
  invariant(activity.cells.every(row => row.status === 'ok' && row.artifactPresent && row.issues.length === 0), 'Activity companion failed.');
  invariant(activity.schemaFileSha256 === saved('cmos-activity-redesign').sha256, 'Activity input differs.');
  const baseControl = { report: `${evidencePath}/controls/base-replay.json`, baseCommit, byteIdenticalReplayRows: replayRows.length,
    newlyMeasuredActivityCells: activity.cells.length, originalActivityRows: 0, originalPlanningFiles: vendor.files.map(row => row.vendored) };

  const liveRoot = path.posix.dirname(execution.liveReport);
  const live = json(execution.liveReport);
  const generation = json('live-generation/report.json', liveRoot);
  const tarballs = json('submitted-packages/inventory.json', liveRoot);
  for (const row of tarballs) invariant(verifyHash(row.artifactPath, row.sha256, liveRoot).length === row.bytes, `${row.name}: tarball size mismatch.`);
  const validateBrowser = report => {
    const browser = report.browser;
    invariant(browser.mount === 'passed' && browser.rootCount === 1 && browser.hydration === 'passed', `${report.schema}: browser did not mount/hydrate.`);
    invariant(browser.hydrationInvariant.equal === true && browser.hydrationInvariant.before.elements.length > 0, 'Hydration structure is unproven.');
    equal(browser.hydrationInvariant.before, browser.hydrationInvariant.after, 'Hydration DOM equality');
    equal(browser.runtimeErrors, [], 'Browser runtime errors');
    invariant(browser.hydrationProbe.attachment.attached === true
      && browser.hydrationProbe.reusedServerNodes.root === true
      && browser.hydrationProbe.reusedServerNodes.everyCapturedNode === true, 'Hydration did not attach while retaining SSR nodes.');
    for (const rows of [browser.requiredMounts, gate(report, 'server-render').detail.requiredSsrNodes]) {
      invariant(rows.length > 0, 'Schema-derived node obligations are missing.');
      for (const row of rows) invariant(row.passed === true && (row.requiredInitially ? row.present === true
        : row.reason?.startsWith('inactive initial Tabs panel ')), `${report.schema}/${row.nodeId}: required node absent.`);
    }
    for (const row of browser.labelVisibility) invariant(row.passed && row.visible && row.text.trim().length > 0, 'Visible component label is missing.');
    const interaction = browser.interactionEvidence;
    const detail = gate(report, 'interaction-evidence').detail;
    equal(detail.interactionEvidence, interaction, 'Raw interaction observation');
    equal(browser.actionCounts, detail.actionCounts, 'Raw action counts');
    equal(browser.actionArgs, detail.expectedArguments, 'Exact action operands');
    invariant(browser.actionsFrozen === true, 'Consumer action interface was mutable.');
    for (const row of browser.selectorEvidence) invariant(row.count === 1 && row.clicked && browser.actionCounts[row.action] === 1,
      `${row.action}: generated callback did not execute exactly once.`);
    if (interaction.kind === 'none') {
      invariant(interaction.status === 'not-applicable' && interaction.reason === NOT_APPLICABLE_REASONS[report.schema], 'Interaction exclusion changed.');
      sameMembers(interaction.disabledControls.map(row => row.nodeId), interaction.disabledPaginationNodeIds, 'Disabled controls');
      for (const row of interaction.disabledControls) invariant(row.passed && row.unchanged && row.count === 2 && row.observations.length === 2
        && row.observations.every(control => control.visible && control.disabled), 'Disabled pagination is not visible and inert.');
    } else {
      invariant(interaction.status === 'passed' && browser.hydrationProbe.eventHandlerAttached, 'Interaction handler was not attached.');
      if (interaction.kind === 'tabs') invariant(interaction.before !== interaction.after && interaction.panelVisible
        && interaction.selectedCount === 1, 'Tabs did not change the selected visible panel.');
      if (interaction.kind === 'field') invariant(interaction.component === 'SearchInput'
        ? interaction.attemptedValue.length > 0 && interaction.clearVisible && interaction.cleared && interaction.after === ''
        : interaction.before !== interaction.after && interaction.after === interaction.attemptedValue, 'Field state did not update.');
    }
    if (report.schema === 'plan-form-dark') {
      const bound = interaction.boundField;
      invariant(bound?.passed && bound.after.value === bound.after.heading
        && bound.before.value !== bound.after.value && bound.before.heading !== bound.after.heading,
      'Plan textarea did not update the real bound heading.');
    }
  };
  const validateCell = (report, artifactRoot, { browser = true } = {}) => {
    const accounting = deriveGateAccounting(report.gates, report.schema);
    invariant(report.status === 'passed' && report.selected === accounting.total && report.passed === accounting.proven
      && (report.notApplicable ?? 0) === accounting.notApplicable && report.failed === 0 && report.skipped === 0, 'Cell headline does not match observed gates.');
    for (const row of report.gates) logRefs(row.logs, artifactRoot);
    const fingerprint = report.generation.fingerprint;
    invariant(fingerprint.handler === 'code.generate' && fingerprint.invocation === 'live-in-process'
      && fingerprint.profile === 'build' && fingerprint.sourceOfArtifact === 'current-in-run-output', 'Artifact is not current live generation.');
    verifyHash(report.generation.sourcePath, report.generation.sourceSha256, artifactRoot);
    bytes(report.generation.generationLog, artifactRoot);
    const own = report.sourceOwnership;
    invariant(own.generatedOwnsEverySelector && own.generatedForwardsEveryAction && own.selectorOccurrencesInConsumerEntries === 0
      && own.consumerComponentDeclarations.length === 0, 'Consumer invented a component or action control.');
    for (const key of ['outsidePnpmWorkspace', 'freshNodeModules', 'emptyVerifierOwnedNpmConfiguration', 'localPackagesFromBuiltTarballsOnly', 'allResolvedPathsOutsideRepository'])
      invariant(report.isolation[key] === true, `Consumer isolation ${key} is unproven.`);
    for (const key of ['installScripts', 'workspaceAliases', 'workspaceSymlinks', 'repositorySourceImports', 'inheritedNodeModules'])
      invariant(report.isolation[key] === false, `Consumer isolation ${key} is unsafe.`);
    const resolutions = gate(report, 'fresh-exact-tarball-install').detail.resolutions;
    invariant(resolutions.length > 0 && resolutions.every(row => row.consumerRelative.startsWith('node_modules/')
      && !row.consumerRelative.split('/').includes('..')), 'Consumer resolved outside its installed package closure.');
    for (const row of report.localTarballs) {
      const original = tarballs.find(tarball => tarball.name === row.name);
      invariant(original && original.sha256 === digest(row.sha256) && original.bytes === row.bytes, 'Consumer used a different tarball.');
    }
    if (browser) {
      validateBrowser(report);
      equal(json(gate(report, 'mount').logs.find(file => file.endsWith('browser-proof.log')), artifactRoot), report.browser, 'Browser raw log/report equality');
      equal(json(gate(report, 'interaction-evidence').logs.find(file => file.endsWith('source-ownership.log')), artifactRoot), own, 'Source ownership raw log/report equality');
    }
    return accounting;
  };
  const expectedCells = [...NEW_SCHEMAS, ...REGRESSION_SCHEMAS].flatMap(schema => FRAMEWORKS.map(framework => `${schema}/${framework}`));
  sameMembers(live.cells.map(row => `${row.schema}/${row.framework}`), expectedCells, 'Live target cells');
  sameMembers(generation.cells.map(row => `${row.schema}/${row.framework}`), expectedCells, 'Live generated cells');
  invariant(live.status === 'passed' && generation.status === 'passed', 'Live source or consumer report did not pass.');
  const cells = live.cells.map(summary => {
    const report = JSON.parse(verifyHash(summary.report, summary.reportSha256, liveRoot).toString('utf8'));
    const accounting = validateCell(report, liveRoot);
    equal(report.gates, summary.gates, 'Summary gates differ from full report');
    const source = generation.cells.find(row => row.schema === report.schema && row.framework === report.framework);
    invariant(source.sourceSha256 === report.generation.sourceSha256, 'Packed consumer did not use current-run generation.');
    const copiedSource = `${path.posix.dirname(summary.report)}/source/${report.sourceOwnership.generatedFile}`;
    verifyHash(copiedSource, report.generation.sourceSha256, liveRoot);
    return { schema: report.schema, framework: report.framework, cohort: NEW_SCHEMAS.includes(report.schema) ? 'new' : 'regression',
      report: resolveRef(summary.report, liveRoot), ...accounting, interaction: report.browser.interactionEvidence, fullReport: report };
  });
  const totals = rows => Object.fromEntries(['total', 'applicable', 'proven', 'notApplicable', 'unproven', 'failed']
    .map(key => [key, rows.reduce((sum, row) => sum + row[key], 0)]));
  const accounting = { mission: 's185-m04', gateNames: GATES, cellCount: cells.length, totals: totals(cells),
    cohorts: { new: totals(cells.filter(row => row.cohort === 'new')), regression: totals(cells.filter(row => row.cohort === 'regression')) },
    cells: cells.map(({ fullReport, ...row }) => row) };
  invariant(live.selected === accounting.totals.total && live.passed === accounting.totals.proven
    && live.applicable === accounting.totals.applicable && live.notApplicable === accounting.totals.notApplicable
    && execution.schemaTargetCells === cells.length && execution.passedGates === accounting.totals.proven
    && execution.applicableGates === accounting.totals.applicable && execution.notApplicableGates === accounting.totals.notApplicable,
  'Execution/aggregate headline disagrees with independently derived gate accounting.');
  const regression = { mission: 's185-m04', kind: 'canonical-historical-gate-and-action-projection',
    comparison: 'Canonical projected JSON is byte-equal; enriched full reports are not claimed byte-equal.',
    excludedRunSpecificFields: ['mission and artifact paths', 'generation timestamps and hashes', 'tarball/build hashes and byte counts',
      'framework-generated DOM ids and private hydration attachment keys'],
    excludedAdditiveObservations: ['requiredSsrNodes and requiredMounts, including inactive initial Tabs panel reasons',
      'generalized interactionEvidence and schema-derived labels', 'hydration attachment and retained-node observations', 'explicit notApplicable count'],
    cells: cells.filter(row => row.cohort === 'regression').map(row => {
      const previousPath = `artifacts/product-reality/sprint-184/m06/live-consumers/cells/${row.schema}/${row.framework}/report.json`;
      const previous = historicalOutcomeProjection(json(previousPath));
      const current = historicalOutcomeProjection(row.fullReport);
      equal(current, previous, `${row.schema}/${row.framework}: historical gate/action outcome`);
      return { schema: row.schema, framework: row.framework, historicalReport: previousPath, currentReport: row.report,
        projectionByteEqual: true, historicalProjectionSha256: hash(canonical(previous)), currentProjectionSha256: hash(canonical(current)), projection: current };
    }) };

  const differential = json('controls/differential/report.json');
  invariant(differential.status === 'passed' && differential.failedGate === 'live-generation-source-equality'
    && differential.mutation.replacementCount === 1 && differential.mutation.artifactJsonPathsTouched.length === 0, 'Differential mutation failed or touched fixture artifacts.');
  const snapshots = {};
  for (const phase of ['preGreen', 'selectedRed', 'restoredGreen']) {
    const record = differential[phase];
    invariant(record.run.exitCode === 0, `${phase}: differential observation did not run.`);
    snapshots[phase] = json(record.snapshotPath);
    equal(snapshots[phase], record.snapshot, `${phase}: differential raw snapshot`);
    invariant(hash(canonical(snapshots[phase].live.cells)) === digest(snapshots[phase].live.sha256), 'Differential live source hash is false.');
  }
  invariant(snapshots.preGreen.live.sha256 !== snapshots.selectedRed.live.sha256
    && snapshots.preGreen.live.sha256 === snapshots.restoredGreen.live.sha256, 'Current emitter mutation did not change then restore current output.');
  equal(snapshots.preGreen.legacy, snapshots.selectedRed.legacy, 'Frozen legacy output moved under emitter mutation');
  equal(snapshots.preGreen.legacy, snapshots.restoredGreen.legacy, 'Frozen legacy output did not restore');
  for (const phase of ['preGreen', 'selectedRed', 'restoredGreen']) sameMembers(snapshots[phase].live.cells.map(row => row.framework), FRAMEWORKS, 'Differential targets');
  for (const framework of FRAMEWORKS) {
    const sourceHash = phase => snapshots[phase].live.cells.find(row => row.framework === framework).sourceSha256;
    invariant(sourceHash('preGreen') === sourceHash('restoredGreen')
      && (framework === 'react' ? sourceHash('preGreen') !== sourceHash('selectedRed') : sourceHash('preGreen') === sourceHash('selectedRed')),
    `${framework}: differential discrimination failed.`);
  }
  logRefs(differential.logs);
  for (const [phase, exit] of [['pre-green', 0], ['selected-red', 1], ['restored-green', 0]])
    invariant(read(`controls/differential/${phase}-source-equality.log`).includes(`exit=${exit} signal=none`), 'Differential equality control exit is wrong.');
  verifyHash(differential.mutation.file, differential.mutation.restoredSha256);
  invariant(differential.mutation.beforeSha256 === differential.mutation.restoredSha256
    && differential.mutation.beforeSha256 !== differential.mutation.deletedSha256, 'Differential source was not restored.');
  bytes(differential.mutation.patch); bytes(differential.mutation.reversePatch);

  const header = json('controls/detailheader-discrimination/report.json');
  invariant(header.status === 'passed', 'Physical header discrimination did not pass.');
  sameMembers(header.cases.map(row => row.framework), FRAMEWORKS, 'Header deletion directions');
  const headerCases = header.cases.map(control => {
    invariant(control.status === 'passed' && control.physicalImplementationDeletion && control.restored && control.otherFrameworkDistUnchanged,
      'Header physical deletion/isolation/restoration unproven.');
    const counts = { selectedRed: 0, unaffectedGreen: 0, restoredGreen: 0 };
    for (const phase of ['preGreen', 'selectedRed', 'restoredGreen']) {
      const record = control[phase];
      invariant(record.run.exitCode === 0, `${phase}: header observation did not execute.`);
      const rows = json(record.snapshotPath);
      equal(rows, record.snapshot, 'Header raw observation');
      sameMembers(rows.map(row => `${row.schema}/${row.framework}`), NEW_SCHEMAS.flatMap(schema => FRAMEWORKS.map(framework => `${schema}/${framework}`)), 'Header control target cells');
      for (const row of rows) {
        const operand = saved(row.schema);
        invariant(row.schemaSha256 === operand.sha256, 'Header control changed the saved schema.');
        const headerNodes = schemaNodes(operand.schema).filter(node => node.component === 'DetailHeader').map(node => node.id);
        sameMembers(row.headerNodes, headerNodes, 'Header membership must derive from saved schema');
        const red = phase === 'selectedRed' && row.framework === control.framework && headerNodes.length > 0;
        if (red) {
          invariant(row.status === 'red' && !row.artifactNonempty && row.sourceBytes === 0, 'Deleted header still emitted a component.');
          invariant(row.errorCodes.length > 0 && row.errorCodes.every(code => code === 'OODS-N015')
            && row.errorComponents.length > 0 && row.errorComponents.every(component => component === 'DetailHeader')
            && row.validationChecks.includes('target-readiness'), 'Header deletion failed at the wrong gate.');
          counts.selectedRed++;
        } else {
          invariant(row.status === 'green' && row.artifactNonempty && row.sourceBytes > 0 && row.errorCodes.length === 0,
            'Unaffected or restored header target is not green.');
          if (phase === 'selectedRed') counts.unaffectedGreen++;
          if (phase === 'restoredGreen') counts.restoredGreen++;
        }
      }
    }
    invariant(control.sources.length === 2 && control.patches.length === 2, 'Header implementation and export must both be physically removed.');
    for (const source of control.sources) {
      verifyHash(source.path, source.restoredSha256);
      invariant(source.beforeSha256 === source.restoredSha256 && source.beforeSha256 !== source.deletedSha256, 'Header source deletion/restoration hash failed.');
    }
    control.patches.forEach(ref => bytes(ref)); logRefs(control.logs);
    invariant(counts.selectedRed === control.selectedRedCells && counts.unaffectedGreen === control.unaffectedGreenCells
      && counts.restoredGreen === control.restoredGreenCells, 'Header control headline mismatch.');
    return { framework: control.framework, ...counts };
  });
  const previousMutations = JSON.parse(verifyHash(header.otherFourComponents.report, header.otherFourComponents.sha256).toString('utf8'));
  invariant(previousMutations.status === 'passed', 'Referenced m03 component mutations did not pass.');
  const previousFour = previousMutations.mutants.filter(row => row.component !== 'DetailHeader');
  invariant(previousFour.length === 4 * FRAMEWORKS.length, 'Other four component deletion cells are missing.');
  sameMembers(header.otherFourComponents.cells, previousFour.map(row => row.selectedCell), 'Referenced other-four component cells');
  for (const row of previousFour) {
    invariant(row.status === 'passed' && row.restoredByteIdentically, 'Referenced m03 mutation was not restored.');
    equal(row.selectedRed.packageRedCells, [row.selectedCell], 'Referenced m03 selected component red');
    equal(row.selectedRed.readinessRedCells, [row.selectedCell], 'Referenced m03 selected readiness red');
    for (const phase of ['preGreen', 'restoredGreen']) {
      equal(row[phase].packageRedCells, [], 'Referenced m03 package green');
      equal(row[phase].readinessRedCells, [], 'Referenced m03 readiness green');
    }
  }

  const hydration = json(execution.hydrationReport);
  invariant(hydration.status === 'passed' && hydration.subjectSchema === 'plan-form-dark', 'New-schema hydration controls failed.');
  sameMembers(hydration.cases.map(row => row.framework), FRAMEWORKS, 'Hydration control directions');
  for (const control of hydration.cases) {
    invariant(control.status === 'passed' && control.applyingPatchVerified && control.beforeSha256 !== control.afterSha256, 'Hydration mutation was not physically applied.');
    bytes(control.patch); logRefs(control.logs);
    for (const [phase, directory] of [['preGreen', 'pre-green'], ['restoredGreen', 'restored-green']])
      validateCell(control.phases[phase], control.phaseRoots[directory]);
    const red = control.phases.selectedRed;
    verifyHydrationRed(red);
    for (const row of red.gates) if (row.logs?.length) logRefs(row.logs, control.phaseRoots['selected-red']);
    if (red.logs?.length) logRefs(red.logs, control.phaseRoots['selected-red']);
    invariant(control.phases.preGreen.generation.sourceSha256 === control.phases.restoredGreen.generation.sourceSha256, 'Hydration restore changed the source artifact.');
    const original = cells.find(row => row.schema === control.subjectSchema && row.framework === control.framework).fullReport;
    invariant(original.generation.sourceSha256 === control.phases.preGreen.generation.sourceSha256, 'Hydration bites did not reuse current run generation.');
  }
  invariant(hydration.detectedBites === hydration.cases.length && execution.detectedHydrationBites === hydration.cases.length, 'Hydration bite count mismatch.');

  const b2 = json('b2/remeasurement-disposition.json');
  invariant(b2.historicalDispositionUntouched && b2.status === 'passed', 'B2 remeasurement did not preserve historical disposition.');
  const historicalB2 = JSON.parse(verifyHash(b2.historicalDisposition.path, b2.historicalDisposition.sha256).toString('utf8'));
  sameMembers(b2.rows.map(row => row.id), historicalB2.typedOutcomes.map(row => row.id), 'B2 original input membership');
  const measurements = Object.fromEntries(b2.observations.map(row => {
    const measurement = JSON.parse(verifyHash(row.path, row.sha256).toString('utf8'));
    invariant(measurement.inputsUnchanged && measurement.savedStoreEntries.length === 0, 'B2 changed its original input or saved an unsupported result.');
    for (const input of measurement.rows) {
      invariant(hash(JSON.stringify(input.input)) === input.inputSha256, 'B2 input SHA is false.');
      const response = JSON.parse(verifyHash(input.rawResponse.path, input.rawResponse.sha256, path.posix.dirname(row.path)).toString('utf8'));
      equal(response.error ?? null, input.error, 'B2 raw response error');
    }
    return [row.label, measurement];
  }));
  sameMembers(Object.keys(measurements), ['base', 'current', 'final'], 'B2 measured phases');
  for (const row of b2.rows) {
    invariant(row.reason.trim().length > 0 && row.sourceInputUnchanged, 'B2 changed outcome lacks a reason.');
    const original = historicalB2.typedOutcomes.find(input => input.id === row.id);
    equal(row.input, original.input, 'B2 historical input');
    equal(row.baseError, { step: original.step, code: original.code, message: original.message }, 'B2 historical base outcome');
    for (const [phase, key] of [['base', 'baseError'], ['current', 'preFixError'], ['final', 'finalError']]) {
      const measured = measurements[phase].rows.find(input => input.id === row.id);
      equal(measured.input, row.input, 'B2 immutable input'); equal(measured.error, row[key], 'B2 measured outcome');
    }
  }
  const reachability = json('reachability-final/report.json');
  for (const row of reachability.rows) {
    verifyHash(row.input.path, row.input.sha256);
    sameMembers(row.cells.map(cell => cell.framework), FRAMEWORKS, 'Reachability targets');
    for (const cell of row.cells) {
      const response = JSON.parse(verifyHash(cell.response.path, cell.response.sha256, `${evidencePath}/reachability-final`).toString('utf8'));
      invariant(cell.status === response.status && cell.artifactPresent === !!response.code?.trim(), 'Reachability projection differs from raw response.');
      equal(cell.issues, (response.errors ?? []).map(({ code, nodeId, message }) => ({ code, nodeId, message })), 'Reachability issue projection');
    }
    invariant(row.reachable === row.cells.every(cell => cell.status === 'ok' && cell.artifactPresent), 'Reachability row miscounted.');
  }
  const reachabilityCount = reachability.rows.filter(row => row.reachable).length;
  const generatedCells = reachability.rows.flatMap(row => row.cells).filter(row => row.artifactPresent).length;
  invariant(reachability.rows.length === identity.schemas.length && reachability.total === reachability.rows.length
    && reachability.reachable === reachabilityCount && reachability.generatedCells === generatedCells, 'Reachability denominator mismatch.');

  // Index every log, including failed/superseded attempts and unreferenced stderr captures.
  // Capture this command's stdout outside m04, then copy it in and regenerate before staging/checking.
  const rawLogs = allFiles(evidencePath).filter(file => file.endsWith('.log')).map(file => { bytes(file); return inputs.get(file); });
  if (checkTracked) {
    const tracked = new Set(execFileSync('git', ['ls-files', '-z'], { cwd: root }).toString('utf8').split('\0'));
    for (const file of rawLogs) invariant(tracked.has(file.path), `Raw log is not git-tracked: ${file.path}`);
    for (const row of tarballs) invariant(tracked.has(resolveRef(row.artifactPath, liveRoot)), `Exact tarball is not git-tracked: ${row.artifactPath}`);
  }
  const retentionSource = read('scripts/product-reality/assert-s184-evidence-retention.mjs');
  invariant(retentionSource.includes('185'), 'Sprint 185 is absent from raw-log retention enforcement.');
  const sourcePaths = ['scripts/product-reality/s185-m04-build-record.mjs', 'scripts/product-reality/s185-m04-execute.ts',
    'scripts/product-reality/s185-m04-live-consumers.ts', 'scripts/product-reality/s184-m06-live-consumers.ts',
    'scripts/product-reality/s185-m04-consumer-contract.ts', 'scripts/product-reality/s185-m04-controls.ts',
    'scripts/product-reality/s185-b2-legacy-inputs.mjs', 'scripts/product-reality/s185-reachability.mjs'];
  sourcePaths.forEach(ref => bytes(ref));
  bytes('execution-typecheck-config.json');
  bytes('harness-typecheck-config.json');
  allFiles('packages/mcp-server/test/product-reality').filter(file => file.endsWith('.s185.spec.ts')
    || file.endsWith('/b2-legacy-inputs.s184.spec.ts')).forEach(ref => bytes(ref));
  const controls = { base: baseControl, differential: { report: `${evidencePath}/controls/differential/report.json`,
    liveChangedAndRestored: true, frozenLegacyUnchanged: true }, header: { report: `${evidencePath}/controls/detailheader-discrimination/report.json`, cases: headerCases,
    otherFourComponentMutations: header.otherFourComponents.report }, hydration: { report: execution.hydrationReport,
    detected: hydration.cases.length, sixPrerequisiteGatesPassed: true } };
  const index = { mission: 's185-m04', implementationBase, controls,
    inputs: [...inputs.values()].filter(row => !row.path.endsWith('.log')).sort((a, b) => a.path.localeCompare(b.path)), rawLogs,
    retention: { policy: 'All m04/**/*.log files, including failed and superseded attempts; --check requires every log git-tracked.',
      commandOutput: 'Write/check stdout is captured outside m04 to avoid hashing an output log during its own execution.' },
    disclosures: [
      'B2 preserves the base, pre-fix CardHeader supportingField regression, and final restored V162 response. Original request bytes remain unchanged.',
      'The first reachability run had a diagnostic projection bug; its raw responses and log remain. Only reachability-final supports the final census.',
      'Gate accounting describes the final live run; failed attempts remain in rawLogs and are never added to passed counts.',
      'The canonical historical projection compares stable gate outcomes and exact callback operands. Enriched full reports contain separately disclosed additive observations.',
      'Generation census supports reachability only. Packed runtime proof is limited to the eight schemas in gate-accounting.json.',
      'Original planning file byte identity was verified against the primary checkout at mission start; later verification uses retained provenance and vendored byte hashes without requiring that absolute checkout path.',
      'Decision 1739: initial form data parity is not claimed. The unchanged Vue form-mode emitter initializes internal defaults and accepts no PageProps form data; React accepts seeded PageProps. Vue initially shows an empty textarea and the heading fallback, while React shows Enterprise. Both observed edits update the real heading from the same local writer state. Raw before/after observations remain in gate-accounting.json; this existing API difference is not normalized away.',
    ] };
  const criterionEvidence = [
    ['controls/base-replay.json', 'controls/vendor-provenance.json', 'controls/base-resolution.json', 'controls/activity-companion.stdout.json'],
    ['gate-accounting.json', 'live-consumers/report.json'],
    ['gate-accounting.json', 'regression-comparison.json'],
    ['regression-comparison.json'],
    ['controls/differential/report.json'],
    ['live-consumers/report.json', 'controls/hydration/report.json'],
    ['controls/detailheader-discrimination/report.json'],
    ['b2/remeasurement-disposition.json'],
    ['evidence-index.json'],
  ];
  const record = { mission: 's185-m04', implementationBase, status: 'passed',
    criteria: criteria.successCriteria.map((criterion, index) => ({ number: index + 1, criterion, status: 'passed', evidence: criterionEvidence[index].map(ref => `${evidencePath}/${ref}`) })),
    accounting: { report: `${evidencePath}/gate-accounting.json`, ...accounting.totals }, controls,
    regressionComparison: `${evidencePath}/regression-comparison.json`, evidenceIndex: `${evidencePath}/evidence-index.json`,
    b2: { report: `${evidencePath}/b2/remeasurement-disposition.json`, rows: b2.rows.map(({ id, finalError, reason }) => ({ id, finalError, reason })) },
    generationCensus: { report: `${evidencePath}/reachability-final/report.json`, reachable: reachabilityCount, total: reachability.rows.length, generatedCells,
      limitation: reachability.limitation },
    formDataLimitation: { decision: 1739, initialFormDataParityClaimed: false,
      reason: 'Existing generated framework APIs differ: React accepts seeded PageProps; Vue form mode initializes internal defaults. Both actual edits update the real heading. Initial observations remain in the cell reports.',
      source: 'packages/mcp-server/src/codegen/vue-emitter.ts', inheritedFrom: baseCommit },
    builderSelfCertified: false, separateReviewRequired: true };
  return { 'gate-accounting.json': accounting, 'regression-comparison.json': regression, 'evidence-index.json': index, 'build-record.json': record };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const mode = process.argv[2];
  invariant(['--write', '--check'].includes(mode), 'Usage: node scripts/product-reality/s185-m04-build-record.mjs --write|--check');
  const records = buildRecords({ checkTracked: mode === '--check' });
  for (const [name, value] of Object.entries(records)) {
    const file = path.join(repositoryRoot, evidencePath, name);
    if (mode === '--write') writeFileSync(file, canonical(value));
    else invariant(readFileSync(file, 'utf8') === canonical(value), `${name}: stale evidence record; regenerate after final writes.`);
  }
  const totals = records['gate-accounting.json'].totals;
  process.stdout.write(`${mode}: ${totals.proven} of ${totals.applicable} applicable gates; ${totals.notApplicable} not applicable; ${totals.unproven} unproven; ${records['evidence-index.json'].rawLogs.length} raw logs.\n`);
}
