import { execFileSync } from 'node:child_process';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { verifySprint197Runtime, verifySprint197Roadmap, verifySprint197BuildDependencies } from '../../../../scripts/product-reality/s185-closeout.mjs';
import { auditSprint197Runtime, auditSprintRange, auditSprint197Readiness } from '../../../../scripts/product-reality/s185-audit-closeout.mjs';
import { validateSprint197Readiness } from '../../../../scripts/product-reality/s185-suite-accounting.mjs';
import { deriveRange, S197_BASE, S197_PUBLIC_RUNTIME_SCOPE } from '../../../../scripts/product-reality/s185-sprint-wide-movers.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
// Real retained 240-cell receipts exercise hash checks without relying on a new
// closeout's generated claims. The fresh sweep is independently audited at close.
const original = JSON.parse(execFileSync('git', ['show', `${S197_BASE}:packages/mcp-server/registry/runtime-cells.v1.json`], { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }));
const runtimePath = `${original.receiptRoot}/runtime-cells.v1.json`;
// These are Sprint 197 operands, bound to its recorded readiness correction.
// Current readiness and package inputs have their own live contract tests.
const historicalInputs = new Set(['package.json', 'pnpm-lock.yaml', 'cmos/planning/forge-gate2-decision-packet.md', 'scripts/product-reality/s196-release-readiness.ts', 'packages/mcp-server/test/product-reality/release-readiness.s196.spec.ts']);
const historicalBytes = new Map<string, Buffer>();
const raw = (file: string): Buffer => {
  if (!historicalInputs.has(file)) return readFileSync(path.join(root, file));
  if (!historicalBytes.has(file)) historicalBytes.set(file, execFileSync('git', ['show', `542f9ee6bfceb96e61c5b2b44c241c9375a8596f:${file}`], { cwd: root }));
  return historicalBytes.get(file)!;
};
const readers = [
  ['producer', (runtime: any, read: typeof raw) => verifySprint197Runtime({ runtime, implementationHead: original.head, runtimePath, read })],
  ['independent auditor', (runtime: any, read: typeof raw) => auditSprint197Runtime({ runtime, head: original.head, runtimePath, readFrozen: read })],
] as const;

describe.each(readers)('s197 %s rejects evidence that could inflate the palette proof', (_name, verify) => {
  it('verifies actual 240-cell receipts, package bytes and 24 chart theme screenshots', () => {
    expect(verify(structuredClone(original), raw)).toMatchObject({ cells: 240, chartThemeCells: 24 });
  });
  it.each(['missing', 'duplicate', 'wrong-head', 'mixed-run', 'missing-install', 'missing-workflow-state'])('rejects %s even when the headline stays 240/240', mutation => {
    const runtime = structuredClone(original);
    if (mutation === 'missing') runtime.rows.pop();
    if (mutation === 'duplicate') runtime.rows[1] = structuredClone(runtime.rows[0]);
    if (mutation === 'wrong-head') runtime.head = 'a'.repeat(40);
    if (mutation === 'mixed-run') runtime.rows[0].runId = 'another-run';
    if (mutation === 'missing-install') runtime.rows[0].gates = runtime.rows[0].gates.filter((gate: any) => gate.name !== 'fresh-exact-tarball-install');
    if (mutation === 'missing-workflow-state') runtime.rows.find((row: any) => row.context === 'workflow').gates.find((gate: any) => gate.name === 'context-states').detail.observations.pop();
    // Keep row and aggregate mutually consistent; the obligation itself must bite.
    const read = (file: string) => {
      const row = runtime.rows.find((row: any) => file === `${runtime.receiptRoot}/${row.report}`);
      return row ? Buffer.from(JSON.stringify(row)) : raw(file);
    };
    expect(() => verify(runtime, read)).toThrow();
  });
  it.each(['browser', 'tarball', 'screenshot', 'restore'])('rejects changed %s bytes independently of aggregate success', mutation => {
    const packages = JSON.parse(raw(`${original.receiptRoot}/submitted-packages/inventory.json`).toString());
    const target = mutation === 'browser' ? `${original.receiptRoot}/browser.json` : mutation === 'tarball' ? `${original.receiptRoot}/${packages[0].artifactPath}` : mutation === 'restore' ? `${original.receiptRoot}/emitter-bite.json` : null;
    let altered = false;
    const read = (file: string) => {
      const bytes = raw(file);
      if (file === target || (mutation === 'screenshot' && file.endsWith('.png') && !altered)) {
        altered = true;
        if (mutation === 'restore') return Buffer.from(JSON.stringify({ ...JSON.parse(bytes.toString()), restoredHash: 'sha256:' + 'f'.repeat(64) }));
        if (mutation === 'browser') return Buffer.from(JSON.stringify({ ...JSON.parse(bytes.toString()), version: 'unqualified-browser' }));
        return Buffer.concat([bytes, Buffer.from('changed')]);
      }
      return bytes;
    };
    expect(() => verify(structuredClone(original), read)).toThrow();
    expect(altered).toBe(true);
  });
});

it('protects retained history while allowing the measured current roadmap row', () => {
  const before = raw('cmos/foundational-docs/roadmap/near.md').toString();
  const current = before.replace('197 — **LOCKED 2026-09-12**', '197 — **BUILT, REVIEW PENDING**')
    .replace('### Sprint 197 — Palette and the dark theme — LOCKED 2026-09-12', '### Sprint 197 — Palette and the dark theme — BUILT, REVIEW PENDING')
    .replace('## 5. Phase B', 'Measured 16.540957 / 20.105820; 24/24; 52 cells; 180 screenshots / 90 pairs.\n\n## 5. Phase B');
  expect(() => verifySprint197Roadmap(current, before)).not.toThrow();
  expect(() => verifySprint197Roadmap(`${current}\nChanged historical record.`, before)).toThrow(/Retained roadmap/);
});

it('independently inventories token, golden, spec and documentation changes from one Git range', () => {
  const repository = mkdtempSync(path.join(tmpdir(), 'oods-s197-movers-'));
  const git = (...args: string[]) => execFileSync('git', args, { cwd: repository, encoding: 'utf8' }).trim();
  const write = (file: string, value: string) => { mkdirSync(path.dirname(path.join(repository, file)), { recursive: true }); writeFileSync(path.join(repository, file), value); };
  const commit = () => { git('add', '-A'); git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', 'fixture'); return git('rev-parse', 'HEAD'); };
  try {
    git('init', '-q'); write('README.md', 'base'); const base = commit();
    const files = ['scripts/tokens/palette-checks.ts', 'packages/viz-core/test/__snapshots__/Unicode — 色.snap', 'packages/mcp-server/test/palette.spec.ts', 'docs/api/palette.md', 'tools/a11y/guardrails/relative-color.csv'].sort();
    for (const file of files) write(file, 'changed'); const head = commit();
    const derived = deriveRange(base, head, repository, S197_PUBLIC_RUNTIME_SCOPE);
    const audited = auditSprintRange({ root: repository, base, head, sprintId: 'sprint-197' });
    expect(derived.publicPaths).toEqual(files); expect(audited.publicPaths).toEqual(files);
    expect(audited.canonicalPaths).toEqual(derived.canonicalPaths);
    write(files[0], 'uncommitted drift');
    expect(deriveRange(base, head, repository, S197_PUBLIC_RUNTIME_SCOPE)).toEqual(derived);
  } finally { rmSync(repository, { recursive: true, force: true }); }
});

it('the diagnostic dependency exception cannot conceal runtime or lock drift after measurement', () => {
  const beforePackage = JSON.parse(execFileSync('git', ['show', `${S197_BASE}:package.json`], { cwd: root, encoding: 'utf8' }));
  const beforeLock = execFileSync('git', ['show', `${S197_BASE}:pnpm-lock.yaml`], { cwd: root, encoding: 'utf8' });
  const afterPackage = JSON.parse(raw('package.json').toString()), afterLock = raw('pnpm-lock.yaml').toString();
  expect(() => verifySprint197BuildDependencies({ beforePackage, afterPackage, beforeLock, afterLock })).not.toThrow();
  const changed = structuredClone(afterPackage); changed.dependencies['react'] = 'unmeasured-runtime';
  expect(() => verifySprint197BuildDependencies({ beforePackage, afterPackage: changed, beforeLock, afterLock })).toThrow();
  expect(() => verifySprint197BuildDependencies({ beforePackage, afterPackage, beforeLock, afterLock: afterLock + '# unrelated lock change\n' })).toThrow();
});

// The exception must reject a widened blast radius even if all headline counts
// and the caller's approval flag look green. Raw capture bytes stay historical.
function readinessFixture() {
  const executionHead = '02d811f71a4f188142783edf0f9ea189590876c1', fixedHead = 'f'.repeat(40), reviewHead = 'e'.repeat(40);
  const prefix = 'artifacts/product-reality/sprint-197/m07/closeout/exception-2008';
  const digest = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');
  const overrides = new Map<string, Buffer>();
  const readBytes = (file: string) => overrides.get(file) ?? raw(file);
  const put = (file: string, value: unknown) => { const bytes = Buffer.from(JSON.stringify(value)); overrides.set(file, bytes); return { path: file, sha256: digest(bytes) }; };
  const history = new Map<string, Buffer>();
  const readHistorical = (head: string, file: string) => {
    if ([fixedHead, reviewHead].includes(head)) return readBytes(file);
    const key = `${head}:${file}`;
    if (!history.has(key)) history.set(key, execFileSync('git', ['show', key], { cwd: root, maxBuffer: 32 * 1024 * 1024 }));
    return history.get(key)!;
  };
  const facts = { path: 'artifacts/product-reality/sprint-196/m06/release-readiness-facts.json',
    beforeSha256: '8fbfcb74551f8370ed52d4b10ddc55526cceba48a8ab0074f3e67192c6819f67',
    afterSha256: 'ba27bb2e7d5c9a6b9278b916d69ac593608bfe971a769a927d3af39cf2218c1d' };
  const support = ['scripts/product-reality/s185-suite-accounting.mjs', 'scripts/product-reality/s185-closeout.mjs',
    'scripts/product-reality/s185-audit-closeout.mjs', 'packages/mcp-server/test/product-reality/closeout.s197.spec.ts'];
  const test = 's196 release readiness derives facts without making Gate 2 decisions checks generated JSON and the marked facts block while preserving authored prose#0';
  const log = put(`${prefix}/unit.log`, 'fixture log');
  const scoped = ['mcp-server', 'root-core'].map(project => ({ project, head: fixedHead, exitCode: 0, command: 'vitest fixture', log,
    report: put(`${prefix}/unit-${project}.json`, { success: true, numFailedTests: 0, numPendingTests: 0, numTodoTests: 0, numTotalTests: 24,
      testResults: ['release-readiness.s196', 'closeout.s196', 'closeout.s197'].map((name, index) => ({ name: `/fixture/${name}.spec.ts`,
        assertionResults: Array.from({ length: index === 0 ? 22 : 1 }, () => ({ status: 'passed' })) })) }) }));
  const decisionPath = `${prefix}/decision.json`;
  const approval: any = { decisionId: 2008, missionId: 's197-m07', executionHead, fixedHead, builderSelfCertified: false, facts,
    decision: { path: decisionPath, sha256: digest(raw(decisionPath)) }, scoped, docs: { head: fixedHead, command: 'pnpm docs:check', exitCode: 0, log },
    supportingFiles: support.map(file => ({ path: file, beforeSha256: digest(readHistorical(executionHead, file)), afterSha256: digest(raw(file)) })) };
  const changes = [...support, facts.path].map(file => ({ path: file, status: 'M' }));
  const failures = ['mcp-server', 'root-core'].map(suite => ({ suite, file: 'packages/mcp-server/test/product-reality/release-readiness.s196.spec.ts', testKey: test }));
  return { approval, changes, executionHead, reviewHead, failures, readBytes, readHistorical, put, overrides };
}

describe.each([['accounting', validateSprint197Readiness], ['independent auditor', auditSprint197Readiness]] as const)('s197 %s binds decision 2008', (_name, verify) => {
  it('accepts only the approved four-field correction with the two original failed capture trees', () => {
    expect(verify(readinessFixture())).toMatchObject({ decisionId: 2008, preservedCaptureFiles: 40 });
  });
  it.each(['decision', 'facts', 'packet', 'generator', 'readiness-source', 'support', 'extra-path', 'missing-failure', 'other-failure',
    'missing-project', 'scoped-head', 'skip', 'missing-closeout', 'capture', 'docs-head'])('rejects %s drift without silently accepting unrelated work', mutation => {
    const f = readinessFixture();
    if (mutation === 'decision') f.approval.decisionId = 2009;
    if (mutation === 'facts') f.overrides.set(f.approval.facts.path, Buffer.from('changed facts'));
    if (mutation === 'packet') f.overrides.set('cmos/planning/forge-gate2-decision-packet.md', Buffer.from('changed prose'));
    if (mutation === 'generator') f.overrides.set('scripts/product-reality/s196-release-readiness.ts', Buffer.from('weakened generator'));
    if (mutation === 'readiness-source') f.overrides.set('packages/mcp-server/test/product-reality/release-readiness.s196.spec.ts', Buffer.from('weakened assertions'));
    if (mutation === 'support') f.approval.supportingFiles[0].afterSha256 = '0'.repeat(64);
    if (mutation === 'extra-path') f.changes.push({ path: 'packages/mcp-server/src/tools/design.compose.ts', status: 'M' });
    if (mutation === 'missing-failure') f.failures.pop();
    if (mutation === 'other-failure') f.failures[0].testKey = 'another failure#0';
    if (mutation === 'missing-project') f.approval.scoped.pop();
    if (mutation === 'scoped-head') f.approval.scoped[0].head = f.executionHead;
    if (mutation === 'skip' || mutation === 'missing-closeout') {
      const run = f.approval.scoped[0], report = JSON.parse(f.readBytes(run.report.path).toString());
      if (mutation === 'skip') { report.testResults[0].assertionResults[0].status = 'skipped'; report.numPendingTests = 1; }
      else report.testResults.pop();
      run.report = f.put(run.report.path, report);
    }
    if (mutation === 'capture') f.overrides.set('artifacts/product-reality/sprint-197/m07/five-suite-closeout/run-1/mcp-server.vitest.json', Buffer.from('rewritten green capture'));
    if (mutation === 'docs-head') f.approval.docs.head = f.executionHead;
    expect(() => verify(f)).toThrow();
  });
});
