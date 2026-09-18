import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { ReferenceHost } from '../../../../scripts/product-reality/s202-reference-host.js';

/**
 * Sprint 204 m05, the second surface: the observation panel inside the conversation.
 *
 * The browser page and this app call the same `renderObservation` from shell.ts, each passing its own
 * link callback — the page an anchor to the live route, this view the destination as text, because it
 * cannot open a tab from inside the host's sandbox. Proven where it has to work: the reference host,
 * Chromium, the double iframe on two origins, the spec's default CSP and the real adapter over stdio,
 * against the real m03 capture of TraceLab production.
 */
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
const root = path.resolve(fileURLToPath(import.meta.url), '../../../../..');

const hosts: ReferenceHost[] = [];
afterEach(async () => { for (const host of hosts.splice(0)) await host.close(); });

async function open(args: Record<string, unknown>) {
  const host = await ReferenceHost.open({ negotiate: true });
  hosts.push(host);
  const rendered = await host.render('design_preview', args);
  await rendered.appFrame.waitForFunction(() => (window as unknown as { __oodsPreviewApp?: { connected: boolean } }).__oodsPreviewApp?.connected === true, undefined, { timeout: 60_000 });
  await rendered.appFrame.waitForFunction(() => { const state = (window as unknown as { __oodsPreviewApp?: { record: unknown; errors: string[] } }).__oodsPreviewApp; return Boolean(state?.record) || (state?.errors.length ?? 0) > 0; }, undefined, { timeout: 120_000 });
  return { host, rendered };
}

describe('observation beside the design, inside the conversation (s204-m05)', () => {
  it('finds the real capture whenever Stage1 is checked out here', () => {
    if (!STAGE1) return;
    expect(hasRun, `Stage1 is at ${STAGE1} but run ${RUN_ID} is gone`).toBe(true);
  });

  it.runIf(hasRun)('shows the real rows with both provenances, under the default CSP, with no console errors', async () => {
    expect(fs.existsSync(path.join(root, 'packages/mcp-bridge/dist/preview-app/app.html')), 'the preview app must be built').toBe(true);
    const { host, rendered } = await open({ object: 'Mission', context: 'list', framework: 'react', observationRunPath: RUN });
    const panel = await rendered.appFrame.evaluate(() => {
      const section = document.querySelector('[data-oods-observation]');
      const state = (window as unknown as { __oodsPreviewApp: { errors: string[] } }).__oodsPreviewApp;
      return {
        errors: state.errors,
        present: Boolean(section),
        rows: section ? [...section.querySelectorAll('[data-oods-observation-row]')].map(li => ({ category: li.getAttribute('data-oods-observation-row'), text: (li as HTMLElement).innerText.replace(/\s+/g, ' ').trim() })) : [],
        controls: section ? section.querySelectorAll('button, form, input, select, textarea').length : -1,
        anchors: section ? section.querySelectorAll('a').length : -1,
      };
    });
    expect(panel.errors, 'no errors in the app').toEqual([]);
    expect(panel.present, 'the conversation view shows the observation panel').toBe(true);
    expect(panel.rows.map(row => row.category)).toEqual(['disagreeing', 'agreeing', 'agreeing']);
    for (const row of panel.rows) {
      expect(row.text).toContain(RUN_ID);
      expect(row.text).toContain('https://tracelab.aquex.ai/');
      expect(row.text).toMatch(/identity_graph|object_rollup/);
      expect(row.text).toMatch(/captured 2026-09-18T00:52:11\.\d{3}Z/);
      expect(row.text).toContain('Forge Mission list');
      expect(row.text).toMatch(/urn:oods:object:Mission@/);
      // This view's half of the callback: the live route as text, not a link that cannot open.
      expect(row.text).toContain('https://tracelab.aquex.ai/missions');
    }
    expect(panel.anchors, 'no dead links inside the sandbox').toBe(0);
    expect(panel.controls, 'nothing to act on: no approve, reject or queue').toBe(0);
    expect(host.cspViolations, 'no CSP violations').toEqual([]);
    expect(host.consoleErrors, 'no console errors in the host page').toEqual([]);
  }, 300_000);

  it('renders no observation panel at all for a version that carries none', async () => {
    const { host, rendered } = await open({ object: 'Mission', context: 'list', framework: 'react' });
    const present = await rendered.appFrame.evaluate(() => Boolean(document.querySelector('[data-oods-observation-panel], [data-oods-observation]')));
    expect(present).toBe(false);
    expect(host.cspViolations, 'no CSP violations').toEqual([]);
  }, 300_000);
});
