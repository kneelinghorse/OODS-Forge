#!/usr/bin/env node

import crypto from 'node:crypto';
import childProcess from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');

const BASELINE_COMMIT = 'ae560bc22969c1fd81336730be4330c9115fc316';
const PLANNING_COMMIT = '8ce349076e7e3ba3f0b2f3f667d4fbb5c6a4b63b';
const BASELINE_DATASET = path.join(repoRoot, 'artifacts/structured-data/oods-components-2026-03-06.json');
const CODE_CONNECT_DATASET = path.join(repoRoot, 'artifacts/structured-data/code-connect.json');
const COMPONENT_MAP = path.join(repoRoot, 'packages/mcp-server/src/render/component-map.ts');
const ROOT_ENTRY = path.join(repoRoot, 'src/index.ts');
const COMPONENT_SOURCE_ROOT = path.join(repoRoot, 'src/components');
const REGISTRY_DIR = path.join(repoRoot, 'packages/component-contracts/registry');
const EVIDENCE_DIR = path.join(repoRoot, 'artifacts/product-reality/sprint-182/m01');

const OUTPUTS = {
  intake: path.join(REGISTRY_DIR, 'component-intake.v1.json'),
  reconciliation: path.join(REGISTRY_DIR, 'component-reconciliation.proposed.v1.json'),
  capabilities: path.join(REGISTRY_DIR, 'component-capability-baseline.v1.json'),
  evidence: path.join(EVIDENCE_DIR, 'baseline-evidence.json'),
  digests: path.join(EVIDENCE_DIR, 'foundation-digests.json'),
};

const NUCLEUS = [
  'Badge',
  'Banner',
  'Button',
  'Card',
  'Checkbox',
  'DatePicker',
  'Grid',
  'Input',
  'Select',
  'Stack',
  'Table',
  'Tabs',
  'Text',
  'Textarea',
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readBaselineText(repoPath) {
  return childProcess.execFileSync('git', ['show', `${BASELINE_COMMIT}:${repoPath}`], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
}

function readBaselineJson(repoPath) {
  return JSON.parse(readBaselineText(repoPath));
}

function baselinePathExists(repoPath) {
  const result = childProcess.spawnSync('git', ['cat-file', '-e', `${BASELINE_COMMIT}:${repoPath}`], {
    cwd: repoRoot,
    stdio: 'ignore',
  });
  return result.status === 0;
}

function canonicalJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function sha256(contents) {
  return crypto.createHash('sha256').update(contents).digest('hex');
}

function toRepoPath(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join('/');
}

function compareCodePoint(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function resolveBaselineModule(fromRepoPath, specifier) {
  if (!specifier.startsWith('.')) return undefined;
  const base = path.posix.normalize(path.posix.join(path.posix.dirname(fromRepoPath), specifier.replace(/\.js$/, '')));
  const candidates = [
    `${base}.ts`,
    `${base}.tsx`,
    path.posix.join(base, 'index.ts'),
    path.posix.join(base, 'index.tsx'),
  ];
  return candidates.find((candidate) => baselinePathExists(candidate));
}

function collectRuntimeExports(entryRepoPath, seen = new Set()) {
  if (seen.has(entryRepoPath) || !baselinePathExists(entryRepoPath)) return new Set();
  seen.add(entryRepoPath);

  const source = readBaselineText(entryRepoPath);
  const names = new Set();

  for (const match of source.matchAll(/export\s+\*\s+from\s+['"]([^'"]+)['"]/g)) {
    const child = resolveBaselineModule(entryRepoPath, match[1]);
    if (!child) continue;
    for (const name of collectRuntimeExports(child, seen)) names.add(name);
  }

  for (const match of source.matchAll(/export\s+(?!type\b)\{([\s\S]*?)\}\s+from\s+['"]([^'"]+)['"]/g)) {
    for (const raw of match[1].split(',')) {
      const cleaned = raw.trim().replace(/^type\s+/, '');
      if (!cleaned || raw.trim().startsWith('type ')) continue;
      const pieces = cleaned.split(/\s+as\s+/);
      names.add((pieces[1] ?? pieces[0]).trim());
    }
  }

  for (const match of source.matchAll(/export\s+(?:async\s+)?(?:function|class|const|let|var)\s+([A-Za-z_$][\w$]*)/g)) {
    names.add(match[1]);
  }

  return names;
}

function collectReactSourceCandidates() {
  const candidates = new Map();
  const files = childProcess.execFileSync(
    'git', ['ls-tree', '-r', '--name-only', BASELINE_COMMIT, toRepoPath(COMPONENT_SOURCE_ROOT)],
    { cwd: repoRoot, encoding: 'utf8' },
  ).split(/\r?\n/).filter((filePath) => filePath.endsWith('.tsx')).sort(compareCodePoint);
  for (const filePath of files) {
    const source = readBaselineText(filePath);
    const names = new Set();
    for (const match of source.matchAll(/export\s+(?:const|function|class)\s+([A-Za-z_$][\w$]*)/g)) {
      names.add(match[1]);
    }
    for (const match of source.matchAll(/export\s*\{([\s\S]*?)\}/g)) {
      for (const raw of match[1].split(',')) {
        const pieces = raw.trim().replace(/^type\s+/, '').split(/\s+as\s+/);
        if (pieces[0]) names.add((pieces[1] ?? pieces[0]).trim());
      }
    }
    for (const name of names) {
      const refs = candidates.get(name) ?? [];
      refs.push(filePath);
      candidates.set(name, refs);
    }
  }
  return candidates;
}

function collectHtmlRendererNames() {
  const source = readBaselineText(toRepoPath(COMPONENT_MAP));
  const block = source.match(/export const componentRenderers:[\s\S]*?=\s*\{([\s\S]*?)\n\};/);
  if (!block) throw new Error('Unable to locate componentRenderers registry');
  return new Map(
    [...block[1].matchAll(/^\s{2}([A-Za-z_$][\w$]*):\s*([A-Za-z_$][\w$]*),?$/gm)]
      .map((match) => [match[1], match[2]]),
  );
}

function uniqueSorted(values) {
  return [...new Set(values)].sort(compareCodePoint);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function countBy(rows, key) {
  return rows.reduce((counts, row) => {
    const value = row[key];
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function buildDocuments() {
  const dataset = readBaselineJson(toRepoPath(BASELINE_DATASET));
  const sourceComponents = dataset.components ?? [];
  const components = [...sourceComponents].sort((a, b) => compareCodePoint(a.id, b.id));
  const ids = components.map((component) => component.id);
  const sortedIds = [...ids];
  const uniqueIds = uniqueSorted(ids);
  assert(components.length === 109, `Expected 109 baseline rows; received ${components.length}`);
  assert(uniqueIds.length === 109, `Expected 109 unique baseline IDs; received ${uniqueIds.length}`);
  assert(dataset.stats?.componentCount === 101, 'Locked stale-count baseline (101) no longer matches source');

  const htmlRenderers = collectHtmlRendererNames();
  const mappedIds = sortedIds.filter((id) => htmlRenderers.has(id));
  const fallbackIds = sortedIds.filter((id) => !htmlRenderers.has(id));
  assert(mappedIds.length === 98, `Expected 98 mapped HTML IDs; received ${mappedIds.length}`);
  assert(fallbackIds.length === 11, `Expected 11 HTML fallback IDs; received ${fallbackIds.length}`);

  const rootExports = collectRuntimeExports(toRepoPath(ROOT_ENTRY));
  const rootReactIds = sortedIds.filter((id) => rootExports.has(id));
  assert(rootReactIds.length === 12, `Expected 12 exact root React-name matches; received ${rootReactIds.length}`);

  const reactSourceCandidates = collectReactSourceCandidates();
  const codeConnect = readBaselineJson(toRepoPath(CODE_CONNECT_DATASET));
  const codeConnectIds = Object.keys(codeConnect.components ?? {}).sort(compareCodePoint);
  assert(codeConnectIds.length === 0, `Expected zero Code Connect component records; received ${codeConnectIds.length}`);

  const intakeRows = components.map((component) => ({
    id: component.id,
    displayName: component.displayName,
    baselineMetadata: {
      categories: component.categories ?? [],
      tags: component.tags ?? [],
      contexts: component.contexts ?? [],
      regions: component.regions ?? [],
    },
    intakeEvidence: uniqueSorted([
      toRepoPath(BASELINE_DATASET),
      ...(component.sourceFiles ?? []),
    ]),
  }));

  const intake = {
    schemaVersion: '1.0.0',
    kind: 'component-intake',
    baselineCommit: BASELINE_COMMIT,
    planningCommit: PLANNING_COMMIT,
    controllingObligationDenominator: intakeRows.length,
    countRule: 'Derived from the unique, deterministically sorted rows array; never from an independent counter.',
    rows: intakeRows,
  };

  const reconciliationRows = components.map((component) => {
    const id = component.id;
    const rootReact = rootExports.has(id);
    const htmlMapped = htmlRenderers.has(id);
    const classification = NUCLEUS.includes(id) || rootReact
      ? 'native'
      : htmlMapped
        ? 'recipe'
        : 'authoring-only';
    const evidence = uniqueSorted([
      ...(component.sourceFiles ?? []),
      ...(NUCLEUS.includes(id) ? ['cmos/planning/forge-s182-product-reality-foundation-decision-memo.md#43-exact-primitive-nucleus'] : []),
      ...(rootReact ? ['src/index.ts', ...(reactSourceCandidates.get(id) ?? [])] : []),
      ...(htmlMapped ? [`packages/mcp-server/src/render/component-map.ts#${htmlRenderers.get(id)}`] : []),
    ]);

    return {
      id,
      proposedClassification: classification,
      ...(classification === 'recipe' ? {
        proposedResolution: {
          surface: 'html',
          implementation: htmlRenderers.get(id),
          source: 'packages/mcp-server/src/render/component-map.ts',
        },
      } : {}),
      approvalState: 'pending-derek-approval',
      evidence,
    };
  });
  const classificationCounts = countBy(reconciliationRows, 'proposedClassification');
  const proposedRuntimeCount = (classificationCounts.native ?? 0) + (classificationCounts.recipe ?? 0);
  const reconciliation = {
    schemaVersion: '1.0.0',
    kind: 'component-reconciliation-proposal',
    baselineCommit: BASELINE_COMMIT,
    planningCommit: PLANNING_COMMIT,
    status: 'proposed-awaiting-derek-approval',
    controllingObligationDenominator: intakeRows.length,
    approvedRuntimeCensus: null,
    proposedRuntimeCensus: {
      byClassification: classificationCounts,
      runtimeRows: proposedRuntimeCount,
      nonRuntimeRows: reconciliationRows.length - proposedRuntimeCount,
    },
    rows: reconciliationRows,
  };

  const capabilityRows = components.map((component) => {
    const id = component.id;
    const sourceCandidates = reactSourceCandidates.get(id) ?? [];
    const compatibilityCandidates = id === 'Input'
      ? ['src/components/base/TextField.tsx', 'src/components/base/index.ts']
      : [];
    const reactEvidence = uniqueSorted([...sourceCandidates, ...compatibilityCandidates]);
    const rootReact = rootExports.has(id);
    const htmlMapped = htmlRenderers.has(id);
    const reconciliationRow = reconciliationRows.find((row) => row.id === id);
    return {
      id,
      proposedClassification: reconciliationRow.proposedClassification,
      reconciliationState: 'proposed-awaiting-derek-approval',
      surfaces: {
        contract: {
          state: NUCLEUS.includes(id) ? 'versioned-v1' : 'metadata-only',
          evidence: NUCLEUS.includes(id)
            ? ['packages/component-contracts/src/contracts.ts', 'packages/component-contracts/src/scenarios.ts']
            : component.sourceFiles ?? [],
        },
        metadata: { state: 'available', evidence: [toRepoPath(BASELINE_DATASET)] },
        html: {
          state: htmlMapped ? 'mapped' : 'fallback',
          evidence: htmlMapped
            ? [`packages/mcp-server/src/render/component-map.ts#${htmlRenderers.get(id)}`]
            : ['packages/mcp-server/src/render/component-map.ts#renderFallback'],
        },
        react: {
          state: rootReact ? 'implemented-unverified' : reactEvidence.length > 0 ? 'partial' : 'unavailable',
          evidence: rootReact ? uniqueSorted(['src/index.ts', ...reactEvidence]) : reactEvidence,
        },
        vue: { state: 'unavailable', evidence: [] },
        generatedConsumer: { state: 'unavailable', evidence: [] },
        accessibility: { state: 'unverified', evidence: [] },
        theme: { state: 'unverified', evidence: [] },
        interaction: { state: 'unverified', evidence: [] },
      },
    };
  });
  const capabilities = {
    schemaVersion: '1.0.0',
    kind: 'component-capability-baseline',
    baselineCommit: BASELINE_COMMIT,
    planningCommit: PLANNING_COMMIT,
    controllingObligationDenominator: intakeRows.length,
    rows: capabilityRows,
  };

  const evidence = {
    schemaVersion: '1.0.0',
    missionId: 's182-m01',
    baselineCommit: BASELINE_COMMIT,
    planningCommit: PLANNING_COMMIT,
    generatedFrom: [
      toRepoPath(BASELINE_DATASET),
      toRepoPath(COMPONENT_MAP),
      toRepoPath(ROOT_ENTRY),
      toRepoPath(CODE_CONNECT_DATASET),
    ],
    measurements: {
      intakeRows: components.length,
      uniqueIds: uniqueIds.length,
      embeddedComponentCount: dataset.stats.componentCount,
      derivedComponentCount: uniqueIds.length,
      htmlMapped: mappedIds.length,
      htmlFallback: fallbackIds.length,
      htmlFallbackIds: fallbackIds,
      rootReactExactMatches: rootReactIds.length,
      rootReactExactMatchIds: rootReactIds,
      vueRuntimeImplementations: 0,
      codeConnectComponents: codeConnectIds.length,
    },
    controllingObligationDenominator: intakeRows.length,
    reconciliationApproval: 'not-requested-by-build-session',
  };

  return { intake, reconciliation, capabilities, evidence };
}

function validateDocuments(documents) {
  const { intake, reconciliation, capabilities, evidence } = documents;
  const ids = intake.rows.map((row) => row.id);
  assert(ids.length === 109, `Intake row count is ${ids.length}, expected 109`);
  assert(uniqueSorted(ids).length === 109, 'Intake IDs are not unique');
  assert(JSON.stringify(ids) === JSON.stringify([...ids].sort(compareCodePoint)), 'Intake IDs are not sorted');
  assert(intake.controllingObligationDenominator === 109, 'Controlling denominator must remain 109');
  assert(reconciliation.rows.length === 109, 'Reconciliation must classify all 109 rows');
  assert(reconciliation.approvedRuntimeCensus === null, 'Build session may not approve the runtime census');
  assert(reconciliation.rows.every((row) => row.approvalState === 'pending-derek-approval'), 'Every proposal row must remain pending Derek approval');
  assert(capabilities.rows.length === 109, 'Capability baseline must report all 109 rows');
  assert(evidence.measurements.derivedComponentCount === 109, 'Evidence must derive 109 component rows');
  assert(evidence.measurements.htmlMapped === 98 && evidence.measurements.htmlFallback === 11, 'HTML baseline must remain 98 mapped / 11 fallback');
  assert(evidence.measurements.rootReactExactMatches === 12, 'React baseline must remain 12 exact root-name matches');
  assert(evidence.measurements.vueRuntimeImplementations === 0, 'Vue baseline must remain zero runtime implementations');
  assert(evidence.measurements.codeConnectComponents === 0, 'Code Connect baseline must remain empty');
  const classifications = new Set(['native', 'recipe', 'alias', 'authoring-only', 'merged', 'retired']);
  assert(reconciliation.rows.every((row) => classifications.has(row.proposedClassification)), 'Unknown reconciliation classification');
  const reconciliationIds = reconciliation.rows.map((row) => row.id);
  const capabilityIds = capabilities.rows.map((row) => row.id);
  assert(JSON.stringify(ids) === JSON.stringify(reconciliationIds), 'Reconciliation membership differs from intake');
  assert(JSON.stringify(ids) === JSON.stringify(capabilityIds), 'Capability membership differs from intake');
}

function readOutputs() {
  return {
    intake: readJson(OUTPUTS.intake),
    reconciliation: readJson(OUTPUTS.reconciliation),
    capabilities: readJson(OUTPUTS.capabilities),
    evidence: readJson(OUTPUTS.evidence),
  };
}

function writeOutputs(documents) {
  fs.mkdirSync(REGISTRY_DIR, { recursive: true });
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  for (const key of ['intake', 'reconciliation', 'capabilities', 'evidence']) {
    fs.writeFileSync(OUTPUTS[key], canonicalJson(documents[key]));
  }
  const digestRows = ['intake', 'reconciliation', 'capabilities', 'evidence'].map((key) => {
    const contents = fs.readFileSync(OUTPUTS[key]);
    return { path: toRepoPath(OUTPUTS[key]), bytes: contents.byteLength, sha256: sha256(contents) };
  });
  fs.writeFileSync(OUTPUTS.digests, canonicalJson({ schemaVersion: '1.0.0', missionId: 's182-m01', files: digestRows }));
}

function checkOutputDigests() {
  const digestDoc = readJson(OUTPUTS.digests);
  assert(digestDoc.files.length === 4, 'Digest index must contain four generated foundation documents');
  for (const row of digestDoc.files) {
    const fullPath = path.join(repoRoot, row.path);
    const contents = fs.readFileSync(fullPath);
    assert(contents.byteLength === row.bytes, `Byte count mismatch for ${row.path}`);
    assert(sha256(contents) === row.sha256, `Digest mismatch for ${row.path}`);
  }
}

const command = process.argv[2] ?? '--check';
if (command === '--write') {
  const documents = buildDocuments();
  validateDocuments(documents);
  writeOutputs(documents);
  console.log('Wrote Sprint 182 m01 foundation registry and evidence (109 rows).');
} else if (command === '--verify-baseline') {
  const expected = buildDocuments();
  const actual = readOutputs();
  validateDocuments(actual);
  for (const key of Object.keys(expected)) {
    assert(canonicalJson(expected[key]) === canonicalJson(actual[key]), `${key} does not match the measured baseline`);
  }
  checkOutputDigests();
  console.log('Verified Sprint 182 measured baseline: 109 / 98+11 / 12 / 0 / 0.');
} else if (command === '--check') {
  validateDocuments(readOutputs());
  checkOutputDigests();
  console.log('Validated Sprint 182 foundation registry, proposal, capability ledger, and digests.');
} else {
  throw new Error(`Unknown command: ${command}`);
}
