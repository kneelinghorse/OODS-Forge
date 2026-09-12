// Prepared only. Run after root releases the local runtime mutation window.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
const root = process.argv[2] ?? '/Users/systemsystems/.codex/worktrees/s195/OODS-Forge';
const { normaliseColor, contrastRatio } = await import(pathToFileURL(path.join(root, 'packages/a11y-tools/dist/index.js')));
const brands = ['A', 'B'];
const load = (brand, theme) => {
  const file = `packages/tokens/src/tokens/brands/${brand}/${theme}.json`;
  const bytes = fs.readFileSync(path.join(root, file));
  return { file, sha256: crypto.createHash('sha256').update(bytes).digest('hex'), doc: JSON.parse(bytes) };
};
const claims = [];
for (const foregroundBrand of brands) {
  for (const [theme, slot] of [['base', '05'], ['dark', '04']]) {
    const source = load(foregroundBrand, theme);
    const leaf = source.doc.viz.scale.categorical[slot];
    const token = `viz.scale.categorical.${slot}`;
    assert.match(leaf.$description, /Role-C >=3:1 on both brand canvases/);
    const foregroundHex = normaliseColor(leaf.$value, token);
    const backgrounds = brands.map(backgroundBrand => {
      const target = load(backgroundBrand, theme);
      const raw = target.doc.color.brand[backgroundBrand].surface.canvas.$value;
      const backgroundHex = normaliseColor(raw, 'surface.canvas');
      const ratio = contrastRatio(foregroundHex, backgroundHex);
      assert(ratio >= 3, `${foregroundBrand}/${theme} ${token} on ${backgroundBrand}: ${ratio}`);
      return { brand: backgroundBrand, source: target.file, sourceSha256: target.sha256, value: raw, hex: backgroundHex, ratio, meetsClaim: true };
    });
    claims.push({ brand: foregroundBrand, theme, token, source: source.file, sourceSha256: source.sha256, value: leaf.$value, description: leaf.$description, foregroundHex, backgrounds });
  }
}
assert.equal(claims.length, 4);
console.log(JSON.stringify({ status: 'passed', evaluator: '@oods/a11y-tools normaliseColor -> contrastRatio (same path as guard)', claimsMeasured: 4, canvasPairsMeasured: 8, requiredRatio: 3, claims }, null, 2));
