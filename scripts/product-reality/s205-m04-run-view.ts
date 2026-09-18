/**
 * s205-m04 — the run view's receipt: run 6e435ce7's real records on the four screens a run view needs, on the
 * browser page (React and Vue, 1440 and 390) and inside the conversation app under the reference host's default CSP.
 *
 *   pnpm exec tsx scripts/product-reality/s205-m04-run-view.ts artifacts/product-reality/sprint-205/m04
 *
 * It reads the run only through design.preview's runPath (lib/run-view.ts → structuredData.fetch) and writes only
 * under the output directory and a temp composition store. Nothing is written into Stage1.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { registerPreviewHost } from '../../packages/mcp-bridge/src/preview/host.js';
import { resolveCompositionsDir } from '../../packages/mcp-server/src/lib/composition-store.js';
import { readRunView } from '../../packages/mcp-server/src/lib/run-view.js';
import { handle as preview } from '../../packages/mcp-server/src/tools/design.preview.js';
import { ReferenceHost, ROOT } from './s202-reference-host.js';

// fastify is the bridge's dependency, not the root's: resolve it the way the bridge does.
const Fastify = createRequire(path.join(ROOT, 'packages/mcp-bridge/package.json'))('fastify') as () => { listen(options: { port: number; host: string }): Promise<unknown>; close(): Promise<unknown>; server: { address(): { port: number } | string | null } } & Parameters<typeof registerPreviewHost>[0];
const out = path.resolve(ROOT, process.argv[2] ?? 'artifacts/product-reality/sprint-205/m04');
// Stage1 sits beside the repository; walk up from it the way the specs do (a worktree is deeper than the checkout).
let stage1 = ROOT;
while (!fs.existsSync(path.join(stage1, 'Stage1/out/stage1')) && path.dirname(stage1) !== stage1) stage1 = path.dirname(stage1);
const STAGE1 = path.join(stage1, 'Stage1');
const RUN = path.join(STAGE1, 'out/stage1/uswds-designsystem/6e435ce7-eaab-46b4-be6b-cea9b80defa6');
const store = fs.mkdtempSync(path.join(os.tmpdir(), 's205-m04-'));
process.env.MCP_SCHEMA_STORE_ROOT = store; process.env.MCP_SCHEMA_STORE_DIR = 'schemas'; process.env.OODS_PREVIEW_HOST_URL = '';
fs.mkdirSync(path.join(out, 'shots'), { recursive: true });

const stage1Before = execFileSync('git', ['status', '--porcelain'], { cwd: STAGE1, encoding: 'utf8' });
const view = await readRunView(RUN);
const server = Fastify();
await registerPreviewHost(server, { compositionsDir: resolveCompositionsDir(), runtimeDir: path.join(ROOT, 'packages/mcp-bridge/dist/preview-runtime') });
await server.listen({ port: 0, host: '127.0.0.1' });
const address = server.server.address();
const hostUrl = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;
const browser = await chromium.launch();

const SCREENS = [['Run', 'list'], ['Run', 'detail'], ['Finding', 'list'], ['Finding', 'detail']] as const;
const page: Array<Record<string, unknown>> = [];
for (const [object, context] of SCREENS) {
  for (const framework of ['react', 'vue'] as const) {
    const started = performance.now();
    const rendered = await preview({ object, context, framework, runPath: RUN } as never, { previewHostUrl: hostUrl }) as unknown as { previews: Array<{ appUrl: string }> };
    const previewMs = Math.round(performance.now() - started);
    for (const width of [1440, 390]) {
      const tab = await browser.newPage({ viewport: { width, height: 900 } });
      const errors: string[] = [];
      tab.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      tab.on('pageerror', error => errors.push(String(error)));
      await tab.goto(rendered.previews[0]!.appUrl);
      await tab.waitForFunction(() => document.documentElement.dataset.oodsPreviewMounted === 'true', undefined, { timeout: 60_000 });
      const text = await tab.innerText('body');
      const shot = `shots/${object}-${context}-${framework}-${width}.png`;
      await tab.screenshot({ path: path.join(out, shot), fullPage: true });
      const findingTitlesShown = [...new Set(view.records.Finding.map(finding => String(finding.title)))].filter(title => text.includes(title)).length;
      const resultChips = await tab.$$eval('[data-oods-component="StatusBadge"]', nodes => nodes.map(node => node.textContent?.trim()));
      page.push({ object, context, framework, width, previewMs, consoleErrors: errors, shot, findingTitlesShown, resultChips: resultChips.length, showsRunTarget: text.includes(view.target), showsEngine: text.includes('axe-core 4.11.0') });
      await tab.close();
    }
  }
}

const reference = await ReferenceHost.open({ negotiate: true });
const conversation: Array<Record<string, unknown>> = [];
try {
  for (const [object, context] of SCREENS) {
    const rendered = await reference.render('design_preview', { object, context, framework: 'react', runPath: RUN });
    await rendered.appFrame.waitForFunction(() => (window as unknown as { __oodsPreviewApp?: { connected: boolean } }).__oodsPreviewApp?.connected === true, undefined, { timeout: 60_000 });
    const expected = object === 'Finding' ? String(view.records.Finding[0]!.title) : view.target;
    await rendered.appFrame.waitForFunction((needle: string) => document.body.innerText.includes(needle), expected, { timeout: 120_000 });
    const text = await rendered.appFrame.evaluate(() => document.body.innerText);
    const errors = await rendered.appFrame.evaluate(() => (window as unknown as { __oodsPreviewApp: { errors: string[] } }).__oodsPreviewApp.errors);
    const shot = `shots/conversation-${object}-${context}.png`;
    await reference.page.screenshot({ path: path.join(out, shot), fullPage: true });
    conversation.push({ object, context, shows: text.includes(expected), appErrors: errors, shot });
  }
} finally {
  const csp = [...reference.cspViolations]; const consoleErrors = [...reference.consoleErrors];
  await reference.close();
  conversation.push({ cspViolations: csp, hostConsoleErrors: consoleErrors });
}
await browser.close();
await server.close();

const stage1After = execFileSync('git', ['status', '--porcelain'], { cwd: STAGE1, encoding: 'utf8' });
const receipt = {
  builderSelfCertified: false,
  head: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim(),
  run: { runId: view.runId, target: view.target, kinds: view.kinds, coverage: view.coverage },
  page: { screens: page.length, consoleErrors: page.reduce((n, cell) => n + (cell.consoleErrors as string[]).length, 0), cells: page },
  conversation,
  stage1: { statusUnchanged: stage1Before === stage1After, uncommittedEntries: stage1After.trim().split('\n').filter(Boolean).length },
};
fs.writeFileSync(path.join(out, 'run-view.json'), JSON.stringify(receipt, null, 2) + '\n');
fs.rmSync(store, { recursive: true, force: true });
console.log(JSON.stringify({ coverage: view.coverage, pageCells: page.length, pageConsoleErrors: receipt.page.consoleErrors, conversation: conversation.slice(0, -1).map(entry => `${entry.object}/${entry.context}:${entry.shows}`), csp: (conversation.at(-1) as { cspViolations: unknown[] }).cspViolations.length, stage1Unchanged: receipt.stage1.statusUnchanged }));
