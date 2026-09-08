#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const output = path.resolve(args[0] && !args[0].startsWith('--') ? args.shift() : path.join(root, 'artifacts/product-reality/sprint-185/m04/reachability'));
let store = path.join(root, 'artifacts/product-reality/sprint-183/m04/saved-schema-store');
let missionId = 's185-m04';
let fresh = false;
for (let index = 0; index < args.length; index += 1) {
  if (args[index] === '--fresh') { fresh = true; continue; }
  const option = args[index];
  const value = args[++index];
  if (!value || value.startsWith('--')) throw new Error(`Missing value for ${option}.`);
  if (option === '--store') store = path.resolve(root, value);
  else if (option === '--mission') missionId = value;
  else throw new Error(`Unknown argument: ${option}`);
}
if (fresh) {
  const load = file => import(pathToFileURL(path.join(root, file)).href);
  const { handle: list } = await load('packages/mcp-server/dist/tools/object.list.js');
  const { handle: compose } = await load('packages/mcp-server/dist/tools/design.compose.js');
  const { handle: generate } = await load('packages/mcp-server/dist/tools/code.generate.js');
  const objects = (await list({})).objects.map(row => row.name).sort();
  const contexts = JSON.parse(fs.readFileSync(path.join(root, 'packages/mcp-server/src/schemas/design.compose.input.json'), 'utf8')).properties.context.enum.filter(context => context !== 'workflow');
  const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
  fs.mkdirSync(output, { recursive: true });
  const record = (file, document) => {
    const bytes = JSON.stringify(document, null, 2) + '\n';
    fs.writeFileSync(path.join(output, file), bytes);
    return { path: path.relative(root, path.join(output, file)), sha256: digest(bytes) };
  };
  const inputs = objects.flatMap(object => contexts.map(context => ({ object, context })));
  inputs.push({ object: 'Subscription', context: 'workflow' });
  const rows = [];
  for (const input of inputs) {
    const composed = await compose(input);
    if (composed.status !== 'ok') throw new Error(`Composition failed: ${JSON.stringify(input)}`);
    const id = `${input.object}-${input.context}`;
    const composition = record(`${id}.composition.json`, composed);
    const cells = [];
    for (const framework of ['react', 'vue']) {
      const result = await generate({ schema: composed.schema, framework, profile: 'build' });
      cells.push({ framework, status: result.status, artifactPresent: Boolean(result.artifact), errors: result.errors ?? [], response: record(`${id}.${framework}.json`, result) });
    }
    const components = new Set();
    const walk = node => { components.add(node.component); node.children?.forEach(walk); };
    composed.schema.screens.forEach(walk);
    rows.push({ input, composition, components: [...components].sort(), cells, green: cells.every(cell => cell.status === 'ok' && cell.artifactPresent && cell.errors.length === 0) });
  }
  const screens = rows.filter(row => row.input.context !== 'workflow');
  const workflow = rows.find(row => row.input.context === 'workflow');
  const report = { missionId, head: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), measuredAt: new Date().toISOString(), command: process.argv,
    profile: 'build', objects, contexts, schemaCount: screens.length, greenSchemas: screens.filter(row => row.green).length,
    generationCells: screens.length * 2, greenCells: screens.flatMap(row => row.cells).filter(cell => cell.status === 'ok' && cell.artifactPresent && !cell.errors.length).length,
    workflow, rows: screens, limitation: 'Generation-only evidence; the full generated application has a separate packed browser proof.' };
  record('report.json', report);
  console.log(JSON.stringify({ schemaCount: report.schemaCount, greenSchemas: report.greenSchemas, greenCells: report.greenCells, workflowGreen: workflow.green }));
  if (report.schemaCount !== 66 || report.greenSchemas !== 66 || report.greenCells !== 132 || !workflow.green) process.exitCode = 1;
} else {
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
  rows.push({ schema: file.slice(0, -5), input: { path: path.relative(root, path.join(store, file)), sha256: sha256(bytes) }, ...(record.derivation ? { derivation: record.derivation } : {}), reachable: cells.every(cell => cell.status === 'ok' && cell.artifactPresent), cells });
}
const report = {
  missionId, schemaStore: path.relative(root, store), measuredAt: new Date().toISOString(),
  head: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  command: process.argv, entry: { path: path.relative(root, entry), sha256: sha256(fs.readFileSync(entry)) },
  total: rows.length, reachable: rows.filter(row => row.reachable).length,
  generatedCells: rows.flatMap(row => row.cells).filter(cell => cell.status === 'ok' && cell.artifactPresent).length,
  limitation: 'Generation reachability only for the named schema store. Packed-consumer runtime proof is recorded separately and is not inferred from this census.',
  rows,
};
fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
process.stdout.write(JSON.stringify({ total: report.total, reachable: report.reachable, generatedCells: report.generatedCells, blocked: rows.filter(row => !row.reachable).map(row => ({ schema: row.schema, cells: row.cells.map(({ framework, status, issues }) => ({ framework, status, issues })) })) }, null, 2) + '\n');

}
