import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  buildRecords, deriveGateAccounting, GATES, historicalOutcomeProjection,
  NOT_APPLICABLE_REASONS, verifyHydrationRed,
} from '../../../../scripts/product-reality/s185-m04-build-record.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const passed = () => GATES.map(name => ({ name, status: 'passed', reason: undefined as string | undefined }));
const excluded = (schema: keyof typeof NOT_APPLICABLE_REASONS) => passed().map(row => row.name === 'interaction-evidence'
  ? { ...row, status: 'not-applicable', reason: NOT_APPLICABLE_REASONS[schema] } : row);
const hydrationRed = () => ({
  status: 'detected', observedFailedGates: ['hydration'], gates: passed().map(row => ({ ...row,
    status: row.name === 'hydration' ? 'failed' : row.name === 'interaction-evidence' ? 'unproven' : 'passed' })),
});

describe('Sprint 185 evidence accounting preserves the actual proof denominator', () => {
  it('counts only observed applicable passes', () => {
    expect(deriveGateAccounting(passed(), 'plan-form-dark')).toMatchObject({
      total: 8, applicable: 8, proven: 8, notApplicable: 0, unproven: 0, result: '8 of 8 applicable gates',
    });
  });

  for (const schema of Object.keys(NOT_APPLICABLE_REASONS) as Array<keyof typeof NOT_APPLICABLE_REASONS>) {
    it(`${schema} retains its exact reason without counting the excluded gate as passed`, () => {
      expect(deriveGateAccounting(excluded(schema), schema)).toMatchObject({
        applicable: 7, proven: 7, notApplicable: 1, result: '7 of 7 applicable gates',
        exclusions: [{ gate: 'interaction-evidence', reason: NOT_APPLICABLE_REASONS[schema] }],
      });
      expect(() => deriveGateAccounting(passed(), schema)).toThrow(/counted as a pass/);
    });
  }

  it('rejects missing or duplicated gate observations even when headlines claim eight passes', () => {
    expect(() => deriveGateAccounting(passed().slice(1), 'plan-form-dark')).toThrow(/membership/);
    expect(() => deriveGateAccounting([...passed().slice(1), passed()[1]], 'plan-form-dark')).toThrow(/membership/);
  });

  it('rejects new exclusions and altered reasons', () => {
    expect(() => deriveGateAccounting(excluded('the-academy-landing-v1'), 'plan-form-dark')).toThrow(/unsupported exclusion/);
    const rows = excluded('cmos-dashboard-redesign');
    rows[7].reason = 'no interactive element declared';
    expect(() => deriveGateAccounting(rows, 'cmos-dashboard-redesign')).toThrow(/changed reason/);
  });

  it('reports failed and unobserved applicable gates as unproven and refuses a completion record', () => {
    const rows = passed(); rows[2].status = 'failed'; rows[3].status = 'unproven';
    expect(deriveGateAccounting(rows, 'plan-form-dark', { requireComplete: false })).toMatchObject({
      applicable: 8, proven: 6, unproven: 2, failed: 1,
    });
    expect(() => deriveGateAccounting(rows, 'plan-form-dark')).toThrow(/remain unproven/);
  });

  it('requires CSS plus the other five prerequisite passes before recognizing a hydration bite', () => {
    expect(() => verifyHydrationRed(hydrationRed())).not.toThrow();
    for (const name of GATES.filter(name => !['hydration', 'interaction-evidence'].includes(name))) {
      const report = hydrationRed(); report.gates.find(row => row.name === name)!.status = 'unproven';
      expect(() => verifyHydrationRed(report)).toThrow(/prerequisite/);
    }
  });

  it('cannot replace a hydration failure with a different gate or an inferred interaction pass', () => {
    const report = hydrationRed(); report.observedFailedGates = ['mount'];
    expect(() => verifyHydrationRed(report)).toThrow(/failed gate/);
    const interaction = hydrationRed(); interaction.gates[7].status = 'passed';
    expect(() => verifyHydrationRed(interaction)).toThrow(/cannot prove interaction/);
  });

  it('preserves callback arguments in the historical projection while excluding additive observations', () => {
    const report = JSON.parse(readFileSync(path.join(root,
      'artifacts/product-reality/sprint-184/m06/live-consumers/cells/subscription-list-dark/react/report.json'), 'utf8'));
    const enriched = structuredClone(report);
    enriched.gates[3].detail.requiredSsrNodes = [{ nodeId: 'additional-observation' }];
    enriched.generation.fingerprint = { generatedAt: 'another-run' };
    expect(historicalOutcomeProjection(enriched)).toEqual(historicalOutcomeProjection(report));
    enriched.gates[7].detail.actionArgs.handleRowClick = [['wrong-subscription']];
    expect(historicalOutcomeProjection(enriched)).not.toEqual(historicalOutcomeProjection(report));
  });

  it('independently rederives retained evidence without running builds, consumers, or mutations', () => {
    const records = buildRecords();
    const accounting = records['gate-accounting.json'];
    expect(accounting.totals).toEqual({ total: 128, applicable: 124, proven: 124, notApplicable: 4, unproven: 0, failed: 0 });
    expect(records['regression-comparison.json'].cells).toHaveLength(4);
    expect(records['evidence-index.json'].rawLogs.length).toBeGreaterThan(0);
    expect(records['build-record.json'].separateReviewRequired).toBe(true);
  });
});
