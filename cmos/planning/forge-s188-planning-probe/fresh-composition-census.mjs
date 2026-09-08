import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

// Planning measurement only. Known generation failures are data, not a successful build gate.
const [rootArg, outputArg] = process.argv.slice(2);
if (!rootArg || !outputArg) throw new Error('Usage: node fresh-composition-census.mjs <repository-root> <output.json>');
const root = path.resolve(rootArg);
const output = path.resolve(outputArg);
process.chdir(root);
const load = (relative) => import(pathToFileURL(path.join(root, relative)).href);
const { handle: list } = await load('packages/mcp-server/dist/tools/object.list.js');
const { handle: compose } = await load('packages/mcp-server/dist/tools/design.compose.js');
const { handle: generate } = await load('packages/mcp-server/dist/tools/code.generate.js');
const { NUCLEUS_COMPONENT_IDS } = await load('packages/component-contracts/dist/index.js');
const contexts = JSON.parse(fs.readFileSync(path.join(root, 'packages/mcp-server/src/schemas/design.compose.input.json'), 'utf8')).properties.context.enum;
const objects = (await list({})).objects.map((entry) => entry.name).sort();
const governed = new Set(NUCLEUS_COMPONENT_IDS);
function componentsIn(value, found = new Set()) {
  if (Array.isArray(value)) value.forEach((item) => componentsIn(item, found));
  else if (value && typeof value === 'object') {
    if (typeof value.component === 'string') found.add(value.component);
    Object.values(value).forEach((item) => componentsIn(item, found));
  }
  return [...found].sort();
}
const rows = [];
for (const object of objects) {
  for (const context of contexts) {
    const input = { object, context };
    const composed = await compose(input);
    if (composed.status !== 'ok' || !composed.schema) throw new Error(`Composition failed: ${JSON.stringify({ input, status: composed.status, errors: composed.errors })}`);
    const components = componentsIn(composed.schema.screens);
    const cells = [];
    for (const framework of ['react', 'vue']) {
      const result = await generate({ schema: composed.schema, framework, profile: 'build' });
      cells.push({ framework, status: result.status, artifactPresent: Boolean(result.artifact), errors: result.errors ?? [] });
    }
    rows.push({ input, composed: true, components, ungoverned: components.filter((id) => !governed.has(id)), cells, green: cells.every((cell) => cell.status === 'ok' && cell.artifactPresent && cell.errors.length === 0) });
  }
}
const report = {
  measuredAt: new Date().toISOString(),
  head: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  source: 'Built packages in the explicitly supplied repository root; rebuild after source changes.',
  scope: 'Every object.list({}) object × every public design.compose context; default composition, no overrides or pruning. Generation-only evidence; not packed-consumer proof.',
  profile: 'build', objects, objectCount: objects.length, contexts,
  schemaCount: rows.length, greenSchemas: rows.filter((row) => row.green).length,
  generationCells: rows.reduce((count, row) => count + row.cells.length, 0),
  greenCells: rows.flatMap((row) => row.cells).filter((cell) => cell.status === 'ok' && cell.artifactPresent && cell.errors.length === 0).length,
  governedComponentCount: governed.size, rows,
};
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ output, objects: report.objects, contexts, schemas: `${report.greenSchemas}/${report.schemaCount}`, cells: `${report.greenCells}/${report.generationCells}`, governed: governed.size }));
