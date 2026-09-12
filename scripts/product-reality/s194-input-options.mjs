#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const registry = JSON.parse(read('packages/mcp-server/src/tools/registry.json'));
const index = read('packages/mcp-server/src/index.ts');
const specs = new Map([...index.matchAll(/'([^']+)':\s*\{\s*modulePath:\s*'([^']+)',\s*inputSchema:\s*'([^']+)'/g)].map(match => [match[1], { handler: path.posix.join('packages/mcp-server/src', match[2]).replace(/\.js$/, '.ts'), schema: path.posix.join('packages/mcp-server/src', match[3]) }]));
const parsed = new Map();
function source(file) {
  if (parsed.has(file)) return parsed.get(file);
  const syntax = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true);
  const reads = new Map(); const imports = [];
  const record = (name, node) => {
    const line = syntax.getLineAndCharacterOfPosition(node.getStart(syntax)).line + 1;
    if (!reads.has(name)) reads.set(name, []);
    reads.get(name).push({ file, line, expression: node.getText(syntax).slice(0, 180) });
  };
  function visit(node) {
    if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isTypeNode(node)) return;
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) && !node.importClause?.isTypeOnly && node.moduleSpecifier.text.startsWith('.')) {
      const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), node.moduleSpecifier.text)).replace(/\.js$/, '.ts');
      if (target.endsWith('.ts') && fs.existsSync(path.join(root, target))) imports.push(target);
    }
    if (ts.isPropertyAccessExpression(node)) record(node.name.text, node);
    if (ts.isElementAccessExpression(node) && node.argumentExpression && ts.isStringLiteral(node.argumentExpression)) record(node.argumentExpression.text, node);
    if (ts.isBindingElement(node) && ts.isObjectBindingPattern(node.parent)) record((node.propertyName ?? node.name).getText(syntax).replace(/^['"]|['"]$/g, ''), node);
    ts.forEachChild(node, visit);
  }
  visit(syntax); const result = { reads, imports }; parsed.set(file, result); return result;
}
function closure(first) {
  const queue = [first], seen = new Set(); const result = [];
  while (queue.length) { const file = queue.shift(); if (seen.has(file)) continue; seen.add(file); const item = source(file); result.push(item); queue.push(...item.imports); }
  return result;
}
function properties(schema, prefix = '', result = new Map()) {
  for (const [name, child] of Object.entries(schema.properties ?? {})) {
    const key = prefix + name;
    result.set(key, { name, description: child.description ?? '', parent: prefix ? prefix.slice(0, -1) : null });
    // Explicit option objects are controls; typed data operands are consumed as a unit.
    if (['options', 'output', 'preferences', 'preview'].includes(name)) properties(child, key + '.', result);
  }
  for (const key of ['allOf', 'oneOf', 'anyOf']) for (const child of schema[key] ?? []) properties(child, prefix, result);
  if (schema.then) properties(schema.then, prefix, result);
  if (schema.else) properties(schema.else, prefix, result);
  return result;
}
const lineRef = (file, anchor) => { const lines = read(file).split('\n'); const index = lines.findIndex(line => line.includes(anchor)); if (index < 0) throw new Error('Missing dispatch site: ' + anchor); return { file, line: index + 1, expression: lines[index].trim() }; };
const rows = [];
for (const tool of registry.auto) {
  const spec = specs.get(tool); const graph = closure(spec.handler);
  for (const [property, info] of properties(JSON.parse(read(spec.schema)))) {
    const candidates = graph.flatMap(item => item.reads.get(info.name) ?? []);
    const direct = candidates.filter(item => item.file === spec.handler);
    let refs = (direct.length ? direct : candidates).slice(0, 3);
    let disposition = refs.length ? 'read-site' : 'unresolved';
    if (tool === 'design.preview' && property.startsWith('preferences.')) {
      refs = [lineRef(spec.handler, 'input.preferences'), ...(closure('packages/mcp-server/src/tools/design.compose.ts').flatMap(item => item.reads.get(info.name) ?? [])).slice(0, 2)];
      disposition = 'serialized-forwarding';
    }
    if (tool === 'viz.render' && ['hierarchy', 'sankey', 'chord', 'network', 'geo'].includes(property)) {
      refs = [lineRef(spec.handler, '(input as Record<string, unknown>)[config.dataBranch]')];
      disposition = 'discriminated-data-branch';
    }
    if (tool === 'schema' && property === 'apply') {
      if (!info.description.includes('ignored by this action')) throw new Error('Missing schema bridge-parity description');
      disposition = 'documented-bridge-parity';
    }
    if (tool === 'brand.intake' && property === 'apply') {
      refs = [lineRef(spec.handler, '    preview_only: true,')];
      disposition = 'documented-bridge-parity';
    }
    rows.push({ tool, property, schema: spec.schema, description: info.description, status: disposition, refs });
  }
}
const report = { missionId: 's194-m05', methodology: 'Explicit public request properties, action branches and nested option controls. Typed/freeform data operands are inventoried at their consuming boundary. Runtime property accesses and object bindings in each handler and its relative-import consumer graph; type-only declarations/comments do not count. Static read sites are discovery evidence, not an execution verdict; boundary specs separately prove named behavior.', rows, unresolved: rows.filter(row => row.status === 'unresolved') };
const output = process.argv[2] ?? 'artifacts/product-reality/sprint-194/m05/input-property-sweep.json';
fs.writeFileSync(path.join(root, output), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ properties: rows.length, unresolved: report.unresolved.map(row => `${row.tool}.${row.property}`) }, null, 2));
if (report.unresolved.length) process.exitCode = 1;
