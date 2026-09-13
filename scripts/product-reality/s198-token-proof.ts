import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import Color from 'colorjs.io';
import { brandFlatKey, buildBrandContrastRules, evaluateContrastRules, contrastRatio, type FlatTokenMap } from '@oods/a11y-tools';
import { loadCanonicalColorTokens } from '../tokens/canonical-colors.js';
import { loadGuardrails, evaluateGuardrail } from '../tokens/color-guardrails.js';

const root = path.resolve(import.meta.dirname, '../..');
const out = path.join(root, 'artifacts/product-reality/sprint-198/m01');
const base = '2ea59fe9';
const sha = (bytes: string) => createHash('sha256').update(bytes).digest('hex');
const read = async (file: string, before: boolean) => before
  ? execFileSync('git', ['show', `${base}:${path.relative(root, file)}`], { cwd: root, encoding: 'utf8' })
  : fs.readFile(file, 'utf8');
const measurements = [];
for (const before of [true, false]) {
  const sources: Array<{ file: string; sha256: string }> = [];
  const readSource = async (file: string) => {
    const bytes = await read(file, before);
    sources.push({ file: path.relative(root, file), sha256: sha(bytes) });
    return bytes;
  };
  const tokens = await loadCanonicalColorTokens(root, readSource);
  const map = new Map(tokens.map(token => [token.path.join('.'), token]));
  const resolve = (key: string): string => {
    const value = String(map.get(key)?.value);
    return value.startsWith('{') ? resolve(value.slice(1, -1)) : value;
  };
  const hex = (key: string) => new Color(resolve(key)).to('srgb').toString({ format: 'hex' });
  const pairs = [
    ['sys.status.accent.text', 'sys.status.accent.surface', 4.5],
    ['sys.status.accent.icon', 'sys.status.accent.surface', 3],
    ['sys.text.on-interactive', 'sys.surface.interactive.primary.default', 4.5],
  ] as const;
  const system = pairs.map(([foreground, background, threshold]) => {
    const ratio = contrastRatio(hex(foreground), hex(background));
    return { foreground, background, threshold, ratio, passed: ratio >= threshold };
  });
  const relative = (await loadGuardrails(path.join(root, 'tools/a11y/guardrails/relative-color.csv')))
    .filter(rule => rule.checkType === 'relative-color').map(rule => evaluateGuardrail(rule, map));
  const grid = [];
  for (const brand of ['A', 'B']) for (const theme of ['base', 'dark']) {
    const doc = JSON.parse(await readSource(path.join(root, `packages/tokens/src/tokens/brands/${brand}/${theme}.json`)));
    const flat: FlatTokenMap = {};
    const walk = (node: any, trail: string[] = []) => {
      if (!node || typeof node !== 'object') return;
      if ('$value' in node) { flat[brandFlatKey(brand, trail.join('.').replace(/^color\.brand\.[AB]\./, ''))] = { value: node.$value }; return; }
      for (const [key, child] of Object.entries(node)) walk(child, [...trail, key]);
    };
    walk(doc);
    grid.push(...evaluateContrastRules(flat, { rules: buildBrandContrastRules(brand, theme as 'base' | 'dark') }));
  }
  measurements.push({ phase: before ? 'before' : 'after', sources, system, relative, grid });
}
await fs.writeFile(path.join(out, 'token-measurements.json'), JSON.stringify({ beforeHead: base, measurements, builderSelfCertified: false }, null, 2) + '\n');
const after = measurements[1];
if (after.grid.length !== 228 || after.grid.some(row => !row.passed) || after.system.some(row => !row.passed) || after.relative.some(row => row.failures.length)) throw new Error('Source token proof failed; inspect token-measurements.json');
console.log(JSON.stringify({ sourcePairs: after.grid.length, system: after.system, relative: after.relative.map(row => ({ id: row.spec.id, deltaL: row.deltaL, deltaC: row.deltaC, contrast: row.contrastRatio })) }));
