import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { ReferenceHost } from '../../../../scripts/product-reality/s202-reference-host.js';

/**
 * Sprint 203 m05, the second surface: the context panel inside the conversation.
 *
 * One renderer serves both. The browser page and this app call the same `renderContext` and pass the
 * link callback that suits them — the page an anchor, this view the destination as text, because it
 * cannot open a tab from inside the host's sandbox. Proven here where it actually has to work: the
 * reference host, Chromium, the double iframe on two origins, the spec's default CSP and the real
 * adapter over stdio, with real rows from Derek's own CMOS store passed through `contextItems`.
 */
const root = path.resolve(fileURLToPath(import.meta.url), '../../../../..');
const FIXTURE = JSON.parse(fs.readFileSync(path.join(root, 'artifacts/product-reality/sprint-203/m05/context-fixture.json'), 'utf8')) as {
  items: Array<Record<string, string>>;
  searched: Array<Record<string, unknown>>;
};
const hosts: ReferenceHost[] = [];
afterEach(async () => { for (const host of hosts.splice(0)) await host.close(); });

describe('context beside the design, inside the conversation (s203-m05)', () => {
  it('shows the caller\'s context in the app with its provenance, under the default CSP, with no console errors', async () => {
    expect(fs.existsSync(path.join(root, 'packages/mcp-bridge/dist/preview-app/app.html')), 'the preview app must be built').toBe(true);
    const host = await ReferenceHost.open({ negotiate: true });
    hosts.push(host);
    const rendered = await host.render('design_preview', {
      object: 'Decision',
      context: 'detail',
      contextItems: FIXTURE.items,
      contextSearched: FIXTURE.searched,
    });
    await rendered.appFrame.waitForFunction(() => (window as unknown as { __oodsPreviewApp?: { connected: boolean } }).__oodsPreviewApp?.connected === true, undefined, { timeout: 60_000 });
    await rendered.appFrame.waitForFunction(() => { const state = (window as unknown as { __oodsPreviewApp?: { record: unknown; errors: string[] } }).__oodsPreviewApp; return Boolean(state?.record) || (state?.errors.length ?? 0) > 0; }, undefined, { timeout: 120_000 });

    const panel = await rendered.appFrame.evaluate(() => {
      const section = document.querySelector('[data-oods-context]');
      const state = (window as unknown as { __oodsPreviewApp: { errors: string[] } }).__oodsPreviewApp;
      return {
        errors: state.errors,
        present: Boolean(section),
        items: section ? section.querySelectorAll('[data-oods-context-item]').length : 0,
        searched: section ? section.querySelectorAll('[data-oods-context-searched]').length : 0,
        text: section ? (section as HTMLElement).innerText.replace(/\s+/g, ' ').trim() : '',
      };
    });

    expect(panel.errors, 'no console errors in the app').toEqual([]);
    expect(panel.present, 'the conversation view shows the context panel').toBe(true);
    expect(panel.items).toBe(FIXTURE.items.length);
    // The same two things the browser page shows: provenance on every item, and what was searched for nothing.
    expect(panel.text).toContain('cmos.decisions');
    expect(panel.text).toContain(String(FIXTURE.items[0]!.query));
    expect(panel.text).toContain('urn:oods:object:Decision@');
    expect(panel.searched).toBe(1);
    expect(panel.text).toContain('nothing found');
    // Forge did not fetch any of it, and the panel says so rather than implying it looked.
    expect(panel.text).toContain('Forge fetched none of it');
    expect(host.cspViolations, 'no CSP violations').toEqual([]);
    expect(host.consoleErrors, 'no console errors in the host page').toEqual([]);
  }, 300_000);

  it('says what it is showing when no context was supplied, instead of an empty panel', async () => {
    const host = await ReferenceHost.open({ negotiate: true });
    hosts.push(host);
    const rendered = await host.render('design_preview', { object: 'Decision', context: 'detail' });
    await rendered.appFrame.waitForFunction(() => (window as unknown as { __oodsPreviewApp?: { connected: boolean } }).__oodsPreviewApp?.connected === true, undefined, { timeout: 60_000 });
    await rendered.appFrame.waitForFunction(() => { const state = (window as unknown as { __oodsPreviewApp?: { record: unknown; errors: string[] } }).__oodsPreviewApp; return Boolean(state?.record) || (state?.errors.length ?? 0) > 0; }, undefined, { timeout: 120_000 });
    const text = await rendered.appFrame.evaluate(() => {
      const panel = document.querySelector('[data-oods-context-panel]');
      return panel ? (panel as HTMLElement).innerText.replace(/\s+/g, ' ').trim() : null;
    });
    expect(text, 'the panel is present and explains itself').toBeTruthy();
    expect(text).toContain('No context was supplied');
    expect(text).toContain('Forge fetches none of its own');
    expect(host.cspViolations, 'no CSP violations').toEqual([]);
  }, 300_000);
});
