/**
 * The Forge design preview as an MCP App (Sprint 202 m02, the minimal resource): connects to the host,
 * shows the version the design_preview result names, and reads the compiled module through the host.
 * Everything runs under the host's default CSP: no network, inline scripts only, the SDK bundled here.
 */
import { App } from '@modelcontextprotocol/ext-apps';

declare const __OODS_PREVIEW_APP_VERSION__: string;

type Structured = {
  compositionId?: string; version?: number; parentVersion?: number | null; operation?: string; head?: string | null;
  object?: string; context?: string; brand?: string; theme?: string;
  previews?: Array<{ framework: string; generatedFor?: { brand: string; theme: string; chartScoped: boolean } }>;
  resources?: { app: string | null; modules: Record<string, string>; styles: Record<string, string> };
  measured?: { charts?: { placed: number; conformant: number; scopes?: string[] }; axe?: string[]; notMeasured?: string[] };
};

const state: { connected: boolean; hostContext: unknown; result: Structured | null; text: string | null; module: { uri: string; bytes: number; mimeType: string; registers: boolean } | null; errors: string[] } =
  { connected: false, hostContext: null, result: null, text: null, module: null, errors: [] };
(window as unknown as { __oodsPreviewApp: typeof state }).__oodsPreviewApp = state;

const root = document.getElementById('oods-preview')!;
const escape = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]!));
function render() {
  const result = state.result;
  const rows: Array<[string, string]> = [];
  if (result) {
    rows.push(['Composition', `<code>${escape(result.compositionId)}</code>`], ['Version', `${escape(result.version)}${result.parentVersion == null ? '' : ` ← v${escape(result.parentVersion)}`} · ${escape(result.operation)}`],
      ['Screen', `${escape(result.object)} ${escape(result.context)}`], ['Scope', `${escape(result.brand)} / ${escape(result.theme)}`], ['Forge head', `<code>${escape(result.head ?? 'source checkout')}</code>`],
      ['Frameworks', escape((result.previews ?? []).map(entry => `${entry.framework}${entry.generatedFor ? ` (${entry.generatedFor.brand}/${entry.generatedFor.theme})` : ''}`).join(', '))],
      ['Certified chart scopes', escape((result.measured?.charts?.scopes ?? []).join(', ') || 'none')],
      ['Resources', result.resources ? Object.entries(result.resources.modules ?? {}).map(([framework, uri]) => `${escape(framework)} <code>${escape(uri)}</code>`).join('<br>') : 'none offered']);
  }
  if (state.module) rows.push(['Module read', `<code>${escape(state.module.uri)}</code> · ${state.module.bytes} bytes · ${escape(state.module.mimeType)} · ${state.module.registers ? 'registers on __oodsModules' : 'not an iife module'}`]);
  const context = state.hostContext as { theme?: string; displayMode?: string; containerDimensions?: unknown } | null;
  root.innerHTML = `<p data-oods-preview-status="true">${state.connected ? 'Connected to the host' : 'Connecting to the host…'}${context ? ` · theme ${escape(context.theme)} · ${escape(context.displayMode)} · ${escape(JSON.stringify(context.containerDimensions ?? null))}` : ''}</p>`
    + (rows.length ? `<dl>${rows.map(([term, value]) => `<dt>${escape(term)}</dt><dd>${value}</dd>`).join('')}</dl>` : '<p>Waiting for a design_preview result…</p>')
    + (state.errors.length ? `<p data-oods-preview-errors="true">${state.errors.map(escape).join('<br>')}</p>` : '');
}

const app = new App({ name: 'oods-forge-preview', version: __OODS_PREVIEW_APP_VERSION__ }, { availableDisplayModes: ['inline', 'fullscreen'] });
app.onhostcontextchanged = context => { state.hostContext = { ...(state.hostContext as object ?? {}), ...context }; render(); };
app.ontoolresult = async result => {
  const text = result.content?.find(block => block.type === 'text') as { text?: string } | undefined;
  state.text = text?.text ?? null;
  state.result = (result.structuredContent as Structured | undefined) ?? (state.text ? JSON.parse(state.text) as Structured : null);
  render();
  const uri = state.result?.resources?.modules?.react ?? state.result?.resources?.modules?.vue;
  if (!uri) return;
  try {
    const read = await app.readServerResource({ uri });
    const content = read.contents[0] as { text?: string; mimeType?: string } | undefined;
    const module = content?.text ?? '';
    state.module = { uri, bytes: module.length, mimeType: content?.mimeType ?? '', registers: /^var __oodsModules\b/.test(module) };
  } catch (error) { state.errors.push(`resources/read failed: ${error instanceof Error ? error.message : String(error)}`); }
  render();
};
render();
app.connect().then(() => { state.connected = true; state.hostContext = app.getHostContext() ?? null; render(); }, error => { state.errors.push(`connect failed: ${error instanceof Error ? error.message : String(error)}`); render(); });
