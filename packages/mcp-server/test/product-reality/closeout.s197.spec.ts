import { execFileSync } from 'node:child_process';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { verifySprint197Runtime, verifySprint197Roadmap } from '../../../../scripts/product-reality/s185-closeout.mjs';
import { auditSprint197Runtime, auditSprintRange } from '../../../../scripts/product-reality/s185-audit-closeout.mjs';
import { deriveRange, S197_BASE, S197_PUBLIC_RUNTIME_SCOPE } from '../../../../scripts/product-reality/s185-sprint-wide-movers.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
// Real retained 240-cell receipts exercise hash checks without relying on a new
// closeout's generated claims. The fresh sweep is independently audited at close.
const original = JSON.parse(execFileSync('git', ['show', `${S197_BASE}:packages/mcp-server/registry/runtime-cells.v1.json`], { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }));
const runtimePath = `${original.receiptRoot}/runtime-cells.v1.json`;
const raw = (file: string) => readFileSync(path.join(root, file));
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
