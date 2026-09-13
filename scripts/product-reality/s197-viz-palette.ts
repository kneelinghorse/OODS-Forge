// Measure the final shipped scoped palette through certify's own CVD/Role-C oracles.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import Color from 'colorjs.io';
import { getVizScaleTokens, resolveTokenToColor } from '@oods/viz-core';
import { normaliseColor } from '@oods/a11y-tools';
import { evaluateCategoricalRoleA, evaluateCategoricalRoleC } from '../../packages/mcp-server/src/tools/certify-contrast.js';
import { CVD_TYPES, simulateCvd } from '../../packages/mcp-server/src/tools/cvd-machado.js';
import { loadPaletteSeeds } from '../tokens/generate-palette.js';

const seeds = await loadPaletteSeeds();
const scopes = [];
for (const brand of ['A', 'B'] as const) for (const theme of ['light', 'dark'] as const) {
  const scope = { brand, theme };
  const slots = getVizScaleTokens('categorical').map(token => {
    const raw = resolveTokenToColor(token, scope)!;
    assert(raw, token);
    const hex = normaliseColor(raw), [l, c, h] = new Color(hex).to('oklch').coords.map(Number);
    assert(c >= .045, `${brand}/${theme}/${token}: chroma ${c}`);
    const distances = [seeds.brands.A.primary.hue, seeds.brands.B.primaryHue, seeds.brands.A.accent.hue]
      .map(hue => Math.min(Math.abs(h - hue), 360 - Math.abs(h - hue)));
    assert(Math.min(...distances) >= 10, `${brand}/${theme}/${token}: brand/accent hue collision`);
    return { token, raw, hex, l, c, h, brandAccentHueDistance: Math.min(...distances),
      roleC: evaluateCategoricalRoleC([hex], scope) };
  });
  const paints = slots.map(slot => slot.hex);
  const roleA = evaluateCategoricalRoleA(paints);
  const matrices = ['normal', ...CVD_TYPES].map(type => {
    const colors = paints.map(hex => new Color(type === 'normal' ? hex : simulateCvd(hex, type as typeof CVD_TYPES[number])));
    return { vision: type, pairs: colors.flatMap((a, i) => colors.slice(i + 1).map((b, offset) => ({ slots: [i + 1, i + offset + 2], deltaE00: a.deltaE(b, '2000') }))) };
  });
  scopes.push({ ...scope, roleA, slots, matrices });
}
const sourceFiles = ['packages/tokens/src/palette/seeds.json', 'packages/tokens/src/viz-scales.json', ...['A', 'B'].flatMap(brand => ['base', 'dark', 'hc'].map(mode => `packages/tokens/src/tokens/brands/${brand}/${mode}.json`))];
const sources = await Promise.all(sourceFiles.map(async file => ({ file, sha256: createHash('sha256').update(await fs.readFile(file)).digest('hex') })));
await fs.writeFile('artifacts/product-reality/sprint-197/m04/categorical-measurements.json', JSON.stringify({ sources, scopes,
  targetDeltaE00: 12, floorDeltaE00: 10, chromaFloor: .045, roleCThreshold: 3, hueSeparation: 60, builderSelfCertified: false }, null, 2) + '\n');
for (const scope of scopes) {
  assert.equal(scope.roleA.verdict, 'pass'); assert(scope.roleA.minimumDeltaE! >= 12, JSON.stringify(scope.roleA));
  for (const slot of scope.slots) assert.equal(slot.roleC.verdict, 'pass', JSON.stringify(slot));
}
console.log(JSON.stringify({ roleCChecks: scopes.length * 6, failed: 0, roleAMinima: scopes.map(({ brand, theme, roleA }) => ({ brand, theme, minimumDeltaE: roleA.minimumDeltaE })) }));
