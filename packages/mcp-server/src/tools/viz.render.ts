// viz.render — the Phase-0 "reconnect" handler (sprint-109 m04).
//
// Turns inline rows (or a cached datasetRef) into a REAL, data-bound Vega-Lite
// spec (ECharts opt-in) via the headless @oods/viz-core engine. This replaces
// the field-names-only viz.compose placeholder: it imports ONLY from
// @oods/viz-core and never touches the placeholder compose/viz-trait-resolver.
//
// Input is AJV-validated against viz.render.input.json before dispatch; output
// is validated against viz.render.output.json after return (so the shape here
// must stay additionalProperties-clean).

import {
  buildVizSpecFromRows,
  toEChartsOption,
  toVegaLiteSpec,
  type BuildVizSpecInput,
} from '@oods/viz-core';
import type { VizRenderInput, VizRenderOutput } from '../schemas/generated.js';
import { createValueRef, describeSchemaRef, resolveValueRef } from './schema-ref.js';

type Issue = VizRenderOutput['warnings'][number];

export async function handle(input: VizRenderInput): Promise<VizRenderOutput> {
  const compact = input.output?.compact ?? true;
  const wantEcharts = input.output?.echarts ?? false;
  const includeNormalized = input.output?.includeNormalizedSpec ?? false;

  // ---- resolve data: inline rows (primary) or a cached datasetRef ----
  let rows: Array<Record<string, unknown>>;
  if (Array.isArray(input.rows) && input.rows.length > 0) {
    rows = input.rows as Array<Record<string, unknown>>;
  } else if (typeof input.datasetRef === 'string' && input.datasetRef.length > 0) {
    const resolved = resolveValueRef(input.datasetRef);
    if (!resolved.ok) {
      return errorOut(
        resolved.reason === 'expired' ? 'OODS-V124' : 'OODS-V123',
        `Dataset reference "${input.datasetRef}" is ${resolved.reason}.`,
        compact,
        wantEcharts,
      );
    }
    if (!Array.isArray(resolved.value) || resolved.value.length === 0) {
      return errorOut(
        'OODS-V125',
        `Dataset reference "${input.datasetRef}" did not resolve to a non-empty rows array.`,
        compact,
        wantEcharts,
      );
    }
    rows = resolved.value as Array<Record<string, unknown>>;
  } else {
    // AJV oneOf guarantees exactly one of rows/datasetRef; defensive fallback.
    return errorOut('OODS-V123', 'Provide either inline rows or a datasetRef.', compact, wantEcharts);
  }

  // ---- build the NormalizedVizSpec + compile to the renderer payload ----
  try {
    const built = buildVizSpecFromRows({
      rows,
      chartType: input.chartType,
      encodings: input.encodings as BuildVizSpecInput['encodings'],
      id: input.id,
      name: input.name,
      description: input.description,
    });

    const spec = toVegaLiteSpec(built.spec) as unknown as VizRenderOutput['spec'];

    const out: VizRenderOutput = {
      status: 'ok',
      chartType: built.chartType,
      mode: built.mode,
      spec,
      a11yDescription: built.spec.a11y.description,
      warnings: [],
      output: {
        compact,
        ...(wantEcharts ? { echarts: true } : {}),
        ...(includeNormalized ? { includeNormalizedSpec: true } : {}),
      },
      meta: {
        renderer: 'vega-lite',
        mark: built.spec.marks[0]?.trait,
        rowCount: rows.length,
        fields: collectFieldNames(rows),
        ...(built.inferredFields
          ? {
              inferredFields: built.inferredFields.map((f) => ({
                name: f.name,
                type: f.type,
                role: f.role,
                cardinality: f.cardinality,
              })),
            }
          : {}),
      },
    };

    if (built.suggestion) {
      out.suggestion = built.suggestion;
    }
    if (includeNormalized) {
      out.normalizedSpec = built.spec as unknown as VizRenderOutput['normalizedSpec'];
    }
    if (wantEcharts) {
      out.echartsSpec = toEChartsOption(built.spec) as unknown as VizRenderOutput['echartsSpec'];
    }
    if (compact) {
      out.tokenCssRef = 'tokens.build';
    }

    // specRef for downstream pipeline reuse (mirrors viz.compose schemaRef).
    const record = createValueRef(spec, 'viz.render');
    const ref = describeSchemaRef(record);
    out.specRef = ref.ref;
    out.specRefCreatedAt = ref.createdAt;
    out.specRefExpiresAt = ref.expiresAt;

    return out;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const name = err instanceof Error ? err.name : 'Error';
    const code =
      name === 'VizSpecBuilderError'
        ? 'OODS-V126'
        : name === 'VegaLiteAdapterError'
          ? 'OODS-V127'
          : name === 'EChartsAdapterError'
            ? 'OODS-V128'
            : 'OODS-V129';
    return errorOut(code, message, compact, wantEcharts);
  }
}

function errorOut(code: string, message: string, compact: boolean, wantEcharts: boolean): VizRenderOutput {
  const errors: Issue[] = [{ code, message, severity: 'error' }];
  return {
    status: 'error',
    spec: {},
    warnings: [],
    errors,
    output: { compact, ...(wantEcharts ? { echarts: true } : {}) },
  };
}

function collectFieldNames(rows: ReadonlyArray<Record<string, unknown>>): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const row of rows) {
    if (row && typeof row === 'object') {
      for (const key of Object.keys(row)) {
        if (!seen.has(key)) {
          seen.add(key);
          order.push(key);
        }
      }
    }
  }
  return order;
}
