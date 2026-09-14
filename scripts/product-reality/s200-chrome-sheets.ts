/**
 * s200-m02 chrome pass — fixed-input before/after sheets.
 *
 * `prepare` composes the fixed inputs once. `before` and `after` are isolated
 * workers: each generates the same compositions with the generator and built
 * packages present at that moment, builds every app with Vite from the built
 * `@oods/*` dist files, and screenshots it at three widths in a local Chromium.
 * The component sheet renders one specimen page per framework and theme with a
 * keyboard-focused button and field. No package file or live server is modified.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '../..');
const out = path.join(root, 'artifacts/product-reality/sprint-200/m02/sheets');
const require = createRequire(import.meta.url);
const sha = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
const save = async (file: string, value: unknown) => {
  const target = path.join(out, file); await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n');
};
const read = async (file: string) => JSON.parse(await fs.readFile(path.join(out, file), 'utf8'));
const side = process.argv[2];
assert(['prepare', 'before', 'after'].includes(side ?? ''), 'Use prepare, before or after');
const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();

export const SHEET_OBJECTS = ['Subscription', 'Organization', 'Relationship'] as const;
export const SHEET_CONTEXTS = ['list', 'detail', 'form', 'timeline'] as const;
export const SHEET_THEMES = ['light', 'dark'] as const;
export const SHEET_WIDTHS = [390, 820, 1440] as const;
export const SHEET_FRAMEWORKS = ['react', 'vue'] as const;
const BRAND = 'A';
const CLOCK = '2026-09-14T12:00:00Z';
/** The chrome the pass moves lives in these built files; both sides record their bytes. */
const SOURCE_FILES = [
  'packages/tokens/dist/css/tokens.css',
  'packages/component-styles/dist/components.css',
  'packages/component-styles/dist/components-ported.css',
  'packages/components-react/dist/index.js',
  'packages/components-vue/dist/index.js',
  'packages/mcp-server/src/codegen/chart-assets.ts',
  'packages/mcp-server/src/codegen/workflow-emitter.ts',
];

if (side === 'prepare') {
  const { handle: compose } = await import('../../packages/mcp-server/src/tools/design.compose.js');
  const { deriveConsumerModel } = await import('./s185-m04-consumer-contract.js');
  const inputs = [];
  for (const object of SHEET_OBJECTS) for (const context of SHEET_CONTEXTS) for (const theme of SHEET_THEMES) {
    const request = { object, context, preferences: { theme } };
    const result = await compose(request);
    assert.equal(result.status, 'ok', JSON.stringify(result.errors));
    const input = { id: `${object}-${context}-${theme}`, object, context, theme, request, schema: result.schema, seed: deriveConsumerModel(result.schema) };
    const file = `inputs/${input.id}.json`; await save(file, input);
    inputs.push({ file, sha256: sha(await fs.readFile(path.join(out, file))), schemaSha256: sha(JSON.stringify(input.schema)), seedSha256: sha(JSON.stringify(input.seed)) });
  }
  await save('inputs.json', { head, clock: CLOCK, brand: BRAND, widths: SHEET_WIDTHS, frameworks: SHEET_FRAMEWORKS, inputs, builderSelfCertified: false });
  console.log(JSON.stringify({ compositions: inputs.length }));
} else {
  const { handle: generate } = await import('../../packages/mcp-server/src/tools/code.generate.js');
  const { createConsumerFiles, withStaticServer } = await import('./s184-m06-live-consumers.js');
  const requireReact = createRequire(path.join(root, 'packages/components-react/package.json'));
  const requireVue = createRequire(path.join(root, 'packages/components-vue/package.json'));
  // Vite is a devDependency of the component packages, not of the root; resolve it from there and type only what this script calls.
  const vite = await import(pathToFileURL(requireVue.resolve('vite')).href) as { build: (config: Record<string, unknown>) => Promise<unknown> };
  const vuePlugin = ((await import(pathToFileURL(requireVue.resolve('@vitejs/plugin-vue')).href)) as { default: () => unknown }).default;
  const { chromium } = require('playwright') as typeof import('playwright');
  const packageDir = (resolver: NodeRequire, name: string) => path.dirname(resolver.resolve(`${name}/package.json`));
  const alias = [
    { find: '@oods/component-styles/css', replacement: path.join(root, 'packages/component-styles/dist/components.css') },
    { find: '@oods/tokens/css', replacement: path.join(root, 'packages/tokens/dist/css/tokens.css') },
    { find: /^@oods\/components-react$/, replacement: path.join(root, 'packages/components-react/dist/index.js') },
    { find: /^@oods\/components-vue$/, replacement: path.join(root, 'packages/components-vue/dist/index.js') },
    { find: /^@oods\/component-contracts$/, replacement: path.join(root, 'packages/component-contracts/dist/index.js') },
    { find: /^react$/, replacement: packageDir(requireReact, 'react') },
    { find: /^react\/(.*)$/, replacement: `${packageDir(requireReact, 'react')}/$1` },
    { find: /^react-dom$/, replacement: packageDir(requireReact, 'react-dom') },
    { find: /^react-dom\/(.*)$/, replacement: `${packageDir(requireReact, 'react-dom')}/$1` },
    { find: /^vue$/, replacement: packageDir(requireVue, 'vue') },
  ];
  const buildApp = async (directory: string, framework: 'react' | 'vue') => {
    await vite.build({
      root: directory, configFile: false, envFile: false, logLevel: 'error',
      plugins: framework === 'vue' ? [vuePlugin() as never] : [],
      esbuild: { jsx: 'automatic', jsxImportSource: 'react' },
      resolve: { alias, dedupe: framework === 'vue' ? ['vue'] : ['react', 'react-dom'] },
      build: { outDir: 'dist', emptyOutDir: true, minify: false, sourcemap: false, target: 'es2022', rollupOptions: { input: path.join(directory, 'index.html') } },
    });
    return path.join(directory, 'dist');
  };
  const writeFiles = async (directory: string, files: Record<string, string>) => {
    for (const [file, contents] of Object.entries(files)) {
      await fs.mkdir(path.dirname(path.join(directory, file)), { recursive: true });
      await fs.writeFile(path.join(directory, file), contents);
    }
  };
  const manifest = await read('inputs.json');
  const sources = { head, files: Object.fromEntries(await Promise.all(SOURCE_FILES.map(async file => [file, sha(await fs.readFile(path.join(root, file)))]))) };
  // Vite resolves its root through realpath; macOS mounts os.tmpdir() behind a symlink.
  const temp = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'oods-s200-sheets-')));
  const browser = await chromium.launch({ headless: true });
  const rows: Array<Record<string, unknown>> = [];
  const observe = () => ({ brand: document.documentElement.dataset.brand, theme: document.documentElement.dataset.theme,
    background: getComputedStyle(document.body).backgroundColor, foreground: getComputedStyle(document.body).color,
    text: document.body.innerText, overflow: document.documentElement.scrollWidth > innerWidth,
    components: document.querySelectorAll('[data-oods-component]').length });
  const shoot = async (file: string, page: import('playwright').Page, clip?: import('playwright').Locator) => {
    await fs.mkdir(path.dirname(path.join(out, file)), { recursive: true });
    if (clip) await clip.screenshot({ path: path.join(out, file), animations: 'disabled' });
    else await page.screenshot({ path: path.join(out, file), fullPage: true, animations: 'disabled' });
    return sha(await fs.readFile(path.join(out, file)));
  };
  try {
    for (const ref of manifest.inputs) {
      const bytes = await fs.readFile(path.join(out, ref.file)); assert.equal(sha(bytes), ref.sha256);
      const input = JSON.parse(bytes.toString());
      for (const framework of SHEET_FRAMEWORKS) {
        const id = `${input.id}-${framework}`, directory = path.join(temp, id);
        const result = await generate({ schema: input.schema, framework, profile: 'build', options: { styling: 'tokens', typescript: true, theme: input.theme, brand: BRAND } });
        assert.equal(result.status, 'ok', JSON.stringify(result.errors)); assert(result.artifact);
        const files = createConsumerFiles({ framework, source: result.code, actions: result.artifact.actions ?? [], schemaName: `fresh-${id}` as never, model: input.seed, mission: 's200-m02' });
        for (const file of result.artifact.files) if (!(file.path in files)) files[file.path] = file.contents;
        if (framework === 'react') {
          files['src/main.tsx'] = files['src/main.tsx']!.replace("import { hydrateRoot }", "import { createRoot }").replace('hydrateRoot(root, React.createElement', 'createRoot(root).render(React.createElement');
        } else files['src/main.ts'] = files['src/main.ts']!.replaceAll('createSSRApp', 'createApp');
        files['index.html'] = files['index.html']!.replace('data-brand="A" data-theme="dark"', `data-brand="${BRAND}" data-theme="${input.theme}"`);
        await writeFiles(directory, files);
        const dist = await buildApp(directory, framework);
        await withStaticServer(dist, async url => {
          for (const width of SHEET_WIDTHS) {
            const page = await browser.newPage({ viewport: { width, height: 1080 }, locale: 'en-US', timezoneId: 'UTC', colorScheme: input.theme, reducedMotion: 'reduce' });
            const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
            await page.clock.install({ time: new Date(manifest.clock) }); await page.goto(url);
            await page.waitForSelector('[data-oods-component]');
            await page.evaluate(() => document.fonts.ready);
            const observed = await page.evaluate(observe);
            assert.equal(observed.brand, BRAND); assert.equal(observed.theme, input.theme); assert.deepEqual(errors, []); assert(observed.components > 0);
            const file = `screens/${id}-${width}-${side}.png`;
            const digest = await shoot(file, page);
            rows.push({ id: `${id}-${width}`, kind: 'screen', object: input.object, context: input.context, theme: input.theme, framework, width, side, input: ref, file, sha256: digest,
              observed: { ...observed, text: undefined, textSha256: sha(observed.text) }, errors,
              generatedFiles: result.artifact!.files.map(file => ({ path: file.path, sha256: sha(file.contents) })) });
            await page.close();
          }
        });
        await fs.rm(directory, { recursive: true, force: true });
        console.log(JSON.stringify({ side, composition: id, screenshots: SHEET_WIDTHS.length }));
      }
    }
    // One component sheet per framework and theme: intents, sizes, fields, cards, tabs, badges, pagination, focus.
    for (const framework of SHEET_FRAMEWORKS) for (const theme of SHEET_THEMES) {
      const id = `components-${framework}-${theme}`, directory = path.join(temp, id);
      await writeFiles(directory, specimenFiles(framework, theme));
      const dist = await buildApp(directory, framework);
      await withStaticServer(dist, async url => {
        for (const width of [1440, 390] as const) {
          const page = await browser.newPage({ viewport: { width, height: 1080 }, locale: 'en-US', timezoneId: 'UTC', colorScheme: theme, reducedMotion: 'reduce' });
          const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
          await page.clock.install({ time: new Date(manifest.clock) }); await page.goto(url);
          await page.waitForSelector('[data-sheet="components"]'); await page.evaluate(() => document.fonts.ready);
          const observed = await page.evaluate(observe);
          assert.equal(observed.theme, theme); assert.deepEqual(errors, []); assert(observed.components > 0);
          const file = `components/${id}-${width}-${side}.png`;
          rows.push({ id: `${id}-${width}`, kind: 'components', theme, framework, width, side, file, sha256: await shoot(file, page),
            observed: { ...observed, text: undefined, textSha256: sha(observed.text) }, errors });
          if (width === 1440) {
            // Keyboard focus, so :focus-visible paints exactly what a keyboard user sees.
            await page.keyboard.press('Tab');
            const focusProbe = () => { const element = document.activeElement as HTMLElement; const style = getComputedStyle(element);
              return { target: `${element.tagName.toLowerCase()}${element.id ? '#' + element.id : ''}`, component: element.closest('[data-oods-component]')?.getAttribute('data-oods-component') ?? null,
                outline: style.outline, outlineOffset: style.outlineOffset, boxShadow: style.boxShadow, borderRadius: style.borderRadius, fontSize: style.fontSize, lineHeight: style.lineHeight, minHeight: style.minHeight, padding: style.padding }; };
            const buttonFocus = await page.evaluate(focusProbe);
            assert.equal(buttonFocus.component, 'Button', `Expected the first Tab stop to be a Button, saw ${buttonFocus.target}`);
            const buttonFile = `components/${id}-focus-button-${side}.png`;
            rows.push({ id: `${id}-focus-button`, kind: 'focus', theme, framework, width, side, file: buttonFile, sha256: await shoot(buttonFile, page, page.locator('[data-sheet-section="buttons"]')), observed: buttonFocus, errors });
            await page.locator('#sheet-name').focus();
            const fieldFocus = await page.evaluate(focusProbe);
            assert.equal(fieldFocus.target, 'input#sheet-name');
            const fieldFile = `components/${id}-focus-field-${side}.png`;
            rows.push({ id: `${id}-focus-field`, kind: 'focus', theme, framework, width, side, file: fieldFile, sha256: await shoot(fieldFile, page, page.locator('[data-sheet-section="fields"]')), observed: fieldFocus, errors });
            // Anonymous callbacks only: tsx keeps function names with a helper the browser does not have.
            const probes: Array<[string, string, string[]]> = [
              ['card', '[data-oods-component="Card"]', ['border-radius', 'box-shadow', 'padding']], ['elevatedCard', '[data-oods-component="Card"][data-elevated="true"]', ['box-shadow']],
              ['buttonMd', '[data-oods-component="Button"][data-size="md"]', ['min-height', 'padding', 'border-radius', 'font-size', 'line-height', 'background-color', 'color']],
              ['buttonSuccess', '[data-oods-component="Button"][data-intent="success"]', ['background-color', 'color']],
              ['textLg', '[data-oods-component="Text"][data-size="lg"]', ['font-size', 'line-height', 'font-weight']],
              ['input', '#sheet-name', ['border-radius', 'padding', 'font-size']], ['tab', '.oods-tab', ['padding', 'font-size', 'border-bottom-width']],
              ['badge', '[data-oods-component="Badge"]', ['border-radius', 'padding', 'font-size']], ['pagination', '[data-oods-component="PaginationBar"] button', ['min-width', 'min-height', 'border-radius']],
            ];
            const chrome = await page.evaluate(entries => Object.fromEntries(entries.map(([key, selector, properties]) => {
              const element = document.querySelector(selector) as HTMLElement | null;
              if (!element) return [key, null];
              const style = getComputedStyle(element);
              return [key, Object.fromEntries(properties.map(property => [property, style.getPropertyValue(property)]))];
            })), probes);
            rows.push({ id: `${id}-computed`, kind: 'computed', theme, framework, width, side, observed: chrome, errors });
          }
          await page.close();
        }
      });
      await fs.rm(directory, { recursive: true, force: true });
      console.log(JSON.stringify({ side, sheet: id }));
    }
    await save(`${side}.json`, { head, side, clock: manifest.clock, sources, rows, builderSelfCertified: false });
  } finally { await browser.close(); await fs.rm(temp, { recursive: true, force: true }); }
}

/** The same specimen in both frameworks; both compile against the built dist packages. */
function specimenFiles(framework: 'react' | 'vue', theme: 'light' | 'dark'): Record<string, string> {
  const css = `:root { font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
body { margin: 0; color: var(--sys-text-primary); background: var(--sys-surface-canvas); }
#app { max-width: 72rem; margin: 0 auto; padding: var(--ref-space-scale-lg); }
[data-sheet-section] { margin-block: 24px; }
.sheet-row { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-block: 8px; }
.sheet-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); gap: 16px; align-items: start; }
`;
  const html = (entry: string) => `<!doctype html><html data-brand="A" data-theme="${theme}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>s200-m02 component sheet</title></head><body><div id="app"></div><script type="module" src="/src/${entry}"></script></body></html>\n`;
  const tabs = JSON.stringify([{ id: 'overview', label: 'Overview', panel: 'Summary of the account.' }, { id: 'billing', label: 'Billing', panel: 'Invoices and payments.' }, { id: 'history', label: 'History', panel: 'Timeline of changes.' }]);
  const options = JSON.stringify([{ value: 'starter', label: 'Starter' }, { value: 'team', label: 'Team' }]);
  if (framework === 'react') return {
    'index.html': html('main.tsx'), 'src/sheet.css': css,
    'src/main.tsx': `import React from 'react';
import { createRoot } from 'react-dom/client';
import { Badge, Button, Card, Checkbox, Input, PaginationBar, SearchInput, Select, Tabs, Text, Textarea } from '@oods/components-react';
import '@oods/component-styles/css';
import './sheet.css';
const INTENTS = ['neutral', 'primary', 'secondary', 'success', 'warning', 'danger'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;
const TONES = ['neutral', 'info', 'success', 'warning', 'critical', 'accent'] as const;
function Sheet() {
  return <main data-sheet="components">
    <section data-sheet-section="buttons"><h2>Buttons</h2>{SIZES.map(size => <div className="sheet-row" key={size}>{INTENTS.map(intent => <Button key={intent} intent={intent} size={size} content={intent + ' ' + size} />)}<Button size={size} disabled content="disabled" /></div>)}</section>
    <section data-sheet-section="fields"><h2>Fields</h2><div className="sheet-grid"><Input id="sheet-name" label="Name" defaultValue="Acme Corporation" help="Shown on invoices" /><Select id="sheet-plan" label="Plan" options={${options}} defaultValue="team" /><Textarea id="sheet-notes" label="Notes" defaultValue="Renewal moved to March." /><Checkbox id="sheet-auto" label="Auto renew" defaultChecked /></div></section>
    <section data-sheet-section="search"><h2>Search and pagination</h2><div className="sheet-grid"><SearchInput label="Search subscriptions" clearable /><PaginationBar page={2} pageSize={5} totalItems={23} /></div></section>
    <section data-sheet-section="cards"><h2>Cards and text</h2><div className="sheet-grid"><Card><Text as="h3" size="lg" weight="semibold" content="Plain card" /><Text as="p" size="md" content="Body text at the medium scale." /><Text as="p" size="sm" content="Small supporting text." /></Card><Card elevated><Text as="h3" size="lg" weight="semibold" content="Elevated card" /><Text as="p" size="md" weight="medium" content="Medium weight body text." /></Card></div></section>
    <section data-sheet-section="tabs"><h2>Tabs</h2><Tabs ariaLabel="Sections" items={${tabs}} /></section>
    <section data-sheet-section="badges"><h2>Badges</h2><div className="sheet-row">{TONES.map(tone => <Badge key={tone} tone={tone} content={tone} />)}</div><div className="sheet-row">{TONES.map(tone => <Badge key={tone} tone={tone} emphasis="solid" content={tone} />)}</div></section>
  </main>;
}
createRoot(document.getElementById('app')!).render(<Sheet />);
`,
  };
  return {
    'index.html': html('main.ts'), 'src/sheet.css': css,
    'src/main.ts': `import { createApp, h } from 'vue';
import { Badge, Button, Card, Checkbox, Input, PaginationBar, SearchInput, Select, Tabs, Text, Textarea } from '@oods/components-vue';
import '@oods/component-styles/css';
import './sheet.css';
const INTENTS = ['neutral', 'primary', 'secondary', 'success', 'warning', 'danger'];
const SIZES = ['sm', 'md', 'lg'];
const TONES = ['neutral', 'info', 'success', 'warning', 'critical', 'accent'];
const Sheet = { render: () => h('main', { 'data-sheet': 'components' }, [
  h('section', { 'data-sheet-section': 'buttons' }, [h('h2', 'Buttons'), ...SIZES.map(size => h('div', { class: 'sheet-row' }, [...INTENTS.map(intent => h(Button, { intent, size, content: intent + ' ' + size })), h(Button, { size, disabled: true, content: 'disabled' })]))]),
  h('section', { 'data-sheet-section': 'fields' }, [h('h2', 'Fields'), h('div', { class: 'sheet-grid' }, [h(Input, { id: 'sheet-name', label: 'Name', defaultValue: 'Acme Corporation', help: 'Shown on invoices' }), h(Select, { id: 'sheet-plan', label: 'Plan', options: ${options}, defaultValue: 'team' }), h(Textarea, { id: 'sheet-notes', label: 'Notes', defaultValue: 'Renewal moved to March.' }), h(Checkbox, { id: 'sheet-auto', label: 'Auto renew', defaultChecked: true })])]),
  h('section', { 'data-sheet-section': 'search' }, [h('h2', 'Search and pagination'), h('div', { class: 'sheet-grid' }, [h(SearchInput, { label: 'Search subscriptions', clearable: true }), h(PaginationBar, { page: 2, pageSize: 5, totalItems: 23 })])]),
  h('section', { 'data-sheet-section': 'cards' }, [h('h2', 'Cards and text'), h('div', { class: 'sheet-grid' }, [h(Card, null, () => [h(Text, { as: 'h3', size: 'lg', weight: 'semibold', content: 'Plain card' }), h(Text, { as: 'p', size: 'md', content: 'Body text at the medium scale.' }), h(Text, { as: 'p', size: 'sm', content: 'Small supporting text.' })]), h(Card, { elevated: true }, () => [h(Text, { as: 'h3', size: 'lg', weight: 'semibold', content: 'Elevated card' }), h(Text, { as: 'p', size: 'md', weight: 'medium', content: 'Medium weight body text.' })])])]),
  h('section', { 'data-sheet-section': 'tabs' }, [h('h2', 'Tabs'), h(Tabs, { ariaLabel: 'Sections', items: ${tabs} })]),
  h('section', { 'data-sheet-section': 'badges' }, [h('h2', 'Badges'), h('div', { class: 'sheet-row' }, TONES.map(tone => h(Badge, { tone, content: tone }))), h('div', { class: 'sheet-row' }, TONES.map(tone => h(Badge, { tone, emphasis: 'solid', content: tone })))]),
]) };
createApp(Sheet).mount('#app');
`,
  };
}
