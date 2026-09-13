import fs from 'node:fs/promises';
import path from 'node:path';
import { render } from '../../../../scripts/design-loop/render.js';
import { observeView } from '../../../../scripts/design-loop/observe.js';
import { launchProofBrowser } from '../../../../scripts/product-reality/s184-m06-live-consumers.js';
const phase = process.argv[2];
if (!['before', 'after'].includes(phase)) throw new Error('Expected before or after');
const root = path.resolve('artifacts/product-reality/sprint-198/m03', phase);
const browser = await launchProofBrowser();
try {
  for (const object of ['Organization', 'User', 'Subscription', 'Invoice', 'Plan']) {
    await render({ compose: { object, context: 'workflow' }, framework: 'both', theme: 'light', brand: 'A', widths: [390], output: path.join(root, object, 'mount'), port: 4577 });
    for (const [framework, port] of [['react', 4578], ['vue', 4579]] as const) {
      const page = await browser.newPage({ locale: 'en-US', timezoneId: 'UTC' });
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript('globalThis.__name = (value) => value;');
      let time = Date.parse('2026-09-08T12:00:00Z');
      const click = async (selector: string) => { await page.clock.setFixedTime(new Date(++time)); await page.locator(selector).click(); await page.locator('[data-oods-workflow][data-ui-state="success"]').waitFor(); };
      await page.clock.setFixedTime(new Date(time));
      await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle' });
      await click(`[data-oods-collection="rows"] [data-record-id="${object.toLowerCase()}-003"]`);
      const views = [];
      for (const context of ['detail', 'timeline']) {
        await click(`nav[aria-label="Workflow screens"] button:text-is("${context[0].toUpperCase() + context.slice(1)}")`);
        for (const theme of ['light', 'dark']) {
          await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
          const tabCount = await page.locator('[role="tab"]').count();
          for (let tab = 0; tab < Math.max(1, tabCount); tab++) {
            if (tabCount) { await page.clock.setFixedTime(new Date(++time)); await page.locator('[role="tab"]').nth(tab).click(); }
            const output = path.join(root, object, framework, context, theme, String(tab));
            await fs.mkdir(output, { recursive: true });
            for (const width of [390, 820, 1440]) {
              const view = await observeView(page, width, output);
              const craft = await page.evaluate(() => {
                const visible = (node: Element) => node.getClientRects().length > 0 && getComputedStyle(node).visibility !== 'hidden';
                return { tabs: [...document.querySelectorAll('[role="tab"]')].map(node => ({ text: node.textContent, selected: node.getAttribute('aria-selected') })),
                  headings: [...document.querySelectorAll('h1,h2,h3')].filter(visible).map(node => node.textContent),
                  surfaces: [...document.querySelectorAll('[data-oods-component="Card"],[data-oods-component="Tabs"],[data-oods-component$="Summary"]')].filter(visible).map(node => { const style = getComputedStyle(node); return { component: node.getAttribute('data-oods-component'), text: (node as HTMLElement).innerText, background: style.backgroundColor, color: style.color, border: style.borderColor }; }),
                  emptyCards: [...document.querySelectorAll('[data-oods-component="Card"]')].filter(visible).filter(node => !(node as HTMLElement).innerText.trim() && !node.querySelector('svg,img,input')).length,
                  editable: [...document.querySelectorAll('input:not([readonly]):not([disabled]),select:not([disabled]),textarea:not([readonly]):not([disabled])')].filter(visible).map(node => ({ component: node.closest('[data-oods-component]')?.getAttribute('data-oods-component'), html: node.outerHTML })) };
              });
              views.push({ context, theme, tab, output: path.relative(root, output), ...view, craft });
            }
          }
        }
      }
      await fs.writeFile(path.join(root, object, framework, 'craft.json'), JSON.stringify({ phase, object, framework, errors, views }, null, 2) + '\n');
      console.log(phase, object, framework, views.length, errors);
      await page.close();
    }
  }
} finally { await browser.close(); }
