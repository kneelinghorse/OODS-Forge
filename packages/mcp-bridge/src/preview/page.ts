import type { PreviewRuntimeManifest } from './runtime.js';
import type { CompositionVersion, PreviewBrand, PreviewFramework, PreviewTheme } from './store.js';

export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]!));
/** Inline JSON inside <script>: close-tag and line-separator safe. */
export const scriptJson = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

export interface PreviewAppPageInput {
  record: CompositionVersion;
  framework: PreviewFramework;
  brand: PreviewBrand;
  theme: PreviewTheme;
  runtime: PreviewRuntimeManifest;
  /** URL prefix the host serves under, e.g. "/preview". */
  base: string;
}

/**
 * The bare running app. It mounts the compiled artifact exactly as scripts/design-loop/serve.ts
 * consumerEntries does: data-theme/data-brand on the document and body, the deterministic field
 * model as props, every required action dispatching an observable oods-design-loop-action event.
 * A parent frame (the lineage page) can post {type:'oods-preview-scope', brand, theme}: the page
 * swaps the scope attributes and re-mounts the same module without fetching anything again.
 */
export function renderPreviewAppPage({ record, framework, brand, theme, runtime, base }: PreviewAppPageInput): string {
  const entry = record.artifacts[framework];
  if (!entry) throw new Error(`Composition ${record.compositionId}@${record.version} has no ${framework} artifact`);
  const runtimeBase = `${base}/runtime`;
  const importMap = { imports: Object.fromEntries(Object.entries(runtime.importMap).map(([specifier, file]) => [specifier, `${runtimeBase}/${file}`])) };
  const versionBase = `${base}/${record.compositionId}/${record.version}`;
  const moduleUrl = `${versionBase}/module.js?framework=${framework}`;
  const workflow = entry.artifact.files.some(file => file.path === 'package.json');
  const title = `${record.compose.object ?? 'composition'} ${record.compose.context ?? ''} v${record.version} · ${framework} · ${brand}/${theme}`;
  const actions = `{${entry.artifact.actions.map(action => `${JSON.stringify(action.name)}: (...args) => window.dispatchEvent(new CustomEvent('oods-design-loop-action', { detail: { name: ${JSON.stringify(action.name)}, args } }))`).join(', ')}}`;
  const mountScript = workflow
    // A workflow artifact carries its own mount, store and sample data; the module runs it once.
    ? `import ${JSON.stringify(moduleUrl)};\nfunction mount() {}\nfunction unmount() {}\nmounted();`
    : framework === 'react'
      ? `import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport * as Module from ${JSON.stringify(moduleUrl)};\nconst Page = Module.GeneratedUI ?? Module.default;\nif (typeof Page !== 'function') throw new Error('The compiled module exports no GeneratedUI component.');\nconst actions = ${actions};\nlet root = null;\nfunction mount() { root = createRoot(document.getElementById('app')); root.render(React.createElement(Page, { ...model, actions })); }\nfunction unmount() { if (root) { root.unmount(); root = null; } }\nmount();\nmounted();`
      : `import { createApp } from 'vue';\nimport * as Module from ${JSON.stringify(moduleUrl)};\nconst Page = Module.default ?? Module.GeneratedUI;\nif (!Page) throw new Error('The compiled module has no default export.');\nconst actions = ${actions};\nlet app = null;\nfunction mount() { app = createApp(Page, { ...model, actions }); app.mount('#app'); }\nfunction unmount() { if (app) { app.unmount(); app = null; } }\nmount();\nmounted();`;
  const identity = { compositionId: record.compositionId, version: record.version, parentVersion: record.parentVersion, operation: record.operation, head: record.head, schemaHash: record.schemaHash, framework, brand, theme, object: record.compose.object ?? null, context: record.compose.context ?? null, artifactContentHash: entry.artifact.contentHash, workflow, generatedFor: { brand: record.brand, theme: record.theme } };
  return [
    '<!doctype html>',
    `<html lang="en" data-theme="${escapeHtml(theme)}" data-brand="${escapeHtml(brand)}">`,
    '<head>',
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeHtml(title)}</title>`,
    `<script type="importmap">${scriptJson(importMap)}</script>`,
    `<link rel="stylesheet" href="${runtimeBase}/${escapeHtml(runtime.styles)}">`,
    '<style>html,body{margin:0;min-height:100%}body{background:var(--sys-surface-canvas);color:var(--sys-text-primary)}</style>',
    '</head>',
    `<body data-theme="${escapeHtml(theme)}" data-brand="${escapeHtml(brand)}" style="color-scheme:${theme === 'dark' ? 'dark' : 'light'}">`,
    `<div id="app" data-oods-preview="${escapeHtml(record.compositionId)}" data-oods-preview-version="${record.version}" data-oods-preview-framework="${escapeHtml(framework)}"></div>`,
    `<script type="module">\nconst model = ${scriptJson(record.model ?? {})};\nwindow.__oodsPreview = ${scriptJson(identity)};\nlet mounts = 0;\nfunction mounted() { mounts += 1; window.__oodsPreview.mounts = mounts; requestAnimationFrame(() => { document.documentElement.dataset.oodsPreviewMounted = 'true'; window.dispatchEvent(new CustomEvent('oods-preview-mounted', { detail: window.__oodsPreview })); if (window.parent !== window) window.parent.postMessage({ type: 'oods-preview-mounted', ...window.__oodsPreview }, '*'); }); }\n// Brand and theme are switches: swap the scope on the document and re-mount the same module.\nfunction applyScope(scope) {\n  const brand = ['A', 'B'].includes(scope.brand) ? scope.brand : window.__oodsPreview.brand;\n  const theme = ['light', 'dark', 'hc'].includes(scope.theme) ? scope.theme : window.__oodsPreview.theme;\n  for (const element of [document.documentElement, document.body]) { element.dataset.theme = theme; element.dataset.brand = brand; }\n  document.body.style.colorScheme = theme === 'dark' ? 'dark' : 'light';\n  window.__oodsPreview.brand = brand; window.__oodsPreview.theme = theme;\n  document.documentElement.dataset.oodsPreviewMounted = 'false';\n  unmount(); mount(); mounted();\n}\nwindow.__oodsPreviewApplyScope = applyScope;\nwindow.addEventListener('message', event => { if (event.data && event.data.type === 'oods-preview-scope') applyScope(event.data); });\n${mountScript}\n</script>`,
    '</body>',
    '</html>',
    '',
  ].join('\n');
}
