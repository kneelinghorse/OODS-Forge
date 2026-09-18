import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify, { type FastifyInstance } from 'fastify';
import { chromium, type Browser } from 'playwright';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerPreviewHost } from '../../../mcp-bridge/src/preview/host.js';
import { readVersion, resolveCompositionsDir } from '../../src/lib/composition-store.js';
import { readRunView } from '../../src/lib/run-view.js';
import { handle as preview } from '../../src/tools/design.preview.js';
import { ReferenceHost } from '../../../../scripts/product-reality/s202-reference-host.js';

/**
 * Sprint 205 m04 — the run view, the first visible slice, proven on Stage1's data rather than a fixture.
 *
 * design.preview takes `runPath`: the run's REAL records — the run, its findings, its attested artifacts — are read
 * through structuredData.fetch's admitted run-view kinds (lib/run-view.ts) and become the screen's data, on the
 * browser page and inside the conversation app under the reference host's default CSP. Each finding carries its
 * result state (the neutral result family) and its provenance. Refusals write nothing. Nothing is proposed.
 */
function findStage1(): string | null {
  let dir = path.dirname(fileURLToPath(import.meta.url));
  for (let depth = 0; depth < 10; depth += 1) {
    const candidate = path.join(dir, 'Stage1');
    if (fs.existsSync(path.join(candidate, 'out/stage1'))) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}
const STAGE1 = findStage1();
const RUN = STAGE1 ? path.join(STAGE1, 'out/stage1/uswds-designsystem/6e435ce7-eaab-46b4-be6b-cea9b80defa6') : null;
const OTHER = STAGE1 ? path.join(STAGE1, 'out/stage1/tracelab-production-infer/d0a43821-5730-4bf3-8b40-20f6fcb6b69c') : null;
const hasRun = Boolean(RUN && fs.existsSync(RUN));
const root = path.resolve(fileURLToPath(import.meta.url), '../../../../..');
const TITLES = [
  'Elements must only use supported ARIA attributes', 'Elements must only use permitted ARIA attributes', 'Buttons must have discernible text',
  'ARIA role should be appropriate for the element', 'Table header text should not be empty',
];

let storeRoot: string;
let browser: Browser;
const servers: FastifyInstance[] = [];
const hosts: ReferenceHost[] = [];
beforeAll(async () => { browser = await chromium.launch(); });
afterAll(async () => { await browser.close(); });
beforeEach(() => { storeRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-run-view-')); vi.stubEnv('MCP_SCHEMA_STORE_ROOT', storeRoot); vi.stubEnv('MCP_SCHEMA_STORE_DIR', 'schemas'); vi.stubEnv('OODS_PREVIEW_HOST_URL', ''); });
afterEach(async () => {
  vi.unstubAllEnvs();
  for (const server of servers.splice(0)) await server.close();
  for (const host of hosts.splice(0)) await host.close();
  fs.rmSync(storeRoot, { recursive: true, force: true });
});
async function host(): Promise<string> {
  const server = Fastify();
  servers.push(server);
  await registerPreviewHost(server, { compositionsDir: resolveCompositionsDir(), runtimeDir: path.join(root, 'packages/mcp-bridge/dist/preview-runtime') });
  await server.listen({ port: 0, host: '127.0.0.1' });
  const address = server.server.address();
  return `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;
}
type Rendered = { previews: Array<{ appUrl: string }>; compositionId: string; version: number; recordPath: string };
async function pageText(url: string): Promise<{ text: string; errors: string[]; chips: string[] }> {
  const page = await browser.newPage();
  const errors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(String(error)));
  try {
    await page.goto(url);
    await page.waitForFunction(() => document.documentElement.dataset.oodsPreviewMounted === 'true', undefined, { timeout: 60_000 });
    const chips = await page.$$eval('[data-oods-component="StatusBadge"]', nodes => nodes.map(node => `${node.textContent?.trim()}|${node.getAttribute('data-tone') ?? ''}`));
    return { text: await page.innerText('body'), errors, chips };
  } finally { await page.close(); }
}

describe('the run view (s205-m04)', () => {
  it('finds the real run whenever Stage1 is checked out here', () => {
    if (!STAGE1) return; // the one honest skip: no Stage1 checkout
    expect(hasRun, `Stage1 is at ${STAGE1} but run 6e435ce7 is gone`).toBe(true);
  });

  it.runIf(hasRun)('reads the run through the admitted kinds and states what it covered', async () => {
    const view = await readRunView(RUN!);
    expect(view.kinds).toEqual({ run_manifest: 'unversioned (shape-pinned)', a11y_report: '2.2.0', report_index: '1.0.0', a11y_evidence: '1.1.0' });
    expect(view.coverage).toMatchObject({ findings: 6, pages: 40, pagesWithFindings: 4, evidenceRefs: 4, artifacts: 27, attestedFiles: 41 });
    expect(view.coverage.readMs).toBeLessThan(5_000);
    expect(view.records.Finding.every(finding => finding.result_state === 'violation' && finding.provenance_method === 'axe-core 4.11.0')).toBe(true);
    expect(view.records.Run[0]).toMatchObject({ target_name: 'uswds-designsystem', finding_count: 6, page_count: 40, critical_count: 2, unknown_count: 0 });
  });

  it.runIf(hasRun)('shows the run\'s real findings on the browser page: every title, a neutral result chip each, and provenance', async () => {
    const hostUrl = await host();
    const list = await preview({ object: 'Finding', context: 'list', framework: 'react', runPath: RUN! } as never, { previewHostUrl: hostUrl }) as unknown as Rendered;
    const { text, errors, chips } = await pageText(list.previews[0]!.appUrl);
    for (const title of TITLES) expect(text).toContain(title);
    expect(chips.filter(chip => chip.startsWith('Violation'))).toHaveLength(6);
    expect(errors, 'no console errors on the page').toEqual([]);
    const stored = await readVersion(resolveCompositionsDir(), list.compositionId, list.version);
    expect(stored.runView).toMatchObject({ runId: '6e435ce7-eaab-46b4-be6b-cea9b80defa6', target: 'uswds-designsystem', coverage: { findings: 6 } });

    const detail = await preview({ object: 'Finding', context: 'detail', framework: 'vue', runPath: RUN! } as never, { previewHostUrl: hostUrl }) as unknown as Rendered;
    const shown = await pageText(detail.previews[0]!.appUrl);
    for (const expected of ['Elements must only use supported ARIA attributes', 'axe-core 4.11.0', 'evidence/a11y/about_monthly-calls--5f548cfd.json', 'Stage1', 'Obtained by', 'Read from']) expect(shown.text).toContain(expected);
    expect(shown.errors).toEqual([]);

    const runList = await preview({ object: 'Run', context: 'list', framework: 'vue', runPath: RUN! } as never, { previewHostUrl: hostUrl }) as unknown as Rendered;
    const listed = await pageText(runList.previews[0]!.appUrl);
    // The run list shows THIS run — one row, named by its target — not the six seed records.
    expect(listed.text).toContain('uswds-designsystem');
    expect(listed.text).not.toContain('tracelab-production');
    expect(listed.errors).toEqual([]);

    const run = await preview({ object: 'Run', context: 'detail', framework: 'react', runPath: RUN! } as never, { previewHostUrl: hostUrl }) as unknown as Rendered;
    const runText = await pageText(run.previews[0]!.appUrl);
    for (const expected of ['uswds-designsystem', 'https://designsystem.digital.gov/', 'Stage1 app capture, 30 passes']) expect(runText.text).toContain(expected);
    expect(runText.errors).toEqual([]);
  }, 300_000);

  it.runIf(hasRun)('shows the same real findings inside the conversation, under the default CSP, with no console errors', async () => {
    expect(fs.existsSync(path.join(root, 'packages/mcp-bridge/dist/preview-app/app.html')), 'the preview app must be built').toBe(true);
    const reference = await ReferenceHost.open({ negotiate: true });
    hosts.push(reference);
    const rendered = await reference.render('design_preview', { object: 'Finding', context: 'list', framework: 'react', runPath: RUN });
    await rendered.appFrame.waitForFunction(() => (window as unknown as { __oodsPreviewApp?: { connected: boolean } }).__oodsPreviewApp?.connected === true, undefined, { timeout: 60_000 });
    await rendered.appFrame.waitForFunction(() => { const state = (window as unknown as { __oodsPreviewApp?: { record: unknown; errors: string[] } }).__oodsPreviewApp; return Boolean(state?.record) || (state?.errors.length ?? 0) > 0; }, undefined, { timeout: 120_000 });
    // The design itself mounts inside the app; wait for the real rows, not just the shell.
    await rendered.appFrame.waitForFunction((title: string) => document.body.innerText.includes(title), TITLES[0], { timeout: 120_000 });
    const text = await rendered.appFrame.evaluate(() => document.body.innerText);
    const errors = await rendered.appFrame.evaluate(() => (window as unknown as { __oodsPreviewApp: { errors: string[] } }).__oodsPreviewApp.errors);
    for (const title of TITLES) expect(text).toContain(title);
    expect(text).toContain('Violation');
    expect(errors, 'no errors in the app').toEqual([]);
    expect(reference.cspViolations, 'no CSP violations').toEqual([]);
    expect(reference.consoleErrors, 'no console errors in the host page').toEqual([]);
  }, 300_000);

  describe('refusals write nothing at all', () => {
    const stored = () => fs.existsSync(resolveCompositionsDir()) ? fs.readdirSync(resolveCompositionsDir(), { recursive: true }).sort() : [];

    it('OODS-V212 for a path that is not a Stage1 run', async () => {
      const hostUrl = await host();
      const notARun = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-not-a-run-'));
      try {
        await expect(preview({ object: 'Finding', context: 'list', framework: 'react', runPath: notARun } as never, { previewHostUrl: hostUrl })).rejects.toMatchObject({ opiCode: 'OODS-V212' });
        expect(stored()).toEqual([]);
      } finally { fs.rmSync(notARun, { recursive: true, force: true }); }
    }, 120_000);

    it.runIf(hasRun)('OODS-V213 for an artifact at a version the contract does not admit', async () => {
      const hostUrl = await host();
      const copy = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-run-copy-'));
      try {
        for (const relative of ['manifest.json', 'artifacts/a11y_report.json', 'artifacts/report-index.json', 'evidence/a11y']) fs.cpSync(path.join(RUN!, relative), path.join(copy, relative), { recursive: true });
        const reportPath = path.join(copy, 'artifacts/a11y_report.json');
        fs.writeFileSync(reportPath, JSON.stringify({ ...JSON.parse(fs.readFileSync(reportPath, 'utf8')), schema_version: '2.3.0' }));
        const manifest = JSON.parse(fs.readFileSync(path.join(copy, 'manifest.json'), 'utf8'));
        manifest.hashes['artifacts/a11y_report.json'] = crypto.createHash('sha256').update(fs.readFileSync(reportPath)).digest('hex');
        fs.writeFileSync(path.join(copy, 'manifest.json'), JSON.stringify(manifest));
        await expect(preview({ object: 'Finding', context: 'list', framework: 'react', runPath: copy } as never, { previewHostUrl: hostUrl })).rejects.toMatchObject({ opiCode: 'OODS-V213' });
        expect(stored()).toEqual([]);
      } finally { fs.rmSync(copy, { recursive: true, force: true }); }
    }, 120_000);

    it.runIf(hasRun)('OODS-V214 for a composition that is not a capture object', async () => {
      const hostUrl = await host();
      await expect(preview({ object: 'Mission', context: 'list', framework: 'react', runPath: RUN! } as never, { previewHostUrl: hostUrl })).rejects.toMatchObject({ opiCode: 'OODS-V214' });
      expect(stored()).toEqual([]);
    }, 120_000);

    it.runIf(hasRun && Boolean(OTHER && fs.existsSync(OTHER!)))('OODS-V214 for a run of a different target than the version already shows, leaving the version byte for byte', async () => {
      const hostUrl = await host();
      const shown = await preview({ object: 'Finding', context: 'list', framework: 'react', runPath: RUN! } as never, { previewHostUrl: hostUrl }) as unknown as Rendered;
      const before = fs.readFileSync(shown.recordPath);
      await expect(preview({ compositionId: shown.compositionId, version: shown.version, framework: 'react', runPath: OTHER! } as never, { previewHostUrl: hostUrl })).rejects.toMatchObject({ opiCode: 'OODS-V214' });
      expect(fs.readFileSync(shown.recordPath).equals(before)).toBe(true);
    }, 300_000);

    it.runIf(hasRun)('never writes into the run it reads', async () => {
      const before = fs.readdirSync(RUN!, { recursive: true }).sort();
      const manifest = fs.readFileSync(path.join(RUN!, 'manifest.json'));
      await readRunView(RUN!);
      expect(fs.readdirSync(RUN!, { recursive: true }).sort()).toEqual(before);
      expect(fs.readFileSync(path.join(RUN!, 'manifest.json')).equals(manifest)).toBe(true);
    });
  });

  it('the closure, extended over the run view: Stage1 only through structuredData.fetch, nothing else opened', () => {
    const code = (source: string): string => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
    const forbidden = /require\(['"](?:better-)?sqlite3|from ['"](?:better-)?sqlite3|cmos\.sqlite|hive_overview|tracelab_search|aquex|from ['"]node:(?:http|https|net|child_process)['"]|\bfetch\(|XMLHttpRequest|WebSocket/;
    const added = ['packages/mcp-server/src/lib/run-view.ts', 'packages/mcp-server/src/tools/structuredData.fetch.ts', 'packages/mcp-server/src/compose/result-state.ts', 'packages/mcp-server/src/compose/record-label.ts'];
    for (const file of added) expect(forbidden.test(code(fs.readFileSync(path.join(root, file), 'utf8'))), file).toBe(false);
    // The run view reads no file itself: every byte comes through the admitted contract.
    const runView = code(fs.readFileSync(path.join(root, 'packages/mcp-server/src/lib/run-view.ts'), 'utf8'));
    expect(runView).not.toMatch(/readFileSync|readFile\(|from ['"]node:fs/);
    expect(runView).toContain("from '../tools/structuredData.fetch.js'");
    // structuredData.fetch reads Stage1 output and writes nothing anywhere.
    expect(code(fs.readFileSync(path.join(root, 'packages/mcp-server/src/tools/structuredData.fetch.ts'), 'utf8'))).not.toMatch(/writeFile|appendFile|mkdirSync|rmSync|unlink/);
    // And across every source file of the server and the bridge: no other product's store, no Stage1 invocation.
    const walk = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : /\.ts$/.test(entry.name) && !/\.test\.ts$/.test(entry.name) ? [path.join(dir, entry.name)] : []);
    const store = /require\(['"](?:better-)?sqlite3|from ['"](?:better-)?sqlite3|cmos\.sqlite|hive_overview|tracelab_search|(?:spawn|exec|execFile|fork)(?:Sync)?\(\s*['"][^'"]*stage1/i;
    for (const file of [...walk(path.join(root, 'packages/mcp-server/src')), ...walk(path.join(root, 'packages/mcp-bridge/src'))]) {
      expect(store.test(code(fs.readFileSync(file, 'utf8'))), path.relative(root, file)).toBe(false);
    }
  });
});
