/**
 * s167 m03 (FF#22 follow-on) — OODS-only `mark.options` keys must not reach the emitted
 * Vega-Lite mark definition.
 *
 * THE DEFECT: `createMark` in packages/viz-core/src/adapters/vega-lite-adapter.ts spread
 * `mark.options` wholesale into the mark def. The emitted spec stamps
 * `$schema https://vega.github.io/schema/vega-lite/v6.json`, whose `MarkDef` is
 * `additionalProperties: false`, so every OODS-only key rode out as a schema violation.
 *
 * That matters because of what s166 prescribed. `inferLayerKey` prefers
 * `mark.options.id` over `mark.trait`, and the s166 docs now tell consumers to use
 * distinct ids to order repeated same-trait layers (the FF#22 answer). Following the
 * prescribed pattern therefore produced a schema-INVALID spec, and dropping the ids to
 * regain validity puts the consumer back at the original FF#22 dead end.
 *
 * TWO keys leak, not one — the second was found by enumerating every `mark.options` key
 * in the repo (7,735 JSON specs) and checking each against the real MarkDef property
 * list, rather than assuming `id` was alone:
 *
 *   | key           | occurrences | valid MarkDef prop? | consumed by                       |
 *   |---------------|-------------|---------------------|-----------------------------------|
 *   | `curve`       | 7           | NO                  | echarts-adapter.ts:348 (`smooth`) |
 *   | `baseline`    | 4           | yes                 | Vega-Lite                         |
 *   | `strokeWidth` | 4           | yes                 | Vega-Lite                         |
 *   | `opacity`     | 2           | yes                 | Vega-Lite                         |
 *   | `fillOpacity` | 2           | yes                 | Vega-Lite                         |
 *   | `strokeDash`  | 1           | yes                 | Vega-Lite                         |
 *   | `id`          | 1           | NO                  | inferLayerKey (layer ordering)    |
 *
 * So the filter is a narrow denylist of the two OODS-only keys, NOT a strip of anything
 * unrecognised: five of the seven keys are real Vega-Lite passthrough and a naive strip
 * would silently drop styling that consumers rely on.
 *
 * CLAIM CEILING: this proves the prescribed pattern now emits a schema-valid spec. It
 * does NOT claim FF#22 is closed.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';
import { toVegaLiteSpec } from '../../packages/viz-core/src/adapters/vega-lite-adapter.js';
import { toEChartsOption } from '../../packages/viz-core/src/adapters/echarts-adapter.js';
import type { NormalizedVizSpec } from '../../packages/viz-core/src/spec/normalized-viz-spec.js';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(moduleDir, '../../node_modules/vega-lite/build/vega-lite-schema.json');
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

/** Schema errors anchored on a layer's mark definition. */
function markErrors(spec: unknown): string[] {
  if (validate(spec)) return [];
  return (validate.errors ?? [])
    .filter((error) => /^\/layer\/\d+\/mark/.test(error.instancePath))
    .map((error) => `${error.instancePath} ${error.message} ${JSON.stringify(error.params)}`);
}

const x = { field: 'month', trait: 'EncodingPositionX', channel: 'x' };

/**
 * The pattern the s166 docs prescribe: three same-trait layers made orderable by
 * distinct `options.id`. `curve` rides along on one of them because it is the other
 * OODS-only key, and `strokeWidth` because it is genuine Vega-Lite passthrough that
 * must survive the filter.
 */
function prescribedSpec(layout?: Record<string, unknown>): NormalizedVizSpec {
  return {
    $schema: 'https://oods.dev/viz-spec/v1',
    id: 'ff22-s167-mark-options',
    name: 'Plan vs actual vs target',
    data: {
      values: [
        { month: 'Jan', baseline: 10, actual: 12, target: 15 },
        { month: 'Feb', baseline: 11, actual: 14, target: 15 },
      ],
    },
    marks: [
      {
        trait: 'MarkLine',
        options: { id: 'baseline', curve: 'monotone', strokeWidth: 3 },
        encodings: { x, y: { field: 'baseline', trait: 'EncodingPositionY', channel: 'y' } },
      },
      {
        trait: 'MarkLine',
        options: { id: 'actual', opacity: 0.8 },
        encodings: { x, y: { field: 'actual', trait: 'EncodingPositionY', channel: 'y' } },
      },
      {
        trait: 'MarkPoint',
        options: { id: 'target', fillOpacity: 0.5, strokeDash: [4, 2] },
        encodings: { x, y: { field: 'target', trait: 'EncodingPositionY', channel: 'y' } },
      },
    ],
    encoding: { x, y: { field: 'baseline', trait: 'EncodingPositionY', channel: 'y' } },
    ...(layout ? { layout } : {}),
    a11y: { description: 'Three layers: baseline, actual, and target by month.' },
  } as unknown as NormalizedVizSpec;
}

type CompiledSpec = {
  readonly layer?: readonly { mark?: Record<string, unknown>; encoding?: { y?: { field?: string } } }[];
};

describe('s167 m03 — OODS-only mark.options keys stay out of the Vega-Lite mark def (FF#22)', () => {
  it('the prescribed id-keyed ordering pattern emits a SCHEMA-VALID spec', () => {
    const compiled = toVegaLiteSpec(
      prescribedSpec({ trait: 'LayoutLayer', order: ['target', 'baseline', 'actual'] }),
    );
    const errors = markErrors(compiled);
    expect(errors, `mark definitions are schema-invalid:\n  ${errors.join('\n  ')}`).toEqual([]);
    expect(validate(compiled)).toBe(true);
  });

  it('no emitted mark def carries an OODS-only key', () => {
    const compiled = toVegaLiteSpec(prescribedSpec()) as CompiledSpec;
    const marks = (compiled.layer ?? []).map((layer) => layer.mark ?? {});
    expect(marks).toHaveLength(3);
    for (const mark of marks) {
      expect(Object.keys(mark)).not.toContain('id');
      expect(Object.keys(mark)).not.toContain('curve');
    }
  });

  it('KEEP-GREEN: genuine Vega-Lite passthrough survives the filter', () => {
    const compiled = toVegaLiteSpec(prescribedSpec()) as CompiledSpec;
    const marks = (compiled.layer ?? []).map((layer) => layer.mark ?? {});
    // Five of the seven observed option keys are real MarkDef properties. A naive
    // "strip what we do not recognise" would drop these and silently change rendering.
    expect(marks[0]).toMatchObject({ type: 'line', strokeWidth: 3 });
    expect(marks[1]).toMatchObject({ type: 'line', opacity: 0.8 });
    expect(marks[2]).toMatchObject({ type: 'point', fillOpacity: 0.5, strokeDash: [4, 2] });
  });

  it('KEEP-GREEN: id-keyed layer ordering still works (options.id stays visible to inferLayerKey)', () => {
    // The filter must remove `id` from the OUTPUT only. If it were removed from the IR,
    // inferLayerKey would fall back to the trait name, the Map matcher would collapse the
    // two MarkLine layers, and the consumer would be back at the original FF#22 dead end.
    const ordered = toVegaLiteSpec(
      prescribedSpec({ trait: 'LayoutLayer', order: ['target', 'baseline', 'actual'] }),
    ) as CompiledSpec;
    expect((ordered.layer ?? []).map((l) => l.encoding?.y?.field)).toEqual([
      'target',
      'baseline',
      'actual',
    ]);

    // ...and without a layout, declaration order is preserved.
    const declared = toVegaLiteSpec(prescribedSpec()) as CompiledSpec;
    expect((declared.layer ?? []).map((l) => l.encoding?.y?.field)).toEqual([
      'baseline',
      'actual',
      'target',
    ]);
  });

  /**
   * Discrimination proof. The validator must be what rejects these keys — otherwise the
   * green above could be a tautology (e.g. a validator that accepts everything, or a
   * schema that never actually loaded). Re-injecting each key into the ALREADY-COMPILED
   * output must make the SAME validator red at that mark's path.
   */
  it('the schema validator is discriminating: re-injecting each OODS-only key turns it RED', () => {
    const compiled = toVegaLiteSpec(prescribedSpec()) as unknown as {
      layer: { mark: Record<string, unknown> }[];
    };
    expect(markErrors(compiled)).toEqual([]);

    for (const [key, value] of [
      ['id', 'target'],
      ['curve', 'monotone'],
    ] as const) {
      const mutated = structuredClone(compiled) as typeof compiled;
      mutated.layer[0].mark[key] = value;
      const errors = markErrors(mutated);
      expect(errors.length, `re-injecting mark.${key} did not fail schema validation`).toBeGreaterThan(0);
      expect(errors.join(' ')).toContain('/layer/0/mark');
    }
  });

  /**
   * The synthetic spec above proves the mechanism; this proves the fix actually reaches
   * shipped content. `examples/viz/line-chart.spec.json` is a committed fixture that
   * carries `curve` — the more common of the two leaking keys (7 occurrences vs 1).
   */
  it('reaches a REAL committed fixture: examples/viz/line-chart.spec.json', () => {
    const fixturePath = path.resolve(moduleDir, '../../examples/viz/line-chart.spec.json');
    const spec = JSON.parse(readFileSync(fixturePath, 'utf8')) as NormalizedVizSpec;
    // Guard the premise — if the fixture stops carrying `curve` this test proves nothing.
    expect((spec.marks[0] as { options?: Record<string, unknown> }).options).toHaveProperty('curve');

    const compiled = toVegaLiteSpec(spec) as CompiledSpec & { mark?: Record<string, unknown> };
    const mark = compiled.layer ? (compiled.layer[0].mark ?? {}) : (compiled.mark ?? {});
    expect(Object.keys(mark)).not.toContain('curve');
    expect(validate(compiled)).toBe(true);
  });

  /**
   * The filter is OUTPUT-only. `curve` must still reach the ECharts adapter, which reads
   * it off the IR to decide `smooth`. If the fix had stripped the key from `mark.options`
   * itself, this would silently flatten every curved line in the ECharts renderer.
   */
  it('KEEP-GREEN: curve still reaches the ECharts adapter from the IR', () => {
    const fixturePath = path.resolve(moduleDir, '../../examples/viz/line-chart.spec.json');
    const spec = JSON.parse(readFileSync(fixturePath, 'utf8')) as NormalizedVizSpec;
    const option = toEChartsOption(spec) as unknown as { series?: readonly { smooth?: boolean }[] };
    // curve is 'monotone' (non-linear) in this fixture, so smooth must be true.
    expect(option.series?.[0]?.smooth).toBe(true);
  });

  it('MarkDef really is a closed object in the pinned schema (the premise of this whole spec)', () => {
    const markDef = (schema as { definitions: Record<string, { additionalProperties?: boolean; properties?: object }> })
      .definitions.MarkDef;
    expect(markDef.additionalProperties).toBe(false);
    expect(Object.keys(markDef.properties ?? {})).not.toContain('id');
    expect(Object.keys(markDef.properties ?? {})).not.toContain('curve');
    // ...but does contain the passthrough keys the filter must preserve.
    for (const key of ['strokeWidth', 'opacity', 'fillOpacity', 'strokeDash', 'baseline']) {
      expect(Object.keys(markDef.properties ?? {}), `${key} should be a real MarkDef prop`).toContain(key);
    }
  });
});
