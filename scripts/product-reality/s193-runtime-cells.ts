import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Browser, Page } from 'playwright';
import { handle as compose } from '../../packages/mcp-server/src/tools/design.compose.js';
import { handle as generate } from '../../packages/mcp-server/src/tools/code.generate.js';
import { handle as listObjects } from '../../packages/mcp-server/src/tools/object.list.js';
import { validateGeneratedArtifact } from '../../packages/mcp-server/src/codegen/artifact-envelope.js';
import type { UiSchema } from '../../packages/mcp-server/src/schemas/generated.js';
import { packFoundationPackages } from './s182-m04-consumer-harness.mjs';
import { deriveConsumerModel, deriveMountObligations, observeMountObligations, schemaNodes } from './s185-m04-consumer-contract.js';
import {
  REPOSITORY_ROOT, createConsumerFiles, prepareManifest, isolatedNpmEnvironment,
  commandResult, requireGreen, assertInstalledIsolation, resolveImports, withStaticServer,
  launchProofBrowser, type PackedPackageRecord,
} from './s184-m06-live-consumers.js';

import { OBJECTS, CONTEXTS, FRAMEWORKS, BROWSER_IMAGE, summarize, validateRuntimeLedger, type RuntimeCell, type RuntimeLedger, type Context, type Framework, type Gate } from '../../packages/mcp-server/src/lib/runtime-ledger.js';
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
    return { seededValues: values, requiredEmptyInvalid: true };
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

async function runCell(output: string, object: string, context: Context, framework: Framework, head: string, runId: string, tarballs: PackedPackageRecord[], browser: Browser): Promise<RuntimeCell> {
  const relative = `cells/${object}/${context}/${framework}`;
  const cellRoot = path.join(output, relative);
  const row: RuntimeCell = { object, context, framework, head, runId, status: 'fail', gates: [], artifactHash: null, components: [], report: `${relative}/receipt.json` };
  let consumer: string | undefined;
  let active = 'generation';
  const gate = async (name: string, action: () => Promise<unknown>) => { active = name; const detail = await action(); row.gates.push({ name, status: 'pass', detail }); return detail; };
  try {
    await fs.mkdir(cellRoot, { recursive: true });
    const composition = await compose({ object, context });
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
    row.status = 'pass';
  } catch (error) {
    row.gates.push({ name: active, status: 'fail', reason: error instanceof Error ? error.message : String(error) });
  } finally {
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

export async function cellProcess(output: string, packages: string, object: string, context: Context | 'workflow', framework: Framework, head: string, runId: string): Promise<RuntimeCell> {
  const args = ['--import', 'tsx', fileURLToPath(import.meta.url), context === 'workflow' ? '--workflow' : '--cell', output, packages, object, context, framework, head, runId];
  const relative = `cells/${object}/${context}/${framework}`;
  const log: string[] = [];
  const exitCode = await new Promise<number>((resolve, reject) => {
    const child = spawn(process.execPath, args, { cwd: REPOSITORY_ROOT, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });
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

export async function runRuntimeCells(output: string, objects: readonly string[] = OBJECTS, contexts: readonly Context[] = CONTEXTS, workflows = false) {
  await fs.mkdir(output, { recursive: true });
  assert.deepEqual((await listObjects({})).objects.map(object => object.name).sort(), [...OBJECTS]);
  const head = commandResult('git', ['rev-parse', 'HEAD'], REPOSITORY_ROOT).stdout.trim();
  const ledger: RuntimeLedger = { schemaVersion: '1.0.0', head, runId: randomUUID(), historicalReceiptsUnioned: false, packCount: 1, browserImage: BROWSER_IMAGE, rows: [], summary: summarize([]) };
  await packFoundationPackages(output);
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
    ...(workflows ? objects.map(object => ({ object, context: 'workflow' as const, framework: 'react' as const })) : []),
    ...objects.flatMap(object => contexts.flatMap(context => FRAMEWORKS.map(framework => ({ object, context, framework })))),
  ];
  let cursor = 0;
  // Each worker gets an independent generator process and an independent temporary consumer.
  // Only immutable tarballs are shared; no compose ID counters or npm installs are shared.
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (cursor < inputs.length) {
      const input = inputs[cursor++]!;
      const cell = await cellProcess(output, output, input.object, input.context, input.framework, head, ledger.runId);
      ledger.rows.push(cell);
      if (input.context === 'workflow') ledger.rows.push(JSON.parse(await fs.readFile(path.join(output, `cells/${input.object}/workflow/vue/receipt.json`), 'utf8')));
      console.log(`${identity(cell)} ${cell.status}${cell.gates.find(gate => gate.status === 'fail') ? ': ' + cell.gates.find(gate => gate.status === 'fail')!.reason : ''}`);
    }
  }));
  ledger.rows.sort((a, b) => identity(a).localeCompare(identity(b)));
  ledger.summary = summarize(ledger.rows);
  await write(path.join(output, 'runtime-cells.v1.json'), ledger);
  if (validateRuntimeLedger(ledger, workflows).length === 0) await emitterBite(output, ledger);
  await write(path.join(output, 'validation.json'), { issues: validateRuntimeLedger(ledger, workflows) });
  return ledger;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === '--workflow') {
    const [, , , output, packages, object, , , head, runId] = process.argv;
    const { runWorkflowCells } = await import('./s193-workflow-cells.js');
    await runWorkflowCells(output!, object!, head!, runId!, await submittedPackages(packages!));
  } else if (process.argv[2] === '--cell') {
    const [, , , output, packages, object, context, framework, head, runId] = process.argv;
    const browser = await launchProofBrowser();
    try { await runCell(output!, object!, context as Context, framework as Framework, head!, runId!, await submittedPackages(packages!), browser); }
    finally { await browser.close(); }
  } else {
  const output = path.resolve(process.argv[2] ?? 'artifacts/product-reality/sprint-193/m02');
  const objects = process.env.OODS_RUNTIME_OBJECTS?.split(',') ?? OBJECTS;
  const contexts = (process.env.OODS_RUNTIME_CONTEXTS?.split(',') ?? CONTEXTS) as Context[];
  const workflows = process.argv.includes('--workflows');
  runRuntimeCells(output, objects, contexts, workflows).then(ledger => { if (validateRuntimeLedger(ledger, workflows).length) process.exitCode = 1; }).catch(error => { console.error(error); process.exitCode = 1; });
  }
}
