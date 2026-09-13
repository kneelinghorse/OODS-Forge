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
  retainedViz: { base: Record<string, unknown>; dark: Record<string, unknown> };
}
type TokenTree = { [key: string]: unknown };
export type PaletteGroup = 'reference' | 'light' | 'dark';
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

function leaf(value: string, name: string) {
  return {
    $type: 'color', $value: value,
    $description: `${name}; generated from palette/seeds.json by generate-palette.ts.`,
    $extensions: { ods: { fallback: new Color(value).to('srgb').toString({ format: 'hex', collapse: false }).toUpperCase() } },
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
  for (const [step, l] of steps) setColor(tree, `ref.color.${family}.${step}`, tone(seed, l));
  if (family === 'neutral') setColor(tree, 'ref.color.neutral.0', paletteColor(1, 0, seed.hue));
}

function brandTree(brand: 'A' | 'B', seed: BrandSeed, dark: boolean, retainedViz: TokenTree): TokenTree {
  const tree: TokenTree = { $schema: 'https://design-tokens.org/dtcg/schema.json' };
  const put = (role: string, value: string) => setColor(tree, `color.brand.${brand}.${role}`, value);
  const neutral = (l: number) => dark
    ? paletteColor(l, seed.dark.canvasChroma, seed.neutral.hue) : tone(seed.neutral, l);
  const canvas = seed.dark.canvasLightness;
  const elevation = seed.dark.elevationDelta;
  const surfaces: Record<string, number> = dark
    ? { canvas, raised: canvas + elevation, subtle: canvas + elevation * 2,
      disabled: canvas + elevation * 3, backdrop: canvas - elevation, inverse: .96 }
    : { canvas: .985, raised: 1, subtle: .95, disabled: .93, backdrop: .2, inverse: .23 };
  for (const [role, l] of Object.entries(surfaces)) put(`surface.${role}`, neutral(l));
  for (const [state, l] of Object.entries(dark
    ? { default: .52, hover: .54, pressed: .56 } : { default: .52, hover: .47, pressed: .42 })) {
    put(`surface.interactive.primary.${state}`, tone(seed.primary, l, dark ? seed.dark.accentChromaScale : 1));
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

/** Pure derivation. No generated file is used as input, including its metadata. */
export function generatePaletteFiles(seeds: PaletteSeeds, groups: readonly PaletteGroup[] = ['reference', 'light', 'dark']): Map<string, string> {
  const files = new Map<string, string>();
  const emit = (name: string, tree: TokenTree) => files.set(`${TOKEN_ROOT}/${name}`, `${JSON.stringify(tree, null, 2)}\n`);
  const a = seeds.brands.A;
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
      if (!groups.includes(mode === 'base' ? 'light' : 'dark')) continue;
      emit(`brands/${brand}/${mode}.json`, brandTree(brand, seed, mode === 'dark', seeds.retainedViz[mode]));
    }
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
  let groups: PaletteGroup[] = ['reference', 'light', 'dark'];
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--check') { check = true; continue; }
    if (!['--seeds', '--out', '--only'].includes(args[i])) throw new Error(`Unknown option: ${args[i]}`);
    const value = args[i + 1];
    if (!value || value.startsWith('--')) throw new Error(`Expected value after ${args[i]}`);
    if (args[i] === '--seeds') seedPath = path.resolve(value);
    if (args[i] === '--out') outputRoot = path.resolve(value);
    if (args[i] === '--only') {
      if (!value.split(',').every((group) => ['reference', 'light', 'dark'].includes(group))) throw new Error(`Invalid palette groups: ${value}`);
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
