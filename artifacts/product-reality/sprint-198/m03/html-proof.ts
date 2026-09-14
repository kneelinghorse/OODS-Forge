import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { handle as compose } from '../../../../packages/mcp-server/src/tools/design.compose.js';
import { handle as generate } from '../../../../packages/mcp-server/src/tools/code.generate.js';
import { observeView } from '../../../../scripts/design-loop/observe.js';
import { launchProofBrowser } from '../../../../scripts/product-reality/s184-m06-live-consumers.js';
const output = path.resolve('artifacts/product-reality/sprint-198/m03/html');
await fs.mkdir(output, { recursive: true });
const limits = [];
for (const object of ['Invoice', 'Usage']) {
  const { schema } = await compose({ object, context: 'detail' });
  const result = await generate({ schema, framework: 'html', profile: 'build' });
  assert.equal(result.status, 'error');
  assert(result.errors?.every(error => error.code === 'OODS-V007' && error.message.includes('static output would discard executable behavior')));
  await fs.writeFile(path.join(output, `${object}.json`), JSON.stringify({ schema, result }, null, 2) + '\n');
  limits.push({ object, owner: 'Forge code-generation maintainers', code: 'OODS-V007', reason: 'No static HTML runtime for domain actions', errors: result.errors });
}
const browser = await launchProofBrowser();
const views = [];
try {
  for (const theme of ['light', 'dark'] as const) {
    const schema = { version: '2026.02', screens: [{ id: 'tabs', component: 'Tabs', props: { ariaLabel: 'Record details' }, children: [
      { id: 'identity', component: 'Stack', props: { label: 'Identity' }, layout: { type: 'stack' as const, gapToken: 'stack-default' }, children: [{ id: 'contact', component: 'Text', props: { content: 'Invoice contact' } }] },
      { id: 'billing', component: 'Card', props: { label: 'Billing' }, children: [{ id: 'price', component: 'BillingSummaryBadge', props: { amount: 1999, currency: 'usd', minorUnits: 100, showInterval: false } }] },
    ] }] };
    const result = await generate({ schema, framework: 'html', profile: 'build', options: { theme, brand: 'A' } });
    assert.equal(result.status, 'ok', JSON.stringify(result.errors));
    await fs.writeFile(path.join(output, `${theme}.html`), result.code);
    const page = await browser.newPage({ locale: 'en-US', timezoneId: 'UTC' });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript('globalThis.__name = (value) => value;');
    await page.goto(`file://${path.join(output, `${theme}.html`)}`);
    for (const width of [390, 820, 1440]) {
      await page.getByRole('tab', { name: 'Identity' }).click();
      assert.equal(await page.getByRole('tabpanel').innerText(), 'Invoice contact');
      await page.keyboard.press('ArrowRight');
      assert.equal(await page.getByRole('tab', { name: 'Billing' }).getAttribute('aria-selected'), 'true');
      assert.equal(await page.getByRole('tabpanel').innerText(), '$19.99');
      const folder = path.join(output, theme); await fs.mkdir(folder, { recursive: true });
      views.push({ theme, ...await observeView(page, width, folder) });
      await page.keyboard.press('Home');
      assert.equal(await page.getByRole('tab', { name: 'Identity' }).getAttribute('aria-selected'), 'true');
    }
    assert.deepEqual(errors, []); await page.close();
  }
} finally { await browser.close(); }
await fs.writeFile(path.join(output, 'proof.json'), JSON.stringify({ sourceHead: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), builderSelfCertified: false, limits, views }, null, 2) + '\n');
console.log('HTML panel keyboard/content proof passed; full application-action refusals remain typed and owned.');
