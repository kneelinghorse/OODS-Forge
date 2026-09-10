// Read-only diagnostic of the locked baseline, before any producer changes.
// This inventories references; local declarations are not proof of selector coverage.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { cssVariablesByScope } from '@oods/tokens';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const out = path.dirname(fileURLToPath(import.meta.url));
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const files = ['components.css', 'components-ported.css'].map(name => `packages/component-styles/src/${name}`);

// Balance functions so a nested var() is retained and its own fallback is distinct
// from the enclosing call's fallback. Ignore comments and quoted strings.
export function callsIn(source) {
  const text = source.replace(/\/\*[\s\S]*?\*\//g, comment => comment.replace(/[^\n]/g, ' '));
  const calls = [];
  let quote = null;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '\\') { i++; continue; }
    if (quote) { if (text[i] === quote) quote = null; continue; }
    if (text[i] === '"' || text[i] === "'") { quote = text[i]; continue; }
    if (!text.startsWith('var(', i)) continue;
    const nameMatch = /^var\(\s*(--[\w-]+)\s*/.exec(text.slice(i));
    assert(nameMatch, `Malformed var() at offset ${i}`);
    let depth = 1, end = i + 4, innerQuote = null;
    for (; end < text.length && depth; end++) {
      if (text[end] === '\\') { end++; continue; }
      if (innerQuote) { if (text[end] === innerQuote) innerQuote = null; continue; }
      if (text[end] === '"' || text[end] === "'") { innerQuote = text[end]; continue; }
      if (text[end] === '(') depth++;
      else if (text[end] === ')') depth--;
    }
    assert.equal(depth, 0, `Unclosed var() at offset ${i}`);
    const remainder = text.slice(i + nameMatch[0].length, end - 1).trim();
    assert(!remainder || remainder.startsWith(','));
    calls.push({ name: nameMatch[1], fallback: remainder ? remainder.slice(1).trim() : null,
      line: text.slice(0, i).split('\n').length, expression: text.slice(i, end) });
  }
  return calls;
}

assert.deepEqual(callsIn('/* var(--ignored) */ color: var(--outer, var(--inner, Canvas));').map(({ name, fallback }) => ({ name, fallback })), [
  { name: '--outer', fallback: 'var(--inner, Canvas)' }, { name: '--inner', fallback: 'Canvas' },
]);
assert.equal(callsIn('content: "var(--not-a-reference)"; width: var(--width);')[0].name, '--width');

const sources = files.map(file => {
  const bytes = fs.readFileSync(path.join(root, file));
  const baseBytes = execFileSync('git', ['show', `5fdf8a18:${file}`], { cwd: root });
  const planningBytes = execFileSync('git', ['show', `70e41570:${file}`], { cwd: root });
  assert(bytes.equals(baseBytes) && bytes.equals(planningBytes), `${file}: baseline source changed`);
  return { file, sha256: hash(bytes), deliveredBaseSha256: hash(baseBytes), planningHeadSha256: hash(planningBytes),
    text: bytes.toString('utf8'), calls: callsIn(bytes.toString('utf8')).map(call => ({ file, ...call })) };
});
const calls = sources.flatMap(source => source.calls);
const references = [...new Set(calls.map(call => call.name))].sort();
const local = new Set(sources.flatMap(source => [...source.text.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(--[\w-]+)\s*:/g)].map(match => match[1])));
const cssPath = path.join(root, 'packages/tokens/dist/css/tokens.css');
const emitted = new Set([...fs.readFileSync(cssPath, 'utf8').matchAll(/(--[\w-]+)\s*:/g)].map(match => match[1]));
const scopes = [];
for (const [brand, themes] of Object.entries(cssVariablesByScope)) for (const [theme, exported] of Object.entries(themes)) {
  // build-entry.mjs deliberately prefixes legacy JS names, while CSS preserves
  // the ref/theme/sys/cmp namespaces. Use its inverse rather than counting zero.
  const tokens = new Map(Object.entries(exported).map(([name, value]) => [name.replace(/^--oods-(?=(?:ref|theme|sys|cmp)-)/, '--'), value]));
  const rows = references.map(name => ({ name,
    classification: tokens.has(name) ? 'token-defined' : local.has(name) ? 'local' : 'unresolved',
    references: calls.filter(call => call.name === name),
  }));
  const unresolved = rows.filter(row => row.classification === 'unresolved');
  const tokenNames = rows.filter(row => row.classification === 'token-defined').map(row => row.name);
  assert.deepEqual(tokenNames, references.filter(name => emitted.has(name)), 'JS scope and emitted CSS definitions differ');
  scopes.push({ brand, theme, counts: { referenced: references.length, tokenDefined: tokenNames.length,
    local: rows.filter(row => row.classification === 'local').length, unresolved: unresolved.length,
    driftedSys: unresolved.filter(row => row.name.startsWith('--sys-')).length,
    unresolvedNamesWithNoFallback: unresolved.filter(row => row.references.some(call => call.fallback === null)).length },
    unresolvedNamesWithNoFallback: unresolved.filter(row => row.references.some(call => call.fallback === null)).map(row => row.name), rows });
}
assert.equal(scopes.length, 6);
assert(scopes.every(scope => JSON.stringify(scope.counts) === JSON.stringify(scopes[0].counts)));
const locked = { referenced: 174, tokenDefined: 42, local: 52, unresolved: 80, driftedSys: 7, unresolvedNamesWithNoFallback: 1 };
const measured = scopes[0].counts;
const differences = Object.keys(locked).filter(key => locked[key] !== measured[key]).map(key => ({ metric: key, locked: locked[key], measured: measured[key] }));
const report = { observedAt: new Date().toISOString(), sourceHead: git('rev-parse', 'HEAD'),
  deliveredBase: git('rev-parse', '5fdf8a18'), planningHead: git('rev-parse', '70e41570'),
  sources: sources.map(({ text, calls, ...identity }) => identity), tokenCssSha256: hash(fs.readFileSync(cssPath)),
  status: differences.length ? 'locked-baseline-mismatch' : 'passed', locked, measured, differences,
  systemColourFallbacks: { measured: null, reason: 'Reachability census not implemented in this inventory-only diagnostic; the locked reference denominator already fails. Syntactic occurrences are not reported as reachable fallbacks.' }, scopes };
fs.writeFileSync(path.join(out, 'baseline-census.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ status: report.status, measured, differences }, null, 2));
if (process.argv.includes('--check-locked') && differences.length) process.exitCode = 1;
