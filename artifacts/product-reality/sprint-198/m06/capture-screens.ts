import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { render } from '../../../../scripts/design-loop/render.js';
import { launchProofBrowser } from '../../../../scripts/product-reality/s184-m06-live-consumers.js';
const root = path.resolve('artifacts/product-reality/sprint-198/m06/screens');
const sourceHead = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
assert(process.env.OODS_PLAYWRIGHT_WS_ENDPOINT, 'Pinned Linux browser is required');
const browser = await launchProofBrowser();
const reports = [];
try {
  for (const [object, contexts] of [['Evidence', ['list','detail','timeline']], ['Mission', ['detail','workflow']]] as const) {
    for (const context of contexts) {
      const output = path.join(root, object, context);
      const receipt = await render({ compose: { object, context }, framework: 'both', theme: 'light', brand: 'A', widths: [390,820,1440], output, port: 4577 });
      reports.push({ object, context, sourceHead, receipt });
      // Capture exact text independently from the design-loop geometry/console receipt.
      const texts: Record<string, Array<{width:number;text:string;errors:string[]}>> = {};
      for (const [framework, port] of [['react',4578],['vue',4579]] as const) {
        const page = await browser.newPage({ locale: 'en-US', timezoneId: 'UTC' });
        const errors: string[] = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
        await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle' });
        texts[framework] = [];
        for (const width of [390,820,1440]) {
          await page.setViewportSize({ width, height: 1000 });
          const text = await page.locator('body').innerText();
          const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
          assert.equal(documentWidth,width);
          texts[framework].push({ width, text: text.replace(/\s+/g,' ').trim(), errors: [...errors] });
        }
        await page.close();
      }
      assert.deepEqual(texts.react, texts.vue, `${object}/${context}: exact visible text and errors must match`);
      assert(texts.react.every(row => row.errors.length===0));
      await fs.writeFile(path.join(output,'text-parity.json'),JSON.stringify({object,context,sourceHead,texts,builderSelfCertified:false},null,2)+'\n');
      console.log(object,context,'6 screens, exact text parity');
    }
  }
  await fs.writeFile(path.join(root,'report.json'),JSON.stringify({sourceHead,reports,builderSelfCertified:false},null,2)+'\n');
} finally { await browser.close(); }
