/**
 * s200-m02 placed-chart migration: the eight placed chart assets (Subscription, Invoice, Usage,
 * Relationship × React, Vue) re-render at 720×400. Each row records the asset hash generated
 * from the base head's source (BASE_ROOT, the same generator against 8d37b175b) and the hash
 * generated now, with the new pixels retained. The Subscription HC pair extends the recorded
 * chain (sprint-195 → 196 → 197) that chart-placement-codegen.s195.spec.ts follows.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../..');
const out = path.join(root, 'artifacts/product-reality/sprint-200/m02/placement');
const base = process.env.BASE_ROOT;
assert(base, 'BASE_ROOT must point at the base head source extraction');
const sha = (text: string) => `sha256:${createHash('sha256').update(text).digest('hex')}`;
const load = async (source: string) => ({
  compose: (await import(`${source}/packages/mcp-server/src/tools/design.compose.js`)).handle,
  generate: (await import(`${source}/packages/mcp-server/src/tools/code.generate.js`)).handle,
});
const current = await load(root);
const previous = await load(base);
const s197 = JSON.parse(fs.readFileSync(path.join(root, 'artifacts/product-reality/sprint-197/m05/consumers/migration.json'), 'utf8'));
const cases = [
  ...['Subscription', 'Invoice', 'Usage', 'Relationship'].flatMap(object => ['react', 'vue'].map(framework => ({ object, framework, theme: 'light' as const }))),
  ...['react', 'vue'].map(framework => ({ object: 'Subscription', framework, theme: 'hc' as const })),
];
const rows = [];
for (const item of cases) {
  const options = item.theme === 'hc' ? { theme: 'hc' as const, brand: 'A' as const } : { styling: 'tokens' as const, typescript: true };
  const [before, after] = await Promise.all([previous, current].map(async api => {
    const composed = await api.compose({ object: item.object, context: 'detail' });
    assert.equal(composed.status, 'ok');
    const result = await api.generate({ schema: composed.schema, framework: item.framework, profile: 'build', options });
    assert.equal(result.status, 'ok', JSON.stringify(result.errors));
    return result.artifact.files.filter((file: any) => file.path.endsWith('.svg'));
  }));
  assert.deepEqual(after.map((file: any) => file.path), before.map((file: any) => file.path));
  for (const asset of after) {
    const prior = before.find((file: any) => file.path === asset.path);
    const caseId = `${item.object}-detail-${item.framework}${item.theme === 'hc' ? '-hc' : ''}`;
    const raw = `raw/${caseId}/${asset.path}`;
    fs.mkdirSync(path.dirname(path.join(out, raw)), { recursive: true });
    fs.writeFileSync(path.join(out, raw), asset.contents);
    const width = Number(asset.contents.match(/^<svg[^>]*\bwidth="(\d+)"/)![1]);
    const beforeWidth = Number(prior.contents.match(/^<svg[^>]*\bwidth="(\d+)"/)![1]);
    const chained = item.theme === 'hc' ? s197.placements.find((row: any) => row.case === `${item.object}-detail-${item.framework}` && row.path === asset.path) : undefined;
    if (chained) assert.equal(chained.afterHash, prior.contentHash, `${caseId}: the sprint-197 after hash must be the base head asset`);
    assert.equal(sha(asset.contents), asset.contentHash);
    rows.push({ case: caseId, object: item.object, framework: item.framework, theme: item.theme, path: asset.path, beforeHash: prior.contentHash, afterHash: asset.contentHash, raw,
      beforeWidth, afterWidth: width, changed: prior.contentHash !== asset.contentHash, sameOperand: true, chainedFrom: chained ? 'artifacts/product-reality/sprint-197/m05/consumers/migration.json' : null,
      reason: 'chart-assets PLACED_CHART_SIZE 720x400; the preview caps the SVG at its rendered width' });
  }
}
// The five Usage requests recorded by the sprint-196 temporal migration (detail html/react/vue, workflow react/vue)
// regenerate as recorded, so temporal-placement-migration.s196.spec.ts can chain this layer from the palette layer.
const chicago = JSON.parse(fs.readFileSync(path.join(root, 'artifacts/product-reality/sprint-196/m05/placement/chicago/measurements.json'), 'utf8'));
for (const recorded of chicago.rows.filter((row: any) => row.id.startsWith('Usage-'))) {
  const [before, after] = await Promise.all([previous, current].map(async api => {
    const result = await api.generate(structuredClone(recorded.request));
    assert.equal(result.status, 'ok', `${recorded.id}: ${JSON.stringify(result.errors)}`);
    return result.artifact.files.filter((file: any) => file.path.endsWith('.svg'));
  }));
  assert.deepEqual(after.map((file: any) => file.path), before.map((file: any) => file.path));
  for (const asset of after) {
    const prior = before.find((file: any) => file.path === asset.path);
    const chained = s197.placements.find((row: any) => row.case === recorded.id && row.path === asset.path);
    assert(chained, `${recorded.id} ${asset.path}: missing from the sprint-197 palette migration`);
    assert.equal(chained.afterHash, prior.contentHash, `${recorded.id} ${asset.path}: the sprint-197 after hash must be the base head asset`);
    const raw = `raw/${recorded.id}/${asset.path}`;
    fs.mkdirSync(path.dirname(path.join(out, raw)), { recursive: true });
    fs.writeFileSync(path.join(out, raw), asset.contents);
    assert.equal(sha(asset.contents), asset.contentHash);
    rows.push({ case: recorded.id, object: 'Usage', framework: recorded.request.framework, theme: recorded.request.options?.theme ?? 'light', path: asset.path,
      beforeHash: prior.contentHash, afterHash: asset.contentHash, raw,
      beforeWidth: Number(prior.contents.match(/^<svg[^>]*\bwidth="(\d+)"/)![1]), afterWidth: Number(asset.contents.match(/^<svg[^>]*\bwidth="(\d+)"/)![1]),
      changed: prior.contentHash !== asset.contentHash, sameOperand: true, source: recorded.source, requestSha256: recorded.requestSha256,
      chainedFrom: 'artifacts/product-reality/sprint-197/m05/consumers/migration.json', reason: 'chart-assets PLACED_CHART_SIZE 720x400; the preview caps the SVG at its rendered width' });
  }
}
assert(rows.every(row => row.changed && row.afterWidth >= 720 && row.beforeWidth <= 370), 'every placed asset must move once to the 720 frame');
const report = { schemaVersion: '1.0.0', missionId: 's200-m02', builderSelfCertified: false, baseHead: '8d37b175b76ec9eb0012d86c831499d3113da722',
  implementationHead: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  method: 'before = the same generator run from a git archive of the base head with the current built dependencies linked; after = the working tree; public viz.render untouched',
  placements: rows };
fs.writeFileSync(path.join(out, 'migration.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ placements: rows.length, widths: [...new Set(rows.map(row => `${row.beforeWidth}->${row.afterWidth}`))] }));
