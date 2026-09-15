/**
 * The Forge design preview as an MCP App (Sprint 202 m03): the generated React or Vue app actually running inside the
 * host's sandbox, with the Sprint 201 page's lineage, versions and measurements beside it. The bridge build inlines the
 * runtime (React, ReactDOM, Vue, the foundation packages and their CSS) in this document; the version record, the
 * lineage list and the compiled module for the mounted framework, brand and theme come through the host
 * (resources/read), and the module runs as an inline script, so everything works under the host's default CSP with no
 * network. Framework, brand, theme and version switches re-mount in place; when the placed chart was rendered for
 * another scope, design_preview renders and certifies it for the mounted one first (tools/call through the host).
 */
import { App, applyHostStyleVariables, type McpUiHostContext } from '@modelcontextprotocol/ext-apps';
import { renderMeasurementPanel } from '../src/preview/measurements.js';
import { MODULES_GLOBAL, RUNTIME_GLOBAL, moduleKey } from '../src/preview/module-globals.js';
import { escapeHtml } from '../src/preview/page.js';
import { hasPlacedChart, scopeKey, servedArtifact } from '../src/preview/scope.js';
import { FIXED_WIDTHS, renderLineage, renderVersionList } from '../src/preview/shell.js';
import type { CompositionVersion, PreviewArtifact, PreviewBrand, PreviewFramework, PreviewTheme, VersionSummary } from '../src/preview/store.js';

declare const __OODS_PREVIEW_APP_VERSION__: string;

type Json = Record<string, unknown>;
type Scope = { compositionId: string; version: number; framework: PreviewFramework; brand: PreviewBrand; theme: PreviewTheme };
type GeneratedFor = { brand: PreviewBrand; theme: PreviewTheme; chartScoped: boolean };
type ToolResult = { isError?: boolean; content?: Array<{ type: string; text?: string }>; structuredContent?: Json };
/** design_preview's result as the adapter returns it in structuredContent, with the resources it offers this app. */
type PreviewResult = {
  status?: string; action?: string; compositionId?: string; version?: number; latest?: number;
  brand?: PreviewBrand; theme?: PreviewTheme;
  previews?: Array<{ framework: PreviewFramework; appUrl: string; artifactContentHash: string; generatedFor: GeneratedFor }>;
  left?: { compositionId: string; version: number };
  resources?: { app: string | null; record: string; versions: string; modules: Partial<Record<PreviewFramework, string>>; styles: Partial<Record<PreviewFramework, string>> };
};

const TOOL = 'design_preview';
/** The adapter's readable composition resources (packages/mcp-adapter/mcp-apps.js). */
const COMPOSITIONS = 'ui://oods-forge/compositions/';
const FRAMEWORKS: readonly PreviewFramework[] = ['react', 'vue'];
const BRANDS: readonly PreviewBrand[] = ['A', 'B'];
const THEMES: readonly PreviewTheme[] = ['light', 'dark', 'hc'];
const WIDTHS: readonly (string | number)[] = ['fit', ...FIXED_WIDTHS];
/** design_preview takes ten calls a minute, one at a time (the server's policy): a switch that meets either limit waits and asks again. */
const RETRY_DELAYS_MS = [7_000, 15_000, 30_000];
const LIMITED = new Set(['OODS-R001', 'OODS-R002']);

interface PreviewAppState {
  app: string;
  connected: boolean;
  hostContext: McpUiHostContext | null;
  toolInput: Json | null;
  result: PreviewResult | null;
  record: CompositionVersion | null;
  versions: VersionSummary[] | null;
  /** The scope the latest switch asked for; the mounted scope below follows it once it has mounted. */
  requested: Scope | null;
  framework: PreviewFramework | null;
  brand: PreviewBrand | null;
  theme: PreviewTheme | null;
  /** Where the theme came from: the call named one, the host's theme, the version's own, or a switch in this view. */
  themeSource: 'call' | 'host' | 'version' | 'switch' | null;
  /** The scope the mounted module was generated for; it differs from the mounted scope only when the chart could not be rendered for it. */
  generatedFor: GeneratedFor | null;
  width: 'fit' | number;
  containerWidth: number | null;
  appWidth: number;
  displayMode: string;
  displayModeRequests: Array<{ mode: string; answer: string | null }>;
  module: { uri: string; key: string; bytes: number; mimeType: string; registers: boolean; workflow: boolean } | null;
  styles: { uri: string; bytes: number } | null;
  mounted: boolean;
  mounts: number;
  components: number;
  componentNames: string[];
  pending: string | null;
  toolCalls: Array<{ arguments: Json; ok: boolean; code?: string; ms: number }>;
  reads: string[];
  actions: Array<{ name: string; at: string }>;
  errors: string[];
}

const state: PreviewAppState = {
  app: __OODS_PREVIEW_APP_VERSION__, connected: false, hostContext: null, toolInput: null, result: null, record: null, versions: null, requested: null,
  framework: null, brand: null, theme: null, themeSource: null, generatedFor: null, width: 'fit', containerWidth: null, appWidth: 0, displayMode: 'inline', displayModeRequests: [],
  module: null, styles: null, mounted: false, mounts: 0, components: 0, componentNames: [], pending: null, toolCalls: [], reads: [], actions: [], errors: [],
};
(window as unknown as { __oodsPreviewApp: PreviewAppState }).__oodsPreviewApp = state;

function element<T extends HTMLElement>(selector: string): T {
  const found = document.querySelector<T>(selector);
  if (!found) throw new Error(`preview-app/index.html lacks ${selector}`);
  return found;
}
const toolbar = element('[data-oods-toolbar]');
const statusLine = element('[data-oods-preview-status]');
const stage = element('[data-oods-stage]');
const frame = element('[data-oods-app-frame]');
const panel = element('[data-oods-panel]');
const errorBox = element('[data-oods-preview-errors]');

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
const nextFrames = (count: number) => new Promise<void>(resolve => { const step = (left: number) => { if (left <= 0) resolve(); else requestAnimationFrame(() => step(left - 1)); }; step(count); });
const messageOf = (error: unknown) => error instanceof Error ? error.message : String(error);
const isOneOf = <T extends string>(values: readonly T[], value: unknown): value is T => typeof value === 'string' && (values as readonly string[]).includes(value);
const labelOf = (record: CompositionVersion) => `${record.compose.object ?? 'composition'} ${record.compose.context ?? ''}`.trim();
const utf8Bytes = (text: string) => new TextEncoder().encode(text).length;

/** Every failure is shown in the view and kept on the state; nothing is logged to the console instead. */
function fail(context: string, error: unknown): void {
  state.errors.push(`${context}: ${messageOf(error)}`);
  errorBox.textContent = state.errors.join('\n');
  errorBox.hidden = false;
}

function renderStatus(): void {
  let text: string;
  if (state.pending) text = state.pending;
  else if (state.mounted && state.record) {
    const width = state.width === 'fit' ? `${state.appWidth}px (fit)` : `${state.width}px`;
    const chart = state.generatedFor && (state.generatedFor.brand !== state.brand || state.generatedFor.theme !== state.theme) ? ` · placed chart rendered for ${state.generatedFor.brand}/${state.generatedFor.theme}` : '';
    text = `${labelOf(state.record)} v${state.record.version} · ${state.framework} · brand ${state.brand} · ${state.theme} · ${width} · ${state.components} components${chart}`;
  } else if (!state.connected) text = 'Connecting to the host…';
  else text = state.errors.length ? 'Nothing is mounted.' : 'Waiting for a design_preview result…';
  statusLine.textContent = text;
  statusLine.dataset.state = state.pending ? 'pending' : state.mounted ? 'mounted' : 'idle';
}
function setPending(text: string | null): void { state.pending = text; renderStatus(); }

function buildControls(): void {
  if (toolbar.querySelector('[data-oods-controls]')) return;
  const group = (name: string, label: string, values: readonly (string | number)[]) => `<div class="controls" role="group" aria-label="${label}" data-oods-controls="${name}"><span class="label">${label}</span>${values.map(value => `<button type="button" data-control="${name}" data-value="${escapeHtml(String(value))}" aria-pressed="false">${escapeHtml(String(value))}</button>`).join('')}</div>`;
  toolbar.insertAdjacentHTML('beforeend', group('framework', 'Framework', FRAMEWORKS) + group('brand', 'Brand', BRANDS) + group('theme', 'Theme', THEMES) + group('width', 'Width', WIDTHS));
}
function syncControls(): void {
  const pressed: Record<string, string | undefined> = { framework: state.requested?.framework, brand: state.requested?.brand, theme: state.requested?.theme, width: String(state.width) };
  for (const button of toolbar.querySelectorAll<HTMLButtonElement>('button[data-control]')) button.setAttribute('aria-pressed', String(pressed[button.dataset.control ?? ''] === button.dataset.value));
}

/** The Sprint 201 page's lineage, versions and measurement panel; another version opens in place instead of navigating. */
const openButton = (version: number, label: string) => `<button type="button" class="link" data-open-version="${version}">${label}</button>`;
function renderPanel(): void {
  const record = state.record;
  if (!record) { panel.replaceChildren(); return; }
  const versions = state.versions ?? [];
  panel.innerHTML = [
    `<details open data-oods-lineage="true"><summary>Lineage · ${escapeHtml(labelOf(record))}</summary><dl>${renderLineage(record, versions.length, openButton)}</dl></details>`,
    `<details open><summary>Versions <span class="count">${versions.length}</span></summary><ul data-oods-versions="true">${renderVersionList(versions, record.version, openButton)}</ul></details>`,
    `<details open data-oods-measurements-panel="true"><summary>Measurements</summary>${renderMeasurementPanel(record)}<p class="note">axe-core runs in the browser preview page; this view shows the results the version has stored.</p></details>`,
  ].join('');
}

// Width: the app is as wide as the host's container unless a fixed width is chosen; a width the container cannot show asks for fullscreen.
let fullscreenForWidth = false;
let lastModeRequest: string | null = null;
function containerWidthOf(context: McpUiHostContext | null): number | null {
  const dimensions = context?.containerDimensions as { width?: number; maxWidth?: number } | undefined;
  return typeof dimensions?.width === 'number' ? dimensions.width : typeof dimensions?.maxWidth === 'number' ? dimensions.maxWidth : null;
}
function applyWidth(): void {
  frame.style.width = state.width === 'fit' ? '100%' : `${state.width}px`;
  state.appWidth = Math.round(frame.getBoundingClientRect().width);
  state.containerWidth = containerWidthOf(state.hostContext);
  const modes = (state.hostContext?.availableDisplayModes ?? []) as string[];
  if (state.width !== 'fit' && state.width > stage.clientWidth && state.displayMode !== 'fullscreen' && modes.includes('fullscreen')) void requestMode('fullscreen');
  else if (fullscreenForWidth && state.displayMode === 'fullscreen' && (state.width === 'fit' || state.width <= (state.containerWidth ?? stage.clientWidth))) void requestMode('inline');
  renderStatus();
}
async function requestMode(mode: 'inline' | 'fullscreen'): Promise<void> {
  const key = `${mode}:${state.width}`;
  if (lastModeRequest === key) return;
  lastModeRequest = key;
  const entry: { mode: string; answer: string | null } = { mode, answer: null };
  state.displayModeRequests.push(entry);
  try {
    const answer = await app.requestDisplayMode({ mode });
    entry.answer = answer.mode;
    state.displayMode = answer.mode;
    fullscreenForWidth = answer.mode === 'fullscreen';
  } catch (error) { fail(`ui/request-display-mode ${mode}`, error); }
  applyWidth();
}

// Everything the app reads comes through the host: the version record, the lineage list, the compiled module and its styles.
async function read(uri: string): Promise<{ text: string; mimeType: string }> {
  state.reads.push(uri);
  const result = await app.readServerResource({ uri });
  const content = result.contents[0] as { text?: string; mimeType?: string } | undefined;
  if (typeof content?.text !== 'string') throw new Error(`resources/read ${uri} returned no text`);
  return { text: content.text, mimeType: content.mimeType ?? '' };
}
const readJson = async <T>(uri: string): Promise<T> => JSON.parse((await read(uri)).text) as T;
/** A compiled module or stylesheet never changes for one artifact: cached by its content hash with the URI (a scope's URI serves the version's own artifact until that scope is generated). */
const artifactTexts = new Map<string, Promise<{ text: string; mimeType: string }>>();
function readArtifactText(uri: string, contentHash: string): Promise<{ text: string; mimeType: string }> {
  const key = `${contentHash} ${uri}`;
  let pending = artifactTexts.get(key);
  if (!pending) {
    pending = read(uri);
    artifactTexts.set(key, pending);
    pending.catch(() => artifactTexts.delete(key));
  }
  return pending;
}

const textOf = (result: ToolResult) => result.content?.find(block => block.type === 'text')?.text ?? '';
function errorOf(result: ToolResult): { code?: string; message: string } {
  const text = textOf(result);
  try {
    const parsed = JSON.parse(text) as { error?: { code?: string; message?: string } };
    if (parsed?.error) return { ...(parsed.error.code ? { code: parsed.error.code } : {}), message: parsed.error.message ?? text };
  } catch { /* the adapter's plain failure text */ }
  return { message: text || 'no error text' };
}
async function callPreview(args: Json, purpose: string): Promise<PreviewResult> {
  for (let attempt = 0; ; attempt += 1) {
    const started = performance.now();
    const result = await app.callServerTool({ name: TOOL, arguments: args }) as ToolResult;
    const ms = Math.round(performance.now() - started);
    if (!result.isError) {
      state.toolCalls.push({ arguments: args, ok: true, ms });
      return (result.structuredContent ?? JSON.parse(textOf(result))) as PreviewResult;
    }
    const error = errorOf(result);
    state.toolCalls.push({ arguments: args, ok: false, ...(error.code ? { code: error.code } : {}), ms });
    if (error.code !== undefined && LIMITED.has(error.code) && attempt < RETRY_DELAYS_MS.length) {
      const delay = RETRY_DELAYS_MS[attempt]!;
      setPending(`${purpose}: design_preview is at its limit (ten calls a minute, one at a time); asking again in ${delay / 1000}s…`);
      await sleep(delay);
      continue;
    }
    throw new Error(`${TOOL} refused${error.code ? ` (${error.code})` : ''}: ${error.message}`);
  }
}

// Mounting, as the Sprint 201 page does: the field model as props, every action dispatching an observable oods-design-loop-action.
type Mounted = { unmount(): void };
let mounted: Mounted | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- the runtime packages are untyped globals here
type RuntimeModule = Record<string, any>;
function runtimeModule(specifier: string): RuntimeModule {
  const module = (globalThis as unknown as Record<string, Record<string, RuntimeModule> | undefined>)[RUNTIME_GLOBAL]?.[specifier];
  if (!module) throw new Error(`the app was built without ${specifier} in its runtime (globalThis.${RUNTIME_GLOBAL})`);
  return module;
}
const registered = (key: string): Json | undefined => (globalThis as unknown as Record<string, Record<string, Json> | undefined>)[MODULES_GLOBAL]?.[key];

/** Run compiled code as an inline script, the only kind the default CSP allows; an exception it throws fails this mount. */
function runInline(code: string, label: string): void {
  const thrown: string[] = [];
  const listener = (event: ErrorEvent) => { thrown.push(event.message); event.preventDefault(); };
  window.addEventListener('error', listener);
  const script = document.createElement('script');
  script.dataset.oodsModule = label;
  script.textContent = code;
  try { document.head.appendChild(script); } finally { window.removeEventListener('error', listener); script.remove(); }
  if (thrown.length) throw new Error(`the compiled module ${label} threw: ${thrown.join('; ')}`);
}
function setArtifactStyles(css: string): void {
  let style = document.getElementById('oods-artifact-styles');
  if (!style) { style = document.createElement('style'); style.id = 'oods-artifact-styles'; document.head.appendChild(style); }
  style.textContent = css;
}
function actionsFor(artifact: PreviewArtifact): Record<string, (...args: unknown[]) => void> {
  return Object.fromEntries(artifact.actions.map(action => [action.name, (...args: unknown[]) => {
    state.actions.push({ name: action.name, at: new Date().toISOString() });
    window.dispatchEvent(new CustomEvent('oods-design-loop-action', { detail: { name: action.name, args } }));
  }]));
}
function mountComponent(container: HTMLElement, framework: PreviewFramework, exported: Json, props: Json): Mounted {
  if (framework === 'react') {
    const Page = exported.GeneratedUI ?? exported.default;
    if (typeof Page !== 'function') throw new Error('the compiled React module exports no GeneratedUI component');
    const React = runtimeModule('react');
    const root = runtimeModule('react-dom/client').createRoot(container);
    // Committed synchronously, so what is counted after the mount is the mounted tree.
    runtimeModule('react-dom').flushSync(() => root.render(React.createElement(Page, props)));
    return { unmount: () => root.unmount() };
  }
  const Page = exported.default ?? exported.GeneratedUI;
  if (!Page) throw new Error('the compiled Vue module has no default export');
  const vueApp = runtimeModule('vue').createApp(Page, props);
  vueApp.mount(container);
  return { unmount: () => vueApp.unmount() };
}

let sequence = 0;
/** Mount a scope: read the version, have design_preview generate what the scope lacks, read the compiled module and mount it in place. */
async function show(target: Scope, reason: string): Promise<void> {
  const request = ++sequence;
  const stale = () => request !== sequence;
  state.requested = target;
  syncControls();
  try {
    const versionUri = `${COMPOSITIONS}${target.compositionId}/${target.version}/`;
    setPending(`Reading ${target.compositionId} version ${target.version}…`);
    let record = await readJson<CompositionVersion>(`${versionUri}record.json`);
    if (stale()) return;
    const key = scopeKey(target.brand, target.theme);
    const lacksFramework = !record.artifacts[target.framework];
    const lacksScope = hasPlacedChart(record.schema) && key !== scopeKey(record.brand, record.theme) && !record.scopes?.[key]?.artifacts[target.framework];
    let scopeError: unknown = null;
    if (lacksFramework || lacksScope) {
      const purpose = lacksScope ? `Rendering the placed chart for ${key} (${target.framework})` : `Generating the ${target.framework} app`;
      setPending(`${purpose}…`);
      try {
        state.result = await callPreview({ compositionId: target.compositionId, version: target.version, framework: target.framework, preferences: { brand: target.brand, theme: target.theme } }, purpose);
      } catch (error) {
        // Without the framework there is nothing to mount; without the scoped chart the version's own module mounts, labelled with its scope.
        if (lacksFramework) throw error;
        scopeError = error;
      }
      if (stale()) return;
      record = await readJson<CompositionVersion>(`${versionUri}record.json`);
      if (stale()) return;
    }
    const { versions } = await readJson<{ versions: VersionSummary[] }>(`${COMPOSITIONS}${target.compositionId}/versions.json`);
    if (stale()) return;
    const served = servedArtifact(record, target.framework, target.brand, target.theme);
    if (!served) throw new Error(`version ${target.version} carries no ${target.framework} artifact`);
    const artifact = served.entry.artifact;
    const query = `?brand=${target.brand}&theme=${target.theme}`;
    const moduleUri = `${versionUri}${target.framework}.js${query}`;
    const stylesUri = `${versionUri}${target.framework}.css${query}`;
    setPending(`Reading the compiled ${target.framework} module…`);
    const [module, styles] = await Promise.all([readArtifactText(moduleUri, artifact.contentHash), readArtifactText(stylesUri, artifact.contentHash)]);
    if (stale()) return;

    // A standalone module runs once per artifact and is re-mounted from its registered exports; a workflow module mounts itself when it runs.
    const workflow = artifact.files.some(file => file.path === 'package.json');
    const name = moduleKey(artifact.contentHash);
    if (!workflow && !registered(name)) runInline(module.text, `${target.framework}:${name}`);
    const exported = registered(name);
    if (!workflow && !exported) throw new Error(`${moduleUri} did not register ${MODULES_GLOBAL}.${name}: the host served another artifact than version ${target.version} names`);
    if (mounted) { const previous = mounted; mounted = null; previous.unmount(); }
    const container = document.createElement('div');
    container.id = 'app';
    container.dataset.oodsPreview = record.compositionId;
    container.dataset.oodsPreviewVersion = String(record.version);
    container.dataset.oodsPreviewFramework = target.framework;
    frame.replaceChildren(container);
    // The scope goes on the document as on the Sprint 201 page: the runtime CSS resolves its --sys-* aliases on :root, so a
    // brand or theme set only on the frame would leave the app on the root's tokens. The frame carries it too.
    for (const node of [document.documentElement, document.body, frame]) { node.dataset.theme = target.theme; node.dataset.brand = target.brand; }
    frame.style.colorScheme = target.theme === 'dark' ? 'dark' : 'light';
    setArtifactStyles(styles.text);
    if (workflow) runInline(module.text, `${target.framework}:${name}`);
    else mounted = mountComponent(container, target.framework, exported!, { ...(record.model ?? {}), actions: actionsFor(artifact) });
    await nextFrames(2);
    if (stale()) return;

    const nodes = Array.from(document.querySelectorAll('[data-oods-component]'));
    Object.assign(state, {
      record, versions, framework: target.framework, brand: target.brand, theme: target.theme,
      generatedFor: { ...served.generatedFor, chartScoped: hasPlacedChart(record.schema) },
      module: { uri: moduleUri, key: name, bytes: utf8Bytes(module.text), mimeType: module.mimeType, registers: Boolean(registered(name)), workflow },
      styles: { uri: stylesUri, bytes: utf8Bytes(styles.text) },
      mounted: true, mounts: state.mounts + 1, components: nodes.length,
      componentNames: [...new Set(nodes.map(node => node.getAttribute('data-oods-component') ?? ''))].sort(),
      pending: null,
    });
    document.documentElement.dataset.oodsPreviewMounts = String(state.mounts);
    renderPanel();
    syncControls();
    applyWidth();
    if (scopeError) fail(`the placed chart could not be rendered for ${key} (${target.framework}); it shows ${served.generatedFor.brand}/${served.generatedFor.theme}`, scopeError);
    window.dispatchEvent(new CustomEvent('oods-preview-mounted', { detail: { compositionId: record.compositionId, version: record.version, framework: target.framework, brand: target.brand, theme: target.theme, components: nodes.length } }));
  } catch (error) {
    if (stale()) return;
    setPending(null);
    fail(reason, error);
    renderStatus();
  }
}

/** A design_preview result opens its version: the framework the call asked for, the result's brand, and the theme the call named or else the host's. */
async function open(result: PreviewResult): Promise<void> {
  const input = state.toolInput ?? {};
  const compositionId = result.compositionId ?? result.left?.compositionId;
  const version = result.version ?? result.latest ?? result.left?.version;
  if (!compositionId || !version) throw new Error(`the ${result.action ?? 'result'} names no composition version to mount`);
  const framework = isOneOf(FRAMEWORKS, input.framework) ? input.framework : result.previews?.[0]?.framework ?? 'react';
  let brand = result.brand;
  let theme = result.theme;
  if (!brand || !theme) {
    const record = await readJson<CompositionVersion>(`${COMPOSITIONS}${compositionId}/${version}/record.json`);
    brand ??= record.brand;
    theme ??= record.theme;
  }
  const named = (input.preferences as Json | undefined)?.theme;
  const hostTheme = (app.getHostContext() ?? state.hostContext)?.theme;
  if (isOneOf(THEMES, named)) state.themeSource = 'call';
  else if (hostTheme === 'light' || hostTheme === 'dark') { theme = hostTheme; state.themeSource = 'host'; }
  else state.themeSource = 'version';
  await show({ compositionId, version, framework, brand, theme }, `design_preview ${result.action ?? 'result'}`);
}

const app = new App({ name: 'oods-forge-preview', version: __OODS_PREVIEW_APP_VERSION__ }, { availableDisplayModes: ['inline', 'fullscreen'] });

function applyHostContext(context: McpUiHostContext | null): void {
  if (!context) return;
  if (context.styles?.variables) applyHostStyleVariables(context.styles.variables);
  if (context.theme) document.documentElement.dataset.hostTheme = context.theme;
  if (context.displayMode) state.displayMode = context.displayMode;
}

app.ontoolinput = params => { state.toolInput = (params.arguments ?? null) as Json | null; };
app.ontoolresult = result => {
  const toolResult = result as ToolResult;
  if (toolResult.isError) { fail(TOOL, errorOf(toolResult).message); renderStatus(); return; }
  let structured = toolResult.structuredContent as PreviewResult | undefined;
  if (!structured) { try { structured = JSON.parse(textOf(toolResult)) as PreviewResult; } catch { structured = undefined; } }
  if (!structured) { fail(TOOL, 'the result carries neither structured content nor JSON text'); renderStatus(); return; }
  state.result = structured;
  buildControls();
  open(structured).catch(error => { setPending(null); fail(`${TOOL} result`, error); renderStatus(); });
};
app.onhostcontextchanged = context => {
  const previousTheme = state.hostContext?.theme;
  state.hostContext = { ...(state.hostContext ?? {}), ...context };
  applyHostContext(state.hostContext);
  applyWidth();
  // The mounted theme follows the host's while neither the call nor a switch named one.
  const theme = context.theme;
  if ((theme === 'light' || theme === 'dark') && theme !== previousTheme && state.themeSource === 'host' && state.requested && theme !== state.requested.theme) void show({ ...state.requested, theme }, 'host theme change');
};

document.addEventListener('click', event => {
  const target = event.target instanceof Element ? event.target : null;
  const control = target?.closest<HTMLButtonElement>('button[data-control]');
  if (control) {
    const { control: name, value } = control.dataset;
    if (name === 'width') { state.width = value === 'fit' ? 'fit' : Number(value); syncControls(); applyWidth(); return; }
    const current = state.requested;
    if (!current) return;
    if (name === 'framework' && isOneOf(FRAMEWORKS, value)) void show({ ...current, framework: value }, `framework ${value}`);
    else if (name === 'brand' && isOneOf(BRANDS, value)) void show({ ...current, brand: value }, `brand ${value}`);
    else if (name === 'theme' && isOneOf(THEMES, value)) { state.themeSource = 'switch'; void show({ ...current, theme: value }, `theme ${value}`); }
    return;
  }
  const opener = target?.closest<HTMLButtonElement>('button[data-open-version]');
  if (opener && state.requested) void show({ ...state.requested, version: Number(opener.dataset.openVersion) }, `version ${opener.dataset.openVersion}`);
});
new ResizeObserver(() => { if (state.connected) applyWidth(); }).observe(stage);

renderStatus();
app.connect().then(() => {
  state.connected = true;
  state.hostContext = app.getHostContext() ?? null;
  applyHostContext(state.hostContext);
  applyWidth();
}, error => { fail('connect', error); renderStatus(); });
