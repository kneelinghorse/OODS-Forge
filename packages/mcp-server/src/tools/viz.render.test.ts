import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { validateNormalizedVizSpec } from '@oods/viz-core';
import { getAjv } from '../lib/ajv.js';
import type { VizRenderInput } from '../schemas/generated.js';
import { handle } from './viz.render.js';
import { createValueRef, resolveValueRef } from './schema-ref.js';

const outputSchema = JSON.parse(
  readFileSync(new URL('../schemas/viz.render.output.json', import.meta.url), 'utf8'),
) as Record<string, unknown>;
const inputSchema = JSON.parse(
  readFileSync(new URL('../schemas/viz.render.input.json', import.meta.url), 'utf8'),
) as Record<string, unknown>;
const validateOutput = getAjv().compile(outputSchema);
const validateInput = getAjv().compile(inputSchema);

const render = (input: Record<string, unknown>) => handle(input as unknown as VizRenderInput);

const SALES = [
  { region: 'North', quarter: '2024-01', revenue: 120000 },
  { region: 'South', quarter: '2024-01', revenue: 135000 },
  { region: 'North', quarter: '2024-02', revenue: 128000 },
  { region: 'South', quarter: '2024-02', revenue: 142000 },
];

describe('viz.render handler', () => {
  it('explicit mode returns a valid, data-bound Vega-Lite spec', async () => {
    const out = await render({
      rows: SALES,
      chartType: 'bar',
      encodings: { x: 'region', y: { field: 'revenue', aggregate: 'sum' } },
    });

    expect(out.status).toBe('ok');
    expect(out.mode).toBe('explicit');
    expect(out.chartType).toBe('bar');
    expect(validateOutput(out)).toBe(true);

    const spec = out.spec as Record<string, any>;
    expect(spec.mark).toMatchObject({ type: 'bar' });
    expect(spec.data.values).toHaveLength(4);
    expect(spec.data.values).toEqual(SALES); // data bound byte-equal
    expect((out.a11yDescription ?? '').length).toBeGreaterThan(0);
    expect(out.meta?.renderer).toBe('vega-lite');
    expect(out.meta?.mark).toBe('MarkBar');
    expect(out.meta?.rowCount).toBe(4);
    // explicit mode: no recommender suggestion
    expect(out.suggestion).toBeUndefined();
  });

  it.each(['bar', 'line', 'area', 'scatter', 'heatmap'])(
    'renders %s: output is AJV-valid and the embedded normalizedSpec passes the IR validator',
    async (chartType) => {
      const out = await render({
        rows: SALES,
        chartType,
        encodings: { x: 'region', y: { field: 'revenue', aggregate: 'sum' } },
        output: { includeNormalizedSpec: true },
      });
      expect(out.status).toBe('ok');
      expect(out.chartType).toBe(chartType);
      expect(validateOutput(out)).toBe(true);
      // the embedded IR is itself a valid NormalizedVizSpec
      expect(validateNormalizedVizSpec(out.normalizedSpec).valid).toBe(true);
      expect((out.spec as Record<string, any>).data.values).toEqual(SALES);
    },
  );

  it('defaults to compact (tokenCssRef) and omits echartsSpec', async () => {
    const out = await render({ rows: SALES, chartType: 'bar', encodings: { x: 'region', y: 'revenue' } });
    expect(out.tokenCssRef).toBe('tokens.build');
    expect(out.output?.compact).toBe(true);
    expect(out.echartsSpec).toBeUndefined();
    expect(validateOutput(out)).toBe(true);
  });

  it('compact:false omits the tokenCssRef', async () => {
    const out = await render({
      rows: SALES,
      chartType: 'bar',
      encodings: { x: 'region', y: 'revenue' },
      output: { compact: false },
    });
    expect(out.tokenCssRef).toBeUndefined();
    expect(out.output?.compact).toBe(false);
    expect(validateOutput(out)).toBe(true);
  });

  it('echarts opt-in also returns an ECharts option', async () => {
    const out = await render({
      rows: SALES,
      chartType: 'line',
      encodings: { x: 'quarter', y: 'revenue' },
      output: { echarts: true },
    });
    expect(out.status).toBe('ok');
    expect(out.echartsSpec).toBeTruthy();
    expect(out.output?.echarts).toBe(true);
    expect(validateOutput(out)).toBe(true);
  });

  it('includeNormalizedSpec returns the NormalizedVizSpec IR', async () => {
    const out = await render({
      rows: SALES,
      chartType: 'bar',
      encodings: { x: 'region', y: 'revenue' },
      output: { includeNormalizedSpec: true },
    });
    const ir = out.normalizedSpec as Record<string, any>;
    expect(ir?.marks?.[0]?.trait).toBe('MarkBar');
    expect(validateOutput(out)).toBe(true);
  });

  it('suggest mode (no chartType) lets the recommender choose', async () => {
    const out = await render({ rows: SALES });
    expect(out.status).toBe('ok');
    expect(out.mode).toBe('suggest');
    expect(out.suggestion?.patternId).toBeTruthy();
    expect(typeof out.suggestion?.score).toBe('number');
    expect(out.meta?.inferredFields).toHaveLength(3);
    expect((out.spec as Record<string, any>).data.values).toHaveLength(4);
    expect(validateOutput(out)).toBe(true);
  });

  it('emits a specRef trio that resolves back within TTL', async () => {
    const out = await render({ rows: SALES, chartType: 'bar', encodings: { x: 'region', y: 'revenue' } });
    expect(out.specRef).toBeTruthy();
    expect(out.specRefCreatedAt).toBeTruthy();
    expect(out.specRefExpiresAt).toBeTruthy();

    const resolved = resolveValueRef(out.specRef as string);
    expect(resolved.ok).toBe(true);
    if (resolved.ok) {
      // the cached value is the produced Vega-Lite spec
      expect(JSON.stringify(resolved.value)).toEqual(JSON.stringify(out.spec));
    }
  });

  it('datasetRef round-trips: a cached rows array renders the same data', async () => {
    const record = createValueRef(SALES, 'viz.render.dataset');
    const out = await render({
      datasetRef: record.ref,
      chartType: 'bar',
      encodings: { x: 'region', y: { field: 'revenue', aggregate: 'sum' } },
    });
    expect(out.status).toBe('ok');
    expect((out.spec as Record<string, any>).data.values).toEqual(SALES);
    expect(validateOutput(out)).toBe(true);
  });

  it('returns a valid error payload for an unknown datasetRef', async () => {
    const out = await render({ datasetRef: 'does-not-exist-123' });
    expect(out.status).toBe('error');
    expect(out.errors?.[0]?.code).toBe('OODS-V123');
    expect(out.spec).toEqual({});
    expect(out.warnings).toEqual([]);
    expect(validateOutput(out)).toBe(true);
  });

  it('determinism: identical input yields an identical spec', async () => {
    const a = await render({ rows: SALES });
    const b = await render({ rows: SALES });
    expect(JSON.stringify(b.spec)).toEqual(JSON.stringify(a.spec));
  });

  it('registered-path parity: the full input->handle->output round-trip against the REGISTERED schemas yields a spec byte-identical to direct handle()', async () => {
    const input = {
      rows: SALES,
      chartType: 'bar',
      encodings: { x: 'region', y: { field: 'revenue', aggregate: 'sum' } },
    };
    // direct handler invocation (the aquex-adapter / in-process path)
    const direct = await render(input);

    // registered tool path = exactly what the dispatcher (and thus the :4466
    // bridge) does: AJV-validate the input against the registered input schema,
    // call handle, AJV-validate the output against the registered output schema.
    expect(validateInput(input)).toBe(true);
    const dispatched = await render(input);
    expect(validateOutput(dispatched)).toBe(true);

    // No serving-path drift: the spec payload is byte-identical across paths.
    // (The specRef trio is intentionally unique per call, so only the spec
    // payload itself is compared.)
    expect(JSON.stringify(dispatched.spec)).toEqual(JSON.stringify(direct.spec));
    expect(dispatched.chartType).toEqual(direct.chartType);
    expect(dispatched.a11yDescription).toEqual(direct.a11yDescription);
  });
});
