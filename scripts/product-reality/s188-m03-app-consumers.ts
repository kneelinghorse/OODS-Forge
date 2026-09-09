import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Page } from 'playwright';
import { handle as compose } from '../../packages/mcp-server/src/tools/design.compose.js';
import { isTraitRecipe } from '../../packages/mcp-server/src/compose/trait-recipes.js';
import { handle as generate } from '../../packages/mcp-server/src/tools/code.generate.js';
import { validateGeneratedArtifact } from '../../packages/mcp-server/src/codegen/artifact-envelope.js';
import type { GeneratedArtifact } from '../../packages/mcp-server/src/codegen/types.js';
import { packFoundationPackages } from './s182-m04-consumer-harness.mjs';
import {
  GATE_NAMES, REPOSITORY_ROOT, commandResult, requireGreen, prepareManifest,
  isolatedNpmEnvironment, assertInstalledIsolation, resolveImports, withStaticServer, cssProof, launchProofBrowser,
  type PackedPackageRecord,
} from './s184-m06-live-consumers.js';

type Framework = 'react' | 'vue';
type Row = { name: string; status: 'passed' | 'failed' | 'unproven'; detail?: unknown; error?: string };
const contexts = ['list', 'detail', 'form', 'timeline'] as const;
const digest = (contents: string | Buffer) => `sha256:${createHash('sha256').update(contents).digest('hex')}`;
async function json(file: string, value: unknown) { await fs.mkdir(path.dirname(file), { recursive: true }); await fs.writeFile(file, JSON.stringify(value, null, 2) + '\n'); }
async function writeFiles(root: string, files: Record<string, string>) { for (const [name, contents] of Object.entries(files)) { await fs.mkdir(path.dirname(path.join(root, name)), { recursive: true }); await fs.writeFile(path.join(root, name), contents); } }
async function observe(rows: Row[], name: string, action: () => Promise<unknown>) {
  try { const detail = await action(); rows.push({ name, status: 'passed', detail }); }
  catch (error) { rows.push({ name, status: 'failed', error: error instanceof Error ? error.message : String(error) }); throw error; }
}
const screen = (page: Page) => page.locator('[data-oods-workflow="Subscription"]');
async function ready(page: Page, name: string, state = 'success') { await page.locator(`[data-screen="${name}"][data-ui-state="${state}"]`).waitFor({ timeout: 8000 }); }
async function go(page: Page, context: string) {
  const label = context === 'form' ? 'Edit' : context[0]!.toUpperCase() + context.slice(1);
  await page.getByRole('navigation', { name: 'Workflow screens' }).getByRole('button', { name: label, exact: true }).click();
}

async function selectPaymentTab(page: Page) {
  if (await page.locator('[data-oods-component="PaymentTimeline"]').isVisible()) return;
  const tab = page.getByRole('tab', { name: 'Status & History', exact: true });
  if (await tab.isVisible()) await tab.click();
  else {
    await page.getByRole('button', { name: 'More tabs', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Status & History', exact: true }).click();
  }
  await page.locator('[data-oods-component="PaymentTimeline"]').waitFor({ state: 'visible' });
}

// Record actual visible recipe roots after navigation, including React's lazy tab panels.
async function mountedRecipes(page: Page) {
  const roots = await page.locator('[data-oods-component]').evaluateAll((elements) => elements
    .filter((element) => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden')
    .map((element) => ({ nodeId: element.id, component: element.getAttribute('data-oods-component')!, present: true, passed: true })));
  return roots.filter((root) => isTraitRecipe(root.component));
}

export async function observeFlow(page: Page, url: string, requireBillingViews = false): Promise<Row[]> {
  const rows: Row[] = [];
  try {
    await page.goto(`${url}/?latency=60`, { waitUntil: 'domcontentloaded' });
    await ready(page, 'list');
    await observe(rows, 'ten-sample-records', async () => {
      const active = await page.locator(':is([data-oods-collection="rows"], .workflow-records) [data-record-id]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-record-id')));
      const archiveTabs = page.getByRole('tablist', { name: 'Archive views' });
      const hasArchive = await archiveTabs.count() > 0;
      if (requireBillingViews) assert.equal(hasArchive, true, 'Declared archive views must be mounted');
      if (hasArchive) {
        assert.equal(await page.locator(':is([data-oods-collection="rows"], .workflow-records) [data-archived="true"]').count(), 0);
        await archiveTabs.getByRole('tab', { name: 'Active', exact: true }).focus();
        await page.keyboard.press('ArrowRight'); await page.keyboard.press('Enter');
      } else await page.getByRole('button', { name: 'Archived', exact: true }).click();
      await ready(page, 'list');
      const archived = await page.locator(':is([data-oods-collection="rows"], .workflow-records) [data-record-id]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-record-id')));
      assert.equal(active.length, 9); assert.equal(archived.length, 1); assert.equal(new Set([...active, ...archived]).size, 10);
      const mounts = await mountedRecipes(page);
      let archivePresentation: unknown;
      if (hasArchive) {
        const overlay = page.locator(':is([data-oods-collection="rows"], .workflow-records) [data-archived="true"]');
        assert.equal(await overlay.count(), 1);
        assert.equal(await overlay.getAttribute('role'), 'group');
        assert.equal(await overlay.getAttribute('aria-hidden'), 'false');
        assert.match(await overlay.getAttribute('aria-label') ?? '', /^Archived: Subscription/);
        assert.equal(await overlay.locator('.oods-archive-badge').innerText(), 'Archived');
        const opacity = await overlay.evaluate((node) => getComputedStyle(node).opacity);
        assert.equal(opacity, '0.6');
        archivePresentation = { opacity, accessibleName: await overlay.getAttribute('aria-label'), tabLabel: await overlay.getAttribute('data-archive-tab'), keyboardNavigation: true };
        await archiveTabs.getByRole('tab', { name: 'Active', exact: true }).click();
      } else await page.getByRole('button', { name: 'Show active', exact: true }).click();
      await ready(page, 'list');
      return { active, archived, archivePresentation, mounts, total: 10, disposition: 'nine active and one in the generated Archived view' };
    });
    await observe(rows, 'detail-navigation', async () => {
      await page.locator(':is([data-oods-collection="rows"], .workflow-records) [data-record-id="subscription-003"]').click();
      await ready(page, 'detail');
      assert.equal(await screen(page).getAttribute('data-selected-id'), 'subscription-003');
      const cycle = page.locator('[data-oods-component="CycleProgressCard"]');
      const payments = page.locator('[data-oods-component="PaymentTimeline"]');
      const mounts = await mountedRecipes(page);
      let billingViews: unknown;
      if (requireBillingViews) assert.equal(await cycle.count(), 1);
      if (await cycle.count()) {
        assert.match(await cycle.innerText(), /\d+%.*remaining/);
        assert.equal(await cycle.getByRole('progressbar').count(), 1);
        const cycleText = await cycle.innerText();
        await selectPaymentTab(page);
        await payments.waitFor({ state: 'visible' });
        assert.match(await payments.innerText(), /Payment method:/);
        assert.equal(await payments.locator('[data-payment-kind]').count(), 2);
        mounts.push(...await mountedRecipes(page));
        billingViews = { cycle: cycleText, payments: await payments.innerText() };
      }
      return { id: await screen(page).getAttribute('data-selected-id'), heading: await page.locator('h1').innerText(), billingViews, mounts };
    });
    await observe(rows, 'edit-seeded-values', async () => {
      await page.locator('[data-oods-action="handleEdit"]').click(); await ready(page, 'form');
      const plan = await page.locator('input[name="plan_name"]').inputValue();
      assert.equal(plan, 'Subscription 03');
      return { id: await screen(page).getAttribute('data-selected-id'), plan };
    });
    const hasBilling = await page.locator('[data-oods-component="BillingAmountInput"]').count() > 0;
    if (hasBilling) await observe(rows, 'billing-edit-values', async () => {
      const amount = page.locator('[data-billing-minor-units]');
      const interval = page.getByRole('combobox', { name: 'Billing interval', exact: true });
      const options = await interval.locator('option:not([disabled])').evaluateAll((nodes) => nodes.map((node) => (node as HTMLOptionElement).value));
      assert.deepEqual(options, ['monthly', 'yearly']);
      await amount.fill('-1'); assert.equal(await amount.getAttribute('aria-invalid'), 'true');
      await page.getByRole('button', { name: 'Save', exact: true }).click(); await ready(page, 'form');
      await amount.fill('19.99'); await interval.focus(); await interval.press('Home'); await interval.press('ArrowDown');
      assert.equal(await interval.inputValue(), 'yearly');
      return { options, amount: await amount.inputValue(), interval: await interval.inputValue(), invalidSaveStayedOnForm: true };
    });
    await observe(rows, 'save-plan-name', async () => {
      await page.locator('input[name="plan_name"]').fill('Team annual');
      await page.getByRole('button', { name: 'Save', exact: true }).click(); await ready(page, 'detail');
      assert.equal(await page.locator('h1').innerText(), 'Team annual');
      assert.equal(await page.locator('.workflow-notice').innerText(), 'Changes saved in this session.');
      return { heading: await page.locator('h1').innerText() };
    });
    if (hasBilling) await observe(rows, 'billing-save-persists', async () => {
      await page.locator('[data-oods-action="handleEdit"]').click(); await ready(page, 'form');
      const amount = await page.locator('[data-billing-minor-units]').inputValue();
      const interval = await page.getByRole('combobox', { name: 'Billing interval', exact: true }).inputValue();
      assert.equal(amount, '19.99'); assert.equal(interval, 'yearly');
      await go(page, 'detail'); await ready(page, 'detail');
      return { id: await screen(page).getAttribute('data-selected-id'), storedMinorUnits: 1999, majorUnitEditorValue: amount, interval };
    });
    await observe(rows, 'cancel-detail', async () => {
      const onDemand = await page.locator('input[name="cancellation_reason"]').count() === 0;
      if (onDemand) {
        assert.equal(await page.locator('[data-oods-component="CancellationForm"]').count(), 0);
        assert.equal(await page.getByRole('textbox').count(), 0);
        assert.equal(await page.getByRole('checkbox').count(), 0);
        await page.locator('[data-oods-action="handleCancel"]').click();
        await page.locator('[data-oods-component="CancellationForm"] textarea[name="reason"]').fill('Budget changed for next year');
        const code = page.locator('[data-oods-component="CancellationForm"] [name="reasonCode"]');
        if (await code.evaluate(element => element.tagName) === 'SELECT') await code.selectOption('customer_request');
        else await code.fill('customer_request');
        await page.locator('input[name="cancel_at_period_end"]').check();
        await page.getByRole('button', { name: 'Confirm cancellation', exact: true }).click();
      } else {
        await page.locator('input[name="cancellation_reason"]').fill('Budget changed for next year');
        await page.locator('input[name="cancellation_reason_code"]').fill('customer_request');
        await page.locator('input[name="cancel_at_period_end"]').check();
        await page.locator('[data-oods-action="handleCancel"]').click();
      }
      await ready(page, 'detail');
      const text = await screen(page).innerText(); assert.match(text, /pending[ _]cancellation/i);
      assert.equal(await page.locator('.workflow-notice').innerText(), 'Changes saved in this session.');
      if (onDemand) assert.equal(await page.locator('[data-oods-component="CancellationForm"]').count(), 0);
      return { text, id: await screen(page).getAttribute('data-selected-id'), onDemand, readOnlyBeforeActivation: onDemand };
    });
    await observe(rows, 'cancel-list-badge', async () => {
      await go(page, 'list'); await ready(page, 'list');
      const text = await page.locator(':is([data-oods-collection="rows"], .workflow-records) [data-record-id="subscription-003"] [data-oods-component="StatusBadge"]').innerText();
      assert.match(text, /pending[ _]cancellation/i);
      return { text };
    });
    await observe(rows, 'timeline-navigation-and-history', async () => {
      await page.locator(':is([data-oods-collection="rows"], .workflow-records) [data-record-id="subscription-003"]').click(); await ready(page, 'detail');
      await page.locator('[data-oods-action="handleViewTimeline"]').click(); await ready(page, 'timeline');
      const text = await page.getByRole('list', { name: 'Lifecycle history' }).innerText();
      assert.match(text, /pending[ _]cancellation/i); assert.match(text, /Budget changed for next year/);
      const events = page.locator('[data-oods-component="PaymentEventTimeline"]');
      let paymentEvents: string | undefined;
      const composedEvents = await page.locator('[data-oods-collection="events"]').count() > 0;
      if (requireBillingViews) assert.equal(await events.count(), composedEvents ? 2 : 1);
      if (await events.count()) {
        await events.first().waitFor({ state: 'visible' });
        paymentEvents = (await events.allTextContents()).join('\n');
        if (composedEvents) {
          assert.match(paymentEvents, /Last payment/); assert.match(paymentEvents, /Next payment/);
          assert.doesNotMatch(text, /\d{4}-\d{2}-\d{2}T/);
        } else {
          assert.equal(await events.locator('[data-payment-kind]').count(), 2);
          assert.match(paymentEvents, /Payment events/);
        }
      }
      return { text, id: await screen(page).getAttribute('data-selected-id'), paymentEvents, mounts: await mountedRecipes(page) };
    });
  } catch { /* The exact failing row is retained; dependent flow rows are not claimed. */ }
  return rows;
}

async function observeStates(page: Page, url: string, framework: Framework) {
  const rows: Array<Record<string, unknown>> = [];
  for (const [mode, expected] of [['', 'success'], ['empty', 'empty'], ['error', 'error']] as const) {
    await page.goto(`${url}/?mode=${mode}&latency=650`, { waitUntil: 'domcontentloaded' });
    for (const context of contexts) {
      if (context !== 'list') await go(page, context);
      if (mode === '') {
        const loading = page.locator(`[data-screen="${context}"] [data-oods-state="loading"]`);
        await loading.waitFor({ timeout: 5000 });
        rows.push({ framework, screen: context, state: 'loading', marker: await loading.getAttribute('data-oods-state'), text: await loading.innerText() });
      }
      await ready(page, context, expected);
      const branch = page.locator(`[data-screen="${context}"] [data-oods-state="${expected}"]`);
      assert.equal(await branch.count(), 1);
      rows.push({ framework, screen: context, state: expected, marker: await branch.getAttribute('data-oods-state'), text: await branch.innerText() });
    }
  }
  assert.equal(rows.length, 16);
  return rows;
}

/** Query controls stay usable through empty results; a refresh must not steal typing focus. */
async function observeCollectionControls(page: Page, url: string) {
  await page.goto(`${url}/?latency=60`, { waitUntil: 'domcontentloaded' });
  await ready(page, 'list');
  if (!await page.locator('[data-oods-collection="rows"]').count()) return [];
  const rows: Row[] = [];
  const records = page.locator('[data-oods-collection="rows"] [data-record-id]');
  const search = page.getByRole('searchbox', { name: 'Search', exact: true });
  await observe(rows, 'type-through-empty-results', async () => {
    await search.focus(); await search.pressSequentially('not-a-record');
    assert.equal(await search.inputValue(), 'not-a-record');
    assert.equal(await search.evaluate(element => document.activeElement === element), true);
    assert.equal(await records.count(), 0);
    await ready(page, 'list', 'empty');
    await page.getByRole('button', { name: 'Clear search', exact: true }).click();
    assert.equal(await search.inputValue(), ''); assert.equal(await records.count(), 9);
    return { typed: 'not-a-record', retainedFocus: true, emptyCount: 0, restoredCount: 9 };
  });
  await observe(rows, 'filter-composed-rows', async () => {
    await page.getByRole('combobox', { name: 'Status', exact: true }).selectOption('active');
    assert.equal(await records.count(), 1);
    assert.equal(await records.first().getAttribute('data-record-id'), 'subscription-003');
    await page.getByRole('combobox', { name: 'Status', exact: true }).selectOption('');
    assert.equal(await records.count(), 9);
    return { activeCount: 1, restoredCount: 9 };
  });
  await observe(rows, 'sort-composed-rows', async () => {
    await page.getByRole('combobox', { name: 'Sort', exact: true }).selectOption('desc');
    assert.equal(await records.first().getAttribute('data-record-id'), 'subscription-009');
    await page.getByRole('combobox', { name: 'Sort', exact: true }).selectOption('asc');
    assert.equal(await records.first().getAttribute('data-record-id'), 'subscription-001');
    return { descendingFirst: 'subscription-009', ascendingFirst: 'subscription-001' };
  });
  await observe(rows, 'pagination-uses-real-boundaries', async () => {
    const pagination = page.getByRole('navigation', { name: 'Pagination', exact: true });
    assert.equal(await pagination.count(), 1);
    assert.match(await pagination.innerText(), /9 records/);
    assert.match(await pagination.innerText(), /Page 1 of 1/);
    assert.equal(await pagination.getByRole('button', { name: 'Previous page' }).isDisabled(), true);
    assert.equal(await pagination.getByRole('button', { name: 'Next page' }).isDisabled(), true);
    return { total: 9, page: 1, pages: 1, previousDisabled: true, nextDisabled: true };
  });
  return rows;
}

export async function screenshots(page: Page, url: string, output: string, framework: Framework, artifactHash: string, requireBillingViews: boolean) {
  const rows: Array<Record<string, unknown>> = [];
  const flow = await observeFlow(page, url, requireBillingViews);
  assert.equal(flow.length, flow.some((row) => row.name === 'billing-edit-values') ? 9 : 7); assert.ok(flow.every((row) => row.status === 'passed'));
  await go(page, 'list'); await ready(page, 'list');
  for (const width of [390, 820, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const context of contexts) {
      if (context === 'detail') await page.locator(':is([data-oods-collection="rows"], .workflow-records) [data-record-id="subscription-003"]').click();
      else await go(page, context);
      await ready(page, context);
      const file = `screenshots/${framework}-${context}-${width}.png`;
      await fs.mkdir(path.join(output, 'screenshots'), { recursive: true });
      await page.screenshot({ path: path.join(output, file), fullPage: true });
      const layout = await page.evaluate(() => ({ viewport: window.innerWidth, documentWidth: document.documentElement.scrollWidth, overflowing: Array.from(document.querySelectorAll('main *')).filter((node) => node.getBoundingClientRect().right > window.innerWidth + 1).slice(0, 20).map((node) => ({ tag: node.tagName, component: node.getAttribute('data-oods-component'), width: node.getBoundingClientRect().width })) }));
      rows.push({ framework, screen: context, width, file, sha256: digest(await fs.readFile(path.join(output, file))), artifactHash, selectedId: await screen(page).getAttribute('data-selected-id'), layout });
      if (requireBillingViews && (context === 'list' || context === 'detail')) {
        const view = context === 'list' ? 'archived' : 'payments';
        if (context === 'list') {
          await page.getByRole('tablist', { name: 'Archive views' }).getByRole('tab', { name: 'Archived', exact: true }).click();
          await ready(page, 'list');
        } else {
          await selectPaymentTab(page);
        }
        const extra = `screenshots/${framework}-${view}-${width}.png`;
        await page.screenshot({ path: path.join(output, extra), fullPage: true });
        rows.push({ framework, screen: view, width, file: extra, sha256: digest(await fs.readFile(path.join(output, extra))), artifactHash, selectedId: await screen(page).getAttribute('data-selected-id') });
        if (context === 'list') {
          await page.getByRole('tablist', { name: 'Archive views' }).getByRole('tab', { name: 'Active', exact: true }).click();
          await ready(page, 'list');
        }
      }
    }
  }
  return rows;
}

export async function runAppConsumers(output: string, mission = 's188-m03') {
  await fs.mkdir(output, { recursive: true });
  const composition = await compose({ object: 'Subscription', context: 'workflow' });
  assert.equal(composition.status, 'ok');
  await json(path.join(output, 'composition.json'), composition);
  const requireBillingViews = JSON.stringify(composition.schema).includes('CycleProgressCard');
  const artifacts = new Map<Framework, GeneratedArtifact>();
  for (const framework of ['react', 'vue'] as const) {
    const generated = await generate({ schema: composition.schema, framework, profile: 'build' });
    assert.equal(generated.status, 'ok', JSON.stringify(generated.errors));
    assert.deepEqual(validateGeneratedArtifact(generated.artifact!), []);
    artifacts.set(framework, generated.artifact!);
    await json(path.join(output, `${framework}-generation.json`), generated);
  }
  const tarballs = await packFoundationPackages(output) as PackedPackageRecord[];
  const browser = await launchProofBrowser();
  const cells: Array<Record<string, unknown>> = [];
  const allStates: Array<Record<string, unknown>> = [];
  const allScreenshots: Array<Record<string, unknown>> = [];
  const consumers = new Map<Framework, string>();
  try {
    for (const framework of ['react', 'vue'] as const) {
      const artifact = artifacts.get(framework)!;
      const cellRoot = path.join(output, framework);
      await fs.mkdir(path.join(cellRoot, 'logs'), { recursive: true });
      const consumer = await fs.mkdtemp(path.join(os.tmpdir(), `oods-s188-app-${framework}-`));
      consumers.set(framework, consumer);
      const sourceFiles = Object.fromEntries(artifact.files.map((file) => [file.path, file.contents]));
      const gates: Row[] = GATE_NAMES.map((name) => ({ name, status: 'unproven' }));
      const pass = (name: string, detail?: unknown) => Object.assign(gates.find((row) => row.name === name)!, { status: 'passed', detail });
      let activeGate: string = GATE_NAMES[0];
      const cell: Record<string, unknown> = { framework, artifactHash: artifact.contentHash, gates, consumerAuthoredComponents: 0, consumerAuthoredActions: 0, generation: 'current-in-run-public-output', consumerRoot: consumer };
      cells.push(cell);
      const command = async (name: string, args: string[]) => {
        const result = commandResult('npm', args, consumer, { environment, scrubNpmCredentials: true });
        await fs.writeFile(path.join(cellRoot, 'logs', `${name}.log`), JSON.stringify(result, null, 2) + '\n');
        requireGreen(result, `${framework} ${name}`);
        return { exitCode: result.exitCode, log: `${framework}/logs/${name}.log` };
      };
      const userConfig = path.join(consumer, 'empty-user.npmrc');
      const globalConfig = path.join(consumer, 'empty-global.npmrc');
      const environment = isolatedNpmEnvironment(consumer, userConfig, globalConfig);
      try {
        assert.equal(await fs.stat(path.join(consumer, 'node_modules')).then(() => true, () => false), false);
        await writeFiles(consumer, sourceFiles);
        await writeFiles(path.join(cellRoot, 'source'), sourceFiles);
        const prepared = await prepareManifest(framework, artifact, tarballs, consumer);
        const emittedManifest = JSON.parse(sourceFiles['package.json']!);
        const manifest = { ...emittedManifest, dependencies: { ...emittedManifest.dependencies, ...prepared.manifest.dependencies as object }, devDependencies: { ...prepared.manifest.devDependencies as object, ...emittedManifest.devDependencies } };
        await json(path.join(consumer, 'package.json'), manifest);
        await json(path.join(cellRoot, 'installed-manifest.json'), manifest);
        await Promise.all([fs.writeFile(userConfig, ''), fs.writeFile(globalConfig, ''), fs.writeFile(path.join(consumer, '.npmrc'), '')]);
        await command('install', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', '--userconfig', userConfig]);
        const isolation = assertInstalledIsolation(consumer, framework, prepared.localTarballs, sourceFiles);
        const resolutions = resolveImports(consumer, sourceFiles);
        await json(path.join(cellRoot, 'isolation.json'), { isolation, resolutions, localTarballs: prepared.localTarballs });
        const sourceOwnership = [];
        for (const file of artifact.files.filter((file) => file.path !== 'package.json')) {
          const actual = await fs.readFile(path.join(consumer, file.path));
          assert.equal(digest(actual), file.contentHash);
          sourceOwnership.push({ path: file.path, expected: file.contentHash, actual: digest(actual) });
        }
        await json(path.join(cellRoot, 'source-ownership.json'), { generatedFilesUnchanged: true, consumerAuthoredComponents: 0, consumerAuthoredActions: 0, files: sourceOwnership });
        pass(activeGate, { isolation, resolutions });
        activeGate = 'strict-typecheck'; pass(activeGate, await command('typecheck', ['run', 'typecheck', '--', '--pretty', 'false']));
        activeGate = 'production-build'; pass(activeGate, await command('build', ['exec', '--', 'vite', 'build']));
        activeGate = 'server-render';
        await command('ssr-build', ['exec', '--', 'vite', 'build', '--ssr', `src/ssr.${framework === 'react' ? 'tsx' : 'ts'}`, '--outDir', 'dist-ssr']);
        const entry = (await fs.readdir(path.join(consumer, 'dist-ssr'))).find((name) => /\.[cm]?js$/.test(name))!;
        const runner = `import { renderApp } from './dist-ssr/${entry}';\nprocess.stdout.write(JSON.stringify({ html: await renderApp() }));\n`;
        await fs.writeFile(path.join(consumer, 'ssr-observer.mjs'), runner);
        const rendered = commandResult('node', ['ssr-observer.mjs'], consumer, { environment, scrubNpmCredentials: true });
        await json(path.join(cellRoot, 'logs/ssr-render.json'), rendered); requireGreen(rendered, 'SSR root');
        const { html } = JSON.parse(rendered.stdout) as { html: string };
        assert.match(html, /data-screen="list"/); assert.match(html, /Subscriptions/);
        await fs.writeFile(path.join(cellRoot, 'server-render.html'), html);
        pass(activeGate, { htmlHash: digest(html), generatedEntry: `src/ssr.${framework === 'react' ? 'tsx' : 'ts'}` });
        activeGate = 'shared-css-resolution'; pass(activeGate, await cssProof(path.join(consumer, 'dist'), true));
        await withStaticServer(path.join(consumer, 'dist'), async (url) => {
          const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
          const errors: string[] = [];
          page.on('pageerror', (error) => errors.push(error.message));
          page.on('console', (message) => { if (message.type() === 'error' || /hydrat/i.test(message.text())) errors.push(message.text()); });
          activeGate = 'mount';
          await page.goto(url, { waitUntil: 'domcontentloaded' }); await ready(page, 'list');
          assert.equal(await screen(page).count(), 1); assert.deepEqual(errors, []);
          pass(activeGate, { screenCount: 1, errors: [...errors] });
          activeGate = 'hydration';
          const index = path.join(consumer, 'dist/index.html');
          const original = await fs.readFile(index, 'utf8');
          await fs.writeFile(index, original.replace('<div id="app"></div>', `<div id="app">${html}</div>`));
          await page.addInitScript(() => { const observer = new MutationObserver(() => { const node = document.querySelector('[data-oods-workflow]'); if (node && !(window as any).__ssrNode) (window as any).__ssrNode = node; }); observer.observe(document, { childList: true, subtree: true }); });
          await page.goto(url, { waitUntil: 'domcontentloaded' }); await ready(page, 'list');
          assert.equal(await page.evaluate(() => (window as any).__ssrNode === document.querySelector('[data-oods-workflow]')), true);
          assert.deepEqual(errors, []);
          pass(activeGate, { preservesSsrRoot: true, errors: [...errors] });
          await fs.writeFile(index, original);
          activeGate = 'interaction-evidence';
          const flow = await observeFlow(page, url, requireBillingViews); cell.flow = flow;
          await json(path.join(cellRoot, 'flow.json'), flow);
          assert.equal(flow.length, flow.some((row) => row.name === 'billing-edit-values') ? 9 : 7); assert.equal(flow.filter((row) => row.status !== 'passed').length, 0, JSON.stringify(flow));
          const states = await observeStates(page, url, framework); allStates.push(...states);
          await json(path.join(cellRoot, 'states.json'), states);
          const collectionControls = await observeCollectionControls(page, url);
          await json(path.join(cellRoot, 'collection-controls.json'), collectionControls);
          assert.ok(collectionControls.every(row => row.status === 'passed'), JSON.stringify(collectionControls));
          const images = await screenshots(page, url, output, framework, artifact.contentHash, requireBillingViews); allScreenshots.push(...images);
          assert.deepEqual(errors, []);
          pass(activeGate, { flowRows: flow.length, stateObservations: states.length, screenshots: images.length, errors });
          await page.close();
        });
      } catch (error) {
        Object.assign(gates.find((row) => row.name === activeGate)!, { status: 'failed', error: error instanceof Error ? error.message : String(error) });
        cell.error = error instanceof Error ? error.stack : String(error);
      }
      await json(path.join(cellRoot, 'receipt.json'), cell);
      process.stdout.write(`${framework}: ${gates.map((row) => `${row.name}=${row.status}`).join(', ')}\n`);
    }
    if (cells.every((cell) => (cell.gates as Row[]).every((gate) => gate.status === 'passed'))) {
      const consumer = consumers.get('react')!;
      const file = path.join(consumer, 'src/application.ts');
      const original = await fs.readFile(file, 'utf8');
      const needle = 'void navigate("detail", id);';
      assert.equal(original.split(needle).length - 1, 1);
      await fs.writeFile(file, original.replace(needle, ''));
      const mutated = await fs.readFile(file, 'utf8');
      const build = commandResult('npm', ['exec', '--', 'vite', 'build'], consumer, { scrubNpmCredentials: true });
      await json(path.join(output, 'bite-build.json'), build); requireGreen(build, 'navigation bite build');
      const page = await browser.newPage();
      const red = await withStaticServer(path.join(consumer, 'dist'), (url) => observeFlow(page, url, requireBillingViews));
      assert.deepEqual(red.filter((row) => row.status === 'failed').map((row) => row.name), ['detail-navigation']);
      await fs.writeFile(file, original); assert.equal(digest(await fs.readFile(file)), digest(original));
      const restore = commandResult('npm', ['exec', '--', 'vite', 'build'], consumer, { scrubNpmCredentials: true }); requireGreen(restore, 'restore navigation');
      await json(path.join(output, 'bite-restore-build.json'), restore);
      const green = await withStaticServer(path.join(consumer, 'dist'), (url) => observeFlow(page, url, requireBillingViews));
      assert.equal(green.length, green.some((row) => row.name === 'billing-edit-values') ? 9 : 7); assert.ok(green.every((row) => row.status === 'passed'));
      const unaffected = await withStaticServer(path.join(consumers.get('vue')!, 'dist'), (url) => observeFlow(page, url, requireBillingViews));
      assert.equal(unaffected.length, unaffected.some((row) => row.name === 'billing-edit-values') ? 9 : 7); assert.ok(unaffected.every((row) => row.status === 'passed'));
      await json(path.join(output, 'navigation-bite.json'), { framework: 'react', source: 'src/application.ts', beforeHash: digest(original), afterHash: digest(mutated), restoredHash: digest(await fs.readFile(file)), red, restored: green, unaffectedFramework: 'vue', unaffected });
      await page.close();
    }
    const cellReports = await Promise.all(cells.map(async (cell) => ({ framework: cell.framework, report: `${cell.framework}/receipt.json`, sha256: digest(await fs.readFile(path.join(output, `${cell.framework}/receipt.json`))) })));
    const report = { mission, cellReports, sourceHead: commandResult('git', ['rev-parse', 'HEAD'], REPOSITORY_ROOT).stdout.trim(), builderSelfCertified: false, cells, stateObservations: allStates, screenshots: allScreenshots };
    await json(path.join(output, 'report.json'), report);
    return report;
  } finally { await browser.close(); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const output = path.resolve(process.argv[2] ?? path.join(REPOSITORY_ROOT, 'artifacts/product-reality/sprint-188/m03/live'));
  runAppConsumers(output, process.argv[3]).then((report) => { if (report.cells.some((cell) => (cell.gates as Row[]).some((gate) => gate.status !== 'passed'))) process.exitCode = 1; }).catch((error) => { process.stderr.write(String(error.stack ?? error) + '\n'); process.exitCode = 1; });
}
