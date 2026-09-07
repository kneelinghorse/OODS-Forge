import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { derivePublicHeadEquivalence } from '../../../../scripts/product-reality/s185-closeout.mjs';
import { auditPublicRuntimeBytes, auditSprintRange } from '../../../../scripts/product-reality/s185-audit-closeout.mjs';

describe('Notice implementation heads retain actual public bytes across test-only corrections', () => {
  let root: string;
  const runtimePath = 'packages/mcp-server/src/codegen/emitter.ts';
  const testPaths = [
    'packages/mcp-server/src/codegen/ported-target-readiness.s184.test.ts',
    'packages/mcp-server/src/codegen/example.spec.tsx',
    'packages/mcp-server/src/codegen/__tests__/fixture.ts',
    'packages/mcp-server/src/codegen/test/fixture.ts',
    'packages/mcp-server/src/codegen/tests/fixture.ts',
  ];
  const git = (...args: string[]) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  const write = (file: string, source: string) => {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), source);
  };
  const commit = (message: string) => {
    git('add', '-A');
    git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', message);
    return git('rev-parse', 'HEAD');
  };

  beforeEach(() => {
    root = mkdtempSync(path.join(tmpdir(), 'oods-public-head-'));
    git('init', '-q');
    write(runtimePath, 'export const label = "original";\n');
    for (const file of testPaths) write(file, 'export const expected = 14;\n');
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  it.each(['packages/mcp-server/src/tools/catalog.list.ts', 'cmos/scripts/refresh_structured_data.py',
    'artifacts/structured-data/manifest.json', 'packages/component-contracts/registry/component-obligation-scope.v1.json'])
  ('Sprint 187 independently detects changed discovery bytes: %s', (file) => {
    write(file, 'original discovery'); const implementationHead = commit('discovery');
    write(file, 'changed discovery'); const executionHead = commit('discovery changed');
    const producer = derivePublicHeadEquivalence({ root, implementationHead, executionHead, sprintId: 'sprint-187' });
    const audited = auditPublicRuntimeBytes({ root, implementationHead, executionHead, sprintId: 'sprint-187' });
    expect(producer.changedPaths).toEqual([file]); expect(audited).toEqual(producer);
    expect(auditSprintRange({ root, base: implementationHead, head: executionHead, sprintId: 'sprint-187' }).publicPaths).toEqual([file]);
  });

  it('excludes only declared test paths and discloses each excluded change', () => {
    const implementationHead = commit('implementation');
    for (const file of testPaths) write(file, 'export const expected = 19;\n');
    write('package.json', '{"scripts":{"test:coverage":"test command"}}\n');
    const executionHead = commit('test corrections');
    const proof = derivePublicHeadEquivalence({ root, implementationHead, executionHead });

    expect(proof).toMatchObject({ implementationHead, executionHead, ancestor: true, excludeTests: true,
      changedPaths: [], scopedChangedPaths: [...testPaths].sort(), excludedTestPaths: [...testPaths].sort() });
    expect(proof.scopedChangedPaths).not.toContain('package.json');
  });

  it('retains changed runtime bytes even when the file roster is unchanged and tests also move', () => {
    const implementationHead = commit('implementation');
    write(runtimePath, 'export const label = "changed";\n');
    write(testPaths[0]!, 'export const expected = 19;\n');
    const executionHead = commit('runtime and test change');
    const proof = derivePublicHeadEquivalence({ root, implementationHead, executionHead });

    expect(proof.changedPaths).toEqual([runtimePath]);
    expect(proof.excludedTestPaths).toEqual([testPaths[0]]);
  });

  it('does not mistake a runtime filename containing test text for a test', () => {
    const file = 'packages/mcp-server/src/codegen/contest.ts';
    write(file, 'export const result = 1;\n');
    const implementationHead = commit('implementation');
    write(file, 'export const result = 2;\n');
    const executionHead = commit('runtime change');

    expect(derivePublicHeadEquivalence({ root, implementationHead, executionHead }).changedPaths).toEqual([file]);
  });

  it('cannot hide a runtime removal by renaming its exact bytes to a test path', () => {
    const implementationHead = commit('implementation');
    const renamed = 'packages/mcp-server/src/codegen/emitter.test.ts';
    renameSync(path.join(root, runtimePath), path.join(root, renamed));
    const executionHead = commit('rename runtime into test');
    const proof = derivePublicHeadEquivalence({ root, implementationHead, executionHead });

    expect(proof.changedPaths).toEqual([runtimePath]);
    expect(proof.excludedTestPaths).toEqual([renamed]);
  });

  it('rejects reversed commit ancestry instead of claiming public equivalence', () => {
    const earlier = commit('implementation');
    write(testPaths[0]!, 'export const expected = 19;\n');
    const later = commit('test correction');

    expect(() => derivePublicHeadEquivalence({ root, implementationHead: later, executionHead: earlier })).toThrow();
  });

  it.each(['packages/mcp-server/src/compose/object-slot-filler.ts', 'packages/mcp-server/src/tools/design.compose.ts'])(
    'Sprint 186 independently catches a changed composer operand: %s', file => {
      write(file, 'export const control = "untyped";\n');
      const implementationHead = commit('composer implementation');
      write(file, 'export const control = "field-kind-aware";\n');
      const executionHead = commit('composer correction');
      const options = { root, implementationHead, executionHead, sprintId: 'sprint-186' };
      const produced = derivePublicHeadEquivalence(options);
      const audited = auditPublicRuntimeBytes(options);
      expect(produced.changedPaths).toEqual([file]);
      expect(audited).toEqual(produced);
      expect(auditSprintRange({ root, base: implementationHead, head: executionHead }).publicPaths).toEqual([file]);
      // Historical s185 evidence retains its original reviewed scope.
      expect(derivePublicHeadEquivalence({ root, implementationHead, executionHead }).changedPaths).toEqual([]);
      expect(auditPublicRuntimeBytes({ root, implementationHead, executionHead }).changedPaths).toEqual([]);
    },
  );
});
