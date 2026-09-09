import { launchProofBrowser } from '../../../../scripts/product-reality/s184-m06-live-consumers.js';
const browser = await launchProofBrowser();
try {
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:4478', { waitUntil: 'networkidle' });
  await page.locator('[data-oods-workflow][data-ui-state="success"]').waitFor();
  await page.locator('[data-record-id="subscription-003"]').click();
  await page.locator('[data-screen="detail"]').waitFor();
  await page.locator('[data-oods-action="handleEdit"]').click();
  await page.locator('[data-screen="form"]').waitFor();
  const select = page.getByRole('combobox', { name: 'Billing interval', exact: true });
  await select.focus();
  for (const key of ['Home', 'ArrowDown', 'Enter']) {
    await select.press(key);
    console.log(JSON.stringify({ key, value: await select.inputValue() }));
  }
} finally { await browser.close(); }
