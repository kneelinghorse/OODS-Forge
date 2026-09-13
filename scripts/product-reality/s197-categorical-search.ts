// Bounded deterministic tuning of six fixed, evenly spaced hue slots. This
// writes candidate parameters only; the palette generator owns all token files.
import fs from 'node:fs/promises';
import Color from 'colorjs.io';
import { paletteColor } from '../tokens/generate-palette.js';
import { CVD_TYPES, simulateCvd } from '../../packages/mcp-server/src/tools/cvd-machado.js';
import { contrastRatio, normaliseColor } from '@oods/a11y-tools';

let state = 197;
function random() { state |= 0; state = state + 0x6D2B79F5 | 0; let t = Math.imul(state ^ state >>> 15, 1 | state); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
const hueOffset = 17.5;
const results = [];
for (const theme of ['light', 'dark'] as const) {
  const canvas = normaliseColor(theme === 'light' ? 'oklch(.985 .002327 265)' : 'oklch(.18 .008 265)', `${theme}.canvas`);
  let id = 0;
  const pools = Array.from({ length: 6 }, (_, slot) => {
    const found = new Map();
    for (let li = theme === 'light' ? 24 : 47; li <= (theme === 'light' ? 68 : 96); li += 1) {
      for (let ci = 5; ci <= 26; ci += 2) {
        const l = li / 100, chromaPeak = ci / 100, hue = (hueOffset + slot * 60) % 360;
        const value = paletteColor(l, chromaPeak, hue);
        const hex = normaliseColor(value, `${theme}.categorical.${slot + 1}`);
        const chroma = Number(new Color(hex).to('oklch').coords[1]);
        const ratio = contrastRatio(hex, canvas);
        if (chroma < .045 || ratio < 3.05) continue;
        if (!found.has(hex)) found.set(hex, { id: id++, l, chromaPeak, hue, value, hex, ratio,
          colors: [hex, ...CVD_TYPES.map(type => simulateCvd(hex, type))].map(color => new Color(color).to('lab')) });
      }
    }
    return [...found.values()];
  });
  const distances = new Map<string, number>();
  const distance = (a: any, b: any) => {
    const key = a.id < b.id ? `${a.id}:${b.id}` : `${b.id}:${a.id}`;
    if (!distances.has(key)) distances.set(key, Math.min(...a.colors.map((color: Color, index: number) => color.deltaE(b.colors[index], '2000'))));
    return distances.get(key)!;
  };
  const score = (palette: any[]) => {
    const pairs = palette.flatMap((a, i) => palette.slice(i + 1).map(b => distance(a, b)));
    return Math.min(...pairs) + pairs.reduce((a, b) => a + b, 0) / pairs.length * .0001;
  };
  let best: any[] = [], bestScore = 0;
  const attempts = [];
  for (let restart = 0; restart < 24; restart += 1) {
    let current = pools.map(pool => pool[Math.floor(random() * pool.length)]), currentScore = score(current);
    for (let step = 0; step < 1200; step += 1) {
      const slot = Math.floor(random() * 6), candidate = [...current];
      candidate[slot] = pools[slot][Math.floor(random() * pools[slot].length)];
      const nextScore = score(candidate), temperature = .9 * (1 - step / 1200) ** 2 + .015;
      if (nextScore > currentScore || random() < Math.exp((nextScore - currentScore) / temperature)) { current = candidate; currentScore = nextScore; }
      if (currentScore > bestScore) { best = [...current]; bestScore = currentScore; }
    }
    attempts.push({ restart, minimumDeltaE: Math.min(...best.flatMap((a, i) => best.slice(i + 1).map(b => distance(a, b)))) });
    console.log(theme, restart, attempts.at(-1)!.minimumDeltaE.toFixed(6));
    if (attempts.at(-1)!.minimumDeltaE >= 12.1) break;
  }
  const palette = best.map(({ colors, id, ...candidate }) => candidate);
  results.push({ theme, hueOffset, candidateCounts: pools.map(pool => pool.length), attempts, palette,
    pairs: best.flatMap((a, i) => best.slice(i + 1).map((b, offset) => ({ slots: [i + 1, i + offset + 2], deltaE: distance(a, b) }))) });
}
await fs.writeFile('artifacts/product-reality/sprint-197/m04/development/categorical-search.json', JSON.stringify({ seed: 197, constraints: { hueStep: 60, minimumChroma: .045, minimumCanvasRatio: 3.05, targetDeltaE: 12.1 }, results }, null, 2) + '\n');
