import fs from 'node:fs/promises';
import path from 'node:path';
import { render } from '../../../../scripts/design-loop/render.js';
import { observeView } from '../../../../scripts/design-loop/observe.js';
import { launchProofBrowser } from '../../../../scripts/product-reality/s184-m06-live-consumers.js';
const phase = process.argv[2];
if (!['before', 'after'].includes(phase)) throw new Error('Expected before or after');
const root = path.resolve('artifacts/product-reality/sprint-198/m04', phase);
const browser = await launchProofBrowser();
try {
  for (const object of ['Organization', 'User', 'Subscription', 'Invoice', 'Plan']) {
    await render({ compose: { object, context: 'workflow' }, framework: 'both', theme: 'light', brand: 'A', widths: [390], output: path.join(root, object, 'mount'), port: 4577 });
    for (const [framework, port] of [['react', 4578], ['vue', 4579]] as const) {
      const page = await browser.newPage({ locale: 'en-US', timezoneId: 'UTC' });
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      await page.addInitScript('globalThis.__name = (value) => value;');
      let time = Date.parse('2026-09-08T12:00:00Z');
      const click = async (selector: string) => { await page.clock.setFixedTime(new Date(++time)); await page.locator(selector).click(); await page.locator('[data-oods-workflow][data-ui-state="success"]').waitFor(); };
      await page.clock.setFixedTime(new Date(time));
      await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle' });
      await click(`[data-oods-collection="rows"] [data-record-id="${object.toLowerCase()}-003"]`);
      const views = [];
      for (const context of ['form', 'timeline']) {
        await click(`nav[aria-label="Workflow screens"] button:text-is("${context === 'form' ? 'Edit' : 'Timeline'}")`);
        const output = path.join(root, object, framework, context);
        await fs.mkdir(output, { recursive: true });
        for (const width of [390, 820, 1440]) {
          const view = await observeView(page, width, output);
          const craft = await page.evaluate(() => {
            const visible = (node: Element) => node.getClientRects().length > 0 && getComputedStyle(node).visibility !== 'hidden';
            return { requiredMarks: [...document.querySelectorAll('.oods-field-required')].filter(visible).map(mark => {
                const label = mark.closest('label')!; const text = label.querySelector('.oods-field-label')?.firstChild ?? label.firstChild;
                const range = document.createRange(); range.selectNode(text!); const labelBox = range.getBoundingClientRect(); const markBox = mark.getBoundingClientRect();
                return { label: label.textContent, sameLine: Math.abs(markBox.top - labelBox.top) < Math.max(markBox.height, labelBox.height) / 2 };
              }), headings: [...document.querySelectorAll('h1,h2,h3')].filter(visible).map(node => node.textContent),
              actions: [...document.querySelectorAll('button')].filter(visible).map(node => ({ text: node.textContent, type: node.getAttribute('type') })),
              inputs: [...document.querySelectorAll('input,select,textarea')].filter(visible).map(element => { const node = element as HTMLInputElement; return { id: node.id, type: node.type, value: node.value, checked: node.checked, required: node.required, label: [...node.labels ?? []].map(label => label.textContent).join(' '), component: node.closest('[data-oods-component]')?.getAttribute('data-oods-component'), width: node.getBoundingClientRect().width, scrollWidth: node.scrollWidth, clientWidth: node.clientWidth, options: node.tagName === 'SELECT' ? [...(element as HTMLSelectElement).options].map(option => ({ value: option.value, label: option.label })) : undefined }; }) };
          });
          views.push({ context, output: path.relative(root, output), ...view, craft });
        }
      }
      await fs.writeFile(path.join(root, object, framework, 'craft.json'), JSON.stringify({ phase, object, framework, errors, views }, null, 2) + '\n');
      console.log(phase, object, framework, views.length, errors);
      await page.close();
    }
  }
} finally { await browser.close(); }
