#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = resolve(__dirname, '..');
const tailwindPath = join(packageRoot, 'dist', 'tailwind', 'tokens.json');
const esmEntryPath = join(packageRoot, 'dist', 'index.js');
const cjsEntryPath = join(packageRoot, 'dist', 'index.cjs');
const dtsEntryPath = join(packageRoot, 'dist', 'index.d.ts');
const scopedVariablesPath = join(packageRoot, 'dist', 'css-variables-by-scope.json');

// Resolve the generated CSS cascade, including the semantic brand bridge. Reading
// only each Style Dictionary's flattened values misses that bridge and incorrectly
// keeps --sys-* on the neutral root palette. No CSS or legacy flat bytes are changed.
function scopedCssVariables(css) {
  const blocks = new Map();
  for (const match of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    const declarations = Object.fromEntries(match[2].split(';').flatMap(line => {
      const colon = line.indexOf(':');
      const name = line.slice(0, colon).trim();
      return colon >= 0 && name.startsWith('--') ? [[name, line.slice(colon + 1).trim()]] : [];
    }));
    for (const selector of match[1].split(',').map(value => value.trim())) {
      blocks.set(selector, { ...blocks.get(selector), ...declarations });
    }
  }
  if (!blocks.has(':root')) throw new Error('Generated token CSS has no :root block.');
  return Object.fromEntries(['A', 'B'].map(brand => [brand,
    Object.fromEntries(['light', 'dark', 'hc'].map(theme => {
      const selector = `[data-brand='${brand}'][data-theme='${theme}']`;
      if (!blocks.has(selector)) throw new Error(`Generated token CSS is missing ${selector}.`);
      const variables = { ...blocks.get(':root'), ...blocks.get(`[data-brand='${brand}'][data-theme='base']`), ...blocks.get(selector) };
      const resolved = new Map();
      const resolveVariable = (name, visited = new Set()) => {
        if (resolved.has(name)) return resolved.get(name);
        if (visited.has(name)) throw new Error(`Cyclic CSS token reference: ${name}.`);
        if (!(name in variables)) throw new Error(`Missing CSS token reference: ${name}.`);
        const next = new Set([...visited, name]);
        const value = variables[name].replace(/var\(\s*(--[\w-]+)\s*\)/g, (_match, reference) => resolveVariable(reference, next));
        if (value.includes('var(')) throw new Error(`Unresolved CSS token reference: ${name}.`);
        resolved.set(name, value);
        return value;
      };
      // Keep the legacy bundle's canonical --oods-* names while resolving the
      // emitted CSS's reserved --sys/--theme/--ref/--cmp namespaces.
      return [theme, Object.fromEntries(Object.keys(variables).sort().map(name => [
        name.startsWith('--oods-') ? name : `--oods-${name.slice(2)}`, resolveVariable(name),
      ]))];
    })),
  ]));
}

const ensureDirectory = async (filePath) => {
  await fs.mkdir(dirname(filePath), { recursive: true });
};

const readTokensJson = async () => {
  try {
    const raw = await fs.readFile(tailwindPath, 'utf-8');
    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('tokens.json must export an object');
    }

    const { tokens, flat, cssVariables, meta, prefix } = parsed;

    if (!tokens || !flat || !cssVariables) {
      throw new Error(
        'tokens.json is missing one of "tokens", "flat", or "cssVariables" keys',
      );
    }

    return {
      tokens,
      flatTokens: flat,
      cssVariables,
      meta: meta ?? {},
      prefix: typeof prefix === 'string' ? prefix : 'oods',
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(
        'tokens.json not found. Run "pnpm --filter @oods/tokens run build" before packaging.',
      );
    }

    throw error;
  }
};

const buildEsmModule = () =>
  [
    "import tokensJson from './tailwind/tokens.json' with { type: 'json' };",
    "import cssVariablesByScope from './css-variables-by-scope.json' with { type: 'json' };",
    'const source = tokensJson ?? {};',
    'const tokens = source.tokens ?? {};',
    'const flatTokens = source.flat ?? {};',
    'const cssVariables = source.cssVariables ?? {};',
    'const meta = source.meta ?? {};',
    "const prefix = source.prefix ?? 'oods';",
    '',
    'export { tokens, flatTokens, cssVariables, cssVariablesByScope, meta, prefix };',
    'export default { tokens, flatTokens, cssVariables, cssVariablesByScope, meta, prefix };',
    '',
  ].join('\n');

const buildCjsModule = () =>
  [
    "'use strict';",
    '',
    "const tokensJson = require('./tailwind/tokens.json');",
    "const cssVariablesByScope = require('./css-variables-by-scope.json');",
    '',
    'const tokens = tokensJson.tokens;',
    'const flatTokens = tokensJson.flat;',
    'const cssVariables = tokensJson.cssVariables;',
    'const meta = tokensJson.meta ?? {};',
    "const prefix = tokensJson.prefix ?? 'oods';",
    '',
    'module.exports = {',
    '  tokens,',
    '  flatTokens,',
    '  cssVariables,',
    '  cssVariablesByScope,',
    '  meta,',
    '  prefix,',
    '  default: { tokens, flatTokens, cssVariables, cssVariablesByScope, meta, prefix },',
    '};',
    '',
  ].join('\n');

const buildTypeDefinitions = () =>
  [
    'export interface TokenMeta {',
    "  generatedAt: string;",
    "  tool: string;",
    "  version: string;",
    "  platform: string;",
    '}',
    '',
    'export interface FlatTokenEntry {',
    '  name?: string;',
    '  value: unknown;',
    '  type?: string;',
    '  path?: string[];',
    '  cssVariable: string;',
    '  originalValue?: unknown;',
    '  description?: string;',
    '  [key: string]: unknown;',
    '}',
    '',
    'export type TokenTree = Record<string, unknown>;',
    '',
    'export declare const tokens: TokenTree;',
    'export declare const flatTokens: Record<string, FlatTokenEntry>;',
    'export declare const cssVariables: Record<string, string>;',
    "export declare const cssVariablesByScope: Record<'A' | 'B', Record<'light' | 'dark' | 'hc', Record<string, string>>>;",
    'export declare const meta: Partial<TokenMeta>;',
    'export declare const prefix: string;',
    'declare const bundle: {',
    '  tokens: typeof tokens;',
    '  flatTokens: typeof flatTokens;',
    '  cssVariables: typeof cssVariables;',
    '  cssVariablesByScope: typeof cssVariablesByScope;',
    '  meta: typeof meta;',
    '  prefix: typeof prefix;',
    '};',
    'export default bundle;',
    '',
  ].join('\n');

const main = async () => {
  const tokensJson = await readTokensJson();
  const scopes = scopedCssVariables(await fs.readFile(join(packageRoot, 'dist', 'css', 'tokens.css'), 'utf8'));

  await ensureDirectory(esmEntryPath);
  await ensureDirectory(cjsEntryPath);
  await ensureDirectory(dtsEntryPath);

  await Promise.all([
    fs.writeFile(scopedVariablesPath, JSON.stringify(scopes, null, 2) + '\n', 'utf-8'),
    fs.writeFile(esmEntryPath, buildEsmModule(), 'utf-8'),
    fs.writeFile(cjsEntryPath, buildCjsModule(tokensJson), 'utf-8'),
    fs.writeFile(dtsEntryPath, buildTypeDefinitions(), 'utf-8'),
  ]);
};

main().catch((error) => {
  console.error('[@oods/tokens] Failed to build entry points');
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
