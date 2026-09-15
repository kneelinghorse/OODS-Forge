/**
 * s202-m01 placed-chart migration: every placed chart asset (Subscription, Invoice, Usage, Relationship × React,
 * Vue; the Subscription HC pair; the five Usage temporal requests) re-renders without a painted title and gains a
 * narrow render. Each row records the asset hash generated from the base head's source (BASE_ROOT, the same
 * generator against 04182b116) and the hash generated now, with the new pixels retained, chained from the
 * sprint-200 frame layer that chart-placement-codegen.s195.spec.ts follows.
 *   BASE_ROOT=<git archive of 04182b116 with node_modules linked> pnpm exec tsx scripts/product-reality/s202-placement-migration.ts
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../..');
const out = path.join(root, 'artifacts/product-reality/sprint-202/m01/placement');
const base = process.env.BASE_ROOT;
assert(base, 'BASE_ROOT must point at the base head source extraction');
const sha = (text: string) => `sha256:${createHash('sha256').update(text).digest('hex')}`;
const width = (svg: string) => Number(svg.match(/^<svg[^>]*\bwidth="(\d+)"/)![1]);
const paintsTitle = (svg: string, title: string) => svg.includes('role-title-text') || [...svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)].some(match => match[1]!.replace(/<\/?tspan\b[^>]*>/g, '').trim() === title);
const load = async (source: string) => ({
  compose: (await import(`${source}/packages/mcp-server/src/tools/design.compose.js`)).handle,
  generate: (await import(`${source}/packages/mcp-server/src/tools/code.generate.js`)).handle,
});
const current = await load(root);
const previous = await load(base);
const resizedRoot = 'artifacts/product-reality/sprint-200/m02/placement';
const s200 = JSON.parse(fs.readFileSync(path.join(root, resizedRoot, 'migration.json'), 'utf8'));
const cases = [
  ...['Subscription', 'Invoice', 'Usage', 'Relationship'].flatMap(object => ['react', 'vue'].map(framework => ({ object, framework, theme: 'light' as const }))),
  ...['react', 'vue'].map(framework => ({ object: 'Subscription', framework, theme: 'hc' as const })),
];
const rows: Array<Record<string, unknown>> = [];
const retain = (raw: string, contents: string) => { fs.mkdirSync(path.dirname(path.join(out, raw)), { recursive: true }); fs.writeFileSync(path.join(out, raw), contents); };
const record = (caseId: string, meta: Record<string, unknown>, before: Array<{ path: string; contents: string; contentHash: string }>, after: Array<{ path: string; contents: string; contentHash: string }>, title: string) => {
  const wide = after.filter(file => !file.path.endsWith('.narrow.svg'));
  assert.deepEqual(wide.map(file => file.path), before.map(file => file.path), `${caseId}: the design-size assets keep their paths`);
  for (const asset of wide) {
    const prior = before.find(file => file.path === asset.path)!;
    const narrow = after.find(file => file.path === asset.path.replace(/\.svg$/, '.narrow.svg'));
    assert(narrow, `${caseId} ${asset.path}: no narrow render`);
    // The sprint-200 frame layer chains where the base head still carries its after hash; the placed graph moved again in
    // Sprint 201 m06 (the title band), so that asset's chain runs through the m06 chart-title receipts, not this file.
    // A recorded temporal request shares its case id with the fresh detail composition; the source tells them apart, as sprint-200 recorded them.
    const recorded = s200.placements.find((row: { case: string; path: string; source?: string }) => row.case === caseId && row.path === asset.path && row.source === meta.source);
    const chained = recorded && recorded.afterHash === prior.contentHash ? recorded : undefined;
    assert.equal(sha(asset.contents), asset.contentHash); assert.equal(sha(narrow.contents), narrow.contentHash);
    assert.equal(paintsTitle(prior.contents, title), true, `${caseId}: the base asset paints its title`);
    assert.equal(paintsTitle(asset.contents, title), false, `${caseId}: the asset still paints its title`);
    assert.equal(paintsTitle(narrow.contents, title), false, `${caseId}: the narrow render paints its title`);
    const raw = `raw/${caseId}/${asset.path}`, narrowRaw = `raw/${caseId}/${narrow.path}`;
    retain(raw, asset.contents); retain(narrowRaw, narrow.contents);
    rows.push({ case: caseId, ...meta, path: asset.path, beforeHash: prior.contentHash, afterHash: asset.contentHash, raw,
      beforeWidth: width(prior.contents), afterWidth: width(asset.contents), titleInSvgBefore: true, titleInSvgAfter: false,
      changed: prior.contentHash !== asset.contentHash, sameOperand: true, chainedFrom: chained ? `${resizedRoot}/migration.json` : null,
      ...(recorded && !chained ? { chainNote: 'the base head asset differs from the sprint-200 after hash: Sprint 201 m06 moved this chart (title band) between the two layers' } : {}),
      narrow: { path: narrow.path, afterHash: narrow.contentHash, raw: narrowRaw, width: width(narrow.contents) },
      reason: 'chart-assets titlePlacement figure: the title band left the SVG for the figure heading; a 360x220 narrow render joined it for columns of 600px or less' });
  }
};
for (const item of cases) {
  const options = item.theme === 'hc' ? { theme: 'hc' as const, brand: 'A' as const } : { styling: 'tokens' as const, typescript: true };
  let title = '';
  const [before, after] = await Promise.all([previous, current].map(async api => {
    const composed = await api.compose({ object: item.object, context: 'detail' });
    assert.equal(composed.status, 'ok');
    const chart = (function find(node: any): any { if (node.chart) return node; for (const child of node.children ?? []) { const found = find(child); if (found) return found; } })(composed.schema.screens[0]);
    title = String(chart.props?.title ?? '');
    const result = await api.generate({ schema: composed.schema, framework: item.framework, profile: 'build', options });
    assert.equal(result.status, 'ok', JSON.stringify(result.errors));
    return result.artifact.files.filter((file: any) => file.path.endsWith('.svg'));
  }));
  record(`${item.object}-detail-${item.framework}${item.theme === 'hc' ? '-hc' : ''}`, { object: item.object, framework: item.framework, theme: item.theme }, before, after, title);
}
// The five Usage requests recorded by the sprint-196 temporal migration (detail html/react/vue, workflow react/vue) regenerate as recorded.
const chicago = JSON.parse(fs.readFileSync(path.join(root, 'artifacts/product-reality/sprint-196/m05/placement/chicago/measurements.json'), 'utf8'));
for (const recorded of chicago.rows.filter((row: any) => row.id.startsWith('Usage-'))) {
  const [before, after] = await Promise.all([previous, current].map(async api => {
    const result = await api.generate(structuredClone(recorded.request));
    assert.equal(result.status, 'ok', `${recorded.id}: ${JSON.stringify(result.errors)}`);
    return result.artifact.files.filter((file: any) => file.path.endsWith('.svg'));
  }));
  const chart = (function find(node: any): any { if (node.chart) return node; for (const child of node.children ?? []) { const found = find(child); if (found) return found; } })(recorded.request.schema.screens[0]);
  record(recorded.id, { object: 'Usage', framework: recorded.request.framework, theme: recorded.request.options?.theme ?? 'light', source: recorded.source, requestSha256: recorded.requestSha256 }, before, after, String(chart?.props?.title ?? ''));
}
assert(rows.every(row => row.changed && row.afterWidth === row.beforeWidth), 'every placed asset must move once, keeping its frame');
const report = { schemaVersion: '1.0.0', missionId: 's202-m01', builderSelfCertified: false, baseHead: '04182b116703088773ab7e414c6d7d6721c6c24e',
  implementationHead: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), dirty: execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim().length > 0,
  method: 'before = the same generator run from a git archive of the base head with the current built dependencies linked; after = the working tree; public viz.render default placement untouched',
  placements: rows };
fs.writeFileSync(path.join(out, 'migration.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ placements: rows.length, changed: rows.filter(row => row.changed).length, narrowWidths: [...new Set(rows.map(row => (row.narrow as { width: number }).width))] }));
