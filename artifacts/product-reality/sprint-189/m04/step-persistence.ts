import fs from 'node:fs/promises';
import { launchProofBrowser } from '../../../../scripts/product-reality/s184-m06-live-consumers.js';
import { applySteps } from '../../../../scripts/design-loop/observe.js';
const input = JSON.parse(await fs.readFile(new URL('./inputs/after-review-detail.json', import.meta.url), 'utf8'));
const browser = await launchProofBrowser();
const rows = [];
try {
 const page = await browser.newPage({ viewport: { width: 390, height: 1000 }, locale: 'en-US', timezoneId: 'UTC' });
 await page.clock.setFixedTime(new Date('2026-09-08T12:00:00.000Z'));
 await page.goto('http://127.0.0.1:4479', { waitUntil: 'networkidle' });
 for (const step of input.steps) {
  await applySteps(page, [step]);
  rows.push({ step, cycle: await page.locator('[data-oods-component="CycleProgressCard"]').allInnerTexts(), interval: await page.locator('[data-oods-component="BillingIntervalSelector"] select').evaluateAll(es => es.map(e => (e as HTMLSelectElement).value)) });
 }
 await page.close();
} finally { await browser.close(); }
await fs.writeFile(new URL('./step-persistence.json', import.meta.url), JSON.stringify(rows, null, 2));
console.log(JSON.stringify(rows));
