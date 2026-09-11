import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(new URL('../../../../packages/components-react/package.json', import.meta.url));
const { createServer } = require('vite');
const { chromium } = require('playwright');
const root = 'artifacts/product-reality/sprint-193/m05/component-inspection';
await fs.mkdir(root, { recursive: true });
const server = await createServer({ root: 'packages/components-react', configFile: false, logLevel: 'error', server: { host: '127.0.0.1', port: 0 } });
let browser;
try {
  await server.listen(); browser = await chromium.connect(process.env.OODS_PLAYWRIGHT_WS_ENDPOINT, { exposeNetwork: '<loopback>' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/test/visual.html?brand=A&theme=light`, { waitUntil: 'networkidle' });
  await page.locator('body[data-visual-ready="true"]').waitFor();
  for (const id of JSON.parse(await fs.readFile('artifacts/product-reality/sprint-193/m05/authored-roots.json', 'utf8')).controls.concat(JSON.parse(await fs.readFile('artifacts/product-reality/sprint-193/m05/authored-roots.json', 'utf8')).summaries).concat(Object.keys(JSON.parse(await fs.readFile('artifacts/product-reality/sprint-193/m05/authored-roots.json', 'utf8')).previews))) {
    await page.locator(`[data-scenario="${id}"]`).screenshot({ path: `${root}/${id}.png` });
  }
  await page.close();
} finally { await browser?.close(); await server.close(); }
