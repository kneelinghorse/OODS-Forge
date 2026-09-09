import fs from 'node:fs/promises';
import { launchProofBrowser } from '../../../../scripts/product-reality/s184-m06-live-consumers.js';
import { applySteps } from '../../../../scripts/design-loop/observe.js';
const browser = await launchProofBrowser();
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 1000 }, timezoneId: 'UTC' });
  await page.clock.setFixedTime(new Date('2026-09-08T12:00:00Z'));
  await page.goto('http://127.0.0.1:4478', { waitUntil: 'networkidle' });
  await page.locator('[data-oods-workflow][data-ui-state="success"]').waitFor();
  const input = JSON.parse(await fs.readFile(new URL('./inputs/after-dark.json', import.meta.url), 'utf8'));
  await applySteps(page, input.steps, Date.parse('2026-09-08T12:00:00Z'));
  const client = await page.context().newCDPSession(page);
  const ax = await client.send('Accessibility.getFullAXTree');
  console.log(JSON.stringify({ roles: ax.nodes.filter(node => /graphics|image|figure/i.test(String(node.role?.value))).map(node => ({ role: node.role?.value, name: node.name?.value, ignored: node.ignored })), domRoles: await page.locator('[data-viz-svg] [role]').evaluateAll(nodes => nodes.map(node => node.getAttribute('role'))) }));
} finally { await browser.close(); }
