import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { NUCLEUS_COMPONENT_IDS } from '../../../../packages/component-contracts/dist/index.js';
import { SUPPORTED_COMPONENT_THEME_CELLS } from '../../../../packages/component-styles/dist/index.js';
const root = 'artifacts/product-reality/sprint-192/m04';
const summaries = [];
for (const framework of ['react', 'vue']) {
  const file = `${root}/${framework}/report.json`;
  const report = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.equal(report.status, 'passed'); assert.equal(report.failed, 0); assert.equal(report.skipped, 0);
  assert.deepEqual(report.canonicalIds, NUCLEUS_COMPONENT_IDS);
  assert.deepEqual(report.cells.map(cell => cell.cell), SUPPORTED_COMPONENT_THEME_CELLS.map(cell => `${cell.brand}-${cell.theme}`));
  for (const cell of report.cells) {
    assert.deepEqual(cell.rows.map(row => row.componentId), NUCLEUS_COMPONENT_IDS);
    assert.equal(createHash('sha256').update(fs.readFileSync(`${root}/${framework}/${cell.screenshot}`)).digest('hex'), cell.screenshotSha256);
  }
  const readinessPath = `packages/components-${framework}/evidence/${framework}-readiness.v1.json`;
  const readiness = JSON.parse(fs.readFileSync(readinessPath, 'utf8'));
  for (const row of readiness.rows) row.evidence.visualThemes = { status: 'passed', classification: 'verified', cells: report.cells.map(cell => cell.cell), refs: [`${file}#${row.componentId}`] };
  readiness.mission = 's192-m04';
  if (!readiness.derivation.includes('Sprint 192 m04 projects')) readiness.derivation += ' Sprint 192 m04 projects per-root six-cell browser contrast/token checks and screenshot hashes into visualThemes.';
  fs.writeFileSync(readinessPath, JSON.stringify(readiness, null, 2) + '\n');
  summaries.push({ framework, roots: NUCLEUS_COMPONENT_IDS.length, cells: report.cells.length, rootCells: report.rootCells,
    textPairs: report.cells.reduce((sum, cell) => sum + cell.rows.reduce((sum, row) => sum + row.pairs.length, 0), 0),
    minLightDarkTextRatio: Math.min(...report.cells.filter(cell => cell.theme !== 'hc').flatMap(cell => cell.rows.flatMap(row => row.pairs.map(pair => pair.ratio)))),
    minLightDarkFocusRatio: Math.min(...report.cells.filter(cell => cell.theme !== 'hc').flatMap(cell => cell.rows.flatMap(row => row.controls.map(pair => pair.ratio)))),
    report: file, status: 'passed' });
}
fs.writeFileSync(`${root}/measured-evidence.json`, JSON.stringify({ status: 'passed', rootCells: summaries.reduce((sum, row) => sum + row.rootCells, 0), summaries }, null, 2) + '\n');
console.log(summaries);
