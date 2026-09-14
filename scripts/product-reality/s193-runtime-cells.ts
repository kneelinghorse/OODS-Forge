import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser, type Page } from 'playwright';
import { handle as listObjects } from '../../packages/mcp-server/src/tools/object.list.js';
import { edgeArrayToNetwork } from '../../packages/mcp-server/src/codegen/chart-assets.js';
import { workflowSampleRecords } from '../../packages/mcp-server/src/codegen/workflow-data-emitter.js';
import { runVizThemeProof } from './component-theme-proof.mjs';
import { validateGeneratedArtifact } from '../../packages/mcp-server/src/codegen/artifact-envelope.js';
import type { UiSchema } from '../../packages/mcp-server/src/schemas/generated.js';
import { packFoundationPackages } from './s182-m04-consumer-harness.mjs';
import { deriveConsumerModel, deriveMountObligations, observeMountObligations, schemaNodes } from './s185-m04-consumer-contract.js';
import {
  REPOSITORY_ROOT, createConsumerFiles, prepareManifest, isolatedNpmEnvironment,
  commandResult, requireGreen, assertInstalledIsolation, resolveImports, withStaticServer,
  launchProofBrowser, type PackedPackageRecord,
} from './s184-m06-live-consumers.js';

import { OBJECTS, CONTEXTS, FRAMEWORKS, BROWSER_IMAGE, contextsForObject, supportsWorkflow, summarize, validateRuntimeLedger, type RuntimeCell, type RuntimeLedger, type Context, type Framework } from '../../packages/mcp-server/src/lib/runtime-ledger.js';
import { VIZ_CONTROL_IDS, vizControlFields, type VizControlId } from '../../packages/component-contracts/src/viz-controls.js';
import { RELEASE_OBJECTS, validateReleaseLedger, type ReleaseCell, type ReleaseLedger } from '../../packages/mcp-server/src/lib/release-ledger.js';
import {
  assertBundleSourceMatches, bundleRuntimeFromEnvironment, createRuntimeToolset, prepareBundleRuntime, releaseCellProvenance,
  type BundleRuntimeInput, type BundleRuntimeConfiguration, type RuntimeToolset,
} from './s196-bundle-runtime.js';
export { OBJECTS, CONTEXTS, FRAMEWORKS, BROWSER_IMAGE, summarize, validateRuntimeLedger, type RuntimeCell, type RuntimeLedger } from '../../packages/mcp-server/src/lib/runtime-ledger.js';

const hash = (value: string | Buffer) => `sha256:${createHash('sha256').update(value).digest('hex')}`;
const write = async (file: string, value: unknown) => { await fs.mkdir(path.dirname(file), { recursive: true }); await fs.writeFile(file, JSON.stringify(value, null, 2) + '\n'); };
const identity = (row: Pick<RuntimeCell, 'object' | 'context' | 'framework'>) => `${row.object}/${row.context}/${row.framework}`;

// Only the consumer mount entry changes. Generated files and schemas remain exact handler output.
function mountEntry(framework: Framework, files: Record<string, string>) {
  const name = framework === 'react' ? 'src/main.tsx' : 'src/main.ts';
  let source = files[name]!;
  if (framework === 'react') source = source.replace("import { hydrateRoot }", "import { createRoot }")
    .replace('hydrateRoot(root, React.createElement(GeneratedUI,', 'createRoot(root).render(React.createElement(GeneratedUI,').replace(/\}\)\);\s*$/, '}));\n');
  else source = source.replaceAll('createSSRApp', 'createApp');
  // State input is a real public component prop, provided before mount; no synthetic state UI.
  source = source.replace("import './consumer.css';", "import './consumer.css';\nObject.assign(model, JSON.parse(new URLSearchParams(location.search).get('model') ?? '{}'));\n");
  if (framework === 'vue') source = source.replace("import { model } from './consumer-data.js';", "import { model } from './consumer-data.js';\nObject.assign(model, JSON.parse(new URLSearchParams(location.search).get('model') ?? '{}'));\n");
  files[name] = source;
}

async function contextProof(page: Page, url: string, context: Context, schema: UiSchema, model: Record<string, unknown>) {
  const nodes = schemaNodes(schema);
  if (context === 'list') {
    const declared = new Set(nodes.map(node => node.state).filter(Boolean));
    assert(['loading', 'empty', 'error', 'success'].every(state => declared.has(state as any)), 'List composition must declare loading/empty/error/success; workflow-only states do not prove this cell');
    const observed = [];
    for (const state of ['loading', 'empty', 'error', 'success']) {
      const props = { uiState: state, ...(state === 'empty' ? { rows: [] } : { rows: model.rows }) };
      await page.goto(`${url}/?model=${encodeURIComponent(JSON.stringify(props))}`, { waitUntil: 'networkidle' });
      const branch = page.locator(`[data-oods-state="${state}"]`);
      assert(await branch.first().isVisible(), `Missing visible ${state} branch`);
      observed.push({ state, text: await branch.first().innerText() });
    }
    return { declared: [...declared], observed };
  }
  if (context === 'form') {
    const values = await page.locator('input:not([type="hidden"]),textarea,select').evaluateAll(elements => elements.map(element => {
      const field = element as HTMLInputElement;
      return { id: field.id, value: field.value, type: field.type, required: field.required, valid: field.checkValidity() };
    }));
    assert(values.length > 0, 'Form has no fields');
    assert(values.filter(field => field.required).every(field => field.value.length > 0), 'Required form fields must display their seeded values');
    const required = page.locator('input[required]:not([type="hidden"]),textarea[required]').first();
    assert(await required.count(), 'Form has no required validation probe');
    const before = await required.inputValue();
    await required.fill('');
    assert.equal(await required.evaluate((element: HTMLInputElement) => element.checkValidity()), false, 'Empty required value must fail native validation');
    await required.fill(before);
    const recipeChanges: Record<string, unknown> = {};
    for (const node of nodes.filter(node => (VIZ_CONTROL_IDS as readonly string[]).includes(node.component))) {
      const field = vizControlFields(node.component as VizControlId, node.props?.channel === 'y' ? 'y' : 'x')[0]!;
      const editor = page.locator(`[id=${JSON.stringify(node.id)}] [name=${JSON.stringify(field.key)}]`);
      const before = await editor.inputValue();
      const next = field.type === 'select' ? field.options!.find(value => value !== before)! : `${before}x`;
      const expected = structuredClone(node.props?.value ?? {}) as Record<string, any>;
      if (field.key === 'opacity') expected.opacity = Number(next);
      else if (field.key === 'chartType') expected.chartType = next;
      else {
        const [channel, property] = field.key.split('.');
        expected.encodings ??= {}; expected.encodings[channel!] ??= {};
        expected.encodings[channel!][property!] = next;
      }
      if (field.type === 'select') await editor.selectOption(next); else await editor.fill(next);
      assert.equal(await editor.inputValue(), next, `${node.component} edit must remain visible`);
      const handler = node.bindings?.onChange;
      assert(handler, `${node.component} has no declared change action`);
      const calls = await page.evaluate(name => (window as any).__OODS_ACTION_ARGS__[name], handler);
      assert.deepEqual(calls, [[expected]], `${node.component} must emit one correctly typed renderer fragment through the generated action`);
      recipeChanges[node.component] = { field: field.key, before, after: next, calls };
    }
    if (nodes.some(node => node.component === 'ColorStatePicker')) {
      const picker = page.locator('[data-oods-component="ColorStatePicker"] select');
      const previous = await picker.inputValue();
      const next = await picker.locator('option:not([disabled])').evaluateAll(options => options.map(option => (option as HTMLOptionElement).value).find(value => value !== (options[0]?.parentElement as HTMLSelectElement)?.value));
      assert(next !== undefined, 'Color state recipe needs a second declared value to prove its writer');
      await picker.selectOption(next);
      assert.equal(await picker.inputValue(), next, 'Typed color selection must survive the generated parent state update');
      recipeChanges.ColorStatePicker = { previous, selected: next };
    }
    return { seededValues: values, requiredEmptyInvalid: true, recipeChanges };
  }
  if (context === 'detail') {
    const editable = await page.locator('input:not([readonly]):not([disabled]):not([type="hidden"]):not([type="search"]),textarea:not([readonly]):not([disabled])').count();
    assert.equal(editable, 0, 'Detail fields must be read-only');
    const timelineNodes = nodes.filter(node => /Timeline/.test(node.component));
    const timelines = [];
    for (const node of timelineNodes) {
      const target = page.locator(`[id=${JSON.stringify(node.id)}]`);
      if (!await target.isVisible()) {
        for (const tab of await page.getByRole('tab').all()) { await tab.click(); if (await target.isVisible()) break; }
      }
      assert(await target.isVisible(), `Declared timeline ${node.id} was never visible`);
      timelines.push({ component: node.component, text: await target.innerText() });
    }
    return { readOnly: true, timelines, ...(timelines.length ? {} : { timelineDisposition: 'No timeline component declared by this object/detail schema' }) };
  }
  return { declaredStates: nodes.flatMap(node => node.state ? [node.state] : []), seeded: true };
}

async function runCell(output: string, object: string, context: Context, framework: Framework, head: string, runId: string, tarballs: PackedPackageRecord[], browser: Browser, layout?: 'dashboard', bundle?: BundleRuntimeConfiguration): Promise<RuntimeCell> {
  const relative = `cells/${object}/${context}/${framework}`;
  const cellRoot = path.join(output, relative);
  const row: RuntimeCell = { object, context, framework, head, runId, status: 'fail', gates: [], artifactHash: null, components: [], report: `${relative}/receipt.json` };
  let consumer: string | undefined;
  let tools: RuntimeToolset | undefined;
  let active = 'generation';
  const gate = async (name: string, action: () => Promise<unknown>) => { active = name; const detail = await action(); row.gates.push({ name, status: 'pass', detail }); return detail; };
  try {
    await fs.mkdir(cellRoot, { recursive: true });
    tools = await createRuntimeToolset(path.join(cellRoot, 'parity'), bundle);
    const { compose, generate, renderChart, certifyChart } = tools;
    const request = layout ? { object, layout } : { object, context };
    await write(path.join(cellRoot, 'composition-request.json'), request);
    const composition = await compose(request);
    await write(path.join(cellRoot, 'composition.json'), composition);
    assert.equal(composition.status, 'ok');
    const schema = composition.schema;
    const schemaBefore = JSON.stringify(schema);
    const result = await generate({ schema, framework, profile: 'build', options: { styling: 'tokens', typescript: true } });
    await write(path.join(cellRoot, 'generation.json'), result);
    assert.equal(JSON.stringify(schema), schemaBefore, 'Generation mutated the public composition');
    row.components = [...new Set(schemaNodes(schema).map(node => node.component))].sort();
    if (result.status !== 'ok' && result.errors?.length && result.errors.every(error => error.code === 'OODS-N015' && error.component)) {
      row.status = 'typed-gap'; row.gap = { code: 'OODS-N015', components: [...new Set(result.errors.map(error => error.component!))].sort(), reason: result.errors.map(error => error.message).join('; ') };
      return row;
    }
    assert.equal(result.status, 'ok', JSON.stringify(result.errors));
    assert.deepEqual(validateGeneratedArtifact(result.artifact), []);
    row.artifactHash = result.artifact.contentHash;
    row.gates.push({ name: active, status: 'pass', detail: { schemaHash: hash(schemaBefore), artifactHash: row.artifactHash } });
    const model = deriveConsumerModel(schema);
    const source = result.code;
    const files = createConsumerFiles({ framework, source, actions: result.artifact.actions, schemaName: `fresh-${object}-${context}`, model, mission: 's193-m02' });
    mountEntry(framework, files);
    consumer = await fs.mkdtemp(path.join(os.tmpdir(), 'oods-s193-cell-'));
    const fresh = await fs.stat(path.join(consumer, 'node_modules')).then(() => false, () => true);
    assert(fresh);
    for (const [name, content] of Object.entries(files)) {
      await fs.mkdir(path.dirname(path.join(consumer, name)), { recursive: true });
      await fs.writeFile(path.join(consumer, name), content);
    }
    const { manifest, localTarballs } = await prepareManifest(framework, result.artifact, tarballs, consumer);
    await write(path.join(consumer, 'package.json'), manifest);
    const userConfig = path.join(consumer, 'user.npmrc'); const globalConfig = path.join(consumer, 'global.npmrc');
    for (const file of [userConfig, globalConfig, path.join(consumer, '.npmrc')]) await fs.writeFile(file, '');
    const environment = isolatedNpmEnvironment(consumer, userConfig, globalConfig);
    const command = async (name: string, args: string[]) => {
      const result = commandResult('npm', args, consumer!, { environment, scrubNpmCredentials: true });
      const clean = JSON.parse(JSON.stringify(result).replaceAll(consumer!, '<consumer-root>').replaceAll(REPOSITORY_ROOT, '<repository-root>'));
      await write(path.join(cellRoot, `${name}.json`), clean);
      requireGreen(result, name); return { exitCode: result.exitCode, log: `${relative}/${name}.json` };
    };
    await gate('fresh-exact-tarball-install', async () => {
      const installed = await command('install', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', '--userconfig', userConfig]);
      const isolation = assertInstalledIsolation(consumer!, framework, localTarballs, files);
      return { ...installed, isolation, imports: resolveImports(consumer!, files), tarballs: localTarballs };
    });
    await gate('strict-typecheck', () => command('typecheck', ['exec', '--', framework === 'react' ? 'tsc' : 'vue-tsc', '--noEmit', '--pretty', 'false']));
    await gate('production-build', () => command('build', ['exec', '--', 'vite', 'build']));
    await withStaticServer(path.join(consumer, 'dist'), async url => {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      try {
        await gate('mount', async () => {
          await page.goto(url, { waitUntil: 'networkidle' });
          for (const screen of schema.screens) assert.equal(await page.locator(`[id=${JSON.stringify(screen.id)}]`).count(), 1, `Emitted screen ${screen.id} is missing`);
          const obligations = deriveMountObligations(schema, source, model);
          const mounts = observeMountObligations(obligations, await page.locator('#app').innerHTML());
          assert(mounts.every(mount => mount.passed), JSON.stringify(mounts.filter(mount => !mount.passed)));
          assert.deepEqual(errors, []);
          return { mounts, errors: [...errors] };
        });
        await gate('accessibility-tree', async () => {
          const text = await page.locator('#app').ariaSnapshot(); assert(text.trim());
          await fs.writeFile(path.join(cellRoot, 'accessibility-tree.txt'), text + '\n');
          return { path: `${relative}/accessibility-tree.txt`, hash: hash(text + '\n') };
        });
        await gate('screenshots', async () => {
          const images = [];
          for (const width of [390, 1440]) {
            await page.setViewportSize({ width, height: 1000 });
            const file = path.join(cellRoot, `seeded-${width}.png`);
            await page.screenshot({ path: file, fullPage: true });
            images.push({ width, path: `${relative}/seeded-${width}.png`, hash: hash(await fs.readFile(file)) });
          }
          return images;
        });
        await gate('context-states', () => contextProof(page, url, context, schema, model));
        assert.deepEqual(errors, []);
      } finally { await page.close(); }
    });
    const chartNode = schemaNodes(schema).find(node => node.chart?.source === 'record-array' || node.chart?.source === 'edge-array');
    if (context === 'detail' && (chartNode?.chart?.source === 'record-array' || chartNode?.chart?.source === 'edge-array')) {
      await gate('chart-theme-scopes', async () => {
        const chart = chartNode.chart!;
        if (chart.source !== 'record-array' && chart.source !== 'edge-array') throw new Error('Expected a declared array chart');
        const themedOutput = path.join(cellRoot, 'chart-themes');
        const cases = [];
        for (const brand of ['A', 'B'] as const) for (const theme of ['light', 'dark', 'hc'] as const) {
          const id = `${brand}-${theme}`;
          const request = { schema, framework, profile: 'build' as const, options: { styling: 'tokens' as const, typescript: true, brand, theme } };
          const generated = await generate(request);
          await write(path.join(themedOutput, `${id}-generation.json`), { request, response: generated });
          assert.equal(generated.status, 'ok', JSON.stringify(generated.errors));
          const rows = workflowSampleRecords(schema)[0]![chart.dataField] as [Record<string, unknown>, ...Record<string, unknown>[]];
          const renderRequest = { chartType: chart.chartType, ...(chart.source === 'edge-array' ? { network: edgeArrayToNetwork(rows, chart.edges) } : { rows, encodings: chart.encodings }), brand, theme,
            name: String(chartNode.props?.title ?? `${chart.chartType} chart`),
            ...(typeof chartNode.props?.description === 'string' ? { description: chartNode.props.description } : {}),
            output: { svg: true, width: 360, height: 200, includeNormalizedSpec: true } };
          const rendered = await renderChart(renderRequest);
          assert.equal(rendered.status, 'ok', JSON.stringify(rendered.errors));
          assert.equal(generated.artifact!.files.find(file => file.path.endsWith('.svg'))?.contents, rendered.svg, 'The consumer must carry the actual public SVG');
          const certification = await certifyChart({ spec: rendered.normalizedSpec!, brand, theme, ...('network' in renderRequest ? { data: { network: renderRequest.network } } : {}) });
          await write(path.join(themedOutput, `${id}-certification.json`), { renderRequest, rendered, certification });
          if (chart.source === 'edge-array') {
            // The declared ungrouped relationship operand has no categorical
            // metadata. Keep that measured limit; never invent a group to pass.
            assert.deepEqual(certification.pillars, { a11yEquivalence: 'pass', determinism: 'pass', contrast: theme === 'hc' ? 'exempt' : 'ungradeable', accuracy: 'pass' });
            assert.equal(certification.conformant, theme === 'hc');
            if (theme !== 'hc') assert.match(certification.contrastNote ?? '', /missing-semantic-metadata/);
          } else assert.equal(certification.conformant, true, JSON.stringify(certification));
          cases.push({ id, brand, theme, svgCount: 1, expectedSvg: rendered.svg, accessibleName: chartNode.props?.title,
            selector: `[data-oods-component="${chartNode.component}"] svg`, mount: async (page: Page) => {
            const themedFiles = createConsumerFiles({ framework, source: generated.code, actions: generated.artifact!.actions,
              schemaName: `fresh-${object}-${context}`, model, mission: process.env.OODS_PROOF_MISSION ?? 's195-m06' });
            mountEntry(framework, themedFiles);
            themedFiles['index.html'] = themedFiles['index.html']!.replace('data-brand="A" data-theme="dark"', `data-brand="${brand}" data-theme="${theme}"`);
            for (const [name, content] of Object.entries(themedFiles)) await fs.writeFile(path.join(consumer!, name), content);
            await command(`chart-themes/${id}-build`, ['exec', '--', 'vite', 'build']);
            await withStaticServer(path.join(consumer!, 'dist'), async url => {
              await page.goto(url, { waitUntil: 'networkidle' });
              const target = page.locator(`[data-oods-component="${chartNode.component}"] svg`);
              if (!await target.isVisible()) for (const tab of await page.getByRole('tab').all()) { await tab.click(); if (await target.isVisible()) break; }
              await target.waitFor({ state: 'visible' });
            });
          } });
        }
        const report = await runVizThemeProof({ cases, output: themedOutput, chromium, mission: process.env.OODS_PROOF_MISSION ?? 's195-m06' });
        return { cells: report.selected, failed: report.failed, skipped: report.skipped, report: `${relative}/chart-themes/report.json`, reusedSweepTarballs: true };
      });
    }
    row.status = 'pass';
  } catch (error) {
    row.gates.push({ name: active, status: 'fail', reason: error instanceof Error ? error.message : String(error) });
  } finally {
    if (bundle) releaseCellProvenance(row, { configuration: bundle, comparisons: tools?.comparisons ?? [] });
    try { await tools?.close(); }
    catch (error) {
      row.status = 'fail';
      row.gates.push({ name: 'adapter-lifecycle', status: 'fail', reason: error instanceof Error ? error.message : String(error) });
    }
    await write(path.join(cellRoot, 'receipt.json'), row);
    if (consumer) await fs.rm(consumer, { recursive: true, force: true });
  }
  return row;
}

async function submittedPackages(output: string): Promise<PackedPackageRecord[]> {
  const records = JSON.parse(await fs.readFile(path.join(output, 'submitted-packages/inventory.json'), 'utf8'));
  return records.map((record: PackedPackageRecord) => {
    const tarballPath = path.join(output, record.artifactPath);
    const read = commandResult('tar', ['-xOzf', tarballPath, 'package/package.json'], REPOSITORY_ROOT);
    requireGreen(read, 'read submitted package');
    return { ...record, tarballPath, manifest: JSON.parse(read.stdout) };
  });
}

export async function cellProcess(output: string, packages: string, object: string, context: Context | 'workflow', framework: Framework, head: string, runId: string, layout?: 'dashboard', bundle?: BundleRuntimeConfiguration): Promise<RuntimeCell> {
  const args = ['--import', 'tsx', fileURLToPath(import.meta.url), context === 'workflow' ? '--workflow' : '--cell', output, packages, object, context, framework, head, runId];
  if (layout) args.push(layout);
  const relative = `cells/${object}/${context}/${framework}`;
  const log: string[] = [];
  const exitCode = await new Promise<number>((resolve, reject) => {
    const environment = { ...process.env };
    delete environment.OODS_RUNTIME_BUNDLE_CONFIG;
    if (bundle) environment.OODS_RUNTIME_BUNDLE_CONFIG = JSON.stringify(bundle);
    const child = spawn(process.execPath, args, { cwd: REPOSITORY_ROOT, env: environment, stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.on('data', chunk => log.push(String(chunk)));
    child.stderr.on('data', chunk => log.push(String(chunk)));
    child.on('error', reject); child.on('close', code => resolve(code ?? 127));
  });
  await fs.mkdir(path.join(output, relative), { recursive: true });
  await fs.writeFile(path.join(output, relative, 'process.log'), log.join('').trimEnd() + '\n');
  assert.equal(exitCode, 0, `Cell worker crashed: ${identity({ object, context, framework })}; see ${relative}/process.log`);
  return JSON.parse(await fs.readFile(path.join(output, relative, 'receipt.json'), 'utf8'));
}

async function emitterBite(output: string, ledger: RuntimeLedger) {
  const candidate = ledger.rows.find(row => row.framework === 'react' && row.context === 'card' && row.status === 'pass');
  assert(candidate, 'Bite needs a passing React card from this sweep');
  const emitter = path.join(REPOSITORY_ROOT, 'packages/mcp-server/src/codegen/react-emitter.ts');
  const original = await fs.readFile(emitter, 'utf8');
  const needle = '    indent(screenJsx, 3),';
  assert.equal(original.split(needle).length - 1, 1);
  const mutated = original.replace(needle, "    indent('', 3),");
  let red: RuntimeCell;
  try {
    await fs.writeFile(emitter, mutated);
    red = await cellProcess(path.join(output, 'bite/red'), output, candidate.object, 'card', 'react', ledger.head, ledger.runId);
  } finally { await fs.writeFile(emitter, original); }
  assert.equal(await fs.readFile(emitter, 'utf8'), original, 'Emitter restoration must be byte-identical');
  assert.equal(red!.status, 'fail');
  assert.deepEqual(red!.gates.filter(gate => gate.status === 'fail').map(gate => gate.name), ['mount']);
  const rejected = structuredClone(ledger);
  rejected.rows[rejected.rows.findIndex(row => identity(row) === identity(candidate))] = red!;
  rejected.summary = summarize(rejected.rows);
  const issues = validateRuntimeLedger(rejected, ledger.rows.some(row => row.context === 'workflow'));
  assert(issues.includes(`${identity(candidate)} failed`));
  const rejectedPath = path.join(output, 'bite/red-runtime-cells.v1.json');
  await write(rejectedPath, rejected);
  const redSpec = commandResult('pnpm', ['--filter', '@oods/mcp-server', 'exec', 'vitest', 'run', 'test/product-reality/runtime-cells.s193.spec.ts', '-t', 'the retained current sweep'], REPOSITORY_ROOT, { environment: { OODS_RUNTIME_REPORT: rejectedPath } });
  await write(path.join(output, 'bite/red-contract-spec.json'), redSpec);
  assert.notEqual(redSpec.exitCode, 0, 'The retained-report contract spec must reject the missing screen');
  assert.match(redSpec.stdout + redSpec.stderr, new RegExp(`${candidate.object}/card/react failed`));
  const restored = await cellProcess(path.join(output, 'bite/restored'), output, candidate.object, 'card', 'react', ledger.head, ledger.runId);
  assert.equal(restored.status, 'pass', JSON.stringify(restored.gates));
  await write(path.join(output, 'emitter-bite.json'), { source: 'packages/mcp-server/src/codegen/react-emitter.ts', operation: 'Omit the emitted JSX screen while retaining the original schema', beforeHash: hash(original), mutatedHash: hash(mutated), restoredHash: hash(await fs.readFile(emitter)), red, ledgerIssues: issues, redSpecExitCode: redSpec.exitCode, restored, sourceRestoredByteIdentical: true, reusedSweepTarballs: true });
}

export async function runRuntimeCells(output: string, objects: readonly string[] = OBJECTS, contexts: readonly Context[] = CONTEXTS, workflows = false, dashboardObjects: readonly string[] = [], bundleInput?: BundleRuntimeInput) {
  await fs.mkdir(output, { recursive: true });
  const bundle = bundleInput ? await prepareBundleRuntime(REPOSITORY_ROOT, bundleInput, output) : undefined;
  if (bundle) {
    objects = RELEASE_OBJECTS;
    contexts = CONTEXTS;
    workflows = true;
    assert.equal(dashboardObjects.length, 0, 'Release scope is the declared 42 cells, without dashboard variants.');
  }
  assert.deepEqual((await listObjects({})).objects.map(object => object.name).sort(), [...OBJECTS]);
  const head = bundle?.bundleHead ?? commandResult('git', ['rev-parse', 'HEAD'], REPOSITORY_ROOT).stdout.trim();
  const ledger: RuntimeLedger = { schemaVersion: '1.0.0', head, runId: randomUUID(), historicalReceiptsUnioned: false, packCount: 1, browserImage: BROWSER_IMAGE, receiptRoot: path.relative(REPOSITORY_ROOT, output).split(path.sep).join('/'), rows: [], summary: summarize([]) };
  await packFoundationPackages(output, bundle ? { packageSourceRoot: bundle.bundleDirectory, ignoreScripts: true } : undefined);
  const browser = await launchProofBrowser();
  try {
    const page = await browser.newPage();
    const userAgent = await page.evaluate(() => navigator.userAgent);
    assert.match(userAgent, /Linux/, 'Use the pinned Linux Playwright browser');
    assert.equal(browser.version(), '141.0.7390.37', 'Pinned Chromium revision changed');
    await write(path.join(output, 'browser.json'), { image: BROWSER_IMAGE, version: browser.version(), userAgent });
    await page.close();
  } finally { await browser.close(); }
  const inputs: Array<{ object: string; context: Context | 'workflow'; framework: Framework }> = [
    ...(workflows ? objects.filter(supportsWorkflow).map(object => ({ object, context: 'workflow' as const, framework: 'react' as const })) : []),
    ...objects.flatMap(object => contexts.filter(context => contextsForObject(object).includes(context)).flatMap(context => FRAMEWORKS.map(framework => ({ object, context, framework })))),
  ];
  let cursor = 0;
  // Each worker gets an independent generator process and an independent temporary consumer.
  // Only immutable tarballs are shared; no compose ID counters or npm installs are shared.
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (cursor < inputs.length) {
      const input = inputs[cursor++]!;
      const cell = await cellProcess(output, output, input.object, input.context, input.framework, head, ledger.runId, undefined, bundle);
      ledger.rows.push(cell);
      if (input.context === 'workflow') ledger.rows.push(JSON.parse(await fs.readFile(path.join(output, `cells/${input.object}/workflow/vue/receipt.json`), 'utf8')));
      console.log(`${identity(cell)} ${cell.status}${cell.gates.find(gate => gate.status === 'fail') ? ': ' + cell.gates.find(gate => gate.status === 'fail')!.reason : ''}`);
    }
  }));
  ledger.rows.sort((a, b) => identity(a).localeCompare(identity(b)));
  ledger.summary = summarize(ledger.rows);
  if (bundle) {
    const { head: _head, ...base } = ledger;
    const release: ReleaseLedger = { ...base, bundleHead: bundle.bundleHead, archiveSha256: bundle.archiveSha256, rows: ledger.rows as ReleaseCell[] };
    await write(path.join(output, 'release-cells.v1.json'), release);
    const issues = validateReleaseLedger(release);
    await write(path.join(output, 'validation.json'), { issues });
    // Retain every failed comparison before refusing the release claim.
    const source = assertBundleSourceMatches(REPOSITORY_ROOT, bundle.bundleHead);
    await write(path.join(output, 'source-after.json'), source);
    if (!issues.length) await write(path.join(REPOSITORY_ROOT, 'packages/mcp-server/registry/release-cells.v1.json'), release);
    return release;
  }
  await write(path.join(output, 'runtime-cells.v1.json'), ledger);
  // Layout variants share this sweep's immutable packages, revision and run id.
  // Keep them separate so they cannot inflate the complete catalog health ratio.
  if (dashboardObjects.length) {
    const layoutOutput = path.join(output, 'layouts/dashboard');
    const rows: RuntimeCell[] = [];
    for (const object of dashboardObjects) for (const framework of FRAMEWORKS) {
      rows.push(await cellProcess(layoutOutput, output, object, 'detail', framework, head, ledger.runId, 'dashboard'));
    }
    const scoped = { ...ledger, rows, summary: summarize(rows), scope: { layout: 'dashboard', objects: dashboardObjects } };
    const expected = dashboardObjects.flatMap(object => FRAMEWORKS.map(framework => `${object}/detail/${framework}`));
    const issues = validateRuntimeLedger(scoped, false, expected);
    await write(path.join(layoutOutput, 'runtime-cells.v1.json'), scoped);
    await write(path.join(layoutOutput, 'validation.json'), { issues, reusedSweepTarballs: true });
    assert.deepEqual(issues, [], 'Dashboard layout cells must pass in the same package sweep');
  }
  if (validateRuntimeLedger(ledger, workflows).length === 0) {
    await emitterBite(output, ledger);
    if (workflows) await write(path.join(REPOSITORY_ROOT, 'packages/mcp-server/registry/runtime-cells.v1.json'), ledger);
  }
  await write(path.join(output, 'validation.json'), { issues: validateRuntimeLedger(ledger, workflows) });
  return ledger;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === '--workflow') {
    const [, , , output, packages, object, , , head, runId] = process.argv;
    const { runWorkflowCells } = await import('./s193-workflow-cells.js');
    await runWorkflowCells(output!, object!, head!, runId!, await submittedPackages(packages!), bundleRuntimeFromEnvironment());
  } else if (process.argv[2] === '--cell') {
    const [, , , output, packages, object, context, framework, head, runId, layout] = process.argv;
    const browser = await launchProofBrowser();
    try { await runCell(output!, object!, context as Context, framework as Framework, head!, runId!, await submittedPackages(packages!), browser, layout as 'dashboard' | undefined, bundleRuntimeFromEnvironment()); }
    finally { await browser.close(); }
  } else {
  const output = path.resolve(process.argv[2] ?? 'artifacts/product-reality/sprint-193/m02');
  const objects = process.env.OODS_RUNTIME_OBJECTS?.split(',') ?? OBJECTS;
  const contexts = (process.env.OODS_RUNTIME_CONTEXTS?.split(',') ?? CONTEXTS) as Context[];
  const workflows = process.argv.includes('--workflows');
  const dashboardObjects = process.argv.find(value => value.startsWith('--dashboard-objects='))?.split('=')[1]?.split(',') ?? [];
  const option = (name: string) => process.argv.find(value => value.startsWith(`${name}=`))?.slice(name.length + 1)
    ?? (process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : undefined);
  const bundleDirectory = option('--bundle-dir') ?? process.env.OODS_RUNTIME_BUNDLE_DIR;
  const archivePath = option('--bundle-archive') ?? process.env.OODS_RUNTIME_BUNDLE_ARCHIVE;
  assert.equal(Boolean(bundleDirectory), Boolean(archivePath), '--bundle-dir and --bundle-archive must be supplied together.');
  const bundle = bundleDirectory && archivePath ? { bundleDirectory, archivePath } : undefined;
  runRuntimeCells(output, objects, contexts, workflows, dashboardObjects, bundle).then(ledger => {
    const issues = 'bundleHead' in ledger ? validateReleaseLedger(ledger) : validateRuntimeLedger(ledger, workflows);
    if (issues.length) process.exitCode = 1;
  }).catch(error => { console.error(error); process.exitCode = 1; });
  }
}
