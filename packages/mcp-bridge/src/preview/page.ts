import type { PreviewRuntimeManifest } from './runtime.js';
import type { PreviewFramework, PreviewRecord } from './store.js';

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]!));
/** Inline JSON inside <script>: close-tag and line-separator safe. */
const scriptJson = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

export interface PreviewPageInput {
  record: PreviewRecord;
  framework: PreviewFramework;
  brand: PreviewRecord['brand'];
  theme: PreviewRecord['theme'];
  runtime: PreviewRuntimeManifest;
  /** URL prefix the host serves under, e.g. "/preview". */
  base: string;
}

/**
 * The page mounts the compiled artifact exactly as scripts/design-loop/serve.ts consumerEntries does:
 * data-theme/data-brand on the document and body, the deterministic field model as props, and every
 * required action dispatching an observable oods-design-loop-action event.
 */
export function renderPreviewPage({ record, framework, brand, theme, runtime, base }: PreviewPageInput): string {
  const entry = record.frameworks[framework];
  if (!entry) throw new Error(`Preview ${record.key} has no ${framework} artifact`);
  const runtimeBase = `${base}/runtime`;
  const importMap = { imports: Object.fromEntries(Object.entries(runtime.importMap).map(([specifier, file]) => [specifier, `${runtimeBase}/${file}`])) };
  const moduleUrl = `${base}/${record.key}/module.js?framework=${framework}`;
  const workflow = entry.artifact.files.some(file => file.path === 'package.json');
  const title = `${record.compose.object} ${record.compose.context} · ${framework} · ${brand}/${theme}`;
  const actions = `{${entry.artifact.actions.map(action => `${JSON.stringify(action.name)}: (...args) => window.dispatchEvent(new CustomEvent('oods-design-loop-action', { detail: { name: ${JSON.stringify(action.name)}, args } }))`).join(', ')}}`;
  const mount = workflow
    // A workflow artifact carries its own mount, store and sample data; the module runs it.
    ? `import ${JSON.stringify(moduleUrl)};\nmounted();`
    : framework === 'react'
      ? `import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport * as Module from ${JSON.stringify(moduleUrl)};\nconst Page = Module.GeneratedUI ?? Module.default;\nif (typeof Page !== 'function') throw new Error('The compiled module exports no GeneratedUI component.');\nconst actions = ${actions};\ncreateRoot(document.getElementById('app')).render(React.createElement(Page, { ...model, actions }));\nmounted();`
      : `import { createApp } from 'vue';\nimport * as Module from ${JSON.stringify(moduleUrl)};\nconst Page = Module.default ?? Module.GeneratedUI;\nif (!Page) throw new Error('The compiled module has no default export.');\nconst actions = ${actions};\ncreateApp(Page, { ...model, actions }).mount('#app');\nmounted();`;
  const identity = { key: record.key, schemaHash: record.schemaHash, framework, brand, theme, object: record.compose.object, context: record.compose.context, head: record.head, artifactContentHash: entry.artifact.contentHash, workflow };
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
    `<div id="app" data-oods-preview="${escapeHtml(record.key)}" data-oods-preview-framework="${escapeHtml(framework)}"></div>`,
    `<script type="module">\nconst model = ${scriptJson(record.model)};\nwindow.__oodsPreview = ${scriptJson(identity)};\nfunction mounted() { requestAnimationFrame(() => { document.documentElement.dataset.oodsPreviewMounted = 'true'; window.dispatchEvent(new CustomEvent('oods-preview-mounted', { detail: window.__oodsPreview })); }); }\n${mount}\n</script>`,
    '</body>',
    '</html>',
    '',
  ].join('\n');
}
