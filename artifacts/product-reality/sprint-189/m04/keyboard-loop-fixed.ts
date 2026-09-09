import fs from 'node:fs/promises';
import path from 'node:path';
import { launchProofBrowser, withStaticServer } from '../../../../scripts/product-reality/s184-m06-live-consumers.js';
const receipt = JSON.parse(await fs.readFile(new URL('./app-consumers/vue/receipt.json', import.meta.url), 'utf8'));
const browser = await launchProofBrowser();
const rows = [];
try {
  await (async () => { const url = 'http://127.0.0.1:4479';
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    for (let iteration = 0; iteration < 3; iteration++) {
      await page.goto(url);
      await page.locator('[data-oods-collection="rows"] [data-record-id="subscription-003"]').click();
      await page.locator('[data-oods-action="handleEdit"]').click();
      const amount = page.locator('[data-billing-minor-units]');
      await amount.fill('-1'); await page.getByRole('button', { name: 'Save', exact: true }).click();
      await amount.fill('19.99');
      const interval = page.getByRole('combobox', { name: 'Billing interval', exact: true });
      await interval.focus(); await interval.press('Home');
      const home = await interval.inputValue();
      await interval.press('ArrowDown'); const down = await interval.inputValue();
      await interval.press('Tab'); const tab = await interval.inputValue();
      rows.push({ iteration, home, down, tab });
    }
    await page.close();
  })();
} finally { await browser.close(); }
await fs.writeFile(new URL('./keyboard-loop-fixed.json', import.meta.url), JSON.stringify(rows, null, 2) + '\n');
console.log(JSON.stringify(rows));
