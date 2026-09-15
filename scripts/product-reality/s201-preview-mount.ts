/**
 * s201-m01 mount receipts: the served preview is the generated app actually running.
 * Starts the built bridge from this checkout on a free loopback port, asks design.preview for
 * Subscription, Organization and User screens through POST /run, opens every returned URL in
 * Chromium, and records what mounted: component count, page errors, the identity the page
 * publishes, the computed canvas colour and a full-page screenshot.
 *
 *   pnpm exec tsx scripts/product-reality/s201-preview-mount.ts [--out artifacts/product-reality/sprint-201/m01/mount]
 */
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(import.meta.dirname, '../..');
const outIndex = process.argv.indexOf('--out');
const out = path.resolve(root, outIndex >= 0 ? process.argv[outIndex + 1]! : 'artifacts/product-reality/sprint-201/m01/mount');
fs.mkdirSync(out, { recursive: true });
const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const storeRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-s201-mount-'));
const CASES = [
  { object: 'Subscription', context: 'detail', brand: 'A', theme: 'light' }, { object: 'Subscription', context: 'detail', brand: 'B', theme: 'dark' },
  { object: 'Subscription', context: 'list', brand: 'A', theme: 'light' }, { object: 'Subscription', context: 'form', brand: 'B', theme: 'dark' },
  { object: 'Subscription', context: 'timeline', brand: 'A', theme: 'hc' }, { object: 'Subscription', context: 'card', brand: 'B', theme: 'light' },
  { object: 'Organization', context: 'detail', brand: 'A', theme: 'dark' }, { object: 'Organization', context: 'list', brand: 'B', theme: 'light' },
  { object: 'User', context: 'detail', brand: 'B', theme: 'dark' }, { object: 'User', context: 'form', brand: 'A', theme: 'light' },
] as const;

const bridge = spawn(process.execPath, ['dist/server.js'], {
  cwd: path.join(root, 'packages/mcp-bridge'),
  env: { ...process.env, MCP_BRIDGE_PORT: '0', BRIDGE_TOKEN: 's201-mount-token', MCP_SCHEMA_STORE_ROOT: storeRoot, MCP_SCHEMA_STORE_DIR: 'schemas' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let log = '';
bridge.stdout.on('data', chunk => { log += chunk; });
bridge.stderr.on('data', chunk => { log += chunk; });
const port = await new Promise<number>((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error(`bridge did not listen: ${log}`)), 20_000);
  const poll = () => { const match = /listening on :(\d+)/.exec(log); if (match) { clearTimeout(timer); resolve(Number(match[1])); } else setTimeout(poll, 100); };
  poll();
});
const base = `http://127.0.0.1:${port}`;
const browser = await chromium.launch({ headless: true });
const receipts: unknown[] = [];
try {
  for (const testCase of CASES) {
    const started = performance.now();
    const response = await fetch(`${base}/run`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-bridge-token': 's201-mount-token' },
      body: JSON.stringify({ tool: 'design_preview', input: { object: testCase.object, context: testCase.context, preferences: { brand: testCase.brand, theme: testCase.theme } } }) });
    const run = await response.json() as { ok: boolean; result: { compositionId: string; version: number; schemaHash: string; previews: Array<{ framework: 'react' | 'vue'; url: string; appUrl: string; compiled: { sha256: string; bytes: number } }>; host: { port: number } } };
    assert(response.ok && run.ok, JSON.stringify(run).slice(0, 800));
    assert.equal(run.result.host.port, port, 'the bridge hosts the preview on its own port');
    for (const preview of run.result.previews) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, locale: 'en-US', timezoneId: 'UTC' });
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(`page: ${error.message}`));
      page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
      const failed: string[] = [];
      page.on('requestfailed', request => failed.push(request.url()));
      await page.goto(preview.appUrl, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => document.documentElement.dataset.oodsPreviewMounted === 'true', undefined, { timeout: 15_000 });
      await page.locator('[data-oods-component]').first().waitFor({ timeout: 15_000 });
      const observed = await page.evaluate(() => ({
        components: document.querySelectorAll('[data-oods-component]').length,
        componentNames: Array.from(new Set(Array.from(document.querySelectorAll('[data-oods-component]')).map(node => node.getAttribute('data-oods-component')))).sort(),
        identity: (window as unknown as { __oodsPreview: unknown }).__oodsPreview,
        html: { theme: document.documentElement.dataset.theme, brand: document.documentElement.dataset.brand },
        bodyBackground: getComputedStyle(document.body).backgroundColor,
        text: document.body.innerText.slice(0, 400),
        importMap: JSON.parse(document.querySelector('script[type="importmap"]')!.textContent!),
      }));
      const name = `${testCase.object}-${testCase.context}-${preview.framework}-${testCase.brand}-${testCase.theme}`;
      await page.screenshot({ path: path.join(out, `${name}.png`), fullPage: true });
      await page.close();
      assert.deepEqual(errors, [], `${name}: ${errors.join(' | ')}`);
      assert.deepEqual(failed, [], `${name}: failed requests ${failed.join(', ')}`);
      assert(observed.components > 0);
      assert.deepEqual(observed.html, { theme: testCase.theme, brand: testCase.brand });
      assert.deepEqual((observed.identity as { compositionId: string; version: number; framework: string; brand: string; theme: string }), { ...(observed.identity as object), compositionId: run.result.compositionId, version: run.result.version, framework: preview.framework, brand: testCase.brand, theme: testCase.theme });
      receipts.push({ ...testCase, framework: preview.framework, url: preview.url, appUrl: preview.appUrl, compositionId: run.result.compositionId, version: run.result.version, schemaHash: run.result.schemaHash, compiled: preview.compiled, observed, errors, failedRequests: failed, screenshot: `${name}.png`, durationMs: Math.round(performance.now() - started) });
      console.log(`${name}: ${observed.components} components, bg ${observed.bodyBackground}, ${preview.compiled.bytes} bytes compiled`);
    }
  }
} finally {
  await browser.close();
  bridge.kill('SIGTERM');
  await new Promise(resolve => bridge.once('close', resolve));
  fs.rmSync(storeRoot, { recursive: true, force: true });
}
fs.writeFileSync(path.join(out, 'mount-receipts.json'), JSON.stringify({ head, bridge: `${base} (packages/mcp-bridge/dist/server.js from this checkout)`, browser: 'chromium (playwright), headless, 1440x1000, en-US, UTC', cases: receipts.length, allMounted: true, receipts }, null, 2) + '\n');
console.log(`mount receipts: ${receipts.length} → ${out}`);
