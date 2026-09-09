import { vi } from 'vitest';

// Decision #1833: git-range/census work has an explicit serial execution budget.
vi.setConfig({ testTimeout: 60_000 });

import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import {
  CANONICAL_ADVERTISED_SCOPE, PUBLIC_RUNTIME_SCOPE, S186_PUBLIC_RUNTIME_SCOPE, S187_PUBLIC_RUNTIME_SCOPE, S187_BASE, S188_PUBLIC_RUNTIME_SCOPE, S188_BASE, ROOT, S184_BASE, S185_BASE, TABLE_PATHS,
  compareDeclaredPaths, deriveMovers, deriveRange, replayTableOmission,
} from '../../../../scripts/product-reality/s185-sprint-wide-movers.mjs';

describe('Sprint-wide accounting includes runtime behavior omitted by per-mission scopes', () => {
  it('replays the actual Table omission without pretending the narrow canonical scope catches it', () => {
    const proof = replayTableOmission();
    expect(proof.status).toBe('passed');
    expect(proof.cases.map(({ path }: { path: string }) => path)).toEqual(TABLE_PATHS);
    for (const row of proof.cases) expect(row).toMatchObject({ actuallyChangedInMission: true,
      oldPerMissionCaught: false, canonicalScopeCaught: false, publicSprintWideCaught: true });
  });

  it('independently compares the exact canonical command and the public runtime supplement', () => {
    const derived = deriveRange(S184_BASE, S185_BASE);
    const git = (scope: readonly string[]) => execFileSync('git', ['diff', '--name-only', `${S184_BASE}..${S185_BASE}`, '--', ...scope],
      { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean)
      .filter((file) => !/(^|\/)(test|tests|__tests__)\/|\.(test|spec)\.[cm]?[jt]sx?$/.test(file)).sort();
    expect(derived.canonicalPaths).toEqual(git(CANONICAL_ADVERTISED_SCOPE));
    expect(derived.publicPaths).toEqual(git(PUBLIC_RUNTIME_SCOPE));
    expect(derived.supplementalRuntimePaths).toEqual(expect.arrayContaining([...TABLE_PATHS,
      'packages/mcp-server/src/codegen/state-contract.ts', 'packages/mcp-server/src/codegen/syntax-preflight.ts',
      'packages/mcp-server/src/codegen/validation-profile.ts']));
  });

  it('rejects a missing or extra declaration instead of accepting a one-way subset', () => {
    expect(compareDeclaredPaths(['a', 'b'], ['a'])).toEqual({ missingFromDeclaration: ['b'], extraInDeclaration: [] });
    expect(compareDeclaredPaths(['a'], ['a', 'b'])).toEqual({ missingFromDeclaration: [], extraInDeclaration: ['b'] });
    expect(() => compareDeclaredPaths(['a'], ['a', 'a'])).toThrow('duplicates');
  });

  it('turns a reproduced Table omission into a failing completed mover record', () => {
    const historical = deriveRange(S184_BASE, S185_BASE);
    const current = deriveRange(S185_BASE, 'HEAD');
    const declaration = { s184: historical, s185: current };
    expect(deriveMovers('HEAD', declaration).status).toBe('passed');
    const omitted = structuredClone(declaration);
    omitted.s184.publicPaths = omitted.s184.publicPaths.filter((file: string) => file !== TABLE_PATHS[0]);
    expect(() => deriveMovers('HEAD', omitted)).toThrow('declared mover union differs');
  });

  it('uses the locked Sprint 186 range once and rejects omissions without inheriting the old two-sprint ceremony', () => {
    const options = { sprintId: 'sprint-186', missionId: 's186-m06', base: '5aa53b3a' };
    const range = deriveRange(options.base, 'HEAD', ROOT, S186_PUBLIC_RUNTIME_SCOPE);
    const declaration = { s186: range };
    const result = deriveMovers('HEAD', declaration, ROOT, options);
    expect(result).toMatchObject({ status: 'passed', missionId: 's186-m06', s186: range });
    expect(result).not.toHaveProperty('s184'); expect(result).not.toHaveProperty('tableControl');
    expect(result.publicScope).toEqual(S186_PUBLIC_RUNTIME_SCOPE);
    for (const composer of ['packages/mcp-server/src/compose/object-slot-filler.ts', 'packages/mcp-server/src/tools/design.compose.ts']) {
      expect(range.publicPaths).toContain(composer);
      expect(deriveRange(options.base, 'HEAD').publicPaths).not.toContain(composer);
      const omitted = structuredClone(declaration);
      omitted.s186.publicPaths = omitted.s186.publicPaths.filter((file: string) => file !== composer);
      expect(() => deriveMovers('HEAD', omitted, ROOT, options)).toThrow(/declared mover union differs/);
    }
    const changed = structuredClone(declaration); changed.s186.publicPaths.push('invented-runtime.ts');
    expect(() => deriveMovers('HEAD', changed, ROOT, options)).toThrow(/declared mover union differs/);
    expect(() => deriveMovers('HEAD', declaration, ROOT, { ...options, base: S185_BASE })).toThrow(/locked build base/);
  });
});


describe('Sprint 187 discovery is part of the advertised public byte range', () => {
  it('includes current scope, refresh exports and composer/lowering without inheriting two-sprint ranges', () => {
    const options = { sprintId: 'sprint-187', missionId: 's187-m06', base: S187_BASE };
    const range = deriveRange(S187_BASE, 'HEAD', ROOT, S187_PUBLIC_RUNTIME_SCOPE);
    const declaration = { s187: range };
    const report = deriveMovers('HEAD', declaration, ROOT, options);
    expect(report.status).toBe('passed');
    expect(report).not.toHaveProperty('s186');
    const changed = ['packages/mcp-server/src/tools/catalog.list.ts', 'cmos/scripts/refresh_structured_data.py',
      'artifacts/structured-data/manifest.json', 'packages/component-contracts/registry/component-obligation-scope.v1.json',
      'packages/mcp-server/src/codegen/binding-utils.ts', 'packages/mcp-server/src/compose/object-slot-filler.ts'];
    expect(range.publicPaths).toEqual(expect.arrayContaining(changed));
    for (const path of changed) {
      const omitted = structuredClone(declaration); omitted.s187.publicPaths = omitted.s187.publicPaths.filter(file => file !== path);
      expect(() => deriveMovers('HEAD', omitted, ROOT, options)).toThrow(/declared mover union differs/);
    }
    expect(() => deriveMovers('HEAD', declaration, ROOT, { ...options, base: S185_BASE })).toThrow(/locked build base/);
  });
});

describe('Sprint 188 single advertised workflow range', () => {
  it('uses cd8ee986 and catches omitted workflow, schema and build-revision movers', () => {
    const options = { sprintId: 'sprint-188', missionId: 's188-m06', base: S188_BASE };
    const range = deriveRange(S188_BASE, 'HEAD', ROOT, S188_PUBLIC_RUNTIME_SCOPE);
    const declaration = { s188: range };
    expect(deriveMovers('HEAD', declaration, ROOT, options)).toMatchObject({ status: 'passed', s188: range });
    for (const file of ['packages/mcp-server/src/codegen/workflow-emitter.ts', 'packages/mcp-server/src/schemas/design.compose.input.json', 'scripts/build-revision.mjs', 'packages/mcp-bridge/src/health.ts']) {
      expect(range.publicPaths).toContain(file);
      const omitted = structuredClone(declaration); omitted.s188.publicPaths = omitted.s188.publicPaths.filter(path => path !== file);
      expect(() => deriveMovers('HEAD', omitted, ROOT, options)).toThrow(/declared mover union differs/);
    }
    expect(() => deriveMovers('HEAD', declaration, ROOT, { ...options, base: S187_BASE })).toThrow(/locked build base/);
  });
});
