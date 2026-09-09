import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';
// Run after the public workflow input is rendered into the persistent consumers.
const browser = await chromium.launch({ headless: true });
const rows = [];
try {
  for (const [framework, port] of [['react', 4478], ['vue', 4479]] as const) {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle' });
    await page.locator('[data-screen="list"][data-ui-state="success"]').waitFor();
    const wrappers = await page.locator('[data-oods-collection="rows"] [data-oods-component="ArchivedRowOverlay"]').evaluateAll(nodes => nodes.map(node => ({
      display: getComputedStyle(node).display,
      record: node.querySelector('[data-record-id]')?.getAttribute('data-record-id'),
      visibleChildren: Array.from(node.children).some(child => child.getClientRects().length > 0),
    })));
    assert.equal(wrappers.length, 9);
    assert.ok(wrappers.every(row => row.display === 'contents' && row.record && row.visibleChildren));
    rows.push({ framework, wrappers });
    await page.close();
  }
} finally { await browser.close(); }
await fs.writeFile(new URL('./wrapper-verification.json', import.meta.url), JSON.stringify({ status: 'passed', rows }, null, 2) + '\n');
console.log('Both frameworks: nine structural archive wrappers around visible records.');
