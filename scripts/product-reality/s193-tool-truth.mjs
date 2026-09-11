#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const ts = require('typescript');
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const LEDGER_PATH = 'packages/mcp-server/registry/tool-capability-ledger.v1.json';
export const TIERS = ['product-reality', 'contract', 'unit', 'none'];
const families = new Set(['map', 'schema', 'object', 'repl', 'review']);
const hash = bytes => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]).sort();
const quote = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const serialize = value => JSON.stringify(value, null, 2) + '\n';

/** Literal runtime imports only. A source-test tier is not an execution verdict. */
export function handlerImports(file, source, root, names) {
  const syntax = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const imports = [];
  function visit(node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const clause = node.importClause;
      const typeOnly = clause?.isTypeOnly || (!clause?.name && clause?.namedBindings && ts.isNamedImports(clause.namedBindings) && clause.namedBindings.elements.every(item => item.isTypeOnly));
      if (!typeOnly) imports.push({ value: node.moduleSpecifier.text, line: syntax.getLineAndCharacterOfPosition(node.getStart(syntax)).line + 1 });
    }
    if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || node.expression.getText(syntax) === 'require') && node.arguments.length && ts.isStringLiteral(node.arguments[0])) {
      imports.push({ value: node.arguments[0].text, line: syntax.getLineAndCharacterOfPosition(node.getStart(syntax)).line + 1 });
    }
    ts.forEachChild(node, visit);
  }
  visit(syntax);
  return imports.flatMap(item => {
    if (!item.value.startsWith('.')) return [];
    const full = path.resolve(root, path.dirname(file), item.value).replace(/\.[cm]?js$/, '.ts');
    const relative = path.relative(path.join(root, 'packages/mcp-server/src/tools'), full);
    if (relative.startsWith('..') || !fs.existsSync(full)) return [];
    if (!/export\s+(?:async\s+)?function\s+handle\b|export\s+const\s+handle\b/.test(fs.readFileSync(full, 'utf8'))) return [];
    const module = relative.replace(/\.ts$/, '').replaceAll(path.sep, '.');
    const name = names.find(name => module === name || (families.has(name) && module.startsWith(`${name}.`)));
    return name ? [{ tool: name, path: file, line: item.line, handler: path.relative(root, full).replaceAll(path.sep, '/') }] : [];
  });
}

export function deriveToolTruth({ root = ROOT, head } = {}) {
  assert.match(head ?? '', /^[0-9a-f]{40}$/);
  const read = file => fs.readFileSync(path.join(root, file), 'utf8');
  const registry = JSON.parse(read('packages/mcp-server/src/tools/registry.json'));
  const names = [...registry.auto, ...registry.onDemand];
  assert.equal(names.length, 27); assert.equal(new Set(names).size, 27);
  const descriptions = JSON.parse(read('packages/mcp-adapter/tool-descriptions.json'));
  const index = read('packages/mcp-server/src/index.ts');
  const toolSpecs = new Map([...index.matchAll(/'([^']+)':\s*\{\s*modulePath:\s*'([^']+)',\s*inputSchema:\s*'([^']+)'/g)].map(match => [match[1], { handler: match[2], schema: match[3] }]));
  const allImports = [];
  for (const base of ['packages/mcp-server/test', 'packages/mcp-server/src']) {
    for (const full of walk(path.join(root, base)).filter(file => /\.(test|spec)\.[cm]?[jt]sx?$/.test(file))) {
      const file = path.relative(root, full).replaceAll(path.sep, '/');
      allImports.push(...handlerImports(file, read(file), root, names));
    }
  }
  const readmes = walk(path.join(root, 'artifacts/product-reality')).filter(file => path.basename(file) === 'README.md' && !(/\/sprint-193\/m0[67]\//.test(file))).map(full => ({ path: path.relative(root, full).replaceAll(path.sep, '/'), text: fs.readFileSync(full, 'utf8') })).filter(file => /\b(browser|packed|runtime|SVG|screenshot)\b/i.test(file.text));
  const e2ePath = 'scripts/runtime/e2e.mjs';
  const e2eSource = read(e2ePath);
  const e2eCalls = [...e2eSource.matchAll(/\.callTool\(\s*["']([^"']+)["']/g)].map(match => ({ name: match[1], path: e2ePath, line: e2eSource.slice(0, match.index).split('\n').length }));
  const caveats = JSON.parse(read('scripts/product-reality/s193-tool-caveats.json'));
  const rows = names.map(name => {
    const spec = toolSpecs.get(name); assert(spec, `No ToolSpec for ${name}`); assert.equal(typeof descriptions[name], 'string');
    const inputSchemaPath = path.posix.join('packages/mcp-server/src', spec.schema);
    const inputBytes = read(inputSchemaPath); const inputSchema = JSON.parse(inputBytes);
    const advertisedClaim = { description: descriptions[name], inputSchemaDescription: inputSchema.description ?? '' };
    const tests = Object.fromEntries(TIERS.slice(0, 3).map(tier => [tier, []]));
    for (const item of allImports.filter(item => item.tool === name)) {
      const tier = item.path.includes('/test/product-reality/') ? 'product-reality' : item.path.includes('/test/contracts/') ? 'contract' : 'unit';
      const { tool: _tool, ...ref } = item; tests[tier].push(ref);
    }
    const needle = name.includes('.') ? new RegExp(`(?<![A-Za-z0-9_])(?:${quote(name)}|${quote(name.replaceAll('.', '_'))})(?![A-Za-z0-9_])`) : new RegExp('`' + name + '(?:[._][a-zA-Z]+)?`');
    const receiptRefs = readmes.flatMap(file => file.text.split('\n').flatMap((text, line) => needle.test(text) ? [{ path: file.path, line: line + 1, kind: 'readme-reference', verifiedReceipt: false }] : []));
    const structuredCaveats = (caveats[name] ?? []).map(caveat => {
      const lines = read(caveat.file).split('\n'); const matches = lines.flatMap((line, index) => line.includes(caveat.anchor) ? [index + 1] : []);
      assert.equal(matches.length, 1, `Caveat anchor must be unique: ${name} ${caveat.anchor}`);
      const { anchor: _anchor, ...rest } = caveat;
      return { ...rest, line: matches[0] };
    });
    const portableE2ERefs = e2eCalls.filter(call => call.name === name.replaceAll('.', '_')).map(({ name: _name, ...ref }) => ref);
    return { name, registration: registry.auto.includes(name) ? 'auto' : 'on-demand', advertisedClaim, claimHash: hash(serialize(advertisedClaim)), inputSchemaPath, inputSchemaHash: hash(inputBytes), proofTier: TIERS.find(tier => tests[tier]?.length) ?? 'none', testImports: tests, receiptRefs, portableE2E: portableE2ERefs.length > 0, portableE2ERefs, caveats: structuredCaveats };
  });
  const byTier = population => Object.fromEntries(TIERS.map(tier => [tier, population.filter(row => row.proofTier === tier).length]));
  return { schemaVersion: '1.0.0', head, builderSelfCertified: false, methodology: { proofTier: 'Highest location tier of a literal runtime import of a handler-bearing module in mcp-server test/spec sources. Grouped action imports roll up to their registered family. Imports are source evidence, not proof of invocation, passing execution or browser certification. Transitive imports and constructed imports/dispatch are not followed; type-only and schema-only imports do not promote a tier.', receiptRefs: 'README references in product-reality directories containing browser/packed/runtime/SVG/screenshot prose. Current census reports are excluded. References are discovery pointers, never verified receipts or tier promotions.', portableE2E: 'Literal callTool names in scripts/runtime/e2e.mjs; source coverage only, not a claim this census executed the portable E2E.' }, summary: { entries: rows.length, auto: registry.auto.length, onDemand: registry.onDemand.length, byTier: byTier(rows), autoByTier: byTier(rows.filter(row => row.registration === 'auto')), onDemandByTier: byTier(rows.filter(row => row.registration === 'on-demand')), portableE2E: rows.filter(row => row.portableE2E).length }, rows };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const headIndex = process.argv.indexOf('--head');
  const head = headIndex < 0 ? execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim() : process.argv[headIndex + 1];
  const ledger = deriveToolTruth({ head });
  if (process.argv.includes('--check')) assert.equal(fs.readFileSync(path.join(ROOT, LEDGER_PATH), 'utf8'), serialize(ledger));
  else fs.writeFileSync(path.join(ROOT, LEDGER_PATH), serialize(ledger));
  console.log(serialize({ head, ...ledger.summary }));
}
