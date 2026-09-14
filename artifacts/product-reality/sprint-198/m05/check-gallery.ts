import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { launchProofBrowser, withStaticServer } from '../../../../scripts/product-reality/s184-m06-live-consumers.js';
const root = path.resolve('artifacts/product-reality/sprint-198/m05');
const browser = await launchProofBrowser();
try {
  await withStaticServer(root, async url => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(url + '/index.html');
    for (const object of ['organization','user','subscription']) {
      await page.locator('select').nth(0).selectOption(object);
      await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0));
      assert.equal(await page.locator('.pair img').count(), 2);
    }
    await page.locator('select').nth(0).selectOption('organization');
    await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0));
    await page.screenshot({ path: path.join(root, 'gallery.png'), fullPage: true });
    assert.deepEqual(errors, []);
    await fs.writeFile(path.join(root, 'gallery-check.json'), JSON.stringify({ objects: 3, pairedImagesPerSelection: 2, errors, builderSelfCertified: false }, null, 2) + '\n');
    await page.close();
  });
} finally { await browser.close(); }
