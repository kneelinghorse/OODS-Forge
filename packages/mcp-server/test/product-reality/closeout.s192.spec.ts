import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { deriveRange, deriveMovers, S192_PUBLIC_RUNTIME_SCOPE } from '../../../../scripts/product-reality/s185-sprint-wide-movers.mjs';
import { auditSprintRange } from '../../../../scripts/product-reality/s185-audit-closeout.mjs';
import { SUITES, S192_SUITES, assertEvidenceOnlyHeadChanges } from '../../../../scripts/product-reality/s185-suite-accounting.mjs';
import { buildNotices } from '../../../../scripts/product-reality/s185-reconnect.mjs';

const root = new URL('../../../../', import.meta.url).pathname;
const base = execFileSync('git', ['rev-parse', '5fdf8a18'], { cwd: root, encoding: 'utf8' }).trim();
const measured = execFileSync('git', ['rev-parse', '3325070a'], { cwd: root, encoding: 'utf8' }).trim();
const range = deriveRange(base, measured, root, S192_PUBLIC_RUNTIME_SCOPE);
const options = { sprintId: 'sprint-192', missionId: 's192-m07', base };

describe('Sprint 192 bounded closeout', () => {
  it('independently enumerates the catalog, contracts, styles, tokens and export boundary', () => {
    const audit = auditSprintRange({ root, base, head: measured, sprintId: 'sprint-192' });
    expect(range.canonicalPaths).toEqual(audit.canonicalPaths);
    expect(range.publicPaths).toEqual(audit.publicPaths);
    expect(range.publicPaths).toEqual(expect.arrayContaining([
      'packages/mcp-server/src/schemas/catalog.list.output.json',
      'packages/component-contracts/registry/component-capability-ledger.v1.json',
      'packages/component-styles/src/components.css',
      'artifacts/structured-data/oods-components-2026-09-10.json',
    ]));
  });
  it('rejects an omitted catalog schema in the declared sprint diff', () => {
    const declaration = { s192: { ...range, canonicalPaths: range.canonicalPaths.filter(file => !file.endsWith('catalog.list.output.json')) } };
    expect(() => deriveMovers(measured, declaration, root, options)).toThrow(/declared mover union differs/);
  });
  it('prepares exactly the three active destinations without sending or approving classifications', () => {
    const movers = deriveMovers(measured, { s192: range }, root, options);
    const plan = buildNotices(movers, root);
    expect(plan).toMatchObject({ sent: false, sendsExecuted: 0, targets: ['cmos-dashboard', 'forge-demos', 'aquex-mcp'], deliverySprint: 'sprint-193' });
    for (const notice of plan.notices) for (const text of ['catalog_list productReality.surfaces', '2026-09-10', 'AuditSummaryCard', 'SortIndicator', 'TimelineEntryLabel', 'approvedRuntimeCensus remains null']) expect(notice.request.body).toContain(text);
  });
  it('keeps historical four-suite profiles and root-core unchanged while adding the fifth suite', () => {
    expect(SUITES).toEqual(['viz-core', 'viz-render', 'mcp-server', 'root-core']);
    expect(S192_SUITES).toEqual([...SUITES, 'component-packages']);
    expect(readFileSync(`${root}/vitest.config.ts`)).toEqual(execFileSync('git', ['show', `${base}:vitest.config.ts`], { cwd: root }));
  });
  it('permits only additive receipt descendants after execution, never source edits or rewritten evidence', () => {
    expect(() => assertEvidenceOnlyHeadChanges([{ status: 'A', path: 'artifacts/product-reality/sprint-192/m07/five-suite-closeout/run-1/result.json' }], 'sprint-192')).not.toThrow();
    for (const row of [
      { status: 'M', path: 'artifacts/product-reality/sprint-192/m07/five-suite-closeout/run-1/result.json' },
      { status: 'A', path: 'artifacts/product-reality/sprint-192/m07/closeout/patch.mjs' },
      { status: 'M', path: 'packages/component-contracts/src/contracts.ts' },
      { status: 'M', path: 'artifacts/product-reality/sprint-192/m02/README.md' },
    ]) expect(() => assertEvidenceOnlyHeadChanges([row], 'sprint-192')).toThrow();
  });
});
