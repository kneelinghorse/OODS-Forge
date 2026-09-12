import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { deriveRange, S195_PUBLIC_RUNTIME_SCOPE } from '../../../../scripts/product-reality/s185-sprint-wide-movers.mjs';
import { auditCiChangedPaths, auditEvidenceChanges, auditPublicRuntimeBytes, auditSprintRange } from '../../../../scripts/product-reality/s185-audit-closeout.mjs';

// Real Git history is essential: mocked output cannot prove that the commands
// request raw paths instead of Git's config-dependent, C-quoted text format.
describe('Closeout path inventories retain exact repository identities', () => {
  let root: string;
  const canonicalPaths = [
    'docs/api/Unicode — 日本語.md',
    'docs/api/tab\tstop.md',
    'docs/api/line\nbreak.md',
    'docs/api/quote"slash\\both.md',
    'docs/api/ leading.md',
    'docs/api/trailing.md ',
    'docs/api/trailing-newline.md\n',
  ].sort();
  const recipePath = 'docs/mcp/Agent Recipes — Quick Index.md';
  const componentPaths = [
    'packages/components-react/evidence/Unicode — 日本語.json',
    'packages/components-react/evidence/tab\tline\nquote"slash\\.json',
  ].sort();
  const testPath = 'packages/mcp-server/src/codegen/tests/Unicode — 日本語.ts';
  const publicPaths = [...canonicalPaths, recipePath, ...componentPaths].sort();
  const git = (...args: string[]) => execFileSync('git', args, { cwd: root, encoding: 'utf8' });
  const write = (file: string, contents: string) => {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), contents);
  };
  const commit = (message: string) => {
    git('add', '-A');
    git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', message);
    return git('rev-parse', 'HEAD').trim();
  };
  beforeEach(() => {
    root = mkdtempSync(path.join(tmpdir(), 'oods-closeout-paths-'));
    git('init', '-q');
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  it.each(['true', 'false'])('agrees across mover, audit, CI and component evidence with core.quotepath=%s', quotePath => {
    git('config', 'core.quotepath', quotePath);
    write('README.md', 'base\n');
    const base = commit('base');
    for (const file of [...publicPaths, testPath]) write(file, 'changed\n');
    const head = commit('public paths and an excluded test');
    const derived = deriveRange(base, head, root, S195_PUBLIC_RUNTIME_SCOPE);
    const audited = auditSprintRange({ root, base, head, sprintId: 'sprint-195' });
    expect(derived.canonicalPaths).toEqual(canonicalPaths);
    expect(derived.publicPaths).toEqual(publicPaths);
    expect(audited.canonicalPaths).toEqual(canonicalPaths);
    expect(audited.publicPaths).toEqual(publicPaths);
    expect(audited.componentInputs).toEqual(componentPaths);
    expect(auditCiChangedPaths({ root, head: base, implementation: head, scope: S195_PUBLIC_RUNTIME_SCOPE })).toEqual(publicPaths);
    const publicBytes = auditPublicRuntimeBytes({ root, implementationHead: base, executionHead: head, sprintId: 'sprint-195' });
    expect(publicBytes.changedPaths).toEqual(publicPaths);
    expect(publicBytes.excludedTestPaths).toEqual([testPath]);
    for (const command of [derived.canonicalCommand, derived.publicCommand]) {
      expect(command).toContain('-z');
      expect(git(...command.slice(1)).split('\0').filter(Boolean).filter(file => file !== testPath).sort())
        .toEqual(command === derived.canonicalCommand ? canonicalPaths : publicPaths);
    }
    // The frozen historical text patch keeps literal Unicode; changing the
    // caller's config cannot alter the bytes used for exact hunk verification.
    expect(audited.patch).toContain(`diff --git a/${recipePath} b/${recipePath}\n`);
    git('config', 'core.quotepath', quotePath === 'true' ? 'false' : 'true');
    expect(auditSprintRange({ root, base, head, sprintId: 'sprint-195' }).patch).toBe(audited.patch);
  });

  it.each(['true', 'false'])('keeps status/path pairs intact for additions, edits, deletions and renames with core.quotepath=%s', quotePath => {
    git('config', 'core.quotepath', quotePath);
    const added = 'artifacts/add — 日本語\t".json';
    const modified = 'artifacts/modify\nline\\.json';
    const deleted = 'artifacts/delete\tline\n.json';
    const renamedFrom = 'artifacts/old — 日本語.json';
    const renamedTo = 'artifacts/new\tline\nname.json';
    for (const file of [modified, deleted, renamedFrom]) write(file, 'before\n');
    const executionHead = commit('evidence before');
    write(added, 'added\n'); write(modified, 'after\n');
    rmSync(path.join(root, deleted));
    renameSync(path.join(root, renamedFrom), path.join(root, renamedTo));
    const reviewHead = commit('evidence after');
    expect(auditEvidenceChanges({ root, executionHead, reviewHead })).toEqual([
      { status: 'A', path: added }, { status: 'M', path: modified },
      { status: 'D', path: deleted }, { status: 'D', path: renamedFrom }, { status: 'A', path: renamedTo },
    ].sort((left, right) => left.path < right.path ? -1 : left.path > right.path ? 1 : 0));
    expect(auditEvidenceChanges({ root, executionHead: reviewHead, reviewHead })).toEqual([]);
  });
});
