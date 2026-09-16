import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { validateRuntimeLedger, type RuntimeLedger } from '../../src/lib/runtime-ledger.js';

const root = path.resolve(import.meta.dirname, '../../../../artifacts/product-reality/sprint-193/m05');
const read = (file: string) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
describe('retained visualization recipe proof', () => {
  it('keeps the twelve bounded authoring fixtures separate from the canonical public runtime population', () => {
    const ledger = read('packed/scoped-runtime-cells.v1.json') as RuntimeLedger;
    const traits = ['MarkArea', 'MarkBar', 'MarkLine', 'MarkPoint', 'MarkRect', 'ScatterPlot', 'EncodingPositionX', 'EncodingColor', 'EncodingSize', 'EncodingShape', 'EncodingOpacity', 'ScaleLinear'];
    const expected = traits.flatMap(trait => ['form', 'detail', 'list'].flatMap(context => ['react', 'vue'].map(framework => `S193Viz${trait}/${context}/${framework}`)));
    expect(ledger.summary).toEqual({ cells: 72, pass: 72, typedGap: 0, fail: 0 });
    expect(ledger.head).toBe(read('movement.json').comparedHead);
    expect(validateRuntimeLedger(ledger, true, expected)).toEqual([]);
    expect(validateRuntimeLedger(ledger, true)).toContain('population must contain exactly 310 distinct current cells');
    for (const row of ledger.rows) expect(read(`packed/${row.report}`)).toEqual(row);
    const missing = structuredClone(ledger); missing.rows.pop();
    expect(validateRuntimeLedger(missing, true, expected).length).toBeGreaterThan(0);
  });
  it('every control and editable legend emits exactly one typed change through both generated frameworks', () => {
    const ledger = read('packed/scoped-runtime-cells.v1.json') as RuntimeLedger;
    for (const framework of ['react', 'vue']) {
      const seen = new Set<string>();
      for (const row of ledger.rows.filter(row => row.context === 'form' && row.framework === framework)) {
        const detail = row.gates.find(gate => gate.name === 'context-states')!.detail as { recipeChanges: Record<string, { before: string; after: string; calls: unknown[][] }> };
        for (const [component, change] of Object.entries(detail.recipeChanges)) {
          if (!component.startsWith('Viz')) continue;
          seen.add(component); expect(change.after).not.toBe(change.before);
          expect(change.calls).toHaveLength(1); expect(change.calls[0]).toHaveLength(1);
          expect(typeof change.calls[0][0]).toBe('object');
        }
      }
      expect([...seen].sort()).toEqual(read('authored-roots.json').controls.sort());
    }
  });
  it('records zero public-schema movement and zero N015 gaps without substituting fixture coverage', () => {
    expect(read('movement.json')).toMatchObject({ schemaCount: 77, changedSchemas: 0, changedRuntimeCells: 0, unattributedChanges: [], builderSelfCertified: false });
    const census = read('n015-census.json');
    expect(census).toMatchObject({ totalComponents: 109, governed: 109, gaps: [], builderSelfCertified: false });
    expect(census.rows).toHaveLength(218);
    expect(census.rows.every((row: any) => row.status === 'ok' && row.artifactPresent && !row.errors.length)).toBe(true);
  });
});
