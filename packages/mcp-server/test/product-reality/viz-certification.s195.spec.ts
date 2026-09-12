import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { measureVizAccuracyControls } from '../../../../scripts/product-reality/s190-viz-census.js';

const root = resolve(import.meta.dirname, '../../../..');
const directory = 'artifacts/product-reality/sprint-195/m04/viz';
const read = (file: string) => JSON.parse(readFileSync(resolve(root, file), 'utf8'));

describe('the declared ECharts certification profile changes verdicts without repainting charts (s195 m04)', () => {
  it('retains every one of the 52 exact before/after SVG identities with source hashes', () => {
    const receipt = read(`${directory}/verdict-migration.json`);
    expect(receipt.summary).toMatchObject({ types: 13, scopes: 52, unchangedSvgScopes: 52, beforeCertifiedTypes: 5, afterCertifiedTypes: 13, conformantScopes: 48, nonconformantScopes: 4, uncertifiedScopes: 0 });
    expect(receipt.rows).toHaveLength(52);
    expect(new Set(receipt.rows.map((row: any) => row.identity)).size).toBe(52);
    for (const row of receipt.rows) expect(row.svgHashAfter).toBe(row.svgHashBefore);
    for (const input of receipt.inputs) expect(createHash('sha256').update(readFileSync(resolve(root, input.path))).digest('hex')).toBe(input.sha256);
  });

  it('retains false operand verdicts and the actual failing pillars instead of upgrading coverage to a pass', () => {
    const capture = read(`${directory}/viz-observations.json`);
    const scopes = capture.observations.flatMap((row: any) => row.scopes.map((scope: any) => ({ chartType: row.chartType, ...scope })));
    const failed = scopes.filter((scope: any) => scope.conformant === false);
    expect(failed).toHaveLength(4);
    expect(failed.every((scope: any) => scope.chartType === 'bubble_map')).toBe(true);
    for (const scope of failed) {
      const registered = capture.registry.find((row: any) => row.chartType === scope.chartType).certifyScopes
        .find((cell: any) => cell.theme === scope.theme && cell.brand === scope.brand);
      expect(registered).toMatchObject({ coverage: 'certified', conformant: false, pillars: scope.pillars, accuracySummary: scope.accuracySummary });
      expect(Object.values(scope.pillars)).toEqual(expect.arrayContaining(['fail']));
      expect(scope.findings.length).toBeGreaterThan(0);
    }
    const bubble = scopes.filter((scope: any) => scope.chartType === 'bubble_map');
    expect(bubble).toHaveLength(4);
    for (const scope of bubble) expect(scope.findings).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'OODS-V169' })]));
  });

  it('keeps every preexisting registry field unchanged except the declared certification/accuracy metadata', () => {
    const before = read(`${directory}/before/viz-census.json`);
    const after = read(`${directory}/viz-census.json`);
    const retained = (row: any) => Object.fromEntries(Object.entries(row).filter(([field]) => !['certifyCoverage', 'accuracyRules', 'certifyProfile', 'certifyScopes'].includes(field)));
    expect(after.map(retained)).toEqual(before.map(retained));
  });

  it('puts the real negative-size and negative-strength guards inside the executable census', async () => {
    const controls = await measureVizAccuracyControls();
    expect(controls.map(row => row.expectedCode)).toEqual(['OODS-V168', 'OODS-V171']);
    for (const row of controls) expect(row.grade).toMatchObject({ coverage: 'certified', conformant: false, pillars: { accuracy: 'fail' } });
  });
});
