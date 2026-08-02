/**
 * s167 m02 — the brand → semantic bridge, verified at the CSS-ARTIFACT level.
 *
 * SCOPE OF THIS CONTROL, STATED UP FRONT: it loads ONLY
 * `packages/tokens/dist/css/tokens.css`. It deliberately does not load the explorer
 * bundle, because `apps/explorer/src/styles/brand.css` and `layers.css` are still
 * present and still WIN at runtime — layers.css re-declares 41 of these same slots at
 * `:root` after importing the generated CSS. A "load the app and see if it changed"
 * check would therefore have no observable outcome and would not be a control at all.
 * What is proven here is that the generated ARTIFACT carries a correct six-cell matrix.
 * Whether the app consumes it is s168 (brand.css retirement).
 *
 * The expectation table is GENERATED from the six brand source files crossed with the
 * authored slot map — never transcribed from the build's own output.
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- build tooling, no type declarations
import { SEMANTIC_BRIDGE, UNBRIDGED_SLOTS } from '../../packages/tokens/scripts/brand-bridge.mjs';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const BRAND_ROOT = path.join(REPO_ROOT, 'packages', 'tokens', 'src', 'tokens', 'brands');
const TOKENS_CSS = path.join(REPO_ROOT, 'packages', 'tokens', 'dist', 'css', 'tokens.css');
const BRAND_CSS = path.join(REPO_ROOT, 'apps', 'explorer', 'src', 'styles', 'brand.css');

const BRANDS = ['A', 'B'] as const;
const THEMES = ['base', 'dark', 'hc'] as const;
type Brand = (typeof BRANDS)[number];
type Theme = (typeof THEMES)[number];

type BridgeEntry = { slot: string; tokenPath: string };
const bridge = SEMANTIC_BRIDGE as readonly BridgeEntry[];

/** memo SS3 D9 — the value-bearing selector for a cell. */
function selectorFor(brand: Brand, theme: Theme): string {
  return `[data-brand='${brand}'][data-theme='${theme}']`;
}

/** Read one `$value` out of a brand document by dotted path. */
function valueAt(doc: unknown, dotted: string): string | undefined {
  let node: unknown = doc;
  for (const segment of dotted.split('.')) {
    if (!node || typeof node !== 'object') return undefined;
    node = (node as Record<string, unknown>)[segment];
  }
  if (node && typeof node === 'object' && '$value' in (node as Record<string, unknown>)) {
    return String((node as Record<string, unknown>).$value);
  }
  return undefined;
}

/** `brand/theme` -> (slot -> the value that brand's source file declares). */
function expectationTable(): Map<string, Map<string, string>> {
  const table = new Map<string, Map<string, string>>();
  for (const brand of BRANDS) {
    for (const theme of THEMES) {
      const doc = JSON.parse(fs.readFileSync(path.join(BRAND_ROOT, brand, `${theme}.json`), 'utf8'));
      const cell = new Map<string, string>();
      for (const { slot, tokenPath } of bridge) {
        const value = valueAt(doc, `color.brand.${brand}.${tokenPath}`);
        if (value !== undefined) cell.set(slot, value);
      }
      table.set(`${brand}/${theme}`, cell);
    }
  }
  return table;
}

/** Comments stripped BEFORE splitting — $description text contains colons ("≥4.5:1"). */
function parseCssBlocks(css: string): Map<string, Map<string, string>> {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const blocks = new Map<string, Map<string, string>>();
  const blockRe = /([^{}]+)\{([^}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = blockRe.exec(stripped)) !== null) {
    const selector = match[1].trim().replace(/"/g, "'");
    if (!selector) continue;
    const decls = new Map<string, string>();
    for (const line of match[2].split(';')) {
      const idx = line.indexOf(':');
      if (idx < 0) continue;
      const prop = line.slice(0, idx).trim();
      if (!prop.startsWith('--')) continue;
      decls.set(prop, line.slice(idx + 1).trim());
    }
    for (const one of selector.split(',').map((s) => s.trim()).filter(Boolean)) {
      const existing = blocks.get(one);
      if (existing) for (const [k, v] of decls) existing.set(k, v);
      else blocks.set(one, new Map(decls));
    }
  }
  return blocks;
}

type Blocks = Map<string, Map<string, string>>;
type Table = Map<string, Map<string, string>>;

function findWrongSlots(blocks: Blocks, table: Table, brand: Brand, theme: Theme): string[] {
  const expected = table.get(`${brand}/${theme}`)!;
  const declared = blocks.get(selectorFor(brand, theme));
  if (!declared) return [`no bridge block for ${selectorFor(brand, theme)}`];
  const wrong: string[] = [];
  for (const [slot, want] of expected) {
    const got = declared.get(slot);
    if (got !== want) wrong.push(`${slot}: expected "${want}", got "${got ?? '<absent>'}"`);
  }
  return wrong;
}

function findCrossCellLeaks(blocks: Blocks, table: Table): string[] {
  const leaks: string[] = [];
  for (const brand of BRANDS) {
    for (const theme of THEMES) {
      const declared = blocks.get(selectorFor(brand, theme));
      if (!declared) continue;
      const own = table.get(`${brand}/${theme}`)!;
      for (const otherBrand of BRANDS) {
        for (const otherTheme of THEMES) {
          if (otherBrand === brand && otherTheme === theme) continue;
          const other = table.get(`${otherBrand}/${otherTheme}`)!;
          for (const [slot, otherValue] of other) {
            const ownValue = own.get(slot);
            // Only discriminating where the two cells genuinely disagree.
            if (ownValue === undefined || ownValue === otherValue) continue;
            if (declared.get(slot) === otherValue) {
              leaks.push(
                `${selectorFor(brand, theme)} ${slot} carries ${otherBrand}/${otherTheme}'s value "${otherValue}" (should be "${ownValue}")`,
              );
            }
          }
        }
      }
    }
  }
  return leaks;
}

describe('s167 m02 — the brand→semantic bridge in the emitted CSS artifact', () => {
  const css = fs.readFileSync(TOKENS_CSS, 'utf8');
  const blocks = parseCssBlocks(css);
  const table = expectationTable();

  it('the authored map plus the recorded gaps account for every slot brand.css assigns', () => {
    // brand.css is the hand-authored copy this bridge is meant to replace, so its slot
    // names are the contract. Sourcing the list from the file (not from a constant)
    // means a slot added there shows up here as a failure rather than as silence.
    const brandCss = fs.readFileSync(BRAND_CSS, 'utf8');
    const declaredSlots = new Set(
      [...brandCss.matchAll(/(--theme-[a-z0-9-]+)\s*:/g)].map((m) => m[1]),
    );
    expect(declaredSlots.size).toBe(41);

    const covered = new Set([
      ...bridge.map((e) => e.slot),
      ...(UNBRIDGED_SLOTS as readonly { slot: string }[]).map((e) => e.slot),
    ]);
    const unaccounted = [...declaredSlots].filter((s) => !covered.has(s));
    expect(unaccounted, `slots in brand.css neither bridged nor recorded: ${unaccounted.join(', ')}`).toEqual([]);

    // ...and nothing in the map that brand.css does not actually declare.
    const phantom = bridge.map((e) => e.slot).filter((s) => !declaredSlots.has(s));
    expect(phantom, `mapped slots absent from brand.css: ${phantom.join(', ')}`).toEqual([]);
    expect(bridge).toHaveLength(38);
  });

  it('emits a bridge block for every one of the six cells', () => {
    const missing: string[] = [];
    for (const brand of BRANDS) {
      for (const theme of THEMES) {
        const declared = blocks.get(selectorFor(brand, theme));
        if (!declared) missing.push(selectorFor(brand, theme));
        else if (![...declared.keys()].some((k) => k.startsWith('--theme-'))) {
          missing.push(`${selectorFor(brand, theme)} (block present but carries no --theme-* slot)`);
        }
      }
    }
    expect(missing, `missing bridge blocks: ${missing.join(', ')}`).toEqual([]);
  });

  it("the base row also matches the MCP theme vocabulary ('light', not just 'base')", () => {
    // normalizeTheme defaults to 'light' at the MCP boundary while the token tree spells
    // it 'base'. A matrix keyed only on 'base' would match zero rendered documents while
    // a file-text oracle stayed green (memo SS3 D9).
    for (const brand of BRANDS) {
      const lightBlock = blocks.get(`[data-brand='${brand}'][data-theme='light']`);
      expect(lightBlock, `no [data-brand='${brand}'][data-theme='light'] block`).toBeDefined();
      const baseExpected = table.get(`${brand}/base`)!;
      for (const [slot, want] of baseExpected) {
        expect(lightBlock!.get(slot), `${brand} light ${slot}`).toBe(want);
      }
    }
  });

  for (const brand of BRANDS) {
    for (const theme of THEMES) {
      it(`${brand}/${theme}: every bridged slot carries THIS cell's brand value`, () => {
        expect(table.get(`${brand}/${theme}`)!.size).toBe(38);
        const wrong = findWrongSlots(blocks, table, brand, theme);
        expect(wrong, `${brand}/${theme} bridge is wrong:\n  ${wrong.join('\n  ')}`).toEqual([]);
      });
    }
  }

  it('no cell carries another cell\'s value (cross-cell control)', () => {
    const leaks = findCrossCellLeaks(blocks, table);
    expect(leaks, `cross-cell leakage:\n  ${leaks.join('\n  ')}`).toEqual([]);
  });

  it('the cross-cell control is discriminating (seeded leak)', () => {
    const slot = '--theme-surface-canvas';
    const aBase = table.get('A/base')!.get(slot);
    const aDark = table.get('A/dark')!.get(slot);
    expect(aBase).toBe('oklch(0.967 0.03 86)');
    expect(aDark).toBe('oklch(0.14 0.008 200)');

    const seeded = parseCssBlocks(`${css}\n${selectorFor('A', 'base')} { ${slot}: ${aDark}; }\n`);
    const leaks = findCrossCellLeaks(seeded, table);
    expect(leaks.join('\n')).toContain(slot);
    expect(leaks.some((l) => l.includes("A/dark's value"))).toBe(true);
    expect(findWrongSlots(seeded, table, 'A', 'base').join('\n')).toContain(slot);

    // Control of the control: unseeded is clean, so the seed is what moved it.
    expect(findCrossCellLeaks(blocks, table)).toEqual([]);
  });

  /**
   * The point of the whole mission. Before s167 every `--theme-*` slot resolved to the
   * neutral reference palette and NO semantic declaration referenced a brand var, so
   * emitting `[data-brand]` blocks over the brand namespace alone would have changed
   * zero pixels. If a bridge block merely restated the `:root` value it would be exactly
   * that no-op wearing a selector.
   */
  it('the bridge is not a no-op: cells genuinely diverge from the :root default', () => {
    const root = blocks.get(':root')!;
    expect(root).toBeDefined();

    for (const brand of BRANDS) {
      for (const theme of THEMES) {
        const declared = blocks.get(selectorFor(brand, theme))!;
        const differing = bridge.filter(({ slot }) => {
          const rootValue = root.get(slot);
          return rootValue !== undefined && declared.get(slot) !== rootValue;
        });
        // Every slot's :root value is a var(--ref-color-*) reference from theme0, while
        // every bridged value is a brand literal, so all 38 must differ.
        expect(
          differing.length,
          `${brand}/${theme} only overrides ${differing.length}/38 slots — a bridge that restates :root changes nothing`,
        ).toBe(38);
      }
    }

    // And the :root default really is the brand-agnostic reference palette.
    expect(root.get('--theme-surface-canvas')).toBe('var(--ref-color-neutral-50)');
  });
});
