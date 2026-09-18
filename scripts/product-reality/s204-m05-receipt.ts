/**
 * s204-m05 — screenshots of the observation panel on both surfaces, from the real m03 capture.
 *
 *   pnpm exec tsx scripts/product-reality/s204-m05-receipt.ts --run <stage1 run dir> [--out artifacts/product-reality/sprint-204/m05]
 *
 * Needs the built bridge (packages/mcp-bridge/dist) and mcp-server (packages/mcp-server/dist), because the
 * conversation surface runs through the real stdio adapter. Writes two PNGs and receipt.json; the specs
 * observation-beside-the-design.s204 and observation-in-conversation.s204 are the assertions.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';

const root = path.resolve(import.meta.dirname, '../..');
const arg = (name: string): string | undefined => {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
};
const run = arg('run');
if (!run) throw new Error('--run <stage1 run directory> is required');
const out = path.resolve(root, arg('out') ?? 'artifacts/product-reality/sprint-204/m05');
fs.mkdirSync(out, { recursive: true });

const storeRoot = fs.mkdtempSync(path.join(os.tmpdir(), 's204-m05-receipt-'));
process.env.MCP_SCHEMA_STORE_ROOT = storeRoot;
process.env.MCP_SCHEMA_STORE_DIR = 'schemas';
const { registerPreviewHost } = await import('../../packages/mcp-bridge/src/preview/host.js');
const { resolveCompositionsDir } = await import('../../packages/mcp-server/src/lib/composition-store.js');
const { handle: preview } = await import('../../packages/mcp-server/src/tools/design.preview.js');
const { ReferenceHost } = await import('./s202-reference-host.js');
// fastify is the bridge's dependency, not the root's: resolve it where the preview host resolves it.
const { default: Fastify } = await import(createRequire(path.join(root, 'packages/mcp-bridge/package.json')).resolve('fastify')) as { default: () => Parameters<typeof registerPreviewHost>[0] };

const receipt: Record<string, unknown> = { run, generatedAt: new Date().toISOString() };
const server = Fastify();
const browser = await chromium.launch({ headless: true });
try {
  await registerPreviewHost(server, { compositionsDir: resolveCompositionsDir(), runtimeDir: path.join(root, 'packages/mcp-bridge/dist/preview-runtime') });
  await server.listen({ port: 0, host: '127.0.0.1' });
  const address = server.server.address();
  const hostUrl = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;
  const result = await preview({ object: 'Mission', context: 'list', framework: 'react', observationRunPath: run } as never, { previewHostUrl: hostUrl });
  if (result.action !== 'render') throw new Error(`render expected, got ${result.action}`);
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(`${hostUrl}/preview/${result.compositionId}/1?framework=react&brand=A&theme=light`, { waitUntil: 'networkidle' });
  const section = page.locator('[data-oods-observation]');
  await section.scrollIntoViewIfNeeded();
  await section.screenshot({ path: path.join(out, 'observation-page.png') });
  receipt.page = { rows: await section.locator('[data-oods-observation-row]').count(), errors };

  const host = await ReferenceHost.open({ negotiate: true });
  try {
    const rendered = await host.render('design_preview', { object: 'Mission', context: 'list', framework: 'react', observationRunPath: run });
    await rendered.appFrame.waitForFunction(() => Boolean((window as unknown as { __oodsPreviewApp?: { record: unknown } }).__oodsPreviewApp?.record), undefined, { timeout: 120_000 });
    const panel = rendered.appFrame.locator('[data-oods-observation-panel]');
    await panel.scrollIntoViewIfNeeded();
    await panel.screenshot({ path: path.join(out, 'observation-app.png') });
    receipt.app = { rows: await panel.locator('[data-oods-observation-row]').count(), cspViolations: host.cspViolations, consoleErrors: host.consoleErrors };
  } finally { await host.close(); }
} finally {
  await browser.close();
  await server.close();
  fs.rmSync(storeRoot, { recursive: true, force: true });
}
fs.writeFileSync(path.join(out, 'receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`);
console.log(JSON.stringify(receipt, null, 2));
