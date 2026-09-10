import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { resolveTokenToColor } from '@oods/viz-core';
import { toHex } from '../../../../packages/viz-core/src/tokens/categorical-palette.js';
import { launchProofBrowser } from '../../../../scripts/product-reality/s184-m06-live-consumers.js';
import { applySteps, observeGraphicsAccessibility } from '../../../../scripts/design-loop/observe.js';

const theme = process.argv[2] as 'light' | 'dark';
assert(['light', 'dark'].includes(theme));
const directory = new URL(`./${process.argv.includes('--final') ? 'final/' : process.argv.includes('--corrective') ? 'corrective/' : ''}after/${theme}/`, import.meta.url);
const input = JSON.parse(await fs.readFile(new URL(`./inputs/final-${theme}.json`, import.meta.url), 'utf8'));
const browser = await launchProofBrowser();
const rows: Array<Record<string, any>> = [];
try {
  for (const [framework, port] of [['react', 4478], ['vue', 4479]] as const) {
    const receipt = JSON.parse(await fs.readFile(new URL(`${framework}/receipt.json`, directory), 'utf8'));
    assert.deepEqual(receipt.errors, []);
    assert.equal(receipt.compose.preferences.theme, theme);
    const page = await browser.newPage({ viewport: { width: 390, height: 1000 }, locale: 'en-US', timezoneId: 'UTC' });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.clock.setFixedTime(new Date('2026-09-08T12:00:00Z'));
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle' });
    await page.locator('[data-oods-workflow][data-ui-state="success"]').waitFor();
    await applySteps(page, input.steps, Date.parse('2026-09-08T12:00:00Z'));
    for (const width of [390, 820, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const view = receipt.views.find((value: any) => value.width === width)!;
      assert.deepEqual(view.measurements.overflow, []);
      assert(view.accessibility.includes('img "Payment amounts"'));
      assert(view.accessibility.includes('graphics-object'));
      const observation = await page.locator('figure[data-viz-rendered="true"]').evaluate(figure => {
        const chart = figure.querySelector('svg')!;
        const timeline = document.querySelector('[data-oods-component="StatusTimeline"]')!;
        return {
          figure: { tag: figure.tagName, role: figure.getAttribute('role'), name: figure.getAttribute('aria-label') },
          visibleText: (document.body.innerText || '').replace(/\s+/g, ' ').trim(),
          figureText: (figure.textContent || '').replace(/\s+/g, ' ').trim(),
          canvas: chart.querySelector('rect')!.getAttribute('fill'),
          svgRoles: Array.from(chart.querySelectorAll('[role]')).map(node => ({ role: node.getAttribute('role'), name: node.getAttribute('aria-label') })),
          chartAboveTimeline: figure.getBoundingClientRect().bottom <= timeline.getBoundingClientRect().top,
          fits: figure.getBoundingClientRect().right <= innerWidth && chart.getBoundingClientRect().right <= innerWidth,
          styles: Object.fromEntries([figure, figure.querySelector('figcaption')!, chart, figure.querySelector('[data-viz-description]')!].map((element, index) => [index, Object.fromEntries(['display', 'width', 'height', 'font-family', 'font-size', 'font-weight', 'color', 'background-color', 'margin', 'padding', 'border-width'].map(key => [key, getComputedStyle(element).getPropertyValue(key)]))])),
        };
      });
      assert.deepEqual(observation.figure, { tag: 'FIGURE', role: 'img', name: 'Payment amounts' });
      assert(observation.chartAboveTimeline && observation.fits);
      assert.equal(observation.canvas?.toLowerCase(), toHex(resolveTokenToColor('--sys-surface-canvas', { theme, brand: 'A' })!)!.toLowerCase());
      const accessibility = await observeGraphicsAccessibility(page);
      assert(accessibility.includes('graphics-object'));
      rows.push({ framework, width, theme, schemaHash: receipt.schemaHash, artifactContentHash: receipt.artifactContentHash, observation, accessibility });
    }
    assert.deepEqual(errors, []);
    await page.close();
  }
  const comparisons = [390, 820, 1440].map(width => {
    const react = rows.find(row => row.framework === 'react' && row.width === width)!;
    const vue = rows.find(row => row.framework === 'vue' && row.width === width)!;
    assert.deepEqual(react.observation, vue.observation);
    assert.equal(react.accessibility, vue.accessibility);
    return { width, differences: [] };
  });
  await fs.writeFile(new URL('browser-comparison.json', directory), JSON.stringify({ allowlist: [], rows, comparisons }, null, 2) + '\n');
  console.log(JSON.stringify({ theme, observations: rows.length, comparisons: comparisons.length, differences: 0 }));
} finally { await browser.close(); }
