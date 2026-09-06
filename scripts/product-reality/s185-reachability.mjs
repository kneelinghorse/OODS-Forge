#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const output = path.resolve(process.argv[2] ?? path.join(root, 'artifacts/product-reality/sprint-185/m04/reachability'));
const store = path.join(root, 'artifacts/product-reality/sprint-183/m04/saved-schema-store');
const files = fs.readdirSync(store).filter(name => name.endsWith('.json') && name !== '_index.json').sort();
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const entry = path.join(root, 'packages/mcp-server/dist/tools/code.generate.js');
const { handle } = await import(pathToFileURL(entry).href);
const rows = [];
fs.mkdirSync(output, { recursive: true });
for (const file of files) {
  const bytes = fs.readFileSync(path.join(store, file));
  const record = JSON.parse(bytes);
  const cells = [];
  for (const framework of ['react', 'vue']) {
    const schema = structuredClone(record.schema);
    const result = await handle({ framework, profile: 'build', schema });
    if (JSON.stringify(schema) !== JSON.stringify(record.schema)) throw new Error(`Generation mutated ${file}/${framework}`);
    const issues = [...(result.errors ?? []), ...(result.validation?.errors ?? [])]
      .map(({ code, nodeId, message }) => ({ code, nodeId, message }));
    const rawPath = `${file.slice(0, -5)}.${framework}.response.json`;
    const rawBytes = JSON.stringify(result, null, 2) + '\n';
    fs.writeFileSync(path.join(output, rawPath), rawBytes);
    cells.push({ framework, status: result.status, artifactPresent: Boolean(result.artifact), issues, response: { path: rawPath, sha256: sha256(rawBytes) } });
  }
  if (!fs.readFileSync(path.join(store, file)).equals(bytes)) throw new Error(`Saved input changed: ${file}`);
  rows.push({ schema: file.slice(0, -5), input: { path: path.relative(root, path.join(store, file)), sha256: sha256(bytes) }, reachable: cells.every(cell => cell.status === 'ok' && cell.artifactPresent), cells });
}
const report = {
  missionId: 's185-m04', measuredAt: new Date().toISOString(),
  head: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  command: process.argv, entry: { path: path.relative(root, entry), sha256: sha256(fs.readFileSync(entry)) },
  total: rows.length, reachable: rows.filter(row => row.reachable).length,
  generatedCells: rows.flatMap(row => row.cells).filter(cell => cell.status === 'ok' && cell.artifactPresent).length,
  limitation: 'Generation reachability only. Packed-consumer runtime proof is separately recorded for eight schemas; this census does not promote the other schemas to runtime proof.',
  rows,
};
fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
process.stdout.write(JSON.stringify({ total: report.total, reachable: report.reachable, generatedCells: report.generatedCells, blocked: rows.filter(row => !row.reachable).map(row => ({ schema: row.schema, cells: row.cells.map(({ framework, status, issues }) => ({ framework, status, issues })) })) }, null, 2) + '\n');
