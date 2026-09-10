import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { NUCLEUS_COMPONENT_IDS, sharedScenarios } from '../src/index.js';
import { SUPPORTED_COMPONENT_THEME_CELLS } from '../../component-styles/src/index.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

describe('readiness publishes measured semantics', () => {
  for (const target of ['react', 'vue']) it(`${target}: derives complete accessibility and interaction classes`, () => {
    const document = JSON.parse(fs.readFileSync(path.join(root, `packages/components-${target}/evidence/${target}-readiness.v1.json`), 'utf8'));
    expect(document.contractVersion).toBe('1.1.0');
    expect(document.rows.map((row: { componentId: string }) => row.componentId)).toEqual(NUCLEUS_COMPONENT_IDS);
    for (const row of document.rows) {
      const scenario = sharedScenarios.find(scenario => scenario.oodsComponentId === row.componentId)!;
      expect(row.evidence.accessibility).toMatchObject({ status: 'passed', classification: 'verified' });
      expect(row.evidence.interaction).toMatchObject({ status: 'passed', classification: scenario.interaction === 'none' ? 'not-applicable' : 'verified' });
      if (scenario.interaction === 'none') expect(row.evidence.interaction.reason).toBe(scenario.interactionReason);
      for (const evidence of [row.evidence.accessibility, row.evidence.interaction]) {
        expect(evidence.refs.length).toBeGreaterThan(0);
        for (const ref of evidence.refs) expect(fs.existsSync(path.join(root, ref.split('#')[0]))).toBe(true);
      }
    }
  });

  for (const target of ['react', 'vue']) it(`${target}: theme claims require measured roots in all six cells`, () => {
    const document = JSON.parse(fs.readFileSync(path.join(root, `packages/components-${target}/evidence/${target}-readiness.v1.json`), 'utf8'));
    const cells = SUPPORTED_COMPONENT_THEME_CELLS.map(cell => `${cell.brand}-${cell.theme}`);
    for (const row of document.rows) {
      expect(row.evidence.visualThemes).toMatchObject({ status: 'passed', classification: 'verified', cells });
      const report = JSON.parse(fs.readFileSync(path.join(root, row.evidence.visualThemes.refs[0].split('#')[0]), 'utf8'));
      expect(report).toMatchObject({ status: 'passed', failed: 0, skipped: 0 });
      expect(report.cells.map((cell: { cell: string }) => cell.cell)).toEqual(cells);
      for (const cell of report.cells) {
        const measured = cell.rows.find((measured: { componentId: string }) => measured.componentId === row.componentId);
        expect(measured, `${target}/${cell.cell}/${row.componentId} has browser evidence`).toBeDefined();
        expect(measured.pairs.length).toBeGreaterThan(0);
        expect(cell.failures).toEqual([]);
      }
    }
  });
});
