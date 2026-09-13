import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { validateRuntimeLedger, type RuntimeLedger } from '../../src/lib/runtime-ledger.js';

const root = path.resolve(import.meta.dirname, '../../../../artifacts/product-reality/sprint-193/m04');
const read = (file: string) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

describe('retained nine-recipe proof', () => {
  it('remeasures every moved public schema and the five explicitly bounded fixture views in one scope', () => {
    const movement = read('movement.json');
    expect(movement.schemaCount).toBe(77);
    expect(movement.changedSchemas).toBe(18);
    expect(movement.unattributedChanges).toEqual([]);
    const expected = movement.rows.filter((row: any) => row.changed).flatMap((row: any) => ['react', 'vue'].map(framework => `${row.input.object}/${row.input.context}/${framework}`));
    for (const [object, contexts] of [['S193Colorized', ['form', 'detail']], ['S193Geocodable', ['form', 'list', 'detail']]] as const) {
      expected.push(...contexts.flatMap(context => ['react', 'vue'].map(framework => `${object}/${context}/${framework}`)));
    }
    const ledger = read('packed/scoped-runtime-cells.v1.json') as RuntimeLedger;
    expect(ledger.head).toBe(movement.comparedHead);
    expect(ledger.summary).toEqual({ cells: 46, pass: 46, typedGap: 0, fail: 0 });
    expect(validateRuntimeLedger(ledger, true, expected)).toEqual([]);
    expect(validateRuntimeLedger(ledger, true)).toContain('population must contain exactly 240 distinct current cells');
    for (const row of ledger.rows) expect(read(`packed/${row.report}`)).toEqual(row);
  });
  it('keeps the failed typed-callback attempt separate and proves the corrected writer changes selection in both frameworks', () => {
    const failed = read('packed-attempt-01/scoped-runtime-cells.v1.json') as RuntimeLedger;
    expect(failed.summary).toEqual({ cells: 46, pass: 45, typedGap: 0, fail: 1 });
    expect(failed.rows.filter(row => row.status === 'fail').map(row => `${row.object}/${row.context}/${row.framework}`)).toEqual(['S193Colorized/form/react']);
    const final = read('packed/scoped-runtime-cells.v1.json') as RuntimeLedger;
    expect(final.runId).not.toBe(failed.runId);
    for (const framework of ['react', 'vue']) {
      const row = final.rows.find(row => row.object === 'S193Colorized' && row.context === 'form' && row.framework === framework)!;
      const detail = row.gates.find(gate => gate.name === 'context-states')!.detail as { recipeChanges: { ColorStatePicker: { previous: string; selected: string } } };
      expect(detail.recipeChanges.ColorStatePicker.selected).not.toBe(detail.recipeChanges.ColorStatePicker.previous);
      expect(['neutral', 'success']).toContain(detail.recipeChanges.ColorStatePicker.selected);
    }
  });
  it('the reachability gap is exactly the remaining 25 Viz identities, never an unmeasured new non-Viz root', () => {
    const census = read('n015-census.json');
    expect(census.totalComponents).toBe(109);
    expect(census.governed).toBe(84);
    expect(census.gaps).toHaveLength(25);
    expect(census.gaps.every((id: string) => id.startsWith('Viz'))).toBe(true);
    expect(census.rows).toHaveLength(218);
    expect(census.rows.filter((row: any) => row.status === 'ok' && row.artifactPresent)).toHaveLength(168);
  });
});
