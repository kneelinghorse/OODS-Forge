/**
 * s202-m04 receipts: acting from the conversation, in the reference host (Chromium, the double iframe on two 127.0.0.1
 * origins, the spec's default CSP, the SDK's app-bridge, the real adapter over stdio). On a Subscription detail composition
 * the preview app performs the four edits (each a new version with its parent and operation, opened in place), compares
 * the last version with the first side by side in React and then in Vue (both running apps, the what-changed list against
 * the preview host's own diff for the pair, both measurement panels, fullscreen), accepts version 5 and then version 4
 * (accepted.json with the measurements snapshot and supersession, the app and the browser page, ui/update-model-context),
 * and sends a change request (ui/message). Screenshots at every step; console errors, page errors and CSP violations must
 * be zero.
 *
 *   pnpm exec tsx scripts/product-reality/s202-preview-acts.ts [--out artifacts/product-reality/sprint-202/m04/reference-host]
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import type { Frame } from 'playwright';
import { ROOT, ReferenceHost, type Json } from './s202-reference-host.js';

const outIndex = process.argv.indexOf('--out');
const out = path.resolve(ROOT, outIndex >= 0 ? process.argv[outIndex + 1]! : 'artifacts/product-reality/sprint-202/m04/reference-host');
fs.mkdirSync(out, { recursive: true });
const git = (...args: string[]) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();

type Act = { act: string; ok: boolean; detail: Json };
type AppState = Json & {
  mounts: number; pending: string | null; errors: string[]; view: string; compares: number; displayMode: string; components: number; framework: string;
  current: { compositionId: string; version: number; parentVersion: number | null; operation: string } | null;
  lineage: Array<[number, number | null, string]>; acts: Act[]; toolCalls: Array<Json & { ok: boolean; arguments: Json; ms: number }>;
  compare: (Json & { left: Json & { version: number; components: number }; right: Json & { version: number; components: number }; differenceCount: number; identical: boolean; summary: Record<string, number>; renderedChanges: number }) | null;
  modelContext: Array<{ text: string; structuredContent: Json }>; messages: string[]; displayModeRequests: Json[];
};
type Live = { __oodsPreviewApp: { errors: string[]; mounts: number; pending: string | null; compares: number; acts: Act[]; messages: string[]; displayMode: string } };
const appState = (frame: Frame): Promise<AppState> => frame.evaluate(() => {
  const { record, versions, ...rest } = (window as unknown as { __oodsPreviewApp: Record<string, unknown> & { record?: { compositionId: string; version: number; parentVersion: number | null; operation: string }; versions?: Array<{ version: number; parentVersion: number | null; operation: string }> } }).__oodsPreviewApp;
  return { ...rest, current: record ? { compositionId: record.compositionId, version: record.version, parentVersion: record.parentVersion, operation: record.operation } : null, lineage: (versions ?? []).map(entry => [entry.version, entry.parentVersion, entry.operation]) };
}) as unknown as Promise<AppState>;
async function settled(frame: Frame, previous: AppState, until: 'mount' | 'compare' | 'act', act?: string): Promise<AppState> {
  await frame.waitForFunction(([mounts, compares, acts, kind, name]) => {
    const state = (window as unknown as Live).__oodsPreviewApp;
    if (state.errors.length > 0 || state.acts.slice(acts).some(entry => !entry.ok)) return true;
    if (kind === 'mount') return state.mounts > mounts && state.pending === null;
    if (kind === 'compare') return state.compares > compares && state.pending === null;
    return state.acts.slice(acts).some(entry => entry.act === name);
  }, [previous.mounts, previous.compares, previous.acts.length, until, act ?? ''] as const, { timeout: 300_000 });
  const state = await appState(frame);
  assert.deepEqual(state.errors, [], `the app reported: ${state.errors.join(' | ')}`);
  assert.deepEqual(state.acts.slice(previous.acts.length).filter(entry => !entry.ok), [], 'an act was refused');
  return state;
}
const countKinds = (events: Json[]) => events.reduce<Record<string, number>>((counts, event) => ({ ...counts, [String(event.kind)]: (counts[String(event.kind)] ?? 0) + 1 }), {});

const host = await ReferenceHost.open({ negotiate: true, hostContext: { theme: 'light', containerDimensions: { width: 900, maxHeight: 2400 } } });
const receipts: Json = { head: git('rev-parse', 'HEAD'), dirty: git('status', '--porcelain').length > 0, generatedAt: new Date().toISOString() };
try {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'packages/mcp-bridge/dist/preview-app/manifest.json'), 'utf8')) as Json;
  receipts.app = { bytes: manifest.bytes, revision: manifest.revision, sha256: manifest.sha256 };
  const rendered = await host.render('design_preview', { object: 'Subscription', context: 'detail', framework: 'react' }, { width: 900, height: 2400 });
  const hostUrl = new URL((rendered.result as { structuredContent: { previewUrl: string } }).structuredContent.previewUrl).origin;
  const frame = rendered.appFrame;
  const shot = (name: string) => host.page.screenshot({ path: path.join(out, name), fullPage: true });
  let state = await settled(frame, { mounts: 0, compares: 0, acts: [] } as unknown as AppState, 'mount');
  const compositionId = state.current!.compositionId;
  const store = path.join(host.storeRoot!, 'compositions', compositionId);
  receipts.composition = { compositionId, resourceUri: rendered.resourceUri, first: state.current };
  await shot('v1.png');

  // 1. The four edits.
  const edits: Array<{ operation: string; act: () => Promise<void> }> = [
    { operation: 'reorder-region', act: () => frame.click('[data-oods-edit] button.move[data-kind="region"][data-index="0"][data-delta="1"]') },
    {
      operation: 'swap-slot',
      act: async () => {
        await frame.evaluate(() => {
          const form = Array.from(document.querySelectorAll<HTMLFormElement>('form[data-edit="swap-slot"]')).find(candidate => Array.from(candidate.querySelector('select')!.options).some(option => option.value !== candidate.dataset.current))!;
          form.dataset.oodsReceiptTarget = 'true';
          const select = form.querySelector('select')!;
          select.value = Array.from(select.options).find(option => option.value !== form.dataset.current)!.value;
        });
        await frame.click('form[data-oods-receipt-target="true"] button[type="submit"]');
      },
    },
    { operation: 'reorder-fields', act: () => frame.click('[data-oods-edit] button.move[data-kind="field"][data-index="0"][data-delta="1"]') },
    { operation: 'seed', act: async () => { await frame.fill('form[data-edit="seed"] input[name="seed"]', 's202-m04-receipt'); await frame.click('form[data-edit="seed"] button[type="submit"]'); } },
  ];
  const editReceipts: Json[] = [];
  for (const [index, entry] of edits.entries()) {
    const before = state;
    await entry.act();
    state = await settled(frame, before, 'mount');
    assert.deepEqual(state.current, { compositionId, version: index + 2, parentVersion: index + 1, operation: entry.operation }, `edit ${entry.operation}`);
    const call = state.toolCalls.filter(candidate => candidate.ok && candidate.arguments.action === 'edit').at(-1)!;
    const screenshot = `edit-${index + 1}-${entry.operation}.png`;
    await shot(screenshot);
    editReceipts.push({ operation: entry.operation, arguments: call.arguments, ms: call.ms, version: state.current, components: state.components, versionListCurrent: await frame.evaluate(() => document.querySelector('[data-oods-versions] li[aria-current="true"]')!.textContent), screenshot });
    console.log(`edit ${entry.operation}: v${state.current!.version} ← v${state.current!.parentVersion}`);
  }
  receipts.edits = { lineage: state.lineage, steps: editReceipts };

  // 2. Side by side: v5 against v1 in React, then the framework switch re-mounts both in Vue.
  const compareReceipts: Json[] = [];
  const diff = await (await fetch(`${hostUrl}/compare/${compositionId}@5/${compositionId}@1/diff.json`)).json() as { identical: boolean; differenceCount: number; summary: Record<string, number>; differences: unknown[] };
  await frame.selectOption('form[data-act="compare"] select', '1');
  await frame.click('form[data-act="compare"] button[type="submit"]');
  for (const framework of ['react', 'vue'] as const) {
    if (framework === 'vue') { const before = state; await frame.click('button[data-control="framework"][data-value="vue"]'); state = await settled(frame, before, 'compare'); }
    else state = await settled(frame, state, 'compare');
    await frame.waitForFunction(() => (window as unknown as Live).__oodsPreviewApp.displayMode === 'fullscreen', undefined, { timeout: 30_000 });
    const view = await frame.evaluate(() => ({
      lists: Object.fromEntries(Array.from(document.querySelectorAll('[data-oods-what-changed] [data-oods-diff]')).map(list => [list.getAttribute('data-oods-diff'), list.querySelectorAll('li').length])),
      panels: Array.from(document.querySelectorAll('[data-oods-compare-panels] [data-oods-measurements]')).map(node => node.getAttribute('data-oods-measurements')),
      sides: [document.querySelectorAll('[data-oods-side-frame="left"] [data-oods-component]').length, document.querySelectorAll('[data-oods-side-frame="right"] [data-oods-component]').length],
      title: document.querySelector('[data-oods-compare-title]')!.textContent,
    }));
    assert.equal(state.view, 'compare');
    assert.equal(state.framework, framework);
    assert.deepEqual({ identical: state.compare!.identical, differenceCount: state.compare!.differenceCount, summary: state.compare!.summary, renderedChanges: state.compare!.renderedChanges }, { identical: diff.identical, differenceCount: diff.differenceCount, summary: diff.summary, renderedChanges: diff.differences.length }, `${framework}: the what-changed against the host's diff`);
    assert.deepEqual(view.lists, Object.fromEntries(Object.entries(diff.summary).filter(([, count]) => count > 0)), `${framework}: rendered lists per category`);
    assert.deepEqual(view.panels, [`${compositionId}@5`, `${compositionId}@1`]);
    assert(state.compare!.left.components > 0 && state.compare!.right.components > 0, `${framework}: both apps mounted`);
    const screenshot = `compare-v5-v1-${framework}.png`;
    await shot(screenshot);
    compareReceipts.push({ framework, compare: state.compare, view, displayMode: state.displayMode, screenshot });
    console.log(`compare ${framework}: ${state.compare!.left.components} / ${state.compare!.right.components} components, ${state.compare!.differenceCount} differences`);
  }
  {
    const before = state;
    await frame.click('button[data-control="framework"][data-value="react"]');
    state = await settled(frame, before, 'compare');
    const back = state;
    await frame.click('button[data-act="close-compare"]');
    state = await settled(frame, back, 'mount');
    await frame.waitForFunction(() => (window as unknown as Live).__oodsPreviewApp.displayMode === 'inline', undefined, { timeout: 30_000 });
  }
  receipts.compare = { hostDiff: { identical: diff.identical, differenceCount: diff.differenceCount, summary: diff.summary }, steps: compareReceipts, displayModeRequests: state.displayModeRequests };

  // 3. Accept v5, then v4 (supersedes), then request changes on v4.
  const acceptReceipts: Json[] = [];
  for (const version of [5, 4]) {
    if (state.current!.version !== version) { const before = state; await frame.click(`[data-oods-versions] button[data-open-version="${version}"]`); state = await settled(frame, before, 'mount'); }
    const before = state;
    await frame.click('button[data-act="accept"]');
    state = await settled(frame, before, 'act', 'accept');
    const record = JSON.parse(fs.readFileSync(path.join(store, 'accepted.json'), 'utf8')) as { acceptances: Array<Json & { version: number; supersedes: { version: number } | null; measurements: Json }> };
    const standing = record.acceptances.at(-1)!;
    assert.equal(standing.version, version);
    assert.deepEqual(standing.measurements, JSON.parse(fs.readFileSync(path.join(store, 'versions', `${version}.json`), 'utf8')).measurements, `v${version}: the measurements snapshot`);
    const recordFile = `accepted-after-v${version}.json`;
    fs.writeFileSync(path.join(out, recordFile), JSON.stringify(record, null, 2) + '\n');
    const page = await (await fetch(`${hostUrl}/preview/${compositionId}/${version}`)).text();
    assert(page.includes('data-oods-accepted="this"'), `v${version}: the browser page shows the acceptance`);
    const panel = await frame.evaluate(() => ({ lineage: document.querySelector('[data-oods-lineage] [data-oods-accepted]')?.closest('dd')?.textContent ?? null, versions: document.querySelector('[data-oods-versions] [data-oods-accepted="true"]')?.closest('li')?.textContent ?? null, acceptDisabled: document.querySelector<HTMLButtonElement>('button[data-act="accept"]')!.disabled }));
    const screenshot = `accepted-v${version}.png`;
    await shot(screenshot);
    acceptReceipts.push({ version, acceptances: record.acceptances.length, supersedes: standing.supersedes, record: recordFile, modelContext: state.modelContext.at(-1), panel, browserPageShowsAccepted: true, screenshot });
    console.log(`accept v${version}: ${record.acceptances.length} acceptance(s), supersedes ${JSON.stringify(standing.supersedes)}`);
  }
  const finalRecord = JSON.parse(fs.readFileSync(path.join(store, 'accepted.json'), 'utf8')) as { acceptances: Array<{ version: number; supersedes: { version: number } | null }> };
  assert.deepEqual(finalRecord.acceptances.map(entry => [entry.version, entry.supersedes?.version ?? null]), [[5, null], [4, 5]]);
  receipts.accept = { steps: acceptReceipts, updateModelContextEvents: host.events.filter(event => event.kind === 'ui/update-model-context').map(event => event.params) };

  const text = 'Put the billing cycle card first.';
  await frame.fill('form[data-act="request-changes"] textarea', text);
  {
    const before = state;
    await frame.click('form[data-act="request-changes"] button[type="submit"]');
    state = await settled(frame, before, 'act', 'request-changes');
  }
  const messages = host.events.filter(event => event.kind === 'ui/message');
  assert.equal(messages.length, 1);
  assert.deepEqual(messages[0]!.params, { role: 'user', content: [{ type: 'text', text: `Request changes to Subscription detail, composition ${compositionId} version 4: ${text}` }] });
  await shot('request-changes.png');
  receipts.requestChanges = { message: messages[0]!.params, screenshot: 'request-changes.png' };

  assert.deepEqual(host.consoleErrors, [], 'console errors');
  assert.deepEqual(host.pageErrors, [], 'page errors');
  assert.deepEqual(host.cspViolations, [], 'CSP violations');
  assert.deepEqual(host.rpc.nonJson, [], 'non-JSON stdout');
  // Every attempt is kept: a call refused at the server's limit (OODS-R001/R002) shows with its code before the retry that succeeded.
  receipts.toolCalls = state.toolCalls.map(call => ({ arguments: call.arguments, ok: call.ok, ...(call.code ? { code: call.code } : {}), ms: call.ms }));
  receipts.events = countKinds(host.events);
  receipts.host = { consoleErrors: host.consoleErrors, pageErrors: host.pageErrors, cspViolations: host.cspViolations, stdoutNonJson: host.rpc.nonJson, negotiation: host.rpc.negotiationReceipt() };
} finally { await host.close(); }

fs.writeFileSync(path.join(out, 'preview-acts.json'), JSON.stringify(receipts, null, 2) + '\n');
console.log(JSON.stringify({ out: path.relative(ROOT, out), edits: 4, compared: ['react', 'vue'], acceptances: 2, messages: 1, consoleErrors: 0, cspViolations: 0 }));
