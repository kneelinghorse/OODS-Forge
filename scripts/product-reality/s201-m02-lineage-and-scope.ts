/**
 * s201-m02 receipts: one URL per composition version with lineage; brand and theme switches
 * re-mount the running app in place; width is a control; a second version shows its parent.
 * Starts the built bridge from this checkout, composes through POST /run, opens the pages in
 * Chromium and records what the browser observed.
 *
 *   pnpm exec tsx scripts/product-reality/s201-m02-lineage-and-scope.ts [--out artifacts/product-reality/sprint-201/m02/browser]
 */
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium, type Frame, type Page } from 'playwright';

const root = path.resolve(import.meta.dirname, '../..');
const outIndex = process.argv.indexOf('--out');
const out = path.resolve(root, outIndex >= 0 ? process.argv[outIndex + 1]! : 'artifacts/product-reality/sprint-201/m02/browser');
fs.mkdirSync(out, { recursive: true });
const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const storeRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-s201-m02-'));
const bridge = spawn(process.execPath, ['dist/server.js'], {
  cwd: path.join(root, 'packages/mcp-bridge'),
  env: { ...process.env, MCP_BRIDGE_PORT: '0', BRIDGE_TOKEN: 's201-token', MCP_SCHEMA_STORE_ROOT: storeRoot, MCP_SCHEMA_STORE_DIR: 'schemas' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let log = '';
bridge.stdout.on('data', chunk => { log += chunk; }); bridge.stderr.on('data', chunk => { log += chunk; });
const port = await new Promise<number>((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error(`bridge did not listen: ${log}`)), 20_000);
  const poll = () => { const match = /listening on :(\d+)/.exec(log); if (match) { clearTimeout(timer); resolve(Number(match[1])); } else setTimeout(poll, 100); };
  poll();
});
const base = `http://127.0.0.1:${port}`;
const run = async (tool: string, input: unknown) => {
  const response = await fetch(`${base}/run`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-bridge-token': 's201-token' }, body: JSON.stringify({ tool, input }) });
  const body = await response.json() as { ok: boolean; result: any };
  assert(response.ok && body.ok, JSON.stringify(body).slice(0, 600));
  return body.result;
};
const appFrame = (page: Page): Frame => { const frame = page.frames().find(candidate => candidate.url().includes('/app?')); assert(frame, 'app frame'); return frame; };
const observeApp = (frame: Frame) => frame.evaluate(() => ({
  theme: document.documentElement.dataset.theme, brand: document.documentElement.dataset.brand, bodyTheme: document.body.dataset.theme,
  components: document.querySelectorAll('[data-oods-component]').length, mounts: (window as any).__oodsPreview.mounts, identity: (window as any).__oodsPreview,
  navigations: performance.getEntriesByType('navigation').length, bodyBackground: getComputedStyle(document.body).backgroundColor, mounted: document.documentElement.dataset.oodsPreviewMounted,
}));
const browser = await chromium.launch({ headless: true });
const receipts: Record<string, unknown> = { head, bridge: `${base} (packages/mcp-bridge/dist/server.js from this checkout)` };
try {
  // Two compositions get two ids; a recompose of the first gets version 2 with its parent.
  const first = await run('design_compose', { object: 'Subscription', context: 'detail' });
  const other = await run('design_compose', { object: 'Organization', context: 'list' });
  assert.match(first.compositionId, /^cmp-[a-f0-9]{12}$/); assert.match(other.compositionId, /^cmp-[a-f0-9]{12}$/); assert.notEqual(first.compositionId, other.compositionId);
  assert.deepEqual([first.version, first.parentVersion, first.operation], [1, null, 'compose']);
  const second = await run('design_compose', { object: 'Subscription', context: 'detail', compositionId: first.compositionId, preferences: { tabLabels: ['Overview', 'Billing', 'History'] } });
  assert.deepEqual([second.compositionId, second.version, second.parentVersion, second.operation], [first.compositionId, 2, 1, 'recompose']);
  receipts.compositions = { first: { compositionId: first.compositionId, version: 1 }, other: { compositionId: other.compositionId, version: 1 }, second: { compositionId: second.compositionId, version: 2, parentVersion: 1, operation: 'recompose' } };

  const preview1 = await run('design_preview', { compositionId: first.compositionId, version: 1 });
  const preview2 = await run('design_preview', { compositionId: first.compositionId });
  assert.equal(preview2.version, 2); assert.equal(preview2.parentVersion, 1);
  const previewOther = await run('design_preview', { compositionId: other.compositionId, framework: 'vue', preferences: { brand: 'B', theme: 'dark' } });
  receipts.previews = { v1: preview1.previewUrl, v2: preview2.previewUrl, other: previewOther.previewUrl };

  const page = await browser.newPage({ viewport: { width: 1800, height: 1100 }, locale: 'en-US', timezoneId: 'UTC' });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(`page: ${error.message}`)); page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  const shellObservations: Record<string, unknown> = {};
  for (const [name, preview] of [['v1', preview1], ['v2', preview2], ['other', previewOther]] as const) {
    await page.goto(preview.previewUrl, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.documentElement.dataset.oodsAppMounted === 'true', undefined, { timeout: 20_000 });
    const lineage = await page.locator('[data-oods-lineage] dl').innerText();
    const versions = await page.locator('[data-oods-versions]').innerText();
    const status = await page.locator('[data-oods-status]').innerText();
    const app = await observeApp(appFrame(page));
    await page.screenshot({ path: path.join(out, `${name}-shell.png`), fullPage: false });
    shellObservations[name] = { url: preview.previewUrl, lineage, versions, status, app };
    assert(lineage.includes(preview.compositionId) && lineage.includes(`${preview.version} of`) && lineage.includes(preview.operation), `${name} lineage`);
    assert(app.components > 0 && app.mounts === 1 && app.mounted === 'true', `${name} mounted`);
  }
  assert(String((shellObservations.v2 as any).lineage).includes('version 1'), 'v2 names its parent');
  assert(String((shellObservations.v2 as any).versions).includes('v2') && String((shellObservations.v2 as any).versions).includes('recompose ← v1'), 'v2 version list');
  assert(String((shellObservations.v1 as any).lineage).includes('none (first version)'));
  receipts.shells = shellObservations;

  // Brand and theme are switches: the framed app re-mounts in place, no navigation, same module.
  await page.goto(preview1.previewUrl, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.documentElement.dataset.oodsAppMounted === 'true', undefined, { timeout: 20_000 });
  const before = await observeApp(appFrame(page));
  assert.deepEqual([before.brand, before.theme, before.mounts], ['A', 'light', 1]);
  const moduleRequests: string[] = [];
  page.on('request', request => { if (request.url().includes('/module.js')) moduleRequests.push(request.url()); });
  await page.locator('button[data-control="theme"][data-value="dark"]').click();
  await page.waitForFunction(() => (document.querySelector('[data-oods-app]') as HTMLIFrameElement).contentWindow!.document.documentElement.dataset.theme === 'dark');
  await page.locator('button[data-control="brand"][data-value="B"]').click();
  await page.waitForFunction(() => (document.querySelector('[data-oods-app]') as HTMLIFrameElement).contentWindow!.document.documentElement.dataset.brand === 'B');
  await page.waitForFunction(() => ((document.querySelector('[data-oods-app]') as HTMLIFrameElement).contentWindow as any).__oodsPreview.mounts === 3);
  const after = await observeApp(appFrame(page));
  await page.screenshot({ path: path.join(out, 'v1-shell-B-dark.png'), fullPage: false });
  assert.deepEqual([after.brand, after.theme, after.bodyTheme, after.mounts, after.navigations], ['B', 'dark', 'dark', 3, 1], JSON.stringify(after));
  assert.notEqual(after.bodyBackground, before.bodyBackground, 'the canvas follows the scope');
  assert.equal(after.components, before.components);
  assert.deepEqual(moduleRequests, [], 'no module was fetched again');
  assert(page.url().includes('brand=B') && page.url().includes('theme=dark'), 'the URL follows the switches');
  assert.equal(await page.locator('button[data-control="theme"][data-value="dark"]').getAttribute('aria-pressed'), 'true');
  receipts.scopeSwitch = { before, after, moduleRequestsDuringSwitch: moduleRequests, url: page.url() };

  // Width is a control: the fixed widths and free.
  const widths: Record<string, number> = {};
  for (const width of ['390', '820', '1440']) {
    await page.locator(`button[data-control="width"][data-value="${width}"]`).click();
    widths[width] = await page.locator('[data-oods-app]').evaluate(node => (node as HTMLElement).getBoundingClientRect().width);
    assert.equal(widths[width], Number(width));
  }
  await page.locator('button[data-control="width"][data-value="free"]').click();
  await page.locator('[data-control="width-input"]').fill('1000');
  widths.free1000 = await page.locator('[data-oods-app]').evaluate(node => (node as HTMLElement).getBoundingClientRect().width);
  assert.equal(widths.free1000, 1000);
  await page.screenshot({ path: path.join(out, 'v1-shell-free-1000.png'), fullPage: false });
  const viewportWidth = await appFrame(page).evaluate(() => window.innerWidth);
  assert.equal(viewportWidth, 1000, 'the framed app sees the chosen width as its viewport');
  receipts.widths = { ...widths, appViewportAtFree1000: viewportWidth };

  // The same URL after a host restart: stop the bridge, start another over the same store, open again.
  bridge.kill('SIGTERM'); await new Promise(resolve => bridge.once('close', resolve));
  const restarted = spawn(process.execPath, ['dist/server.js'], { cwd: path.join(root, 'packages/mcp-bridge'), env: { ...process.env, MCP_BRIDGE_PORT: String(port), BRIDGE_TOKEN: 's201-token', MCP_SCHEMA_STORE_ROOT: storeRoot, MCP_SCHEMA_STORE_DIR: 'schemas' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let log2 = ''; restarted.stdout.on('data', chunk => { log2 += chunk; }); restarted.stderr.on('data', chunk => { log2 += chunk; });
  await new Promise<void>((resolve, reject) => { const timer = setTimeout(() => reject(new Error(`restart failed: ${log2}`)), 20_000); const poll = () => { if (/listening on :(\d+)/.test(log2)) { clearTimeout(timer); resolve(); } else setTimeout(poll, 100); }; poll(); });
  try {
    await page.goto(preview2.previewUrl, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.documentElement.dataset.oodsAppMounted === 'true', undefined, { timeout: 20_000 });
    const again = await observeApp(appFrame(page));
    assert.deepEqual([again.identity.compositionId, again.identity.version, again.identity.parentVersion], [first.compositionId, 2, 1]);
    receipts.afterRestart = { url: preview2.previewUrl, app: again };
  } finally { restarted.kill('SIGTERM'); await new Promise(resolve => restarted.once('close', resolve)); }
  assert.deepEqual(errors, [], errors.join(' | '));
  receipts.browserErrors = errors;
  await page.close();
} finally {
  await browser.close();
  if (bridge.exitCode === null) { bridge.kill('SIGTERM'); await new Promise(resolve => bridge.once('close', resolve)); }
  fs.rmSync(storeRoot, { recursive: true, force: true });
}
fs.writeFileSync(path.join(out, 'lineage-and-scope.json'), JSON.stringify(receipts, null, 2) + '\n');
console.log(`m02 browser receipts → ${out}`);
