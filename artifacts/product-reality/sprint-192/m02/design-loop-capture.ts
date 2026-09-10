import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { render } from '../../../../scripts/design-loop/render.js';
import { applySteps } from '../../../../scripts/design-loop/observe.js';
import { launchProofBrowser } from '../../../../scripts/product-reality/s184-m06-live-consumers.js';

const phase = process.argv[2];
assert(['before', 'after'].includes(phase));
const root = path.resolve('artifacts/product-reality/sprint-192/m02');
const browser = await launchProofBrowser();
const summary: unknown[] = [];
try {
  for (const theme of ['light', 'dark'] as const) for (const context of ['detail', 'workflow'] as const) {
    const name = `${theme}-${context === 'workflow' ? 'workflow-detail' : 'detail'}`;
    const steps = context === 'workflow' ? [{ action: 'click' as const, selector: 'nav[aria-label="Workflow screens"] button:text-is("Detail")' }] : [];
    const input = { compose: { object: 'Subscription', context }, framework: 'both' as const, brand: 'A' as const,
      theme, port: 4497, widths: [390, 820, 1440], output: path.join(root, phase, name), steps };
    const result = await render(input);
    const frameworkViews = [];
    for (const [framework, port] of [['react', 4498], ['vue', 4499]] as const) {
      const receipt = result.receipts.find(row => row.framework === framework)!;
      const page = await browser.newPage({ locale: 'en-US', timezoneId: 'UTC', colorScheme: theme });
      await page.addInitScript('globalThis.__name = (value) => value;');
      await page.clock.setFixedTime(new Date('2026-09-08T12:00:00Z'));
      await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle' });
      if (context === 'workflow') await page.locator('[data-oods-workflow][data-ui-state="success"]').waitFor();
      await applySteps(page, steps, Date.parse('2026-09-08T12:00:00Z'));
      const views = [];
      for (const width of input.widths) {
        await page.setViewportSize({ width, height: 1000 });
        const proof = await page.evaluate(() => {
          const token = document.createElement('span');
          token.style.backgroundColor = 'var(--sys-surface-raised)'; document.body.append(token);
          const expectedBackground = getComputedStyle(token).backgroundColor; token.remove();
          const cards = Array.from(document.querySelectorAll('[data-oods-component="Card"], .oods-card')).filter(node => node.getClientRects().length)
            .map(node => ({ background: getComputedStyle(node).backgroundColor, color: getComputedStyle(node).color }));
          const systemColours = Array.from(document.querySelectorAll('*')).filter(node => node.getClientRects().length).flatMap(node => {
            const style = getComputedStyle(node);
            return ['color', 'background-color', 'border-top-color'].flatMap(property => /^(Canvas|CanvasText|Highlight|HighlightText|GrayText|ButtonFace|ButtonText)$/i.test(style.getPropertyValue(property)) ? [{ element: node.tagName, property }] : []);
          });
          return { expectedBackground, cards, systemColours };
        });
        assert(proof.cards.length > 0, `${name}/${framework}: no Cards observed`);
        if (phase === 'after') for (const card of proof.cards) assert.equal(card.background, proof.expectedBackground, `${name}/${framework}/${width}: Card token`);
        assert.equal(proof.systemColours.length, 0);
        views.push({ width, ...proof });
      }
      const measurement = { phase, name, framework, sourceHead: receipt.sourceHead, artifactContentHash: receipt.artifactContentHash, errors: receipt.errors, views };
      fs.writeFileSync(path.join(input.output, framework, 'card-colours.json'), JSON.stringify(measurement, null, 2) + '\n');
      if (phase === 'after') {
        assert.equal(receipt.errors.length, 0);
        for (const view of receipt.views) assert.equal(view.measurements.overflow.length, 0, `${name}/${framework}/${view.width}: overflow`);
      }
      frameworkViews.push(views);
      summary.push(measurement);
      await page.close();
    }
    assert.deepEqual(frameworkViews[0], frameworkViews[1], `${name}: computed Card parity (empty allowlist)`);
    console.log(`${phase}/${name}: 6 views captured; computed parity matches`);
  }
} finally { await browser.close(); }
fs.writeFileSync(path.join(root, `${phase}-card-summary.json`), JSON.stringify({ phase, cells: summary, parityAllowlist: [], parityDifferences: [] }, null, 2) + '\n');
