/**
 * s202-m03 receipts: the preview app inside the conversation, in the reference host (Chromium, the double iframe on two
 * 127.0.0.1 origins, the spec's default CSP, the SDK's app-bridge, the real adapter over stdio). For a Subscription detail
 * composition: the app resource (bytes, digests, the inlined runtime, the width queries its frame answers); React and Vue
 * × brands A/B × themes light/dark/hc mounted through the app's own switches, each against the Sprint 201 browser page
 * for the same version and scope (component counts and names, canvas and text colour), with the scope its placed chart
 * was rendered for and a screenshot; the host's dark theme as the initial theme; the container width and 390/820/1440,
 * with fullscreen requested where the container cannot show the width. Console errors, page errors and CSP violations
 * must be zero.
 *
 *   pnpm exec tsx scripts/product-reality/s202-preview-app.ts [--out artifacts/product-reality/sprint-202/m03/reference-host]
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import type { Frame } from 'playwright';
import { ROOT, ReferenceHost, type Json } from './s202-reference-host.js';

const outIndex = process.argv.indexOf('--out');
const out = path.resolve(ROOT, outIndex >= 0 ? process.argv[outIndex + 1]! : 'artifacts/product-reality/sprint-202/m03/reference-host');
fs.mkdirSync(out, { recursive: true });
const git = (...args: string[]) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();

type AppState = Json & { mounts: number; pending: string | null; errors: string[]; framework: string; brand: string; theme: string; themeSource: string; components: number; componentNames: string[]; generatedFor: Json; appWidth: number; containerWidth: number | null; displayMode: string; toolCalls: Json[]; displayModeRequests: Json[]; reads: string[]; recordScopes: string[] };
const stateOf = (frame: Frame) => frame.evaluate(() => {
  const { record, versions, ...rest } = (window as unknown as { __oodsPreviewApp: Record<string, unknown> & { record?: { scopes?: Record<string, unknown> }; versions?: unknown[] } }).__oodsPreviewApp;
  return { ...rest, recordScopes: Object.keys(record?.scopes ?? {}).sort(), versionCount: versions?.length ?? 0 };
}) as unknown as Promise<AppState>;
async function mountedAfter(frame: Frame, previous: number): Promise<AppState> {
  await frame.waitForFunction(count => {
    const state = (window as unknown as { __oodsPreviewApp?: { errors: string[]; mounts: number; pending: string | null } }).__oodsPreviewApp;
    return Boolean(state) && (state!.errors.length > 0 || (state!.mounts > count && state!.pending === null));
  }, previous, { timeout: 300_000 });
  const state = await stateOf(frame);
  assert.deepEqual(state.errors, [], `the app reported: ${state.errors.join(' | ')}`);
  return state;
}
const click = (frame: Frame, control: string, value: string | number) => frame.click(`button[data-control="${control}"][data-value="${value}"]`);
const countKinds = (events: Json[]) => events.reduce<Record<string, number>>((counts, event) => ({ ...counts, [String(event.kind)]: (counts[String(event.kind)] ?? 0) + 1 }), {});
const hostChecks = (host: ReferenceHost) => ({ consoleErrors: host.consoleErrors, pageErrors: host.pageErrors, cspViolations: host.cspViolations, stdoutNonJson: host.rpc.nonJson, negotiation: host.rpc.negotiationReceipt() });
function assertClean(host: ReferenceHost, label: string): void {
  assert.deepEqual(host.consoleErrors, [], `${label}: console errors`);
  assert.deepEqual(host.pageErrors, [], `${label}: page errors`);
  assert.deepEqual(host.cspViolations, [], `${label}: CSP violations`);
  assert.deepEqual(host.rpc.nonJson, [], `${label}: non-JSON stdout`);
}

/** The Sprint 201 browser page for the same version and scope, mounted and measured (its axe result is stored before the next act). */
async function browserPage(host: ReferenceHost, appUrl: string, scope: Record<string, string>) {
  const url = new URL(appUrl);
  for (const [key, value] of Object.entries(scope)) url.searchParams.set(key, value);
  const page = await host.browser.newPage({ viewport: { width: 1100, height: 900 } });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  try {
    await page.goto(url.href, { waitUntil: 'load' });
    await page.waitForFunction(() => document.documentElement.dataset.oodsPreviewMounted === 'true' && document.documentElement.dataset.oodsAxeRuns === '1', undefined, { timeout: 120_000 });
    const observed = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('[data-oods-component]'));
      const body = getComputedStyle(document.body);
      return { components: nodes.length, componentNames: [...new Set(nodes.map(node => node.getAttribute('data-oods-component') ?? ''))].sort(), canvas: body.backgroundColor, text: body.color, generatedFor: (window as unknown as { __oodsPreview: { generatedFor: unknown } }).__oodsPreview.generatedFor };
    });
    assert.deepEqual(errors, [], `browser page ${url.href}: ${errors.join(' | ')}`);
    return { url: url.pathname + url.search, ...observed };
  } finally { await page.close(); }
}

/** What the inner frame shows: the scope on the document and the app frame, its canvas and text, its width, a sidebar layout's columns (the width queries), the panel's counts. */
const frameView = (frame: Frame) => frame.evaluate(() => {
  const appFrame = document.querySelector<HTMLElement>('[data-oods-app-frame]')!;
  const style = getComputedStyle(appFrame);
  const sidebar = appFrame.querySelector<HTMLElement>('[data-layout=sidebar]');
  const measurements = document.querySelector<HTMLElement>('[data-oods-measurements]');
  return {
    theme: appFrame.dataset.theme, brand: appFrame.dataset.brand, document: { theme: document.documentElement.dataset.theme, brand: document.documentElement.dataset.brand },
    canvas: style.backgroundColor, text: style.color, width: Math.round(appFrame.getBoundingClientRect().width),
    sidebarColumns: sidebar ? getComputedStyle(sidebar).gridTemplateColumns : null,
    measured: document.querySelectorAll('[data-oods-measured]').length, notMeasured: Number(measurements?.dataset.oodsNotMeasuredCount ?? 0),
    status: document.querySelector('[data-oods-preview-status]')?.textContent ?? '',
  };
});

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'packages/mcp-bridge/dist/preview-app/manifest.json'), 'utf8')) as Json;
const receipts: Json = { head: git('rev-parse', 'HEAD'), dirty: git('status', '--porcelain').length > 0, generatedAt: new Date().toISOString(), app: { file: 'packages/mcp-bridge/dist/preview-app/app.html', ...manifest } };

// 1. React and Vue × A/B × light/dark/hc through the app's own switches, each against the browser page.
const matrixHost = await ReferenceHost.open({ negotiate: true, hostContext: { theme: 'light', containerDimensions: { width: 900, maxHeight: 2400 } } });
try {
  const rendered = await matrixHost.render('design_preview', { object: 'Subscription', context: 'detail' }, { width: 900, height: 2400 });
  let state = await mountedAfter(rendered.appFrame, 0);
  const structured = (rendered.result as { structuredContent: { compositionId: string; version: number; previews: Array<{ appUrl: string }> } }).structuredContent;
  const appUrl = structured.previews[0]!.appUrl;
  const cells: Json[] = [];
  for (const framework of ['react', 'vue'] as const) {
    if (state.framework !== framework) { await click(rendered.appFrame, 'framework', framework); state = await mountedAfter(rendered.appFrame, state.mounts); }
    for (const brand of ['A', 'B'] as const) for (const theme of ['light', 'dark', 'hc'] as const) {
      if (state.brand !== brand) { await click(rendered.appFrame, 'brand', brand); state = await mountedAfter(rendered.appFrame, state.mounts); }
      if (state.theme !== theme) { await click(rendered.appFrame, 'theme', theme); state = await mountedAfter(rendered.appFrame, state.mounts); }
      const view = await frameView(rendered.appFrame);
      const page = await browserPage(matrixHost, appUrl, { framework, brand, theme });
      const screenshot = `${framework}-${brand}-${theme}.png`;
      await matrixHost.page.screenshot({ path: path.join(out, screenshot), fullPage: true });
      const label = `${framework} ${brand}/${theme}`;
      assert.equal(state.components, page.components, `${label}: ${state.components} components in the app, ${page.components} in the browser page`);
      assert.deepEqual(state.componentNames, page.componentNames, `${label}: component names`);
      assert.deepEqual({ canvas: view.canvas, text: view.text }, { canvas: page.canvas, text: page.text }, `${label}: the app's canvas and text against the browser page`);
      assert.deepEqual(state.generatedFor, { brand, theme, chartScoped: true }, `${label}: the scope the placed chart was rendered for`);
      assert.deepEqual({ frame: { theme: view.theme, brand: view.brand }, document: view.document }, { frame: { theme, brand }, document: { theme, brand } }, `${label}: the scope on the document and the app frame`);
      cells.push({ framework, brand, theme, app: { mounts: state.mounts, components: state.components, componentNames: state.componentNames, generatedFor: state.generatedFor, module: state.module, styles: state.styles, view }, browserPage: page, screenshot });
      console.log(`${label}: ${state.components} components (browser page ${page.components}); canvas ${view.canvas} (page ${page.canvas}); chart rendered for ${JSON.stringify(state.generatedFor)}`);
    }
  }
  const canvases = new Set(cells.map(cell => ((cell.app as Json).view as Json).canvas as string));
  assert(canvases.size > 1, `every scope showed the same canvas (${[...canvases].join(', ')}): the scope's tokens did not reach the app`);
  const final = await stateOf(rendered.appFrame);
  assertClean(matrixHost, 'matrix');
  receipts.matrix = {
    compositionId: structured.compositionId, version: structured.version, resourceUri: rendered.resourceUri, container: { width: 900 }, cells, distinctCanvases: [...canvases],
    toolCalls: final.toolCalls, recordScopes: final.recordScopes, resourceReads: final.reads.length, events: countKinds(matrixHost.events), host: hostChecks(matrixHost),
  };
} finally { await matrixHost.close(); }

// 2. The host shapes the first view: its dark theme and a 760px container; then the fixed widths, fullscreen where 760 cannot show them.
const darkHost = await ReferenceHost.open({ negotiate: true, hostContext: { theme: 'dark', containerDimensions: { width: 760, maxHeight: 2400 } } });
try {
  const rendered = await darkHost.render('design_preview', { object: 'Subscription', context: 'detail', framework: 'react' }, { width: 760, height: 2400 });
  const first = await mountedAfter(rendered.appFrame, 0);
  assert.deepEqual({ theme: first.theme, themeSource: first.themeSource, appWidth: first.appWidth, containerWidth: first.containerWidth }, { theme: 'dark', themeSource: 'host', appWidth: 760, containerWidth: 760 });
  const initialView = await frameView(rendered.appFrame);
  const initialPage = await browserPage(darkHost, (rendered.result as { structuredContent: { previews: Array<{ appUrl: string }> } }).structuredContent.previews[0]!.appUrl, { framework: 'react', brand: 'A', theme: 'dark' });
  assert.deepEqual({ components: first.components, canvas: initialView.canvas, text: initialView.text }, { components: initialPage.components, canvas: initialPage.canvas, text: initialPage.text }, 'the host-dark first view against the browser page for A/dark');
  const widths: Json[] = [];
  for (const width of ['fit', 390, 820, 1440] as const) {
    await click(rendered.appFrame, 'width', width);
    const pixels = width === 'fit' ? 760 : width;
    const mode = width !== 'fit' && width > 760 ? 'fullscreen' : 'inline';
    await rendered.appFrame.waitForFunction(([px, expected]) => { const state = (window as unknown as { __oodsPreviewApp: { appWidth: number; displayMode: string } }).__oodsPreviewApp; return state.appWidth === px && state.displayMode === expected; }, [pixels, mode] as const, { timeout: 30_000 });
    const state = await stateOf(rendered.appFrame);
    const screenshot = `host-dark-width-${width}.png`;
    await darkHost.page.screenshot({ path: path.join(out, screenshot), fullPage: true });
    widths.push({ width, appWidth: state.appWidth, displayMode: state.displayMode, view: await frameView(rendered.appFrame), screenshot });
    console.log(`host dark, width ${width}: app ${state.appWidth}px, ${state.displayMode}`);
  }
  const final = await stateOf(rendered.appFrame);
  assertClean(darkHost, 'host theme and widths');
  receipts.host = {
    hostContext: darkHost.hostContext,
    initial: { framework: first.framework, brand: first.brand, theme: first.theme, themeSource: first.themeSource, generatedFor: first.generatedFor, components: first.components, appWidth: first.appWidth, containerWidth: first.containerWidth, toolCalls: first.toolCalls, view: initialView, browserPage: initialPage },
    widths, displayModeRequests: final.displayModeRequests, events: countKinds(darkHost.events), host: hostChecks(darkHost),
  };
} finally { await darkHost.close(); }

fs.writeFileSync(path.join(out, 'preview-app.json'), JSON.stringify(receipts, null, 2) + '\n');
console.log(JSON.stringify({ out: path.relative(ROOT, out), app: { bytes: manifest.bytes, revision: manifest.revision }, cells: ((receipts.matrix as Json).cells as unknown[]).length, consoleErrors: 0, pageErrors: 0, cspViolations: 0 }));
