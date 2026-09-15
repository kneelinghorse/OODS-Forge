/**
 * s201-m05 receipts: editing from the page writes back into the composition. Through the built
 * bridge in Chromium: reorder the two regions of a Subscription detail version from the page (a new
 * version whose running app shows the new order in both frameworks, with lineage), swap the metadata
 * slot to a composer candidate (the compare view reports exactly that change), reorder two fields,
 * and change the seed (the sample text changes). The parent version's file is byte-identical after all four.
 *   pnpm exec tsx scripts/product-reality/s201-m05-edits.ts [--out artifacts/product-reality/sprint-201/m05/browser]
 */
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium, type Frame, type Page } from 'playwright';

const root = path.resolve(import.meta.dirname, '../..');
const outIndex = process.argv.indexOf('--out');
const out = path.resolve(root, outIndex >= 0 ? process.argv[outIndex + 1]! : 'artifacts/product-reality/sprint-201/m05/browser');
fs.mkdirSync(out, { recursive: true });
const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const storeRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-s201-m05-'));
const bridge = spawn(process.execPath, ['dist/server.js'], { cwd: path.join(root, 'packages/mcp-bridge'), env: { ...process.env, MCP_BRIDGE_PORT: '0', BRIDGE_TOKEN: 's201-token', MCP_SCHEMA_STORE_ROOT: storeRoot, MCP_SCHEMA_STORE_DIR: 'schemas' }, stdio: ['ignore', 'pipe', 'pipe'] });
let log = ''; bridge.stdout.on('data', chunk => { log += chunk; }); bridge.stderr.on('data', chunk => { log += chunk; });
const port = await new Promise<number>((resolve, reject) => { const timer = setTimeout(() => reject(new Error(`bridge did not listen: ${log}`)), 20_000); const poll = () => { const match = /listening on :(\d+)/.exec(log); if (match) { clearTimeout(timer); resolve(Number(match[1])); } else setTimeout(poll, 100); }; poll(); });
const base = `http://127.0.0.1:${port}`;
const run = async (tool: string, input: unknown) => { const response = await fetch(`${base}/run`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-bridge-token': 's201-token' }, body: JSON.stringify({ tool, input }) }); const body = await response.json() as { ok: boolean; result: any }; assert(response.ok && body.ok, JSON.stringify(body).slice(0, 600)); return body.result; };
const appFrame = (page: Page): Frame => { const frame = page.frames().find(candidate => candidate.url().includes('/app?')); assert(frame, 'app frame'); return frame; };
const waitApp = (page: Page) => page.waitForFunction(() => document.documentElement.dataset.oodsAppMounted === 'true', undefined, { timeout: 30_000 });
const regionOrderOnScreen = (frame: Frame) => frame.evaluate(() => Array.from(document.querySelectorAll('#app [id]')).map(node => node.id).filter(id => /^detail-(header|body)-\d+$/.test(id)));
const browser = await chromium.launch({ headless: true });
const receipts: Record<string, unknown> = { head, bridge: base };
try {
  const v1 = await run('design_preview', { object: 'Subscription', context: 'detail' });
  const parentFile = path.join(storeRoot, 'compositions', v1.compositionId, 'versions', '1.json');
  const parentBefore = fs.readFileSync(parentFile);
  const page = await browser.newPage({ viewport: { width: 1800, height: 1200 }, locale: 'en-US', timezoneId: 'UTC' });
  const errors: string[] = []; page.on('pageerror', error => errors.push(`page: ${error.message}`)); page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });

  // 1. Reorder the two regions from the page.
  await page.goto(v1.previewUrl, { waitUntil: 'networkidle' }); await waitApp(page);
  const orderBefore = await regionOrderOnScreen(appFrame(page));
  assert.deepEqual(orderBefore, ['detail-header-1', 'detail-body-10']);
  await page.locator('button.move[data-kind="region"][data-index="1"][data-delta="-1"]').click();
  await page.waitForURL(url => /\/preview\/cmp-[a-f0-9]{12}\/2\?/.test(url.toString()), { timeout: 60_000 });
  await waitApp(page);
  const reorderedReact = await regionOrderOnScreen(appFrame(page));
  const lineage = await page.locator('[data-oods-lineage] dl').innerText();
  assert.deepEqual(reorderedReact, ['detail-body-10', 'detail-header-1']);
  assert(lineage.includes('reorder-region') && lineage.includes('version 1'), lineage);
  await page.screenshot({ path: path.join(out, 'v2-reordered-react.png'), fullPage: false });
  await page.locator('button[data-control="framework"][data-value="vue"]').click();
  await page.waitForURL(url => url.toString().includes('framework=vue'), { timeout: 30_000 }); await waitApp(page);
  const reorderedVue = await regionOrderOnScreen(appFrame(page));
  assert.deepEqual(reorderedVue, ['detail-body-10', 'detail-header-1']);
  await page.screenshot({ path: path.join(out, 'v2-reordered-vue.png'), fullPage: false });
  receipts.reorderRegion = { before: orderBefore, react: reorderedReact, vue: reorderedVue, lineage, url: page.url() };

  // 2. Swap the metadata slot to a composer candidate from version 1; the compare view reports exactly that.
  await page.goto(v1.previewUrl, { waitUntil: 'networkidle' }); await waitApp(page);
  await page.locator('form[data-edit="swap-slot"][data-slot="metadata"] select').selectOption('TagSummary');
  await page.locator('form[data-edit="swap-slot"][data-slot="metadata"] button[type="submit"]').click();
  await page.waitForURL(url => /\/preview\/cmp-[a-f0-9]{12}\/3\?/.test(url.toString()), { timeout: 60_000 }); await waitApp(page);
  const swapped = await run('design_preview', { action: 'compare', compositionId: v1.compositionId, version: 1, against: { version: 3 } });
  const categories = Object.entries(swapped.diff.summary).filter(([, count]) => (count as number) > 0).map(([category]) => category);
  assert.deepEqual(categories, ['slots', 'artifacts']);
  assert.deepEqual(swapped.diff.differences.filter((entry: any) => entry.category === 'slots'), [{ category: 'slots', field: 'metadata', before: ['AuditTimeline'], after: ['TagSummary'], note: 'slot components changed' }]);
  await page.goto(swapped.compareUrl, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.documentElement.dataset.oodsAppsMounted === '2', undefined, { timeout: 30_000 });
  await page.screenshot({ path: path.join(out, 'v1-vs-v3-swap.png'), fullPage: true });
  receipts.swapSlot = { compareUrl: swapped.compareUrl, summary: swapped.diff.summary, slotChange: swapped.diff.differences.filter((entry: any) => entry.category === 'slots') };

  // 3. Reorder two fields of the body region from the page.
  await page.goto(v1.previewUrl, { waitUntil: 'networkidle' }); await waitApp(page);
  const fieldsBefore = await page.locator('[data-fields][data-region="detail-body-10"]').getAttribute('data-fields');
  await page.locator('[data-fields][data-region="detail-body-10"] button.move[data-index="1"][data-delta="-1"]').click();
  await page.waitForURL(url => /\/preview\/cmp-[a-f0-9]{12}\/4\?/.test(url.toString()), { timeout: 60_000 }); await waitApp(page);
  const fieldsAfter = await page.locator('[data-fields][data-region="detail-body-10"]').getAttribute('data-fields');
  const [a, b] = JSON.parse(fieldsBefore!) as string[];
  assert.deepEqual((JSON.parse(fieldsAfter!) as string[]).slice(0, 2), [b, a]);
  const onScreen = await appFrame(page).evaluate(() => Array.from(document.querySelectorAll('#app [id$="-value"]')).map(node => node.id).slice(0, 2));
  assert(onScreen[0]!.includes(b!) && onScreen[1]!.includes(a!), onScreen.join(','));
  receipts.reorderFields = { region: 'detail-body-10', before: JSON.parse(fieldsBefore!), after: JSON.parse(fieldsAfter!), onScreen };

  // 4. Change the seed from the page: the sample text changes, the schema otherwise does not.
  await page.goto(v1.previewUrl, { waitUntil: 'networkidle' }); await waitApp(page);
  const textBefore = await appFrame(page).evaluate(() => document.querySelector('#app')!.textContent!.slice(0, 200));
  await page.locator('form[data-edit="seed"] input').fill('harbor-2');
  await page.locator('form[data-edit="seed"] button[type="submit"]').click();
  await page.waitForURL(url => /\/preview\/cmp-[a-f0-9]{12}\/5\?/.test(url.toString()), { timeout: 60_000 }); await waitApp(page);
  const textAfter = await appFrame(page).evaluate(() => document.querySelector('#app')!.textContent!.slice(0, 200));
  assert.notEqual(textAfter, textBefore);
  const seedDiff = await run('design_preview', { action: 'compare', compositionId: v1.compositionId, version: 1, against: { version: 5 } });
  assert.deepEqual(Object.entries(seedDiff.diff.summary).filter(([, count]) => (count as number) > 0).map(([category]) => category), ['seed']);
  await page.screenshot({ path: path.join(out, 'v5-reseeded.png'), fullPage: false });
  receipts.seed = { before: textBefore, after: textAfter, summary: seedDiff.diff.summary };

  // The page's own guard: submitting the swap with the candidate the slot already leads with records nothing.
  await page.goto(v1.previewUrl, { waitUntil: 'networkidle' }); await waitApp(page);
  const statusBefore = await page.locator('[data-oods-edit-status]').innerText();
  await page.locator('form[data-edit="swap-slot"][data-slot="metadata"] button[type="submit"]').click();
  await page.waitForFunction(() => (document.querySelector('[data-oods-edit-status]') as HTMLElement).textContent!.length > 0);
  const guard = await page.locator('[data-oods-edit-status]').innerText();
  assert.equal(guard, 'Choose a different candidate.');
  assert(page.url().includes(`/${v1.compositionId}/1?`), 'no navigation on a refused edit');
  receipts.refusalFromPage = { statusBefore, status: guard, url: page.url() };

  const versions = await run('design_preview', { action: 'versions', compositionId: v1.compositionId });
  assert.deepEqual(versions.versions.map((entry: any) => [entry.version, entry.parentVersion, entry.operation]), [[1, null, 'compose'], [2, 1, 'reorder-region'], [3, 1, 'swap-slot'], [4, 1, 'reorder-fields'], [5, 1, 'seed']]);
  // Opening version 1's page stored its axe measurements (m04) on the file; everything an edit could touch is byte-identical.
  const strip = (bytes: Buffer) => { const { measurements, ...rest } = JSON.parse(bytes.toString('utf8')); return JSON.stringify(rest); };
  assert.equal(strip(fs.readFileSync(parentFile)), strip(parentBefore), 'the parent version (schema, compose inputs, lineage, artifacts, model) must be unchanged');
  receipts.parentMeasurementsAdded = Object.keys(JSON.parse(fs.readFileSync(parentFile, 'utf8')).measurements.axe ?? {});
  receipts.versions = versions.versions.map((entry: any) => ({ version: entry.version, parentVersion: entry.parentVersion, operation: entry.operation }));
  receipts.parentUnchanged = true;
  receipts.browserErrors = errors;
  assert.deepEqual(errors, [], errors.join(' | '));
  await page.close();
} finally { await browser.close(); bridge.kill('SIGTERM'); await new Promise(resolve => bridge.once('close', resolve)); fs.rmSync(storeRoot, { recursive: true, force: true }); }
fs.writeFileSync(path.join(out, 'edits.json'), JSON.stringify(receipts, null, 2) + '\n');
console.log(`m05 browser receipts → ${out}`);
