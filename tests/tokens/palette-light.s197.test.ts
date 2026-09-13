import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import Color from 'colorjs.io';
import { loadDtcgTokens } from '../../src/tooling/tokens/dtcg.js';

describe('light palette is neutral where UI structure should recede', () => {
  it('keeps every non-interactive panel, body text and border on the neutral envelope in both brands', async () => {
    for (const brand of ['A', 'B']) {
      const tokens = await loadDtcgTokens(`packages/tokens/src/tokens/brands/${brand}/base.json`);
      const neutral = tokens.filter((token) => /\.(?:surface\.(?:canvas|raised|subtle|disabled|backdrop|inverse)|text\.(?:primary|secondary|muted|inverse|disabled)|border\.(?:subtle|strong))$/.test(token.path.join('.')));
      expect(neutral).toHaveLength(13);
      for (const token of neutral) {
        const [, c, h] = new Color(String(token.value)).to('oklch').coords.map(Number);
        expect(c, token.path.join('.')).toBeLessThanOrEqual(.02001);
        if (c > .0001) expect(h, token.path.join('.')).toBeCloseTo(265, 3);
      }
    }
  });
  it('gives the reference neutral ladder a subtle light end and an interior 600–800 chroma peak', async () => {
    const tokens = await loadDtcgTokens('packages/tokens/src/tokens/base/reference/color.neutral.json');
    const steps = tokens.map(token => ({ step: Number(token.path.at(-1)), c: Number(new Color(String(token.value)).to('oklch').coords[1]) }));
    expect(steps.find(token => token.step === 50)!.c).toBeGreaterThanOrEqual(.0015);
    expect(steps.find(token => token.step === 50)!.c).toBeLessThanOrEqual(.003);
    const peak = [...steps].sort((a, b) => b.c - a.c)[0];
    expect(peak.step).toBeGreaterThanOrEqual(600);
    expect(peak.step).toBeLessThanOrEqual(800);
  });
});

describe('m02 browser and attribution receipts do not claim an unrun golden migration', () => {
  const root = 'artifacts/product-reality/sprint-197/m02';
  it('retains every measured light root and screenshot in both frameworks', async () => {
    for (const framework of ['react', 'vue']) {
      const report = JSON.parse(await readFile(`${root}/${framework}/report.json`, 'utf8'));
      expect(report.status).toBe('passed');
      expect(report.rootCells).toBe(218);
      expect(report.failed).toBe(0);
      expect(report.skipped).toBe(0);
      expect(report.cells.map((cell: { cell: string }) => cell.cell)).toEqual(['A-light', 'B-light']);
      for (const cell of report.cells) {
        const bytes = await readFile(`${root}/${framework}/${cell.screenshot}`);
        expect(createHash('sha256').update(bytes).digest('hex')).toBe(cell.screenshotSha256);
      }
    }
  });
  it('identifies changed token paints by file and keeps all golden hashes unchanged until m05', async () => {
    const report = JSON.parse(await readFile(`${root}/attribution.json`, 'utf8'));
    expect(report.builderSelfCertified).toBe(false);
    expect(report.summary.goldensUpdated).toBe(0);
    expect(report.registryScopes).toHaveLength(42);
    const ids = new Set(report.changedTokens.map((token: { id: string }) => token.id));
    for (const file of report.goldenFiles) {
      expect(file.retainedSha256).toBe(file.beforeSha256);
      for (const paint of file.matches) for (const token of paint.changedTokenIds) expect(ids.has(token)).toBe(true);
    }
  });
});
