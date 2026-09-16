import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerPreviewHost } from '../../../mcp-bridge/src/preview/host.js';
import { getAjv } from '../../src/lib/ajv.js';
import { listVersions, readVersion, resolveCompositionsDir } from '../../src/lib/composition-store.js';
import { getDefinition } from '../../src/errors/registry.js';
import outputSchema from '../../src/schemas/design.preview.output.json' with { type: 'json' };
import { handle as certify } from '../../src/tools/artifact.certify.js';
import { handle as generate } from '../../src/tools/code.generate.js';
import { handle as compose } from '../../src/tools/design.compose.js';
import { handle as render } from '../../src/tools/viz.render.js';
import { placedChartRequests } from '../../src/codegen/chart-assets.js';
import { workflowSampleRecords } from '../../src/codegen/workflow-data-emitter.js';
import { handle as preview, resolvePreviewHostUrl } from '../../src/tools/design.preview.js';
import { loadToolRegistry } from '../../src/tools/registry.js';

const root = path.resolve(fileURLToPath(import.meta.url), '../../../../..');
const runtimeDir = path.join(root, 'packages/mcp-bridge/dist/preview-runtime');
const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');
let storeRoot: string;
const servers: FastifyInstance[] = [];

async function host(compositionsDir: string): Promise<string> {
  const server = Fastify();
  servers.push(server);
  await registerPreviewHost(server, { compositionsDir, runtimeDir });
  await server.listen({ port: 0, host: '127.0.0.1' });
  const address = server.server.address();
  return `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;
}

beforeEach(() => {
  storeRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-design-preview-'));
  vi.stubEnv('MCP_SCHEMA_STORE_ROOT', storeRoot);
  vi.stubEnv('MCP_SCHEMA_STORE_DIR', 'schemas');
  vi.stubEnv('OODS_PREVIEW_HOST_URL', '');
});
afterEach(async () => {
  vi.unstubAllEnvs();
  for (const server of servers.splice(0)) await server.close();
  fs.rmSync(storeRoot, { recursive: true, force: true });
});

describe('design.preview serves a composition version through the preview host (s201-m01/m02)', () => {
  it('composes a new composition, generates both frameworks onto version 1, and returns one running URL per framework with its lineage', async () => {
    const compositionsDir = resolveCompositionsDir();
    expect(compositionsDir).toBe(path.join(storeRoot, 'compositions'));
    const hostUrl = await host(compositionsDir);
    const result = await preview({ object: 'Subscription', context: 'card', preferences: { theme: 'dark', brand: 'B' } }, { previewHostUrl: hostUrl });
    const validate = getAjv().compile(outputSchema);
    expect(validate(result), JSON.stringify(validate.errors)).toBe(true);
    expect(result).toMatchObject({ status: 'ok', version: 1, parentVersion: null, operation: 'compose', head: null, object: 'Subscription', context: 'card', brand: 'B', theme: 'dark', host: { url: hostUrl, port: Number(new URL(hostUrl).port), compositionsDir } });
    expect(result.compositionId).toMatch(/^cmp-[a-f0-9]{12}$/);
    expect(result.previews.map(entry => entry.framework)).toEqual(['react', 'vue']);
    const base = `${hostUrl}/preview/${result.compositionId}/1`;
    expect(result.previewUrl).toBe(`${base}?framework=react&brand=B&theme=dark`);
    expect(result.recordPath).toBe(path.join(compositionsDir, result.compositionId, 'versions', '1.json'));
    // The version file is what the host reads: the schema, the deterministic model and both artifacts; no schema was saved.
    const record = await readVersion(compositionsDir, result.compositionId, 1);
    expect(record).toMatchObject({ recordVersion: '1', version: 1, parentVersion: null, operation: 'compose', schemaHash: result.schemaHash, brand: 'B', theme: 'dark', compose: { object: 'Subscription', context: 'card' } });
    expect(Object.keys(record.artifacts).sort()).toEqual(['react', 'vue']);
    expect(record.model).toHaveProperty('planName');
    expect(fs.existsSync(path.join(storeRoot, 'schemas'))).toBe(false);
    for (const entry of result.previews) {
      expect(entry.artifactContentHash).toBe(record.artifacts[entry.framework]!.artifact.contentHash);
      expect(entry.appUrl).toBe(`${base}/app?framework=${entry.framework}&brand=B&theme=dark`);
      const shell = await fetch(entry.url);
      expect(shell.status).toBe(200);
      const shellHtml = await shell.text();
      expect(shellHtml).toContain('data-oods-lineage="true"');
      expect(shellHtml).toContain(`<code>${result.compositionId}</code>`);
      expect(shellHtml).toContain('<strong>1</strong> of 1');
      const app = await fetch(entry.appUrl);
      expect(app.status).toBe(200);
      const html = await app.text();
      expect(html).toContain('<html lang="en" data-theme="dark" data-brand="B">');
      expect(html).toContain(`data-oods-preview="${result.compositionId}" data-oods-preview-version="1"`);
      const module = await fetch(entry.moduleUrl);
      expect(module.status).toBe(200);
      const code = await module.text();
      expect(`sha256:${sha256(code)}`).toBe(entry.compiled.sha256);
      expect(Buffer.byteLength(code)).toBe(entry.compiled.bytes);
    }
  });

  it('opens an existing composition version by id, reuses its artifacts, and follows lineage to a recomposed second version', async () => {
    const compositionsDir = resolveCompositionsDir();
    const hostUrl = await host(compositionsDir);
    const composed = await compose({ object: 'Subscription', context: 'card' });
    expect(composed).toMatchObject({ status: 'ok', version: 1, parentVersion: null, operation: 'compose' });
    const id = composed.compositionId!;
    expect(fs.existsSync(path.join(storeRoot, 'compositions', id, 'versions', '1.json'))).toBe(true);
    const vue = await preview({ compositionId: id, framework: 'vue' }, { previewHostUrl: hostUrl });
    expect(vue).toMatchObject({ compositionId: id, version: 1, brand: 'A', theme: 'light' });
    expect(vue.previews.map(entry => entry.framework)).toEqual(['vue']);
    expect((await fetch(`${hostUrl}/preview/${id}/1/app?framework=react`)).status).toBe(404);
    const generatedAt = (await readVersion(compositionsDir, id, 1)).artifacts.vue!.generatedAt;
    const both = await preview({ compositionId: id, version: 1 }, { previewHostUrl: hostUrl });
    expect(both.previews.map(entry => entry.framework)).toEqual(['react', 'vue']);
    expect((await readVersion(compositionsDir, id, 1)).artifacts.vue!.generatedAt).toBe(generatedAt);
    expect((await fetch(`${hostUrl}/preview/${id}/1/app?framework=react`)).status).toBe(200);
    // A second version of the same composition names its parent and operation on the page.
    const second = await compose({ object: 'Subscription', context: 'card', compositionId: id, preferences: { tabCount: 2 } });
    expect(second).toMatchObject({ status: 'ok', compositionId: id, version: 2, parentVersion: 1, operation: 'recompose' });
    const latest = await preview({ compositionId: id }, { previewHostUrl: hostUrl });
    expect(latest).toMatchObject({ compositionId: id, version: 2, parentVersion: 1, operation: 'recompose' });
    const page = await (await fetch(latest.previewUrl)).text();
    expect(page).toContain('<strong>2</strong> of 2');
    expect(page).toContain(`<a href="/preview/${id}/1?framework=react&brand=A&theme=light">version 1</a>`);
    expect(page).toContain('<code>recompose</code>');
    expect((await listVersions(compositionsDir, id)).map(entry => [entry.version, entry.parentVersion, entry.operation])).toEqual([[1, null, 'compose'], [2, 1, 'recompose']]);
    // Version 1's file did not change when version 2 was recorded.
    expect((await readVersion(compositionsDir, id, 1)).schemaHash).toBe(composed.schema && `sha256:${sha256(JSON.stringify(composed.schema))}`);
  });

  it('is typed OODS-N021 and retryable without a reachable host, OODS-N022 for an unknown version, OODS-V203 for an unsafe id, and writes nothing', async () => {
    expect(resolvePreviewHostUrl(undefined, {})).toBeUndefined();
    expect(resolvePreviewHostUrl({ previewHostUrl: 'http://127.0.0.1:4466' }, { OODS_PREVIEW_HOST_URL: 'http://127.0.0.1:1' })).toBe('http://127.0.0.1:4466');
    expect(resolvePreviewHostUrl(undefined, { OODS_PREVIEW_HOST_URL: 'http://127.0.0.1:1' })).toBe('http://127.0.0.1:1');
    await expect(preview({ object: 'Subscription', context: 'card' })).rejects.toMatchObject({ opiCode: 'OODS-N021', details: { dependency: 'preview-host', hostUrl: null } });
    await expect(preview({ object: 'Subscription', context: 'card' }, { previewHostUrl: 'http://127.0.0.1:1' })).rejects.toMatchObject({ opiCode: 'OODS-N021', details: { hostUrl: 'http://127.0.0.1:1' } });
    expect(getDefinition('OODS-N021')).toMatchObject({ category: 'not_found', retryable: true });
    expect(getDefinition('OODS-N019')).toBeUndefined();
    expect(fs.existsSync(path.join(storeRoot, 'compositions'))).toBe(false);
    const hostUrl = await host(resolveCompositionsDir());
    await expect(preview({ compositionId: 'cmp-ffffffffffff' }, { previewHostUrl: hostUrl })).rejects.toMatchObject({ opiCode: 'OODS-N022', details: { compositionId: 'cmp-ffffffffffff' } });
    await expect(preview({ compositionId: 'cmp-ffffffffffff', version: 3 }, { previewHostUrl: hostUrl })).rejects.toMatchObject({ opiCode: 'OODS-N022' });
    await expect(preview({ compositionId: '../etc/passwd' } as never, { previewHostUrl: hostUrl })).rejects.toMatchObject({ opiCode: 'OODS-V203' });
    await expect(preview({ framework: 'react' } as never, { previewHostUrl: hostUrl })).rejects.toMatchObject({ opiCode: 'OODS-V203' });
    expect(getDefinition('OODS-N022')).toMatchObject({ category: 'not_found', retryable: false });
  });

  it('refuses a host that reads a different store root instead of returning a URL that would 404', async () => {
    const elsewhere = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-other-store-'));
    try {
      const hostUrl = await host(path.join(elsewhere, 'compositions'));
      await expect(preview({ object: 'Subscription', context: 'card' }, { previewHostUrl: hostUrl })).rejects.toMatchObject({ opiCode: 'OODS-N021', details: { hostCompositionsDir: path.join(elsewhere, 'compositions'), compositionsDir: path.join(storeRoot, 'compositions') } });
      expect(fs.existsSync(path.join(storeRoot, 'compositions'))).toBe(false);
    } finally { fs.rmSync(elsewhere, { recursive: true, force: true }); }
  });

  it('advertises the same tool in the registry, both policies, the description and the generated API page', () => {
    const json = (relative: string) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
    expect(loadToolRegistry().auto).toContain('design.preview');
    expect(json('packages/mcp-server/src/security/policy.json').rules.find((row: { tool: string }) => row.tool === 'design.preview')).toMatchObject({ readOnly: true, concurrency: 1 });
    const agent = json('configs/agent/policy.json').tools.find((row: { name: string }) => row.name === 'design.preview');
    expect(agent.description).toContain('OODS-N021');
    const description = json('packages/mcp-adapter/tool-descriptions.json')['design.preview'];
    for (const phrase of ['compositionId', 'OODS-N021', 'OODS-N022', 'lineage', 'brand, theme and width controls']) expect(description).toContain(phrase);
    expect(description).not.toContain('OODS-N019');
    expect(fs.readFileSync(path.join(root, 'docs/api/design-preview.md'), 'utf8')).toContain(description);
  });

  it('action compare reports exactly the swapped slot and the artifact files it moved, and zero differences for a version against itself (s201-m03)', async () => {
    const compositionsDir = resolveCompositionsDir();
    const hostUrl = await host(compositionsDir);
    const base = await preview({ object: 'Subscription', context: 'detail' }, { previewHostUrl: hostUrl });
    expect(base.action).toBe('render');
    const id = base.compositionId;
    // Pin the metadata slot to one of the composer's own candidates on version 2 (the README's documented override).
    const swapped = await compose({ object: 'Subscription', context: 'detail', compositionId: id, preferences: { componentOverrides: { metadata: 'TagSummary' } } });
    expect(swapped).toMatchObject({ compositionId: id, version: 2, parentVersion: 1, operation: 'recompose' });
    await preview({ compositionId: id, version: 2 }, { previewHostUrl: hostUrl });
    const result = await preview({ action: 'compare', compositionId: id, version: 1, against: { version: 2 } }, { previewHostUrl: hostUrl });
    const validate = getAjv().compile(outputSchema);
    expect(validate(result), JSON.stringify(validate.errors)).toBe(true);
    expect(result.action).toBe('compare');
    if (result.action !== 'compare') throw new Error('compare output expected');
    expect(result).toMatchObject({ left: { compositionId: id, version: 1, operation: 'compose' }, right: { compositionId: id, version: 2, parentVersion: 1, operation: 'recompose' }, frameworks: ['react', 'vue'], identical: false, host: { url: hostUrl, compositionsDir } });
    expect(result.compareUrl).toBe(`${hostUrl}/compare/${id}@1/${id}@2?framework=react&brand=A&theme=light`);
    expect(Object.entries(result.diff.summary).filter(([, count]) => count > 0).map(([category]) => category)).toEqual(['slots', 'artifacts']);
    expect(result.diff.differences.filter(entry => entry.category === 'slots')).toEqual([{ category: 'slots', field: 'metadata', before: ['AuditTimeline'], after: ['TagSummary'], note: 'slot components changed' }]);
    const moved = result.diff.differences.filter(entry => entry.category === 'artifacts').map(entry => entry.field);
    expect(moved).toEqual(expect.arrayContaining(['react.contentHash', 'react.files.src/GeneratedUI.tsx', 'vue.contentHash', 'vue.files.src/GeneratedUI.vue']));
    expect(result.differenceCount).toBe(result.diff.differences.length);
    const page = await fetch(result.compareUrl);
    expect(page.status).toBe(200);
    const html = await page.text();
    expect(html).toContain(`src="/preview/${id}/1/app?framework=react&brand=A&theme=light"`);
    expect(html).toContain(`src="/preview/${id}/2/app?framework=react&brand=A&theme=light"`);
    expect(html).toContain('<ul data-oods-diff="slots">');
    expect(await (await fetch(result.diffUrl)).json()).toEqual(result.diff);
    const same = await preview({ action: 'compare', compositionId: id, version: 2, against: { version: 2 } }, { previewHostUrl: hostUrl });
    if (same.action !== 'compare') throw new Error('compare output expected');
    expect(same).toMatchObject({ identical: true, differenceCount: 0 });
    expect(same.diff.differences).toEqual([]);
    await expect(preview({ action: 'compare', compositionId: id, version: 1 } as never, { previewHostUrl: hostUrl })).rejects.toMatchObject({ opiCode: 'OODS-V203' });
    await expect(preview({ action: 'compare', compositionId: id, version: 1, against: { version: 9 } }, { previewHostUrl: hostUrl })).rejects.toMatchObject({ opiCode: 'OODS-N022' });
  });

  it('stores the generation receipt and every placed chart certification exactly as the tools return them, and names axe as not run until the page runs it (s201-m04)', async () => {
    const compositionsDir = resolveCompositionsDir();
    const hostUrl = await host(compositionsDir);
    const result = await preview({ object: 'Subscription', context: 'detail' }, { previewHostUrl: hostUrl });
    if (result.action !== 'render') throw new Error('render expected');
    const record = await readVersion(compositionsDir, result.compositionId, 1);
    const measurements = record.measurements as { validation: Record<string, unknown>; charts: Array<{ path: string; certification: Record<string, unknown>; contentHash: string; theme: string; brand: string }>; axe?: unknown };
    // The generation receipt equals what code.generate returns for the same schema and framework.
    for (const framework of ['react', 'vue'] as const) {
      const generated = await generate({ schema: record.schema, framework, profile: 'build', options: { theme: record.theme, brand: record.brand } });
      expect(measurements.validation[framework]).toEqual(generated.validationReceipt);
    }
    // Every placed chart is certified with artifact.certify on the normalized spec of the same render request.
    const requests = placedChartRequests(record.schema, { theme: record.theme, brand: record.brand });
    expect(requests.length).toBeGreaterThan(0);
    expect(measurements.charts.map(chart => chart.path)).toEqual(requests.map(request => request.path));
    // Every placed chart ships its design-size render and its narrow render; both are certified (Sprint 202 m01).
    expect(measurements.charts.flatMap(chart => [chart.path, (chart as { narrow: { path: string } }).narrow.path]).sort()).toEqual(record.artifacts.react!.artifact.files.filter(file => file.path.endsWith('.svg')).map(file => file.path).sort());
    const first = requests[0]!;
    const rendered = await render({ ...first.request, output: { ...first.request.output, svg: true, includeNormalizedSpec: true } });
    const certified = await certify({ spec: rendered.normalizedSpec as never, theme: first.request.theme as never, brand: first.request.brand as never });
    expect(measurements.charts[0]).toMatchObject({ path: first.path, contentHash: rendered.contentHash, theme: 'light', brand: 'A' });
    expect(measurements.charts[0]!.certification).toMatchObject({ status: certified.status, coverage: certified.coverage ?? null, conformant: certified.conformant ?? null, pillars: certified.pillars ?? null });
    expect(measurements.axe).toBeUndefined();
    expect(result.measured).toEqual({ validation: ['react', 'vue'], charts: { placed: requests.length, conformant: measurements.charts.filter(chart => chart.certification.conformant === true).length, notConformant: measurements.charts.filter(chart => chart.certification.conformant === false).length, uncertified: measurements.charts.filter(chart => chart.certification.conformant === null).length, scopes: ['A/light'] }, axe: [], notMeasured: ['react', 'vue'].flatMap(framework => ['A/light', 'A/dark', 'A/hc', 'B/light', 'B/dark', 'B/hc'].map(scope => `axe:${framework}:${scope}`)) });
    const page = await (await fetch(result.previewUrl)).text();
    expect(page).toContain('data-oods-measured="validation:react"');
    expect(page).toContain(`data-oods-measured="chart:${first.path}"`);
    expect(page).toContain('data-oods-not-measured="axe:react:A/light"');
    // A card without a chart records an empty certification list, never a claim.
    const card = await preview({ object: 'Subscription', context: 'card', framework: 'vue' }, { previewHostUrl: hostUrl });
    if (card.action !== 'render') throw new Error('render expected');
    expect(card.measured).toMatchObject({ validation: ['vue'], charts: { placed: 0, conformant: 0, notConformant: 0, uncertified: 0, scopes: [] }, axe: [] });
    expect((await readVersion(compositionsDir, card.compositionId, 1)).measurements.charts).toEqual([]);
  });

  it('action edit records one new version per operation with its parent and operation, never touching the parent file, and refuses what is not applicable (s201-m05)', async () => {
    const compositionsDir = resolveCompositionsDir();
    const hostUrl = await host(compositionsDir);
    const base = await preview({ object: 'Subscription', context: 'detail' }, { previewHostUrl: hostUrl });
    if (base.action !== 'render') throw new Error('render expected');
    const id = base.compositionId;
    const parentBytes = () => fs.readFileSync(path.join(compositionsDir, id, 'versions', '1.json'));
    const before = parentBytes();
    expect(base.editable.regions.map(region => region.id)).toEqual(['detail-header-1', 'detail-body-10']);
    const metadata = base.editable.slots.find(slot => slot.slotName === 'metadata')!;
    expect(metadata.candidates).toContain('TagSummary');
    expect(base.editable.fields['detail-body-10']!.slice(0, 2)).toEqual(['created_at', 'updated_at']);
    expect(base.editable.seed).toBeNull();

    // 1. Reorder the two regions: version 2 shows the body before the header, in both frameworks.
    const reordered = await preview({ action: 'edit', compositionId: id, version: 1, edit: { operation: 'reorder-region', regionOrder: ['detail-body-10', 'detail-header-1'] } }, { previewHostUrl: hostUrl });
    if (reordered.action !== 'edit') throw new Error('edit expected');
    expect(reordered).toMatchObject({ compositionId: id, version: 2, parentVersion: 1, operation: 'reorder-region', edit: { operation: 'reorder-region', parentVersion: 1 } });
    expect(reordered.editable.regions.map(region => region.id)).toEqual(['detail-body-10', 'detail-header-1']);
    const v2 = await readVersion(compositionsDir, id, 2);
    expect(v2.schema.screens[0]!.children!.map(node => node.id)).toEqual(['detail-body-10', 'detail-header-1']);
    expect(v2.compose).toMatchObject({ object: 'Subscription', context: 'detail', preferences: { regionOrder: ['detail-body-10', 'detail-header-1'] } });
    for (const framework of ['react', 'vue'] as const) {
      const source = v2.artifacts[framework]!.artifact.files[0]!.contents;
      expect(source.indexOf('detail-body-10')).toBeLessThan(source.indexOf('detail-header-1'));
      const original = (await readVersion(compositionsDir, id, 1)).artifacts[framework]!.artifact.files[0]!.contents;
      expect(original.indexOf('detail-header-1')).toBeLessThan(original.indexOf('detail-body-10'));
    }
    expect(reordered.previews.map(entry => entry.framework)).toEqual(['react', 'vue']);
    expect(parentBytes().equals(before)).toBe(true);

    // 2. Swap the metadata slot to a composer candidate: the compare view reports exactly that change.
    const swapped = await preview({ action: 'edit', compositionId: id, version: 1, edit: { operation: 'swap-slot', slot: 'metadata', component: 'TagSummary' } }, { previewHostUrl: hostUrl });
    if (swapped.action !== 'edit') throw new Error('edit expected');
    expect(swapped).toMatchObject({ version: 3, parentVersion: 1, operation: 'swap-slot' });
    expect(swapped.editable.slots.find(slot => slot.slotName === 'metadata')!.selectedComponent).toBe('TagSummary');
    const compared = await preview({ action: 'compare', compositionId: id, version: 1, against: { version: 3 } }, { previewHostUrl: hostUrl });
    if (compared.action !== 'compare') throw new Error('compare expected');
    expect(Object.entries(compared.diff.summary).filter(([, count]) => count > 0).map(([category]) => category)).toEqual(['slots', 'artifacts']);
    expect(compared.diff.differences.filter(entry => entry.category === 'slots')).toEqual([{ category: 'slots', field: 'metadata', before: ['AuditTimeline'], after: ['TagSummary'], note: 'slot components changed' }]);
    expect(parentBytes().equals(before)).toBe(true);

    // 3. Reorder the body's fields: updated_at now leads.
    const fields = await preview({ action: 'edit', compositionId: id, version: 1, edit: { operation: 'reorder-fields', region: 'detail-body-10', fieldOrder: ['updated_at', 'created_at'] } }, { previewHostUrl: hostUrl });
    if (fields.action !== 'edit') throw new Error('edit expected');
    expect(fields).toMatchObject({ version: 4, parentVersion: 1, operation: 'reorder-fields' });
    expect(fields.editable.fields['detail-body-10']!.slice(0, 2)).toEqual(['updated_at', 'created_at']);
    const fieldDiff = await preview({ action: 'compare', compositionId: id, version: 1, against: { version: 4 } }, { previewHostUrl: hostUrl });
    if (fieldDiff.action !== 'compare') throw new Error('compare expected');
    expect(fieldDiff.diff.summary.fieldOrder).toBe(1);
    expect(fieldDiff.diff.summary.slots).toBe(0);
    expect(parentBytes().equals(before)).toBe(true);

    // 4. Change the seed: the sample data changes, and nothing else in the schema.
    const seeded = await preview({ action: 'edit', compositionId: id, version: 1, edit: { operation: 'seed', seed: 'harbor-2' } }, { previewHostUrl: hostUrl });
    if (seeded.action !== 'edit') throw new Error('edit expected');
    expect(seeded).toMatchObject({ version: 5, parentVersion: 1, operation: 'seed' });
    expect(seeded.editable.seed).toBe('harbor-2');
    const v5 = await readVersion(compositionsDir, id, 5);
    const v1 = await readVersion(compositionsDir, id, 1);
    const { seed: _seed, ...v5Rest } = v5.schema as { seed?: string };
    expect(v5Rest).toEqual(v1.schema);
    expect(v5.schema.seed).toBe('harbor-2');
    expect(v5.model).not.toEqual(v1.model);
    expect(workflowSampleRecords(v5.schema)[0]!.plan_name).not.toBe(workflowSampleRecords(v1.schema)[0]!.plan_name);
    const seedDiff = await preview({ action: 'compare', compositionId: id, version: 1, against: { version: 5 } }, { previewHostUrl: hostUrl });
    if (seedDiff.action !== 'compare') throw new Error('compare expected');
    // This screen's artifact carries no seeded text (its chart amounts do not rotate), so only the seed moved; the model did.
    expect(Object.entries(seedDiff.diff.summary).filter(([, count]) => count > 0).map(([category]) => category)).toEqual(['seed']);
    expect(parentBytes().equals(before)).toBe(true);

    // Every version opens with its lineage; the composition lists them all.
    const listed = await preview({ action: 'versions', compositionId: id }, { previewHostUrl: hostUrl });
    if (listed.action !== 'versions') throw new Error('versions expected');
    expect(listed.latest).toBe(5);
    expect(listed.versions.map(entry => [entry.version, entry.parentVersion, entry.operation])).toEqual([[1, null, 'compose'], [2, 1, 'reorder-region'], [3, 1, 'swap-slot'], [4, 1, 'reorder-fields'], [5, 1, 'seed']]);
    const page = await (await fetch(reordered.previewUrl)).text();
    expect(page).toContain('<code>reorder-region</code>');
    expect(page).toContain(`<a href="/preview/${id}/1?framework=react&brand=A&theme=light">version 1</a>`);
    expect(page).toContain('data-oods-edit="true"');

    // Refusals: a component outside the composer's candidates, an unknown region or field, an order that changes nothing, an unchanged seed.
    for (const edit of [
      { operation: 'swap-slot', slot: 'metadata', component: 'Table' },
      { operation: 'swap-slot', slot: 'nope', component: 'TagSummary' },
      { operation: 'reorder-region', regionOrder: ['detail-header-1', 'nope'] },
      { operation: 'reorder-region', regionOrder: ['detail-header-1', 'detail-body-10'] },
      { operation: 'reorder-fields', region: 'detail-body-10', fieldOrder: ['nope'] },
      { operation: 'reorder-fields', region: 'detail-header-1', fieldOrder: ['created_at'] },
      { operation: 'seed', seed: 'harbor-2' },
    ] as const) {
      await expect(preview({ action: 'edit', compositionId: id, version: 5, edit: edit as never }, { previewHostUrl: hostUrl }), JSON.stringify(edit)).rejects.toMatchObject({ opiCode: 'OODS-V204' });
    }
    expect((await listVersions(compositionsDir, id)).length).toBe(5);
    expect(parentBytes().equals(before)).toBe(true);
  });
});
