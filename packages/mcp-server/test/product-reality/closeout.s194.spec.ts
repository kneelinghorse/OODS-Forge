import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { deriveRange, deriveMovers, S194_BASE, S194_PUBLIC_RUNTIME_SCOPE } from '../../../../scripts/product-reality/s185-sprint-wide-movers.mjs';
import { auditSprintRange, auditSprint194ToolOutcomes } from '../../../../scripts/product-reality/s185-audit-closeout.mjs';
import { verifySprint194ToolOutcomes } from '../../../../scripts/product-reality/s185-closeout.mjs';
import { assertEvidenceOnlyHeadChanges, validateCloseoutCaptureLimit } from '../../../../scripts/product-reality/s185-suite-accounting.mjs';
import { buildNotices, requestHash } from '../../../../scripts/product-reality/s185-reconnect.mjs';

const root = new URL('../../../../', import.meta.url).pathname;
const read = (file: string) => JSON.parse(readFileSync(`${root}/${file}`, 'utf8'));
const measured = execFileSync('git', ['rev-parse', '3444ae4d'], { cwd: root, encoding: 'utf8' }).trim();
const options = { sprintId: 'sprint-194', missionId: 's194-m07', base: S194_BASE };
const range = deriveRange(S194_BASE, measured, root, S194_PUBLIC_RUNTIME_SCOPE);

describe('Sprint 194 tool-truth closeout', () => {
  it('independently enumerates the complete tool/SDK/policy/doc boundary from the delivered base', () => {
    const audited = auditSprintRange({ root, base: S194_BASE, head: measured, sprintId: 'sprint-194' });
    expect(audited.publicPaths).toEqual(range.publicPaths);
    expect(audited.canonicalPaths).toEqual(range.canonicalPaths);
    expect(range.publicPaths).toEqual(expect.arrayContaining(['packages/mcp-server/src/lib/token-build.ts', 'packages/mcp-server/src/schemas/health.output.json', 'configs/agent/policy.json', 'packages/mcp-server/src/security/policy.json', 'docs/runtime/portable-runtime.md']));
    expect(() => deriveMovers(measured, { s194: { ...range, publicPaths: range.publicPaths.filter((file: string) => file !== 'configs/agent/policy.json') } }, root, options)).toThrow(/declared mover union differs/);
  });
  it('keeps the default two-capture ceiling and never inherits the Sprint193 exception', () => {
    const input = { sprintId: 'sprint-194', closeout: { runs: [{}] }, attempts: [{}] };
    expect(validateCloseoutCaptureLimit(input)).toBeUndefined();
    expect(() => validateCloseoutCaptureLimit({ ...input, attempts: [{}, {}] })).toThrow(/Decision 1833/);
    expect(() => validateCloseoutCaptureLimit({ ...input, extension: read('artifacts/product-reality/sprint-193/m07/capture-extension.json') })).toThrow();
  });
  for (const verify of [verifySprint194ToolOutcomes, auditSprint194ToolOutcomes]) {
    it(`${verify.name} refuses to promote source coverage or documented limits into successful portable execution`, () => {
      const tools = read('packages/mcp-server/registry/tool-capability-ledger.v1.json');
      const portable = read('artifacts/product-reality/sprint-194/m06/portable-e2e.json');
      expect(verify({ tools, portable })).toEqual({ advertised: 19, calls: 28, pass: 14, documentedLimits: 5 });
      const promoted = structuredClone(portable); promoted.calls.outcomes['brand.apply'].outcome = 'pass';
      expect(() => verify({ tools, portable: promoted })).toThrow();
      const missing = structuredClone(portable); missing.tools.names.pop();
      expect(() => verify({ tools, portable: missing })).toThrow();
      const unbound = structuredClone(tools); unbound.rows.find((row: any) => row.name === 'brand.apply').portableLimits = [];
      expect(() => verify({ tools: unbound, portable })).toThrow();
      const unproven = structuredClone(tools); unproven.rows.find((row: any) => row.name === 'health').proofTier = 'contract';
      expect(() => verify({ tools: unproven, portable })).toThrow();
      expect(() => verify({ tools, portable: { ...portable, extractionTree: { ...portable.extractionTree, after: 'changed' } } })).toThrow();
    });
  }
  it('prepares Sprint195 notices with every retirement and portable carry without sending', () => {
    const plan = buildNotices(deriveMovers(measured, { s194: range }, root, options), root);
    expect(plan).toMatchObject({ deliverySprint: 'sprint-195', sent: false, sendsExecuted: 0, targets: ['cmos-dashboard', 'forge-demos', 'aquex-mcp'] });
    const tools = read('packages/mcp-server/registry/tool-capability-ledger.v1.json');
    for (const notice of plan.notices) {
      expect(notice.requestSha256).toBe(requestHash(notice.request));
      for (const row of tools.retired) expect(notice.request.body).toContain(row.name);
      for (const text of ['19 advertised', '14 passing', 'N015', 'N019', 'resolveMeasures:false', '1f69c957', 'builderSelfCertified:false']) expect(notice.request.body).toContain(text);
    }
  });
  it('allows capture evidence additions but rejects post-capture executable changes', () => {
    expect(() => assertEvidenceOnlyHeadChanges([{ status: 'A', path: 'artifacts/product-reality/sprint-194/m07/ci/observed.json' }], 'sprint-194')).not.toThrow();
    expect(() => assertEvidenceOnlyHeadChanges([{ status: 'M', path: 'packages/mcp-server/src/tools/health.ts' }], 'sprint-194')).toThrow();
  });
});
