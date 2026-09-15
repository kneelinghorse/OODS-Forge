import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { diffVersions, sharedFrameworks } from './diff.js';
import { registerPreviewHost } from './host.js';
import type { CompositionVersion, PreviewArtifact } from './store.js';

const runtimeDir = path.join(path.dirname(new URL(import.meta.url).pathname), '../../dist/preview-runtime');
const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');
const directories: string[] = [];
const servers: FastifyInstance[] = [];
afterEach(async () => { for (const server of servers.splice(0)) await server.close(); for (const dir of directories.splice(0)) rmSync(dir, { recursive: true, force: true }); });

type Node = { id: string; component: string; props?: Record<string, unknown>; children?: Node[]; meta?: { intent?: string } };
type Fixture = { compose: CompositionVersion['compose']; brand: CompositionVersion['brand']; theme: CompositionVersion['theme']; schema: { screens: Node[] }; model: Record<string, unknown>; frameworks: Record<'react' | 'vue', { artifact: PreviewArtifact }> };
const raw = JSON.parse(readFileSync(new URL('./__fixtures__/subscription-card.json', import.meta.url), 'utf8')) as Fixture;
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
function version(n: number, mutate: (schema: { screens: Node[] }, record: CompositionVersion) => void = () => {}): CompositionVersion {
  const schema = clone(raw.schema);
  const record: CompositionVersion = {
    recordVersion: '1', compositionId: 'cmp-0123456789ab', version: n, parentVersion: n === 1 ? null : n - 1, operation: n === 1 ? 'compose' : 'recompose', createdAt: '2026-09-15T00:00:00.000Z', head: null,
    compose: clone(raw.compose), schema, schemaHash: '', brand: raw.brand, theme: raw.theme, slots: [], model: raw.model,
    artifacts: { react: { artifact: clone(raw.frameworks.react.artifact), generatedAt: '2026-09-15T00:00:00.000Z' }, vue: { artifact: clone(raw.frameworks.vue.artifact), generatedAt: '2026-09-15T00:00:00.000Z' } }, measurements: {},
  };
  mutate(schema, record);
  record.schemaHash = `sha256:${sha256(JSON.stringify(schema))}`;
  return record;
}
const walk = (nodes: Node[], visit: (node: Node, parent?: Node) => void, parent?: Node) => { for (const node of nodes) { visit(node, parent); if (node.children) walk(node.children, visit, node); } };
const isSlot = (node: Node) => /^slot-/.test(node.id) || Boolean(node.meta?.intent?.startsWith('slot:'));
/** Walk outside slot subtrees: what the nodes, props and field-order categories see. */
const walkOutside = (nodes: Node[], visit: (node: Node) => void) => { for (const node of nodes) { if (isSlot(node)) continue; visit(node); if (node.children) walkOutside(node.children, visit); } };
const slotOf = (schema: { screens: Node[] }, name: string): Node => { let found: Node | undefined; walk(schema.screens, node => { if (node.meta?.intent === `slot:${name}`) found = node; }); if (!found) throw new Error(`no slot ${name}`); return found; };
const moveFile = (record: CompositionVersion, framework: 'react' | 'vue', contents: string) => { const artifact = record.artifacts[framework]!.artifact; artifact.files[0]!.contents = contents; artifact.files[0]!.contentHash = `sha256:${sha256(contents)}`; artifact.contentHash = `sha256:${sha256(artifact.files.map(file => file.contentHash).join('\n'))}`; };
const categories = (diff: ReturnType<typeof diffVersions>) => Object.entries(diff.summary).filter(([, count]) => count > 0).map(([category]) => category);

describe('structural what-changed between two composition versions (s201-m03)', () => {
  it('reports zero differences for a version compared with itself', () => {
    const one = version(1);
    const diff = diffVersions(one, one);
    expect(diff).toMatchObject({ identical: true, differenceCount: 0, differences: [] });
    expect(Object.values(diff.summary).every(count => count === 0)).toBe(true);
    expect(diff.left).toEqual({ compositionId: 'cmp-0123456789ab', version: 1, schemaHash: one.schemaHash, parentVersion: null, operation: 'compose', object: 'Subscription', context: 'card' });
    expect(sharedFrameworks(one, one)).toEqual(['react', 'vue']);
  });

  it('reports exactly the swapped slot and the artifact files it moved, nothing else', () => {
    const one = version(1);
    const slotName = [...new Set((() => { const names: string[] = []; walk((one.schema as { screens: Node[] }).screens, node => { if (node.meta?.intent?.startsWith('slot:')) names.push(node.meta.intent.slice(5)); }); return names; })())][0]!;
    const two = version(2, (schema, record) => {
      const slot = slotOf(schema, slotName);
      slot.children = [{ id: `override-${slotName}`, component: 'Text', props: { content: 'Swapped' } }];
      moveFile(record, 'react', '// swapped\n' + raw.frameworks.react.artifact.files[0]!.contents);
      moveFile(record, 'vue', '<!-- swapped -->\n' + raw.frameworks.vue.artifact.files[0]!.contents);
    });
    const diff = diffVersions(one, two);
    expect(categories(diff)).toEqual(['slots', 'artifacts']);
    const slots = diff.differences.filter(entry => entry.category === 'slots');
    expect(slots).toEqual([{ category: 'slots', field: slotName, before: (slotOf(one.schema as { screens: Node[] }, slotName).children ?? []).map(node => node.component), after: ['Text'], note: 'slot components changed' }]);
    const moved = diff.differences.filter(entry => entry.category === 'artifacts').map(entry => entry.field).sort();
    expect(moved).toEqual([`react.contentHash`, `react.files.${raw.frameworks.react.artifact.files[0]!.path}`, `vue.contentHash`, `vue.files.${raw.frameworks.vue.artifact.files[0]!.path}`]);
    expect(diff.differenceCount).toBe(5);
    expect(diff.identical).toBe(false);
  });

  it('reports a reordered region as the region order only', () => {
    const one = version(1);
    const screen = (one.schema as { screens: Node[] }).screens[0]!;
    if ((screen.children?.length ?? 0) < 2) { const two = version(2, schema => { schema.screens[0]!.children!.push({ id: 'extra-region', component: 'Stack' }); }); expect(categories(diffVersions(one, two))).toEqual(['regions']); return; }
    const two = version(2, schema => { const children = schema.screens[0]!.children!; children.reverse(); });
    const diff = diffVersions(one, two);
    expect(categories(diff)).toEqual(['regions']);
    expect(diff.differences).toEqual([{ category: 'regions', field: 'order', before: screen.children!.map(node => `${screen.id}/${node.id}`), after: [...screen.children!].reverse().map(node => `${screen.id}/${node.id}`), note: 'regions reordered' }]);
  });

  it('reports an added region, a changed prop, a reordered field list and a changed seed each in its own category', () => {
    const one = version(1);
    const added = version(2, schema => { schema.screens[0]!.children!.push({ id: 'note-region', component: 'Text', props: { content: 'Added' } }); });
    expect(categories(diffVersions(one, added))).toEqual(['regions']);
    expect(diffVersions(one, added).differences[0]).toMatchObject({ category: 'regions', field: `${(one.schema as { screens: Node[] }).screens[0]!.id}/note-region`, before: null, after: 'Text', note: 'region added' });
    let target: Node | undefined; walkOutside((one.schema as { screens: Node[] }).screens, node => { if (!target && typeof node.props?.field === 'string') target = node; });
    if (target) {
      const prop = version(2, schema => { walk(schema.screens, node => { if (node.id === target!.id) node.props = { ...node.props, label: 'Renamed' }; }); });
      const diff = diffVersions(one, prop);
      expect(categories(diff)).toEqual(['props']);
      expect(diff.differences).toEqual([{ category: 'props', field: `${target.id}.label`, before: target.props?.label ?? null, after: 'Renamed', note: target.props && 'label' in target.props ? 'prop changed' : 'prop added' }]);
    }
    const fields: Node[] = []; walkOutside((one.schema as { screens: Node[] }).screens, node => { if (typeof node.props?.field === 'string') fields.push(node); });
    const [first, second] = fields;
    if (first && second && first.props!.field !== second.props!.field) {
      const swapped = version(2, schema => { walk(schema.screens, node => { if (node.id === first.id) node.props = { ...node.props, field: second.props!.field }; else if (node.id === second.id) node.props = { ...node.props, field: first.props!.field }; }); });
      const diff = diffVersions(one, swapped);
      expect(categories(diff).sort()).toEqual(['fieldOrder', 'props']);
      expect(diff.summary.fieldOrder).toBeGreaterThan(0);
    }
    const seeded = version(2, (_schema, record) => { record.compose = { ...record.compose, preferences: { ...(record.compose.preferences ?? {}), seed: 7 } }; });
    expect(diffVersions(one, seeded).differences).toEqual([{ category: 'seed', field: 'preferences.seed', before: null, after: 7, note: 'seed changed' }]);
  });

  it('serves the compare page with both apps, the what-changed and both measurement panels, and the diff as JSON', async () => {
    const dir = path.join(mkdtempSync(path.join(tmpdir(), 'oods-compare-')), 'compositions'); directories.push(path.dirname(dir));
    const one = version(1), two = version(2, (schema, record) => { schema.screens[0]!.children!.push({ id: 'note-region', component: 'Text', props: { content: 'Added' } }); record.measurements = { validationReceipt: { profile: 'build' } }; });
    for (const record of [one, two]) { const folder = path.join(dir, record.compositionId, 'versions'); mkdirSync(folder, { recursive: true }); writeFileSync(path.join(folder, `${record.version}.json`), JSON.stringify(record)); }
    const server = Fastify(); servers.push(server);
    await registerPreviewHost(server, { compositionsDir: dir, runtimeDir });
    const page = await server.inject('/compare/cmp-0123456789ab@1/cmp-0123456789ab@2?framework=vue&brand=A&theme=hc&width=820');
    expect(page.statusCode).toBe(200);
    expect(page.body).toContain('src="/preview/cmp-0123456789ab/1/app?framework=vue&brand=A&theme=hc"');
    expect(page.body).toContain('src="/preview/cmp-0123456789ab/2/app?framework=vue&brand=A&theme=hc"');
    expect(page.body).toContain('data-oods-what-changed="true"');
    expect(page.body).toContain('<h2>What changed <span class="count">1</span></h2>');
    expect(page.body).toContain('<ul data-oods-diff="regions">');
    expect(page.body).toContain('region added');
    expect(page.body).toContain('data-oods-measurements="cmp-0123456789ab@1"');
    expect(page.body).toContain('data-oods-measured="none"');
    expect(page.body).toContain('data-oods-measurements="cmp-0123456789ab@2"');
    expect(page.body).toContain('<code>validationReceipt</code>');
    expect(page.body).toContain('style="width:820px"');
    const same = await server.inject('/compare/cmp-0123456789ab@2/cmp-0123456789ab@2');
    expect(same.body).toContain('data-oods-identical="true"');
    const diff = await server.inject('/compare/cmp-0123456789ab@1/cmp-0123456789ab@2/diff.json');
    expect(diff.json()).toEqual(diffVersions(one, two));
    expect((await server.inject('/compare/cmp-0123456789ab@1/cmp-0123456789ab@3')).statusCode).toBe(404);
    expect((await server.inject('/compare/cmp-0123456789ab@1/nope')).statusCode).toBe(400);
    expect((await server.inject('/compare/cmp-0123456789ab@1/cmp-0123456789ab@2?framework=react')).statusCode).toBe(200);
  });
});
