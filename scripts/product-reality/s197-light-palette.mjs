// Attribute light-palette paint inputs before the single m05 golden migration.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import Color from 'colorjs.io';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const before = 'artifacts/product-reality/sprint-197/m01';
const out = 'artifacts/product-reality/sprint-197/m02';
const baseline = read(`${before}/baseline.json`);
const oldScopes = read(`${before}/before/cssVariablesByScope.json`);
const current = createRequire(import.meta.url)(path.join(root, 'packages/tokens/dist/index.cjs')).cssVariablesByScope;
const emit = (name, value) => {
  const text = JSON.stringify(value, null, 2) + '\n';
  if (process.argv.includes('--check')) assert.equal(fs.readFileSync(path.join(root, out, name), 'utf8'), text, `Stale ${name}`);
  else fs.writeFileSync(path.join(root, out, name), text);
};
const leaves = (node, trail = []) => node && typeof node === 'object' && !Array.isArray(node)
  ? ('$value' in node ? [[trail.join('.'), node.$value]] : Object.entries(node).filter(([key]) => !key.startsWith('$')).flatMap(([key, value]) => leaves(value, [...trail, key]))) : [];
const sourceFiles = ['base/reference/color.brand.json', 'base/reference/color.neutral.json', 'base/reference/color.status.json', 'brands/A/base.json', 'brands/B/base.json'].map(file => `packages/tokens/src/tokens/${file}`);
const ramps = sourceFiles.map(file => {
  const old = JSON.parse(execFileSync('git', ['show', `${baseline.beforeHead}:${file}`], { cwd: root, encoding: 'utf8' }));
  const previous = new Map(leaves(old));
  const bytes = fs.readFileSync(path.join(root, file));
  return { file, beforeSha256: sha(Buffer.from(execFileSync('git', ['show', `${baseline.beforeHead}:${file}`], { cwd: root }))), afterSha256: sha(bytes),
    tokens: leaves(JSON.parse(bytes)).map(([token, after]) => ({ token, before: previous.get(token) ?? null, after,
      classification: previous.has(token) ? (previous.get(token) === after ? 'unchanged' : 'palette-value') : 'reference-step-added' })) };
});
emit('ramps.json', { beforeHead: baseline.beforeHead, files: ramps });

const changedTokens = [];
const hex = value => { try { return new Color(value).to('srgb').toString({ format: 'hex', collapse: false }).toLowerCase(); } catch { return null; } };
for (const brand of ['A', 'B']) {
  for (const [token, value] of Object.entries(oldScopes[brand].light)) {
    if (!token.startsWith('--oods-sys-') && !token.startsWith('--oods-theme-') && !token.startsWith(`--oods-color-brand-${brand.toLowerCase()}-`)) continue;
    const after = current[brand].light[token];
    const oldHex = hex(value);
    if (after === value || !oldHex || !hex(after)) continue;
    changedTokens.push({ id: `${brand}/light/${token}`, brand, token, before: value, after, beforeHex: oldHex, afterHex: hex(after) });
  }
}
const paints = new Map();
for (const token of changedTokens) {
  if (!paints.has(token.beforeHex)) paints.set(token.beforeHex, []);
  paints.get(token.beforeHex).push(token.id);
}
const goldenFiles = baseline.trackedFiles.filter(row => ['svg', 'snapshot'].includes(row.class)).map(row => {
  const bytes = fs.readFileSync(path.join(root, row.path));
  assert.equal(sha(bytes), row.sha256, `Golden changed before m05: ${row.path}`);
  const found = new Set((bytes.toString().match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|oklch\([^)]*\)/g) ?? []).map(hex).filter(Boolean));
  const matches = [...found].filter(paint => paints.has(paint)).sort().map(paint => ({ paint, changedTokenIds: paints.get(paint) }));
  return { path: row.path, class: row.class, beforeSha256: row.sha256, retainedSha256: sha(bytes),
    status: matches.length ? 'matches-changed-light-paint' : 'no-matching-changed-light-paint', matches };
});
const registryScopes = [];
for (const file of ['packages/viz-core/src/registry/viz-recipes.v1.json', 'packages/viz-core/src/registry/viz-patterns.v1.json']) {
  const bytes = fs.readFileSync(path.join(root, file));
  assert.equal(sha(bytes), baseline.trackedFiles.find(row => row.path === file).sha256, `Registry changed before m05: ${file}`);
  for (const [index, row] of JSON.parse(bytes).entries()) {
    const field = row.renderScopes ? 'renderScopes' : 'scopes';
    for (const [scopeIndex, scope] of (row[field] ?? []).entries()) {
      if (scope.theme !== 'light' || !scope.svgHash) continue;
      registryScopes.push({ file, pointer: `/${index}/${field}/${scopeIndex}/svgHash`, identity: row.chartType ?? row.id,
        brand: scope.brand, beforeHash: scope.svgHash, status: 'remeasure-in-m05',
        changedTokenIds: changedTokens.filter(token => token.brand === scope.brand).map(token => token.id) });
    }
  }
}
const cert = baseline.certifiedMatrix.path;
assert.equal(sha(fs.readFileSync(path.join(root, cert))), baseline.trackedFiles.find(row => row.path === cert).sha256, 'Certified matrix changed before m05');
emit('attribution.json', { missionId: 's197-m02', builderSelfCertified: false, beforeHead: baseline.beforeHead,
  method: 'Match retained golden paint literals to changed exported light semantic tokens. Matches identify palette inputs, not newly measured SVG hashes. Absence of a match is not proof of output identity. All old goldens and registry pins remain unchanged; the full palette is re-rendered and hashes migrate once in m05.',
  sourceFiles: ramps.map(({ file, beforeSha256, afterSha256 }) => ({ file, beforeSha256, afterSha256 })),
  changedTokens, goldenFiles, registryScopes, certifiedMatrix: { ...baseline.certifiedMatrix, status: 'remeasure-in-m05' },
  summary: { sourceFiles: ramps.length, changedLightTokens: changedTokens.length, goldenFiles: goldenFiles.length,
    filesMatchingChangedPaint: goldenFiles.filter(row => row.matches.length).length, lightRegistryScopes: registryScopes.length, goldensUpdated: 0 } });
console.log(JSON.stringify({ changedLightTokens: changedTokens.length, goldenFiles: goldenFiles.length, filesMatchingChangedPaint: goldenFiles.filter(row => row.matches.length).length, lightRegistryScopes: registryScopes.length, goldensUpdated: 0 }));
