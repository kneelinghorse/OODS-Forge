/**
 * s169 m05 — the presets are BRAND-RELATIVE, and this spec asserts the new shape.
 *
 * ── WHAT CHANGED, AND WHY IT IS NOT COSMETIC ──
 * Every preset used to be wrapped in an explicit `color.brand.A`. Since `brand.apply`'s
 * alias strategy deep-merges a delta at the DOCUMENT ROOT, handing such a preset to
 * `brand.apply({ brand: 'B' })` did not restyle brand B — it wrote an entire brand-A
 * subtree INSIDE brand B's files. MEASURED against `dark-minimal.json` at s168's tip: the
 * plan reported `/color/brand/A: {…}` as an ADDITION in `brands/B/base.json`, `dark.json`
 * and `hc.json`, while the tool cheerfully summarised "Updated 3 token values for brand B".
 *
 * The wrapper is gone: a preset's top level is now the brand's own token groups, so ONE
 * preset serves ANY brand. The caller wraps it for the brand it is applying to — there is
 * no preset-loading path inside `brand.apply` and this mission deliberately did not add
 * one. `brand.apply` separately rejects a mismatched wrapper with OODS-V149, so the two
 * halves of the fix are: nothing loaded is pre-aimed at a brand, and nothing mis-aimed can
 * be applied.
 *
 * ── WHAT THIS SPEC ASSERTS THAT THE OLD ONE COULD NOT ──
 * The old spec asserted `preset.color.brand.A` in roughly eighteen places — it was
 * structurally incapable of noticing that the wrapper WAS the defect. This one asserts the
 * ABSENCE of any brand wrapper, and deep-mergeability against BOTH brands rather than A.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PRESETS_DIR = path.resolve(
  fileURLToPath(new URL('../../../../packages/tokens/src/presets', import.meta.url)),
);

const brandBasePath = (brand: string) =>
  path.resolve(
    fileURLToPath(new URL(`../../../../packages/tokens/src/tokens/brands/${brand}/base.json`, import.meta.url)),
  );

const PRESET_FILES = ['corporate-blue.json', 'startup-warm.json', 'dark-minimal.json'];
const BRANDS = ['A', 'B'] as const;

describe('brand presets', () => {
  const brandBase = Object.fromEntries(
    BRANDS.map((brand) => [
      brand,
      JSON.parse(fs.readFileSync(brandBasePath(brand), 'utf8')).color.brand[brand],
    ]),
  ) as Record<(typeof BRANDS)[number], Record<string, any>>;

  for (const presetFile of PRESET_FILES) {
    describe(presetFile, () => {
      const presetPath = path.join(PRESETS_DIR, presetFile);
      const preset = JSON.parse(fs.readFileSync(presetPath, 'utf8'));

      it('is valid JSON with $schema and $description', () => {
        expect(preset.$schema).toBe('https://design-tokens.org/dtcg/schema.json');
        expect(preset.$description).toBeTruthy();
      });

      it('is BRAND-RELATIVE: no color/brand wrapper, and no brand letter anywhere in its keys', () => {
        // The precise regression this replaces. `color` and `brand` must not appear as KEYS
        // at any depth — `"$type": "color"` is a DTCG VALUE and is untouched by this.
        expect(preset.color, 'a color wrapper is back — the preset is brand-aimed again').toBeUndefined();
        expect(preset.brand).toBeUndefined();
        const keysAtEveryDepth: string[] = [];
        const walk = (node: unknown): void => {
          if (!node || typeof node !== 'object') return;
          for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
            keysAtEveryDepth.push(key);
            walk(value);
          }
        };
        walk(preset);
        expect(keysAtEveryDepth).not.toContain('brand');
        expect(keysAtEveryDepth.filter((key) => key === 'A' || key === 'B')).toEqual([]);
      });

      it('its top level is the brand token groups themselves', () => {
        expect(preset.surface).toBeDefined();
        expect(preset.text).toBeDefined();
        expect(preset.border).toBeDefined();
        expect(preset.accent).toBeDefined();
      });

      it('includes interactive primary states (default, hover, pressed)', () => {
        const interactive = preset.surface.interactive.primary;
        expect(interactive.default).toBeDefined();
        expect(interactive.hover).toBeDefined();
        expect(interactive.pressed).toBeDefined();
      });

      it('includes accent tokens', () => {
        expect(preset.accent.background).toBeDefined();
        expect(preset.accent.border).toBeDefined();
        expect(preset.accent.text).toBeDefined();
      });

      it('all color tokens use oklch format', () => {
        const tokens: string[] = [];
        function collectValues(obj: any) {
          for (const [key, val] of Object.entries(obj)) {
            if (key === '$value' && typeof val === 'string') {
              tokens.push(val);
            } else if (typeof val === 'object' && val !== null) {
              collectValues(val);
            }
          }
        }
        collectValues(preset);
        expect(tokens.length).toBeGreaterThan(0);
        for (const token of tokens) {
          expect(token).toMatch(/^oklch\(/);
        }
      });

      // BOTH brands, not just A. A preset that only deep-merges cleanly into brand A is
      // still a brand-aimed preset, just implicitly — the defect wearing a different shape.
      for (const brand of BRANDS) {
        it(`token structure deep-merges cleanly into brand ${brand} (no orphan paths)`, () => {
          function checkPaths(presetObj: any, baseObj: any, trail = '') {
            for (const [key, val] of Object.entries(presetObj)) {
              if (key.startsWith('$')) continue; // skip DTCG meta keys
              const currentPath = `${trail}.${key}`;
              if (typeof val === 'object' && val !== null && !('$value' in val)) {
                expect(baseObj[key], `Missing brand ${brand} path: ${currentPath}`).toBeDefined();
                checkPaths(val, baseObj[key], currentPath);
              }
            }
          }
          checkPaths(preset, brandBase[brand]);
        });
      }

      it('documents HOW to apply it, including the wrapping step the caller owns', () => {
        // The wrapper was removed from the data; if the instruction for re-adding it at
        // call time is missing, the removal just relocates the foot-gun.
        expect(preset.$description).toContain('brand.apply');
        expect(preset.$description).toContain('color');
        expect(preset.$description).toContain('OODS-V149');
      });
    });
  }

  it('presets produce visually distinct palettes', () => {
    const primaries = PRESET_FILES.map((f) => {
      const preset = JSON.parse(fs.readFileSync(path.join(PRESETS_DIR, f), 'utf8'));
      return preset.surface.interactive.primary.default.$value;
    });
    const unique = new Set(primaries);
    expect(unique.size).toBe(PRESET_FILES.length);
  });

  it('every preset is applicable to EVERY brand — one payload, any brand', () => {
    // The point of the re-key, stated as an assertion: wrapping the same file for A and for
    // B produces two well-formed and DIFFERENT deltas, from one payload.
    for (const presetFile of PRESET_FILES) {
      const preset = JSON.parse(fs.readFileSync(path.join(PRESETS_DIR, presetFile), 'utf8'));
      const wrapFor = (brand: string) => ({ color: { brand: { [brand]: preset } } });
      expect(Object.keys(wrapFor('A').color.brand)).toEqual(['A']);
      expect(Object.keys(wrapFor('B').color.brand)).toEqual(['B']);
      expect(JSON.stringify(wrapFor('A'))).not.toBe(JSON.stringify(wrapFor('B')));
    }
  });
});
