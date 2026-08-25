/**
 * s167 m01 — proof that the token collision guard actually bites.
 *
 * The guard exists because this repo had none: `build.mjs --check --verbose` printed
 * "Token collisions detected (949)" and exited 0 (that count is Style Dictionary's own
 * logger), and `collectValidationIssues()` inspects `dictionary.allTokens` — the list
 * AFTER Style Dictionary has deep-merged the sources — so it can never see a source
 * collision. A guard nothing proves is not a guard, so this file asserts three things:
 *
 *   1. the real source tree is clean;
 *   2. a seeded non-exempt duplicate makes the CLI exit NON-ZERO;
 *   3. the brand overlay exemption is real AND narrow — the declared
 *      `brands/<X>/base.json -> brands/<X>/<theme>.json` chain is exempted, but a
 *      duplicate that crosses out of one brand's directory is still reported.
 *
 * (3) matters because a guard that exempted too much would be green for the wrong
 * reason: the prescribed layering produces 44 differing source-leaf duplicates per themed
 * scope by design, so "no collisions reported" is only meaningful if non-chain duplicates
 * fail. This is a source inventory, distinct from the 41-slot semantic bridge.
 */
import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- build tooling, no type declarations
import { findCollisions, resolveScopeFiles } from '../../packages/tokens/scripts/collision-guard.mjs';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const TOKENS_PKG = path.join(REPO_ROOT, 'packages', 'tokens');
const GUARD = path.join(TOKENS_PKG, 'scripts', 'collision-guard.mjs');

function runGuard(root: string) {
  const result = spawnSync('node', [GUARD, '--root', root], { encoding: 'utf8' });
  return { code: result.status, out: `${result.stdout ?? ''}${result.stderr ?? ''}` };
}

describe('s167 m01 — the token collision guard', () => {
  let sandbox: string;

  beforeAll(() => {
    sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-collision-guard-'));
    fs.cpSync(path.join(TOKENS_PKG, 'src'), path.join(sandbox, 'src'), { recursive: true });
  });

  afterAll(() => {
    fs.rmSync(sandbox, { recursive: true, force: true });
  });

  it('exits ZERO on the real, de-collided source tree', () => {
    const { code, out } = runGuard(TOKENS_PKG);
    expect(out).toContain('no non-exempt collisions');
    expect(code).toBe(0);
  });

  it('exits ZERO on an untouched copy of that tree (the sandbox is a faithful baseline)', () => {
    const { code } = runGuard(sandbox);
    expect(code).toBe(0);
  });

  it('exits NON-ZERO on a seeded duplicate whose value differs', () => {
    // `motion.duration.fast` is already declared as the literal "120ms" in
    // src/tokens/motion.json. This is the exact shape of the defect D6 removed.
    const seeded = path.join(sandbox, 'src', 'tokens', 'base', 'seeded-duplicate.json');
    fs.writeFileSync(
      seeded,
      JSON.stringify({ motion: { duration: { fast: { $type: 'duration', $value: '999ms' } } } }, null, 2),
    );

    try {
      const { code, out } = runGuard(sandbox);
      expect(code).not.toBe(0);
      expect(code).toBe(1);
      expect(out).toContain('motion.duration.fast');
      expect(out).toContain('seeded-duplicate.json');
      expect(out).toContain('"999ms"');
      expect(out).toContain('"120ms"');
    } finally {
      fs.rmSync(seeded, { force: true });
    }
  });

  it('exits NON-ZERO when a duplicate leaks a brand path OUT of that brand directory', () => {
    // Same token path as brands/A/base.json, but declared in the shared layer. This is
    // the shape the three src/presets/* files had; it must NOT be swallowed by the
    // brand-overlay exemption, because the exemption requires every declaration to sit
    // under one brand's directory.
    const seeded = path.join(sandbox, 'src', 'tokens', 'base', 'seeded-brand-leak.json');
    fs.writeFileSync(
      seeded,
      JSON.stringify(
        { color: { brand: { A: { surface: { canvas: { $type: 'color', $value: 'oklch(0.5 0.1 200)' } } } } } },
        null,
        2,
      ),
    );

    try {
      const { code, out } = runGuard(sandbox);
      expect(code).toBe(1);
      expect(out).toContain('color.brand.A.surface.canvas');
      expect(out).toContain('seeded-brand-leak.json');
    } finally {
      fs.rmSync(seeded, { force: true });
    }
  });

  it('exempts the declared brand overlay chain — which is doing real work, not nothing', () => {
    // The A/dark scope genuinely contains 44 source paths declared twice with DIFFERENT
    // values (brands/A/base.json then brands/A/dark.json). If the exemption were
    // removed, every one of them would be reported. Proving the count is non-trivial is
    // what stops "0 violations" from being a vacuous green.
    const scope = { brand: 'A', theme: 'dark' };
    const files: string[] = resolveScopeFiles(scope, TOKENS_PKG);

    const brandChainFiles = files.filter((f: string) => f.startsWith('src/tokens/brands/A/'));
    expect(brandChainFiles).toEqual(['src/tokens/brands/A/base.json', 'src/tokens/brands/A/dark.json']);

    // With the exemption in place: clean.
    expect(findCollisions(files, TOKENS_PKG)).toEqual([]);

    // Without it: the same two files collide on all 44 brand source leaves. Counted directly
    // from source so this cannot drift out of step with the guard's own logic.
    const leaves = (node: unknown, trail: string[] = []): string[] => {
      const out: string[] = [];
      if (node && typeof node === 'object' && !Array.isArray(node)) {
        const rec = node as Record<string, unknown>;
        if ('$value' in rec) out.push(trail.join('.'));
        for (const [k, v] of Object.entries(rec)) {
          if (!k.startsWith('$')) out.push(...leaves(v, [...trail, k]));
        }
      }
      return out;
    };
    const read = (rel: string) => JSON.parse(fs.readFileSync(path.join(TOKENS_PKG, rel), 'utf8'));
    const baseLeaves = new Set(leaves(read('src/tokens/brands/A/base.json')));
    const darkLeaves = leaves(read('src/tokens/brands/A/dark.json'));
    const overlapping = darkLeaves.filter((p) => baseLeaves.has(p));
    expect(overlapping).toHaveLength(44);
  });

  /**
   * s168 m06 — the exemption's NARROW clause was untested, and provably so: deleting
   * `new Set(brands).size === 1` from `isDeclaredOverlayChain` left all five tests above
   * GREEN. The exemption would then have covered ANY collision between two brand
   * directories, not just a single brand's declared base -> theme overlay chain.
   *
   * WHY IT WAS UNTESTABLE THE OBVIOUS WAY: `sourceForScope` names
   * `brands/{A,B}/base.json` LITERALLY, with no glob, so a NEW file dropped under
   * `brands/B/` is never loaded and a test seeded that way is vacuously green. The seed
   * must therefore EDIT an already-loaded file — and because a scope loads exactly one
   * brand's directory, the cross-brand list is built explicitly here. That is the only
   * shape in which the clause can ever fire.
   */
  it('the exemption is NARROW: a collision spanning two brand directories is NOT exempt', () => {
    const aBase = 'src/tokens/brands/A/base.json';
    const bBase = 'src/tokens/brands/B/base.json';
    const collidingPath = 'color.brand.A.surface.canvas';
    const target = path.join(sandbox, bBase);
    const original = fs.readFileSync(target, 'utf8');

    try {
      // EDIT an already-loaded file: brand B's base.json now also declares one of brand
      // A's paths, with a different value. Both files are real members of the list below.
      const doc = JSON.parse(original);
      doc.color.brand.A = {
        surface: { canvas: { $type: 'color', $value: 'oklch(0.5 0.1 200)' } },
      };
      fs.writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);

      const reported: Array<{ tokenPath: string }> = findCollisions([aBase, bBase], sandbox);
      expect(
        reported.map((c) => c.tokenPath),
        'a collision spanning brands/A and brands/B was exempted — the single-brand clause is gone',
      ).toContain(collidingPath);

      // CONTROL OF THE CONTROL: the same two files, unedited, collide on nothing. So the
      // report above is caused by the seed and not by the file pairing itself.
      fs.writeFileSync(target, original);
      expect(findCollisions([aBase, bBase], sandbox)).toEqual([]);
    } finally {
      // The sandbox is shared via beforeAll — always restore, even on failure.
      fs.writeFileSync(target, original);
    }
  });
});
