#!/usr/bin/env node
// Runs inside an extracted runtime bundle with no repository: drives the stdio adapter over
// JSON-RPC, calls design_preview, and fetches the page, the compiled modules and the runtime
// from the host the adapter started. Prints one JSON receipt on stdout.
//
//   node s201-linux-preview-proof.mjs <extracted-runtime-dir>
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

const runtimeRoot = path.resolve(process.argv[2] ?? '.');
const adapter = path.join(runtimeRoot, 'packages/mcp-adapter/index.js');
const store = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-linux-preview-'));
const child = spawn(process.execPath, [adapter], { cwd: path.dirname(adapter), env: { ...process.env, MCP_SCHEMA_STORE_ROOT: store, MCP_SCHEMA_STORE_DIR: 'schemas' }, stdio: ['pipe', 'pipe', 'pipe'] });
let stderr = ''; child.stderr.setEncoding('utf8'); child.stderr.on('data', chunk => { stderr += chunk; });
let buffer = ''; let next = 1; const pending = new Map();
child.stdout.setEncoding('utf8');
child.stdout.on('data', chunk => {
  buffer += chunk; let index;
  while ((index = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, index).trim(); buffer = buffer.slice(index + 1);
    if (!line) continue;
    const message = JSON.parse(line); const waiting = pending.get(message.id);
    if (waiting) { pending.delete(message.id); message.error ? waiting.reject(new Error(JSON.stringify(message.error))) : waiting.resolve(message.result); }
  }
});
const request = (method, params = {}) => new Promise((resolve, reject) => { const id = next++; pending.set(id, { resolve, reject }); child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n'); setTimeout(() => { if (pending.delete(id)) reject(new Error(`timeout ${method}`)); }, 180_000); });
const call = async (name, args) => { const result = await request('tools/call', { name, arguments: args }); if (result.isError) throw new Error(result.content[0].text); return JSON.parse(result.content[0].text); };
const sha256 = text => `sha256:${createHash('sha256').update(text).digest('hex')}`;
const portClosed = port => new Promise(resolve => { const socket = net.connect({ host: '127.0.0.1', port }); socket.once('connect', () => { socket.destroy(); resolve(false); }); socket.once('error', () => resolve(true)); });

const receipt = { platform: `${process.platform}-${process.arch}`, node: process.version, runtimeRoot, manifestCommit: JSON.parse(fs.readFileSync(path.join(runtimeRoot, 'forge-runtime.manifest.json'), 'utf8')).commit };
try {
  const initialized = await request('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 's201-linux-proof', version: '0.0.0' } });
  receipt.adapter = initialized.serverInfo;
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');
  receipt.tools = (await request('tools/list', {})).tools.length;
  const preview = await call('design_preview', { object: 'Subscription', context: 'detail' });
  receipt.preview = { key: preview.key, schemaHash: preview.schemaHash, host: preview.host, previewUrl: preview.previewUrl, frameworks: preview.previews.map(entry => entry.framework) };
  receipt.status = await (await fetch(`${preview.host.url}/preview/status`)).json();
  receipt.fetched = [];
  for (const entry of preview.previews) {
    const page = await fetch(entry.url); const html = await page.text();
    const module = await fetch(entry.moduleUrl); const code = await module.text();
    receipt.fetched.push({ framework: entry.framework, page: page.status, pageHasImportMap: html.includes('<script type="importmap">'), module: module.status, compiledSha256Matches: sha256(code) === entry.compiled.sha256, compiledBytes: code.length });
  }
  const runtime = await fetch(`${preview.host.url}/preview/runtime/react.js`);
  receipt.runtimeServed = runtime.status === 200;
  child.stdin.end();
  const exit = await new Promise(resolve => child.once('close', (code, signal) => resolve({ code, signal })));
  receipt.adapterExit = exit;
  receipt.hostPortClosedAfterExit = await portClosed(preview.host.port);
  receipt.hostStartedLog = /preview host started on/.test(stderr);
  receipt.pass = receipt.tools === 19 && receipt.fetched.every(row => row.page === 200 && row.module === 200 && row.compiledSha256Matches && row.pageHasImportMap) && receipt.runtimeServed && receipt.status.platform.supported === true && exit.code === 0 && receipt.hostPortClosedAfterExit;
} catch (error) {
  receipt.pass = false; receipt.error = error.message; receipt.stderr = stderr.slice(-4000);
  if (child.exitCode === null) child.kill('SIGKILL');
} finally { fs.rmSync(store, { recursive: true, force: true }); }
process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
process.exit(receipt.pass ? 0 : 1);
