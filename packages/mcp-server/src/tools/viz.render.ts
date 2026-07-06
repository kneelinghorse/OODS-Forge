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
  buildFromIntent,
  buildVizSpecFromRows,
  describeMeasureContext,
  generateAccessibleTable,
  generateNarrativeSummary,
  registerGeoJson,
  toEChartsOption,
  toVegaLiteSpec,
  validateVizEquivalenceRules,
  type AccessibleTableResult,
  type BuildVizSpecInput,
  type HierarchyInput,
  type MeasureNarrativeContext,
  type NarrativeResult,
  type NetworkInput,
  type NormalizedVizSpec,
  type SankeyInput,
  type SpatialFeatureRow,
  type SpatialSpec,
  type StructuredIntent,
  type VizDataAnalysis,
} from '@oods/viz-core';
import { canonicalize, sha256 } from '@oods/artifacts';
import { isHexColor } from '@oods/a11y-tools';
import type { VizRenderInput, VizRenderOutput } from '../schemas/generated.js';
import {
  ECHARTS_PRIMARY,
  isEChartsPrimaryType,
  type EChartsPrimaryConfig,
  type EChartsPrimaryType,
} from './echarts-primary.js';
import { createValueRef, describeSchemaRef, resolveValueRef } from './schema-ref.js';
import { absentFields, referencedEncodingFields } from './field-presence.js';
import { loadMeasureRegistry, MalformedMeasureRegistryError } from './measure-registry.js';

type Issue = VizRenderOutput['warnings'][number];

// ---- F5 explicit color range (sprint-147) validation helpers ----
// A color binding may be a bare string (shorthand for { field }) or an object; an
// explicit `range` is valid only on the object variant (colorEncodingBinding, m02).

/** The explicit color `range` (hex[]), if the color encoding carries one. */
function extractColorRange(encodings: VizRenderInput['encodings']): string[] | undefined {
  const color = encodings?.color;
  if (color && typeof color === 'object' && Array.isArray((color as { range?: unknown }).range)) {
    return (color as { range: string[] }).range;
  }
  return undefined;
}

/** The field name bound to the color channel (bare-string or object binding). */
function colorFieldName(encodings: VizRenderInput['encodings']): string | undefined {
  const color = encodings?.color;
  if (typeof color === 'string') {
    return color;
  }
  if (color && typeof color === 'object') {
    return (color as { field?: string }).field;
  }
  return undefined;
}

// Cartesian color-range warnings (F5). All WARN — the chart still renders; each is a
// declared-intent-vs-outcome mismatch the agent should see rather than have silently
// swallowed. `compiledColorRange` is scale.range read off the compiled Vega-Lite spec,
// so "applied" is measured from the real output, not re-inferred.
function cartesianColorRangeWarnings(
  range: string[],
  colorField: string | undefined,
  rows: ReadonlyArray<Record<string, unknown>>,
  compiledColorRange: unknown,
): VizRenderOutput['warnings'] {
  const warnings: VizRenderOutput['warnings'] = [];

  // V144 (belt-and-suspenders to the schema pattern): a non-hex entry. AJV is the
  // primary gate; this defends the direct-handler path so a non-hex range that would
  // make certify's hexToRgb throw -> contrast 'unchecked' -> a silent conformant:true
  // is surfaced instead.
  const badColors = range.filter((color) => !isHexColor(color));
  if (badColors.length > 0) {
    warnings.push({
      code: 'OODS-V144',
      message: `Color range contains ${badColors.length} non-hex value(s): ${badColors.join(', ')}. Use #RGB or #RRGGBB hex colors.`,
      severity: 'warning',
    });
  }

  const rangeApplied =
    Array.isArray(compiledColorRange) &&
    compiledColorRange.length === range.length &&
    compiledColorRange.every((color, i) => color === range[i]);

  if (!rangeApplied) {
    // The color channel resolved to a continuous (quantitative/temporal) scale, so
    // the categorical range was dropped (gradient shown instead). Never silent — V145
    // as a warning (the surface can't consume a categorical range; here it degrades
    // gracefully rather than the fail-loud ECharts-primary variant).
    warnings.push({
      code: 'OODS-V145',
      message:
        'Color range was ignored: an explicit range applies only to a categorical (nominal/ordinal) color scale, but this color channel resolved to a continuous scale. Set encodings.color.type to "nominal" or "ordinal" to use the range.',
      severity: 'warning',
    });
  } else if (colorField) {
    // V143: the applied range is shorter than the distinct series count, so Vega
    // recycles domain[i]->range[i] mod len (two+ series share a color).
    const distinctCount = new Set(rows.map((row) => row[colorField])).size;
    if (range.length < distinctCount) {
      warnings.push({
        code: 'OODS-V143',
        message: `Color range has ${range.length} colors but "${colorField}" has ${distinctCount} distinct series; colors will recycle (domain[i]->range[i] mod ${range.length}). Provide at least ${distinctCount} colors for an unambiguous encoding.`,
        severity: 'warning',
      });
    }
  }

  return warnings;
}

export async function handle(input: VizRenderInput): Promise<VizRenderOutput> {
  const compact = input.output?.compact ?? true;
  const wantEcharts = input.output?.echarts ?? false;
  const includeNormalized = input.output?.includeNormalizedSpec ?? false;
  const includeA11y = input.output?.includeA11y ?? false;

  // intent ⊕ chartType (sprint-131 m03): a structured intent carries its own
  // `chartFamily`, not the explicit-render `chartType`; the two are mutually
  // exclusive dispatch modes. Fail loud (Rule 12) rather than silently letting the
  // explicit-render branch below swallow the intent.
  if (input.intent && input.chartType) {
    return errorOut(
      'OODS-V123',
      'viz.render: `intent` and `chartType` are mutually exclusive — `intent` carries `chartFamily`, not the explicit-render `chartType`.',
      compact,
      wantEcharts,
    );
  }

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

  // ---- governed-measure overlay (sprint-131 m03): resolve intent.measureRef ----
  // measureRef is NARRATIVE-ONLY (it does NOT drive encoding — buildFromIntent is
  // measure-agnostic). Resolution + the unknown-ref hard-error fire whenever a
  // measureRef is present (a bad ref is a caller error regardless of includeA11y —
  // Rule 12, fail loud); only the VERBALIZATION below is includeA11y-gated. Mirrors
  // the dashboard.render CHART path (governance consistency across the two tools):
  // V132 (malformed registry, fail-closed) and V130 (unknown measure) are the same
  // hard-error seam KPI/chart panels use — never a silent narrative-less render.
  let measureProjection: { displayName?: string; context: MeasureNarrativeContext } | undefined;
  if (input.intent?.measureRef) {
    let registry: ReturnType<typeof loadMeasureRegistry>;
    try {
      registry = loadMeasureRegistry();
    } catch (err) {
      if (err instanceof MalformedMeasureRegistryError) {
        return errorOut('OODS-V132', err.message, compact, wantEcharts);
      }
      throw err;
    }
    const entry = registry.get(input.intent.measureRef);
    if (!entry) {
      return errorOut(
        'OODS-V130',
        `Unknown governed measure "${input.intent.measureRef}" (no such entry in the measure registry).`,
        compact,
        wantEcharts,
      );
    }
    measureProjection = {
      ...(entry.displayName !== undefined ? { displayName: entry.displayName } : {}),
      context: {
        ...(entry.unit !== undefined ? { unit: entry.unit } : {}),
        ...(entry.format !== undefined ? { format: entry.format } : {}),
        ...(entry.defaultThreshold?.value !== undefined ? { thresholdValue: entry.defaultThreshold.value } : {}),
        ...(entry.defaultComparison?.basis !== undefined ? { comparisonBasis: entry.defaultComparison.basis } : {}),
        ...(entry.defaultComparison?.value !== undefined ? { comparisonValue: entry.defaultComparison.value } : {}),
      },
    };
  }

  // ---- build the NormalizedVizSpec + compile to the renderer payload ----
  try {
    // intent dispatch (sprint-131 m03): a structured intent routes through the
    // deterministic buildFromIntent (recommender pick under the named fields + goal);
    // intent-absent is the byte-identical pre-s131 buildVizSpecFromRows path.
    const built = input.intent
      ? buildFromIntent({
          intent: input.intent as StructuredIntent,
          rows,
          id: input.id,
          name: input.name,
          description: input.description,
        })
      : buildVizSpecFromRows({
          rows,
          chartType: input.chartType,
          encodings: input.encodings as BuildVizSpecInput['encodings'],
          id: input.id,
          name: input.name,
          description: input.description,
        });

    const spec = toVegaLiteSpec(built.spec) as unknown as VizRenderOutput['spec'];

    // F5 explicit color range warnings (sprint-147 m03): all WARN, never blocking.
    // Measured against the COMPILED scale.range so "applied vs dropped" reflects reality.
    const colorRange = extractColorRange(input.encodings);
    const rangeWarnings: VizRenderOutput['warnings'] = colorRange
      ? cartesianColorRangeWarnings(
          colorRange,
          colorFieldName(input.encodings),
          rows,
          (spec as Record<string, unknown> as { encoding?: { color?: { scale?: { range?: unknown } } } })
            .encoding?.color?.scale?.range,
        )
      : [];

    // A11y equivalence CERTIFY-AT-EMISSION (sprint-134 m03): when a11yEquivalence is on,
    // run the 16-rule accessible-equivalence engine over the SAME built.spec the chart
    // renders from and surface every failing rule as a SOFT WARNING — never assertVizEquivalence
    // (which throws on error-severity), never a gate. severity is FORCED to 'warning' regardless
    // of the rule's intrinsic 'error'|'warn' (the gate-flip is a future slice; warn-mode is the
    // instrument that measures how often the engine fires on real emissions). Cartesian-only:
    // this is the Vega path; the ECharts-primary path (empty-data scaffold) is intentionally excluded.
    // Default-on (sprint-135 m03) ⇒ the engine runs on every cartesian emission; the
    // builder is conformant-by-construction (m02) so generated specs surface no findings.
    // Set a11yEquivalence:false to opt out for agent-supplied non-conformant specs.
    const wantA11yEquivalence = input.a11yEquivalence ?? true;
    const a11yRuleFailures = wantA11yEquivalence
      ? validateVizEquivalenceRules(built.spec).filter((rule) => !rule.passed)
      : [];
    // Partition by the rule TABLE severity (NOT the forced-'warning' the s134 wire used, and NOT
    // assertVizEquivalence which throws → caught below → coerced to OODS-V129, losing per-rule
    // codes): warn-severity failures surface in warnings[]; error-severity failures BLOCK
    // (sprint-135 m04). Each issue keeps its own OODS-A11Y-<rule.id> code.
    const a11yEquivalenceWarnings: VizRenderOutput['warnings'] = a11yRuleFailures
      .filter((rule) => rule.severity !== 'error')
      .map((rule) => ({
        code: `OODS-A11Y-${rule.id}`,
        message: rule.message ?? rule.summary,
        severity: 'warning' as const,
      }));
    const a11yEquivalenceErrors: Issue[] = a11yRuleFailures
      .filter((rule) => rule.severity === 'error')
      .map((rule) => ({
        code: `OODS-A11Y-${rule.id}`,
        message: rule.message ?? rule.summary,
        severity: 'error' as const,
      }));
    if (a11yEquivalenceErrors.length > 0) {
      // BLOCKED: an accessible-equivalence error rule failed. The builder is conformant-by-
      // construction (m02), so this only fires on agent-supplied data/encoding problems the
      // builder cannot fix (e.g. R-12 an encoding field absent from the rows). Preserve every
      // per-rule code + the warn-severity a11y findings + field warnings; omit contentHash.
      return a11yErrorOut(
        a11yEquivalenceErrors,
        [...fieldWarnings, ...a11yEquivalenceWarnings, ...rangeWarnings],
        compact,
        wantEcharts,
      );
    }

    const out: VizRenderOutput = {
      status: 'ok',
      chartType: built.chartType,
      // The intent path is recommender-driven, so it reports the existing 'suggest' wire
      // mode (the chart was SUGGESTED under the named-field constraints) — keeping the
      // output schema's mode enum unchanged (#564 / the memo's zero-output-schema-change
      // commitment). The agent's full visibility into the pick rides the suggestion +
      // lowConfidence channel below; the internal builder mode ('intent') is a viz-core detail.
      mode: built.mode === 'intent' ? 'suggest' : built.mode,
      spec,
      a11yDescription: built.spec.a11y.description,
      warnings: [...fieldWarnings, ...a11yEquivalenceWarnings, ...rangeWarnings],
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
      // Governed-measure overlay (sprint-131 m03): when the intent named a governed
      // measureRef, PREPEND the s130 measure-context clause ('unit …', 'vs target …') as the
      // leading keyFinding — mirroring the dashboard.render chart path (dashboard.render.ts
      // measure prepend). measureRef-absent leaves this call byte-identical to today (#564).
      if (measureProjection && out.a11y.narrative) {
        const measureFinding = describeMeasureContext(measureProjection.displayName, measureProjection.context);
        if (measureFinding) {
          out.a11y = {
            ...out.a11y,
            narrative: {
              ...out.a11y.narrative,
              keyFindings: [measureFinding, ...out.a11y.narrative.keyFindings],
            },
          };
        }
      }
    }

    // specRef for downstream pipeline reuse (mirrors viz.compose schemaRef).
    const record = createValueRef(spec, 'viz.render');
    const ref = describeSchemaRef(record);
    out.specRef = ref.ref;
    out.specRefCreatedAt = ref.createdAt;
    out.specRefExpiresAt = ref.expiresAt;

    // contentHash = the deterministic content IDENTITY of exactly what specRef
    // caches (the compiled Vega-Lite spec). Default-on; stable across calls
    // (sprint-134 m02). specRef is the random/expiring handle; this is the hash.
    out.contentHash = sha256(canonicalize(spec));

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
// The type table + classifier were lifted to ./echarts-primary.ts (sprint-136 m02)
// so artifact.certify shares the same source of truth (see that file's header).

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

  // V145 (sprint-147 m03, Fork D): an explicit color `range` is a CARTESIAN-only
  // capability. None of the ECharts-primary types consume encodings.color.range —
  // their adapters build from a dedicated data branch, not the color channel, so the
  // range would be silently dropped. Fail loud (never silently ignore an agent's
  // declared range) with the allowed surfaces named (Meridian failure-UX bar).
  if (extractColorRange(input.encodings)) {
    return errorOut(
      'OODS-V145',
      `Color range is not supported on chartType "${chartType}". An explicit \`encodings.color.range\` overrides the categorical palette on the CARTESIAN color channel only (bar, line, area, scatter, heatmap). Remove the range or use a cartesian chartType.`,
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

    // contentHash over the JSON-PROJECTED ECharts option (post-__joinDiagnostics
    // strip) — the same payload specRef caches, hashed for stable identity
    // (sprint-134 m02). NOT the raw adapter option (its formatter closure is dropped).
    out.contentHash = sha256(canonicalize(echartsOption));

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

// Error output for the a11y-equivalence gate (sprint-135 m04). Unlike errorOut (a single code,
// empty warnings), this preserves EVERY failing error-rule's OODS-A11Y-<rule.id> code and carries
// the warn-severity a11y findings + field warnings. Omits contentHash (the error path never sets it).
function a11yErrorOut(
  errors: Issue[],
  warnings: VizRenderOutput['warnings'],
  compact: boolean,
  wantEcharts: boolean,
): VizRenderOutput {
  return {
    status: 'error',
    spec: {},
    warnings,
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
