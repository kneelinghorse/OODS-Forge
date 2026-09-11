import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { deriveRange, deriveMovers, S193_PUBLIC_RUNTIME_SCOPE } from '../../../../scripts/product-reality/s185-sprint-wide-movers.mjs';
import { auditSprintRange } from '../../../../scripts/product-reality/s185-audit-closeout.mjs';
import { SUITES, S192_SUITES, assertEvidenceOnlyHeadChanges } from '../../../../scripts/product-reality/s185-suite-accounting.mjs';
import { validateRuntimeLedger } from '../../src/lib/runtime-ledger.js';
import { derivePublicHeadEquivalence } from '../../../../scripts/product-reality/s185-closeout.mjs';
import { buildNotices } from '../../../../scripts/product-reality/s185-reconnect.mjs';

const root = new URL('../../../../', import.meta.url).pathname;
const base = execFileSync('git', ['rev-parse', 'c098237f'], { cwd: root, encoding: 'utf8' }).trim();
const measured = execFileSync('git', ['rev-parse', 'ebb307e6'], { cwd: root, encoding: 'utf8' }).trim();
const range = deriveRange(base, measured, root, S193_PUBLIC_RUNTIME_SCOPE);
const options = { sprintId: 'sprint-193', missionId: 's193-m07', base };

describe('Sprint 193 bounded closeout', () => {
  it('independently enumerates the catalog, contracts, styles, tokens and export boundary', () => {
    const audit = auditSprintRange({ root, base, head: measured, sprintId: 'sprint-193' });
    expect(range.canonicalPaths).toEqual(audit.canonicalPaths);
    expect(range.publicPaths).toEqual(audit.publicPaths);
    expect(range.publicPaths).toEqual(expect.arrayContaining([
      'packages/mcp-server/src/schemas/health.output.json',
      'packages/component-contracts/registry/component-capability-ledger.v1.json',
      'packages/component-styles/src/components.css',
      'artifacts/structured-data/oods-components-2026-09-11-s193-m05.json',
    ]));
  });
  it('rejects an omitted catalog schema in the declared sprint diff', () => {
    const declaration = { s193: { ...range, canonicalPaths: range.canonicalPaths.filter(file => !file.endsWith('health.output.json')) } };
    expect(() => deriveMovers(measured, declaration, root, options)).toThrow(/declared mover union differs/);
  });
  it('prepares exactly the three active destinations without sending or approving classifications', () => {
    const movers = deriveMovers(measured, { s193: range }, root, options);
    const plan = buildNotices(movers, root);
    expect(plan).toMatchObject({ sent: false, sendsExecuted: 0, targets: ['cmos-dashboard', 'forge-demos', 'aquex-mcp'], deliverySprint: 'sprint-194' });
    for (const notice of plan.notices) for (const text of ['catalog_list productReality.surfaces', '2026-09-11-s193-m07', 'health productReality.runtime', 'health productReality.tools', 'approvedRuntimeCensus remains null']) expect(notice.request.body).toContain(text);
  });
  it('keeps historical four-suite profiles and root-core unchanged while adding the fifth suite', () => {
    expect(SUITES).toEqual(['viz-core', 'viz-render', 'mcp-server', 'root-core']);
    expect(S192_SUITES).toEqual([...SUITES, 'component-packages']);
    expect(execFileSync('git', ['show', `${measured}:vitest.config.ts`], { cwd: root })).toEqual(execFileSync('git', ['show', `${base}:vitest.config.ts`], { cwd: root }));
  });
  it('keeps the final 154-cell proof tied to its recorded implementation on later evidence commits', () => {
    const ledger = JSON.parse(readFileSync(`${root}/artifacts/product-reality/sprint-193/m07/runtime/runtime-cells.v1.json`, 'utf8'));
    expect(validateRuntimeLedger(ledger, true)).toEqual([]);
    expect(ledger.summary).toEqual({ cells: 154, pass: 154, typedGap: 0, fail: 0 });
    const current = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
    expect(derivePublicHeadEquivalence({ root, implementationHead: ledger.head, executionHead: current, sprintId: 'sprint-193' }).changedPaths).toEqual([]);
  });
  it('permits only additive receipt descendants after execution, never source edits or rewritten evidence', () => {
    expect(() => assertEvidenceOnlyHeadChanges([{ status: 'A', path: 'artifacts/product-reality/sprint-193/m07/five-suite-closeout/run-1/result.json' }], 'sprint-193')).not.toThrow();
    for (const row of [
      { status: 'M', path: 'artifacts/product-reality/sprint-193/m07/five-suite-closeout/run-1/result.json' },
      { status: 'A', path: 'artifacts/product-reality/sprint-193/m07/closeout/patch.mjs' },
      { status: 'M', path: 'packages/component-contracts/src/contracts.ts' },
      { status: 'M', path: 'artifacts/product-reality/sprint-193/m02/README.md' },
    ]) expect(() => assertEvidenceOnlyHeadChanges([row], 'sprint-193')).toThrow();
  });
});
