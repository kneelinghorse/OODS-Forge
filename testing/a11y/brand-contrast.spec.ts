/**
 * s168 m04 — the brand × theme cells are GRADED.
 *
 * Before this, `DEFAULT_CONTRAST_RULES` contained zero rules naming a brand token, so the
 * six cells s167 made real on five platforms were ungraded: a brand palette could ship any
 * contrast at all and every gate stayed green. `BRAND_CONTRAST_RULES` is a SEPARATE export
 * for the reason documented in `packages/a11y-tools/src/brand-rules.ts` — extending the
 * shared constant would permanently red two consumers that read a brand-free token source.
 *
 * ── THE TOKEN-MAP PLUMBING, AND WHY IT IS NOT `flatTokens` ──
 * MEASURED: `flatTokens` from `@oods/tokens` carries 122 brand keys and **zero of them are
 * dark or hc** — 82 `color-brand-*` plus 40 legacy `brand-*`, all of them the BASE cell.
 * Grading through `flatTokens` could therefore only ever cover base, silently leaving half
 * the graded surface unmeasured while looking complete. So each cell's map is built from
 * that cell's own token source, which is the only artifact that holds all six.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import {
  BRAND_CONTRAST_PAIRS,
  BRAND_GRADED_THEMES,
  BRAND_HC_EXEMPTION_REASON,
  brandFlatKey,
  buildBrandContrastRules,
  evaluateContrastRules,
  resolveFlatToken,
  type FlatTokenMap,
} from '@oods/a11y-tools';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(moduleDir, '../..');
const BRANDS = ['A', 'B'] as const;

/** Flatten one brand × theme token file into the shape the evaluator resolves against. */
function cellTokenMap(brand: string, source: string): FlatTokenMap {
  const doc = JSON.parse(source);
  const map: FlatTokenMap = {};
  const walk = (node: unknown, trail: string[]): void => {
    if (!node || typeof node !== 'object') return;
    const obj = node as Record<string, any>;
    if ('$value' in obj) {
      const tokenPath = trail.join('.').replace(/^color\.brand\.[AB]\./, '');
      map[brandFlatKey(brand, tokenPath)] = { value: obj.$value };
      return;
    }
    for (const [key, child] of Object.entries(obj)) walk(child, trail.concat(key));
  };
  walk(doc, []);
  return map;
}

function cellPath(brand: string, theme: string): string {
  return `packages/tokens/src/tokens/brands/${brand}/${theme}.json`;
}

function currentCell(brand: string, theme: string): FlatTokenMap {
  return cellTokenMap(brand, readFileSync(path.resolve(repoRoot, cellPath(brand, theme)), 'utf8'));
}

/** The same cell as of a given git revision — used for the RED-first proof. */
function cellAtRevision(brand: string, theme: string, revision: string): FlatTokenMap | null {
  try {
    return cellTokenMap(
      brand,
      execFileSync('git', ['show', `${revision}:${cellPath(brand, theme)}`], {
        cwd: repoRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }),
    );
  } catch {
    return null;
  }
}

describe('brand contrast grading (s168 m04)', () => {
  it('grades every brand × graded-theme cell, and hc is exempt with a stated reason', () => {
    expect([...BRAND_GRADED_THEMES]).toEqual(['base', 'dark']);
    expect(BRAND_HC_EXEMPTION_REASON).toContain('system colours');
    // The exemption must be TRUE, not merely declared: an hc cell has no resolvable pair.
    for (const brand of BRANDS) {
      const hc = currentCell(brand, 'hc');
      const evaluations = evaluateContrastRules(hc, { rules: buildBrandContrastRules(brand, 'base') });
      expect(
        evaluations.every((evaluation) => !Number.isFinite(evaluation.ratio)),
        `${brand}/hc produced a finite ratio — the exemption's premise no longer holds`,
      ).toBe(true);
    }
  });

  /**
   * CONTROL OF THE CONTROL. `evaluate.ts` returns `passed: false` on ANY exception,
   * including "token not found". A rule set with wrong key strings is therefore red while
   * looking exactly like a contrast failure — the precise trap the natural dotted form
   * (`brand.A.text.onInteractive` → `brand-a-text-oninteractive`, a key that does not
   * exist) would have walked into. Every token must RESOLVE before any ratio is asserted.
   */
  it('every rule’s tokens resolve, so a failure can only mean a real ratio', () => {
    for (const brand of BRANDS) {
      for (const theme of BRAND_GRADED_THEMES) {
        const tokens = currentCell(brand, theme);
        for (const rule of buildBrandContrastRules(brand, theme)) {
          expect(() => resolveFlatToken(tokens, rule.foreground), `${rule.ruleId} foreground`).not.toThrow();
          expect(() => resolveFlatToken(tokens, rule.background), `${rule.ruleId} background`).not.toThrow();
        }
      }
    }
  });

  it('every graded cell passes its thresholds', () => {
    const failures: string[] = [];
    let graded = 0;
    for (const brand of BRANDS) {
      for (const theme of BRAND_GRADED_THEMES) {
        const tokens = currentCell(brand, theme);
        for (const evaluation of evaluateContrastRules(tokens, { rules: buildBrandContrastRules(brand, theme) })) {
          graded += 1;
          if (!evaluation.passed) {
            failures.push(`${evaluation.rule.ruleId}: ${evaluation.ratio} < ${evaluation.threshold} (${evaluation.message ?? ''})`);
          }
        }
      }
    }
    expect(graded).toBe(BRAND_CONTRAST_PAIRS.length * BRANDS.length * BRAND_GRADED_THEMES.length);
    expect(failures, `brand contrast failures:\n  ${failures.join('\n  ')}`).toEqual([]);
  });

  /**
   * RED-FIRST, run every time rather than recorded once. The same rule set evaluated
   * against the PRE-m03 token values must name the failures m03 fixed — and the remaining
   * rules in that same run must PASS, which is what proves the rule set was wired and
   * resolving rather than merely absent or throwing.
   *
   * Skips (loudly, via a passing assertion on the skip condition) if the base revision is
   * unavailable — e.g. a shallow checkout — rather than silently proving nothing.
   */
  it('RED-first: the same rules name the pre-m03 failures, while the rest pass in that run', () => {
    const BASE_REVISION = 'e5f2172';
    const before = BRANDS.flatMap((brand) =>
      BRAND_GRADED_THEMES.map((theme) => ({ brand, theme, tokens: cellAtRevision(brand, theme, BASE_REVISION) })),
    );
    if (before.some((cell) => cell.tokens === null)) {
      expect(before.every((cell) => cell.tokens === null), 'partial history: some cells resolved and others did not').toBe(true);
      return;
    }

    const failed: string[] = [];
    let passed = 0;
    for (const { brand, theme, tokens } of before) {
      for (const evaluation of evaluateContrastRules(tokens as FlatTokenMap, { rules: buildBrandContrastRules(brand, theme) })) {
        if (evaluation.passed) passed += 1;
        else failed.push(evaluation.rule.ruleId);
      }
    }

    // Named, not counted: a count-only assertion cannot tell a contrast failure from a
    // resolution error, and both surface as `passed: false`.
    //
    // FIVE, not the four the sprint memo named. The fifth — `brand-b-dark-on-interactive-
    // pressed` — was missed because the memo's sweep covered the BASE cells only (34
    // pairs = 17 per brand). Grading dark as well is what surfaced it.
    expect(failed.sort()).toEqual(
      [
        'brand-a-base-on-interactive-default',
        'brand-b-base-on-interactive-default',
        'brand-b-base-status-warning-icon',
        'brand-b-base-text-accent-on-canvas',
        'brand-b-dark-on-interactive-pressed',
      ].sort(),
    );
    // ...and the other N−5 passed in the SAME run, proving they resolved.
    expect(passed).toBe(BRAND_CONTRAST_PAIRS.length * 4 - failed.length);
    expect(passed).toBeGreaterThan(0);
  });

  /**
   * THE RATIFIED SOURCE PALETTE CONTAINS AN AA DEFECT — pinned, because the sprint memo
   * recorded the opposite and a critic lens that said otherwise was marked "refuted".
   *
   * `brand.css`'s hand-authored brand-A dark palette (the copy that has been shipping, and
   * the one this sprint transcribed into the token source) pairs a NEAR-WHITE foreground
   * with an interaction ramp that BRIGHTENS — L 0.52 → 0.57 → 0.62 — so contrast FALLS as
   * the user interacts. The teal palette it replaced paired near-BLACK text with the same
   * brightening direction, so contrast rose there and the defect had no precedent.
   *
   * Two pairs in the ratified copy miss AA. m03 fixed them by capping the ramp. This test
   * pins WHY those two token values differ from the ratified source, so a future
   * "transcribe brand.css faithfully" pass cannot silently restore the defect.
   */
  it('the ratified brand.css dark ramp fails AA on hover and pressed (why m03 deviates from it)', () => {
    const RATIFIED_NEAR_WHITE = 'oklch(0.97 0.01 95)';
    const RATIFIED_RAMP = {
      'surface.interactive.primary.default': 'oklch(0.52 0.2 45)',
      'surface.interactive.primary.hover': 'oklch(0.57 0.21 45)',
      'surface.interactive.primary.pressed': 'oklch(0.62 0.22 45)',
    } as const;

    const tokens: FlatTokenMap = { [brandFlatKey('A', 'text.onInteractive')]: { value: RATIFIED_NEAR_WHITE } };
    for (const [tokenPath, value] of Object.entries(RATIFIED_RAMP)) {
      tokens[brandFlatKey('A', tokenPath)] = { value };
    }

    const rules = buildBrandContrastRules('A', 'dark').filter((rule) => rule.ruleId.includes('on-interactive'));
    const byId = new Map(evaluateContrastRules(tokens, { rules }).map((e) => [e.rule.ruleId, e]));

    expect(byId.get('brand-a-dark-on-interactive-default')!.passed, 'default state').toBe(true);
    expect(byId.get('brand-a-dark-on-interactive-hover')!.passed, 'ratified hover should FAIL AA').toBe(false);
    expect(byId.get('brand-a-dark-on-interactive-pressed')!.passed, 'ratified pressed should FAIL AA').toBe(false);
    // Contrast falls monotonically as the ramp brightens — the structural cause.
    expect(byId.get('brand-a-dark-on-interactive-hover')!.ratio).toBeLessThan(
      byId.get('brand-a-dark-on-interactive-default')!.ratio,
    );
    expect(byId.get('brand-a-dark-on-interactive-pressed')!.ratio).toBeLessThan(
      byId.get('brand-a-dark-on-interactive-hover')!.ratio,
    );
  });

  /**
   * COVERAGE. Hand-listed rules are how s167 ended up with slots in the artifact that no
   * rule named. Every bridged slot that carries a foreground or background role must be
   * reachable from the pair templates, so a newly bridged slot arrives graded or reds here.
   */
  it('every gradeable bridged slot is named by at least one rule', () => {
    const bridge = readFileSync(path.resolve(repoRoot, 'packages/tokens/scripts/brand-bridge.mjs'), 'utf8');
    const bridged = [...bridge.matchAll(/tokenPath:\s*'([^']+)'/g)].map((m) => m[1]);
    expect(bridged.length, 'the bridge slot map stopped parsing').toBeGreaterThan(30);

    const named = new Set(BRAND_CONTRAST_PAIRS.flatMap((pair) => [pair.foreground, pair.background]));
    // Slots with no contrast role of their own: a scrim, decorative borders, and the
    // WCAG-1.4.3-exempt disabled pair (whose ratio is pinned by brand-description-truth).
    const NO_CONTRAST_ROLE = new Set([
      'surface.backdrop', 'surface.disabled', 'text.disabled',
      'border.subtle', 'border.strong',
      ...['info', 'success', 'warning', 'critical', 'neutral'].map((s) => `status.${s}.border`),
    ]);
    const ungraded = bridged.filter((slot) => !named.has(slot) && !NO_CONTRAST_ROLE.has(slot));
    expect(
      ungraded,
      `these bridged slots are graded by no rule and are not declared role-free:\n  ${ungraded.join('\n  ')}`,
    ).toEqual([]);
  });
});
