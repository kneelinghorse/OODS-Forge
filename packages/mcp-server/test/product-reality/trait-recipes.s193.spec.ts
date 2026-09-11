import { describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { loadObject } from '../../src/objects/object-loader.js';
import { handle as compose } from '../../src/tools/design.compose.js';
import { handle as generate } from '../../src/tools/code.generate.js';
import type { UiElement } from '../../src/schemas/generated.js';
import { summarize, validateRuntimeLedger, type RuntimeLedger } from '../../src/lib/runtime-ledger.js';

vi.mock('../../src/objects/object-loader.js', async importOriginal => {
  const original = await importOriginal<typeof import('../../src/objects/object-loader.js')>();
  return { ...original, loadObject(name: string) {
    if (!['S193Colorized', 'S193Geocodable'].includes(name)) return original.loadObject(name);
    const object = structuredClone(original.loadObject('Product'));
    object.object.name = name;
    object.traits.push(name === 'S193Colorized' ? { name: 'visual/Colorized', parameters: { colorStates: ['neutral', 'success'] } } : { name: 'viz.spatial/Geocodable' });
    return object;
  } };
});
const nodes = (roots: UiElement[]): UiElement[] => roots.flatMap(node => [node, ...nodes(node.children ?? [])]);
const placements = [
  ['Subscription', 'timeline', 'ArchiveEvent'], ['Subscription', 'timeline', 'CancellationEvent'],
  ['Subscription', 'timeline', 'StateTransitionEvent'], ['User', 'detail', 'CommunicationDetailPanel'],
  ['S193Colorized', 'form', 'ColorStatePicker'], ['S193Colorized', 'detail', 'StatusColorLegend'],
  ['S193Geocodable', 'form', 'GeoFieldMappingForm'], ['S193Geocodable', 'list', 'GeoResolutionBadge'],
  ['S193Geocodable', 'detail', 'GeocodablePreview'],
] as const;

describe('nine declared non-visualization recipes', () => {
  it('a scoped remeasurement must match its declared cells and cannot replace the 154-cell health ledger', () => {
    const root = path.resolve(import.meta.dirname, '../../../..');
    const ledger = JSON.parse(fs.readFileSync(path.join(root, 'artifacts/product-reality/sprint-193/m03/runtime-cells.v1.json'), 'utf8')) as RuntimeLedger;
    ledger.rows = ledger.rows.slice(0, 2); ledger.summary = summarize(ledger.rows);
    const expected = ledger.rows.map(row => `${row.object}/${row.context}/${row.framework}`);
    expect(validateRuntimeLedger(ledger, true, expected)).toEqual([]);
    expect(validateRuntimeLedger(ledger, true)).toContain('population must contain exactly 154 distinct current cells');
    expect(validateRuntimeLedger(ledger, true, [...expected, expected[0]!])).toContain('a scoped population must declare nonempty distinct identities');
    ledger.rows.pop(); ledger.summary = summarize(ledger.rows);
    expect(validateRuntimeLedger(ledger, true, expected)).toContain('population must contain exactly 2 distinct current cells');
  });
  it.each(placements)('%s/%s places %s and emits both governed targets without schema editing', async (object, context, component) => {
    const result = await compose({ object, context });
    expect(result.status).toBe('ok');
    const placed = nodes(result.schema.screens).filter(node => node.component === component);
    expect(placed).toHaveLength(1);
    if (component === 'ColorStatePicker' || component === 'StatusColorLegend') expect(placed[0]?.props?.colorStates).toEqual(['neutral', 'success']);
    if (component === 'GeoFieldMappingForm') {
      expect(placed[0]?.props?.embedded).toBe(true);
      expect(placed[0]?.bindings?.onChange).toBe('handleGeoMappingChange');
      expect(nodes(result.schema.screens).filter(node => node.component === 'Input' && ['geo_latitude_field', 'geo_longitude_field', 'geo_identifier_field'].includes(String(node.props?.field)))).toEqual([]);
    }
    const before = JSON.stringify(result.schema);
    for (const framework of ['react', 'vue'] as const) {
      const generated = await generate({ schema: result.schema, framework, profile: 'build' });
      expect(generated.status, JSON.stringify(generated.errors)).toBe('ok');
      expect(generated.code).toContain(`<${component}`);
      if (component === 'ColorStatePicker' && framework === 'react') {
        // The recipe emits the selected string, not its nested Select's DOM event.
        expect(generated.code).toContain('const handleChange_color_state = (value: string)');
        expect(generated.code).not.toContain('const handleChange_color_state = (event:');
        expect(generated.code).toContain('value={handleChange_color_stateState}');
      }
      if (component === 'ColorStatePicker' && framework === 'vue') {
        expect(generated.code).toContain(':value="handleChange_color_stateState"');
      }
      expect(JSON.stringify(generated.errors ?? [])).not.toMatch(/OODS-(V007|N015|N016)/);
    }
    expect(JSON.stringify(result.schema)).toBe(before);
  });
  it('the Colorized and Geocodable fixture is bounded and does not alter the canonical Product', () => {
    expect(loadObject('Product').traits.some(trait => /Colorized|geocodable/.test(trait.name))).toBe(false);
    expect(loadObject('S193Colorized').traits.map(trait => trait.name)).toContain('visual/Colorized');
    expect(loadObject('S193Geocodable').traits.map(trait => trait.name)).toContain('viz.spatial/Geocodable');
  });
});
