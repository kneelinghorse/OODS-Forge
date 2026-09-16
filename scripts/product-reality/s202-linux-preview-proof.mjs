#!/usr/bin/env node
// s202-m05: runs inside an extracted runtime bundle with no repository (the pinned Linux container). Drives the stdio
// adapter over JSON-RPC as a client that negotiates MCP Apps: the preview app resource, design_preview with
// _meta.ui.resourceUri and structuredContent, and the compiled modules, styles, version record and lineage list through
// resources/read; then a second process that declares nothing gets no pointer to the app. Prints one JSON receipt on
// stdout (the Sprint 201 proof, s201-linux-preview-proof.mjs, fetched the same host over HTTP without negotiating).
//
//   node s202-linux-preview-proof.mjs <extracted-runtime-dir>
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

const UI_EXTENSION = 'io.modelcontextprotocol/ui';
const APP_MIME_TYPE = 'text/html;profile=mcp-app';
const runtimeRoot = path.resolve(process.argv[2] ?? '.');
const adapter = path.join(runtimeRoot, 'packages/mcp-adapter/index.js');
const store = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-linux-mcp-apps-'));
const sha256 = text => createHash('sha256').update(text).digest('hex');
const portClosed = port => new Promise(resolve => { const socket = net.connect({ host: '127.0.0.1', port }); socket.once('connect', () => { socket.destroy(); resolve(false); }); socket.once('error', () => resolve(true)); });

function start() {
  const env = { ...process.env, MCP_SCHEMA_STORE_ROOT: store, MCP_SCHEMA_STORE_DIR: 'schemas' };
  delete env.OODS_MCP_APPS_UI; // an operator override would offer the app without negotiation
  const child = spawn(process.execPath, [adapter], { cwd: path.dirname(adapter), env, stdio: ['pipe', 'pipe', 'pipe'] });
  const rpc = { child, stderr: '', nonJson: [], pending: new Map(), next: 1 };
  child.stderr.setEncoding('utf8'); child.stderr.on('data', chunk => { rpc.stderr += chunk; });
  let buffer = '';
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', chunk => {
    buffer += chunk; let index;
    while ((index = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, index).trim(); buffer = buffer.slice(index + 1);
      if (!line) continue;
      let message; try { message = JSON.parse(line); } catch { rpc.nonJson.push(line.slice(0, 200)); continue; }
      const waiting = rpc.pending.get(message.id);
      if (waiting) { rpc.pending.delete(message.id); message.error ? waiting.reject(new Error(JSON.stringify(message.error))) : waiting.resolve(message.result); }
    }
  });
  rpc.request = (method, params = {}) => new Promise((resolve, reject) => { const id = rpc.next++; rpc.pending.set(id, { resolve, reject }); child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n'); setTimeout(() => { if (rpc.pending.delete(id)) reject(new Error(`timeout ${method}`)); }, 180_000).unref(); });
  rpc.initialized = () => child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');
  // The negotiation receipt is written to stderr when initialize arrives; the pipes are not ordered, so wait for it.
  rpc.negotiation = async () => { for (const deadline = Date.now() + 5_000; ;) { const line = rpc.stderr.split('\n').find(entry => entry.startsWith('[oods-mcp-adapter] client ')); if (line) return line; if (Date.now() > deadline) throw new Error(`no negotiation line on stderr: ${rpc.stderr.slice(-2000)}`); await new Promise(resolve => setTimeout(resolve, 25)); } };
  rpc.close = () => { child.stdin.end(); return new Promise(resolve => child.once('close', (code, signal) => resolve({ code, signal }))); };
  return rpc;
}

const manifest = JSON.parse(fs.readFileSync(path.join(runtimeRoot, 'forge-runtime.manifest.json'), 'utf8'));
const appManifest = JSON.parse(fs.readFileSync(path.join(runtimeRoot, 'packages/mcp-bridge/dist/preview-app/manifest.json'), 'utf8'));
const appUri = `ui://oods-forge/preview/${appManifest.revision}/app.html`;
const receipt = { platform: `${process.platform}-${process.arch}`, node: process.version, runtimeRoot, manifestCommit: manifest.commit, checks: {} };
const check = (name, ok) => { receipt.checks[name] = Boolean(ok); };
let negotiated; let plain;
try {
  negotiated = start();
  const initialized = await negotiated.request('initialize', { protocolVersion: '2025-06-18', capabilities: { extensions: { [UI_EXTENSION]: { mimeTypes: [APP_MIME_TYPE] } } }, clientInfo: { name: 's202-linux-proof', version: '0.0.0' } });
  negotiated.initialized();
  receipt.adapter = initialized.serverInfo;
  receipt.capabilities = initialized.capabilities;
  check('capabilities', JSON.stringify(initialized.capabilities) === JSON.stringify({ tools: {}, resources: {}, extensions: { [UI_EXTENSION]: {} } }));
  const { tools } = await negotiated.request('tools/list');
  receipt.tools = tools.length;
  const pointing = tools.filter(tool => tool._meta !== undefined);
  receipt.toolMeta = pointing.map(tool => ({ name: tool.name, _meta: tool._meta }));
  check('toolMetaOnDesignPreviewOnly', pointing.length === 1 && pointing[0].name === 'design_preview' && pointing[0]._meta?.ui?.resourceUri === appUri && pointing[0]._meta?.['ui/resourceUri'] === appUri);
  receipt.negotiation = await negotiated.negotiation();
  check('negotiationLine', receipt.negotiation === `[oods-mcp-adapter] client s202-linux-proof 0.0.0 (protocol 2025-06-18); MCP Apps ${UI_EXTENSION}: negotiated (mimeTypes ${JSON.stringify([APP_MIME_TYPE])}); preview app offered on design_preview; client capability keys: extensions`);
  const { resources } = await negotiated.request('resources/list');
  receipt.listed = resources.map(({ uri, mimeType }) => ({ uri, mimeType }));
  check('listedExactlyTheApp', resources.length === 1 && resources[0].uri === appUri && resources[0].mimeType === APP_MIME_TYPE);
  const app = (await negotiated.request('resources/read', { uri: appUri })).contents;
  const shipped = fs.readFileSync(path.join(runtimeRoot, 'packages/mcp-bridge/dist/preview-app/app.html'));
  receipt.app = { uri: appUri, bytes: appManifest.bytes, sha256: appManifest.sha256, readSha256: sha256(app[0].text) };
  check('appReadEqualsShipped', app.length === 1 && app[0].mimeType === APP_MIME_TYPE && sha256(app[0].text) === appManifest.sha256 && sha256(shipped) === appManifest.sha256);

  const result = await negotiated.request('tools/call', { name: 'design_preview', arguments: { object: 'Subscription', context: 'detail' } });
  if (result.isError) throw new Error(result.content[0].text);
  const preview = JSON.parse(result.content[0].text);
  const { resources: offered, ...rest } = result.structuredContent ?? {};
  receipt.preview = { compositionId: preview.compositionId, version: preview.version, operation: preview.operation, head: preview.head, schemaHash: preview.schemaHash, host: preview.host, frameworks: preview.previews.map(entry => entry.framework) };
  check('structuredContentEqualsText', result.content.length === 1 && JSON.stringify(rest) === JSON.stringify(preview));
  const base = `ui://oods-forge/compositions/${preview.compositionId}/${preview.version}/`;
  const scope = `?brand=${preview.brand}&theme=${preview.theme}`;
  receipt.resources = offered;
  check('resourceUris', JSON.stringify(offered) === JSON.stringify({ app: appUri, record: `${base}record.json`, versions: `ui://oods-forge/compositions/${preview.compositionId}/versions.json`, modules: { react: `${base}react.js${scope}`, vue: `${base}vue.js${scope}` }, styles: { react: `${base}react.css${scope}`, vue: `${base}vue.css${scope}` } }));
  receipt.modules = {};
  for (const framework of ['react', 'vue']) {
    const [module] = (await negotiated.request('resources/read', { uri: offered.modules[framework] })).contents;
    const [styles] = (await negotiated.request('resources/read', { uri: offered.styles[framework] })).contents;
    receipt.modules[framework] = { mimeType: module.mimeType, bytes: Buffer.byteLength(module.text), sha256: sha256(module.text), stylesMimeType: styles.mimeType, stylesBytes: Buffer.byteLength(styles.text) };
    // The inline script the app injects: registered on the app's module table, bound to its inlined runtime, no imports.
    check(`${framework}ModuleIife`, module.mimeType === 'text/javascript' && /^var __oodsModules;\s*\(__oodsModules \|\|= \{\}\)\.m_[a-f0-9]{16} = /.test(module.text) && module.text.includes('globalThis.__oodsRuntime') && !/^import /m.test(module.text));
    check(`${framework}Styles`, styles.mimeType === 'text/css' && typeof styles.text === 'string');
  }
  const record = JSON.parse((await negotiated.request('resources/read', { uri: offered.record })).contents[0].text);
  const versions = JSON.parse((await negotiated.request('resources/read', { uri: offered.versions })).contents[0].text);
  receipt.record = { compositionId: record.compositionId, version: record.version, head: record.head, schemaHash: record.schemaHash };
  receipt.versions = { lineage: versions.versions.map(entry => [entry.version, entry.parentVersion, entry.operation]), accepted: versions.accepted };
  check('recordNamesBundleHead', record.compositionId === preview.compositionId && record.version === preview.version && record.head === manifest.commit && record.schemaHash === preview.schemaHash);
  check('versionsLineage', JSON.stringify(receipt.versions.lineage) === JSON.stringify([[1, null, 'compose']]) && versions.accepted === null);
  const status = await (await fetch(`${preview.host.url}/preview/status`)).json();
  receipt.hostPlatform = status.platform;
  check('platformSupported', status.platform?.supported === true);
  receipt.adapterExit = await negotiated.close();
  receipt.nonJsonStdout = negotiated.nonJson;
  check('adapterExitClean', receipt.adapterExit.code === 0);
  check('hostPortClosedAfterExit', await portClosed(preview.host.port));
  check('stdoutJsonOnly', negotiated.nonJson.length === 0);

  plain = start();
  const plainInit = await plain.request('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 's202-linux-proof-plain', version: '0.0.0' } });
  plain.initialized();
  const plainTools = (await plain.request('tools/list')).tools;
  receipt.plain = { protocolVersion: plainInit.protocolVersion, tools: plainTools.length, toolsWithMeta: plainTools.filter(tool => tool._meta !== undefined).length, negotiation: await plain.negotiation() };
  check('plainClientNoMeta', plainTools.length === 19 && receipt.plain.toolsWithMeta === 0);
  check('plainNegotiationLine', receipt.plain.negotiation === `[oods-mcp-adapter] client s202-linux-proof-plain 0.0.0 (protocol 2024-11-05); MCP Apps ${UI_EXTENSION}: not advertised; preview app kept as the text result; client capability keys: none`);
  receipt.plain.exit = await plain.close();
  check('plainExitClean', receipt.plain.exit.code === 0 && plain.nonJson.length === 0);
  receipt.pass = receipt.tools === 19 && Object.values(receipt.checks).every(Boolean);
} catch (error) {
  receipt.pass = false; receipt.error = error.message;
  for (const rpc of [negotiated, plain]) if (rpc) { receipt.stderr = `${receipt.stderr ?? ''}${rpc.stderr.slice(-3000)}`; if (rpc.child.exitCode === null) rpc.child.kill('SIGKILL'); }
} finally { fs.rmSync(store, { recursive: true, force: true }); }
process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
process.exit(receipt.pass ? 0 : 1);
