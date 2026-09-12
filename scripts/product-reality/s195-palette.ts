/** s195-m05: deterministic hue-only search, canonical application and built-token proof.
 * Run --select before edits, then --apply, the real token build, and --verify.
 * --select never mutates token sources. --replay recomputes the saved selection.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import Color from 'colorjs.io';
import { contrastRatio } from '@oods/a11y-tools';
import { createRequire } from 'node:module';
import { resolveCategoricalPalette, resolveTokenToColor, type NormalizedVizSpec } from '@oods/viz-core';
import { evaluateCategoricalRoleA } from '../../packages/mcp-server/src/tools/certify-contrast.js';
import { CVD_TYPES, simulateCvd } from '../../packages/mcp-server/src/tools/cvd-machado.js';

const PACKET = 'artifacts/product-reality/sprint-195/m05/palette';
const BRANDS = ['A', 'B'] as const;
const THEMES = ['light', 'dark'] as const;
const SLOT_KEYS = Array.from({ length: 6 }, (_, index) => `--oods-viz-scale-categorical-0${index + 1}`);
type TokenMap = Record<string, string>;
const bundle = createRequire(import.meta.url)('../../packages/tokens/dist/index.cjs') as {
  cssVariables: TokenMap;
  cssVariablesByScope: Record<string, Record<string, TokenMap>>;
};
type SourceDoc = Record<string, any>;
interface Selection {
  theme: string;
  candidateCount: number;
  hueStepDegrees: number;
  candidates: Array<{ slot: number; hueDelta: number; value: string; palette: string[]; minimumDeltaE: number; minimumContrast: number }>;
  chosen: { slot: number; hueDelta: number; value: string; palette: string[]; minimumDeltaE: number; minimumContrast: number };
}
const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const save = (name: string, value: unknown) => writeFileSync(`${PACKET}/${name}`, JSON.stringify(value, null, 2) + '\n');
export const hex = (raw: string): string => '#' + new Color(raw).to('srgb').coords
  .map(channel => Math.round(Math.max(0, Math.min(1, channel!)) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
const maps = (): Record<string, TokenMap> => ({
  flat: bundle.cssVariables,
  ...Object.fromEntries(BRANDS.flatMap(brand => ['light', 'dark', 'hc'].map(theme => [`${brand}/${theme}`, bundle.cssVariablesByScope[brand][theme]]))),
});

export function grades(rawPalette: string[], canvas: string) {
  const palette = rawPalette.map(hex);
  const pairwise = [];
  for (let i = 0; i < palette.length; i++) for (let j = i + 1; j < palette.length; j++) {
    for (const mode of ['normal', ...CVD_TYPES] as const) {
      const a = mode === 'normal' ? palette[i]! : simulateCvd(palette[i]!, mode);
      const b = mode === 'normal' ? palette[j]! : simulateCvd(palette[j]!, mode);
      pairwise.push({ slots: [i + 1, j + 1], mode, deltaE: new Color(a).deltaE(new Color(b), '2000') });
    }
  }
  return {
    rawPalette, palette, canvas,
    roleA: evaluateCategoricalRoleA(palette),
    slots: palette.map((paint, index) => ({ slot: index + 1, paint, chroma: new Color(paint).oklch[1], contrast: contrastRatio(paint, canvas) })),
    pairwise,
  };
}

/** Exhaust each smaller 0.01-degree radius first; change one hue only, never L/C.
 * At the first feasible radius, prefer fewer/deterministically earlier slot changes,
 * then negative before positive. The bound is five degrees, not an unbounded search.
 */
export function selectMinimalHue(theme: string, raw: string[], canvases: string[]): Selection {
  let candidateCount = 0;
  for (let radius = 1; radius <= 500; radius++) {
    const candidates: Selection['candidates'] = [];
    for (let slot = 0; slot < raw.length; slot++) for (const sign of [-1, 1]) {
      // Preserve authored L/C exactly, avoiding parse/serialize roundoff in Colorjs.
      const source = raw[slot]!.match(/^oklch\((\S+) (\S+) ([0-9.]+)\)$/);
      assert(source, `Expected canonical inline OKLCH: ${raw[slot]}`);
      const hueDelta = sign * radius / 100;
      const hue = Math.round((Number(source[3]) + hueDelta) * 100) / 100;
      const value = `oklch(${source[1]} ${source[2]} ${hue})`;
      const palette = raw.map((paint, index) => hex(index === slot ? value : paint));
      candidateCount++;
      const minimumContrast = Math.min(...palette.flatMap(paint => canvases.map(canvas => contrastRatio(paint, canvas))));
      if (minimumContrast < 3) continue;
      const roleA = evaluateCategoricalRoleA(palette);
      if (roleA.verdict === 'pass' && roleA.minimumDeltaE !== undefined && roleA.minimumDeltaE >= 10) {
        candidates.push({ slot: slot + 1, hueDelta, value, palette, minimumDeltaE: roleA.minimumDeltaE, minimumContrast });
      }
    }
    if (candidates.length) return { theme, candidateCount, hueStepDegrees: 0.01, candidates, chosen: candidates[0]! };
  }
  throw new Error(`${theme}: no one-slot hue-only solution within ±5 degrees at 0.01-degree precision; record the measured search before widening scope.`);
}

function leaves(doc: SourceDoc, prefix = ''): Record<string, unknown> {
  if ('$value' in doc) return { [prefix]: doc.$value };
  return Object.fromEntries(Object.entries(doc).filter(([, value]) => value && typeof value === 'object' && !Array.isArray(value))
    .flatMap(([key, value]) => Object.entries(leaves(value, prefix ? `${prefix}.${key}` : key))));
}

function selectionFrom(before: any): Selection[] {
  return THEMES.map(theme => {
    const raw = SLOT_KEYS.map(key => before.maps[`A/${theme}`][key]);
    assert.deepEqual(raw, SLOT_KEYS.map(key => before.maps[`B/${theme}`][key]), 'This bounded shared-hue search requires equal A/B palettes.');
    return selectMinimalHue(theme, raw, BRANDS.map(brand => hex(before.maps[`${brand}/${theme}`]['--oods-sys-surface-canvas'])));
  });
}

async function main() {
  const mode = process.argv[2];
  mkdirSync(PACKET, { recursive: true });
  if (mode === '--select') {
    const sourcePaths = BRANDS.flatMap(brand => ['base', 'dark', 'hc'].map(theme => `packages/tokens/src/tokens/brands/${brand}/${theme}.json`));
    sourcePaths.push('packages/tokens/src/viz-scales.json');
    const before = {
      base: '9c75a1dbb495ca26c16f2f75ce52095e72adb16e',
      maps: maps(),
      sources: Object.fromEntries(sourcePaths.map(path => [path, read(path)])),
      sourceLeafCounts: Object.fromEntries(sourcePaths.map(path => [path, Object.keys(leaves(read(path))).length])),
      scopes: BRANDS.flatMap(brand => THEMES.map(theme => {
        const map = maps()[`${brand}/${theme}`]!;
        return { scope: `${brand}/${theme}`, ...grades(SLOT_KEYS.map(key => map[key]!), hex(map['--oods-sys-surface-canvas']!)) };
      })),
    };
    if (existsSync(`${PACKET}/before.json`)) assert.deepEqual(read(`${PACKET}/before.json`), before, 'Refusing to overwrite historical before evidence; use --replay.');
    else save('before.json', before);
    const selection = selectionFrom(before);
    save('selection.json', { algorithm: 'One slot; smallest absolute hue offset on 0.01-degree grid within ±5 degrees; L/C fixed; Role-A >=10 normal + three Machado CVD modes, Role-C >=3 on both canvases, chroma >=0.03.', selection });
    console.log(JSON.stringify(selection, null, 2));
    return;
  }
  const before = read(`${PACKET}/before.json`);
  const selection = read(`${PACKET}/selection.json`).selection as Selection[];
  if (mode === '--replay') {
    assert.deepEqual(selectionFrom(before), selection);
    console.log('Deterministic selection replay matches byte-for-byte JSON values.');
    return;
  }
  if (mode === '--apply') {
    for (const selected of selection) for (const brand of BRANDS) {
      const theme = selected.theme === 'light' ? 'base' : 'dark';
      const path = `packages/tokens/src/tokens/brands/${brand}/${theme}.json`;
      assert.deepEqual(read(path), before.sources[path], `Source changed since baseline: ${path}`);
      const doc = read(path);
      doc.viz ??= {}; doc.viz.scale ??= {}; doc.viz.scale.categorical ??= {};
      const slot = String(selected.chosen.slot).padStart(2, '0');
      doc.viz.scale.categorical[slot] = {
        ...(doc.viz.scale.categorical[slot] ?? { $type: 'color' }),
        $value: selected.chosen.value,
        $description: `${selected.theme === 'light' ? 'Light' : 'Dark'} categorical slot ${slot}; minimal hue revision with fixed lightness/chroma, measured Role-A >=10 and Role-C >=3:1 on both brand canvases (s195-m05).`,
      };
      const serialized = JSON.stringify(doc, null, 2);
      // Base sources use ASCII JSON escapes; retain unrelated source bytes.
      const formatted = theme === 'base' ? serialized.replace(/[^\x00-\x7F]/g, character => '\\u' + character.charCodeAt(0).toString(16).padStart(4, '0')) : serialized;
      writeFileSync(path, formatted + '\n');
    }
    console.log('Applied one categorical slot in each of four canonical brand files.');
    return;
  }
  assert.equal(mode, '--verify', 'Expected --select, --replay, --apply or --verify');
  const afterMaps = maps();
  const mapChanges = Object.entries(afterMaps).map(([scope, map]) => {
    const changed = [...new Set([...Object.keys(map), ...Object.keys(before.maps[scope])])].filter(key => map[key] !== before.maps[scope][key]).sort();
    const selected = selection.find(item => item.theme === (scope.endsWith('dark') ? 'dark' : 'light'))!;
    assert.deepEqual(changed, [`--oods-viz-scale-categorical-0${selected.chosen.slot}`], `Unexpected scoped token drift: ${scope}`);
    return { scope, beforeSha256: hash(before.maps[scope]), afterSha256: hash(map), changed };
  });
  const sourceChanges = Object.entries(before.sources as Record<string, SourceDoc>).map(([path, old]) => {
    const current = read(path); const previousLeaves = leaves(old); const currentLeaves = leaves(current);
    const changed = [...new Set([...Object.keys(previousLeaves), ...Object.keys(currentLeaves)])].filter(key => currentLeaves[key] !== previousLeaves[key]).sort();
    const theme = path.endsWith('/base.json') ? 'light' : path.endsWith('/dark.json') ? 'dark' : undefined;
    const selected = selection.find(item => item.theme === theme);
    const expected = selected ? [`viz.scale.categorical.0${selected.chosen.slot}`] : [];
    assert.deepEqual(changed, expected, `Unexpected canonical leaf drift: ${path}`);
    return { path, beforeLeafCount: Object.keys(previousLeaves).length, afterLeafCount: Object.keys(currentLeaves).length, changed };
  });
  const scopes = BRANDS.flatMap(brand => THEMES.map(theme => {
    const map = afterMaps[`${brand}/${theme}`]!;
    const result = grades(SLOT_KEYS.map(key => map[key]!), hex(map['--oods-sys-surface-canvas']!));
    const resolved = resolveCategoricalPalette({} as NormalizedVizSpec, { brand, theme });
    assert.deepEqual(resolved, result.palette, 'Colorjs candidate conversion must equal actual renderer-resolved built token bytes.');
    assert.deepEqual(resolved, selection.find(item => item.theme === theme)!.chosen.palette);
    assert.equal(hex(resolveTokenToColor('--sys-surface-canvas', { brand, theme })!), result.canvas);
    assert(result.roleA.minimumDeltaE! >= 10 && result.roleA.lowChromaPaints.length === 0);
    assert(result.slots.every(slot => slot.contrast >= 3 && slot.chroma >= 0.03));
    assert.equal(result.pairwise.length, 60);
    assert(result.pairwise.every(pair => pair.deltaE >= 10));
    return { scope: `${brand}/${theme}`, ...result };
  }));
  save('after.json', { mapChanges, sourceChanges, scopes, checks: { roleC: 24, pairwise: 240, chroma: 24, unrelatedLeavesChanged: 0 } });
  console.log(JSON.stringify({ scopes: scopes.map(({ scope, roleA, slots }) => ({ scope, minimumDeltaE: roleA.minimumDeltaE, minimumContrast: Math.min(...slots.map(slot => slot.contrast)) })), sourceChanges, mapChanges }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
