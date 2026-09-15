import type { CompositionVersion, PreviewFramework } from './store.js';

/**
 * The structural what-changed between two composition versions. The shape follows the design
 * loop's receipt diff (scripts/design-loop/diff.ts: one {field, before, after} row per difference,
 * a count, JSON equality), applied to the fields a version carries: regions, slots, props, field
 * order, the seed and the artifact files whose hash moved. Nothing is claimed about pixels here.
 */
export type DiffCategory = 'regions' | 'slots' | 'nodes' | 'props' | 'fieldOrder' | 'seed' | 'artifacts';
export interface DiffEntry { category: DiffCategory; field: string; before: unknown; after: unknown; note: string }
export interface VersionRef { compositionId: string; version: number; schemaHash: string; parentVersion: number | null; operation: string; object: string | null; context: string | null }
export interface CompositionDiff {
  left: VersionRef;
  right: VersionRef;
  identical: boolean;
  differenceCount: number;
  summary: Record<DiffCategory, number>;
  differences: DiffEntry[];
}

type Node = { id: string; component: string; props?: Record<string, unknown>; children?: Node[]; meta?: { intent?: string } };
type Schema = { screens: Node[] };

const CATEGORIES: DiffCategory[] = ['regions', 'slots', 'nodes', 'props', 'fieldOrder', 'seed', 'artifacts'];
const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
/** A slot keeps its id (slot-<name>-<n>) after filling, whether or not the placeholder intent survived. */
const slotName = (node: Node): string | undefined => {
  if (typeof node.meta?.intent === 'string' && node.meta.intent.startsWith('slot:')) return node.meta.intent.slice(5);
  const match = /^slot-(.+)-\d+$/.exec(node.id);
  return match ? match[1] : undefined;
};
const CONTAINERS = new Set(['Stack', 'Card', 'Tabs']);
/** What a slot renders: its children, or the component the slot itself became; an empty container is an empty slot. */
const placedIn = (node: Node): string[] => node.children?.length ? node.children.map(child => child.component) : CONTAINERS.has(node.component) ? [] : [node.component];

/** Regions: the direct children of every screen, in order. */
function regions(schema: Schema): Array<{ key: string; component: string; node: Node }> {
  return schema.screens.flatMap(screen => (screen.children ?? []).map(node => ({ key: `${screen.id}/${node.id}`, component: node.component, node })));
}
/** Slots: slot name → the components placed in it, in order: the composer's own record when the version carries it, else read from the schema. */
function slots(record: CompositionVersion): Map<string, { placed: string[] }> {
  const found = new Map<string, { placed: string[] }>();
  if (record.slots?.length) {
    for (const slot of record.slots) found.set(slot.slotName, { placed: slot.placedComponents ?? (slot.selectedComponent ? [slot.selectedComponent] : []) });
    return found;
  }
  const walk = (node: Node) => { const name = slotName(node); if (name) { found.set(name, { placed: placedIn(node) }); return; } node.children?.forEach(walk); };
  (record.schema as Schema).screens.forEach(walk);
  return found;
}
/** Every node outside a slot, by id, with the slot names its subtree holds; slot subtrees belong to the slot change. */
function nodes(schema: Schema): Map<string, { node: Node; region: string; slots: string[] }> {
  const found = new Map<string, { node: Node; region: string; slots: string[] }>();
  const slotsBelow = (node: Node): string[] => { const own = slotName(node); return own ? [own] : (node.children ?? []).flatMap(slotsBelow); };
  const walk = (node: Node, region: string) => { if (slotName(node)) return; found.set(node.id, { node, region, slots: slotsBelow(node) }); node.children?.forEach(child => walk(child, region)); };
  for (const screen of schema.screens) for (const child of screen.children ?? []) walk(child, `${screen.id}/${child.id}`);
  return found;
}
/** Field order per region: the `field` props in document order, outside slots (a slot's fields belong to its placement). */
function fieldOrder(schema: Schema): Map<string, string[]> {
  const found = new Map<string, string[]>();
  for (const region of regions(schema)) {
    const fields: string[] = [];
    const walk = (node: Node) => { if (slotName(node)) return; if (typeof node.props?.field === 'string') fields.push(node.props.field); node.children?.forEach(walk); };
    walk(region.node);
    found.set(region.key, fields);
  }
  return found;
}
const ref = (record: CompositionVersion): VersionRef => ({ compositionId: record.compositionId, version: record.version, schemaHash: record.schemaHash, parentVersion: record.parentVersion, operation: record.operation, object: record.compose.object ?? null, context: record.compose.context ?? null });
const seedOf = (record: CompositionVersion): unknown => (record.compose.preferences as { seed?: unknown } | undefined)?.seed ?? null;

export function diffVersions(left: CompositionVersion, right: CompositionVersion): CompositionDiff {
  const differences: DiffEntry[] = [];
  const add = (category: DiffCategory, field: string, before: unknown, after: unknown, note: string) => { if (!same(before, after)) differences.push({ category, field, before: before ?? null, after: after ?? null, note }); };
  const a = left.schema as Schema, b = right.schema as Schema;

  // Regions: added, removed, reordered.
  const ra = regions(a), rb = regions(b);
  const keysA = ra.map(region => region.key), keysB = rb.map(region => region.key);
  for (const region of ra) if (!keysB.includes(region.key)) add('regions', region.key, region.component, null, 'region removed');
  for (const region of rb) if (!keysA.includes(region.key)) add('regions', region.key, null, region.component, 'region added');
  const sharedA = keysA.filter(key => keysB.includes(key)), sharedB = keysB.filter(key => keysA.includes(key));
  add('regions', 'order', sharedA, sharedB, 'regions reordered');

  // Slots: the components placed in each slot.
  const sa = slots(left), sb = slots(right);
  for (const name of new Set([...sa.keys(), ...sb.keys()])) add('slots', name, sa.get(name)?.placed, sb.get(name)?.placed, sa.has(name) && sb.has(name) ? 'slot components changed' : sa.has(name) ? 'slot removed' : 'slot added');

  // Nodes outside slots: added or removed, unless a region change already says so. Bare layout
  // containers (Stack, Card, Tabs without a field) are chrome whose ids renumber between
  // compositions; what they hold is reported through slots, regions and the nodes inside them.
  const subsumed = (entry: { node: Node; region: string; slots: string[] }, otherRegions: string[]) =>
    !otherRegions.includes(entry.region) || (CONTAINERS.has(entry.node.component) && typeof entry.node.props?.field !== 'string');
  const na = nodes(a), nb = nodes(b);
  for (const [id, entry] of na) if (!nb.has(id) && !subsumed(entry, keysB)) add('nodes', id, entry.node.component, null, 'node removed');
  for (const [id, entry] of nb) if (!na.has(id) && !subsumed(entry, keysA)) add('nodes', id, null, entry.node.component, 'node added');
  for (const [id, entry] of na) {
    const other = nb.get(id);
    if (!other) continue;
    const node = entry.node;
    add('props', `${id}.component`, node.component, other.node.component, 'component changed');
    const propsA = node.props ?? {}, propsB = other.node.props ?? {};
    for (const key of [...new Set([...Object.keys(propsA), ...Object.keys(propsB)])].sort()) add('props', `${id}.${key}`, propsA[key], propsB[key], key in propsA && key in propsB ? 'prop changed' : key in propsA ? 'prop removed' : 'prop added');
  }

  // Field order per region shared by both.
  const fa = fieldOrder(a), fb = fieldOrder(b);
  for (const key of sharedA) add('fieldOrder', key, fa.get(key), fb.get(key), 'field order changed');

  // The sample-data seed.
  add('seed', 'preferences.seed', seedOf(left), seedOf(right), 'seed changed');

  // Artifact files whose hash moved, per framework both versions carry.
  for (const framework of ['react', 'vue'] as PreviewFramework[]) {
    const artA = left.artifacts[framework]?.artifact, artB = right.artifacts[framework]?.artifact;
    if (!artA || !artB) continue;
    add('artifacts', `${framework}.contentHash`, artA.contentHash, artB.contentHash, 'artifact content hash moved');
    const filesA = Object.fromEntries(artA.files.map(file => [file.path, file.contentHash])), filesB = Object.fromEntries(artB.files.map(file => [file.path, file.contentHash]));
    for (const file of [...new Set([...Object.keys(filesA), ...Object.keys(filesB)])].sort()) add('artifacts', `${framework}.files.${file}`, filesA[file], filesB[file], file in filesA && file in filesB ? 'file hash moved' : file in filesA ? 'file removed' : 'file added');
  }

  const summary = Object.fromEntries(CATEGORIES.map(category => [category, differences.filter(entry => entry.category === category).length])) as Record<DiffCategory, number>;
  return { left: ref(left), right: ref(right), identical: differences.length === 0, differenceCount: differences.length, summary, differences };
}

/** Frameworks a compare can show side by side: generated on both versions. */
export function sharedFrameworks(left: CompositionVersion, right: CompositionVersion): PreviewFramework[] {
  return (['react', 'vue'] as PreviewFramework[]).filter(framework => left.artifacts[framework] && right.artifacts[framework]);
}
