/**
 * s201-m03 receipts: two versions side by side as running apps with the structural what-changed.
 *   pnpm exec tsx scripts/product-reality/s201-m03-compare.ts [--out artifacts/product-reality/sprint-201/m03/browser]
 */
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(import.meta.dirname, '../..');
const outIndex = process.argv.indexOf('--out');
const out = path.resolve(root, outIndex >= 0 ? process.argv[outIndex + 1]! : 'artifacts/product-reality/sprint-201/m03/browser');
fs.mkdirSync(out, { recursive: true });
const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const storeRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-s201-m03-'));
const bridge = spawn(process.execPath, ['dist/server.js'], { cwd: path.join(root, 'packages/mcp-bridge'), env: { ...process.env, MCP_BRIDGE_PORT: '0', BRIDGE_TOKEN: 's201-token', MCP_SCHEMA_STORE_ROOT: storeRoot, MCP_SCHEMA_STORE_DIR: 'schemas' }, stdio: ['ignore', 'pipe', 'pipe'] });
let log = ''; bridge.stdout.on('data', chunk => { log += chunk; }); bridge.stderr.on('data', chunk => { log += chunk; });
const port = await new Promise<number>((resolve, reject) => { const timer = setTimeout(() => reject(new Error(`bridge did not listen: ${log}`)), 20_000); const poll = () => { const match = /listening on :(\d+)/.exec(log); if (match) { clearTimeout(timer); resolve(Number(match[1])); } else setTimeout(poll, 100); }; poll(); });
const base = `http://127.0.0.1:${port}`;
const run = async (tool: string, input: unknown) => { const response = await fetch(`${base}/run`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-bridge-token': 's201-token' }, body: JSON.stringify({ tool, input }) }); const body = await response.json() as { ok: boolean; result: any }; assert(response.ok && body.ok, JSON.stringify(body).slice(0, 600)); return body.result; };
const browser = await chromium.launch({ headless: true });
const receipts: Record<string, unknown> = { head, bridge: base };
try {
  const v1 = await run('design_preview', { object: 'Subscription', context: 'detail' });
  const v2c = await run('design_compose', { object: 'Subscription', context: 'detail', compositionId: v1.compositionId, preferences: { componentOverrides: { metadata: 'TagSummary' } } });
  assert.equal(v2c.version, 2);
  await run('design_preview', { compositionId: v1.compositionId, version: 2 });
  const compare = await run('design_preview', { action: 'compare', compositionId: v1.compositionId, version: 1, against: { version: 2 } });
  const self = await run('design_preview', { action: 'compare', compositionId: v1.compositionId, version: 2, against: { version: 2 } });
  assert.equal(self.identical, true); assert.equal(self.differenceCount, 0);
  const categories = Object.entries(compare.diff.summary).filter(([, count]) => (count as number) > 0).map(([category]) => category);
  assert.deepEqual(categories, ['slots', 'artifacts']);
  receipts.tool = { compareUrl: compare.compareUrl, summary: compare.diff.summary, differences: compare.diff.differences, self: { identical: self.identical, differenceCount: self.differenceCount } };
  const page = await browser.newPage({ viewport: { width: 1900, height: 1200 }, locale: 'en-US', timezoneId: 'UTC' });
  const errors: string[] = []; page.on('pageerror', error => errors.push(`page: ${error.message}`)); page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  const observations: Record<string, unknown> = {};
  for (const framework of ['react', 'vue'] as const) {
    await page.goto(`${base}/compare/${v1.compositionId}@1/${v1.compositionId}@2?framework=${framework}&brand=B&theme=dark&width=820`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.documentElement.dataset.oodsAppsMounted === '2', undefined, { timeout: 30_000 });
    const frames = page.frames().filter(frame => frame.url().includes('/app?'));
    assert.equal(frames.length, 2);
    const apps = [];
    for (const frame of frames) apps.push(await frame.evaluate(() => ({ url: location.pathname + location.search, components: document.querySelectorAll('[data-oods-component]').length, brand: document.documentElement.dataset.brand, theme: document.documentElement.dataset.theme, identity: (window as any).__oodsPreview, width: window.innerWidth })));
    const changed = await page.locator('[data-oods-what-changed]').innerText();
    const measurements = await page.locator('[data-oods-measurements]').allInnerTexts();
    await page.screenshot({ path: path.join(out, `compare-${framework}-B-dark.png`), fullPage: true });
    assert(changed.includes('Slots') && changed.includes('metadata') && changed.includes('Artifact files'), changed.slice(0, 300));
    assert.equal(measurements.length, 2);
    assert(apps.every(app => app.components > 0 && app.brand === 'B' && app.theme === 'dark' && app.width === 820));
    assert.deepEqual(apps.map(app => app.identity.version), [1, 2]);
    // The right side is the swapped version: the metadata slot's leader differs on screen.
    observations[framework] = { apps, whatChanged: changed, measurementPanels: measurements };
  }
  assert.deepEqual(errors, [], errors.join(' | '));
  receipts.browser = observations; receipts.browserErrors = errors;
  await page.close();
} finally { await browser.close(); bridge.kill('SIGTERM'); await new Promise(resolve => bridge.once('close', resolve)); fs.rmSync(storeRoot, { recursive: true, force: true }); }
fs.writeFileSync(path.join(out, 'compare.json'), JSON.stringify(receipts, null, 2) + '\n');
console.log(`m03 browser receipts → ${out}`);
