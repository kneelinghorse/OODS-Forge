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
  adaptBubbleToECharts,
  adaptChordToECharts,
  adaptChoroplethToECharts,
  adaptFlowLineToECharts,
  adaptGraphToECharts,
  adaptSankeyToECharts,
  adaptSunburstToECharts,
  adaptTreemapToECharts,
  analyzeHierarchy,
  analyzeNetwork,
  analyzeSankey,
  analyzeSpatial,
  buildVizSpecFromRows,
  generateAccessibleTable,
  generateNarrativeSummary,
  registerGeoJson,
  toEChartsOption,
  toVegaLiteSpec,
  type AccessibleTableResult,
  type BuildVizSpecInput,
  type HierarchyInput,
  type NarrativeResult,
  type NetworkInput,
  type NormalizedVizSpec,
  type SankeyInput,
  type SpatialFeatureRow,
  type SpatialSpec,
  type VizDataAnalysis,
} from '@oods/viz-core';
import type { VizRenderInput, VizRenderOutput } from '../schemas/generated.js';
import { createValueRef, describeSchemaRef, resolveValueRef } from './schema-ref.js';
import { absentFields, referencedEncodingFields } from './field-presence.js';

type Issue = VizRenderOutput['warnings'][number];

export async function handle(input: VizRenderInput): Promise<VizRenderOutput> {
  const compact = input.output?.compact ?? true;
  const wantEcharts = input.output?.echarts ?? false;
  const includeNormalized = input.output?.includeNormalizedSpec ?? false;
  const includeA11y = input.output?.includeA11y ?? false;

  // ---- hierarchy/network branch (sprint-111): treemap/sunburst/sankey (force
  // lands in m04) are EXPLICIT-ONLY and DECOUPLED — each carries a dedicated data
  // branch (hierarchy or sankey, not rows) and has no Vega-Lite equivalent, so the
  // ECharts option is the PRIMARY payload. The schema couples each chartType with
  // its data branch, so the chartType check is sufficient to dispatch. ----
  if (isEChartsPrimaryType(input.chartType)) {
    return renderEChartsPrimary(input, input.chartType, compact, includeNormalized, includeA11y);
  }

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

  // strictFields (sprint-118 m05): surface a tabular encoding field that is absent from every
  // row as OODS-V131 (WARN) instead of a silent confident-wrong spec. Scoped to the tabular
  // rows+encodings path (the hierarchy/sankey/geo branches returned earlier). Default false ⇒
  // warnings stays []. The dashboard.render strict check escalates V131 to an error panel.
  const fieldWarnings: VizRenderOutput['warnings'] = input.strictFields
    ? absentFields(rows, referencedEncodingFields(input.encodings)).map((field) => ({
        code: 'OODS-V131',
        message: `Referenced field "${field}" is absent from the data rows.`,
        severity: 'warning' as const,
      }))
    : [];

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
      warnings: fieldWarnings,
      output: {
        compact,
        ...(wantEcharts ? { echarts: true } : {}),
        ...(includeNormalized ? { includeNormalizedSpec: true } : {}),
        ...(includeA11y ? { includeA11y: true } : {}),
      },
      meta: {
        renderer: 'vega-lite',
        mark: built.spec.marks[0]?.trait,
        rowCount: rows.length,
        fields: collectFieldNames(rows),
        ...(built.inferredFields
          ? {
              // Project the full data-aware profile (every key is enumerated in
              // the output schema's inferredFields item; FieldProfile carries no
              // extra keys, so the spread stays additionalProperties-clean).
              inferredFields: built.inferredFields.map((f) => ({ ...f })),
            }
          : {}),
      },
    };

    if (built.suggestion) {
      // Map explicitly (NOT a spread of built.suggestion) so the engine's
      // internal `signals` is surfaced as `rationale` and never leaks an
      // unschema'd key; attach the normalized confidence + runner-up alternatives.
      out.suggestion = {
        patternId: built.suggestion.patternId,
        score: built.suggestion.score,
        rationale: [...built.suggestion.signals],
        confidence: normalizeConfidence(built.suggestion.score),
        ...(built.alternatives && built.alternatives.length > 0
          ? { alternatives: built.alternatives.map((a) => ({ ...a })) }
          : {}),
      };
    }
    if (built.lowConfidence !== undefined) {
      out.lowConfidence = built.lowConfidence;
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
    if (includeA11y) {
      // Structured a11y from the SAME spec the chart renders from (cartesian path
      // unchanged: the generators run analyzeVizSpec on built.spec, byte-identical).
      out.a11y = toWireA11y(generateAccessibleTable(built.spec), generateNarrativeSummary(built.spec));
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

// ---- ECharts-primary render path (sprint-111 m02 treemap; m03 sunburst+sankey) -
// treemap/sunburst/sankey are EXPLICIT-ONLY and DECOUPLED from the rows/recommender
// path: each builds a metadata-only spec, dispatches to its ported adapter with the
// SEPARATE data branch (hierarchy or sankey), and auto-promotes the ECharts option
// as the primary payload (these chart types have no Vega-Lite equivalent).
type EChartsPrimaryType = 'treemap' | 'sunburst' | 'sankey' | 'force_graph' | 'choropleth' | 'bubble_map' | 'flow_map' | 'chord';

interface EChartsPrimaryConfig {
  readonly mark: string;
  readonly label: string;
  readonly noun: string;
  readonly dataBranch: 'hierarchy' | 'sankey' | 'network' | 'geo' | 'chord';
}

const ECHARTS_PRIMARY: Record<EChartsPrimaryType, EChartsPrimaryConfig> = {
  treemap: { mark: 'MarkTreemap', label: 'Treemap', noun: 'hierarchical data', dataBranch: 'hierarchy' },
  sunburst: { mark: 'MarkSunburst', label: 'Sunburst', noun: 'hierarchical data', dataBranch: 'hierarchy' },
  sankey: { mark: 'MarkSankey', label: 'Sankey diagram', noun: 'flow data', dataBranch: 'sankey' },
  force_graph: { mark: 'MarkGraph', label: 'Force-directed graph', noun: 'network data', dataBranch: 'network' },
  // sprint-112 geo: choropleth/bubble_map carry the 'geo' branch (inline geometry +
  // per-type encoding) and dispatch to the ported spatial adapters. Like the
  // hierarchy/flow types they have no Vega-Lite equivalent, so the ECharts option
  // is the primary payload. UNLIKE them they are NOT self-contained: the
  // FeatureCollection rides back on echartsSpec.__registration (the client
  // re-registers the map by name).
  choropleth: { mark: 'MarkChoropleth', label: 'Choropleth map', noun: 'regional values', dataBranch: 'geo' },
  bubble_map: { mark: 'MarkBubble', label: 'Bubble map', noun: 'geographic points', dataBranch: 'geo' },
  // sprint-119 m01 flow_map: origin→destination ARC lines on the geo coordinate
  // system. Reuses the 'geo' data branch + the __registration escape hatch exactly
  // like choropleth/bubble_map; rendered via the headless flow-line spatial adapter.
  flow_map: { mark: 'MarkFlow', label: 'Flow map', noun: 'origin→destination flows', dataBranch: 'geo' },
  // sprint-120 m01 chord: native ECharts-6 series.type:'chord' ribbon diagram —
  // category↔category weighted flows (ribbon width = edge.value). Carries a NEW
  // dedicated 'chord' data branch (sankey-shaped: required source/target/value); the
  // IR reuses SankeyInput. Rendered via the headless chord adapter; self-contained
  // (no __registration), so the option is the primary payload like sankey.
  chord: { mark: 'MarkChord', label: 'Chord diagram', noun: 'category↔category weighted flows', dataBranch: 'chord' },
};

function isEChartsPrimaryType(chartType: VizRenderInput['chartType']): chartType is EChartsPrimaryType {
  return (
    chartType === 'treemap' ||
    chartType === 'sunburst' ||
    chartType === 'sankey' ||
    chartType === 'force_graph' ||
    chartType === 'choropleth' ||
    chartType === 'bubble_map' ||
    chartType === 'flow_map' ||
    chartType === 'chord'
  );
}

function renderEChartsPrimary(
  input: VizRenderInput,
  chartType: EChartsPrimaryType,
  compact: boolean,
  includeNormalized: boolean,
  includeA11y: boolean,
): VizRenderOutput {
  const config = ECHARTS_PRIMARY[chartType];

  // The registered schema couples each chartType with its required data branch (AJV
  // runs before dispatch); this guard is defensive for direct callers.
  const branchData = (input as Record<string, unknown>)[config.dataBranch];
  if (!branchData) {
    return errorOut(
      'OODS-V123',
      `chartType "${chartType}" requires a "${config.dataBranch}" data branch.`,
      compact,
      false,
    );
  }

  try {
    const spec = buildEChartsPrimarySpec(input, chartType, config);

    let option: ReturnType<typeof adaptTreemapToECharts>;
    let nodeCount: number;
    if (chartType === 'sankey') {
      const sankey = branchData as unknown as SankeyInput;
      option = adaptSankeyToECharts(spec, sankey);
      nodeCount = sankey.nodes.length;
    } else if (chartType === 'chord') {
      // chord rides the dedicated 'chord' branch (sankey-shaped: required
      // source/target/value); the IR reuses SankeyInput. Ribbon width = edge.value.
      const chord = branchData as unknown as SankeyInput;
      option = adaptChordToECharts(spec, chord);
      nodeCount = chord.nodes.length;
    } else if (chartType === 'force_graph') {
      const network = branchData as unknown as NetworkInput;
      option = adaptGraphToECharts(spec, network);
      nodeCount = network.nodes.length;
    } else if (chartType === 'sunburst') {
      const hierarchy = branchData as unknown as HierarchyInput;
      option = adaptSunburstToECharts(spec, hierarchy);
      nodeCount = hierarchyNodeCount(hierarchy);
    } else if (chartType === 'choropleth' || chartType === 'bubble_map' || chartType === 'flow_map') {
      // Geo dispatch: build a SpatialSpec from the 'geo' branch and render via the
      // ported spatial adapter. The adapter attaches the FeatureCollection on
      // option.__registration (the not-self-contained escape hatch); the JSON
      // projection below preserves it while dropping the tooltip-formatter closure.
      const result = renderGeoOption(input, chartType, branchData as GeoBranch, spec.a11y.description);
      option = result.option;
      nodeCount = result.count;
    } else {
      const hierarchy = branchData as unknown as HierarchyInput;
      option = adaptTreemapToECharts(spec, hierarchy);
      nodeCount = hierarchyNodeCount(hierarchy);
    }

    // The adapters embed a tooltip `formatter` FUNCTION for client-side rendering;
    // functions are not JSON-transmittable (they are dropped over the MCP wire) and
    // are not structured-cloneable (the specRef cache). Project the option to its
    // transmittable JSON form so the returned echartsSpec matches what a consumer
    // actually receives — and so the specRef can cache it. (ECharts falls back to
    // its default tooltip; a future adapter pass could emit a string-template
    // formatter to preserve the custom tooltip across JSON transport.)
    const echartsOption = JSON.parse(JSON.stringify(option)) as Record<string, unknown>;

    // Geo-join surfacing (sprint-118 m06): the choropleth adapter attaches __joinDiagnostics when a
    // corridor's join key had no matching map feature. Read it, then STRIP it from echartsSpec so the
    // default (flag-off) path is byte-identical to today (silent drop preserved — geo goldens unchanged).
    // Under strictFields, emit OODS-V134 per unmatched corridor onto warnings[].
    const joinDiagnostics = echartsOption.__joinDiagnostics as { unmatchedData?: string[] } | undefined;
    delete echartsOption.__joinDiagnostics;
    const geoWarnings: VizRenderOutput['warnings'] =
      input.strictFields && joinDiagnostics?.unmatchedData?.length
        ? joinDiagnostics.unmatchedData.map((key) => ({
            code: 'OODS-V134',
            message: `Geo join: corridor "${key}" has no matching map feature.`,
            severity: 'warning' as const,
          }))
        : [];

    const out: VizRenderOutput = {
      status: 'ok',
      chartType,
      mode: 'explicit',
      // No Vega-Lite equivalent: `spec` (Vega-Lite) is the empty placeholder and
      // the ECharts option is auto-promoted as the primary renderable payload —
      // returned WITHOUT the caller opting into output.echarts.
      spec: {},
      echartsSpec: echartsOption as unknown as VizRenderOutput['echartsSpec'],
      a11yDescription: spec.a11y.description,
      warnings: geoWarnings,
      output: {
        compact,
        echarts: true,
        ...(includeNormalized ? { includeNormalizedSpec: true } : {}),
        ...(includeA11y ? { includeA11y: true } : {}),
      },
      meta: {
        renderer: 'echarts',
        mark: config.mark,
        rowCount: nodeCount,
        fields: [],
      },
    };

    if (includeA11y) {
      // Structured a11y derived DIRECTLY from the non-cartesian input branch
      // (FD#10): treemap/sunburst via analyzeHierarchy, sankey/chord via
      // analyzeSankey, force_graph via analyzeNetwork, geo via analyzeSpatial —
      // routed through the SAME generators every type uses.
      const { analysis, measureLabel } = analyzeEChartsPrimary(chartType, branchData);
      out.a11y = toWireA11y(
        generateAccessibleTable({
          analysis,
          ...(spec.name ? { caption: `Data table for ${spec.name}` } : {}),
          id: spec.id,
        }),
        generateNarrativeSummary({
          analysis,
          chartLabel: spec.name ?? config.label,
          ...(measureLabel ? { measureLabel } : {}),
          fallbackSummary: spec.a11y.description,
        }),
      );
    }

    if (includeNormalized) {
      // Metadata-only IR for these charts (the data lives in the data branch +
      // echartsSpec, not the IR) — emitted as a debug aid.
      out.normalizedSpec = spec as unknown as VizRenderOutput['normalizedSpec'];
    }
    if (compact) {
      out.tokenCssRef = 'tokens.build';
    }

    // specRef references the PRIMARY payload (the JSON-safe ECharts option) for pipeline reuse.
    const record = createValueRef(echartsOption, 'viz.render');
    const ref = describeSchemaRef(record);
    out.specRef = ref.ref;
    out.specRefCreatedAt = ref.createdAt;
    out.specRefExpiresAt = ref.expiresAt;

    return out;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const name = err instanceof Error ? err.name : 'Error';
    // SankeyValidationError / GeoInputError = invalid input data (like
    // VizSpecBuilderError -> V126); EChartsAdapterError -> V128; else -> V129.
    const code =
      name === 'SankeyValidationError' || name === 'GeoInputError'
        ? 'OODS-V126'
        : name === 'EChartsAdapterError'
          ? 'OODS-V128'
          : 'OODS-V129';
    return errorOut(code, message, compact, false);
  }
}

// Minimal NormalizedVizSpec scaffolding for the ECharts-primary adapters. The
// adapters read only metadata (name/id/a11y/config/interactions) — the chart data
// is the SEPARATE input branch — so this carries no encoding/marks data of its own.
function buildEChartsPrimarySpec(
  input: VizRenderInput,
  chartType: EChartsPrimaryType,
  config: EChartsPrimaryConfig,
): NormalizedVizSpec {
  const description = input.description?.trim()
    ? input.description.trim()
    : `${config.label} of ${input.name ?? config.noun}.`;
  return {
    $schema: 'https://oods.dev/viz-spec/v1',
    id: input.id ?? `viz:${chartType}`,
    ...(input.name ? { name: input.name } : {}),
    data: { values: [] },
    marks: [{ trait: config.mark }],
    encoding: {},
    a11y: { description },
  } as NormalizedVizSpec;
}

// ---- geo render path (sprint-112 m02): choropleth + bubble_map -----------------
// The 'geo' branch carries inline geometry + per-type encoding; here we shape it
// into a slim SpatialSpec and a parsed FeatureCollection and hand both to the
// ported spatial adapter. The adapters validate layers/data themselves; we add
// per-type input guards (typed GeoInputError -> OODS-V126) so a missing
// valueField / lng-lat / geometry yields a clean bad-input error, not a crash.
type GeoBranch = NonNullable<VizRenderInput['geo']>;
type GeoChartType = 'choropleth' | 'bubble_map' | 'flow_map';

class GeoInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeoInputError';
  }
}

// Provenance-only dimensions (carried in usermeta.oods.dimensions; not load-bearing
// for the headless option — the client sizes the canvas).
const DEFAULT_GEO_DIMENSIONS = { width: 860, height: 520 } as const;

// Resolve the inline geometry to a GeoJSON FeatureCollection (converting TopoJSON
// via the ported registration normalizer). Returns undefined when no geometry was
// supplied (allowed for bubble_map — the client may register a base map).
function resolveFeatureCollection(geo: GeoBranch) {
  const source = geo.geojson ?? geo.topojson;
  if (!source) {
    return undefined;
  }
  return registerGeoJson('geo', source as Parameters<typeof registerGeoJson>[1], {
    topoObjectName: geo.topoObjectName,
  }).geoJson;
}

function renderGeoOption(
  input: VizRenderInput,
  chartType: GeoChartType,
  geo: GeoBranch,
  description: string,
): { option: ReturnType<typeof adaptChoroplethToECharts>; count: number } {
  const rows = (geo.rows ?? []) as Array<Record<string, unknown>>;
  const id = input.id ?? `viz:${chartType}`;
  const name = input.name;

  if (chartType === 'choropleth') {
    const geoData = resolveFeatureCollection(geo);
    if (!geoData) {
      throw new GeoInputError("choropleth requires inline geometry ('geo.geojson' or 'geo.topojson').");
    }
    if (!geo.valueField) {
      throw new GeoInputError("choropleth requires 'geo.valueField' (the metric that colours each region).");
    }
    const spec: SpatialSpec = {
      id,
      ...(name ? { name } : {}),
      type: 'spatial',
      data: geo.join
        ? {
            type: 'data.geo.join',
            source: 'inline',
            geoSource: 'inline',
            joinKey: geo.join.dataKey,
            geoKey: geo.join.featureProperty,
          }
        : { values: rows },
      layers: [
        {
          type: 'regionFill',
          encoding: { color: { field: geo.valueField, ...(geo.colorScale ? { scale: geo.colorScale } : {}) } },
        },
      ],
      a11y: { description },
    };
    const option = adaptChoroplethToECharts(spec, geoData, rows, DEFAULT_GEO_DIMENSIONS);
    return { option, count: geoData.features.length };
  }

  if (chartType === 'flow_map') {
    // flow_map: origin→destination ARC lines on the geo coordinate system. The geo
    // coordinateSystem needs a registered base map, so inline geometry is required
    // (it rides back on echartsSpec.__registration, exactly like choropleth).
    const geoData = resolveFeatureCollection(geo);
    if (!geoData) {
      throw new GeoInputError("flow_map requires inline base geometry ('geo.geojson' or 'geo.topojson') for the geo coordinate system.");
    }
    if (
      !geo.originLongitudeField ||
      !geo.originLatitudeField ||
      !geo.destinationLongitudeField ||
      !geo.destinationLatitudeField
    ) {
      throw new GeoInputError(
        "flow_map requires 'geo.originLongitudeField', 'geo.originLatitudeField', 'geo.destinationLongitudeField', and 'geo.destinationLatitudeField'.",
      );
    }
    if (rows.length === 0) {
      throw new GeoInputError("flow_map requires 'geo.rows' (the origin→destination flows).");
    }
    const spec: SpatialSpec = {
      id,
      ...(name ? { name } : {}),
      type: 'spatial',
      data: { values: [] },
      layers: [
        {
          type: 'route',
          encoding: {
            start: { field: geo.originLongitudeField, longitude: geo.originLongitudeField, latitude: geo.originLatitudeField },
            end: { field: geo.destinationLongitudeField, longitude: geo.destinationLongitudeField, latitude: geo.destinationLatitudeField },
            ...(geo.strengthField ? { strokeWidth: { field: geo.strengthField } } : {}),
            ...(geo.curvature !== undefined ? { curvature: { value: geo.curvature } } : {}),
          },
        },
      ],
      a11y: { description },
    };
    const option = adaptFlowLineToECharts(spec, geoData, rows, DEFAULT_GEO_DIMENSIONS);
    return { option, count: rows.length };
  }

  // bubble_map
  if (!geo.longitudeField || !geo.latitudeField) {
    throw new GeoInputError("bubble_map requires 'geo.longitudeField' and 'geo.latitudeField'.");
  }
  if (rows.length === 0) {
    throw new GeoInputError("bubble_map requires 'geo.rows' (the points to plot).");
  }
  const geoData = resolveFeatureCollection(geo);
  const spec: SpatialSpec = {
    id,
    ...(name ? { name } : {}),
    type: 'spatial',
    data: { values: [] },
    layers: [
      {
        type: 'symbol',
        encoding: {
          longitude: { field: geo.longitudeField },
          latitude: { field: geo.latitudeField },
          ...(geo.sizeField ? { size: { field: geo.sizeField } } : {}),
          ...(geo.colorField
            ? { color: { field: geo.colorField, ...(geo.colorScale ? { scale: geo.colorScale } : {}) } }
            : {}),
        },
      },
    ],
    a11y: { description },
  };
  const option = adaptBubbleToECharts(spec, geoData, rows, DEFAULT_GEO_DIMENSIONS);
  return { option, count: rows.length };
}

// ---- structured a11y projection (sprint-128 m03, FD#10) -----------------------
// Project the engine's table + narrative results onto the additive wire shape, and
// pick the right input-shaped analyzer per non-cartesian type so the structured
// a11y derives from the SAME data source the chart renders from.
type WireA11y = NonNullable<VizRenderOutput['a11y']>;

function toWireA11y(table: AccessibleTableResult, narrative: NarrativeResult): WireA11y {
  const wire: WireA11y = {
    narrative: { summary: narrative.summary, keyFindings: [...narrative.keyFindings] },
  };
  if (table.status === 'ready') {
    wire.table = {
      caption: table.caption,
      columns: table.columns.map((column) => ({
        field: column.field,
        label: column.label,
        isNumeric: column.isNumeric,
      })),
      rows: table.rows.map((row) => ({
        cells: row.cells.map((cell) => ({ field: cell.field, text: cell.text })),
      })),
    };
  }
  return wire;
}

function analyzeEChartsPrimary(
  chartType: EChartsPrimaryType,
  branchData: unknown,
): { analysis: VizDataAnalysis; measureLabel?: string } {
  switch (chartType) {
    case 'treemap':
    case 'sunburst':
      return { analysis: analyzeHierarchy(branchData as HierarchyInput), measureLabel: 'Value' };
    case 'sankey':
    case 'chord':
      return { analysis: analyzeSankey(branchData as SankeyInput), measureLabel: 'Flow' };
    case 'force_graph':
      return { analysis: analyzeNetwork(branchData as NetworkInput), measureLabel: 'Connections' };
    default:
      return analyzeGeoForA11y(chartType, branchData as GeoBranch);
  }
}

// Geo a11y: the bound `rows` ARE the per-feature data (one row per region / point /
// flow); map them to the SpatialFeatureRow shape analyzeSpatial consumes, using the
// per-type metric as the measure and the join key (or a `name` field) as the label.
function analyzeGeoForA11y(
  chartType: GeoChartType,
  geo: GeoBranch,
): { analysis: VizDataAnalysis; measureLabel?: string } {
  const rows = (geo.rows ?? []) as Array<Record<string, unknown>>;
  const valueField =
    chartType === 'choropleth'
      ? geo.valueField
      : chartType === 'bubble_map'
        ? geo.sizeField ?? geo.colorField
        : geo.strengthField;
  const labelField = geo.join?.dataKey;
  const features: SpatialFeatureRow[] = rows.map((row, index) => {
    const label = (labelField ? row[labelField] : undefined) ?? row.name ?? `Feature ${index + 1}`;
    return { id: String(label), featureLabel: String(label), values: row };
  });
  return {
    analysis: analyzeSpatial({ features, ...(valueField ? { valueField } : {}) }),
    ...(valueField ? { measureLabel: valueField } : {}),
  };
}

// Count of hierarchy nodes bound into the chart (surfaced as meta.rowCount — the
// hierarchy analog of tabular row count).
function hierarchyNodeCount(input: HierarchyInput): number {
  if (input.type === 'adjacency_list') {
    return input.data.length;
  }
  const count = (node: { children?: ReadonlyArray<unknown> }): number =>
    1 +
    (Array.isArray(node.children)
      ? node.children.reduce(
          (sum: number, child) => sum + count(child as { children?: ReadonlyArray<unknown> }),
          0,
        )
      : 0);
  return count(input.data);
}

// Confidence normalization (s110-m04 design call; default per decision #698:
// score / max-possible). MAX_MATCH_SCORE is the empirical strong-canonical-match
// ceiling — three range matches (+4 each), a goal match (+5), ~two attribute
// matches (+2 each), plus the canonical nudge. A pick at/above it is fully
// confident; weaker picks scale down linearly, clamped to [0,1].
const MAX_MATCH_SCORE = 25;

function normalizeConfidence(score: number): number {
  return Math.max(0, Math.min(1, score / MAX_MATCH_SCORE));
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
