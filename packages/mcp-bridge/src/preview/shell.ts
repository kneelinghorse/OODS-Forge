import { renderMeasurementPanel } from './measurements.js';
import { escapeHtml, scriptJson } from './page.js';
import type { CompositionVersion, PreviewBrand, PreviewFramework, PreviewTheme, VersionSummary } from './store.js';

export interface PreviewShellInput {
  record: CompositionVersion;
  versions: VersionSummary[];
  framework: PreviewFramework;
  brand: PreviewBrand;
  theme: PreviewTheme;
  width: number | 'free';
  base: string;
}

export const FIXED_WIDTHS = [390, 820, 1440] as const;
const short = (hash: string | null) => hash ? hash.replace(/^sha256:/, '').slice(0, 12) : 'none';

/**
 * The page a URL opens: the lineage of the version (composition, version, parent, operation, head)
 * beside framework, brand, theme and width controls, framing the running app. Brand and theme
 * re-mount the framed app in place through postMessage; framework and version navigate.
 */
export function renderPreviewShell({ record, versions, framework, brand, theme, width, base }: PreviewShellInput): string {
  const versionBase = `${base}/${record.compositionId}/${record.version}`;
  const appUrl = `${versionBase}/app?framework=${framework}&brand=${brand}&theme=${theme}`;
  const label = `${record.compose.object ?? 'composition'} ${record.compose.context ?? ''}`.trim();
  const frameworks = (Object.keys(record.artifacts) as PreviewFramework[]).filter(name => record.artifacts[name]);
  const state = { compositionId: record.compositionId, version: record.version, framework, brand, theme, width, base };
  const pixelWidth = width === 'free' ? 1024 : width;
  const row = (term: string, value: string) => `<div class="row"><dt>${escapeHtml(term)}</dt><dd>${value}</dd></div>`;
  const lineage = [
    row('Composition', `<code>${escapeHtml(record.compositionId)}</code>`),
    row('Version', `<strong>${record.version}</strong> of ${versions.length}`),
    row('Parent', record.parentVersion === null ? 'none (first version)' : `<a href="${base}/${escapeHtml(record.compositionId)}/${record.parentVersion}?framework=${framework}&brand=${brand}&theme=${theme}">version ${record.parentVersion}</a>`),
    row('Operation', `<code>${escapeHtml(record.operation)}</code>`),
    row('Forge head', `<code>${escapeHtml(record.head ?? 'source checkout')}</code>`),
    row('Schema', `<code>${escapeHtml(short(record.schemaHash))}</code>`),
    row('Created', escapeHtml(record.createdAt)),
    row('Generated for', `${escapeHtml(record.brand)} / ${escapeHtml(record.theme)}`),
  ].join('');
  const versionList = versions.map(entry => entry.version === record.version
    ? `<li aria-current="true"><strong>v${entry.version}</strong> · ${escapeHtml(entry.operation)}${entry.parentVersion === null ? '' : ` ← v${entry.parentVersion}`}</li>`
    : `<li><a href="${base}/${escapeHtml(record.compositionId)}/${entry.version}?framework=${framework}&brand=${brand}&theme=${theme}">v${entry.version}</a> · ${escapeHtml(entry.operation)}${entry.parentVersion === null ? '' : ` ← v${entry.parentVersion}`}</li>`).join('');
  const options = <T extends string | number>(name: string, values: readonly T[], current: T) => values.map(value => `<button type="button" data-control="${name}" data-value="${escapeHtml(String(value))}" aria-pressed="${String(value === current)}">${escapeHtml(String(value))}</button>`).join('');
  return [
    '<!doctype html>',
    `<html lang="en" data-theme="${escapeHtml(theme)}" data-brand="${escapeHtml(brand)}">`,
    '<head>',
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeHtml(label)} v${record.version} · ${escapeHtml(framework)}</title>`,
    '<style>',
    'html,body{margin:0;font:14px/1.45 system-ui,sans-serif;background:#f4f4f5;color:#18181b}',
    '.shell{display:grid;grid-template-columns:minmax(260px,320px) 1fr;min-height:100vh}',
    'aside{padding:16px;border-right:1px solid #d4d4d8;background:#fafafa;overflow:auto}',
    'aside h1{font-size:16px;margin:0 0 4px}aside h2{font-size:12px;text-transform:uppercase;letter-spacing:.04em;margin:18px 0 6px;color:#52525b}',
    'dl{margin:0}.row{display:grid;grid-template-columns:96px 1fr;gap:6px;padding:3px 0;border-bottom:1px solid #e4e4e7}dt{color:#52525b}dd{margin:0;word-break:break-all}',
    'code{font:12px ui-monospace,monospace}',
    '.controls button{margin:0 4px 4px 0;padding:4px 10px;border:1px solid #a1a1aa;border-radius:6px;background:#fff;cursor:pointer}',
    '.controls button[aria-pressed="true"]{background:#18181b;color:#fff;border-color:#18181b}',
    '.controls input{width:80px;padding:4px 6px;border:1px solid #a1a1aa;border-radius:6px}',
    'ul{padding-left:18px;margin:0}li[aria-current="true"]{list-style:"▸ "}',
    'main{padding:16px;overflow:auto}',
    '.frame{display:inline-block;border:1px solid #d4d4d8;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.08)}',
    'iframe{display:block;border:0;width:100%;height:calc(100vh - 32px)}',
    '.status{margin:0 0 8px;color:#52525b;font-size:12px}',
    '.measurements{margin-top:16px;max-width:1440px}.measurements section{background:#fafafa;border:1px solid #d4d4d8;border-radius:8px;padding:12px}.measurements h3{font-size:13px;margin:0 0 8px}.measurements h4{font-size:12px;margin:12px 0 4px;color:#52525b}.measurements ul{padding-left:18px;margin:0}.measurements li{margin:0 0 4px;word-break:break-word}.count{color:#52525b;font-weight:400}',
    '@media (max-width:820px){.shell{grid-template-columns:1fr}aside{border-right:0;border-bottom:1px solid #d4d4d8}}',
    '</style>',
    '</head>',
    '<body>',
    '<div class="shell">',
    '<aside data-oods-lineage="true">',
    `<h1>${escapeHtml(label)}</h1>`,
    '<h2>Lineage</h2>',
    `<dl>${lineage}</dl>`,
    '<h2>Versions</h2>',
    `<ul data-oods-versions="true">${versionList}</ul>`,
    '<h2>Framework</h2>',
    `<div class="controls" data-oods-controls="framework">${options('framework', frameworks, framework)}</div>`,
    '<h2>Brand</h2>',
    `<div class="controls" data-oods-controls="brand">${options('brand', ['A', 'B'] as const, brand)}</div>`,
    '<h2>Theme</h2>',
    `<div class="controls" data-oods-controls="theme">${options('theme', ['light', 'dark', 'hc'] as const, theme)}</div>`,
    '<h2>Width</h2>',
    `<div class="controls" data-oods-controls="width">${options('width', FIXED_WIDTHS, width as number)}<button type="button" data-control="width" data-value="free" aria-pressed="${String(width === 'free')}">free</button> <input type="number" min="200" max="3840" step="10" value="${pixelWidth}" aria-label="Free width in pixels" data-control="width-input"${width === 'free' ? '' : ' disabled'}></div>`,
    '</aside>',
    '<main>',
    `<p class="status" data-oods-status="true">${escapeHtml(framework)} · brand ${escapeHtml(brand)} · ${escapeHtml(theme)} · ${width === 'free' ? `${pixelWidth}px (free)` : `${width}px`}</p>`,
    `<div class="frame" data-oods-frame="true" style="width:${pixelWidth}px"><iframe data-oods-app="true" src="${appUrl}" title="${escapeHtml(label)} running (${escapeHtml(framework)})"></iframe></div>`,
    `<div class="measurements">${renderMeasurementPanel(record)}</div>`,
    '</main>',
    '</div>',
    `<script type="module">\nconst state = ${scriptJson(state)};\nconst frame = document.querySelector('[data-oods-app]');\nconst box = document.querySelector('[data-oods-frame]');\nconst status = document.querySelector('[data-oods-status]');\nconst input = document.querySelector('[data-control="width-input"]');\nfunction press(name, value) { for (const button of document.querySelectorAll('button[data-control="' + name + '"]')) button.setAttribute('aria-pressed', String(button.dataset.value === String(value))); }\nfunction syncUrl() { const url = new URL(location.href); url.searchParams.set('framework', state.framework); url.searchParams.set('brand', state.brand); url.searchParams.set('theme', state.theme); url.searchParams.set('width', String(state.width)); history.replaceState(null, '', url); }\nfunction describe() { const px = state.width === 'free' ? input.value + 'px (free)' : state.width + 'px'; status.textContent = state.framework + ' · brand ' + state.brand + ' · ' + state.theme + ' · ' + px; }\nfunction applyWidth() { const px = state.width === 'free' ? Number(input.value) : state.width; box.style.width = px + 'px'; input.disabled = state.width !== 'free'; press('width', state.width); describe(); syncUrl(); }\ndocument.addEventListener('click', event => {\n  const button = event.target.closest('button[data-control]');\n  if (!button) return;\n  const { control, value } = button.dataset;\n  if (control === 'framework') { location.href = state.base + '/' + state.compositionId + '/' + state.version + '?framework=' + value + '&brand=' + state.brand + '&theme=' + state.theme + '&width=' + state.width; return; }\n  if (control === 'brand' || control === 'theme') {\n    state[control] = value; press(control, value);\n    document.documentElement.dataset[control] = value;\n    frame.contentWindow.postMessage({ type: 'oods-preview-scope', brand: state.brand, theme: state.theme }, '*');\n    describe(); syncUrl(); return;\n  }\n  if (control === 'width') { state.width = value === 'free' ? 'free' : Number(value); applyWidth(); }\n});\ninput.addEventListener('input', () => { if (state.width === 'free') applyWidth(); });\nwindow.addEventListener('message', async event => {\n  if (!event.data) return;\n  if (event.data.type === 'oods-preview-mounted') { document.documentElement.dataset.oodsAppMounted = 'true'; window.__oodsPreviewApp = event.data; }\n  if (event.data.type === 'oods-preview-measured') { const panel = document.querySelector('[data-oods-measurements]'); const response = await fetch(state.base + '/' + state.compositionId + '/' + state.version + '/measurements'); if (panel && response.ok) { panel.outerHTML = await response.text(); document.documentElement.dataset.oodsMeasured = String(Number(document.documentElement.dataset.oodsMeasured || 0) + 1); } }\n});\nwindow.__oodsPreviewShell = state;\n</script>`,
    '</body>',
    '</html>',
    '',
  ].join('\n');
}
