#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(process.env.OODS_VIZ_CENSUS_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), '../..'));
const directory = 'artifacts/product-reality/sprint-195/m04/viz';
const beforePath = `${directory}/before/viz-observations.json`;
const afterPath = `${directory}/viz-observations.json`;
const read = file => readFileSync(resolve(root, file), 'utf8');
const before = JSON.parse(read(beforePath));
const after = JSON.parse(read(afterPath));
const key = (type, scope) => `${type}/${scope.theme}/${scope.brand}`;
const oldScopes = new Map(before.observations.flatMap(row => row.scopes.map(scope => [key(row.chartType, scope), scope])));
const allowedRegistryChanges = ['certifyCoverage', 'accuracyRules', 'certifyProfile', 'certifyScopes'];
const retained = row => Object.fromEntries(Object.entries(row).filter(([field]) => !allowedRegistryChanges.includes(field)));
assert.equal(after.registry.length, 13);
for (const row of after.registry) {
  const prior = before.registry.find(item => item.chartType === row.chartType);
  assert(prior, `Missing before registry identity: ${row.chartType}`);
  assert.deepEqual(retained(row), retained(prior), `${row.chartType}: an undeclared registry field moved`);
}
const rows = after.observations.flatMap(row => row.scopes.map(scope => {
  const identity = key(row.chartType, scope);
  const prior = oldScopes.get(identity);
  assert(prior, `Missing before scope: ${identity}`);
  assert.equal(scope.svgHash, prior.svgHash, `${identity}: certification-only work changed public SVG bytes`);
  assert.deepEqual(scope.contrast, prior.contrast, `${identity}: certification-only work changed measured contrast`);
  return { identity, svgHashBefore: prior.svgHash, svgHashAfter: scope.svgHash,
    before: { coverage: prior.coverage, conformant: prior.conformant, accuracyRules: prior.accuracyRules, accuracySummary: prior.accuracySummary },
    after: { coverage: scope.coverage, conformant: scope.conformant, accuracyRules: scope.accuracyRules, accuracySummary: scope.accuracySummary, pillars: scope.pillars, findings: scope.findings } };
}));
assert.equal(rows.length, 52);
assert.equal(new Set(rows.map(row => row.identity)).size, oldScopes.size);
const record = {
  schemaVersion: 1, missionId: 's195-m04', builderSelfCertified: false,
  inputs: [beforePath, afterPath].map(path => ({ path, sha256: createHash('sha256').update(read(path)).digest('hex') })),
  reason: 'The declared ECharts data operand profile now grades accessibility, contrast, determinism, and evaluated accuracy; measured conformance booleans replace null on that path. Public pixels and unrelated registry fields are unchanged.',
  registryMovement: { allowedFields: allowedRegistryChanges, unchangedOtherFields: true,
    attribution: 'The m04 requirement to add real accuracy predicates supersedes the generic memo nonmover list for accuracyRules only; new per-scope metadata records the actual certification operand and booleans.' },
  summary: { types: after.registry.length, scopes: rows.length, unchangedSvgScopes: rows.length,
    beforeCertifiedTypes: before.registry.filter(row => row.certifyCoverage === 'certified').length,
    afterCertifiedTypes: after.registry.filter(row => row.certifyCoverage === 'certified').length,
    conformantScopes: rows.filter(row => row.after.conformant === true).length,
    nonconformantScopes: rows.filter(row => row.after.conformant === false).length,
    uncertifiedScopes: rows.filter(row => row.after.conformant === null).length },
  rows,
};
writeFileSync(resolve(root, `${directory}/verdict-migration.json`), JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify(record.summary));
