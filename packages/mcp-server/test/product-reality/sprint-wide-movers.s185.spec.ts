import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import {
  CANONICAL_ADVERTISED_SCOPE, PUBLIC_RUNTIME_SCOPE, ROOT, S184_BASE, S185_BASE, TABLE_PATHS,
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
});
