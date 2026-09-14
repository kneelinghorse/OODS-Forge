import { describe, expect, it, vi } from 'vitest';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifySprint198PreFreeze, verifySprint198CI, verifySprint198Roadmap } from '../../../../scripts/product-reality/s185-closeout.mjs';
import { auditSprint198PreFreeze, auditSprint198CI, auditSprintRange } from '../../../../scripts/product-reality/s185-audit-closeout.mjs';
import { allowedReviewEvidence, assertEvidenceOnlyHeadChanges, validateCloseoutCaptureLimit } from '../../../../scripts/product-reality/s185-suite-accounting.mjs';
import { deriveRange, S198_PUBLIC_RUNTIME_SCOPE } from '../../../../scripts/product-reality/s185-sprint-wide-movers.mjs';
import { commands } from '../../../../scripts/product-reality/s198-prefreeze.mjs';
vi.setConfig({ testTimeout: 60_000 });
const root = fileURLToPath(new URL('../../../../', import.meta.url));
const sha = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');
const preFreeze = () => ({ status: 'passed', skipped: 0, reports: commands.map(([name, command]) => ({ name, command, exitCode: 0, log: { path: `${name}.log`, sha256: 'a'.repeat(64) } })) });

describe.each([['producer', verifySprint198PreFreeze], ['independent audit', auditSprint198PreFreeze]] as const)('s198 %s requires pre-freeze readiness and evidence', (_name, check) => {
  it('accepts the six actual command definitions', () => expect(() => check(preFreeze())).not.toThrow());
  it.each(['missing-readiness', 'no-check', 'red', 'skip', 'unbound-log'])('rejects %s despite a green headline', mutation => {
    const input = preFreeze();
    if (mutation === 'missing-readiness') input.reports.shift();
    if (mutation === 'no-check') input.reports[0].command = input.reports[0].command.filter(value => value !== '--check');
    if (mutation === 'red') input.reports[0].exitCode = 1;
    if (mutation === 'skip') input.skipped = 1;
    if (mutation === 'unbound-log') input.reports[0].log.sha256 = '';
    expect(() => check(input)).toThrow();
  });
});

describe.each([['producer', verifySprint198CI], ['independent audit', auditSprint198CI]] as const)('s198 %s binds the actual green PR head', (_name, check) => {
  const fixture = () => {
    const raw = JSON.parse(readFileSync(path.join(root, 'artifacts/product-reality/sprint-198/m01/ci/accepted-run-34782207325.json'), 'utf8'));
    const bytes = Buffer.from(JSON.stringify(raw));
    const ci = { pr: { baseRefName: 'OODS-pro', headRefOid: raw.headSha, labels: [{ name: 'token-change:breaking' }] }, runs: [{ headSha: raw.headSha, conclusion: 'success', receipt: { path: 'ci.json', sha256: sha(bytes) } }] };
    return { raw, bytes, ci };
  };
  it('accepts the retained real green run with only the optional soak skipped', () => { const f = fixture(); expect(() => check(f.ci, () => f.bytes)).not.toThrow(); });
  it.each(['head', 'hash', 'label', 'failed-job', 'pending-job', 'skipped-gate', 'missing-job'])('rejects %s without trusting the run summary', mutation => {
    const f = fixture();
    if (mutation === 'head') f.ci.pr.headRefOid = 'b'.repeat(40);
    if (mutation === 'label') f.ci.pr.labels = [];
    if (mutation === 'failed-job') f.raw.jobs[0].conclusion = 'failure';
    if (mutation === 'pending-job') f.raw.jobs[0].status = 'in_progress';
    if (mutation === 'skipped-gate') f.raw.jobs.find((job: any) => job.name === 'tokens-governance (A)').conclusion = 'skipped';
    if (mutation === 'missing-job') f.raw.jobs = f.raw.jobs.filter((job: any) => job.name !== 'tokens-governance (A)');
    f.bytes = Buffer.from(JSON.stringify(f.raw));
    f.ci.runs[0].receipt.sha256 = mutation === 'hash' ? '0'.repeat(64) : sha(f.bytes);
    expect(() => check(f.ci, () => f.bytes)).toThrow();
  });
});

it('allows only new closeout evidence after capture and refuses a third full capture', () => {
  const file = 'artifacts/product-reality/sprint-198/m07/closeout/handoff.md';
  expect(allowedReviewEvidence(file, 'sprint-198')).toBe(true);
  expect(() => assertEvidenceOnlyHeadChanges([{ status: 'A', path: file }], 'sprint-198')).not.toThrow();
  for (const row of [{ status: 'M', path: file }, { status: 'A', path: 'artifacts/product-reality/sprint-198/m07/runtime/fixture.ts' }, { status: 'M', path: 'packages/mcp-server/src/codegen/react-emitter.ts' }]) expect(() => assertEvidenceOnlyHeadChanges([row], 'sprint-198')).toThrow();
  expect(() => validateCloseoutCaptureLimit({ sprintId: 'sprint-198', closeout: { runs: [{}] }, attempts: [{}, {}] })).toThrow(/Decision 1833/);
});

it('keeps retained roadmap history while requiring the Sprint198 built and review-pending census', () => {
  const before = '198 — **LOCKED**\n### Sprint 198 — Application craft — LOCKED\n\n---\n\n# Retained record — historic\n';
  const after = before.replaceAll('LOCKED', 'BUILT, REVIEW PENDING').replace('\n\n---', '\n240/240; 1,308; 77/77 retained; 18 objects.\n\n---');
  expect(() => verifySprint198Roadmap(after, before)).not.toThrow();
  expect(() => verifySprint198Roadmap(after + 'edited history', before)).toThrow();
  expect(() => verifySprint198Roadmap(after.replace('18 objects', '11 objects'), before)).toThrow();
});

it('producer and auditor both include component tests, shared helpers and deleted seeds from one advertised Git range', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'oods-s198-movers-'));
  const git = (...args: string[]) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim();
  const write = (file: string, text: string) => { mkdirSync(path.dirname(path.join(dir, file)), { recursive: true }); writeFileSync(path.join(dir, file), text); };
  const commit = () => { git('add', '-A'); git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', 'fixture'); return git('rev-parse', 'HEAD'); };
  try {
    git('init', '-q'); write('traits/old-seed.json', '{}'); const base = commit(); rmSync(path.join(dir, 'traits/old-seed.json'));
    const files = ['packages/components-vue/test/selection.spec.ts', 'scripts/product-reality/seed-helper.ts', 'docs/fields.md'];
    files.forEach(file => write(file, 'change')); const head = commit();
    const expected = [...files, 'traits/old-seed.json'].sort();
    expect(deriveRange(base, head, dir, S198_PUBLIC_RUNTIME_SCOPE).publicPaths).toEqual(expected);
    expect(auditSprintRange({ root: dir, base, head, sprintId: 'sprint-198' }).publicPaths).toEqual(expected);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
