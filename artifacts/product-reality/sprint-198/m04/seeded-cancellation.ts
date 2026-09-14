import fs from 'node:fs/promises';
import path from 'node:path';
import { render } from '../../../../scripts/design-loop/render.js';
import { observeView } from '../../../../scripts/design-loop/observe.js';
import { launchProofBrowser } from '../../../../scripts/product-reality/s184-m06-live-consumers.js';
const root = path.resolve('artifacts/product-reality/sprint-198/m04/after/Subscription/seeded-cancellation');
await render({ compose: { object: 'Subscription', context: 'workflow' }, framework: 'both', theme: 'light', brand: 'A', widths: [390], output: path.join(root, 'mount'), port: 4577 });
const browser = await launchProofBrowser();
try {
  for (const [framework, port] of [['react', 4578], ['vue', 4579]] as const) {
    const page = await browser.newPage({ locale: 'en-US', timezoneId: 'UTC' });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.addInitScript('globalThis.__name = (value) => value;');
    let time = Date.parse('2026-09-08T12:00:00Z');
    await page.clock.setFixedTime(new Date(time));
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle' });
    for (const selector of ['[data-oods-collection="rows"] [data-record-id="subscription-005"]', 'nav[aria-label="Workflow screens"] button:text-is("Edit")']) {
      await page.clock.setFixedTime(new Date(++time)); await page.locator(selector).click(); await page.locator('[data-oods-workflow][data-ui-state="success"]').waitFor();
    }
    const output = path.join(root, framework); await fs.mkdir(output, { recursive: true });
    const views = [];
    for (const width of [390, 820, 1440]) {
      const view = await observeView(page, width, output);
      const controls = await page.evaluate(() => [...document.querySelectorAll('input')].filter(node => node.getClientRects().length).map(node => {
        const label = node.labels?.[0]; const box = node.getBoundingClientRect(); const text = label?.querySelector('.oods-field-label')?.getBoundingClientRect();
        return { type: node.type, value: node.value, checked: node.checked, label: label?.textContent?.trim(), checkboxLabelCenterDelta: node.type === 'checkbox' && text ? Math.abs((box.top + box.bottom - text.top - text.bottom) / 2) : null };
      }));
      views.push({ ...view, controls });
    }
    await fs.writeFile(path.join(output, 'proof.json'), JSON.stringify({ object: 'Subscription', recordId: 'subscription-005', framework, errors, views }, null, 2) + '\n');
    await page.close();
  }
} finally { await browser.close(); }
