/**
 * s201-m04 receipts: measurement beside the render. Opens a version through the built bridge in
 * Chromium, lets axe-core run inside the running page in light, then switches to dark, and records
 * that the version now carries axe results for both scopes, the generation receipt and the placed
 * chart certifications, and that the panel names what was and was not measured.
 *   pnpm exec tsx scripts/product-reality/s201-m04-measurements.ts [--out artifacts/product-reality/sprint-201/m04/browser]
 */
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium, type Frame, type Page } from 'playwright';

const root = path.resolve(import.meta.dirname, '../..');
const outIndex = process.argv.indexOf('--out');
const out = path.resolve(root, outIndex >= 0 ? process.argv[outIndex + 1]! : 'artifacts/product-reality/sprint-201/m04/browser');
fs.mkdirSync(out, { recursive: true });
const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const storeRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-s201-m04-'));
const bridge = spawn(process.execPath, ['dist/server.js'], { cwd: path.join(root, 'packages/mcp-bridge'), env: { ...process.env, MCP_BRIDGE_PORT: '0', BRIDGE_TOKEN: 's201-token', MCP_SCHEMA_STORE_ROOT: storeRoot, MCP_SCHEMA_STORE_DIR: 'schemas' }, stdio: ['ignore', 'pipe', 'pipe'] });
let log = ''; bridge.stdout.on('data', chunk => { log += chunk; }); bridge.stderr.on('data', chunk => { log += chunk; });
const port = await new Promise<number>((resolve, reject) => { const timer = setTimeout(() => reject(new Error(`bridge did not listen: ${log}`)), 20_000); const poll = () => { const match = /listening on :(\d+)/.exec(log); if (match) { clearTimeout(timer); resolve(Number(match[1])); } else setTimeout(poll, 100); }; poll(); });
const base = `http://127.0.0.1:${port}`;
const run = async (tool: string, input: unknown) => { const response = await fetch(`${base}/run`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-bridge-token': 's201-token' }, body: JSON.stringify({ tool, input }) }); const body = await response.json() as { ok: boolean; result: any }; assert(response.ok && body.ok, JSON.stringify(body).slice(0, 600)); return body.result; };
const appFrame = (page: Page): Frame => { const frame = page.frames().find(candidate => candidate.url().includes('/app?')); assert(frame, 'app frame'); return frame; };
const browser = await chromium.launch({ headless: true });
const receipts: Record<string, unknown> = { head, bridge: base };
try {
  const preview = await run('design_preview', { object: 'Subscription', context: 'detail' });
  receipts.toolMeasured = preview.measured;
  assert.deepEqual(preview.measured.validation, ['react', 'vue']);
  assert(preview.measured.charts.placed > 0);
  assert.deepEqual(preview.measured.axe, []);
  const page = await browser.newPage({ viewport: { width: 1800, height: 1200 }, locale: 'en-US', timezoneId: 'UTC' });
  const errors: string[] = []; page.on('pageerror', error => errors.push(`page: ${error.message}`)); page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  const perFramework: Record<string, unknown> = {};
  for (const framework of ['react', 'vue'] as const) {
    await page.goto(`${base}/preview/${preview.compositionId}/1?framework=${framework}&brand=A&theme=light`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => (document.querySelector('[data-oods-app]') as HTMLIFrameElement).contentWindow!.document.documentElement.dataset.oodsAxeRuns === '1', undefined, { timeout: 60_000 });
    await page.waitForFunction(() => document.documentElement.dataset.oodsMeasured === '1', undefined, { timeout: 30_000 });
    const light = await appFrame(page).evaluate(() => (window as any).__oodsPreview.axe);
    await page.locator('button[data-control="theme"][data-value="dark"]').click();
    await page.waitForFunction(() => (document.querySelector('[data-oods-app]') as HTMLIFrameElement).contentWindow!.document.documentElement.dataset.oodsAxeRuns === '2', undefined, { timeout: 60_000 });
    await page.waitForFunction(() => document.documentElement.dataset.oodsMeasured === '2', undefined, { timeout: 30_000 });
    const dark = await appFrame(page).evaluate(() => (window as any).__oodsPreview.axe);
    const panel = await page.locator('[data-oods-measurements]').innerText();
    const measured = await page.locator('[data-oods-measured]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-oods-measured')));
    const notMeasured = await page.locator('[data-oods-not-measured]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-oods-not-measured')));
    await page.screenshot({ path: path.join(out, `measurements-${framework}.png`), fullPage: true });
    assert.deepEqual([light.stored, light.scope, dark.stored, dark.scope], [true, 'A/light', true, 'A/dark'], JSON.stringify({ light, dark }));
    assert(measured.includes(`axe:${framework}:A/light`) && measured.includes(`axe:${framework}:A/dark`), measured.join(','));
    assert(notMeasured.includes(`axe:${framework}:A/hc`) && notMeasured.includes(`axe:${framework}:B/light`), notMeasured.join(','));
    assert(measured.includes('validation:react') && measured.includes('validation:vue'));
    assert(measured.some(entry => entry!.startsWith('chart:src/charts/')));
    perFramework[framework] = { light, dark, measured, notMeasured, panelExcerpt: panel.slice(0, 1200) };
  }
  const after = await run('design_preview', { compositionId: preview.compositionId, version: 1 });
  assert.deepEqual([...after.measured.axe].sort(), ['react:A/dark', 'react:A/light', 'vue:A/dark', 'vue:A/light']);
  const stored = await (await fetch(`${base}/preview/${preview.compositionId}/1/measurements.json`)).json();
  receipts.stored = { validationFrameworks: Object.keys(stored.validation), charts: stored.charts.map((chart: any) => ({ path: chart.path, conformant: chart.certification.conformant, coverage: chart.certification.coverage, pillars: chart.certification.pillars })), axe: Object.fromEntries(Object.entries(stored.axe).map(([framework, scopes]: [string, any]) => [framework, Object.fromEntries(Object.entries(scopes).map(([scope, result]: [string, any]) => [scope, { engine: result.engine, violations: result.violations.map((v: any) => `${v.id}:${v.impact}:${v.nodes}`), passes: result.passes, incomplete: result.incomplete, inapplicable: result.inapplicable }]))])) };
  receipts.toolMeasuredAfter = after.measured;
  receipts.browser = perFramework; receipts.browserErrors = errors;
  assert.deepEqual(errors, [], errors.join(' | '));
  await page.close();
} finally { await browser.close(); bridge.kill('SIGTERM'); await new Promise(resolve => bridge.once('close', resolve)); fs.rmSync(storeRoot, { recursive: true, force: true }); }
fs.writeFileSync(path.join(out, 'measurements.json'), JSON.stringify(receipts, null, 2) + '\n');
console.log(`m04 browser receipts → ${out}`);
