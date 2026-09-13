#!/usr/bin/env tsx
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Ajv } from 'ajv';
import Color from 'colorjs.io';
import { isInSrgb } from './palette-checks.js';

export interface ToneSeed { hue: number; chromaPeak: number }
export interface BrandSeed {
  primary: ToneSeed;
  accent: ToneSeed;
  neutral: ToneSeed;
  status: Record<'info' | 'success' | 'warning' | 'critical' | 'archive', ToneSeed>;
  dark: { canvasLightness: number; elevationDelta: number; canvasChroma: number; accentChromaScale: number };
}
export interface PaletteSeeds {
  version: 1;
  brands: { A: BrandSeed; B: { primaryHue: number } };
  viz: {
    categorical: { hueOffset: number; light: Array<{ lightness: number; chromaPeak: number }>; dark: Array<{ lightness: number; chromaPeak: number }> };
    sequential: ToneSeed;
    diverging: { negativeHue: number; positiveHue: number; chromaPeak: number };
  };
}
type TokenTree = { [key: string]: unknown };
export type PaletteGroup = 'reference' | 'light' | 'dark' | 'viz' | 'hc';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SEED_PATH = 'packages/tokens/src/palette/seeds.json';
const TOKEN_ROOT = 'packages/tokens/src/tokens';

export async function loadPaletteSeeds(seedPath = path.join(ROOT, SEED_PATH)): Promise<PaletteSeeds> {
  const schema = JSON.parse(await fs.readFile(path.join(ROOT, 'packages/tokens/src/palette/seeds.schema.json'), 'utf8'));
  const seed: unknown = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  const ajv = new Ajv({ allErrors: true, strict: true });
  const validate = ajv.compile<PaletteSeeds>(schema);
  if (!validate(seed)) throw new Error(`Invalid palette seeds: ${ajv.errorsText(validate.errors)}`);
  return seed;
}

/** Preserve hue and lightness; reduce chroma into sRGB without channel clipping. */
export function paletteColor(l: number, c: number, h: number): string {
  const serialize = (chroma: number) => `oklch(${Number(l.toFixed(6))} ${Number(chroma.toFixed(6))} ${Number(h.toFixed(6))})`;
  if (isInSrgb(serialize(c))) return serialize(c);
  let low = 0;
  let high = c;
  for (let i = 0; i < 24; i += 1) {
    const mid = (low + high) / 2;
    if (isInSrgb(serialize(mid))) low = mid;
    else high = mid;
  }
  return serialize(low);
}

function tone(seed: ToneSeed, l: number, strength = 1): string {
  return paletteColor(l, seed.chromaPeak * Math.sin(Math.PI * l) ** 1.3 * strength, seed.hue);
}

function neutralTone(seed: ToneSeed, l: number): string {
  const envelope = l === 0 || l === 1 ? 0 : .1 + .9 * Math.sin(Math.PI * l) ** 1.3;
  return paletteColor(l, seed.chromaPeak * envelope, seed.hue);
}

function leaf(value: string, name: string) {
  const system = /^(Canvas|CanvasText|Highlight|HighlightText|GrayText|LinkText)$/.test(value);
  return {
    $type: 'color', $value: value,
    $description: `${name}; generated from palette/seeds.json by generate-palette.ts.`
      + (!system && /^color\.brand\.[AB]\.text\.onInteractive$/.test(name)
        ? ' Foreground contrast ≥4.5:1 on its default interactive surface.' : ''),
    ...(!system ? { $extensions: { ods: { fallback: new Color(value).to('srgb').toString({ format: 'hex', collapse: false }).toUpperCase() } } } : {}),
  };
}

function setColor(tree: TokenTree, key: string, value: string): void {
  const segments = key.split('.');
  let node = tree;
  for (const segment of segments.slice(0, -1)) node = (node[segment] ??= {}) as TokenTree;
  node[segments.at(-1)!] = leaf(value, key);
}

function referenceRamp(tree: TokenTree, family: string, seed: ToneSeed): void {
  const steps = [[50, .985], [100, .95], [200, .89], [300, .81], [400, .71],
    [500, .6], [600, .5], [700, .42], [800, .34], [900, .25], [950, .18]];
  for (const [step, defaultL] of steps) {
    const l = family === 'primary' ? ({ 500: .55, 600: .45, 700: .41 } as Record<number, number>)[step] ?? defaultL : defaultL;
    setColor(tree, `ref.color.${family}.${step}`, family === 'neutral' ? neutralTone(seed, l) : tone(seed, l));
  }
  if (family === 'neutral') setColor(tree, 'ref.color.neutral.0', paletteColor(1, 0, seed.hue));
}

function interactiveColors(seed: ToneSeed, dark: boolean): Record<string, string> {
  const baseL = dark ? .40 : .53;
  const baseC = Math.min(seed.chromaPeak, .06);
  return Object.fromEntries(Object.entries({ default: [0, 0], hover: [.10, .015], pressed: [.14, .025] })
    .map(([state, [deltaL, deltaC]]) => [state,
      paletteColor(baseL + (dark ? deltaL : -deltaL), baseC + deltaC, seed.hue)]));
}

/** Theme0 remains the unbranded semantic scope; reference/chart ramps stay frozen. */
function lightThemeTrees(seed: BrandSeed): Record<string, TokenTree> {
  const surface: TokenTree = {};
  const status: TokenTree = {};
  const alias = (tree: TokenTree, key: string, target: string) => {
    const segments = key.split('.');
    let node = tree;
    for (const segment of segments.slice(0, -1)) node = (node[segment] ??= {}) as TokenTree;
    node[segments.at(-1)!] = { $type: 'color', $value: `{${target}}`,
      $description: `${key}; generated semantic binding by generate-palette.ts.` };
  };
  for (const [role, step] of Object.entries({ canvas: 50, raised: 100, subtle: 200, backdrop: 900, inverse: 900, disabled: 200 })) {
    alias(surface, `theme.surface.${role}`, `ref.color.neutral.${step}`);
  }
  for (const [state, value] of Object.entries(interactiveColors(seed.primary, false))) {
    setColor(surface, `theme.surface.interactive.primary.${state}`, value);
    if (state !== 'default') {
      const token = (surface as any).theme.surface.interactive.primary[state];
      const [deltaL, deltaC] = state === 'hover' ? ['0.10', '0.015'] : ['0.14', '0.025'];
      token.$extensions.ods.relative = `oklch(from var(--theme-surface-interactive-primary-default) calc(l - ${deltaL}) calc(c + ${deltaC}) h)`;
    }
  }
  for (const [role, step] of Object.entries({ subtle: 200, strong: 300 })) alias(surface, `theme.border.${role}`, `ref.color.neutral.${step}`);
  for (const family of ['info', 'success', 'warning', 'accent', 'critical', 'neutral', 'archive']) {
    const steps = { surface: 100, border: 300, text: family === 'neutral' ? 800 : family === 'accent' ? 700 : 900,
      icon: family === 'accent' ? 600 : 700 };
    for (const [role, step] of Object.entries(steps)) alias(status, `theme.status.${family}.${role}`, `ref.color.${family}.${step}`);
  }
  return { surface, status };
}

function brandTree(brand: 'A' | 'B', seed: BrandSeed, dark: boolean, retainedViz: TokenTree): TokenTree {
  const tree: TokenTree = { $schema: 'https://design-tokens.org/dtcg/schema.json' };
  const put = (role: string, value: string) => setColor(tree, `color.brand.${brand}.${role}`, value);
  const neutral = (l: number) => dark
    ? paletteColor(l, seed.dark.canvasChroma, seed.neutral.hue) : neutralTone(seed.neutral, l);
  const canvas = seed.dark.canvasLightness;
  const elevation = seed.dark.elevationDelta;
  const surfaces: Record<string, number> = dark
    ? { canvas, raised: canvas + elevation, subtle: canvas + elevation * 2,
      disabled: canvas + elevation * 3, backdrop: canvas - elevation, inverse: .96 }
    : { canvas: .985, raised: 1, subtle: .95, disabled: .93, backdrop: .2, inverse: .23 };
  for (const [role, l] of Object.entries(surfaces)) put(`surface.${role}`, neutral(l));
  // State colors have their own chroma ladder: a tonal ramp reduces chroma
  // toward the ends and cannot express the declared positive state deltas.
  for (const [state, value] of Object.entries(interactiveColors(seed.primary, dark))) {
    put(`surface.interactive.primary.${state}`, value);
  }
  put('border.subtle', neutral(dark ? .4 : .86));
  put('border.strong', neutral(dark ? .56 : .6));
  const accentText = tone(seed.accent, dark ? .82 : .46, dark ? seed.dark.accentChromaScale : 1);
  put('focus.ring.outer', tone(seed.primary, dark ? .85 : .46, dark ? seed.dark.accentChromaScale : 1));
  put('focus.ring.inner', neutral(surfaces.canvas));
  put('focus.text', accentText);
  for (const [role, l] of Object.entries(dark
    ? { primary: .94, secondary: .83, muted: .73, inverse: .23, onInteractive: .985, disabled: .55 }
    : { primary: .23, secondary: .38, muted: .47, inverse: .96, onInteractive: .985, disabled: .7 })) {
    put(`text.${role}`, neutral(l));
  }
  put('text.accent', accentText);
  put('accent.background', tone(seed.accent, dark ? .29 : .95, .4));
  put('accent.border', tone(seed.accent, dark ? .54 : .76, .8));
  put('accent.text', accentText);
  for (const family of ['info', 'success', 'warning', 'critical', 'neutral'] as const) {
    const familySeed = family === 'neutral' ? seed.neutral : seed.status[family];
    for (const [role, l] of Object.entries(dark
      ? { surface: .28, border: .45, text: .88, icon: .8 }
      : { surface: .97, border: .8, text: .42, icon: .56 })) {
      put(`status.${family}.${role}`, tone(familySeed, l, dark ? seed.dark.accentChromaScale : 1));
    }
  }
  tree.viz = structuredClone(retainedViz);
  return tree;
}

/** Shared dark roles follow brand A; brands override the same public aliases. */
function darkThemeTrees(seed: BrandSeed): Record<string, TokenTree> {
  const brand = (brandTree('A', seed, true, {}).color as any).brand.A;
  const theme = (roles: TokenTree): TokenTree => ({ 'theme-dark': roles });
  const text = structuredClone(brand.text);
  text['on-interactive'] = text.onInteractive;
  delete text.onInteractive;
  const icon: TokenTree = {};
  for (const [role, l] of Object.entries({ primary: .85, muted: .64, 'on-interactive': .985 })) {
    setColor(icon, role, paletteColor(l, seed.dark.canvasChroma, seed.neutral.hue));
  }
  const status = structuredClone(brand.status);
  for (const [family, familySeed] of Object.entries({ accent: seed.accent, archive: seed.status.archive })) {
    for (const [role, l] of Object.entries({ surface: .28, border: .45, text: .88, icon: .8 })) {
      setColor(status, `${family}.${role}`, tone(familySeed, l, seed.dark.accentChromaScale));
    }
  }
  const focus = { ...brand.focus, width: {
    $type: 'dimension', $value: '2px', $description: 'Focus ring width shared with light theme.',
  } };
  return { surface: theme({ surface: brand.surface, border: brand.border }),
    text: theme({ text, icon }), status: theme({ status }), focus: theme({ focus }) };
}

function vizTree(seeds: PaletteSeeds, theme: 'light' | 'dark' | 'hc'): TokenTree {
  const tree: TokenTree = {};
  const put = (role: string, value: string) => setColor(tree, `scale.${role}`, value);
  const categorical = seeds.viz.categorical;
  for (let i = 0; i < 6; i += 1) {
    const slot = categorical[theme === 'dark' ? 'dark' : 'light'][i];
    put(`categorical.0${i + 1}`, theme === 'hc' ? 'CanvasText'
      : paletteColor(slot.lightness, slot.chromaPeak, (categorical.hueOffset + i * 60) % 360));
  }
  for (let i = 0; i < 9; i += 1) {
    const l = (theme === 'dark' ? .96 : .94) - i * .1;
    put(`sequential.0${i + 1}`, theme === 'hc' ? paletteColor(l, 0, seeds.brands.A.neutral.hue)
      : tone(seeds.viz.sequential, l, theme === 'dark' ? .8 : 1));
  }
  const diverging = seeds.viz.diverging;
  for (let step = 1; step <= 5; step += 1) {
    const l = (theme === 'dark' ? .86 : .82) - step * .12;
    const desired = diverging.chromaPeak * Math.sin(Math.PI * l) ** 1.3;
    // Map both wings to the smaller in-gamut chroma so their L AND C stay symmetric.
    const chroma = theme === 'hc' ? 0 : Math.min(...[diverging.negativeHue, diverging.positiveHue]
      .map(hue => Number(new Color(paletteColor(l, desired, hue)).to('oklch').coords[1])));
    for (const [side, hue] of [['neg', diverging.negativeHue], ['pos', diverging.positiveHue]] as const) {
      put(`diverging.${side}-0${step}`, paletteColor(l, chroma, hue));
    }
  }
  put('diverging.neutral', paletteColor(theme === 'dark' ? .86 : .82, 0, seeds.brands.A.neutral.hue));
  return tree;
}

function hcBrandTree(brand: 'A' | 'B', seed: BrandSeed, viz: TokenTree): TokenTree {
  const tree = brandTree(brand, seed, false, viz);
  const walk = (node: TokenTree, trail: string[] = []): void => {
    for (const [key, value] of Object.entries(node)) {
      if (!value || typeof value !== 'object') continue;
      const token = value as TokenTree;
      const role = [...trail, key].join('.');
      if ('$value' in token) {
        let color = 'CanvasText';
        if (role.startsWith('surface.')) color = role.includes('interactive') ? 'Highlight' : role === 'surface.inverse' ? 'CanvasText' : 'Canvas';
        else if (role.startsWith('text.')) color = ({ secondary: 'GrayText', muted: 'GrayText', inverse: 'Canvas', accent: 'LinkText', onInteractive: 'HighlightText', disabled: 'GrayText' } as Record<string, string>)[key] ?? 'CanvasText';
        else if (role.startsWith('focus.')) color = key === 'inner' ? 'Canvas' : key === 'text' ? 'HighlightText' : 'Highlight';
        else if (role.startsWith('accent.')) color = key === 'background' ? 'Canvas' : key === 'border' ? 'Highlight' : 'HighlightText';
        else if (role.startsWith('border.')) color = key === 'strong' ? 'Highlight' : 'CanvasText';
        else if (role.startsWith('status.')) color = key === 'surface' ? 'Canvas' : role.startsWith('status.neutral.') ? 'CanvasText' : key === 'border' ? 'Highlight' : 'HighlightText';
        node[key] = leaf(color, `color.brand.${brand}.${role}`);
      } else walk(token, [...trail, key]);
    }
  };
  walk(((tree.color as TokenTree).brand as Record<string, TokenTree>)[brand]);
  return tree;
}

/** Pure derivation. No generated file is used as input, including its metadata. */
export function generatePaletteFiles(seeds: PaletteSeeds, groups: readonly PaletteGroup[] = ['reference', 'light', 'dark', 'viz', 'hc']): Map<string, string> {
  const files = new Map<string, string>();
  const emit = (name: string, tree: TokenTree) => files.set(`${TOKEN_ROOT}/${name}`, `${JSON.stringify(tree, null, 2)}\n`);
  const a = seeds.brands.A;
  const lightViz = vizTree(seeds, 'light');
  const baseViz = { scale: { categorical: { '05': ((lightViz.scale as TokenTree).categorical as TokenTree)['05'] } } };
  const darkViz = vizTree(seeds, 'dark');
  if (groups.includes('reference')) {
    const brand: TokenTree = {};
    referenceRamp(brand, 'primary', a.primary);
    referenceRamp(brand, 'accent', a.accent);
    emit('base/reference/color.brand.json', brand);
    const neutral: TokenTree = {};
    referenceRamp(neutral, 'neutral', a.neutral);
    emit('base/reference/color.neutral.json', neutral);
    const status: TokenTree = {};
    for (const [family, seed] of Object.entries(a.status)) referenceRamp(status, family, seed);
    emit('base/reference/color.status.json', status);
  }
  for (const brand of ['A', 'B'] as const) {
    // Brand B demonstrates the same design with one different primary seed hue.
    const seed = brand === 'A' ? a : { ...a, primary: { ...a.primary, hue: seeds.brands.B.primaryHue } };
    for (const mode of ['base', 'dark'] as const) {
      if (!groups.includes(mode === 'base' ? 'light' : 'dark') && !groups.includes('viz')) continue;
      emit(`brands/${brand}/${mode}.json`, brandTree(brand, seed, mode === 'dark', mode === 'base' ? baseViz : darkViz));
    }
    if (groups.includes('hc')) emit(`brands/${brand}/hc.json`, hcBrandTree(brand, seed, vizTree(seeds, 'hc')));
  }
  if (groups.includes('viz')) files.set('packages/tokens/src/viz-scales.json', `${JSON.stringify({ viz: lightViz }, null, 2)}\n`);
  if (groups.includes('light')) {
    for (const [name, tree] of Object.entries(lightThemeTrees(a))) emit(`themes/theme0/${name}.json`, tree);
  }
  if (groups.includes('dark')) {
    for (const [name, tree] of Object.entries(darkThemeTrees(a))) emit(`themes/dark/${name}.json`, tree);
  }
  return files;
}

export async function writePaletteFiles(files: ReadonlyMap<string, string>, outputRoot: string, check = false): Promise<string[]> {
  const drift: string[] = [];
  for (const [name, expected] of files) {
    const target = path.join(outputRoot, name);
    if (check) {
      try {
        if (await fs.readFile(target, 'utf8') !== expected) drift.push(name);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        drift.push(name);
      }
    } else {
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, expected);
    }
  }
  return drift;
}

async function main() {
  const args = process.argv.slice(2);
  let seedPath = path.join(ROOT, SEED_PATH);
  let outputRoot = ROOT;
  let check = false;
  let groups: PaletteGroup[] = ['reference', 'light', 'dark', 'viz', 'hc'];
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--check') { check = true; continue; }
    if (!['--seeds', '--out', '--only'].includes(args[i])) throw new Error(`Unknown option: ${args[i]}`);
    const value = args[i + 1];
    if (!value || value.startsWith('--')) throw new Error(`Expected value after ${args[i]}`);
    if (args[i] === '--seeds') seedPath = path.resolve(value);
    if (args[i] === '--out') outputRoot = path.resolve(value);
    if (args[i] === '--only') {
      if (!value.split(',').every((group) => ['reference', 'light', 'dark', 'viz', 'hc'].includes(group))) throw new Error(`Invalid palette groups: ${value}`);
      groups = value.split(',') as PaletteGroup[];
    }
    i += 1;
  }
  const files = generatePaletteFiles(await loadPaletteSeeds(seedPath), groups);
  const drift = await writePaletteFiles(files, outputRoot, check);
  if (drift.length) {
    console.error(`Palette drift (${drift.length} files):\n${drift.join('\n')}`);
    process.exitCode = 1;
  } else console.log(`Palette ${check ? 'check passed' : 'generated'}: ${files.size} files.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  void main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.stack ?? error.message : error);
    process.exitCode = 1;
  });
}
