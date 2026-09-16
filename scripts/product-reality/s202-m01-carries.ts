/**
 * s202-m01 receipts: the Sprint 201 carries (#2111), before at the base and after at the producer fix, through
 * the built bridge in Chromium. Four measurements on a fresh Subscription detail version:
 *   1. axe-core stored per framework and scope after the running page measured itself (landmark-one-main,
 *      page-has-heading-one, region are the three shell findings);
 *   2. the placed chart at 390 / 820 / 1440: where its title is (inside the SVG or the figure heading) and the
 *      smallest rendered axis-label text in CSS px (font-size × the SVG's screen scale);
 *   3. every candidate the version offers for a swap, applied through design.preview action edit (both
 *      frameworks generate) and whether code.generate refused it;
 *   4. a brand and theme switch on the page: the scope the mounted chart was generated for versus the mounted scope.
 * `--phase before` records; `--phase after` also asserts the carries closed.
 *   pnpm exec tsx scripts/product-reality/s202-m01-carries.ts --phase before|after [--out <dir>]
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium, type Frame, type Page } from 'playwright';

const root = path.resolve(import.meta.dirname, '../..');
const option = (name: string, fallback: string) => { const index = process.argv.indexOf(name); return index >= 0 ? process.argv[index + 1]! : fallback; };
const phase = option('--phase', 'before');
assert(phase === 'before' || phase === 'after', '--phase before|after');
const out = path.resolve(root, option('--out', `artifacts/product-reality/sprint-202/m01/${phase}`));
/** Rendered axis-label text at the 390 viewport must be at least this many CSS px (the wide chart's 10px labels at scale 1 are the reference; 9px keeps the label within one tenth of that). */
const LEGIBILITY_FLOOR_PX = 9;
const SHELL_FINDINGS = ['landmark-one-main', 'page-has-heading-one', 'region'];
fs.mkdirSync(out, { recursive: true });
const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const dirty = execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim().length > 0;
const storeRoot = fs.mkdtempSync(path.join(os.tmpdir(), `oods-s202-m01-${phase}-`));
const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');
const bridge = spawn(process.execPath, ['dist/server.js'], { cwd: path.join(root, 'packages/mcp-bridge'), env: { ...process.env, MCP_BRIDGE_PORT: '0', BRIDGE_TOKEN: 's202-token', MCP_SCHEMA_STORE_ROOT: storeRoot, MCP_SCHEMA_STORE_DIR: 'schemas' }, stdio: ['ignore', 'pipe', 'pipe'] });
let log = ''; bridge.stdout.on('data', chunk => { log += chunk; }); bridge.stderr.on('data', chunk => { log += chunk; });
const port = await new Promise<number>((resolve, reject) => { const timer = setTimeout(() => reject(new Error(`bridge did not listen: ${log}`)), 20_000); const poll = () => { const match = /listening on :(\d+)/.exec(log); if (match) { clearTimeout(timer); resolve(Number(match[1])); } else setTimeout(poll, 100); }; poll(); });
const base = `http://127.0.0.1:${port}`;
// The bridge allows 30 /run calls a minute; the swap loop alone makes more, so a 429 waits out the window and retries.
const run = async (tool: string, input: unknown): Promise<{ ok: boolean; result?: any; error?: any }> => {
  for (let attempt = 0; ; attempt += 1) {
    const response = await fetch(`${base}/run`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-bridge-token': 's202-token' }, body: JSON.stringify({ tool, input }) });
    const body = await response.json() as { ok: boolean; result?: any; error?: any };
    // The bridge's HTTP window (429) and the server's per-tool policy window (OODS-R001) both clear within a minute.
    if ((response.status === 429 || body?.error?.code === 'OODS-R001') && attempt < 8) { await new Promise(resolve => setTimeout(resolve, 15_000)); continue; }
    return body;
  }
};
const must = async (tool: string, input: unknown) => { const body = await run(tool, input); assert(body.ok, JSON.stringify(body).slice(0, 800)); return body.result; };
const appFrame = (page: Page): Frame => { const frame = page.frames().find(candidate => candidate.url().includes('/app?')); assert(frame, 'app frame'); return frame; };
const browser = await chromium.launch({ headless: true });
const receipts: Record<string, unknown> = { phase, head, dirty, bridge: base, legibilityFloorPx: LEGIBILITY_FLOOR_PX, shellFindings: SHELL_FINDINGS };
const errors: string[] = [];
const watch = (page: Page) => { page.on('pageerror', error => errors.push(`page: ${error.message}`)); page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); }); };
try {
  const preview = await must('design_preview', { object: 'Subscription', context: 'detail' });
  const id: string = preview.compositionId;
  receipts.composition = { compositionId: id, version: preview.version, head: preview.head, schemaHash: preview.schemaHash, measured: preview.measured };

  // 1. axe-core stored by the running page, both frameworks, light then dark.
  const axe: Record<string, unknown> = {};
  for (const framework of ['react', 'vue'] as const) {
    const page = await browser.newPage({ viewport: { width: 1800, height: 1200 }, locale: 'en-US', timezoneId: 'UTC' }); watch(page);
    await page.goto(`${base}/preview/${id}/1?framework=${framework}&brand=A&theme=light`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => (document.querySelector('[data-oods-app]') as HTMLIFrameElement).contentWindow!.document.documentElement.dataset.oodsAxeRuns === '1', undefined, { timeout: 60_000 });
    await page.waitForFunction(() => document.documentElement.dataset.oodsMeasured === '1', undefined, { timeout: 30_000 });
    await page.locator('button[data-control="theme"][data-value="dark"]').click();
    await page.waitForFunction(() => (document.querySelector('[data-oods-app]') as HTMLIFrameElement).contentWindow!.document.documentElement.dataset.oodsAxeRuns === '2', undefined, { timeout: 60_000 });
    await page.waitForFunction(() => document.documentElement.dataset.oodsMeasured === '2', undefined, { timeout: 30_000 });
    const landmarks = await appFrame(page).evaluate(() => ({ main: document.querySelectorAll('main').length, h1: document.querySelectorAll('h1').length, h1Text: Array.from(document.querySelectorAll('h1')).map(node => node.textContent?.trim()), topLevel: Array.from(document.querySelector('#app')!.children).map(node => `${node.tagName.toLowerCase()}${node.id ? '#' + node.id : ''}`) }));
    await page.screenshot({ path: path.join(out, `axe-${framework}.png`), fullPage: true });
    await page.close();
    const stored = await (await fetch(`${base}/preview/${id}/1/measurements.json`)).json() as { axe: Record<string, Record<string, { engine: { name: string; version: string }; violations: Array<{ id: string; impact: string | null; nodes: number; targets: string[] }>; passes: number; incomplete: number; inapplicable: number }>> };
    axe[framework] = { landmarks, scopes: Object.fromEntries(Object.entries(stored.axe[framework] ?? {}).map(([scope, result]) => [scope, { engine: result.engine, violations: result.violations.map(violation => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes, targets: violation.targets })), shellFindings: result.violations.filter(violation => SHELL_FINDINGS.includes(violation.id)).map(violation => `${violation.id}:${violation.nodes}`), passes: result.passes, incomplete: result.incomplete, inapplicable: result.inapplicable }])) };
  }
  receipts.axe = axe;

  // 2. The placed chart at the three fixed widths: title placement and the smallest rendered axis-label text.
  const chart: Record<string, unknown> = {};
  for (const framework of ['react', 'vue'] as const) {
    const perWidth: Record<string, unknown> = {};
    for (const width of [390, 820, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 1400 }, locale: 'en-US', timezoneId: 'UTC' }); watch(page);
      await page.goto(`${base}/preview/${id}/1/app?framework=${framework}&brand=A&theme=light`, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => document.documentElement.dataset.oodsPreviewMounted === 'true', undefined, { timeout: 30_000 });
      await page.evaluate(() => document.fonts.ready);
      const measured = await page.evaluate(({ title }) => {
        const figure = document.querySelector('[data-oods-component="VizAreaPreview"]') as HTMLElement | null;
        if (!figure) return { present: false };
        let visibleSvg: SVGSVGElement | null = null;
        const svgs: Array<{ holder: string; visible: boolean; viewBox: string | null; renderedWidth: number }> = [];
        for (const candidate of Array.from(figure.querySelectorAll('svg'))) {
          const visible = candidate.getClientRects().length > 0;
          if (visible && !visibleSvg) visibleSvg = candidate;
          svgs.push({ holder: candidate.parentElement?.hasAttribute('data-viz-svg') ? 'wide' : candidate.parentElement?.hasAttribute('data-viz-svg-narrow') ? 'narrow' : 'other', visible, viewBox: candidate.getAttribute('viewBox'), renderedWidth: Math.round(candidate.getBoundingClientRect().width * 100) / 100 });
        }
        const figcaption = figure.querySelector('figcaption');
        const escaped = title.replace(/&/g, '&amp;');
        const texts: Array<{ content: string; role: string; fontPx: number; scale: number; renderedPx: number }> = [];
        let titleInSvg: boolean | null = null;
        if (visibleSvg) {
          titleInSvg = visibleSvg.querySelector('[class*="role-title-text"]') !== null;
          for (const node of Array.from(visibleSvg.querySelectorAll('text'))) {
            const content = node.textContent?.trim() ?? '';
            if (content === title || content === escaped) titleInSvg = true;
            const style = getComputedStyle(node);
            const ctm = node.getScreenCTM();
            const fontPx = parseFloat(style.fontSize);
            const scale = ctm ? Math.sqrt(ctm.a * ctm.a + ctm.b * ctm.b) : 1;
            const role = node.closest('[class*="role-axis-label"]') ? 'axis-label' : node.closest('[class*="role-axis-title"]') ? 'axis-title' : node.closest('[class*="role-title"]') ? 'title' : node.closest('[class*="role-legend"]') ? 'legend' : 'other';
            texts.push({ content, role, fontPx, scale: Math.round(scale * 1000) / 1000, renderedPx: Math.round(fontPx * scale * 100) / 100 });
          }
        }
        let smallestAxisLabel: typeof texts[number] | null = null;
        let smallestText: typeof texts[number] | null = null;
        for (const entry of texts) {
          if (!smallestText || entry.renderedPx < smallestText.renderedPx) smallestText = entry;
          if (entry.role === 'axis-label' && (!smallestAxisLabel || entry.renderedPx < smallestAxisLabel.renderedPx)) smallestAxisLabel = entry;
        }
        return { present: true, figureWidth: Math.round(figure.getBoundingClientRect().width * 100) / 100, svgs, visible: visibleSvg ? { viewBox: visibleSvg.getAttribute('viewBox'), renderedWidth: Math.round(visibleSvg.getBoundingClientRect().width * 100) / 100 } : null, figcaption: figcaption ? figcaption.textContent?.trim() : null, titleInSvg, textCount: texts.length, smallestAxisLabel, smallestText, ariaLabel: figure.getAttribute('aria-label') };
      }, { title: 'Payment amounts' });
      await page.locator('[data-oods-component="VizAreaPreview"]').screenshot({ path: path.join(out, `chart-${framework}-${width}.png`) }).catch(() => undefined);
      await page.close();
      perWidth[String(width)] = measured;
    }
    chart[framework] = perWidth;
  }
  receipts.chart = chart;

  // 3. Every candidate the version offers for a swap, applied through action edit (both frameworks generate).
  const opened = await must('design_preview', { compositionId: id, version: 1 });
  const candidates: Array<Record<string, unknown>> = [];
  for (const slot of opened.editable.slots as Array<{ slotName: string; selectedComponent: string | null; candidates: string[] }>) {
    for (const candidate of slot.candidates) {
      if (candidate === slot.selectedComponent) continue;
      const body = await run('design_preview', { action: 'edit', compositionId: id, version: 1, edit: { operation: 'swap-slot', slot: slot.slotName, component: candidate } });
      const message: string = body.ok ? '' : String(body.error?.message ?? JSON.stringify(body.error ?? body));
      const code = body.ok ? null : (/OODS-[A-Z]\d{3}/.exec(message)?.[0] ?? body.error?.code ?? 'unknown');
      candidates.push({ slot: slot.slotName, from: slot.selectedComponent, to: candidate, status: body.ok ? 'generated' : 'refused', ...(body.ok ? { version: body.result.version, artifacts: (body.result.previews as Array<{ framework: string }>).map(entry => entry.framework) } : { code, message: message.slice(0, 400) }) });
    }
  }
  receipts.candidates = { slots: (opened.editable.slots as Array<{ slotName: string; selectedComponent: string | null; candidates: string[] }>).map(slot => ({ slot: slot.slotName, selected: slot.selectedComponent, candidates: slot.candidates })), swaps: candidates, refused: candidates.filter(entry => entry.status === 'refused').map(entry => `${entry.slot}→${entry.to}:${entry.code}`) };

  // 4. A brand and theme switch on version 1: the scope the mounted chart was generated for versus the mounted scope.
  // The swaps above spent the native server's design.preview window (10 a minute); the switch's own re-generation needs it clear.
  await new Promise(resolve => setTimeout(resolve, 65_000));
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, locale: 'en-US', timezoneId: 'UTC' }); watch(page);
  await page.goto(`${base}/preview/${id}/1?framework=react&brand=A&theme=light`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.documentElement.dataset.oodsAppMounted === 'true', undefined, { timeout: 30_000 });
  const observe = () => appFrame(page).evaluate(() => {
    const identity = (window as unknown as { __oodsPreview: Record<string, unknown> }).__oodsPreview;
    const svg = Array.from(document.querySelectorAll('[data-oods-component="VizAreaPreview"] svg')).find(candidate => candidate.getClientRects().length > 0) as SVGSVGElement | undefined;
    const paths = svg ? Array.from(svg.querySelectorAll('path')).map(node => node.getAttribute('fill')).filter((fill): fill is string => Boolean(fill && fill !== 'none')) : [];
    return { mounted: { brand: document.documentElement.dataset.brand, theme: document.documentElement.dataset.theme }, generatedFor: identity.generatedFor, mounts: identity.mounts, scopeError: identity.scopeError ?? null, scopeCharts: Array.isArray(identity.scopeCharts) ? (identity.scopeCharts as Array<{ path: string; brand: string; theme: string; certification: { conformant: boolean | null } }>).map(chart => ({ path: chart.path, scope: `${chart.brand}/${chart.theme}`, conformant: chart.certification?.conformant ?? null })) : null, pending: document.documentElement.dataset.oodsScopePending ?? null, canvas: svg?.querySelector(':scope > rect')?.getAttribute('fill') ?? null, firstAreaFill: paths[0] ?? null, svgLength: svg?.outerHTML.length ?? null, svgText: svg?.outerHTML ?? '' };
  }).then(observed => ({ ...observed, svgSha256: observed.svgText ? sha256(observed.svgText) : null, svgText: undefined }));
  const before = await observe();
  await page.locator('button[data-control="brand"][data-value="B"]').click();
  await page.waitForFunction(() => (document.querySelector('[data-oods-app]') as HTMLIFrameElement).contentWindow!.document.documentElement.dataset.brand === 'B', undefined, { timeout: 30_000 });
  await page.locator('button[data-control="theme"][data-value="dark"]').click();
  await page.waitForFunction(() => { const doc = (document.querySelector('[data-oods-app]') as HTMLIFrameElement).contentWindow!.document; return doc.documentElement.dataset.theme === 'dark' && doc.documentElement.dataset.oodsPreviewMounted === 'true' && doc.documentElement.dataset.oodsScopePending === undefined; }, undefined, { timeout: 120_000 });
  await page.waitForTimeout(500);
  const after = await observe();
  await page.screenshot({ path: path.join(out, 'scope-switch-B-dark.png'), fullPage: true });
  await page.close();
  const reopened = await must('design_preview', { compositionId: id, version: 1 });
  receipts.scopeSwitch = { before, after, chartChanged: before.svgSha256 !== after.svgSha256, canvasChanged: before.canvas !== after.canvas, measuredAfter: reopened.measured };
  receipts.browserErrors = errors;

  if (phase === 'after') {
    for (const framework of ['react', 'vue'] as const) {
      const scopes = (axe[framework] as { scopes: Record<string, { shellFindings: string[] }>; landmarks: { main: number; h1: number } }).scopes;
      for (const scope of ['A/light', 'A/dark']) assert.deepEqual(scopes[scope]?.shellFindings, [], `${framework} ${scope} still reports ${JSON.stringify(scopes[scope]?.shellFindings)}`);
      const landmarks = (axe[framework] as { landmarks: { main: number; h1: number; h1Text: string[] } }).landmarks;
      assert.deepEqual({ main: landmarks.main, h1: landmarks.h1 }, expect1(), `${framework} landmarks`);
      assert(landmarks.h1Text[0], `${framework}: the h1 is empty`);
      const narrow = (chart[framework] as Record<string, { figcaption: string | null; titleInSvg: boolean | null; smallestAxisLabel: { renderedPx: number } | null }>)['390']!;
      assert.equal(narrow.titleInSvg, false, `${framework}: the title is still painted inside the SVG at 390`);
      assert.equal(narrow.figcaption, 'Payment amounts', `${framework}: no figure heading at 390`);
      assert(narrow.smallestAxisLabel && narrow.smallestAxisLabel.renderedPx >= LEGIBILITY_FLOOR_PX, `${framework}: axis labels render at ${narrow.smallestAxisLabel?.renderedPx}px at 390, below ${LEGIBILITY_FLOOR_PX}px`);
    }
    assert.deepEqual((receipts.candidates as { refused: string[] }).refused, [], 'an offered candidate was refused');
    assert.deepEqual(after.mounted, { brand: 'B', theme: 'dark' });
    assert.deepEqual(after.generatedFor, expectGeneratedFor(), `generatedFor does not name the mounted scope (scopeError: ${String(after.scopeError)})`);
    assert(before.svgSha256 !== after.svgSha256, 'the chart did not re-render for the switched scope');
    assert((reopened.measured.charts.scopes as string[]).includes('B/dark'), 'the version carries no certification for B/dark');
    assert.deepEqual(errors, [], errors.join(' | '));
  }
} finally { await browser.close(); bridge.kill('SIGTERM'); await new Promise(resolve => bridge.once('close', resolve)); fs.rmSync(storeRoot, { recursive: true, force: true }); }
function expect1() { return { main: 1, h1: 1 }; }
function expectGeneratedFor() { return { brand: 'B', theme: 'dark', chartScoped: true }; }
fs.writeFileSync(path.join(out, 'carries.json'), JSON.stringify(receipts, null, 2) + '\n');
console.log(JSON.stringify({ phase, out: path.relative(root, out), axe: Object.fromEntries(Object.entries(receipts.axe as Record<string, { scopes: Record<string, { shellFindings: string[] }> }>).map(([framework, value]) => [framework, Object.fromEntries(Object.entries(value.scopes).map(([scope, result]) => [scope, result.shellFindings]))])), chart390: Object.fromEntries(Object.entries(receipts.chart as Record<string, Record<string, { figcaption: string | null; titleInSvg: boolean | null; smallestAxisLabel: { renderedPx: number } | null }>>).map(([framework, widths]) => [framework, { figcaption: widths['390']!.figcaption, titleInSvg: widths['390']!.titleInSvg, smallestAxisLabelPx: widths['390']!.smallestAxisLabel?.renderedPx ?? null }])), refused: (receipts.candidates as { refused: string[] }).refused, scopeSwitch: { generatedFor: (receipts.scopeSwitch as { after: { generatedFor: unknown } }).after.generatedFor, chartChanged: (receipts.scopeSwitch as { chartChanged: boolean }).chartChanged }, browserErrors: errors.length }));
