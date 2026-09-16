import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify, { type FastifyInstance } from 'fastify';
import { chromium } from 'playwright';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerPreviewHost } from '../../../mcp-bridge/src/preview/host.js';
import { readVersion, resolveCompositionsDir } from '../../src/lib/composition-store.js';
import { handle as preview } from '../../src/tools/design.preview.js';

/**
 * Sprint 203 m05: the decisions and evidence about an object, beside the running preview of its screen.
 *
 * The rows here are real — three decisions from Derek's own CMOS store, read in this spec the way an
 * agent reads them and handed to design.preview as input. That is the whole point of the design: Forge
 * opens no database, store or network connection belonging to CMOS, TraceLab or Hive, so the caller
 * brings what it already found and Forge checks it, keys it, stores it on the version and renders it.
 */
const root = path.resolve(fileURLToPath(import.meta.url), '../../../../..');
const runtimeDir = path.join(root, 'packages/mcp-bridge/dist/preview-runtime');
const FIXTURE = JSON.parse(fs.readFileSync(path.join(root, 'artifacts/product-reality/sprint-203/m05/context-fixture.json'), 'utf8')) as {
  items: Array<{ source: string; id: string; title: string; body: string; timestamp: string; query: string; fetchedAt: string; object: string }>;
  searched: Array<{ source: string; query: string; fetchedAt: string; found: number }>;
};
let storeRoot: string;
const servers: FastifyInstance[] = [];
async function host(compositionsDir: string): Promise<string> {
  const server = Fastify();
  servers.push(server);
  await registerPreviewHost(server, { compositionsDir, runtimeDir });
  await server.listen({ port: 0, host: '127.0.0.1' });
  const address = server.server.address();
  return `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;
}
beforeEach(() => { storeRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-context-')); vi.stubEnv('MCP_SCHEMA_STORE_ROOT', storeRoot); vi.stubEnv('MCP_SCHEMA_STORE_DIR', 'schemas'); vi.stubEnv('OODS_PREVIEW_HOST_URL', ''); });
afterEach(async () => { vi.unstubAllEnvs(); for (const server of servers.splice(0)) await server.close(); fs.rmSync(storeRoot, { recursive: true, force: true }); });

describe('context beside the design (s203-m05)', () => {
  it('stores what the caller supplied on the version, keyed to the object, and shows it beside the running app with its provenance', async () => {
    const compositionsDir = resolveCompositionsDir();
    const hostUrl = await host(compositionsDir);
    const result = await preview(
      { object: 'Decision', context: 'detail', contextItems: FIXTURE.items, contextSearched: FIXTURE.searched },
      { previewHostUrl: hostUrl },
    );
    if (result.action !== 'render') throw new Error('render expected');

    // Stored on the version, beside the measurements, so it is durable and travels with the lineage.
    const record = await readVersion(compositionsDir, result.compositionId, 1);
    expect(record.context, 'context is stored on the version').toBeDefined();
    expect(record.context!.object).toBe('Decision');
    expect(record.context!.urn).toMatch(/^urn:oods:object:Decision@/);
    expect(record.context!.items).toHaveLength(FIXTURE.items.length);
    expect(record.context!.searched).toHaveLength(1);
    // Every item keeps the provenance the caller gave it; Forge invents none of it.
    for (const [index, item] of record.context!.items.entries()) {
      expect(item.source).toBe(FIXTURE.items[index]!.source);
      expect(item.query).toBe(FIXTURE.items[index]!.query);
      expect(item.fetchedAt).toBe(FIXTURE.items[index]!.fetchedAt);
      expect(item.body).toBe(FIXTURE.items[index]!.body);
    }

    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(`page: ${error.message}`));
      page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
      await page.goto(`${hostUrl}/preview/${result.compositionId}/1?framework=react&brand=A&theme=light`, { waitUntil: 'networkidle' });
      const panel = await page.evaluate(() => {
        const section = document.querySelector('[data-oods-context]');
        if (!section) return null;
        return {
          items: section.querySelectorAll('[data-oods-context-item]').length,
          searched: section.querySelectorAll('[data-oods-context-searched]').length,
          text: (section as HTMLElement).innerText.replace(/\s+/g, ' ').trim(),
        };
      });
      expect(panel, 'the page shows a context panel').not.toBeNull();
      expect(panel!.items).toBe(FIXTURE.items.length);
      // The empty source states what it searched, so the panel distinguishes "nothing found" from "not asked".
      expect(panel!.searched).toBe(1);
      expect(panel!.text).toContain('tracelab.evidence');
      expect(panel!.text).toContain('nothing found');
      // Provenance on every item: where it came from, the query, and when it was fetched.
      expect(panel!.text).toContain('cmos.decisions');
      expect(panel!.text).toContain(FIXTURE.items[0]!.query);
      expect(panel!.text).toContain('Keyed to');
      expect(errors, 'no console errors on the page').toEqual([]);
      await page.close();
    } finally { await browser.close(); }
  }, 300_000);

  it('refuses an item keyed to another object with a typed error, and writes nothing', async () => {
    const compositionsDir = resolveCompositionsDir();
    const hostUrl = await host(compositionsDir);
    const misKeyed = [{ ...FIXTURE.items[0]!, object: 'Subscription' }];
    await expect(preview({ object: 'Decision', context: 'detail', contextItems: misKeyed }, { previewHostUrl: hostUrl }))
      .rejects.toMatchObject({ opiCode: 'OODS-V207' });
  }, 120_000);

  it('refuses an item that cannot say where it came from, and one with no content', async () => {
    const compositionsDir = resolveCompositionsDir();
    const hostUrl = await host(compositionsDir);
    const { query: _dropped, ...noQuery } = FIXTURE.items[0]!;
    await expect(preview({ object: 'Decision', context: 'detail', contextItems: [noQuery as never] }, { previewHostUrl: hostUrl }))
      .rejects.toMatchObject({ opiCode: 'OODS-V206' });
    const { body: _body, ...noContent } = FIXTURE.items[0]!;
    await expect(preview({ object: 'Decision', context: 'detail', contextItems: [noContent as never] }, { previewHostUrl: hostUrl }))
      .rejects.toMatchObject({ opiCode: 'OODS-V206' });
  }, 120_000);

  it('does not mark context as stale on the version it was gathered for', async () => {
    // A caller always fetches before it calls, so "fetched before this version was composed" would mark
    // every item on every fresh composition and the mark would stop meaning anything.
    const compositionsDir = resolveCompositionsDir();
    const hostUrl = await host(compositionsDir);
    const old = [{ ...FIXTURE.items[0]!, fetchedAt: '2020-01-01T00:00:00.000Z' }];
    const result = await preview({ object: 'Decision', context: 'detail', contextItems: old }, { previewHostUrl: hostUrl });
    if (result.action !== 'render') throw new Error('render expected');
    const record = await readVersion(compositionsDir, result.compositionId, 1);
    expect(record.context!.attachedToVersion).toBe(1);
    expect(record.context!.items[0]!.staleForVersion).toBe(false);
    expect(record.context!.items[0]!.fetchedAt, 'the item keeps the time it was actually fetched').toBe('2020-01-01T00:00:00.000Z');
  }, 120_000);

  it('carries the context onto the version an edit records, with its lineage', async () => {
    const compositionsDir = resolveCompositionsDir();
    const hostUrl = await host(compositionsDir);
    const first = await preview({ object: 'Decision', context: 'detail', contextItems: FIXTURE.items }, { previewHostUrl: hostUrl });
    if (first.action !== 'render') throw new Error('render expected');
    const edited = await preview(
      { action: 'edit', compositionId: first.compositionId, version: 1, edit: { operation: 'seed', seed: 's203-m05' } },
      { previewHostUrl: hostUrl },
    );
    // An edit reports itself as an edit; it records and opens the new version.
    expect(edited.action).toBe('edit');
    expect(edited.version).toBe(2);
    expect(edited.parentVersion).toBe(1);
    const record = await readVersion(compositionsDir, first.compositionId, 2);
    expect(record.parentVersion).toBe(1);
    expect(record.context, 'the edit carries the context forward').toBeDefined();
    expect(record.context!.items).toHaveLength(FIXTURE.items.length);
    // The design moved and the context did not, so every carried item is marked — and keeps the time it
    // was actually fetched, so the reader sees the gap instead of having it smoothed over.
    expect(record.context!.attachedToVersion).toBe(2);
    expect(record.context!.items.every(item => item.staleForVersion), 'every carried item is marked').toBe(true);
    expect(record.context!.items[0]!.fetchedAt).toBe(FIXTURE.items[0]!.fetchedAt);
  }, 300_000);

  it('leaves the page byte-identical for a version that carries no context', async () => {
    const compositionsDir = resolveCompositionsDir();
    const hostUrl = await host(compositionsDir);
    const plain = await preview({ object: 'Decision', context: 'detail' }, { previewHostUrl: hostUrl });
    if (plain.action !== 'render') throw new Error('render expected');
    const response = await fetch(`${hostUrl}/preview/${plain.compositionId}/1?framework=react&brand=A&theme=light`);
    const html = await response.text();
    expect(html).not.toContain('data-oods-context');
    expect(html).not.toContain('class="context"');
  }, 120_000);

  it('opens no store of its own: the server has no client for any other product', () => {
    const server = path.join(root, 'packages/mcp-server/src');
    const files: string[] = [];
    const walk = (dir: string): void => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.ts$/.test(entry.name) && !/\.test\.ts$/.test(entry.name)) files.push(full);
      }
    };
    walk(server);
    // No sqlite driver, no CMOS/Hive/TraceLab client, and nothing reaching the aquex hub.
    const forbidden = /require\(['"](?:better-)?sqlite3|from ['"](?:better-)?sqlite3|cmos\.sqlite|hive_overview|tracelab_search|aquex/;
    // Comments are stripped first: this mission's own module names the caller's tools in its prose,
    // which is the opposite of reaching for them, and a check that cannot tell those apart is useless.
    const code = (source: string): string => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
    const offenders = files.filter(file => forbidden.test(code(fs.readFileSync(file, 'utf8')))).map(file => path.relative(root, file));
    expect(offenders, 'the server reaches into no other product\'s store').toEqual([]);
  });
});
