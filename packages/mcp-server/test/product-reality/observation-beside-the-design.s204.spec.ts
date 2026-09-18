import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify, { type FastifyInstance } from 'fastify';
import { chromium } from 'playwright';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerPreviewHost } from '../../../mcp-bridge/src/preview/host.js';
import { renderPreviewShell, type PreviewShellInput } from '../../../mcp-bridge/src/preview/shell.js';
import { readVersion, resolveCompositionsDir, versionPath } from '../../src/lib/composition-store.js';
import { handle as compose } from '../../src/tools/design.compose.js';
import { handle as preview } from '../../src/tools/design.preview.js';

/**
 * Sprint 204 m05: what Stage1 observed on TraceLab's live frontend, beside the running preview of the
 * same object, on the browser page. The rows are REAL — computed from the m03 capture of production
 * TraceLab (run d0a43821) — not a fixture: the mission's point is that the difference is readable on a
 * real screen, and staleness in particular can only be judged against real capture timing.
 *
 * The page follows the Sprint 203 context panel exactly: provenance on every row, an honest empty
 * state, rows carried by an edit marked rather than re-dated, and nothing at all — markup, stylesheet or
 * script — for a version that carries no observation.
 */
const root = path.resolve(fileURLToPath(import.meta.url), '../../../../..');
const runtimeDir = path.join(root, 'packages/mcp-bridge/dist/preview-runtime');
const RUN_ID = 'd0a43821-5730-4bf3-8b40-20f6fcb6b69c';

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
const RUN = STAGE1 ? path.join(STAGE1, 'out/stage1/tracelab-production-infer', RUN_ID) : null;
const hasRun = Boolean(RUN && fs.existsSync(RUN));

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
beforeEach(() => { storeRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-observation-page-')); vi.stubEnv('MCP_SCHEMA_STORE_ROOT', storeRoot); vi.stubEnv('MCP_SCHEMA_STORE_DIR', 'schemas'); vi.stubEnv('OODS_PREVIEW_HOST_URL', ''); });
afterEach(async () => { vi.unstubAllEnvs(); for (const server of servers.splice(0)) await server.close(); fs.rmSync(storeRoot, { recursive: true, force: true }); });

async function render(input: Record<string, unknown>) {
  const compositionsDir = resolveCompositionsDir();
  const hostUrl = await host(compositionsDir);
  const result = await preview(input as never, { previewHostUrl: hostUrl });
  if (result.action !== 'render' && result.action !== 'edit') throw new Error('render expected');
  return { compositionsDir, hostUrl, result };
}

describe('observation beside the design, on the browser page (s204-m05)', () => {
  it('finds the real capture whenever Stage1 is checked out here', () => {
    if (!STAGE1) return; // the one honest skip: not the machine the capture lives on
    expect(hasRun, `Stage1 is at ${STAGE1} but run ${RUN_ID} is gone`).toBe(true);
  });

  it.runIf(hasRun)('stores the real rows on the version and shows every one with both provenances', async () => {
    const { compositionsDir, hostUrl, result } = await render({ object: 'Mission', context: 'list', framework: 'react', observationRunPath: RUN });
    const record = await readVersion(compositionsDir, result.compositionId, 1);
    const observation = record.observation!;
    expect(observation, 'the observation is stored on the version').toBeDefined();
    expect(observation.run.runId).toBe(RUN_ID);
    expect(observation.urn).toMatch(/^urn:oods:object:Mission@/);
    // Mission list against the real capture: Stage1 names the entity and sees the data-bound list, but
    // no input on /missions, where Forge composes a search box and a filter.
    expect(observation.rows.map(row => row.id).sort()).toEqual(['agreeing:data-bound:Mission:list', 'agreeing:entity:Mission:list', 'disagreeing:input:Mission:list']);
    // The Forge side is the version the reader is looking at, not a fresh composition of the same object.
    const digest = createHash('sha256').update(JSON.stringify(record.schema)).digest('hex');
    for (const row of observation.rows) expect(row.forge.schemaDigest).toBe(digest);
    expect(observation.nature).toBe('evidence-for-review');
    expect(observation.requiresHumanAdjudication).toBe(true);

    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(`page: ${error.message}`));
      page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
      await page.goto(`${hostUrl}/preview/${result.compositionId}/1?framework=react&brand=A&theme=light`, { waitUntil: 'networkidle' });
      const rows = await page.evaluate(() => [...document.querySelectorAll('[data-oods-observation] [data-oods-observation-row]')].map(li => ({
        category: li.getAttribute('data-oods-observation-row'),
        axis: li.getAttribute('data-oods-observation-axis'),
        text: (li as HTMLElement).innerText.replace(/\s+/g, ' ').trim(),
        href: li.querySelector('a')?.getAttribute('href') ?? null,
      })));
      expect(rows).toHaveLength(3);
      for (const [index, row] of rows.entries()) {
        const stored = observation.rows[index]!;
        // Stage1's side: the run, the target, the artifact and when that artifact was captured.
        expect(row.text).toContain(RUN_ID);
        expect(row.text).toContain('https://tracelab.aquex.ai/');
        expect(row.text).toContain(stored.stage1.artifactKind);
        expect(stored.stage1.capturedAt).toMatch(/^2026-09-18T00:52:11\.\d{3}Z$/);
        expect(row.text).toContain(`captured ${stored.stage1.capturedAt}`);
        // Forge's side: the object, the context and the URN it was compared against.
        expect(row.text).toContain('Forge Mission list');
        expect(row.text).toContain('the supplied Mission list schema (the version on screen)');
        expect(row.text).toContain(observation.urn);
        expect(row.href, 'the screen links to the live route it was observed on').toBe('https://tracelab.aquex.ai/missions');
      }
      expect(rows[0]!.category, 'disagreements lead').toBe('disagreeing');
      expect(rows[0]!.axis).toBe('input');
      expect(errors, 'no console errors on the page').toEqual([]);
    } finally { await browser.close(); }
  }, 300_000);

  it.runIf(hasRun)('marks only rows that outlived the version they were gathered for, against the real capture time, and re-dates nothing', async () => {
    const { compositionsDir, result } = await render({ object: 'Mission', context: 'list', framework: 'react', observationRunPath: RUN });
    const first = await readVersion(compositionsDir, result.compositionId, 1);
    const capturedAt = first.observation!.run.capturedAt!;
    const rowCaptures = first.observation!.rows.map(row => row.stage1.capturedAt);
    // The capture precedes the version — it always will — and that alone marks nothing.
    for (const at of [capturedAt, ...rowCaptures]) expect(Date.parse(at!)).toBeLessThan(Date.parse(first.createdAt));
    expect(first.observation!.rows.every(row => !row.staleForVersion)).toBe(true);

    const hostUrl = await host(resolveCompositionsDir());
    const edited = await preview({ action: 'edit', compositionId: result.compositionId, version: 1, framework: 'react', edit: { operation: 'seed', seed: 's204-m05' } } as never, { previewHostUrl: hostUrl });
    expect(edited.version).toBe(2);
    const second = await readVersion(compositionsDir, result.compositionId, 2);
    // The design moved and the observation did not: every row is marked, and keeps its capture time.
    expect(second.observation!.attachedToVersion).toBe(2);
    expect(second.observation!.rows.every(row => row.staleForVersion)).toBe(true);
    expect(second.observation!.run.capturedAt).toBe(capturedAt);
    expect(second.observation!.rows.map(row => row.stage1.capturedAt)).toEqual(rowCaptures);

    const html = await (await fetch(`${hostUrl}/preview/${result.compositionId}/2?framework=react&brand=A&theme=light`)).text();
    expect(html.match(/data-oods-observation-stale="true"/g)).toHaveLength(second.observation!.rows.length);
    expect(html).toContain('compared an earlier version');
  }, 300_000);

  it.runIf(hasRun)('shows what was searched and that nothing was found, for a composition with no comparable screen', async () => {
    const { compositionsDir, hostUrl, result } = await render({ object: 'Mission', context: 'card', framework: 'react', observationRunPath: RUN });
    const record = await readVersion(compositionsDir, result.compositionId, 1);
    expect(record.observation!.rows).toEqual([]);
    expect(record.observation!.searched.found).toBe(0);
    const html = await (await fetch(`${hostUrl}/preview/${result.compositionId}/1?framework=react&brand=A&theme=light`)).text();
    expect(html).toContain('data-oods-observation-empty="true"');
    expect(html).toContain('nothing found');
    expect(html).toContain(RUN_ID);
    expect(html).not.toContain('<li data-oods-observation-row=');
  }, 300_000);

  it.runIf(hasRun)('offers nothing to act on: no button, form, input, approval or queue inside the panel', async () => {
    // Mission list carries a disagreement; Mission timeline is composed-only — a timeline has no route Stage1 could observe.
    for (const [context, expected] of [['list', 'disagreeing'], ['timeline', 'composed-only']] as const) {
      const { hostUrl, result } = await render({ object: 'Mission', context, framework: 'react', observationRunPath: RUN });
      const html = await (await fetch(`${hostUrl}/preview/${result.compositionId}/1?framework=react&brand=A&theme=light`)).text();
      const start = html.indexOf('<section class="observation"');
      const section = html.slice(start, html.indexOf('</section>', start));
      expect(start).toBeGreaterThan(0);
      expect(section).toContain(`<li data-oods-observation-row="${expected}"`);
      expect(section).not.toMatch(/<(button|form|input|select|textarea)\b/);
      expect(section).not.toMatch(/\b(approve|reject|queue|accept)\b/i);
    }
  }, 300_000);

  describe('refusals write nothing at all', () => {
    it('OODS-V208 for a path that is not a Stage1 run, leaving the version file byte for byte', async () => {
      const compositionsDir = resolveCompositionsDir();
      const hostUrl = await host(compositionsDir);
      const plain = await preview({ object: 'Mission', context: 'list', framework: 'react' } as never, { previewHostUrl: hostUrl });
      const file = versionPath(compositionsDir, plain.compositionId, 1);
      const before = fs.readFileSync(file);
      await expect(preview({ compositionId: plain.compositionId, version: 1, framework: 'react', observationRunPath: storeRoot } as never, { previewHostUrl: hostUrl }))
        .rejects.toMatchObject({ opiCode: 'OODS-V208' });
      expect(fs.readFileSync(file).equals(before)).toBe(true);
    }, 300_000);

    it.runIf(hasRun)('OODS-V210 for a composition whose object the registry does not hold', async () => {
      const compositionsDir = resolveCompositionsDir();
      const hostUrl = await host(compositionsDir);
      const composed = await compose({ intent: 'a simple settings form with a name and an email' } as never);
      const file = versionPath(compositionsDir, composed.compositionId!, composed.version!);
      const before = fs.readFileSync(file);
      await expect(preview({ compositionId: composed.compositionId, version: composed.version, framework: 'react', observationRunPath: RUN } as never, { previewHostUrl: hostUrl }))
        .rejects.toMatchObject({ opiCode: 'OODS-V210' });
      expect(fs.readFileSync(file).equals(before)).toBe(true);
    }, 300_000);
  });

  it('produces the page byte for byte as it was before this existed, for a version with no observation — markup, stylesheet and script', () => {
    const dir = path.join(root, 'artifacts/product-reality/sprint-204/m05');
    const input = JSON.parse(fs.readFileSync(path.join(dir, 'no-observation-shell-input.json'), 'utf8')) as PreviewShellInput;
    const before = fs.readFileSync(path.join(dir, 'no-observation-shell.pre-m05.html'), 'utf8');
    const now = renderPreviewShell(input);
    expect(now === before, 'renderPreviewShell output differs from the page the pre-m05 shell produced').toBe(true);
    expect(now).not.toContain('observation');
  });

  it('has one renderer: the browser page and the conversation app both call renderObservation, and neither has a copy', () => {
    const shell = fs.readFileSync(path.join(root, 'packages/mcp-bridge/src/preview/shell.ts'), 'utf8');
    const app = fs.readFileSync(path.join(root, 'packages/mcp-bridge/preview-app/main.ts'), 'utf8');
    expect(shell).toMatch(/export function renderObservation\(/);
    expect(shell).toMatch(/renderObservation\(record, observationLink\)/);
    expect(app).toMatch(/import \{[^}]*\brenderObservation\b[^}]*\} from '\.\.\/src\/preview\/shell\.js'/);
    expect(app).toMatch(/renderObservation\(record, observationLink\)/);
    // The row markup exists in exactly one source file under the bridge.
    const files: string[] = [];
    const walk = (dir: string): void => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) { if (entry.name !== 'node_modules' && entry.name !== 'dist') walk(full); } else if (/\.(ts|html)$/.test(entry.name)) files.push(full);
      }
    };
    walk(path.join(root, 'packages/mcp-bridge'));
    const owners = files.filter(file => fs.readFileSync(file, 'utf8').includes('data-oods-observation-row=')).map(file => path.relative(root, file));
    expect(owners).toEqual(['packages/mcp-bridge/src/preview/shell.ts']);
  });
});
