#!/usr/bin/env node
// Builds dist/preview-app/app.html once per package build: the Forge design preview as one self-contained
// MCP App resource (Sprint 202). The app SDK (@modelcontextprotocol/ext-apps) and the app's own code are
// bundled as one inline script, so the resource works under the host's default CSP (inline scripts only,
// no network). The manifest records the bytes and digest the adapter names in the resource URI.
//
//   node scripts/build-preview-app.mjs [--out <dir>]
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(PACKAGE_ROOT, 'package.json'));
const esbuild = require('esbuild');
const SOURCE = path.join(PACKAGE_ROOT, 'preview-app');
/** The bare specifiers a generated artifact may import, bound by the iife compile to globalThis.__oodsRuntime[specifier]. */
const RUNTIME_SPECIFIERS = ['react', 'react/jsx-runtime', 'react-dom', 'react-dom/client', 'vue', '@oods/components-react', '@oods/components-react/table', '@oods/components-react/status', '@oods/components-vue', '@oods/component-contracts', '@oods/component-styles'];
const RUNTIME_STYLES = path.join(PACKAGE_ROOT, 'dist', 'preview-runtime', 'styles.css');
const sha256 = value => createHash('sha256').update(value).digest('hex');

/** One iife that defines globalThis.__oodsRuntime: every specifier's namespace (with __esModule, so the iife modules' interop keeps `default`). */
async function buildRuntime(includeAxe) {
  const specifiers = includeAxe ? [...RUNTIME_SPECIFIERS, 'axe-core'] : RUNTIME_SPECIFIERS;
  const shimDir = fs.mkdtempSync(path.join(PACKAGE_ROOT, '.preview-app-runtime-'));
  try {
    const entry = path.join(shimDir, 'runtime.js');
    fs.writeFileSync(entry, [
      ...specifiers.map((specifier, index) => `import * as m${index} from ${JSON.stringify(specifier)};`),
      'const esm = (module) => { const namespace = { __esModule: true }; for (const key of Object.keys(module)) Object.defineProperty(namespace, key, { get: () => module[key], enumerable: true }); if (!("default" in module)) namespace.default = namespace; return namespace; };',
      `globalThis.__oodsRuntime = { ${specifiers.map((specifier, index) => `${JSON.stringify(specifier)}: esm(m${index})`).join(', ')} };`,
      '',
    ].join('\n'));
    const result = await esbuild.build({
      absWorkingDir: PACKAGE_ROOT, entryPoints: [entry], bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2022',
      minify: true, sourcemap: false, legalComments: 'none', logLevel: 'warning',
      define: { 'process.env.NODE_ENV': '"production"', __VUE_OPTIONS_API__: 'true', __VUE_PROD_DEVTOOLS__: 'false', __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false' },
    });
    return { specifiers, script: result.outputFiles[0].text };
  } finally { fs.rmSync(shimDir, { recursive: true, force: true }); }
}

function parseArgs(argv) {
  let out = path.join(PACKAGE_ROOT, 'dist', 'preview-app');
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--out') out = path.resolve(argv[++index] ?? '');
    else throw new Error(`unknown argument: ${argv[index]}`);
  }
  return { out };
}

async function main() {
  const { out } = parseArgs(process.argv.slice(2));
  const version = require(path.join(PACKAGE_ROOT, 'package.json')).version;
  // The SDK's exports map hides its package.json; read it beside the resolved entry.
  const sdkPackage = path.join(PACKAGE_ROOT, 'node_modules', '@modelcontextprotocol', 'ext-apps', 'package.json');
  if (!fs.existsSync(sdkPackage)) throw new Error('The preview app needs @modelcontextprotocol/ext-apps (the MCP Apps SDK) installed beside @oods/mcp-bridge.');
  const sdkVersion = JSON.parse(fs.readFileSync(sdkPackage, 'utf8')).version;
  const result = await esbuild.build({
    absWorkingDir: PACKAGE_ROOT, entryPoints: [path.join(SOURCE, 'main.ts')], bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2022',
    minify: true, sourcemap: false, legalComments: 'none', logLevel: 'warning',
    define: { 'process.env.NODE_ENV': '"production"', __OODS_PREVIEW_APP_VERSION__: JSON.stringify(version) },
  });
  const script = result.outputFiles[0].text;
  // The runtime the running app needs, inlined (axe-core stays out unless asked: the stored measurements are shown instead).
  const includeAxe = process.env.OODS_PREVIEW_APP_AXE === '1';
  const runtime = await buildRuntime(includeAxe);
  if (!fs.existsSync(RUNTIME_STYLES)) throw new Error(`The preview runtime styles are missing (${RUNTIME_STYLES}); build the preview runtime first.`);
  const styles = fs.readFileSync(RUNTIME_STYLES, 'utf8');
  for (const [name, text] of [['app script', script], ['runtime script', runtime.script]]) if (/<\/script/i.test(text)) throw new Error(`The bundled ${name} contains a script close tag and cannot be inlined.`);
  if (/<\/style/i.test(styles)) throw new Error('The runtime styles contain a style close tag and cannot be inlined.');
  if (/url\(\s*["']?https?:|@import/i.test(styles)) throw new Error('The runtime styles reference the network.');
  const template = fs.readFileSync(path.join(SOURCE, 'index.html'), 'utf8');
  const markers = { '<!-- OODS_PREVIEW_RUNTIME_STYLES -->': `<style id="oods-runtime-styles">${styles}</style>`, '<!-- OODS_PREVIEW_RUNTIME_SCRIPT -->': `<script>${runtime.script}</script>`, '<!-- OODS_PREVIEW_APP_SCRIPT -->': `<script>${script}</script>` };
  for (const marker of Object.keys(markers)) if (!template.includes(marker)) throw new Error(`preview-app/index.html lacks ${marker}`);
  if (/<meta[^>]+Content-Security-Policy/i.test(template)) throw new Error('The app template must not declare a CSP; the host default applies.');
  if (/\ssrc=["']https?:|\shref=["']https?:|url\(\s*["']?https?:/i.test(template)) throw new Error('The app template must not reference the network.');
  // Function replacers: the bundled scripts carry `$&` and friends, which a string replacement would expand.
  let html = template;
  for (const [marker, replacement] of Object.entries(markers)) html = html.replace(marker, () => replacement);
  const expected = template.length + Object.entries(markers).reduce((sum, [marker, replacement]) => sum + replacement.length - marker.length, 0);
  if (Object.keys(markers).some(marker => html.includes(marker)) || html.length !== expected) throw new Error('The app was not inlined verbatim.');
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'app.html'), html);
  const digest = sha256(html);
  const manifest = {
    version: 1, builtAt: new Date().toISOString(), app: version, sdk: sdkVersion, esbuild: require('esbuild/package.json').version, react: require('react/package.json').version, vue: require('vue/package.json').version,
    bytes: Buffer.byteLength(html), sha256: digest, revision: digest.slice(0, 12), csp: 'none declared (host default)',
    app_script: { bytes: Buffer.byteLength(script), sha256: sha256(script) },
    runtime: { specifiers: runtime.specifiers, axe: includeAxe, bytes: Buffer.byteLength(runtime.script), sha256: sha256(runtime.script) },
    styles: { source: 'dist/preview-runtime/styles.css', bytes: Buffer.byteLength(styles), sha256: sha256(styles) },
  };
  fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  process.stdout.write(`preview app: ${manifest.bytes} bytes (app ${manifest.app_script.bytes}, runtime ${manifest.runtime.bytes}${includeAxe ? ' with axe' : ''}, styles ${manifest.styles.bytes}), revision ${manifest.revision} → ${out}\n`);
}

main().catch(error => { process.stderr.write(`build-preview-app: ${error.stack ?? error.message}\n`); process.exit(1); });
