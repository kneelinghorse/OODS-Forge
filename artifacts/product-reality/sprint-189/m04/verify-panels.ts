import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';
// The persistent consumers currently mount the unmodified public workflow artifact.
const browser = await chromium.launch({ headless: true });
const rows = [];
try {
  for (const [framework, port] of [['react', 4478], ['vue', 4479]] as const) {
    const page = await browser.newPage({ viewport: { width: 390, height: 1000 } });
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle' });
    await page.locator('[data-oods-collection="rows"] [data-record-id="subscription-003"]').click();
    await page.locator('[data-screen="detail"][data-ui-state="success"]').waitFor();
    assert.equal(await page.getByRole('textbox').count(), 0);
    assert.equal(await page.getByRole('checkbox').count(), 0);
    const labels = await page.getByRole('tab').allTextContents();
    const panels = [];
    for (const label of labels) {
      await page.getByRole('tab', { name: label, exact: true }).click();
      const text = (await page.getByRole('tabpanel').innerText()).trim();
      assert.ok(text.length > 0);
      panels.push({ label, text });
    }
    await page.locator('[data-oods-action="handleEdit"]').click();
    await page.locator('[data-screen="form"][data-ui-state="success"]').waitFor();
    assert.equal(await page.locator('form').count(), 1);
    assert.equal(await page.locator('form form').count(), 0);
    assert.equal(await page.locator('fieldset[data-oods-component="CancellationForm"]').count(), 1);
    rows.push({ framework, panels, nativeForms: 1, nestedForms: 0 });
    await page.close();
  }
} finally { await browser.close(); }
await fs.writeFile(new URL('./panel-verification.json', import.meta.url), JSON.stringify({ status: 'passed', rows }, null, 2) + '\n');
console.log('Both frameworks: every detail panel contains visible content; one native form and no nested form.');
