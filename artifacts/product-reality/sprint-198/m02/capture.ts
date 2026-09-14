import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
import { render } from '../../../../scripts/design-loop/render.js';
import { launchProofBrowser } from '../../../../scripts/product-reality/s184-m06-live-consumers.js';
const phase = process.argv[2];
if (!['before', 'after'].includes(phase)) throw new Error('Expected before or after');
const root = path.resolve('artifacts/product-reality/sprint-198/m02', phase);
const browser = await launchProofBrowser();
try {
  for (const object of (phase === 'before' ? ['Organization', 'User', 'Subscription'] : ['Organization', 'User', 'Subscription', 'Invoice', 'Plan'])) {
    const output = path.join(root, object);
    const result = await render({ compose: { object, context: 'list' }, framework: 'both', theme: 'light', brand: 'A', widths: [390, 820, 1440], output, port: 4577 });
    for (const [framework, port] of [['react', 4578], ['vue', 4579]] as const) {
      const page = await browser.newPage({ locale: 'en-US', timezoneId: 'UTC' });
      await page.addInitScript('globalThis.__name = (value) => value;');
      await page.clock.setFixedTime(new Date('2026-09-08T12:00:00Z'));
      await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle' });
      const views = [];
      for (const width of [390, 820, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        views.push(await page.evaluate(() => {
          const visible = (node: Element) => node.getClientRects().length > 0 && getComputedStyle(node).visibility !== 'hidden';
          const box = (node: Element) => { const rect = node.getBoundingClientRect(); return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }; };
          return { width: innerWidth, searchCount: [...document.querySelectorAll('input[type="search"]')].filter(visible).length,
            rows: [...document.querySelectorAll('.oods-collection-row')].filter(visible).map(node => ({ id: node.getAttribute('data-record-id'), text: (node as HTMLElement).innerText })),
            selects: [...document.querySelectorAll('select')].filter(visible).map(node => { const css = getComputedStyle(node); const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d')!; ctx.font = css.font; const label = node.selectedOptions[0]?.text ?? ''; return { id: node.id, label, box: box(node), neededTextWidth: ctx.measureText(label).width + parseFloat(css.paddingLeft) + parseFloat(css.paddingRight) + 24 }; }),
            pills: [...document.querySelectorAll('[data-oods-component="StatusBadge"]')].filter(visible).map(node => ({ text: node.textContent, box: box(node) })),
            pagination: [...document.querySelectorAll('[data-oods-component="PaginationBar"]')].filter(visible).map(node => ({ text: (node as HTMLElement).innerText, items: [...node.querySelectorAll('li')].map(li => ({ text: li.textContent, style: getComputedStyle(li).listStyleType })) })),
            screenActions: [...document.querySelectorAll('[data-oods-screen-actions] button')].filter(visible).map(node => node.textContent) };
        }));
      }
      const interactions = [];
      if (phase === 'after') {
        await page.evaluate(() => { (window as any).__listActions = []; window.addEventListener('oods-design-loop-action', (event: any) => (window as any).__listActions.push(event.detail)); });
        await page.clock.setFixedTime(new Date('2026-09-08T12:00:01Z'));
        await page.locator('input[type="search"]').fill('team');
        await page.clock.setFixedTime(new Date('2026-09-08T12:00:02Z'));
        await page.getByLabel('Sort', { exact: true }).selectOption('desc');
        const status = page.getByLabel('Status', { exact: true });
        if (await status.count()) {
          const choice = await status.locator('option').evaluateAll(options => options.map(option => (option as HTMLOptionElement).value).find(Boolean));
          assert(choice, 'Status must offer a real choice');
          await page.clock.setFixedTime(new Date('2026-09-08T12:00:03Z'));
          await status.selectOption(choice!);
        }
        const firstRow = page.locator('.oods-collection-row').first();
        const id = await firstRow.getAttribute('data-record-id');
        await page.clock.setFixedTime(new Date('2026-09-08T12:00:04Z'));
        await firstRow.click();
        interactions.push(...await page.evaluate(() => (window as any).__listActions));
        assert(interactions.some(action => action.name === 'handleFilter' && action.args[0].search === 'team'));
        assert(interactions.some(action => action.name === 'handleSort'));
        assert(interactions.some(action => action.name === 'handleRowClick' && action.args[0] === id));
      }
      await fs.writeFile(path.join(output, framework, 'craft.json'), JSON.stringify({ phase, object, framework, views, interactions }, null, 2) + '\n');
      await page.close();
    }
    console.log(phase, object, result.receipts.map((row: any) => ({ framework: row.framework, errors: row.errors, overflow: row.views.map((view: any) => ({ width: view.width, count: view.measurements.overflow.length })) })));
  }
} finally { await browser.close(); }
