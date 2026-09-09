import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import { validateReceipt, digest } from '../../../../scripts/design-loop/common.js';
const rows = [];
for (const screen of ['archived', 'active-detail']) for (const framework of ['react', 'vue']) {
 const directory = new URL(`./after/${screen}/${framework}/`, import.meta.url);
 const receipt = JSON.parse(await fs.readFile(new URL('receipt.json', directory), 'utf8'));
 await validateReceipt(receipt); assert.deepEqual(receipt.errors, []);
 for (const view of receipt.views) {
  assert.equal(digest(await fs.readFile(new URL(view.screenshot, directory))), view.screenshotHash);
  assert.equal(view.measurements.documentWidth, view.width);
  if (screen === 'archived') { assert.match(view.visibleText, /\b1 record\b/); assert.doesNotMatch(view.visibleText, /1 records/); assert.ok(!view.measurements.glyphWraps.some((entry: any) => entry.text === 'Archived')); }
  if (screen === 'active-detail') { const cycle = view.regions.find((region: any) => region.component === 'CycleProgressCard'); assert.match(cycle.text, /23% complete/); assert.doesNotMatch(cycle.text, /100%|0 days remaining/); }
 }
 rows.push({ screen, framework, head: receipt.sourceHead, artifactHash: receipt.artifactContentHash, screenshots: receipt.views.length });
}
// The public workflow artifact from the active-detail capture remains mounted.
const browser = await chromium.launch({ headless: true });
const layout = [];
try {
 for (const [framework, port] of [['react', 4478], ['vue', 4479]] as const) {
  const page = await browser.newPage({ viewport: { width: 390, height: 1000 } });
  await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle' });
  await page.getByRole('tab', { name: 'Archived', exact: true }).click();
  const sizes = await page.locator('[data-oods-component="ArchivedRowOverlay"][data-archived="true"]').evaluate(element => {
   const box = element.getBoundingClientRect();
   const label = element.querySelector('.oods-collection-row > :first-child')!.getBoundingClientRect();
   const badge = element.querySelector('.oods-archive-badge')!;
   const badgeStyle = getComputedStyle(badge);
   return { rowWidth: box.width, labelWidth: label.width, badgeWidth: badge.getBoundingClientRect().width, whiteSpace: badgeStyle.whiteSpace };
  });
  assert.equal(sizes.whiteSpace, 'nowrap'); assert.ok(sizes.labelWidth >= sizes.rowWidth / 2, JSON.stringify(sizes));
  layout.push({ framework, ...sizes }); await page.close();
 }
} finally { await browser.close(); }
await fs.writeFile(new URL('./browser-verification.json', import.meta.url), JSON.stringify({ status: 'passed', rows, layout }, null, 2) + '\n');
console.log(JSON.stringify({ status: 'passed', rows: rows.length, layout }));
